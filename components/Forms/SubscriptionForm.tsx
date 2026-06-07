'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { CATEGORIES } from '@/types'
import { toSubscriptionFormData } from '@/lib/subscriptionPresets'
import { PresetPicker } from '@/components/Forms/PresetPicker'
import type { PresetSelection } from '@/components/Forms/PresetPicker'
import type { Subscription, SubscriptionFormData, Category } from '@/types'

type EntryMode = 'preset' | 'custom'

interface SubscriptionFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: SubscriptionFormData) => Promise<void>
  initial?: Subscription
}

function getDefaultData(): SubscriptionFormData {
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  return {
    name: '',
    amount: 0,
    category: 'サブスク',
    nextPaymentDate: nextMonth.toISOString().slice(0, 10),
    memo: '',
    isActive: true,
  }
}

export function SubscriptionForm({
  open,
  onClose,
  onSubmit,
  initial,
}: SubscriptionFormProps) {
  const [data, setData] = useState<SubscriptionFormData>(
    initial
      ? {
          name: initial.name,
          amount: initial.amount,
          category: initial.category,
          nextPaymentDate: initial.nextPaymentDate,
          memo: initial.memo,
          isActive: initial.isActive,
        }
      : getDefaultData()
  )
  const [errors, setErrors] = useState<Partial<Record<keyof SubscriptionFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [entryMode, setEntryMode] = useState<EntryMode>(initial ? 'custom' : 'preset')
  const [isPresetEditing, setIsPresetEditing] = useState(false)
  const [presetSelection, setPresetSelection] = useState<PresetSelection | null>(null)

  function validate(): boolean {
    const next: typeof errors = {}
    if (!data.name.trim()) next.name = 'サービス名を入力してください'
    if (data.amount <= 0) next.amount = '金額は1円以上で入力してください'
    if (!data.nextPaymentDate) next.nextPaymentDate = '支払日を入力してください'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  function set<K extends keyof SubscriptionFormData>(key: K, value: SubscriptionFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handlePresetSelectionChange(selection: PresetSelection | null) {
    setPresetSelection(selection)
    if (!selection) return
    setData((prev) => toSubscriptionFormData(selection.preset, selection.plan, prev))
    setErrors((prev) => ({
      ...prev,
      name: undefined,
      amount: undefined,
      nextPaymentDate: undefined,
    }))
  }

  const shouldShowEditableFields = initial || entryMode === 'custom' || isPresetEditing

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? 'サブスクを編集' : '新しいサブスクを追加'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!initial && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-sky-200/70 bg-white/72 p-1.5 dark:border-sky-300/20 dark:bg-slate-950/62">
                {([
                  ['preset', 'プリセットから選ぶ', '主要サービスをすぐ入力'],
                  ['custom', '自分でカスタム', '自由に手入力'],
                ] as const).map(([mode, title, description]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setEntryMode(mode)
                      if (mode === 'custom') {
                        setIsPresetEditing(false)
                      }
                    }}
                    aria-pressed={entryMode === mode}
                    className={`anime-pressable rounded-xl px-3 py-3 text-left transition ${
                      entryMode === mode
                        ? 'bg-sky-500 text-white shadow-[0_12px_30px_rgba(56,189,248,0.28)]'
                        : 'bg-transparent text-[var(--anime-text)]/72 hover:bg-white/82 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="block text-sm font-black">{title}</span>
                    <span className="mt-0.5 block text-[11px] font-bold opacity-80">{description}</span>
                  </button>
                ))}
              </div>

              {entryMode === 'preset' ? (
                <PresetPicker
                  nextPaymentDate={data.nextPaymentDate}
                  isSubmitting={isSubmitting}
                  onEditingChange={setIsPresetEditing}
                  onSelectionChange={handlePresetSelectionChange}
                />
              ) : (
                <div className="rounded-2xl border border-pink-200/70 bg-pink-50/70 p-4 text-sm font-medium leading-relaxed text-[var(--anime-text)]/78 dark:border-pink-300/20 dark:bg-pink-950/28">
                  サービス名、金額、カテゴリを自由に入力できます。公式プリセットにない支払い、年払いの独自換算、家族割などはこちらで登録してください。
                </div>
              )}
            </div>
          )}

          {isPresetEditing && (
            <div className="rounded-2xl border border-pink-200/70 bg-white/78 p-4 text-sm font-bold text-[var(--anime-text)]/78 dark:border-pink-300/20 dark:bg-slate-950/58">
              プリセットを修正中。必要な項目だけ変更して登録できます。
            </div>
          )}

          {shouldShowEditableFields && (
            <>
          <div className="space-y-1">
            <Label htmlFor="name">サービス名 *</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Netflix, Spotify など"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="amount">月額（円）*</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              value={data.amount || ''}
              onChange={(e) => set('amount', Number(e.target.value))}
              placeholder="1490"
              aria-invalid={!!errors.amount}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="category">カテゴリ</Label>
            <Select
              value={data.category}
              onValueChange={(v) => set('category', v as Category)}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="nextPaymentDate">次回支払日 *</Label>
            <Input
              id="nextPaymentDate"
              type="date"
              value={data.nextPaymentDate}
              onChange={(e) => set('nextPaymentDate', e.target.value)}
              aria-invalid={!!errors.nextPaymentDate}
            />
            {errors.nextPaymentDate && (
              <p className="text-xs text-destructive">{errors.nextPaymentDate}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="memo">メモ</Label>
            <Textarea
              id="memo"
              value={data.memo}
              onChange={(e) => set('memo', e.target.value)}
              placeholder="備考など"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              checked={data.isActive}
              onCheckedChange={(v) => set('isActive', v)}
            />
            <Label htmlFor="isActive">有効にする</Label>
          </div>
            </>
          )}

          {(shouldShowEditableFields || !presetSelection) && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : initial ? '更新する' : '追加する'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
