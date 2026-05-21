import type { AppSettings, CharacterAffection } from '@/types'
import { CHARACTERS, type AppFeature, type CharacterId } from '@/lib/characters'

const SETTINGS_KEY = 'app-settings'
const ONBOARDING_KEY = 'has-completed-onboarding'

const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[]
const AFFECTION_LEVELS = [0, 40, 100, 180, 280]

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function defaultAffection(): Record<CharacterId, CharacterAffection> {
  return CHARACTER_IDS.reduce((acc, id) => {
    acc[id] = { level: 1, points: 0, unlockedGalleryIds: [] }
    return acc
  }, {} as Record<CharacterId, CharacterAffection>)
}

function normalizeCharacterId(value: unknown): CharacterId {
  return CHARACTER_IDS.includes(value as CharacterId) ? (value as CharacterId) : 'main-heroine'
}

function calculateAffectionLevel(points: number): number {
  return AFFECTION_LEVELS.filter((threshold) => points >= threshold).length
}

function normalizeAffection(
  value: AppSettings['characterAffection']
): Record<CharacterId, CharacterAffection> {
  const base = defaultAffection()
  for (const id of CHARACTER_IDS) {
    const stored = value?.[id]
    if (!stored) continue
    const points = Number.isFinite(stored.points) ? stored.points : 0
    const level = Math.max(stored.level ?? calculateAffectionLevel(points), calculateAffectionLevel(points))
    const galleryIds = new Set(stored.unlockedGalleryIds ?? [])
    for (const item of CHARACTERS[id].gallery) {
      if (level >= item.requiredLevel) galleryIds.add(item.id)
    }
    base[id] = { level, points, unlockedGalleryIds: [...galleryIds] }
  }
  return base
}

const defaultSettings: AppSettings = {
  theme: 'system',
  hasCompletedOnboarding: false,
  selectedCharacterId: 'main-heroine',
  characterAffection: defaultAffection(),
  featureVisitDates: {},
}

export const storage = {
  getSettings(): AppSettings {
    if (typeof window === 'undefined') return defaultSettings
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      return {
        ...defaultSettings,
        ...parsed,
        selectedCharacterId: normalizeCharacterId(parsed.selectedCharacterId),
        characterAffection: normalizeAffection(parsed.characterAffection),
        featureVisitDates: parsed.featureVisitDates ?? {},
      }
    } catch {
      return defaultSettings
    }
  },

  saveSettings(settings: Partial<AppSettings>): void {
    if (typeof window === 'undefined') return
    const current = storage.getSettings()
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...current, ...settings })
    )
  },

  hasCompletedOnboarding(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(ONBOARDING_KEY) === 'true'
  },

  markOnboardingComplete(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(ONBOARDING_KEY, 'true')
  },

  getSelectedCharacterId(): CharacterId {
    return normalizeCharacterId(storage.getSettings().selectedCharacterId)
  },

  saveSelectedCharacterId(characterId: CharacterId): void {
    storage.saveSettings({ selectedCharacterId: characterId })
  },

  needsDailyCharacterSelection(date = todayKey()): boolean {
    return storage.getSettings().lastCharacterSelectDate !== date
  },

  markCharacterSelectedToday(characterId: CharacterId, date = todayKey()): void {
    storage.saveSettings({ selectedCharacterId: characterId, lastCharacterSelectDate: date })
  },

  needsLoginBonusClaim(date = todayKey()): boolean {
    return storage.getSettings().lastLoginBonusClaimDate !== date
  },

  markLoginBonusClaimedToday(date = todayKey()): void {
    storage.saveSettings({ lastLoginBonusClaimDate: date })
  },

  getCharacterAffection(): Record<CharacterId, CharacterAffection> {
    return normalizeAffection(storage.getSettings().characterAffection)
  },

  addCharacterAffection(characterId: CharacterId, points: number): CharacterAffection {
    const all = storage.getCharacterAffection()
    const current = all[characterId]
    const nextPoints = current.points + points
    const nextLevel = calculateAffectionLevel(nextPoints)
    const galleryIds = new Set(current.unlockedGalleryIds)
    for (const item of CHARACTERS[characterId].gallery) {
      if (nextLevel >= item.requiredLevel) galleryIds.add(item.id)
    }
    const next = { level: nextLevel, points: nextPoints, unlockedGalleryIds: [...galleryIds] }
    storage.saveSettings({ characterAffection: { ...all, [characterId]: next } })
    return next
  },

  recordFeatureVisit(feature: AppFeature, characterId: CharacterId, date = todayKey()): boolean {
    const settings = storage.getSettings()
    const key = `${date}:${feature}`
    if (settings.featureVisitDates?.[key] === characterId) return false
    storage.addCharacterAffection(characterId, 3)
    storage.saveSettings({
      featureVisitDates: { ...(settings.featureVisitDates ?? {}), [key]: characterId },
    })
    return true
  },

  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SETTINGS_KEY)
    localStorage.removeItem(ONBOARDING_KEY)
  },
}
