// src/crawler/url-filter.ts
import { URL } from 'url';
import { isLikelyId, ID_REPLACEMENT, normalizePathSegments } from '../utils/path-segment-analyzer';

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

  // 処理済みのURLパターン保存用Set
  private static processedUrlPatterns = new Set<string>();

  /**
   * URLをパターン化する
   * IDらしきパス部分を一般化して、類似URLを同一視する
   */
  static normalizeUrlPattern(urlString: string): string {
    try {
      const url = new URL(urlString);

      // パスセグメントを分解して処理
      const pathSegments = url.pathname.split('/').filter((segment) => segment.length > 0);

      // 正規化されたパスセグメントを取得
      const normalizedSegments = normalizePathSegments(pathSegments);

      // 正規化されたパスを生成
      const normalizedPath = '/' + normalizedSegments.join('/');

      // 正規化されたURLを返す（クエリパラメータは除外）
      return `${url.protocol}//${url.hostname}${normalizedPath}`;
    } catch (error) {
      return urlString;
    }
  }

  /**
   * URLパターンが既に処理済みかチェックし、処理済みならtrueを返す
   * 未処理の場合はパターン登録してfalseを返す
   */
  static isProcessedUrlPattern(urlString: string): boolean {
    const urlPattern = this.normalizeUrlPattern(urlString);

    // 同じパターンのURLが既に処理済みの場合
    if (this.processedUrlPatterns.has(urlPattern)) {
      return true;
    }

    // 処理済みパターンに追加
    this.processedUrlPatterns.add(urlPattern);
    return false;
  }

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

  /**
   * URLパターンの処理履歴をリセット
   * テストやリクロール用
   */
  static resetProcessedUrlPatterns(): void {
    this.processedUrlPatterns.clear();
  }
}
