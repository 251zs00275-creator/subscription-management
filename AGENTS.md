# サブスク管理アプリ — エージェント向け開発メモ

## プロジェクト概要

個人向けサブスクリプション・定額支出管理 Web アプリ。
サブスク管理、CSV 取込、レシート OCR、支出分析、改善提案に加えて、学園アニメ風のキャラクター案内、ログインボーナス、実績 XP、好感度・ギャラリー解放を提供する。

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

## 現行ルート

- `/` - ダッシュボード
- `/subscriptions` - サブスク管理
- `/import` - CSV 取込
- `/receipt` - レシート読取
- `/history` - 購入履歴
- `/trends` - 推移分析
- `/suggestions` - 改善提案
- `/achievements` - 実績

API ルートと `app/subscriptions/[id]/edit.tsx` は現時点では存在しない。編集はモーダル/フォームで行う。

## 主要構成

- `app/` - App Router ページ
- `components/Layout/` - アプリシェル、ヘッダー、サイドバー、背景
- `components/Forms/` - サブスク登録、CSV確認、レシート読取
- `components/Dashboard/` - ダッシュボードカードとハイライト
- `components/Charts/` - Recharts ベースの可視化
- `components/Gamification/` - 実績、レベル、ログイン表示
- `components/Common/` - キャラクター、カード、空状態、VN風パネル
- `components/ui/` - shadcn/ui 系の基礎コンポーネント
- `hooks/` - Zustand ストア、テーマ、ショートカット、ゲーム統計
- `lib/` - 集計、CSV、OCR、分類、保存、提案、実績、キャラクター、プリセット
- `public/characters/` - キャラクター画像
- `tests/` - Jest / React Testing Library

## 実装済み機能

- サブスク CRUD、検索、フィルタ、有効/無効切替
- プリセット登録とカスタム登録
- プリセットのカテゴリ絞り込み、文字検索、カード表示、サービス風アイコン
- CSV 取込、カテゴリ自動分類、確認フロー
- レシート OCR と手動修正
- ダッシュボード、履歴、推移分析、改善提案
- ダークモード、オンボーディング、キーボードショートカット
- 実績 XP、未受取バッジ、ログインボーナス
- キャラクター選択、担当機能、好感度、解放ギャラリー

## 開発ルール

- 既存の UI トーンを維持する。学園アニメ風、明るいグロー、ダークモードでは目に優しいコントラストを優先する。
- 画像は実装参照用の `optimized/*.jpg` と、再編集用の元 PNG を分けて扱う。
- 生成物は Git 管理しない。`.next/`、`coverage/`、`node_modules/`、`.swc/`、`tsconfig.tsbuildinfo` は不要。
- ユーザー作業や既存の未コミット差分を勝手に戻さない。
- 手動編集は `apply_patch` を使う。
- 検索は `rg` を優先する。
- 変更後は可能な範囲で `npm test` と `npm run build` を確認する。

## テスト方針

- ロジックは `tests/lib/`、フックは `tests/hooks/`、UI は `tests/components/` に配置する。
- 現在テストが薄い候補は `CategoryReviewPanel`、`ReceiptUpload`、`useDragOrder`、`customRules`、`export`、`subscriptionPresets`。
- `jest.config.js` の coverage 対象は主要ロジックとフォーム/共通コンポーネント中心。全 UI を coverage 対象に広げる場合は、同時にテストを追加する。

## よく使うコマンド

```bash
npm run dev
npm test
npm run test:coverage
npm run build
```
