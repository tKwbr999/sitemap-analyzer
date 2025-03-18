// src/index.ts
import { WebsiteCrawler } from './crawler/crawler';
import { defaultConfig } from './config/default-config';
import { basicConfig, blogConfig, ecommerceConfig, spaConfig } from './config/config-examples';
import { CrawlConfig } from './types';

// コマンドライン引数を解析するヘルパー関数
const parseCommandLineArgs = (): { configType: string; baseUrl?: string } => {
  const args = process.argv.slice(2);
  const configType = args[0] || 'default';
  const baseUrl = args[1];

  return { configType, baseUrl };
};

// 指定された設定タイプに基づいて設定を取得するヘルパー関数
const getConfig = (configType: string, baseUrl?: string): CrawlConfig => {
  let config: CrawlConfig;

  switch (configType) {
    case 'basic':
      config = { ...basicConfig };
      break;
    case 'ecommerce':
      config = { ...ecommerceConfig };
      break;
    case 'blog':
      config = { ...blogConfig };
      break;
    case 'spa':
      config = { ...spaConfig };
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

// スクリプトが直接実行された場合のみメイン関数を実行
if (require.main === module) {
  main().catch(console.error);
}

export { WebsiteCrawler } from './crawler/crawler';
export { SitemapAnalyzer } from './analyzer/sitemap-analyzer';
export * from './types';
export * from './config/default-config';
export * from './config/config-examples';
