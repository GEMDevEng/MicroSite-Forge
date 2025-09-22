import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database'

export const createClient = () => createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Server-side client for API routes
export const createServerClient = () => {
  const cookieStore = cookies();
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value || '', options),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove: (name, options) => cookieStore.delete(name),
      },
    }
  );
}

// For backwards compatibility, export a browser client
export const supabase = createClient()
