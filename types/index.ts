export type Category =
  | 'サブスク'
  | '食費'
  | '通信費'
  | '娯楽'
  | '交通費'
  | '日用品'
  | '医療'
  | 'その他'

export const CATEGORIES: Category[] = [
  'サブスク',
  '食費',
  '通信費',
  '娯楽',
  '交通費',
  '日用品',
  '医療',
  'その他',
]

export interface Subscription {
  id: string
  name: string
  amount: number
  category: Category
  nextPaymentDate: string
  memo: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SubscriptionFormData {
  name: string
  amount: number
  category: Category
  nextPaymentDate: string
  memo: string
  isActive: boolean
}

export interface CsvRow {
  date: string
  description: string
  amount: number
  category: Category
  isValid: boolean
  error?: string
}

export interface ImportResult {
  rows: CsvRow[]
  totalRows: number
  validRows: number
  invalidRows: number
}

export interface OcrResult {
  date: string
  storeName: string
  amount: number
  confidence: number
  success: boolean
  error?: string
}

export interface MonthlyTotal {
  month: string
  subscription: number
  general: number
  total: number
}

export interface CategoryTotal {
  category: Category
  amount: number
  percentage: number
}

export interface HighlightItem {
  category: Category
  currentAmount: number
  previousAmount: number
  changeAmount: number
  changePercentage: number
}

export interface Suggestion {
  id: string
  type: 'inactive' | 'spike' | 'savings' | 'llm-insight'
  title: string
  description: string
  potentialSavings?: number
  subscriptionId?: string
  category?: Category
  source?: 'rule-based' | 'llm'
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  hasCompletedOnboarding: boolean
  selectedCharacterId?: string
  lastCharacterSelectDate?: string
  lastLoginBonusClaimDate?: string
  characterAffection?: Record<string, CharacterAffection>
  featureVisitDates?: Record<string, string>
}

export interface CategoryMonthlyData {
  month: string
  monthKey: string
  サブスク: number
  食費: number
  通信費: number
  娯楽: number
  交通費: number
  日用品: number
  医療: number
  その他: number
  total: number
}

export interface CustomKeywordRule {
  id: string
  keyword: string
  category: Category
}

export const CATEGORY_COLORS: Record<Category, string> = {
  サブスク: '#3b82f6',
  食費: '#f97316',
  通信費: '#8b5cf6',
  娯楽: '#ec4899',
  交通費: '#14b8a6',
  日用品: '#f59e0b',
  医療: '#22c55e',
  その他: '#94a3b8',
}

export const CATEGORY_EMOJIS: Record<Category, string> = {
  サブスク: '📺',
  食費: '🍜',
  通信費: '📱',
  娯楽: '🎮',
  交通費: '🚃',
  日用品: '🧴',
  医療: '💊',
  その他: '📦',
}

export type AchievementId =
  | 'first_subscription'
  | 'five_subscriptions'
  | 'ten_subscriptions'
  | 'first_delete'
  | 'first_toggle'
  | 'first_import'
  | 'first_ocr'
  | 'budget_master'
  | 'organizer'
  | 'streak_week'
  | 'streak_3'
  | 'streak_14'
  | 'streak_30'
  | 'three_deletes'
  | 'budget_30k'
  | 'budget_10k'
  | 'fifteen_subscriptions'
  | 'all_categories'
  | 'ten_edits'
  | 'three_imports'

export interface Achievement {
  id: AchievementId
  title: string
  emoji: string
  description: string
  unlockedAt: string | null
  claimedAt?: string | null
  points: number
}

export interface CharacterAffection {
  level: number
  points: number
  unlockedGalleryIds: string[]
}

export interface GameStats {
  totalPoints: number
  level: number
  currentStreak: number
  lastVisitDate: string
  achievements: Achievement[]
  totalSaved: number
  actionCount: {
    added: number
    deleted: number
    edited: number
    imported: number
  }
  monthlyVisits: string[]  // YYYY-MM-DD の配列（当月のみ）
}
