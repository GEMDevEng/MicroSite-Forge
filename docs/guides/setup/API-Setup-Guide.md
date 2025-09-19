# API Setup Guide

This guide explains how to set up all the API keys and services required for MicroSite Forge Phase 2.

## Required API Services

MicroSite Forge Phase 2 integrates with multiple AI and deployment services. All services have generous free tiers suitable for testing and small-scale usage.

### 1. AI Services (for research and content generation)

#### Grok AI (xAI)
**Purpose**: Niche research and keyword analysis
**Website**: https://console.x.ai/
**Cost**: Free tier available with rate limits
**Setup**:
1. Visit https://console.x.ai/
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key to `.env.local` as `GROK_API_KEY`

#### OpenAI
**Purpose**: Content generation and SEO optimization
**Website**: https://platform.openai.com/
**Cost**: $5 free credit, then pay per token (~$0.002 per 1K tokens)
**Setup**:
1. Visit https://platform.openai.com/
2. Create account or sign in
3. Go to API Keys section
4. Create a new secret key
5. Copy to `.env.local` as `OPENAI_API_KEY`

### 2. Domain Services

#### Porkbun API
**Purpose**: Domain availability checking and registration
**Website**: https://porkbun.com/
**Cost**: Free API tier available
**Setup**:
1. Visit https://porkbun.com/
2. Create account
3. Go to Account → API Access
4. Generate API Key and Secret
5. Copy to `.env.local` as:
   - `PORKBUN_API_KEY`
   - `PORKBUN_SECRET_KEY`

### 3. Development Services

#### GitHub Personal Access Token
**Purpose**: Repository creation for Hugo sites
**Cost**: Free (public repos)
**Setup**:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Copy to `.env.local` as `GITHUB_TOKEN`

#### Netlify Personal Access Token
**Purpose**: Automated site deployment
**Cost**: Free tier with 100GB bandwidth/month
**Setup**:
1. Visit https://app.netlify.com/user/applications
2. Go to Personal access tokens
3. Generate new token
4. Copy to `.env.local` as `NETLIFY_AUTH_TOKEN`

### 4. Optional Services (for monitoring and notifications)

#### Supabase (Database & Auth)
**Purpose**: User authentication and data storage
**Cost**: Free tier (500MB database, 50MB file storage)
**Setup**:
1. Visit https://supabase.com/
2. Create new project
3. Go to Settings → API
4. Copy values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### Sentry (Error Monitoring)
**Purpose**: Error tracking and performance monitoring
**Cost**: Free tier (5K events/month)
**Setup**:
1. Visit https://sentry.io/
2. Create account and project
3. Get DSN from project settings
4. Copy to `.env.local` as `SENTRY_DSN`

#### Google Analytics
**Purpose**: Website analytics for deployed microsites
**Cost**: Free
**Setup**:
1. Visit https://analytics.google.com/
2. Create new property
3. Get measurement ID (GA4 format: G-XXXXXXXXXX)
4. Copy to `.env.local` as `GOOGLE_ANALYTICS_ID`

## Environment Variables Reference

Create a `.env.local` file in your project root with all required variables:

```env
# AI Services
GROK_API_KEY=your_grok_api_key
OPENAI_API_KEY=your_openai_api_key

# Domain Services
PORKBUN_API_KEY=your_porkbun_api_key
PORKBUN_SECRET_KEY=your_porkbun_secret_key

# Development Services
GITHUB_TOKEN=your_github_token
NETLIFY_AUTH_TOKEN=your_netlify_auth_token

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
GOOGLE_ANALYTICS_ID=your_google_analytics_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="MicroSite Forge"

# Development
NODE_ENV=development
```

## Testing API Keys

After setting up your API keys, test them individually:

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Grok API
```bash
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"niche": "plumbers", "domainSearch": false}'
```

### 3. Test OpenAI API
```bash
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -d '{"keyword": "plumber services", "contentType": "blog-post"}'
```

### 4. Test Porkbun API
```bash
curl "http://localhost:3000/api/research/domains?keyword=plumber"
```

## Troubleshooting

### Common Issues

**"API key not configured" errors:**
- Double-check your `.env.local` file exists
- Ensure variable names match exactly (case-sensitive)
- Restart the development server after adding keys

**Rate limiting errors:**
- AI APIs have rate limits (Grok: 60 req/min, OpenAI: varies by model)
- Wait and retry, or upgrade to paid plans

**Permission errors:**
- GitHub tokens need `repo` scope for repository creation
- Netlify tokens need deployment permissions

### Getting Help

- Check API provider documentation for rate limits and error codes
- Review browser developer tools for detailed error messages
- Test individual APIs using their web interfaces first

## Security Best Practices

- Never commit `.env.local` to version control
- Use different API keys for development vs production
- Rotate keys regularly (quarterly)
- Monitor API usage in provider dashboards
- Set up billing alerts to avoid unexpected charges
