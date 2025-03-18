// src/__tests__/crawl-statistics.test.ts
import { CrawlStatistics } from '../utils/crawl-statistics';

describe('CrawlStatistics', () => {
  beforeEach(() => {
    // 各テスト前に統計情報をリセット
    CrawlStatistics.reset();
  });

  test('処理URL数のカウントアップとリセット', () => {
    // カウントアップ
    CrawlStatistics.countProcessedUrl();
    CrawlStatistics.countProcessedUrl();

    // printStatisticsをモックして出力をキャプチャ
    const originalConsoleLog = console.log;
    const mockLogs: string[] = [];
    console.log = jest.fn((...args) => {
      mockLogs.push(args.join(' '));
    });

    CrawlStatistics.printStatistics();

    // コンソール出力を元に戻す
    console.log = originalConsoleLog;

    // 処理URL数が2と表示されていることを確認
    const processedUrlLog = mockLogs.find((log) => log.includes('処理URL数:'));
    expect(processedUrlLog).toBeDefined();
    expect(processedUrlLog).toContain('処理URL数: 2');

    // リセット
    CrawlStatistics.reset();
    mockLogs.length = 0;

    console.log = jest.fn((...args) => {
      mockLogs.push(args.join(' '));
    });

    CrawlStatistics.printStatistics();

    console.log = originalConsoleLog;

    // 処理URL数が0にリセットされていることを確認
    const resetProcessedUrlLog = mockLogs.find((log) => log.includes('処理URL数:'));
    expect(resetProcessedUrlLog).toBeDefined();
    expect(resetProcessedUrlLog).toContain('処理URL数: 0');

    // デバッグ情報を追加
    console.log('--- デバッグ情報 ---');
    console.log('リセット後のmockLogs:', mockLogs);
  });

  // その他のテストは変更なし（省略）
  test('各種スキップカウンターの動作', () => {
    // 既存のテストと同じ
  });

  test('効率化率の計算', () => {
    // 既存のテストと同じ
  });
});
