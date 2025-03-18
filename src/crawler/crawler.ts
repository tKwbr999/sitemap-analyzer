// src/crawler/crawler.ts
import path from 'path';
import { CrawlConfig, PageInfo } from '../types';
import { BrowserManager } from './browser-manager';
import { PageProcessor } from './page-processor';
import { sleep } from '../utils/common';
import { createDirectory } from '../utils/file-utils';
import { getDomainDirFromUrl, writeJsonToFile } from '../utils/file-utils';

export class WebsiteCrawler {
  private browserManager: BrowserManager;
  private pageProcessor: PageProcessor;
  private visitedUrls: Set<string> = new Set();
  private pageQueue: { url: string; depth: number }[] = [];
  private pageInfos: PageInfo[] = [];
  private config: CrawlConfig;

  constructor(config: CrawlConfig) {
    // ベースURLからドメイン名を抽出
    const domainName = getDomainDirFromUrl(config.baseUrl);

    // 出力ディレクトリパスを更新
    this.config = {
      ...config,
      outputDir: path.join(config.outputDir, domainName),
    };

    // 出力ディレクトリの作成
    createDirectory(this.config.outputDir);

    // デバイスごとのディレクトリを作成
    for (const device of config.devices) {
      const deviceDir = path.join(this.config.outputDir, device.name);
      createDirectory(deviceDir);
    }

    this.browserManager = new BrowserManager();
    this.pageProcessor = new PageProcessor(this.browserManager);
  }

  /**
   * クロールを実行します
   */
  async crawl(): Promise<void> {
    await this.browserManager.initialize();

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
        const pageInfo = await this.pageProcessor.processUrl(
          url,
          depth,
          this.config.outputDir,
          this.config.devices,
          this.config.includePatterns,
          this.config.excludePatterns
        );

        this.pageInfos.push(pageInfo);
        this.visitedUrls.add(url);
        processedPages++;

        // 次の深さの処理が必要な場合、リンクをキューに追加
        if (depth < this.config.maxDepth) {
          for (const link of pageInfo.links) {
            if (!this.visitedUrls.has(link)) {
              this.pageQueue.push({ url: link, depth: depth + 1 });
            }
          }
        }

        // 次の深さの処理のため、遅延を入れる
        await sleep(this.config.delay);
      } catch (error) {
        console.error(`エラー (${url}):`, error);
      }
    }

    // サイトマップJSONの生成
    this.generateSitemap();

    await this.browserManager.close();
    console.log('クロール完了');
  }

  /**
   * サイトマップJSONを生成します
   */
  private generateSitemap(): void {
    const sitemapPath = path.join(this.config.outputDir, 'sitemap.json');
    writeJsonToFile(sitemapPath, this.pageInfos);
    console.log(`サイトマップを生成しました: ${sitemapPath}`);
  }
}
