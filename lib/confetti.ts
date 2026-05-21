import type confettiModule from 'canvas-confetti'

type ConfettiVariant = 'save' | 'delete' | 'achievement'

let confettiFn: typeof confettiModule | null = null

async function getConfetti(): Promise<typeof confettiModule | null> {
  if (typeof window === 'undefined') return null
  if (process.env.NODE_ENV === 'test') return null
  const canvas = document.createElement('canvas')
  if (!canvas.getContext('2d')) return null
  if (confettiFn) return confettiFn
  const mod = await import('canvas-confetti')
  confettiFn = mod.default
  return confettiFn
}

export async function fireConfetti(variant: ConfettiVariant = 'save'): Promise<void> {
  const confetti = await getConfetti()
  if (!confetti) return

  if (variant === 'save') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'],
    })
  } else if (variant === 'achievement') {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#ffd700', '#ffb700', '#ff8c00', '#ffd700'],
      shapes: ['star'],
      scalar: 1.2,
    })
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffd700', '#ffb700'],
      })
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffd700', '#ffb700'],
      })
    }, 200)
  } else if (variant === 'delete') {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#22c55e', '#86efac', '#bbf7d0'],
      scalar: 0.8,
    })
  }
}
