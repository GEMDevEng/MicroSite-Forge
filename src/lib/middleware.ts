import { getServerClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function createMiddlewareClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = await getServerClient()

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { supabase, session, response }
}

export function requireAuth(
  callback: (request: NextRequest, session: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const { session } = await createMiddlewareClient(request)

    if (!session) {
      // Redirect to sign in page
      const signInUrl = new URL('/auth/login', request.url)
      signInUrl.searchParams.set('redirect', request.url)
      return NextResponse.redirect(signInUrl)
    }

    return callback(request, session)
  }
}
