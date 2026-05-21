'use client'

import {
  BarChart,
  Bar,
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

interface CategoryStackedChartProps {
  data: CategoryMonthlyData[]
  activeCategories: Set<Category>
  onToggleCategory: (cat: Category) => void
}

export function CategoryStackedChart({
  data,
  activeCategories,
  onToggleCategory,
}: CategoryStackedChartProps) {
  const visibleCategories = CATEGORIES.filter((c) => activeCategories.has(c))

  return (
    <section className="chart-character-stage rounded-3xl p-5">
      <div className="relative mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="academy-kicker">Category Stack</p>
          <h2 className="text-xl font-black text-[var(--anime-text)]">カテゴリ別積み上げ</h2>
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
            積み上げを見ると、合計の増減に効いたカテゴリが一目で分かります。
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
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--anime-muted)', fontWeight: 700 }} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--anime-muted)', fontWeight: 700 }} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Legend />
          {visibleCategories.map((cat) => (
            <Bar
              key={cat}
              dataKey={cat}
              stackId="a"
              fill={CATEGORY_COLORS[cat]}
              radius={cat === visibleCategories[visibleCategories.length - 1] ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
