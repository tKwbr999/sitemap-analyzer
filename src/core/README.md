# コアロジックディレクトリ

## ファイル構成
- analyzer.ts: サイトマップ解析エンジン
- crawler.ts: Webクローリング機能
- parser.ts: XML解析機能

## 役割
- サイトマップのXML解析
- URLの検証とクローリング
- データの収集と分析

## 技術スタック
- TypeScript
- node-fetch/axios: HTTP通信
- fast-xml-parser: XMLパース処理

## 参照関係
- models/sitemap: サイトマップデータモデル
- utils/http: HTTP通信ユーティリティ
- types/sitemap: 型定義

## 特記事項
- 並行処理による効率的なクローリング
- メモリ使用量の最適化
- エラー時の再試行機能
```
