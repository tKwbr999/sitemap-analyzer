// src/config/config-examples.ts
import { CrawlConfig } from '../types';

// 基本設定例
export const basicConfig: CrawlConfig = {
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
export const ecommerceConfig: CrawlConfig = {
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
export const blogConfig: CrawlConfig = {
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

// SPAサイト向け設定例
export const spaConfig: CrawlConfig = {
  baseUrl: 'https://example-spa.com',
  outputDir: './screenshots',
  maxDepth: 2,
  maxPages: 30,
  delay: 5000, // SPAの場合は長めの遅延が必要
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
  includePatterns: [/^https?:\/\/example-spa\.com\//i],
  excludePatterns: [/\/login/i, /\/profile/i],
};
