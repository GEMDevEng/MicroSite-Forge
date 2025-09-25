import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../types/supabase'

/**
 * Create a Supabase client configured for server-side usage.
 * Reads cookies from Next.js headers API.
 */
export function createClient() {
  const cookieStore = cookies(); // ✅ not async, returns ReadonlyRequestCookies

  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}

/**
 * Alias for backward compatibility
 */
export const createServerClient = createClient;
