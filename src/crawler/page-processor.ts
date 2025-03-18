// src/crawler/page-processor.ts
import { Page } from 'puppeteer';
import path from 'path';
import { URL } from 'url';
import { DeviceConfig, PageInfo } from '../types';
import { BrowserManager } from './browser-manager';
import { createSafeFilenameFromUrl, matchesPatterns, resolveUrl } from '../utils/url-utils';

export class PageProcessor {
  private browserManager: BrowserManager;

  constructor(browserManager: BrowserManager) {
    this.browserManager = browserManager;
  }

  /**
   * URLからリンクを抽出します
   */
  async extractLinks(
    page: Page,
    baseUrl: string,
    includePatterns: RegExp[],
    excludePatterns: RegExp[]
  ): Promise<string[]> {
    const baseUrlObj = new URL(baseUrl);
    const baseHostname = baseUrlObj.hostname;

    // ページ内のすべてのリンクを抽出
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href'))
        .filter((href) => href !== null && href !== '') as string[];
    });

    // 絶対URLに変換し、フィルタリング
    const absoluteLinks = links
      .map((link) => resolveUrl(baseUrl, link))
      .filter((link): link is string => {
        if (!link) return false;
        return matchesPatterns(link, includePatterns, excludePatterns, baseHostname);
      });

    // 重複を除去
    return Array.from(new Set(absoluteLinks));
  }

  /**
   * 単一のURLに対して処理を行います
   */
  async processUrl(
    url: string,
    depth: number,
    outputDir: string,
    devices: DeviceConfig[],
    includePatterns: RegExp[],
    excludePatterns: RegExp[]
  ): Promise<PageInfo> {
    const pageInfo: PageInfo = {
      url,
      title: '',
      depth,
      links: [],
      screenshots: [],
    };

    // 各デバイスでスクリーンショットを撮影
    for (const device of devices) {
      const page = await this.browserManager.createPage();

      try {
        // デバイス設定
        await this.browserManager.configurePageForDevice(page, device);

        // ページ読み込み
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // タイトル取得
        pageInfo.title = await page.title();

        // スクリーンショット撮影
        const filename = createSafeFilenameFromUrl(url);
        const screenshotPath = path.join(outputDir, device.name, filename);

        await page.screenshot({ path: screenshotPath, fullPage: true });

        pageInfo.screenshots.push({
          deviceName: device.name,
          path: screenshotPath,
        });

        // 同じドメインのリンクを収集
        if (depth === 0) {
          const links = await this.extractLinks(page, url, includePatterns, excludePatterns);
          pageInfo.links = links;
        }
      } catch (error) {
        console.error(`ページ処理エラー (${url}, ${device.name}):`, error);
      } finally {
        await page.close();
      }
    }

    return pageInfo;
  }
}
