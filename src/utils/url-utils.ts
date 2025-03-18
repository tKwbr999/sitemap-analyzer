// src/utils/url-utils.ts
import { URL } from 'url';

/**
 * URLから安全なファイル名を作成します
 */
export const createSafeFilenameFromUrl = (url: string): string => {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;
  let pathname = urlObj.pathname;
  if (pathname === '/') {
    pathname = 'index';
  } else {
    pathname = pathname.replace(/\//g, '_');
  }
  pathname = pathname.replace(/^_/, ''); // Remove leading underscore
  const search = urlObj.search.replace(/[?&=]/g, '_');

  return `${hostname}${pathname}${search}.png`;
};

/**
 * ドメイン名をURLから抽出し、安全なディレクトリ名に変換します
 */
export const getDomainDirFromUrl = (url: string): string => {
  const hostname = new URL(url).hostname;
  return hostname.replace(/\./g, '-');
};

/**
 * 相対URLを絶対URLに変換します
 */
export const resolveUrl = (baseUrl: string, link: string): string | null => {
  try {
    return new URL(link, baseUrl).href;
  } catch {
    return null;
  }
};

/**
 * 指定されたURLがパターンに一致するかをチェックします
 */
export const matchesPatterns = (
  url: string,
  includePatterns: RegExp[],
  excludePatterns: RegExp[],
  baseHostname: string
): boolean => {
  try {
    const urlObj = new URL(url);

    // 同じドメインかチェック
    if (urlObj.hostname !== baseHostname) {
      return false;
    }

    // includePatterns に一致するかチェック
    const matchesInclude =
      includePatterns.length === 0 || includePatterns.some((pattern) => pattern.test(url));

    // excludePatterns に一致しないかチェック
    const matchesExclude = excludePatterns.some((pattern) => pattern.test(url));

    return matchesInclude && !matchesExclude;
  } catch {
    return false;
  }
};
