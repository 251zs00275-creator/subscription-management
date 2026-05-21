'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Grid2X2,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TotalCard } from '@/components/Dashboard/TotalCard'
import { CategoryPieChart } from '@/components/Dashboard/CategoryPieChart'
import { TrendChart } from '@/components/Dashboard/TrendChart'
import { HighlightCards } from '@/components/Dashboard/HighlightCards'
import { LevelBadge } from '@/components/Gamification/LevelBadge'
import { StreakBadge } from '@/components/Gamification/StreakBadge'
import { CharacterSelector } from '@/components/Common/CharacterSelector'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { MiniCharacterGuide } from '@/components/Common/MiniCharacterGuide'
import { SkeletonCard } from '@/components/Dashboard/SkeletonCard'
import { DailyCalendar } from '@/components/Gamification/DailyCalendar'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useGameStats } from '@/hooks/useGameStats'
import {
  calcMonthlyTotal,
  calcCategoryTotals,
  calcMonthlyTrend,
  calcHighlights,
} from '@/lib/calculator'
import { getLevelTitle } from '@/lib/gameEngine'
import { storage } from '@/lib/storage'
import type { CharacterId } from '@/lib/characters'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const { subscriptions, isLoading, load } = useSubscriptions()
  const { gameStats } = useGameStats()
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId>('main-heroine')

  useEffect(() => {
    load()
    setSelectedCharacterId(storage.getSelectedCharacterId())
  }, [load])

  const subscriptionTotal = useMemo(
    () =>
      subscriptions
        .filter((s) => s.isActive && s.category === 'サブスク')
        .reduce((sum, s) => sum + s.amount, 0),
    [subscriptions]
  )

  const generalTotal = useMemo(
    () =>
      subscriptions
        .filter((s) => s.isActive && s.category !== 'サブスク')
        .reduce((sum, s) => sum + s.amount, 0),
    [subscriptions]
  )

  const monthlyTotal = useMemo(
    () => calcMonthlyTotal(subscriptions),
    [subscriptions]
  )

  const categoryTotals = useMemo(
    () => calcCategoryTotals(subscriptions),
    [subscriptions]
  )

  const trend = useMemo(
    () => calcMonthlyTrend(subscriptions),
    [subscriptions]
  )

  const highlights = useMemo(
    () => calcHighlights(subscriptions),
    [subscriptions]
  )

  const levelTitle = getLevelTitle(gameStats.level)
  const dashboardMessage = useMemo(() => {
    if (monthlyTotal === 0) {
      return 'まだ支出データがありません。まずは毎月のサブスクや定額支出を登録して、見える化を始めましょう。'
    }
    const unusedCount = subscriptions.filter((s) => s.isActive && s.memo?.includes('未使用')).length
    if (unusedCount > 0) {
      return `${unusedCount}件、確認したいサブスクがあります。使っていないものが混ざっていないか、今日のうちに軽く見ておきましょう。`
    }
    if (highlights.some((h) => h.previousAmount > 0 && h.changePercentage > 20)) {
      return '前月より増えているカテゴリがあります。原因が一時的なものか、毎月続きそうなものかを分けて見ましょう。'
    }
    return '今月の支出は一覧で確認できます。定額支出は小さく見えても積み上がるので、週に一度だけ整えると安定します。'
  }, [highlights, monthlyTotal, subscriptions])

  const activeSubscriptions = subscriptions.filter((s) => s.isActive)
  const nextPaymentCount = activeSubscriptions.filter((s) => {
    const days = Math.ceil((new Date(s.nextPaymentDate).getTime() - Date.now()) / 86_400_000)
    return days >= 0 && days <= 7
  }).length
  const unlockedCount = gameStats.achievements.filter((a) => a.unlockedAt !== null).length
  const topCategory = categoryTotals[0]?.category ?? '未分類'

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-md skeleton-shimmer" />
        <div className="grid gap-4 sm:grid-cols-3">
          <SkeletonCard delay={0} />
          <SkeletonCard delay={0.1} />
          <SkeletonCard delay={0.2} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="skeleton-shimmer h-64 rounded-xl" />
          <div className="skeleton-shimmer h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="academy-kicker">Dashboard Overview</p>
          <h1 className="text-3xl font-bold text-gradient">ダッシュボード</h1>
          <p className="text-sm text-[var(--anime-muted)]">今月の支出状況をアカデミーコンソールで確認します</p>
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge />
          <Link
            href="/subscriptions?new=1"
            className="anime-pressable inline-flex items-center gap-2 rounded-xl bg-[var(--anime-primary)] px-4 py-2 text-sm font-bold text-white shadow-[0_14px_30px_rgba(22,119,210,0.28)] transition hover:translate-y-[-1px] dark:shadow-[0_14px_34px_rgba(56,189,248,0.22)]"
          >
            サブスク追加
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-7 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-7">
          <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr_1fr_1fr]">
            <AcademyTotalPanel amount={monthlyTotal} />
            <AcademyStatCard
              title="有効サブスク"
              value={`${activeSubscriptions.length}`}
              sub="active subscriptions"
              icon={CreditCard}
              accent="#1677D2"
            />
            <AcademyStatCard
              title="7日以内の支払"
              value={`${nextPaymentCount}`}
              sub="upcoming charges"
              icon={CalendarDays}
              accent="#0EA5E9"
            />
            <AcademyStatCard
              title="カテゴリ"
              value={`${categoryTotals.length}`}
              sub={`Top: ${topCategory}`}
              icon={Grid2X2}
              accent="#F95FA1"
            />
          </section>

          <section className="grid gap-7 xl:grid-cols-[1fr_1.45fr]">
            <CategoryPieChart data={categoryTotals} />
            <TrendChart data={trend} />
          </section>

          <section className="grid gap-7 xl:grid-cols-[1.1fr_0.9fr]">
            <HighlightCards highlights={highlights} />
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <TotalCard
                  title="サブスク合計"
                  amount={subscriptionTotal}
                  icon={CreditCard}
                  description="有効なサブスクのみ"
                  emoji="📺"
                  accentColor="#1677D2"
                />
                <TotalCard
                  title="一般支出合計"
                  amount={generalTotal}
                  icon={Wallet}
                  description="サブスク以外"
                  emoji="💰"
                  accentColor="#18B681"
                />
              </div>
              <LevelBadge />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <AcademyAssistantPanel
            characterId={selectedCharacterId}
            message={dashboardMessage}
            unlockedCount={unlockedCount}
            levelTitle={levelTitle}
          />
          <MiniCharacterGuide
            characterId="main-heroine"
            label="Dashboard Coach"
            message="月額合計、次回支払、カテゴリの順に見ると今日の確認が早く終わります。"
            compact
          />
          <CharacterSelector onChange={setSelectedCharacterId} />
          <AcademyMissionPanel
            activeCount={activeSubscriptions.length}
            nextPaymentCount={nextPaymentCount}
            unlockedCount={unlockedCount}
          />
        </aside>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DailyCalendar />
      </motion.div>
    </motion.div>
  )
}

function AcademyTotalPanel({ amount }: { amount: number }) {
  const formatted = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount)

  return (
    <div className="relative min-h-[190px] overflow-hidden rounded-2xl border border-sky-200 bg-[linear-gradient(135deg,#0787D8,#22C7F5)] p-6 text-white shadow-[0_24px_58px_rgba(14,165,233,0.28)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.34),transparent_28%),linear-gradient(90deg,transparent_0_28px,rgba(255,255,255,0.12)_29px_30px),linear-gradient(0deg,transparent_0_28px,rgba(255,255,255,0.1)_29px_30px)] bg-[length:auto,30px_30px,30px_30px]" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">月次合計</p>
          <Sparkles className="h-5 w-5 opacity-80" />
        </div>
        <p className="font-game mt-6 text-5xl font-bold">{formatted}</p>
        <p className="mt-2 text-sm text-sky-50">全カテゴリの今月合計</p>
        <div className="mt-8 flex h-12 items-end gap-2 opacity-70">
          {[28, 38, 48, 58, 70, 88, 74].map((height, index) => (
            <span key={index} className="w-5 rounded-t bg-white/70" style={{ height }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AcademyStatCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  title: string
  value: string
  sub: string
  icon: typeof CreditCard
  accent: string
}) {
  return (
    <div className="academy-panel rounded-2xl p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/86 shadow-sm dark:bg-slate-950/42" style={{ color: accent }}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-xs font-bold text-[var(--anime-muted)]">{title}</p>
      <p className="font-game mt-2 text-4xl font-bold text-[var(--anime-text)]">{value}</p>
      <div className="mt-4 h-1.5 rounded-full bg-sky-100 dark:bg-slate-800">
        <div className="h-full w-2/3 rounded-full" style={{ background: accent }} />
      </div>
      <p className="mt-2 text-xs text-[var(--anime-muted)]">{sub}</p>
    </div>
  )
}

function AcademyAssistantPanel({
  characterId,
  message,
  unlockedCount,
  levelTitle,
}: {
  characterId: CharacterId
  message: string
  unlockedCount: number
  levelTitle: string
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-sky-200 bg-[linear-gradient(180deg,rgba(238,249,255,0.96),rgba(255,255,255,0.92))] shadow-[0_24px_58px_rgba(33,122,184,0.14)] dark:border-sky-300/20 dark:bg-[linear-gradient(180deg,rgba(10,21,38,0.92),rgba(11,29,50,0.84))] dark:shadow-[0_24px_58px_rgba(0,0,0,0.38)]">
      <div className="absolute inset-0 bg-[url('/design/mini-commentary-stage.png')] bg-cover bg-center opacity-42 dark:opacity-18" />
      <div className="relative border-b border-sky-200/70 px-5 py-3 dark:border-sky-300/20">
        <p className="academy-kicker">Academy Assistant</p>
      </div>
      <div className="relative min-h-[360px] px-5 pt-4">
        <CharacterImage
          characterId={characterId}
          variant="portrait"
          priority
          className="character-float mx-auto h-[250px] max-w-full"
          imageClassName="h-full w-full object-contain object-bottom drop-shadow-2xl"
          sizes="320px"
        />
        <div className="relative -mt-5 rounded-2xl border border-sky-200 bg-white/88 p-4 shadow-[0_16px_34px_rgba(33,122,184,0.16)] backdrop-blur dark:border-sky-300/24 dark:bg-slate-950/58 dark:shadow-[0_16px_34px_rgba(0,0,0,0.34)]">
          <p className="text-sm font-bold text-[var(--anime-text)]">今日のブリーフィング</p>
          <p className="mt-2 text-sm leading-7 text-[var(--anime-text)]">{message}</p>
        </div>
      </div>
      <div className="relative grid grid-cols-2 gap-2 p-5 pt-0">
        <MiniInfo label="ランク" value={levelTitle} />
        <MiniInfo label="実績" value={`${unlockedCount} 件`} />
      </div>
    </section>
  )
}

function AcademyMissionPanel({
  activeCount,
  nextPaymentCount,
  unlockedCount,
}: {
  activeCount: number
  nextPaymentCount: number
  unlockedCount: number
}) {
  const missions = [
    { label: '契約リストを確認', done: activeCount > 0 },
    { label: '7日以内の支払を確認', done: nextPaymentCount === 0 },
    { label: '実績を確認', done: unlockedCount > 0 },
  ]

  return (
    <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white/88 shadow-[0_18px_44px_rgba(33,122,184,0.14)] dark:border-sky-300/20 dark:bg-slate-950/62 dark:shadow-[0_18px_44px_rgba(0,0,0,0.32)]">
      <div className="flex items-center justify-between bg-[var(--anime-primary)] px-5 py-3 text-white">
        <p className="text-sm font-bold">今日のミッション</p>
        <p className="font-game text-sm">{missions.filter((m) => m.done).length}/3</p>
      </div>
      <div className="space-y-2 p-4">
        {missions.map((mission) => (
          <div key={mission.label} className="anime-pressable flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3 dark:border-sky-300/16 dark:bg-sky-950/28">
            <CheckCircle2 className={mission.done ? 'h-5 w-5 text-emerald-500' : 'h-5 w-5 text-sky-300'} />
            <span className="text-sm font-medium text-[var(--anime-text)]">{mission.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sky-100 bg-white/80 p-3 dark:border-sky-300/16 dark:bg-slate-950/48">
      <p className="text-xs text-[var(--anime-muted)]">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-[var(--anime-text)]">{value}</p>
    </div>
  )
}
