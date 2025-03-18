import path from 'path';
import { createScreenshotPath } from './screenshot-path';

describe('createScreenshotPath', () => {
  const baseOutputDir = '/Users/tk/dev/active/sitemap-analyzer';

  it('should handle root URL', () => {
    const url = 'https://www.airbnb.jp/';
    const expectedPath = path.join(baseOutputDir, 'www-airbnb-jp');
    expect(createScreenshotPath(baseOutputDir, url)).toBe(expectedPath);
  });

  it('should handle URL with path', () => {
    const url = 'https://www.airbnb.jp/canmore-canada/stays/pet-friendly';
    const expectedPath = path.join(
      baseOutputDir,
      'www-airbnb-jp',
      'canmore-canada',
      'stays',
      'pet-friendly'
    );
    expect(createScreenshotPath(baseOutputDir, url)).toBe(expectedPath);
  });

  it('should sanitize special characters in URL', () => {
    const url = 'https://example.com/path/with spaces&special@chars';
    const result = createScreenshotPath(baseOutputDir, url);
    expect(result).toBe(
      path.join(baseOutputDir, 'example-com', 'path', 'with_spaces_special_chars')
    );
  });

  it('should handle multiple consecutive slashes', () => {
    const url = 'https://example.com///multiple///slashes///';
    const result = createScreenshotPath(baseOutputDir, url);
    expect(result).toBe(path.join(baseOutputDir, 'example-com', 'multiple', 'slashes'));
  });
});
