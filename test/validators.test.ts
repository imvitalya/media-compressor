import { describe, it, expect } from 'vitest';
import { isMediaFile, isImageFile, isVideoFile, isSvgFile } from '../src/utils/validators';

describe('validators', () => {
  describe('isMediaFile', () => {
    const imageFiles = ['photo.jpg', 'photo.JPEG', 'icon.png', 'banner.webp', 'anim.gif'];
    const videoFiles = ['clip.mp4', 'clip.MP4', 'video.webm', 'film.mkv', 'screen.mov'];
    const otherFiles = ['doc.pdf', 'style.css', 'index.html', 'data.json', 'README.md', 'archive.zip'];

    for (const file of imageFiles) {
      it(`accepts ${file}`, () => expect(isMediaFile(`/path/${file}`)).toBe(true));
    }
    for (const file of videoFiles) {
      it(`accepts ${file}`, () => expect(isMediaFile(`/path/${file}`)).toBe(true));
    }
    for (const file of otherFiles) {
      it(`rejects ${file}`, () => expect(isMediaFile(`/path/${file}`)).toBe(false));
    }

    it('does not treat SVG as media (SVG has its own flow)', () => {
      expect(isMediaFile('/path/icon.svg')).toBe(false);
      expect(isMediaFile('/path/logo.SVG')).toBe(false);
    });
  });

  describe('isImageFile', () => {
    it('returns true for image extensions', () => {
      expect(isImageFile('/path/photo.jpg')).toBe(true);
      expect(isImageFile('/path/icon.PNG')).toBe(true);
      expect(isImageFile('/path/banner.webp')).toBe(true);
    });
    it('returns false for video extensions', () => {
      expect(isImageFile('/path/clip.mp4')).toBe(false);
      expect(isImageFile('/path/video.webm')).toBe(false);
    });
    it('returns false for SVG', () => {
      expect(isImageFile('/path/icon.svg')).toBe(false);
    });
  });

  describe('isVideoFile', () => {
    it('returns true for video extensions', () => {
      expect(isVideoFile('/path/clip.mp4')).toBe(true);
      expect(isVideoFile('/path/video.MKV')).toBe(true);
    });
    it('returns false for image extensions', () => {
      expect(isVideoFile('/path/photo.jpg')).toBe(false);
      expect(isVideoFile('/path/icon.png')).toBe(false);
    });
  });

  describe('isSvgFile', () => {
    it('returns true for .svg', () => {
      expect(isSvgFile('/path/icon.svg')).toBe(true);
      expect(isSvgFile('/path/logo.SVG')).toBe(true);
      expect(isSvgFile('/path/nested/dir/banner.svg')).toBe(true);
    });
    it('returns false for other formats', () => {
      expect(isSvgFile('/path/photo.jpg')).toBe(false);
      expect(isSvgFile('/path/icon.png')).toBe(false);
      expect(isSvgFile('/path/clip.mp4')).toBe(false);
      expect(isSvgFile('/path/file.svgz')).toBe(false);
    });
  });
});
