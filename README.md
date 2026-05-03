# Media Compressor

Compress images, videos, and SVG files directly from the VSCode Explorer context menu — no browser uploads, no third-party services.

---

## Features

- Right-click any supported file in the Explorer → **Compress Media**
- Four compression levels via a quick-pick menu:
  - **Lossless** — optimizes file size without any quality loss
  - **Compress to 90%** — light compression, virtually no visible difference
  - **Compress to 80%** — moderate compression, great quality
  - **Custom %** — enter any value from 1 to 100
- **Convert format** — convert images to JPG / PNG / WebP, videos to MP4 / WebM / MKV / MOV
- **SVG optimization** — right-click any `.svg` file and optimize it instantly via `svgo`, no menu needed
- **Multi-file support** — select multiple files at once; results go into a `compressed/` folder next to the originals
- **Single file** — saved next to the original with a `-compressed` suffix (e.g. `image-compressed.png`)
- Notification shows file size before → after and reduction percentage
- If a required tool is missing, a prompt appears with an **Install** button that runs the install command in the built-in terminal
- UI language follows your VSCode locale (English / Russian)

## Supported Formats

| Type   | Formats                              |
|--------|--------------------------------------|
| Images | `.jpg` `.jpeg` `.png` `.webp` `.gif` |
| Vector | `.svg`                               |
| Video  | `.mp4` `.webm` `.mkv` `.mov`         |

## Requirements

The extension uses **ffmpeg**, **pngquant**, **svgo**, and **cwebp** depending on the file type and action. If any tool is missing, the extension will notify you and offer to install it automatically with a single click — or you can install it yourself at any time.

| Tool | Used for |
|------|----------|
| `ffmpeg` | Video compression, JPG/WebP encoding |
| `pngquant` | PNG compression (same algorithm as TinyPNG) |
| `svgo` | SVG optimization |
| `cwebp` | WebP encoding (fallback if ffmpeg lacks libwebp) |

## Usage

1. Right-click a file (or a selection of files) in the Explorer
2. Click **Compress Media**
3. For images/videos: choose a compression level or format from the menu
4. For SVG: optimization starts immediately — no menu needed
5. Wait for the progress notification — done!

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `mediaCompressor.ffmpegPath` | `ffmpeg` | Path to the ffmpeg executable (if not in system PATH) |
| `mediaCompressor.deleteOriginal` | `false` | Delete the original file after successful compression |

---

---

# Media Compressor (Русский)

Сжатие изображений, видео и SVG-файлов прямо из Explorer в VSCode. Без загрузки на сторонние сервисы.

---

## Возможности

- Правый клик на файл или группу файлов → **Сжать**
- Четыре варианта сжатия через меню быстрого выбора:
  - **Без потери качества** — оптимизация без деградации
  - **Сжать на 90%** — лёгкое сжатие, разница почти незаметна
  - **Сжать на 80%** — умеренное сжатие, хорошее качество
  - **Произвольный процент** — введите любое значение от 1 до 100
- **Смена формата** — конвертация картинок в JPG / PNG / WebP, видео в MP4 / WebM / MKV / MOV
- **Оптимизация SVG** — правый клик на `.svg` и оптимизация запускается сразу через `svgo`, без меню
- **Несколько файлов** — результаты сохраняются в папку `compressed/` рядом с оригиналами
- **Один файл** — сохраняется рядом с оригиналом с суффиксом `-compressed` (например `image-compressed.png`)
- Уведомление показывает размер до → после и процент уменьшения
- Если нужная программа не установлена — появляется уведомление с кнопкой **Установить**, которая запускает нужную команду в встроенном терминале
- Язык интерфейса соответствует вашей локали VSCode (английский / русский)

## Поддерживаемые форматы

| Тип      | Форматы                              |
|----------|--------------------------------------|
| Картинки | `.jpg` `.jpeg` `.png` `.webp` `.gif` |
| Вектор   | `.svg`                               |
| Видео    | `.mp4` `.webm` `.mkv` `.mov`         |

## Требования

Расширение использует **ffmpeg**, **pngquant**, **svgo** и **cwebp** в зависимости от типа файла и действия. Если какой-то программы нет — расширение само об этом сообщит и предложит установить одной кнопкой.

| Инструмент | Используется для |
|------------|-----------------|
| `ffmpeg` | Сжатие видео, кодирование JPG/WebP |
| `pngquant` | Сжатие PNG (тот же алгоритм что у TinyPNG) |
| `svgo` | Оптимизация SVG |
| `cwebp` | Кодирование WebP (если ffmpeg собран без libwebp) |

## Использование

1. Правый клик на файл (или выделить несколько файлов) в Explorer
2. Выбрать **Сжать**
3. Для картинок/видео: выбрать степень сжатия или формат из меню
4. Для SVG: оптимизация запускается сразу, без меню
5. Дождаться уведомления о завершении — готово!

## Настройки расширения

| Настройка | По умолчанию | Описание |
|-----------|--------------|----------|
| `mediaCompressor.ffmpegPath` | `ffmpeg` | Путь к исполняемому файлу ffmpeg (если он не в системном PATH) |
| `mediaCompressor.deleteOriginal` | `false` | Удалять исходный файл после успешного сжатия |
