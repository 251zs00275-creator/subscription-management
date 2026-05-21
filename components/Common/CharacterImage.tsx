import Image from 'next/image'
import { CHARACTERS, type CharacterExpression, type CharacterId } from '@/lib/characters'
import { cn } from '@/lib/utils'

interface CharacterImageProps {
  characterId: CharacterId
  variant: 'portrait' | 'mascot' | 'pose' | 'coach'
  expression?: CharacterExpression
  alt?: string
  priority?: boolean
  className?: string
  imageClassName?: string
  sizes?: string
}

const DIMENSIONS = {
  portrait: { width: 520, height: 760 },
  mascot: { width: 320, height: 320 },
  pose: { width: 520, height: 760 },
  coach: { width: 320, height: 320 },
}

export function CharacterImage({
  characterId,
  variant,
  expression = 'normal',
  alt,
  priority = false,
  className,
  imageClassName,
  sizes,
}: CharacterImageProps) {
  const character = CHARACTERS[characterId]
  const dimensions = DIMENSIONS[variant]
  const src =
    variant === 'portrait'
      ? character.expressions[expression] ?? character.portrait
      : variant === 'pose'
        ? character.pose
        : variant === 'coach'
          ? character.coachMascot
          : character.mascot

  return (
    <div className={cn('character-pop', className)}>
      <Image
        src={src}
        alt={alt ?? `${character.name} ${variant}`}
        width={dimensions.width}
        height={dimensions.height}
        priority={priority}
        sizes={sizes ?? (variant === 'portrait' || variant === 'pose' ? '(max-width: 768px) 48vw, 260px' : '96px')}
        className={imageClassName}
      />
    </div>
  )
}
