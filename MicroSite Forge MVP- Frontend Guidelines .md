# MicroSite Forge MVP: Frontend Guidelines Document

## Document Metadata
- **Version**: 1.0  
- **Date**: September 18, 2025  
- **Author**: Grok 4, xAI Engineering Team  
- **Purpose**: This document provides comprehensive guidelines for frontend development of the MicroSite Forge MVP, ensuring consistency, performance, and usability. It draws from the PRD (Screens/UI/UX, Technical Architecture), App Flow (navigation/flows), SRS (User Interfaces), and Backend Structure (API integrations). These guidelines promote a maintainable, scalable codebase for the responsive web app targeting SMB owners and agencies.  
- **Scope**: Covers MVP frontend only (Next.js SPA); excludes advanced features like PWA push notifications. Assumes collaboration via GitHub (branching: feature/*, PR reviews).  
- **Key Principles**: Mobile-first, accessible (WCAG 2.1 AA), performant (Core Web Vitals), component-driven (reusable via Storybook). Code style: ESLint + Prettier enforced.  

---

## 1. Frontend Overview
The frontend is a single-page application (SPA) built with Next.js, delivering seamless interactions for dashboard-driven workflows (e.g., batch launches, lead QA). It consumes the backend via REST APIs, with real-time updates via Supabase WebSockets. Design emphasizes simplicity for medium-tech users: intuitive grids/tables, progress indicators for async ops, and minimal modals for confirmations.

- **User Experience Goals**:  
  - Onboarding <5min; batch actions <60s feedback.  
  - Responsive: Breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px).  
  - Theming: Light/dark mode toggle (user preference via localStorage).  

- **Development Workflow**:  
  - Local Setup: `npm install`; `npm run dev` (localhost:3000).  
  - Branching: `feat/[feature]`; PRs require 80% test coverage.  
  - Linting: Run `npm run lint` pre-commit (Husky).  

---

## 2. Tech Stack
- **Framework**: Next.js 14 (App Router for SSR/SSG; no Pages Router).  
- **Styling**: Tailwind CSS v3 (JIT mode); CSS-in-JS avoided for simplicity.  
- **State Management**: Zustand (lightweight, no boilerplate); Supabase client for auth/realtime.  
- **UI Components**: Headless UI (for modals/tabs) + Radix UI (primitives); custom wrappers.  
- **Data Fetching**: SWR for caching/stale-while-revalidate; Axios for API calls.  
- **Charts/Tables**: Chart.js (v4) for KPIs; TanStack Table (v8) for leads/sites.  
- **Forms**: React Hook Form (v7) + Zod for validation.  
- **Testing**: Jest + React Testing Library (RTL) for units; Playwright for E2E.  
- **Other**: Lucide React (icons); clsx/tailwind-merge (class utilities); Storybook (v7) for component docs.  

Dependencies locked in `package.json`; no runtime installs.

---

## 3. UI Components Library
Build a shared `/components` folder with atomic design (atoms → molecules → organisms). All reusable; export as default. Document in Storybook (`npm run storybook`).

### 3.1 Atoms (Primitives)
- **Button**: Variants (primary, secondary, ghost); states (loading, disabled). Props: `variant`, `size`, `onClick`, `children`.  
  Example: `<Button variant="primary" loading={isLaunching}>Launch Batch</Button>`.  
- **Input**: With label/error; Zod-integrated. Props: `label`, `error`, `placeholder`.  
- **Badge**: For status (e.g., "Live" green, "Error" red). Props: `variant` (success/error/pending).  
- **Icon**: Wrapper around Lucide; size prop (sm/md/lg).  

### 3.2 Molecules (Composites)
- **FormField**: Combines Input + Label + Error. Used in integrations (e.g., Twilio SID).  
- **ProgressBar**: Linear with percentage; for batch jobs. Props: `value` (0-100), `label`.  
- **Toast**: Notification system (via Sonner lib). Types: success/error/info; auto-dismiss 5s.  

### 3.3 Organisms (Complex)
- **SiteCard**: Grid item with thumbnail, metrics badges, actions (edit/deploy). Responsive: Stack on mobile.  
- **LeadsTable**: Paginated TanStack Table; columns (timestamp, name, status toggle). Filters: Search + status dropdown.  
- **KPIChart**: Chart.js wrapper (line/bar); props: `data`, `type`. For impressions/leads.  
- **Modal**: Headless UI Dialog; variants (confirm, detail). Includes overlay backdrop.  

### 3.4 Pages/Templates
- Layouts: `/app/layout.tsx` (root with Header/Sidebar); conditional sidebar on mobile (hamburger).  
- Error Boundaries: Custom `ErrorBoundary` component wrapping pages.  
- Loading: Skeleton placeholders (e.g., shimmering cards for sites list).

---

## 4. Styling Guidelines
- **Tailwind Config**: Extend theme in `tailwind.config.js`:  
  ```js
  module.exports = {
    theme: {
      extend: {
        colors: { primary: '#3B82F6', success: '#10B981' },
        fontFamily: { sans: ['Inter', 'sans-serif'] },
      },
    },
    plugins: [require('@tailwindcss/forms')],
  };
  ```  
- **Class Naming**: Utility-first; no custom CSS unless animation (e.g., `@keyframes spin` for loaders). Use `clsx` for conditional: `clsx('btn', isLoading && 'opacity-50')`.  
- **Spacing/Typography**: Consistent scale: Spacing (0, 1, 2, 4, 6, 8, 12, 16); Font sizes (sm: 0.875rem, base: 1rem, lg: 1.125rem). Line-height 1.5; headings bold.  
- **Colors**: Semantic (text-primary, bg-surface); dark mode: `dark:` prefix.  
- **Responsive**: `sm:`, `md:`, etc.; mobile: Touch targets ≥44px.  
- **Animations**: Subtle (200ms ease-in-out); Framer Motion for modals/charts (e.g., fade-in on mount).  
- **Global Styles**: `/globals.css`: Reset (modern-normalize); body { font-family: Inter; }.

---

## 5. State Management & Data Flow
- **Zustand Stores**: Modular slices: `useAuthStore` (user/token), `useSitesStore` (sites list/filter), `useLeadsStore` (paginated leads). Persist via middleware (localStorage for theme).  
  Example:  
  ```tsx
  import { create } from 'zustand';
  export const useSitesStore = create((set) => ({
    sites: [],
    fetchSites: async (filter) => { /* SWR call */ set({ sites: data }); },
  }));
  ```  
- **API Integration**: Axios instance with baseURL (`/api/v1`), interceptors (auth header, error toasts). SWR for queries (e.g., `useSWR('/sites', fetcher)`); mutate on updates.  
- **Realtime**: Supabase `useRealtime` hook for channels (e.g., `leads` table → refetch on insert).  
- **Optimistic Updates**: For actions like qualify lead: Update local state → API call → Revert on error.  
- **Error Handling**: Global Axios interceptor → Toast; retry buttons for failures (e.g., deploy retry).

---

## 6. Routing & Navigation
- **Next.js App Router**: File-based: `/app/dashboard/page.tsx`, `/app/sites/[id]/page.tsx`.  
- **Navigation**: `<Link>` for internal; `useRouter` for programmatic (e.g., post-launch redirect).  
- **Protected Routes**: Middleware (`/middleware.ts`): Check auth → Redirect to `/login`.  
- **Dynamic Segments**: `[id]` for sites/leads; `loading.tsx` for suspense.  
- **Search Params**: URLState for filters (e.g., `/leads?status=qualified&page=2`); sync with Zustand.  
- **Mobile Nav**: Drawer component (Radix Slide) for sidebar; back button handling.

---

## 7. Performance & Optimization
- **Core Web Vitals**: LCP <2.5s (SSR critical paths); FID <100ms (pre-load bundles); CLS <0.1 (fixed layouts).  
- **Bundling**: Next.js Image for assets (domains: netlify.com); lazy-load charts/tables.  
- **Caching**: SWR revalidateOnFocus (5s stale); ISR for static pages (e.g., docs).  
- **Bundle Analysis**: `npm run analyze` (webpack-bundle-analyzer); target <200KB gzipped.  
- **SEO**: `<Head>` for titles/metas; sitemap.xml generated.  
- **Offline**: Basic PWA manifest; cache API responses with service worker (via next-pwa if needed).

---

## 8. Accessibility Guidelines
- **WCAG 2.1 AA Compliance**: Screen reader tested (VoiceOver/NVDA).  
- **Semantics**: `<h1>`-`<h6>` hierarchy; ARIA roles (e.g., `role="button"` on divs).  
- **Keyboard**: Focusable elements (Tab index); visible focus outlines (`focus:ring-2`).  
- **Contrast**: Min 4.5:1 (Tailwind: text-black on bg-white); color-blind friendly palette.  
- **Forms**: Labels for all inputs; error announcements (live regions: `aria-live="polite"` for toasts).  
- **Testing**: Axe-core in CI; manual audits for flows (e.g., batch launch).

---

## 9. Testing Guidelines
- **Unit/Integration**: Jest/RTL for components (e.g., `render(<Button />); fireEvent.click();`). 80% coverage (nyc).  
- **E2E**: Playwright (`.playwright/`) mirroring App Flows (e.g., `test('onboarding flow')` with mocks).  
- **Visual Regression**: Chromatic in Storybook for UI changes.  
- **Mocking**: MSW for API (e.g., handlers for `/sites`); Supabase mocks for realtime.  
- **CI**: GitHub Actions: `npm test` on PRs; E2E on merge.

---

## 10. Deployment & Maintenance
- **Build/Deploy**: Vercel (linked to GitHub); `npm run build` → Preview deploys on PRs. Env vars: NEXT_PUBLIC_SUPABASE_URL, etc.  
- **CDN**: Vercel Edge for global; Image Optimization enabled.  
- **Monitoring**: Vercel Analytics for vitals; Sentry for JS errors.  
- **Maintenance**: Weekly lint/test runs; changelog.md for releases. Deprecate unused components quarterly.  
- **Versioning**: Semantic (v1.0.0); changelog via conventional commits.

These guidelines ensure a polished, efficient frontend
**End of Document**