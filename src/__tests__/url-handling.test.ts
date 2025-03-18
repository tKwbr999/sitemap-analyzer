// src/__tests__/url-handling.test.ts
import { UrlEndpointAnalyzer } from '../utils/url-endpoint-analyzer';

/**
 * これらのテストでは、アンカー付きURLの正規化処理と重複判定ロジックを検証します。
 * 実際のクローラー動作は複雑なため、URL処理部分のみテスト対象とします。
 */
describe('URL処理のテスト', () => {
  test('同じURLでもアンカーが異なる場合は同一URL判定される', () => {
    const url1 = 'https://www.airbnb.jp/rooms/12345?adults=2';
    const url2 = 'https://www.airbnb.jp/rooms/12345?adults=2#photos';
    const url3 = 'https://www.airbnb.jp/rooms/12345?adults=2#reviews';

    // 正規化した結果が同じになることを確認
    const normalizedUrl1 = UrlEndpointAnalyzer.normalizeUrl(url1);
    const normalizedUrl2 = UrlEndpointAnalyzer.normalizeUrl(url2);
    const normalizedUrl3 = UrlEndpointAnalyzer.normalizeUrl(url3);

    expect(normalizedUrl1).toEqual(normalizedUrl2);
    expect(normalizedUrl2).toEqual(normalizedUrl3);
    expect(normalizedUrl1).toEqual('https://www.airbnb.jp/rooms/12345?adults=2');
  });

  test('アンカーの有無を正しく判定する', () => {
    const urlWithAnchor = 'https://www.airbnb.jp/rooms/12345?adults=2#photos';
    const urlWithoutAnchor = 'https://www.airbnb.jp/rooms/12345?adults=2';

    // アンカー付きURLの場合
    expect(new URL(urlWithAnchor).hash).toBe('#photos');
    expect(urlWithAnchor.includes('#')).toBe(true);

    // アンカーなしURLの場合
    expect(new URL(urlWithoutAnchor).hash).toBe('');
    expect(urlWithoutAnchor.includes('#')).toBe(false);
  });

  test('アンカー部分のみが異なるURLを検出する統合テスト', () => {
    // オリジナルURL（アンカー付き）
    const originalUrl = 'https://www.airbnb.jp/rooms/12345?adults=2#photos';

    // 正規化されたURL（アンカーなし）
    const normalizedUrl = UrlEndpointAnalyzer.normalizeUrl(originalUrl);

    // 正規化によってアンカーが削除されたことを確認
    expect(normalizedUrl).not.toContain('#');
    expect(normalizedUrl).toBe('https://www.airbnb.jp/rooms/12345?adults=2');

    // アンカー部分のみの違いと正しく判定されること
    expect(UrlEndpointAnalyzer.isAnchorOnlyDifference(originalUrl, normalizedUrl)).toBe(true);
  });

  test('クエリパラメータとアンカーの両方が変更された場合のテスト', () => {
    // オリジナルURL
    const originalUrl =
      'https://www.airbnb.jp/rooms/12345?adults=2&source_impression_id=123#photos';

    // 正規化されたURL
    const normalizedUrl = UrlEndpointAnalyzer.normalizeUrl(originalUrl);

    // トラッキングパラメータとアンカーの両方が削除されていることを確認
    expect(normalizedUrl).not.toContain('source_impression_id');
    expect(normalizedUrl).not.toContain('#');
    expect(normalizedUrl).toBe('https://www.airbnb.jp/rooms/12345?adults=2');

    // この場合はアンカーだけの違いではないと判定される
    expect(UrlEndpointAnalyzer.isAnchorOnlyDifference(originalUrl, normalizedUrl)).toBe(false);
  });
});
