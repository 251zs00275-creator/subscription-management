# 改善候補ラウンド1 — リファクタ・テストカバレッジ・UI確認体制

## Charter

**Original Request**: CLAUDE.md「現在の改善候補」に記載された3項目（プリセットピッカー分離、テスト追加、UIスクリーンショット確認）に対応する。

**Outcome**:
1. `SubscriptionForm` からプリセット選択ロジックを `PresetPicker` として分離し、見通しを改善する
2. `CategoryReviewPanel`、`ReceiptUpload`、`useDragOrder`、`customRules`、`export`、`subscriptionPresets` にテストを追加し、カバレッジ80%以上を満たす
3. Playwright によるビジュアルリグレッション基盤を構築し、主要画面のスクリーンショット差分検出を自動化する

**Input Shape**: existing_plan（CLAUDE.md「現在の改善候補」セクション + 本goal.md）

**Non-Goals**:
- 新機能の追加（リファクタとテスト・確認体制整備のみ）
- 既存の挙動変更（PresetPicker分離は構造変更のみ、UI/UXは現状維持）

**Likely Misfire**: リファクタ（T002）とビジュアルリグレッション（T005）の順序を誤ると、ベースライン作成後にUI差分が大量発生し誤検知の山になる。T005のベースラインキャプチャは他タスク完了後に行うこと。

**Authority**: Approved

**Completion Proof**:
- `SubscriptionForm` から `PresetPicker` が分離され、既存テストが通過する
- 対象6ファイルのテストが追加され、各カバレッジ ≥80%
- `npx playwright test` がローカルで通り、主要5画面のベースラインスクリーンショットが存在する
- `npm run test:coverage` 全体で ≥80%
- `npm run build` がエラーなく完了
- `tsc --noEmit` でエラーなし

---

## Constraints

- **TypeScript strict mode必須** — `any` 型禁止
- **immutableパターン** — オブジェクト直接変更禁止
- **既存UIへの影響ゼロ** — リファクタは構造変更のみ、見た目・挙動は変えない
- **TDD** — テスト先行（RED → GREEN → IMPROVE）
- **80%カバレッジ** — ユニット + インテグレーションテスト必須
- **Conventional Commits** — `refactor:`, `test:`, `feat:` プレフィックス必須

---

## Tranche Strategy

T002〜T004 は対象ファイルが重複しないため**並行実行可能**。T005 はベースライン安定のため最後に実施する。

1. **PM検証 (T001)** — 対象ファイルの依存関係確認、フェーズ分割の妥当性、Playwright導入要否の最終判断
2. **PresetPicker分離 (T002)** — SubscriptionFormからプリセット選択ロジックを抽出
3. **テスト追加バッチ① (T003)** — CategoryReviewPanel, ReceiptUpload
4. **テスト追加バッチ② (T004)** — useDragOrder, customRules, export, subscriptionPresets
5. **Playwright導入 (T005)** — ビジュアルリグレッション基盤構築（T002〜T004完了後にベースライン作成）
6. **最終監査 (T999)** — カバレッジ・ビルド・型チェック・Playwright実行・回帰なし確認

---

## Next Command

```
/goal Follow docs/goals/improvement-round-1/goal.md.
```
