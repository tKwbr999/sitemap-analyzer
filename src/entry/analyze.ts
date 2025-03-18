// src/entry/analyze.ts
// サイトマップ分析用のエントリーポイント
import { SitemapAnalyzer } from '../analyzer/sitemap-analyzer';

/**
 * メイン関数
 */
async function main() {
  const args = process.argv.slice(2);
  const sitemapPath = args[0] || './screenshots/sitemap.json';
  const analysisOutputPath = args[1] || './screenshots/analysis.json';
  const reportOutputPath = args[2] || './screenshots/report.md';

  try {
    console.log(`サイトマップファイル: ${sitemapPath}`);
    console.log(`解析結果出力先: ${analysisOutputPath}`);
    console.log(`レポート出力先: ${reportOutputPath}`);

    const analyzer = new SitemapAnalyzer(sitemapPath);
    analyzer.loadSitemap();
    analyzer.saveAnalysis(analysisOutputPath);
    analyzer.generateReport(reportOutputPath);
  } catch (error) {
    console.error('エラー:', error);
    process.exit(1);
  }
}

// エントリーポイント
if (require.main === module) {
  main().catch(console.error);
}

export { SitemapAnalyzer } from '../analyzer/sitemap-analyzer';
