# 引き継ぎドキュメント — サブスク管理アプリ

最終更新: 2026-05-20

## 現状

Next.js 14 App Router + TypeScript + Tailwind CSS の個人向けサブスク管理アプリ。
当初 MVP の CRUD / CSV / OCR / 分析 / 改善提案に加え、現在はアニメ調 UI、キャラクター案内、ログインボーナス、実績 XP、好感度・ギャラリー解放、サブスクプリセット登録 UI まで実装済みです。

## 実装済み機能

- サブスク CRUD、検索、フィルタ、並び替え、有効/無効切替
- プリセット登録とカスタム登録の分離
- プリセットカード表示、カテゴリ絞り込み、文字検索、プラン選択、修正導線
- MoneyForward ME / d払い CSV 取込、カテゴリ自動分類、確認フロー
- レシート OCR、抽出結果の確認、手動修正
- ダッシュボード、カテゴリ円グラフ、月次推移、購入履歴、改善提案
- 実績 XP、未受取バッジ、ログインボーナス、月間ログイン管理
- キャラクター選択、担当機能、好感度、詳細モーダル、解放ギャラリー
- ダークモード、オンボーディング、キーボードショートカット、アニメーション

## 現行ルート

- `/` - ダッシュボード
- `/subscriptions` - サブスク管理
- `/import` - CSV 取込
- `/receipt` - レシート読取
- `/history` - 購入履歴
- `/trends` - 推移分析
- `/suggestions` - 改善提案
- `/achievements` - 実績

## 重要ファイル

- `app/page.tsx` - ダッシュボード
- `app/subscriptions/page.tsx` - サブスク一覧と登録導線
- `components/Forms/SubscriptionForm.tsx` - プリセット/カスタム登録フォーム
- `components/Forms/CategoryReviewPanel.tsx` - CSV 分類確認
- `components/Common/DailyLoginFlow.tsx` - キャラ選択とログインボーナス
- `components/Common/CharacterSelector.tsx` - キャラクター選択
- `components/Common/CharacterDetailDialog.tsx` - キャラ詳細・好感度・ギャラリー
- `components/Common/MiniCharacterGuide.tsx` - 各画面のミニキャラ解説
- `components/Common/VisualNovelPanel.tsx` - セリフ演出パネル
- `components/Layout/AppShell.tsx` - 全体レイアウト
- `hooks/useGameStats.ts` - XP、実績、ログボ、好感度管理
- `lib/gameEngine.ts` - 実績定義とレベル計算
- `lib/characters.ts` - キャラ定義と担当機能
- `lib/subscriptionPresets.ts` - サービスプリセットと料金情報
- `public/characters/README.md` - キャラクター画像構成

## アセット方針

アプリが参照する主な画像は `public/characters/{character}/optimized/*.jpg`、`expressions/*.jpg`、`poses/guide-alt.jpg`、`mascot/coach.jpg`、`gallery/affection-1.jpg` です。
`portrait.png`、`mascot.png`、`variants/*.png` は再編集・再生成用の元素材として保持します。

## 生成物整理

以下は Git 管理しない生成物です。

- `.next/`
- `coverage/`
- `node_modules/`
- `.swc/`
- `tsconfig.tsbuildinfo`

## 残タスク候補

- `components/Forms/SubscriptionForm.tsx` が大きくなっているため、プリセットピッカーを分離する
- `components/Forms/CategoryReviewPanel.tsx`、`hooks/useDragOrder.ts`、`lib/customRules.ts`、`lib/export.ts` のテストを追加する
- 実際のブラウザ表示で、プリセットカード・キャラモーダル・ダークモードをスクリーンショット確認する
- 必要なら未参照の補助ファイルを削除または再利用方針として明記する

## 検証コマンド

```bash
npm test
npm run test:coverage
npm run build
```
