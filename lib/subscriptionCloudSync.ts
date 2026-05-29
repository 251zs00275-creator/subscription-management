import type { User } from '@supabase/supabase-js'
import type { Category, Subscription } from '@/types'
import { getSupabaseBrowserClient } from '@/lib/supabase'

interface CloudSubscriptionRow {
  id: string
  user_id: string
  name: string
  amount: number | string
  category: Category
  next_payment_date: string
  memo: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

function toCloudRow(subscription: Subscription, userId: string): CloudSubscriptionRow {
  return {
    id: subscription.id,
    user_id: userId,
    name: subscription.name,
    amount: subscription.amount,
    category: subscription.category,
    next_payment_date: subscription.nextPaymentDate,
    memo: subscription.memo,
    is_active: subscription.isActive,
    created_at: subscription.createdAt,
    updated_at: subscription.updatedAt,
    deleted_at: null,
  }
}

function toSubscription(row: CloudSubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    category: row.category,
    nextPaymentDate: row.next_payment_date,
    memo: row.memo,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function newerThan(left: string | null | undefined, right: string | null | undefined): boolean {
  return Boolean(left && (!right || new Date(left).getTime() > new Date(right).getTime()))
}

async function getSignedInUser(): Promise<User | null> {
  const client = getSupabaseBrowserClient()
  if (!client) return null
  const { data } = await client.auth.getUser()
  return data.user
}

export async function syncSubscriptionsFromCloud(local: Subscription[]): Promise<Subscription[]> {
  const client = getSupabaseBrowserClient()
  const user = await getSignedInUser()
  if (!client || !user) return local

  const { data, error } = await client
    .from('subscriptions')
    .select(
      'id,user_id,name,amount,category,next_payment_date,memo,is_active,created_at,updated_at,deleted_at'
    )
    .eq('user_id', user.id)

  if (error || !data) return local

  const remoteRows = data as CloudSubscriptionRow[]
  const localById = new Map(local.map((subscription) => [subscription.id, subscription]))
  const merged = new Map<string, Subscription>()
  const rowsToUpload: CloudSubscriptionRow[] = []

  for (const subscription of local) {
    merged.set(subscription.id, subscription)
  }

  for (const row of remoteRows) {
    const localSubscription = localById.get(row.id)

    if (row.deleted_at && (!localSubscription || newerThan(row.deleted_at, localSubscription.updatedAt))) {
      merged.delete(row.id)
      continue
    }

    if (!localSubscription) {
      merged.set(row.id, toSubscription(row))
      continue
    }

    if (newerThan(row.updated_at, localSubscription.updatedAt)) {
      merged.set(row.id, toSubscription(row))
      continue
    }

    if (newerThan(localSubscription.updatedAt, row.updated_at)) {
      rowsToUpload.push(toCloudRow(localSubscription, user.id))
    }
  }

  const remoteIds = new Set(remoteRows.map((row) => row.id))
  for (const subscription of local) {
    if (!remoteIds.has(subscription.id)) {
      rowsToUpload.push(toCloudRow(subscription, user.id))
    }
  }

  if (rowsToUpload.length > 0) {
    const { error: upsertError } = await client
      .from('subscriptions')
      .upsert(rowsToUpload, { onConflict: 'id' })
    if (upsertError) {
      throw new Error(`Cloud sync upload failed: ${upsertError.message}`)
    }
  }

  return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function uploadSubscriptionToCloud(subscription: Subscription): Promise<void> {
  const client = getSupabaseBrowserClient()
  const user = await getSignedInUser()
  if (!client || !user) return
  const { error } = await client
    .from('subscriptions')
    .upsert(toCloudRow(subscription, user.id), { onConflict: 'id' })
  if (error) {
    throw new Error(`Cloud upload failed: ${error.message}`)
  }
}

export async function deleteSubscriptionFromCloud(id: string): Promise<void> {
  const client = getSupabaseBrowserClient()
  const user = await getSignedInUser()
  if (!client || !user) return

  const { error } = await client
    .from('subscriptions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) {
    throw new Error(`Cloud delete failed: ${error.message}`)
  }
}
