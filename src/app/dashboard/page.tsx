'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const { user, signOut, loading, initialized, initialize } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, initialized, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 MicroSite Forge
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Welcome to MicroSite Forge Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Your AI-powered microsite factory is ready to go!
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold text-gray-900">Sites Created</h3>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold text-gray-900">Leads Generated</h3>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold text-gray-900">Revenue</h3>
                  <p className="text-2xl font-bold text-purple-600">$0</p>
                </div>
              </div>
              <div className="mt-6">
                <Button size="lg">
                  Create Your First Microsite
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
