import {
  SUBSCRIPTION_PRESETS,
  SUBSCRIPTION_PRESET_GROUPS,
  toMonthlyAmount,
  formatPresetPlanLabel,
  findSubscriptionPresetPlan,
  toSubscriptionFormData,
} from '@/lib/subscriptionPresets'
import type { SubscriptionFormData } from '@/types'

const baseFormData: SubscriptionFormData = {
  name: '',
  amount: 0,
  category: 'その他',
  nextPaymentDate: '2024-05-01',
  memo: '',
  isActive: false,
}

describe('subscriptionPresets', () => {
  describe('SUBSCRIPTION_PRESETS / SUBSCRIPTION_PRESET_GROUPS', () => {
    it('only uses groups that are declared in SUBSCRIPTION_PRESET_GROUPS', () => {
      const usedGroups = new Set(SUBSCRIPTION_PRESETS.map((p) => p.group))
      usedGroups.forEach((group) => {
        expect(SUBSCRIPTION_PRESET_GROUPS).toContain(group)
      })
    })

    it('gives every preset a unique id and at least one plan', () => {
      const ids = SUBSCRIPTION_PRESETS.map((p) => p.id)
      expect(new Set(ids).size).toBe(ids.length)
      SUBSCRIPTION_PRESETS.forEach((preset) => {
        expect(preset.plans.length).toBeGreaterThan(0)
      })
    })

    it('computes monthlyAmount for each plan consistently with its billing cycle', () => {
      SUBSCRIPTION_PRESETS.forEach((preset) => {
        preset.plans.forEach((plan) => {
          expect(plan.monthlyAmount).toBe(toMonthlyAmount(plan.amount, plan.billingCycle))
        })
      })
    })
  })

  describe('toMonthlyAmount', () => {
    it('returns the amount unchanged for monthly billing', () => {
      expect(toMonthlyAmount(1000, 'monthly')).toBe(1000)
    })

    it('divides by 12 and rounds for annual billing', () => {
      expect(toMonthlyAmount(5900, 'annual')).toBe(492)
    })

    it('divides by 3 and rounds for quarterly billing', () => {
      expect(toMonthlyAmount(1000, 'quarterly')).toBe(333)
    })
  })

  describe('formatPresetPlanLabel', () => {
    const preset = SUBSCRIPTION_PRESETS.find((p) => p.id === 'amazon-prime')!

    it('labels monthly plans with the billing-cycle text and the plain amount', () => {
      const monthlyPlan = preset.plans.find((p) => p.id === 'monthly')!
      expect(formatPresetPlanLabel(preset, monthlyPlan)).toBe('Amazon Prime / 月額プラン（月額: ¥600）')
    })

    it('labels annual plans with the monthly-equivalent amount', () => {
      const annualPlan = preset.plans.find((p) => p.id === 'annual')!
      expect(formatPresetPlanLabel(preset, annualPlan)).toBe(
        `Amazon Prime / 年額プラン（年額: ¥${annualPlan.monthlyAmount.toLocaleString()}/月換算）`
      )
    })
  })

  describe('findSubscriptionPresetPlan', () => {
    it('returns the matching preset and plan for a valid "presetId:planId" value', () => {
      const found = findSubscriptionPresetPlan('netflix:standard')

      expect(found?.preset.serviceName).toBe('Netflix')
      expect(found?.plan.name).toBe('スタンダード')
    })

    it('returns null when the preset id does not exist', () => {
      expect(findSubscriptionPresetPlan('does-not-exist:standard')).toBeNull()
    })

    it('returns null when the plan id does not exist on an existing preset', () => {
      expect(findSubscriptionPresetPlan('netflix:does-not-exist')).toBeNull()
    })

    it('returns null for an empty value', () => {
      expect(findSubscriptionPresetPlan('')).toBeNull()
    })
  })

  describe('toSubscriptionFormData', () => {
    const preset = SUBSCRIPTION_PRESETS.find((p) => p.id === 'netflix')!

    it('fills name, amount, category and a descriptive memo from the preset and plan', () => {
      const standardPlan = preset.plans.find((p) => p.id === 'standard')!

      const result = toSubscriptionFormData(preset, standardPlan, baseFormData)

      expect(result.name).toBe('Netflix')
      expect(result.amount).toBe(standardPlan.monthlyAmount)
      expect(result.category).toBe(preset.category)
      expect(result.isActive).toBe(true)
      expect(result.memo).toContain('スタンダード')
      expect(result.memo).toContain(`料金確認日: ${preset.checkedAt}`)
      expect(result.memo).toContain(preset.sourceName)
    })

    it('notes the monthly-equivalent amount in the memo for non-monthly plans', () => {
      const amazonPrime = SUBSCRIPTION_PRESETS.find((p) => p.id === 'amazon-prime')!
      const annualPlan = amazonPrime.plans.find((p) => p.id === 'annual')!

      const result = toSubscriptionFormData(amazonPrime, annualPlan, baseFormData)

      expect(result.memo).toContain('月額換算')
      expect(result.memo).toContain(`${annualPlan.monthlyAmount.toLocaleString()}円`)
    })

    it('preserves unrelated fields from the current form data', () => {
      const standardPlan = preset.plans.find((p) => p.id === 'standard')!

      const result = toSubscriptionFormData(preset, standardPlan, {
        ...baseFormData,
        nextPaymentDate: '2026-09-01',
      })

      expect(result.nextPaymentDate).toBe('2026-09-01')
    })
  })
})
