<prd>

# MicroSite Forge MVP: Technical Product Requirements Document

## 1. Product Overview
MicroSite Forge is a web application that automates the creation, deployment, and management of hyper-local lead-generation microsites using AI-driven workflows. It enables users to launch batches of static sites on Netlify/Vercel, integrate lead capture via Twilio and forms, and route notifications through automated emails and dashboards. The MVP focuses on core automation for niche research, site building, lead handling, and basic analytics, built with Next.js frontend, Supabase backend, and integrations with AI APIs like Grok 4 and OpenAI.

## 2. User Stories
The following 25 user stories capture the core MVP functionality in Gherkin format, sequenced by user journey phases: onboarding, research & launch, management, and analytics.

1. **Onboarding - Account Creation**  
   Given a new user visits the signup page,  
   When they enter email, password, and business details,  
   Then they receive a verification email and are redirected to the dashboard.

2. **Onboarding - Stripe Integration**  
   Given a user completes signup,  
   When they connect Stripe via OAuth,  
   Then their account is linked for billing and they can access paid features.

3. **Onboarding - Twilio Setup**  
   Given a user is in the integrations page,  
   When they input Twilio SID, token, and phone number,  
   Then the system validates credentials and stores them encrypted.

4. **Research - Niche Discovery**  
   Given a logged-in user selects a vertical like "epoxy flooring",  
   When they trigger AI research,  
   Then the dashboard displays 50+ keyword clusters with volume and competition scores.

5. **Research - Domain Sniping**  
   Given a list of niches from research,  
   When the user selects 10 locations,  
   Then the system checks domain availability via Porkbun API and suggests 3 TLD options per niche.

6. **Launch - Batch Site Generation**  
   Given a user uploads a CSV with services and locations,  
   When they click "Launch Batch",  
   Then AI generates Markdown content and pushes to GitHub repo for Netlify deploy.

7. **Launch - Domain Connection**  
   Given a new site is generated,  
   When the system auto-purchases a domain via Cloudflare Registrar,  
   Then it configures DNS records for SSL and points to Netlify.

8. **Launch - SEO Submission**  
   Given a site is deployed,  
   When the deployment webhook fires,  
   Then sitemaps are submitted to Google Search Console and Bing APIs.

9. **Content - AI Generation**  
   Given a niche-location combo,  
   When the user requests content refresh,  
   Then Grok 4 API generates 600-900 word Markdown pages with local NAP.

10. **Content - Page Structure**  
    Given generated Markdown,  
    When Hugo builds the site,  
    Then it renders 50+ pages including FAQs, testimonials, and CTA sections.

11. **Lead Capture - Form Embedding**  
    Given a deployed site template,  
    When the user customizes a Google Form URL,  
    Then the partial HTML is updated and redeployed via GitHub Actions.

12. **Lead Capture - Call Routing**  
    Given a Twilio number is assigned to a site,  
    When a call comes in,  
    Then Vapi AI transcribes and routes to user via webhook to Supabase.

13. **Lead Delivery - Notification**  
    Given a new lead from form or call,  
    When the n8n workflow triggers,  
    Then a branded HTML email is sent with details and site link.

14. **Management - Dashboard View**  
    Given a user logs in,  
    When they view the sites list,  
    Then it shows status (live/indexed), leads count, and revenue projection.

15. **Management - Lead QA**  
    Given a lead entry in the database,  
    When the user marks it as "junk",  
    Then it's flagged for replacement and notification sent to client.

16. **Management - CRO Iteration**  
    Given low CTR from GSC data,  
    When the user schedules a monthly test,  
    Then AI suggests A/B variants for headlines and deploys updates.

17. **Analytics - KPI Tracking**  
    Given integrated Google Analytics,  
    When the user filters by site,  
    Then the dashboard renders charts for impressions, leads, and cost/lead.

18. **Billing - Invoice Generation**  
    Given a lead is qualified,  
    When Stripe meter fires,  
    Then an invoice is created for $75/lead and emailed via template.

19. **Billing - Tier Upgrade**  
    Given a user on Starter tier launches 11 sites,  
    When they exceed limits,  
    Then they are prompted to upgrade to Pro with proration.

20. **Outbound - Proof Asset Creation**  
    Given a sales user selects a niche,  
    When they generate a demo Loom script,  
    Then the system spins up a temp site and embeds call log screenshots.

21. **Compliance - NAP Sync**  
    Given a site update,  
    When NAP details change,  
    Then citations are auto-updated in 50+ directories via API.

22. **Scale - Batch Import**  
    Given a CSV with 100 rows,  
    When imported via dashboard,  
    Then sites are queued in background jobs for sequential launch.

23. **Alerts - Uptime Monitoring**  
    Given a site downtime detected via Cloudflare,  
    When threshold exceeded,  
    Then Slack/email alert is sent with deploy retry option.

24. **Export - Site Backup**  
    Given a user requests export,  
    When triggered,  
    Then GitHub repo and lead data are zipped and downloadable.

25. **Logout - Session Management**  
    Given an inactive session >30min,  
    When detected,  
    Then the user is auto-logged out and redirected to login.

## 3. User Flows
### Flow 1: Onboarding and First Site Launch
1. User visits homepage and clicks "Sign Up".
2. Enters credentials; system sends verification email via SendGrid.
3. Verifies email; redirects to integrations page.
4. Connects Stripe and Twilio; validates APIs.
5. Navigates to "Research" tab; selects vertical and triggers AI scan.
6. Reviews keyword list; selects 5 niches/locations.
7. Clicks "Launch Batch"; AI generates content, pushes to GitHub, deploys to Netlify.
8. Views dashboard confirmation with live URLs.

### Flow 2: Lead Capture and Delivery
1. External user visits live microsite and submits form.
2. Google Form response webhooks to Supabase.
3. n8n workflow triggers: Qualifies lead, stores in DB.
4. Sends HTML email via Mailgun with lead details.
5. User logs in, views "Leads" tab; marks as qualified.
6. If call: Twilio inbound → Vapi AI → Transcribe → Webhook to DB → Notification.

### Flow 3: Management and Analytics
1. User accesses dashboard; filters sites by status.
2. Clicks site card; views metrics (impressions via GSC API).
3. Schedules CRO: AI generates variants, deploys via GitHub.
4. Exports leads CSV; reviews billing summary.
5. If alert (e.g., low indexing), clicks "Retry Submission".

### Flow 4: Billing and Upgrade
1. User views usage metrics; sees tier limit warning.
2. Clicks "Upgrade"; selects Pro tier.
3. Stripe checkout session created; processes payment.
4. Account updated; email confirmation sent.

## 4. Screens and UI/UX
- **Login/Signup Screen**: Centered form with email/password fields, OAuth buttons for Stripe/Twilio. Key elements: Validation errors, progress spinner. Interactions: Submit → API call, redirect on success.
- **Dashboard Overview**: Grid of site cards (status badges: Live/Pending/Error), top KPIs (total leads, MRR projection). Interactions: Filter dropdowns, search bar, "Launch Batch" button.
- **Research Screen**: Input for vertical, results table (keywords, scores), export CSV button. Key elements: AI progress bar. Interactions: Select niches → Add to batch.
- **Site Management Screen**: List view of sites with edit icons, metrics charts (Line chart for leads). Interactions: Click site → Detail modal; bulk actions (deploy/retry).
- **Leads Screen**: Paginated table (lead details, status toggle), search/filter. Key elements: Export button. Interactions: Mark junk → Update DB via API.
- **Integrations Screen**: Form fields for API keys, test connection buttons. Key elements: Success/error toasts. Interactions: Save → Encrypt and store.
- **Billing Screen**: Usage charts, invoice history table, upgrade modal. Key elements: Stripe embed. Interactions: Upgrade → Checkout flow.
- **Settings Screen**: Profile edit, export data button, logout. Key elements: Toggle for notifications.

UI Style: Tailwind CSS for responsive design (mobile-first), dark mode toggle, sans-serif fonts (Inter), primary blue (#3B82F6) accents. UX: Loading skeletons, toast notifications (success/error), keyboard navigation.

## 5. Features and Functionality
- **AI Niche Research**: Integrates Grok 4 API to scrape/analyze autocomplete via simulated queries; outputs JSON with scores (volume: 0-100, competition: low/med/high).
- **Domain Auto-Purchase**: Porkbun/Cloudflare API calls for availability check and buy; handles payment via Stripe.
- **Content Generation**: OpenAI API prompt chaining for Markdown; Hugo templating for 50+ pages (frontmatter: title, date; body: sections).
- **Deployment Pipeline**: GitHub API push Markdown to repo; Actions YAML triggers Hugo build → Netlify webhook deploy.
- **Lead Routing**: Twilio SDK for inbound calls; Vapi API for AI handling; n8n nodes for webhook → Supabase insert → Mailgun email.
- **Analytics Integration**: Google Search Console API pull for impressions/CTR; Chart.js for dashboard rendering.
- **Billing Automation**: Stripe webhooks for metering ($0.50/lead processed); invoice PDF generation via pdf-lib.
- **Batch Processing**: BullMQ queue for async jobs (e.g., 100-site launch in 10min chunks to avoid rate limits).

## 6. Technical Architecture
High-level: Client-server architecture with Next.js (React) frontend for SPA, Supabase (Postgres + Auth) as BaaS for backend/DB, and serverless integrations.  
- **Frontend**: Next.js 14 (App Router) for SSR/SSG; Tailwind for styling; Zustand for state management.  
- **Backend**: Supabase Edge Functions (Deno) for API logic; n8n self-hosted for workflows.  
- **Integrations**: REST APIs (Grok/OpenAI, Twilio, Netlify, Stripe); WebSockets via Supabase Realtime for live updates.  
- **Data Flow**: User action → Frontend API call → Supabase Function → External API → DB update → WebSocket push to UI.  
- **Deployment**: Vercel for frontend; Supabase hosted for backend.

## 7. System Design
- **Client-Side**: Next.js app with pages/api for proxy endpoints (to hide keys); PWA support for offline dashboard views.  
- **Server-Side**: Supabase Postgres for storage; Edge Functions handle auth (JWT), business logic (e.g., lead qualification via simple ML threshold on keywords).  
- **Databases**: Single Postgres schema; indexes on site_id, timestamp for queries.  
- **External Services**: GitHub repo per user (cloned from template); Netlify site per batch; Cloudflare for DNS/SSL.  
- **Message Queue**: BullMQ on Redis (via Upstash) for job queuing (e.g., content gen).  
- **Caching**: Vercel Edge for API responses; Supabase built-in for queries.  
Components interact via HTTP/REST; e.g., deploy flow: Function → GitHub API → Actions webhook → Netlify build log poll.

## 8. API Specifications
All APIs use REST over HTTPS, JSON payloads, JWT auth headers.

- **POST /api/research/niches**  
  Purpose: Trigger AI niche scan.  
  Request: { "vertical": "epoxy flooring", "locations": ["Phoenix"] }  
  Response: 200 { "keywords": [{ "term": "garage epoxy phoenix", "volume": 50, "competition": "low" }] }

- **POST /api/sites/batch-launch**  
  Purpose: Queue site batch.  
  Request: { "csvData": "service,location\nEpoxy,Phoenix", "templateId": "hugo-default" }  
  Response: 202 { "jobId": "uuid", "status": "queued" }

- **GET /api/leads/{siteId}**  
  Purpose: Fetch leads.  
  Request: Query params ?page=1&limit=20  
  Response: 200 { "leads": [{ "id": 1, "name": "John", "phone": "555-1234", "timestamp": "2025-09-18T10:00:00Z" }] }

- **POST /api/leads/{leadId}/qualify**  
  Purpose: Update lead status.  
  Request: { "status": "qualified", "notes": "High intent" }  
  Response: 200 { "updated": true }

- **POST /api/billing/invoice**  
  Purpose: Generate invoice.  
  Request: { "leadIds": [1,2] }  
  Response: 200 { "invoiceUrl": "https://stripe.com/..." }

Error Format: 4xx/5xx { "error": "message", "code": "INVALID_INPUT" }

## 9. Data Model
Key entities in Supabase Postgres:

- **Users** (PK: id UUID): email (text unique), stripe_id (text), twilio_sid (text encrypted), created_at (timestamptz).  
- **Sites** (PK: id UUID, FK: user_id): name (text), domain (text), status (enum: pending/live/error), github_repo (text), netlify_url (text), leads_count (int default 0).  
- **Leads** (PK: id UUID, FK: site_id): name (text), phone (text), email (text), source (enum: form/call), status (enum: raw/qualified/junk), timestamp (timestamptz), details (jsonb for transcript).  
- **Jobs** (PK: id UUID, FK: user_id): type (enum: launch/research), status (enum: queued/processing/complete), payload (jsonb), result (jsonb).  
- **Invoices** (PK: id UUID, FK: user_id): amount (decimal), stripe_invoice_id (text), paid (bool), leads (array UUID).  

Relationships: One-to-Many (User → Sites, Sites → Leads, User → Jobs). Indexes: Composite on sites.user_id + status; GIN on leads.details for search.

## 10. Security Considerations
- **Auth**: Supabase Auth with JWT; row-level security (RLS) policies (e.g., users read own sites only).  
- **Data Protection**: Encrypt sensitive fields (API keys, phones) with Supabase Vault; GDPR-compliant delete on user request.  
- **API Security**: Rate limiting (100 req/min via Vercel); input validation (Zod schemas); CORS restricted to app domain.  
- **Integrations**: Store tokens encrypted; use short-lived OAuth for Stripe/Twilio.  
- **Auditing**: Log all actions to Supabase Logs; monitor for anomalies with Supabase Analytics.

## 11. Performance Requirements
- **Response Times**: API <200ms (95th percentile); page loads <2s (Core Web Vitals).  
- **Throughput**: Handle 100 concurrent users; 1K leads/day processing.  
- **Uptime**: 99.9% (monitored via UptimeRobot).  
- **Batch Jobs**: 100-site launch <10min; content gen <5s/page.

## 12. Scalability Considerations
- **Horizontal Scaling**: Vercel auto-scales frontend; Supabase scales DB shards on demand.  
- **Queue Management**: BullMQ distributes jobs across workers; add Redis cluster for >10K jobs/day.  
- **Caching**: Edge caching for static assets; invalidate on deploys via webhooks.  
- **Limits**: Soft caps (e.g., 100 sites/tier) enforced in code; upgrade prompts for growth.

## 13. Testing Strategy
- **Unit Tests**: Jest for frontend logic (80% coverage); Deno test for Edge Functions.  
- **Integration Tests**: Playwright E2E for flows (e.g., launch → deploy verification).  
- **API Tests**: Supertest for endpoints; mock external APIs (e.g., Twilio).  
- **Load Tests**: Artillery for 500 concurrent users.  
- **CI/CD**: GitHub Actions runs tests on PRs; manual QA for AI outputs.

## 14. Deployment Plan
- **Infrastructure**: Vercel for Next.js (env vars from GitHub Secrets); Supabase project setup (free tier initial).  
- **Pipeline**: GitHub Actions: Lint → Test → Build → Deploy to Vercel staging → Manual approve → Prod.  
- **Initial Rollout**: Beta to 50 users (invite-only); monitor with Sentry.  
- **Rollback**: Vercel previews for hotfixes; DB migrations via Supabase CLI.

## 15. Maintenance and Support
- **Monitoring**: Sentry for errors; Supabase Analytics for queries; weekly job audits.  
- **Updates**: Bi-weekly releases via semantic versioning; changelog in app.  
- **Support**: In-app chat (Intercom free tier); ticket system for Pro users.  
- **Backups**: Supabase daily snapshots; GitHub repo mirroring.  
- **Cost Management**: Alert on Stripe/Supabase bills >$500/month.
</prd>