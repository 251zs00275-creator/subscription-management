'use client'

import { motion } from 'framer-motion'
import { useGameStats } from '@/hooks/useGameStats'

export function StreakBadge() {
  const { gameStats } = useGameStats()
  const { currentStreak } = gameStats

  const isHot = currentStreak >= 3

  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-lg border bg-card/50 px-2.5 py-1.5"
      animate={isHot ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="text-base" aria-hidden>
        {isHot ? '🔥' : '✨'}
      </span>
      <span className="text-xs font-semibold">
        {currentStreak}日連続
      </span>
    </motion.div>
  )
}
