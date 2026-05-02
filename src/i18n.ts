import * as vscode from 'vscode';

type Lang = 'ru' | 'en';

function getLang(): Lang {
  return vscode.env.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function pluralizeFiles(n: number, lang: Lang): string {
  if (lang === 'ru') {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return `${n} файлов`;
    if (mod10 === 1) return `${n} файл`;
    if (mod10 >= 2 && mod10 <= 4) return `${n} файла`;
    return `${n} файлов`;
  }
  return n === 1 ? `${n} file` : `${n} files`;
}

const strings = {
  ru: {
    commandTitle: 'Сжать медиафайл',
    noSupportedFiles: 'Среди выбранных файлов нет поддерживаемых медиафайлов.',
    quickPickTitle: 'Media Compressor',
    quickPickPlaceholder: (count: number) => `Выберите степень сжатия для ${pluralizeFiles(count, 'ru')}`,
    optionLossless: 'Без потери качества',
    optionLosslessDesc: 'Оптимизация без деградации качества',
    option90: 'Сжать на 90%',
    option90Desc: 'Лёгкое сжатие, незаметная разница',
    option80: 'Сжать на 80%',
    option80Desc: 'Умеренное сжатие, хорошее качество',
    optionCustom: 'Произвольный процент...',
    optionCustomDesc: 'Указать своё значение качества (1–100)',
    inputPrompt: 'Введите процент качества (1 = минимальное, 100 = максимальное)',
    inputPlaceholder: '75',
    inputError: 'Введите целое число от 1 до 100',
    progressOf: (current: number, total: number) => `${current} из ${total}`,
    successMessage: (count: number, before: string, after: string, reduction: string, elapsed: string) =>
      `Сжато файлов: ${count} за ${elapsed}с | ${before} → ${after} (−${reduction}%)`,
    errorProcessing: (count: number) => `Ошибки при обработке (${count}):`,
    ffmpegNotFound: 'ffmpeg не найден в системе. Установите его и перезапустите VSCode.',
    howToInstall: 'Как установить?',
    install: 'Установить',
    installing: (tool: string) => `Устанавливаю ${tool} в терминале...`,
    pngquantMissing: 'pngquant не найден — PNG сжимается через ffmpeg (менее эффективно). Установите pngquant для лучшего результата.',
    ffmpegInstallInstructions: (cmd: string) => `Команда для установки ffmpeg:\n\n${cmd}`,
    pngquantInstallInstructions: (cmd: string) => `Команда для установки pngquant:\n\n${cmd}`,
  },
  en: {
    commandTitle: 'Compress Media',
    noSupportedFiles: 'No supported media files among the selected items.',
    quickPickTitle: 'Media Compressor',
    quickPickPlaceholder: (count: number) => `Select compression level for ${pluralizeFiles(count, 'en')}`,
    optionLossless: 'Lossless',
    optionLosslessDesc: 'Optimize without quality loss',
    option90: 'Compress to 90%',
    option90Desc: 'Light compression, no visible difference',
    option80: 'Compress to 80%',
    option80Desc: 'Moderate compression, good quality',
    optionCustom: 'Custom percentage...',
    optionCustomDesc: 'Enter a custom quality value (1–100)',
    inputPrompt: 'Enter quality percentage (1 = minimum, 100 = maximum)',
    inputPlaceholder: '75',
    inputError: 'Enter a whole number from 1 to 100',
    progressOf: (current: number, total: number) => `${current} of ${total}`,
    successMessage: (count: number, before: string, after: string, reduction: string, elapsed: string) =>
      `Compressed: ${count} files in ${elapsed}s | ${before} → ${after} (−${reduction}%)`,
    errorProcessing: (count: number) => `Errors while processing (${count}):`,
    ffmpegNotFound: 'ffmpeg not found. Please install it and restart VSCode.',
    howToInstall: 'How to install?',
    install: 'Install',
    installing: (tool: string) => `Installing ${tool} in terminal...`,
    pngquantMissing: 'pngquant not found — PNG files will be compressed via ffmpeg (less efficient). Install pngquant for better results.',
    ffmpegInstallInstructions: (cmd: string) => `Install ffmpeg with:\n\n${cmd}`,
    pngquantInstallInstructions: (cmd: string) => `Install pngquant with:\n\n${cmd}`,
  }
};

export function i18n(): typeof strings['en'] {
  return strings[getLang()] as typeof strings['en'];
}
