import 'whatwg-fetch'
import '@testing-library/jest-dom'

// Enable fetch mocking in tests
require('jest-fetch-mock').enableMocks()

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  },
}))

// Mock fetch with specific handlers for different endpoints
global.fetch = jest.fn((url) => {
  if (url.includes('/api/analytics')) {
    // Return mock analytics data matching the expected structure
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        overview: {
          totalSites: 0,
          totalLeads: 0,
          totalRevenue: 0,
          conversionRate: 0
        }
      })
    })
  }

  // Default mock for other endpoints
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] })
  })
})

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

// Set API keys to empty to prevent real API calls during tests
process.env.OPENAI_API_KEY = ''
process.env.GROK_API_KEY = ''
