// src/analyze.ts
import path from 'path';
import { SitemapAnalyzer } from './analyzer/sitemap-analyzer';

// コマンドライン引数を解析するヘルパー関数
const parseCommandLineArgs = (): { sitemapPath: string; outputDir?: string } => {
  const args = process.argv.slice(2);
  const sitemapPath = args[0] || './screenshots/sitemap.json';
  const outputDir = args[1] || path.dirname(sitemapPath);

  return { sitemapPath, outputDir };
};

// メイン関数
async function main() {
  try {
    const { sitemapPath, outputDir } = parseCommandLineArgs();
    console.log(`サイトマップパス: ${sitemapPath}`);

    const analysisOutputPath = outputDir ? path.join(outputDir, 'analysis.json') : 'analysis.json';
    const reportOutputPath = outputDir ? path.join(outputDir, 'report.md') : 'report.md';

    console.log(`分析結果の出力先: ${analysisOutputPath}`);
    console.log(`レポートの出力先: ${reportOutputPath}`);

    const analyzer = new SitemapAnalyzer(sitemapPath);
    analyzer.loadSitemap();
    analyzer.saveAnalysis(analysisOutputPath);
    analyzer.generateReport(reportOutputPath);

    console.log('分析が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみメイン関数を実行
if (require.main === module) {
  main().catch(console.error);
}
