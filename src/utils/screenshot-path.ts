import path from 'path';
import { URL } from 'url';

/**
 * URLからスクリーンショットパスを生成する関数
 * 形式: baseOutputDir/hostname/path1/path2/.../pathN
 * 例: /output/www-airbnb-jp/canmore-canada/stays/pet-friendly
 */
export const createScreenshotPath = (baseOutputDir: string, urlString: string): string => {
  // URLをパース
  const url = new URL(urlString);

  // ホスト名（ドメイン）を置換（ハイフンを使用）
  const hostname = url.hostname.replace(/\./g, '-');

  // パスをディレクトリ構造に変換するため、パス部分を分解
  const pathSegments = decodeURIComponent(url.pathname)
    .replace(/^\//, '') // 先頭のスラッシュを削除
    .replace(/\/+/g, '/') // 連続するスラッシュを1つに
    .replace(/\/$/, '') // 末尾のスラッシュを削除
    .split('/');

  // 安全に変換されたパスセグメント
  const safePathSegments = pathSegments
    .filter(Boolean) // 空のセグメントを除外
    .map(
      (segment) =>
        segment
          .replace(/[^a-zA-Z0-9_\-\s]/g, '_') // 安全でない文字を_に置換
          .replace(/\s+/g, '_') // スペースを_に置換
    );

  // パスがない場合の処理
  if (safePathSegments.length === 0) {
    return path.join(baseOutputDir, hostname);
  }

  return path.join(baseOutputDir, hostname, ...safePathSegments);
};
