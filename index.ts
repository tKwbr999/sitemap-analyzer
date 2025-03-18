// index.ts
// このファイルはプロジェクトのルートエントリポイントです
import { WebsiteCrawler } from './src/crawler/crawler';
import { defaultConfig } from './src/config/default-config';
import { basicConfig, blogConfig, ecommerceConfig, spaConfig } from './src/config/config-examples';
import { CrawlConfig } from './src/types';
import { basicConfig as customBasicConfig, ecommerceConfig as customEcommerceConfig, blogConfig as customBlogConfig, spaConfig as customSpaConfig } from './config';

// コマンドライン引数を解析するヘルパー関数
const parseCommandLineArgs = (): { configType: string; baseUrl?: string } => {
  // process.argv[0]はnodeのパス、process.argv[1]は実行ファイルのパスなので、slice(2)で実際の引数を取得
  const args = process.argv.slice(2);
  // configType: 設定の種類 (basic, ecommerce, blog, spa, default)
  const configType = args[0] || 'default';
  // baseUrl: クロール対象のベースURL（オプション）
  const baseUrl = args[1];

  return { configType, baseUrl };
};

// 指定された設定タイプに基づいて設定を取得するヘルパー関数
const getConfig = (configType: string, baseUrl?: string): CrawlConfig => {
  let config: CrawlConfig;

  switch (configType) {
    case 'basic':
      // カスタム設定があれば優先的に使用
      config = { ...customBasicConfig };
      break;
    case 'ecommerce':
      config = { ...customEcommerceConfig };
      break;
    case 'blog':
      config = { ...customBlogConfig };
      break;
    case 'spa':
      config = { ...customSpaConfig };
      break;
    case 'default':
    default:
      config = { ...defaultConfig };
      break;
  }

  // ベースURLが指定されている場合は上書き
  if (baseUrl) {
    config.baseUrl = baseUrl;
  }

  return config;
};

// メイン関数
async function main() {
  try {
    const { configType, baseUrl } = parseCommandLineArgs();
    console.log(`設定タイプ: ${configType}${baseUrl ? `, ベースURL: ${baseUrl}` : ''}`);

    const config = getConfig(configType, baseUrl);
    console.log(`クロール対象: ${config.baseUrl}`);
    console.log(`出力ディレクトリ: ${config.outputDir}`);
    console.log(`最大深度: ${config.maxDepth}, 最大ページ数: ${config.maxPages}`);

    const crawler = new WebsiteCrawler(config);
    await crawler.crawl();
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// 常にメイン関数を実行するように変更
main().catch(console.error);

// エクスポート
export { WebsiteCrawler } from './src/crawler/crawler';
export { SitemapAnalyzer } from './src/analyzer/sitemap-analyzer';
export * from './src/types';
export * from './src/config/default-config';
export * from './src/config/config-examples';
