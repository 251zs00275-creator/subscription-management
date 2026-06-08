import { create } from 'zustand'
import { db } from '@/lib/db'
import type { Subscription, SubscriptionFormData } from '@/types'
import { useGameStats } from '@/hooks/useGameStats'
import { fireConfetti } from '@/lib/confetti'
import { syncSubscriptionsFromCloud } from '@/lib/subscriptionCloudSync'
import {
  enqueueDelete,
  enqueueUpsert,
  flushQueue,
  getPendingDeleteIds,
} from '@/lib/subscriptionSyncQueue'

function generateId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

interface SubscriptionStore {
  subscriptions: Subscription[]
  isLoading: boolean
  error: string | null

  load: () => Promise<void>
  add: (data: SubscriptionFormData) => Promise<void>
  update: (id: string, data: SubscriptionFormData) => Promise<void>
  remove: (id: string) => Promise<void>
  toggle: (id: string) => Promise<void>
  bulkImport: (items: SubscriptionFormData[]) => Promise<void>
  reorder: (orderedIds: string[]) => void
  clearError: () => void
}

export const useSubscriptions = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null })
    try {
      await flushQueue()
      const localSubscriptions = await db.getAll()
      const subscriptions = await syncSubscriptionsFromCloud(localSubscriptions, getPendingDeleteIds())
      if (subscriptions !== localSubscriptions) {
        await db.replaceAll(subscriptions)
      }
      set({ subscriptions, isLoading: false })
    } catch (err) {
      set({
        error: 'データの読み込みに失敗しました',
        isLoading: false,
      })
    }
  },

  add: async (data: SubscriptionFormData) => {
    set({ error: null })
    const subscription: Subscription = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    }
    try {
      await db.create(subscription)
      enqueueUpsert(subscription)
      void flushQueue()
      const newSubs = [...get().subscriptions, subscription]
      set({ subscriptions: newSubs })
      const game = useGameStats.getState()
      game.incrementAction('added')
      game.addPoints(10)
      game.checkAndUnlock(newSubs)
    } catch {
      set({ error: 'サブスクの追加に失敗しました' })
    }
  },

  update: async (id: string, data: SubscriptionFormData) => {
    set({ error: null })
    const existing = get().subscriptions.find((s) => s.id === id)
    if (!existing) return
    const updated: Subscription = {
      ...existing,
      ...data,
      id,
      updatedAt: now(),
    }
    try {
      await db.update(updated)
      enqueueUpsert(updated)
      void flushQueue()
      set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s.id === id ? updated : s
        ),
      }))
      const game = useGameStats.getState()
      game.incrementAction('edited')
      game.addPoints(5)
    } catch {
      set({ error: 'サブスクの更新に失敗しました' })
    }
  },

  remove: async (id: string) => {
    set({ error: null })
    try {
      await db.delete(id)
      enqueueDelete(id)
      void flushQueue()
      const remaining = get().subscriptions.filter((s) => s.id !== id)
      set({ subscriptions: remaining })
      const game = useGameStats.getState()
      game.incrementAction('deleted')
      game.addPoints(5)
      game.checkAndUnlock(remaining)
      fireConfetti('delete')
    } catch {
      set({ error: 'サブスクの削除に失敗しました' })
    }
  },

  toggle: async (id: string) => {
    const sub = get().subscriptions.find((s) => s.id === id)
    if (!sub) return
    const updated: Subscription = {
      ...sub,
      isActive: !sub.isActive,
      updatedAt: now(),
    }
    try {
      await db.update(updated)
      enqueueUpsert(updated)
      void flushQueue()
      const newSubs = get().subscriptions.map((s) => (s.id === id ? updated : s))
      set({ subscriptions: newSubs })
      const game = useGameStats.getState()
      game.incrementAction('edited')
      game.addPoints(2)
      game.checkAndUnlock(newSubs)
    } catch {
      set({ error: '有効/無効の切り替えに失敗しました' })
    }
  },

  bulkImport: async (items: SubscriptionFormData[]) => {
    set({ error: null, isLoading: true })
    const newSubs: Subscription[] = items.map((data) => ({
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    }))
    try {
      await db.bulkCreate(newSubs)
      newSubs.forEach((subscription) => {
        enqueueUpsert(subscription)
      })
      void flushQueue()
      const allSubs = [...get().subscriptions, ...newSubs]
      set({ subscriptions: allSubs, isLoading: false })
      const game = useGameStats.getState()
      game.incrementAction('imported')
      game.addPoints(20)
      game.checkAndUnlock(allSubs)
    } catch {
      set({ error: 'インポートに失敗しました', isLoading: false })
    }
  },

  reorder: (orderedIds: string[]) => {
    const current = get().subscriptions
    const idMap = new Map(current.map((s) => [s.id, s]))
    const reordered = orderedIds.flatMap((id) => {
      const sub = idMap.get(id)
      return sub ? [sub] : []
    })
    // Append any subs not in orderedIds (shouldn't happen, but safe fallback)
    const reorderedSet = new Set(orderedIds)
    const extras = current.filter((s) => !reorderedSet.has(s.id))
    set({ subscriptions: [...reordered, ...extras] })
  },

  clearError: () => set({ error: null }),
}))
