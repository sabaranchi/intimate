# 親密管理アプリ (PWA)
特徴:
- メイン画面: 左に顔写真、右に10個のハートで好感度を表示
- 人物ページ: 基本情報 / 出来事 / メモ（性格、悩み事、したい事、話題の好み、共通の話題）
- 画像はユーザーがアップロード（Base64でlocalStorageへ保存）
- 起動時のPINロック、JSONエクスポート/インポート

使い方（ローカルで実行）:
```powershell
cd c:/Users/saver/Downloads/my_content/intimate
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください（ポートはViteの表示に従ってください）。

注意:
- 現在は簡易実装です。データはブラウザの `localStorage` に保存されます。引き継ぎはエクスポート/インポートで行ってください。
- PWAとして配布するには `public/manifest.json` とアイコンを追加してください。

次のステップ候補:
- IndexedDB に移行して大規模データに耐えるようにする

