'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, Search, CreditCard, ArrowUpDown, Download, GripVertical } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SortableSubscriptionCard } from '@/components/Common/SortableSubscriptionCard'
import { SubscriptionCard } from '@/components/Common/SubscriptionCard'
import { VisualNovelPanel } from '@/components/Common/VisualNovelPanel'
import { MiniCharacterGuide } from '@/components/Common/MiniCharacterGuide'
import { BackupPanel } from '@/components/Common/BackupPanel'
import { SubscriptionForm } from '@/components/Forms/SubscriptionForm'
import { EmptyState } from '@/components/Common/EmptyState'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useDragOrder } from '@/hooks/useDragOrder'
import { formatCurrency } from '@/lib/calculator'
import { useToast } from '@/hooks/use-toast'
import { exportToCSV } from '@/lib/export'
import { CATEGORIES } from '@/types'
import type { Subscription, Category } from '@/types'

type SortKey = 'name' | 'amount' | 'date'

function NewParamHandler({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      onOpen()
      router.replace('/subscriptions')
    }
  }, [searchParams, router, onOpen])

  return null
}

function SubscriptionsContent() {
  const { subscriptions, isLoading, error, load, add, update, remove, toggle, reorder, clearError } =
    useSubscriptions()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [activeId, setActiveId] = useState<string | null>(null)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (error) {
      toast({ title: 'エラー', description: error, variant: 'destructive' })
      clearError()
    }
  }, [error, toast, clearError])

  const allIds = useMemo(() => subscriptions.map((s) => s.id), [subscriptions])
  const { orderedIds, setOrder } = useDragOrder(allIds)

  const hasFilter = Boolean(search || categoryFilter !== 'all')

  const orderedSubscriptions = useMemo(() => {
    if (hasFilter) return subscriptions
    const idToSub = new Map(subscriptions.map((s) => [s.id, s]))
    return orderedIds.flatMap((id) => {
      const sub = idToSub.get(id)
      return sub ? [sub] : []
    })
  }, [subscriptions, orderedIds, hasFilter])

  const filtered = useMemo(() => {
    let result = orderedSubscriptions.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.includes(search)
      const matchCategory = categoryFilter === 'all' || s.category === categoryFilter
      return matchSearch && matchCategory
    })

    if (hasFilter) {
      result = [...result].sort((a, b) => {
        if (sortKey === 'amount') return b.amount - a.amount
        if (sortKey === 'date') return a.nextPaymentDate.localeCompare(b.nextPaymentDate)
        return a.name.localeCompare(b.name, 'ja')
      })
    }

    return result
  }, [orderedSubscriptions, search, categoryFilter, sortKey, hasFilter])

  const monthlyTotal = useMemo(
    () => subscriptions.filter((s) => s.isActive).reduce((sum, s) => sum + s.amount, 0),
    [subscriptions]
  )

  const activeCount = subscriptions.filter((s) => s.isActive).length

  function handleEdit(sub: Subscription) {
    setEditing(sub)
    setFormOpen(true)
  }

  function handleClose() {
    setFormOpen(false)
    setEditing(undefined)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    await remove(deleteTarget)
    setDeleteTarget(null)
    toast({ title: '✂️ 削除しました', description: '節約スコアが上がりました！' })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = orderedIds.indexOf(active.id as string)
    const newIndex = orderedIds.indexOf(over.id as string)
    const newOrder = arrayMove(orderedIds, oldIndex, newIndex)
    setOrder(newOrder)
    reorder(newOrder)
  }

  const activeSubscription = activeId
    ? subscriptions.find((s) => s.id === activeId)
    : null

  const filteredIds = filtered.map((s) => s.id)

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <NewParamHandler onOpen={() => setFormOpen(true)} />
      </Suspense>

      {/* ヘッダー */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">サブスク管理</h1>
          <p className="text-sm text-[var(--anime-muted)]">
            有効 <span className="font-game font-bold text-[var(--anime-text)]">{activeCount}</span>件 /{' '}
            <span className="font-game font-bold" style={{ color: 'var(--anime-gold)' }}>
              {formatCurrency(monthlyTotal)}
            </span>/月
          </p>
        </div>
        <div className="flex gap-2">
          {subscriptions.length > 0 && (
            <Button
              variant="outline"
              onClick={() => exportToCSV(subscriptions)}
              aria-label="CSVエクスポート"
            >
              <Download className="mr-2 h-4 w-4" />
              エクスポート
            </Button>
          )}
          <Button
            onClick={() => setFormOpen(true)}
            aria-label="新しいサブスクを追加"
            style={{
              background: 'linear-gradient(135deg, #1455B4, #2A52BE)',
              color: 'white',
              boxShadow: '0 0 12px rgba(20,85,180,0.3)',
              border: 'none',
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            追加
          </Button>
        </div>
      </div>

      <VisualNovelPanel
        characterId="main-heroine"
        message="ここは契約リストの整理担当です。使っているもの、止めたいもの、支払日が近いものを一緒に見ていきましょう。"
      />

      <MiniCharacterGuide
        characterId="main-heroine"
        label="List Coach"
        message="カードを並べ替える前に、金額・支払日・有効状態を一度確認しておきましょう。"
      />

      <BackupPanel
        onImported={async () => {
          await load()
          toast({
            title: 'バックアップを復元しました',
            description: '別端末から持ち込んだデータを一覧へ反映しました。',
          })
        }}
      />

      {/* 検索・フィルタ・ソート */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder="サービス名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="サブスクを検索"
          />
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as Category | 'all')}
        >
          <SelectTrigger className="w-full sm:w-36" aria-label="カテゴリで絞り込み">
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilter && (
          <Select
            value={sortKey}
            onValueChange={(v) => setSortKey(v as SortKey)}
          >
            <SelectTrigger className="w-full sm:w-36" aria-label="並び替え">
              <ArrowUpDown className="mr-2 h-3 w-3" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">名前順</SelectItem>
              <SelectItem value="amount">金額順</SelectItem>
              <SelectItem value="date">支払日順</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* DnD無効バナー */}
      {hasFilter && subscriptions.length > 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <GripVertical className="h-3.5 w-3.5" />
          フィルター中はドラッグ並び替えが無効です
        </p>
      )}

      {/* リスト */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer h-32 rounded-xl"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="サブスクがありません"
          description={
            hasFilter
              ? '検索条件に一致するサブスクが見つかりませんでした'
              : 'まず最初のサブスクを追加してみましょう'
          }
          actionLabel={hasFilter ? undefined : '追加する'}
          onAction={hasFilter ? undefined : () => setFormOpen(true)}
        />
      ) : hasFilter ? (
        <AnimatePresence mode="popLayout">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sub) => (
              <SortableSubscriptionCard
                key={sub.id}
                subscription={sub}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteTarget(id)}
                onToggle={toggle}
              />
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setActiveId(e.active.id as string)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={filteredIds} strategy={rectSortingStrategy}>
            <AnimatePresence mode="popLayout">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((sub) => (
                  <SortableSubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteTarget(id)}
                    onToggle={toggle}
                  />
                ))}
              </div>
            </AnimatePresence>
          </SortableContext>

          <DragOverlay>
            {activeSubscription && (
              <SubscriptionCard
                subscription={activeSubscription}
                onEdit={() => {}}
                onDelete={() => {}}
                onToggle={() => {}}
                isDragging
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      <SubscriptionForm
        open={formOpen}
        onClose={handleClose}
        onSubmit={editing ? (data) => update(editing.id, data) : add}
        initial={editing}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="サブスクを削除"
        description="このサブスクを削除します。削除すると節約スコアが上がります！"
        confirmLabel="削除する"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default function SubscriptionsPage() {
  return <SubscriptionsContent />
}
