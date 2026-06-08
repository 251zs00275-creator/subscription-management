import type { Subscription } from '@/types'
import { deleteSubscriptionFromCloud, uploadSubscriptionToCloud } from '@/lib/subscriptionCloudSync'

const QUEUE_KEY = 'subscription-sync-queue'

interface SyncQueueEntry {
  id: string
  op: 'upsert' | 'delete'
  payload?: Subscription
  queuedAt: string
}

let isFlushing = false

function readQueue(): SyncQueueEntry[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as SyncQueueEntry[]) : []
  } catch {
    return []
  }
}

function writeQueue(entries: SyncQueueEntry[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(entries))
  } catch {
    // ストレージ書き込みに失敗しても致命的ではないため無視する
  }
}

function upsertEntry(entry: SyncQueueEntry): void {
  const queue = readQueue().filter((existing) => existing.id !== entry.id)
  queue.push(entry)
  writeQueue(queue)
}

export function enqueueUpsert(subscription: Subscription): void {
  upsertEntry({
    id: subscription.id,
    op: 'upsert',
    payload: subscription,
    queuedAt: new Date().toISOString(),
  })
}

export function enqueueDelete(id: string): void {
  upsertEntry({
    id,
    op: 'delete',
    queuedAt: new Date().toISOString(),
  })
}

export function getPendingDeleteIds(): Set<string> {
  return new Set(
    readQueue()
      .filter((entry) => entry.op === 'delete')
      .map((entry) => entry.id)
  )
}

async function processEntry(entry: SyncQueueEntry): Promise<boolean> {
  try {
    if (entry.op === 'delete') {
      await deleteSubscriptionFromCloud(entry.id)
    } else if (entry.payload) {
      await uploadSubscriptionToCloud(entry.payload)
    }
    return true
  } catch {
    return false
  }
}

export async function flushQueue(): Promise<void> {
  if (isFlushing) return
  isFlushing = true
  try {
    const queue = readQueue()
    const remaining: SyncQueueEntry[] = []
    for (const entry of queue) {
      const succeeded = await processEntry(entry)
      if (!succeeded) {
        remaining.push(entry)
      }
    }
    writeQueue(remaining)
  } finally {
    isFlushing = false
  }
}
