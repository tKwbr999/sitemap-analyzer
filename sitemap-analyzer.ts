// sitemap-analyzer.ts
import fs from 'fs';
import { URL } from 'url';

// ページ情報の型定義（screenshot-crawler.tsと同じ）
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

// サイト分析結果
interface SiteAnalysis {
  totalPages: number;
  totalScreenshots: number;
  averageLinksPerPage: number;
  maxDepth: number;
  pathsBreakdown: {
    path: string;
    count: number;
    percentage: number;
  }[];
  pagesByDepth: {
    depth: number;
    count: number;
    percentage: number;
  }[];
  topLinkedPages: {
    url: string;
    title: string;
    incomingLinks: number;
  }[];
}

class SitemapAnalyzer {
  private sitemapPath: string;
  private pageInfos: PageInfo[] = [];

  constructor(sitemapPath: string) {
    this.sitemapPath = sitemapPath;
  }

  // サイトマップ読み込み
  loadSitemap(): void {
    try {
      const sitemapJson = fs.readFileSync(this.sitemapPath, 'utf-8');
      this.pageInfos = JSON.parse(sitemapJson);
      console.log(`サイトマップを読み込みました: ${this.pageInfos.length}ページ`);
    } catch (error) {
      console.error('サイトマップの読み込みに失敗しました:', error);
      throw error;
    }
  }

  // サイト分析を実行
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

  // 分析結果をJSONとして保存
  saveAnalysis(outputPath: string): void {
    const analysis = this.analyze();
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    console.log(`分析結果を保存しました: ${outputPath}`);
  }

  // 分析結果を人間が読みやすいレポートとして保存
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

    fs.writeFileSync(outputPath, report);
    console.log(`分析レポートを生成しました: ${outputPath}`);
  }
}

// メイン関数
async function main() {
  const args = process.argv.slice(2);
  const sitemapPath = args[0] || './screenshots/sitemap.json';
  const analysisOutputPath = args[1] || './screenshots/analysis.json';
  const reportOutputPath = args[2] || './screenshots/report.md';

  try {
    const analyzer = new SitemapAnalyzer(sitemapPath);
    analyzer.loadSitemap();
    analyzer.saveAnalysis(analysisOutputPath);
    analyzer.generateReport(reportOutputPath);
  } catch (error) {
    console.error('エラー:', error);
  }
}

// エントリーポイント
if (require.main === module) {
  main().catch(console.error);
}

export { SitemapAnalyzer };
