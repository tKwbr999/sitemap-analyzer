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

    expect(UrlEndpointAnalyzer.getEndpointIdentifier(url1)).toEqual(
      UrlEndpointAnalyzer.getEndpointIdentifier(url2)
    );
  });

  test('異なるルームIDのURLは異なるエンドポイント識別子を持つ', () => {
    const url1 = 'https://www.airbnb.jp/rooms/12345?adults=2';
    const url2 = 'https://www.airbnb.jp/rooms/67890?adults=2';

    expect(UrlEndpointAnalyzer.getEndpointIdentifier(url1)).not.toEqual(
      UrlEndpointAnalyzer.getEndpointIdentifier(url2)
    );
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
    expect(UrlEndpointAnalyzer.getEndpointIdentifier(url1)).toEqual(
      UrlEndpointAnalyzer.getEndpointIdentifier(url2)
    );

    // 場所が異なるので異なる識別子
    expect(UrlEndpointAnalyzer.getEndpointIdentifier(url1)).not.toEqual(
      UrlEndpointAnalyzer.getEndpointIdentifier(url3)
    );
  });

  test('URLの正規化がトラッキングパラメータを削除する', () => {
    const url =
      'https://www.airbnb.jp/rooms/12345?adults=2&source_impression_id=123456&federated_search_id=abcdef';
    const normalizedUrl = UrlEndpointAnalyzer.normalizeUrl(url);

    expect(normalizedUrl).not.toContain('source_impression_id');
    expect(normalizedUrl).not.toContain('federated_search_id');
    expect(normalizedUrl).toContain('adults=2');
  });

  test('URLの正規化がアンカー部分を削除する', () => {
    const url = 'https://www.airbnb.jp/rooms/12345?adults=2#photos';
    const normalizedUrl = UrlEndpointAnalyzer.normalizeUrl(url);

    expect(normalizedUrl).not.toContain('#photos');
    expect(normalizedUrl).toEqual('https://www.airbnb.jp/rooms/12345?adults=2');
  });

  test('アンカー付きの検索ページURLの正規化', () => {
    const url = 'https://www.airbnb.jp/s/Tokyo?adults=2&check_in=2025-04-01#map';
    const normalizedUrl = UrlEndpointAnalyzer.normalizeUrl(url);

    expect(normalizedUrl).not.toContain('#map');
    expect(normalizedUrl).toEqual('https://www.airbnb.jp/s/Tokyo?adults=2&check_in=2025-04-01');
  });

  test('isAnchorOnlyDifferenceメソッドがアンカー部分のみの違いを検出する', () => {
    // アンカー部分のみが異なる場合
    const url1 = 'https://www.airbnb.jp/rooms/12345?adults=2#photos';
    const normalizedUrl1 = 'https://www.airbnb.jp/rooms/12345?adults=2';
    expect(UrlEndpointAnalyzer.isAnchorOnlyDifference(url1, normalizedUrl1)).toBeTruthy();

    // アンカー以外の部分も異なる場合
    const url2 = 'https://www.airbnb.jp/rooms/12345?adults=2#photos';
    const normalizedUrl2 = 'https://www.airbnb.jp/rooms/12345?adults=3';
    expect(UrlEndpointAnalyzer.isAnchorOnlyDifference(url2, normalizedUrl2)).toBeFalsy();

    // アンカーがない場合
    const url3 = 'https://www.airbnb.jp/rooms/12345?adults=2';
    const normalizedUrl3 = 'https://www.airbnb.jp/rooms/12345?adults=2';
    expect(UrlEndpointAnalyzer.isAnchorOnlyDifference(url3, normalizedUrl3)).toBeFalsy();

    // アンカーが両方にある場合
    const url4 = 'https://www.airbnb.jp/rooms/12345?adults=2#photos';
    const normalizedUrl4 = 'https://www.airbnb.jp/rooms/12345?adults=2#reviews';
    expect(UrlEndpointAnalyzer.isAnchorOnlyDifference(url4, normalizedUrl4)).toBeFalsy();

    // 正規化後にURLが異なる場合
    const url5 = 'https://www.airbnb.jp/rooms/12345?source_impression_id=123#photos';
    const normalizedUrl5 = 'https://www.airbnb.jp/rooms/12345';
    expect(UrlEndpointAnalyzer.isAnchorOnlyDifference(url5, normalizedUrl5)).toBeFalsy();
  });

  test('ハッシュベースのファイル名生成', () => {
    const url = 'https://www.airbnb.jp/rooms/12345?adults=2&check_in=2025-04-01';
    const filename = UrlEndpointAnalyzer.generateFileNameFromUrl(url);

    expect(filename).toContain('12345'); // ルームIDを含む
    expect(filename).toContain('www-airbnb-jp'); // ドメイン名を含む
    expect(filename.length).toBeLessThan(50); // 短いファイル名
  });
});
