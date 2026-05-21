import type { CustomKeywordRule, Category } from '@/types'

const STORAGE_KEY = 'custom-keyword-rules'

export function loadCustomRules(): CustomKeywordRule[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CustomKeywordRule[]) : []
  } catch {
    return []
  }
}

export function saveCustomRules(rules: CustomKeywordRule[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
}

export function addCustomRule(keyword: string, category: Category): CustomKeywordRule[] {
  const rules = loadCustomRules()
  const next = [...rules, { id: crypto.randomUUID(), keyword: keyword.trim(), category }]
  saveCustomRules(next)
  return next
}

export function removeCustomRule(id: string): CustomKeywordRule[] {
  const next = loadCustomRules().filter((r) => r.id !== id)
  saveCustomRules(next)
  return next
}
