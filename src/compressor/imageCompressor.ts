import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { runFfmpeg, runPngquant, runCwebp, runOxipng, checkPngquant, checkOxipng, checkFfmpegWebpSupport, checkCwebp } from './ffmpegRunner';

export const WEBP_NOT_SUPPORTED = 'WEBP_NOT_SUPPORTED';

export type Quality = number | 'lossless';
// 'strict' = bit-exact / pixel-perfect convert (без сжатия).
// { quality } = c обычным сжатием, где Quality = number | 'lossless' (perceptually lossless).
export type ConvertMode = 'strict' | { quality: Quality };

function qualityToQv(quality: number): number {
  return Math.round(2 + (100 - quality) * 0.29);
}

// pngquant-диапазон уровня TinyPNG.
// quality=100 → 30-60 (perceptually lossless, ~62 KB на тестовой картинке).
// quality<100 → масштабируется вниз для более сильного сжатия.
function qualityToPngquantRange(quality: Quality): [number, number] {
  const q = quality === 'lossless' ? 100 : quality;
  const min = Math.max(0, Math.round(q * 0.3));
  const max = Math.max(min + 1, Math.round(q * 0.6));
  return [min, max];
}

async function shouldUseOxipng(): Promise<boolean> {
  const enabled = vscode.workspace.getConfiguration('mediaCompressor').get<boolean>('useOxipng', true);
  if (!enabled) return false;
  return await checkOxipng();
}

async function optimizeWithOxipng(filePath: string): Promise<void> {
  await runOxipng(['-o', '4', '--strip', 'safe', filePath]);
}

async function encodeWebpLossless(inputPath: string, outputPath: string): Promise<void> {
  if (await checkFfmpegWebpSupport()) {
    await runFfmpeg(['-y', '-i', inputPath, '-c:v', 'libwebp', '-lossless', '1', '-compression_level', '6', outputPath]);
  } else if (await checkCwebp()) {
    await runCwebp([inputPath, '-lossless', '-m', '6', '-o', outputPath]);
  } else {
    throw new Error(WEBP_NOT_SUPPORTED);
  }
}

async function encodeWebpLossy(inputPath: string, outputPath: string, quality: number): Promise<void> {
  // preset=picture + compression_level 6 — мягкое сжатие, сохраняет блюр и градиенты
  if (await checkFfmpegWebpSupport()) {
    await runFfmpeg(['-y', '-i', inputPath, '-c:v', 'libwebp', '-preset', 'picture', '-quality', String(quality), '-compression_level', '6', outputPath]);
  } else if (await checkCwebp()) {
    await runCwebp([inputPath, '-preset', 'picture', '-q', String(quality), '-m', '6', '-o', outputPath]);
  } else {
    throw new Error(WEBP_NOT_SUPPORTED);
  }
}

// Сжатый WebP уровня TinyPNG: pngquant сводит палитру → webp lossless кодирует её компактно.
// Это убирает баг "PNG→WebP lossless = 287KB", приводя к ~60KB при тех же визуально-неотличимых пикселях.
async function encodeWebpPerceptualLossless(inputPath: string, outputPath: string): Promise<void> {
  const inputExt = path.extname(inputPath).toLowerCase();
  const tmpQuant = `${outputPath}.q.png`;
  const tmpRaw = `${outputPath}.r.png`;
  const cleanup: string[] = [];

  try {
    let pngForQuant: string;
    if (inputExt === '.png') {
      pngForQuant = inputPath;
    } else {
      await runFfmpeg(['-y', '-i', inputPath, tmpRaw]);
      cleanup.push(tmpRaw);
      pngForQuant = tmpRaw;
    }

    cleanup.push(tmpQuant);
    await compressPng(pngForQuant, tmpQuant, 'lossless');
    await encodeWebpLossless(tmpQuant, outputPath);
  } finally {
    for (const f of cleanup) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  }
}

async function compressPng(inputPath: string, outputPath: string, quality: Quality): Promise<void> {
  const hasPngquant = await checkPngquant();
  const useOxipng = await shouldUseOxipng();

  if (hasPngquant) {
    const [min, max] = qualityToPngquantRange(quality);
    await runPngquant([`--quality=${min}-${max}`, '--speed', '1', '--strip', '--force', '--output', outputPath, inputPath]);
    if (!fs.existsSync(outputPath)) {
      fs.copyFileSync(inputPath, outputPath);
    }
  } else {
    fs.copyFileSync(inputPath, outputPath);
  }

  if (useOxipng) {
    await optimizeWithOxipng(outputPath);
  }
}

export async function compressImageLossless(inputPath: string, outputPath: string): Promise<void> {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.png') {
    await compressPng(inputPath, outputPath, 'lossless');
  } else if (ext === '.webp') {
    await encodeWebpPerceptualLossless(inputPath, outputPath);
  } else {
    await runFfmpeg(['-y', '-i', inputPath, '-q:v', '2', outputPath]);
  }
}

export async function compressImage(inputPath: string, outputPath: string, quality: number): Promise<void> {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.png') {
    await compressPng(inputPath, outputPath, quality);
  } else if (ext === '.webp') {
    await encodeWebpLossy(inputPath, outputPath, quality);
  } else {
    await runFfmpeg(['-y', '-i', inputPath, '-q:v', String(qualityToQv(quality)), outputPath]);
  }
}

async function convertImageStrict(inputPath: string, outputPath: string): Promise<void> {
  const outExt = path.extname(outputPath).toLowerCase();
  if (outExt === '.webp') {
    await encodeWebpLossless(inputPath, outputPath);
  } else if (outExt === '.png') {
    await runFfmpeg(['-y', '-i', inputPath, outputPath]);
    if (await shouldUseOxipng()) {
      await optimizeWithOxipng(outputPath);
    }
  } else {
    // JPG: q:v=1 = максимальное качество (perceptually lossless)
    await runFfmpeg(['-y', '-i', inputPath, '-q:v', '1', outputPath]);
  }
}

async function convertImageWithQuality(inputPath: string, outputPath: string, quality: Quality): Promise<void> {
  const outExt = path.extname(outputPath).toLowerCase();

  if (outExt === '.webp') {
    if (quality === 'lossless') {
      await encodeWebpPerceptualLossless(inputPath, outputPath);
    } else {
      await encodeWebpLossy(inputPath, outputPath, quality);
    }
    return;
  }

  if (outExt === '.png') {
    const inputExt = path.extname(inputPath).toLowerCase();
    if (inputExt === '.png') {
      await compressPng(inputPath, outputPath, quality);
      return;
    }
    const tempPng = `${outputPath}.tmp.png`;
    try {
      await runFfmpeg(['-y', '-i', inputPath, tempPng]);
      await compressPng(tempPng, outputPath, quality);
    } finally {
      if (fs.existsSync(tempPng)) fs.unlinkSync(tempPng);
    }
    return;
  }

  // JPG
  const qv = quality === 'lossless' ? 2 : qualityToQv(quality);
  await runFfmpeg(['-y', '-i', inputPath, '-q:v', String(qv), outputPath]);
}

export async function convertImage(inputPath: string, outputPath: string, mode: ConvertMode): Promise<void> {
  if (mode === 'strict') {
    await convertImageStrict(inputPath, outputPath);
  } else {
    await convertImageWithQuality(inputPath, outputPath, mode.quality);
  }
}
