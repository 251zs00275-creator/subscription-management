'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { CHARACTERS, type CharacterId } from '@/lib/characters'
import { getCalendarMilestoneBonus } from '@/lib/gameEngine'
import { storage } from '@/lib/storage'
import { useGameStats } from '@/hooks/useGameStats'
import { cn } from '@/lib/utils'

const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[]

interface DailyLoginFlowProps {
  disabled?: boolean
}

export function DailyLoginFlow({ disabled = false }: DailyLoginFlowProps) {
  const { gameStats, claimLoginBonus } = useGameStats()
  const [step, setStep] = useState<'none' | 'character' | 'bonus'>('none')
  const [selected, setSelected] = useState<CharacterId>('main-heroine')

  useEffect(() => {
    if (disabled) {
      setStep('none')
      return
    }
    const current = storage.getSelectedCharacterId()
    setSelected(current)
    if (storage.needsDailyCharacterSelection()) {
      setStep('character')
    } else if (storage.needsLoginBonusClaim()) {
      setStep('bonus')
    }
  }, [disabled])

  const bonus = useMemo(() => {
    const visitCount = gameStats.monthlyVisits?.length ?? 1
    const milestone = getCalendarMilestoneBonus(visitCount)
    return {
      base: 5,
      milestone,
      total: 5 + milestone,
      visitCount,
    }
  }, [gameStats.monthlyVisits])

  function handleCharacterSelect(characterId: CharacterId) {
    setSelected(characterId)
    storage.markCharacterSelectedToday(characterId)
    storage.addCharacterAffection(characterId, 10)
    setStep(storage.needsLoginBonusClaim() ? 'bonus' : 'none')
  }

  function handleClaimBonus() {
    storage.markLoginBonusClaimedToday()
    storage.addCharacterAffection(selected, 5)
    claimLoginBonus(bonus.total)
    setStep('none')
  }

  const character = CHARACTERS[selected]

  return (
    <>
      <Dialog open={step === 'character'}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-6xl overflow-y-auto border border-sky-200/60 p-4 dark:border-sky-300/20 sm:p-6">
          <div className="absolute inset-0 bg-[url('/design/character-profile-stage.png')] bg-cover bg-center opacity-24" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(237,248,255,0.92))] dark:bg-[linear-gradient(180deg,rgba(7,13,26,0.9),rgba(8,17,32,0.94))]" />
          <DialogHeader className="relative">
            <DialogTitle className="text-center text-2xl font-black text-gradient">
              今日の案内キャラを選択
            </DialogTitle>
            <DialogDescription className="text-center">
              選んだキャラの好感度が上がり、今日のログインボーナスを受け取れます。
            </DialogDescription>
          </DialogHeader>

          <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {CHARACTER_IDS.map((id) => {
              const item = CHARACTERS[id]
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleCharacterSelect(id)}
                  className="anime-pressable character-stage-card group block w-full rounded-3xl px-4 pb-4 pt-4 text-left focus:outline-none focus:ring-2 focus:ring-[var(--anime-primary)]"
                >
                  <div className="relative flex min-h-[300px] flex-col sm:min-h-[390px]">
                    <div className="relative z-20">
                      <p className="text-lg font-black text-[var(--anime-text)]">{item.name}</p>
                      <p className="text-xs font-bold text-[var(--anime-muted)]">{item.title}</p>
                    </div>
                    <div
                      aria-hidden="true"
                      className="absolute bottom-8 left-1/2 h-24 w-44 -translate-x-1/2 rounded-full blur-2xl"
                      style={{ background: item.glow }}
                    />
                    <CharacterImage
                      characterId={id}
                      variant="pose"
                      className="character-float relative z-10 mt-auto h-[245px] w-full transition-transform duration-300 group-hover:scale-[1.04] sm:h-[330px]"
                      imageClassName="h-full w-full object-contain object-bottom drop-shadow-2xl"
                      sizes="260px"
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={step === 'bonus'}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-2xl overflow-y-auto">
          <div className="absolute inset-0 bg-[url('/design/character-profile-stage.png')] bg-cover bg-center opacity-32" />
          <div className="relative">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-center text-2xl font-black text-gradient">
                <CalendarCheck className="h-6 w-6 text-[var(--anime-pink)]" />
                学園出席簿
              </DialogTitle>
              <DialogDescription className="text-center">
                {character.name}が今日の出席を確認しました。
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 grid items-center gap-5 sm:grid-cols-[190px_1fr]">
              <CharacterImage
                characterId={selected}
                variant="coach"
                className="mx-auto h-44 w-44"
                imageClassName="h-full w-full object-contain drop-shadow-2xl"
                sizes="176px"
              />
              <div className="academy-panel rounded-2xl p-4">
                <p className="academy-kicker">Daily Bonus</p>
                <p className="mt-2 text-4xl font-black text-gradient-gold">+{bonus.total} XP</p>
                <div className="mt-3 space-y-2 text-sm text-[var(--anime-muted)]">
                  <p>出席ボーナス: +{bonus.base} XP</p>
                  {bonus.milestone > 0 && <p>月間{bonus.visitCount}日目ボーナス: +{bonus.milestone} XP</p>}
                  <p>{character.name}の好感度: +5</p>
                </div>
              </div>
            </div>

            <motion.div
              className="mt-5 grid grid-cols-7 gap-2"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
            >
              {Array.from({ length: 28 }).map((_, index) => {
                const day = index + 1
                const active = day <= bonus.visitCount
                return (
                  <motion.span
                    key={day}
                    variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                    className={cn(
                      'grid aspect-square place-items-center rounded-xl text-xs font-bold',
                      active ? 'bg-[var(--anime-primary)] text-white' : 'bg-[var(--anime-surface)] text-[var(--anime-muted)]'
                    )}
                  >
                    {day}
                  </motion.span>
                )
              })}
            </motion.div>

            <Button className="mt-5 w-full rounded-2xl" onClick={handleClaimBonus}>
              <Sparkles className="mr-2 h-4 w-4" />
              受け取る
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
