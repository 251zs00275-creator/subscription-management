import {
  enqueueDelete,
  enqueueUpsert,
  flushQueue,
  getPendingDeleteIds,
} from '@/lib/subscriptionSyncQueue'
import { deleteSubscriptionFromCloud, uploadSubscriptionToCloud } from '@/lib/subscriptionCloudSync'
import type { Subscription } from '@/types'

jest.mock('@/lib/subscriptionCloudSync', () => ({
  uploadSubscriptionToCloud: jest.fn(),
  deleteSubscriptionFromCloud: jest.fn(),
}))

const mockUpload = uploadSubscriptionToCloud as jest.MockedFunction<typeof uploadSubscriptionToCloud>
const mockDelete = deleteSubscriptionFromCloud as jest.MockedFunction<typeof deleteSubscriptionFromCloud>

const QUEUE_KEY = 'subscription-sync-queue'

function buildSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub-1',
    name: 'Netflix',
    amount: 1500,
    category: 'サブスク',
    nextPaymentDate: '2026-07-01',
    memo: '',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function readQueueFromStorage(): Array<{ id: string; op: string }> {
  const raw = localStorage.getItem(QUEUE_KEY)
  return raw ? JSON.parse(raw) : []
}

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  mockUpload.mockResolvedValue(undefined)
  mockDelete.mockResolvedValue(undefined)
})

describe('enqueueUpsert / enqueueDelete', () => {
  it('upsert操作をlocalStorageに永続化する', () => {
    enqueueUpsert(buildSubscription())

    const queue = readQueueFromStorage()
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ id: 'sub-1', op: 'upsert' })
  })

  it('delete操作をlocalStorageに永続化する', () => {
    enqueueDelete('sub-1')

    const queue = readQueueFromStorage()
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ id: 'sub-1', op: 'delete' })
  })

  it('同一IDのエントリは1件に集約され、deleteがupsertを置き換える', () => {
    enqueueUpsert(buildSubscription({ id: 'sub-1' }))
    enqueueDelete('sub-1')

    const queue = readQueueFromStorage()
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ id: 'sub-1', op: 'delete' })
  })

  it('異なるIDのエントリは両方保持される', () => {
    enqueueUpsert(buildSubscription({ id: 'sub-1' }))
    enqueueDelete('sub-2')

    const queue = readQueueFromStorage()
    expect(queue.map((entry) => entry.id).sort()).toEqual(['sub-1', 'sub-2'])
  })
})

describe('getPendingDeleteIds', () => {
  it('保留中の削除IDのみを返す', () => {
    enqueueUpsert(buildSubscription({ id: 'sub-1' }))
    enqueueDelete('sub-2')

    expect(getPendingDeleteIds()).toEqual(new Set(['sub-2']))
  })
})

describe('flushQueue', () => {
  it('成功したエントリはキューから削除される', async () => {
    enqueueUpsert(buildSubscription({ id: 'sub-1' }))
    enqueueDelete('sub-2')

    await flushQueue()

    expect(mockUpload).toHaveBeenCalledTimes(1)
    expect(mockDelete).toHaveBeenCalledWith('sub-2')
    expect(readQueueFromStorage()).toHaveLength(0)
  })

  it('失敗したエントリはキューに残り、再試行できる', async () => {
    mockDelete.mockRejectedValueOnce(new Error('network error'))
    enqueueDelete('sub-1')

    await flushQueue()

    let queue = readQueueFromStorage()
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ id: 'sub-1', op: 'delete' })
    expect(getPendingDeleteIds()).toEqual(new Set(['sub-1']))

    mockDelete.mockResolvedValueOnce(undefined)
    await flushQueue()

    queue = readQueueFromStorage()
    expect(queue).toHaveLength(0)
  })

  it('成功と失敗が混在する場合、成功分のみ取り除かれる', async () => {
    mockUpload.mockResolvedValueOnce(undefined)
    mockDelete.mockRejectedValueOnce(new Error('network error'))
    enqueueUpsert(buildSubscription({ id: 'sub-1' }))
    enqueueDelete('sub-2')

    await flushQueue()

    const queue = readQueueFromStorage()
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ id: 'sub-2', op: 'delete' })
  })
})
