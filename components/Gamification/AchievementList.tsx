'use client'

import { motion } from 'framer-motion'
import { Gift, Lock } from 'lucide-react'
import { useGameStats } from '@/hooks/useGameStats'

export function AchievementList() {
  const { gameStats, claimAchievement } = useGameStats()
  const { achievements } = gameStats
  const unlocked = achievements.filter((a) => a.unlockedAt !== null).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--anime-muted)]">
          <span className="font-game font-bold text-[var(--anime-gold)]">{unlocked}</span>
          {' / '}
          <span className="font-game font-bold text-[var(--anime-text)]">{achievements.length}</span>
          {' 解除済み'}
        </p>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[rgba(20,85,180,0.15)]">
          <motion.div
            className="xp-bar h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked / achievements.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 28 }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement, i) => {
          const isUnlocked = achievement.unlockedAt !== null
          const canClaim = isUnlocked && !achievement.claimedAt
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="relative overflow-hidden rounded-xl p-3 transition-all duration-200"
              style={
                isUnlocked
                  ? {
                      background: 'var(--anime-card)',
                      border: canClaim ? '1px solid rgba(255,79,163,0.42)' : '1px solid rgba(212,165,116,0.35)',
                      boxShadow: canClaim ? '0 0 16px rgba(255,79,163,0.18)' : '0 0 12px rgba(212,165,116,0.15)',
                    }
                  : {
                      background: 'var(--anime-surface)',
                      border: '1px solid var(--anime-card-border)',
                      opacity: 0.55,
                      filter: 'grayscale(0.7)',
                    }
              }
            >
              {canClaim && (
                <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.75)]" />
              )}

              <div className="relative flex items-center gap-3">
                <span className="text-2xl" aria-hidden>
                  {isUnlocked ? achievement.emoji : <Lock className="h-5 w-5 text-[var(--anime-muted)]" />}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--anime-text)]">{achievement.title}</p>
                  <p className="text-xs text-[var(--anime-muted)]">{achievement.description}</p>
                  {canClaim && (
                    <button
                      type="button"
                      onClick={() => claimAchievement(achievement.id)}
                      className="anime-pressable mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--anime-primary)] px-3 py-1 text-[10px] font-bold text-white"
                    >
                      <Gift className="h-3 w-3" />
                      EXPを受け取る
                    </button>
                  )}
                  {achievement.claimedAt && (
                    <p className="mt-0.5 text-[10px]" style={{ color: 'var(--anime-gold)' }}>
                      {new Date(achievement.claimedAt).toLocaleDateString('ja-JP')} 受取済み
                    </p>
                  )}
                </div>

                <span
                  className="font-game shrink-0 text-xs font-bold"
                  style={{ color: canClaim ? 'var(--anime-pink)' : isUnlocked ? 'var(--anime-gold)' : 'var(--anime-muted)' }}
                >
                  +{achievement.points} XP
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
