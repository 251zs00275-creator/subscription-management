import { cn } from '@/lib/utils'
import type { NavIconKey } from '@/lib/navigation'

interface AnimeNavIconProps {
  icon: NavIconKey
  className?: string
}

const ICON_INDEX: Record<NavIconKey, number> = {
  dashboard: 0,
  subscriptions: 1,
  import: 2,
  history: 3,
  receipt: 4,
  trends: 5,
  suggestions: 6,
  achievements: 7,
}

export function AnimeNavIcon({ icon, className }: AnimeNavIconProps) {
  const index = ICON_INDEX[icon]
  const column = index % 4
  const row = Math.floor(index / 4)

  return (
    <span
      aria-hidden="true"
      className={cn('anime-nav-icon block shrink-0', className)}
      style={{
        backgroundImage: "url('/icons/school-anime-nav-icons.png')",
        backgroundPosition: `${column * 33.333333}% ${row * 100}%`,
      }}
    />
  )
}
