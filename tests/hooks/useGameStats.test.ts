import { renderHook, act } from '@testing-library/react'
import { useGameStats } from '@/hooks/useGameStats'
import { buildInitialGameStats } from '@/lib/gameEngine'
import { fireConfetti } from '@/lib/confetti'

jest.mock('@/lib/confetti', () => ({
  fireConfetti: jest.fn(),
}))

const STORAGE_KEY = 'game-stats'
const mockFireConfetti = fireConfetti as jest.MockedFunction<typeof fireConfetti>

describe('useGameStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    useGameStats.setState({ gameStats: buildInitialGameStats(), pendingAchievement: null })
  })

  describe('init', () => {
    it('loads default stats when localStorage is empty', () => {
      const { result } = renderHook(() => useGameStats())
      act(() => result.current.init())
      expect(result.current.gameStats.totalPoints).toBe(0)
    })

    it('normalizes persisted stats and backfills missing achievement definitions', () => {
      const stored = {
        ...buildInitialGameStats(),
        totalPoints: 100,
        achievements: [
          {
            id: 'first_subscription',
            title: 'はじめての一歩',
            emoji: '🌸',
            description: '',
            unlockedAt: '2024-01-01T00:00:00.000Z',
            claimedAt: null,
            points: 20,
          },
        ],
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

      const { result } = renderHook(() => useGameStats())
      act(() => result.current.init())

      expect(result.current.gameStats.totalPoints).toBe(100)
      expect(result.current.gameStats.achievements).toHaveLength(buildInitialGameStats().achievements.length)
      // normalizeStats backfills a missing claimedAt from unlockedAt for legacy records
      expect(
        result.current.gameStats.achievements.find((a) => a.id === 'first_subscription')?.claimedAt
      ).toBe('2024-01-01T00:00:00.000Z')
    })

    it('falls back to default stats when persisted JSON is corrupted', () => {
      localStorage.setItem(STORAGE_KEY, '{not-json')
      const { result } = renderHook(() => useGameStats())
      act(() => result.current.init())
      expect(result.current.gameStats.totalPoints).toBe(0)
    })
  })

  describe('addPoints', () => {
    it('adds points and recalculates the level', () => {
      const { result } = renderHook(() => useGameStats())
      act(() => result.current.addPoints(60))
      expect(result.current.gameStats.totalPoints).toBe(60)
      expect(result.current.gameStats.level).toBe(2)
    })
  })

  describe('claimLoginBonus', () => {
    it('ignores non-positive bonuses', () => {
      const { result } = renderHook(() => useGameStats())
      act(() => result.current.claimLoginBonus(0))
      expect(result.current.gameStats.totalPoints).toBe(0)
      expect(result.current.pendingAchievement).toBeNull()
      expect(mockFireConfetti).not.toHaveBeenCalled()
    })

    it('adds points, queues a pending login bonus and fires confetti', () => {
      const { result } = renderHook(() => useGameStats())
      act(() => result.current.claimLoginBonus(10))

      expect(result.current.gameStats.totalPoints).toBe(10)
      expect(result.current.pendingAchievement).toEqual({
        id: 'login_bonus',
        title: 'ログインボーナス',
        emoji: '🌸',
        points: 10,
      })
      expect(mockFireConfetti).toHaveBeenCalledWith('achievement')
    })
  })

  describe('claimAchievement', () => {
    it('does nothing when the achievement is still locked', () => {
      const { result } = renderHook(() => useGameStats())
      act(() => result.current.claimAchievement('first_subscription'))

      expect(result.current.pendingAchievement).toBeNull()
      expect(result.current.gameStats.totalPoints).toBe(0)
      expect(mockFireConfetti).not.toHaveBeenCalled()
    })

    it('does nothing when the achievement was already claimed', () => {
      const stats = buildInitialGameStats()
      stats.achievements = stats.achievements.map((a) =>
        a.id === 'first_subscription'
          ? { ...a, unlockedAt: '2024-01-01T00:00:00.000Z', claimedAt: '2024-01-02T00:00:00.000Z' }
          : a
      )
      useGameStats.setState({ gameStats: stats })

      const { result } = renderHook(() => useGameStats())
      act(() => result.current.claimAchievement('first_subscription'))

      expect(result.current.pendingAchievement).toBeNull()
      expect(result.current.gameStats.totalPoints).toBe(0)
    })

    it('grants points and queues the achievement when newly unlocked', () => {
      const stats = buildInitialGameStats()
      stats.achievements = stats.achievements.map((a) =>
        a.id === 'first_subscription' ? { ...a, unlockedAt: '2024-01-01T00:00:00.000Z', claimedAt: null } : a
      )
      useGameStats.setState({ gameStats: stats })

      const { result } = renderHook(() => useGameStats())
      act(() => result.current.claimAchievement('first_subscription'))

      expect(result.current.gameStats.totalPoints).toBe(20)
      expect(result.current.pendingAchievement?.id).toBe('first_subscription')
      expect(
        result.current.gameStats.achievements.find((a) => a.id === 'first_subscription')?.claimedAt
      ).not.toBeNull()
      expect(mockFireConfetti).toHaveBeenCalledWith('achievement')
    })
  })

  describe('getUnclaimedAchievementCount', () => {
    it('counts unlocked-but-unclaimed achievements only', () => {
      const stats = buildInitialGameStats()
      stats.achievements = stats.achievements.map((a, index) => {
        if (index === 0) return { ...a, unlockedAt: '2024-01-01T00:00:00.000Z', claimedAt: '2024-01-02T00:00:00.000Z' }
        if (index === 1) return { ...a, unlockedAt: '2024-01-01T00:00:00.000Z', claimedAt: null }
        return a
      })
      useGameStats.setState({ gameStats: stats })

      const { result } = renderHook(() => useGameStats())
      expect(result.current.getUnclaimedAchievementCount()).toBe(1)
    })
  })

  describe('incrementAction', () => {
    it('increments the requested action counter', () => {
      const { result } = renderHook(() => useGameStats())
      act(() => result.current.incrementAction('added'))
      expect(result.current.gameStats.actionCount.added).toBe(1)
    })
  })

  describe('checkAndUnlock', () => {
    it('unlocks achievements whose conditions are newly satisfied', () => {
      const { result } = renderHook(() => useGameStats())
      act(() => result.current.incrementAction('added'))
      act(() => result.current.checkAndUnlock([]))

      const unlocked = result.current.gameStats.achievements.find((a) => a.id === 'first_subscription')
      expect(unlocked?.unlockedAt).not.toBeNull()
    })

    it('leaves the stats object untouched when nothing new unlocks', () => {
      const { result } = renderHook(() => useGameStats())
      const before = result.current.gameStats
      act(() => result.current.checkAndUnlock([]))
      expect(result.current.gameStats).toBe(before)
    })
  })

  describe('unlockOcr', () => {
    it('records an OCR import and unlocks the first_ocr achievement', () => {
      const { result } = renderHook(() => useGameStats())
      act(() => result.current.unlockOcr())

      expect(result.current.gameStats.actionCount.imported).toBe(1)
      expect(result.current.gameStats.achievements.find((a) => a.id === 'first_ocr')?.unlockedAt).not.toBeNull()
    })
  })

  describe('clearPendingAchievement', () => {
    it('resets the pending achievement to null', () => {
      useGameStats.setState({ pendingAchievement: { id: 'login_bonus', title: 'x', emoji: '🌸', points: 10 } })
      const { result } = renderHook(() => useGameStats())
      act(() => result.current.clearPendingAchievement())
      expect(result.current.pendingAchievement).toBeNull()
    })
  })

  describe('recordVisit', () => {
    it('updates the streak and monthly visit log on a new day', () => {
      useGameStats.setState({
        gameStats: { ...buildInitialGameStats(), lastVisitDate: '2000-01-01', monthlyVisits: [] },
      })

      const { result } = renderHook(() => useGameStats())
      act(() => result.current.recordVisit())

      expect(result.current.gameStats.lastVisitDate).not.toBe('2000-01-01')
      expect(result.current.gameStats.monthlyVisits?.length).toBeGreaterThan(0)
    })

    it('does nothing when today was already recorded', () => {
      const today = new Date().toISOString().slice(0, 10)
      useGameStats.setState({
        gameStats: { ...buildInitialGameStats(), lastVisitDate: today, monthlyVisits: [today] },
      })

      const { result } = renderHook(() => useGameStats())
      const before = result.current.gameStats
      act(() => result.current.recordVisit())
      expect(result.current.gameStats).toBe(before)
    })
  })
})
