# Media Compressor

Compress images and videos directly from the VSCode Explorer context menu using **ffmpeg** and **pngquant** — no browser uploads, no third-party services.

---

## Features

- Right-click any image or video in the Explorer → **Compress Media**
- Four compression levels via a quick-pick menu:
  - **Lossless** — optimizes file size without any quality loss
  - **Compress to 90%** — light compression, virtually no visible difference
  - **Compress to 80%** — moderate compression, great quality
  - **Custom %** — enter any value from 1 to 100
- **Multi-file support** — select multiple files at once; results go into a `compressed/` folder next to the originals
- **Single file** — saved next to the original with a `-compressed` suffix (e.g. `image-compressed.png`)
- Notification shows file size before → after and reduction percentage
- If a required tool is missing, a prompt appears with an **Install** button that runs the install command in the built-in terminal
- UI language follows your VSCode locale (English / Russian)

## Supported Formats

| Type   | Formats                        |
|--------|--------------------------------|
| Images | `.jpg` `.jpeg` `.png` `.webp` `.gif` |
| Video  | `.mp4` `.webm` `.mkv` `.mov`   |

## Requirements

The extension requires **ffmpeg** (for videos and JPG/WebP) and **pngquant** (for PNG, same algorithm as TinyPNG).

If either tool is missing, the extension will notify you and offer to install it automatically with a single click — or you can install it yourself at any time.

## Usage

1. Right-click a file (or a selection of files) in the Explorer
2. Click **Compress Media**
3. Choose a compression level from the menu
4. Wait for the progress notification — done!

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `mediaCompressor.ffmpegPath` | `ffmpeg` | Path to the ffmpeg executable (if not in system PATH) |
| `mediaCompressor.deleteOriginal` | `false` | Delete the original file after successful compression |

---

---

# Media Compressor (Русский)

Сжатие изображений и видео прямо из Explorer в VSCode — через **ffmpeg** и **pngquant**. Без загрузки на сторонние сервисы.

---

## Возможности

- Правый клик на файл или группу файлов → **Сжать**
- Четыре варианта сжатия через меню быстрого выбора:
  - **Без потери качества** — оптимизация без деградации
  - **Сжать на 90%** — лёгкое сжатие, разница почти незаметна
  - **Сжать на 80%** — умеренное сжатие, хорошее качество
  - **Произвольный процент** — введите любое значение от 1 до 100
- **Несколько файлов** — результаты сохраняются в папку `compressed/` рядом с оригиналами
- **Один файл** — сохраняется рядом с оригиналом с суффиксом `-compressed` (например `image-compressed.png`)
- Уведомление показывает размер до → после и процент уменьшения
- Если нужная программа не установлена — появляется уведомление с кнопкой **Установить**, которая запускает нужную команду в встроенном терминале
- Язык интерфейса соответствует вашей локали VSCode (английский / русский)

## Поддерживаемые форматы

| Тип    | Форматы                        |
|--------|--------------------------------|
| Картинки | `.jpg` `.jpeg` `.png` `.webp` `.gif` |
| Видео  | `.mp4` `.webm` `.mkv` `.mov`   |

## Требования

Расширению нужны **ffmpeg** (для видео и JPG/WebP) и **pngquant** (для PNG, тот же алгоритм что у TinyPNG).

Если какой-то программы нет — расширение само об этом сообщит и предложит установить одной кнопкой. Или можно установить самостоятельно в любой момент.

## Использование

1. Правый клик на файл (или выделить несколько файлов) в Explorer
2. Выбрать **Сжать**
3. Выбрать степень сжатия из меню
4. Дождаться уведомления о завершении — готово!

## Настройки расширения

| Настройка | По умолчанию | Описание |
|-----------|--------------|----------|
| `mediaCompressor.ffmpegPath` | `ffmpeg` | Путь к исполняемому файлу ffmpeg (если он не в системном PATH) |
| `mediaCompressor.deleteOriginal` | `false` | Удалять исходный файл после успешного сжатия |
