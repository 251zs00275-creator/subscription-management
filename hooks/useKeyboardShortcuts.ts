'use client'

import { useEffect } from 'react'

interface ShortcutMap {
  [key: string]: (e: KeyboardEvent) => void
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      const isEditable = tag === 'input' || tag === 'textarea' || tag === 'select'

      for (const [key, handler] of Object.entries(shortcuts)) {
        if (e.key === key && !isEditable) {
          handler(e)
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
