import {
  loadCustomRules,
  saveCustomRules,
  addCustomRule,
  removeCustomRule,
} from '@/lib/customRules'
import type { CustomKeywordRule } from '@/types'

const STORAGE_KEY = 'custom-keyword-rules'

describe('customRules', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('loadCustomRules', () => {
    it('returns an empty array when nothing is stored', () => {
      expect(loadCustomRules()).toEqual([])
    })

    it('returns the parsed rules from storage', () => {
      const rules: CustomKeywordRule[] = [{ id: '1', keyword: 'ポーラ', category: '日用品' }]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))

      expect(loadCustomRules()).toEqual(rules)
    })

    it('returns an empty array when stored data is corrupted', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json')

      expect(loadCustomRules()).toEqual([])
    })
  })

  describe('saveCustomRules', () => {
    it('persists rules as JSON', () => {
      const rules: CustomKeywordRule[] = [{ id: '1', keyword: 'Netflix', category: 'サブスク' }]

      saveCustomRules(rules)

      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(rules)
    })
  })

  describe('addCustomRule', () => {
    it('appends a new rule with a generated id and trimmed keyword', () => {
      const result = addCustomRule('  Spotify  ', 'サブスク')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ keyword: 'Spotify', category: 'サブスク' })
      expect(result[0].id).toEqual(expect.any(String))
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(result)
    })

    it('preserves existing rules when adding a new one', () => {
      addCustomRule('Netflix', 'サブスク')

      const result = addCustomRule('スーパー', '食費')

      expect(result.map((r) => r.keyword)).toEqual(['Netflix', 'スーパー'])
    })
  })

  describe('removeCustomRule', () => {
    it('removes only the rule with the matching id', () => {
      addCustomRule('Netflix', 'サブスク')
      const afterSecondAdd = addCustomRule('スーパー', '食費')
      const second = afterSecondAdd[1]

      const remaining = removeCustomRule(second.id)

      expect(remaining.map((r) => r.keyword)).toEqual(['Netflix'])
    })

    it('returns the rules unchanged when the id does not match anything', () => {
      addCustomRule('Netflix', 'サブスク')

      const remaining = removeCustomRule('does-not-exist')

      expect(remaining).toHaveLength(1)
    })
  })
})
