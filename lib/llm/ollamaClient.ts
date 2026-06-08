const DEFAULT_BASE_URL = 'http://localhost:11434'
const DEFAULT_MODEL = 'llama3.2'
// ローカル LLM は端末性能やモデルサイズによって応答時間が大きく変動する
// （実測では 9B 級のモデルで生成だけで約15秒かかるケースもある）。
// 短すぎるタイムアウトは「到達不可」への誤判定を招くため、十分な余裕を持たせる。
const OLLAMA_TIMEOUT_MS = 60_000

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
        // 「思考モデル」(qwen3.5 / deepseek-r1 等) では think: true がデフォルトで
        // 有効になり、出力が response ではなく thinking フィールドに入ってしまう上、
        // 応答時間も大幅に伸びてタイムアウトしやすくなる。明示的に無効化することで
        // 思考の有無に関わらず response フィールドへ直接 JSON を出力させる。
        think: false,
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
