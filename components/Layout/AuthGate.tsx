'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'
import { CharacterSelectScreen } from '@/components/Layout/CharacterSelectScreen'
import { LoginMethodScreen } from '@/components/Layout/LoginMethodScreen'
import { AnimatedBackground } from '@/components/Layout/AnimatedBackground'
import { storage } from '@/lib/storage'
import type { CharacterId } from '@/lib/characters'

type AuthStatus = 'loading' | 'character-select' | 'login-method' | 'signed-in'

interface AuthGateProps {
  children: React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const configured = isSupabaseConfigured()
  const [status, setStatus] = useState<AuthStatus>(configured ? 'loading' : 'signed-in')
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId>('main-heroine')

  useEffect(() => {
    if (!configured) return

    const client = getSupabaseBrowserClient()
    if (!client) {
      setStatus('signed-in')
      return
    }

    function resolve(hasUser: boolean) {
      if (hasUser || storage.hasEnabledGuestMode()) {
        setStatus('signed-in')
      } else {
        setStatus('character-select')
      }
    }

    void client.auth.getSession().then(({ data }) => {
      resolve(Boolean(data.session?.user))
    })

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      resolve(Boolean(session?.user))
    })

    return () => data.subscription.unsubscribe()
  }, [configured])

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center">
        <AnimatedBackground />
        <Loader2 className="relative z-10 h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === 'character-select') {
    return (
      <CharacterSelectScreen
        onSelect={(characterId) => {
          setSelectedCharacterId(characterId)
          setStatus('login-method')
        }}
      />
    )
  }

  if (status === 'login-method') {
    return (
      <LoginMethodScreen
        characterId={selectedCharacterId}
        onGuest={() => setStatus('signed-in')}
      />
    )
  }

  return <>{children}</>
}
