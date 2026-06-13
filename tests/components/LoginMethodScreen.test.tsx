import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginMethodScreen } from '@/components/Layout/LoginMethodScreen'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { storage } from '@/lib/storage'
import { CHARACTERS } from '@/lib/characters'

jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: jest.fn(),
  getSupabaseBrowserClient: jest.fn(),
}))

jest.mock('@/lib/storage', () => ({
  storage: {
    enableGuestMode: jest.fn(),
  },
}))

const mockGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.MockedFunction<
  typeof getSupabaseBrowserClient
>
const mockStorage = storage as jest.Mocked<typeof storage>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('LoginMethodScreen', () => {
  it('選択キャラ名を含む見出し、Googleログインボタン、ゲストボタンを表示する', () => {
    mockGetSupabaseBrowserClient.mockReturnValue(null)

    render(<LoginMethodScreen characterId="main-heroine" onGuest={jest.fn()} />)

    expect(
      screen.getByText(`${CHARACTERS['main-heroine'].name}と一緒にサブスク管理を始めましょう`)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Googleでログイン/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ゲストとして利用する/ })).toBeInTheDocument()
  })

  it('Googleログインボタンをクリックすると signInWithOAuth が呼ばれる', async () => {
    const signInWithOAuth = jest.fn().mockResolvedValue({ data: {}, error: null })
    mockGetSupabaseBrowserClient.mockReturnValue({
      auth: { signInWithOAuth },
    } as never)
    const user = userEvent.setup()

    render(<LoginMethodScreen characterId="main-heroine" onGuest={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /Googleでログイン/ }))

    await waitFor(() =>
      expect(signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          options: expect.objectContaining({ redirectTo: window.location.origin }),
        })
      )
    )
  })

  it('クライアントが取得できない場合、Googleログインをクリックしても何もしない', async () => {
    mockGetSupabaseBrowserClient.mockReturnValue(null)
    const user = userEvent.setup()

    render(<LoginMethodScreen characterId="main-heroine" onGuest={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /Googleでログイン/ }))

    expect(mockGetSupabaseBrowserClient).toHaveBeenCalled()
  })

  it('ゲストボタンをクリックすると enableGuestMode と onGuest が呼ばれる', async () => {
    mockGetSupabaseBrowserClient.mockReturnValue(null)
    const onGuest = jest.fn()
    const user = userEvent.setup()

    render(<LoginMethodScreen characterId="advisor-danger" onGuest={onGuest} />)

    await user.click(screen.getByRole('button', { name: /ゲストとして利用する/ }))

    expect(mockStorage.enableGuestMode).toHaveBeenCalledTimes(1)
    expect(onGuest).toHaveBeenCalledTimes(1)
  })
})
