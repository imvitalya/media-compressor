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

// Кешируем результат — subprocess запускается один раз за сессию
let _ffmpegWebpSupport: boolean | null = null;

export async function checkFfmpegWebpSupport(): Promise<boolean> {
  if (_ffmpegWebpSupport !== null) return _ffmpegWebpSupport;
  try {
    const ffmpeg = getFfmpegPath();
    const { stdout } = await execAsync(`"${ffmpeg}" -encoders -hide_banner`);
    _ffmpegWebpSupport = stdout.includes('libwebp') || /V[A-Z.]{5} webp /.test(stdout);
  } catch {
    _ffmpegWebpSupport = false;
  }
  return _ffmpegWebpSupport;
}

export async function checkCwebp(): Promise<boolean> {
  try {
    await execAsync('cwebp -version');
    return true;
  } catch {
    return false;
  }
}

export async function runFfmpeg(args: string[]): Promise<void> {
  const ffmpeg = getFfmpegPath();
  try {
    await execFileAsync(ffmpeg, args);
  } catch (err: any) {
    const stderr = err.stderr || err.message || String(err);
    throw new Error(`ffmpeg error: ${stderr}`);
  }
}

export async function runPngquant(args: string[]): Promise<void> {
  // pngquant возвращает код 99 если не может достичь целевого качества — это не ошибка
  return new Promise((resolve, reject) => {
    const proc = execFile('pngquant', args);
    proc.on('close', (code) => {
      if (code === 0 || code === 99) { resolve(); }
      else { reject(new Error(`pngquant завершился с кодом ${code}`)); }
    });
    proc.on('error', reject);
  });
}

export async function runCwebp(args: string[]): Promise<void> {
  try {
    await execFileAsync('cwebp', args);
  } catch (err: any) {
    const stderr = err.stderr || err.message || String(err);
    throw new Error(`cwebp error: ${stderr}`);
  }
}

export async function checkSvgo(): Promise<boolean> {
  try {
    await execAsync('svgo --version');
    return true;
  } catch {
    return false;
  }
}

export async function runSvgo(args: string[]): Promise<void> {
  try {
    await execFileAsync('svgo', args);
  } catch (err: any) {
    const stderr = err.stderr || err.message || String(err);
    throw new Error(`svgo error: ${stderr}`);
  }
}

export async function checkOxipng(): Promise<boolean> {
  try {
    await execAsync('oxipng --version');
    return true;
  } catch {
    return false;
  }
}

export async function runOxipng(args: string[]): Promise<void> {
  try {
    await execFileAsync('oxipng', args);
  } catch (err: any) {
    const stderr = err.stderr || err.message || String(err);
    throw new Error(`oxipng error: ${stderr}`);
  }
}
