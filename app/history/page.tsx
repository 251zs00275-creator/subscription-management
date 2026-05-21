'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, BarChart2, List, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HistoryBarChart } from '@/components/Charts/HistoryBarChart'
import { VisualNovelPanel } from '@/components/Common/VisualNovelPanel'
import { MiniCharacterGuide } from '@/components/Common/MiniCharacterGuide'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { formatCurrency } from '@/lib/calculator'
import { CATEGORIES, CATEGORY_COLORS } from '@/types'
import type { Category } from '@/types'
import { cn } from '@/lib/utils'

type ViewMode = 'chart' | 'list'
const PAGE_SIZE = 50

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export default function HistoryPage() {
  const { subscriptions, isLoading, load } = useSubscriptions()
  const [rawQuery, setRawQuery] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    load()
  }, [load])

  // 300ms debounce
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), 300)
    return () => clearTimeout(t)
  }, [rawQuery])

  // Reset pagination when query changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, categoryFilter])

  const results = useMemo(() => {
    if (!query.trim()) return []
    return subscriptions
      .filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) &&
          (categoryFilter === 'all' || s.category === categoryFilter)
      )
      .sort((a, b) => b.nextPaymentDate.localeCompare(a.nextPaymentDate))
  }, [subscriptions, query, categoryFilter])

  const totalAmount = useMemo(() => results.reduce((s, r) => s + r.amount, 0), [results])
  const avgAmount = results.length > 0 ? Math.round(totalAmount / results.length) : 0
  const visibleResults = results.slice(0, visibleCount)

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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight text-gradient">購入履歴</h1>
        <p className="text-muted-foreground">サービス名・店舗名で過去の購入を検索できます</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <VisualNovelPanel
          characterId="analyst-cool"
          message="履歴検索は分析の入口です。気になる店舗名やサービス名で絞り込めば、固定費と一時支出の境目が見えてきます。"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MiniCharacterGuide
          characterId="analyst-cool"
          label="Search Coach"
          message="店名やサービス名で絞り込むと、月ごとの支出癖を追いやすくなります。"
        />
      </motion.div>

      {/* Search + filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="例: ポーラ、Netflix、スターバックス..."
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {rawQuery && (
            <button
              onClick={() => { setRawQuery(''); setQuery('') }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのカテゴリ</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View mode toggle */}
        <div className="inline-flex rounded-lg border bg-muted p-1 gap-1">
          <ViewModeButton
            active={viewMode === 'chart'}
            onClick={() => setViewMode('chart')}
            icon={<BarChart2 className="h-4 w-4" />}
            label="グラフ"
          />
          <ViewModeButton
            active={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            icon={<List className="h-4 w-4" />}
            label="リスト"
          />
        </div>
      </motion.div>

      {/* Empty states */}
      {!query.trim() && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
        >
          <Search className="mb-4 h-12 w-12 opacity-30" />
          <p className="text-base font-medium">サービス名・店舗名を入力して検索</p>
          <p className="mt-1 text-sm">例: ポーラ、Netflix、スターバックス</p>
        </motion.div>
      )}

      {query.trim() && results.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
        >
          <Search className="mb-4 h-12 w-12 opacity-30" />
          <p className="text-base font-medium">&ldquo;{query}&rdquo; に一致する履歴が見つかりません</p>
          <p className="mt-1 text-sm">別のキーワードで検索してみてください</p>
        </motion.div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Summary bar */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-3"
          >
            <SummaryTile label="一致件数" value={`${results.length}件`} />
            <SummaryTile label="合計金額" value={formatCurrency(totalAmount)} />
            <SummaryTile label="平均単価" value={formatCurrency(avgAmount)} />
          </motion.div>

          {viewMode === 'chart' && (
            <motion.div variants={itemVariants}>
              <HistoryBarChart results={results} />
            </motion.div>
          )}

          {viewMode === 'list' && (
            <motion.div variants={itemVariants} className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">日付</th>
                    <th className="px-4 py-2.5 text-left font-medium">名称</th>
                    <th className="px-4 py-2.5 text-left font-medium">カテゴリ</th>
                    <th className="px-4 py-2.5 text-right font-medium">金額</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visibleResults.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                        {s.nextPaymentDate}
                      </td>
                      <td className="px-4 py-2.5 max-w-[240px] truncate font-medium">
                        {s.name}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: CATEGORY_COLORS[s.category] + '88',
                            color: CATEGORY_COLORS[s.category],
                          }}
                        >
                          {s.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        ¥{s.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {results.length > visibleCount && (
                <div className="flex justify-center border-t py-3">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="text-sm text-primary hover:underline"
                  >
                    さらに{Math.min(PAGE_SIZE, results.length - visibleCount)}件表示
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  )
}

function ViewModeButton({
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
