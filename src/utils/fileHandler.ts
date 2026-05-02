import * as fs from 'fs';
import * as path from 'path';

export function getOutputPath(inputPath: string, isMultiple: boolean): string {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const basename = path.basename(inputPath, ext);

  if (!isMultiple) {
    return path.join(dir, `${basename}-compressed${ext}`);
  }

  const compressedDir = path.join(dir, 'compressed');
  if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir, { recursive: true });
  }
  return path.join(compressedDir, path.basename(inputPath));
}

export function getFileSize(filePath: string): number {
  return fs.statSync(filePath).size;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
