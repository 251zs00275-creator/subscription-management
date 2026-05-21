'use client'

import { CharacterImage } from '@/components/Common/CharacterImage'
import { CHARACTERS, type CharacterId } from '@/lib/characters'
import { cn } from '@/lib/utils'

interface MiniCharacterGuideProps {
  characterId: CharacterId
  label?: string
  message: string
  className?: string
  compact?: boolean
}

export function MiniCharacterGuide({
  characterId,
  label,
  message,
  className,
  compact = false,
}: MiniCharacterGuideProps) {
  const character = CHARACTERS[characterId]

  return (
    <aside
      className={cn(
        'mini-character-guide anime-pressable rounded-2xl border',
        compact ? 'gap-2 p-2.5' : 'p-3',
        className
      )}
      style={{
        borderColor: character.accent,
        boxShadow: `0 14px 34px ${character.glow}`,
      }}
    >
      <CharacterImage
        characterId={characterId}
        variant="coach"
        className={cn(
          'character-float shrink-0',
          compact ? 'h-16 w-16' : 'h-20 w-20 sm:h-24 sm:w-24'
        )}
        imageClassName="h-full w-full object-contain drop-shadow-xl"
        sizes="96px"
      />
      <div className="min-w-0">
        <p className="academy-kicker">{label ?? character.assignment}</p>
        <p className={cn(
          'mt-1 font-bold text-[var(--anime-text)]',
          compact ? 'text-xs leading-5' : 'text-sm leading-6'
        )}>
          {message}
        </p>
      </div>
    </aside>
  )
}
