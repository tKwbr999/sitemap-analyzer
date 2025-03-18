// src/utils/common.ts

/**
 * 指定したミリ秒待機する Promise を返します
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
