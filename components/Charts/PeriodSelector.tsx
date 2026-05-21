'use client'

import { cn } from '@/lib/utils'

type Period = 3 | 6 | 12

interface PeriodSelectorProps {
  value: Period
  onChange: (period: Period) => void
}

const PERIODS: { label: string; value: Period }[] = [
  { label: '3ヶ月', value: 3 },
  { label: '6ヶ月', value: 6 },
  { label: '12ヶ月', value: 12 },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border bg-muted p-1 gap-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
            value === p.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
