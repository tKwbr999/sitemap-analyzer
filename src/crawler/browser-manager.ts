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
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    this.browser = await puppeteer.launch(options);
    console.log('ブラウザを起動しました');
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

    return await this.browser.newPage();
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
