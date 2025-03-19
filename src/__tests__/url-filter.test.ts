// src/__tests__/url-filter.test.ts
import { UrlFilter } from '../crawler/url-filter';
import { isLikelyId, ID_REPLACEMENT } from '../utils/path-segment-analyzer';

// テスト環境であることを明示
process.env.NODE_ENV = 'test';

// テスト実行前にURLパターンをリセット
beforeEach(() => {
  UrlFilter.resetProcessedUrlPatterns();
});

describe('UrlFilter', () => {
  test('非HTMLファイルをクロール対象から除外する', () => {
    // 画像ファイル
    expect(UrlFilter.shouldCrawl('https://example.com/image.jpg')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/photo.png')).toBeFalsy();

    // ドキュメント
    expect(UrlFilter.shouldCrawl('https://example.com/doc.pdf')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/sheet.xlsx')).toBeFalsy();

    // 静的アセット
    expect(UrlFilter.shouldCrawl('https://example.com/style.css')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/script.js')).toBeFalsy();
  });

  test('HTMLページはクロール対象として許可する', () => {
    expect(UrlFilter.shouldCrawl('https://example.com')).toBeTruthy();
    expect(UrlFilter.shouldCrawl('https://example.com/page')).toBeTruthy();
    expect(UrlFilter.shouldCrawl('https://example.com/article?id=123')).toBeTruthy();
  });

  test('除外パスを持つURLをクロール対象から除外する', () => {
    expect(UrlFilter.shouldCrawl('https://example.com/api/data')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/static/image')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/assets/logo')).toBeFalsy();
    expect(UrlFilter.shouldCrawl('https://example.com/cdn-cgi/scripts')).toBeFalsy();
  });

  test('Airbnb特有のルールでフィルタリングする', () => {
    // 長すぎるクエリパラメータを持つURLは除外
    const longQueryUrl = 'https://www.airbnb.jp/rooms/12345?' + 'a='.repeat(100);
    expect(UrlFilter.shouldCrawl(longQueryUrl)).toBeFalsy();

    // 無効なURLは除外（エラーコンソールは表示されない）
    expect(UrlFilter.shouldCrawl('invalid-url')).toBeFalsy();
  });

  describe('shouldCrawl', () => {
    it('非HTMLファイルはクロールしない', () => {
      expect(UrlFilter.shouldCrawl('https://example.com/image.jpg')).toBe(false);
      expect(UrlFilter.shouldCrawl('https://example.com/document.pdf')).toBe(false);
      expect(UrlFilter.shouldCrawl('https://example.com/stylesheet.css')).toBe(false);
    });

    it('除外パスはクロールしない', () => {
      expect(UrlFilter.shouldCrawl('https://example.com/static/image.png')).toBe(false);
      expect(UrlFilter.shouldCrawl('https://example.com/api/data')).toBe(false);
      expect(UrlFilter.shouldCrawl('https://example.com/assets/js/script.js')).toBe(false);
    });

    it('無効なURLはクロールしない', () => {
      expect(UrlFilter.shouldCrawl('invalid-url')).toBe(false);
    });

    it('HTMLページはクロール対象として許可する', () => {
      expect(UrlFilter.shouldCrawl('https://example.com/article/123')).toBe(true);
      expect(UrlFilter.shouldCrawl('https://example.com/article/456')).toBe(true);
      expect(UrlFilter.shouldCrawl('https://example.com/blog/post')).toBe(true);
    });
  });

  describe('normalizeUrlPattern', () => {
    it('IDらしきパスセグメントを正規化する', () => {
      // 数字のみのID
      expect(UrlFilter.normalizeUrlPattern('https://example.com/article/123')).toBe(
        'https://example.com/article/_id_'
      );

      // UUIDのようなID
      expect(
        UrlFilter.normalizeUrlPattern(
          'https://example.com/product/a1b2c3d4-e5f6-7890-abcd-ef1234567890'
        )
      ).toBe('https://example.com/product/_id_');

      // 英数字混合のID
      expect(UrlFilter.normalizeUrlPattern('https://example.com/user/a1b2c3d4e5')).toBe(
        'https://example.com/user/_id_'
      );

      // 通常の単語はそのまま
      expect(UrlFilter.normalizeUrlPattern('https://example.com/category/books')).toBe(
        'https://example.com/category/books'
      );

      // 複数のIDを含むパス
      expect(UrlFilter.normalizeUrlPattern('https://example.com/article/123/comment/456')).toBe(
        'https://example.com/article/_id_/comment/_id_'
      );

      // クエリパラメータは無視される
      expect(
        UrlFilter.normalizeUrlPattern('https://example.com/article/123?page=2&sort=date')
      ).toBe('https://example.com/article/_id_');
    });
  });

  describe('isProcessedUrlPattern', () => {
    beforeEach(() => {
      UrlFilter.resetProcessedUrlPatterns();
    });

    it('初めて処理するURLパターンは未処理と判定される', () => {
      expect(UrlFilter.isProcessedUrlPattern('https://example.com/article/123')).toBe(false);
    });

    it('同じパターンのURLは処理済みと判定される', () => {
      // 最初のURLは未処理
      expect(UrlFilter.isProcessedUrlPattern('https://example.com/article/123')).toBe(false);

      // 同じパターンの別のURLは処理済み
      expect(UrlFilter.isProcessedUrlPattern('https://example.com/article/456')).toBe(true);
    });

    it('異なるパターンのURLは未処理と判定される', () => {
      // 最初のURLパターン
      expect(UrlFilter.isProcessedUrlPattern('https://example.com/article/123')).toBe(false);

      // 別のパターンのURLは未処理
      expect(UrlFilter.isProcessedUrlPattern('https://example.com/blog/post')).toBe(false);
      expect(UrlFilter.isProcessedUrlPattern('https://example.com/product/book')).toBe(false);
    });

    it('異なるURLでも正規化後に同じパターンになる場合は処理済みと判定される', () => {
      // 最初のURL
      expect(UrlFilter.isProcessedUrlPattern('https://example.com/article/123')).toBe(false);

      // ID部分が異なるだけのURLは正規化後に同じパターンになるので処理済み
      expect(UrlFilter.isProcessedUrlPattern('https://example.com/article/abc123')).toBe(true);
    });
  });
});

// isLikelyId のテストは path-segment-analyzer.test.ts に移動したため削除
