# Media Compressor

Compress images, videos, and SVG files directly from the VSCode Explorer context menu — no browser uploads, no third-party services.

---

## Features

- Right-click any supported file in the Explorer → **Compress Media**
- Four compression levels via a quick-pick menu:
  - **Lossless** — smart compression, visually identical to the original (TinyPNG-level: ~6× smaller for typical images with gradients/blur)
  - **Compress to 90%** — light compression, virtually no visible difference
  - **Compress to 80%** — moderate compression, great quality
  - **Custom %** — enter any value from 1 to 100
- **Convert format** — convert images to JPG / PNG / WebP, videos to MP4 / WebM / MKV / MOV. After picking the target format the extension asks **Yes/No: compress?**
  - **Yes** — pick a compression level (Lossless = TinyPNG-style, 90%, 80%, Custom)
  - **No** — change format only, pixel-perfect (no quality loss)
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

The extension uses **ffmpeg**, **pngquant**, **oxipng**, **svgo**, and **cwebp** depending on the file type and action. If any tool is missing, the extension will notify you and offer to install it automatically with a single click — or you can install it yourself at any time.

| Tool | Used for | Official source |
|------|----------|-----------------|
| `ffmpeg` | Video compression, JPG/WebP encoding | [ffmpeg.org](https://ffmpeg.org) |
| `pngquant` | PNG compression (same algorithm as TinyPNG) | [pngquant.org](https://pngquant.org) |
| `oxipng` | Additional lossless PNG optimization — combined with pngquant it matches TinyPNG-level results | [github.com/oxipng/oxipng](https://github.com/oxipng/oxipng) |
| `svgo` | SVG optimization | [github.com/svg/svgo](https://github.com/svg/svgo) |
| `cwebp` | WebP encoding (fallback if ffmpeg lacks libwebp) | [developers.google.com/speed/webp](https://developers.google.com/speed/webp) |

## Usage

**Compress files:**
1. Right-click a file (or a selection of files) in the Explorer
2. Click **Compress Media**
3. For images/videos: choose a compression level or format from the menu
4. For SVG: optimization starts immediately — no menu needed
5. Wait for the progress notification — done!

**Install dependencies:**

Open the Command Palette (`Shift+Cmd+P` on macOS / `Shift+Ctrl+P` on Windows/Linux) and run **Media Compressor: Install Dependencies**.

A quick-pick menu will appear showing all tools with their current status (installed / not installed). Select:
- **Install all missing (N)** — installs every missing tool in one terminal command
- Any individual tool — installs just that one, or shows a message if it's already installed

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `mediaCompressor.ffmpegPath` | `ffmpeg` | Path to the ffmpeg executable (if not in system PATH) |
| `mediaCompressor.deleteOriginal` | `false` | Delete the original file after successful compression |
| `mediaCompressor.outputSuffix` | `-compressed` | Suffix for compressed single files (e.g. `@1x` → `image@1x.png`). Has no effect when multiple files are selected. |
| `mediaCompressor.useOxipng` | `true` | Use oxipng as a second-stage lossless PNG optimizer. Disable if you don't want to install oxipng — PNG will still be compressed by pngquant but the output will be 10–20% larger. |

---

> **Privacy notice**
>
> All compression happens **locally on your machine**. No files are uploaded anywhere. No usage data, telemetry, or file contents are sent to any external server. The extension only invokes locally installed tools (ffmpeg, pngquant, oxipng, svgo, cwebp) as child processes.

---

# Media Compressor (Русский)

Сжатие изображений, видео и SVG-файлов прямо из Explorer в VSCode. Без загрузки на сторонние сервисы.

---

## Возможности

- Правый клик на файл или группу файлов → **Сжать**
- Четыре варианта сжатия через меню быстрого выбора:
  - **Без потери качества** — умное сжатие, визуально не отличить от оригинала (уровень TinyPNG: ~6× меньше для типичных картинок с градиентами/блюром)
  - **Сжать на 90%** — лёгкое сжатие, разница почти незаметна
  - **Сжать на 80%** — умеренное сжатие, хорошее качество
  - **Произвольный процент** — введите любое значение от 1 до 100
- **Смена формата** — конвертация картинок в JPG / PNG / WebP, видео в MP4 / WebM / MKV / MOV. После выбора нового формата задаётся вопрос **Да/Нет: сжимать?**
  - **Да** — выбор уровня сжатия (Без потери качества = уровень TinyPNG, 90%, 80%, произвольный)
  - **Нет** — только смена формата, pixel-perfect (без потери качества)
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

Расширение использует **ffmpeg**, **pngquant**, **oxipng**, **svgo** и **cwebp** в зависимости от типа файла и действия. Если какой-то программы нет — расширение само об этом сообщит и предложит установить одной кнопкой.

| Инструмент | Используется для | Официальный источник |
|------------|-----------------|----------------------|
| `ffmpeg` | Сжатие видео, кодирование JPG/WebP | [ffmpeg.org](https://ffmpeg.org) |
| `pngquant` | Сжатие PNG (тот же алгоритм что у TinyPNG) | [pngquant.org](https://pngquant.org) |
| `oxipng` | Дополнительная lossless-оптимизация PNG — в паре с pngquant даёт результат уровня TinyPNG | [github.com/oxipng/oxipng](https://github.com/oxipng/oxipng) |
| `svgo` | Оптимизация SVG | [github.com/svg/svgo](https://github.com/svg/svgo) |
| `cwebp` | Кодирование WebP (если ffmpeg собран без libwebp) | [developers.google.com/speed/webp](https://developers.google.com/speed/webp) |

## Использование

**Сжатие файлов:**
1. Правый клик на файл (или выделить несколько файлов) в Explorer
2. Выбрать **Сжать**
3. Для картинок/видео: выбрать степень сжатия или формат из меню
4. Для SVG: оптимизация запускается сразу, без меню
5. Дождаться уведомления о завершении — готово!

**Установка зависимостей:**

Откройте палитру команд (`Shift+Cmd+P` на macOS / `Shift+Ctrl+P` на Windows/Linux) и выберите **Media Compressor: Установить зависимости**.

Появится меню со списком всех инструментов и их статусом (установлен / не установлен). Выберите:
- **Установить все отсутствующие (N)** — установит все недостающие инструменты одной командой в терминале
- Любой конкретный инструмент — установит только его, или сообщит, что он уже установлен

## Настройки расширения

| Настройка | По умолчанию | Описание |
|-----------|--------------|----------|
| `mediaCompressor.ffmpegPath` | `ffmpeg` | Путь к исполняемому файлу ffmpeg (если он не в системном PATH) |
| `mediaCompressor.deleteOriginal` | `false` | Удалять исходный файл после успешного сжатия |
| `mediaCompressor.outputSuffix` | `-compressed` | Суффикс для сжатых файлов при обработке одного файла (например `@1x` → `image@1x.png`). При выборе нескольких файлов не применяется. |
| `mediaCompressor.useOxipng` | `true` | Использовать oxipng как второй этап lossless-оптимизации PNG. Отключите, если не хотите устанавливать oxipng — PNG всё равно будет сжиматься через pngquant, но размер будет на 10–20% больше. |

---

> **Конфиденциальность**
>
> Всё сжатие происходит **локально на вашем устройстве**. Никакие файлы никуда не загружаются. Никакие данные об использовании, телеметрия или содержимое файлов не передаются на внешние серверы. Расширение только запускает локально установленные инструменты (ffmpeg, pngquant, oxipng, svgo, cwebp) как дочерние процессы.
