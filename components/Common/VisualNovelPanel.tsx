'use client'

import { motion } from 'framer-motion'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { CHARACTERS, type CharacterExpression, type CharacterId } from '@/lib/characters'

interface VisualNovelPanelProps {
  characterId: CharacterId
  message: string
  tone?: 'calm' | 'alert' | 'success'
  expression?: CharacterExpression
}

const toneStyles = {
  calm: 'border-[rgba(91,168,255,0.28)]',
  alert: 'border-[rgba(255,79,163,0.32)]',
  success: 'border-[rgba(212,165,116,0.34)]',
}

export function VisualNovelPanel({
  characterId,
  message,
  tone = 'calm',
  expression = 'normal',
}: VisualNovelPanelProps) {
  const character = CHARACTERS[characterId]

  return (
    <motion.section
      className={`relative overflow-hidden rounded-2xl border ${toneStyles[tone]}`}
      style={{
        background: 'var(--vn-panel-bg)',
        boxShadow: `0 24px 58px ${character.glow}, 0 10px 32px rgba(35,120,180,0.12)`,
      }}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'linear-gradient(90deg, transparent 0 28px, rgba(125,211,252,0.08) 29px 30px), linear-gradient(0deg, transparent 0 28px, rgba(125,211,252,0.06) 29px 30px)',
          backgroundSize: '30px 30px',
        }}
      />
      <div className="absolute left-0 top-0 h-1 w-full" style={{ background: `linear-gradient(90deg, ${character.accent}, var(--anime-sky), transparent)` }} />
      <div className="relative grid min-h-[238px] gap-4 p-5 sm:grid-cols-[210px_1fr] sm:p-6">
        <CharacterImage
          characterId={characterId}
          variant="portrait"
          expression={expression}
          priority
          className="character-float hidden h-[244px] w-[190px] self-end sm:block"
          imageClassName="h-full w-full object-contain object-bottom drop-shadow-2xl"
          sizes="190px"
        />
        <CharacterImage
          characterId={characterId}
          variant="coach"
          className="character-float mx-auto h-24 w-24 sm:hidden"
          imageClassName="h-full w-full object-contain drop-shadow-xl"
          sizes="96px"
        />
        <div className="flex min-w-0 flex-col justify-end">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: character.accent, boxShadow: `0 0 14px ${character.accent}` }}
            />
            <div>
              <p className="academy-kicker">{character.assignment}</p>
              <p className="text-xs font-semibold text-[var(--anime-muted)]">{character.title}</p>
            </div>
          </div>
          <div
            className="rounded-xl border p-4 backdrop-blur"
            style={{
              background: 'var(--vn-bubble-bg)',
              borderColor: character.accent,
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.54), 0 10px 28px ${character.glow}`,
            }}
          >
            <p className="text-sm font-bold text-[var(--vn-text)]">{character.name}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--vn-text)]">{message}</p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
