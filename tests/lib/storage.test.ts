import { storage } from '@/lib/storage'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  localStorageMock.clear()
  jest.clearAllMocks()
})

describe('storage', () => {
  describe('getSettings', () => {
    it('returns default settings when nothing stored', () => {
      const settings = storage.getSettings()
      expect(settings.theme).toBe('system')
      expect(settings.hasCompletedOnboarding).toBe(false)
      expect(settings.selectedCharacterId).toBe('main-heroine')
    })

    it('returns stored settings', () => {
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({ theme: 'dark', hasCompletedOnboarding: true })
      )
      const settings = storage.getSettings()
      expect(settings.theme).toBe('dark')
      expect(settings.hasCompletedOnboarding).toBe(true)
    })

    it('returns default on invalid JSON', () => {
      localStorageMock.getItem.mockReturnValueOnce('not-json')
      const settings = storage.getSettings()
      expect(settings.theme).toBe('system')
    })
  })

  describe('saveSettings', () => {
    it('merges settings with existing', () => {
      storage.saveSettings({ theme: 'dark' })
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'app-settings',
        expect.stringContaining('"theme":"dark"')
      )
    })

    it('saves selected character in settings', () => {
      storage.saveSelectedCharacterId('advisor-danger')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'app-settings',
        expect.stringContaining('"selectedCharacterId":"advisor-danger"')
      )
    })
  })

  describe('selected character', () => {
    it('returns default selected character', () => {
      expect(storage.getSelectedCharacterId()).toBe('main-heroine')
    })

    it('returns stored selected character', () => {
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({ selectedCharacterId: 'analyst-cool' })
      )
      expect(storage.getSelectedCharacterId()).toBe('analyst-cool')
    })

    it('falls back when stored selected character is invalid', () => {
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({ selectedCharacterId: 'unknown' })
      )
      expect(storage.getSelectedCharacterId()).toBe('main-heroine')
    })
  })

  describe('daily character and login bonus', () => {
    it('detects daily character selection by date', () => {
      expect(storage.needsDailyCharacterSelection('2026-05-19')).toBe(true)
      storage.markCharacterSelectedToday('analyst-cool', '2026-05-19')
      expect(storage.needsDailyCharacterSelection('2026-05-19')).toBe(false)
      expect(storage.getSelectedCharacterId()).toBe('analyst-cool')
    })

    it('detects unclaimed login bonus by date', () => {
      expect(storage.needsLoginBonusClaim('2026-05-19')).toBe(true)
      storage.markLoginBonusClaimedToday('2026-05-19')
      expect(storage.needsLoginBonusClaim('2026-05-19')).toBe(false)
    })

    it('adds character affection and unlocks gallery rewards', () => {
      const affection = storage.addCharacterAffection('main-heroine', 40)
      expect(affection.level).toBeGreaterThanOrEqual(2)
      expect(affection.unlockedGalleryIds).toContain('main-heroine-affection-1')
    })
  })

  describe('onboarding', () => {
    it('returns false initially', () => {
      expect(storage.hasCompletedOnboarding()).toBe(false)
    })

    it('returns true after markOnboardingComplete', () => {
      storage.markOnboardingComplete()
      localStorageMock.getItem.mockReturnValueOnce('true')
      expect(storage.hasCompletedOnboarding()).toBe(true)
    })
  })

  describe('clear', () => {
    it('removes all keys', () => {
      storage.clear()
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2)
    })
  })

  describe('SSR guard', () => {
    it('getSettings returns defaults when window is undefined', () => {
      const originalWindow = global.window
      // @ts-expect-error testing SSR env
      delete global.window
      const settings = storage.getSettings()
      expect(settings.theme).toBe('system')
      global.window = originalWindow
    })

    it('saveSettings is no-op when window is undefined', () => {
      const originalWindow = global.window
      // @ts-expect-error testing SSR env
      delete global.window
      expect(() => storage.saveSettings({ theme: 'dark' })).not.toThrow()
      global.window = originalWindow
    })

    it('hasCompletedOnboarding returns false when window is undefined', () => {
      const originalWindow = global.window
      // @ts-expect-error testing SSR env
      delete global.window
      expect(storage.hasCompletedOnboarding()).toBe(false)
      global.window = originalWindow
    })

    it('markOnboardingComplete is no-op when window is undefined', () => {
      const originalWindow = global.window
      // @ts-expect-error testing SSR env
      delete global.window
      expect(() => storage.markOnboardingComplete()).not.toThrow()
      global.window = originalWindow
    })

    it('clear is no-op when window is undefined', () => {
      const originalWindow = global.window
      // @ts-expect-error testing SSR env
      delete global.window
      expect(() => storage.clear()).not.toThrow()
      global.window = originalWindow
    })
  })
})
