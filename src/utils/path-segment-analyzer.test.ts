// filepath: /Users/tk/dev/active/sitemap-analyzer/src/utils/path-segment-analyzer.test.ts
import { isLikelyId, normalizePathSegments, ID_REPLACEMENT } from './path-segment-analyzer';

describe('path-segment-analyzer', () => {
  describe('isLikelyId', () => {
    it('数字のみのパスセグメントはIDとして識別する', () => {
      expect(isLikelyId('123')).toBe(true);
      expect(isLikelyId('45678')).toBe(true);
      expect(isLikelyId('0')).toBe(true);
    });

    it('UUIDパターンはIDとして識別する', () => {
      expect(isLikelyId('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true);
      expect(isLikelyId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('16進数のハッシュはIDとして識別する', () => {
      expect(isLikelyId('a1b2c3d4e5f6')).toBe(true);
      expect(isLikelyId('123456789abcdef')).toBe(true);
      expect(isLikelyId('deadbeef')).toBe(true);
    });

    it('英数字混在の長い文字列はIDとして識別する', () => {
      expect(isLikelyId('a1b2c3d4e5')).toBe(true);
      expect(isLikelyId('product123xyz')).toBe(true);
      expect(isLikelyId('user1234admin')).toBe(true);
    });

    it('一般的な単語はIDとして識別しない', () => {
      expect(isLikelyId('about')).toBe(false);
      expect(isLikelyId('contact')).toBe(false);
      expect(isLikelyId('products')).toBe(false);
      expect(isLikelyId('blog')).toBe(false);
      expect(isLikelyId('news')).toBe(false);
      expect(isLikelyId('faq')).toBe(false);
    });

    it('短い英数字混合はIDとして識別しない', () => {
      expect(isLikelyId('a1')).toBe(false);
      expect(isLikelyId('b2c')).toBe(false);
      expect(isLikelyId('x4y')).toBe(false);
    });
  });

  describe('normalizePathSegments', () => {
    it('IDと判断されるパスセグメントを正規化する', () => {
      // 数字のみのID
      expect(normalizePathSegments(['article', '123'])).toEqual(['article', ID_REPLACEMENT]);

      // UUIDのようなID
      expect(normalizePathSegments(['product', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'])).toEqual([
        'product',
        ID_REPLACEMENT,
      ]);

      // 英数字混合のID
      expect(normalizePathSegments(['user', 'a1b2c3d4e5'])).toEqual(['user', ID_REPLACEMENT]);
    });

    it('一般的な単語は変更しない', () => {
      expect(normalizePathSegments(['about', 'company'])).toEqual(['about', 'company']);
      expect(normalizePathSegments(['products', 'category', 'electronics'])).toEqual([
        'products',
        'category',
        'electronics',
      ]);
    });

    it('空のセグメントを除外する', () => {
      expect(normalizePathSegments(['', 'blog', '', 'post'])).toEqual(['blog', 'post']);
    });

    it('複数のIDを含むパスを正しく処理する', () => {
      expect(normalizePathSegments(['article', '123', 'comment', '456'])).toEqual([
        'article',
        ID_REPLACEMENT,
        'comment',
        ID_REPLACEMENT,
      ]);
    });

    it('複合パターンを正しく処理する', () => {
      expect(
        normalizePathSegments(['products', 'electronics', '12345', 'review', 'a1b2c3d4'])
      ).toEqual(['products', 'electronics', ID_REPLACEMENT, 'review', ID_REPLACEMENT]);
    });
  });
});
