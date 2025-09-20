**Prompt for Coding AI Assistant:**

You are a senior full-stack developer tasked with integrating multiple payment gateways into the MicroSite Forge MVP web application. The app is built with Next.js 14 (frontend), Supabase (backend with Postgres, Auth, and Edge Functions), BullMQ for queuing, n8n for workflows, and currently uses Stripe for billing (subscriptions: $49–$499/month tiers, metered usage: $0.50/lead, automated invoicing via pdf-lib).

The goal is to add support for multiple payment options, allowing users to select and switch between gateways during onboarding/integrations. The top 5 gateways to integrate are:
1. **Stripe** (already implemented as default; enhance for multi-gateway compatibility).
2. **PayPal (via Braintree SDK)** – For digital wallets and recurring; fees: 2.59% + $0.49/transaction.
3. **Adyen** – For global optimization; use interchange++ pricing model.
4. **Square** – For US-focused invoicing; fees: 2.9% + $0.30/online.
5. **Authorize.net** – For secure recurring; includes $25/month gateway fee.

Requirements:
- **Backend Integration (Supabase Edge Functions)**:
  - Create a payment abstraction layer in `/supabase/functions/` (e.g., a `payment-handler.ts` function) to route calls dynamically based on user-selected gateway (stored in `users` table as `preferred_gateway` enum: 'stripe' | 'paypal' | 'adyen' | 'square' | 'authorize_net').
  - For each gateway: Implement SDK/API wrappers for key operations – OAuth connect, create subscription, meter usage (e.g., per-lead), generate invoice/PDF, handle webhooks (e.g., payment success/fail, refunds).
  - Update existing Stripe logic (e.g., `/billing/invoice` endpoint) to use the abstraction; fallback to Stripe if none selected.
  - Store gateway-specific credentials encrypted in Supabase Vault (e.g., add columns to `users`: `paypal_token`, `adyen_merchant_id`, etc.).
  - Handle webhooks: Expose unified endpoints (e.g., `/webhooks/{gateway}`) that validate signatures and update `invoices` table (e.g., set `paid: true`).
  - Use BullMQ for async tasks like invoice generation; integrate n8n workflows for post-payment notifications (e.g., email invoice URL).
  - Ensure compliance: PCI DSS via gateways; GDPR for data export. Add error handling (e.g., fallback gateway on fail).

- **Frontend Integration (Next.js)**:
  - In `/app/integrations/page.tsx`: Add a dropdown/select for choosing gateway; conditional forms/OAuth buttons for each (e.g., PayPal OAuth popup similar to Stripe).
  - Update `/app/billing/page.tsx`: Display current gateway; "Switch Gateway" modal with pros/cons summary (e.g., fees, supported countries).
  - Use Zustand stores (e.g., `useBillingStore`) to manage gateway state; SWR for fetching user prefs.
  - UI Components: Extend `<Button>` for "Connect [Gateway]"; show progress/toasts (Sonner) for connects; update KPI charts to reflect gateway-specific fees in projections.
  - Flows: During onboarding, prompt for gateway selection after email verify; in billing, handle proration/upgrades across gateways (e.g., cancel old sub, create new).
  - Accessibility: ARIA labels on selects (e.g., `aria-label="Select payment gateway"`); keyboard nav for modals.

- **Multi-Gateway Support**:
  - Allow users to connect multiple (e.g., store all tokens); default to one but enable per-transaction selection (e.g., via API param `gateway?` for advanced users).
  - Handle edge cases: Currency conversion (default USD; use gateway rates); refunds across gateways; migration (e.g., transfer active subs from Stripe to PayPal).
  - Security: Rate limit endpoints (100/min); validate inputs (Zod); audit logs for switches.

- **Testing & Deployment**:
  - Unit tests (Jest/RTL): Cover abstraction layer (mock SDKs).
  - E2E (Playwright): Simulate onboarding with each gateway; test webhook handling.
  - Performance: Ensure <200ms responses; no added latency from abstraction.
  - Deploy: Update Vercel env vars for new API keys; test in staging Supabase project.

Provide the full code changes as diffs or files for:
- Backend: New functions, schema updates (SQL migrations), n8n workflows.
- Frontend: Updated pages/components, Zustand stores.
- Any config (e.g., tailwind for new buttons).

Output in a structured format: 1. Backend Code, 2. Frontend Code, 3. Testing Scripts, 4. Deployment Steps. Ensure compatibility with existing features (e.g., batch launches unaffected). If needed, suggest minimal UI changes for a clean UX.
