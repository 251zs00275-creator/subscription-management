'use client'

import { useState } from 'react'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { LevelBadge } from '@/components/Gamification/LevelBadge'
import { CHARACTERS, FEATURE_LABELS, type CharacterId } from '@/lib/characters'
import { CharacterDetailDialog } from '@/components/Common/CharacterDetailDialog'

const CHARACTER_IDS: CharacterId[] = [
  'main-heroine',
  'analyst-cool',
  'reminder-jirai',
  'advisor-danger',
]

export function Sidebar() {
  const [detailCharacterId, setDetailCharacterId] = useState<CharacterId | null>(null)

  return (
    <aside
      className="hidden w-72 flex-col border-r border-[var(--anime-card-border)] p-4 backdrop-blur-xl lg:flex"
      style={{ background: 'var(--app-sidebar-bg)' }}
    >
      <div className="mb-3 px-2">
        <p className="academy-kicker">Guide Characters</p>
        <h2 className="text-lg font-black text-gradient">案内キャラクター</h2>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {CHARACTER_IDS.map((id, index) => {
          const character = CHARACTERS[id]
          const featureLabels = character.featureLead.map((feature) => FEATURE_LABELS[feature]).join(' / ')

          return (
            <button
              key={id}
              type="button"
              onClick={() => setDetailCharacterId(id)}
              className="character-stage-card group block w-full rounded-3xl px-4 pb-3 pt-4 text-left"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="relative min-h-[230px]">
                <div className="absolute left-0 top-0 z-10 max-w-[150px]">
                  <p className="text-sm font-black text-[var(--anime-text)]">{character.name}</p>
                  <p className="mt-0.5 text-xs font-black leading-snug text-[var(--anime-text)]/85">
                    {character.title}
                  </p>
                  <p className="mt-2 rounded-full border border-[var(--anime-card-border)] bg-white/86 px-2 py-1 text-[11px] font-black leading-snug text-[var(--anime-text)]/90 backdrop-blur dark:bg-slate-950/78">
                    {featureLabels}
                  </p>
                </div>

                <div
                  aria-hidden="true"
                  className="absolute bottom-4 left-1/2 h-16 w-36 -translate-x-1/2 rounded-full blur-xl"
                  style={{ background: character.glow }}
                />

                <CharacterImage
                  characterId={id}
                  variant="portrait"
                  className="character-float absolute bottom-2 right-[-6px] h-[210px] w-[160px] transition-transform duration-300 group-hover:scale-[1.06]"
                  imageClassName="h-full w-full object-contain object-bottom drop-shadow-2xl"
                  sizes="150px"
                />
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-3">
        <LevelBadge />
      </div>
      <CharacterDetailDialog
        characterId={detailCharacterId}
        open={detailCharacterId !== null}
        onClose={() => setDetailCharacterId(null)}
      />
    </aside>
  )
}
