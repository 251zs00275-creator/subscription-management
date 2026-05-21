# サブスク管理アプリ — 開発ドキュメント

## 概要

個人向けのサブスクリプション・定額支出管理 Web アプリケーション。
毎月の固定費を見える化し、不要な支出を減らすための統合ダッシュボードを提供する。
現在は MVP の範囲を超えて、アニメ調 UI、キャラクター案内、ログインボーナス、実績 XP、好感度・ギャラリー解放まで実装している。

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

## 主要機能

- サブスク・定額支出 CRUD
- 有名サブスクのプリセット登録、カテゴリ絞り込み、検索、プラン選択
- カスタム登録
- MoneyForward ME / d払い CSV 取込
- カテゴリ自動分類
- レシート OCR
- 月次支出ダッシュボード
- カテゴリ別分析、履歴、推移分析
- 支出削減提案
- ダークモード
- オンボーディング
- キーボードショートカット
- 実績、XP、ログインボーナス
- キャラクター選択、担当機能、好感度、ギャラリー解放

## 現行ルート

- `/` - ダッシュボード
- `/subscriptions` - サブスク管理
- `/import` - CSV 取込
- `/receipt` - レシート読取
- `/history` - 購入履歴
- `/trends` - 推移分析
- `/suggestions` - 改善提案
- `/achievements` - 実績

## データ永続化

認証なしの個人利用を前提に、ブラウザ内保存を使う。

- `localStorage` - UI 設定、ゲーム統計、軽量データ
- IndexedDB - CSV 取込履歴、レシート画像などの大きなデータ

## ディレクトリ

```text
app/                 App Router ページ
components/Layout/   アプリシェル、ヘッダー、サイドバー、背景
components/Forms/    登録フォーム、CSV確認、レシート読取
components/Dashboard/ダッシュボード部品
components/Charts/   グラフ
components/Common/   キャラクター、カード、共通 UI
components/Gamification/ 実績、レベル、ログイン演出
components/ui/       shadcn/ui 系の基礎 UI
hooks/               Zustand ストア、テーマ、ショートカット
lib/                 集計、保存、分類、OCR、CSV、キャラクター、プリセット
public/characters/   キャラクター画像
public/design/       背景・デザイン素材
tests/               テスト
docs/goals/          初期実装計画と完了記録
```

## 開発ルール

- TypeScript の型安全性を保つ。
- 既存のアニメ調デザイン、ダークモード、キャラクター演出と整合させる。
- UI 文言は日本語で揃える。
- 画像参照は `lib/characters.ts` に集約する。
- `.next/`、`coverage/`、`node_modules/`、`.swc/`、`tsconfig.tsbuildinfo` は Git 管理しない。
- 未コミットの既存差分を勝手に戻さない。

## 検証

```bash
npm test
npm run test:coverage
npm run build
```

## 現在の改善候補

- `SubscriptionForm` からプリセットピッカーを分離して見通しを良くする。
- `CategoryReviewPanel`、`ReceiptUpload`、`useDragOrder`、`customRules`、`export`、`subscriptionPresets` のテストを追加する。
- UI のスクリーンショット確認を追加する。
