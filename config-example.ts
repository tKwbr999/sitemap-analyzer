// config-example.ts
import { WebsiteCrawler, CrawlConfig } from './website-screenshot-crawler';

// 基本設定例
const basicConfig: CrawlConfig = {
  baseUrl: 'https://example.com',
  outputDir: './screenshots',
  maxDepth: 2,
  maxPages: 20,
  delay: 1500,
  devices: [
    {
      name: 'desktop',
      width: 1920,
      height: 1080,
      isMobile: false,
    },
    {
      name: 'smartphone',
      width: 375,
      height: 812,
      isMobile: true,
    },
  ],
  includePatterns: [/^https?:\/\/example\.com\//i],
  excludePatterns: [/\.(jpg|jpeg|png|gif|pdf|zip)$/i, /\/login/i, /\/admin/i, /\?page=/i],
};

// Eコマースサイト向け設定例
const ecommerceConfig: CrawlConfig = {
  baseUrl: 'https://example-shop.com',
  outputDir: './screenshots',
  maxDepth: 3,
  maxPages: 50,
  delay: 2000,
  devices: [
    {
      name: 'desktop',
      width: 1920,
      height: 1080,
      isMobile: false,
    },
    {
      name: 'tablet',
      width: 768,
      height: 1024,
      isMobile: true,
    },
    {
      name: 'smartphone',
      width: 375,
      height: 812,
      isMobile: true,
    },
  ],
  includePatterns: [/^https?:\/\/example-shop\.com\//i, /\/products\//i, /\/categories\//i],
  excludePatterns: [/\/cart/i, /\/checkout/i, /\/account/i, /\?sort=/i, /\?filter=/i],
};

// ブログサイト向け設定例
const blogConfig: CrawlConfig = {
  baseUrl: 'https://example-blog.com',
  outputDir: './screenshots',
  maxDepth: 2,
  maxPages: 30,
  delay: 1000,
  devices: [
    {
      name: 'desktop',
      width: 1920,
      height: 1080,
      isMobile: false,
    },
    {
      name: 'smartphone',
      width: 375,
      height: 812,
      isMobile: true,
    },
  ],
  includePatterns: [/^https?:\/\/example-blog\.com\//i, /\/posts\//i, /\/categories\//i],
  excludePatterns: [/\/author\//i, /\/tag\//i, /\/page\/[2-9]/i, /\?comment=/i],
};

// 使用例
/*async function runCrawlers() {
  // 基本設定での実行
  console.log('基本設定でのクロール開始');
  const basicCrawler = new WebsiteCrawler(basicConfig);
  await basicCrawler.crawl();

  // Eコマース設定での実行
  console.log('Eコマース設定でのクロール開始');
  const ecommerceCrawler = new WebsiteCrawler(ecommerceConfig);
  await ecommerceCrawler.crawl();

  // ブログ設定での実行
  console.log('ブログ設定でのクロール開始');
  const blogCrawler = new WebsiteCrawler(blogConfig);
  await blogCrawler.crawl();
}
*/

// CLI引数でどの設定を使うか選択
async function main() {
  const args = process.argv.slice(2);
  const configType = args[0] || 'basic';

  switch (configType) {
    case 'basic':
      const basicCrawler = new WebsiteCrawler(basicConfig);
      await basicCrawler.crawl();
      break;
    case 'ecommerce':
      const ecommerceCrawler = new WebsiteCrawler(ecommerceConfig);
      await ecommerceCrawler.crawl();
      break;
    case 'blog':
      const blogCrawler = new WebsiteCrawler(blogConfig);
      await blogCrawler.crawl();
      break;
    default:
      console.error('不明な設定タイプです。basic, ecommerce, blog のいずれかを指定してください。');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
