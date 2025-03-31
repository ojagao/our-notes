# Our Notes

共有するメモのようなアプリケーション。SPAで3つのページを切り替え可能なネイティブアプリのようなUIを持ちます。

## 機能

- 3つのページから構成されるSPA（ショッピング、マップ、カレンダー）
- 画面下に切り替えのUIがあるネイティブアプリのようなUI
- 右下に「＋」ボタンでメモを追加可能
- 「ペン」ボタンで編集モードに切り替え、メモの削除が可能

## 技術スタック

- フロントエンド: Vite + Vue 3 + TypeScript
- バックエンド: Hono
- デプロイ: Cloudflare Workers
- PWA対応

## 開発方法

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# APIの開発サーバー起動
npm run api:dev

# ビルド
npm run build

# APIのデプロイ
npm run api:deploy
```
