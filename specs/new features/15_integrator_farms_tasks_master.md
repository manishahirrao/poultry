# PoultryPulse AI — Integrator Farm Management & Daily Metrics Task Master
# File: 15_integrator_farms_tasks_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL
# Extends: 13_postlogin_tasks_master.md
# Design Reference: 14_integrator_farms_design_master.md

---

## AGENT CONTEXT BLOCK
```
ROLE: Senior Full-Stack Engineer (Next.js 15 + TypeScript + Recharts + Supabase + Realtime)
FOUNDATION:
  - 14_integrator_farms_design_master.md (primary design spec — read first)
  - 04_postlogin_design_master.md (base design system — tokens, typography, spacing)
  - 13_postlogin_tasks_master.md (base task patterns — follow same format)
  - PRD v3.0 §3 (S2 Integrator segment)
  - TRD v1.0 (Supabase schema, Railway, Airflow)
STACK: Next.js 15 App Router, TypeScript strict, Tailwind CSS v3, Recharts, Framer Motion, Supabase SSR + Realtime
AUTH: Supabase Phone OTP + middleware-enforced RLS (integrator_id = auth.uid())
ACCESS_MODEL: S2 Integrators only for all /farms and /metrics routes
NEW_ROUTES:
  /dashboard/farms                  → FF group (Farm Foundation)
  /dashboard/farms/[id]             → FF group
  /dashboard/farms/[id]/daily-log   → FF group
  /dashboard/farms/new              → FF group
  /dashboard/farms/compare          → FF group
  /dashboard/metrics                → FM group (Farm Metrics)
  /dashboard/metrics/fcr            → FM group
  /dashboard/metrics/mortality      → FM group
  /dashboard/metrics/feed           → FM group
  /dashboard/metrics/health         → FM group
  /dashboard/reports/integrator     → FR group (Farm Reports)
NEW_API_ROUTES:
  /api/farms/*                      → FA group (Farm API)
  /api/metrics/*                    → FA group
  /api/reports/*                    → FA group
NON_NEGOTIABLE:
  - RLS: integrator sees ONLY their own farms (integrator_id check on every query)
  - Daily log form: fully functional at 375px viewport (mobile-first)
  - FCR / mortality / cumulative deaths: computed server-side or via DB trigger, never client-side
  - NEVER blank screens: skeleton → data → empty state pattern (see 04_postlogin §6)
  - NEVER raw errors: Hindi + English friendly messages (see 04_postlogin §5)
  - Offline log draft: IndexedDB via idb-keyval, auto-submit on reconnect
  - SUPABASE_SERVICE_ROLE_KEY must NEVER appear in client components
OUTPUT_FORMAT: Standard Kiro task block — file_path, purpose, dependencies, exports, code, qa_checks
```

---

## OUTPUT FORMAT (all code tasks)

```json
{
  "file_path": "apps/web/path/to/file.tsx",
  "purpose": "One-sentence description",
  "dependencies": ["package-name"],
  "exports": ["ComponentName"],
  "code": "// Full implementation here",
  "qa_checks": [
    "Check 1",
    "Check 2"
  ]
}
```

---

## PART 1: FUNCTIONAL REQUIREMENTS

### FR-FARM-001: Farm Portfolio Page
**Priority:** P0 (Core integrator feature)

**Acceptance Criteria:**
- [ ] `/dashboard/farms` accessible to S2 integrators only; S1/S3/S4 → redirect `/dashboard/403`
- [ ] Portfolio KPI cards load from `farm_metrics_summary` materialized view, SSR pre-fetched
- [ ] Farm cards grid renders correctly for 1–20 farms (responsive: 3-col/2-col/1-col)
- [ ] Each farm card shows: name, status badge, active batch details, FCR, mortality, last log status
- [ ] "Today's log missing" amber left-border on farm card if `last_log_date < today`
- [ ] Filter by status (All/Active/Between Batches/Paused) — URL-synced query param
- [ ] Sort by: name, FCR, mortality, bird count, last log — URL-synced
- [ ] Search by farm name — debounced 300ms, Supabase ilike
- [ ] Empty state (no farms): illustration + Hindi CTA to `/dashboard/farms/new`
- [ ] [+ Add Farm] button links to `/dashboard/farms/new`
- [ ] SWR auto-refresh every 5 minutes; manual refresh button in header
- [ ] Farm card hover: `cardHoverShadow` + scale(1.01) Framer Motion animation

---

### FR-FARM-002: Single Farm Detail Page
**Priority:** P0

**Acceptance Criteria:**
- [ ] `/dashboard/farms/[farmId]` — server-side RLS check: `farms.integrator_id = auth.uid()`
- [ ] If farmId not owned by this integrator → 404 page (not 403 — do not leak farm existence)
- [ ] Farm header band: name, location, type, capacity, status, active batch badge
- [ ] Current batch summary strip: placement date, days into batch, birds alive, mortality %, progress bar
- [ ] Tab navigation: Metrics | Daily Log | Health | Feed | Batch History
- [ ] Metrics tab: 5 Recharts charts (FCR trend, mortality, weight, feed intake, ADG)
  - All charts: P10/P50/P90 not applicable here — use target/benchmark lines instead
  - All charts: aria-label + hidden data table for accessibility
  - Charts pre-fetched server-side; skeleton on client hydration
- [ ] Daily Log tab: paginated table (30 rows/page), colour-coded rows, inline edit for admin
- [ ] Health tab: vaccination schedule table, disease timeline, symptom quick-log
- [ ] Feed tab: inventory tracker, purchase log, cost summary
- [ ] Batch History tab: all past batches table with report links
- [ ] [Log Today's Data] button: visible in Metrics and Daily Log tabs if today not logged; links to `/dashboard/farms/[id]/daily-log`
- [ ] More actions dropdown: Start New Batch, Mark Between Batches, Download Report, Archive Farm

---

### FR-FARM-003: Daily Log Entry Form
**Priority:** P0 (highest-frequency user action)

**Acceptance Criteria:**
- [ ] Form fully functional at 375px viewport; all inputs ≥52px height on mobile
- [ ] Date auto-set to today; allows backdating up to 7 days (beyond 7 → admin override required)
- [ ] Section A (Mortality): required fields; auto-computes cumulative deaths + mortality %
- [ ] Section B (Feed): required fields; auto-computes feed/bird/day
- [ ] Section C (Weight): conditional on "weigh-in today?" toggle; auto-computes avg weight + FCR
- [ ] Section D (Water/Environment): optional, collapsible on mobile
- [ ] Section E (Health): optional, collapsible on mobile; expands multi-select if "हाँ"
- [ ] Section F (Notes): optional, 500 char limit with counter
- [ ] [Submit] button: disabled until Sections A + B are complete
- [ ] Submit: POST `/api/farms/[id]/daily-log`; optimistic UI; success → redirect to farm detail
- [ ] Autosave draft: every 30 seconds → IndexedDB via `idb-keyval`; draft badge shown
- [ ] Offline mode: form works offline, draft in IndexedDB, auto-submit on reconnect
- [ ] Duplicate detection: if today's log exists → show "already logged" state with edit option
- [ ] Late submission (>20:00 IST): yellow banner "यह [date] का log है"
- [ ] Log lock: logs >7 days old cannot be edited by integrator (admin override only)
- [ ] WhatsApp reminder: sent at 08:00 IST next day if prior day's log missing (via Airflow DAG)

---

### FR-FARM-004: Add New Farm Wizard
**Priority:** P0

**Acceptance Criteria:**
- [ ] 4-step wizard with step indicator (Farm Info → Shed Setup → First Batch → Review)
- [ ] Step 1: Farm name, type, location (district dropdown + GPS), manager details
- [ ] Step 2: Shed count (1–20) + per-shed details; total capacity auto-computed
- [ ] Step 3: First batch setup (optional — can skip); breed, DOC supplier, placement date, birds placed
- [ ] Step 4: Summary review with edit links per section
- [ ] Form validation: Zod schema per step; inline errors, no submit until valid
- [ ] Step navigation: forward disabled if current step invalid; backward always allowed
- [ ] Draft saving: wizard state in sessionStorage; survives accidental page refresh
- [ ] Submit: POST `/api/farms` → creates farm + sheds + optional batch in transaction
- [ ] Success: confetti micro-animation (canvas-confetti, 1.5s) + redirect to new farm page
- [ ] Max farms per integrator: 50 (plan limit); 403-style prompt to contact support if exceeded

---

### FR-FARM-005: Farm Compare Page
**Priority:** P1

**Acceptance Criteria:**
- [ ] Access: S2 integrators with ≥2 farms; single farm → empty state with "Add Farm" CTA
- [ ] Multi-select farm picker (pill UI, max 5 farms simultaneously)
- [ ] Period selector: Current Batch | Last 30 Days | Last 90 Days | Custom date range
- [ ] Recharts RadarChart: 6 axes (FCR, Mortality, ADG, Feed Efficiency, Harvest Weight, Duration)
- [ ] One polygon per farm; distinct colours (non-red/green — colorblind safe)
- [ ] Comparison table: metric × farm grid; best-in-column highlighted; industry avg column
- [ ] Industry avg data: anonymised aggregate from `farm_metrics_summary` across all integrators
- [ ] [Download Comparison Report] → PDF via `/api/reports/compare`
- [ ] URL state: selected farm IDs + period in query params (shareable link)

---

### FR-FARM-006: Portfolio Metrics Dashboard
**Priority:** P0

**Acceptance Criteria:**
- [ ] `/dashboard/metrics` — S2 only; 5 portfolio KPI cards (SSR)
- [ ] Period selector affects all charts: This Week | This Month | This Batch Cycle | Custom
- [ ] FCR trend chart: multi-line (one line per active farm) + portfolio average line + industry avg
- [ ] Mortality events timeline: stacked bar by farm + cumulative % line
- [ ] Farm performance league table: sorted by FCR (ascending), colour-coded
- [ ] Pending actions panel: farms missing today's log, overdue vaccinations, low feed stock
- [ ] Click farm row → navigate to `/dashboard/farms/[id]`
- [ ] Click pending action → navigate to relevant page/form
- [ ] SWR refresh: 5 minutes; Realtime subscription on `daily_logs` INSERT for live pending actions update

---

### FR-FARM-007: FCR Analysis Page
**Priority:** P1

**Acceptance Criteria:**
- [ ] Portfolio FCR trend (LineChart, 30/90-day, farm + period filter)
- [ ] FCR by Farm horizontal bar chart; coloured by band; click → farm detail side panel
- [ ] FCR breakdown table: sortable, exportable CSV
- [ ] AI-generated FCR improvement recommendations:
  - Client-side fetch from `/api/metrics/fcr-recommendations?farmId=[id]`
  - Source: rule-based heuristics (Phase 1); no LLM required initially
  - Clear disclaimer: "Not veterinary advice"
- [ ] Page accessible (all charts: aria-label + data table)

---

### FR-FARM-008: Mortality Tracking Page
**Priority:** P1

**Acceptance Criteria:**
- [ ] Alert strip: farms in elevated/critical mortality zone shown with red banner
- [ ] Combined area chart: cumulative mortality % by farm (multi-line)
- [ ] Daily death events: stacked bar chart; click bar → opens daily log for that farm+date
- [ ] Cause of death donut chart: Unknown | Heat | Disease | Injury | Cull | Other (if causes logged)
- [ ] Mortality log table: all farms × 30 days, sortable, exportable
- [ ] HPAI correlation: cross-reference with `alerts` table for active district HPAI alerts
- [ ] Trigger HPAI alert notification if district alert + farm mortality spike both active

---

### FR-FARM-009: Feed Management Page
**Priority:** P1

**Acceptance Criteria:**
- [ ] Feed consumption stacked bar chart (kg/day per farm, 30 days)
- [ ] gm/bird/day efficiency line (secondary Y-axis on same chart)
- [ ] Feed cost tracker table: Farm | Batch | Type | Qty | Rate | Total Cost | Cost/kg Produced
- [ ] Portfolio feed total row at bottom of table
- [ ] Feed rate trend chart: purchase price/kg over 6 months (from `feed_purchases` table)
- [ ] Low stock alert cards: farms with <7 days stock remaining
- [ ] [Order Now] WhatsApp CTA: opens `https://wa.me/[supplierPhone]?text=[pre-filled order message]`
- [ ] Feed efficiency comparison table per farm

---

### FR-FARM-010: Health Log & Disease Tracker Page
**Priority:** P1

**Acceptance Criteria:**
- [ ] Portfolio health status grid: one cell per farm, colour = current health status
- [ ] Vaccination compliance table: overdue rows in red, sortable by due date
- [ ] Health event timeline: chronological, filterable by severity
- [ ] HPAI district alert integration: pulls from `alerts` table; shows biosecurity checklist if active
- [ ] Biosecurity checklist: toggleable checkboxes, state saved to Supabase `health_checklist_state`
- [ ] All health events logged in `daily_logs.health_symptoms` + any explicit `health_events` records

---

### FR-FARM-011: Batch Report Page
**Priority:** P1

**Acceptance Criteria:**
- [ ] Report auto-generated on batch close; accessible at `/dashboard/reports/integrator?batchId=[id]`
- [ ] 7 sections: Batch Summary, Growth Performance, Mortality, Feed, Health, Financial Summary, Recommendations
- [ ] Financial summary: uses PoultryPulse P50 price at harvest date from `predictions` table
- [ ] [Download PDF]: client-side trigger → `/api/reports/[batchId]/pdf` (server-generated Puppeteer PDF)
- [ ] [Export CSV]: raw daily log data for this batch
- [ ] [Share via WhatsApp]: signed URL to PDF, sent via Twilio WhatsApp
- [ ] Report access: only integrator who owns the farm; admin can access all
- [ ] Report data locked (immutable) after batch close; cannot be edited

---

## PART 2: TASK MASTER

---

## TASK GROUP FF: FARM FOUNDATION (Pages & Layout)

### FF-01 — Farm Module Route Guard Middleware Extension

**File:** `apps/web/middleware.ts` _(extend existing)_
**Priority:** 🔴 P0
**Dependencies:** existing middleware.ts from DA-01
**Est:** 2h

```typescript
// PURPOSE: Extend existing dashboard middleware to guard /farms and /metrics routes.
// Rule: segment must be 'S2' or role must be 'admin' to access any /dashboard/farms/* or /dashboard/metrics/*
// All other segments (S1, S3, S4, S5, S6) → /dashboard/403

// Add to existing matchers:
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/farms/:path*',
    '/api/metrics/:path*',
    '/api/reports/:path*',
  ],
};

// Guard logic to add inside middleware:
const FARM_ROUTES = ['/dashboard/farms', '/dashboard/metrics', '/dashboard/reports'];
const isFarmRoute = FARM_ROUTES.some(r => request.nextUrl.pathname.startsWith(r));
if (isFarmRoute && customer.segment !== 'S2' && customer.role !== 'admin') {
  return NextResponse.redirect(new URL('/dashboard/403', request.url));
}
```

**QA Checks:**
- [ ] S1 customer → /dashboard/farms → redirects to /dashboard/403
- [ ] S3 customer → /dashboard/metrics → redirects to /dashboard/403
- [ ] S2 customer → /dashboard/farms → allowed
- [ ] Admin → /dashboard/farms → allowed
- [ ] API route /api/farms/* → returns 403 JSON for non-S2 non-admin

---

### FF-02 — Farm Portfolio Page

**File:** `apps/web/app/(dashboard)/farms/page.tsx`
**Priority:** 🔴 P0
**Dependencies:** `@supabase/ssr`, `swr`, `framer-motion`
**Est:** 10h

```typescript
// PURPOSE: Portfolio overview — all farms for this integrator.
// Server component (SSR for KPI cards + initial farm list).
// Client sub-components for filter/sort/search (client interactivity).

// Server-side data fetch:
//   1. farm_metrics_summary WHERE integrator_id = auth.uid()
//   2. KPI aggregation: total birds, portfolio FCR, portfolio mortality, total feed
//   3. Pass to client components via props

// Key client components:
//   <PortfolioKPIBar farms={farms} />           — 4 metric cards
//   <FarmSearchFilter />                         — search + filter + sort (URL-synced)
//   <FarmCardsGrid farms={filteredFarms} />      — responsive grid
//   <FarmCard farm={farm} />                     — individual farm card
//   <EmptyFarmsState />                          — illustration + CTA

// FarmCard implementation:
//   - status pill (top-right): Active / Between Batches / Paused / Onboarding
//   - Left border: 3px solid based on status colour token
//   - "Today's log missing" detection: farm.last_log_date < today → amber border + warning
//   - FCR badge: colour from FarmMetricTokens.fcrGood/Warning/Critical
//   - Mortality badge: colour from FarmMetricTokens.mortalityNormal/Elevated/Critical
//   - Weight sparkline: 7-day daily avg weight (Recharts Sparkline, 80px × 32px)
//   - Hover: Framer Motion whileHover={{ scale: 1.01, boxShadow: cardHoverShadow }}
//   - Click: navigate to /dashboard/farms/[id]
//   - [Log Today's Data] button: visible if today's log missing

// SWR config: refreshInterval: 300000 (5 min), revalidateOnFocus: true
// URL sync: status filter + sort + search → useSearchParams + router.replace
```

**QA Checks:**
- [ ] KPI cards load with real data (SSR, no loading flash)
- [ ] Farm card with missing today's log shows amber left border + warning text
- [ ] FCR badge colour matches FarmMetricTokens correctly
- [ ] Search debounce 300ms — no excessive Supabase calls
- [ ] Filter change → URL updates → page refresh preserves filter state
- [ ] Empty state shows illustration + Hindi CTA (never blank)
- [ ] Cards grid: 3 columns at 1280px, 2 at 768px, 1 at 480px
- [ ] RLS: no other integrator's farms appear (test with 2 integrator accounts)

---

### FF-03 — Farm Detail Page

**File:** `apps/web/app/(dashboard)/farms/[farmId]/page.tsx`
**Priority:** 🔴 P0
**Dependencies:** `recharts`, `framer-motion`, `@supabase/ssr`
**Est:** 16h

```typescript
// PURPOSE: Full operational view for one farm — tabbed.
// Server component for farm header + batch strip (SSR).
// Client tabs for Metrics, Daily Log, Health, Feed, Batch History.

// Server-side:
//   1. Fetch farm: SELECT * FROM farms WHERE id = farmId AND integrator_id = auth.uid()
//      → If null: notFound() (404, do not leak existence)
//   2. Fetch active batch: SELECT * FROM batches WHERE farm_id = farmId AND status = 'active' LIMIT 1
//   3. Pass to client

// Tab component: <FarmDetailTabs farm={farm} batch={batch} />
// Each tab lazy-loaded via React.lazy + Suspense with skeleton

// TAB: Metrics
//   5 Recharts charts (all LineChart or BarChart, no AreaChart P-bands here):
//   <FCRTrendChart batchId={batch.id} />        — Line + benchmark reference line
//   <MortalityChart batchId={batch.id} />       — Area + daily bar overlay
//   <WeightProgressionChart batchId={batch.id} /> — Actual vs target vs breed standard
//   <FeedIntakeChart batchId={batch.id} />      — Bar + rolling avg line
//   <ADGChart batchId={batch.id} />             — Bar coloured by on-target/off-target

// TAB: Daily Log
//   Server-paginated table (GET /api/farms/[id]/logs?page=1&limit=30)
//   Row colour: amber tint if daily_mortality > 1.5%; orange dot if fields missing
//   [+ Log Today's Data] button → /dashboard/farms/[farmId]/daily-log
//   [Export CSV] → /api/farms/[id]/logs/export

// TAB: Health
//   <VaccinationScheduleTable batchId={batch.id} />
//   <HealthEventTimeline farmId={farmId} />
//   <SymptomQuickLog farmId={farmId} batchId={batch.id} />

// TAB: Feed
//   <FeedInventoryTracker farmId={farmId} batchId={batch.id} />
//   <FeedPurchaseLog farmId={farmId} />
//   <FeedCostSummary batchId={batch.id} />

// TAB: Batch History
//   Server-paginated table of closed batches
//   Each row: batch #, dates, FCR, mortality, report link

// "More actions" dropdown (top-right):
//   → Start New Batch: modal (breed, placement date, birds)
//   → Mark Between Batches: PATCH /api/farms/[id]/status { status: 'between_batches' }
//   → Download Report: GET /api/reports/[batchId]/pdf
//   → Archive Farm: DELETE modal + PATCH /api/farms/[id] { status: 'archived' }
```

**QA Checks:**
- [ ] RLS: farmId owned by different integrator → returns 404 (not 403)
- [ ] All 5 charts render with data; skeletons shown during tab switch
- [ ] Each chart has aria-label + hidden data table
- [ ] "Log Today's Data" button visible in Metrics + Daily Log tabs if today not logged
- [ ] Batch progress bar: shows correct day marker
- [ ] Farm with no active batch: shows "No active batch" state in batch strip (not error)
- [ ] Tab URL sync: /farms/[id]?tab=health → correct tab active on load

---

### FF-04 — Daily Log Entry Form

**File:** `apps/web/app/(dashboard)/farms/[farmId]/daily-log/page.tsx`
**Priority:** 🔴 P0 (highest-frequency integrator action)
**Dependencies:** `react-hook-form`, `zod`, `idb-keyval`, `@supabase/ssr`
**Est:** 14h

```typescript
// PURPOSE: Daily metric entry form — mobile-first, offline-capable.
// Client component ('use client') — entire page is interactive.

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';

// ─── Zod Schema ────────────────────────────────────────────────────
const DailyLogSchema = z.object({
  log_date: z.string(),         // ISO date string
  // Section A — required
  deaths_today: z.number().int().min(0),
  death_cause: z.enum(['unknown','heat','disease','injury','cull','other']).optional(),
  // Section B — required
  feed_consumed_kg: z.number().positive(),
  feed_type: z.enum(['starter','grower','finisher']).optional(),
  // Section C — conditional
  weigh_in_today: z.boolean().default(false),
  sample_birds: z.number().int().positive().optional(),
  sample_weight_kg: z.number().positive().optional(),
  // Section D — optional
  water_litres: z.number().positive().optional(),
  temp_min_c: z.number().optional(),
  temp_max_c: z.number().optional(),
  humidity_pct: z.number().min(0).max(100).optional(),
  // Section E — optional
  health_issue: z.boolean().default(false),
  health_symptoms: z.array(z.string()).optional(),
  health_severity: z.enum(['mild','moderate','severe']).optional(),
  health_notes: z.string().max(200).optional(),
  // Section F
  notes: z.string().max(500).optional(),
});

type DailyLogInput = z.infer<typeof DailyLogSchema>;

// ─── Auto-computed values (derived, not in form state) ─────────────
// feed_per_bird_g = feed_consumed_kg * 1000 / birds_alive
// avg_weight_g    = sample_weight_kg / sample_birds * 1000
// fcr             = cumulative_feed_kg / (birds_alive * avg_weight_g / 1000)
// Note: cumulative values fetched from DB on page load

// ─── Draft autosave ───────────────────────────────────────────────
// Key: `daily-log-draft-${farmId}-${logDate}`
// Every 30 seconds: idbSet(key, formValues)
// On mount: idbGet(key) → populate form if draft exists
// On submit success: idbDel(key)

// ─── Offline handling ─────────────────────────────────────────────
// useEffect: window.addEventListener('online', handleOnlineRestore)
// handleOnlineRestore: if pending draft in IndexedDB → auto-submit
// Offline banner: aria-live="polite", amber banner

// ─── Already-logged state ─────────────────────────────────────────
// On mount: GET /api/farms/[id]/logs?date=today
// If exists → render AlreadyLoggedCard (shows submitted values + [Edit] button)
// Edit mode: same form pre-populated, amendment flag set on submit

// ─── Mobile-specific: section collapse ───────────────────────────
// Section D + E: collapsed by default (useState collapsed)
// Section header: full-width button, chevron icon, aria-expanded
// Transition: Framer Motion AnimatePresence height animation

// ─── Submit handler ───────────────────────────────────────────────
// POST /api/farms/[farmId]/daily-log
// Body: DailyLogInput + computed values
// On 201: idbDel draft key, router.push(/dashboard/farms/[farmId]?tab=daily-log&success=1)
// On error: inline error toast (Don Norman: friendly message)
// Optimistic UI: submit button shows spinner, form disabled during request
```

**QA Checks:**
- [ ] Form renders correctly at 375px, 390px, 430px viewport widths
- [ ] All inputs ≥52px height on mobile
- [ ] Number inputs open numeric keyboard on mobile (inputMode="numeric")
- [ ] Computed FCR + cumulative mortality update in real-time as fields change
- [ ] Draft saves to IndexedDB every 30s; draft badge visible
- [ ] Simulate offline → fill form → submit → goes to queue → auto-submits on reconnect
- [ ] Already logged today → shows read-only state with edit option
- [ ] Submit disabled until deaths_today + feed_consumed_kg filled
- [ ] Backdating to -7 days works; -8 days shows "admin required" message
- [ ] Form submission → POST /api/farms/[id]/daily-log → success → redirect with success toast
- [ ] Font size 16px minimum on all inputs (no iOS zoom on focus)

---

### FF-05 — Add New Farm Wizard ✅ COMPLETED

**File:** `apps/web/app/(dashboard)/farms/new/page.tsx`
**Priority:** 🔴 P0
**Dependencies:** `react-hook-form`, `zod`, `canvas-confetti`, `@supabase/ssr`
**Est:** 12h
**Status:** ✅ COMPLETED - All GAP CHECKS pass from audit.md Flow C1
**Implementation Notes:**
- Connected wizard submit to actual `/api/farms` POST endpoint
- Added capacity density visualization with percentage bars in Step 2
- Implemented proper redirect to new farm detail page after creation
- All 4 steps fully functional with proper validation

```typescript
// PURPOSE: 4-step onboarding wizard for a new farm.
// Client component — wizard state in sessionStorage.

// Steps managed by <FarmOnboardingWizard /> component:
//   Step 1: <FarmInfoStep />    — name, type, location, manager
//   Step 2: <ShedSetupStep />   — dynamic shed list (add/remove sheds)
//   Step 3: <FirstBatchStep />  — optional batch (can skip)
//   Step 4: <ReviewStep />      — summary + edit section links

// Step indicator: 4 circles connected by line
//   Filled (complete): brandGreen700 bg, white checkmark
//   Active: brandGreen700 border, white bg
//   Upcoming: neutral-300 border, white bg

// Per-step Zod schemas:
//   farmInfoSchema, shedSetupSchema, batchSchema (optional fields)

// sessionStorage key: 'farm-wizard-draft' → serialize wizard state on each step
// On mount: restore from sessionStorage if exists

// ShedSetupStep: dynamic array (react-hook-form useFieldArray)
//   [+ Add Shed] → appends shed form row
//   [Remove] per shed (min 1 shed required)
//   Total capacity: sum of all shed capacities (auto-computed, displayed as read-only)

// District dropdown: fetched from /api/reference/districts (static JSON, not Supabase)

// GPS: navigator.geolocation.getCurrentPosition → populates lat/lng fields
//   Fallback: manual text inputs
//   Show map preview (Leaflet.js) if lat/lng present

// Submit (Step 4):
//   POST /api/farms → { farm, sheds, batch (optional) }
//   On 201 success:
//     canvas-confetti burst (1.5s, brandGreen700 + gold colours)
//     sessionStorage.removeItem('farm-wizard-draft')
//     router.push(/dashboard/farms/[newFarmId])
//   On error: inline error on Step 4, do not clear draft

// Max farms check: on wizard start, GET /api/farms/count
//   If ≥50: show "limit reached" page, not the wizard
```

**QA Checks:**
- [ ] Step indicator updates correctly at each step
- [ ] Cannot advance to Step 2 if Step 1 has Zod validation errors
- [ ] Can always go back to previous step
- [ ] Page refresh mid-wizard: wizard state restored from sessionStorage
- [ ] Shed array: add up to 20 sheds; cannot remove below 1
- [ ] Total capacity auto-computed correctly from shed capacities
- [ ] GPS capture works on mobile (HTTPS required — verified on staging)
- [ ] First batch skip works: farm created with status='between_batches', no batch record
- [ ] Confetti fires on success; duration ~1.5 seconds
- [ ] 51st farm attempt → "limit reached" page (not wizard)
- [ ] POST is transactional: if shed insert fails, farm insert rolled back

---

### FF-06 — Farm Compare Page

**File:** `apps/web/app/(dashboard)/farms/compare/page.tsx`
**Priority:** 🟡 P1
**Dependencies:** `recharts`, `@supabase/ssr`
**Est:** 8h

```typescript
// PURPOSE: Side-by-side radar + table comparison of 2–5 farms.

// Client component ('use client') — farm selector is interactive.

// FarmMultiSelect:
//   Pill-style multi-select (not a dropdown — shows all farms as clickable pills)
//   Max 5 selected; 6th click shows toast "Maximum 5 farms compared at once"
//   Selected farms: brandGreen700 bg, white text
//   Unselected: neutral-100 bg, neutral-700 text

// Period selector: Segmented control (see design tokens)
//   This Week | This Month | This Batch Cycle | Custom
//   Custom: date range picker (two date inputs)

// RadarChart:
//   Recharts RadarChart — 6 axes
//   Normalise all metrics 0–100 for display (store actual values in tooltip)
//   Colour per farm: fixed palette (blue, orange, purple, teal, rose) — NOT green/red
//   Legend: farm name + colour swatch
//   aria-label="Farm performance radar chart comparing [farm names]"

// Comparison table below radar:
//   Metrics as rows; farms as columns
//   Best value per metric: faint green cell background
//   Industry avg column: from /api/metrics/industry-averages (anonymised aggregate)

// URL state: ?farms=uuid1,uuid2,uuid3&period=30d
//   Updated via router.replace on every selection change
//   Shareable: other admin with same integrator account can open same URL

// PDF export: POST /api/reports/compare { farmIds, period }
//   Returns: { downloadUrl: 'https://...' }
//   Button: [Download PDF Report]
```

**QA Checks:**
- [ ] Cannot select <2 or >5 farms; 6th selection shows helpful toast
- [ ] Radar chart renders correctly with 2, 3, 4, 5 farms
- [ ] Best-in-column highlighted correctly (FCR: lowest is best; ADG: highest is best)
- [ ] URL updates on farm selection; shareable link works
- [ ] Only 1 farm available: empty state with "Add another farm" CTA
- [ ] Period change triggers new data fetch (SWR key includes period)
- [ ] RLS: only integrator's own farms appear in selector

---

### FF-07 — Farm Shared Components Library

**File:** `apps/web/components/farms/` _(directory)_
**Priority:** 🔴 P0
**Est:** 10h (across all components)

```typescript
// PURPOSE: Shared UI components for farm module.
// All components follow design tokens from 14_integrator_farms_design_master.md

// Components to build:

// FarmStatusBadge.tsx
//   Props: status: 'active'|'between_batches'|'paused'|'onboarding'|'archived'
//   Renders: pill with colour from FarmMetricTokens.farm* tokens
//   Always: text label + colour (never colour-only)

// FCRBadge.tsx
//   Props: fcr: number | null
//   Renders: FCR value + colour from FarmMetricTokens.fcr* tokens
//   null → "—" placeholder, fcrNeutral colour

// MortalityBadge.tsx
//   Props: mortalityPct: number | null
//   Renders: X% + colour from FarmMetricTokens.mortality* tokens

// BatchProgressBar.tsx
//   Props: placementDate: string, targetHarvestAge: number (days)
//   Renders: progress bar with day markers (Day 0, Day 14, harvest window, Day 42+)
//   Current day: solid circle marker
//   Harvest window (Day 35+): gold/amber zone

// DailyLogStatusChip.tsx
//   Props: lastLogDate: string | null
//   Renders: "✓ Logged [time]" (green) OR "⚠ Log pending" (amber)
//   Detects: lastLogDate equals today in IST

// FarmMetricCard.tsx
//   Props: label, labelHi, value, unit, trend, trendDirection, statusColour
//   Reusable KPI card for farm module (mirrors DashboardKPICard but farm-specific)

// WeightSparkline.tsx
//   Props: weights: Array<{date: string, weight: number}>
//   Renders: 80px × 32px Recharts sparkline (no axes, no tooltips — summary only)

// SectionHeader.tsx (for daily log form)
//   Props: title, titleHi, isCollapsible, isCollapsed, onToggle
//   Renders: section divider with optional collapse toggle

// FarmEmptyState.tsx
//   Props: variant: 'no_farms'|'no_batch'|'no_data'|'no_logs'|'compare_need_more'
//   Renders: illustration + heading + sub + optional CTA
//   Illustrations: placeholder SVGs (replace with final assets)
```

**QA Checks:**
- [ ] FCRBadge: fcr=null → "—" shown, no NaN or undefined
- [ ] BatchProgressBar: batch past harvest age → shows "Harvest Window" zone coloured
- [ ] DailyLogStatusChip: handles IST timezone correctly (not UTC)
- [ ] All badges: text label present (not colour-only) — accessibility check
- [ ] All components: TypeScript strict, no `any` types

---

## TASK GROUP FM: FARM METRICS PAGES

### FM-01 — Portfolio Metrics Dashboard

**File:** `apps/web/app/(dashboard)/metrics/page.tsx`
**Priority:** 🔴 P0
**Dependencies:** `recharts`, `swr`, `@supabase/ssr`
**Est:** 10h

```typescript
// PURPOSE: Portfolio-level aggregated metrics — S2 integrator's bird's-eye view.
// Server component for KPI cards (SSR).
// Client components for charts and period selector.

// Server-side:
//   1. GET farm_metrics_summary WHERE integrator_id = auth.uid()
//   2. Aggregate: total_live_birds, portfolio_fcr (weighted avg), portfolio_mortality, total_feed

// Period selector (client): This Week | This Month | This Batch Cycle | Custom
//   Stored in URL ?period=30d

// Portfolio FCR Trend chart:
//   Data: GET /api/metrics/fcr-trend?integrator_id=[id]&period=[period]
//   Recharts LineChart: one line per active farm + portfolio avg line + industry avg dashed line
//   Legend: farm names (truncated to 15 chars) + "Portfolio Avg" + "Industry Avg"

// Mortality Events Timeline:
//   Data: GET /api/metrics/mortality-timeline?period=[period]
//   Recharts ComposedChart: BarChart (stacked, one series per farm) + Line (cumulative %)
//   Click handler: onClick on bar → router.push(/dashboard/farms/[farmId]?tab=daily-log&date=[date])

// Farm Performance League Table:
//   Sort: FCR ascending (lower = better = rank 1)
//   Rank 1: trophy icon (Phosphor Trophy)
//   Last rank: amber flag icon
//   Row click: router.push(/dashboard/farms/[id])

// Pending Actions Panel:
//   Data: computed from farm_metrics_summary + vaccinations table
//   Items:
//     - Farms with no log today (last_log_date < today IST)
//     - Vaccinations overdue (due_date < today, status = 'pending')
//     - Feed stock low (estimated <5 days remaining — from feed_purchases data)
//   Realtime: useRealtimeFarmLogs hook → updates pending log count on new INSERT

// SWR: refreshInterval 300000, revalidateOnFocus true
```

**QA Checks:**
- [ ] KPI cards: SSR data, no loading flash on first paint
- [ ] Period selector change: all charts refetch with new period param
- [ ] Portfolio FCR line: weighted average of all farm FCRs (not simple average)
- [ ] Mortality timeline: clicking a bar opens correct farm + date
- [ ] Pending actions: shows farms with missing TODAY's log in IST timezone (not UTC)
- [ ] Realtime hook: new daily_log INSERT → pending count decrements

---

### FM-02 — FCR Analysis Page

**File:** `apps/web/app/(dashboard)/metrics/fcr/page.tsx`
**Priority:** 🟡 P1
**Dependencies:** `recharts`, `swr`
**Est:** 8h

```typescript
// PURPOSE: Deep FCR analysis — trends, farm breakdown, recommendations.

// Section 1: Portfolio FCR trend (LineChart, 30/90-day)
//   Data: GET /api/metrics/fcr-trend?period=[period]
//   Lines: one per farm + portfolio avg + industry avg (dashed)
//   Farm filter: pill selector (multi, default = all)

// Section 2: FCR by Farm (horizontal BarChart)
//   Data: /api/metrics/fcr-by-farm?period=[period]
//   Sorted ascending; colour per FarmMetricTokens.fcr* bands
//   Click bar → opens FarmDetailDrawer (right side panel, Framer Motion slide)
//   FarmDetailDrawer: shows farm name, current batch, FCR trend sparkline, quick links

// Section 3: FCR Breakdown Table
//   Columns: Farm | Batch # | Avg Age | Feed/Bird/Day | Avg Weight | FCR | vs Last Batch | vs Industry
//   Sort: any column; Export CSV: GET /api/metrics/fcr/export

// Section 4: FCR Recommendations (rule-based, Phase 1)
//   Data: GET /api/metrics/fcr-recommendations?farmId=[id]
//   API logic (server-side):
//     IF feed_per_bird > age_target * 1.1 → "Feed wastage suspected — check feeder height"
//     IF temp_max > 32 → "Heat stress reducing FCR — check ventilation"
//     IF mortality_spike_recent → "Recent mortality spike may affect FCR — check bird health"
//     Always: disclaimer card "Not veterinary advice — consult your poultry expert"
//   Disclaimer: aria-describedby pointing to disclaimer text
```

**QA Checks:**
- [ ] Horizontal bar chart: sorted ascending (best FCR at top)
- [ ] FCR colour bands: correct FarmMetricTokens colour for each range
- [ ] FarmDetailDrawer: opens on bar click, closes on Escape key (focus trap)
- [ ] Recommendations: disclaimer always visible, cannot be dismissed
- [ ] CSV export: downloads correct filename `fcr-analysis-[date].csv`

---

### FM-03 — Mortality Tracking Page

**File:** `apps/web/app/(dashboard)/metrics/mortality/page.tsx`
**Priority:** 🟡 P1
**Est:** 8h

```typescript
// PURPOSE: Portfolio mortality tracking with alert integration.

// Alert strip (Realtime):
//   Supabase Realtime on daily_logs where cumulative_mortality_pct > threshold
//   Red alert banner: "[Farm] mortality X% — investigate" (links to farm)
//   Dismissable per session (sessionStorage key per farmId)

// Section 1: Cumulative mortality area chart
//   Recharts AreaChart: one area per farm (stacked = false, overlaid)
//   Reference lines: 3% (amber, mortalityElevated) + 5% (red, mortalityCritical)
//   Period selector: 30/60/90 days

// Section 2: Daily death events stacked bar
//   Recharts BarChart: deaths per day, stacked by farm
//   onClick: navigates to farm daily log for that date

// Section 3: Cause of death donut
//   Recharts PieChart (donut style, innerRadius 60, outerRadius 90)
//   Only shown if any death_cause data logged (else: info banner "Log causes daily for better insights")
//   Legend: colour + label

// Section 4: Mortality log table
//   Columns: Farm | Date | Day # | Deaths | Cause | Cumulative % | Action Taken
//   "Action Taken": sourced from health_notes in daily_logs
//   Sort: date desc default; filter: farm, date range

// Section 5: HPAI correlation
//   Cross-reference: SELECT * FROM alerts WHERE type='HPAI' AND district=[integrator_district]
//   If active HPAI alert + farm mortality elevated → red combined warning card
```

**QA Checks:**
- [ ] Reference lines at 3% and 5% visible and labelled on area chart
- [ ] Donut chart: hidden when no cause data; info message shown instead
- [ ] Alert strip: Realtime subscription fires on new daily_log insert with high mortality
- [ ] HPAI correlation: shows combined warning only when BOTH HPAI alert + mortality spike

---

### FM-04 — Feed Management Page

**File:** `apps/web/app/(dashboard)/metrics/feed/page.tsx`
**Priority:** 🟡 P1
**Est:** 8h

```typescript
// PURPOSE: Feed consumption, cost tracking, and stock management.

// Section 1: Feed consumption chart
//   Recharts ComposedChart: BarChart (stacked kg/day per farm) + Line (gm/bird/day on secondary Y)
//   Two Y-axes: left = kg (0–max), right = gm/bird/day
//   Period: 30 days default

// Section 2: Feed cost table
//   Data: JOIN feed_purchases + batches + farms for this integrator
//   Columns: Farm | Batch | Type | Qty (MT) | Rate (₹/kg) | Total Cost | Cost/kg Produced
//   Total row: portfolio sum (bold)
//   Export: GET /api/metrics/feed/export

// Section 3: Feed rate trend
//   Data: feed_purchases grouped by month, avg rate_per_kg
//   Recharts LineChart: price/kg over 6 months (from feed_purchases)
//   Overlay: NCDEX maize price index from macro_data table (if available)

// Section 4: Low stock alerts
//   Logic: for each active farm:
//     remaining_feed = last purchase qty - cumulative feed consumed since purchase
//     days_remaining = remaining_feed / (last 7 days avg daily feed consumed)
//   Card per farm with <7 days remaining:
//     Farm name, remaining kg, est. days, [Order Now] WhatsApp CTA

// WhatsApp Order CTA:
//   URL: https://wa.me/{supplier_phone}?text={encodedMessage}
//   Message: "Namaste, [Farm Name] ke liye [qty]kg [feed_type] feed chahiye. Please confirm."
//   Opens in new tab
```

**QA Checks:**
- [ ] Two Y-axes render correctly without overlapping labels
- [ ] Total row in cost table: correct sum of all filtered rows
- [ ] Low stock alert: days_remaining calculation uses IST dates, not UTC
- [ ] WhatsApp link: URL-encoded message, opens wa.me in new tab
- [ ] Feed rate trend: shows 6 months even if some months have no purchases (gap in line)

---

### FM-05 — Health Log & Disease Tracker Page

**File:** `apps/web/app/(dashboard)/metrics/health/page.tsx`
**Priority:** 🟡 P1
**Est:** 8h

```typescript
// PURPOSE: Flock health overview, vaccination compliance, disease tracking.

// Section 1: Health status grid
//   CSS Grid: columns auto-fill 160px min
//   Each cell: farm name + health status circle (green/amber/red)
//   Health status: derived from latest daily_log.health_issue + alerts
//   Click → /dashboard/farms/[id]?tab=health

// Section 2: Vaccination compliance
//   Data: JOIN vaccinations + batches WHERE integrator_id = auth.uid()
//   Table: Farm | Vaccine | Due Date | Status | Days Overdue | Notes
//   Overdue rows: DC2626 red left border + bold text
//   Status badge: <VaccinationStatusBadge status="pending"|"done"|"overdue"|"skipped" />

// Section 3: Health event timeline
//   Data: daily_logs WHERE health_issue = true, ordered by log_date DESC
//   Timeline component (vertical, left-border line):
//     Each entry: date chip + farm name + severity badge + symptoms list + notes
//   Filter: All | Critical | Moderate | Mild (segmented control)

// Section 4: HPAI + biosecurity
//   Fetch: GET /api/alerts?type=HPAI&district=[integrator_district]
//   If active alert:
//     Red banner: "⚠ HPAI advisory active in [district]"
//     Biosecurity checklist (10 items — hard-coded from DADF guidelines):
//       [ ] Restrict farm visitor access
//       [ ] Increase disinfection frequency
//       [ ] Monitor birds for respiratory symptoms daily
//       [ ] Report unusual mortality to district vet
//       ... etc
//     Checklist state: saved to Supabase health_checklist_state table
//     (one row per farm per alert_id — can re-check across sessions)
//   If no alert: "🟢 कोई HPAI advisory नहीं है — [District], [date]"
```

**QA Checks:**
- [ ] Health grid: health_issue=true in today's log → amber cell; severity='severe' → red cell
- [ ] Vaccination overdue: due_date < today AND status='pending' → red row (IST date check)
- [ ] HPAI biosecurity checklist: checked state persists across browser sessions (Supabase)
- [ ] Timeline filter: 'Critical' shows only severity='severe' logs

---

## TASK GROUP FR: FARM REPORTS

### FR-01 — Batch Report Page

**File:** `apps/web/app/(dashboard)/reports/integrator/page.tsx`
**Priority:** 🟡 P1
**Dependencies:** `@supabase/ssr`
**Est:** 8h

```typescript
// PURPOSE: Auto-generated batch performance report (on-screen + PDF).
// Query param: ?batchId=[uuid]
// Access: integrator who owns the farm; admin

// Server-side data fetch (single query with joins):
//   batch + farm + all daily_logs + vaccinations + feed_purchases
//   PoultryPulse price: SELECT p50 FROM predictions WHERE mandi = farm.district AND date = batch.closed_at

// Report sections (server-rendered, print-friendly CSS):
//   <BatchSummarySection />        — farm, dates, birds in/out, duration
//   <GrowthPerformanceSection />   — FCR, ADG, harvest weight, vs target, vs industry
//   <MortalityAnalysisSection />   — chart + causes breakdown
//   <FeedSummarySection />         — total feed, cost, efficiency
//   <HealthLogSummarySection />    — vaccination compliance, health events
//   <FinancialSummarySection />    — revenue (P50 price × weight), costs, gross profit
//   <RecommendationsSection />     — next batch recommendations (rule-based)

// PDF generation:
//   Client: [Download PDF] → GET /api/reports/[batchId]/pdf
//   Server: Puppeteer renders /reports/integrator/[batchId]?print=true → PDF response
//   Headers: Content-Disposition: attachment; filename=batch-[batchNumber]-report.pdf

// Data lock: batch.status === 'closed' → all data immutable (no edit links shown)
// Financial disclaimer: "Revenue estimated using PoultryPulse P50 price. Actual realised price may vary."
```

**QA Checks:**
- [ ] RLS: batchId belonging to different integrator → 404
- [ ] Financial summary: revenue uses P50 from predictions table, not user-entered value
- [ ] Disclaimer visible on financial section (cannot be hidden)
- [ ] PDF download: correct filename, valid PDF, all 7 sections included
- [ ] WhatsApp share: generates signed URL, opens wa.me link correctly
- [ ] Print view: no sidebar, no nav, clean report layout

---

## TASK GROUP FA: FARM API ROUTES

### FA-01 — Farm CRUD API

**File:** `apps/web/app/api/farms/route.ts`
**Priority:** 🔴 P0
**Est:** 6h

```typescript
// GET /api/farms
//   Auth: Supabase session, S2+ or admin
//   Returns: farms WHERE integrator_id = session.user.id
//   Includes: latest batch summary (LEFT JOIN), last_log_date
//   Query params: status (filter), sort (name|fcr|mortality|birds|last_log)
//   RLS: double-check at API layer (defence in depth beyond RLS)

// POST /api/farms
//   Auth: Supabase session, S2+ only
//   Body: { farm: FarmInput, sheds: ShedInput[], batch?: BatchInput }
//   Validation: Zod schema (FarmCreateSchema)
//   Transaction: BEGIN → insert farm → insert sheds → insert batch (if provided) → COMMIT
//   If any step fails: ROLLBACK, return 500 with friendly error
//   Max farms check: COUNT(farms WHERE integrator_id=id) >= 50 → 403
//   Returns: 201 + { farmId, batchId }

// File: apps/web/app/api/farms/[farmId]/route.ts
// GET /api/farms/[farmId]
//   Returns full farm detail + active batch + last 30 daily_logs
//   RLS: integrator_id check (return 404 if not owner — do not leak existence)

// PATCH /api/farms/[farmId]
//   Body: Partial<FarmInput> (name, manager, status, etc.)
//   RLS: integrator_id check
//   Updated_at: auto-set server-side

// DELETE (archive) /api/farms/[farmId]
//   Sets status = 'archived', does NOT hard delete
//   Requires no active batch (400 if active batch exists)
```

**QA Checks:**
- [ ] GET: returns only requesting integrator's farms (RLS + API layer check)
- [ ] POST transaction: shed insert failure → farm also rolled back (check DB)
- [ ] POST max farms: 51st farm attempt → 403 with friendly message
- [ ] GET [farmId]: farmId from other integrator → 404 (not 403)
- [ ] PATCH: updated_at changes on every PATCH
- [ ] DELETE: farm with active batch → 400 with message "पहले batch close करें"

---

### FA-02 — Daily Log API

**File:** `apps/web/app/api/farms/[farmId]/daily-log/route.ts`
**Priority:** 🔴 P0
**Est:** 6h

```typescript
// POST /api/farms/[farmId]/daily-log
//   Auth: S2+ or admin; integrator_id check on farmId
//   Body: DailyLogInput (Zod validated)
//   Computed fields (server-side — never trust client):
//     batch_day: log_date - batch.placement_date
//     cumulative_deaths: SUM(deaths_today) for this batch up to log_date
//     cumulative_mortality_pct: cumulative_deaths / batch.birds_placed * 100
//     feed_per_bird_g: feed_consumed_kg * 1000 / (birds_placed - cumulative_deaths)
//     cumulative_feed_kg: SUM(feed_consumed_kg) for this batch up to log_date
//     avg_weight_g: sample_weight_kg / sample_birds * 1000 (if weigh-in)
//     fcr: cumulative_feed_kg / ((birds_placed-cumulative_deaths) * avg_weight_g/1000) (if weigh-in)
//   Date validation: log_date <= today (IST); log_date >= placement_date
//   Backdating: log_date < today - 7 days AND role != 'admin' → 403
//   Duplicate check: UNIQUE(batch_id, log_date) → 409 Conflict with existing log id
//   Returns: 201 + { logId, computedValues }

// GET /api/farms/[farmId]/logs
//   Query params: page (default 1), limit (default 30), date (specific date)
//   Returns: paginated daily_logs for active batch; computed values included

// GET /api/farms/[farmId]/logs/export
//   Returns: CSV stream of all logs for active batch
//   Content-Disposition: attachment; filename=farm-[name]-logs-[date].csv
//   Auth: S2+ owner or admin
```

**QA Checks:**
- [ ] cumulative_deaths: computed from DB SUM, not from client-sent value
- [ ] fcr: only computed when weigh-in data present AND cumulative_weight > 0
- [ ] IST date validation: 23:00 UTC = 04:30 IST next day — test edge case
- [ ] Backdating >7 days by non-admin: 403 with "Admin approval required"
- [ ] Duplicate log: 409 with { conflictLogId } in response body
- [ ] CSV export: all columns, proper UTF-8, no BOM issues

---

### FA-03 — Batch Management API

**File:** `apps/web/app/api/farms/[farmId]/batches/route.ts`
**Priority:** 🔴 P0
**Est:** 4h

```typescript
// POST /api/farms/[farmId]/batches
//   Creates new batch; closes any existing active batch first (with warning if within 7 days of target age)
//   Body: BatchInput (Zod validated)
//   Sets farm.status = 'active'
//   Auto-generates vaccination schedule from breed defaults (Cobb 430, Ross 308 etc.)
//   Returns: 201 + { batchId, vaccinationSchedule }

// PATCH /api/farms/[farmId]/batches/[batchId]/close
//   Body: { birds_harvested: number, closed_at: string }
//   Sets batch.status = 'closed', batch.closed_at
//   Sets farm.status = 'between_batches'
//   Triggers: batch report generation job (POST to /api/jobs/generate-batch-report)
//   Returns: 200 + { reportId (pending) }

// GET /api/farms/[farmId]/batches
//   Returns all batches for this farm (including closed), paginated
```

**QA Checks:**
- [ ] New batch creation: previous active batch → automatically closed first
- [ ] Vaccination schedule auto-generated on batch creation (Cobb 430: 5 standard vaccines)
- [ ] Batch close: farm status correctly changes to 'between_batches'
- [ ] Batch close: report generation job triggered (check jobs table)

---

### FA-04 — Metrics Aggregation APIs

**File:** `apps/web/app/api/metrics/` _(directory)_
**Priority:** 🟡 P1
**Est:** 10h

```typescript
// GET /api/metrics/portfolio-summary
//   Returns: total_birds, portfolio_fcr, portfolio_mortality, total_feed_kg for this integrator
//   Source: farm_metrics_summary materialized view (fast read)
//   Cache: SWR on client + 5-minute ISR on server

// GET /api/metrics/fcr-trend?period=30&farmIds=uuid1,uuid2
//   Returns: time series FCR data per farm + portfolio avg + industry avg
//   Industry avg: anonymised aggregate from farm_metrics_summary across ALL integrators
//   Auth: integrator sees own farms + anonymised industry avg (no other integrator's data)

// GET /api/metrics/mortality-timeline?period=30
//   Returns: daily deaths per farm over period
//   Format: { date: string, farms: { [farmId]: { deaths: number, cumulativePct: number } } }[]

// GET /api/metrics/fcr-recommendations?farmId=[id]
//   Returns: array of recommendation objects { text: string, textHi: string, severity: 'info'|'warning' }
//   Rule engine (see FM-02 for rules)
//   Always includes: { disclaimer: true } flag at top level

// GET /api/metrics/industry-averages
//   Returns: { fcr, mortality_pct, adg_g, feed_per_bird_g } industry averages
//   Source: anonymised aggregate from farm_metrics_summary
//   Min records required: 10+ farms to publish (privacy guard)
//   Cached: Redis/Upstash (1 hour TTL)

// GET /api/metrics/feed-analysis?period=30
//   Returns: feed consumption per farm per day + purchase history + stock levels

// GET /api/metrics/health-summary
//   Returns: per-farm health status + vaccination compliance % + active health events count
```

**QA Checks:**
- [ ] industry-averages: returns null (not error) if <10 farms in aggregate (privacy guard)
- [ ] fcr-trend: farmIds filter works; returns only requested farms' data
- [ ] fcr-recommendations: always includes disclaimer flag (test in frontend that disclaimer renders)
- [ ] All endpoints: 401 if no session; 403 if S1/non-S2 segment

---

### FA-05 — Report Generation API

**File:** `apps/web/app/api/reports/[batchId]/pdf/route.ts`
**Priority:** 🟡 P1
**Dependencies:** `puppeteer` (Railway.app server-side)
**Est:** 6h

```typescript
// GET /api/reports/[batchId]/pdf
//   Auth: batch.farm.integrator_id = session.user.id OR admin
//   Step 1: Verify access (RLS check)
//   Step 2: POST to Railway.app PDF service: { reportUrl, batchId }
//     PDF service: puppeteer renders /reports/print/[batchId] → PDF buffer
//   Step 3: Store PDF in Supabase Storage: reports/[batchId].pdf
//   Step 4: Return signed URL (7-day expiry) OR stream PDF directly
//   Headers: Content-Disposition: attachment; filename=batch-report-[batchNumber].pdf
//   Idempotent: if PDF already exists in Storage, return existing (don't re-render)
//   Rate limit: 5 PDF generations per integrator per hour (Upstash Redis)

// POST /api/reports/compare
//   Body: { farmIds: string[], period: string }
//   Same puppeteer flow for compare report
//   Returns: { downloadUrl: string }

// POST /api/reports/share-whatsapp
//   Body: { batchId: string }
//   Gets signed URL for PDF
//   Sends via Twilio WhatsApp: "Your batch report is ready: [url]"
//   Rate limit: 3 per hour per integrator
```

**QA Checks:**
- [ ] PDF: all 7 sections present and correctly formatted
- [ ] PDF: no dashboard sidebar/navigation visible (print=true layout)
- [ ] Idempotent: second PDF request returns existing file (check Supabase Storage)
- [ ] Rate limit: 6th PDF request in 1 hour → 429 with friendly message
- [ ] WhatsApp share: Twilio message delivered (check Twilio dashboard in test)

---

## TASK GROUP FD: DATABASE & REALTIME

### FD-01 — Database Schema Migration

**File:** `supabase/migrations/20260523_farm_management.sql`
**Priority:** 🔴 P0
**Est:** 4h

```sql
-- PURPOSE: Create all new tables for farm management module.
-- Execute the full schema from 14_integrator_farms_design_master.md §8
-- Plus: additional tables not in design doc

-- health_checklist_state: for HPAI biosecurity checklist persistence
CREATE TABLE health_checklist_state (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id     UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  alert_id    UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  items       JSONB NOT NULL DEFAULT '{}',  -- { "item_key": boolean }
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(farm_id, alert_id)
);

-- batch_report_jobs: async PDF generation queue
CREATE TABLE batch_report_jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id    UUID NOT NULL REFERENCES batches(id),
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','processing','complete','failed')),
  pdf_path    TEXT,    -- Supabase Storage path
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_daily_logs_batch_date ON daily_logs(batch_id, log_date DESC);
CREATE INDEX idx_daily_logs_farm_date ON daily_logs(farm_id, log_date DESC);
CREATE INDEX idx_batches_farm_status ON batches(farm_id, status);
CREATE INDEX idx_farms_integrator ON farms(integrator_id, status);
CREATE INDEX idx_vaccinations_batch_due ON vaccinations(batch_id, due_date);
CREATE INDEX idx_feed_purchases_farm ON feed_purchases(farm_id, purchase_date DESC);

-- RLS policies (all tables)
ALTER TABLE sheds ENABLE ROW LEVEL SECURITY;
CREATE POLICY sheds_owner ON sheds
  USING (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY batches_owner ON batches
  USING (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_logs_owner ON daily_logs
  USING (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));

ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY vaccinations_owner ON vaccinations
  USING (batch_id IN (
    SELECT b.id FROM batches b
    JOIN farms f ON b.farm_id = f.id
    WHERE f.integrator_id = auth.uid()
  ));

ALTER TABLE feed_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY feed_purchases_owner ON feed_purchases
  USING (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));

-- Materialized view refresh function
CREATE OR REPLACE FUNCTION refresh_farm_metrics_summary()
RETURNS VOID AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY farm_metrics_summary;
$$ LANGUAGE SQL;

-- Schedule: pg_cron job every 30 minutes
SELECT cron.schedule('refresh-farm-metrics', '*/30 * * * *',
  'SELECT refresh_farm_metrics_summary()');
```

**QA Checks:**
- [ ] Migration runs clean on fresh Supabase project (no errors)
- [ ] RLS: S2 integrator A cannot query farms of integrator B (test with service_role bypass)
- [ ] Materialized view: refreshes without lock on concurrent reads
- [ ] All indexes created: EXPLAIN ANALYZE confirms index usage on common queries
- [ ] daily_logs UNIQUE(batch_id, log_date): duplicate insert returns 409

---

### FD-02 — Realtime Hooks — Farm Module

**File:** `apps/web/hooks/useRealtimeFarmLogs.ts`
**Priority:** 🟡 P1
**Est:** 3h

```typescript
'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSWRConfig } from 'swr';

// Subscribes to daily_logs INSERT events for this integrator's farms
// On new log: mutates farm_metrics_summary SWR cache (removes farm from "pending" list)
// Also: if mortality_pct in new log > threshold → triggers Realtime notification

export function useRealtimeFarmLogs(integratorId: string) {
  const { mutate } = useSWRConfig();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`farm-logs:${integratorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_logs',
          // Filter: only logs for this integrator's farms
          // Note: Supabase Realtime filter on joined table not supported;
          // filter by farm_ids fetched on mount instead
        },
        (payload) => {
          // Revalidate portfolio metrics SWR
          mutate((key) => typeof key === 'string' && key.includes('/api/metrics'));
          mutate((key) => typeof key === 'string' && key.includes('/api/farms'));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [integratorId, mutate]);
}

// File: apps/web/hooks/useOfflineDraftSync.ts
// PURPOSE: Detect online/offline, auto-submit pending daily log drafts from IndexedDB
// On window.addEventListener('online'): check idb-keyval for any 'daily-log-draft-*' keys
// For each key: attempt POST /api/farms/[farmId]/daily-log, delete draft on success
// Ref: FR-FARM-003 offline mode requirement
```

**QA Checks:**
- [ ] Realtime: new daily_log insert → /api/farms SWR cache revalidated within 2 seconds
- [ ] Offline hook: simulate network drop, fill form, go online → draft submitted automatically
- [ ] Multiple pending drafts: all submitted sequentially on reconnect (not parallel — avoid rate limit)

---

### FD-03 — Airflow DAG — Daily Log Reminder

**File:** `airflow/dags/dag_daily_log_reminder.py`
**Priority:** 🟡 P1
**Dependencies:** Astronomer.io DAG, Twilio WhatsApp
**Est:** 4h

```python
# PURPOSE: Send WhatsApp reminder to S2 integrators who have not logged today's data.
# Schedule: 08:00 IST daily (02:30 UTC)

# DAG steps:
# 1. Query Supabase: find all active farms WHERE last_log_date < today IST
#    SELECT f.id, f.name, c.phone, c.notification_whatsapp
#    FROM farms f
#    JOIN customers c ON f.integrator_id = c.id
#    WHERE f.status = 'active'
#    AND f.id NOT IN (
#      SELECT farm_id FROM daily_logs WHERE log_date = CURRENT_DATE AT TIME ZONE 'Asia/Kolkata'
#    )
#    AND c.notification_whatsapp = true
#
# 2. For each farm (grouped by integrator phone):
#    Send one WhatsApp per integrator (not one per farm — avoid spam)
#    Message: "🐔 {farm_names} का आज का daily log pending है।
#              Data अभी log करें: {dashboard_url}/farms/{farm_id}/daily-log"
#
# 3. Log to notification_log table: { integrator_id, type='daily_log_reminder', sent_at, farms_count }
#
# Retry: max 2 retries (network failures only; no retry on Twilio 4xx)
# Rate limit: max 1000 WhatsApp per day (free tier)

from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

dag = DAG(
    'daily_log_reminder',
    schedule_interval='30 2 * * *',  # 08:00 IST = 02:30 UTC
    start_date=datetime(2026, 6, 1, tzinfo=timezone.utc),
    catchup=False,
    max_active_runs=1,
    tags=['notifications', 'farms'],
)
```

**QA Checks:**
- [ ] DAG runs at 08:00 IST (verify with Astronomer scheduler logs)
- [ ] Integrator with 3 farms missing logs → receives 1 WhatsApp (not 3)
- [ ] Integrator who has logged all farms → does NOT receive reminder
- [ ] notification_whatsapp=false → no message sent
- [ ] Dry run: PythonOperator prints recipients without sending (test mode env var)

---

## TASK GROUP FT: TESTING — FARM MODULE

### FT-01 — Farm API Unit Tests

**File:** `apps/web/__tests__/api/farms.test.ts`
**Priority:** 🔴 P0
**Est:** 8h

```typescript
// Test cases using Vitest + Supabase test database

// POST /api/farms
describe('POST /api/farms', () => {
  it('creates farm + sheds + optional batch in single transaction', ...)
  it('returns 403 if integrator already has 50 farms', ...)
  it('rolls back farm if shed insert fails', ...)
  it('returns 401 if unauthenticated', ...)
  it('returns 403 if segment is S1', ...)
})

// POST /api/farms/[id]/daily-log
describe('POST /api/farms/[id]/daily-log', () => {
  it('computes cumulative_deaths from DB SUM, not client value', ...)
  it('computes FCR correctly when weigh-in data present', ...)
  it('returns 409 if duplicate log_date for same batch', ...)
  it('returns 403 if backdating >7 days (non-admin)', ...)
  it('allows backdating >7 days for admin', ...)
  it('returns 404 if farmId belongs to different integrator', ...)
  it('correctly validates IST date (not UTC) for today check', ...)
})

// GET /api/farms
describe('GET /api/farms', () => {
  it('returns only farms belonging to authenticated integrator', ...)
  it('returns empty array (not error) if no farms', ...)
  it('status filter: only returns farms matching status param', ...)
})
```

**QA Checks:**
- [ ] All unit tests pass on CI
- [ ] RLS bypass test: service_role query returns all farms; anon returns 0
- [ ] FCR calculation: known inputs → expected output (reference calculation in test)

---

### FT-02 — Farm E2E Tests (Playwright)

**File:** `apps/web/e2e/farms.spec.ts`
**Priority:** 🟡 P1
**Est:** 16h

```typescript
// E2E flows covering the full integrator journey

test('Full farm onboarding: wizard → farm card appears in portfolio', async ({ page }) => {
  await loginAs(page, 'S2_integrator');
  await page.goto('/dashboard/farms/new');
  // Step 1: fill farm info
  await page.fill('[name="farm_name"]', 'Test Farm Gorakhpur');
  await page.click('[data-value="broiler"]');
  // ... complete all steps
  await page.click('[data-testid="submit-farm"]');
  await expect(page.locator('[data-testid="confetti"]')).toBeVisible();
  await page.waitForURL('/dashboard/farms/**');
  await page.goto('/dashboard/farms');
  await expect(page.locator('text=Test Farm Gorakhpur')).toBeVisible();
});

test('Daily log: offline draft → auto-submit on reconnect', async ({ page, context }) => {
  await loginAs(page, 'S2_integrator');
  await page.goto('/dashboard/farms/[testFarmId]/daily-log');
  // Simulate offline
  await context.setOffline(true);
  await page.fill('[name="deaths_today"]', '5');
  await page.fill('[name="feed_consumed_kg"]', '125');
  // Wait for autosave
  await page.waitForSelector('[data-testid="draft-saved-badge"]');
  // Go online
  await context.setOffline(false);
  // Auto-submit should trigger
  await expect(page.locator('[data-testid="log-success"]')).toBeVisible({ timeout: 10000 });
});

test('Farm portfolio: missing log → amber border on farm card', async ({ page }) => {
  // Use a farm fixture that has no log for today
  await loginAs(page, 'S2_integrator_missing_log');
  await page.goto('/dashboard/farms');
  const farmCard = page.locator('[data-testid="farm-card-missing-log"]');
  await expect(farmCard).toHaveCSS('border-left-color', 'rgb(217, 119, 6)'); // amber
  await expect(farmCard.locator('text=Log pending')).toBeVisible();
});

test('Compare: radar chart renders with 3 farms selected', async ({ page }) => {
  await loginAs(page, 'S2_integrator_3_farms');
  await page.goto('/dashboard/farms/compare');
  // Select 3 farms
  await page.click('[data-farm-id="farm-1"]');
  await page.click('[data-farm-id="farm-2"]');
  await page.click('[data-farm-id="farm-3"]');
  await expect(page.locator('[data-testid="radar-chart"]')).toBeVisible();
  // 3 polygon paths in radar
  await expect(page.locator('.recharts-radar-polygon')).toHaveCount(3);
});

test('S1 customer: /dashboard/farms → redirects to /dashboard/403', async ({ page }) => {
  await loginAs(page, 'S1_customer');
  await page.goto('/dashboard/farms');
  await expect(page).toHaveURL('/dashboard/403');
});

test('FCR badge: correct colour for each band', async ({ page }) => {
  await loginAs(page, 'S2_integrator');
  await page.goto('/dashboard/farms');
  // Farm with FCR 1.65: should be fcrExcellent green
  const excellentBadge = page.locator('[data-testid="fcr-badge-excellent"]');
  await expect(excellentBadge).toHaveCSS('background-color', 'rgb(22, 163, 74)');
});
```

**QA Checks:**
- [ ] All E2E tests pass on Playwright CI (Chromium + Firefox + Safari)
- [ ] Offline test: uses Playwright context.setOffline() — verify this API works in test env
- [ ] Mobile viewport tests: log form at 390px (iPhone 14) — all inputs visible without zoom

---

### FT-03 — Farm Module Accessibility Audit

**File:** `apps/web/__tests__/a11y/farms.test.ts`
**Priority:** 🟡 P1
**Est:** 6h

```typescript
// axe-core + Playwright accessibility checks for farm module

test('Farm portfolio page: axe passes (WCAG 2.1 AA)', ...)
test('Daily log form: all inputs have associated labels', ...)
test('Daily log form: computed fields have aria-readonly="true"', ...)
test('Daily log form: submit button aria-busy during submission', ...)
test('Farm cards: colour badges have text labels (not colour-only)', ...)
test('All Recharts charts: aria-label present on ResponsiveContainer', ...)
test('All Recharts charts: hidden data table present as screen reader alternative', ...)
test('Section toggles on mobile: aria-expanded updates correctly', ...)
test('FarmDetailDrawer: focus trap works; Escape closes; focus returns to trigger', ...)
test('Offline banner: aria-live="polite" fires when network drops', ...)
test('Health grid cells: colour status not communicated by colour alone', ...)
```

---

## IMPLEMENTATION SEQUENCE — FARM MODULE

```
WEEK 1: Farm Foundation (P0 blockers)
  Day 1:   FF-01 (middleware extension) → FD-01 (DB migration + schema)
  Day 2:   FF-07 (shared components library — needed by all pages)
  Day 3:   FA-01 (farms CRUD API) → FA-02 (daily log API)
  Day 4:   FF-04 (daily log form — highest-frequency feature)
  Day 5:   FF-05 (add farm wizard)

WEEK 2: Farm Pages + APIs
  Day 6:   FF-02 (farm portfolio page)
  Day 7–8: FF-03 (farm detail page — largest, 5 tabs)
  Day 9:   FA-03 (batch management API)
  Day 10:  FA-04 (metrics aggregation APIs)

WEEK 3: Metrics Module
  Day 11:  FM-01 (portfolio metrics dashboard)
  Day 12:  FM-02 (FCR analysis)
  Day 13:  FM-03 (mortality tracking)
  Day 14:  FM-04 (feed management)
  Day 15:  FM-05 (health log & disease tracker)

WEEK 4: Reports + Realtime + Notifications
  Day 16:  FR-01 (batch report page)
  Day 17:  FA-05 (PDF generation API)
  Day 18:  FF-06 (farm compare page)
  Day 19:  FD-02 (Realtime hooks)
  Day 20:  FD-03 (Airflow reminder DAG)

WEEK 5: Testing
  Day 21–22: FT-01 (unit tests — API layer)
  Day 23–24: FT-02 (E2E tests — full integrator journey)
  Day 25:    FT-03 (accessibility audit)
```

---

## TOTAL FARM MODULE TASK SUMMARY

| Group | Tasks | P0 | P1 | P2 | Total Hours |
|-------|-------|----|----|-----|------------|
| FF (Farm Foundation Pages) | 7 | 5 | 2 | 0 | ~70h |
| FM (Metrics Pages) | 5 | 1 | 4 | 0 | ~42h |
| FR (Reports) | 1 | 0 | 1 | 0 | ~8h |
| FA (API Routes) | 5 | 3 | 2 | 0 | ~32h |
| FD (Database + Realtime) | 3 | 1 | 2 | 0 | ~11h |
| FT (Testing) | 3 | 1 | 2 | 0 | ~30h |
| **Total** | **24** | **11** | **13** | **0** | **~193h** |

---

## P0 LAUNCH BLOCKERS (Farm Module)

```
FF-01  — Route guard (S2 access enforcement)
FF-02  — Farm portfolio page (entry point)
FF-03  — Farm detail page (operational hub)
FF-04  — Daily log form (highest-frequency daily action)
FF-05  — Add farm wizard (onboarding gate)
FF-07  — Shared components (dependency of all pages)
FA-01  — Farm CRUD API (portfolio + wizard)
FA-02  — Daily log API (computed fields + RLS)
FA-03  — Batch API (batch lifecycle management)
FD-01  — DB schema migration (everything depends on this)
FT-01  — API unit tests (RLS validation — must pass before launch)
```

---

## CROSS-MODULE INTEGRATION POINTS

```
1. Price Intelligence → Farm Harvest Alert
   When batch reaches harvest window (Day 35+):
   → Farm module reads PoultryPulse P50 from predictions table
   → Harvest alert card on farm detail: "Current P50 price: ₹X/kg — Sell signal: [SELL_NOW/HOLD]"
   → Links to /dashboard/price-intelligence for full forecast

2. Alerts Module → Farm Health
   HPAI district alert (from /dashboard/alerts) → mirrors into /dashboard/metrics/health
   Mortality spike + active HPAI alert → combined red warning card

3. Calculator Module → Multi-Farm View (existing FR-DASH-005)
   Existing calculator MultiFarmView component → reads from new farms table
   Replace mock farm data with: SELECT * FROM farm_metrics_summary WHERE integrator_id = auth.uid()
   Links from calculator farm cards → /dashboard/farms/[id]

4. Batch Report → PoultryPulse Price
   Financial summary in batch report: revenue calculation uses predictions.p50
   WHERE mandi = farm.district AND date = batch.closed_at
   Disclaimer: "Revenue estimated at PoultryPulse P50 price. Actual may vary."

5. Sidebar Badge — Active Farms Count
   Sidebar "My Farms" nav item: badge showing count of active farms
   Data: farm_metrics_summary count WHERE status='active'
   SWR: 5-minute refresh (same as portfolio page)
```

---

*Document: 15_integrator_farms_tasks_master.md*
*Companion: 14_integrator_farms_design_master.md*
*Extends: 13_postlogin_tasks_master.md*
*© 2026 PoultryPulse AI Technologies Pvt. Ltd. | CONFIDENTIAL*
