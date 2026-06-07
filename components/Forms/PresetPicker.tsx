'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  SUBSCRIPTION_PRESETS,
  SUBSCRIPTION_PRESET_GROUPS,
  findSubscriptionPresetPlan,
} from '@/lib/subscriptionPresets'
import type {
  SubscriptionPreset,
  SubscriptionPresetGroup,
  SubscriptionPresetPlan,
} from '@/lib/subscriptionPresets'

export interface PresetSelection {
  preset: SubscriptionPreset
  plan: SubscriptionPresetPlan
}

interface PresetPickerProps {
  nextPaymentDate: string
  isSubmitting: boolean
  onEditingChange: (editing: boolean) => void
  onSelectionChange: (selection: PresetSelection | null) => void
}

function getPresetVisual(preset: SubscriptionPreset) {
  const key = preset.id
  const visuals: Record<string, { label: string; accent: string; mark?: 'spotify' | 'youtube' | 'apple' }> = {
    spotify: { label: '', accent: '#1DB954', mark: 'spotify' },
    'youtube-premium': { label: '', accent: '#FF0033', mark: 'youtube' },
    'apple-music': { label: '', accent: '#FA2D48', mark: 'apple' },
    'icloud-plus': { label: 'iC', accent: '#3B82F6' },
    netflix: { label: 'N', accent: '#E50914' },
    'amazon-prime': { label: 'a', accent: '#00A8E1' },
    'amazon-music-unlimited': { label: 'am', accent: '#00A8E1' },
    'disney-plus': { label: 'D+', accent: '#113CCF' },
    'u-next': { label: 'U', accent: '#111827' },
    hulu: { label: 'H', accent: '#1CE783' },
    'dmm-premium': { label: 'DMM', accent: '#0066FF' },
    'abema-premium': { label: 'AB', accent: '#00A7E1' },
    'danime-store': { label: 'dA', accent: '#EC4899' },
    audible: { label: 'Au', accent: '#F59E0B' },
    'kindle-unlimited': { label: 'Ku', accent: '#2563EB' },
    'google-one': { label: 'G1', accent: '#4285F4' },
    'microsoft-365': { label: 'M', accent: '#F25022' },
    'canva-pro': { label: 'C', accent: '#8B5CF6' },
    dropbox: { label: 'Db', accent: '#0061FF' },
    'playstation-plus': { label: 'PS', accent: '#006FCD' },
    'xbox-game-pass': { label: 'X', accent: '#107C10' },
    'nintendo-switch-online': { label: 'NS', accent: '#E60012' },
  }
  return visuals[key] ?? { label: preset.serviceName.slice(0, 2), accent: '#38BDF8' }
}

function ServiceLogo({ preset }: { preset: SubscriptionPreset }) {
  const visual = getPresetVisual(preset)

  if (visual.mark === 'spotify') {
    return (
      <span
        aria-hidden="true"
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-[0_10px_22px_rgba(29,185,84,0.28)]"
        style={{ background: visual.accent }}
      >
        <span className="absolute left-2.5 top-3 h-1.5 w-6 rounded-full border-t-2 border-white/95" />
        <span className="absolute left-3 top-[18px] h-1.5 w-5 rounded-full border-t-2 border-white/95" />
        <span className="absolute left-3.5 top-6 h-1.5 w-4 rounded-full border-t-2 border-white/95" />
      </span>
    )
  }

  if (visual.mark === 'youtube') {
    return (
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-[0_10px_22px_rgba(255,0,51,0.24)]"
        style={{ background: visual.accent }}
      >
        <span className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-white" />
      </span>
    )
  }

  if (visual.mark === 'apple') {
    return (
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-[0_10px_22px_rgba(250,45,72,0.24)]"
        style={{ background: visual.accent }}
      >
        ♪
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white shadow-[0_10px_22px_rgba(15,23,42,0.16)]"
      style={{ background: visual.accent }}
    >
      {visual.label}
    </span>
  )
}

export function PresetPicker({
  nextPaymentDate,
  isSubmitting,
  onEditingChange,
  onSelectionChange,
}: PresetPickerProps) {
  const [selectedPresetPlan, setSelectedPresetPlan] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState('')
  const [presetGroup, setPresetGroup] = useState<SubscriptionPresetGroup | 'すべて'>('すべて')
  const [presetSearch, setPresetSearch] = useState('')

  function clearPlanSelection() {
    setSelectedPresetPlan('')
    onEditingChange(false)
    onSelectionChange(null)
  }

  function selectPresetService(preset: SubscriptionPreset) {
    setSelectedPresetId(preset.id)
    clearPlanSelection()
  }

  function applyPreset(preset: SubscriptionPreset, plan: SubscriptionPresetPlan) {
    setSelectedPresetId(preset.id)
    setSelectedPresetPlan(`${preset.id}:${plan.id}`)
    onEditingChange(false)
    onSelectionChange({ preset, plan })
  }

  const selectedPreset = findSubscriptionPresetPlan(selectedPresetPlan)
  const filteredPresets = useMemo(
    () => {
      const normalizedQuery = presetSearch.trim().toLowerCase()
      return SUBSCRIPTION_PRESETS.filter((preset) => {
        const matchesGroup = presetGroup === 'すべて' || preset.group === presetGroup
        const searchableText = [
          preset.serviceName,
          preset.group,
          preset.sourceName,
          ...preset.plans.flatMap((plan) => [plan.name, plan.description]),
        ]
          .join(' ')
          .toLowerCase()
        return matchesGroup && (!normalizedQuery || searchableText.includes(normalizedQuery))
      })
    },
    [presetGroup, presetSearch]
  )

  return (
    <div className="rounded-2xl border border-sky-200/70 bg-sky-50/80 p-4 shadow-[0_18px_38px_rgba(56,189,248,0.12)] dark:border-sky-300/20 dark:bg-sky-950/45">
      <div className="mb-3 space-y-1">
        <Label htmlFor="subscription-preset">有名サブスクから選ぶ</Label>
        <p className="text-xs font-medium leading-relaxed text-[var(--anime-text)]/75">
          ジャンルで絞り込んで、サービスカードからプランを選んでください。通常の入力欄は修正時だけ開きます。
        </p>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {(['すべて', ...SUBSCRIPTION_PRESET_GROUPS] as const).map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => {
              setPresetGroup(group)
              setSelectedPresetId('')
              clearPlanSelection()
            }}
            aria-pressed={presetGroup === group}
            className={`anime-pressable shrink-0 rounded-full px-3 py-1.5 text-xs font-black transition ${
              presetGroup === group
                ? 'bg-pink-500 text-white shadow-[0_10px_24px_rgba(236,72,153,0.25)]'
                : 'bg-white/86 text-[var(--anime-text)]/78 hover:bg-white dark:bg-slate-950/72 dark:hover:bg-slate-900'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      <div className="mb-4 space-y-1.5">
        <Label htmlFor="preset-search">サービスを検索</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--anime-text)]/45" />
          <Input
            id="preset-search"
            value={presetSearch}
            onChange={(e) => {
              setPresetSearch(e.target.value)
              setSelectedPresetId('')
              clearPlanSelection()
            }}
            placeholder="Spotify, Netflix, Google など"
            className="bg-white/92 pl-9 dark:bg-slate-950/78"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filteredPresets.map((preset) => {
          const representativePlan = preset.plans[0]
          const isSelectedService = selectedPresetId === preset.id
          const visual = getPresetVisual(preset)
          return (
            <div
              key={preset.id}
              className={`rounded-2xl border-2 p-4 transition ${
                isSelectedService
                  ? 'border-sky-500 bg-white shadow-[0_18px_42px_rgba(56,189,248,0.24)] ring-2 ring-sky-200/70 dark:border-sky-300 dark:bg-slate-950/86 dark:ring-sky-300/20'
                  : 'border-slate-200 bg-white/90 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:border-sky-300 hover:bg-white hover:shadow-[0_14px_34px_rgba(56,189,248,0.16)] dark:border-slate-600/70 dark:bg-slate-950/72 dark:shadow-[0_12px_26px_rgba(0,0,0,0.3)] dark:hover:border-sky-300/55'
              }`}
            >
              <button
                type="button"
                onClick={() => selectPresetService(preset)}
                className="anime-pressable block w-full text-left"
                aria-expanded={isSelectedService}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <ServiceLogo preset={preset} />
                    <div className="min-w-0">
                      <p className="break-words text-base font-black text-[var(--anime-text)]">{preset.serviceName}</p>
                      <p className="mt-1 text-xs font-bold text-[var(--anime-text)]/65">{preset.group}</p>
                    </div>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black text-white shadow-sm"
                    style={{ background: visual.accent }}
                  >
                    {preset.plans.length}プラン
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-[var(--anime-text)]/78">
                  <p className="rounded-xl border border-slate-200 bg-slate-50/95 p-2 dark:border-white/10 dark:bg-white/8">
                    代表: {representativePlan.name}
                  </p>
                  <p className="rounded-xl border border-slate-200 bg-slate-50/95 p-2 dark:border-white/10 dark:bg-white/8">
                    ¥{representativePlan.monthlyAmount.toLocaleString()}/月
                  </p>
                </div>
                <p className="mt-2 text-[11px] font-bold text-[var(--anime-text)]/58">
                  料金確認日: {preset.checkedAt}
                </p>
              </button>

              {isSelectedService && (
                <div className="mt-4 space-y-2 border-t border-sky-100 pt-3 dark:border-white/10">
                  <p className="text-xs font-black text-[var(--anime-text)]/78">プランを選択</p>
                  <div className="grid gap-2">
                    {preset.plans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => applyPreset(preset, plan)}
                        className={`anime-pressable rounded-xl border px-3 py-2 text-left transition ${
                          selectedPresetPlan === `${preset.id}:${plan.id}`
                            ? 'border-pink-400 bg-pink-50 text-pink-900 shadow-[0_10px_24px_rgba(236,72,153,0.14)] dark:border-pink-300/70 dark:bg-pink-400/14 dark:text-pink-50'
                            : 'border-slate-200 bg-white/86 text-[var(--anime-text)] hover:border-pink-300 dark:border-white/10 dark:bg-slate-900/70'
                        }`}
                      >
                        <span className="block text-sm font-black">{plan.name}</span>
                        <span className="mt-1 block text-xs font-bold opacity-78">
                          月額換算 ¥{plan.monthlyAmount.toLocaleString()}
                          {plan.monthlyAmount !== plan.amount &&
                            ` / 実請求 ¥${plan.amount.toLocaleString()}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {filteredPresets.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm font-bold text-[var(--anime-text)]/68 dark:border-slate-600 dark:bg-slate-950/58">
          条件に一致するプリセットがありません。検索語句かカテゴリーを変更してください。
        </div>
      )}

      {selectedPreset && (
        <div className="mt-4 rounded-2xl border border-pink-200 bg-white/90 p-4 text-sm font-medium leading-relaxed text-[var(--anime-text)]/82 shadow-[0_18px_38px_rgba(236,72,153,0.12)] dark:border-pink-300/25 dark:bg-slate-950/78">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black text-pink-600 dark:text-pink-200">選択中のプリセット</p>
              <p className="mt-1 text-lg font-black text-[var(--anime-text)]">
                {selectedPreset.preset.serviceName} / {selectedPreset.plan.name}
              </p>
              <div className="mt-3 grid gap-2 text-xs font-bold md:grid-cols-2">
                <p className="rounded-xl bg-sky-50 p-2 dark:bg-sky-400/10">
                  月額換算: ¥{selectedPreset.plan.monthlyAmount.toLocaleString()}
                </p>
                <p className="rounded-xl bg-sky-50 p-2 dark:bg-sky-400/10">
                  実請求: ¥{selectedPreset.plan.amount.toLocaleString()}
                </p>
                <p className="rounded-xl bg-sky-50 p-2 dark:bg-sky-400/10">
                  次回支払日: {nextPaymentDate}
                </p>
                <p className="rounded-xl bg-sky-50 p-2 dark:bg-sky-400/10">
                  参照: {selectedPreset.preset.sourceName}
                </p>
              </div>
            </div>
            <div className="flex gap-2 md:flex-col">
              <Button type="button" variant="outline" onClick={() => onEditingChange(true)}>
                修正
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : 'この内容で追加'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
