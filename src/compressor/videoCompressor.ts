import * as path from 'path';
import { runFfmpeg } from './ffmpegRunner';
import type { ConvertMode } from './imageCompressor';

function qualityToCrf(quality: number): number {
  return Math.round(18 + (100 - quality) * 0.33);
}

function qualityToAudioBitrate(quality: number): string {
  if (quality >= 85) return '128k';
  if (quality >= 70) return '96k';
  return '64k';
}

export async function compressVideoLossless(inputPath: string, outputPath: string): Promise<void> {
  await runFfmpeg(['-y', '-i', inputPath, '-c:v', 'copy', '-c:a', 'copy', outputPath]);
}

export async function compressVideo(inputPath: string, outputPath: string, quality: number): Promise<void> {
  const crf = qualityToCrf(quality);
  const audioBitrate = qualityToAudioBitrate(quality);

  await runFfmpeg([
    '-y',
    '-i', inputPath,
    '-c:v', 'libx264',
    '-crf', String(crf),
    '-preset', 'medium',
    '-c:a', 'aac',
    '-b:a', audioBitrate,
    outputPath
  ]);
}

export async function convertVideo(inputPath: string, outputPath: string, mode: ConvertMode): Promise<void> {
  // strict = только смена контейнера, без перекодирования (если контейнер совместим с кодеком)
  if (mode === 'strict') {
    await runFfmpeg(['-y', '-i', inputPath, '-c', 'copy', outputPath]);
    return;
  }

  const outExt = path.extname(outputPath).toLowerCase();

  if (outExt === '.webm') {
    await runFfmpeg([
      '-y', '-i', inputPath,
      '-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0',
      '-c:a', 'libopus', '-b:a', '96k',
      outputPath
    ]);
  } else if (outExt === '.mkv') {
    // MKV — просто переупаковываем без перекодирования
    await runFfmpeg(['-y', '-i', inputPath, '-c', 'copy', outputPath]);
  } else {
    // MP4, MOV — H.264
    await runFfmpeg([
      '-y', '-i', inputPath,
      '-c:v', 'libx264', '-crf', '23', '-preset', 'medium',
      '-c:a', 'aac', '-b:a', '128k',
      outputPath
    ]);
  }
}
