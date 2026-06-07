import { getSupabaseBrowserClient } from '@/lib/supabase'
import { setPendingTask, clearPendingTask } from '@/lib/llmAnalysisQueue'
import type { Subscription, Suggestion } from '@/types'

export type LlmAnalysisResult =
  | { suggestions: Suggestion[]; source: 'llm' }
  | { pending: true }
  | { error: string }
  | { requiresSignIn: true }

interface AnalyzeApiResponse {
  status?: string
  suggestions?: unknown
  message?: string
}

const FALLBACK_ERROR_MESSAGE = '分析に失敗しました'

async function isSignedIn(): Promise<boolean> {
  const client = getSupabaseBrowserClient()
  if (!client) return false
  const { data } = await client.auth.getUser()
  return Boolean(data.user)
}

function isSuggestionArray(value: unknown): value is Suggestion[] {
  return Array.isArray(value)
}

export async function analyzeSuggestionsWithLLM(
  subscriptions: Subscription[]
): Promise<LlmAnalysisResult> {
  if (!(await isSignedIn())) {
    return { requiresSignIn: true }
  }

  let response: Response
  try {
    response = await fetch('/api/suggestions/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptions }),
    })
  } catch {
    await setPendingTask(subscriptions)
    return { pending: true }
  }

  let payload: AnalyzeApiResponse
  try {
    payload = (await response.json()) as AnalyzeApiResponse
  } catch {
    return { error: 'サーバーからの応答を解析できませんでした' }
  }

  if (payload.status === 'unreachable') {
    await setPendingTask(subscriptions)
    return { pending: true }
  }

  if (payload.status === 'ok' && isSuggestionArray(payload.suggestions)) {
    await clearPendingTask()
    return { suggestions: payload.suggestions, source: 'llm' }
  }

  return { error: payload.message ?? FALLBACK_ERROR_MESSAGE }
}
