import * as vscode from 'vscode';
import { compressMediaCommand } from './commands/compressMedia';
import { installDependenciesCommand } from './commands/installDependencies';
import { checkFfmpeg, checkPngquant } from './compressor/ffmpegRunner';
import { showMissingDependenciesNotification } from './utils/errorHandler';

type Tool = 'ffmpeg' | 'pngquant' | 'webp' | 'svgo';

async function checkDependenciesOnStartup(): Promise<void> {
  const missing: Tool[] = [];
  if (!await checkFfmpeg()) missing.push('ffmpeg');
  if (!await checkPngquant()) missing.push('pngquant');
  showMissingDependenciesNotification(missing);
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('mediaCompressor.compressMedia', compressMediaCommand),
    vscode.commands.registerCommand('mediaCompressor.installDependencies', installDependenciesCommand)
  );

  checkDependenciesOnStartup();
}

export function deactivate(): void {}
