# Subscription Management App — Full Implementation (V5)

## Charter

**Original Request**: 完成版プロンプト（V5）に記載された全6機能＋UX要件を完全実装する。

**Outcome**: Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui を用いた
サブスク・定額支出管理Webアプリの完全動作版:
1. Subscription CRUD（追加・編集・削除・有効/無効・検索・フィルタ）
2. CSV Import（MoneyForward ME / d払い形式 → 自動分類 → プレビュー → 確定）
3. Receipt OCR（Tesseract.js → 日付・店舗・金額自動抽出 → フォーム連携）
4. Dashboard（月次合計カード・カテゴリ円グラフ・6ヶ月推移・ハイライトTOP3）
5. カテゴリ自動分類（8種プリセット + キーワード辞書）
6. 支出改善提案（3ヶ月未使用検出・前月比+20%警告・年間節約試算）
7. UX（ダークモード・オンボーディング3ステップ・キーボードショートカット・Framer Motionアニメーション）

**Input Shape**: existing_plan（完成版プロンプトV5 + CLAUDE.md）

**Non-Goals**:
- 認証・マルチユーザー対応
- サーバーサイドDB（IndexedDB + localStorage のみ）
- 外部AI API（Tesseract.js ブラウザOCRのみ）

**Likely Misfire**: 各ファイルを個別に実装して結合を検証しない。常にend-to-endで動作確認すること。

**Authority**: Approved

**Completion Proof**:
- `npm run dev` でエラーなく起動
- 全6機能が end-to-end で動作
- ダークモード・オンボーディング・キーボードショートカット動作
- `npm run test:coverage` で ≥80% カバレッジ
- `npm run build` がエラーなく完了
- TypeScript strict mode: `tsc --noEmit` でエラーなし

---

## Constraints

- **TypeScript strict mode必須** — `any` 型禁止
- **immutableパターン** — オブジェクト直接変更禁止
- **エラーハンドリング必須** — 全async処理に try/catch + ユーザーフレンドリーメッセージ
- **TDD** — テスト先行（RED → GREEN → IMPROVE）
- **80%カバレッジ** — ユニット + インテグレーションテスト必須
- **Conventional Commits** — `feat:`, `fix:`, `test:`, `refactor:` プレフィックス必須
- **shadcn/ui活用** — UI コンポーネントは shadcn/ui を優先使用
- **モバイルファースト** — sm/md/lg ブレークポイント対応

---

## Tranche Strategy

**7フェーズ + 最終監査** の自己完結型垂直スライス:

1. **Foundation** (T002) — Next.js初期化・TypeScript設定・Tailwind・shadcn/ui・レイアウト
2. **Data Layer** (T003) — IndexedDB/localStorage・Zustand store・型定義
3. **Subscription CRUD** (T004) — リスト・フォーム・編集・削除・検索
4. **CSV Import** (T005) — パース・自動分類・プレビュー・確定
5. **Receipt OCR** (T006) — アップロード・Tesseract処理・フォーム連携
6. **Dashboard** (T007) — カード・グラフ・ハイライト・データ集計
7. **支出改善提案 + UX** (T008, T009) — 提案ロジック・ダークモード・オンボーディング・アニメーション
8. **Final Audit** (T999) — 全機能E2E確認・カバレッジ・ビルド検証

---

## Next Command

```
/goal Follow docs/goals/subscription-app-mvp/goal.md.
```
