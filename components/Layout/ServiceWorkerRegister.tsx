'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('[ServiceWorkerRegister] 登録に失敗しました', error)
    })
  }, [])

  return null
}
