import * as vscode from 'vscode';
import { compressMediaCommand } from './commands/compressMedia';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('mediaCompressor.compressMedia', compressMediaCommand)
  );
}

export function deactivate(): void {}
