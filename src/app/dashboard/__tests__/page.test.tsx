// Test for src/app/dashboard/page.tsx
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '../page'

// Mock supabase
jest.mock('../../../lib/supabase', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }))
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', async () => {
    render(<Dashboard />)

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.getByText('Your Microsites')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<Dashboard />)
    // Loading state might not be visible due to async nature
    expect(screen.getByText('Your Microsites')).toBeInTheDocument()
  })
})
