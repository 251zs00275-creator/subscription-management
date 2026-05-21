import type { AchievementId } from '@/types'

export type DialogueState = 'neutral' | 'happy' | 'worried' | 'alert'

export const MASCOT_DIALOGUES: Record<DialogueState, string[]> = {
  neutral: ['調子はどうですか？', '支出を一緒に見ています', '今日も整理していきましょう'],
  happy: ['いい流れです', '実績解除、おめでとうございます', 'この調子で続けましょう'],
  worried: ['少し支出が増えています', '一度だけ見直しましょう', '無理なく整えましょう'],
  alert: ['確認したい項目があります', '節約チャンスを見つけました', '見逃し注意です'],
}

export const STATE_LABELS: Record<DialogueState, string> = {
  neutral: '監視中',
  happy: '絶好調',
  worried: '注意',
  alert: '要確認',
}

const ACHIEVEMENT_DIALOGUES: Partial<Record<AchievementId | string, string>> = {
  first_subscription: '最初の登録、ちゃんと見たよ。ここから固定費管理の始まりだね。',
  five_subscriptions: '5件まで整理できたね。そろそろ無駄な支払いも見つけやすくなってきたよ。',
  ten_subscriptions: '10件も管理できてる。ここまで来たら、もう見落としにくいね。',
  first_delete: '不要な支払いをひとつ消せたね。こういう一手が、あとで効いてくるよ。',
  first_toggle: '使っているものと止めるものを分けられたね。いい判断。',
  first_import: 'CSV取り込み成功。まとめて整理できると、見える景色が変わるよ。',
  first_ocr: 'レシート読み取り成功。手入力を減らして、続けやすくしていこう。',
  budget_master: '支出がかなり整ってきたね。固定費の扱いが上手くなってる。',
  organizer: '整理の手つきが安定してきたね。続けられる管理が一番強いよ。',
  streak_3: '3日連続。短く見えるけど、習慣の入口としては十分だよ。',
  streak_week: '1週間続いたね。えらい、ちゃんと見てたよ。',
  streak_14: '2週間継続。ここまで来たら、もう少し欲張ってもいいかもね。',
  streak_30: '30日継続。これはかなり強い記録。胸を張っていいよ。',
  three_deletes: '3件削除。固定費を減らす判断、ちゃんとできてる。',
  budget_30k: '月3万円以内が見えてきたね。無理なく続く形にしていこう。',
  budget_10k: '月1万円以内。かなり引き締まってる。油断しないでね。',
  fifteen_subscriptions: '15件も管理対象に入ったね。ここからは見直しの精度が大事。',
  all_categories: '全カテゴリを使い分けられたね。分類がきれいだと分析も強くなるよ。',
  ten_edits: '細かい修正を重ねられてる。管理は派手さより、この丁寧さが大事。',
  three_imports: '取り込み3回目。もうデータ整理の流れはできてるね。',
}

export function getAchievementDialogue(id: string, title: string): string {
  if (id.startsWith('calendar_')) return `${title}。今日も来たんだ、ちゃんと続いてるね。`
  return ACHIEVEMENT_DIALOGUES[id] ?? `${title}、達成したよ。次もちゃんと見てるからね。`
}
