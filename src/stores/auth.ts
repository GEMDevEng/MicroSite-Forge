import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: { email?: string; password?: string }) => Promise<void>
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      initialized: false,

      initialize: async () => {
        try {
          set({ loading: true })
          
          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Error getting session:', error)
            return
          }

          set({ 
            session, 
            user: session?.user ?? null,
            initialized: true 
          })

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email)
            
            set({ 
              session, 
              user: session?.user ?? null 
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
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            throw error
          }

          set({ 
            user: data.user, 
            session: data.session 
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
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            throw error
          }

          // Note: User will need to confirm email before being fully signed in
          if (data.user && !data.session) {
            // Email confirmation required
            return
          }

          set({ 
            user: data.user, 
            session: data.session 
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
          
          const { error } = await supabase.auth.signOut()
          
          if (error) {
            throw error
          }

          set({ 
            user: null, 
            session: null 
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

      updateProfile: async (data: { email?: string; password?: string }) => {
        try {
          set({ loading: true })
          
          const { error } = await supabase.auth.updateUser(data)
          
          if (error) {
            throw error
          }

          // Refresh user data
          const { data: { user } } = await supabase.auth.getUser()
          set({ user })
        } catch (error) {
          console.error('Update profile error:', error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        initialized: state.initialized 
      }),
    }
  )
)
