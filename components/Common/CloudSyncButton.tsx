'use client'

import { useEffect, useState } from 'react'
import { Cloud, LogIn, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'

export function CloudSyncButton() {
  const configured = isSupabaseConfigured()
  const [user, setUser] = useState<User | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const client = getSupabaseBrowserClient()
    if (!client) return

    void client.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  async function signIn() {
    const client = getSupabaseBrowserClient()
    if (!client) return
    setBusy(true)
    await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/subscriptions`,
      },
    })
    setBusy(false)
  }

  async function signOut() {
    const client = getSupabaseBrowserClient()
    if (!client) return
    setBusy(true)
    await client.auth.signOut()
    setBusy(false)
  }

  if (!configured) {
    return (
      <span
        className="hidden rounded-2xl border border-[var(--anime-card-border)] px-3 py-2 text-[11px] font-bold text-[var(--anime-muted)] xl:inline-flex"
        title="Supabase の環境変数を設定すると Google ログインとクラウド同期を使えます。"
      >
        Local only
      </span>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="anime-pressable shrink-0 rounded-2xl px-3"
      onClick={user ? signOut : signIn}
      disabled={busy}
      title={user ? `${user.email ?? 'Google account'} と同期中` : 'Google でログインしてサブスクを同期'}
    >
      {user ? <Cloud className="mr-1.5 h-4 w-4 text-sky-500" /> : <LogIn className="mr-1.5 h-4 w-4" />}
      <span className="hidden sm:inline">{user ? '同期中' : 'Google'}</span>
      {user && <LogOut className="ml-1.5 hidden h-3.5 w-3.5 sm:block" />}
    </Button>
  )
}
