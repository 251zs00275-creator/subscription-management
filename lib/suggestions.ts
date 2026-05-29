import { differenceInMonths, parseISO } from 'date-fns'
import type { Subscription, Suggestion, Category } from '@/types'

function generateId(): string {
  return crypto.randomUUID()
}

export function detectInactiveSubscriptions(
  subscriptions: Subscription[],
  thresholdMonths = 3
): Suggestion[] {
  const now = new Date()
  return subscriptions
    .filter((s) => {
      if (s.isActive) return false
      const updatedAt = parseISO(s.updatedAt)
      return differenceInMonths(now, updatedAt) >= thresholdMonths
    })
    .map((s) => ({
      id: generateId(),
      type: 'inactive' as const,
      title: `${s.name} が${thresholdMonths}ヶ月以上停止中`,
      description: `月額 ¥${s.amount.toLocaleString()} のサービスが長期間無効になっています。解約を検討しましょう。`,
      potentialSavings: s.amount * 12,
      subscriptionId: s.id,
    }))
}

export function detectSpendingSpikes(
  subscriptions: Subscription[],
  thresholdPercent = 20
): Suggestion[] {
  const now = new Date()

  function monthlyAmountFor(category: Category, monthsAgo: number): number {
    const targetMonth = new Date(now)
    targetMonth.setMonth(targetMonth.getMonth() - monthsAgo)
    const year = targetMonth.getFullYear()
    const month = targetMonth.getMonth()

    return subscriptions
      .filter((s) => {
        if (s.category !== category || !s.isActive) return false
        const created = parseISO(s.createdAt)
        return created.getFullYear() === year && created.getMonth() === month
      })
      .reduce((sum, s) => sum + s.amount, 0)
  }

  const categories: Category[] = [
    'サブスク', '食費', '通信費', '娯楽', '交通費', '日用品', '医療', 'その他',
  ]

  const results: Suggestion[] = []
  for (const category of categories) {
    const current = monthlyAmountFor(category, 0)
    const previous = monthlyAmountFor(category, 1)
    if (previous === 0 || current === 0) continue
    const changePercent = Math.round(((current - previous) / previous) * 100)
    if (changePercent < thresholdPercent) continue
    results.push({
      id: generateId(),
      type: 'spike',
      title: `${category}が前月比+${changePercent}%増加`,
      description: `前月 ¥${previous.toLocaleString()} → 今月 ¥${current.toLocaleString()}。支出の増加を確認してください。`,
      category,
    })
  }
  return results
}

export function calcAnnualSavings(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => !s.isActive)
    .reduce((sum, s) => sum + s.amount * 12, 0)
}

export function generateSuggestions(subscriptions: Subscription[]): Suggestion[] {
  const inactive = detectInactiveSubscriptions(subscriptions)
  const spikes = detectSpendingSpikes(subscriptions)
  const annualSavings = calcAnnualSavings(subscriptions)

  const suggestions: Suggestion[] = [...inactive, ...spikes]

  if (annualSavings > 0) {
    suggestions.unshift({
      id: generateId(),
      type: 'savings',
      title: `年間最大 ¥${annualSavings.toLocaleString()} 節約可能`,
      description: `無効にしているサービスを解約すると年間 ¥${annualSavings.toLocaleString()} の節約になります。`,
      potentialSavings: annualSavings,
    })
  }

  return suggestions
}
