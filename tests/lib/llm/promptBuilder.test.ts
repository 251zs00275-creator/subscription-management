import { buildAnalysisPrompt } from '@/lib/llm/promptBuilder'
import type { Subscription } from '@/types'

function buildSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub-1',
    name: 'Netflix',
    amount: 1500,
    category: 'サブスク',
    nextPaymentDate: '2026-07-01',
    memo: 'メモ',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('buildAnalysisPrompt', () => {
  it('サブスクの名前・金額・カテゴリ・有効状態・次回支払日を含める', () => {
    const prompt = buildAnalysisPrompt([
      buildSubscription({ name: 'Netflix', amount: 1500, category: 'サブスク', isActive: true }),
    ])

    expect(prompt).toContain('Netflix')
    expect(prompt).toContain('1500')
    expect(prompt).toContain('サブスク')
    expect(prompt).toContain('2026-07-01')
  })

  it('内部識別子やメモ、タイムスタンプは含めない', () => {
    const prompt = buildAnalysisPrompt([
      buildSubscription({ id: 'sub-secret-id', memo: '秘密のメモ', createdAt: '2026-01-01T00:00:00.000Z' }),
    ])

    expect(prompt).not.toContain('sub-secret-id')
    expect(prompt).not.toContain('秘密のメモ')
    expect(prompt).not.toContain('2026-01-01T00:00:00.000Z')
  })

  it('JSON形式での出力指示と既知のtype候補を含める', () => {
    const prompt = buildAnalysisPrompt([buildSubscription()])

    expect(prompt).toContain('JSON')
    expect(prompt).toContain('title')
    expect(prompt).toContain('description')
    expect(prompt).toContain('potentialSavings')
  })

  it('複数のサブスクをそれぞれ含める', () => {
    const prompt = buildAnalysisPrompt([
      buildSubscription({ id: 'sub-1', name: 'Netflix' }),
      buildSubscription({ id: 'sub-2', name: 'Spotify', isActive: false }),
    ])

    expect(prompt).toContain('Netflix')
    expect(prompt).toContain('Spotify')
  })

  it('サブスクが0件でも例外を投げず文字列を返す', () => {
    expect(() => buildAnalysisPrompt([])).not.toThrow()
    expect(typeof buildAnalysisPrompt([])).toBe('string')
  })
})
