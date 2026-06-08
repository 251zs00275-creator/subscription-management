import { renderHook, act } from '@testing-library/react'
import { useConfetti } from '@/hooks/useConfetti'
import { fireConfetti } from '@/lib/confetti'

jest.mock('@/lib/confetti', () => ({
  fireConfetti: jest.fn(),
}))

describe('useConfetti', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('triggers fireConfetti with the default "save" variant', () => {
    const { result } = renderHook(() => useConfetti())

    act(() => {
      result.current.fireConfetti()
    })

    expect(fireConfetti).toHaveBeenCalledWith('save')
  })

  it('forwards the requested variant to fireConfetti', () => {
    const { result } = renderHook(() => useConfetti())

    act(() => {
      result.current.fireConfetti('achievement')
    })

    expect(fireConfetti).toHaveBeenCalledWith('achievement')
  })

  it('keeps the same trigger reference across renders', () => {
    const { result, rerender } = renderHook(() => useConfetti())
    const first = result.current.fireConfetti
    rerender()
    expect(result.current.fireConfetti).toBe(first)
  })
})
