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
    quickPickPlaceholder: (count: number) => `Выберите действие для ${pluralizeFiles(count, 'ru')}`,
    optionLossless: 'Без потери качества',
    optionLosslessDesc: 'Оптимизация без деградации качества',
    option90: 'Сжать на 90%',
    option90Desc: 'Лёгкое сжатие, незаметная разница',
    option80: 'Сжать на 80%',
    option80Desc: 'Умеренное сжатие, хорошее качество',
    optionCustom: 'Произвольный процент...',
    optionCustomDesc: 'Указать своё значение качества (1–100)',
    optionConvert: 'Сменить формат...',
    optionConvertDesc: 'Конвертировать в другой формат',
    mixedTypesError: 'Нельзя конвертировать формат для смеси картинок и видео — выберите файлы одного типа.',
    formatPickTitle: 'Выберите формат',
    inputPrompt: 'Введите процент качества (1 = минимальное, 100 = максимальное)',
    inputPlaceholder: '75',
    inputError: 'Введите целое число от 1 до 100',
    progressOf: (current: number, total: number) => `${current} из ${total}`,
    successMessage: (count: number, before: string, after: string, reduction: string, elapsed: string) =>
      `Сжато файлов: ${count} за ${elapsed}с | ${before} → ${after} (−${reduction}%)`,
    convertMessage: (count: number, elapsed: string) =>
      `Конвертировано файлов: ${count} за ${elapsed}с`,
    errorProcessing: (count: number) => `Ошибки при обработке (${count}):`,
    videoSizeIncreased: (name: string) =>
      `${name}: видео уже хорошо сжато — перекодирование только увеличит размер. Файл пропущен.`,
    ffmpegNotFound: 'ffmpeg не найден в системе. Установите его и перезапустите VSCode.',
    howToInstall: 'Как установить?',
    install: 'Установить',
    installing: (tool: string) => `Устанавливаю ${tool} в терминале...`,
    pngquantMissing: 'pngquant не найден — PNG сжимается через ffmpeg (менее эффективно). Установите pngquant для лучшего результата.',
    ffmpegInstallInstructions: (cmd: string) => `Команда для установки ffmpeg:\n\n${cmd}`,
    pngquantInstallInstructions: (cmd: string) => `Команда для установки pngquant:\n\n${cmd}`,
    webpEncoderMissing: 'WebP-энкодер не найден. Установите пакет webp для конвертации в WebP.',
    webpInstallInstructions: (cmd: string) => `Команда для установки webp:\n\n${cmd}`,
    svgoMissing: 'svgo не найден. Установите его для оптимизации SVG-файлов.',
    svgoInstallInstructions: (cmd: string) => `Команда для установки svgo:\n\n${cmd}`,
    svgSuccessMessage: (count: number, before: string, after: string, reduction: string, elapsed: string) =>
      `Оптимизировано SVG: ${count} за ${elapsed}с | ${before} → ${after} (−${reduction}%)`,
    missingDepsMessage: (tools: string) => `Media Compressor: не найдены — ${tools}. Установите их для работы расширения.`,
    installAll: 'Установить',
    installDepsTitle: 'Media Compressor: Установка зависимостей',
    installDepsPlaceholder: 'Выберите инструмент для установки',
    installAllMissing: (n: number) => `Установить все отсутствующие (${n})`,
    installAllMissingDesc: (names: string) => names,
    separatorIndividual: 'Отдельные инструменты',
    toolInstalled: 'установлен',
    toolNotInstalled: 'не установлен',
    toolAlreadyInstalled: (name: string) => `${name} уже установлен в системе.`,
    allToolsInstalled: 'Все инструменты уже установлены.',
    toolDetail: {
      ffmpeg:   'Обязателен. Сжатие видео (MP4, WebM, MKV, MOV), кодирование JPG и GIF.',
      pngquant: 'Рекомендуется. Сжатие PNG с высоким качеством (тот же алгоритм, что у TinyPNG). Без него PNG сжимается через ffmpeg — менее эффективно.',
      svgo:     'Необходим для оптимизации SVG-файлов.',
      webp:     'Нужен для конвертации в WebP, если ffmpeg собран без поддержки libwebp.',
    },
  },
  en: {
    commandTitle: 'Compress Media',
    noSupportedFiles: 'No supported media files among the selected items.',
    quickPickTitle: 'Media Compressor',
    quickPickPlaceholder: (count: number) => `Select action for ${pluralizeFiles(count, 'en')}`,
    optionLossless: 'Lossless',
    optionLosslessDesc: 'Optimize without quality loss',
    option90: 'Compress to 90%',
    option90Desc: 'Light compression, no visible difference',
    option80: 'Compress to 80%',
    option80Desc: 'Moderate compression, good quality',
    optionCustom: 'Custom percentage...',
    optionCustomDesc: 'Enter a custom quality value (1–100)',
    optionConvert: 'Convert format...',
    optionConvertDesc: 'Convert to a different file format',
    mixedTypesError: 'Cannot convert format for a mix of images and videos — select files of the same type.',
    formatPickTitle: 'Select format',
    inputPrompt: 'Enter quality percentage (1 = minimum, 100 = maximum)',
    inputPlaceholder: '75',
    inputError: 'Enter a whole number from 1 to 100',
    progressOf: (current: number, total: number) => `${current} of ${total}`,
    successMessage: (count: number, before: string, after: string, reduction: string, elapsed: string) =>
      `Compressed: ${count} files in ${elapsed}s | ${before} → ${after} (−${reduction}%)`,
    convertMessage: (count: number, elapsed: string) =>
      `Converted: ${count} files in ${elapsed}s`,
    errorProcessing: (count: number) => `Errors while processing (${count}):`,
    videoSizeIncreased: (name: string) =>
      `${name}: video is already well-compressed — re-encoding would only increase the size. File skipped.`,
    ffmpegNotFound: 'ffmpeg not found. Please install it and restart VSCode.',
    howToInstall: 'How to install?',
    install: 'Install',
    installing: (tool: string) => `Installing ${tool} in terminal...`,
    pngquantMissing: 'pngquant not found — PNG files will be compressed via ffmpeg (less efficient). Install pngquant for better results.',
    ffmpegInstallInstructions: (cmd: string) => `Install ffmpeg with:\n\n${cmd}`,
    pngquantInstallInstructions: (cmd: string) => `Install pngquant with:\n\n${cmd}`,
    webpEncoderMissing: 'WebP encoder not found. Install the webp package to convert files to WebP.',
    webpInstallInstructions: (cmd: string) => `Install webp with:\n\n${cmd}`,
    svgoMissing: 'svgo not found. Install it to optimize SVG files.',
    svgoInstallInstructions: (cmd: string) => `Install svgo with:\n\n${cmd}`,
    svgSuccessMessage: (count: number, before: string, after: string, reduction: string, elapsed: string) =>
      `Optimized SVG: ${count} in ${elapsed}s | ${before} → ${after} (−${reduction}%)`,
    missingDepsMessage: (tools: string) => `Media Compressor: missing tools — ${tools}. Install them to enable compression.`,
    installAll: 'Install All',
    installDepsTitle: 'Media Compressor: Install Dependencies',
    installDepsPlaceholder: 'Select a tool to install',
    installAllMissing: (n: number) => `Install all missing (${n})`,
    installAllMissingDesc: (names: string) => names,
    separatorIndividual: 'Individual tools',
    toolInstalled: 'installed',
    toolNotInstalled: 'not installed',
    toolAlreadyInstalled: (name: string) => `${name} is already installed.`,
    allToolsInstalled: 'All tools are already installed.',
    toolDetail: {
      ffmpeg:   'Required. Video compression (MP4, WebM, MKV, MOV), JPG and GIF encoding.',
      pngquant: 'Recommended. High-quality PNG compression (same algorithm as TinyPNG). Without it, PNG falls back to ffmpeg — less efficient.',
      svgo:     'Required for SVG file optimization.',
      webp:     'Needed for WebP conversion when ffmpeg is built without libwebp support.',
    },
  }
};

export function i18n(): typeof strings['en'] {
  return strings[getLang()] as typeof strings['en'];
}
