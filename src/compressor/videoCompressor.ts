import { runFfmpeg } from './ffmpegRunner';

// Маппинг quality% (1-100) → CRF (0=лучшее, 51=худшее)
// 100% → CRF 18, 80% → CRF 23, 60% → CRF 28, 40% → CRF 33
function qualityToCrf(quality: number): number {
  return Math.round(18 + (100 - quality) * 0.33);
}

function qualityToAudioBitrate(quality: number): string {
  if (quality >= 85) return '128k';
  if (quality >= 70) return '96k';
  return '64k';
}

export async function compressVideoLossless(inputPath: string, outputPath: string): Promise<void> {
  const args = ['-y', '-i', inputPath, '-c:v', 'copy', '-c:a', 'copy', outputPath];
  await runFfmpeg(args);
}

export async function compressVideo(inputPath: string, outputPath: string, quality: number): Promise<void> {
  const crf = qualityToCrf(quality);
  const audioBitrate = qualityToAudioBitrate(quality);

  const args = [
    '-y',
    '-i', inputPath,
    '-c:v', 'libx264',
    '-crf', String(crf),
    '-preset', 'medium',
    '-c:a', 'aac',
    '-b:a', audioBitrate,
    outputPath
  ];

  await runFfmpeg(args);
}
