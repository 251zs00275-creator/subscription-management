import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  createBackupPayload,
  createCurrentBackup,
  downloadCurrentBackup,
  importBackup,
  parseBackup,
  serializeBackup,
} from '@/lib/backup'
import { db } from '@/lib/db'
import { downloadTextFile } from '@/lib/export'
import { storage } from '@/lib/storage'
import type { AppSettings, GameStats, Subscription } from '@/types'

jest.mock('@/lib/db', () => ({
  db: {
    getAll: jest.fn(),
    clear: jest.fn(),
    bulkCreate: jest.fn(),
  },
}))

jest.mock('@/lib/storage', () => ({
  storage: {
    getSettings: jest.fn(),
    saveSettings: jest.fn(),
    markOnboardingComplete: jest.fn(),
  },
}))

jest.mock('@/lib/export', () => ({
  downloadTextFile: jest.fn(),
}))

const subscription: Subscription = {
  id: 'video-1',
  name: 'Video plan',
  amount: 1200,
  category: 'サブスク',
  nextPaymentDate: '2026-06-01',
  memo: '',
  isActive: true,
  createdAt: '2026-05-20T00:00:00.000Z',
  updatedAt: '2026-05-20T00:00:00.000Z',
}

const settings: AppSettings = {
  theme: 'dark',
  hasCompletedOnboarding: true,
  selectedCharacterId: 'main-heroine',
}

const gameStats: GameStats = {
  totalPoints: 12,
  level: 1,
  currentStreak: 2,
  lastVisitDate: '2026-05-21T00:00:00.000Z',
  achievements: [],
  totalSaved: 0,
  actionCount: { added: 1, deleted: 0, edited: 0, imported: 0 },
  monthlyVisits: ['2026-05-21'],
}

const dbMock = db as jest.Mocked<typeof db>
const storageMock = storage as jest.Mocked<typeof storage>
const downloadTextFileMock = downloadTextFile as jest.MockedFunction<typeof downloadTextFile>

function backupJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: '2026-05-21T10:00:00.000Z',
    subscriptions: [subscription],
    ...overrides,
  })
}

describe('backup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    dbMock.clear.mockResolvedValue()
    dbMock.bulkCreate.mockResolvedValue()
    storageMock.getSettings.mockReturnValue(settings)
  })

  it('serializes and parses versioned backup data', () => {
    const payload = createBackupPayload([subscription], {
      exportedAt: '2026-05-21T10:00:00.000Z',
      settings,
      gameStats,
    })

    expect(parseBackup(serializeBackup(payload))).toEqual({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: '2026-05-21T10:00:00.000Z',
      subscriptions: [subscription],
      settings,
      gameStats,
    })
  })

  it('rejects invalid backup subscription data', () => {
    expect(() =>
      parseBackup(
        JSON.stringify({
          format: BACKUP_FORMAT,
          version: BACKUP_VERSION,
          exportedAt: '2026-05-21T10:00:00.000Z',
          subscriptions: [{ id: 'missing-fields' }],
        })
      )
    ).toThrow('Backup subscriptions are invalid.')
  })

  it('collects subscriptions, settings, and persisted game stats', async () => {
    dbMock.getAll.mockResolvedValue([subscription])
    localStorage.setItem('game-stats', JSON.stringify(gameStats))

    await expect(createCurrentBackup()).resolves.toMatchObject({
      subscriptions: [subscription],
      settings,
      gameStats,
    })
  })

  it('replaces subscriptions and restores available local state on import', async () => {
    const backup = serializeBackup(
      createBackupPayload([subscription], {
        exportedAt: '2026-05-21T10:00:00.000Z',
        settings,
        gameStats,
      })
    )

    await expect(importBackup(backup)).resolves.toEqual({
      subscriptionCount: 1,
      restoredSettings: true,
      restoredGameStats: true,
    })

    expect(dbMock.clear).toHaveBeenCalled()
    expect(dbMock.bulkCreate).toHaveBeenCalledWith([subscription])
    expect(storageMock.saveSettings).toHaveBeenCalledWith(settings)
    expect(storageMock.markOnboardingComplete).toHaveBeenCalled()
    expect(JSON.parse(localStorage.getItem('game-stats') ?? '')).toEqual(gameStats)
  })

  it('rejects backup text that is not valid JSON', () => {
    expect(() => parseBackup('not-json')).toThrow('Backup file is not valid JSON.')
  })

  it('rejects settings whose characterAffection entries are malformed', () => {
    expect(() =>
      parseBackup(
        backupJson({
          settings: {
            ...settings,
            characterAffection: { 'main-heroine': { level: 1, points: 'oops', unlockedGalleryIds: [] } },
          },
        })
      )
    ).toThrow('Backup settings are invalid.')
  })

  it('accepts settings with well-formed characterAffection entries', () => {
    const payload = parseBackup(
      backupJson({
        settings: {
          ...settings,
          characterAffection: { 'main-heroine': { level: 2, points: 30, unlockedGalleryIds: ['memory-1'] } },
        },
      })
    )

    expect(payload.settings?.characterAffection?.['main-heroine']).toEqual({
      level: 2,
      points: 30,
      unlockedGalleryIds: ['memory-1'],
    })
  })

  it('rejects game stats whose achievements are malformed', () => {
    expect(() =>
      parseBackup(
        backupJson({
          gameStats: { ...gameStats, achievements: [{ id: 'first_subscription' }] },
        })
      )
    ).toThrow('Backup game stats are invalid.')
  })

  it('accepts game stats with well-formed achievements', () => {
    const achievement = {
      id: 'first_subscription',
      title: 'はじめての一歩',
      emoji: '🌸',
      description: '最初のサブスクを登録しました',
      unlockedAt: '2026-05-20T00:00:00.000Z',
      claimedAt: null,
      points: 20,
    }

    const payload = parseBackup(backupJson({ gameStats: { ...gameStats, achievements: [achievement] } }))

    expect(payload.gameStats?.achievements).toEqual([achievement])
  })

  it('omits game stats from the current backup when persisted data is corrupted', async () => {
    dbMock.getAll.mockResolvedValue([subscription])
    localStorage.setItem('game-stats', '{not-json')

    await expect(createCurrentBackup()).resolves.toMatchObject({
      subscriptions: [subscription],
      gameStats: undefined,
    })
  })

  it('downloads a serialized backup of the current data with a date-stamped filename', async () => {
    dbMock.getAll.mockResolvedValue([subscription])

    const payload = await downloadCurrentBackup()

    expect(downloadTextFileMock).toHaveBeenCalledWith(
      serializeBackup(payload),
      `subscription-backup_${payload.exportedAt.slice(0, 10)}.json`,
      'application/json;charset=utf-8;'
    )
  })

  it('skips clearing existing subscriptions when replaceSubscriptions is false', async () => {
    const backup = serializeBackup(createBackupPayload([subscription], { exportedAt: '2026-05-21T10:00:00.000Z' }))

    await importBackup(backup, { replaceSubscriptions: false })

    expect(dbMock.clear).not.toHaveBeenCalled()
    expect(dbMock.bulkCreate).toHaveBeenCalledWith([subscription])
  })

  it('does not restore settings or game stats when the backup omits them', async () => {
    const backup = backupJson()

    await expect(importBackup(backup)).resolves.toEqual({
      subscriptionCount: 1,
      restoredSettings: false,
      restoredGameStats: false,
    })
    expect(storageMock.saveSettings).not.toHaveBeenCalled()
    expect(storageMock.markOnboardingComplete).not.toHaveBeenCalled()
  })

  it('restores settings without marking onboarding complete when it was not finished', async () => {
    const incompleteSettings: AppSettings = { ...settings, hasCompletedOnboarding: false }
    const backup = serializeBackup(
      createBackupPayload([subscription], { exportedAt: '2026-05-21T10:00:00.000Z', settings: incompleteSettings })
    )

    await importBackup(backup)

    expect(storageMock.saveSettings).toHaveBeenCalledWith(incompleteSettings)
    expect(storageMock.markOnboardingComplete).not.toHaveBeenCalled()
  })
})
