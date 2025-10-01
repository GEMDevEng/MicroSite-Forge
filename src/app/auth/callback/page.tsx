'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient()

        // Check for hash parameters (OAuth redirect)
        const url = new URL(window.location.href)
        const hash = url.hash.substring(1) // Remove the '#'

        if (hash) {
          // Parse hash parameters
          const params = new URLSearchParams(hash)
          const accessToken = params.get('access_token')
          const refreshToken = params.get('refresh_token')

          if (accessToken && refreshToken) {
            // Set the session using the tokens from hash
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (error) {
              console.error('Session set error:', error)
              router.push('/auth/login?error=session_error')
              return
            }

            // Clear hash from URL
            window.history.replaceState({}, document.title, window.location.pathname)

            // Redirect to dashboard
            router.push('/dashboard')
            return
          }
        }

        // Fallback: try to get session normally (for code exchange routes)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=callback_error')
          return
        }

        if (data.session) {
          router.push('/dashboard')
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
