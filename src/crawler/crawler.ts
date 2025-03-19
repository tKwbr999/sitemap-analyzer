// src/crawler/crawler.ts
import path from 'path';
import { CrawlConfig, PageInfo } from '../types';
import { BrowserManager } from './browser-manager';
import { PageProcessor } from './page-processor';
import { sleep } from '../utils/common';
import { createDirectory } from '../utils/file-utils';
import { getDomainDirFromUrl, writeJsonToFile } from '../utils/file-utils';
import { UrlEndpointAnalyzer } from '../utils/url-endpoint-analyzer';
import { UrlFilter } from './url-filter';
import { CrawlStatistics } from '../utils/crawl-statistics';

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

    this.browserManager = new BrowserManager();
    this.pageProcessor = new PageProcessor(this.browserManager);

    // 統計情報をリセット
    CrawlStatistics.reset();
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

      // URLを正規化
      const normalizedUrl = UrlEndpointAnalyzer.normalizeUrl(url);

      // 元のURLとの違いをログに出力（デバッグ用）
      if (url !== normalizedUrl) {
        // アンカー部分のみが違うかチェック
        if (UrlEndpointAnalyzer.isAnchorOnlyDifference(url, normalizedUrl)) {
          console.log(`アンカー部分のみ削除: ${url} -> ${normalizedUrl}`);
          CrawlStatistics.countSkippedAnchorUrl();
        } else {
          console.log(`URL正規化: ${url} -> ${normalizedUrl}`);
        }
      }

      // 既に訪問済みのURLはスキップ
      if (this.visitedUrls.has(normalizedUrl)) {
        // アンカー部分の違いだけでスキップされる場合は、すでにcountSkippedAnchorUrlが呼ばれている
        // 可能性があるので、そのケースではcountSkippedDuplicateUrlは呼ばない
        const isAnchorOnlyDifference = UrlEndpointAnalyzer.isAnchorOnlyDifference(
          url,
          normalizedUrl
        );

        if (!isAnchorOnlyDifference) {
          console.log(`訪問済みURLのためスキップ: ${normalizedUrl}`);
          CrawlStatistics.countSkippedDuplicateUrl();
        } else {
          console.log(`アンカー違いのみの訪問済みURLをスキップ: ${url} -> ${normalizedUrl}`);
          // countSkippedAnchorUrlはすでに呼ばれている可能性があるため、重複カウントしない
        }
        continue;
      }

      // クロールすべきURLかチェック
      if (!UrlFilter.shouldCrawl(normalizedUrl)) {
        console.log(`非HTMLコンテンツのためスキップ: ${normalizedUrl}`);
        CrawlStatistics.countSkippedNonHtmlUrl();
        continue;
      }

      // 同一エンドポイントの訪問済みチェック（AirbnbパターンのURLのみ）
      if (
        UrlEndpointAnalyzer.isAirbnbPattern(normalizedUrl) &&
        UrlEndpointAnalyzer.isVisitedEndpoint(normalizedUrl)
      ) {
        console.log(`同一エンドポイントのため処理をスキップ: ${normalizedUrl}`);
        CrawlStatistics.countSkippedDuplicateEndpoint();
        continue;
      }

      console.log(
        `[${processedPages + 1}/${this.config.maxPages}] クロール中: ${normalizedUrl} (深さ: ${depth})`
      );

      // URLを訪問済みとしてマーク
      this.visitedUrls.add(normalizedUrl);

      // エンドポイントを訪問済みとしてマーク（Airbnbパターンの場合）
      if (UrlEndpointAnalyzer.isAirbnbPattern(normalizedUrl)) {
        UrlEndpointAnalyzer.markEndpointAsVisited(normalizedUrl);
      }

      CrawlStatistics.countProcessedUrl();

      try {
        // ページを処理
        const pageInfo = await this.pageProcessor.processUrl(
          normalizedUrl,
          depth,
          this.config.outputDir,
          this.config.devices,
          this.config.includePatterns,
          this.config.excludePatterns
        );

        this.pageInfos.push(pageInfo);
        processedPages++;

        // 次の深さの処理が必要な場合、リンクをキューに追加
        if (depth < this.config.maxDepth) {
          for (const link of pageInfo.links) {
            // 正規化したURLを使用
            const normalizedLink = UrlEndpointAnalyzer.normalizeUrl(link);

            // アンカー部分のみの違いを確認
            const isAnchorOnlyDifference = UrlEndpointAnalyzer.isAnchorOnlyDifference(
              link,
              normalizedLink
            );

            // アンカー部分のみの差異がある場合、統計情報を記録
            if (isAnchorOnlyDifference) {
              CrawlStatistics.countSkippedAnchorUrl();
              console.log(`キュー追加でアンカー部分のみ削除: ${link} -> ${normalizedLink}`);
            }

            if (
              !this.visitedUrls.has(normalizedLink) &&
              UrlFilter.shouldCrawl(normalizedLink) &&
              !(
                UrlEndpointAnalyzer.isAirbnbPattern(normalizedLink) &&
                UrlEndpointAnalyzer.isVisitedEndpoint(normalizedLink)
              )
            ) {
              this.pageQueue.push({ url: normalizedLink, depth: depth + 1 });
            }
          }
        }

        // 次の深さの処理のため、遅延を入れる
        await sleep(this.config.delay);
      } catch (error) {
        console.error(`エラー (${normalizedUrl}):`, error);
      }
    }

    // サイトマップJSONの生成
    this.generateSitemap();

    // 統計情報を表示
    CrawlStatistics.printStatistics();

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
