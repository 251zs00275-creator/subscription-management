'use client'

import { useState } from 'react'
import { LogIn, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CharacterImage } from '@/components/Common/CharacterImage'
import { AnimatedBackground } from '@/components/Layout/AnimatedBackground'
import { CHARACTERS, type CharacterId } from '@/lib/characters'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { storage } from '@/lib/storage'

interface LoginMethodScreenProps {
  characterId: CharacterId
  onGuest: () => void
}

export function LoginMethodScreen({ characterId, onGuest }: LoginMethodScreenProps) {
  const [busy, setBusy] = useState(false)
  const character = CHARACTERS[characterId]

  async function handleLogin() {
    const client = getSupabaseBrowserClient()
    if (!client) return

    setBusy(true)
    await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    setBusy(false)
  }

  function handleGuest() {
    storage.enableGuestMode()
    onGuest()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-anime-card shadow-2xl">
        <div className="h-44 w-full overflow-hidden border-b border-[var(--anime-card-border)]">
          <CharacterImage
            characterId={characterId}
            variant="pose"
            className="character-float h-full w-full"
            imageClassName="h-full w-full object-contain object-bottom"
            sizes="384px"
            priority
          />
        </div>
        <div className="space-y-5 p-6 text-center">
          <div>
            <h1 className="text-lg font-bold">{character.name}と一緒にサブスク管理を始めましょう</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Googleアカウントでログインすると、サブスク情報をクラウドに同期して利用できます。
            </p>
          </div>
          <div className="space-y-2">
            <Button
              type="button"
              className="anime-pressable w-full"
              onClick={handleLogin}
              disabled={busy}
              isLoading={busy}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Googleでログイン
            </Button>
            <Button
              type="button"
              variant="outline"
              className="anime-pressable w-full"
              onClick={handleGuest}
              disabled={busy}
            >
              <User className="mr-2 h-4 w-4" />
              ゲストとして利用する
            </Button>
            <p className="text-xs text-muted-foreground">
              ゲストの場合、データはこの端末にのみ保存されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
