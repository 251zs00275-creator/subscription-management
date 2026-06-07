import { getPendingTask, setPendingTask, clearPendingTask } from '@/lib/llmAnalysisQueue'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { Subscription } from '@/types'

jest.mock('@/lib/supabase', () => ({
  getSupabaseBrowserClient: jest.fn(),
}))

const mockGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.MockedFunction<
  typeof getSupabaseBrowserClient
>

interface ChainResult {
  data?: unknown
  error?: unknown
}

interface Chain {
  eq: (...args: unknown[]) => Chain
  maybeSingle: () => Promise<ChainResult>
  then: (onFulfilled: (value: ChainResult) => unknown) => Promise<unknown>
}

function createChain(result: ChainResult): Chain {
  const node: Chain = {
    eq: jest.fn((..._args: unknown[]) => node),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    then: (onFulfilled) => Promise.resolve(result).then(onFulfilled),
  }
  return node
}

interface MockClientOptions {
  user?: { id: string } | null
  selectResult?: ChainResult
  insertResult?: ChainResult
  deleteResult?: ChainResult
}

function createMockClient(options: MockClientOptions = {}) {
  const {
    user = { id: 'user-1' },
    selectResult = { data: null, error: null },
    insertResult = { error: null },
    deleteResult = { error: null },
  } = options

  const selectSpy = jest.fn((..._args: unknown[]) => createChain(selectResult))
  const insertSpy = jest.fn((..._args: unknown[]) => createChain(insertResult))
  const deleteSpy = jest.fn((..._args: unknown[]) => createChain(deleteResult))

  const from = jest.fn(() => ({
    select: selectSpy,
    insert: insertSpy,
    delete: deleteSpy,
  }))

  return {
    client: {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
      from,
    } as unknown as ReturnType<typeof getSupabaseBrowserClient>,
    selectSpy,
    insertSpy,
    deleteSpy,
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

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getPendingTask', () => {
  it('未設定/未サインインの場合は null を返す', async () => {
    mockGetSupabaseBrowserClient.mockReturnValue(null)

    expect(await getPendingTask()).toBeNull()
  })

  it('保留中タスクがない場合は null を返す', async () => {
    const { client } = createMockClient({ selectResult: { data: null, error: null } })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    expect(await getPendingTask()).toBeNull()
  })

  it('保留中タスクがある場合はスナップショットのサブスク一覧を返す', async () => {
    const snapshot = [buildSubscription()]
    const { client } = createMockClient({
      selectResult: { data: { subscriptions_snapshot: snapshot }, error: null },
    })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    expect(await getPendingTask()).toEqual(snapshot)
  })

  it('スナップショットが配列でない場合は null を返す', async () => {
    const { client } = createMockClient({
      selectResult: { data: { subscriptions_snapshot: { broken: true } }, error: null },
    })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    expect(await getPendingTask()).toBeNull()
  })
})

describe('setPendingTask', () => {
  it('未設定/未サインインの場合は何もしない', async () => {
    mockGetSupabaseBrowserClient.mockReturnValue(null)

    await expect(setPendingTask([buildSubscription()])).resolves.toBeUndefined()
  })

  it('既存の保留タスクを削除してから新しいスナップショットを挿入する', async () => {
    const { client, deleteSpy, insertSpy } = createMockClient()
    mockGetSupabaseBrowserClient.mockReturnValue(client)
    const subscriptions = [buildSubscription()]

    await setPendingTask(subscriptions)

    expect(deleteSpy).toHaveBeenCalledTimes(1)
    expect(insertSpy).toHaveBeenCalledTimes(1)
    expect(insertSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        user_id: 'user-1',
        status: 'pending',
        subscriptions_snapshot: subscriptions,
      })
    )
  })

  it('挿入がエラーを返した場合は例外を投げる', async () => {
    const { client } = createMockClient({ insertResult: { error: { message: 'boom' } } })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    await expect(setPendingTask([buildSubscription()])).rejects.toThrow(
      'Failed to persist pending analysis task'
    )
  })
})

describe('clearPendingTask', () => {
  it('未設定/未サインインの場合は何もしない', async () => {
    mockGetSupabaseBrowserClient.mockReturnValue(null)

    await expect(clearPendingTask()).resolves.toBeUndefined()
  })

  it('保留中タスクを削除する', async () => {
    const { client, deleteSpy } = createMockClient()
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    await clearPendingTask()

    expect(deleteSpy).toHaveBeenCalledTimes(1)
  })

  it('削除がエラーを返した場合は例外を投げる', async () => {
    const { client } = createMockClient({ deleteResult: { error: { message: 'boom' } } })
    mockGetSupabaseBrowserClient.mockReturnValue(client)

    await expect(clearPendingTask()).rejects.toThrow('Failed to clear pending analysis task')
  })
})
