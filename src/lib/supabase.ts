import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../types/supabase'

export const createClient = () =>
  createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

// For backwards compatibility, export a browser client
export const supabase = createClient()

// Server-side client for API routes with service role for database operations
let client: ReturnType<typeof createSupabaseClient> | null = null
let configError: string | null = null

export function getSupabaseClient(): ReturnType<typeof createSupabaseClient> | null {
  if (configError) return null

  if (!client) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      configError = 'Missing Supabase configuration (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)'
      return null
    }

    client = createSupabaseClient(url, key)
  }

  return client
}

export function getSupabaseConfigError(): string | null {
  return configError
}
