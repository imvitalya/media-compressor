import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { calculateOutputPath, formatFileSize } from '../src/utils/fileHandler';

describe('fileHandler', () => {
  describe('calculateOutputPath', () => {
    describe('single file (isMultiple=false)', () => {
      it('adds -compressed suffix keeping extension', () => {
        expect(calculateOutputPath('/foo/image.jpg', false)).toBe(path.join('/foo', 'image-compressed.jpg'));
      });

      it('preserves original extension for PNG', () => {
        expect(calculateOutputPath('/foo/bar/photo.png', false)).toBe(path.join('/foo/bar', 'photo-compressed.png'));
      });

      it('converts extension when targetExt differs', () => {
        expect(calculateOutputPath('/foo/image.png', false, '.webp')).toBe(path.join('/foo', 'image.webp'));
      });

      it('adds -compressed when targetExt matches input ext', () => {
        expect(calculateOutputPath('/foo/image.jpg', false, '.jpg')).toBe(path.join('/foo', 'image-compressed.jpg'));
      });
    });

    describe('multiple files (isMultiple=true)', () => {
      it('puts file inside compressed/ directory', () => {
        expect(calculateOutputPath('/foo/image.jpg', true)).toBe(path.join('/foo', 'compressed', 'image.jpg'));
      });

      it('uses targetExt when converting format', () => {
        expect(calculateOutputPath('/foo/photo.png', true, '.webp')).toBe(path.join('/foo', 'compressed', 'photo.webp'));
      });

      it('preserves filename from deeply nested path', () => {
        expect(calculateOutputPath('/a/b/c/video.mp4', true)).toBe(path.join('/a/b/c', 'compressed', 'video.mp4'));
      });
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(102400)).toBe('100.0 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatFileSize(5242880)).toBe('5.00 MB');
    });
  });
});
