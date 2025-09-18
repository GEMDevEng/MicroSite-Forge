# MicroSite Forge: Detailed App Flow Document

## Document Metadata
- **Version**: 1.0  
- **Date**: September 18, 2025  
- **Author**: Grok 4, xAI Engineering Team  
- **Purpose**: This document provides a comprehensive walkthrough of the user experience in the MicroSite Forge MVP web application. It details navigation, core flows, interactions, state transitions, and edge cases to guide frontend development, UX design, and testing. Flows are mapped to the PRD's user stories and features, emphasizing seamless, automated workflows for launching and managing microsites.  
- **Scope**: Covers MVP flows for primary users (SMB owners, solo entrepreneurs); assumes responsive web app (desktop/mobile) with Next.js routing.  
- **Key Principles**: Mobile-first UX; progressive disclosure (hide advanced options); real-time updates via WebSockets; error resilience with offline fallbacks.

---

## 1. High-Level Navigation Structure
The app uses a persistent sidebar for core navigation, with a top header for global actions (search, notifications, profile). Routes are handled via Next.js App Router for client-side navigation.

### Main Components
- **Header**: Logo (left), global search bar (e.g., "Search sites or leads"), notification bell (badge for new leads/alerts), user avatar dropdown (profile, billing, logout).  
- **Sidebar** (Collapsible on mobile):  
  - Dashboard (home icon) → `/dashboard`  
  - Research → `/research`  
  - Sites → `/sites` (sub: List, Batch Launch)  
  - Leads → `/leads`  
  - Analytics → `/analytics`  
  - Billing → `/billing`  
  - Integrations → `/integrations`  
  - Settings → `/settings`  
- **Footer**: Links to docs, support, privacy; version number.  
- **Modals/Overlays**: Used for quick actions (e.g., upgrade prompt, lead QA).  
- **State Management**: Zustand store for global state (e.g., current user, active site filters); Supabase Realtime for live sync (e.g., new lead badge).  
- **Routing Patterns**:  
  - Dynamic: `/sites/[id]` for site details.  
  - Nested: `/sites/batch` under Sites.  
  - Guards: Auth required (redirect to `/login` if unauthenticated).

### Accessibility & UX Guidelines
- ARIA labels on all interactive elements (e.g., `aria-label="Launch batch"`).  
- Keyboard navigation (Tab/Enter for forms; Arrow keys for tables).  
- Loading states: Skeleton screens for lists/charts.  
- Transitions: 200ms fade/slide for modals; optimistic updates (e.g., site status → "Deploying" before API confirm).

---

## 2. Core User Flows
Flows are described step-by-step, including triggers, UI changes, API calls (from PRD), state updates, and validation. Each flow references relevant user stories (e.g., US #X).

### Flow 1: Onboarding and First Site Launch (New User Journey)
**Goal**: Guide a new user from signup to launching their first batch of 5 sites. **Duration**: ~5-10 minutes. **References**: US #1-3, #5-6, #22.

1. **Entry Point**: User lands on `/` (homepage) via marketing link. CTA button "Start Free Trial" → Redirect to `/signup`.  
   - UI: Hero section with video demo; form pre-filled if from referral query param.  
   - Validation: Email regex check; password strength (min 8 chars).  
   - API: POST `/auth/signup` → SendGrid email verification.  
   - State: Set `loading: true`; on success, `user: { id, email }` in Zustand.

2. **Email Verification**: User clicks link in email → Redirect to `/verify?token=...`.  
   - UI: Spinner → Success toast ("Welcome! Complete setup.").  
   - API: GET `/auth/verify` → Update user status to "active".  
   - Transition: Auto-redirect to `/integrations`.

3. **Integrations Setup**: Sidebar highlights "Integrations" tab. Stepper UI (1/3: Stripe, 2/3: Twilio, 3/3: Google).  
   - Step 1 (Stripe): OAuth button "Connect Stripe" → Popup to Stripe dashboard.  
     - UI: Success badge on connect; error toast if invalid.  
     - API: POST `/integrations/stripe` with OAuth code → Store `stripe_id`.  
   - Step 2 (Twilio): Form for SID, Auth Token, test number. "Test Connection" button.  
     - UI: Green check on validate; red error for invalid creds.  
     - API: POST `/integrations/twilio` → Twilio SDK ping (e.g., fetch balance). Encrypted store.  
   - Step 3 (Google): Auto-detect GSC property or manual form URL.  
     - Transition: Progress bar fills; on complete, confetti animation + "Setup Complete!" → Redirect to `/research`.  
   - Edge: Skip optional (Twilio) with warning modal ("Calls disabled until connected.").

4. **Niche Research**: Input field "Enter vertical (e.g., epoxy flooring)"; dropdown for locations (pre-populated top 15 cities). "Scan Niches" button.  
   - UI: Progress bar (AI scanning); results table with sortable columns (Keyword, Volume, Competition).  
   - API: POST `/api/research/niches` → Grok 4 integration returns JSON array.  
   - Interaction: Checkbox select 5+ niches → "Add to Batch" → Modal preview CSV.  
   - State: Update `selectedNiches: []` array.

5. **Batch Launch**: From Research or `/sites/batch`, upload CSV or auto-generate from selections. "Launch Batch" button.  
   - UI: Confirmation modal ("Launch 5 sites? Est. time: 2min."); queue progress (0/5 deploying).  
   - API: POST `/api/sites/batch-launch` → BullMQ job queued; poll `/jobs/[id]` for status.  
   - Background: Job triggers content gen (OpenAI), GitHub push, Netlify deploy.  
   - Success: Toast "Batch complete! View sites." → Redirect to `/sites` with new cards highlighted.  
   - State: Optimistic insert to `sites: []`; WebSocket update on deploy complete.

**Exit**: User views live URLs in dashboard; optional tour tooltip ("Click to edit content").

### Flow 2: Lead Capture, Delivery, and QA (Ongoing Operations)
**Goal**: Handle incoming leads from a live site and route/qualify them. **Duration**: Real-time (<30s end-to-end). **References**: US #11-13, #15, #17.

1. **External Trigger**: Visitor submits form on microsite (embedded Google Form) or calls Twilio number.  
   - Backend: Form webhook → Supabase insert (raw lead); Twilio → Vapi AI transcribe → Webhook insert.  
   - No UI yet; n8n workflow: Qualify (keyword match, e.g., "interested in epoxy?") → If pass, send HTML email via Mailgun.

2. **Notification in App**: User in any screen; notification bell badges + toast ("New lead from Phoenix Epoxy!").  
   - UI: Dropdown list recent leads; click → Navigate to `/leads?filter=new`.  
   - API: GET `/api/leads?recent=true` → Paginated results.  
   - State: WebSocket subscribe to `leads` channel; real-time insert.

3. **Lead Review/QA**: Leads table with columns (Timestamp, Name, Phone, Source, Status: Raw). Row actions: Play audio (if call), "Qualify" toggle, "Mark Junk" button.  
   - Interaction: Select row → Detail modal (transcript, site link). Toggle → Inline edit.  
   - API: POST `/api/leads/[id]/qualify` { status: "qualified" } → Update DB; if junk, trigger replacement job (e.g., pause site).  
   - UI: Color-coded rows (green: qualified); bulk select for actions.  
   - Analytics Tie-In: On qualify, increment `leads_count` in site card (live update).

4. **Delivery to Client (If Multi-Tenant)**: For agency users, forward button → Select client from dropdown → Send branded email.  
   - API: POST `/api/leads/[id]/forward` → Custom Mailgun template.  
   - Success: Toast "Lead routed to Client X."

**Exit**: User exports qualified leads CSV; dashboard KPI updates (e.g., +1 to monthly total).

### Flow 3: Site Management and Optimization (Maintenance Loop)
**Goal**: Monitor, edit, and optimize a single site or batch. **Duration**: 2-5 minutes per action. **References**: US #9-10, #14, #16, #23.

1. **Entry**: From `/sites`, grid/list view filtered by status (e.g., "Pending Indexing"). Click card → `/sites/[id]`.  
   - UI: Card shows thumbnail (site preview), metrics badges (Leads: 3, Rank Velocity: +2).  
   - API: GET `/api/sites/[id]` → Full details incl. GSC data.

2. **Site Details View**: Tabs (Overview, Content, SEO, Leads). Overview: Live URL iframe preview, edit buttons.  
   - Content Tab: Generated Markdown viewer; "Refresh Content" button.  
     - UI: Diff view for changes; AI prompt input ("Add more testimonials").  
     - API: POST `/api/content/refresh` → OpenAI call → Hugo rebuild via GitHub.  
   - SEO Tab: Indexing status chart; "Resubmit Sitemap" button.  
     - API: POST `/api/seo/submit` → GSC/Bing APIs.  
   - Leads Tab: Embedded mini-table from Flow 2.

3. **CRO Iteration**: "Schedule Monthly Test" button → Modal with AI suggestions (e.g., "Variant A: New headline").  
   - UI: A/B preview carousel; select → Deploy.  
   - API: POST `/api/cro/test` → Generate variants, push to GitHub branch, Netlify deploy preview.  
   - Monitoring: If uptime alert (from Cloudflare webhook), red banner + "Retry Deploy" button.

4. **Bulk Management**: From `/sites`, select multiple → Dropdown actions (Pause, Delete, Export).  
   - API: POST `/api/sites/bulk` { action: "export", ids: [] } → ZIP download.

**Exit**: Changes saved auto; toast "Site updated and redeployed."

### Flow 4: Billing and Account Management (Growth/Retention)
**Goal**: Review usage, upgrade tiers, and handle payments. **Duration**: 1-3 minutes. **References**: US #18-19, #24.

1. **Entry**: Notification ("Upgrade for more sites?") or direct to `/billing`.  
   - UI: Usage donut chart (Sites: 8/10 limit); MRR projection line graph.

2. **Invoice Review**: Table of past invoices; "Generate New" for performance leads.  
   - Interaction: Select leads → "Invoice $75 each".  
   - API: POST `/api/billing/invoice` → Stripe create → PDF embed.

3. **Upgrade Flow**: Warning banner on limit → "Upgrade Now" → Modal with tier comparison table.  
   - UI: Stripe Elements form for card; proration calc ("+ $50 for 20 days").  
   - API: POST `/stripe/checkout` → Redirect to session; webhook updates tier.  
   - Success: Confetti + "Pro unlocked! Launch more sites."

4. **Export/Backup**: Settings → "Export All Data" button.  
   - UI: Progress modal; download ZIP (sites Markdown, leads CSV).  
   - API: GET `/api/export` → Stream response.

**Exit**: Redirect to dashboard with new limits shown.

---

## 3. Edge Cases and Error Handling
- **Offline Mode**: PWA caches dashboard; queue actions (e.g., qualify lead) for sync on reconnect. Error: "Offline—changes queued."  
- **API Failures**: Retry logic (exponential backoff, max 3x) for external calls (e.g., Netlify deploy fail → "Retry" button). Global error boundary: Full-screen modal with "Something went wrong" + support link.  
- **Rate Limits**: Throttle batch launches (e.g., 10/min); queue overflow → Waitlist modal.  
- **Invalid Data**: Form validation (Zod): e.g., bad CSV → Highlight errors + "Fix and retry."  
- **Auth Edges**: Token expiry → Auto-refresh; suspicious login → 2FA prompt.  
- **AI Hallucinations**: Content gen fallback to template if score <0.7; user flag for review.

---

## 4. Performance and Analytics Integration
- **Flow Instrumentation**: Track via PostHog (e.g., event: "batch_launch_initiated", props: { count: 5 }).  
- **A/B Testing**: Optimizely for CRO previews (e.g., headline variants).  
- **Heatmaps**: Hotjar on key screens (e.g., Research table) for UX iteration.

---

## 5. Validation and Testing Flows
- **E2E Test Flows**: Playwright scripts mirror above (e.g., signup → launch → lead sim).  
- **User Testing**: Beta flows logged; A/B on onboarding stepper.

This document evolves with sprints; next: Wireframes in Figma. For updates, reference PRD sections.

**End of Document**