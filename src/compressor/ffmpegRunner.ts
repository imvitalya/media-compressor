import { exec, execFile } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

function getFfmpegPath(): string {
  return vscode.workspace
    .getConfiguration('mediaCompressor')
    .get<string>('ffmpegPath', 'ffmpeg');
}

export async function checkFfmpeg(): Promise<boolean> {
  const ffmpeg = getFfmpegPath();
  try {
    await execAsync(`"${ffmpeg}" -version`);
    return true;
  } catch {
    return false;
  }
}

export async function checkPngquant(): Promise<boolean> {
  try {
    await execAsync('pngquant --version');
    return true;
  } catch {
    return false;
  }
}

export async function runFfmpeg(args: string[]): Promise<void> {
  const ffmpeg = getFfmpegPath();
  await execFileAsync(ffmpeg, args);
}

export async function runPngquant(args: string[]): Promise<void> {
  // pngquant возвращает код 99 если не может достичь целевого качества — это не ошибка
  return new Promise((resolve, reject) => {
    const proc = execFile('pngquant', args);
    proc.on('close', (code) => {
      if (code === 0 || code === 99) {
        resolve();
      } else {
        reject(new Error(`pngquant завершился с кодом ${code}`));
      }
    });
    proc.on('error', reject);
  });
}
