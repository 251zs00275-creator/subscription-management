jest.mock('canvas-confetti', () => ({
  __esModule: true,
  default: jest.fn(),
}))

import confetti from 'canvas-confetti'
import { fireConfetti } from '@/lib/confetti'

const confettiMock = confetti as unknown as jest.Mock

describe('fireConfetti', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    confettiMock.mockClear()
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as unknown as RenderingContext)
  })

  afterEach(() => {
    ;(process.env as { NODE_ENV: string }).NODE_ENV = originalEnv
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('does nothing while NODE_ENV is "test"', async () => {
    ;(process.env as { NODE_ENV: string }).NODE_ENV = 'test'
    await fireConfetti('save')
    expect(confettiMock).not.toHaveBeenCalled()
  })

  it('does nothing when the canvas has no 2d context', async () => {
    ;(process.env as { NODE_ENV: string }).NODE_ENV = 'development'
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    await fireConfetti('save')
    expect(confettiMock).not.toHaveBeenCalled()
  })

  it('fires a single burst for the "save" variant', async () => {
    ;(process.env as { NODE_ENV: string }).NODE_ENV = 'development'
    await fireConfetti('save')
    expect(confettiMock).toHaveBeenCalledTimes(1)
    expect(confettiMock).toHaveBeenCalledWith(expect.objectContaining({ particleCount: 80, spread: 70 }))
  })

  it('fires a single burst for the "delete" variant', async () => {
    ;(process.env as { NODE_ENV: string }).NODE_ENV = 'development'
    await fireConfetti('delete')
    expect(confettiMock).toHaveBeenCalledTimes(1)
    expect(confettiMock).toHaveBeenCalledWith(expect.objectContaining({ particleCount: 40, scalar: 0.8 }))
  })

  it('fires the star burst plus two side bursts for the "achievement" variant', async () => {
    jest.useFakeTimers()
    ;(process.env as { NODE_ENV: string }).NODE_ENV = 'development'

    const promise = fireConfetti('achievement')
    await Promise.resolve()
    expect(confettiMock).toHaveBeenCalledTimes(1)
    expect(confettiMock).toHaveBeenCalledWith(expect.objectContaining({ shapes: ['star'], scalar: 1.2 }))

    jest.advanceTimersByTime(200)
    await promise

    expect(confettiMock).toHaveBeenCalledTimes(3)
    expect(confettiMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ angle: 60, origin: { x: 0 } }))
    expect(confettiMock).toHaveBeenNthCalledWith(3, expect.objectContaining({ angle: 120, origin: { x: 1 } }))
  })

  it('defaults to the "save" variant when none is provided', async () => {
    ;(process.env as { NODE_ENV: string }).NODE_ENV = 'development'
    await fireConfetti()
    expect(confettiMock).toHaveBeenCalledWith(expect.objectContaining({ particleCount: 80 }))
  })
})
