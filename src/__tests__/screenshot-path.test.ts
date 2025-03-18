import path from 'path';
import { createScreenshotPath } from '../utils/screenshot-path';

describe('createScreenshotPath', () => {
  const baseOutputDir = '/project/sitemap-analyzer';

  it('should handle root URL correctly', () => {
    const url = 'https://www.airbnb.jp/';
    const result = createScreenshotPath(baseOutputDir, url);
    expect(result).toBe(path.join(baseOutputDir, 'www-airbnb-jp'));
  });

  it('should handle complex URL path', () => {
    const url = 'https://www.airbnb.jp/canmore-canada/stays/pet-friendly';
    const result = createScreenshotPath(baseOutputDir, url);
    expect(result).toBe(
      path.join(baseOutputDir, 'www-airbnb-jp', 'canmore-canada', 'stays', 'pet-friendly')
    );
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

  it('should properly format path for screenshot directory structure', () => {
    const outputDir = '/output';
    const url = 'https://www.airbnb.jp/canmore-canada/stays/pet-friendly';
    const result = createScreenshotPath(outputDir, url);
    expect(result).toBe(
      path.join(outputDir, 'www-airbnb-jp', 'canmore-canada', 'stays', 'pet-friendly')
    );
  });
});
