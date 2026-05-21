# Character Assets

このフォルダは、アプリ内で使用するキャラクター画像を役割別に整理しています。
各キャラは `optimized/portrait.jpg` をビジュアルノベル風パネル、`optimized/mascot.jpg` を小型案内表示に使います。
アプリ側の参照先は `lib/characters.ts` で一元管理しています。

## 表情・状態の扱い

各キャラに `expressions/normal.jpg`、`expressions/happy.jpg`、`expressions/worried.jpg`、`expressions/alert.jpg` を用意しています。
現時点では採用立ち絵をベースにした差分スロットで、以下の状態をコンポーネント側のセリフ・動き・発光色と組み合わせて切り替えています。

- `neutral`: 通常案内
- `happy`: 実績解除、良好状態
- `worried`: 支出増加、注意状態
- `alert`: 未使用サブスク、要確認状態

今後、同一キャラの厳密な表情描き分け画像を追加する場合は、この `expressions/*.jpg` を差し替えます。

## 最適化方針

表示は Next.js `Image` コンポーネント経由で行い、実表示サイズに合わせて `sizes` を指定しています。
主要表示画像は `optimized/*.jpg` に圧縮済みです。元PNGは採用元・再編集用として保持しています。
デプロイ時に WebP/AVIF へさらに変換できる環境がある場合は、`optimized/` 配下を差し替えて `lib/characters.ts` の拡張子を更新します。

## main-heroine

ゆるふわメインヒロイン。通常案内、ダッシュボード、日常サポート向け。

- `portrait.png`: 通常立ち絵
- `mascot.png`: マスコット版
- `optimized/portrait.jpg`: アプリ表示用の軽量立ち絵
- `optimized/mascot.jpg`: アプリ表示用の軽量マスコット
- `expressions/*.jpg`: VN表示用の状態別スロット

## analyst-cool

黒スーツ眼鏡のクール系分析担当。支出分析、グラフ、削減提案向け。

- `portrait.png`: 通常立ち絵
- `mascot.png`: マスコット版
- `optimized/portrait.jpg`: アプリ表示用の軽量立ち絵
- `optimized/mascot.jpg`: アプリ表示用の軽量マスコット
- `expressions/*.jpg`: VN表示用の状態別スロット
- `variants/first-concept.png`: 初期案

## reminder-jirai

地雷系リマインダー担当。支払日通知、アラート、実績解除向け。

- `portrait.png`: 通常立ち絵
- `mascot.png`: マスコット版
- `optimized/portrait.jpg`: アプリ表示用の軽量立ち絵
- `optimized/mascot.jpg`: アプリ表示用の軽量マスコット
- `expressions/*.jpg`: VN表示用の状態別スロット
- `variants/energetic-concept.png`: 元気系初期案

## advisor-danger

危険なお姉さん系アドバイザー。月次レビュー、節約助言、強めの警告演出向け。

- `portrait.png`: 通常立ち絵
- `mascot.png`: マスコット版
- `optimized/portrait.jpg`: アプリ表示用の軽量立ち絵
- `optimized/mascot.jpg`: アプリ表示用の軽量マスコット
- `expressions/*.jpg`: VN表示用の状態別スロット
- `variants/elegant-advisor.png`: 上品なお姉さん初期案
- `variants/danger-business.png`: 危険なビジネス寄り案
- `variants/loose-business.png`: だぼっとした業務服寄り案

## events

画面演出用のイベント画像です。

- `splash.png`: オンボーディング用の集合スプラッシュ
- `achievement-celebrate.png`: 実績解除トースト用の祝福画像
- `optimized/splash.jpg`: アプリ表示用の軽量スプラッシュ
- `optimized/achievement-celebrate.jpg`: アプリ表示用の軽量祝福画像
