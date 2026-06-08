jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({ mocked: true })),
}))

import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'

const createBrowserClientMock = createBrowserClient as jest.Mock

describe('supabase', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey
    createBrowserClientMock.mockClear()
  })

  describe('isSupabaseConfigured', () => {
    it('returns false when either env var is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      expect(isSupabaseConfigured()).toBe(false)

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      expect(isSupabaseConfigured()).toBe(false)
    })

    it('returns true when both env vars are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'public-key'
      expect(isSupabaseConfigured()).toBe(true)
    })
  })

  describe('getSupabaseBrowserClient', () => {
    it('returns null when Supabase is not configured', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      expect(getSupabaseBrowserClient()).toBeNull()
      expect(createBrowserClientMock).not.toHaveBeenCalled()
    })

    it('creates a client once and caches it for subsequent calls', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'public-key'

      const first = getSupabaseBrowserClient()
      const second = getSupabaseBrowserClient()

      expect(first).not.toBeNull()
      expect(first).toBe(second)
      expect(createBrowserClientMock).toHaveBeenCalledTimes(1)
      expect(createBrowserClientMock).toHaveBeenCalledWith(
        'https://example.supabase.co',
        'public-key'
      )
    })
  })
})
