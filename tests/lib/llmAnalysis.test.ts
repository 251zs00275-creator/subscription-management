import { analyzeSuggestionsWithLLM } from '@/lib/llmAnalysis'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { setPendingTask, clearPendingTask } from '@/lib/llmAnalysisQueue'
import type { Subscription } from '@/types'

jest.mock('@/lib/supabase', () => ({
  getSupabaseBrowserClient: jest.fn(),
}))

jest.mock('@/lib/llmAnalysisQueue', () => ({
  setPendingTask: jest.fn().mockResolvedValue(undefined),
  clearPendingTask: jest.fn().mockResolvedValue(undefined),
  getPendingTask: jest.fn().mockResolvedValue(null),
}))

const mockGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.MockedFunction<
  typeof getSupabaseBrowserClient
>
const mockSetPendingTask = setPendingTask as jest.MockedFunction<typeof setPendingTask>
const mockClearPendingTask = clearPendingTask as jest.MockedFunction<typeof clearPendingTask>

const originalFetch = global.fetch

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

function mockSignedIn(signedIn: boolean) {
  mockGetSupabaseBrowserClient.mockReturnValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: signedIn ? { id: 'user-1' } : null } }),
    },
  } as unknown as ReturnType<typeof getSupabaseBrowserClient>)
}

function mockFetchJson(status: number, json: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(json),
  }) as unknown as typeof fetch
}

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  global.fetch = originalFetch
})

describe('analyzeSuggestionsWithLLM', () => {
  it('未サインインの場合は requiresSignIn を返し、APIを呼び出さない', async () => {
    mockSignedIn(false)
    global.fetch = jest.fn() as unknown as typeof fetch

    const result = await analyzeSuggestionsWithLLM([buildSubscription()])

    expect(result).toEqual({ requiresSignIn: true })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('成功時は suggestions と source: llm を返し、保留タスクを解除する', async () => {
    mockSignedIn(true)
    const suggestions = [
      { id: 'llm-1', type: 'llm-insight', title: 't', description: 'd', source: 'llm' },
    ]
    mockFetchJson(200, { status: 'ok', suggestions })

    const result = await analyzeSuggestionsWithLLM([buildSubscription()])

    expect(result).toEqual({ suggestions, source: 'llm' })
    expect(mockClearPendingTask).toHaveBeenCalledTimes(1)
  })

  it('サーバーが unreachable を返した場合は pending を返し、保留タスクを記録する', async () => {
    mockSignedIn(true)
    mockFetchJson(200, { status: 'unreachable' })
    const subscriptions = [buildSubscription()]

    const result = await analyzeSuggestionsWithLLM(subscriptions)

    expect(result).toEqual({ pending: true })
    expect(mockSetPendingTask).toHaveBeenCalledWith(subscriptions)
  })

  it('fetch自体が失敗した場合も pending を返し、保留タスクを記録する', async () => {
    mockSignedIn(true)
    global.fetch = jest.fn().mockRejectedValue(new TypeError('network error')) as unknown as typeof fetch
    const subscriptions = [buildSubscription()]

    const result = await analyzeSuggestionsWithLLM(subscriptions)

    expect(result).toEqual({ pending: true })
    expect(mockSetPendingTask).toHaveBeenCalledWith(subscriptions)
  })

  it('サーバーエラーの場合は error を返す', async () => {
    mockSignedIn(true)
    mockFetchJson(502, { status: 'error', message: 'Ollama がエラーを返しました' })

    const result = await analyzeSuggestionsWithLLM([buildSubscription()])

    expect(result).toEqual({ error: 'Ollama がエラーを返しました' })
  })

  it('応答の解析に失敗した場合は error を返す', async () => {
    mockSignedIn(true)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockRejectedValue(new Error('invalid json')),
    }) as unknown as typeof fetch

    const result = await analyzeSuggestionsWithLLM([buildSubscription()])

    expect(result).toEqual({ error: 'サーバーからの応答を解析できませんでした' })
  })
})
