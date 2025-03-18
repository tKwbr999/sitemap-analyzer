// src/__tests__/url-filter.test.ts
import { UrlFilter } from '../crawler/url-filter';

// テスト環境であることを明示
process.env.NODE_ENV = 'test';

describe('UrlFilter', () => {
  test('非HTMLファイルをクロール対象から除外する', () => {
    // 画像ファイル
    expect(UrlFilter.shouldCrawl('https://example.com/image.jpg')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/photo.png')).toBeFalsy();
    
    // ドキュメント
    expect(UrlFilter.shouldCrawl('https://example.com/doc.pdf')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/sheet.xlsx')).toBeFalsy();
    
    // 静的アセット
    expect(UrlFilter.shouldCrawl('https://example.com/style.css')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/script.js')).toBeFalsy();
  });
  
  test('HTMLページはクロール対象として許可する', () => {
    expect(UrlFilter.shouldCrawl('https://example.com')).toBeTruthy();
    expect(UrlFilter.shouldCrawl('https://example.com/page')).toBeTruthy();
    expect(UrlFilter.shouldCrawl('https://example.com/article?id=123')).toBeTruthy();
  });
  
  test('除外パスを持つURLをクロール対象から除外する', () => {
    expect(UrlFilter.shouldCrawl('https://example.com/api/data')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/static/image')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/assets/logo')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/cdn-cgi/scripts')).toBeFalsy();
  });
  
  test('Airbnb特有のルールでフィルタリングする', () => {
    // 長すぎるクエリパラメータを持つURLは除外
    const longQueryUrl = 'https://www.airbnb.jp/rooms/12345?' + 'a='.repeat(100);
    expect(UrlFilter.shouldCrawl(longQueryUrl)).toBeFalsy();
    
    // 無効なURLは除外（エラーコンソールは表示されない）
    expect(UrlFilter.shouldCrawl('invalid-url')).toBeFalsy();
  });
});
