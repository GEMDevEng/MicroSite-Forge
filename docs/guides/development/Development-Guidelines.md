# Development Guidelines

This document outlines the development standards, best practices, and guidelines for contributing to MicroSite Forge.

## 🏗️ Project Architecture

### Frontend Architecture (Next.js)
```
frontend/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components
│   ├── forms/             # Form components
│   └── charts/            # Chart components
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── styles/                # Global styles and Tailwind config
└── public/                # Static assets
```

### Backend Architecture (Supabase)
```
backend/
├── supabase/
│   ├── functions/         # Edge Functions (Deno)
│   ├── migrations/        # Database migrations
│   └── config.toml        # Supabase configuration
├── database/
│   ├── schema.sql         # Database schema
│   └── seed.sql           # Seed data
└── workflows/
    └── n8n/               # Workflow definitions
```

## 🎨 Frontend Development

### Component Structure
```typescript
// components/ui/Button.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
```

### State Management with Zustand
```typescript
// stores/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      
      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Authentication logic
          const user = await authService.signIn(email, password)
          set({ user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      signOut: () => {
        set({ user: null })
        authService.signOut()
      },
      
      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...userData } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
```

### API Integration with SWR
```typescript
// hooks/useSites.ts
import useSWR from 'swr'
import { apiClient } from '@/lib/api'

interface Site {
  id: string
  name: string
  domain: string
  status: 'pending' | 'live' | 'error'
  leads_count: number
}

export function useSites() {
  const { data, error, mutate } = useSWR<Site[]>('/api/sites', apiClient.get)
  
  return {
    sites: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

export function useSite(id: string) {
  const { data, error, mutate } = useSWR<Site>(
    id ? `/api/sites/${id}` : null,
    apiClient.get
  )
  
  return {
    site: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
```

## ⚙️ Backend Development

### Edge Function Structure
```typescript
// supabase/functions/batch-launch/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface LaunchRequest {
  csvData: string
  templateId: string
}

serve(async (req) => {
  try {
    // CORS handling
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Authentication
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Request processing
    const { csvData, templateId }: LaunchRequest = await req.json()
    
    // Validation
    if (!csvData || !templateId) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Business logic
    const jobId = await queueBatchLaunch(user.id, csvData, templateId)
    
    return new Response(
      JSON.stringify({ jobId, status: 'queued' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### Database Schema Design
```sql
-- Database schema with RLS policies
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  stripe_id TEXT,
  twilio_sid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  status TEXT CHECK (status IN ('pending', 'live', 'error')) DEFAULT 'pending',
  github_repo TEXT,
  netlify_url TEXT,
  leads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own sites" ON sites
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_created_at ON sites(created_at DESC);
```

## 🧪 Testing Standards

### Unit Testing with Jest
```typescript
// components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies correct variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-secondary')
  })
})
```

### Integration Testing
```typescript
// tests/api/sites.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/sites'
import { createTestUser, cleanupTestData } from '@/tests/helpers'

describe('/api/sites', () => {
  let testUser: any

  beforeEach(async () => {
    testUser = await createTestUser()
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  it('returns user sites', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: `Bearer ${testUser.token}`,
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(Array.isArray(data.sites)).toBe(true)
  })

  it('requires authentication', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
  })
})
```

### E2E Testing with Playwright
```typescript
// tests/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Onboarding', () => {
  test('complete onboarding flow', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup')
    
    // Fill signup form
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="signup-button"]')
    
    // Verify redirect to integrations
    await expect(page).toHaveURL('/integrations')
    
    // Complete integrations setup
    await page.click('[data-testid="connect-stripe"]')
    // ... integration steps
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible()
  })
})
```

## 🔧 Code Quality

### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

### Prettier Configuration
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Husky Git Hooks
```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{md,json}": [
      "prettier --write"
    ]
  }
}
```

## 📝 Documentation Standards

### Component Documentation
```typescript
/**
 * Button component with multiple variants and states
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export interface ButtonProps {
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Loading state */
  loading?: boolean
  /** Click handler */
  onClick?: () => void
}
```

### API Documentation
```typescript
/**
 * Batch launch sites endpoint
 * 
 * @route POST /api/sites/batch-launch
 * @param {string} csvData - CSV data with service/location pairs
 * @param {string} templateId - Hugo template identifier
 * @returns {Promise<{jobId: string, status: string}>} Job information
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/sites/batch-launch', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     csvData: 'service,location\nEpoxy,Phoenix',
 *     templateId: 'hugo-default'
 *   })
 * })
 * ```
 */
```

## 🚀 Performance Guidelines

### Frontend Performance
- **Bundle Size**: Keep main bundle under 200KB gzipped
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Lazy load non-critical components

### Backend Performance
- **API Response Time**: <200ms for 95th percentile
- **Database Queries**: Use indexes and optimize N+1 queries
- **Caching**: Implement Redis caching for frequent queries
- **Rate Limiting**: 100 requests/minute per user

## 🔒 Security Guidelines

### Frontend Security
- **XSS Prevention**: Sanitize user inputs
- **CSRF Protection**: Use Next.js built-in CSRF protection
- **Content Security Policy**: Implement strict CSP headers
- **Authentication**: Secure token storage and handling

### Backend Security
- **Input Validation**: Validate all inputs with Zod schemas
- **SQL Injection**: Use parameterized queries
- **Rate Limiting**: Implement per-endpoint rate limits
- **Encryption**: Encrypt sensitive data at rest

---

These guidelines ensure consistent, high-quality code across the MicroSite Forge project. Please follow these standards when contributing to maintain code quality and project integrity.
