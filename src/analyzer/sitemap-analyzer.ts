// src/analyzer/sitemap-analyzer.ts
// path is used in other modules or for future extensions
import { URL } from 'url';
import { PageInfo, SiteAnalysis } from '../types';
import { readJsonFromFile, writeJsonToFile, writeTextToFile } from '../utils/file-utils';

export class SitemapAnalyzer {
  private sitemapPath: string;
  private pageInfos: PageInfo[] = [];

  constructor(sitemapPath: string) {
    this.sitemapPath = sitemapPath;
  }

  /**
   * サイトマップを読み込みます
   */
  loadSitemap(): void {
    try {
      this.pageInfos = readJsonFromFile<PageInfo[]>(this.sitemapPath);
      console.log(`サイトマップを読み込みました: ${this.pageInfos.length}ページ`);
    } catch (error) {
      console.error('サイトマップの読み込みに失敗しました:', error);
      throw error;
    }
  }

  /**
   * サイト分析を実行します
   */
  analyze(): SiteAnalysis {
    if (this.pageInfos.length === 0) {
      this.loadSitemap();
    }

    // 総ページ数
    const totalPages = this.pageInfos.length;

    // 総スクリーンショット数
    const totalScreenshots = this.pageInfos.reduce(
      (total, page) => total + page.screenshots.length,
      0
    );

    // 平均リンク数
    const totalLinks = this.pageInfos.reduce((total, page) => total + page.links.length, 0);
    const averageLinksPerPage = totalLinks / totalPages;

    // 最大深度
    const maxDepth = Math.max(...this.pageInfos.map((page) => page.depth));

    // パス分布の分析
    const pathCount: Record<string, number> = {};
    this.pageInfos.forEach((page) => {
      try {
        const url = new URL(page.url);
        const pathParts = url.pathname.split('/').filter(Boolean);
        const topPath = pathParts.length > 0 ? `/${pathParts[0]}` : '/';

        pathCount[topPath] = (pathCount[topPath] || 0) + 1;
      } catch (error) {
        console.error(`URLの解析エラー: ${page.url}`, error);
      }
    });

    // パス分布の整形
    const pathsBreakdown = Object.entries(pathCount)
      .map(([path, count]) => ({
        path,
        count,
        percentage: (count / totalPages) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // 深度別ページ数
    const depthCount: Record<number, number> = {};
    this.pageInfos.forEach((page) => {
      depthCount[page.depth] = (depthCount[page.depth] || 0) + 1;
    });

    // 深度別分布の整形
    const pagesByDepth = Object.entries(depthCount)
      .map(([depth, count]) => ({
        depth: parseInt(depth),
        count,
        percentage: (count / totalPages) * 100,
      }))
      .sort((a, b) => a.depth - b.depth);

    // 被リンク数の分析
    const incomingLinkCount: Record<string, number> = {};
    this.pageInfos.forEach((page) => {
      page.links.forEach((link) => {
        incomingLinkCount[link] = (incomingLinkCount[link] || 0) + 1;
      });
    });

    // よくリンクされているページ
    const topLinkedPages = Object.entries(incomingLinkCount)
      .map(([url, count]) => {
        const pageInfo = this.pageInfos.find((page) => page.url === url);
        return {
          url,
          title: pageInfo?.title || 'Unknown',
          incomingLinks: count,
        };
      })
      .sort((a, b) => b.incomingLinks - a.incomingLinks)
      .slice(0, 10);

    return {
      totalPages,
      totalScreenshots,
      averageLinksPerPage,
      maxDepth,
      pathsBreakdown,
      pagesByDepth,
      topLinkedPages,
    };
  }

  /**
   * 分析結果をJSONとして保存します
   */
  saveAnalysis(outputPath: string): void {
    const analysis = this.analyze();
    writeJsonToFile(outputPath, analysis);
    console.log(`分析結果を保存しました: ${outputPath}`);
  }

  /**
   * 分析結果を人間が読みやすいレポートとして保存します
   */
  generateReport(outputPath: string): void {
    const analysis = this.analyze();

    let report = `# ウェブサイト構造分析レポート\n\n`;
    report += `分析日時: ${new Date().toLocaleString()}\n\n`;

    report += `## 概要\n\n`;
    report += `- 総ページ数: ${analysis.totalPages}\n`;
    report += `- 総スクリーンショット数: ${analysis.totalScreenshots}\n`;
    report += `- 平均リンク数/ページ: ${analysis.averageLinksPerPage.toFixed(2)}\n`;
    report += `- 最大深度: ${analysis.maxDepth}\n\n`;

    report += `## パス分布\n\n`;
    report += `| パス | ページ数 | 割合 |\n`;
    report += `|------|---------|-------|\n`;
    analysis.pathsBreakdown.forEach((item) => {
      report += `| ${item.path} | ${item.count} | ${item.percentage.toFixed(2)}% |\n`;
    });
    report += `\n`;

    report += `## 深度別ページ数\n\n`;
    report += `| 深度 | ページ数 | 割合 |\n`;
    report += `|------|---------|-------|\n`;
    analysis.pagesByDepth.forEach((item) => {
      report += `| ${item.depth} | ${item.count} | ${item.percentage.toFixed(2)}% |\n`;
    });
    report += `\n`;

    report += `## よくリンクされているページ\n\n`;
    report += `| URL | タイトル | 被リンク数 |\n`;
    report += `|-----|---------|------------|\n`;
    analysis.topLinkedPages.forEach((page) => {
      const shortUrl = page.url.length > 60 ? page.url.substring(0, 57) + '...' : page.url;
      const shortTitle = page.title.length > 40 ? page.title.substring(0, 37) + '...' : page.title;
      report += `| ${shortUrl} | ${shortTitle} | ${page.incomingLinks} |\n`;
    });

    writeTextToFile(outputPath, report);
    console.log(`分析レポートを生成しました: ${outputPath}`);
  }
}
