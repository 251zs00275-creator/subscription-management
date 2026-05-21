'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { OnboardingWizard } from '@/components/Common/OnboardingWizard'
import { KeyboardHelp } from '@/components/Common/KeyboardHelp'
import { AchievementToast } from '@/components/Gamification/AchievementToast'
import { DailyLoginFlow } from '@/components/Common/DailyLoginFlow'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useGameStats } from '@/hooks/useGameStats'
import { storage } from '@/lib/storage'
import { FEATURE_CHARACTER, type AppFeature } from '@/lib/characters'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const { init, recordVisit } = useGameStats()

  useEffect(() => {
    init()
    recordVisit()
    if (!storage.hasCompletedOnboarding()) {
      setShowOnboarding(true)
    }
    // init and recordVisit are stable Zustand actions — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const shortcuts = useCallback(
    () => ({
      n: () => router.push('/subscriptions?new=1'),
      N: () => router.push('/subscriptions?new=1'),
      '/': () => {
        const searchInput = document.getElementById('search') as HTMLInputElement
        searchInput?.focus()
      },
      '?': () => setShowHelp(true),
    }),
    [router]
  )

  useKeyboardShortcuts(shortcuts())

  useEffect(() => {
    const pathFeature: Record<string, AppFeature> = {
      '/': 'dashboard',
      '/subscriptions': 'subscriptions',
      '/import': 'import',
      '/history': 'history',
      '/receipt': 'receipt',
      '/trends': 'trends',
      '/suggestions': 'suggestions',
      '/achievements': 'achievements',
    }
    const feature = pathFeature[pathname]
    if (!feature) return
    storage.recordFeatureVisit(feature, FEATURE_CHARACTER[feature])
  }, [pathname])

  return (
    <>
      {children}
      <OnboardingWizard
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      <DailyLoginFlow disabled={showOnboarding} />
      <KeyboardHelp open={showHelp} onClose={() => setShowHelp(false)} />
      <AchievementToast />
    </>
  )
}
