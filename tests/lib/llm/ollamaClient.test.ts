import { requestOllamaCompletion } from '@/lib/llm/ollamaClient'

const originalFetch = global.fetch
const originalBaseUrl = process.env.OLLAMA_BASE_URL
const originalModel = process.env.OLLAMA_MODEL

beforeEach(() => {
  process.env.OLLAMA_BASE_URL = 'http://localhost:11434'
  process.env.OLLAMA_MODEL = 'llama3.2'
})

afterEach(() => {
  global.fetch = originalFetch
  process.env.OLLAMA_BASE_URL = originalBaseUrl
  process.env.OLLAMA_MODEL = originalModel
  jest.restoreAllMocks()
})

describe('requestOllamaCompletion', () => {
  it('200応答かつ正常なJSONの場合は ok: true で応答テキストを返す', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ response: '{"title":"x"}' }),
    }) as unknown as typeof fetch

    const result = await requestOllamaCompletion('分析して')

    expect(result).toEqual({ ok: true, text: '{"title":"x"}' })
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"format":"json"'),
      })
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        body: expect.stringContaining('"think":false'),
      })
    )
  })

  it('接続できない場合は ok: false, reason: unreachable を返す', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('fetch failed')) as unknown as typeof fetch

    const result = await requestOllamaCompletion('分析して')

    expect(result).toEqual({ ok: false, reason: 'unreachable' })
  })

  it('タイムアウト(AbortError)の場合は ok: false, reason: timeout を返す', async () => {
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'
    global.fetch = jest.fn().mockRejectedValue(abortError) as unknown as typeof fetch

    const result = await requestOllamaCompletion('分析して')

    expect(result).toEqual({ ok: false, reason: 'timeout' })
  })

  it('非2xxレスポンスの場合は ok: false, reason: http-error を返す', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({}),
    }) as unknown as typeof fetch

    const result = await requestOllamaCompletion('分析して')

    expect(result).toEqual({ ok: false, reason: 'http-error', status: 500 })
  })

  it('OLLAMA_BASE_URL が未設定の場合は既定の localhost を使う', async () => {
    delete process.env.OLLAMA_BASE_URL
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ response: 'ok' }),
    }) as unknown as typeof fetch

    await requestOllamaCompletion('分析して')

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.anything()
    )
  })
})
