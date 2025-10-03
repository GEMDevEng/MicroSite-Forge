import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

interface CookieOptions {
  domain?: string
  path?: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  expirationDate?: number
}

/**
 * Validate required Supabase environment variables
 */
function validateSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    const missing = []
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!key) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    throw new Error(
      `Missing required Supabase environment variables: ${missing.join(', ')}. ` +
      `Please ensure these are set in your .env.local file.`
    )
  }

  return { url, key }
}

export const createClient = async (): Promise<SupabaseClient> => {
  const { url, key } = validateSupabaseEnv()
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: unknown) {
          cookieStore.set({ name, value, ...(options as CookieOptions) })
        },
        remove(name: string, options: unknown) {
          cookieStore.set({ name, value: '', ...(options as CookieOptions) })
        },
      },
    }
  )
}

/**
 * Create server client for API routes and server components
 */
export const createServerClient = createClient

/**
 * Alias for backward compatibility
 */
export const getServerClient = createClient
