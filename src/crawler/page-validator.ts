// src/crawler/page-validator.ts
import { Page } from 'puppeteer';

export class PageValidator {
  /**
   * ページが有効なHTML構造を持っているか確認
   */
  static async isValidHtmlPage(page: Page): Promise<boolean> {
    try {
      // HTML標準タグの存在確認
      const structure = await page.evaluate(() => {
        return {
          hasHtml: !!document.querySelector('html'),
          hasHead: !!document.querySelector('head'),
          hasBody: !!document.querySelector('body'),
          contentType: document.contentType || 'unknown',
        };
      });

      // 基本HTML構造チェック
      if (!structure.hasHtml || !structure.hasHead || !structure.hasBody) {
        console.log(
          `無効なHTML構造 (${page.url()}): html=${structure.hasHtml}, head=${structure.hasHead}, body=${structure.hasBody}`
        );
        return false;
      }

      // コンテンツタイプチェック
      if (structure.contentType !== 'text/html' && !structure.contentType.includes('html')) {
        console.log(`非HTMLコンテンツ (${page.url()}): ${structure.contentType}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`ページ検証中にエラー (${page.url()}):`, error);
      return false;
    }
  }

  /**
   * ページにコンテンツがあるか確認（空ページではないか）
   */
  static async hasContent(page: Page): Promise<boolean> {
    try {
      const contentInfo = await page.evaluate(() => {
        const body = document.body;
        return {
          // 主要なコンテンツ要素が存在するか
          hasMainElement: !!document.querySelector(
            'main, article, .content, #content, [role="main"]'
          ),
          // テキストコンテンツの量をチェック
          textLength: body.innerText.trim().length,
          // インタラクティブ要素の数
          linkCount: document.querySelectorAll('a[href]').length,
          buttonCount: document.querySelectorAll('button, [role="button"]').length,
        };
      });

      // コンテンツがほぼないページは除外
      if (
        contentInfo.textLength < 50 &&
        !contentInfo.hasMainElement &&
        contentInfo.linkCount < 2 &&
        contentInfo.buttonCount < 2
      ) {
        console.log(
          `コンテンツが不十分 (${page.url()}): テキスト長=${contentInfo.textLength}, リンク数=${contentInfo.linkCount}`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(`コンテンツ検証中にエラー (${page.url()}):`, error);
      return false;
    }
  }
}
