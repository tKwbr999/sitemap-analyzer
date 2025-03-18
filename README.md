# Sitemap Analyzer

ウェブサイトのスクリーンショット収集と構造分析ツール

## 概要

Sitemap Analyzerは、指定したウェブサイトを自動的にクロールし、各ページのスクリーンショットを様々なデバイスサイズで取得するツールです。また、取得したデータを分析してサイトマップを作成し、サイト構造の分析レポートを生成します。

## 機能

- 複数のデバイスサイズ（デスクトップ・タブレット・スマートフォンなど）でのスクリーンショット撮影
- URL間の関係を分析したサイトマップの作成
- カスタマイズ可能なクロール設定（深さ制限、ページ数制限、遅延など）
- 柔軟なURLフィルタリング（正規表現による包含・除外パターン）
- サイト構造の統計情報とレポート生成

## 必要条件

- Node.js (v20.0.0以上)
- TypeScript (v5.0.0以上)
- Puppeteer

## インストール

```bash
# リポジトリをクローン
git clone https://[リポジトリのURL]/sitemap-analyzer.git
cd sitemap-analyzer

# 依存パッケージのインストール
npm install
```

## 設定方法

### 基本設定

1. `config.ts` ファイルを作成します（`config-example.ts` をコピーして使用できます）:

```bash
cp config-example.ts config.ts
```

2. `config.ts` ファイルを編集して、クロール設定をカスタマイズします:

```typescript
// config.ts
import { WebsiteCrawler, CrawlConfig } from './website-screenshot-crawler';

// 基本設定
const basicConfig: CrawlConfig = {
  baseUrl: 'https://your-target-website.com', // クロール対象のURLを設定
  outputDir: './screenshots',                 // 出力ディレクトリ
  maxDepth: 2,                                // クロールする深さの最大値
  maxPages: 20,                               // 取得する最大ページ数
  delay: 1500,                                // リクエスト間の遅延（ミリ秒）
  devices: [
    {
      name: 'desktop',                        // デバイス名
      width: 1920,                            // 画面幅
      height: 1080,                           // 画面高さ
      isMobile: false,                        // モバイルエミュレーションの有無
    },
    {
      name: 'smartphone',
      width: 375,
      height: 812,
      isMobile: true,
    },
  ],
  // 含めるURLのパターン（正規表現）
  includePatterns: [/^https?:\/\/your-target-website\.com\//i],
  // 除外するURLのパターン（正規表現）
  excludePatterns: [
    /\.(jpg|jpeg|png|gif|pdf|zip)$/i,         // 画像やPDFなどのファイル
    /\/login/i,                                // ログインページ
    /\/admin/i,                                // 管理者ページ
    /\?page=/i,                                // ページネーション
  ],
};

// エクスポート（必須）
export const configs = {
  basic: basicConfig,
  // 他の設定を追加できます
};
```

### 高度な設定例

特定のタイプのウェブサイト向けに最適化された設定も用意されています:

```typescript
// Eコマースサイト向け設定
const ecommerceConfig: CrawlConfig = {
  baseUrl: 'https://your-shop.com',
  outputDir: './screenshots',
  maxDepth: 3,
  maxPages: 50,
  delay: 2000,
  devices: [
    { name: 'desktop', width: 1920, height: 1080, isMobile: false },
    { name: 'tablet', width: 768, height: 1024, isMobile: true },
    { name: 'smartphone', width: 375, height: 812, isMobile: true },
  ],
  includePatterns: [
    /^https?:\/\/your-shop\.com\//i,
    /\/products\//i,
    /\/categories\//i
  ],
  excludePatterns: [
    /\/cart/i,
    /\/checkout/i,
    /\/account/i,
    /\?sort=/i,
    /\?filter=/i
  ],
};

// ブログサイト向け設定
const blogConfig: CrawlConfig = {
  baseUrl: 'https://your-blog.com',
  outputDir: './screenshots',
  maxDepth: 2,
  maxPages: 30,
  delay: 1000,
  devices: [
    { name: 'desktop', width: 1920, height: 1080, isMobile: false },
    { name: 'smartphone', width: 375, height: 812, isMobile: true },
  ],
  includePatterns: [
    /^https?:\/\/your-blog\.com\//i,
    /\/posts\//i,
    /\/categories\//i
  ],
  excludePatterns: [
    /\/author\//i,
    /\/tag\//i,
    /\/page\/[2-9]/i,
    /\?comment=/i
  ],
};

// SPAサイト向け設定
const spaConfig: CrawlConfig = {
  baseUrl: 'https://your-spa.com',
  outputDir: './screenshots',
  maxDepth: 2,
  maxPages: 20,
  delay: 2500,
  waitForNetwork: true,            // ネットワークアイドル状態を待つ
  waitTime: 1000,                  // ページロード後の追加待機時間
  devices: [
    { name: 'desktop', width: 1920, height: 1080, isMobile: false },
    { name: 'smartphone', width: 375, height: 812, isMobile: true },
  ],
  includePatterns: [/^https?:\/\/your-spa\.com\//i],
  excludePatterns: [/\/api\//i, /\.(json|xml)$/i],
};

// すべての設定をエクスポート
export const configs = {
  basic: basicConfig,
  ecommerce: ecommerceConfig,
  blog: blogConfig,
  spa: spaConfig,
};
```

## 使用方法

### スクリーンショットの取得（クロール）

クロールを実行して、ウェブサイトのスクリーンショットを取得します:

```bash
# 基本設定で実行
npm run crawl
# または
npm run crawl:basic

# Eコマース設定で実行
npm run crawl:ecommerce

# ブログ設定で実行
npm run crawl:blog

# SPA設定で実行
npm run crawl:spa
```

または、ts-nodeを直接使用:

```bash
# 基本設定で実行
ts-node index.ts

# 特定の設定で実行
ts-node index.ts ecommerce
```

実行すると、以下の処理が行われます:
1. 指定したURLからクロールを開始
2. 設定した条件に基づいてページを巡回
3. 各ページで各デバイス設定ごとにスクリーンショットを撮影
4. 出力ディレクトリに画像とサイトマップJSONファイルを保存

### サイト分析の実行

クロール後に生成されたサイトマップを分析してレポートを作成します:

```bash
# デフォルトの場所（./screenshots/sitemap.json）から分析
npm run analyze

# 特定のサイトマップファイルを指定して分析
ts-node analyze.ts /path/to/your/sitemap.json /path/to/output/directory
```

分析が完了すると、以下のファイルが生成されます:
- `analysis.json` - 詳細な分析データ（JSON形式）
- `report.md` - 人間が読みやすい形式のレポート（Markdown形式）

## 出力の例

### サイトマップJSONの例
```json
{
  "pages": [
    {
      "url": "https://example.com/",
      "title": "Example Website",
      "links": ["https://example.com/about", "https://example.com/contact"],
      "screenshots": {
        "desktop": "/path/to/screenshots/desktop/home.png",
        "smartphone": "/path/to/screenshots/smartphone/home.png"
      }
    },
    // 他のページの情報...
  ]
}
```

### 分析レポートの例
```markdown
# サイト分析レポート: example.com

## 概要
- 総ページ数: 25
- 内部リンク数: 120
- 外部リンク数: 15
- 平均リンク数/ページ: 4.8

## ページ構造
- 最大深さ: 3
- ホームページからのリンク数: 8

## デバイス別対応状況
- デスクトップ対応ページ: 25/25 (100%)
- スマートフォン対応ページ: 25/25 (100%)
```

## 開発

```bash
# テスト実行
npm test

# リンター実行
npm run lint

# コード整形
npm run fmt

# すべてのチェックを実行（フォーマット、リント、型チェック、テスト）
npm run check-all
```

## プロジェクト構造

```
sitemap-analyzer/
├── index.ts                 # クロールのエントリーポイント
├── analyze.ts               # 分析のエントリーポイント
├── config-example.ts        # 設定ファイルの例
├── website-screenshot-crawler.ts # クローラーの実装
├── sitemap-analyzer.ts      # アナライザーの実装
├── src/
│   ├── analyzer/            # 分析モジュール
│   ├── crawler/             # クロールモジュール
│   ├── utils/               # ユーティリティ関数
│   └── types/               # 型定義
├── screenshots/             # デフォルトの出力ディレクトリ
├── tsconfig.json            # TypeScript設定
└── package.json             # NPM設定
```

## ライセンス

MIT
