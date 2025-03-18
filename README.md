# sitemap-analyzer

ウェブサイトのスクリーンショット収集と構造分析ツール

## ESLint設定に関する注意

このプロジェクトは現在、ESLint v9.22.0を使用しています。ESLint v9からは設定ファイルのフォーマットが変更され、デフォルトで`eslint.config.js`が使用されるようになりました。

### 解決方法1: ESLintをv8系にダウングレードする（推奨）

```bash
# 実行権限を付与
chmod +x ./downgrade-eslint.sh

# スクリプトを実行
./downgrade-eslint.sh
```

これにより、既存の`.eslintrc.js`ファイルがそのまま使用できるようになります。

### 解決方法2: ESLint v9に対応した設定ファイルを使用する

```bash
# 実行権限を付与
chmod +x ./update-eslint.sh

# スクリプトを実行
./update-eslint.sh
```

これにより、ESLint v9に対応した依存関係がインストールされます。また、`eslint.config.js`ファイルが作成されていますので、`.eslintrc.js`ファイルと共存させることができます。

**注意**: 完全にESLint v9に移行する場合は、`.eslintrc.js`ファイルを削除し、`eslint.config.js`のみを使用してください。
