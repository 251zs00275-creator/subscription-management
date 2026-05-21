'use client'

import { useEffect, useState } from 'react'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { CHARACTERS, FEATURE_LABELS, type CharacterId } from '@/lib/characters'
import { storage } from '@/lib/storage'
import { cn } from '@/lib/utils'

const CHARACTER_IDS: CharacterId[] = [
  'main-heroine',
  'analyst-cool',
  'reminder-jirai',
  'advisor-danger',
]

interface CharacterSelectorProps {
  onChange?: (characterId: CharacterId) => void
}

export function CharacterSelector({ onChange }: CharacterSelectorProps) {
  const [selected, setSelected] = useState<CharacterId>('main-heroine')

  useEffect(() => {
    const stored = storage.getSelectedCharacterId()
    setSelected(stored)
    onChange?.(stored)
  }, [onChange])

  function handleSelect(characterId: CharacterId) {
    setSelected(characterId)
    storage.saveSelectedCharacterId(characterId)
    storage.addCharacterAffection(characterId, 10)
    onChange?.(characterId)
  }

  return (
    <div className="academy-panel rounded-2xl p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="academy-kicker">Guide Unit</p>
        <p className="text-xs font-medium text-[var(--anime-text)]">{CHARACTERS[selected].name}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CHARACTER_IDS.map((id) => {
          const character = CHARACTERS[id]
          const isSelected = selected === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleSelect(id)}
              aria-label={`${character.name}を案内キャラにする`}
              className={cn(
                'anime-pressable relative grid grid-cols-[48px_1fr] items-center gap-2 rounded-xl border p-1.5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[var(--anime-primary)]',
                isSelected ? 'scale-[1.03]' : 'opacity-70 hover:opacity-100'
              )}
              style={{
                borderColor: isSelected ? character.accent : 'var(--anime-card-border)',
                boxShadow: isSelected ? `0 0 18px ${character.glow}` : undefined,
              }}
            >
              <CharacterImage
                characterId={id}
                variant="mascot"
                className="mx-auto h-12 w-12"
                imageClassName="h-full w-full object-contain"
                sizes="48px"
              />
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-[var(--anime-text)]">
                  {character.name}
                </span>
                <span className="block truncate text-[10px] text-[var(--anime-muted)]">
                  {character.featureLead.map((feature) => FEATURE_LABELS[feature]).join(' / ')}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
