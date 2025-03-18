// src/crawler/url-filter.ts
import { URL } from 'url';

export class UrlFilter {
  // 非HTMLファイル拡張子のリスト
  private static nonHtmlExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.zip',
    '.rar',
    '.tar',
    '.gz',
    '.7z',
    '.mp3',
    '.mp4',
    '.avi',
    '.mov',
    '.wmv',
    '.flv',
    '.exe',
    '.dll',
    '.apk',
    '.dmg',
    '.css',
    '.js',
    '.json',
    '.xml',
  ];

  // 除外するパスのパターン
  private static excludedPathPatterns = [
    '/api/',
    '/static/',
    '/assets/',
    '/images/',
    '/cdn-cgi/',
    '/fonts/',
  ];

  /**
   * URLのクロール可否をチェック
   */
  static shouldCrawl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname.toLowerCase();

      // 非HTMLファイル拡張子のチェック
      if (this.nonHtmlExtensions.some((ext) => path.endsWith(ext))) {
        return false;
      }

      // 除外パスのチェック
      if (this.excludedPathPatterns.some((pattern) => path.includes(pattern))) {
        return false;
      }

      // Airbnb特有の処理：過剰なパラメータを持つURLを制限
      if (parsedUrl.hostname.includes('airbnb')) {
        // クエリパラメータが多すぎる場合は除外
        if (parsedUrl.searchParams.toString().length > 200) {
          return false;
        }

        // フラグメント識別子がページ内アンカーの場合は除外
        if (parsedUrl.hash && parsedUrl.hash !== '#site-content') {
          return false;
        }
      }

      return true;
    } catch (error) {
      // テスト実行時にはエラーログを表示しない（テスト時に無効なURLを使うのは意図的なため）
      if (process.env.NODE_ENV !== 'test') {
        console.error(`無効なURL: ${url}`);
      }
      return false;
    }
  }
}
