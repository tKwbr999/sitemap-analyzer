// src/crawler/link-extractor.ts
import { Page } from 'puppeteer';
import { URL } from 'url';
import { UrlEndpointAnalyzer } from '../utils/url-endpoint-analyzer';
import { UrlFilter } from './url-filter';

export class LinkExtractor {
  /**
   * ページからリンクを抽出する
   */
  static async extractLinks(page: Page, baseUrl: string): Promise<string[]> {
    try {
      const baseUrlObj = new URL(baseUrl);
      const baseHostname = baseUrlObj.hostname;
      
      // リンクとボタン要素からURLを抽出
      const urls = await page.evaluate(() => {
        const results: string[] = [];
        
        // aタグ（リンク）から取得
        document.querySelectorAll('a[href]').forEach(element => {
          const href = element.getAttribute('href');
          if (href && !href.startsWith('javascript:')) {
            results.push(href);
          }
        });
        
        // ボタンでクリック可能なもの（role="button"またはbutton要素）から取得
        document.querySelectorAll('button[data-href], [role="button"][data-href]').forEach(element => {
          const dataHref = element.getAttribute('data-href');
          if (dataHref && !dataHref.startsWith('javascript:')) {
            results.push(dataHref);
          }
        });
        
        return results;
      });
      
      // 抽出したURLを処理
      const validUrls = urls
        .filter(url => url && url.trim().length > 0)
        .map(url => {
          try {
            // 相対URLを絶対URLに変換
            return new URL(url, baseUrl).href;
          } catch (error) {
            return null;
          }
        })
        .filter((url): url is string => url !== null)
        // 同一ドメインのURLのみに制限
        .filter(url => {
          try {
            const urlObj = new URL(url);
            return urlObj.hostname === baseHostname;
          } catch (error) {
            return false;
          }
        })
        // 非HTMLファイルを除外
        .filter(url => UrlFilter.shouldCrawl(url))
        // 正規化してトラッキングパラメータを削除
        .map(url => UrlEndpointAnalyzer.normalizeUrl(url));
      
      // 重複を除去して返す
      return Array.from(new Set(validUrls));
    } catch (error) {
      console.error(`リンク抽出中にエラー (${page.url()}):`, error);
      return [];
    }
  }
}
