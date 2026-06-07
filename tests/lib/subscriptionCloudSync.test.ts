import {
  syncSubscriptionsFromCloud,
  uploadSubscriptionToCloud,
  deleteSubscriptionFromCloud,
} from '@/lib/subscriptionCloudSync'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import type { Subscription } from '@/types'

jest.mock('@/lib/supabase', () => ({
  getSupabaseBrowserClient: jest.fn(),
}))

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}))

const mockGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.MockedFunction<
  typeof getSupabaseBrowserClient
>
const mockToast = toast as jest.MockedFunction<typeof toast>

interface ChainResult {
  data?: unknown
  error?: unknown
}

interface Chain {
  eq: (...args: unknown[]) => Chain
  then: (onFulfilled: (value: ChainResult) => unknown) => Promise<unknown>
}

function createChain(result: ChainResult): Chain {
  const node: Chain = {
    eq: jest.fn((..._args: unknown[]) => node),
    then: (onFulfilled) => Promise.resolve(result).then(onFulfilled),
  }
  return node
}

interface MockClientOptions {
  user?: { id: string; email?: string } | null
  selectResult?: ChainResult
  upsertResult?: ChainResult
  updateResult?: ChainResult
}

function createMockClient(options: MockClientOptions = {}) {
  const {
    user = { id: 'user-1' },
    selectResult = { data: [], error: null },
    upsertResult = { error: null },
    updateResult = { error: null },
  } = options

  const upsertSpy = jest.fn((...args: unknown[]) => createChain(upsertResult))
  const updateSpy = jest.fn((...args: unknown[]) => createChain(updateResult))
  const selectSpy = jest.fn(() => createChain(selectResult))

  const from = jest.fn(() => ({
    select: selectSpy,
    upsert: upsertSpy,
    update: updateSpy,
  }))

  return {
    client: {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
      from,
    } as unknown as ReturnType<typeof getSupabaseBrowserClient>,
    upsertSpy,
    updateSpy,
    selectSpy,
    from,
  }
}

function buildSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub-1',
    name: 'Netflix',
    amount: 1500,
    category: 'サブスク',
    nextPaymentDate: '2026-07-01',
    memo: '',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function buildRemoteRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub-1',
    user_id: 'user-1',
    name: 'Netflix',
    amount: 1500,
    category: 'サブスク',
    next_payment_date: '2026-07-01',
    memo: '',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    deleted_at: null,
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('syncSubscriptionsFromCloud', () => {
  it('未設定/未サインインの場合はローカルの一覧をそのまま返す', async () => {
    mockGetSupabaseBrowserClient.mockReturnValue(null)
    const local = [buildSubscription()]

    const result = await syncSubscriptionsFromCloud(local)

    expect(result).toBe(local)
  })

  it('リモートが空でローカルにデータがある場合は全てアップロードする', async () => {
    const local = [buildSubscription({ id: 'sub-1' }), buildSubscription({ id: 'sub-2', name: 'Spotify' })]
    const { client, upsertSpy } = createMockClient({ selectResult: { data: [], error: null } })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    const result = await syncSubscriptionsFromCloud(local)

    expect(upsertSpy).toHaveBeenCalledTimes(1)
    const uploadedRows = upsertSpy.mock.calls[0][0] as Array<{ id: string }>
    expect(uploadedRows.map((row) => row.id).sort()).toEqual(['sub-1', 'sub-2'])
    expect(result.map((subscription) => subscription.id).sort()).toEqual(['sub-1', 'sub-2'])
  })

  it('リモートの方が新しい場合はリモートの内容を採用する', async () => {
    const local = [buildSubscription({ name: 'Netflix (old)', updatedAt: '2026-01-01T00:00:00.000Z' })]
    const remoteRow = buildRemoteRow({ name: 'Netflix (new)', updated_at: '2026-02-01T00:00:00.000Z' })
    const { client, upsertSpy } = createMockClient({ selectResult: { data: [remoteRow], error: null } })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    const result = await syncSubscriptionsFromCloud(local)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Netflix (new)')
    expect(upsertSpy).not.toHaveBeenCalled()
  })

  it('ローカルの方が新しい場合はローカルの内容を採用しアップロード対象にする', async () => {
    const local = [buildSubscription({ name: 'Netflix (new)', updatedAt: '2026-03-01T00:00:00.000Z' })]
    const remoteRow = buildRemoteRow({ name: 'Netflix (old)', updated_at: '2026-01-01T00:00:00.000Z' })
    const { client, upsertSpy } = createMockClient({ selectResult: { data: [remoteRow], error: null } })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    const result = await syncSubscriptionsFromCloud(local)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Netflix (new)')
    expect(upsertSpy).toHaveBeenCalledTimes(1)
    const uploadedRows = upsertSpy.mock.calls[0][0] as Array<{ name: string }>
    expect(uploadedRows[0].name).toBe('Netflix (new)')
  })

  it('リモートのトゥームストーンがローカルより新しい場合はマージ結果から除去する', async () => {
    const local = [buildSubscription({ updatedAt: '2026-01-01T00:00:00.000Z' })]
    const remoteRow = buildRemoteRow({ deleted_at: '2026-02-01T00:00:00.000Z' })
    const { client } = createMockClient({ selectResult: { data: [remoteRow], error: null } })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    const result = await syncSubscriptionsFromCloud(local)

    expect(result).toHaveLength(0)
  })

  it('リモートのトゥームストーンがローカルより古い場合はローカルを保持する', async () => {
    const local = [buildSubscription({ updatedAt: '2026-03-01T00:00:00.000Z' })]
    const remoteRow = buildRemoteRow({ deleted_at: '2026-01-01T00:00:00.000Z' })
    const { client, upsertSpy } = createMockClient({ selectResult: { data: [remoteRow], error: null } })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    const result = await syncSubscriptionsFromCloud(local)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(local[0].id)
    expect(upsertSpy).toHaveBeenCalledTimes(1)
  })

  it('upsert がエラーを返した場合は例外を投げ、トーストで通知する', async () => {
    const local = [buildSubscription()]
    const { client } = createMockClient({
      selectResult: { data: [], error: null },
      upsertResult: { error: { message: 'network error' } },
    })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    await expect(syncSubscriptionsFromCloud(local)).rejects.toThrow('Cloud sync upload failed')
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    )
  })
})

describe('uploadSubscriptionToCloud', () => {
  it('未設定/未サインインの場合は何もしない', async () => {
    mockGetSupabaseBrowserClient.mockReturnValue(null)

    await expect(uploadSubscriptionToCloud(buildSubscription())).resolves.toBeUndefined()
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('成功時は upsert を呼び出す', async () => {
    const { client, upsertSpy } = createMockClient()
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    await uploadSubscriptionToCloud(buildSubscription())

    expect(upsertSpy).toHaveBeenCalledTimes(1)
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('upsert がエラーを返した場合は例外を投げ、トーストで通知する', async () => {
    const { client } = createMockClient({ upsertResult: { error: { message: 'boom' } } })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    await expect(uploadSubscriptionToCloud(buildSubscription())).rejects.toThrow('Cloud upload failed')
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    )
  })
})

describe('deleteSubscriptionFromCloud', () => {
  it('未設定/未サインインの場合は何もしない', async () => {
    mockGetSupabaseBrowserClient.mockReturnValue(null)

    await expect(deleteSubscriptionFromCloud('sub-1')).resolves.toBeUndefined()
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('成功時は update を呼び出してトゥームストーンを記録する', async () => {
    const { client, updateSpy } = createMockClient()
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    await deleteSubscriptionFromCloud('sub-1')

    expect(updateSpy).toHaveBeenCalledTimes(1)
    expect(updateSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({ deleted_at: expect.any(String) })
    )
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('update がエラーを返した場合は例外を投げ、トーストで通知する', async () => {
    const { client } = createMockClient({ updateResult: { error: { message: 'boom' } } })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    await expect(deleteSubscriptionFromCloud('sub-1')).rejects.toThrow('Cloud delete failed')
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    )
  })
})
