import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SuggestionsPage from '@/app/suggestions/page'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { analyzeSuggestionsWithLLM } from '@/lib/llmAnalysis'
import { getPendingTask } from '@/lib/llmAnalysisQueue'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { Subscription } from '@/types'

jest.mock('@/hooks/useSubscriptions', () => ({
  useSubscriptions: jest.fn(),
}))

jest.mock('@/lib/llmAnalysis', () => ({
  analyzeSuggestionsWithLLM: jest.fn(),
}))

jest.mock('@/lib/llmAnalysisQueue', () => ({
  getPendingTask: jest.fn(),
}))

jest.mock('@/lib/supabase', () => ({
  getSupabaseBrowserClient: jest.fn(),
}))

const mockUseSubscriptions = useSubscriptions as jest.MockedFunction<typeof useSubscriptions>
const mockAnalyze = analyzeSuggestionsWithLLM as jest.MockedFunction<typeof analyzeSuggestionsWithLLM>
const mockGetPendingTask = getPendingTask as jest.MockedFunction<typeof getPendingTask>
const mockGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.MockedFunction<
  typeof getSupabaseBrowserClient
>

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

function mockStore(overrides: Record<string, unknown> = {}) {
  mockUseSubscriptions.mockReturnValue({
    subscriptions: [buildSubscription()],
    isLoading: false,
    load: jest.fn(),
    remove: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as ReturnType<typeof useSubscriptions>)
}

const signInWithOAuthMock = jest.fn().mockResolvedValue({ data: {}, error: null })

beforeEach(() => {
  jest.clearAllMocks()
  mockGetSupabaseBrowserClient.mockReturnValue({
    auth: { signInWithOAuth: signInWithOAuthMock },
  } as unknown as ReturnType<typeof getSupabaseBrowserClient>)
  mockGetPendingTask.mockResolvedValue(null)
})

describe('SuggestionsPage', () => {
  it('未サインインの場合は Google ログイン導線を表示する', async () => {
    mockStore()
    mockAnalyze.mockResolvedValue({ requiresSignIn: true })

    render(<SuggestionsPage />)

    expect(await screen.findByText('Google ログインが必要です')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Google でログイン/ })).toBeInTheDocument()
  })

  it('Google ログインボタンを押すと signInWithOAuth が呼ばれる', async () => {
    mockStore()
    mockAnalyze.mockResolvedValue({ requiresSignIn: true })
    const user = userEvent.setup()

    render(<SuggestionsPage />)

    const button = await screen.findByRole('button', { name: /Google でログイン/ })
    await user.click(button)

    await waitFor(() =>
      expect(signInWithOAuthMock).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' })
      )
    )
  })

  it('Ollamaに接続できない場合は「Ollama 接続待機中」を表示する', async () => {
    mockStore()
    mockAnalyze.mockResolvedValue({ pending: true })

    render(<SuggestionsPage />)

    expect(await screen.findByText('Ollama 接続待機中')).toBeInTheDocument()
  })

  it('分析中は「ローカル LLM で分析中…」を表示し、成功すると提案一覧を表示する', async () => {
    mockStore()
    let resolveAnalysis: (value: Awaited<ReturnType<typeof analyzeSuggestionsWithLLM>>) => void = () => {}
    mockAnalyze.mockReturnValue(
      new Promise((resolve) => {
        resolveAnalysis = resolve
      })
    )

    render(<SuggestionsPage />)

    expect(await screen.findByText('ローカル LLM で分析中…')).toBeInTheDocument()

    resolveAnalysis({
      suggestions: [
        {
          id: 'llm-1',
          type: 'llm-insight',
          title: '使っていないサブスクがあります',
          description: 'Netflixが3ヶ月間利用されていません。',
          source: 'llm',
          potentialSavings: 1500,
        },
      ],
      source: 'llm',
    })

    expect(await screen.findByText('使っていないサブスクがあります')).toBeInTheDocument()
    expect(screen.getByText('AI分析')).toBeInTheDocument()
  })

  it('エラー時はエラーメッセージと再試行ボタンを表示し、クリックで再分析する', async () => {
    mockStore()
    mockAnalyze.mockResolvedValueOnce({ error: '分析サーバーに接続できませんでした' })
    const user = userEvent.setup()

    render(<SuggestionsPage />)

    expect(await screen.findByText('分析に失敗しました')).toBeInTheDocument()
    expect(screen.getByText('分析サーバーに接続できませんでした')).toBeInTheDocument()

    mockAnalyze.mockResolvedValueOnce({
      suggestions: [
        {
          id: 'llm-2',
          type: 'llm-insight',
          title: '再分析の結果',
          description: '再試行で取得した提案です。',
          source: 'llm',
        },
      ],
      source: 'llm',
    })

    await user.click(screen.getByRole('button', { name: '再試行' }))

    expect(await screen.findByText('再分析の結果')).toBeInTheDocument()
  })

  it('「今すぐ確認」ボタンを押すと再度分析を実行する', async () => {
    mockStore()
    mockAnalyze.mockResolvedValueOnce({ pending: true })
    const user = userEvent.setup()

    render(<SuggestionsPage />)
    expect(await screen.findByText('Ollama 接続待機中')).toBeInTheDocument()

    mockAnalyze.mockResolvedValueOnce({
      suggestions: [
        {
          id: 'llm-3',
          type: 'llm-insight',
          title: '保留タスクから再開した提案',
          description: 'Ollama起動後に自動で取得した内容です。',
          source: 'llm',
        },
      ],
      source: 'llm',
    })

    await user.click(screen.getByRole('button', { name: /今すぐ確認/ }))

    expect(await screen.findByText('保留タスクから再開した提案')).toBeInTheDocument()
    expect(mockAnalyze).toHaveBeenCalledTimes(2)
  })

  it('保留タスクが残っている場合は新規分析を走らせず待機状態から再開する', async () => {
    mockStore()
    mockGetPendingTask.mockResolvedValue([buildSubscription()])
    mockAnalyze.mockResolvedValue({
      suggestions: [
        {
          id: 'llm-4',
          type: 'llm-insight',
          title: '保留タスク再開後の提案',
          description: '前回の続きから取得した内容です。',
          source: 'llm',
        },
      ],
      source: 'llm',
    })

    render(<SuggestionsPage />)

    expect(await screen.findByText('Ollama 接続待機中')).toBeInTheDocument()
    expect(mockAnalyze).not.toHaveBeenCalled()
  })

  it('待機中は一定間隔で自動的に再分析を試行し、成功すると提案を表示する', async () => {
    jest.useFakeTimers({ legacyFakeTimers: false })
    try {
      mockStore()
      mockAnalyze.mockResolvedValueOnce({ pending: true })
      mockAnalyze.mockResolvedValueOnce({
        suggestions: [
          {
            id: 'llm-5',
            type: 'llm-insight',
            title: '自動再試行で取得した提案',
            description: 'Ollama起動後に自動的に再取得しました。',
            source: 'llm',
          },
        ],
        source: 'llm',
      })

      render(<SuggestionsPage />)

      await waitFor(() => expect(mockAnalyze).toHaveBeenCalledTimes(1))
      expect(await screen.findByText('Ollama 接続待機中')).toBeInTheDocument()

      await act(async () => {
        jest.advanceTimersByTime(30000)
      })

      await waitFor(() => expect(mockAnalyze).toHaveBeenCalledTimes(2))
      expect(await screen.findByText('自動再試行で取得した提案')).toBeInTheDocument()
    } finally {
      jest.useRealTimers()
    }
  })
})
