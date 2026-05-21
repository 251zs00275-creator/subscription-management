'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { CHARACTERS, type CharacterId } from '@/lib/characters'
import { MASCOT_DIALOGUES, STATE_LABELS, type DialogueState } from '@/lib/dialogues'

export type MascotState = DialogueState

interface MascotCharacterProps {
  state?: MascotState
  characterId?: CharacterId
  size?: 'sm' | 'md' | 'lg'
}

const STATE_CHARACTER: Record<MascotState, CharacterId> = {
  neutral: 'main-heroine',
  happy: 'reminder-jirai',
  worried: 'analyst-cool',
  alert: 'advisor-danger',
}

const SIZE_CLASSES = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
}

export function MascotCharacter({
  state = 'neutral',
  characterId,
  size = 'md',
}: MascotCharacterProps) {
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const [showBubble, setShowBubble] = useState(false)
  const activeCharacterId = characterId ?? STATE_CHARACTER[state]
  const character = CHARACTERS[activeCharacterId]
  const dialogues = MASCOT_DIALOGUES[state]

  const handleClick = () => {
    setDialogueIdx((i) => (i + 1) % dialogues.length)
    setShowBubble(true)
    setTimeout(() => setShowBubble(false), 2800)
  }

  const shakeProps =
    state === 'worried'
      ? {
          animate: { x: [0, -3, 3, -3, 0] },
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 4 },
        }
      : {}

  const pulseProps =
    state === 'alert'
      ? { animate: { scale: [1, 1.04, 1] }, transition: { duration: 0.8, repeat: Infinity } }
      : {}

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium shadow-lg"
            style={{
              background: 'var(--anime-card)',
              border: '1px solid var(--anime-card-border)',
              color: 'var(--anime-text)',
            }}
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {dialogues[dialogueIdx]}
            <div
              className="absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
              style={{
                background: 'var(--anime-card)',
                border: '1px solid var(--anime-card-border)',
                borderLeft: 'none',
                borderTop: 'none',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        aria-label={`${character.name}をクリック`}
        className="relative cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--anime-primary)] focus:ring-offset-2"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        {...shakeProps}
        {...pulseProps}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-3 bottom-1 h-3 rounded-full blur-sm"
          style={{ background: 'rgba(0,0,0,0.16)' }}
        />
        <CharacterImage
          characterId={activeCharacterId}
          variant="mascot"
          className={`relative ${SIZE_CLASSES[size]}`}
          imageClassName="h-full w-full object-contain drop-shadow-xl"
          sizes={size === 'lg' ? '128px' : size === 'sm' ? '64px' : '96px'}
        />
      </motion.button>

      <p
        className="mt-1 text-center font-game text-[9px] font-semibold uppercase tracking-wider"
        style={{ color: character.accent }}
      >
        {STATE_LABELS[state]}
      </p>
    </div>
  )
}
