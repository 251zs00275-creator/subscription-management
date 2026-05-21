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
import { CATEGORIES, CATEGORY_COLORS } from '@/types'
import type { CategoryMonthlyData, Category } from '@/types'

interface CategoryLineChartProps {
  data: CategoryMonthlyData[]
  activeCategories: Set<Category>
  onToggleCategory: (cat: Category) => void
}

export function CategoryLineChart({
  data,
  activeCategories,
  onToggleCategory,
}: CategoryLineChartProps) {
  const visibleCategories = CATEGORIES.filter((c) => activeCategories.has(c))

  return (
    <section className="chart-character-stage rounded-3xl p-5">
      <div className="relative mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="academy-kicker">Category Lines</p>
          <h2 className="text-xl font-black text-[var(--anime-text)]">カテゴリ別推移</h2>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--anime-card-border)] bg-white/86 p-2 pr-3 backdrop-blur dark:bg-slate-950/78">
          <CharacterImage
            characterId="analyst-cool"
            variant="coach"
            className="h-14 w-14 shrink-0"
            imageClassName="h-full w-full object-contain drop-shadow-xl"
            sizes="56px"
          />
          <p className="max-w-[220px] text-xs font-bold leading-5 text-[var(--anime-muted)]">
            線が跳ねたカテゴリは、支払い日や単発購入を確認すると理由が見つかります。
          </p>
        </div>
      </div>
      <div className="relative mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = activeCategories.has(cat)
          return (
            <button
              key={cat}
              onClick={() => onToggleCategory(cat)}
              className="anime-pressable flex items-center gap-1.5 rounded-full border bg-white/50 px-3 py-1 text-xs font-bold backdrop-blur transition-all dark:bg-slate-950/28"
              style={{
                borderColor: CATEGORY_COLORS[cat],
                color: active ? CATEGORY_COLORS[cat] : '#94a3b8',
                opacity: active ? 1 : 0.5,
              }}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: active ? CATEGORY_COLORS[cat] : '#94a3b8' }} />
              {cat}
            </button>
          )
        })}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--anime-muted)', fontWeight: 700 }} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--anime-muted)', fontWeight: 700 }} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
          <Legend />
          {visibleCategories.map((cat) => (
            <Line key={cat} type="monotone" dataKey={cat} stroke={CATEGORY_COLORS[cat]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}
