import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../types/supabase'

// Create a Supabase client that has access to server-side cookies
export function createClient() {
  const cookieStore = cookies() as any

  // If you need to log cookies (just for debugging):
  cookieStore.getAll().forEach(({ name, value }: { name: string; value: string }) => {
    console.log(`Cookie: ${name}=${value}`)
  })

  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
}
