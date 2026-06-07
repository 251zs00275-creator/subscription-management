const DEFAULT_BASE_URL = 'http://localhost:11434'
const DEFAULT_MODEL = 'llama3.2'
const OLLAMA_TIMEOUT_MS = 15_000

export type OllamaCompletionResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'unreachable' }
  | { ok: false; reason: 'timeout' }
  | { ok: false; reason: 'http-error'; status: number }

function getBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL || DEFAULT_BASE_URL
}

function getModel(): string {
  return process.env.OLLAMA_MODEL || DEFAULT_MODEL
}

export async function requestOllamaCompletion(prompt: string): Promise<OllamaCompletionResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS)

  try {
    const response = await fetch(`${getBaseUrl()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: getModel(),
        prompt,
        format: 'json',
        stream: false,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      return { ok: false, reason: 'http-error', status: response.status }
    }

    const data = (await response.json()) as { response?: unknown }
    return { ok: true, text: typeof data.response === 'string' ? data.response : '' }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, reason: 'timeout' }
    }
    return { ok: false, reason: 'unreachable' }
  } finally {
    clearTimeout(timeoutId)
  }
}
