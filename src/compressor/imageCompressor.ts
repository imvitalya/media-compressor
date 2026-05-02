import * as path from 'path';
import { runFfmpeg, runPngquant, checkPngquant } from './ffmpegRunner';

// Маппинг quality% (1-100) → ffmpeg q:v (2-31, меньше = лучше)
function qualityToQv(quality: number): number {
  return Math.round(2 + (100 - quality) * 0.29);
}

// Маппинг quality% → диапазон pngquant [min-max]
function qualityToPngquantRange(quality: number): [number, number] {
  const max = Math.min(quality, 100);
  const min = Math.max(0, quality - 10);
  return [min, max];
}

async function compressPng(inputPath: string, outputPath: string, quality: number): Promise<void> {
  const hasPngquant = await checkPngquant();

  if (hasPngquant) {
    const [min, max] = qualityToPngquantRange(quality);
    // pngquant не принимает output path напрямую если он совпадает с input — используем --force
    await runPngquant([
      `--quality=${min}-${max}`,
      '--force',
      '--output', outputPath,
      inputPath
    ]);
  } else {
    // Fallback: ffmpeg palette quantization (хуже pngquant, но лучше -compression_level)
    await runFfmpeg([
      '-y', '-i', inputPath,
      '-vf', 'split[s0][s1];[s0]palettegen=max_colors=256:reserve_transparent=1:stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a',
      outputPath
    ]);
  }
}

async function compressPngLossless(inputPath: string, outputPath: string): Promise<void> {
  const hasPngquant = await checkPngquant();

  if (hasPngquant) {
    // 90-100 даёт минимально заметные изменения при хорошем сжатии
    await runPngquant([
      '--quality=90-100',
      '--force',
      '--output', outputPath,
      inputPath
    ]);
  } else {
    // Fallback: ffmpeg palette quantization
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
    await runFfmpeg(['-y', '-i', inputPath, '-c:v', 'libwebp', '-lossless', '1', '-quality', '80', outputPath]);
  } else {
    // JPG/GIF: максимальное качество
    await runFfmpeg(['-y', '-i', inputPath, '-q:v', '2', outputPath]);
  }
}

export async function compressImage(inputPath: string, outputPath: string, quality: number): Promise<void> {
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === '.png') {
    await compressPng(inputPath, outputPath, quality);
  } else if (ext === '.webp') {
    await runFfmpeg(['-y', '-i', inputPath, '-c:v', 'libwebp', '-quality', String(quality), outputPath]);
  } else {
    // JPG, GIF
    const qv = qualityToQv(quality);
    await runFfmpeg(['-y', '-i', inputPath, '-q:v', String(qv), outputPath]);
  }
}
