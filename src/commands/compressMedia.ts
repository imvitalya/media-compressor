import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { compressImage, compressImageLossless, convertImage } from '../compressor/imageCompressor';
import { compressVideo, compressVideoLossless, convertVideo } from '../compressor/videoCompressor';
import { checkFfmpeg, checkPngquant, checkFfmpegWebpSupport, checkCwebp, checkSvgo } from '../compressor/ffmpegRunner';
import { optimizeSvg } from '../compressor/svgOptimizer';
import { showFfmpegNotFoundError, showPngquantMissingWarning, showWebpEncoderMissingError, showSvgoMissingError } from '../utils/errorHandler';
import { getOutputPath, getFileSize, formatFileSize } from '../utils/fileHandler';
import { isMediaFile, isImageFile, isVideoFile, isSvgFile } from '../utils/validators';
import { IMAGE_CONVERT_FORMATS, VIDEO_CONVERT_FORMATS } from '../constants';
import { i18n } from '../i18n';

type Quality = number | 'lossless';
type Action = { kind: 'compress'; quality: Quality } | { kind: 'convert'; targetExt: string };

interface QuickPickOption extends vscode.QuickPickItem {
  value: Quality | 'custom' | 'convert';
}

function buildMainOptions(): QuickPickOption[] {
  const s = i18n();
  return [
    { label: `$(check) ${s.optionLossless}`,  description: s.optionLosslessDesc, value: 'lossless' },
    { label: `$(arrow-down) ${s.option90}`,   description: s.option90Desc,       value: 90 },
    { label: `$(arrow-down) ${s.option80}`,   description: s.option80Desc,       value: 80 },
    { label: `$(edit) ${s.optionCustom}`,     description: s.optionCustomDesc,   value: 'custom' },
    { label: `$(symbol-file) ${s.optionConvert}`, description: s.optionConvertDesc, value: 'convert' },
  ];
}

async function askCustomQuality(): Promise<number | undefined> {
  const s = i18n();
  const input = await vscode.window.showInputBox({
    title: s.optionCustom,
    prompt: s.inputPrompt,
    placeHolder: s.inputPlaceholder,
    validateInput: (value) => {
      const num = parseInt(value, 10);
      return isNaN(num) || num < 1 || num > 100 ? s.inputError : null;
    }
  });
  return input !== undefined ? parseInt(input, 10) : undefined;
}

async function askTargetFormat(isImage: boolean): Promise<string | undefined> {
  const s = i18n();
  const formats = isImage ? IMAGE_CONVERT_FORMATS : VIDEO_CONVERT_FORMATS;
  const items = formats.map((ext) => ({ label: ext.replace('.', '').toUpperCase(), ext }));

  const picked = await vscode.window.showQuickPick(items, {
    title: s.formatPickTitle,
    placeHolder: isImage ? 'JPG · PNG · WebP' : 'MP4 · WebM · MKV · MOV'
  });

  return picked?.ext;
}

async function resolveAction(filePaths: string[]): Promise<Action | undefined> {
  const s = i18n();

  const selected = await vscode.window.showQuickPick(buildMainOptions(), {
    title: s.quickPickTitle,
    placeHolder: s.quickPickPlaceholder(filePaths.length)
  });

  if (!selected) return undefined;

  if (selected.value === 'convert') {
    const allImages = filePaths.every(isImageFile);
    const allVideos = filePaths.every(isVideoFile);

    if (!allImages && !allVideos) {
      vscode.window.showWarningMessage(s.mixedTypesError);
      return undefined;
    }

    const targetExt = await askTargetFormat(allImages);
    if (!targetExt) return undefined;

    return { kind: 'convert', targetExt };
  }

  if (selected.value === 'custom') {
    const quality = await askCustomQuality();
    if (quality === undefined) return undefined;
    return { kind: 'compress', quality };
  }

  return { kind: 'compress', quality: selected.value as Quality };
}

interface ProcessResult {
  before: number;
  after: number;
  skipped?: string;
}

async function processFile(
  filePath: string,
  action: Action,
  isMultiple: boolean,
  outputSuffix: string
): Promise<ProcessResult> {
  const targetExt = action.kind === 'convert' ? action.targetExt : undefined;
  const outputPath = getOutputPath(filePath, isMultiple, targetExt, outputSuffix);
  const sizeBefore = getFileSize(filePath);

  if (action.kind === 'convert') {
    if (isImageFile(filePath)) {
      await convertImage(filePath, outputPath);
    } else {
      await convertVideo(filePath, outputPath);
    }
  } else {
    const { quality } = action;
    if (quality === 'lossless') {
      if (isImageFile(filePath)) {
        await compressImageLossless(filePath, outputPath);
      } else {
        await compressVideoLossless(filePath, outputPath);
      }
    } else {
      if (isImageFile(filePath)) {
        await compressImage(filePath, outputPath, quality);
      } else {
        await compressVideo(filePath, outputPath, quality);
      }
    }

    // Защита от увеличения размера при сжатии видео
    if (isVideoFile(filePath)) {
      const sizeAfter = getFileSize(outputPath);
      if (sizeAfter >= sizeBefore) {
        fs.unlinkSync(outputPath);
        return { before: sizeBefore, after: sizeBefore, skipped: 'size_increased' };
      }
    }
  }

  const sizeAfter = getFileSize(outputPath);
  return { before: sizeBefore, after: sizeAfter };
}

async function processSvgFiles(svgPaths: string[], outputSuffix: string): Promise<void> {
  const s = i18n();
  const isMultiple = svgPaths.length > 1;

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'SVG Optimizer', cancellable: false },
    async (progress) => {
      let totalBefore = 0;
      let totalAfter = 0;
      const errors: string[] = [];
      const startTime = Date.now();

      for (let i = 0; i < svgPaths.length; i++) {
        const filePath = svgPaths[i];
        const fileName = path.basename(filePath);

        progress.report({
          message: `${fileName} (${s.progressOf(i + 1, svgPaths.length)})`,
          increment: 100 / svgPaths.length
        });

        try {
          const outputPath = getOutputPath(filePath, isMultiple, undefined, outputSuffix);
          const before = getFileSize(filePath);
          await optimizeSvg(filePath, outputPath);
          totalBefore += before;
          totalAfter += getFileSize(outputPath);
        } catch (err) {
          errors.push(`${fileName}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const reduction = totalBefore > 0 ? ((totalBefore - totalAfter) / totalBefore * 100).toFixed(1) : '0';

      if (errors.length > 0) {
        vscode.window.showErrorMessage(`${s.errorProcessing(errors.length)}\n${errors.join('\n')}`);
      }
      const successCount = svgPaths.length - errors.length;
      if (successCount > 0) {
        vscode.window.showInformationMessage(
          s.svgSuccessMessage(successCount, formatFileSize(totalBefore), formatFileSize(totalAfter), reduction, elapsed)
        );
      }
    }
  );
}

export async function compressMediaCommand(uri: vscode.Uri, uris: vscode.Uri[]): Promise<void> {
  const s = i18n();

  const allUris = uris && uris.length > 1 ? uris : [uri];
  const svgPaths  = allUris.map((u) => u.fsPath).filter(isSvgFile);
  const filePaths = allUris.map((u) => u.fsPath).filter(isMediaFile);

  if (svgPaths.length === 0 && filePaths.length === 0) {
    vscode.window.showWarningMessage(s.noSupportedFiles);
    return;
  }

  // SVG flow: нет QuickPick, одно действие — оптимизация 
  const outputSuffix = vscode.workspace.getConfiguration('mediaCompressor').get<string>('outputSuffix', '-compressed');

  if (svgPaths.length > 0) {
    const hasSvgo = await checkSvgo();
    if (!hasSvgo) {
      showSvgoMissingError();
      if (filePaths.length === 0) return;
      // При смешанном выборе показываем ошибку svgo, но продолжаем с медиафайлами
    } else {
      await processSvgFiles(svgPaths, outputSuffix);
    }
  }

  if (filePaths.length === 0) return;

  // Media flow
  const hasFfmpeg = await checkFfmpeg();
  if (!hasFfmpeg) {
    showFfmpegNotFoundError();
    return;
  }

  const hasPng = filePaths.some((p) => p.toLowerCase().endsWith('.png'));
  if (hasPng) {
    const hasPngquant = await checkPngquant();
    if (!hasPngquant) {
      showPngquantMissingWarning();
    }
  }

  const action = await resolveAction(filePaths);
  if (!action) return;

  // Проверяем WebP до начала обработки — одно уведомление, никакой ошибки
  if (action.kind === 'convert' && action.targetExt === '.webp') {
    const hasWebp = await checkFfmpegWebpSupport() || await checkCwebp();
    if (!hasWebp) {
      showWebpEncoderMissingError();
      return;
    }
  }

  const isMultiple = filePaths.length > 1;
  const isConversion = action.kind === 'convert';

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: s.quickPickTitle, cancellable: false },
    async (progress) => {
      let totalBefore = 0;
      let totalAfter = 0;
      const errors: string[] = [];
      const warnings: string[] = [];
      const startTime = Date.now();

      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        const fileName = path.basename(filePath);

        progress.report({
          message: `${fileName} (${s.progressOf(i + 1, filePaths.length)})`,
          increment: 100 / filePaths.length
        });

        try {
          const result = await processFile(filePath, action, isMultiple, outputSuffix);

          if (result.skipped === 'size_increased') {
            warnings.push(s.videoSizeIncreased(fileName));
          } else {
            totalBefore += result.before;
            totalAfter += result.after;

            if (vscode.workspace.getConfiguration('mediaCompressor').get<boolean>('deleteOriginal', false)) {
              fs.unlinkSync(filePath);
            }
          }
        } catch (err) {
          errors.push(`${fileName}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const successCount = filePaths.length - errors.length - warnings.length;

      if (warnings.length > 0) {
        vscode.window.showWarningMessage(warnings.join('\n'));
      }

      if (errors.length > 0) {
        vscode.window.showErrorMessage(`${s.errorProcessing(errors.length)}\n${errors.join('\n')}`);
      }

      if (successCount > 0) {
        const message = isConversion
          ? s.convertMessage(successCount, elapsed)
          : s.successMessage(
              successCount,
              formatFileSize(totalBefore),
              formatFileSize(totalAfter),
              ((totalBefore - totalAfter) / totalBefore * 100).toFixed(1),
              elapsed
            );
        vscode.window.showInformationMessage(message);
      }
    }
  );
}
