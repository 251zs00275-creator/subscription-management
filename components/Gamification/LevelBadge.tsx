'use client'

import { motion } from 'framer-motion'
import { useGameStats } from '@/hooks/useGameStats'
import { getLevelTitle, getLevelProgress, getXpForNextLevel } from '@/lib/gameEngine'

export function LevelBadge() {
  const { gameStats } = useGameStats()
  const { level, totalPoints } = gameStats
  const title = getLevelTitle(level)
  const progress = getLevelProgress(totalPoints, level)
  const nextXp = getXpForNextLevel(level)

  return (
    <div
      className="anime-frame rounded-xl p-3"
      style={{
        background: 'var(--anime-surface)',
        border: '1px solid var(--anime-card-border)',
      }}
    >
      <div className="flex items-center gap-2.5">
        {/* Level orb */}
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #D4A574, #E8C88A)',
            boxShadow: '0 0 10px rgba(212,165,116,0.5)',
          }}
        >
          <span className="font-game text-sm font-bold text-white">{level}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-none text-[var(--anime-text)]">{title}</p>
          <p className="mt-0.5 font-game text-[10px] text-[var(--anime-muted)]">
            {totalPoints} <span className="text-[var(--anime-gold)]">/</span> {nextXp} XP
          </p>
        </div>
      </div>

      {/* XP bar */}
      <div
        className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: 'rgba(20,85,180,0.15)' }}
      >
        <motion.div
          className="xp-bar h-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 28, delay: 0.3 }}
        />
      </div>

      <p className="mt-1 text-right font-game text-[9px] text-[var(--anime-muted)]">
        {progress}%
      </p>
    </div>
  )
}
