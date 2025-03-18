# ウェブサイトスクリーンショット収集システム アーキテクチャ

## プロジェクト構造

```
sitemap-analyzer/
├── src/                     # ソースコードディレクトリ
│   ├── analyzer/            # サイトマップ分析関連
│   │   └── sitemap-analyzer.ts
│   ├── config/              # 設定ファイル
│   │   ├── config-examples.ts
│   │   └── default-config.ts
│   ├── crawler/             # クローラー関連
│   │   ├── browser-manager.ts
│   │   ├── crawler.ts
│   │   └── page-processor.ts
│   ├── types/               # 型定義
│   │   └── index.ts
│   ├── utils/               # ユーティリティ関数
│   │   ├── common.ts
│   │   ├── file-utils.ts
│   │   ├── screenshot-path.ts  # スクリーンショットパス生成
│   │   └── url-utils.ts
│   ├── analyze.ts           # 分析エントリポイント
│   └── index.ts             # メインエントリポイント
├── index.ts                 # ルートエントリポイント（クローラー）
├── analyze.ts               # ルートエントリポイント（アナライザー）
├── package.json             # プロジェクト設定
└── tsconfig.json            # TypeScript設定
```

## コアコンポーネント

### 1. 型定義 (`src/types/index.ts`)

以下の主要なインターフェースを定義しています：

- **DeviceConfig**：デバイスのエミュレーション設定
  - `name`: デバイス名 (例: `desktop`, `smartphone`)
  - `width`: 画面幅 (例: `1920`)
  - `height`: 画面高さ (例: `1080`)
  - `isMobile`: モバイルエミュレーションの有無
  - `userAgent`: オプショナルなユーザーエージェント文字列

- **CrawlConfig**：クロール全体の設定
  - `baseUrl`: クロール開始URL
  - `outputDir`: 出力ディレクトリ
  - `maxDepth`: 最大深度
  - `maxPages`: 最大ページ数
  - `devices`: デバイス設定の配列
  - `includePatterns`: 含めるURLパターン（正規表現）
  - `excludePatterns`: 除外するURLパターン（正規表現）
  - `delay`: アクセス間隔（ミリ秒）
  
- **PageInfo**：収集したページの情報
  - `url`: ページURL
  - `title`: ページタイトル
  - `depth`: 深度
  - `links`: 抽出されたリンク
  - `screenshots`: スクリーンショット情報

- **SiteAnalysis**：サイト分析結果
  - `totalPages`: 総ページ数
  - `totalScreenshots`: 総スクリーンショット数
  - `averageLinksPerPage`: 平均リンク数
  - `maxDepth`: 最大深度
  - `pathsBreakdown`: パス分布
  - `pagesByDepth`: 深度別ページ数
  - `topLinkedPages`: 被リンク数上位のページ

### 2. クローラー機能 (`src/crawler/`)

#### BrowserManager (`src/crawler/browser-manager.ts`)

Puppeteerブラウザの管理を担当します：
- ブラウザの初期化と終了
- ページインスタンスの作成
- デバイスエミュレーションの設定

#### PageProcessor (`src/crawler/page-processor.ts`)

個別ページの処理を担当します：
- ページのロードとスクリーンショット撮影
- リンクの抽出とフィルタリング
- ページ情報（タイトル、リンクなど）の収集

#### WebsiteCrawler (`src/crawler/crawler.ts`)

クロールプロセス全体を管理します：
- 訪問済みURLの管理
- ページキューの管理
- 深度制限・ページ数制限の管理
- サイトマップJSONの生成

### 3. アナライザー機能 (`src/analyzer/`)

SitemapAnalyzer (`src/analyzer/sitemap-analyzer.ts`)
- サイトマップJSONの読み込み
- サイト構造の分析（パス分布、深度別ページ数など）
- 詳細レポートの生成（Markdown形式）
- 分析結果のJSON出力

### 4. 設定管理 (`src/config/`)

- **default-config.ts**: デフォルトのクロール設定
- **config-examples.ts**: 様々なタイプのサイト向け設定例
  - 基本設定（小規模サイト向け）
  - Eコマース向け設定
  - ブログサイト向け設定
  - SPAサイト向け設定

### 5. ユーティリティ関数 (`src/utils/`)

- **common.ts**: 汎用ユーティリティ（sleep関数など）
- **file-utils.ts**: ファイル操作関連のユーティリティ
  - ディレクトリ作成
  - JSONファイルの読み書き
  - テキストファイルの読み書き
- **url-utils.ts**: URL処理関連のユーティリティ
  - URLからファイル名の生成
  - ドメイン名の抽出
  - URLのフィルタリング
- **screenshot-path.ts**: スクリーンショットパス生成
  - URLをもとにスクリーンショット保存パスを生成
  - ドメイン名をディレクトリ構造に変換
  - URLパスをディレクトリ階層に変換

### 6. エントリポイント

- **src/index.ts**: クローラーのメインエントリポイント
  - コマンドライン引数の解析
  - 設定の選択
  - クローラーの実行
- **src/analyze.ts**: アナライザーのエントリポイント
  - サイトマップパスの解析
  - アナライザーの実行

## データフロー

1. **クロールプロセス**:
   - ユーザーがコマンドラインから実行タイプと対象URLを指定
   - 指定された設定に基づいてWebsiteCrawlerがインスタンス化
   - クロール開始URLからページを処理
   - 指定されたデバイスごとにスクリーンショットを撮影
   - リンクを抽出して次のクロール対象をキューに追加
   - 深度制限・ページ数制限に達するまで繰り返し
   - 完了後、サイトマップJSONを生成

2. **分析プロセス**:
   - サイトマップJSONファイルを読み込み
   - サイト構造の分析（パス分布、深度別ページ数など）
   - 分析結果をJSONとして保存
   - 人間が読みやすいMarkdownレポートを生成

## 自動ディレクトリ構成

- 出力先は以下の形式で自動生成されます
  - `outputDir/ドメイン名/パス/階層`
- 例えば以下のようなパス構造となります
  - `outputDir/www-airbnb-jp/canmore-canada/stays/pet-friendly/pc.png`
  - `outputDir/www-airbnb-jp/canmore-canada/stays/pet-friendly/sp.png`
- デバイスごとのスクリーンショットは各パスディレクトリに格納
  - PCのスクリーンショット: `pc.png`
  - スマートフォンのスクリーンショット: `sp.png`

## 実行例

```bash
# デフォルト設定でクロール
npm run crawl

# 特定のURLをクロール
npm run crawl default https://example.com

# Eコマース向け設定でクロール
npm run crawl:ecommerce

# 分析の実行
npm run analyze
```

## 拡張性

- 新しいデバイス設定の追加が容易
- 様々なウェブサイトタイプ向けの設定例
- ユーティリティ関数の分離による再利用性
- モジュール分割により、個別機能の拡張が容易

## エラーハンドリング

- 各モジュールでの適切なエラーキャッチと処理
- エントリポイントでの全体的なエラーハンドリング
- エラー発生時のログ出力

## 出力形式

- **スクリーンショット**: PNG形式の画像ファイル
- **サイトマップ**: 構造化JSONファイル
- **分析結果**: 詳細なJSONファイル
- **レポート**: 人間が読みやすいMarkdownファイル

## 今後の拡張可能性

- 並列処理によるクロール高速化
- ヘッドレスモードの切り替えオプション
- より詳細なエラーレポート
- インタラクティブなUIの追加
- サイトマップをXML形式で出力
- クロールデータの差分検出機能
