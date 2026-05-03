import * as path from 'path';
import { runFfmpeg, runPngquant, runCwebp, checkPngquant, checkFfmpegWebpSupport, checkCwebp } from './ffmpegRunner';

export const WEBP_NOT_SUPPORTED = 'WEBP_NOT_SUPPORTED';

function qualityToQv(quality: number): number {
  return Math.round(2 + (100 - quality) * 0.29);
}

function qualityToPngquantRange(quality: number): [number, number] {
  return [Math.max(0, quality - 10), Math.min(quality, 100)];
}

async function encodeWebp(inputPath: string, outputPath: string, quality: number, lossless = false): Promise<void> {
  if (await checkFfmpegWebpSupport()) {
    const args = lossless
      ? ['-y', '-i', inputPath, '-lossless', '1', '-quality', '80', outputPath]
      : ['-y', '-i', inputPath, '-quality', String(quality), outputPath];
    await runFfmpeg(args);
  } else if (await checkCwebp()) {
    const args = lossless
      ? [inputPath, '-lossless', '-o', outputPath]
      : [inputPath, '-q', String(quality), '-o', outputPath];
    await runCwebp(args);
  } else {
    throw new Error(WEBP_NOT_SUPPORTED);
  }
}

async function compressPng(inputPath: string, outputPath: string, quality: number): Promise<void> {
  if (await checkPngquant()) {
    const [min, max] = qualityToPngquantRange(quality);
    await runPngquant([`--quality=${min}-${max}`, '--force', '--output', outputPath, inputPath]);
  } else {
    await runFfmpeg([
      '-y', '-i', inputPath,
      '-vf', 'split[s0][s1];[s0]palettegen=max_colors=256:reserve_transparent=1:stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a',
      outputPath
    ]);
  }
}

async function compressPngLossless(inputPath: string, outputPath: string): Promise<void> {
  if (await checkPngquant()) {
    await runPngquant(['--quality=90-100', '--force', '--output', outputPath, inputPath]);
  } else {
    await runFfmpeg([
      '-y', '-i', inputPath,
      '-vf', 'split[s0][s1];[s0]palettegen=max_colors=256:reserve_transparent=1:stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a',
      outputPath
    ]);
  }
}

export async function compressImageLossless(inputPath: string, outputPath: string): Promise<void> {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.png') {
    await compressPngLossless(inputPath, outputPath);
  } else if (ext === '.webp') {
    await encodeWebp(inputPath, outputPath, 80, true);
  } else {
    await runFfmpeg(['-y', '-i', inputPath, '-q:v', '2', outputPath]);
  }
}

export async function compressImage(inputPath: string, outputPath: string, quality: number): Promise<void> {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.png') {
    await compressPng(inputPath, outputPath, quality);
  } else if (ext === '.webp') {
    await encodeWebp(inputPath, outputPath, quality);
  } else {
    await runFfmpeg(['-y', '-i', inputPath, '-q:v', String(qualityToQv(quality)), outputPath]);
  }
}

export async function convertImage(inputPath: string, outputPath: string): Promise<void> {
  const outExt = path.extname(outputPath).toLowerCase();
  if (outExt === '.webp') {
    await encodeWebp(inputPath, outputPath, 85);
  } else if (outExt === '.png') {
    await runFfmpeg(['-y', '-i', inputPath, outputPath]);
  } else {
    await runFfmpeg(['-y', '-i', inputPath, '-q:v', '3', outputPath]);
  }
}
