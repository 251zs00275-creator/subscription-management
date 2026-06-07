import { NextResponse } from 'next/server'
import type { Subscription } from '@/types'
import { buildAnalysisPrompt } from '@/lib/llm/promptBuilder'
import { requestOllamaCompletion } from '@/lib/llm/ollamaClient'
import { parseLlmAnalysisResponse } from '@/lib/llm/responseParser'

function isSubscriptionArray(value: unknown): value is Subscription[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).name === 'string' &&
        typeof (item as Record<string, unknown>).amount === 'number'
    )
  )
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ status: 'error', message: 'リクエストの形式が不正です' }, { status: 400 })
  }

  const subscriptions = isSubscriptionArray((body as Record<string, unknown> | null)?.subscriptions)
    ? ((body as { subscriptions: unknown }).subscriptions as Subscription[])
    : null

  if (!subscriptions) {
    return NextResponse.json(
      { status: 'error', message: 'subscriptions は必須の配列です' },
      { status: 400 }
    )
  }

  const prompt = buildAnalysisPrompt(subscriptions)
  const completion = await requestOllamaCompletion(prompt)

  if (!completion.ok) {
    if (completion.reason === 'unreachable' || completion.reason === 'timeout') {
      return NextResponse.json({ status: 'unreachable' })
    }
    return NextResponse.json(
      { status: 'error', message: `Ollama がエラーを返しました（HTTP ${completion.status}）` },
      { status: 502 }
    )
  }

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(completion.text)
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Ollama の応答を解析できませんでした' },
      { status: 502 }
    )
  }

  const suggestions = parseLlmAnalysisResponse(parsedJson)
  if (!suggestions) {
    return NextResponse.json(
      { status: 'error', message: 'Ollama の応答が想定した形式ではありません' },
      { status: 502 }
    )
  }

  return NextResponse.json({ status: 'ok', suggestions })
}
