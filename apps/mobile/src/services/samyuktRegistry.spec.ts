import { resolveAssetUrl } from './samyuktRegistry';

describe('SamyuktRegistry Unit Tests', () => {
  describe('resolveAssetUrl', () => {
    it('returns empty string for empty input', () => {
      expect(resolveAssetUrl('')).toBe('');
    });

    it('returns intact HTTPS URL', () => {
      const url = 'https://example.com/icon.png';
      expect(resolveAssetUrl(url)).toBe(url);
    });

    it('resolves relative path starting with /images/', () => {
      expect(resolveAssetUrl('/images/vaultx.png')).toBe(
        'https://raw.githubusercontent.com/kachakaran6/Application-json/main/images/vaultx.png'
      );
    });

    it('resolves relative path without leading slash', () => {
      expect(resolveAssetUrl('images/trust-tracker.png')).toBe(
        'https://raw.githubusercontent.com/kachakaran6/Application-json/main/images/trust-tracker.png'
      );
    });

    it('resolves bare filename to images base', () => {
      expect(resolveAssetUrl('arrowz.png')).toBe(
        'https://raw.githubusercontent.com/kachakaran6/Application-json/main/images/arrowz.png'
      );
    });
  });
});

