import { renderHook, act } from '@testing-library/react'

jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
  })),
}))

import { useTheme as useNextTheme } from 'next-themes'
const mockUseNextTheme = useNextTheme as jest.Mock

describe('useTheme', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns isDark false when resolvedTheme is light', async () => {
    mockUseNextTheme.mockReturnValue({ theme: 'light', setTheme: jest.fn(), resolvedTheme: 'light' })
    const { useTheme } = await import('@/hooks/useTheme')
    const { result } = renderHook(() => useTheme())
    expect(result.current.isDark).toBe(false)
  })

  it('returns isDark true when resolvedTheme is dark', async () => {
    mockUseNextTheme.mockReturnValue({ theme: 'dark', setTheme: jest.fn(), resolvedTheme: 'dark' })
    const { useTheme } = await import('@/hooks/useTheme')
    const { result } = renderHook(() => useTheme())
    expect(result.current.isDark).toBe(true)
  })

  it('toggleTheme calls setTheme with dark when currently light', async () => {
    const mockSetTheme = jest.fn()
    mockUseNextTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme, resolvedTheme: 'light' })
    const { useTheme } = await import('@/hooks/useTheme')
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggleTheme())
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('toggleTheme calls setTheme with light when currently dark', async () => {
    const mockSetTheme = jest.fn()
    mockUseNextTheme.mockReturnValue({ theme: 'dark', setTheme: mockSetTheme, resolvedTheme: 'dark' })
    const { useTheme } = await import('@/hooks/useTheme')
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggleTheme())
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
