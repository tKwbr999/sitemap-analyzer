// src/types/index.ts
// Page type is used by other modules in the project

// デバイス設定
export interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  isMobile: boolean;
  userAgent?: string;
}

// クロール設定
export interface CrawlConfig {
  baseUrl: string;
  outputDir: string;
  maxDepth: number;
  maxPages: number;
  devices: DeviceConfig[];
  includePatterns: RegExp[];
  excludePatterns: RegExp[];
  delay: number;
}

// ページ情報
export interface PageInfo {
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
export interface SiteAnalysis {
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
