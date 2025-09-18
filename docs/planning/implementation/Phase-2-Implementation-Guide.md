# Phase 2: AI Integration & Content Generation - Implementation Guide

## Overview

Phase 2 completes MicroSite Forge's core AI-powered microsite generation capabilities. This phase focuses on intelligent niche research, automated content creation, and end-to-end site deployment workflows.

## 🎯 Phase 2 Objectives

- **AI Research Engine**: Comprehensive niche analysis using Grok AI
- **Content Factory**: SEO-optimized content generation with OpenAI
- **Site Automation**: Complete workflow from research to live deployment
- **Lead Generation**: Built-in conversion optimization and lead capture

## 🏗️ Architecture

### Core Components

#### 1. AI Service Layer (`src/lib/`)
```
├── grok.ts          # Niche research & keyword analysis
├── porkbun.ts       # Domain availability checking
├── openai.ts        # Content generation & validation
├── github.ts        # Repository management & Hugo integration
└── netlify.ts       # Automated deployment
```

#### 2. API Endpoints (`src/app/api/`)
```
├── research/route.ts     # POST: Niche research with domain check
├── content/route.ts      # POST: Single content generation  
├── sites/generate/route.ts # POST: End-to-end site creation
└── sites/[id]/route.ts   # GET: Check site generation status
```

#### 3. User Interface (`src/components/`)
```
├── research/
│   └── niche-research.tsx    # Research form & results dashboard
└── content/
    └── content-editor.tsx    # Content preview, editing & approval
```

## 🚀 Implementation Details

### 1. AI Research Integration

#### Grok API Setup
```typescript
// Configure environment variables
GROK_API_KEY=your_grok_api_key_here

// Basic research call
const research = await performNicheResearch({
  niche: 'plumbers',
  targetAudience: 'homeowners',
  geography: 'local',
  competitorAnalysis: true
})
```

#### Research Response Structure
```typescript
interface NicheResearchResponse {
  niche: string
  keywords: Array<{
    keyword: string
    searchVolume: number
    competition: 'high' | 'medium' | 'low'
    cpc: number
    trending: boolean
  }>
  trendingTopics: string[]
  contentOpportunities: string[]
  competitorInsights?: string[]
  availableDomains: Array<{
    domain: string
    status: 'available' | 'registered' | 'error'
    price?: number
  }>
}
```

### 2. Domain Search Integration

#### Porkbun API Setup
```typescript
// Environment variables
PORKBUN_API_KEY=your_porkbun_key
PORKBUN_SECRET_KEY=your_porkbun_secret

// Domain availability check
const domains = await checkDomainAvailability(['example.com', 'example.net'])
```

#### Smart Domain Generation
- Base variations: `keyword`, `keywordpro`, `keywordzone`
- Suffix variations: `getkeyword`, `mykeyword`, `keywordnow`
- TLD prioritization: `.com`, `.net`, `.org`, `.co`

### 3. Content Generation Engine

#### OpenAI API Configuration
```typescript
OPENAI_API_KEY=your_openai_api_key

// Content generation
const content = await generateContent({
  keyword: 'plumbing services',
  contentType: 'landing-page',
  niche: 'plumbing',
  targetAudience: 'homeowners',
  tone: 'professional',
  wordCount: 800
})
```

#### Content Validation Rules
- Keyword in title (15 point penalty if missing)
- Keyword in first paragraph (10 point penalty if missing)
- Minimum 500 words (10 point penalty if short)
- Meta description ≤160 characters (10 point penalty if long)
- Minimum 2 headings (5 point penalty if missing)

### 4. Site Generation Workflow

#### Hugo Template Structure
```
content/
├── _index.md      # Homepage
├── services/_index.md
├── about/_index.md
├── contact/_index.md
└── blog/
    └── tips/_index.md

layouts/_default/
└── baseof.html   # Hugo template

assets/css/
└── main.css     # Responsive styles
```

#### GitHub Integration
```typescript
// Create repository
const repo = await createHugoTemplateRepository(
  'microsite-plumbers-123456',
  'Plumbing microsite',
  false
)

// Upload content
await generateHugoSite(
  'username',
  'microsite-plumbers-123456',
  hugoContent,
  {
    siteTitle: 'Local Plumbing Experts',
    domain: 'localplumbingexperts.com'
  }
)
```

#### Netlify Deployment
```typescript
// Create site with GitHub connection
const site = await createHugoSite(
  'plumbing-site-123',
  `https://github.com/username/microsite-plumbers-123456`,
  'main',
  'localplumbingexperts.com'
)
```

## 🎨 User Experience

### Research Dashboard
1. **Niche Input Form**: Fields for niche, audience, geography, options
2. **Real-time Results**: Keyword data, domain suggestions, content ideas
3. **Filter & Sort**: Competition levels, price ranges, trending topics
4. **Export Options**: CSV downloads, API data integration

### Content Editor
1. **Preview Mode**: Live Markdown rendering with styling
2. **Edit Mode**: Individual content editing with SEO validation
3. **Quality Scoring**: Real-time SEO analysis and improvement suggestions
4. **Approval Workflow**: Final review before deployment

## 🔧 API Reference

### Research API

**POST `/api/research`**
Generate comprehensive niche research report.

Request:
```json
{
  "niche": "plumbers",
  "targetAudience": "homeowners",
  "geography": "New York",
  "competitorAnalysis": true,
  "domainSearch": true,
  "maxDomains": 10
}
```

Response:
```json
{
  "success": true,
  "data": {
    "niche": "plumbers",
    "keywords": [...],
    "trendingTopics": [...],
    "availableDomains": [...]
  }
}
```

### Content API

**POST `/api/content`**
Generate individual content pieces.

**PUT `/api/content/website`**
Generate complete website content (up to 10 pages).

### Site Generation API

**POST `/api/sites/generate`**
Create complete microsite from research to deployment.

Request includes niche, domain, content parameters, and optional GitHub repo name.

## 🔒 Security & Authentication

### API Key Management
- Environment variables for all external APIs
- Secure token handling in server-side functions
- Rate limiting and error boundary protection

### User Permissions
- Site ownership verification
- Content modification authorization
- Deployment approval workflows

## 📊 Monitoring & Analytics

### Performance Metrics
- API response times
- Content generation success rates
- Deployment completion rates
- User engagement tracking

### Error Handling
- Comprehensive try-catch blocks
- Graceful degradation for API failures
- User notifications for system issues
- Logging for debugging and optimization

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] API keys configured in environment
- [ ] Database migrations completed (Phase 1)
- [ ] Authentication flow tested
- [ ] SSL certificates configured

### Post-deployment
- [ ] AI API quotas monitored
- [ ] Content quality validation active
- [ ] Domain registration process confirmed
- [ ] Lead capture forms tested

## 🔄 Phase 3 Transition

Phase 2 completes the core microsite generation engine. Phase 3 will focus on:

- Lead management and routing
- Communication automation
- Billing integration
- Performance analytics
- Multi-tenant features

## 📋 Success Metrics

### Technical Goals ✅
- 100% API integration completion
- < 5 second average content generation
- 99% site deployment success rate
- Full SEO compliance validation

### Business Goals
- 50+ sites created per month
- Average 85+ SEO content score
- < $10 cost per complete site
- > 70% user feature adoption

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Configuration Required

Create `.env.local` with:

```env
# AI APIs
GROK_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here

# Domain Services
PORKBUN_API_KEY=your_key_here
PORKBUN_SECRET_KEY=your_key_here

# Deployment Services
GITHUB_TOKEN=your_token_here
NETLIFY_AUTH_TOKEN=your_token_here

# Supabase (from Phase 1)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

This implementation provides a production-ready AI-powered microsite factory capable of generating leads in any niche with minimal user input.
