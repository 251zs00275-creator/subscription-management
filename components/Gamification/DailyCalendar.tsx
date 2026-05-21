'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGameStats } from '@/hooks/useGameStats'
import { CALENDAR_MILESTONES } from '@/lib/gameEngine'

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']

const MILESTONE_EMOJIS: Record<number, string> = {
  7: '🎊',
  14: '✨',
  21: '🌟',
  28: '🏆',
}

export function DailyCalendar() {
  const { gameStats } = useGameStats()
  const { monthlyVisits = [] } = gameStats

  const { year, month, days, visitedSet, todayStr, visitCount } = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() // 0-indexed
    const todayStr = now.toISOString().slice(0, 10)

    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const firstDayOfWeek = new Date(y, m, 1).getDay() // 0=Sun
    // Convert to Mon-first (0=Mon ... 6=Sun)
    const startOffset = (firstDayOfWeek + 6) % 7

    const visitedSet = new Set(monthlyVisits)
    const currentMonthVisits = monthlyVisits.filter((d) => d.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`))

    // Build grid cells: null = empty padding, number = day
    const days: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    // Pad end to complete last row
    while (days.length % 7 !== 0) days.push(null)

    return { year: y, month: m, days, visitedSet, todayStr, visitCount: currentMonthVisits.length }
  }, [monthlyVisits])

  const monthLabel = `${year}年${month + 1}月`
  const nextMilestone = Object.keys(CALENDAR_MILESTONES)
    .map(Number)
    .sort((a, b) => a - b)
    .find((m) => m > visitCount)

  return (
    <div
      className="anime-frame rounded-xl p-4"
      style={{
        background: 'var(--anime-card)',
        border: '1px solid var(--anime-card-border)',
        borderTop: '3px solid var(--anime-gold)',
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--anime-text)]">
            📅 {monthLabel} ログイン記録
          </p>
          <p className="mt-0.5 font-game text-xs text-[var(--anime-muted)]">
            今月{' '}
            <span className="font-bold" style={{ color: 'var(--anime-gold)' }}>
              {visitCount}
            </span>
            {' '}日達成
            {nextMilestone && (
              <span className="ml-1 text-[var(--anime-muted)]">
                （次のボーナス: {nextMilestone}日目 +{CALENDAR_MILESTONES[nextMilestone]}XP）
              </span>
            )}
          </p>
        </div>

        {/* Milestone icons */}
        <div className="flex gap-1.5">
          {Object.entries(CALENDAR_MILESTONES).map(([day, xp]) => {
            const d = Number(day)
            const reached = visitCount >= d
            return (
              <div
                key={day}
                className="flex flex-col items-center"
                title={`${day}日: +${xp}XP`}
              >
                <span className="text-base leading-none" style={{ opacity: reached ? 1 : 0.3 }}>
                  {MILESTONE_EMOJIS[d]}
                </span>
                <span
                  className="font-game text-[8px] font-bold leading-none mt-0.5"
                  style={{ color: reached ? 'var(--anime-gold)' : 'var(--anime-muted)' }}
                >
                  {day}日
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day-of-week labels */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {DAY_LABELS.map((d, i) => (
          <div
            key={d}
            className="text-center font-game text-[10px] font-semibold"
            style={{ color: i >= 5 ? 'var(--anime-pink)' : 'var(--anime-muted)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isVisited = visitedSet.has(dateStr)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr
          const isMilestoneDay = day in CALENDAR_MILESTONES

          return (
            <motion.div
              key={dateStr}
              className="relative flex aspect-square items-center justify-center rounded-md text-[11px] font-game font-semibold"
              style={{
                background: isVisited
                  ? 'rgba(20,85,180,0.15)'
                  : isFuture
                  ? 'transparent'
                  : 'rgba(123,141,200,0.06)',
                border: isToday
                  ? '1.5px solid var(--anime-gold)'
                  : isMilestoneDay && !isVisited && !isFuture
                  ? '1px dashed rgba(212,165,116,0.4)'
                  : '1px solid transparent',
                color: isVisited
                  ? 'var(--anime-blue)'
                  : isFuture
                  ? 'var(--anime-card-border)'
                  : 'var(--anime-muted)',
                boxShadow: isVisited ? '0 0 6px rgba(20,85,180,0.25)' : undefined,
              }}
              initial={isToday && isVisited ? { scale: 0.3, opacity: 0 } : false}
              animate={isToday && isVisited ? { scale: 1, opacity: 1 } : undefined}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
            >
              {/* Visited stamp */}
              {isVisited && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: 'var(--anime-primary)' }}
                  >
                    {day}
                  </span>
                </span>
              )}
              {/* Non-visited day number */}
              {!isVisited && (
                <span>{day}</span>
              )}
              {/* Milestone star */}
              {isMilestoneDay && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-[8px] leading-none"
                  style={{ opacity: isVisited ? 1 : 0.4 }}
                >
                  ⭐
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
