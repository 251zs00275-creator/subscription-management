'use client'

import {
  LineChart,
  Line,
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

interface TrendChartProps {
  data: MonthlyTotal[]
}

export function TrendChart({ data }: TrendChartProps) {
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const change = last && prev ? last.total - prev.total : 0
  const comment =
    change > 0
      ? '今月は上向きです。増えたカテゴリを一緒に見れば、原因をかなり絞れます。'
      : change < 0
        ? '支出が落ち着いています。この状態を続けられるか、固定費を確認しましょう。'
        : '推移は安定しています。カテゴリ別の線も見て、次に整える場所を探しましょう。'

  return (
    <section className="chart-character-stage rounded-3xl p-5">
      <div className="relative">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="academy-kicker">Trend Analysis</p>
            <h2 className="text-xl font-black text-[var(--anime-text)]">月次推移</h2>
          </div>
          <div className="flex max-w-md items-center gap-3 rounded-2xl border border-[var(--anime-card-border)] bg-white/68 p-3 shadow-[0_12px_30px_rgba(33,122,184,0.12)] backdrop-blur dark:bg-slate-950/42">
            <CharacterImage
              characterId="analyst-cool"
              variant="coach"
              className="h-20 w-20 shrink-0"
              imageClassName="h-full w-full object-contain drop-shadow-xl"
              sizes="80px"
            />
            <div className="relative min-w-0">
              <p className="text-xs font-black text-[var(--anime-primary)]">シオンの分析メモ</p>
              <p className="mt-1 text-sm font-bold leading-6 text-[var(--anime-text)]">{comment}</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 18, left: 8, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--anime-muted)', fontWeight: 700 }} />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--anime-muted)', fontWeight: 700 }}
              tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
              className="text-muted-foreground"
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'subscription' ? 'サブスク' : name === 'general' ? '一般支出' : '合計',
              ]}
            />
            <Legend
              formatter={(value) =>
                value === 'subscription' ? 'サブスク' : value === 'general' ? '一般支出' : '合計'
              }
            />
            <Line type="monotone" dataKey="subscription" stroke="#38BDF8" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="general" stroke="#18B681" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="total" stroke="#FF7AB8" strokeWidth={3} strokeDasharray="5 3" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
