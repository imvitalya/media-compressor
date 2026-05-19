import * as vscode from 'vscode';
import { compressMediaCommand } from './commands/compressMedia';
import { installDependenciesCommand } from './commands/installDependencies';
import { checkFfmpeg, checkPngquant, checkOxipng } from './compressor/ffmpegRunner';
import { showMissingDependenciesNotification, Tool } from './utils/errorHandler';

async function checkDependenciesOnStartup(): Promise<void> {
  const missing: Tool[] = [];
  if (!await checkFfmpeg()) missing.push('ffmpeg');
  if (!await checkPngquant()) missing.push('pngquant');

  // oxipng — рекомендуется для лучшего сжатия. Уведомление можно отключить флагом.
  const useOxipng = vscode.workspace.getConfiguration('mediaCompressor').get<boolean>('useOxipng', true);
  if (useOxipng && !await checkOxipng()) missing.push('oxipng');

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
