'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface TotalCardProps {
  title: string
  amount: number
  icon: LucideIcon
  description?: string
  emoji?: string
  accentColor?: string
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  const prevTarget = useRef(target)

  useEffect(() => {
    const start = prevTarget.current
    const diff = target - start
    if (diff === 0) return

    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else {
        setValue(target)
        prevTarget.current = target
      }
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return value
}

export function TotalCard({
  title,
  amount,
  icon: Icon,
  description,
  emoji,
  accentColor = '#1455B4',
}: TotalCardProps) {
  const displayAmount = useCountUp(amount)

  const formatted = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(displayAmount)

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="hover-lift"
    >
      <div
        className="academy-panel anime-frame rounded-2xl"
        style={{
          borderTop: `3px solid ${accentColor}`,
        }}
      >
        {/* Subtle icon glow in top-right */}
        <div
          aria-hidden="true"
          className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-xl"
          style={{ background: accentColor }}
        />

        <div className="relative p-5">
          {/* Header row */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--anime-muted)]">{title}</p>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg"
              style={{
                background: `${accentColor}18`,
                boxShadow: `0 0 8px ${accentColor}30`,
              }}
            >
              {emoji ?? <Icon className="h-4 w-4" style={{ color: accentColor }} />}
            </div>
          </div>

          {/* Amount */}
          <p
            className="font-game text-3xl font-bold tabular-nums tracking-wide"
            style={{ color: 'var(--anime-text)' }}
          >
            {formatted}
          </p>

          {/* Description */}
          {description && (
            <p className="mt-1.5 text-xs text-[var(--anime-muted)]">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
