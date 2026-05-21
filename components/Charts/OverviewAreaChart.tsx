'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { formatCurrency } from '@/lib/calculator'
import type { MonthlyTotal } from '@/types'

interface OverviewAreaChartProps {
  data: MonthlyTotal[]
}

const LINES = [
  { key: 'total', label: '合計', color: '#a855f7', gradient: 'gradTotal' },
  { key: 'subscription', label: 'サブスク', color: '#3b82f6', gradient: 'gradSub' },
  { key: 'general', label: '一般支出', color: '#22c55e', gradient: 'gradGen' },
]

export function OverviewAreaChart({ data }: OverviewAreaChartProps) {
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const delta = last && prev ? last.total - prev.total : 0
  const memo =
    delta > 0
      ? '合計が前月より上がっています。サブスクと一般支出のどちらが動いたかを見ましょう。'
      : delta < 0
        ? '合計は前月より下がっています。良い流れなので、無理なく続けられる形に整えましょう。'
        : '全体は安定しています。次はカテゴリ別の変化で小さな違和感を探します。'

  return (
    <section className="chart-character-stage rounded-3xl p-5">
      <div className="relative mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="academy-kicker">Overview</p>
          <h2 className="text-xl font-black text-[var(--anime-text)]">月次支出推移</h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--anime-card-border)] bg-white/86 p-3 backdrop-blur dark:bg-slate-950/78">
          <CharacterImage
            characterId="analyst-cool"
            variant="coach"
            className="h-16 w-16 shrink-0"
            imageClassName="h-full w-full object-contain drop-shadow-xl"
            sizes="64px"
          />
          <p className="max-w-sm text-xs font-bold leading-5 text-[var(--anime-muted)]">{memo}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            {LINES.map(({ color, gradient }) => (
              <linearGradient key={gradient} id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0.03} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--anime-muted)', fontWeight: 700 }} />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--anime-muted)', fontWeight: 700 }}
            tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const label = LINES.find((l) => l.key === name)?.label ?? name
              return [formatCurrency(value), label]
            }}
            contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
          />
          <Legend formatter={(value) => LINES.find((l) => l.key === value)?.label ?? value} />
          {LINES.map(({ key, color, gradient }) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradient})`}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </section>
  )
}
