// filepath: /Users/tk/dev/active/sitemap-analyzer/src/utils/path-segment-analyzer.ts
/**
 * パスセグメントの分析機能を提供するモジュール
 * URLパスのセグメントがIDかどうかを判定するなど、パス分析に関連する機能を提供する
 */

/**
 * パスセグメントがIDかどうかを判定する関数
 * 次の場合はIDとみなす:
 * 1. 数字のみで構成されている
 * 2. UUIDの形式に一致する
 * 3. 16進数のハッシュと思われる文字列
 * 4. 英数字が混在し、一般的な単語でない長い文字列
 *
 * @param segment 検査対象のパスセグメント
 * @returns IDらしい場合はtrue、そうでない場合はfalse
 */
export const isLikelyId = (segment: string): boolean => {
  // 数字のみの場合
  if (/^\d+$/.test(segment)) {
    return true;
  }

  // UUIDパターン
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return true;
  }

  // 16進数のハッシュと思われる文字列
  if (/^[0-9a-f]{8,}$/i.test(segment)) {
    return true;
  }

  // 英数字混在で一般的な単語と考えにくい長さの文字列
  // (例: "a1b2c3d4"のような英数字が交互になっているパターン)
  if (
    /^[a-z0-9]+$/i.test(segment) &&
    /[a-z]/i.test(segment) &&
    /\d/.test(segment) &&
    segment.length >= 6
  ) {
    return true;
  }

  return false;
};

/**
 * パスセグメントをIDセグメントとして扱う場合の置換文字列
 */
export const ID_REPLACEMENT = '_id_';

/**
 * URLパスのパターン化
 * IDと判断されるセグメントを標準化した形式に置換する
 *
 * @param pathSegments URLのパスセグメント配列
 * @returns 標準化されたパスセグメント配列
 */
export const normalizePathSegments = (pathSegments: string[]): string[] => {
  return pathSegments
    .filter((segment) => segment.length > 0)
    .map((segment) => (isLikelyId(segment) ? ID_REPLACEMENT : segment));
};
