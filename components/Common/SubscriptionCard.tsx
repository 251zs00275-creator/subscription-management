'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DragHandle } from '@/components/Common/DragHandle'
import { formatCurrency } from '@/lib/calculator'
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '@/types'
import type { Subscription } from '@/types'

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit: (sub: Subscription) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  isDragging?: boolean
  dragHandleProps?: {
    sortableProps?: object
  }
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onToggle,
  isDragging = false,
  dragHandleProps,
}: SubscriptionCardProps) {
  const { id, name, amount, category, nextPaymentDate, memo, isActive } = subscription
  const color = CATEGORY_COLORS[category]
  const emoji = CATEGORY_EMOJIS[category]

  return (
    <motion.div
      className="group"
      layout
      whileHover={isDragging ? {} : { y: -2, scale: 1.005 }}
      whileTap={isDragging ? {} : { scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: 'var(--anime-card)',
          border: '1px solid var(--anime-card-border)',
          borderLeft: `3px solid ${color}`,
          boxShadow: isDragging
            ? `0 20px 40px rgba(0,0,0,0.2), 0 0 0 2px ${color}60`
            : `0 2px 8px rgba(0,0,0,0.06)`,
          filter: !isActive ? 'saturate(0.4) opacity(0.7)' : undefined,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        }}
      >
        {/* Category glow line */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-px opacity-60"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />

        {/* Drag handle */}
        {dragHandleProps && (
          <div className="absolute right-1 top-1">
            <DragHandle sortableProps={dragHandleProps.sortableProps} />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* Name row */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-base" aria-hidden>{emoji}</span>
                <span className="truncate font-semibold text-[var(--anime-text)]">{name}</span>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    background: `${color}22`,
                    color: color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {category}
                </span>
                {!isActive && (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      background: 'rgba(123,141,200,0.12)',
                      color: 'var(--anime-muted)',
                      border: '1px solid rgba(123,141,200,0.25)',
                    }}
                  >
                    停止中
                  </span>
                )}
              </div>

              {/* Amount */}
              <p
                className="font-game mt-2 text-2xl font-bold tabular-nums"
                style={{ color: isActive ? 'var(--anime-gold)' : 'var(--anime-muted)' }}
              >
                {formatCurrency(amount)}
                <span className="ml-1 font-sans text-sm font-normal text-[var(--anime-muted)]">/月</span>
              </p>

              <p className="mt-1 text-xs text-[var(--anime-muted)]">
                次回: {nextPaymentDate}
              </p>
              {memo && (
                <p className="mt-1 truncate text-xs text-[var(--anime-muted)]">{memo}</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-shrink-0 flex-col items-end gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={() => onToggle(id)}
                aria-label={`${name}を${isActive ? '無効' : '有効'}にする`}
              />
              <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(subscription)}
                  aria-label={`${name}を編集`}
                  className="h-7 w-7 hover:bg-[var(--anime-surface)] hover:text-[var(--anime-primary)]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(id)}
                  aria-label={`${name}を削除`}
                  className="h-7 w-7 text-[var(--anime-danger)] hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
