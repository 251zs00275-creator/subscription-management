import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { Subscription } from '@/types'

async function getSignedInUserId(): Promise<string | null> {
  const client = getSupabaseBrowserClient()
  if (!client) return null
  const { data } = await client.auth.getUser()
  return data.user?.id ?? null
}

function isSubscriptionSnapshot(value: unknown): value is Subscription[] {
  return Array.isArray(value)
}

export async function getPendingTask(): Promise<Subscription[] | null> {
  const client = getSupabaseBrowserClient()
  const userId = await getSignedInUserId()
  if (!client || !userId) return null

  const { data, error } = await client
    .from('llm_analysis_tasks')
    .select('subscriptions_snapshot')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .maybeSingle()

  if (error || !data) return null

  const snapshot = (data as { subscriptions_snapshot: unknown }).subscriptions_snapshot
  return isSubscriptionSnapshot(snapshot) ? snapshot : null
}

export async function setPendingTask(subscriptions: Subscription[]): Promise<void> {
  const client = getSupabaseBrowserClient()
  const userId = await getSignedInUserId()
  if (!client || !userId) return

  await client.from('llm_analysis_tasks').delete().eq('user_id', userId).eq('status', 'pending')

  const { error } = await client.from('llm_analysis_tasks').insert({
    user_id: userId,
    status: 'pending',
    subscriptions_snapshot: subscriptions,
  })

  if (error) {
    throw new Error(`Failed to persist pending analysis task: ${error.message}`)
  }
}

export async function clearPendingTask(): Promise<void> {
  const client = getSupabaseBrowserClient()
  const userId = await getSignedInUserId()
  if (!client || !userId) return

  const { error } = await client
    .from('llm_analysis_tasks')
    .delete()
    .eq('user_id', userId)
    .eq('status', 'pending')

  if (error) {
    throw new Error(`Failed to clear pending analysis task: ${error.message}`)
  }
}
