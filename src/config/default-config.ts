// src/config/default-config.ts
import { CrawlConfig } from '../types';

/**
 * デフォルトのクロール設定
 */
export const defaultConfig: CrawlConfig = {
  baseUrl: 'https://example.com',
  outputDir: './screenshots',
  maxDepth: 3,
  maxPages: 50,
  delay: 1000,

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
  includePatterns: [/^https?:\/\/example\.com\//i],
  excludePatterns: [
    /\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|rar|exe|dmg)$/i,
    /\/blog\/tag\//i,
    /[?&]utm_/i,
  ],
};
