import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CloudSyncButton } from '@/components/Common/CloudSyncButton'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: jest.fn(),
  getSupabaseBrowserClient: jest.fn(),
}))

const mockIsSupabaseConfigured = isSupabaseConfigured as jest.MockedFunction<typeof isSupabaseConfigured>
const mockGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.MockedFunction<
  typeof getSupabaseBrowserClient
>

interface MockUser {
  id: string
  email?: string
}

function createMockClient(initialUser: MockUser | null = null) {
  const unsubscribe = jest.fn()
  let authStateCallback: ((event: string, session: { user: MockUser } | null) => void) | null = null

  const onAuthStateChange = jest.fn((callback: typeof authStateCallback) => {
    authStateCallback = callback
    return { data: { subscription: { unsubscribe } } }
  })

  const client = {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: initialUser ? { user: initialUser } : null },
      }),
      onAuthStateChange,
      signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  }

  function emitAuthStateChange(user: MockUser | null) {
    authStateCallback?.('SIGNED_IN', user ? { user } : null)
  }

  return { client, unsubscribe, emitAuthStateChange }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('CloudSyncButton', () => {
  it('Supabase が未設定の場合は "Local only" を表示しボタンを表示しない', () => {
    mockIsSupabaseConfigured.mockReturnValue(false)
    mockGetSupabaseBrowserClient.mockReturnValue(null)

    render(<CloudSyncButton />)

    expect(screen.getByText('Local only')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('設定済み・未サインインの場合は Google サインインボタンを表示し、クリックで signInWithOAuth を呼ぶ', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    const { client } = createMockClient(null)
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)
    const user = userEvent.setup()

    render(<CloudSyncButton />)

    const button = await screen.findByRole('button')
    expect(button).toHaveTextContent('Google')

    await user.click(button)

    await waitFor(() =>
      expect(client.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          options: expect.objectContaining({ redirectTo: expect.stringContaining('/subscriptions') }),
        })
      )
    )
  })

  it('設定済み・サインイン中の場合は「同期中」を表示し、クリックで signOut を呼ぶ', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    const { client } = createMockClient({ id: 'user-1', email: 'taro@example.com' })
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)
    const user = userEvent.setup()

    render(<CloudSyncButton />)

    const button = await screen.findByRole('button')
    await waitFor(() => expect(button).toHaveTextContent('同期中'))

    await user.click(button)

    await waitFor(() => expect(client.auth.signOut).toHaveBeenCalledTimes(1))
  })

  it('onAuthStateChange のコールバック発火でユーザー表示が更新される', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    const { client, emitAuthStateChange } = createMockClient(null)
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)

    render(<CloudSyncButton />)

    const button = await screen.findByRole('button')
    expect(button).toHaveTextContent('Google')

    act(() => {
      emitAuthStateChange({ id: 'user-2', email: 'hanako@example.com' })
    })

    await waitFor(() => expect(button).toHaveTextContent('同期中'))
  })

  it('アンマウント時に unsubscribe が呼ばれる', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    const { client, unsubscribe } = createMockClient(null)
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)

    const { unmount } = render(<CloudSyncButton />)
    await screen.findByRole('button')

    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
