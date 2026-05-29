'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { AnimeNavIcon } from '@/components/Common/AnimeNavIcon'
import { CloudSyncButton } from '@/components/Common/CloudSyncButton'
import { Button } from '@/components/ui/button'
import { useGameStats } from '@/hooks/useGameStats'
import { APP_NAV_ITEMS } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const { gameStats } = useGameStats()
  const pathname = usePathname()
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  const unclaimedAchievements = gameStats.achievements.filter((a) => a.unlockedAt !== null && !a.claimedAt).length

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--anime-card-border)] px-3 py-2 backdrop-blur-xl md:px-5"
      style={{ background: 'var(--app-header-bg)' }}
    >
      <div className="flex items-center gap-3">
        <Link href="/" className="anime-pressable hidden shrink-0 rounded-2xl px-2 py-1.5 md:block">
          <span className="block text-base font-black leading-none text-gradient">サブスク学園</span>
          <span className="academy-kicker block text-[10px]">Finance Club</span>
        </Link>

        <nav className="hoyolab-tabs flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1" aria-label="メイン機能">
          {APP_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'anime-pressable group relative flex min-w-[82px] shrink-0 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-center transition-all md:min-w-[96px]',
                  isActive
                    ? 'text-[var(--anime-text)]'
                    : 'text-[var(--anime-nav-muted)] hover:text-[var(--anime-text)]'
                )}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(232,247,255,0.48))',
                        boxShadow: '0 10px 24px rgba(56,189,248,0.18), inset 0 0 0 1px var(--anime-card-border)',
                      }
                    : undefined
                }
              >
                <AnimeNavIcon icon={item.icon} className="h-10 w-10 md:h-11 md:w-11" />
                <span className="max-w-full truncate text-[11px] font-black leading-tight md:text-xs">
                  {item.shortLabel}
                </span>
                {isActive && (
                  <span className="absolute inset-x-5 -bottom-1 h-1 rounded-full bg-[var(--anime-pink)] shadow-[0_0_12px_rgba(255,122,184,0.45)]" />
                )}
                {item.feature === 'achievements' && unclaimedAchievements > 0 && (
                  <span className="absolute right-3 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-[0_0_12px_rgba(244,63,94,0.7)]">
                    {unclaimedAchievements}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          onPointerDown={(event) => {
            event.preventDefault()
            toggleTheme()
          }}
          onClick={(event) => {
            if (event.detail === 0) {
              toggleTheme()
            }
          }}
          aria-label="テーマを切り替える"
          className="relative shrink-0 rounded-2xl hover:bg-[var(--anime-surface)]"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 text-[var(--anime-gold)] transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-[var(--anime-sky)] transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <CloudSyncButton />
      </div>
    </header>
  )
}
