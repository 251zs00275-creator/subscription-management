import { buildInitialGameStats, calculateLevel, evaluateAchievements } from '@/lib/gameEngine'

describe('gameEngine manual rewards', () => {
  it('initializes achievements as unclaimed rewards', () => {
    const stats = buildInitialGameStats()
    expect(stats.achievements[0].unlockedAt).toBeNull()
    expect(stats.achievements[0].claimedAt).toBeNull()
    expect(stats.totalPoints).toBe(0)
  })

  it('detects achievements without mutating XP totals', () => {
    const stats = {
      ...buildInitialGameStats(),
      actionCount: { added: 1, deleted: 0, edited: 0, imported: 0 },
    }
    expect(evaluateAchievements(stats, [])).toContain('first_subscription')
    expect(stats.totalPoints).toBe(0)
  })

  it('calculates level only from claimed point totals', () => {
    expect(calculateLevel(0)).toBe(1)
    expect(calculateLevel(50)).toBe(2)
  })
})
