# サブスク管理アプリ

個人向けのサブスクリプション・定額支出管理 Web アプリです。
サブスクの登録・分析・CSV 取込・レシート OCR・改善提案に加えて、学園アニメ風のキャラクター案内、ログインボーナス、実績、好感度システムを備えています。

## 技術スタック

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion
- Recharts
- Tesseract.js
- Jest + React Testing Library

## 主な機能

- サブスク CRUD、検索、フィルタ、有効/無効切替
- 有名サービスのプリセット登録とカスタム登録
- MoneyForward ME / d払い CSV 取込、カテゴリ自動分類、確認フロー
- レシート画像 OCR と手動修正
- 月次合計、カテゴリ円グラフ、推移分析、履歴表示
- 支出削減提案、未使用サブスク検出、カテゴリ増加警告
- ダークモード、オンボーディング、キーボードショートカット
- 実績 XP、ログインボーナス、キャラクター選択、好感度・ギャラリー解放

## ルート

- `/` - ダッシュボード
- `/subscriptions` - サブスク管理
- `/import` - CSV 取込
- `/receipt` - レシート読取
- `/history` - 購入履歴
- `/trends` - 推移分析
- `/suggestions` - 改善提案
- `/achievements` - 実績

## 開発コマンド

```bash
npm run dev
npm test
npm run test:coverage
npm run build
```

開発サーバーは通常 `http://localhost:3000` で起動します。

## 一般公開

Next.js 構成のため、Vercel への公開を推奨します。

1. Vercel アカウントを用意する
2. このプロジェクトを GitHub リポジトリに push する
3. Vercel の `Add New Project` から GitHub リポジトリを選ぶ
4. Framework Preset が `Next.js` になっていることを確認する
5. Build Command は `npm run build`、Install Command は `npm install` のままでデプロイする

Vercel CLI を使う場合:

```bash
npm install -g vercel
vercel login
vercel deploy --prod
```

このアプリはスマホのホーム画面追加に対応するため、`public/manifest.webmanifest` と `public/app-icon.svg` を用意しています。
Safari / Chrome で公開 URL を開き、「ホーム画面に追加」するとアプリ風に起動できます。

注意: データはブラウザ内の `localStorage` / IndexedDB に保存されるため、PC とスマホ間では自動同期されません。
端末間同期が必要な場合は、認証とクラウド DB の追加が次の実装候補です。

## データ保存

認証なしの個人利用を前提に、ブラウザ内の `localStorage` と IndexedDB に保存します。
サーバーサイド DB や外部 API への永続化は現時点ではありません。

## 主要ディレクトリ

- `app/` - Next.js App Router のページ
- `components/` - UI、フォーム、チャート、レイアウト、キャラクター演出
- `hooks/` - Zustand ストア、テーマ、ショートカット、ゲーミフィケーション連携
- `lib/` - 集計、CSV、OCR、分類、保存、実績、キャラクター、プリセット定義
- `public/characters/` - 生成済みキャラクター画像
- `public/design/` - 背景・デザイン素材
- `tests/` - Jest / React Testing Library テスト
- `docs/goals/` - 初期実装計画と完了記録

## リポジトリ整理方針

`.next/`、`coverage/`、`node_modules/`、`.swc/`、`tsconfig.tsbuildinfo` は生成物のため Git 管理しません。
キャラクター画像の `portrait.png`、`mascot.png`、`variants/*.png` は再編集用の元素材として保持します。
