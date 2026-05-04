import * as os from 'os';
import * as vscode from 'vscode';
import { i18n } from '../i18n';

type Tool = 'ffmpeg' | 'pngquant' | 'webp' | 'svgo';

interface PlatformInstall {
  displayCmd: string;
  terminalCmd: string;
}

export function getInstallInfo(tool: Tool): PlatformInstall {
  const platform = os.platform();

  const matrix: Record<Tool, Record<string, PlatformInstall>> = {
    ffmpeg: {
      darwin:  { displayCmd: 'brew install ffmpeg',            terminalCmd: 'brew install ffmpeg' },
      linux:   { displayCmd: 'sudo apt-get install ffmpeg',    terminalCmd: 'sudo apt-get install -y ffmpeg' },
      win32:   { displayCmd: 'winget install ffmpeg',          terminalCmd: 'winget install ffmpeg' },
    },
    pngquant: {
      darwin:  { displayCmd: 'brew install pngquant',          terminalCmd: 'brew install pngquant' },
      linux:   { displayCmd: 'sudo apt-get install pngquant',  terminalCmd: 'sudo apt-get install -y pngquant' },
      win32:   { displayCmd: 'winget install pngquant',        terminalCmd: 'winget install pngquant' },
    },
    webp: {
      darwin:  { displayCmd: 'brew install webp',              terminalCmd: 'brew install webp' },
      linux:   { displayCmd: 'sudo apt-get install webp',      terminalCmd: 'sudo apt-get install -y webp' },
      win32:   { displayCmd: 'winget install webp',            terminalCmd: 'winget install webp' },
    },
    svgo: {
      darwin:  { displayCmd: 'npm install -g svgo', terminalCmd: 'npm install -g svgo' },
      linux:   { displayCmd: 'npm install -g svgo', terminalCmd: 'npm install -g svgo' },
      win32:   { displayCmd: 'npm install -g svgo', terminalCmd: 'npm install -g svgo' },
    }
  };

  return (
    matrix[tool][platform] ?? {
      displayCmd: `Посетите официальный сайт для установки ${tool}`,
      terminalCmd: ''
    }
  );
}

function runInstallInTerminal(tool: Tool, terminalCmd: string): void {
  const s = i18n();
  const terminal = vscode.window.createTerminal(`Media Compressor: install ${tool}`);
  terminal.show();
  terminal.sendText(terminalCmd);
  vscode.window.showInformationMessage(s.installing(tool));
}

export function showFfmpegNotFoundError(): void {
  const s = i18n();
  const { displayCmd, terminalCmd } = getInstallInfo('ffmpeg');

  vscode.window
    .showErrorMessage(s.ffmpegNotFound, s.howToInstall, s.install)
    .then((selection) => {
      if (selection === s.howToInstall) {
        vscode.window.showInformationMessage(s.ffmpegInstallInstructions(displayCmd), { modal: true });
      } else if (selection === s.install && terminalCmd) {
        runInstallInTerminal('ffmpeg', terminalCmd);
      }
    });
}

export function showWebpEncoderMissingError(): void {
  const s = i18n();
  const { displayCmd, terminalCmd } = getInstallInfo('webp');

  vscode.window
    .showErrorMessage(s.webpEncoderMissing, s.howToInstall, s.install)
    .then((selection) => {
      if (selection === s.howToInstall) {
        vscode.window.showInformationMessage(s.webpInstallInstructions(displayCmd), { modal: true });
      } else if (selection === s.install && terminalCmd) {
        runInstallInTerminal('webp', terminalCmd);
      }
    });
}

export function showSvgoMissingError(): void {
  const s = i18n();
  const { displayCmd, terminalCmd } = getInstallInfo('svgo');

  vscode.window
    .showErrorMessage(s.svgoMissing, s.howToInstall, s.install)
    .then((selection) => {
      if (selection === s.howToInstall) {
        vscode.window.showInformationMessage(s.svgoInstallInstructions(displayCmd), { modal: true });
      } else if (selection === s.install && terminalCmd) {
        runInstallInTerminal('svgo', terminalCmd);
      }
    });
}

export function showMissingDependenciesNotification(tools: Tool[]): void {
  if (tools.length === 0) return;
  const s = i18n();

  const cmds = tools
    .map((tool) => getInstallInfo(tool).terminalCmd)
    .filter((cmd) => cmd !== '');

  vscode.window
    .showWarningMessage(s.missingDepsMessage(tools.join(', ')), s.installAll)
    .then((action) => {
      if (action === s.installAll && cmds.length > 0) {
        const terminal = vscode.window.createTerminal('Media Compressor: install');
        terminal.show();
        terminal.sendText(cmds.join(' && '));
        vscode.window.showInformationMessage(s.installing(tools.join(', ')));
      }
    });
}

export function showPngquantMissingWarning(): void {
  const s = i18n();
  const { displayCmd, terminalCmd } = getInstallInfo('pngquant');

  vscode.window
    .showWarningMessage(s.pngquantMissing, s.howToInstall, s.install)
    .then((selection) => {
      if (selection === s.howToInstall) {
        vscode.window.showInformationMessage(s.pngquantInstallInstructions(displayCmd), { modal: true });
      } else if (selection === s.install && terminalCmd) {
        runInstallInTerminal('pngquant', terminalCmd);
      }
    });
}
