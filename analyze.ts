// analyze.ts
// 分析用のルートエントリーポイント
// このファイルはsrc/entry/analyze.tsへの橋渡しをします

export * from './src/entry/analyze';

// メインプログラムの実行
if (require.main === module) {
  // src/entry/analyze.tsのmain関数を直接呼び出す
  require('./src/entry/analyze');
}
