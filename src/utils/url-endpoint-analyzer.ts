// src/utils/url-endpoint-analyzer.ts
import { URL } from 'url';
import crypto from 'crypto';

export class UrlEndpointAnalyzer {
  /**
   * URLのアンカー部分のみが違うか確認する
   * @param originalUrl 元のURL
   * @param normalizedUrl アンカー削除後のURL
   */
  static isAnchorOnlyDifference(originalUrl: string, normalizedUrl: string): boolean {
    try {
      const urlObj = new URL(originalUrl);
      const normalizedUrlObj = new URL(normalizedUrl);
      
      return urlObj.hash !== '' && normalizedUrlObj.hash === '' &&
             urlObj.origin === normalizedUrlObj.origin &&
             urlObj.pathname === normalizedUrlObj.pathname &&
             urlObj.search === normalizedUrlObj.search;
    } catch (error) {
      return false;
    }
  }
  // 訪問済みエンドポイントを記録するセット
  private static visitedEndpoints = new Set<string>();

  /**
   * URLからエンドポイント識別子を抽出
   * 同じコンテンツを持つページは同じ識別子を返す
   */
  static getEndpointIdentifier(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      
      // Airbnbの部屋詳細ページの場合
      if (pathname.startsWith('/rooms/')) {
        // ルームIDを含むエンドポイント識別子
        const roomIdMatch = pathname.match(/\/rooms\/([^\/]+)/);
        if (roomIdMatch && roomIdMatch[1]) {
          return `room-${roomIdMatch[1]}`;
        }
      }
      
      // ユーザープロフィールページの場合
      if (pathname.startsWith('/users/')) {
        const userIdMatch = pathname.match(/\/users\/([^\/]+)/);
        if (userIdMatch && userIdMatch[1]) {
          return `user-${userIdMatch[1]}`;
        }
      }
      
      // 検索結果ページの場合
      if (pathname.startsWith('/s/')) {
        // 基本的な検索条件をエンドポイント識別子に含める
        const searchParams = parsedUrl.searchParams;
        const location = pathname.slice(3); // '/s/' の後の部分
        
        // 重要なパラメータを抽出
        const adults = searchParams.get('adults') || '';
        const checkIn = searchParams.get('check_in') || '';
        const checkOut = searchParams.get('check_out') || '';
        
        return `search-${location}-${adults}-${checkIn}-${checkOut}`;
      }
      
      // その他のページはパスそのものを識別子として使用
      return pathname;
      
    } catch (error) {
      console.error(`URL解析エラー: ${url}`, error);
      return url; // エラー時は元のURLを返す
    }
  }

  /**
   * URLが既に訪問済みのエンドポイントかどうかをチェック
   * 訪問済みの場合はtrue、未訪問の場合はfalseを返す
   */
  static isVisitedEndpoint(url: string): boolean {
    const endpointId = this.getEndpointIdentifier(url);
    return this.visitedEndpoints.has(endpointId);
  }

  /**
   * エンドポイントを訪問済みとしてマーク
   */
  static markEndpointAsVisited(url: string): void {
    const endpointId = this.getEndpointIdentifier(url);
    this.visitedEndpoints.add(endpointId);
  }

  /**
   * Airbnb特有のURLパターンを判定
   */
  static isAirbnbPattern(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      
      // Airbnbの一般的なパターン
      return path.startsWith('/rooms/') || 
             path.startsWith('/s/') || 
             path.startsWith('/users/') ||
             path.startsWith('/experiences/') ||
             path.startsWith('/wishlists/');
    } catch (error) {
      return false;
    }
  }

  /**
   * URLを正規化して重要でないパラメータとアンカーを削除
   */
  static normalizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      
      // アンカー（#以降）を削除
      parsedUrl.hash = '';
      
      // パスに '/rooms/' が含まれるか確認
      if (parsedUrl.pathname.includes('/rooms/')) {
        // 新しいURLオブジェクト作成
        const newUrl = new URL(`${parsedUrl.origin}${parsedUrl.pathname}`);
        
        // 重要なパラメータのみコピー
        const importantParams = ['adults', 'children', 'infants', 'pets', 'check_in', 'check_out'];
        
        importantParams.forEach(param => {
          if (parsedUrl.searchParams.has(param)) {
            newUrl.searchParams.set(param, parsedUrl.searchParams.get(param)!);
          }
        });
        
        return newUrl.href;
      }
      
      // 一般的な追跡パラメータを削除
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'source_impression_id', 'previous_page_section_name',
        'federated_search_id'
      ];
      
      trackingParams.forEach(param => {
        parsedUrl.searchParams.delete(param);
      });
      
      return parsedUrl.href;
    } catch (error) {
      console.error('URL正規化エラー:', error);
      return url;
    }
  }

  /**
   * URLからハッシュベースのファイル名を生成
   */
  static generateFileNameFromUrl(url: string): string {
    // URLのMD5ハッシュを計算
    const hash = crypto.createHash('md5').update(url).digest('hex');
    
    try {
      const parsedUrl = new URL(url);
      
      // ドメイン名を取得
      const domain = parsedUrl.hostname.replace(/\./g, '-');
      
      // ルームIDを取得（存在する場合）
      let entityId = '';
      if (parsedUrl.pathname.startsWith('/rooms/')) {
        const match = parsedUrl.pathname.match(/\/rooms\/([^\/]+)/);
        if (match && match[1]) {
          entityId = `-${match[1].substring(0, 8)}`;
        }
      }
      
      return `${domain}${entityId}-${hash.substring(0, 10)}`;
    } catch (error) {
      // パース失敗時はハッシュのみ使用
      return `page-${hash.substring(0, 16)}`;
    }
  }

  /**
   * 訪問済みエンドポイントをクリア（テスト用）
   */
  static clearVisitedEndpoints(): void {
    this.visitedEndpoints.clear();
  }
}
