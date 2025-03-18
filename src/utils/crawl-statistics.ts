// src/utils/crawl-statistics.ts
export class CrawlStatistics {
  // 総処理URL数
  private static totalUrlsProcessed = 0;
  
  // スキップされたURL数
  private static skippedDuplicateUrls = 0;
  
  // スキップされた同一エンドポイント数
  private static skippedDuplicateEndpoints = 0;
  
  // 非HTML/非対象URLのスキップ数
  private static skippedNonHtmlUrls = 0;

  /**
   * URLの処理をカウント
   */
  static countProcessedUrl(): void {
    this.totalUrlsProcessed++;
  }

  /**
   * 重複URLのスキップをカウント
   */
  static countSkippedDuplicateUrl(): void {
    this.skippedDuplicateUrls++;
  }

  /**
   * 同一エンドポイントのスキップをカウント
   */
  static countSkippedDuplicateEndpoint(): void {
    this.skippedDuplicateEndpoints++;
  }

  /**
   * 非HTMLコンテンツのスキップをカウント
   */
  static countSkippedNonHtmlUrl(): void {
    this.skippedNonHtmlUrls++;
  }

  /**
   * 統計情報を表示
   */
  static printStatistics(): void {
    console.log('\n--- クロール統計 ---');
    console.log(`処理URL数: ${this.totalUrlsProcessed}`);
    console.log(`重複URLスキップ数: ${this.skippedDuplicateUrls}`);
    console.log(`同一エンドポイントスキップ数: ${this.skippedDuplicateEndpoints}`);
    console.log(`非HTMLコンテンツスキップ数: ${this.skippedNonHtmlUrls}`);
    console.log(`効率化率: ${this.calculateEfficiencyRate().toFixed(2)}%`);
    console.log('-------------------');
  }

  /**
   * 効率化率を計算
   * (スキップされたURL数 / 総URL数) * 100
   */
  private static calculateEfficiencyRate(): number {
    const totalUrls = this.totalUrlsProcessed + 
                      this.skippedDuplicateUrls + 
                      this.skippedDuplicateEndpoints + 
                      this.skippedNonHtmlUrls;
    
    if (totalUrls === 0) return 0;
    
    const skippedUrls = this.skippedDuplicateUrls + 
                         this.skippedDuplicateEndpoints + 
                         this.skippedNonHtmlUrls;
    
    return (skippedUrls / totalUrls) * 100;
  }

  /**
   * 統計情報をリセット
   */
  static reset(): void {
    this.totalUrlsProcessed = 0;
    this.skippedDuplicateUrls = 0;
    this.skippedDuplicateEndpoints = 0;
    this.skippedNonHtmlUrls = 0;
  }
}
