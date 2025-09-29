import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
      const supabase = await createServerClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
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
            // Create new user profile
            await supabase.from('users').insert({
              id: user.id,
              email: user.email!,
            })
          }
        }

        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        return NextResponse.redirect(`${isLocalEnv ? origin : `https://${forwardedHost}`}${next}`)
      }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/auth-code-error`)
  }
}
