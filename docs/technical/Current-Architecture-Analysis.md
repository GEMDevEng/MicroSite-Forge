# MicroSite Forge - Current Architecture Analysis

## 📋 Executive Summary

This document provides a comprehensive analysis of the current MicroSite Forge codebase architecture, identifying major components, their organization, and relationships. The analysis reveals a well-structured Next.js 15 application with TypeScript, following modern React patterns and best practices.

## 🏗️ Project Structure Overview

### Root Directory Structure
```
MicroSite-Forge/
├── docs/                    # Comprehensive documentation
├── src/                     # Source code
├── supabase/               # Database migrations and config
├── tests/                  # E2E tests (Playwright)
├── scripts/                # Build and utility scripts
├── .github/workflows/      # CI/CD pipelines
└── configuration files     # Next.js, TypeScript, ESLint, etc.
```

## 🎯 Core Architecture Components

### 1. Frontend Architecture (Next.js 15 App Router)

#### **Pages & Routing** (`src/app/`)
```
src/app/
├── page.tsx                # Landing page
├── layout.tsx              # Root layout with providers
├── auth/                   # Authentication pages
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── callback/page.tsx
├── dashboard/              # Main application dashboard
│   ├── overview/page.tsx
│   ├── sites/page.tsx
│   └── leads/page.tsx
├── analytics/page.tsx      # Analytics dashboard
├── billing/page.tsx        # Billing management
├── campaigns/page.tsx      # Campaign management
├── profile/page.tsx        # User profile
└── api/                    # API routes (detailed below)
```

#### **Component Architecture** (`src/components/`)
Following atomic design principles:

**Atoms (Base UI Components)**
- `ui/button.tsx` - Configurable button with variants and loading states
- `ui/input.tsx` - Form input with validation styling
- `ui/label.tsx` - Form labels
- `ui/textarea.tsx` - Multi-line text input
- `ui/dialog.tsx` - Modal dialog system

**Molecules (Composite Components)**
- `forms/auth-form.tsx` - Authentication form with validation
- `charts/` - Chart.js wrappers for analytics

**Organisms (Complex Components)**
- `dashboard/` - Dashboard-specific components
- `leads/lead-management-dashboard.tsx` - Complete lead management interface
- `layout/` - Layout components (header, sidebar, footer)
- `providers/auth-provider.tsx` - Authentication context provider

### 2. API Architecture (`src/app/api/`)

#### **Authentication & User Management**
- `auth/callback/route.ts` - OAuth callback handler
- `user/profile/route.ts` - User profile CRUD operations

#### **Core Business Logic APIs**
- `research/route.ts` - AI-powered niche research with domain checking
- `content/route.ts` - Content generation using OpenAI
- `sites/route.ts` - Site management (CRUD operations)
- `sites/generate/route.ts` - End-to-end site generation workflow
- `sites/[id]/route.ts` - Individual site operations

#### **Lead Management**
- `leads/route.ts` - Lead capture and management
- `leads/[id]/route.ts` - Individual lead operations
- `leads/enrich/route.ts` - Lead enrichment services

#### **Analytics & Reporting**
- `analytics/route.ts` - Analytics data and report generation
- `jobs/route.ts` - Background job management

#### **Billing & Campaigns**
- `billing/route.ts` - Payment processing
- `campaigns/route.ts` - Marketing campaign management

### 3. Utility Libraries (`src/lib/`)

#### **Core Infrastructure**
- `supabase.ts` & `supabase-server.ts` - Database client configuration
- `utils.ts` - Common utility functions (formatting, validation, etc.)
- `logger.ts` - Comprehensive logging system with multiple levels
- `validations.ts` - Zod schemas for data validation
- `middleware.ts` - Request middleware and authentication

#### **External Service Integrations**
- `openai.ts` - AI content generation and validation
- `grok.ts` - Niche research and keyword analysis
- `github.ts` - Repository management and Hugo integration
- `netlify.ts` - Automated deployment services
- `porkbun.ts` - Domain availability checking
- `payment-gateway.ts` - Payment processing abstraction

#### **Business Logic**
- `lead-manager.ts` - Lead scoring and management logic
- `analytics.ts` - Analytics data processing and reporting
- `communication.ts` - Email and SMS communication templates
- `rate-limit.ts` - API rate limiting implementation

### 4. State Management (`src/stores/`)

#### **Zustand Stores**
- `auth.ts` - Authentication state management
  - User session management
  - Login/logout functionality
  - Authentication status tracking

### 5. Type Definitions (`src/types/`)

#### **Database Types**
- `database.types.ts` - Auto-generated Supabase types
- `database.ts` - Custom database type extensions
- `supabase.ts` - Supabase-specific type definitions
- `leads.ts` - Lead-specific type definitions

### 6. Testing Infrastructure

#### **Unit Testing**
- Jest + React Testing Library setup
- Component tests in `src/components/ui/__tests__/`
- Utility function tests in `src/lib/__tests__/`

#### **E2E Testing**
- Playwright configuration
- Test files in `tests/e2e/`
- Homepage and authentication flow tests

## 🔄 Data Flow Architecture

### Request Flow
1. **Client Request** → Next.js App Router
2. **Authentication** → Supabase Auth middleware
3. **API Route** → Business logic in `src/lib/`
4. **External APIs** → OpenAI, Grok, GitHub, Netlify
5. **Database** → Supabase Postgres with RLS
6. **Response** → JSON API response

### State Management Flow
1. **Zustand Stores** → Global state management
2. **SWR** → Data fetching and caching
3. **Supabase Realtime** → Live updates
4. **React Hook Form** → Form state management

## 🛠️ Technology Stack Summary

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: Radix UI primitives
- **State**: Zustand + SWR
- **Forms**: React Hook Form + Zod validation
- **Charts**: Chart.js v4

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API routes
- **File Storage**: Supabase Storage

### External Integrations
- **AI**: OpenAI GPT-4, Grok API
- **Deployment**: Netlify, Vercel
- **Version Control**: GitHub
- **Domains**: Porkbun
- **Communication**: Twilio (planned)
- **Payments**: Stripe (planned)

### Development Tools
- **Testing**: Jest, React Testing Library, Playwright
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Type Safety**: TypeScript strict mode
- **Git Hooks**: Husky + lint-staged

## 📊 Database Schema

### Core Tables
- **users** - User profiles and settings
- **sites** - Generated microsites
- **leads** - Captured leads with scoring
- **jobs** - Background job queue
- **communications** - Email/SMS templates and logs

### Key Features
- Row Level Security (RLS) policies
- UUID primary keys
- Timestamp tracking
- JSONB fields for flexible data
- Proper foreign key relationships

## 🔒 Security Implementation

### Authentication
- Supabase Auth with JWT tokens
- OAuth providers (Google, GitHub)
- Session management
- Protected API routes

### Data Security
- Row Level Security policies
- Environment variable management
- HTTPS enforcement
- CORS configuration

## 📈 Performance Considerations

### Frontend Optimization
- Next.js App Router for SSR/SSG
- Image optimization
- Code splitting
- Tailwind CSS JIT compilation

### Backend Optimization
- Database indexing
- Query optimization
- Caching strategies
- Rate limiting

## 🎯 Current Implementation Status

### ✅ Completed Features
- Authentication system
- Basic dashboard structure
- API route framework
- Database schema
- UI component library
- Testing setup
- CI/CD pipeline

### 🚧 In Progress
- Lead management system
- Site generation workflow
- Analytics dashboard
- External API integrations

### 📋 Planned Features
- Billing integration
- Campaign management
- Advanced analytics
- Workflow automation
