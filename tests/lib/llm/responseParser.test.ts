import { parseLlmAnalysisResponse } from '@/lib/llm/responseParser'

function buildRawSuggestion(overrides: Record<string, unknown> = {}) {
  return {
    title: '使っていないサブスクがあります',
    description: 'Netflixが3ヶ月間利用されていません。解約を検討しましょう。',
    potentialSavings: 1500,
    ...overrides,
  }
}

describe('parseLlmAnalysisResponse', () => {
  it('正しい形式の配列を Suggestion[] に変換する', () => {
    const raw = [buildRawSuggestion()]

    const result = parseLlmAnalysisResponse(raw)

    expect(result).not.toBeNull()
    expect(result).toHaveLength(1)
    expect(result?.[0]).toMatchObject({
      title: '使っていないサブスクがあります',
      description: 'Netflixが3ヶ月間利用されていません。解約を検討しましょう。',
      potentialSavings: 1500,
      type: 'llm-insight',
      source: 'llm',
    })
    expect(result?.[0].id).toEqual(expect.any(String))
  })

  it('配列でないルートは null を返す', () => {
    expect(parseLlmAnalysisResponse({ title: 'x', description: 'y' })).toBeNull()
    expect(parseLlmAnalysisResponse('not an array')).toBeNull()
    expect(parseLlmAnalysisResponse(null)).toBeNull()
    expect(parseLlmAnalysisResponse(undefined)).toBeNull()
  })

  it('title または description が文字列でない要素は除外する', () => {
    const raw = [
      buildRawSuggestion({ title: 123 }),
      buildRawSuggestion({ description: null }),
      buildRawSuggestion({ title: '正常な提案' }),
    ]

    const result = parseLlmAnalysisResponse(raw)

    expect(result).toHaveLength(1)
    expect(result?.[0].title).toBe('正常な提案')
  })

  it('文字数の上限を超える title・description は切り詰める', () => {
    const longTitle = 'あ'.repeat(300)
    const longDescription = 'い'.repeat(600)
    const raw = [buildRawSuggestion({ title: longTitle, description: longDescription })]

    const result = parseLlmAnalysisResponse(raw)

    expect(result?.[0].title.length).toBeLessThanOrEqual(200)
    expect(result?.[0].description.length).toBeLessThanOrEqual(500)
  })

  it('potentialSavings が有限の正の数値でない場合は省略する', () => {
    const raw = [
      buildRawSuggestion({ potentialSavings: -100 }),
      buildRawSuggestion({ potentialSavings: 'たくさん' }),
      buildRawSuggestion({ potentialSavings: Infinity }),
    ]

    const result = parseLlmAnalysisResponse(raw)

    expect(result).toHaveLength(3)
    result?.forEach((suggestion) => {
      expect(suggestion.potentialSavings).toBeUndefined()
    })
  })

  it('potentialSavings が省略されている場合はそのまま省略扱いにする', () => {
    const raw = [buildRawSuggestion({ potentialSavings: undefined })]

    const result = parseLlmAnalysisResponse(raw)

    expect(result?.[0].potentialSavings).toBeUndefined()
  })

  it('上限件数を超える場合は切り詰める', () => {
    const raw = Array.from({ length: 20 }, (_, index) =>
      buildRawSuggestion({ title: `提案${index}` })
    )

    const result = parseLlmAnalysisResponse(raw)

    expect(result?.length).toBeLessThanOrEqual(10)
  })

  it('配列内に不正な要素（null・配列・プリミティブ）が混在していても無視する', () => {
    const raw = [null, 'invalid', 42, [], buildRawSuggestion({ title: '正常な提案' })]

    const result = parseLlmAnalysisResponse(raw)

    expect(result).toHaveLength(1)
    expect(result?.[0].title).toBe('正常な提案')
  })

  it('有効な提案が一つもない場合は空配列を返す', () => {
    const result = parseLlmAnalysisResponse([{ title: 123 }, null, 'invalid'])

    expect(result).toEqual([])
  })
})
