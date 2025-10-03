import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  mfaEnabled: boolean
  mfaFactors: unknown[]
  mfaChallenge: unknown | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: { email?: string; password?: string }) => Promise<void>
  // MFA methods
  enableMFA: (friendlyName?: string) => Promise<{ qr_code_url: string; secret: string; uri: string }>
  verifyMFA: (factorId: string, code: string) => Promise<void>
  verifyMFAChallenge: (factorId: string, code: string) => Promise<void>
  listMFATickets: () => Promise<void>
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setMFAEnabled: (enabled: boolean) => void
  setMFATickets: (tickets: unknown[]) => void
  setMFAChallenge: (challenge: unknown | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      session: null,
      mfaEnabled: false,
      mfaFactors: [],
      mfaChallenge: null,
      loading: false,
      initialized: false,

      initialize: async () => {
        try {
          set({ loading: true })

          const supabase = createClient()
          // Get initial session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            console.error('Error getting session:', error)
            return
          }

          set({
            session,
            user: session?.user ?? null,
            initialized: true,
          })

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email)

            set({
              session,
              user: session?.user ?? null,
            })

            // Handle sign out
            if (event === 'SIGNED_OUT') {
              set({ user: null, session: null })
            }
          })
        } catch (error) {
          console.error('Error initializing auth:', error)
        } finally {
          set({ loading: false })
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true })

          const supabase = createClient()
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            // Improve error message for OAuth users trying email/password
            if (
              error.message === 'Invalid login credentials' ||
              error.message.includes('Email not confirmed')
            ) {
              throw new Error(
                'Invalid email or password. If you signed up with Google, use the "Continue with Google" button instead.'
              )
            }
            throw error
          }

          set({
            user: data.user,
            session: data.session,
          })
        } catch (error) {
          console.error('Sign in error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ loading: true })

          const supabase = createClient()
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            // Improved error message for existing OAuth users
            if (error.message === 'User already registered') {
              throw new Error(
                'An account with this email already exists. If you signed up with Google, use "Continue with Google" instead.'
              )
            }
            throw error
          }

          // Note: User will need to confirm email before being fully signed in
          if (data.user && !data.session) {
            // Email confirmation required
            return
          }

          set({
            user: data.user,
            session: data.session,
          })
        } catch (error) {
          console.error('Sign up error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        try {
          set({ loading: true })

          const supabase = createClient()
          const { error } = await supabase.auth.signOut()

          if (error) {
            throw error
          }

          set({
            user: null,
            session: null,
          })
        } catch (error) {
          console.error('Sign out error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ loading: true })

          const supabase = createClient()
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          })

          if (error) {
            throw error
          }
        } catch (error) {
          console.error('Reset password error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ loading: true })

          const supabase = createClient()
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            throw error
          }

          // OAuth popup will handle the auth flow
        } catch (error) {
          console.error('Google sign in error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      signInWithFacebook: async () => {
        try {
          set({ loading: true })

          const supabase = createClient()
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            throw error
          }

          // OAuth popup will handle the auth flow
        } catch (error) {
          console.error('Facebook sign in error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      signInWithGithub: async () => {
        try {
          set({ loading: true })

          const supabase = createClient()
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            throw error
          }

          // OAuth popup will handle the auth flow
        } catch (error) {
          console.error('GitHub sign in error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      updateProfile: async (data: { email?: string; password?: string }) => {
        try {
          set({ loading: true })

          const supabase = createClient()
          const { error } = await supabase.auth.updateUser(data)

          if (error) {
            throw error
          }

          // Refresh user data
          const {
            data: { user },
          } = await supabase.auth.getUser()
          set({ user })
        } catch (error) {
          console.error('Update profile error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      // MFA methods
      enableMFA: async (friendlyName = 'Authenticator App') => {
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName,
          })

          if (error) {
            throw error
          }

          set({
            mfaChallenge: data
          })

          return {
            qr_code_url: data.totp.qr_code,
            secret: data.totp.secret,
            uri: data.totp.uri
          }
        } catch (error) {
          console.error('MFA enrollment error:', error)
          throw error
        }
      },

      verifyMFA: async (factorId: string, code: string) => {
        try {
          const supabase = createClient()
          const challenge = _get().mfaChallenge
          if (!challenge) {
            throw new Error('No MFA challenge found. Please enroll first.')
          }

          const { error } = await supabase.auth.mfa.verify({
            factorId,
            code,
            challengeId: challenge.id,
          })

          if (error) {
            throw error
          }

          set({
            mfaEnabled: true,
            mfaChallenge: null
          })
        } catch (error) {
          console.error('MFA verification error:', error)
          throw error
        }
      },

      verifyMFAChallenge: async (factorId: string, code: string) => {
        try {
          const supabase = createClient()
          const { error } = await supabase.auth.mfa.challengeAndVerify({
            factorId,
            code,
          })

          if (error) {
            throw error
          }

          set({
            mfaEnabled: true
          })
        } catch (error) {
          console.error('MFA challenge verification error:', error)
          throw error
        }
      },

      listMFATickets: async () => {
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.mfa.listFactors()

          if (error) {
            throw error
          }

          set({
            mfaFactors: data.totp || [],
            mfaEnabled: data.totp?.some(f => f.status === 'verified') || false
          })
        } catch (error) {
          console.error('List MFA factors error:', error)
          throw error
        }
      },

      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setMFAEnabled: (mfaEnabled: boolean) => set({ mfaEnabled }),
  setMFATickets: (mfaFactors: unknown[]) => set({ mfaFactors }),
  setMFAChallenge: (mfaChallenge: unknown | null) => set({ mfaChallenge }),
      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        initialized: state.initialized,
      }),
    }
  )
)
