import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthGate } from '@/components/Layout/AuthGate'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'
import { storage } from '@/lib/storage'
import { CHARACTERS } from '@/lib/characters'

jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: jest.fn(),
  getSupabaseBrowserClient: jest.fn(),
}))

jest.mock('@/lib/storage', () => ({
  storage: {
    hasEnabledGuestMode: jest.fn(),
    enableGuestMode: jest.fn(),
    markCharacterSelectedToday: jest.fn(),
    addCharacterAffection: jest.fn(),
  },
}))

const mockIsSupabaseConfigured = isSupabaseConfigured as jest.MockedFunction<typeof isSupabaseConfigured>
const mockGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.MockedFunction<
  typeof getSupabaseBrowserClient
>
const mockStorage = storage as jest.Mocked<typeof storage>

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
    },
  }

  function emitAuthStateChange(user: MockUser | null) {
    authStateCallback?.('SIGNED_IN', user ? { user } : null)
  }

  return { client, unsubscribe, emitAuthStateChange }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockStorage.hasEnabledGuestMode.mockReturnValue(false)
})

describe('AuthGate', () => {
  it('Supabase 未設定の場合は認証チェックをせず子要素をそのまま表示する', () => {
    mockIsSupabaseConfigured.mockReturnValue(false)

    render(
      <AuthGate>
        <div>アプリ本体</div>
      </AuthGate>
    )

    expect(screen.getByText('アプリ本体')).toBeInTheDocument()
    expect(mockGetSupabaseBrowserClient).not.toHaveBeenCalled()
  })

  it('設定済み・未サインイン・ゲストモード未有効の場合はキャラクター選択画面を表示する', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    const { client } = createMockClient(null)
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)

    render(
      <AuthGate>
        <div>アプリ本体</div>
      </AuthGate>
    )

    expect(await screen.findByText('案内キャラクターを選択してください')).toBeInTheDocument()
    expect(screen.queryByText('アプリ本体')).not.toBeInTheDocument()
  })

  it('キャラクターを選択するとログイン方法選択画面に遷移する', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    const { client } = createMockClient(null)
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)
    const user = userEvent.setup()

    render(
      <AuthGate>
        <div>アプリ本体</div>
      </AuthGate>
    )

    await screen.findByText('案内キャラクターを選択してください')
    await user.click(screen.getByText(CHARACTERS['main-heroine'].name))

    expect(
      await screen.findByText(`${CHARACTERS['main-heroine'].name}と一緒にサブスク管理を始めましょう`)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Googleでログイン/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ゲストとして利用する/ })).toBeInTheDocument()
  })

  it('ログイン方法選択画面で「ゲストとして利用する」を選ぶと子要素を表示する', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    const { client } = createMockClient(null)
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)
    const user = userEvent.setup()

    render(
      <AuthGate>
        <div>アプリ本体</div>
      </AuthGate>
    )

    await screen.findByText('案内キャラクターを選択してください')
    await user.click(screen.getByText(CHARACTERS['main-heroine'].name))
    await screen.findByRole('button', { name: /ゲストとして利用する/ })
    await user.click(screen.getByRole('button', { name: /ゲストとして利用する/ }))

    expect(mockStorage.enableGuestMode).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('アプリ本体')).toBeInTheDocument()
  })

  it('ゲストモードが有効な場合はキャラクター選択画面をスキップして子要素を表示する', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    mockStorage.hasEnabledGuestMode.mockReturnValue(true)
    const { client } = createMockClient(null)
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)

    render(
      <AuthGate>
        <div>アプリ本体</div>
      </AuthGate>
    )

    expect(await screen.findByText('アプリ本体')).toBeInTheDocument()
    expect(screen.queryByText('案内キャラクターを選択してください')).not.toBeInTheDocument()
  })

  it('設定済み・サインイン済みの場合は子要素を表示する', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    const { client } = createMockClient({ id: 'user-1', email: 'taro@example.com' })
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)

    render(
      <AuthGate>
        <div>アプリ本体</div>
      </AuthGate>
    )

    expect(await screen.findByText('アプリ本体')).toBeInTheDocument()
  })

  it('onAuthStateChange でサインイン状態になると子要素が表示される', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    const { client, emitAuthStateChange } = createMockClient(null)
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)

    render(
      <AuthGate>
        <div>アプリ本体</div>
      </AuthGate>
    )

    await screen.findByText('案内キャラクターを選択してください')

    act(() => {
      emitAuthStateChange({ id: 'user-2', email: 'hanako@example.com' })
    })

    await waitFor(() => expect(screen.getByText('アプリ本体')).toBeInTheDocument())
  })

  it('クライアントが取得できない場合は子要素を表示する', () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    mockGetSupabaseBrowserClient.mockReturnValue(null)

    render(
      <AuthGate>
        <div>アプリ本体</div>
      </AuthGate>
    )

    expect(screen.getByText('アプリ本体')).toBeInTheDocument()
  })

  it('アンマウント時に unsubscribe が呼ばれる', async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    const { client, unsubscribe } = createMockClient(null)
    mockGetSupabaseBrowserClient.mockReturnValue(client as never)

    const { unmount } = render(
      <AuthGate>
        <div>アプリ本体</div>
      </AuthGate>
    )

    await screen.findByText('案内キャラクターを選択してください')

    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
