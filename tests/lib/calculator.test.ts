import {
  calcMonthlyTotal,
  calcCategoryTotals,
  formatCurrency,
} from '@/lib/calculator'
import type { Subscription } from '@/types'

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

describe('calcMonthlyTotal', () => {
  it('sums active subscriptions', () => {
    const subs = [
      makeSubscription({ amount: 1000 }),
      makeSubscription({ amount: 2000 }),
    ]
    expect(calcMonthlyTotal(subs)).toBe(3000)
  })

  it('excludes inactive subscriptions', () => {
    const subs = [
      makeSubscription({ amount: 1000 }),
      makeSubscription({ amount: 2000, isActive: false }),
    ]
    expect(calcMonthlyTotal(subs)).toBe(1000)
  })

  it('returns 0 for empty array', () => {
    expect(calcMonthlyTotal([])).toBe(0)
  })

  it('returns 0 when all inactive', () => {
    const subs = [makeSubscription({ isActive: false })]
    expect(calcMonthlyTotal(subs)).toBe(0)
  })
})

describe('calcCategoryTotals', () => {
  it('groups amounts by category', () => {
    const subs = [
      makeSubscription({ amount: 1490, category: 'サブスク' }),
      makeSubscription({ amount: 980, category: 'サブスク' }),
      makeSubscription({ amount: 3000, category: '食費' }),
    ]
    const totals = calcCategoryTotals(subs)
    const subscriptionTotal = totals.find((t) => t.category === 'サブスク')
    expect(subscriptionTotal?.amount).toBe(2470)
  })

  it('excludes categories with 0 amount', () => {
    const subs = [makeSubscription({ amount: 1000, category: 'サブスク' })]
    const totals = calcCategoryTotals(subs)
    expect(totals.length).toBe(1)
    expect(totals[0].category).toBe('サブスク')
  })

  it('calculates percentage correctly', () => {
    const subs = [
      makeSubscription({ amount: 1000, category: 'サブスク' }),
      makeSubscription({ amount: 1000, category: '食費' }),
    ]
    const totals = calcCategoryTotals(subs)
    const sub = totals.find((t) => t.category === 'サブスク')
    expect(sub?.percentage).toBe(50)
  })

  it('excludes inactive subscriptions', () => {
    const subs = [
      makeSubscription({ amount: 1000, category: 'サブスク' }),
      makeSubscription({ amount: 2000, category: 'サブスク', isActive: false }),
    ]
    const totals = calcCategoryTotals(subs)
    const sub = totals.find((t) => t.category === 'サブスク')
    expect(sub?.amount).toBe(1000)
  })
})

describe('formatCurrency', () => {
  it('formats number as JPY currency', () => {
    const result = formatCurrency(1490)
    expect(result).toMatch(/1,490/)
    expect(result).toMatch(/[¥￥]/)
  })

  it('formats 0 correctly', () => {
    const result = formatCurrency(0)
    expect(result).toMatch(/0/)
  })
})
