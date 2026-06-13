'use client'

import { CharacterImage } from '@/components/Common/CharacterImage'
import { AnimatedBackground } from '@/components/Layout/AnimatedBackground'
import { CHARACTERS, type CharacterId } from '@/lib/characters'
import { storage } from '@/lib/storage'

const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[]

interface CharacterSelectScreenProps {
  onSelect: (characterId: CharacterId) => void
}

export function CharacterSelectScreen({ onSelect }: CharacterSelectScreenProps) {
  function handleSelect(characterId: CharacterId) {
    storage.markCharacterSelectedToday(characterId)
    storage.addCharacterAffection(characterId, 10)
    onSelect(characterId)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4">
      <AnimatedBackground />
      <div className="relative z-10 mx-auto max-w-5xl py-8">
        <h1 className="text-center text-2xl font-black text-gradient">
          案内キャラクターを選択してください
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          選んだキャラクターがこれからのサブスク管理をサポートします。
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {CHARACTER_IDS.map((id) => {
            const character = CHARACTERS[id]
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelect(id)}
                className="anime-pressable character-stage-card group block w-full rounded-3xl px-4 pb-4 pt-4 text-left focus:outline-none focus:ring-2 focus:ring-[var(--anime-primary)]"
              >
                <div className="relative flex min-h-[300px] flex-col sm:min-h-[390px]">
                  <div className="relative z-20">
                    <p className="text-lg font-black text-[var(--anime-text)]">{character.name}</p>
                    <p className="text-xs font-bold text-[var(--anime-muted)]">{character.title}</p>
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute bottom-8 left-1/2 h-24 w-44 -translate-x-1/2 rounded-full blur-2xl"
                    style={{ background: character.glow }}
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
      </div>
    </div>
  )
}
