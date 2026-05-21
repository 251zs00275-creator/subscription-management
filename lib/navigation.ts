import type { AppFeature } from '@/lib/characters'

export type NavIconKey =
  | 'dashboard'
  | 'subscriptions'
  | 'import'
  | 'history'
  | 'receipt'
  | 'trends'
  | 'suggestions'
  | 'achievements'

export interface AppNavItem {
  href: string
  label: string
  shortLabel: string
  feature: AppFeature
  icon: NavIconKey
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: '/', label: 'ダッシュボード', shortLabel: 'ホーム', feature: 'dashboard', icon: 'dashboard' },
  { href: '/subscriptions', label: 'サブスク管理', shortLabel: 'サブスク', feature: 'subscriptions', icon: 'subscriptions' },
  { href: '/import', label: 'CSVインポート', shortLabel: '取込', feature: 'import', icon: 'import' },
  { href: '/history', label: '購入履歴', shortLabel: '履歴', feature: 'history', icon: 'history' },
  { href: '/receipt', label: 'レシート読取', shortLabel: '読取', feature: 'receipt', icon: 'receipt' },
  { href: '/trends', label: '推移分析', shortLabel: '分析', feature: 'trends', icon: 'trends' },
  { href: '/suggestions', label: '改善提案', shortLabel: '提案', feature: 'suggestions', icon: 'suggestions' },
  { href: '/achievements', label: '実績', shortLabel: '実績', feature: 'achievements', icon: 'achievements' },
]
