# Sitemap Analyzer

ウェブサイトのスクリーンショット収集と構造分析ツール

## 概要

このツールは、指定したウェブサイトを自動的にクロールし、各ページのスクリーンショットを収集します。また、サイトマップの生成と基本的な構造分析も行います。

## 主な機能

- 複数デバイス（デスクトップ、スマートフォン）でのスクリーンショット撮影
- URL フィルタリング（含めるパターン、除外パターン）
- 深度制限・ページ数制限によるクロール範囲の制御
- サイトマップの自動生成
- サイト構造の基本分析

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/sitemap-analyzer.git
cd sitemap-analyzer

# 依存関係のインストール
npm install
```

## 使い方

### 基本的な使用方法

```bash
# デフォルト設定でクロール
npm run crawl

# 特定のURLをクロール
npm run crawl default https://example.com

# 分析の実行
npm run analyze
```

### 特定の設定でのクロール

```bash
# Eコマース向け設定
npm run crawl:ecommerce

# ブログサイト向け設定
npm run crawl:blog

# SPA向け設定
npm run crawl:spa
```

## 設定

`config.ts` ファイルを編集して設定をカスタマイズできます：

```typescript
// 設定例
const config: CrawlConfig = {
  baseUrl: 'https://example.com',
  outputDir: './screenshots',
  maxDepth: 3,
  maxPages: 50,
  delay: 1000,
  devices: [
    {
      name: 'desktop',
      width: 1920,
      height: 1080,
      isMobile: false,
    },
    {
      name: 'smartphone',
      width: 375,
      height: 812,
      isMobile: true,
    }
  ],
  includePatterns: [/^https?:\/\/example\.com\//i],
  excludePatterns: [
    /\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|rar|exe|dmg)$/i,
    /\/blog\/tag\//i,
    /[?&]utm_/i,
  ],
};
```

## プロジェクト構造

```
/
├── src/                      # ソースコードディレクトリ
│   ├── analyzer/             # 分析機能
│   │   └── sitemap-analyzer.ts
│   ├── config/               # 設定関連
│   │   ├── config-examples.ts
│   │   └── default-config.ts
│   ├── crawler/              # クローラー機能
│   │   ├── browser-manager.ts
│   │   ├── crawler.ts
│   │   ├── link-extractor.ts
│   │   ├── page-processor.ts
│   │   ├── page-validator.ts
│   │   └── url-filter.ts
│   ├── entry/                # エントリーポイント
│   │   ├── analyze.ts
│   │   └── index.ts
│   ├── errors/               # エラー処理
│   ├── types/                # 型定義
│   │   └── index.ts
│   ├── utils/                # ユーティリティ
│   │   ├── crawl-statistics.ts
│   │   ├── file-utils.ts
│   │   ├── screenshot-path.ts
│   │   └── url-endpoint-analyzer.ts
│   └── __tests__/            # テスト
│       ├── crawl-statistics.test.ts
│       ├── screenshot-path.test.ts
│       ├── url-endpoint-analyzer.test.ts
│       ├── url-filter.test.ts
│       ├── url-handling.test.ts
│       └── utils.test.ts
├── index.ts                  # メインエントリーポイント
├── analyze.ts                # 分析エントリーポイント
├── config.ts                 # ユーザー設定ファイル
├── package.json              # 依存関係とスクリプト
├── tsconfig.json             # TypeScript設定
└── README.md                 # このファイル
```

## 出力形式

### スクリーンショット

スクリーンショットは以下の形式でディレクトリに保存されます：

```
[outputDir]/
├── www-airbnb-jp/
│   ├── pc.png      # トップページのdesktopスクリーンショット
│   ├── sp.png      # トップページのsmartphoneスクリーンショット
│   ├── canmore-canada/
│   │   └── stays/
│   │       └── pet-friendly/
│   │           ├── pc.png  # desktopスクリーンショット
│   │           └── sp.png  # smartphoneスクリーンショット
└── sitemap.json  # クロール結果のサイトマップ
```

ディレクトリ名はURLのパスに基づいて自動的に作成されます。デバイスごとに次のようなファイル名が使用されます：

- `pc.png`: デスクトップ用スクリーンショット
- `sp.png`: スマートフォン用スクリーンショット

### サイトマップ

サイトマップは JSON 形式で保存され、各ページの情報を含みます：

```json
[
  {
    "url": "https://example.com/",
    "title": "Example Homepage",
    "depth": 0,
    "links": ["https://example.com/page1", "https://example.com/page2"],
    "screenshots": [
      {
        "deviceName": "desktop",
        "path": "/path/to/screenshots/example-com/root/pc.png"
      },
      {
        "deviceName": "smartphone",
        "path": "/path/to/screenshots/example-com/root/sp.png"
      }
    ]
  },
  ...
]
```

## 分析結果

分析を実行すると、以下の情報を含むレポートが生成されます：

- 総ページ数と総スクリーンショット数
- 平均リンク数
- 最大深度
- パス分布
- 深度別ページ数
- 被リンク数上位のページ

## 開発者向け情報

コードを変更した場合は、以下のコマンドを実行してください：

```bash
# コードの整形
npm run fmt

# リントチェック
npm run lint

# コンパイルチェック
npm run compile-check

# テスト実行
npm run test

# 上記をすべて実行
npm run check-all
```

## ライセンス

MIT

## 詳細情報

詳細なアーキテクチャや実装の詳細については、以下のドキュメントを参照してください：

- [アーキテクチャドキュメント](./architecture.md)
- [シーケンス図](./sequence.md)
