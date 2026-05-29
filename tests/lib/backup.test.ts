import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  createBackupPayload,
  createCurrentBackup,
  importBackup,
  parseBackup,
  serializeBackup,
} from '@/lib/backup'
import { db } from '@/lib/db'
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
})
