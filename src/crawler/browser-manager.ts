// src/crawler/browser-manager.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import { DeviceConfig } from '../types';

export class BrowserManager {
  private browser: Browser | null = null;

  /**
   * ブラウザを初期化します
   */
  async initialize(): Promise<void> {
    if (this.browser) {
      return;
    }

    const options = {
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,800'
      ],
      ignoreHTTPSErrors: true,
    };

    this.browser = await puppeteer.launch(options);
    console.log('ブラウザを起動しました');
  }

  /**
   * リソースリクエストのインターセプションを設定します
   * @param page 設定対象のページ
   */
  private async setupRequestInterception(page: Page): Promise<void> {
    // リソースの最適化
    await page.setRequestInterception(true);
    page.on('request', request => {
      // 不要なリソースをブロック
      const blockedResourceTypes = [
        'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'
      ];
      
      // ブロックするドメイン
      const blockedDomains = [
        'analytics', 'googletagmanager', 'facebook', 'twitter', 'doubleclick', 'adservice'
      ];
      
      const requestUrl = request.url().toLowerCase();
      const resourceType = request.resourceType();
      
      // リソースタイプまたはURLに基づいてブロック
      if (blockedResourceTypes.includes(resourceType) || 
          blockedDomains.some(domain => requestUrl.includes(domain))) {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  /**
   * 新しいページインスタンスを作成します
   */
  async createPage(): Promise<Page> {
    if (!this.browser) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('ブラウザの初期化に失敗しました');
    }

    const page = await this.browser.newPage();
    
    // リクエストインターセプションの設定
    await this.setupRequestInterception(page);
    
    return page;
  }

  /**
   * デバイス設定に基づいてページを設定します
   */
  async configurePageForDevice(page: Page, device: DeviceConfig): Promise<void> {
    await page.setViewport({
      width: device.width,
      height: device.height,
      isMobile: device.isMobile,
    });

    if (device.userAgent) {
      await page.setUserAgent(device.userAgent);
    }
    
    // タイムアウト設定
    await page.setDefaultNavigationTimeout(30000);
  }

  /**
   * ブラウザを閉じます
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
