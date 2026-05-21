'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useGameStats } from '@/hooks/useGameStats'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { getAchievementDialogue } from '@/lib/dialogues'

export function AchievementToast() {
  const { pendingAchievement, clearPendingAchievement } = useGameStats()
  const message = pendingAchievement
    ? getAchievementDialogue(pendingAchievement.id, pendingAchievement.title)
    : ''

  useEffect(() => {
    if (!pendingAchievement) return
    const timer = setTimeout(clearPendingAchievement, 4500)
    return () => clearTimeout(timer)
  }, [pendingAchievement, clearPendingAchievement])

  return (
    <AnimatePresence>
      {pendingAchievement && (
        <motion.div
          key={pendingAchievement.id}
          className="fixed right-4 top-4 z-[9999] w-80 overflow-hidden rounded-xl"
          style={{
            background: 'var(--anime-card)',
            border: '1px solid var(--anime-card-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 0 16px rgba(212,165,116,0.25)',
          }}
          initial={{ opacity: 0, scale: 0.3, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.85, x: 80 }}
          transition={{
            enter: { type: 'spring', stiffness: 400, damping: 20 },
            exit: { duration: 0.2, ease: 'easeIn' },
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }}
        >
          {/* Gold accent line at top */}
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, var(--anime-gold), #E8C88A, transparent)' }}
          />
          <div className="h-16 overflow-hidden border-b border-[var(--anime-card-border)]">
            <Image
              src="/characters/events/optimized/achievement-celebrate.jpg"
              alt=""
              width={520}
              height={260}
              sizes="320px"
              className="h-full w-full object-cover object-center"
            />
          </div>

          <div className="flex items-center gap-3 p-4">
            <motion.div
              className="h-14 w-14 flex-shrink-0"
              aria-hidden
              initial={{ scale: 0.3, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.15 }}
            >
              <CharacterImage
                characterId="reminder-jirai"
                variant="mascot"
                className="h-full w-full"
                imageClassName="h-full w-full object-contain drop-shadow-lg"
                sizes="56px"
              />
            </motion.div>

            <div className="min-w-0 flex-1">
              <p
                className="font-game text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--anime-gold)' }}
              >
                実績解除！
              </p>
              <p className="font-semibold text-[var(--anime-text)]">{pendingAchievement.title}</p>
              <p className="text-xs text-[var(--anime-muted)]">
                +{pendingAchievement.points} XP 獲得
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--anime-muted)]">{message}</p>
            </div>

            <button
              onClick={clearPendingAchievement}
              aria-label="閉じる"
              className="flex-shrink-0 rounded-md p-1 text-[var(--anime-muted)] transition-colors hover:text-[var(--anime-text)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
