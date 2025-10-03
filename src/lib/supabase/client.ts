import { createBrowserClient } from '@supabase/ssr'

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

export const createClient = () => {
  const { url, key } = validateSupabaseEnv()
  return createBrowserClient(url, key)
}
