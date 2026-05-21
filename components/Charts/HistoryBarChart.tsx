'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/calculator'
import { CATEGORY_COLORS } from '@/types'
import type { Subscription } from '@/types'
import { format, parseISO } from 'date-fns'

interface HistoryBarChartProps {
  results: Subscription[]
}

interface MonthBucket {
  month: string
  label: string
  total: number
  count: number
}

export function HistoryBarChart({ results }: HistoryBarChartProps) {
  const buckets = results.reduce<Record<string, MonthBucket>>((acc, s) => {
    let key: string
    try {
      key = format(parseISO(s.nextPaymentDate), 'yyyy-MM')
    } catch {
      key = s.nextPaymentDate.slice(0, 7)
    }
    if (!acc[key]) {
      acc[key] = { month: key, label: key.replace(/^(\d{4})-(\d{2})$/, '$2月'), total: 0, count: 0 }
    }
    acc[key].total += s.amount
    acc[key].count += 1
    return acc
  }, {})

  const data = Object.values(buckets).sort((a, b) => a.month.localeCompare(b.month))

  if (data.length === 0) return null

  const dominantCategory = (() => {
    const freq: Record<string, number> = {}
    results.forEach((s) => { freq[s.category] = (freq[s.category] ?? 0) + 1 })
    return (Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] as keyof typeof CATEGORY_COLORS) ?? 'その他'
  })()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">月別購入金額</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
              className="text-muted-foreground"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as MonthBucket
                return (
                  <div className="rounded-lg border bg-popover p-3 shadow-md text-xs space-y-1">
                    <p className="font-semibold">{d.month}</p>
                    <p>合計: {formatCurrency(d.total)}</p>
                    <p className="text-muted-foreground">{d.count}件</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={CATEGORY_COLORS[dominantCategory as keyof typeof CATEGORY_COLORS] ?? '#3b82f6'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
