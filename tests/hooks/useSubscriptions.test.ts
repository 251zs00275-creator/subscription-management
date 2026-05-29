import { renderHook, act } from '@testing-library/react'
import { useSubscriptions } from '@/hooks/useSubscriptions'

jest.mock('@/lib/db', () => ({
  db: {
    getAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue('sub_new'),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    bulkCreate: jest.fn().mockResolvedValue(undefined),
    replaceAll: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('@/lib/subscriptionCloudSync', () => ({
  deleteSubscriptionFromCloud: jest.fn().mockResolvedValue(undefined),
  syncSubscriptionsFromCloud: jest.fn(async (subscriptions) => subscriptions),
  uploadSubscriptionToCloud: jest.fn().mockResolvedValue(undefined),
}))

import { db } from '@/lib/db'
const mockDb = db as jest.Mocked<typeof db>

function makeFormData() {
  return {
    name: 'Netflix',
    amount: 1490,
    category: 'サブスク' as const,
    nextPaymentDate: '2024-05-01',
    memo: '',
    isActive: true,
  }
}

describe('useSubscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.getAll.mockResolvedValue([])
    useSubscriptions.setState({ subscriptions: [], isLoading: false, error: null })
  })

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useSubscriptions())
    expect(result.current.subscriptions).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('load: fetches subscriptions and sets state', async () => {
    const subs = [{ id: 'sub_1', name: 'Netflix', amount: 1490, category: 'サブスク' as const, nextPaymentDate: '2024-05-01', memo: '', isActive: true, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }]
    mockDb.getAll.mockResolvedValue(subs)
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.load() })
    expect(result.current.subscriptions).toEqual(subs)
    expect(result.current.isLoading).toBe(false)
  })

  it('load: sets error on failure', async () => {
    mockDb.getAll.mockRejectedValue(new Error('DB Error'))
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.load() })
    expect(result.current.error).toBe('データの読み込みに失敗しました')
  })

  it('add: creates a subscription and appends to state', async () => {
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.add(makeFormData()) })
    expect(result.current.subscriptions).toHaveLength(1)
    expect(result.current.subscriptions[0].name).toBe('Netflix')
    expect(mockDb.create).toHaveBeenCalled()
  })

  it('add: sets error on failure', async () => {
    mockDb.create.mockRejectedValue(new Error('DB Error'))
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.add(makeFormData()) })
    expect(result.current.error).toBe('サブスクの追加に失敗しました')
  })

  it('remove: deletes subscription from state', async () => {
    const sub = { id: 'sub_1', name: 'Netflix', amount: 1490, category: 'サブスク' as const, nextPaymentDate: '2024-05-01', memo: '', isActive: true, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    useSubscriptions.setState({ subscriptions: [sub] })
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.remove('sub_1') })
    expect(result.current.subscriptions).toHaveLength(0)
    expect(mockDb.delete).toHaveBeenCalledWith('sub_1')
  })

  it('toggle: flips isActive for the matching subscription', async () => {
    const sub = { id: 'sub_1', name: 'Netflix', amount: 1490, category: 'サブスク' as const, nextPaymentDate: '2024-05-01', memo: '', isActive: true, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    useSubscriptions.setState({ subscriptions: [sub] })
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.toggle('sub_1') })
    expect(result.current.subscriptions[0].isActive).toBe(false)
  })

  it('clearError: resets error to null', async () => {
    useSubscriptions.setState({ error: 'some error' })
    const { result } = renderHook(() => useSubscriptions())
    act(() => { result.current.clearError() })
    expect(result.current.error).toBeNull()
  })

  it('bulkImport: adds all items to state', async () => {
    const { result } = renderHook(() => useSubscriptions())
    const items = [makeFormData(), { ...makeFormData(), name: 'Spotify', amount: 980 }]
    await act(async () => { await result.current.bulkImport(items) })
    expect(result.current.subscriptions).toHaveLength(2)
    expect(mockDb.bulkCreate).toHaveBeenCalled()
  })

  it('update: does nothing when id not found', async () => {
    useSubscriptions.setState({ subscriptions: [] })
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.update('nonexistent', makeFormData()) })
    expect(mockDb.update).not.toHaveBeenCalled()
  })

  it('update: updates matching subscription in state', async () => {
    const sub = { id: 'sub_1', name: 'Netflix', amount: 1490, category: 'サブスク' as const, nextPaymentDate: '2024-05-01', memo: '', isActive: true, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    useSubscriptions.setState({ subscriptions: [sub] })
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.update('sub_1', { ...makeFormData(), name: 'Updated Netflix', amount: 1990 }) })
    expect(result.current.subscriptions[0].name).toBe('Updated Netflix')
    expect(result.current.subscriptions[0].amount).toBe(1990)
  })

  it('update: sets error on db failure', async () => {
    const sub = { id: 'sub_1', name: 'Netflix', amount: 1490, category: 'サブスク' as const, nextPaymentDate: '2024-05-01', memo: '', isActive: true, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    useSubscriptions.setState({ subscriptions: [sub] })
    mockDb.update.mockRejectedValue(new Error('DB Error'))
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.update('sub_1', makeFormData()) })
    expect(result.current.error).toBe('サブスクの更新に失敗しました')
  })

  it('toggle: does nothing when id not found', async () => {
    useSubscriptions.setState({ subscriptions: [] })
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.toggle('nonexistent') })
    expect(mockDb.update).not.toHaveBeenCalled()
  })

  it('toggle: sets error on db failure', async () => {
    const sub = { id: 'sub_1', name: 'Netflix', amount: 1490, category: 'サブスク' as const, nextPaymentDate: '2024-05-01', memo: '', isActive: true, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    useSubscriptions.setState({ subscriptions: [sub] })
    mockDb.update.mockRejectedValue(new Error('DB Error'))
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.toggle('sub_1') })
    expect(result.current.error).toBe('有効/無効の切り替えに失敗しました')
  })

  it('remove: sets error on db failure', async () => {
    mockDb.delete.mockRejectedValue(new Error('DB Error'))
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.remove('sub_1') })
    expect(result.current.error).toBe('サブスクの削除に失敗しました')
  })

  it('bulkImport: sets error on db failure', async () => {
    mockDb.bulkCreate.mockRejectedValue(new Error('DB Error'))
    const { result } = renderHook(() => useSubscriptions())
    await act(async () => { await result.current.bulkImport([makeFormData()]) })
    expect(result.current.error).toBe('インポートに失敗しました')
  })
})
