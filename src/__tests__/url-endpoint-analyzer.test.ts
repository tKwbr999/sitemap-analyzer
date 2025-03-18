// src/__tests__/url-endpoint-analyzer.test.ts
import { UrlEndpointAnalyzer } from '../utils/url-endpoint-analyzer';

describe('UrlEndpointAnalyzer', () => {
  
  beforeEach(() => {
    // 各テスト前に訪問済みエンドポイントをクリア
    UrlEndpointAnalyzer.clearVisitedEndpoints();
  });
  
  test('同じルームIDのURLは同じエンドポイント識別子を持つ', () => {
    const url1 = 'https://www.airbnb.jp/rooms/12345?adults=2&check_in=2025-04-01';
    const url2 = 'https://www.airbnb.jp/rooms/12345?adults=1&check_in=2025-05-01';
    
    expect(UrlEndpointAnalyzer.getEndpointIdentifier(url1))
      .toEqual(UrlEndpointAnalyzer.getEndpointIdentifier(url2));
  });
  
  test('異なるルームIDのURLは異なるエンドポイント識別子を持つ', () => {
    const url1 = 'https://www.airbnb.jp/rooms/12345?adults=2';
    const url2 = 'https://www.airbnb.jp/rooms/67890?adults=2';
    
    expect(UrlEndpointAnalyzer.getEndpointIdentifier(url1))
      .not.toEqual(UrlEndpointAnalyzer.getEndpointIdentifier(url2));
  });
  
  test('訪問済みエンドポイントのチェック', () => {
    const url1 = 'https://www.airbnb.jp/rooms/12345?param1=value1';
    const url2 = 'https://www.airbnb.jp/rooms/12345?param2=value2';
    
    // まだ訪問していないのでfalse
    expect(UrlEndpointAnalyzer.isVisitedEndpoint(url1)).toBeFalsy();
    
    // エンドポイントを訪問済みとしてマーク
    UrlEndpointAnalyzer.markEndpointAsVisited(url1);
    
    // 同じエンドポイントなのでtrue
    expect(UrlEndpointAnalyzer.isVisitedEndpoint(url2)).toBeTruthy();
  });
  
  test('Airbnbパターンの検出', () => {
    expect(UrlEndpointAnalyzer.isAirbnbPattern('https://www.airbnb.jp/rooms/12345')).toBeTruthy();
    expect(UrlEndpointAnalyzer.isAirbnbPattern('https://www.airbnb.jp/s/Tokyo')).toBeTruthy();
    expect(UrlEndpointAnalyzer.isAirbnbPattern('https://www.airbnb.jp/users/12345')).toBeTruthy();
    expect(UrlEndpointAnalyzer.isAirbnbPattern('https://www.airbnb.jp/help')).toBeFalsy();
  });
  
  test('検索結果ページの識別子は検索条件を反映', () => {
    const url1 = 'https://www.airbnb.jp/s/Tokyo?adults=2&check_in=2025-04-01';
    const url2 = 'https://www.airbnb.jp/s/Tokyo?adults=2&check_in=2025-04-01&children=1';
    const url3 = 'https://www.airbnb.jp/s/Osaka?adults=2&check_in=2025-04-01';
    
    // 同じ主要条件なので同じ識別子
    expect(UrlEndpointAnalyzer.getEndpointIdentifier(url1))
      .toEqual(UrlEndpointAnalyzer.getEndpointIdentifier(url2));
    
    // 場所が異なるので異なる識別子
    expect(UrlEndpointAnalyzer.getEndpointIdentifier(url1))
      .not.toEqual(UrlEndpointAnalyzer.getEndpointIdentifier(url3));
  });
  
  test('URLの正規化がトラッキングパラメータを削除する', () => {
    const url = 'https://www.airbnb.jp/rooms/12345?adults=2&source_impression_id=123456&federated_search_id=abcdef';
    const normalizedUrl = UrlEndpointAnalyzer.normalizeUrl(url);
    
    expect(normalizedUrl).not.toContain('source_impression_id');
    expect(normalizedUrl).not.toContain('federated_search_id');
    expect(normalizedUrl).toContain('adults=2');
  });
  
  test('ハッシュベースのファイル名生成', () => {
    const url = 'https://www.airbnb.jp/rooms/12345?adults=2&check_in=2025-04-01';
    const filename = UrlEndpointAnalyzer.generateFileNameFromUrl(url);
    
    expect(filename).toContain('12345'); // ルームIDを含む
    expect(filename).toContain('www-airbnb-jp'); // ドメイン名を含む
    expect(filename.length).toBeLessThan(50); // 短いファイル名
  });
});
