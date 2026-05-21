import {
  detectInactiveSubscriptions,
  calcAnnualSavings,
  generateSuggestions,
} from '@/lib/suggestions'
import type { Subscription } from '@/types'

function makeSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: `sub_${Math.random()}`,
    name: 'Test Service',
    amount: 1000,
    category: 'サブスク',
    nextPaymentDate: '2024-05-01',
    memo: '',
    isActive: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('detectInactiveSubscriptions', () => {
  it('detects subscriptions inactive for >= 3 months', () => {
    const oldDate = new Date()
    oldDate.setMonth(oldDate.getMonth() - 4)
    const sub = makeSubscription({
      isActive: false,
      updatedAt: oldDate.toISOString(),
    })
    const result = detectInactiveSubscriptions([sub])
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('inactive')
  })

  it('ignores active subscriptions', () => {
    const oldDate = new Date()
    oldDate.setMonth(oldDate.getMonth() - 4)
    const sub = makeSubscription({
      isActive: true,
      updatedAt: oldDate.toISOString(),
    })
    const result = detectInactiveSubscriptions([sub])
    expect(result).toHaveLength(0)
  })

  it('ignores recently deactivated subscriptions', () => {
    const recentDate = new Date()
    recentDate.setMonth(recentDate.getMonth() - 1)
    const sub = makeSubscription({
      isActive: false,
      updatedAt: recentDate.toISOString(),
    })
    const result = detectInactiveSubscriptions([sub])
    expect(result).toHaveLength(0)
  })

  it('includes potential annual savings', () => {
    const oldDate = new Date()
    oldDate.setMonth(oldDate.getMonth() - 4)
    const sub = makeSubscription({
      amount: 1000,
      isActive: false,
      updatedAt: oldDate.toISOString(),
    })
    const result = detectInactiveSubscriptions([sub])
    expect(result[0].potentialSavings).toBe(12000)
  })
})

describe('calcAnnualSavings', () => {
  it('calculates annual savings from inactive subscriptions', () => {
    const subs = [
      makeSubscription({ amount: 1000, isActive: false }),
      makeSubscription({ amount: 500, isActive: false }),
      makeSubscription({ amount: 2000, isActive: true }),
    ]
    expect(calcAnnualSavings(subs)).toBe(18000)
  })

  it('returns 0 when all active', () => {
    const subs = [makeSubscription({ isActive: true })]
    expect(calcAnnualSavings(subs)).toBe(0)
  })
})

describe('generateSuggestions', () => {
  it('includes savings suggestion when inactive subs exist', () => {
    const subs = [makeSubscription({ amount: 1000, isActive: false })]
    const result = generateSuggestions(subs)
    const savings = result.find((s) => s.type === 'savings')
    expect(savings).toBeDefined()
    expect(savings?.potentialSavings).toBe(12000)
  })

  it('returns empty array for empty subscriptions', () => {
    expect(generateSuggestions([])).toHaveLength(0)
  })

  it('returns no savings suggestion when all subscriptions are active', () => {
    const subs = [makeSubscription({ isActive: true })]
    const result = generateSuggestions(subs)
    const savings = result.find((s) => s.type === 'savings')
    expect(savings).toBeUndefined()
  })
})

describe('detectSpendingSpikes', () => {
  it('returns no spikes when only active subs with no previous data', () => {
    const subs = [makeSubscription({ amount: 1000, isActive: true })]
    const { detectSpendingSpikes } = require('@/lib/suggestions')
    const result = detectSpendingSpikes(subs)
    expect(result).toHaveLength(0)
  })

  it('returns no spikes for empty array', () => {
    const { detectSpendingSpikes } = require('@/lib/suggestions')
    expect(detectSpendingSpikes([])).toHaveLength(0)
  })
})
