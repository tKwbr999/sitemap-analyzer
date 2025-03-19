# データモデルディレクトリ

## ファイル構成
- sitemap.ts: サイトマップモデル
- result.ts: 分析結果モデル

## 役割
- データ構造の定義
- バリデーションロジック
- データ変換処理

## 技術スタック
- TypeScript
- class-validator: バリデーション
- class-transformer: オブジェクト変換

## 参照関係
- types/sitemap: 型定義の利用
- core/analyzer: モデルの利用

## 特記事項
- イミュータブルなデータ構造
- シリアライズ/デシリアライズ対応
```
