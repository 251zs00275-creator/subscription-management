import {
  buildInitialGameStats,
  calculateLevel,
  evaluateAchievements,
  getCalendarMilestoneBonus,
  getLevelProgress,
  getLevelTitle,
  getXpForNextLevel,
  updateMonthlyVisits,
  updateStreak,
} from '@/lib/gameEngine'

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

describe('getLevelTitle', () => {
  it('returns the title matching the level', () => {
    expect(getLevelTitle(1)).toBe('サブスク初心者')
    expect(getLevelTitle(5)).toBe('節約スター')
  })

  it('clamps out-of-range levels to the nearest bound', () => {
    expect(getLevelTitle(0)).toBe('サブスク初心者')
    expect(getLevelTitle(-3)).toBe('サブスク初心者')
    expect(getLevelTitle(99)).toBe('家計学園長')
  })
})

describe('getXpForNextLevel', () => {
  it('returns the threshold for the upcoming level', () => {
    expect(getXpForNextLevel(1)).toBe(50)
    expect(getXpForNextLevel(9)).toBe(3600)
  })

  it('returns the final threshold once the max level is reached', () => {
    expect(getXpForNextLevel(10)).toBe(3600)
    expect(getXpForNextLevel(20)).toBe(3600)
  })
})

describe('getLevelProgress', () => {
  it('computes the percentage progress toward the next level', () => {
    expect(getLevelProgress(25, 1)).toBe(50)
    expect(getLevelProgress(0, 1)).toBe(0)
  })

  it('caps progress at 100 even when points exceed the next threshold', () => {
    expect(getLevelProgress(999999, 1)).toBe(100)
  })

  it('returns 100 once the current and next thresholds are equal (max level)', () => {
    expect(getLevelProgress(5000, 10)).toBe(100)
  })
})

describe('updateStreak', () => {
  it('keeps the same stats object when already visited today', () => {
    const stats = { ...buildInitialGameStats(), lastVisitDate: '2024-05-10', currentStreak: 3 }
    expect(updateStreak(stats, '2024-05-10T09:00:00.000Z')).toBe(stats)
  })

  it('increments the streak on a consecutive day', () => {
    const stats = { ...buildInitialGameStats(), lastVisitDate: '2024-05-10', currentStreak: 3 }
    const next = updateStreak(stats, '2024-05-11T09:00:00.000Z')
    expect(next.currentStreak).toBe(4)
    expect(next.lastVisitDate).toBe('2024-05-11')
  })

  it('resets the streak to 1 when a day is skipped', () => {
    const stats = { ...buildInitialGameStats(), lastVisitDate: '2024-05-01', currentStreak: 6 }
    const next = updateStreak(stats, '2024-05-10T09:00:00.000Z')
    expect(next.currentStreak).toBe(1)
    expect(next.lastVisitDate).toBe('2024-05-10')
  })
})

describe('getCalendarMilestoneBonus', () => {
  it('returns the bonus for milestone visit counts', () => {
    expect(getCalendarMilestoneBonus(7)).toBe(20)
    expect(getCalendarMilestoneBonus(28)).toBe(70)
  })

  it('returns 0 for non-milestone visit counts', () => {
    expect(getCalendarMilestoneBonus(1)).toBe(0)
    expect(getCalendarMilestoneBonus(8)).toBe(0)
  })
})

describe('updateMonthlyVisits', () => {
  it('appends today when it is a new visit and reports isNewVisit', () => {
    const { visits, isNewVisit } = updateMonthlyVisits(['2024-05-01', '2024-05-02'], '2024-05-03T09:00:00.000Z')
    expect(visits).toEqual(['2024-05-01', '2024-05-02', '2024-05-03'])
    expect(isNewVisit).toBe(true)
  })

  it('does not duplicate an existing visit for today', () => {
    const { visits, isNewVisit } = updateMonthlyVisits(['2024-05-01', '2024-05-03'], '2024-05-03T09:00:00.000Z')
    expect(visits).toEqual(['2024-05-01', '2024-05-03'])
    expect(isNewVisit).toBe(false)
  })

  it('drops visits recorded in a previous month', () => {
    const { visits } = updateMonthlyVisits(['2024-04-28', '2024-04-30'], '2024-05-01T09:00:00.000Z')
    expect(visits).toEqual(['2024-05-01'])
  })
})
