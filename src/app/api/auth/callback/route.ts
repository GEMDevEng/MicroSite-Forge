import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    console.log('[Auth Callback] Processing callback with code:', code ? 'present' : 'missing')

    if (!code) {
      console.error('[Auth Callback] No code provided in callback')
      return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
    }

    const supabase = await createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Code exchange error:', error.message)
      return NextResponse.redirect(`${origin}/auth/login?error=code_exchange_failed`)
    }

    if (!data.session) {
      console.error('[Auth Callback] No session created after code exchange')
      return NextResponse.redirect(`${origin}/auth/login?error=no_session`)
    }

    console.log('[Auth Callback] Session created for user:', data.user?.email)

    // Create user profile if it doesn't exist
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        console.log('[Auth Callback] Creating new user profile for:', user.email)
        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email!,
        })

        if (insertError) {
          console.error('[Auth Callback] Error creating user profile:', insertError.message)
          // Don't fail the auth flow, just log the error
        }
      } else {
        console.log('[Auth Callback] User profile already exists for:', user.email)
      }
    }

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const redirectUrl = `${isLocalEnv ? origin : `https://${forwardedHost}`}${next}`

    console.log('[Auth Callback] Redirecting to:', redirectUrl)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('[Auth Callback] Unexpected error:', error)
    const origin = new URL(request.url).origin
    return NextResponse.redirect(`${origin}/auth/login?error=unexpected_error`)
  }
}
