// index.ts
// プロジェクトのルートエントリーポイント
// このファイルはsrc/entry/index.tsへの橋渡しをします

export * from './src/entry/index';

// メインプログラムの実行
if (require.main === module) {
  // src/entry/index.tsのmain関数を直接呼び出す
  require('./src/entry/index');
}
