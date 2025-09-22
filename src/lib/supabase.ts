import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Skip validation in test environment to allow mocking
  if (process.env.NODE_ENV !== 'test' && (!supabaseUrl || !supabaseAnonKey)) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Skip validation in test environment to allow mocking
  if (process.env.NODE_ENV !== 'test' && (!supabaseUrl || !supabaseServiceKey)) {
    throw new Error('Missing Supabase service role key')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// For backwards compatibility, export a browser client
export const supabase = createClient()
