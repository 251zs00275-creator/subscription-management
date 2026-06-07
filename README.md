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
- JSON バックアップのエクスポート/インポート、CSV エクスポート
- Google ログインと Supabase サブスク同期の初期対応
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

## ビジュアルリグレッション (Playwright)

主要 5 画面（ダッシュボード / サブスク管理 / CSV 取込 / レシート読取 / 実績）の見た目を、Playwright のスクリーンショット比較で継続的に検証します。
テストは `npm run build && npm run start` で本番ビルドを起動し、オンボーディングやログインボーナス演出をスキップした状態でキャプチャします。

### ローカルでの実行

初回のみブラウザ本体を取得します。

```bash
npx playwright install chromium
```

比較を実行します（差分があれば `playwright-report/` に結果が出力されます）。

```bash
npm run e2e
```

レポートを開いて差分を確認します。

```bash
npm run e2e:report
```

UI を意図的に変更してベースラインを更新する場合は次を実行します。

```bash
npm run e2e:update
```

更新後のスクリーンショットは `e2e/__screenshots__/` 配下にコミットします。

### CI での実行

```bash
npx playwright install --with-deps chromium
npm run e2e
```

`playwright.config.ts` の `webServer` がビルド済みアプリを `http://127.0.0.1:3100` で自動起動するため、別途サーバーを立てる必要はありません。

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

Supabase を未設定の場合、データはブラウザ内の `localStorage` / IndexedDB のみに保存されます。
Supabase 設定後は Google ログインした端末間でサブスク一覧を同期できます。設定・実績・好感度は JSON バックアップで移行できます。

## データ保存

未ログイン時はブラウザ内の `localStorage` と IndexedDB に保存します。
Supabase の環境変数を設定し Google ログインすると、サブスク一覧は `public.subscriptions` と同期します。
ローカル保存は残るため、オフライン起動と JSON バックアップの導線は維持されます。

## Supabase 同期

1. Supabase プロジェクトを作成する
2. `.env.example` を参考に `.env.local` へ `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` を設定する
3. Supabase SQL Editor で `docs/supabase-subscriptions.sql` を実行する
4. Supabase Auth で Google provider を有効にし、Google OAuth 側へ Supabase callback URL を登録する
5. Supabase Auth の Redirect URLs に公開 URL とローカル URL の `/subscriptions` 戻り先を追加する

初期同期はサブスク一覧のみです。同じ ID のデータは `updatedAt` が新しい方を採用し、同期後の削除は tombstone で他端末へ伝えます。

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
