# PoultryPulse AI — Integrator Farm Management & Daily Metrics Requirements & Tasks
# File: 16_integrator_farms_requirements_tasks.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL
# Design Source: 14_integrator_farms_design_master.md
# Task Source:   15_integrator_farms_tasks_master.md

---

## AGENT CONTEXT BLOCK
```
ROLE: Senior Full-Stack Engineer + Poultry Integrator Dashboard Specialist
FOUNDATION:
  14_integrator_farms_design_master.md  — UI/UX spec, tokens, page designs, DB schema
  15_integrator_farms_tasks_master.md   — Task implementations, API routes, test cases
  04_postlogin_design_master.md         — Base design system (tokens, typography, spacing)
  13_postlogin_tasks_master.md          — Base task patterns and output format
  PRD v3.0 §3                           — S2 Integrator segment definition
  TRD v1.0                              — Supabase schema, Railway, Airflow stack
STACK: Next.js 15 App Router, TypeScript strict, Tailwind CSS v3, Recharts, Framer Motion,
       Supabase SSR + Realtime, react-hook-form, Zod, idb-keyval, Puppeteer, canvas-confetti
AUTH: Supabase Phone OTP + middleware-enforced RLS (integrator_id = auth.uid())
ACCESS CONTROL: S2 Integrators only for /farms and /metrics routes; Admin = full access
NON-NEGOTIABLE:
  - RLS on every query: integrator sees ONLY their own farms
  - Daily log form: fully usable at 375px viewport (mobile-first)
  - FCR / mortality / cumulative deaths: computed server-side — never trust client values
  - NEVER blank screens: skeleton → data → empty state (Hindi illustrated)
  - NEVER raw errors: friendly Hindi + English messages (Don Norman principle)
  - Offline log draft: IndexedDB via idb-keyval, auto-submit on reconnect
  - SUPABASE_SERVICE_ROLE_KEY must NEVER appear in client components
NEW_ROUTES:
  /dashboard/farms                  — Farm portfolio overview
  /dashboard/farms/[id]             — Single farm detail (5 tabs)
  /dashboard/farms/[id]/daily-log   — Daily metric entry form
  /dashboard/farms/new              — Onboard new farm (4-step wizard)
  /dashboard/farms/compare          — Cross-farm performance comparison
  /dashboard/metrics                — Aggregated portfolio metrics
  /dashboard/metrics/fcr            — FCR trend and analysis
  /dashboard/metrics/mortality      — Mortality tracking and alerts
  /dashboard/metrics/feed           — Feed consumption and cost management
  /dashboard/metrics/health         — Flock health log and disease tracker
  /dashboard/reports/integrator     — Batch closure and performance reports
```

---

## PART 1: FUNCTIONAL REQUIREMENTS

---

### FR-FARM-001: Route Access Control & Middleware
**Priority:** P0

**Acceptance Criteria:**
- [ ] All `/dashboard/farms/*` and `/dashboard/metrics/*` routes protected by extended `middleware.ts`
- [ ] Only `segment === 'S2'` or `role === 'admin'` may access these routes
- [ ] All other segments (S1, S3, S4, S5, S6) → redirect `/dashboard/403`
- [ ] All `/api/farms/*`, `/api/metrics/*`, `/api/reports/*` routes return `403` JSON for non-S2 non-admin
- [ ] Unauthenticated requests → redirect `/login?redirect=[original_path]`
- [ ] RLS enforced at both middleware layer AND Supabase query layer (defence in depth)
- [ ] `farmId` in URL belonging to a different integrator → returns `404` (not `403` — do not leak farm existence)

---

### FR-FARM-002: Farm Portfolio Page (`/dashboard/farms`)
**Priority:** P0

**Acceptance Criteria:**
- [ ] Portfolio KPI bar: 4 cards — Total Live Birds, Portfolio FCR (weighted avg), Portfolio Mortality %, Total Feed Consumed (this week)
- [ ] KPI cards fetched SSR from `farm_metrics_summary` materialized view — no loading flash on first paint
- [ ] Each KPI card: trend arrow vs previous equivalent period; click navigates to relevant metric detail page
- [ ] Farm cards grid: responsive — 3-col at ≥1280px, 2-col at ≥768px, 1-col at <768px
- [ ] Each farm card displays: name, status badge, active batch number, birds alive, batch day, FCR badge, mortality badge, last log status chip, 7-day weight sparkline
- [ ] Farm card left-border: `3px solid` coloured by status — green (active), amber (log pending), grey (between batches), red (paused)
- [ ] "Today's log missing" state: amber left-border + "⚠ आज का log pending" row on card if `last_log_date < today` (IST)
- [ ] Hover animation: `scale(1.01)` + `cardHoverShadow` via Framer Motion, 150ms duration
- [ ] Filter by status: All | Active | Between Batches | Paused — URL query param synced
- [ ] Sort by: name | FCR | mortality | bird count | last log — URL query param synced
- [ ] Search: debounced 300ms, Supabase `ilike` on farm name
- [ ] [+ Add Farm] button links to `/dashboard/farms/new`
- [ ] [Compare Farms] button: visible when ≥2 farms exist; links to `/dashboard/farms/compare`
- [ ] Sidebar "My Farms" nav item: badge showing count of active farms (SWR, 5-min refresh)
- [ ] SWR: `refreshInterval: 300000`, `revalidateOnFocus: true`
- [ ] Empty state (no farms): chicken-with-clipboard illustration + Hindi heading "पहला Farm जोड़ें" + CTA; never blank

---

### FR-FARM-003: Single Farm Detail Page (`/dashboard/farms/[farmId]`)
**Priority:** P0

**Acceptance Criteria:**
- [ ] Server-side RLS check: `farms.integrator_id = auth.uid()` — `notFound()` if fails (no 403 leak)
- [ ] Farm header band: name (pageTitle style), district + village + GPS, farm type badge, capacity badge, status badge, active batch badge
- [ ] Current batch summary strip: placement date, batch day counter, breed, birds placed, birds alive, cumulative mortality %, harvest progress bar with day markers (Day 0, Day 14, Day 35 harvest window, Day 42+)
- [ ] 5 tabs: Metrics | Daily Log | Health | Feed | Batch History — URL-synced (`?tab=metrics`)
- [ ] All tabs: lazy-loaded via `React.lazy` + `Suspense` with layout-matching skeleton
- [ ] **Metrics tab:** 5 Recharts charts — FCR Trend (Line + benchmark), Mortality Cumulative (Area + daily bar), Weight Progression (Actual vs Target vs Breed Standard), Feed Intake per Bird (Bar + rolling avg), Daily Weight Gain (Bar, colour-coded vs target)
- [ ] All charts: target/benchmark reference lines visible; aria-label on `ResponsiveContainer`; hidden `<table>` data alternative for screen readers
- [ ] **Daily Log tab:** table (30 rows/page, server-paginated); amber row tint if daily mortality >1.5%; [+ Log Today's Data] button if today not logged; [Export CSV] button
- [ ] **Health tab:** vaccination schedule table; disease event timeline; symptom quick-log inline card
- [ ] **Feed tab:** inventory tracker with stock level progress bar; feed purchase log table; feed cost summary card
- [ ] **Batch History tab:** all closed batches paginated; each row links to batch report
- [ ] [Log Today's Data] button: visible in Metrics + Daily Log tabs if today not logged
- [ ] More actions dropdown: Start New Batch (modal) | Mark Between Batches | Download Farm Report (PDF) | Archive Farm (destructive, confirmation required)
- [ ] Farm with no active batch: "No active batch" state in batch strip — not an error

---

### FR-FARM-004: Daily Metric Log Entry Form (`/dashboard/farms/[farmId]/daily-log`)
**Priority:** P0

**Acceptance Criteria:**
- [ ] Form fully functional at 375px, 390px, 430px viewport widths
- [ ] All inputs ≥52px height on mobile; font-size ≥16px on all inputs (prevents iOS auto-zoom)
- [ ] Number inputs: `inputMode="numeric"` + `pattern="[0-9]*"`
- [ ] Date: auto-set to today (IST); allows backdating up to 7 days; >7 days → "Admin approval required" message
- [ ] **Section A (Mortality — required):** deaths today (int), cause dropdown; auto-computes cumulative deaths + cumulative mortality % from DB SUM (server-side, not client calculation); status indicator (🟢 Normal / 🟡 Elevated / 🔴 Critical)
- [ ] **Section B (Feed — required):** feed consumed kg, feed type; auto-computes feed/bird/day
- [ ] **Section C (Weight — conditional):** "weigh-in today?" toggle; if yes: sample birds + sample weight kg; auto-computes avg weight g, FCR; shows delta vs target + vs last weigh-in
- [ ] **Section D (Water/Environment — optional):** water litres, min temp °C, max temp °C, humidity %; collapsed by default on mobile
- [ ] **Section E (Health — optional):** "कोई health issue?" toggle; if yes: multi-select symptoms, severity segmented control, 200-char notes; collapsed by default on mobile
- [ ] **Section F (Notes — optional):** 500-char textarea with counter
- [ ] Section collapse on mobile: Framer Motion `AnimatePresence` height animation; `aria-expanded` on section header toggle buttons
- [ ] [Submit] button: disabled until Sections A + B are complete; `aria-busy="true"` during submission; fixed-bottom full-width at mobile (56px height)
- [ ] Submit: `POST /api/farms/[farmId]/daily-log`; optimistic UI; success → redirect to `/dashboard/farms/[farmId]?tab=daily-log&success=1`
- [ ] Autosave draft: every 30 seconds → IndexedDB via `idb-keyval`; key `daily-log-draft-[farmId]-[date]`; draft saved badge visible
- [ ] Offline mode: amber banner (`aria-live="polite"`); form works offline; draft stored in IndexedDB; auto-submit on `window.addEventListener('online')`
- [ ] Already logged today: show read-only "AlreadyLogged" card with submitted values + [Edit] option; edit mode sets `is_amended = true` on re-submit
- [ ] Duplicate submission detected (409 from API): modal — "आज का log पहले submit हो चुका है। Edit करना चाहते हैं?" with [Edit Existing Log] / [Cancel]
- [ ] Log >7 days old: locked for integrator; admin override only (shows grey lock icon + "Admin required" tooltip)
- [ ] WhatsApp reminder: sent at 08:00 IST next day via Airflow DAG if prior day's log missing
- [ ] Late entry (past 20:00 IST): yellow banner "यह [date] का log है — आज late submit हो रहा है"

---

### FR-FARM-005: Add New Farm Wizard (`/dashboard/farms/new`)
**Priority:** P0

**Acceptance Criteria:**
- [ ] 4-step wizard with step indicator at top (4 circles connected by line; filled = complete, active = bordered, upcoming = grey)
- [ ] **Step 1 (Farm Info):** farm name (60 char max), farm type radio (Broiler/Layer/Breeder), state dropdown (default: Uttar Pradesh), district dropdown (linked to state), block/tehsil (optional), village (optional), GPS via `navigator.geolocation` or manual lat/lon, manager name + phone (optional); Leaflet.js map preview if lat/lon present
- [ ] **Step 2 (Shed Setup):** shed count input (1–20); per-shed: name, capacity, shed type radio, floor type radio; sheds managed via `react-hook-form useFieldArray`; [+ Add Shed] / [Remove] per shed (min 1); total farm capacity auto-computed (read-only)
- [ ] **Step 3 (First Batch — optional):** "पहला Batch अभी setup करें?" toggle; if yes: breed dropdown (Cobb 430, Ross 308, Hubbard, Vencobb, Srinivasa, Other), DOC supplier, placement date, birds placed, price per DOC (₹, optional), target harvest age (default 42 days), target market weight (default 2100g), feed supplier; if skip → farm created with `status='between_batches'`
- [ ] **Step 4 (Review):** summary card of all entered data; edit links per section navigate back to correct step; [Save Farm & Start Tracking] primary submit button
- [ ] Per-step Zod validation: cannot advance if current step invalid; can always go back
- [ ] Wizard state persisted to `sessionStorage` key `'farm-wizard-draft'` on every step; restored on page refresh
- [ ] Submit: `POST /api/farms` (transactional: farm + sheds + optional batch); if any step fails → rollback, friendly error on Step 4
- [ ] Success: `canvas-confetti` burst 1.5s (brandGreen700 + gold) + redirect to `/dashboard/farms/[newFarmId]`
- [ ] Max 50 farms per integrator: on wizard mount, `GET /api/farms/count`; if ≥50 → "limit reached" page instead of wizard
- [ ] District dropdown data: served from `/api/reference/districts` (static JSON)

---

### FR-FARM-006: Farm Compare Page (`/dashboard/farms/compare`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Access: S2 integrators with ≥2 farms; <2 farms → empty state with "Add another farm" CTA
- [ ] Farm multi-select: pill UI showing all integrator farms; select 2–5; 6th selection → toast "Maximum 5 farms compared at once"
- [ ] Period selector: This Week | This Month | This Batch Cycle | Custom date range (segmented control)
- [ ] Recharts `RadarChart`: 6 axes — FCR, Mortality, ADG, Feed Efficiency, Harvest Weight, Batch Duration; all metrics normalised 0–100 for display; actual values in tooltip
- [ ] One polygon per farm; distinct non-red/non-green colour palette (blue, orange, purple, teal, rose) — colourblind safe
- [ ] Legend: farm name (truncated 15 chars) + colour swatch
- [ ] Comparison table below radar: metrics as rows, farms as columns; best-in-column cell has faint green background; industry avg column from anonymised aggregate
- [ ] Industry avg: sourced from `/api/metrics/industry-averages`; hidden if <10 farms in aggregate (privacy guard)
- [ ] URL state: `?farms=uuid1,uuid2&period=30d` — shareable link preserves selection
- [ ] [Download Comparison PDF] button → `POST /api/reports/compare { farmIds, period }` → signed download URL
- [ ] `aria-label` on `RadarChart`: "Farm performance radar chart comparing [farm names]"
- [ ] Radar chart: hidden data table below as screen reader alternative

---

### FR-FARM-007: Portfolio Metrics Dashboard (`/dashboard/metrics`)
**Priority:** P0

**Acceptance Criteria:**
- [ ] 5 portfolio KPI cards: Total Live Birds, Portfolio FCR (weighted avg), Portfolio Mortality %, Total Feed Consumed, Estimated Revenue at Harvest — fetched SSR from `farm_metrics_summary`
- [ ] Period selector (top-right): This Week | This Month | This Batch Cycle | Custom — affects all charts
- [ ] FCR Trend chart (Recharts `LineChart`): one line per active farm + portfolio avg line + industry avg dashed line; all lines labelled in legend
- [ ] Mortality Events Timeline (Recharts `ComposedChart`): stacked bars by farm + cumulative % line (secondary Y-axis); click any bar → `/dashboard/farms/[farmId]?tab=daily-log&date=[date]`
- [ ] Farm Performance League Table: sorted by FCR ascending; Rank 1 = Phosphor `Trophy` icon; last rank = amber flag icon; row click → `/dashboard/farms/[id]`
- [ ] Pending Actions Panel: farms missing today's log, overdue vaccinations, low feed stock (<5 days); each item links to relevant action
- [ ] Realtime: `useRealtimeFarmLogs` hook — new `daily_logs` INSERT → pending count updates without full page reload
- [ ] SWR: `refreshInterval: 300000`
- [ ] Empty state (no farms): illustrated empty state + "Farm जोड़ें →" CTA; never blank

---

### FR-FARM-008: FCR Analysis Page (`/dashboard/metrics/fcr`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Portfolio FCR trend chart: `LineChart`, configurable 30/90-day period; farm pill filter (multi, default = all); portfolio avg + industry avg dashed overlay
- [ ] FCR by Farm horizontal bar chart: sorted ascending (best FCR at top); bars coloured by `FarmMetricTokens.fcr*` bands (Excellent <1.7 green, Good 1.7–1.9 lime, Warning 1.9–2.1 amber, Critical >2.1 red)
- [ ] Click bar → opens `FarmDetailDrawer` (right side panel, Framer Motion slide-in); drawer: farm name, current batch day, FCR sparkline, quick links; Escape key closes; focus trap; focus returns to trigger on close
- [ ] FCR Breakdown Table: Farm | Batch # | Avg Age | Feed/Bird/Day | Avg Weight | FCR | vs Last Batch | vs Industry; sortable, [Export CSV] → `GET /api/metrics/fcr/export`
- [ ] FCR Recommendations card (rule-based, Phase 1): `/api/metrics/fcr-recommendations?farmId=[id]`; recommendations in Hindi + English; disclaimer card "यह सुझाव हैं — poultry expert से confirm करें" always visible, `aria-describedby` pointing to disclaimer
- [ ] All charts: `aria-label` + hidden data table for screen reader access

---

### FR-FARM-009: Mortality Tracking Page (`/dashboard/metrics/mortality`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Alert strip (Realtime): farms with cumulative mortality >3% (elevated) or >5% (critical) shown as red banner; dismissable per session (`sessionStorage` key per farmId); links to farm detail
- [ ] Cumulative mortality area chart: Recharts `AreaChart`; one area per farm (overlaid, not stacked); reference lines at 3% (amber, labelled "Elevated") and 5% (red, labelled "Critical")
- [ ] Daily death events stacked bar: Recharts `BarChart`; deaths per day stacked by farm; click bar → farm daily log for that date
- [ ] Cause of death donut chart: Recharts `PieChart` (innerRadius 60, outerRadius 90); shown only when any `death_cause` data logged; if no cause data → info banner "Daily log में cause enter करें — better analysis के लिए"
- [ ] Mortality log table: all farms × selected period; columns: Farm | Date | Day # | Deaths | Cause | Cumulative % | Action Taken; sortable, date desc default; [Export CSV]
- [ ] HPAI correlation: cross-reference `alerts` table for active district HPAI alert; if HPAI alert active + farm mortality elevated → combined red warning card shown

---

### FR-FARM-010: Feed Management Page (`/dashboard/metrics/feed`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Feed consumption chart: Recharts `ComposedChart`; stacked bars (kg/day per farm) + efficiency line (gm/bird/day, secondary Y-axis); two Y-axes must not overlap labels
- [ ] Feed cost table: Farm | Batch | Feed Type | Qty (MT) | Rate (₹/kg) | Total Cost | Cost/kg Produced; total row (bold, portfolio sum); [Export CSV] → `GET /api/metrics/feed/export`
- [ ] Feed rate trend chart: `LineChart`; purchase price per kg over 6 months from `feed_purchases`; overlay NCDEX maize index from `macro_data` table if available; gap in line where no purchases (do not interpolate)
- [ ] Low stock alert cards: farms where estimated days remaining <7; calculation: `remaining_feed = total_purchased - cumulative_consumed`; `days_remaining = remaining / (7-day avg daily consumption)`; uses IST dates throughout
- [ ] [Order Now] WhatsApp CTA per low-stock farm: `https://wa.me/{supplier_phone}?text={URL-encoded message}` opens in new tab
- [ ] Feed efficiency comparison table per farm: Farm | Avg Feed/Bird/Day (this batch) | Target | Variance | Status badge

---

### FR-FARM-011: Health Log & Disease Tracker (`/dashboard/metrics/health`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Portfolio health grid: CSS Grid `auto-fill 160px`; one cell per farm; colour = current health status derived from `daily_logs.health_issue` + `alerts` table; click → `/dashboard/farms/[id]?tab=health`; colour status not communicated by colour alone — text label always present
- [ ] Vaccination compliance table: Farm | Vaccine | Due Date | Status | Days Overdue | Notes; overdue rows (`due_date < today IST AND status = 'pending'`) have `DC2626` red left-border + bold text; `<VaccinationStatusBadge>` component: Pending | Done | Overdue | Skipped
- [ ] Health event timeline: chronological, newest first; each entry: date chip, farm name, severity badge, symptoms array, notes; filter: All | Critical | Moderate | Mild (segmented control)
- [ ] HPAI district alert integration: fetch `alerts WHERE type='HPAI' AND district=[integrator_district]`; if active → red banner + biosecurity checklist (10 items, DADF guidelines); checklist state saved to `health_checklist_state` Supabase table (persists across sessions); if no alert → "🟢 कोई HPAI advisory नहीं है" message

---

### FR-FARM-012: Batch Report Page (`/dashboard/reports/integrator`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Access via `?batchId=[uuid]`; RLS: `batch.farm.integrator_id = auth.uid()` OR admin; others → `404`
- [ ] 7 report sections: Batch Summary | Growth Performance | Mortality Analysis | Feed Summary | Health Log Summary | Financial Summary | Recommendations for Next Batch
- [ ] Financial Summary: revenue = `birds_harvested × avg_weight × predictions.p50` (P50 price from `predictions` table at harvest date + farm district); disclaimer "Revenue estimated at PoultryPulse P50 price. Actual realised price may vary." always visible, cannot be hidden
- [ ] Batch data locked after `batch.status = 'closed'`: no edit links shown; data immutable
- [ ] [Download PDF]: `GET /api/reports/[batchId]/pdf`; Puppeteer-rendered; filename `batch-[batchNumber]-report.pdf`; idempotent (returns existing if already generated)
- [ ] [Export CSV]: raw daily log data for this batch
- [ ] [Share via WhatsApp]: signed URL (7-day expiry) sent via Twilio WhatsApp to integrator phone
- [ ] Print layout (`?print=true`): no sidebar, no navigation, clean 7-section print CSS
- [ ] Rate limit: 5 PDF generations per integrator per hour (Upstash Redis); 6th → `429` with friendly message

---

## PART 2: TASK MASTER

---

### TASK GROUP FF: FARM FOUNDATION

- [ ] **FF-01** — Farm Module Route Guard Middleware Extension
  - `apps/web/middleware.ts` _(extend existing from DA-01)_
  - Adds `/dashboard/farms/*` and `/dashboard/metrics/*` to route guards
  - Segment check: `S2` or `admin` only; all others → `/dashboard/403`
  - API routes `/api/farms/*`, `/api/metrics/*`, `/api/reports/*` → `403` JSON for non-S2
  - _Requirements: FR-FARM-001_

  ```json
  {
    "dependencies": ["existing middleware.ts"],
    "qa_checks": [
      "S1 → /dashboard/farms → /dashboard/403",
      "S3 → /dashboard/metrics → /dashboard/403",
      "S2 → /dashboard/farms → allowed",
      "Admin → /dashboard/farms → allowed",
      "API /api/farms/* with S1 session → 403 JSON response"
    ]
  }
  ```

---

- [ ] **FF-02** — Farm Portfolio Page
  - `apps/web/app/(dashboard)/farms/page.tsx`
  - Server component: SSR KPI cards from `farm_metrics_summary`; client sub-components for filter/sort/search
  - `<PortfolioKPIBar>`, `<FarmSearchFilter>`, `<FarmCardsGrid>`, `<FarmCard>`, `<EmptyFarmsState>`
  - SWR: `refreshInterval: 300000`; URL-synced filter + sort state
  - _Requirements: FR-FARM-002_

  ```json
  {
    "dependencies": ["swr", "framer-motion", "@supabase/ssr"],
    "exports": ["FarmsPage"],
    "qa_checks": [
      "KPI cards: SSR data, no loading flash on first paint",
      "Farm card with missing today's log: amber left-border + warning text (IST date check)",
      "FCR badge colour matches FarmMetricTokens correctly for each band",
      "Search debounce 300ms — no excessive Supabase calls",
      "Filter change → URL param updates → page refresh preserves state",
      "Empty state: illustration + Hindi CTA (never blank)",
      "Grid: 3 columns at 1280px, 2 at 768px, 1 at 480px",
      "RLS: no other integrator's farms appear (test with 2 integrator accounts)"
    ]
  }
  ```

---

- [ ] **FF-03** — Single Farm Detail Page
  - `apps/web/app/(dashboard)/farms/[farmId]/page.tsx`
  - Server: RLS farm fetch → `notFound()` if not owner; batch fetch; pass to client tabs
  - Client tabs: Metrics (5 charts) | Daily Log (table) | Health | Feed | Batch History
  - All tabs: `React.lazy` + `Suspense` with layout-matching skeletons
  - _Requirements: FR-FARM-003_

  ```json
  {
    "dependencies": ["recharts", "framer-motion", "@supabase/ssr"],
    "exports": ["FarmDetailPage"],
    "qa_checks": [
      "farmId owned by different integrator → 404 (not 403)",
      "All 5 Metrics charts render with data; skeletons during tab switch",
      "Each chart: aria-label + hidden data table for screen readers",
      "Log Today's Data button: visible in Metrics + Daily Log tabs if today not logged (IST)",
      "Batch progress bar: correct current day marker",
      "Farm with no active batch: shows 'no active batch' state — not an error",
      "Tab URL sync: ?tab=health → correct tab active on load"
    ]
  }
  ```

---

- [ ] **FF-04** — Daily Metric Log Entry Form
  - `apps/web/app/(dashboard)/farms/[farmId]/daily-log/page.tsx`
  - `'use client'` — full client component; react-hook-form + Zod; idb-keyval offline draft
  - 6 sections: Mortality (req) | Feed (req) | Weight (conditional) | Environment (opt) | Health (opt) | Notes (opt)
  - All computed fields (FCR, cumulative mortality, feed/bird): calculated server-side after submit, displayed read-only client-side
  - _Requirements: FR-FARM-004_

  ```json
  {
    "dependencies": ["react-hook-form", "@hookform/resolvers", "zod", "idb-keyval", "framer-motion"],
    "exports": ["DailyLogPage"],
    "qa_checks": [
      "Form functional at 375px, 390px, 430px viewport widths",
      "All inputs ≥52px height on mobile",
      "Number inputs trigger numeric keyboard (inputMode=numeric) — test on iOS + Android",
      "Autosave: IndexedDB draft exists 31s after page load",
      "Offline: fill form → go offline → submit → queue → auto-submits on reconnect",
      "Already logged today: read-only card shown; edit button triggers edit mode",
      "Submit disabled until deaths_today + feed_consumed_kg filled",
      "Backdate -8 days (non-admin): friendly 'Admin required' message (not raw 403)",
      "Duplicate submit: 409 → modal with 'Edit Existing Log' option",
      "Font size ≥16px on all inputs (no iOS zoom on focus)"
    ]
  }
  ```

---

- [ ] **FF-05** — Add New Farm Wizard
  - `apps/web/app/(dashboard)/farms/new/page.tsx`
  - 4-step wizard: step indicator, per-step Zod schemas, sessionStorage draft persistence
  - Step 2: `react-hook-form useFieldArray` for dynamic shed list (1–20 sheds)
  - GPS: `navigator.geolocation` + Leaflet.js map preview
  - Submit: `POST /api/farms`; success: `canvas-confetti` + redirect
  - _Requirements: FR-FARM-005_

  ```json
  {
    "dependencies": ["react-hook-form", "zod", "canvas-confetti", "leaflet"],
    "exports": ["NewFarmPage"],
    "qa_checks": [
      "Step indicator: fills correctly at each step",
      "Cannot advance past step with Zod validation errors",
      "Can always navigate backward",
      "Page refresh mid-wizard: wizard state restored from sessionStorage",
      "Shed array: add up to 20; cannot remove below 1",
      "Total capacity auto-computed from shed capacities sum",
      "GPS capture works on mobile (HTTPS required)",
      "Batch skip: farm created with status='between_batches', no batch record in DB",
      "Confetti fires on success, ~1.5s duration",
      "51st farm attempt → 'limit reached' page (not wizard)",
      "POST is transactional: shed insert failure → farm also rolled back"
    ]
  }
  ```

---

- [ ] **FF-06** — Farm Compare Page
  - `apps/web/app/(dashboard)/farms/compare/page.tsx`
  - `'use client'`; farm pill multi-select (max 5); Recharts `RadarChart` + comparison table
  - Normalises all metrics 0–100 for radar display; actual values in tooltip
  - URL state: `?farms=uuid1,uuid2&period=30d`; PDF export via `/api/reports/compare`
  - _Requirements: FR-FARM-006_

  ```json
  {
    "dependencies": ["recharts", "swr"],
    "exports": ["FarmComparePage"],
    "qa_checks": [
      "Cannot select <2 or >5 farms; 6th selection shows helpful toast",
      "Radar chart renders with 2, 3, 4, 5 farms",
      "Best-in-column: FCR = lowest is best; ADG = highest is best",
      "URL updates on selection; shareable link preserves state",
      "Only 1 farm: empty state + 'Add another farm' CTA",
      "Period change: all data refetches",
      "RLS: only integrator's own farms appear in selector",
      "industry-averages: hidden if <10 farms in aggregate"
    ]
  }
  ```

---

- [ ] **FF-07** — Farm Shared Components Library
  - `apps/web/components/farms/` _(directory of reusable components)_
  - Components: `FarmStatusBadge`, `FCRBadge`, `MortalityBadge`, `BatchProgressBar`, `DailyLogStatusChip`, `FarmMetricCard`, `WeightSparkline`, `SectionHeader`, `FarmEmptyState`
  - All components: TypeScript strict, no `any`; text label + colour (never colour-only)
  - _Requirements: FR-FARM-002, FR-FARM-003, FR-FARM-004_

  ```json
  {
    "exports": [
      "FarmStatusBadge", "FCRBadge", "MortalityBadge", "BatchProgressBar",
      "DailyLogStatusChip", "FarmMetricCard", "WeightSparkline",
      "SectionHeader", "FarmEmptyState"
    ],
    "qa_checks": [
      "FCRBadge: fcr=null → '—' displayed, no NaN or undefined rendered",
      "BatchProgressBar: past harvest age → 'Harvest Window' zone coloured correctly",
      "DailyLogStatusChip: IST timezone used (not UTC) for today comparison",
      "All badges: text label present alongside colour indicator",
      "TypeScript strict: no 'any' types in any component"
    ]
  }
  ```

---

### TASK GROUP FM: FARM METRICS PAGES

- [ ] **FM-01** — Portfolio Metrics Dashboard
  - `apps/web/app/(dashboard)/metrics/page.tsx`
  - Server: SSR KPI cards from `farm_metrics_summary`; client charts with period selector
  - FCR Trend `LineChart`, Mortality `ComposedChart`, League Table, Pending Actions Panel
  - Realtime: `useRealtimeFarmLogs` hook for live pending actions update
  - _Requirements: FR-FARM-007_

  ```json
  {
    "dependencies": ["recharts", "swr", "@supabase/ssr", "framer-motion"],
    "exports": ["MetricsDashboardPage"],
    "qa_checks": [
      "KPI cards: SSR, no loading flash",
      "Portfolio FCR: weighted average (not simple average) of all farm FCRs",
      "Period selector change: all charts refetch",
      "Mortality bar click: navigates to correct farm + date",
      "Pending actions: missing log check uses IST date (not UTC)",
      "Realtime: new daily_log insert → pending count updates within 2s"
    ]
  }
  ```

---

- [ ] **FM-02** — FCR Analysis Page
  - `apps/web/app/(dashboard)/metrics/fcr/page.tsx`
  - FCR trend chart, horizontal bar chart, breakdown table, rule-based recommendations
  - `FarmDetailDrawer` component: slide-in panel, Framer Motion, focus trap
  - _Requirements: FR-FARM-008_

  ```json
  {
    "dependencies": ["recharts", "swr", "framer-motion"],
    "exports": ["FCRAnalysisPage", "FarmDetailDrawer"],
    "qa_checks": [
      "Horizontal bar: sorted ascending (best FCR at top)",
      "FCR colour bands: correct token colour per range",
      "FarmDetailDrawer: opens on bar click; Escape closes; focus returns to trigger",
      "Recommendations: disclaimer card always visible, cannot be dismissed",
      "CSV export: downloads 'fcr-analysis-[date].csv'"
    ]
  }
  ```

---

- [ ] **FM-03** — Mortality Tracking Page
  - `apps/web/app/(dashboard)/metrics/mortality/page.tsx`
  - Area chart, stacked bar (clickable), cause donut, mortality log table, HPAI correlation
  - Realtime alert strip: Supabase subscription on `daily_logs` high-mortality inserts
  - _Requirements: FR-FARM-009_

  ```json
  {
    "dependencies": ["recharts", "swr"],
    "exports": ["MortalityPage"],
    "qa_checks": [
      "Reference lines at 3% and 5%: visible and labelled on area chart",
      "Donut chart: hidden when no cause data; info message shown instead",
      "Alert strip: Realtime fires on new daily_log with mortality_pct > threshold",
      "HPAI combined warning: shown only when BOTH HPAI alert + mortality spike active",
      "Stacked bar click: navigates to correct farm + date daily log"
    ]
  }
  ```

---

- [ ] **FM-04** — Feed Management Page
  - `apps/web/app/(dashboard)/metrics/feed/page.tsx`
  - `ComposedChart` (stacked bars + efficiency line, dual Y-axis), cost table, rate trend, low stock cards
  - WhatsApp Order CTA: `wa.me` link with URL-encoded pre-filled message
  - _Requirements: FR-FARM-010_

  ```json
  {
    "dependencies": ["recharts", "swr"],
    "exports": ["FeedManagementPage"],
    "qa_checks": [
      "Dual Y-axes: no label overlap at any viewport width",
      "Total row: correct portfolio sum of all filtered rows",
      "Low stock days_remaining: IST dates used in calculation",
      "WhatsApp link: properly URL-encoded; opens wa.me in new tab",
      "Feed rate trend: gap in line where no purchases exist (no interpolation)"
    ]
  }
  ```

---

- [ ] **FM-05** — Health Log & Disease Tracker Page
  - `apps/web/app/(dashboard)/metrics/health/page.tsx`
  - Health status grid, vaccination compliance table, health event timeline, HPAI biosecurity checklist
  - Checklist state: saved to `health_checklist_state` Supabase table (cross-session persistence)
  - _Requirements: FR-FARM-011_

  ```json
  {
    "dependencies": ["@supabase/ssr", "swr"],
    "exports": ["HealthPage"],
    "qa_checks": [
      "Health grid: health_issue=true → amber cell; severity='severe' → red cell",
      "Vaccination overdue: due_date < today (IST) AND status='pending' → red row",
      "Biosecurity checklist: checked state persists across browser sessions (Supabase)",
      "Timeline filter 'Critical': shows only severity='severe' logs",
      "Health grid cells: status communicated by text label — not colour alone"
    ]
  }
  ```

---

### TASK GROUP FR: FARM REPORTS

- [ ] **FR-01** — Batch Report Page
  - `apps/web/app/(dashboard)/reports/integrator/page.tsx`
  - 7-section server-rendered report; print layout (`?print=true`); PDF + CSV + WhatsApp share
  - Financial summary uses `predictions.p50`; disclaimer mandatory, non-dismissable
  - _Requirements: FR-FARM-012_

  ```json
  {
    "dependencies": ["@supabase/ssr"],
    "exports": ["BatchReportPage"],
    "qa_checks": [
      "RLS: batchId from different integrator → 404",
      "Financial summary: P50 price sourced from predictions table (not user input)",
      "Disclaimer: always visible on financial section",
      "PDF download: all 7 sections present; correct filename",
      "Print layout: no sidebar or navigation rendered",
      "WhatsApp share: signed URL generated; opens wa.me correctly",
      "Rate limit: 6th PDF request in 1 hour → 429 with friendly message"
    ]
  }
  ```

---

### TASK GROUP FA: FARM API ROUTES

- [ ] **FA-01** — Farm CRUD API
  - `apps/web/app/api/farms/route.ts` + `apps/web/app/api/farms/[farmId]/route.ts`
  - `GET /api/farms`: integrator's farms with latest batch + last_log_date; status filter + sort
  - `POST /api/farms`: Zod validated; transactional (farm + sheds + optional batch); max 50 farms
  - `GET /api/farms/[farmId]`: full detail; RLS → `404` if not owner
  - `PATCH /api/farms/[farmId]`: partial update; `updated_at` auto-set
  - `DELETE` (archive): sets `status='archived'`; returns `400` if active batch exists
  - _Requirements: FR-FARM-001, FR-FARM-002, FR-FARM-005_

  ```json
  {
    "dependencies": ["zod", "@supabase/ssr"],
    "qa_checks": [
      "GET: returns only requesting integrator's farms (RLS + API layer)",
      "POST transaction: shed insert failure → farm rolled back",
      "POST: 51st farm → 403 with friendly message",
      "GET [farmId]: different integrator's farmId → 404",
      "PATCH: updated_at changes on every PATCH",
      "DELETE: farm with active batch → 400 'पहले batch close करें'"
    ]
  }
  ```

---

- [ ] **FA-02** — Daily Log API
  - `apps/web/app/api/farms/[farmId]/daily-log/route.ts`
  - `POST`: Zod validated; ALL computed fields calculated server-side (cumulative deaths, FCR, feed/bird); backdating >7 days non-admin → `403`; duplicate → `409` with `conflictLogId`
  - `GET /api/farms/[farmId]/logs`: paginated (page + limit params); includes computed values
  - `GET /api/farms/[farmId]/logs/export`: CSV stream; `Content-Disposition` attachment
  - _Requirements: FR-FARM-004_

  ```json
  {
    "dependencies": ["zod", "@supabase/ssr"],
    "qa_checks": [
      "cumulative_deaths: computed from DB SUM — not client-sent value",
      "FCR: only computed when weigh-in data present AND cumulative weight > 0",
      "IST date validation edge case: 23:00 UTC = 04:30 IST next day",
      "Backdating >7 days non-admin: 403 with 'Admin approval required'",
      "Duplicate log: 409 with { conflictLogId } in response body",
      "CSV export: all columns, proper UTF-8, no BOM issues"
    ]
  }
  ```

---

- [ ] **FA-03** — Batch Management API
  - `apps/web/app/api/farms/[farmId]/batches/route.ts`
  - `POST`: creates new batch; closes existing active batch first; auto-generates vaccination schedule from breed defaults; sets `farm.status='active'`
  - `PATCH /api/farms/[farmId]/batches/[batchId]/close`: sets `status='closed'`; sets `farm.status='between_batches'`; triggers batch report generation job
  - `GET /api/farms/[farmId]/batches`: all batches paginated (including closed)
  - _Requirements: FR-FARM-003, FR-FARM-012_

  ```json
  {
    "qa_checks": [
      "New batch: previous active batch auto-closed first",
      "Vaccination schedule: auto-generated on batch creation (Cobb 430 = 5 standard vaccines)",
      "Batch close: farm status changes to 'between_batches'",
      "Batch close: report generation job inserted to batch_report_jobs table"
    ]
  }
  ```

---

- [ ] **FA-04** — Metrics Aggregation APIs
  - `apps/web/app/api/metrics/` _(directory)_
  - `GET /api/metrics/portfolio-summary`: from `farm_metrics_summary` materialized view
  - `GET /api/metrics/fcr-trend?period&farmIds`: time-series FCR per farm + portfolio avg + industry avg
  - `GET /api/metrics/mortality-timeline?period`: daily deaths per farm
  - `GET /api/metrics/fcr-recommendations?farmId`: rule-based (no LLM); disclaimer flag always in response
  - `GET /api/metrics/industry-averages`: anonymised aggregate; `null` if <10 farms (privacy guard)
  - `GET /api/metrics/feed-analysis?period`: feed consumption + stock levels
  - `GET /api/metrics/health-summary`: per-farm health status + vaccination compliance %
  - _Requirements: FR-FARM-007 → FR-FARM-011_

  ```json
  {
    "dependencies": ["@supabase/ssr", "upstash-redis"],
    "qa_checks": [
      "industry-averages: returns null (not error) if <10 farms in aggregate",
      "fcr-trend: farmIds filter returns only requested farms' data",
      "fcr-recommendations: disclaimer flag always present in response JSON",
      "All endpoints: 401 if no session; 403 if non-S2 segment"
    ]
  }
  ```

---

- [ ] **FA-05** — Report Generation API
  - `apps/web/app/api/reports/[batchId]/pdf/route.ts`
  - `GET`: RLS check; POST to Railway.app Puppeteer service; store in Supabase Storage; return signed URL (7-day expiry); idempotent (reuse existing PDF)
  - Rate limit: 5 PDF generations per integrator per hour (Upstash Redis); `429` with friendly message on breach
  - `POST /api/reports/compare`: comparison report PDF
  - `POST /api/reports/share-whatsapp`: Twilio WhatsApp with signed PDF URL
  - _Requirements: FR-FARM-012_

  ```json
  {
    "dependencies": ["puppeteer (Railway.app service)", "@supabase/ssr", "upstash-redis", "twilio"],
    "qa_checks": [
      "PDF: all 7 sections present, correctly formatted",
      "PDF: no sidebar or navigation visible in output",
      "Idempotent: second request returns existing file (check Supabase Storage)",
      "Rate limit: 6th request in 1 hour → 429 with friendly message",
      "WhatsApp: Twilio message delivered with valid signed URL"
    ]
  }
  ```

---

### TASK GROUP FD: DATABASE & REALTIME

- [ ] **FD-01** — Database Schema Migration
  - `supabase/migrations/20260523_farm_management.sql`
  - Creates: `farms`, `sheds`, `batches`, `daily_logs`, `vaccinations`, `feed_purchases`, `health_checklist_state`, `batch_report_jobs`
  - Creates: `farm_metrics_summary` materialized view + `pg_cron` refresh every 30 minutes
  - Creates: RLS policies on all 6 data tables
  - Creates: performance indexes on all high-frequency query patterns
  - _Requirements: All FR-FARM-*_

  ```json
  {
    "qa_checks": [
      "Migration runs clean on fresh Supabase project",
      "RLS: integrator A cannot query farms of integrator B (test with service_role bypass)",
      "Materialized view: refreshes without lock on concurrent reads",
      "All indexes confirmed via EXPLAIN ANALYZE on common queries",
      "daily_logs UNIQUE(batch_id, log_date): duplicate insert returns error code 23505"
    ]
  }
  ```

---

- [ ] **FD-02** — Realtime Hooks — Farm Module
  - `apps/web/hooks/useRealtimeFarmLogs.ts` — Supabase Realtime on `daily_logs` INSERT; mutates SWR cache on new log
  - `apps/web/hooks/useOfflineDraftSync.ts` — detects `window.online` event; auto-submits pending IndexedDB drafts sequentially
  - _Requirements: FR-FARM-004, FR-FARM-007_

  ```json
  {
    "dependencies": ["@supabase/ssr", "swr", "idb-keyval"],
    "qa_checks": [
      "Realtime: new daily_log insert → /api/farms and /api/metrics SWR caches revalidated within 2s",
      "Offline hook: simulate network drop → fill form → go online → draft submitted",
      "Multiple pending drafts: submitted sequentially (not parallel) to avoid rate limit"
    ]
  }
  ```

---

- [ ] **FD-03** — Airflow DAG — Daily Log Reminder
  - `airflow/dags/dag_daily_log_reminder.py`
  - Schedule: `30 2 * * *` (08:00 IST = 02:30 UTC)
  - Queries Supabase for active farms where `last_log_date < today IST`; groups by integrator phone; sends one WhatsApp per integrator (not one per farm); logs to `notification_log`
  - _Requirements: FR-FARM-004_

  ```json
  {
    "dependencies": ["apache-airflow", "twilio", "supabase-py"],
    "qa_checks": [
      "DAG runs at 08:00 IST (verify Astronomer scheduler logs)",
      "Integrator with 3 farms missing logs → receives 1 WhatsApp (not 3)",
      "Integrator who has logged all farms → NO reminder sent",
      "notification_whatsapp=false → no message sent",
      "Dry run mode (env var): prints recipients without sending"
    ]
  }
  ```

---

### TASK GROUP FT: TESTING — FARM MODULE

- [ ] **FT-01** — Farm API Unit Tests
  - `apps/web/__tests__/api/farms.test.ts`
  - _Requirements: FR-FARM-001, FR-FARM-004, FR-FARM-005_

  ```
  Test cases:
  □ POST /api/farms: creates farm + sheds + batch in single transaction
  □ POST /api/farms: 51st farm attempt → 403 with message
  □ POST /api/farms: shed insert failure → farm also rolled back (DB check)
  □ POST /api/farms: S1 segment → 403
  □ POST /api/farms: unauthenticated → 401
  □ POST /api/farms/[id]/daily-log: cumulative_deaths computed from DB SUM (not client value)
  □ POST /api/farms/[id]/daily-log: FCR computed correctly with known inputs
  □ POST /api/farms/[id]/daily-log: duplicate log_date → 409 with conflictLogId
  □ POST /api/farms/[id]/daily-log: backdate >7 days non-admin → 403
  □ POST /api/farms/[id]/daily-log: backdate >7 days admin → 201
  □ POST /api/farms/[id]/daily-log: IST date validation edge case (23:00 UTC)
  □ GET /api/farms: returns only authenticated integrator's farms
  □ GET /api/farms: empty array (not error) if no farms
  □ GET /api/farms/[farmId]: different integrator's farmId → 404
  □ GET /api/metrics/industry-averages: <10 farms → null (not error)
  ```

---

- [ ] **FT-02** — Farm E2E Tests (Playwright)
  - `apps/web/e2e/farms.spec.ts`
  - _Requirements: All FR-FARM-*_

  ```
  Test cases:
  □ Full farm onboarding: wizard → confetti → farm card appears in portfolio
  □ Daily log: offline draft → auto-submit on reconnect
  □ Daily log: already logged today → read-only card shown; edit mode works
  □ Farm portfolio: missing log → amber border on farm card
  □ Farm compare: radar chart renders with 3 farms; 6th farm selection → toast
  □ FCR page: bar click → FarmDetailDrawer opens; Escape → closes; focus returns
  □ Mortality page: stacked bar click → correct farm + date daily log
  □ S1 customer: /dashboard/farms → /dashboard/403
  □ Batch report: financial disclaimer visible; cannot be hidden
  □ PDF download: filename matches pattern 'batch-[N]-report.pdf'
  □ FCR badge: correct colour for each FCR band (test at 375px mobile)
  ```

---

- [ ] **FT-03** — Farm Module Accessibility Audit
  - `apps/web/__tests__/a11y/farms.test.ts`
  - _Requirements: All FR-FARM-* (WCAG 2.1 AA)_

  ```
  Test cases (axe-core + Playwright):
  □ Farm portfolio page: axe passes WCAG 2.1 AA — no violations
  □ Daily log form: all inputs have associated <label htmlFor>
  □ Daily log form: computed fields have aria-readonly="true"
  □ Daily log form: submit button aria-busy="true" during submission
  □ Daily log form: section toggles have aria-expanded attribute
  □ Daily log form: offline banner uses aria-live="polite"
  □ Farm cards: FCR + mortality badges have text labels (not colour-only)
  □ Farm health grid: status cells communicate status via text (not colour-only)
  □ All Recharts charts: aria-label present on ResponsiveContainer
  □ All Recharts charts: hidden data table present as screen reader alternative
  □ FarmDetailDrawer: focus trap active; Escape closes; focus returns to trigger
  □ All touch targets: ≥44×44px on mobile (axe-core check)
  □ Vaccination table: all <th> elements have scope="col"
  ```

---

## PART 3: CROSS-MODULE INTEGRATION

### INT-01: Price Intelligence → Farm Harvest Alert
```
When: batch reaches harvest window (Day 35+)
Read: predictions.p50 WHERE mandi = farm.district AND date = today
Show: harvest alert card on /dashboard/farms/[id] Metrics tab
      "Current P50 price: ₹X/kg — Sell signal: [SELL_NOW / HOLD]"
Link: "Full forecast देखें →" → /dashboard/price-intelligence
Implementation: JOIN daily_logs.batch_day >= 35 + predictions table in farm detail API
```

### INT-02: Alerts Module → Farm Health
```
When: HPAI alert inserted into alerts table for integrator's district
Mirror: HPAI alert appears on /dashboard/metrics/health (FR-FARM-011)
Trigger: if HPAI alert active + farm mortality elevated → combined red warning card
Implementation: useRealtimeAlerts hook (existing DD-01) → also mutates /api/metrics/health SWR cache
```

### INT-03: Calculator Module → Multi-Farm View Update
```
Existing: FR-DASH-005 MultiFarmView uses mock farm data
Update: Replace mock data with: SELECT * FROM farm_metrics_summary WHERE integrator_id = auth.uid()
Add: each calculator farm card links to /dashboard/farms/[id]
File: apps/web/app/(dashboard)/calculator/page.tsx (existing DB-04 task)
```

### INT-04: Sidebar — Active Farm Count Badge
```
Component: Sidebar.tsx (existing DA-02)
Add: badge on "My Farms" nav item showing count of farms WHERE status='active'
Data: GET /api/farms?status=active&countOnly=true
SWR: refreshInterval 300000 (5 min); same SWR key as farm portfolio
Badge style: small green pill, right-aligned in nav item (from FarmMetricTokens)
```

### INT-05: Batch Report → PoultryPulse P50 Price
```
In: /api/reports/[batchId]/pdf (FA-05)
Read: predictions.p50 WHERE mandi = farm.district AND date = batch.closed_at
Use: revenue calculation in Financial Summary section
Fallback: if no prediction for that date → use nearest available date + note in report
Disclaimer: always rendered in report (cannot be hidden); FR-FARM-012 acceptance criteria
```

---

## IMPLEMENTATION SEQUENCE

```
WEEK 1 — Farm Foundation (P0 blockers)
  Day 1:   FD-01 (DB migration — everything depends on this)
  Day 2:   FF-01 (middleware extension) + FF-07 (shared components)
  Day 3:   FA-01 (farms CRUD API) + FA-02 (daily log API)
  Day 4:   FF-04 (daily log form — highest-frequency daily action)
  Day 5:   FF-05 (add farm wizard)

WEEK 2 — Farm Pages + APIs
  Day 6:   FF-02 (farm portfolio page)
  Day 7–8: FF-03 (farm detail page — 5 tabs, largest component)
  Day 9:   FA-03 (batch management API)
  Day 10:  FA-04 (metrics aggregation APIs)

WEEK 3 — Metrics Module
  Day 11:  FM-01 (portfolio metrics dashboard)
  Day 12:  FM-02 (FCR analysis)
  Day 13:  FM-03 (mortality tracking)
  Day 14:  FM-04 (feed management)
  Day 15:  FM-05 (health log & disease tracker)

WEEK 4 — Reports + Realtime + Notifications + Compare
  Day 16:  FR-01 (batch report page)
  Day 17:  FA-05 (PDF generation API)
  Day 18:  FF-06 (farm compare page)
  Day 19:  FD-02 (Realtime hooks + offline sync)
  Day 20:  FD-03 (Airflow daily log reminder DAG)

WEEK 5 — Testing + Integration
  Day 21–22: FT-01 (API unit tests — RLS must pass before launch)
  Day 23–24: FT-02 (E2E tests — full integrator journey)
  Day 25:    FT-03 (accessibility audit) + INT-01 → INT-05 (cross-module wiring)
```

---

## TASK SUMMARY

| Group | Tasks | P0 | P1 | Total Hours |
|-------|-------|----|----|-------------|
| FF — Farm Foundation Pages | 7 | 5 | 2 | ~70h |
| FM — Metrics Pages | 5 | 1 | 4 | ~42h |
| FR — Reports | 1 | 0 | 1 | ~8h |
| FA — API Routes | 5 | 3 | 2 | ~32h |
| FD — Database + Realtime | 3 | 1 | 2 | ~11h |
| FT — Testing | 3 | 1 | 2 | ~30h |
| **Total** | **24** | **11** | **13** | **~193h** |

---

## P0 LAUNCH BLOCKERS

```
FD-01  — DB migration (all tasks depend on this — run first)
FF-01  — Route guard (S2 access enforcement)
FF-02  — Farm portfolio page (entry point for all integrators)
FF-03  — Farm detail page (operational hub — 5 tabs)
FF-04  — Daily log form (highest-frequency daily action)
FF-05  — Add farm wizard (onboarding gate — no farm = no value)
FF-07  — Shared components (dependency of all farm pages)
FA-01  — Farm CRUD API
FA-02  — Daily log API (computed fields + RLS)
FA-03  — Batch management API
FM-01  — Portfolio metrics dashboard (integrator overview)
FT-01  — API unit tests (RLS validation must pass before launch)
```

---

*Document: 16_integrator_farms_requirements_tasks.md*
*Design Reference: 14_integrator_farms_design_master.md*
*Task Reference: 15_integrator_farms_tasks_master.md*
*Extends: 05_postlogin_requirements_tasks.md*
*© 2026 PoultryPulse AI Technologies Pvt. Ltd. | CONFIDENTIAL*
