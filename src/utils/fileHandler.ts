import * as fs from 'fs';
import * as path from 'path';

export function calculateOutputPath(inputPath: string, isMultiple: boolean, targetExt?: string): string {
  const dir = path.dirname(inputPath);
  const inputExt = path.extname(inputPath);
  const ext = targetExt ?? inputExt;
  const basename = path.basename(inputPath, inputExt);

  if (!isMultiple) {
    const suffix = targetExt && targetExt !== inputExt ? '' : '-compressed';
    return path.join(dir, `${basename}${suffix}${ext}`);
  }

  return path.join(dir, 'compressed', `${basename}${ext}`);
}

export function getOutputPath(inputPath: string, isMultiple: boolean, targetExt?: string): string {
  const outputPath = calculateOutputPath(inputPath, isMultiple, targetExt);

  if (isMultiple) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  return outputPath;
}

export function getFileSize(filePath: string): number {
  return fs.statSync(filePath).size;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
