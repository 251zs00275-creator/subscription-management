import { useCallback } from 'react'
import { fireConfetti } from '@/lib/confetti'

type ConfettiVariant = 'save' | 'delete' | 'achievement'

export function useConfetti() {
  const trigger = useCallback((variant: ConfettiVariant = 'save') => {
    fireConfetti(variant)
  }, [])

  return { fireConfetti: trigger }
}
