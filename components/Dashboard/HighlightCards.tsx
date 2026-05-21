import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { formatCurrency } from '@/lib/calculator'
import type { HighlightItem } from '@/types'

interface HighlightCardsProps {
  highlights: HighlightItem[]
}

export function HighlightCards({ highlights }: HighlightCardsProps) {
  if (highlights.length === 0) {
    return (
      <section className="chart-character-stage rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <CharacterImage
            characterId="advisor-danger"
            variant="coach"
            className="h-20 w-20 shrink-0"
            imageClassName="h-full w-full object-contain drop-shadow-xl"
            sizes="80px"
          />
          <div>
            <p className="academy-kicker">Monthly Review</p>
            <h2 className="text-lg font-black text-[var(--anime-text)]">今月のハイライト</h2>
            <p className="mt-1 text-sm font-bold text-[var(--anime-muted)]">前月比データがまだありません。</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="chart-character-stage rounded-3xl p-5">
      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="academy-kicker">Monthly Review</p>
          <h2 className="text-xl font-black text-[var(--anime-text)]">今月のハイライト</h2>
          <p className="mt-1 text-xs font-bold text-[var(--anime-muted)]">レイナが増減の目立つカテゴリをチェックします。</p>
        </div>
        <CharacterImage
          characterId="advisor-danger"
          variant="coach"
          className="h-20 w-20 shrink-0"
          imageClassName="h-full w-full object-contain drop-shadow-xl"
          sizes="80px"
        />
      </div>
      <div className="relative space-y-3">
        {highlights.map((item) => {
          const isUp = item.changeAmount > 0
          const isDown = item.changeAmount < 0
          const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
          const colorClass = isUp
            ? 'text-red-500'
            : isDown
              ? 'text-emerald-500'
              : 'text-[var(--anime-muted)]'

          return (
            <div
              key={item.category}
              className="anime-pressable flex items-center justify-between gap-3 rounded-2xl border border-[var(--anime-card-border)] bg-white/64 p-4 shadow-sm backdrop-blur dark:bg-slate-950/36"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[var(--anime-text)]">{item.category}</p>
                <p className="text-xs font-bold text-[var(--anime-muted)]">{formatCurrency(item.currentAmount)}</p>
              </div>
              <div className={`flex shrink-0 items-center gap-1 ${colorClass}`}>
                <Icon className="h-4 w-4" />
                <span className="font-game text-base font-black">
                  {item.changeAmount > 0 ? '+' : ''}
                  {formatCurrency(item.changeAmount)}
                </span>
                <span className="text-xs font-bold">
                  ({item.changePercentage > 0 ? '+' : ''}
                  {item.changePercentage}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
