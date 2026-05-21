'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, LineChart, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PeriodSelector } from '@/components/Charts/PeriodSelector'
import { OverviewAreaChart } from '@/components/Charts/OverviewAreaChart'
import { CategoryStackedChart } from '@/components/Charts/CategoryStackedChart'
import { CategoryLineChart } from '@/components/Charts/CategoryLineChart'
import { VisualNovelPanel } from '@/components/Common/VisualNovelPanel'
import { MiniCharacterGuide } from '@/components/Common/MiniCharacterGuide'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import {
  calcMonthlyTrend,
  calcCategoryMonthlyTrend,
  formatCurrency,
} from '@/lib/calculator'
import { CATEGORIES } from '@/types'
import type { Category } from '@/types'
import { cn } from '@/lib/utils'

type ChartMode = 'stacked' | 'line'
type Period = 3 | 6 | 12

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function TrendsPage() {
  const { subscriptions, isLoading, load } = useSubscriptions()
  const [period, setPeriod] = useState<Period>(6)
  const [chartMode, setChartMode] = useState<ChartMode>('stacked')
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set(CATEGORIES)
  )

  useEffect(() => {
    load()
  }, [load])

  const monthlyTrend = useMemo(
    () => calcMonthlyTrend(subscriptions, period),
    [subscriptions, period]
  )

  const categoryTrend = useMemo(
    () => calcCategoryMonthlyTrend(subscriptions, period),
    [subscriptions, period]
  )

  const summaryStats = useMemo(() => {
    if (monthlyTrend.length === 0) return null
    const totals = monthlyTrend.map((m) => m.total)
    const maxTotal = Math.max(...totals)
    const maxMonth = monthlyTrend[totals.indexOf(maxTotal)]?.month ?? '-'
    const avg = Math.round(totals.reduce((s, v) => s + v, 0) / totals.length)
    const last = monthlyTrend[monthlyTrend.length - 1]
    const prev = monthlyTrend[monthlyTrend.length - 2]
    const change = last && prev ? last.total - prev.total : 0
    return { maxTotal, maxMonth, avg, change }
  }, [monthlyTrend])

  function toggleCategory(cat: Category) {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        if (next.size > 1) next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        読み込み中...
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">推移分析</h1>
          <p className="text-muted-foreground">期間ごとの支出傾向を把握しましょう</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <VisualNovelPanel
          characterId="analyst-cool"
          message="月ごとの変化は、単月の金額よりも傾向で見る方が正確です。増加しているカテゴリから順に、継続課金と一時支出を切り分けましょう。"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MiniCharacterGuide
          characterId="analyst-cool"
          label="Trend Coach"
          message="推移は合計だけでなく、カテゴリごとの線の動きも見ると原因を絞り込めます。"
        />
      </motion.div>

      {summaryStats && (
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="最大支出月"
            value={formatCurrency(summaryStats.maxTotal)}
            sub={summaryStats.maxMonth}
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          />
          <SummaryCard
            label="期間平均"
            value={formatCurrency(summaryStats.avg)}
            sub="月次平均"
            icon={<Minus className="h-4 w-4 text-muted-foreground" />}
          />
          <SummaryCard
            label="前月比"
            value={formatCurrency(Math.abs(summaryStats.change))}
            sub={summaryStats.change > 0 ? '増加' : summaryStats.change < 0 ? '減少' : '変化なし'}
            icon={
              summaryStats.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : summaryStats.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )
            }
            highlight={summaryStats.change !== 0}
            positive={summaryStats.change < 0}
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <OverviewAreaChart data={monthlyTrend} />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">表示形式:</span>
          <div className="inline-flex rounded-lg border bg-muted p-1 gap-1">
            <ChartModeButton
              active={chartMode === 'stacked'}
              onClick={() => setChartMode('stacked')}
              icon={<BarChart3 className="h-3.5 w-3.5" />}
              label="積み上げ"
            />
            <ChartModeButton
              active={chartMode === 'line'}
              onClick={() => setChartMode('line')}
              icon={<LineChart className="h-3.5 w-3.5" />}
              label="折れ線"
            />
          </div>
        </div>

        {chartMode === 'stacked' ? (
          <CategoryStackedChart
            data={categoryTrend}
            activeCategories={activeCategories}
            onToggleCategory={toggleCategory}
          />
        ) : (
          <CategoryLineChart
            data={categoryTrend}
            activeCategories={activeCategories}
            onToggleCategory={toggleCategory}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
  highlight = false,
  positive = false,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  highlight?: boolean
  positive?: boolean
}) {
  return (
    <Card
      className={cn(
        highlight && (positive ? 'border-green-500/40 bg-green-50/30 dark:bg-green-950/20' : 'border-red-500/40 bg-red-50/30 dark:bg-red-950/20')
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className={cn('text-2xl font-bold', highlight && (positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'))}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}

function ChartModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
