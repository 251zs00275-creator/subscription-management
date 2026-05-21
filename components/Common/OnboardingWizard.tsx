'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, FileUp, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { storage } from '@/lib/storage'
import { CharacterImage } from '@/components/Common/CharacterImage'
import type { CharacterId } from '@/lib/characters'

const STEPS = [
  {
    icon: CreditCard,
    title: 'サブスクを登録する',
    description:
      '毎月かかるサービスや定額支出を登録しましょう。Netflix、Spotify など月額費用を一元管理できます。',
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    characterId: 'main-heroine' as CharacterId,
  },
  {
    icon: FileUp,
    title: 'CSVで一括インポート',
    description:
      'MoneyForward ME や d払いの明細CSVを読み込むと、過去の支出を自動で分類してインポートできます。',
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
    characterId: 'reminder-jirai' as CharacterId,
  },
  {
    icon: BarChart3,
    title: 'ダッシュボードで把握',
    description:
      'カテゴリ別の支出グラフや月次推移でお金の流れを可視化。改善提案で節約機会も見つけられます。',
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    characterId: 'analyst-cool' as CharacterId,
  },
]

interface OnboardingWizardProps {
  open: boolean
  onClose: () => void
}

export function OnboardingWizard({ open, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      storage.markOnboardingComplete()
      onClose()
    }
  }

  function handleSkip() {
    storage.markOnboardingComplete()
    onClose()
  }

  const current = STEPS[step]
  const Icon = current.icon

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleSkip()}>
      <DialogContent className="max-w-md overflow-hidden">
        <div className="-mx-6 -mt-6 mb-2 h-36 overflow-hidden border-b border-[var(--anime-card-border)]">
          <Image
            src="/characters/events/optimized/splash.jpg"
            alt="サブスク管理キャラクター"
            width={900}
            height={520}
            priority
            sizes="448px"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <DialogHeader>
          <DialogTitle className="text-center">ようこそ！</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 py-2 text-center"
          >
            <div
              className={`mx-auto grid h-24 w-24 place-items-center rounded-full ${current.bg}`}
            >
              <CharacterImage
                characterId={current.characterId}
                variant="mascot"
                className="h-20 w-20"
                imageClassName="h-full w-full object-contain"
                sizes="80px"
              />
            </div>
            <Icon className={`mx-auto h-5 w-5 ${current.color}`} />
            <h3 className="text-lg font-semibold">{current.title}</h3>
            <p className="text-sm text-muted-foreground">{current.description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step < STEPS.length - 1 && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                スキップ
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {step < STEPS.length - 1 ? '次へ' : '始める'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
