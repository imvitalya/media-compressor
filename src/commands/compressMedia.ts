import * as path from 'path';
import * as vscode from 'vscode';
import { compressImage, compressImageLossless } from '../compressor/imageCompressor';
import { compressVideo, compressVideoLossless } from '../compressor/videoCompressor';
import { checkFfmpeg, checkPngquant } from '../compressor/ffmpegRunner';
import { showFfmpegNotFoundError, showPngquantMissingWarning } from '../utils/errorHandler';
import { getOutputPath, getFileSize, formatFileSize } from '../utils/fileHandler';
import { isMediaFile, isImageFile } from '../utils/validators';
import { i18n } from '../i18n';

type Quality = number | 'lossless';

interface QuickPickOption extends vscode.QuickPickItem {
  quality: Quality | 'custom';
}

function buildOptions(): QuickPickOption[] {
  const s = i18n();
  return [
    { label: `$(check) ${s.optionLossless}`,  description: s.optionLosslessDesc, quality: 'lossless' },
    { label: `$(arrow-down) ${s.option90}`,   description: s.option90Desc,       quality: 90 },
    { label: `$(arrow-down) ${s.option80}`,   description: s.option80Desc,       quality: 80 },
    { label: `$(edit) ${s.optionCustom}`,     description: s.optionCustomDesc,   quality: 'custom' },
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

async function processFile(
  filePath: string,
  quality: Quality,
  isMultiple: boolean
): Promise<{ before: number; after: number }> {
  const outputPath = getOutputPath(filePath, isMultiple);
  const sizeBefore = getFileSize(filePath);

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

  const sizeAfter = getFileSize(outputPath);
  return { before: sizeBefore, after: sizeAfter };
}

export async function compressMediaCommand(uri: vscode.Uri, uris: vscode.Uri[]): Promise<void> {
  const s = i18n();

  const allUris = uris && uris.length > 1 ? uris : [uri];
  const filePaths = allUris.map((u) => u.fsPath).filter(isMediaFile);

  if (filePaths.length === 0) {
    vscode.window.showWarningMessage(s.noSupportedFiles);
    return;
  }

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

  const selected = await vscode.window.showQuickPick(buildOptions(), {
    title: s.quickPickTitle,
    placeHolder: s.quickPickPlaceholder(filePaths.length)
  });

  if (!selected) return;

  let quality: Quality;
  if (selected.quality === 'custom') {
    const custom = await askCustomQuality();
    if (custom === undefined) return;
    quality = custom;
  } else {
    quality = selected.quality;
  }

  const isMultiple = filePaths.length > 1;

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: s.quickPickTitle, cancellable: false },
    async (progress) => {
      let totalBefore = 0;
      let totalAfter = 0;
      const errors: string[] = [];
      const startTime = Date.now();

      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        const fileName = path.basename(filePath);

        progress.report({
          message: `${fileName} (${s.progressOf(i + 1, filePaths.length)})`,
          increment: 100 / filePaths.length
        });

        try {
          const { before, after } = await processFile(filePath, quality, isMultiple);
          totalBefore += before;
          totalAfter += after;

          if (vscode.workspace.getConfiguration('mediaCompressor').get<boolean>('deleteOriginal', false)) {
            const fs = await import('fs');
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          errors.push(`${fileName}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const reduction = totalBefore > 0
        ? ((totalBefore - totalAfter) / totalBefore * 100).toFixed(1)
        : '0';

      if (errors.length > 0) {
        vscode.window.showErrorMessage(`${s.errorProcessing(errors.length)}\n${errors.join('\n')}`);
      }

      if (totalAfter > 0) {
        const successCount = filePaths.length - errors.length;
        vscode.window.showInformationMessage(
          s.successMessage(successCount, formatFileSize(totalBefore), formatFileSize(totalAfter), reduction, elapsed)
        );
      }
    }
  );
}
