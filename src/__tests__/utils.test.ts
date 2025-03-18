// src/__tests__/utils.test.ts
import { sleep } from '../utils/common';
import { getDomainDirFromUrl, createSafeFilenameFromUrl } from '../utils/url-utils';

describe('Common utilities', () => {
  test('sleep should return a Promise', () => {
    const result = sleep(100);
    expect(result instanceof Promise).toBe(true);
  });

  test('sleep should resolve after the specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(95); // Allow for small timing differences
  });
});

describe('URL utilities', () => {
  test('getDomainDirFromUrl should extract domain name and replace dots with hyphens', () => {
    expect(getDomainDirFromUrl('https://example.com')).toBe('example-com');
    expect(getDomainDirFromUrl('https://sub.example.com')).toBe('sub-example-com');
    expect(getDomainDirFromUrl('http://example.co.jp')).toBe('example-co-jp');
  });

  test('createSafeFilenameFromUrl should create a valid filename from URL', () => {
    expect(createSafeFilenameFromUrl('https://example.com')).toBe('example.com_index.png');
    expect(createSafeFilenameFromUrl('https://example.com/page')).toBe('example.com_page.png');
    expect(createSafeFilenameFromUrl('https://example.com/page?id=123')).toBe(
      'example.com_page_id_123.png'
    );
  });
});
