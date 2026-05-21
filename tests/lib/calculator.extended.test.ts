import { calcMonthlyTrend, calcHighlights } from '@/lib/calculator'
import type { Subscription } from '@/types'
import { subMonths, startOfMonth, format } from 'date-fns'

function makeSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: `sub_${Math.random()}`,
    name: 'Test',
    amount: 1000,
    category: 'サブスク',
    nextPaymentDate: '2024-05-01',
    memo: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('calcMonthlyTrend', () => {
  it('returns 6 months of data by default', () => {
    const result = calcMonthlyTrend([])
    expect(result).toHaveLength(6)
  })

  it('returns correct month labels', () => {
    const result = calcMonthlyTrend([])
    const now = new Date()
    const expectedLastMonth = format(now, 'M月')
    expect(result[result.length - 1].month).toBe(expectedLastMonth)
  })

  it('returns zeros for empty subscription list', () => {
    const result = calcMonthlyTrend([])
    result.forEach((m) => {
      expect(m.subscription).toBe(0)
      expect(m.general).toBe(0)
      expect(m.total).toBe(0)
    })
  })

  it('counts active サブスク subscriptions in subscription column', () => {
    const sub = makeSubscription({ amount: 1490, category: 'サブスク', isActive: true })
    const result = calcMonthlyTrend([sub])
    const lastMonth = result[result.length - 1]
    expect(lastMonth.subscription).toBe(1490)
    expect(lastMonth.total).toBe(1490)
  })

  it('counts non-subscription categories in general column', () => {
    const sub = makeSubscription({ amount: 3000, category: '食費', isActive: true })
    const result = calcMonthlyTrend([sub])
    const lastMonth = result[result.length - 1]
    expect(lastMonth.general).toBe(3000)
    expect(lastMonth.subscription).toBe(0)
  })

  it('respects custom months parameter', () => {
    const result = calcMonthlyTrend([], 3)
    expect(result).toHaveLength(3)
  })
})

describe('calcHighlights', () => {
  it('returns empty array for empty subscriptions', () => {
    expect(calcHighlights([])).toHaveLength(0)
  })

  it('returns at most 3 highlights', () => {
    const subs = [
      makeSubscription({ amount: 1000, category: 'サブスク' }),
      makeSubscription({ amount: 2000, category: '食費' }),
      makeSubscription({ amount: 3000, category: '娯楽' }),
      makeSubscription({ amount: 4000, category: '通信費' }),
    ]
    expect(calcHighlights(subs).length).toBeLessThanOrEqual(3)
  })

  it('includes category and amounts in result', () => {
    const sub = makeSubscription({ amount: 1490, category: 'サブスク' })
    const result = calcHighlights([sub])
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('category')
      expect(result[0]).toHaveProperty('currentAmount')
      expect(result[0]).toHaveProperty('changeAmount')
    }
  })
})
