// website-screenshot-crawler.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { createScreenshotPath } from './src/utils/screenshot-path';
import { URL } from 'url';

// デバイス設定
interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  isMobile: boolean;
  userAgent?: string;
}

// クロール設定
interface CrawlConfig {
  baseUrl: string;
  outputDir: string;
  maxDepth: number;
  maxPages: number;
  devices: DeviceConfig[];
  includePatterns: RegExp[];
  excludePatterns: RegExp[];
  delay: number;
}

// ページ情報
interface PageInfo {
  url: string;
  title: string;
  depth: number;
  links: string[];
  screenshots: {
    deviceName: string;
    path: string;
  }[];
}

class WebsiteCrawler {
  private browser: Browser | null = null;
  private visitedUrls: Set<string> = new Set();
  private pageQueue: { url: string; depth: number }[] = [];
  private pageInfos: PageInfo[] = [];
  private config: CrawlConfig;

  constructor(config: CrawlConfig) {
    this.config = config;

    // ベースURLからドメイン名を抽出
    const domainName = new URL(config.baseUrl).hostname.replace(/\./g, '-');

    // 出力ディレクトリパスを更新（screenshots ディレクトリを削除）
    this.config.outputDir = config.outputDir;

    // 出力ディレクトリの作成
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    // デバイスごとのディレクトリを作成
    for (const device of config.devices) {
      const deviceDir = path.join(this.config.outputDir, device.name);
      if (!fs.existsSync(deviceDir)) {
        fs.mkdirSync(deviceDir, { recursive: true });
      }
    }
  }

  // ブラウザの初期化
  async initialize(): Promise<void> {
    const options = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    this.browser = await puppeteer.launch(options);
    console.log('ブラウザを起動しました');
  }

  // クロール実行
  async crawl(): Promise<void> {
    if (!this.browser) {
      await this.initialize();
    }

    // 初期URLをキューに追加
    this.pageQueue.push({ url: this.config.baseUrl, depth: 0 });

    // 処理したページ数
    let processedPages = 0;

    // キューが空になるまで処理
    while (this.pageQueue.length > 0 && processedPages < this.config.maxPages) {
      const { url, depth } = this.pageQueue.shift()!;

      // 既に訪問済みのURLはスキップ
      if (this.visitedUrls.has(url)) {
        continue;
      }

      console.log(
        `[${processedPages + 1}/${this.config.maxPages}] クロール中: ${url} (深さ: ${depth})`
      );

      try {
        // ページを処理
        const pageInfo = await this.processPage(url, depth);
        this.pageInfos.push(pageInfo);
        this.visitedUrls.add(url);
        processedPages++;

        // 次の深さの処理のため、遅延を入れる
        await this.sleep(this.config.delay);
      } catch (error) {
        console.error(`エラー (${url}):`, error);
      }
    }

    // サイトマップJSONの生成
    this.generateSitemap();

    await this.close();
    console.log('クロール完了');
  }

  // ページ処理
  private async processPage(url: string, depth: number): Promise<PageInfo> {
    if (!this.browser) {
      throw new Error('ブラウザが初期化されていません');
    }

    const pageInfo: PageInfo = {
      url,
      title: '',
      depth,
      links: [],
      screenshots: [],
    };

    // 各デバイスでスクリーンショットを撮影
    for (const device of this.config.devices) {
      const page = await this.browser.newPage();

      try {
        // デバイス設定
        await page.setViewport({
          width: device.width,
          height: device.height,
          isMobile: device.isMobile,
        });

        if (device.userAgent) {
          await page.setUserAgent(device.userAgent);
        }

        // ページ読み込み
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // タイトル取得
        pageInfo.title = await page.title();

        // スクリーンショット撮影
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        const pathname = urlObj.pathname.replace(/\//g, '_') || 'index';
        const screenshotDir = createScreenshotPath(this.config.outputDir, url);
        fs.mkdirSync(screenshotDir, { recursive: true });
        const deviceShortName = device.name === 'desktop' ? 'pc' : 'sp';
        const screenshotPath = path.join(screenshotDir, `${deviceShortName}.png`);
        // 既に変更済み

        await page.screenshot({ path: screenshotPath, fullPage: true });

        pageInfo.screenshots.push({
          deviceName: device.name,
          path: screenshotPath,
        });

        // 同じドメインのリンクを収集
        if (depth < this.config.maxDepth) {
          const links = await this.extractLinks(page, url);
          pageInfo.links = links;

          // 次のクロール対象をキューに追加
          for (const link of links) {
            if (!this.visitedUrls.has(link)) {
              this.pageQueue.push({ url: link, depth: depth + 1 });
            }
          }
        }
      } catch (error) {
        console.error(`ページ処理エラー (${url}, ${device.name}):`, error);
      } finally {
        await page.close();
      }
    }

    return pageInfo;
  }

  // リンク抽出
  private async extractLinks(page: Page, baseUrl: string): Promise<string[]> {
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
      .map((link) => {
        try {
          return new URL(link, baseUrl).href;
        } catch {
          return null;
        }
      })
      .filter((link): link is string => {
        if (!link) return false;

        const linkUrl = new URL(link);

        // 同じドメインかチェック
        if (linkUrl.hostname !== baseHostname) {
          return false;
        }

        // includePatterns に一致するかチェック
        const matchesInclude =
          this.config.includePatterns.length === 0 ||
          this.config.includePatterns.some((pattern) => pattern.test(link));

        // excludePatterns に一致しないかチェック
        const matchesExclude = this.config.excludePatterns.some((pattern) => pattern.test(link));

        return matchesInclude && !matchesExclude;
      });

    // 重複を除去
    return Array.from(new Set(absoluteLinks));
  }

  // サイトマップJSON生成
  private generateSitemap(): void {
    const sitemapPath = path.join(this.config.outputDir, 'sitemap.json');
    fs.writeFileSync(sitemapPath, JSON.stringify(this.pageInfos, null, 2));
    console.log(`サイトマップを生成しました: ${sitemapPath}`);
  }

  // 遅延処理
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ブラウザを閉じる
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// メイン関数
async function main() {
  // 設定
  const config: CrawlConfig = {
    baseUrl: 'https://example.com', // クロール対象のURL
    outputDir: './screenshots', // 出力ディレクトリ
    maxDepth: 3, // 最大クロール深度
    maxPages: 50, // 最大クロールページ数
    delay: 1000, // ページ間の遅延（ミリ秒）

    // デバイス設定
    devices: [
      {
        name: 'desktop',
        width: 1920,
        height: 1080,
        isMobile: false,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      {
        name: 'smartphone',
        width: 375,
        height: 812,
        isMobile: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      },
    ],

    // URL フィルタ
    includePatterns: [
      /^https?:\/\/example\.com\//i, // example.com ドメインのみ
    ],
    excludePatterns: [
      /\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|rar|exe|dmg)$/i, // 画像や特定ファイル拡張子を除外
      /\/blog\/tag\//i, // 特定パスの除外例
      /[?&]utm_/i, // UTMパラメータ付きURLを除外
    ],
  };

  const crawler = new WebsiteCrawler(config);
  await crawler.crawl();
}

// エントリーポイント
if (require.main === module) {
  main().catch(console.error);
}

export { WebsiteCrawler, CrawlConfig, DeviceConfig };
