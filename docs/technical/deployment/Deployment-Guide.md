# Deployment Guide

This guide covers the deployment process for MicroSite Forge across different environments and platforms.

## 🏗️ Deployment Architecture

### Production Environment
- **Frontend**: Vercel (Next.js application)
- **Backend**: Supabase (managed PostgreSQL + Edge Functions)
- **Microsites**: Netlify (Hugo static sites)
- **Monitoring**: Sentry + Supabase Analytics
- **CDN**: Cloudflare for DNS and performance

### Staging Environment
- **Frontend**: Vercel Preview Deployments
- **Backend**: Supabase staging project
- **Microsites**: Netlify branch deployments
- **Testing**: Automated testing pipeline

## 🚀 Frontend Deployment (Vercel)

### Initial Setup
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and link project
   vercel login
   vercel link
   ```

2. **Environment Variables**
   ```bash
   # Set production environment variables
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   vercel env add OPENAI_API_KEY production
   vercel env add STRIPE_SECRET_KEY production
   ```

3. **Deployment Configuration**
   ```json
   // vercel.json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 30
       }
     },
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           {
             "key": "Access-Control-Allow-Origin",
             "value": "*"
           },
           {
             "key": "Access-Control-Allow-Methods",
             "value": "GET, POST, PUT, DELETE, OPTIONS"
           }
         ]
       }
     ]
   }
   ```

### Deployment Process
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls
```

## ⚙️ Backend Deployment (Supabase)

### Project Setup
1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Initialize project
   supabase init
   
   # Link to remote project
   supabase link --project-ref your-project-ref
   ```

2. **Database Migrations**
   ```bash
   # Create migration
   supabase migration new initial_schema
   
   # Apply migrations
   supabase db push
   
   # Reset database (development only)
   supabase db reset
   ```

3. **Edge Functions Deployment**
   ```bash
   # Deploy all functions
   supabase functions deploy
   
   # Deploy specific function
   supabase functions deploy batch-launch
   
   # Set function secrets
   supabase secrets set OPENAI_API_KEY=your_key
   supabase secrets set TWILIO_AUTH_TOKEN=your_token
   ```

### Database Schema
```sql
-- migrations/20231218000000_initial_schema.sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  stripe_id TEXT,
  twilio_sid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sites table
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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sites" ON sites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sites" ON sites
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_created_at ON sites(created_at DESC);
```

## 🌐 Microsite Deployment (Netlify)

### Hugo Template Repository
1. **Repository Structure**
   ```
   microsite-template/
   ├── archetypes/
   │   └── default.md
   ├── content/
   │   └── _index.md
   ├── layouts/
   │   ├── _default/
   │   │   ├── baseof.html
   │   │   ├── single.html
   │   │   └── list.html
   │   └── partials/
   │       ├── header.html
   │       ├── footer.html
   │       └── form.html
   ├── static/
   │   └── css/
   │       └── style.css
   ├── config.toml
   └── netlify.toml
   ```

2. **Netlify Configuration**
   ```toml
   # netlify.toml
   [build]
     publish = "public"
     command = "hugo --gc --minify"

   [context.production.environment]
     HUGO_VERSION = "0.111.3"
     HUGO_ENV = "production"

   [context.deploy-preview.environment]
     HUGO_VERSION = "0.111.3"

   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
   ```

3. **Automated Deployment**
   ```yaml
   # .github/workflows/deploy-microsites.yml
   name: Deploy Microsites
   
   on:
     push:
       branches: [main]
       paths: ['content/**']
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Hugo
           uses: peaceiris/actions-hugo@v3
           with:
             hugo-version: '0.111.3'
             extended: true
         
         - name: Build
           run: hugo --gc --minify
         
         - name: Deploy to Netlify
           uses: nwtgck/actions-netlify@v2
           with:
             publish-dir: ./public
             production-branch: main
             github-token: ${{ secrets.GITHUB_TOKEN }}
           env:
             NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
             NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          PLAYWRIGHT_BROWSERS_PATH: 0

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Deploy Supabase Functions
        run: |
          npm install -g supabase
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## 📊 Monitoring & Observability

### Sentry Configuration
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yourapp\.vercel\.app/],
    }),
  ],
})
```

### Health Checks
```typescript
// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check database connection
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      throw new Error('Database connection failed')
    }
    
    // Check external services
    const checks = {
      database: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || 'unknown',
    }
    
    res.status(200).json(checks)
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
```

## 🔒 Security Configuration

### Environment Variables
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SENTRY_DSN=your_sentry_dsn
```

### Security Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## 🚨 Rollback Procedures

### Frontend Rollback
```bash
# Rollback to previous deployment
vercel rollback

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Backend Rollback
```bash
# Rollback database migration
supabase migration repair --status reverted

# Rollback Edge Function
supabase functions deploy [function-name] --import-map import_map.json
```

### Emergency Procedures
1. **Immediate Response**: Disable problematic features via feature flags
2. **Communication**: Update status page and notify users
3. **Investigation**: Gather logs and error reports
4. **Resolution**: Apply hotfix or rollback as appropriate
5. **Post-mortem**: Document incident and improve processes

---

This deployment guide ensures reliable, secure, and scalable deployments of MicroSite Forge across all environments.
