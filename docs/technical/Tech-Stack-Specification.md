# MicroSite Forge: Technical Stack Specification

## Document Information
- **Version**: 1.0
- **Date**: September 28, 2025
- **Purpose**: Comprehensive technical specification of all technologies, frameworks, and tools used in MicroSite Forge MVP
- **Scope**: Complete technology stack from frontend to deployment and integrations

## 🏗️ Architecture Overview

MicroSite Forge follows a **serverless-first, API-driven architecture** with the following key characteristics:
- **Frontend**: Single Page Application (SPA) with server-side rendering capabilities
- **Backend**: Serverless functions with managed database services
- **Deployment**: Cloud-native with automated CI/CD pipelines
- **Integrations**: REST API-based with webhook support

## 🎨 Frontend Technologies

### Core Framework
- **Next.js 15** (App Router)
  - Version: `^15.5.4`
  - Purpose: React framework with SSR/SSG capabilities
  - Key Features: App Router, Server Components, Image Optimization
  - Deployment: Vercel platform

### UI & Styling
- **React 18**
  - Version: `^18.3.1`
  - Purpose: Component-based UI library
  - Features: Hooks, Concurrent Features, Suspense

- **Tailwind CSS v3**
  - Version: `^3.0.0`
  - Purpose: Utility-first CSS framework
  - Configuration: JIT mode enabled
  - Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`

- **Headless UI**
  - Version: `^1.7.0`
  - Purpose: Unstyled, accessible UI components
  - Components: Modal, Dropdown, Toggle

- **Radix UI**
  - Version: `^1.0.0`
  - Purpose: Low-level UI primitives
  - Components: Dialog, Tooltip, Select

### State Management & Data Fetching
- **Zustand**
  - Version: `^4.4.0`
  - Purpose: Lightweight state management
  - Features: TypeScript support, persistence middleware

- **SWR**
  - Version: `^2.2.0`
  - Purpose: Data fetching with caching
  - Features: Stale-while-revalidate, automatic revalidation

- **Axios**
  - Version: `^1.5.0`
  - Purpose: HTTP client for API calls
  - Features: Request/response interceptors, automatic JSON parsing

### UI Components & Visualization
- **Chart.js v4**
  - Version: `^4.4.0`
  - Purpose: Data visualization and charts
  - Features: Responsive charts, animations

- **TanStack Table v8**
  - Version: `^8.10.0`
  - Purpose: Headless table library
  - Features: Sorting, filtering, pagination

- **Lucide React**
  - Version: `^0.279.0`
  - Purpose: Icon library
  - Features: Tree-shakable, customizable icons

### Forms & Validation
- **React Hook Form v7**
  - Version: `^7.46.0`
  - Purpose: Form state management
  - Features: Minimal re-renders, built-in validation

- **Zod**
  - Version: `^3.22.0`
  - Purpose: Schema validation
  - Features: TypeScript-first, runtime validation

### Development Tools
- **TypeScript**
  - Version: `^5.6.3`
  - Purpose: Type safety and developer experience
  - Configuration: Strict mode enabled

- **ESLint**
  - Version: `^9.14.0`
  - Purpose: Code linting and formatting
  - Configuration: Next.js recommended rules

- **Prettier**
  - Version: `^3.0.0`
  - Purpose: Code formatting
  - Integration: ESLint integration

## ⚙️ Backend Technologies

### Runtime & Framework
- **Supabase Edge Functions (Deno)**
  - Runtime: Deno v1.37+
  - Purpose: Serverless compute for API endpoints
  - Features: TypeScript native, Web APIs, fast cold starts

### Database & Storage
- **Supabase (PostgreSQL 15)**
  - Version: PostgreSQL 15+
  - Purpose: Primary database with real-time capabilities
  - Features: Row Level Security (RLS), real-time subscriptions
  - Extensions: `uuid-ossp`, `pg_trgm`

- **Supabase Storage**
  - Purpose: File storage for assets and exports
  - Features: CDN integration, automatic optimization

### Authentication & Security
- **Supabase Auth**
  - Purpose: User authentication and authorization
  - Features: JWT tokens, OAuth providers, email verification
  - Session Management: 1-hour JWT expiry with refresh tokens

- **Supabase Vault**
  - Purpose: Encrypted storage for sensitive data
  - Use Cases: API keys, phone numbers, payment tokens

### Queue & Background Processing
- **BullMQ**
  - Version: `^4.12.0`
  - Purpose: Job queue management
  - Features: Retry logic, priority queues, delayed jobs

- **Upstash Redis**
  - Purpose: Serverless Redis for queue storage
  - Features: Automatic scaling, global replication

### Workflow Automation
- **n8n (Self-hosted)**
  - Version: `^1.8.0`
  - Purpose: Workflow automation and orchestration
  - Deployment: Docker on Fly.io
  - Use Cases: Lead qualification, email delivery, integrations

## 🔌 Third-Party Integrations

### AI & Content Generation
- **Grok 4 API (xAI)**
  - Purpose: Niche research and keyword analysis
  - Rate Limits: 100 requests/minute
  - Authentication: API key

- **OpenAI API**
  - Version: GPT-4 Turbo
  - Purpose: Content generation and optimization
  - Rate Limits: Tier-based
  - Authentication: API key

### Communication & Telephony
- **Twilio API v1**
  - Purpose: Phone number management and call routing
  - Features: Programmable Voice, SMS capabilities
  - SDK: Twilio Node.js SDK v4.15+

- **Vapi AI**
  - Purpose: AI-powered call handling and transcription
  - Features: Real-time transcription, call routing

### Email & Notifications
- **SendGrid**
  - Purpose: Transactional email delivery
  - Features: Template engine, delivery analytics
  - Rate Limits: Plan-based

- **Mailgun**
  - Purpose: Email delivery and management
  - Features: Email validation, analytics
  - Alternative to SendGrid

### Payment Processing
- **Stripe API**
  - Version: v2023-08-16
  - Purpose: Payment processing and billing
  - Features: Subscriptions, metered billing, webhooks
  - SDK: Stripe Node.js v13+

### Hosting & Deployment
- **Netlify**
  - Purpose: Static site hosting for microsites
  - Features: Automatic deployments, CDN, SSL
  - Integration: GitHub webhooks

- **Vercel**
  - Purpose: Frontend application hosting
  - Features: Edge functions, automatic scaling
  - Integration: GitHub deployments

### Domain & DNS Management
- **Cloudflare**
  - Purpose: DNS management and CDN
  - Features: SSL certificates, performance optimization
  - API: Cloudflare API v4

- **Porkbun API**
  - Purpose: Domain registration and management
  - Features: Bulk domain operations, DNS management

### SEO & Analytics
- **Google Search Console API**
  - Purpose: SEO data and sitemap submission
  - Authentication: OAuth 2.0
  - Features: Performance data, indexing status

- **Google Analytics 4**
  - Purpose: Website analytics and tracking
  - Integration: gtag.js
  - Features: Event tracking, conversion measurement

- **Bing Webmaster Tools API**
  - Purpose: Bing search engine optimization
  - Features: URL submission, performance data

## 🛠️ Development Tools

### Version Control & CI/CD
- **Git**
  - Platform: GitHub
  - Branching: GitFlow with feature branches
  - Protection: Branch protection rules

- **GitHub Actions**
  - Purpose: Continuous integration and deployment
  - Workflows: Test, build, deploy
  - Environments: Staging, production

### Testing Framework
- **Jest**
  - Version: `^29.7.0`
  - Purpose: Unit and integration testing
  - Coverage: 80% minimum requirement

- **React Testing Library**
  - Version: `^13.4.0`
  - Purpose: Component testing
  - Philosophy: Testing user interactions

- **Playwright**
  - Version: `^1.38.0`
  - Purpose: End-to-end testing
  - Features: Cross-browser testing, visual regression

### Code Quality
- **Husky**
  - Version: `^8.0.0`
  - Purpose: Git hooks for code quality
  - Hooks: Pre-commit linting, pre-push testing

- **lint-staged**
  - Version: `^14.0.0`
  - Purpose: Run linters on staged files
  - Integration: Husky pre-commit hooks

### Documentation
- **Storybook v7**
  - Version: `^7.4.0`
  - Purpose: Component documentation and testing
  - Features: Interactive component explorer

## 📦 Package Management

### Node.js Ecosystem
- **Node.js**: v20.6+ (LTS)
- **npm**: v9.8+ (package manager)
- **Package Lock**: npm lockfile v3

### Dependency Management
- **Production Dependencies**: Locked versions in package.json
- **Development Dependencies**: Latest compatible versions
- **Security**: Regular dependency audits with npm audit

## 🚀 Deployment Architecture

### Frontend Deployment
- **Platform**: Vercel
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment**: Node.js 20.x

### Backend Deployment
- **Platform**: Supabase (managed)
- **Functions**: Deployed via Supabase CLI
- **Database**: Managed PostgreSQL instance

### Static Sites (Microsites)
- **Platform**: Netlify
- **Generator**: Hugo v0.111.3
- **Build Command**: `hugo --gc --minify`
- **Deploy**: Automated via GitHub webhooks

## 🔒 Security & Compliance

### Data Protection
- **Encryption**: AES-256 for data at rest
- **Transport**: TLS 1.3 for data in transit
- **Key Management**: Supabase Vault for sensitive data

### Authentication
- **JWT**: RS256 algorithm
- **Session Management**: Secure httpOnly cookies
- **Rate Limiting**: 100 requests/minute per user

### Compliance
- **GDPR**: Data export and deletion capabilities
- **SOC 2**: Basic compliance through Supabase
- **PCI DSS**: Handled by Stripe for payment processing

## 📊 Monitoring & Analytics

### Application Monitoring
- **Sentry**
  - Purpose: Error tracking and performance monitoring
  - Features: Real-time alerts, performance insights

- **Supabase Analytics**
  - Purpose: Database query performance
  - Features: Query optimization, usage metrics

### Business Analytics
- **PostHog**
  - Purpose: Product analytics and feature flags
  - Features: Event tracking, user journeys

## 🔄 Version Requirements Summary

| Technology | Minimum Version | Recommended | Purpose |
|------------|----------------|-------------|---------|
| Node.js | 20.6.0 | 20.8.0 | Runtime |
| Next.js | 15.5.4 | 15.5.4 | Frontend Framework |
| React | 18.3.1 | 18.3.1 | UI Library |
| TypeScript | 5.6.3 | 5.6.3 | Type Safety |
| PostgreSQL | 15.0 | 15.4 | Database |
| Hugo | 0.111.3 | 0.111.3 | Static Site Generator |

---

*This document is maintained alongside the codebase and updated with each major release.*
