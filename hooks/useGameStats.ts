'use client'

import { create } from 'zustand'
import {
  ACHIEVEMENT_DEFINITIONS,
  buildInitialGameStats,
  calculateLevel,
  evaluateAchievements,
  updateMonthlyVisits,
  updateStreak,
} from '@/lib/gameEngine'
import { fireConfetti } from '@/lib/confetti'
import type { AchievementId, GameStats, Subscription } from '@/types'

const STORAGE_KEY = 'game-stats'

function normalizeStats(stats: GameStats): GameStats {
  const storedIds = new Set(stats.achievements.map((a) => a.id))
  const achievements = [
    ...stats.achievements.map((a) => ({ ...a, claimedAt: a.claimedAt ?? a.unlockedAt ?? null })),
    ...ACHIEVEMENT_DEFINITIONS.filter((a) => !storedIds.has(a.id)),
  ]
  return {
    ...stats,
    achievements,
    monthlyVisits: stats.monthlyVisits ?? [],
  }
}

function loadFromStorage(): GameStats {
  if (typeof window === 'undefined') return buildInitialGameStats()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildInitialGameStats()
    return normalizeStats(JSON.parse(raw) as GameStats)
  } catch {
    return buildInitialGameStats()
  }
}

function saveToStorage(stats: GameStats): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // Storage quota exceeded: keep UI usable even if persistence fails.
  }
}

interface GameStatsStore {
  gameStats: GameStats
  pendingAchievement: {
    id: string
    title: string
    emoji: string
    points: number
  } | null

  init: () => void
  recordVisit: () => void
  addPoints: (points: number) => void
  claimLoginBonus: (points: number) => void
  claimAchievement: (id: AchievementId) => void
  getUnclaimedAchievementCount: () => number
  incrementAction: (action: 'added' | 'deleted' | 'edited' | 'imported') => void
  checkAndUnlock: (subscriptions: Subscription[]) => void
  unlockOcr: () => void
  clearPendingAchievement: () => void
}

export const useGameStats = create<GameStatsStore>((set, get) => ({
  gameStats: buildInitialGameStats(),
  pendingAchievement: null,

  init: () => {
    set({ gameStats: loadFromStorage() })
  },

  recordVisit: () => {
    const todayISO = new Date().toISOString()
    const current = get().gameStats
    const afterStreak = updateStreak(current, todayISO)
    const { visits, isNewVisit } = updateMonthlyVisits(afterStreak.monthlyVisits ?? [], todayISO)
    if (afterStreak === current && !isNewVisit) return

    const updated = { ...afterStreak, monthlyVisits: visits }
    saveToStorage(updated)
    set({ gameStats: updated })
    get().checkAndUnlock([])
  },

  addPoints: (points: number) => {
    const current = get().gameStats
    const totalPoints = current.totalPoints + points
    const updated = { ...current, totalPoints, level: calculateLevel(totalPoints) }
    saveToStorage(updated)
    set({ gameStats: updated })
  },

  claimLoginBonus: (points: number) => {
    if (points <= 0) return
    const current = get().gameStats
    const totalPoints = current.totalPoints + points
    const updated = { ...current, totalPoints, level: calculateLevel(totalPoints) }
    saveToStorage(updated)
    set({
      gameStats: updated,
      pendingAchievement: {
        id: 'login_bonus',
        title: 'ログインボーナス',
        emoji: '🌸',
        points,
      },
    })
    fireConfetti('achievement')
  },

  claimAchievement: (id: AchievementId) => {
    const current = get().gameStats
    const achievement = current.achievements.find((a) => a.id === id)
    if (!achievement || achievement.unlockedAt === null || achievement.claimedAt) return

    const totalPoints = current.totalPoints + achievement.points
    const updated = {
      ...current,
      totalPoints,
      level: calculateLevel(totalPoints),
      achievements: current.achievements.map((a) =>
        a.id === id ? { ...a, claimedAt: new Date().toISOString() } : a
      ),
    }
    saveToStorage(updated)
    set({
      gameStats: updated,
      pendingAchievement: {
        id,
        title: achievement.title,
        emoji: achievement.emoji,
        points: achievement.points,
      },
    })
    fireConfetti('achievement')
  },

  getUnclaimedAchievementCount: () =>
    get().gameStats.achievements.filter((a) => a.unlockedAt !== null && !a.claimedAt).length,

  incrementAction: (action) => {
    const current = get().gameStats
    const updated = {
      ...current,
      actionCount: {
        ...current.actionCount,
        [action]: current.actionCount[action] + 1,
      },
    }
    saveToStorage(updated)
    set({ gameStats: updated })
  },

  checkAndUnlock: (subscriptions: Subscription[]) => {
    const current = get().gameStats
    const newlyUnlocked = evaluateAchievements(current, subscriptions)
    if (newlyUnlocked.length === 0) return

    const now = new Date().toISOString()
    const updated = {
      ...current,
      achievements: current.achievements.map((a) =>
        newlyUnlocked.includes(a.id as AchievementId) && a.unlockedAt === null
          ? { ...a, unlockedAt: now, claimedAt: null }
          : a
      ),
    }
    saveToStorage(updated)
    set({ gameStats: updated })
  },

  unlockOcr: () => {
    const current = get().gameStats
    const now = new Date().toISOString()
    const updated = {
      ...current,
      actionCount: { ...current.actionCount, imported: current.actionCount.imported + 1 },
      achievements: current.achievements.map((a) =>
        a.id === 'first_ocr' && a.unlockedAt === null
          ? { ...a, unlockedAt: now, claimedAt: null }
          : a
      ),
    }
    saveToStorage(updated)
    set({ gameStats: updated })
  },

  clearPendingAchievement: () => set({ pendingAchievement: null }),
}))
