// Test for src/app/dashboard/page.tsx
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '../page'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock the auth store
jest.mock('../../../stores/auth', () => ({
  useAuthStore: jest.fn(() => ({
    user: { email: 'test@example.com' },
    signOut: jest.fn(),
    loading: false,
    initialized: true,
    initialize: jest.fn()
  }))
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard when user is authenticated', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/MicroSite Forge/)).toBeInTheDocument()
    })

    expect(screen.getByText(/Welcome, test@example\.com/)).toBeInTheDocument()
  })

  it('renders loading state when not initialized', () => {
    // Mock for loading state
    jest.mocked(require('../../../stores/auth')).useAuthStore.mockReturnValueOnce({
      user: null,
      signOut: jest.fn(),
      loading: true,
      initialized: false,
      initialize: jest.fn()
    })

    render(<Dashboard />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
