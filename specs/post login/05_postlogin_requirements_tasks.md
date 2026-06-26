# PoultryPulse AI — Post-Login Dashboard Requirements & Tasks Master
# File: 05_postlogin_requirements_tasks.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
ROLE: Senior Full-Stack Engineer + Dashboard Specialist
FOUNDATION: 04_postlogin_design_master.md + PRD v3.0 + Architecture v1.0 + UI/UX Design v1.0 §2.2
STACK: Next.js 15, TypeScript strict, Tailwind CSS v3, Recharts, Supabase SSR, Framer Motion
AUTH: Supabase Auth (phone OTP) + RLS per customer segment
ACCESS CONTROL: Role-based — S1=mobile only, S2=dashboard no admin, Admin=full access
NON-NEGOTIABLE: P10/P50/P90 always visible, never blank screens, never raw errors, 95%+ accuracy gate
```

---

## PART 1: FUNCTIONAL REQUIREMENTS

### FR-DASH-001: Authentication & Route Protection
**Priority:** P0

**Acceptance Criteria:**
- [ ] All `/dashboard/*` routes protected by Supabase session middleware
- [ ] Unauthenticated request → redirect to `/login?redirect=[original_path]`
- [ ] S1 customer (segment='S1') accessing `/dashboard` → redirect to `/mobile-only` page
- [ ] S2 customer accessing `/dashboard/accuracy` or `/dashboard/customers` → redirect to `/dashboard/403`
- [ ] Admin accessing any dashboard page → full access
- [ ] Middleware runs at Edge (Vercel) — `middleware.ts` in `apps/web/`
- [ ] Session refresh: auto-refresh Supabase session before expiry (SSR + client)
- [ ] Session expiry while active: modal prompt to re-login (not silent redirect)

---

### FR-DASH-002: Overview Page
**Priority:** P0

**Acceptance Criteria:**
- [ ] Fetch KPI data server-side from Supabase materialized views
- [ ] 4 metric cards render correctly with real data or graceful fallback
- [ ] 7-day forecast chart renders P10/P50/P90 bands — all three always visible (never hidden)
- [ ] Actual price scatter overlaid on chart for past days where data exists
- [ ] District coverage map (Leaflet.js) loads within 2s, highlights Gorakhpur + adjacent districts
- [ ] Mandi price table shows all 5 mandis with sell signal badges
- [ ] CSV download from table: `GET /api/export/predictions?from=today&to=today`
- [ ] Alerts feed (condensed, 5 items max) with link to full alerts page
- [ ] Empty alert state shows illustration, never blank
- [ ] Last-updated timestamp shown — stale if >24h with amber warning
- [ ] All data auto-refreshes every 10 minutes (SWR `refreshInterval`)
- [ ] Accuracy gate not cleared → metric card 3 shows "Validating..." not a number

---

### FR-DASH-003: Price Intelligence Page
**Priority:** P0

**Acceptance Criteria:**
- [ ] Forecast tab: Recharts AreaChart with P10/P50/P90 + actual overlay
- [ ] Mandi selector filters chart and table data
- [ ] Date range picker: default last 30 days, max 90 days
- [ ] Chart annotations: HPAI events (red band), weather events (amber band)
- [ ] Chart tooltip: date, P50, range, actual (if available), error %
- [ ] Price drivers panel: fetches latest 3 drivers from `predictions` table
- [ ] Historical tab: table with actual vs predicted, colour-coded by error %
- [ ] Historical table: sortable, filterable, paginated (30 rows/page)
- [ ] Download tab: form with mandi selector, date range, field checkboxes
- [ ] CSV download: streaming response, `Content-Disposition: attachment; filename=...`
- [ ] Download restricted to S2+: S1 customer sees upgrade prompt
- [ ] All charts accessible (aria-label, data table alternative)
- [ ] Chart renders at LCP < 1.5s (data pre-fetched server-side)

---

### FR-DASH-004: Alerts Page
**Priority:** P1

**Acceptance Criteria:**
- [ ] Active alerts fetched from Supabase `alerts` table WHERE `expires_at > now()` AND district matches customer
- [ ] Alert cards render correctly for each type (HPAI, weather, price, policy)
- [ ] HPAI alerts: red visual treatment, government advisory link, sell signal link
- [ ] Weather alerts: IMD source attribution, shed management tips
- [ ] Price warning alerts: link to price intelligence page
- [ ] Alert acknowledgement: POST to `/api/alerts/acknowledge` — logs action
- [ ] Alert history: past 90 days, filterable, exportable CSV
- [ ] Alert settings: WhatsApp/email/in-app toggles per alert type
- [ ] Settings save: PATCH to `/api/customers/[id]/alert-settings`
- [ ] Empty state: illustration + "सब ठीक है!" message — never blank
- [ ] Real-time alert push: Supabase Realtime subscription on `alerts` table

---

### FR-DASH-005: Calculator Page (S2 Integrators)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Batch profit calculator: inputs (flock size, batch age, avg weight, feed cost, other costs)
- [ ] Live calculation as inputs change (no submit button required)
- [ ] P50 price from latest Supabase prediction used in calculation
- [ ] 14-day profit projection chart: BarChart with colour-coded sell signals
- [ ] Optimal selling window highlighted on chart
- [ ] Feed cost timing: commodity prices from Supabase `macro_data` table
- [ ] Feed commodity 7-day sparklines
- [ ] "Buy now / Wait 3 days" recommendation with ₹ savings estimate
- [ ] Multi-farm view (integrators): card per farm (max 20), consolidated summary
- [ ] Farm grid: batch age, flock size, current signal, estimated harvest revenue
- [ ] Access gate: S1 customer → 403 redirect; S2+ → full access

---

### FR-DASH-006: Accuracy Page (Admin Only)
**Priority:** P0 (Mission-critical)

**Acceptance Criteria:**
- [ ] Role check: `role === 'admin'` — redirect to `/dashboard/403` otherwise
- [ ] Three accuracy gate indicators: directional accuracy, MAPE, conformal coverage
- [ ] Gate pass/fail badges: green ✓ PASS, red ✗ FAIL
- [ ] Critical banner shown (red, full-width, non-dismissable) when any gate fails
- [ ] Success banner shown (green) when all gates pass
- [ ] 90-day MAPE trend chart with pass/fail reference lines
- [ ] Directional accuracy by mandi (horizontal bar chart)
- [ ] Model registry table: last 10 versions, champion highlighted
- [ ] Manual retrain trigger button with confirmation modal
- [ ] Rollback action with double confirmation (destructive)
- [ ] All accuracy data from Supabase `accuracy_log` + `model_registry` tables
- [ ] Data refreshes every 5 minutes (accuracy is high-priority)
- [ ] Alert if accuracy drops: Supabase Realtime subscription on `accuracy_log`

---

### FR-DASH-007: Customers Page (Admin Only)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Role check: admin only
- [ ] Customer list fetched from Supabase `customers` table with RLS bypass (service_role)
- [ ] 4 KPI cards: active, trial, MRR, churn rate
- [ ] Customer table: all columns from design doc
- [ ] Phone masking: last 5 digits visible by default, full phone on hover (admin permission)
- [ ] Filters: segment, status, district — URL-synced
- [ ] Sort: any column, ASC/DESC
- [ ] Row expansion: subscription details, usage stats, WhatsApp delivery log
- [ ] Edit plan: PATCH `/api/admin/customers/[id]/plan` — admin action logged
- [ ] CSV export: all filtered results, fields as per UI/UX design
- [ ] Pagination: 25 rows/page, server-side (not client-side for performance)
- [ ] Search: Supabase ilike on phone + name

---

### FR-DASH-008: Settings Page
**Priority:** P1

**Acceptance Criteria:**
- [ ] Profile tab: editable farm name, district, flock size; phone non-editable
- [ ] Language change: immediate effect (cookie update + page reload)
- [ ] Notification settings: WhatsApp/email toggles per notification type
- [ ] Notification settings save: PATCH `/api/customers/[id]/notification-settings`
- [ ] Team tab (S2+): add/remove team members, role assignment
- [ ] Billing tab: current plan, next billing date, invoice history
- [ ] Cancel subscription: double confirmation modal, DPDP retention offer
- [ ] Data & privacy tab: download data (ZIP), delete account (hard delete after 30-day grace)
- [ ] Delete account: triggers DPDP erasure workflow, email confirmation required

---

## PART 2: TASK MASTER

### TASK GROUP DA: Dashboard Foundation

- [ ] **DA-01** — Dashboard root layout
  - `apps/web/app/(dashboard)/layout.tsx`
  - Left sidebar + top header + main content area
  - Auth middleware integration
  - Supabase SSR session check
  - Role-based sidebar item visibility
  - Responsive: sidebar overlay on mobile
  - Skip links (#main-dashboard-content, #sidebar-nav)
  - _Requirements: FR-DASH-001, Design §2.1–2.2_

  ```json
  {
    "dependencies": ["@supabase/ssr", "@supabase/supabase-js"],
    "qa_checks": [
      "S1 customer redirected to /mobile-only",
      "Session expiry modal appears (not silent redirect)",
      "Sidebar closes on navigation (mobile)",
      "All sidebar links have active state styling",
      "Skip link becomes visible on focus"
    ]
  }
  ```

- [ ] **DA-02** — Sidebar navigation component
  - `apps/web/components/dashboard/Sidebar.tsx`
  - Role-conditional nav item visibility
  - Active state detection via `usePathname()`
  - Subscription expiry countdown badge
  - Hamburger/close animation (mobile)
  - `'use client'`

- [ ] **DA-03** — Dashboard header component
  - `apps/web/components/dashboard/DashboardHeader.tsx`
  - Page title (dynamic)
  - District + Mandi selectors (context-aware dropdowns)
  - Refresh button with last-updated timestamp
  - Notification bell with unread count (Supabase Realtime)
  - User menu dropdown
  - `'use client'` for interactive elements

- [ ] **DA-04** — Supabase dashboard client utilities
  - `apps/web/utils/supabase/dashboard.ts`
  - `getAccuracyMetrics()` — fetches mv_accuracy_dashboard
  - `getLatestPredictions(mandi: MandiSlug, days: number)` — fetches predictions
  - `getActiveAlerts(district: string)` — fetches active alerts
  - `getCustomerList(filters: CustomerFilters, page: number)` — admin only
  - `getModelRegistry()` — admin only
  - All with proper TypeScript return types + error handling

- [ ] **DA-05** — Dashboard Recharts config
  - `apps/web/lib/charts/config.ts`
  - Shared chart defaults (margin, axis styles, tooltip styles)
  - P10/P50/P90 area definitions
  - `PredictionAreaChart` wrapper component with defaults applied
  - `AccuracyLineChart` wrapper
  - All charts: `<ResponsiveContainer>` for resize handling
  - All charts: hidden `<table>` alternative for screen readers

- [ ] **DA-06** — Loading skeleton components
  - `apps/web/components/dashboard/skeletons/`
  - `MetricCardSkeleton.tsx`
  - `ChartSkeleton.tsx` (matches chart dimensions)
  - `TableSkeleton.tsx` (10-row skeleton)
  - `AlertCardSkeleton.tsx` (3 items)
  - Shimmer animation via CSS `@keyframes shimmer`
  - No generic circular spinners on data displays

- [ ] **DA-07** — Empty state components (Leo Natsume)
  - `apps/web/components/dashboard/EmptyState.tsx`
  - Variants: `no-alerts`, `no-customers`, `no-data`, `no-api-key`, `loading-prediction`
  - Each with: illustration SVG, heading (Hindi), sub-text, optional CTA
  - Illustrations: consistent chicken character family (SVG, inline)

- [ ] **DA-08** — Error state components (Don Norman)
  - `apps/web/components/dashboard/ErrorState.tsx`
  - Variants: `network-error`, `data-stale`, `accuracy-gate-failed`, `forbidden`, `session-expired`
  - Human-friendly Hindi messages, never raw errors
  - Retry/action buttons where applicable
  - Critical errors (accuracy gate): non-dismissable banner

### TASK GROUP DB: Dashboard Pages

- [ ] **DB-01** — Overview page
  - `apps/web/app/(dashboard)/overview/page.tsx`
  - Server component: SSR for KPI cards and initial chart data
  - `OverviewKPICards` client sub-component (animated on data load)
  - `ForecastAreaChart` client sub-component (Recharts)
  - `AlertsFeed` client sub-component (Supabase Realtime)
  - `DistrictMap` client sub-component (Leaflet.js lazy-loaded)
  - `MandiPriceTable` server component (initial data SSR, SWR revalidate)
  - _Requirements: FR-DASH-002_

- [ ] **DB-02** — Price intelligence page
  - `apps/web/app/(dashboard)/price-intelligence/page.tsx`
  - Tabbed interface: Forecast | Historical | Download
  - Forecast tab: full AreaChart + price drivers panel + confidence explainer
  - Historical tab: paginated table, sortable, colour-coded
  - Download tab: form + preview + streaming CSV endpoint call
  - URL-synced tab state (`?tab=forecast`)
  - Mandi and date selectors synced to URL params
  - _Requirements: FR-DASH-003_

- [ ] **DB-03** — Alerts page
  - `apps/web/app/(dashboard)/alerts/page.tsx`
  - Tabbed: Active | History | Settings
  - Supabase Realtime subscription for new alerts
  - Alert type count badges
  - Alert card components per type (HPAI, weather, price, policy)
  - Acknowledge action with optimistic UI
  - Empty state illustration
  - _Requirements: FR-DASH-004_

- [ ] **DB-04** — Calculator page (S2 access gate)
  - `apps/web/app/(dashboard)/calculator/page.tsx`
  - Access check: redirect S1 to upgrade prompt
  - `BatchProfitCalculator` client component (live calculations)
  - `FeedCostTiming` client component
  - `MultiFarmView` client component (integrators)
  - Recharts BarChart for 14-day profit projection
  - _Requirements: FR-DASH-005_

- [ ] **DB-05** — Accuracy page (admin access gate)
  - `apps/web/app/(dashboard)/accuracy/page.tsx`
  - Admin role check — server-side
  - Three gate status components (large, prominent)
  - Critical/success banner component
  - 90-day MAPE trend chart
  - By-mandi accuracy bar chart
  - Model registry table with version actions
  - Manual retrain trigger with confirmation modal
  - _Requirements: FR-DASH-006_

- [ ] **DB-06** — Customers page (admin access gate)
  - `apps/web/app/(dashboard)/customers/page.tsx`
  - Admin role check
  - Server-side paginated fetch (service_role client)
  - KPI cards (MRR, active, trial, churn)
  - Filterable/sortable table with URL-synced state
  - Row expansion with usage details
  - Edit plan action with modal
  - CSV export button → streaming endpoint
  - _Requirements: FR-DASH-007_

- [ ] **DB-07** — Settings page
  - `apps/web/app/(dashboard)/settings/page.tsx`
  - Tabbed settings (Profile, Notifications, Team, Billing, Data & Privacy)
  - All form saves with optimistic UI + error rollback
  - Delete account: 3-step confirmation (DPDP erasure flow)
  - Cancel subscription: retention modal with offer
  - _Requirements: FR-DASH-008_

- [ ] **DB-08** — API access page (Enterprise access gate)
  - `apps/web/app/(dashboard)/api/page.tsx`
  - Plan check: PulseIntel only
  - API key display/rotate/generate
  - Usage chart + rate limit bar
  - Webhook configuration
  - Code snippet examples (cURL, Python, Node, PHP) with copy button
  - Swagger docs link
  - _Requirements: Design §D-05_

- [ ] **DB-09** — 403 Forbidden page (dashboard)
  - `apps/web/app/(dashboard)/403/page.tsx`
  - Friendly error (Don Norman — no raw 403)
  - Shows which plan/role is required
  - Upgrade CTA or "Contact Admin" CTA
  - Not a Next.js error page — custom dashboard-styled page

- [ ] **DB-10** — Mobile-only redirect page
  - `apps/web/app/(dashboard)/mobile-only/page.tsx`
  - Shown to S1 farmers who somehow access web dashboard
  - "यह Dashboard S2+ plan के लिए है" message
  - App download links (App Store + Play Store)
  - WhatsApp support link
  - No sidebar (public-style layout)

### TASK GROUP DC: Dashboard API Routes

- [ ] **DC-01** — CSV export endpoint
  - `apps/web/app/api/export/predictions/route.ts`
  - Auth: Supabase session check, S2+ only
  - Query params: mandi (multi), from, to (max 90 days)
  - Streams CSV directly (no in-memory buffer for large exports)
  - Headers: Content-Disposition, Content-Type text/csv
  - _Requirements: FR-DASH-003, UI/UX Design §2.2_

- [ ] **DC-02** — Alert acknowledge endpoint
  - `apps/web/app/api/alerts/acknowledge/route.ts`
  - POST: `{ alert_id: string }`
  - Auth: Supabase session, any dashboard role
  - Inserts to `alert_acknowledgements` table with customer_id + timestamp
  - Returns updated alert status

- [ ] **DC-03** — Notification settings endpoint
  - `apps/web/app/api/customers/[id]/notification-settings/route.ts`
  - PATCH: notification preferences object
  - Auth: session check, customer can only update own settings
  - Updates Supabase `customer_notification_settings` table

- [ ] **DC-04** — Admin: update customer plan endpoint
  - `apps/web/app/api/admin/customers/[id]/plan/route.ts`
  - Auth: admin role only (service_role)
  - PATCH: `{ plan: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL', expires_at: string }`
  - Logs action to `admin_audit_log`
  - Returns updated customer record

- [ ] **DC-05** — Retrain trigger endpoint
  - `apps/web/app/api/admin/retrain/route.ts`
  - Auth: admin role only
  - POST: triggers Airflow DAG via Astronomer.io REST API
  - Rate limit: max 1 per 6 hours (prevent runaway retrains)
  - Logs to `retrain_requests` table
  - Returns: `{ triggered: true, dag_run_id: string }`

- [ ] **DC-06** — API key management endpoint
  - `apps/web/app/api/dashboard/api-keys/route.ts`
  - GET: returns masked current key + metadata
  - POST: generate new key (invalidates old)
  - Auth: PulseIntel plan required
  - Keys stored as bcrypt hash in Supabase, prefix stored in plain (for display)
  - Rate limit: 3 key rotations per day

### TASK GROUP DD: Real-Time Features

- [ ] **DD-01** — Supabase Realtime subscription hook
  - `apps/web/hooks/useRealtimeAlerts.ts`
  - Subscribes to `alerts` table INSERT events for customer's district
  - On new alert: toast notification + updates alerts feed (SWR mutate)
  - Cleanup on unmount
  - `'use client'` only

- [ ] **DD-02** — Accuracy gate Realtime monitor (admin)
  - `apps/web/hooks/useAccuracyGateMonitor.ts`
  - Subscribes to `accuracy_log` table INSERT events
  - On new record: check if gate breached → fire `aria-live="assertive"` announcement
  - Update critical banner visibility
  - Admin dashboard only

- [ ] **DD-03** — Price data SWR configuration
  - `apps/web/lib/swr/predictions.ts`
  - `usePredictions(mandi: MandiSlug)` — fetches from `/api/data/predictions`
  - `refreshInterval: 600000` (10 minutes)
  - `revalidateOnFocus: true`
  - Fallback data from SSR pre-fetch (no loading flash)
  - Error boundary: shows stale data banner, not error state

### TASK GROUP DE: Testing (Dashboard)

- [ ] **DE-01** — Auth middleware tests
  - S1 redirect to /mobile-only
  - S2 redirect to /dashboard/403 for admin pages
  - Unauthenticated redirect to /login with ?redirect param
  - Session expiry modal trigger

- [ ] **DE-02** — Dashboard E2E tests (Playwright)
  - Admin login → overview page loads with real data
  - Price intelligence: forecast chart renders all 3 bands
  - Alerts: new alert appears via Realtime
  - Calculator: profit calculation updates on input change
  - Accuracy page: gate indicators render correctly
  - CSV export: download completes, file is valid CSV

- [ ] **DE-03** — Accessibility audit (dashboard)
  - All charts: data table alternatives present
  - Table: all headers have scope="col"
  - Modals: focus trap, return focus on close
  - Realtime announcements: aria-live regions tested with screen reader

---

## PART 3: MOBILE-ONLY PAGE (for S1 farmers on web)

### FR-MOBILE-ONLY-001

**File:** `apps/web/app/(dashboard)/mobile-only/page.tsx`

```
Design:
  Centered, no sidebar, full viewport
  Brand header (logo + tagline)
  
  Headline (Hindi): "PulseFarm App डाउनलोड करें"
  Sub: "यह web dashboard S2 Integrator plan के लिए है। आपका PulseFarm plan mobile app पर काम करता है।"
  
  App download buttons:
    iOS App Store button (standard Apple design guidelines)
    Android Play Store button (standard Google design guidelines)
    
  WhatsApp CTA: "WhatsApp पर daily signal पाएं →"
  
  Upgrade teaser: "S2 Integrator plan पर upgrade करें → Web dashboard access पाएं"
  
  Support: "मदद चाहिए? हमसे WhatsApp पर बात करें →"
```

---

*Document: 05_postlogin_requirements_tasks.md*
*Next: 06_content_seo_master.md*
