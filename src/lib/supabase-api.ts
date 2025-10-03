import { createClient } from '@supabase/supabase-js'

/**
 * Validate required Supabase environment variables for API routes
 */
function validateSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    const missing = []
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    
    throw new Error(
      `Missing required Supabase environment variables: ${missing.join(', ')}. ` +
      `Please ensure these are set in your .env.local file.`
    )
  }

  return { url, serviceKey }
}

/**
 * Create a Supabase client with service role for API routes
 * This should only be used in API routes, never in client-side code
 */
export function createServiceClient() {
  const { url, serviceKey } = validateSupabaseEnv()
  
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

