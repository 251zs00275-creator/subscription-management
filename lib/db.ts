import type { Subscription } from '@/types'

const DB_NAME = 'subscription-manager'
const DB_VERSION = 1
const STORE_NAME = 'subscriptions'
const LS_KEY = 'subscriptions-fallback'

function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    return false
  }
}

// localStorage フォールバック
const lsDb = {
  getAll(): Subscription[] {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? (JSON.parse(raw) as Subscription[]) : []
    } catch {
      return []
    }
  },
  save(subscriptions: Subscription[]): void {
    localStorage.setItem(LS_KEY, JSON.stringify(subscriptions))
  },
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('category', 'category', { unique: false })
        store.createIndex('isActive', 'isActive', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDB().then(
    (database) =>
      new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, mode)
        const store = tx.objectStore(STORE_NAME)
        const request = operation(store)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
  )
}

export const db = {
  async getAll(): Promise<Subscription[]> {
    if (!isIndexedDBAvailable()) return lsDb.getAll()
    try {
      return await runTransaction('readonly', (store) => store.getAll())
    } catch {
      return lsDb.getAll()
    }
  },

  async getById(id: string): Promise<Subscription | undefined> {
    if (!isIndexedDBAvailable()) {
      return lsDb.getAll().find((s) => s.id === id)
    }
    try {
      return await runTransaction('readonly', (store) => store.get(id))
    } catch {
      return lsDb.getAll().find((s) => s.id === id)
    }
  },

  async create(subscription: Subscription): Promise<string> {
    if (!isIndexedDBAvailable()) {
      const all = lsDb.getAll()
      lsDb.save([...all, subscription])
      return subscription.id
    }
    try {
      await runTransaction('readwrite', (store) => store.add(subscription))
      return subscription.id
    } catch {
      const all = lsDb.getAll()
      lsDb.save([...all, subscription])
      return subscription.id
    }
  },

  async update(subscription: Subscription): Promise<void> {
    if (!isIndexedDBAvailable()) {
      const all = lsDb.getAll().map((s) => (s.id === subscription.id ? subscription : s))
      lsDb.save(all)
      return
    }
    try {
      await runTransaction('readwrite', (store) => store.put(subscription))
    } catch {
      const all = lsDb.getAll().map((s) => (s.id === subscription.id ? subscription : s))
      lsDb.save(all)
    }
  },

  async delete(id: string): Promise<void> {
    if (!isIndexedDBAvailable()) {
      lsDb.save(lsDb.getAll().filter((s) => s.id !== id))
      return
    }
    try {
      await runTransaction('readwrite', (store) => store.delete(id))
    } catch {
      lsDb.save(lsDb.getAll().filter((s) => s.id !== id))
    }
  },

  async clear(): Promise<void> {
    if (!isIndexedDBAvailable()) {
      lsDb.save([])
      return
    }
    try {
      await runTransaction('readwrite', (store) => store.clear())
    } catch {
      lsDb.save([])
    }
  },

  async bulkCreate(subscriptions: Subscription[]): Promise<void> {
    if (!isIndexedDBAvailable()) {
      const all = lsDb.getAll()
      const ids = new Set(all.map((s) => s.id))
      lsDb.save([...all, ...subscriptions.filter((s) => !ids.has(s.id))])
      return
    }
    try {
      const database = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        subscriptions.forEach((s) => store.put(s))
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    } catch {
      const all = lsDb.getAll()
      const ids = new Set(all.map((s) => s.id))
      lsDb.save([...all, ...subscriptions.filter((s) => !ids.has(s.id))])
    }
  },

  async replaceAll(subscriptions: Subscription[]): Promise<void> {
    if (!isIndexedDBAvailable()) {
      lsDb.save(subscriptions)
      return
    }
    try {
      const database = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.clear()
        subscriptions.forEach((subscription) => store.put(subscription))
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    } catch {
      lsDb.save(subscriptions)
    }
  },
}
