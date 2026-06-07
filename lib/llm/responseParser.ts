import type { Suggestion } from '@/types'

const TITLE_MAX_LENGTH = 200
const DESCRIPTION_MAX_LENGTH = 500
const MAX_SUGGESTIONS = 10

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parsePotentialSavings(value: unknown): number | undefined {
  if (typeof value !== 'number') return undefined
  if (!Number.isFinite(value) || value <= 0) return undefined
  return value
}

let nextId = 0

function createSuggestionId(): string {
  nextId += 1
  return `llm-insight-${Date.now()}-${nextId}`
}

function parseSuggestion(raw: unknown): Suggestion | null {
  if (!isPlainObject(raw)) return null
  if (typeof raw.title !== 'string' || raw.title.length === 0) return null
  if (typeof raw.description !== 'string' || raw.description.length === 0) return null

  const suggestion: Suggestion = {
    id: createSuggestionId(),
    type: 'llm-insight',
    source: 'llm',
    title: raw.title.slice(0, TITLE_MAX_LENGTH),
    description: raw.description.slice(0, DESCRIPTION_MAX_LENGTH),
  }

  const potentialSavings = parsePotentialSavings(raw.potentialSavings)
  if (potentialSavings !== undefined) {
    suggestion.potentialSavings = potentialSavings
  }

  return suggestion
}

export function parseLlmAnalysisResponse(raw: unknown): Suggestion[] | null {
  if (!Array.isArray(raw)) return null

  const suggestions: Suggestion[] = []
  for (const item of raw) {
    const suggestion = parseSuggestion(item)
    if (suggestion) suggestions.push(suggestion)
    if (suggestions.length >= MAX_SUGGESTIONS) break
  }

  return suggestions
}
