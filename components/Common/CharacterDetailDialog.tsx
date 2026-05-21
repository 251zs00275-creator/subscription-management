'use client'

import Image from 'next/image'
import type React from 'react'
import { BadgeCheck, Heart, Lock, Sparkles, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { CHARACTERS, FEATURE_LABELS, type CharacterId } from '@/lib/characters'
import { storage } from '@/lib/storage'

interface CharacterDetailDialogProps {
  characterId: CharacterId | null
  open: boolean
  onClose: () => void
}

export function CharacterDetailDialog({ characterId, open, onClose }: CharacterDetailDialogProps) {
  if (!characterId) return null

  const character = CHARACTERS[characterId]
  const affection = storage.getCharacterAffection()[characterId]

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="character-profile-modal max-h-[94vh] max-w-6xl overflow-y-auto border-0 p-0">
        <div className="absolute inset-0 bg-[url('/design/character-profile-stage.png')] bg-cover bg-center opacity-95" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.56)_48%,rgba(236,248,255,0.86))] dark:bg-[linear-gradient(90deg,rgba(7,13,26,0.24),rgba(7,13,26,0.68)_48%,rgba(7,13,26,0.9))]" />

        <div className="relative grid min-h-[680px] lg:grid-cols-[minmax(340px,0.92fr)_minmax(0,1.08fr)]">
          <section className="relative overflow-hidden p-7 md:p-9">
            <div className="absolute left-7 top-7 z-10 rounded-full border border-white/60 bg-white/64 px-4 py-1.5 text-xs font-black text-[var(--anime-primary)] shadow-lg backdrop-blur dark:border-sky-300/22 dark:bg-slate-950/46">
              Guide Profile
            </div>
            <div
              aria-hidden="true"
              className="absolute bottom-12 left-1/2 h-56 w-80 -translate-x-1/2 rounded-full blur-3xl"
              style={{ background: character.glow }}
            />
            <div className="absolute inset-x-7 bottom-7 h-32 rounded-[32px] border border-white/54 bg-white/24 shadow-[0_28px_70px_rgba(33,122,184,0.22)] backdrop-blur-md dark:border-sky-300/18 dark:bg-sky-950/18" />

            <CharacterImage
              characterId={characterId}
              variant="pose"
              priority
              className="character-float relative z-10 mx-auto mt-8 h-[560px] w-full max-w-[430px]"
              imageClassName="h-full w-full object-contain object-bottom drop-shadow-[0_34px_42px_rgba(24,70,120,0.34)]"
              sizes="430px"
            />

            <div className="relative z-20 -mt-4 rounded-3xl border border-white/62 bg-white/74 p-4 shadow-[0_18px_42px_rgba(33,122,184,0.18)] backdrop-blur-xl dark:border-sky-300/18 dark:bg-slate-950/58">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[var(--anime-muted)]">Selected Guide</p>
                  <p className="text-3xl font-black text-gradient">{character.name}</p>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg" style={{ background: character.accent }}>
                  <Sparkles className="h-7 w-7" />
                </div>
              </div>
              <p className="mt-2 text-sm font-bold text-[var(--anime-text)]">{character.title}</p>
            </div>
          </section>

          <section className="relative space-y-5 p-6 md:p-8 lg:p-9">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-4xl font-black leading-tight text-gradient md:text-5xl">
                {character.name}
              </DialogTitle>
              <DialogDescription className="text-sm font-bold text-[var(--anime-muted)]">
                {character.title} / 好感度 Lv.{affection.level}
              </DialogDescription>
            </DialogHeader>

            <div className="character-speech-bubble">
              <Heart className="h-5 w-5 shrink-0 text-[var(--anime-pink)]" />
              <p>{character.personality}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoPanel
                title="担当機能"
                icon={<BadgeCheck className="h-5 w-5" />}
                items={character.featureLead.map((feature) => FEATURE_LABELS[feature])}
              />
              <InfoPanel
                title="案内スタイル"
                icon={<Star className="h-5 w-5" />}
                items={[character.assignment]}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="魅力" value={character.stats.charm} accent={character.accent} />
              <Stat label="洞察" value={character.stats.insight} accent={character.accent} />
              <Stat label="支援" value={character.stats.support} accent={character.accent} />
            </div>

            <div className="academy-panel rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="academy-kicker">Affection</p>
                  <p className="text-lg font-black text-[var(--anime-text)]">好感度レベル {affection.level}</p>
                </div>
                <p className="font-game text-2xl font-black text-[var(--anime-pink)]">{affection.points} pt</p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--anime-surface)] shadow-inner">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--anime-pink),var(--anime-gold),var(--anime-primary))]"
                  style={{ width: `${Math.min(100, affection.points)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <p className="academy-kicker">Gallery Unlock</p>
                  <h3 className="text-xl font-black text-[var(--anime-text)]">解放イラスト</h3>
                </div>
                <span className="rounded-full border border-[var(--anime-card-border)] bg-white/58 px-3 py-1 text-xs font-bold text-[var(--anime-muted)] backdrop-blur dark:bg-slate-950/42">
                  {affection.unlockedGalleryIds.length}/{character.gallery.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {character.gallery.map((item) => {
                  const unlocked = affection.unlockedGalleryIds.includes(item.id)
                  return (
                    <div key={item.id} className="gallery-unlock-card">
                      <div className="relative">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={520}
                          height={760}
                          sizes="300px"
                          className={unlocked ? 'h-48 w-full object-cover' : 'h-48 w-full object-cover blur-md grayscale'}
                        />
                        {!unlocked && (
                          <div className="absolute inset-0 grid place-items-center bg-slate-950/46 text-white">
                            <div className="text-center">
                              <Lock className="mx-auto h-6 w-6" />
                              <p className="mt-2 text-xs font-black">好感度 Lv.{item.requiredLevel} で解放</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute left-3 top-3 rounded-full bg-white/78 px-3 py-1 text-[10px] font-black text-[var(--anime-primary)] backdrop-blur">
                          Memory
                        </div>
                      </div>
                      <div className="bg-[var(--anime-card)] p-3">
                        <p className="text-sm font-bold text-[var(--anime-text)]">{item.title}</p>
                        <p className="mt-1 text-xs text-[var(--anime-muted)]">{item.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoPanel({
  title,
  icon,
  items,
}: {
  title: string
  icon: React.ReactNode
  items: string[]
}) {
  return (
    <div className="academy-panel rounded-3xl p-4">
      <div className="mb-3 flex items-center gap-2 text-[var(--anime-primary)]">
        {icon}
        <p className="text-sm font-black text-[var(--anime-text)]">{title}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-[var(--anime-card-border)] bg-white/58 px-3 py-1 text-xs font-bold text-[var(--anime-muted)] dark:bg-slate-950/38">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="academy-panel rounded-3xl p-4">
      <p className="text-xs font-bold text-[var(--anime-muted)]">{label}</p>
      <p className="font-game mt-1 text-3xl font-black text-[var(--anime-text)]">{value}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--anime-surface)]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: accent }} />
      </div>
    </div>
  )
}
