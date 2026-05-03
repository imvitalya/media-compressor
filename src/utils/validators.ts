import * as path from 'path';
import { SUPPORTED_FORMATS, IMAGE_FORMATS, VIDEO_FORMATS, SVG_FORMATS } from '../constants';

export function isMediaFile(filePath: string): boolean {
  return SUPPORTED_FORMATS.includes(path.extname(filePath).toLowerCase());
}

export function isImageFile(filePath: string): boolean {
  return IMAGE_FORMATS.includes(path.extname(filePath).toLowerCase());
}

export function isVideoFile(filePath: string): boolean {
  return VIDEO_FORMATS.includes(path.extname(filePath).toLowerCase());
}

export function isSvgFile(filePath: string): boolean {
  return SVG_FORMATS.includes(path.extname(filePath).toLowerCase());
}
