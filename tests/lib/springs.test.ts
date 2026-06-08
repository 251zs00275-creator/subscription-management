import {
  BOUNCE_SPRING,
  CARD_HOVER_SPRING,
  ENTER_SPRING,
  GENTLE_SPRING,
  POP_SPRING,
} from '@/lib/springs'

describe('springs', () => {
  const presets = {
    CARD_HOVER_SPRING,
    ENTER_SPRING,
    POP_SPRING,
    GENTLE_SPRING,
    BOUNCE_SPRING,
  }

  it('defines every preset as a spring transition with positive stiffness and damping', () => {
    Object.values(presets).forEach((preset) => {
      expect(preset.type).toBe('spring')
      expect(preset.stiffness).toBeGreaterThan(0)
      expect(preset.damping).toBeGreaterThan(0)
    })
  })

  it('exposes the expected named presets', () => {
    expect(Object.keys(presets)).toEqual([
      'CARD_HOVER_SPRING',
      'ENTER_SPRING',
      'POP_SPRING',
      'GENTLE_SPRING',
      'BOUNCE_SPRING',
    ])
  })
})
