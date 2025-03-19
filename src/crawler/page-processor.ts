// src/crawler/page-processor.ts
import { Page } from 'puppeteer';
import path from 'path';
import { URL } from 'url';
import { DeviceConfig, PageInfo } from '../types';
import { BrowserManager } from './browser-manager';
import { resolveUrl, matchesPatterns } from '../utils/url-utils';
import { PageValidator } from './page-validator';
import { LinkExtractor } from './link-extractor';
import { CrawlStatistics } from '../utils/crawl-statistics';
import { createScreenshotPath } from '../utils/screenshot-path';

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
    const links = await LinkExtractor.extractLinks(page, baseUrl);

    const baseUrlObj = new URL(baseUrl);
    const baseHostname = baseUrlObj.hostname;

    // 抽出したURLをパターンで更にフィルタリング
    return links.filter((link) =>
      matchesPatterns(link, includePatterns, excludePatterns, baseHostname)
    );
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

        // ページが有効なHTMLページか確認
        if (!(await PageValidator.isValidHtmlPage(page))) {
          console.log(`有効なHTMLページではないためスキップ: ${url} (${device.name})`);
          CrawlStatistics.countSkippedNonHtmlUrl();
          continue;
        }

        // ページに有意義なコンテンツがあるか確認
        if (!(await PageValidator.hasContent(page))) {
          console.log(`有意義なコンテンツがないためスキップ: ${url} (${device.name})`);
          CrawlStatistics.countSkippedNonHtmlUrl();
          continue;
        }

        // タイトル取得
        pageInfo.title = await page.title();

        // Airbnbモーダル対応
        await this.closeAirbnbModals(page);

        // スクリーンショット撮影前にページの読み込みを待機
        await this.waitForPageLoad(page);

        // スクリーンショット撮影 - 仕様に合わせたパス生成
        const screenshotDir = createScreenshotPath(outputDir, url);

        // デバイスタイプに応じたファイル名の設定
        let filename;
        if (device.name.toLowerCase().includes('desktop')) {
          filename = 'pc.png';
        } else {
          filename = 'sp.png';
        }

        // ディレクトリがなければ作成
        const { promises: fs } = require('fs');
        await fs.mkdir(screenshotDir, { recursive: true });

        const screenshotPath = path.join(screenshotDir, filename);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        pageInfo.screenshots.push({
          deviceName: device.name,
          path: screenshotPath,
        });

        // 同じドメインのリンクを収集
        // 最初の深さ（ホームページ）またはリンクがまだ収集されていない場合にのみリンクを抽出
        // これにより、各ページで重複したリンク抽出を防ぎつつ、初期ページでのリンク収集を確実に行います
        if (depth === 0 || pageInfo.links.length === 0) {
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

  /**
   * ページの読み込み完了を待機
   */
  private async waitForPageLoad(page: Page): Promise<void> {
    try {
      // ネットワークがほぼアイドル状態になるまで待機
      await page
        .waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 10000,
        })
        .catch(() => {
          // タイムアウトは許容
        });

      // 画像の読み込みを待機
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          // すべての画像が読み込まれたかチェック
          const images = document.querySelectorAll('img');
          let loadedImages = 0;
          let totalImages = images.length;

          // 画像が0の場合は待機不要
          if (totalImages === 0) {
            resolve();
            return;
          }

          // すべての画像の読み込みを監視
          images.forEach((img) => {
            if (img.complete) {
              loadedImages++;
              if (loadedImages === totalImages) resolve();
            } else {
              img.addEventListener('load', () => {
                loadedImages++;
                if (loadedImages === totalImages) resolve();
              });
              img.addEventListener('error', () => {
                loadedImages++;
                if (loadedImages === totalImages) resolve();
              });
            }
          });

          // タイムアウト設定（3秒後に続行）
          setTimeout(resolve, 3000);
        });
      });

      // ページの遅延コンテンツを待機（無限スクロールなど）
      await this.autoScroll(page);
    } catch (error) {
      console.error('ページ読み込み待機中にエラー:', error);
    }
  }

  /**
   * ページを自動スクロールする補助関数
   */
  private async autoScroll(page: Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const maxScrolls = 50; // 無限スクロールで無限ループを避けるための制限
        let scrollCount = 0;

        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          scrollCount++;

          if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
            clearInterval(timer);
            window.scrollTo(0, 0); // 最初の位置に戻す
            resolve();
          }
        }, 100);
      });
    });
  }

  /**
   * Airbnb特有のモーダルやポップアップを閉じる
   */
  private async closeAirbnbModals(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        // よくあるモーダル閉じるボタンのセレクタ
        const closeButtonSelectors = [
          'button[aria-label="閉じる"]',
          'button[aria-label="Close"]',
          'button[data-testid="modal-close-button"]',
          'button[aria-label="OK"]',
        ];

        // 各セレクタに対して閉じるボタンがあればクリック
        closeButtonSelectors.forEach((selector) => {
          const closeButton = document.querySelector(selector) as HTMLElement;
          if (closeButton) closeButton.click();
        });
      });
    } catch (error) {
      // エラーは無視（UI操作失敗は許容）
    }
  }
}
