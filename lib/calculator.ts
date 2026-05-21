import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns'
import type { Subscription, MonthlyTotal, CategoryTotal, HighlightItem, Category, CategoryMonthlyData } from '@/types'
import { CATEGORIES } from '@/types'

export function calcMonthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0)
}

export function calcCategoryTotals(subscriptions: Subscription[]): CategoryTotal[] {
  const active = subscriptions.filter((s) => s.isActive)
  const total = active.reduce((sum, s) => sum + s.amount, 0)

  return CATEGORIES.map((category) => {
    const amount = active
      .filter((s) => s.category === category)
      .reduce((sum, s) => sum + s.amount, 0)
    return {
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }
  }).filter((c) => c.amount > 0)
}

export function calcMonthlyTrend(
  subscriptions: Subscription[],
  months = 6
): MonthlyTotal[] {
  const now = new Date()
  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(now, months - 1 - i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const inRange = subscriptions.filter((s) => {
      const created = parseISO(s.createdAt)
      return created <= end
    })

    const subscription = inRange
      .filter((s) => s.category === 'サブスク' && s.isActive)
      .reduce((sum, s) => sum + s.amount, 0)

    const general = inRange
      .filter((s) => s.category !== 'サブスク' && s.isActive)
      .reduce((sum, s) => sum + s.amount, 0)

    return {
      month: format(date, 'M月'),
      subscription,
      general,
      total: subscription + general,
    }
  })
}

export function calcHighlights(
  subscriptions: Subscription[],
  months = 1
): HighlightItem[] {
  const now = new Date()
  const currentStart = startOfMonth(now)
  const currentEnd = endOfMonth(now)
  const prevStart = startOfMonth(subMonths(now, months))
  const prevEnd = endOfMonth(subMonths(now, months))

  function amountForPeriod(category: Category, start: Date, end: Date): number {
    return subscriptions
      .filter(
        (s) =>
          s.category === category &&
          s.isActive &&
          isWithinInterval(parseISO(s.createdAt), { start, end })
      )
      .reduce((sum, s) => sum + s.amount, 0)
  }

  return CATEGORIES.map((category) => {
    const currentAmount = amountForPeriod(category, currentStart, currentEnd)
    const previousAmount = amountForPeriod(category, prevStart, prevEnd)
    const changeAmount = currentAmount - previousAmount
    const changePercentage =
      previousAmount > 0 ? Math.round((changeAmount / previousAmount) * 100) : 0

    return { category, currentAmount, previousAmount, changeAmount, changePercentage }
  })
    .filter((h) => h.currentAmount > 0 || h.previousAmount > 0)
    .sort((a, b) => Math.abs(b.changeAmount) - Math.abs(a.changeAmount))
    .slice(0, 3)
}

export function calcCategoryMonthlyTrend(
  subscriptions: Subscription[],
  months = 6
): CategoryMonthlyData[] {
  const now = new Date()
  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(now, months - 1 - i)
    const end = endOfMonth(date)

    const inRange = subscriptions.filter((s) => {
      const created = parseISO(s.createdAt)
      return created <= end && s.isActive
    })

    const totals = Object.fromEntries(
      CATEGORIES.map((cat) => [
        cat,
        inRange.filter((s) => s.category === cat).reduce((sum, s) => sum + s.amount, 0),
      ])
    ) as Record<Category, number>

    const total = Object.values(totals).reduce((sum, v) => sum + v, 0)

    return {
      month: format(date, 'M月'),
      monthKey: format(date, 'yyyy-MM'),
      ...totals,
      total,
    }
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount)
}
