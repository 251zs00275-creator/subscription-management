import type { AppSettings, GameStats, Subscription } from '@/types'
import { db } from '@/lib/db'
import { downloadTextFile } from '@/lib/export'
import { storage } from '@/lib/storage'

export const BACKUP_FORMAT = 'subscription-manager-backup'
export const BACKUP_VERSION = 1

const GAME_STATS_KEY = 'game-stats'

type UnknownRecord = Record<string, unknown>

export interface BackupPayload {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  exportedAt: string
  subscriptions: Subscription[]
  settings?: AppSettings
  gameStats?: GameStats
}

export interface ImportBackupResult {
  subscriptionCount: number
  restoredSettings: boolean
  restoredGameStats: boolean
}

export interface ImportBackupOptions {
  replaceSubscriptions?: boolean
}

interface CreateBackupOptions {
  exportedAt?: string
  settings?: AppSettings
  gameStats?: GameStats
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isSubscription(value: unknown): value is Subscription {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.amount === 'number' &&
    Number.isFinite(value.amount) &&
    typeof value.category === 'string' &&
    typeof value.nextPaymentDate === 'string' &&
    typeof value.memo === 'string' &&
    typeof value.isActive === 'boolean' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

function isCharacterAffection(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.level === 'number' &&
    Number.isFinite(value.level) &&
    typeof value.points === 'number' &&
    Number.isFinite(value.points) &&
    isStringArray(value.unlockedGalleryIds)
  )
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string')
}

function isAppSettings(value: unknown): value is AppSettings {
  if (!isRecord(value)) return false
  if (!['light', 'dark', 'system'].includes(value.theme as string)) return false
  if (typeof value.hasCompletedOnboarding !== 'boolean') return false
  if (value.selectedCharacterId !== undefined && typeof value.selectedCharacterId !== 'string') return false
  if (value.lastCharacterSelectDate !== undefined && typeof value.lastCharacterSelectDate !== 'string') return false
  if (value.lastLoginBonusClaimDate !== undefined && typeof value.lastLoginBonusClaimDate !== 'string') return false
  if (value.featureVisitDates !== undefined && !isStringRecord(value.featureVisitDates)) return false

  return (
    value.characterAffection === undefined ||
    (isRecord(value.characterAffection) &&
      Object.values(value.characterAffection).every(isCharacterAffection))
  )
}

function isAchievement(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.emoji === 'string' &&
    typeof value.description === 'string' &&
    (typeof value.unlockedAt === 'string' || value.unlockedAt === null) &&
    (value.claimedAt === undefined ||
      typeof value.claimedAt === 'string' ||
      value.claimedAt === null) &&
    typeof value.points === 'number' &&
    Number.isFinite(value.points)
  )
}

function isActionCount(value: unknown): boolean {
  return (
    isRecord(value) &&
    ['added', 'deleted', 'edited', 'imported'].every(
      (key) => typeof value[key] === 'number' && Number.isFinite(value[key])
    )
  )
}

function isGameStats(value: unknown): value is GameStats {
  if (!isRecord(value)) return false

  return (
    ['totalPoints', 'level', 'currentStreak', 'totalSaved'].every(
      (key) => typeof value[key] === 'number' && Number.isFinite(value[key])
    ) &&
    typeof value.lastVisitDate === 'string' &&
    isActionCount(value.actionCount) &&
    Array.isArray(value.achievements) &&
    value.achievements.every(isAchievement) &&
    isStringArray(value.monthlyVisits)
  )
}

function getGameStats(): GameStats | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    const raw = localStorage.getItem(GAME_STATS_KEY)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    return isGameStats(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

function saveGameStats(gameStats: GameStats): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GAME_STATS_KEY, JSON.stringify(gameStats))
}

export function createBackupPayload(
  subscriptions: Subscription[],
  options: CreateBackupOptions = {}
): BackupPayload {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: options.exportedAt ?? new Date().toISOString(),
    subscriptions,
    settings: options.settings ?? (typeof window === 'undefined' ? undefined : storage.getSettings()),
    gameStats: options.gameStats ?? getGameStats(),
  }
}

export function serializeBackup(payload: BackupPayload): string {
  return JSON.stringify(payload, null, 2)
}

export function parseBackup(text: string): BackupPayload {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Backup file is not valid JSON.')
  }

  if (!isRecord(parsed)) throw new Error('Backup file must contain an object.')
  if (parsed.format !== BACKUP_FORMAT) throw new Error('Backup file format is not supported.')
  if (parsed.version !== BACKUP_VERSION) throw new Error('Backup file version is not supported.')
  if (typeof parsed.exportedAt !== 'string') throw new Error('Backup export date is missing.')
  if (!Array.isArray(parsed.subscriptions) || !parsed.subscriptions.every(isSubscription)) {
    throw new Error('Backup subscriptions are invalid.')
  }
  if (parsed.settings !== undefined && !isAppSettings(parsed.settings)) {
    throw new Error('Backup settings are invalid.')
  }
  if (parsed.gameStats !== undefined && !isGameStats(parsed.gameStats)) {
    throw new Error('Backup game stats are invalid.')
  }

  return parsed as unknown as BackupPayload
}

export async function createCurrentBackup(): Promise<BackupPayload> {
  return createBackupPayload(await db.getAll())
}

export async function downloadCurrentBackup(): Promise<BackupPayload> {
  const payload = await createCurrentBackup()
  downloadTextFile(
    serializeBackup(payload),
    `subscription-backup_${payload.exportedAt.slice(0, 10)}.json`,
    'application/json;charset=utf-8;'
  )
  return payload
}

export async function importBackup(
  text: string,
  options: ImportBackupOptions = {}
): Promise<ImportBackupResult> {
  const payload = parseBackup(text)

  if (options.replaceSubscriptions ?? true) {
    await db.clear()
  }
  await db.bulkCreate(payload.subscriptions)

  if (payload.settings) {
    storage.saveSettings(payload.settings)
    if (payload.settings.hasCompletedOnboarding) {
      storage.markOnboardingComplete()
    }
  }

  if (payload.gameStats) {
    saveGameStats(payload.gameStats)
  }

  return {
    subscriptionCount: payload.subscriptions.length,
    restoredSettings: Boolean(payload.settings),
    restoredGameStats: Boolean(payload.gameStats),
  }
}
