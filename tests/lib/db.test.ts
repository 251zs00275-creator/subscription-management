import type { Subscription } from '@/types'

jest.mock('@/lib/db', () => ({
  db: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    bulkCreate: jest.fn(),
  },
}))

import { db } from '@/lib/db'

function makeSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub_test_1',
    name: 'Netflix',
    amount: 1490,
    category: 'サブスク',
    nextPaymentDate: '2024-05-01',
    memo: '',
    isActive: true,
    createdAt: '2024-04-01T00:00:00.000Z',
    updatedAt: '2024-04-01T00:00:00.000Z',
    ...overrides,
  }
}

const mockDb = db as jest.Mocked<typeof db>

describe('db interface', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getAll resolves with subscriptions', async () => {
    const subs = [makeSubscription()]
    mockDb.getAll.mockResolvedValue(subs)
    const result = await db.getAll()
    expect(result).toEqual(subs)
    expect(mockDb.getAll).toHaveBeenCalledTimes(1)
  })

  it('getById resolves with the matching subscription', async () => {
    const sub = makeSubscription()
    mockDb.getById.mockResolvedValue(sub)
    const result = await db.getById('sub_test_1')
    expect(result).toEqual(sub)
    expect(mockDb.getById).toHaveBeenCalledWith('sub_test_1')
  })

  it('create resolves with the subscription id', async () => {
    const sub = makeSubscription()
    mockDb.create.mockResolvedValue('sub_test_1')
    const id = await db.create(sub)
    expect(id).toBe('sub_test_1')
    expect(mockDb.create).toHaveBeenCalledWith(sub)
  })

  it('update calls db.update with the subscription', async () => {
    const sub = makeSubscription()
    mockDb.update.mockResolvedValue(undefined)
    await db.update(sub)
    expect(mockDb.update).toHaveBeenCalledWith(sub)
  })

  it('delete calls db.delete with the given id', async () => {
    mockDb.delete.mockResolvedValue(undefined)
    await db.delete('sub_test_1')
    expect(mockDb.delete).toHaveBeenCalledWith('sub_test_1')
  })

  it('bulkCreate calls db.bulkCreate with subscriptions', async () => {
    const subs = [makeSubscription(), makeSubscription({ id: 'sub_test_2' })]
    mockDb.bulkCreate.mockResolvedValue(undefined)
    await db.bulkCreate(subs)
    expect(mockDb.bulkCreate).toHaveBeenCalledWith(subs)
  })

  it('getAll returns empty array when no subscriptions', async () => {
    mockDb.getAll.mockResolvedValue([])
    const result = await db.getAll()
    expect(result).toEqual([])
  })

  it('getById returns undefined for unknown id', async () => {
    mockDb.getById.mockResolvedValue(undefined)
    const result = await db.getById('nonexistent')
    expect(result).toBeUndefined()
  })
})
