'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { formatCurrency } from '@/lib/calculator'
import type { CategoryTotal } from '@/types'

const ANIME_COLORS = [
  '#1677D2',
  '#18B681',
  '#A9B8FF',
  '#FF7AB8',
  '#F8C76D',
  '#FF9966',
  '#F05A6E',
  '#7DD3FC',
]

interface CategoryPieChartProps {
  data: CategoryTotal[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: CategoryTotal }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-lg"
      style={{
        background: 'var(--anime-card)',
        border: '1px solid var(--anime-card-border)',
        color: 'var(--anime-text)',
      }}
    >
      <p className="font-medium">{item.name}</p>
      <p className="font-game text-base font-bold" style={{ color: 'var(--anime-primary)' }}>
        {formatCurrency(item.value)}
      </p>
      <p className="text-xs text-[var(--anime-muted)]">{item.payload.percentage}%</p>
    </div>
  )
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-character-stage rounded-3xl p-5">
        <p className="mb-4 text-sm font-semibold text-[var(--anime-text)]">カテゴリ別支出</p>
        <div className="flex h-48 items-center justify-center text-sm text-[var(--anime-muted)]">
          まだデータがありません
        </div>
      </div>
    )
  }

  const topCategory = data[0]

  return (
    <section className="chart-character-stage rounded-3xl p-5">
      <div className="relative mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="academy-kicker">Category Map</p>
          <h2 className="text-xl font-black text-[var(--anime-text)]">カテゴリ別支出</h2>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--anime-card-border)] bg-white/86 p-2 pr-3 backdrop-blur dark:bg-slate-950/78">
          <CharacterImage
            characterId="main-heroine"
            variant="coach"
            className="h-14 w-14 shrink-0"
            imageClassName="h-full w-full object-contain drop-shadow-xl"
            sizes="56px"
          />
          <p className="hidden max-w-[170px] text-xs font-bold leading-5 text-[var(--anime-muted)] sm:block">
            一番大きいのは「{topCategory.category}」。まずここから整えると効果が見えやすいです。
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={82}
            innerRadius={38}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={ANIME_COLORS[index % ANIME_COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="relative mt-3 grid grid-cols-2 gap-2">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.category} className="flex items-center gap-2 rounded-xl bg-white/82 px-2 py-1.5 text-xs backdrop-blur dark:bg-slate-950/72">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ background: ANIME_COLORS[index % ANIME_COLORS.length] }}
            />
            <span className="truncate text-[var(--anime-muted)]">{item.category}</span>
            <span className="ml-auto font-game font-semibold text-[var(--anime-text)]">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
