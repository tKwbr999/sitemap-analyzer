import path from 'path';
import { createScreenshotPath } from './screenshot-path';

describe('createScreenshotPath', () => {
  const baseOutputDir = '/Users/tk/dev/active/sitemap-analyzer';

  it('should handle root URL', () => {
    const url = 'https://www.airbnb.jp/';
    const expectedPath = path.join(baseOutputDir, 'screenshots', 'www-airbnb-jp', 'root');
    const outputDir = path.join(baseOutputDir, 'screenshots');
    expect(createScreenshotPath(outputDir, url)).toBe(expectedPath);
  });

  it('should handle URL with path', () => {
    const url = 'https://www.airbnb.jp/canmore-canada/stays/pet-friendly';
    const expectedPath = path.join(
      baseOutputDir,
      'screenshots',
      'www-airbnb-jp',
      'canmore-canada',
      'stays',
      'pet-friendly'
    );
    const outputDir = path.join(baseOutputDir, 'screenshots');
    expect(createScreenshotPath(outputDir, url)).toBe(expectedPath);
  });
});
