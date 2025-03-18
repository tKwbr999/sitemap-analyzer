import path from 'path';
import { URL } from 'url';

export const createScreenshotPath = (baseOutputDir: string, urlString: string): string => {
  // URLをパース
  const url = new URL(urlString);

  // ホスト名（ドメイン）を置換（ハイフンを使用）
  const hostname = url.hostname.replace(/\./g, '-');

  // パスをサニタイズし、ディレクトリ構造に変換
  const sanitizedPath = decodeURIComponent(url.pathname)
    .replace(/^\//, '') // 先頭のスラッシュを削除
    .replace(/\/+/g, '/') // 連続するスラッシュを1つに
    .replace(/[^a-zA-Z0-9_\-\/\s]/g, '_') // 安全でない文字を_に置換
    .replace(/\s+/g, '_') // スペースを_に置換
    .replace(/\/$/g, ''); // 末尾のスラッシュを削除

  // スクリーンショットの保存パスを生成
  return path.join(baseOutputDir, hostname, sanitizedPath || 'root');
};
