'use client'

import { motion } from 'framer-motion'
import { AchievementList } from '@/components/Gamification/AchievementList'
import { LevelBadge } from '@/components/Gamification/LevelBadge'
import { VisualNovelPanel } from '@/components/Common/VisualNovelPanel'
import { MiniCharacterGuide } from '@/components/Common/MiniCharacterGuide'
import { useGameStats } from '@/hooks/useGameStats'
import { getLevelTitle } from '@/lib/gameEngine'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
}

export default function AchievementsPage() {
  const { gameStats } = useGameStats()
  const { level, totalPoints, currentStreak } = gameStats
  const title = getLevelTitle(level)

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight text-gradient">実績</h1>
        <p className="text-sm text-[var(--anime-muted)]">達成した実績とレベルを確認できます</p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-3">
        <div
          className="rotating-border rounded-xl"
        >
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--anime-card)', border: '1px solid var(--anime-card-border)' }}
          >
            <p className="text-xs text-[var(--anime-muted)]">現在のレベル</p>
            <p className="font-game mt-1 text-3xl font-bold text-gradient">Lv.{level}</p>
            <p className="text-xs text-[var(--anime-muted)]">{title}</p>
          </div>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--anime-card)',
            border: '1px solid rgba(212,165,116,0.35)',
            boxShadow: '0 0 12px rgba(212,165,116,0.1)',
          }}
        >
          <p className="text-xs text-[var(--anime-muted)]">累計XP</p>
          <p className="font-game mt-1 text-3xl font-bold text-gradient-gold">{totalPoints}</p>
          <p className="text-xs text-[var(--anime-muted)]">XP</p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--anime-card)',
            border: '1px solid rgba(25,135,84,0.3)',
            boxShadow: '0 0 12px rgba(25,135,84,0.08)',
          }}
        >
          <p className="text-xs text-[var(--anime-muted)]">連続ログイン</p>
          <p className="font-game mt-1 text-3xl font-bold" style={{ color: 'var(--anime-success)' }}>
            {currentStreak}
          </p>
          <p className="text-xs text-[var(--anime-muted)]">日連続</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <LevelBadge />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MiniCharacterGuide
          characterId="reminder-jirai"
          label="Reward Coach"
          message="赤い印が出ている実績はEXPを受け取れます。受け取り忘れをここで片付けましょう。"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <VisualNovelPanel
          characterId="reminder-jirai"
          tone="success"
          message="実績、ちゃんと見てるからね。連続記録も支払日の確認も、サボったらすぐ教えるし、できたらちゃんと褒めてあげる。"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="mb-3 text-lg font-semibold text-[var(--anime-text)]">実績一覧</h2>
        <AchievementList />
      </motion.div>
    </motion.div>
  )
}
