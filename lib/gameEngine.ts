import type { Achievement, AchievementId, GameStats, Subscription } from '@/types'

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2600, 3600]
const LEVEL_TITLES = [
  'サブスク初心者',
  '節約見習い',
  '支出管理係',
  '財務委員',
  '節約スター',
  '支出分析士',
  '家計のプロ',
  '節約の達人',
  'お金の賢者',
  '家計学園長',
]

export function calculateLevel(totalPoints: number): number {
  return LEVEL_THRESHOLDS.filter((t) => totalPoints >= t).length
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(Math.max(level - 1, 0), LEVEL_TITLES.length - 1)]
}

export function getXpForNextLevel(level: number): number {
  if (level >= 10) return LEVEL_THRESHOLDS[9]
  return LEVEL_THRESHOLDS[level]
}

export function getLevelProgress(totalPoints: number, level: number): number {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[9]
  if (nextThreshold === currentThreshold) return 100
  return Math.min(100, ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
}

export function updateStreak(gameStats: GameStats, todayISO: string): GameStats {
  const today = todayISO.slice(0, 10)
  if (gameStats.lastVisitDate === today) return gameStats

  const prevDate = new Date(gameStats.lastVisitDate)
  const todayDate = new Date(today)
  const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / 86_400_000)

  if (diffDays === 1) {
    return { ...gameStats, currentStreak: gameStats.currentStreak + 1, lastVisitDate: today }
  }
  return { ...gameStats, currentStreak: 1, lastVisitDate: today }
}

export const CALENDAR_MILESTONES: Record<number, number> = {
  7: 20,
  14: 35,
  21: 50,
  28: 70,
}

export function getCalendarMilestoneBonus(visitCount: number): number {
  return CALENDAR_MILESTONES[visitCount] ?? 0
}

export function updateMonthlyVisits(
  monthlyVisits: string[],
  todayISO: string
): { visits: string[]; isNewVisit: boolean } {
  const today = todayISO.slice(0, 10)
  const currentMonth = today.slice(0, 7)
  const thisMonthVisits = monthlyVisits.filter((d) => d.startsWith(currentMonth))
  if (thisMonthVisits.includes(today)) {
    return { visits: thisMonthVisits, isNewVisit: false }
  }
  return { visits: [...thisMonthVisits, today], isNewVisit: true }
}

function achievement(
  id: AchievementId,
  title: string,
  emoji: string,
  description: string,
  points: number
): Achievement {
  return { id, title, emoji, description, unlockedAt: null, claimedAt: null, points }
}

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  achievement('first_subscription', 'はじめての一歩', '🌸', '最初のサブスクを登録しました', 20),
  achievement('five_subscriptions', 'コレクター', '📚', '5件のサブスクを管理中', 30),
  achievement('ten_subscriptions', 'サブスクマスター', '⭐', '10件のサブスクを管理中', 50),
  achievement('first_delete', '節約の第一歩', '✂️', 'サブスクを削除しました', 25),
  achievement('first_toggle', '見直し上手', '🔁', 'サブスクを一時停止しました', 15),
  achievement('first_import', 'インポーター', '📥', 'CSVインポートを完了しました', 30),
  achievement('first_ocr', 'レシートハンター', '🧾', 'レシートを読み取りました', 25),
  achievement('budget_master', '月5万円以下', '💎', '月額合計を5万円以下に抑えています', 50),
  achievement('organizer', 'カテゴリマスター', '🗂️', '5種類以上のカテゴリを使用', 35),
  achievement('streak_week', '継続の力', '🔥', '7日間連続でアプリを開きました', 40),
  achievement('streak_3', 'ウォームアップ', '🔥', '3日連続でアプリを開きました', 15),
  achievement('streak_14', '2週間の習慣', '📅', '14日連続でアプリを開きました', 60),
  achievement('streak_30', '節約の申し子', '🏆', '30日連続でアプリを開きました', 100),
  achievement('three_deletes', '解約の鬼', '✂️', '3件を解約しました', 40),
  achievement('budget_30k', 'スリム家計', '💰', '月額合計を3万円以下に抑えています', 40),
  achievement('budget_10k', '超節約家', '👛', '月額合計を1万円以下に抑えています', 75),
  achievement('fifteen_subscriptions', 'ヘビーユーザー', '🎖️', '15件のサブスクを管理中', 70),
  achievement('all_categories', '全カテゴリ制覇', '🌈', '全8カテゴリを使用しました', 50),
  achievement('ten_edits', '編集マニア', '✏️', '10回編集しました', 30),
  achievement('three_imports', 'データ職人', '📊', '3回CSVインポートを完了しました', 45),
]

export function evaluateAchievements(
  gameStats: GameStats,
  subscriptions: Subscription[]
): AchievementId[] {
  const unlocked: AchievementId[] = []
  const alreadyUnlocked = new Set(
    gameStats.achievements.filter((a) => a.unlockedAt !== null).map((a) => a.id)
  )

  const activeCount = subscriptions.filter((s) => s.isActive).length
  const monthlyTotal = subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0)
  const uniqueCategories = new Set(subscriptions.map((s) => s.category)).size

  const checks: Array<{ id: AchievementId; condition: boolean }> = [
    { id: 'first_subscription', condition: gameStats.actionCount.added >= 1 },
    { id: 'five_subscriptions', condition: activeCount >= 5 },
    { id: 'ten_subscriptions', condition: activeCount >= 10 },
    { id: 'fifteen_subscriptions', condition: activeCount >= 15 },
    { id: 'first_delete', condition: gameStats.actionCount.deleted >= 1 },
    { id: 'three_deletes', condition: gameStats.actionCount.deleted >= 3 },
    { id: 'first_toggle', condition: gameStats.actionCount.edited >= 1 },
    { id: 'ten_edits', condition: gameStats.actionCount.edited >= 10 },
    { id: 'first_import', condition: gameStats.actionCount.imported >= 1 },
    { id: 'three_imports', condition: gameStats.actionCount.imported >= 3 },
    { id: 'first_ocr', condition: false },
    { id: 'budget_master', condition: subscriptions.length >= 3 && monthlyTotal <= 50000 },
    { id: 'budget_30k', condition: subscriptions.length >= 3 && monthlyTotal <= 30000 },
    { id: 'budget_10k', condition: subscriptions.length >= 3 && monthlyTotal <= 10000 },
    { id: 'organizer', condition: uniqueCategories >= 5 },
    { id: 'all_categories', condition: uniqueCategories >= 8 },
    { id: 'streak_3', condition: gameStats.currentStreak >= 3 },
    { id: 'streak_week', condition: gameStats.currentStreak >= 7 },
    { id: 'streak_14', condition: gameStats.currentStreak >= 14 },
    { id: 'streak_30', condition: gameStats.currentStreak >= 30 },
  ]

  for (const { id, condition } of checks) {
    if (condition && !alreadyUnlocked.has(id)) unlocked.push(id)
  }

  return unlocked
}

export function buildInitialGameStats(): GameStats {
  const today = new Date().toISOString().slice(0, 10)
  return {
    totalPoints: 0,
    level: 1,
    currentStreak: 1,
    lastVisitDate: today,
    achievements: ACHIEVEMENT_DEFINITIONS.map((a) => ({ ...a })),
    totalSaved: 0,
    actionCount: { added: 0, deleted: 0, edited: 0, imported: 0 },
    monthlyVisits: [today],
  }
}
