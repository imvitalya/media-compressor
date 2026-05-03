import { runSvgo } from './ffmpegRunner';

export async function optimizeSvg(inputPath: string, outputPath: string): Promise<void> {
  await runSvgo([inputPath, '-o', outputPath]);
}
