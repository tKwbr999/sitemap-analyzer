// src/utils/file-utils.ts
import fs from 'fs';
import { URL } from 'url';
// path moduleは他のモジュールで使用されるか、将来の拡張のために保持

/**
 * 指定されたディレクトリを再帰的に作成します
 */
export const createDirectory = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * JSONをファイルに書き込みます
 */
export const writeJsonToFile = <T>(filePath: string, data: T): void => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

/**
 * ファイルからJSONを読み込みます
 */
export const readJsonFromFile = <T>(filePath: string): T => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent) as T;
};

/**
 * テキストをファイルに書き込みます
 */
export const writeTextToFile = (filePath: string, text: string): void => {
  fs.writeFileSync(filePath, text);
};

/**
 * URLからドメイン名を抽出し、ディレクトリ名として使用可能な形式に変換します
 */
export const getDomainDirFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // ドメイン名内のドットをハイフンに置換
    return urlObj.hostname.replace(/\./g, '-');
  } catch (error) {
    console.error(`無効なURL: ${url}`, error);

    // URLのパースに失敗した場合でも、文字列からドメイン名を推測する
    const urlWithoutProtocol = url.replace(/^(https?:\/\/)/, '');
    const possibleDomain = urlWithoutProtocol.split('/')[0];

    if (possibleDomain && possibleDomain.includes('.')) {
      // ドットを含む場合はドメイン名の可能性が高い
      return possibleDomain.replace(/\./g, '-');
    } else if (possibleDomain) {
      // ドメイン名っぽい部分があればそれを使用
      return possibleDomain;
    }

    // どうしても特定できない場合のみunknown-domainを使用
    return 'unknown-domain';
  }
};
