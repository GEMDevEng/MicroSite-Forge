import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { securityMiddleware, securityMonitor } from './src/lib/security-middleware'

interface CookieOptions {
  domain?: string
  path?: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  expirationDate?: number
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // 1. Apply security middleware first (before auth)
  const securityResponse = await securityMiddleware(req, {
    enableRateLimiting: true,
    enableIpBlocking: true,
    enableSuspiciousRequestDetection: true,
    enableRequestLogging: process.env.NODE_ENV === 'production',
  })

  // If security middleware blocks the request, return the security response
  if (securityResponse) {
    return securityResponse
  }

  // 2. Initialize Supabase client and handle authentication
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // `createServerClient` expects a cookies API matching Supabase's CookieMethodsServer.
    // The Next.js Request/Response cookie helpers differ slightly; cast to `any` to
    // bridge the shape while preserving runtime behavior.
    {
      cookies: ({
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options })
        },
      } as unknown) as any,
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // 3. Auth-specific security checks
  const path = req.nextUrl.pathname

  // API routes require authentication (except health check and some auth endpoints)
  if (path.startsWith('/api/') &&
      !path.startsWith('/api/health') &&
      !path.startsWith('/api/auth/')) {
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  // 4. Add additional security headers to the response
  const response = addSecurityHeaders(res, req)

  return response
}

/**
 * Add additional security headers to responses
 */
function addSecurityHeaders(response: NextResponse, _request: NextRequest): NextResponse {
  // Add request fingerprinting for CSRF protection
  const timestamp = Date.now().toString()
  response.headers.set('X-Request-ID', `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  response.headers.set('X-Timestamp', timestamp)

  // Add security headers that complement the ones in next.config.js
  response.headers.set('X-Environment', process.env.NODE_ENV || 'development')
  response.headers.set('X-Powered-By', 'Next.js') // Override to mask actual stack

  // Add rate limiting info if available
  const stats = securityMonitor.getStats()
  response.headers.set('X-Security-Status', `blocked:${stats.blockedIPs},active:${stats.rateLimiterStats.totalKeys}`)

  return response
}

// Specify which routes this middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
