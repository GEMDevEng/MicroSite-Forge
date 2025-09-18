# MicroSite Forge MVP: Backend Structure Document

## Document Metadata
- **Version**: 1.0  
- **Date**: September 18, 2025  
- **Author**: Grok 4, xAI Engineering Team  
- **Purpose**: This document outlines the backend structure for the MicroSite Forge MVP, providing a blueprint for implementation, integration, and maintenance. It builds directly on the PRD (Technical Architecture, System Design), SRS (Functional/Non-Functional Requirements), and App Flow (data flows). The structure emphasizes serverless, scalable components using Supabase as the core BaaS, with minimal custom code for rapid iteration.  
- **Scope**: Covers MVP backend only (no frontend details); focuses on data persistence, business logic, APIs, and external integrations. Out-of-scope: Full monitoring stack (e.g., Datadog) beyond basics.  
- **Key Principles**: Serverless-first (no servers to manage); event-driven (webhooks for async ops); secure-by-default (RLS, encryption); testable (unit/integration via Deno/Jest).  

---

## 1. Backend Overview
The backend is a serverless, API-first architecture centered on Supabase for database, authentication, and edge computing. It handles core logic like job queuing, AI integrations, lead processing, and billing events without traditional servers. Data flows are event-driven: User actions trigger Edge Functions, which orchestrate external APIs (e.g., OpenAI for content) and persist results in Postgres.

- **High-Level Layers**:  
  - **API Gateway**: Supabase Edge Functions (Deno) expose REST endpoints; proxy sensitive calls.  
  - **Business Logic**: Functions for orchestration (e.g., batch launch → GitHub push → Netlify deploy).  
  - **Data Layer**: Supabase Postgres with RLS; Redis (Upstash) for queues/caching.  
  - **Integration Layer**: Webhooks and SDKs for externals (Twilio, Stripe).  
  - **Workflow Layer**: n8n self-hosted for complex sequences (e.g., lead qualification → email).  

- **Tech Stack**:  
  - **Primary**: Supabase (Postgres 15, Auth, Edge Functions v1).  
  - **Queue/Orchestration**: BullMQ on Upstash Redis.  
  - **Workflows**: n8n (Docker self-hosted on Vercel or Fly.io).  
  - **Integrations**: REST SDKs (OpenAI, Twilio, Stripe, GitHub, Netlify).  
  - **Monitoring**: Supabase Logs + Sentry for errors.  

- **Deployment Model**: Supabase hosted project; CI/CD via GitHub Actions (deploy functions on push). Estimated COGS: <$50/month for 100 users (free tiers for most).

---

## 2. Key Backend Components
### 2.1 Database (Supabase Postgres)
- **Role**: Persistent storage for users, sites, leads, jobs, and invoices. Schema enforced via migrations (Supabase CLI).  
- **Structure**: Single schema (`public`); extensions: `uuid-ossp` for IDs, `pg_trgm` for text search on leads.details.  
- **RLS Policies**: Granular (e.g., `sites` table: `user_id = auth.uid()` for SELECT/INSERT/UPDATE).  
- **Indexing**: Composites (e.g., `sites(user_id, status)`); GIN on JSONB fields (e.g., leads.details for keyword search).  
- **Size Projections**: 1K rows/sites table at scale; auto-vacuum enabled.  
- **Backups**: Supabase daily point-in-time recovery (PITR); manual exports via pg_dump.

### 2.2 Edge Functions (Supabase Deno)
- **Role**: Serverless compute for API endpoints and logic (e.g., validate inputs, call externals). Deno for TypeScript runtime.  
- **Deployment**: 10+ functions in `/supabase/functions/`; bundled and deployed via CLI (`supabase functions deploy`). Cold starts <100ms.  
- **Key Functions**:  
  | Function Name       | Purpose (SRS Ref) | Inputs/Outputs                  | Dependencies                  |  
  |---------------------|-------------------|---------------------------------|-------------------------------|  
  | `auth-handler`     | Signup/verify (FR-01) | POST: {email, password} → JWT  | Supabase Auth SDK             |  
  | `research-niches`  | AI scan (FR-04)   | POST: {vertical, locations} → JSON keywords | Grok 4/OpenAI API             |  
  | `batch-launch`     | Queue sites (FR-07)| POST: {csvData} → Job ID       | BullMQ, GitHub API            |  
  | `content-refresh`  | Gen Markdown (FR-10)| POST: {siteId, prompt} → Markdown | OpenAI API, Hugo CLI (local)  |  
  | `lead-qualify`     | Update status (FR-16)| POST: {leadId, status} → Bool  | n8n webhook trigger           |  
  | `invoice-create`   | Meter billing (FR-21)| POST: {leadIds} → Invoice URL  | Stripe API, pdf-lib           |  
  | `seo-submit`       | Sitemap push (FR-09)| POST: {siteId} → Status        | GSC/Bing APIs (OAuth)         |  
- **Error Handling**: Try-catch with Sentry capture; return 4xx/5xx JSON {error, code}.

### 2.3 Queue & Async Processing (BullMQ + Upstash Redis)
- **Role**: Handle long-running tasks (e.g., batch deploys) without blocking APIs.  
- **Setup**: Redis instance on Upstash (serverless); BullMQ queues in Edge Functions.  
- **Queues**:  
  - `high-priority`: SEO submissions (TTL 1hr).  
  - `default`: Site launches (process 5 concurrent workers).  
  - `low-priority`: Monthly CRO jobs (cron via Supabase scheduler).  
- **Job Flow Example** (Batch Launch):  
  1. API → Enqueue job {type: 'launch', payload: {sites: [...]}}.  
  2. Worker: For each site → Gen content → GitHub API PUT file → Netlify webhook.  
  3. On complete: Update DB via Supabase client; WebSocket broadcast.  
- **Retries**: Exponential backoff (max 3); failed jobs to dead-letter queue for manual retry.

### 2.4 Workflows (n8n Self-Hosted)
- **Role**: Orchestrate multi-step processes (e.g., lead → qualify → notify → invoice).  
- **Deployment**: Docker on Fly.io (free tier); webhook endpoints exposed.  
- **Key Workflows**:  
  | Workflow Name      | Triggers (SRS Ref) | Steps                              | Outputs                  |  
  |--------------------|--------------------|------------------------------------|--------------------------|  
  | `lead-delivery`   | Form/Twilio webhook (FR-15)| 1. Insert to DB; 2. AI qualify (OpenAI); 3. If pass, email via Mailgun; 4. WebSocket push. | Updated lead status     |  
  | `domain-purchase` | Research complete (FR-05)| 1. Check Porkbun API; 2. If avail, Stripe charge → Buy; 3. Cloudflare DNS update. | Domain record in DB     |  
  | `alert-uptime`    | Cloudflare webhook (FR-24)| 1. Check site status; 2. If down, email/Slack; 3. Retry deploy job. | Alert log               |  
- **Error Handling**: n8n built-in retries; log to Supabase for auditing.

### 2.5 Integrations Layer
- **External APIs**: Managed via SDKs in Edge Functions; env vars from Supabase secrets.  
  | Integration       | SDK/Method       | Usage (SRS Ref)                  | Auth/Rate Limits          |  
  |-------------------|------------------|----------------------------------|---------------------------|  
  | OpenAI/Grok 4    | REST Client     | Content/research (FR-04, FR-10)  | API Key; 100 req/min     |  
  | Twilio           | Twilio SDK      | Call routing (FR-14)             | SID/Token; 1K calls/mo   |  
  | Stripe           | Stripe.js/Node  | Billing/invoices (FR-21)         | OAuth; Webhooks verified |  
  | GitHub           | Octokit         | Repo push/deploy (FR-07)         | PAT (repo scope)         |  
  | Netlify          | Netlify CLI/API | Site deploys (FR-07)             | API Token; Webhooks      |  
  | GSC/Bing         | Google SDK      | SEO data/submit (FR-09, FR-18)   | OAuth2; Daily quotas     |  
  | Cloudflare       | Cloudflare SDK  | DNS/SSL (FR-05)                  | API Token                |  
  | Mailgun/SendGrid | SDK             | Emails (FR-15)                   | API Key; 10K emails/mo   |  
- **Webhook Handling**: Supabase Functions as receivers (e.g., Stripe event → Update invoice status). Verify signatures to prevent spoofing.

---

## 3. Data Models & Schema
Detailed from PRD Section 9, enforced via Supabase migrations.

- **Core Tables** (Postgres):  
  ```sql
  -- Users
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    stripe_id TEXT,
    twilio_sid TEXT ENCRYPTED,  -- Via Supabase Vault
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Sites
  CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    status TEXT CHECK (status IN ('pending', 'live', 'error')) DEFAULT 'pending',
    github_repo TEXT,
    netlify_url TEXT,
    leads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_sites_user_status ON sites(user_id, status);

  -- Leads
  CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT ENCRYPTED,
    email TEXT,
    source TEXT CHECK (source IN ('form', 'call')),
    status TEXT CHECK (status IN ('raw', 'qualified', 'junk')) DEFAULT 'raw',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    details JSONB  -- e.g., {transcript: "..."}
  );
  CREATE INDEX idx_leads_site_status ON leads(site_id, status);
  CREATE INDEX idx_leads_details_gin ON leads USING GIN(details);

  -- Jobs (for queues)
  CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL,  -- e.g., 'launch', 'research'
    status TEXT CHECK (status IN ('queued', 'processing', 'complete', 'failed')) DEFAULT 'queued',
    payload JSONB,
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Invoices
  CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    stripe_id TEXT,
    paid BOOLEAN DEFAULT FALSE,
    leads UUID[] DEFAULT '{}',  -- Array of lead IDs
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- **Relationships**: FK cascades on delete; JSONB for flexible fields (e.g., job payloads).  
- **Views/Procedures**: Custom view `user_sites_summary` for dashboard aggregates (e.g., COUNT(leads) GROUP BY user_id).

---

## 4. API Structure & Endpoints
RESTful via Edge Functions (from PRD Section 8). Base: `/api/v1/`. Auth: Bearer JWT.

- **Authentication**: All endpoints require `Authorization: Bearer <token>`; validate in function middleware.  
- **Endpoints** (Expanded):  
  | Method | Endpoint              | Description (SRS Ref) | Request Body/Example                  | Response (200 OK)                  |  
  |--------|-----------------------|-----------------------|---------------------------------------|------------------------------------|  
  | POST  | `/auth/signup`       | Create user (FR-01)  | {email: "...", password: "..."}      | {token: "...", user: {id, email}} |  
  | GET   | `/sites`             | List user sites      | Query: ?status=live&page=1           | {sites: [...], total: 10}         |  
  | POST  | `/sites/batch-launch`| Queue batch (FR-07)  | {csvData: "service,location\n...", template: "hugo"} | {jobId: "uuid", status: "queued"} |  
  | GET   | `/sites/{id}`        | Site details         | -                                    | {site: {...}, leads_count: 5}     |  
  | POST  | `/leads/{id}/qualify`| QA lead (FR-16)     | {status: "qualified", notes: "..."}  | {updated: true}                   |  
  | GET   | `/leads?siteId=...`  | Fetch leads (FR-17)  | Query: ?page=1&limit=20              | {leads: [...], pagination: {...}} |  
  | POST  | `/research/niches`   | AI research (FR-04)  | {vertical: "epoxy", locations: ["Phoenix"]} | {keywords: [{term: "...", score: 80}]} |  
  | POST  | `/billing/invoice`   | Generate invoice (FR-21)| {leadIds: [1,2]}                    | {url: "stripe.com/..."}           |  
- **Error Responses**: Standardized JSON {error: "msg", code: "ERR_INVALID"}; CORS enabled for frontend origin.  
- **Rate Limiting**: Supabase built-in (100 req/min per IP/user).

---

## 5. Security & Compliance
- **Auth/Access**: Supabase Auth (JWT expiry 1hr); RLS policies (e.g., `CREATE POLICY "User sites only" ON sites FOR ALL USING (user_id = auth.uid());`).  
- **Data Protection**: Encrypt PII (phones/emails) at rest (Vault); transit via HTTPS. GDPR: Export/delete endpoints return ZIP/SQL dump.  
- **Vulnerabilities**: OWASP Top 10 mitigations (e.g., SQLi via prepared statements; XSS via sanitized JSONB). API keys rotated monthly.  
- **Auditing**: Log all mutations to `audit_logs` table (trigger function); integrate Sentry for alerts.

---

## 6. Performance & Scalability
- **Performance**: Edge Functions <200ms (95p); Postgres queries <50ms with indexes. Caching: Redis TTL 5min for frequent reads (e.g., site lists).  
- **Scalability**: Supabase auto-scales (up to 1M rows); BullMQ workers scale horizontally. Projections: Handle 10K jobs/day with <5% queue lag.  
- **Monitoring**: Supabase Dashboard for queries; Prometheus metrics from n8n; alerts on >80% CPU.

---

## 7. Deployment & Maintenance
- **CI/CD**: GitHub Actions workflow: Lint (ESLint) → Test (Deno test) → Migrate DB → Deploy functions. Branches: `main` → Prod; `dev` → Staging.  
- **Environments**: Staging (Supabase project clone); Prod (live integrations). Rollback: Function versions in Supabase.  
- **Maintenance**: Weekly schema checks; monthly dependency updates (npm audit). Cost alerts via Stripe/Supabase webhooks.  
- **Testing**: Unit (functions: 80% coverage); Integration (API mocks with MSW); Load (Artillery: 500 concurrent).

This structure ensures a lean, maintainable backend aligned with MVP goals. For code skeletons, reference Supabase examples. Updates tracked in GitHub issues.

**End of Document**