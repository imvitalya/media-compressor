import * as vscode from 'vscode';
import { checkFfmpeg, checkPngquant, checkCwebp, checkSvgo } from '../compressor/ffmpegRunner';
import { getInstallInfo } from '../utils/errorHandler';
import { i18n } from '../i18n';

type Tool = 'ffmpeg' | 'pngquant' | 'svgo' | 'webp';

const ALL_TOOLS: Tool[] = ['ffmpeg', 'pngquant', 'svgo', 'webp'];

async function checkAllTools(): Promise<Map<Tool, boolean>> {
  const [ffmpeg, pngquant, cwebp, svgo] = await Promise.all([
    checkFfmpeg(),
    checkPngquant(),
    checkCwebp(),
    checkSvgo(),
  ]);
  return new Map<Tool, boolean>([
    ['ffmpeg', ffmpeg],
    ['pngquant', pngquant],
    ['svgo', svgo],
    ['webp', cwebp],
  ]);
}

function installInTerminal(tools: Tool[]): void {
  const cmds = tools
    .map((t) => getInstallInfo(t).terminalCmd)
    .filter((c) => c !== '');

  if (cmds.length === 0) return;

  const label = tools.length === 1 ? tools[0] : 'dependencies';
  const terminal = vscode.window.createTerminal(`Media Compressor: install ${label}`);
  terminal.show();
  terminal.sendText(cmds.join(' && '));
}

export async function installDependenciesCommand(): Promise<void> {
  const s = i18n();

  const statuses = await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: s.installDepsTitle, cancellable: false },
    () => checkAllTools()
  );

  const missing = ALL_TOOLS.filter((t) => !statuses.get(t));

  type ToolPickItem = vscode.QuickPickItem & { tool?: Tool; installAll?: boolean };

  const items: ToolPickItem[] = [];

  if (missing.length > 0) {
    items.push({
      label: `$(cloud-download) ${s.installAllMissing(missing.length)}`,
      description: s.installAllMissingDesc(missing.join(', ')),
      installAll: true,
    });
    items.push({ kind: vscode.QuickPickItemKind.Separator, label: s.separatorIndividual });
  }

  for (const tool of ALL_TOOLS) {
    const installed = statuses.get(tool) ?? false;
    items.push({
      label: `${installed ? '$(check)' : '$(error)'} ${tool}`,
      description: installed ? s.toolInstalled : s.toolNotInstalled,
      detail: s.toolDetail[tool],
      tool,
    });
  }

  const pick = await vscode.window.showQuickPick(items, {
    title: s.installDepsTitle,
    placeHolder: s.installDepsPlaceholder,
  });

  if (!pick) return;

  if ((pick as ToolPickItem).installAll) {
    installInTerminal(missing);
    return;
  }

  const tool = (pick as ToolPickItem).tool;
  if (!tool) return;

  if (statuses.get(tool)) {
    vscode.window.showInformationMessage(s.toolAlreadyInstalled(tool));
    return;
  }

  installInTerminal([tool]);
}
