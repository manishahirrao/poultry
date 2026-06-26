# PoultryPulse AI — Dashboard Enhancement Task Specification
**Document Type:** Task Specification (Kiro-Compatible)  
**Version:** 1.0 · May 2026  
**Classification:** CONFIDENTIAL — Engineering Use  
**Author:** Senior Software Head  
**References:** Requirements v1.0, Design v1.0, TRD v1.0, Architecture v1.0  
**Sprint Cadence:** 2-week sprints. Sprint 1 starts immediately after this document is approved.  
**Total Estimated Scope:** 16 weeks (8 sprints) in parallel with model training

---

## Kiro Task Format Guide

Each task uses this format:

```
### TASK-[ID]: [Title]
**Requirement Refs:** REQ-[N], SEC-[N], PERF-[N]
**Sprint:** S[N]
**Estimate:** [N] days
**Assigned Role:** [Frontend / Backend / ML / Full-Stack / DevOps]
**Depends On:** TASK-[N] (or None)
**Status:** [ ] Not Started

#### Description
[What needs to be built]

#### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

#### Technical Notes
[Implementation details, gotchas, key decisions]
```

---

## Sprint 1 (Weeks 1–2): Foundation & Command Center Shell

### TASK-001: Design Token Extension & Global CSS Setup
**Requirement Refs:** Design Spec §1.2, §1.3  
**Sprint:** S1  
**Estimate:** 1 day  
**Assigned Role:** Frontend  
**Depends On:** None  
**Status:** [ ] Not Started

#### Description
Extend the existing `tokens.css` file (from UI/UX Design v1.0) with all new dashboard-specific tokens defined in Design Spec §1.2. Add IBM Plex Mono + IBM Plex Sans font loading via `next/font`. Implement the skeleton shimmer CSS and animation token CSS files.

#### Acceptance Criteria
- [ ] All tokens from Design Spec §1.2 added to `src/styles/tokens.css` under a `/* Dashboard Enhancement v1.0 */` comment block
- [ ] IBM Plex Mono and IBM Plex Sans loaded via `next/font/google` in `_app.tsx` — no FOUT on page load
- [ ] `src/styles/skeleton.css` created with shimmer animation targeting `.skeleton` class
- [ ] `src/styles/animations.css` created with all page transition, data refresh, and alert animations
- [ ] `prefers-reduced-motion: reduce` media query collapses all animations to 0ms
- [ ] Token changes are backward-compatible — no existing component is broken (run existing Playwright tests)
- [ ] Design token file is documented with a comment header referencing Requirements §SEC-005 (CSP compliance)

#### Technical Notes
- Do NOT modify existing token values — only add new ones with the `--dashboard-` or `--color-viz-` prefix
- IBM Plex fonts load from Google Fonts via `next/font` to ensure edge delivery without CORS issues
- The shimmer animation uses background-size trick, not transform, for GPU compositing efficiency

---

### TASK-002: Dashboard Shell Layout — Sidebar + Topbar + Route Structure
**Requirement Refs:** REQ-001 §1.6, Design Spec §2.1  
**Sprint:** S1  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-001  
**Status:** [ ] Not Started

#### Description
Implement the fixed sidebar + scrollable main layout, global topbar, role-filtered navigation, and Next.js route structure for all dashboard sections. This is the skeletal shell that all other tasks build within.

#### Acceptance Criteria
- [ ] `src/components/dashboard/CommandCenter.tsx` renders the shell layout with sidebar + topbar + main area
- [ ] Sidebar renders all navigation sections from Design Spec §2.1, filtered by JWT role claim (`admin`, `enterprise`, `integrator`, `pro`)
- [ ] Sidebar supports collapsed state (64px, icons only) with toggle button; state persists to `localStorage`
- [ ] Topbar renders: logo (links to `/dashboard`), global district selector (multi-select pill group), alert bell with badge, model status dot, user avatar dropdown
- [ ] Role-based route protection: middleware in `src/middleware.ts` checks JWT role before rendering any admin/enterprise route, redirects unauthorized users to `/dashboard`
- [ ] All 8 navigation sections from Design Spec §2.1 have placeholder route files (`/dashboard/[section]/page.tsx`) with `<div>Coming soon</div>` content
- [ ] Mobile web (< 768px) renders full-screen interstitial (per Design Spec §8) with App Store / Play Store links, not the sidebar layout
- [ ] Lighthouse CI TTI ≤ 1.8s on the shell (empty content area) measured in CI pipeline

#### Technical Notes
- Use Next.js 15 App Router with server components for the shell, client components only for interactive elements (sidebar collapse, district selector)
- JWT role is read from Supabase `auth.user().user_metadata.role` on server side
- The district selector state must sync to URL params (`?districts=gorakhpur,deoria`) so that sharing a URL preserves the selected districts
- Do NOT use `dangerouslySetInnerHTML` anywhere in the shell — SEC-005 CSP compliance

---

### TASK-003: `GET /api/v2/dashboard/summary` Aggregated API Endpoint
**Requirement Refs:** REQ-001 §1.8, PERF-004  
**Sprint:** S1  
**Estimate:** 2 days  
**Assigned Role:** Backend  
**Depends On:** None  
**Status:** [ ] Not Started

#### Description
Create the single aggregated Vercel Edge Function that the Command Center calls once on load to fetch all widget data. This endpoint prevents waterfall requests and is cached at Cloudflare edge for 5 minutes per customer_id.

#### Acceptance Criteria
- [ ] Endpoint `GET /api/v2/dashboard/summary` exists at `src/app/api/v2/dashboard/summary/route.ts`
- [ ] Endpoint requires JWT Bearer auth; returns 401 without valid token
- [ ] Response shape matches `DashboardSummary` TypeScript interface (see Technical Notes), validated by Zod on ingest
- [ ] Response includes: `priceHero`, `accuracy`, `kpiRow`, `chartData` (7-day history + 7-day forecast), `alerts` (latest 5), `districtList` for selector
- [ ] Response is watermarked: price values in `priceHero` and `chartData` are customer-specific (micro-perturbation applied, per TRD §6.1)
- [ ] `Cache-Control: private, max-age=300` header set on response (5-min client cache)
- [ ] Cloudflare cache configured with `Cache-Key: customer_id + date_hour` (hourly granularity)
- [ ] P95 response time ≤ 300ms measured in load test with 50 concurrent requests (Railway.app FastAPI)
- [ ] Unit test covers: happy path, 401 without token, malformed district param, DB timeout handling

#### Technical Notes
```typescript
interface DashboardSummary {
  priceHero: {
    price: number;          // watermarked P50
    p10: number;            // watermarked P10
    p90: number;            // watermarked P90
    deltaPercent: number;
    deltaDirection: 'up' | 'down' | 'flat';
    signal: 'sell' | 'hold' | 'caution';
    district: string;
    lastUpdated: string;    // ISO 8601
    isStale: boolean;
    watermarkToken: string; // for audit log
  };
  accuracy: {
    mape30d: number;
    directionalAccuracy: number;
    predictionCount: number;
    lastRetrain: string;
    modelVersion: string;
  };
  kpiRow: {
    mandiBenchmark: { price: number; freshness: string; };
    middlemanSpread: { deltaRs: number; deltaPercent: number; };
    activeAlertCount: number;
    feedCostIndex: { value: number; delta7d: number; };
    apiUsage?: { used: number; quota: number; }; // S5/Admin only
  };
  chartData: {
    actual: Array<{ date: string; price: number; }>;
    forecast: Array<{ date: string; p10: number; p50: number; p90: number; }>;
    festivals: Array<{ date: string; name: string; }>;
    events: Array<{ date: string; type: 'hpai' | 'weather'; }>;
  };
  alerts: Alert[];
  districtList: District[];
}
```
- This endpoint makes exactly 4 Supabase queries (predictions, accuracy_log, alerts, kpiRow data) — no N+1 queries
- Watermarking is applied inside this function, not in a separate middleware, to avoid latency

---

### TASK-004: `useWidgetData` Hook & Offline Cache Layer
**Requirement Refs:** REQ-001 §1.9, REQ-011 §11.5  
**Sprint:** S1  
**Estimate:** 2 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-003  
**Status:** [ ] Not Started

#### Description
Implement the standard widget data hook used by every dashboard component. Provides SWR-based fetching with instant cache hydration, background refresh, and staleness detection.

#### Acceptance Criteria
- [ ] `src/hooks/useWidgetData.ts` implemented with SWR as the fetching strategy
- [ ] Hook returns `{ data, isLoading, isStale, refresh }` where `isLoading` is only `true` when there is zero cached data
- [ ] Hook shows cached data immediately from SWR cache on every subsequent render — never an empty state when cache exists
- [ ] `isStale` is set to `true` if cached data is older than the `ttlMs` parameter
- [ ] `refresh()` triggers a manual SWR revalidation
- [ ] Hook is used by all dashboard widget components (replacing any ad-hoc fetch calls)
- [ ] Unit test: mount hook with mocked SWR, verify cached data returned synchronously, verify background refetch triggered
- [ ] Unit test: verify `isStale` set correctly based on `Date.now() - lastFetched > ttlMs`

#### Technical Notes
```typescript
export const useWidgetData = <T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  ttlMs: number
): WidgetDataResult<T> => {
  const { data, error, isValidating, mutate } = useSWR(cacheKey, fetchFn, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
    fallbackData: getCachedFallback(cacheKey), // read from SWR cache
  });

  const isStale = data 
    ? (Date.now() - getLastFetchedTime(cacheKey)) > ttlMs 
    : false;
    
  return { 
    data: data ?? null, 
    isLoading: !data && !error, 
    isStale, 
    refresh: mutate 
  };
};
```
- The `getCachedFallback` function reads from SWR's in-memory cache — not localStorage. localStorage is explicitly NOT used on web (SEC-004 data exfiltration prevention).

---

## Sprint 2 (Weeks 3–4): Command Center Widgets

### TASK-005: Price Signal Hero Widget
**Requirement Refs:** REQ-001 §1.1, Design Spec §3.1  
**Sprint:** S2  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-001, TASK-004  
**Status:** [ ] Not Started

#### Description
Implement the `PriceSignalHero` component — the visually dominant, most critical widget in the entire product. The price number must be the largest element on screen and must render from cache within 200ms of component mount.

#### Acceptance Criteria
- [ ] `src/components/dashboard/PriceSignalHero.tsx` implements all states from Design Spec §3.1: `fresh`, `stale`, `offline`, `loading`, `error`
- [ ] Price number renders at font-size 64px (IBM Plex Mono, `--data-hero` token) on desktop, 56sp on mobile
- [ ] Direction arrow + delta percentage updates with fade-slide animation (200ms) on data change
- [ ] Sell signal badge renders in correct color/icon for all 3 states (sell/hold/caution)
- [ ] Confidence range (P10–P90) rendered below price as secondary line in `--color-neutral-400`
- [ ] Stale state: amber left border (4dp), Hindi stale warning `⚠ डेटा पुराना है`
- [ ] Offline state: grey border, Hindi offline label `📴 ऑफलाइन`, price still visible from cache
- [ ] Loading state: shimmer skeleton matching widget dimensions exactly
- [ ] Price counting animation from old to new value on data refresh (200ms linear)
- [ ] `aria-label` on price element: `"आज का ब्रॉयलर भाव: ₹{price} प्रति किलोग्राम. संकेत: {signal}"`
- [ ] Color is never the sole signal indicator — each state has distinct icon + text
- [ ] Playwright test: verify price renders within 200ms from cache using `performance.now()`

#### Technical Notes
- The price counting animation uses `requestAnimationFrame`, not CSS `transition`, for precise frame control
- The widget must NOT call the API directly — it consumes data from the `useWidgetData` hook initialized in the parent `CommandCenter`
- Stale threshold: 24h for price data (per TRD §5.3 Price Cache spec)

---

### TASK-006: Accuracy Trust Card Widget
**Requirement Refs:** REQ-001 §1.2, Design Spec §3.2  
**Sprint:** S2  
**Estimate:** 1.5 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-004  
**Status:** [ ] Not Started

#### Description
Implement the `AccuracyTrustCard` component. This widget is the product's "proof of work" — it must always be visible to reinforce trust in the price signal.

#### Acceptance Criteria
- [ ] `src/components/dashboard/AccuracyTrustCard.tsx` implemented
- [ ] MAPE value displayed with color coding (green/amber/red per REQ-007 thresholds)
- [ ] Color dot indicator next to MAPE with pulsing animation when value is in `critical` (>8%) state
- [ ] Directional accuracy CSS progress bar renders correctly for values 85–100% range
- [ ] "Based on N predictions verified" count displayed with formatted number
- [ ] Last retrain timestamp formatted as "3 days ago" (relative time via `date-fns/formatDistanceToNow`)
- [ ] Hindi labels for all fields: `MAPE` → `"सटीकता गलती"` with English in smaller text
- [ ] Tooltip on MAPE value explains what MAPE means in Hindi (1–2 sentences, rendered as popover on hover/tap)
- [ ] Accessible: `role="status"` on the card so screen readers announce changes when values update

#### Technical Notes
- The MAPE pulsing animation must respect `prefers-reduced-motion` — it reduces to a static color change
- This widget's data comes from `DashboardSummary.accuracy` — no separate API call

---

### TASK-007: KPI Card Row Widget
**Requirement Refs:** REQ-001 §1.3, Design Spec §3.3  
**Sprint:** S2  
**Estimate:** 2 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-004  
**Status:** [ ] Not Started

#### Description
Implement the reusable `KpiCard` component and the `KpiCardRow` layout (5 cards). Each card is independently configurable and all 5 are instantiated in `KpiCardRow` with the data from `DashboardSummary.kpiRow`.

#### Acceptance Criteria
- [ ] `src/components/dashboard/KpiCard.tsx` reusable component with all props from Design Spec §3.3
- [ ] `src/components/dashboard/KpiCardRow.tsx` renders 5 specific KPI cards in order
- [ ] Card 5 (API Usage) renders only for `enterprise` and `admin` roles; S1/S2 sees "Subscription: PulsePro" instead
- [ ] All 5 cards have `onClick` handlers that navigate to the relevant section (middleman check, alert center, etc.)
- [ ] `deltaDirection` renders as: ↑ green for `up`, ↓ red for `down`, → neutral for `flat`
- [ ] Each card shows a loading skeleton while `isLoading=true`
- [ ] Cards layout correctly at all 3 responsive breakpoints (5-col desktop, 3-col tablet, 2-col + 1 mobile)
- [ ] Touch target on each card: minimum 48×48dp (mobile WCAG 2.5.5)

---

### TASK-008: 7-Day Price Trajectory Chart
**Requirement Refs:** REQ-001 §1.4, Design Spec §3.4  
**Sprint:** S2  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-004  
**Status:** [ ] Not Started

#### Description
Implement the `PriceTrajectoryChart` using Recharts `ComposedChart`. This chart is the primary visualization of both historical price performance and the 14-day forecast window.

#### Acceptance Criteria
- [ ] `src/components/charts/PriceTrajectoryChart.tsx` implemented with all 6 layers from Design Spec §3.4
- [ ] Confidence band (P10–P90 Area) renders with correct semi-transparent fill (`--color-viz-p10-p90`)
- [ ] P50 forecast line renders dashed (amber) distinct from solid historical line (green)
- [ ] Today's date vertical `ReferenceLine` renders with label `"आज"` above the axis
- [ ] Festival markers render as dashed amber `ReferenceLine` with festival name as label
- [ ] HPAI/weather events render as colored dots on the X-axis
- [ ] Custom tooltip renders with the spec from Design Spec §3.4 (date, P50, range, trend, festival note)
- [ ] Chart is horizontally zoomable via pinch gesture (mobile) and mouse drag (web)
- [ ] Accessible data table rendered as `VisuallyHidden` sibling element (per Design Spec §6.1)
- [ ] Chart is code-split via Next.js dynamic import (`{ ssr: false }`) — PERF-003
- [ ] Loading state: grey skeleton bars matching chart height (no Recharts error state shown to user)
- [ ] Chart windowing applied when data length > 90 points (per Design Spec §5.3)

#### Technical Notes
- Recharts `ComposedChart` combines `Area`, `Line`, `ReferenceLine`, and `ReferenceDot` in a single SVG
- The zoom feature uses Recharts `Brush` component underneath the chart (shows a mini preview of full range)
- Festival data comes from `DashboardSummary.chartData.festivals` — static calendar, not an API call

---

## Sprint 3 (Weeks 5–6): Map, Batch Optimizer Core

### TASK-009: Multi-District Price Intelligence Map
**Requirement Refs:** REQ-002, Design Spec §3.5  
**Sprint:** S3  
**Estimate:** 5 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-003, TASK-004  
**Status:** [ ] Not Started

#### Description
Implement the choropleth district price map using `react-simple-maps`. This is the flagship feature for S2 integrators and enterprise demos. It must be visually impressive and genuinely useful for multi-district arbitrage decisions.

#### Acceptance Criteria
- [ ] `src/components/maps/DistrictPriceMap.tsx` renders UP district GeoJSON with correct Mercator projection centered on Gorakhpur belt
- [ ] Choropleth color scale correctly maps P50 price range to green/amber/red gradient (Design Spec §3.5)
- [ ] Hover tooltip on each district polygon shows: district name (Hindi), P50, P10, P90, direction, alert count
- [ ] Click on district opens `DistrictDeepDivePanel` slide-in from right (240px wide, animated 220ms ease-out)
- [ ] `DistrictDeepDivePanel` renders: Hindi district name, P50 with direction, confidence range, top 3 AI drivers (from Claude API cache), alert list, 30-day mini chart, "Set as Primary" button
- [ ] Price Differential Overlay toggle correctly shows delta vs primary district on each polygon label
- [ ] Districts with `hpai_district_flag=1` show red dashed pulsing border ring (CSS animation per Design Spec §3.5)
- [ ] Timeline Scrubber renders as horizontal slider below map; "Play" button animates through dates at 200ms/day
- [ ] Map polygons have `aria-label` with district name, price, and alert count
- [ ] Map initial render time ≤ 800ms (GeoJSON loaded from Cloudflare CDN, not API)
- [ ] GeoJSON bundled as static asset in `/public/geo/up-districts.json` and served with `Cache-Control: max-age=86400`
- [ ] Double-click on district sets it as primary district, persists to Supabase `customers` table via PATCH

#### Technical Notes
- UP district GeoJSON must be sourced from open government data (datameet.org India district GeoJSON, filtered to UP). Verify license is CC-BY or CC0 before use.
- `react-simple-maps` projection config per Design Spec §3.5 (center: [82.5, 27.0], scale: 5000)
- The HPAI ring animation is a separate SVG `circle` element positioned at the district centroid, not a polygon stroke, to avoid rendering artifacts with complex polygon shapes

---

### TASK-010: Supabase `district_price_summary` Materialized View
**Requirement Refs:** REQ-002 §2.1, Architecture v1.0 §4.2  
**Sprint:** S3  
**Estimate:** 1 day  
**Assigned Role:** Backend  
**Depends On:** None  
**Status:** [ ] Not Started

#### Description
Create a Supabase PostgreSQL materialized view that pre-computes district-level price summaries for the map. This view is refreshed daily by `dag_model_infer` and eliminates complex joins at map load time.

#### Acceptance Criteria
- [ ] Migration file `supabase/migrations/20260501_district_price_summary.sql` created
- [ ] View `district_price_summary` includes: `district`, `p10`, `p50`, `p90`, `delta_pct`, `signal`, `hpai_flag`, `active_alert_count`, `last_updated`
- [ ] View is refreshed by a SQL function `refresh_district_price_summary()` called at the end of `dag_model_infer`
- [ ] `GET /api/v2/maps/districts` endpoint returns this view data with 15-minute Cloudflare edge cache
- [ ] RLS policy: view is readable by all authenticated users (no customer-specific data in this view — district-level only)
- [ ] Index on `district` column for fast single-district lookups

---

### TASK-011: Batch ROI Optimizer — Core Calculator
**Requirement Refs:** REQ-003 §3.1–3.4, Design Spec §3.6  
**Sprint:** S3  
**Estimate:** 4 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-004  
**Status:** [ ] Not Started

#### Description
Implement the `BatchRoiOptimizer` component with the pure-TypeScript ROI calculation engine, Sell vs Hold matrix table, and Profit Waterfall Chart.

#### Acceptance Criteria
- [ ] `src/lib/roiCalculator.ts` pure TypeScript module with `calculateSellHoldMatrix(inputs, forecast)` function
- [ ] Calculator function is deterministic: same inputs always produce same output (no side effects, no API calls)
- [ ] `SellHoldMatrix` table renders 4 rows (Today, +3D, +7D, +14D) × 6 columns (Price, Revenue, Feed Cost, Mortality Cost, Net Profit, ROI%)
- [ ] The highest net-profit row is automatically highlighted with green background and ⭐ badge
- [ ] Break-Even price calculation: `(total_feed_cost + overhead_cost) / (flock_size × avg_weight)` with formula shown in tooltip
- [ ] `ProfitWaterfallChart` (Recharts BarChart) renders 4 bars per scenario with color coding (Design Spec §3.6)
- [ ] Trader offer input: entering a price below break-even shows `🔴 Below Break-Even` warning
- [ ] All computations complete within 50ms on input change (TASK-011 specific perf requirement REQ-003 §3.7)
- [ ] Unit tests cover: break-even calculation, optimal scenario selection, P10/P50/P90 revenue scenarios, edge case (age=60 days, very high mortality)
- [ ] Batch data persists to `sessionStorage` (web) and AsyncStorage (mobile) surviving browser/app refresh

#### Technical Notes
```typescript
// Mortality risk model: industry standard for broiler by age
const mortalityRateByAgeDays: Record<number, number> = {
  35: 0.003, // 0.3% per day at day 35
  42: 0.004,
  49: 0.005,
  56: 0.007,
  60: 0.009, // increases significantly after 56 days
};

// Revenue calculation for scenario N days from today
const calcRevenue = (
  flockSize: number,
  avgWeightKg: number,
  pricePerKg: number,
  holdDays: number,
  weightGainPerDay: number = 0.06 // kg/day standard Cobb 500
): number => {
  const adjustedWeight = avgWeightKg + (weightGainPerDay * holdDays);
  const survivingBirds = flockSize * (1 - getMortalityRate(ageAtSale) * holdDays);
  return survivingBirds * adjustedWeight * pricePerKg;
};
```
- Weight gain of 0.06 kg/day is hardcoded for Cobb/Ross breeds (standard for UP broiler). Make this configurable in Phase 2.
- Feed cost calculation: `feed_cost_per_kg × feed_consumed_per_bird_per_day × flock_size × hold_days`
  Standard FCR after day 35: 2.2 kg feed per 1 kg weight gain. So daily feed per bird = weight_gain_per_day × FCR = 0.06 × 2.2 = 0.132 kg feed per bird per day.

---

### TASK-012: Multi-Farm Harvest Queue (S2 Integrators)
**Requirement Refs:** REQ-003 §3.5, Design Spec §3.6  
**Sprint:** S3  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-011  
**Status:** [ ] Not Started

#### Description
Implement the multi-farm harvest queue feature for S2 Integrators. Includes CSV upload, priority queue table, and PDF export.

#### Acceptance Criteria
- [ ] CSV upload component accepts files with columns: `farm_name, district, flock_size, age_days, avg_weight_kg, feed_cost_per_kg`
- [ ] Validation: reject CSV rows with missing required columns, invalid districts, or flock_size < 1000
- [ ] After upload, ROI calculator runs for each farm row using live forecast data for the farm's district
- [ ] Priority queue table renders rows sorted by `urgency` (URGENT: sell signal + age > 45 days, OPTIMAL: best ROI window, WAIT: holding is better)
- [ ] `Net Delta` column shows the ₹ difference between selling today vs optimal window (green if positive/wait is better, red if sell today is urgent)
- [ ] PDF export uses `@react-pdf/renderer` and generates a one-page branded "Harvest Schedule" PDF with PoultryPulse logo, date, farm list, and recommendations
- [ ] PDF generation completes client-side in < 5 seconds for up to 20 farms
- [ ] This feature is only visible to users with `integrator` or `admin` JWT role

#### Technical Notes
- CSV parsing via `papaparse` (already available per Architecture doc)
- The PDF is generated entirely client-side — no server upload of farm data (SEC-004 compliance)
- Template CSV available for download from the UI as a reference for integrators

---

## Sprint 4 (Weeks 7–8): Alert System & Middleman Tool

### TASK-013: `alerts` Supabase Table & Alert Generation Schema
**Requirement Refs:** REQ-004 §4.6, Architecture §4.2  
**Sprint:** S4  
**Estimate:** 1.5 days  
**Assigned Role:** Backend  
**Depends On:** None  
**Status:** [ ] Not Started

#### Description
Create the `alerts` database table, alert preference table, and the Supabase Realtime publication that powers live alert delivery to the dashboard.

#### Acceptance Criteria
- [ ] Migration `supabase/migrations/20260502_alerts.sql` creates:
  - `alerts` table: `id, district, type, title_hindi, title_english, body_hindi, body_english, severity (low/medium/high/critical), estimated_impact_low, estimated_impact_high, source, source_url, created_at, expires_at`
  - `customer_alert_preferences` table: `customer_id (FK), hpai_distance_km, temp_threshold_c, price_drop_pct, feed_cost_rise_pct, push_enabled, whatsapp_enabled, email_enabled`
  - `alert_acknowledgements` table: `id, customer_id (FK), alert_id (FK), action (acknowledged/acted/dismissed), created_at`
- [ ] RLS: `alerts` is publicly readable. `customer_alert_preferences` RLS: `customer_id = auth.uid()`. `alert_acknowledgements` RLS: `customer_id = auth.uid()`.
- [ ] Supabase Realtime enabled on `alerts` table (ALTER TABLE alerts REPLICA IDENTITY FULL)
- [ ] Publication `alerts_realtime` created for the `alerts` table
- [ ] Index on `alerts.district` and `alerts.created_at DESC` for efficient feed queries
- [ ] Default alert preference row created for every new customer on signup (via Supabase database function trigger)

---

### TASK-014: Alert Intelligence Center Component
**Requirement Refs:** REQ-004 §4.1–4.5, Design Spec §3.7  
**Sprint:** S4  
**Estimate:** 4 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-013  
**Status:** [ ] Not Started

#### Description
Implement the full Alert Intelligence Center including the live-updating card feed, financial impact tags, 7-day timeline, acknowledgement actions, and alert preference settings panel.

#### Acceptance Criteria
- [ ] `src/components/alerts/AlertIntelligenceCenter.tsx` renders severity-ranked alert feed
- [ ] `AlertCard` renders all fields from Design Spec §3.7: type icon, headline (Hindi primary), estimated flock impact in ₹, source attribution, confidence %, action buttons
- [ ] Flock impact calculation: `(alert.estimated_impact_low * user.flock_size / 20000)` to `(alert.estimated_impact_high * user.flock_size / 20000)` — scaled to user's flock size from profile
- [ ] Real-time updates: new alerts appear within 3 seconds of DB insert via Supabase Realtime subscription (`useAlertSubscription` hook)
- [ ] Alert bell in topbar updates count in real-time (Supabase Realtime → increment badge state)
- [ ] `Act Now` button deep-links to the correct tool: HPAI → Sell Signal screen, Price Crash → Batch Optimizer, Feed Cost → Feed Intelligence
- [ ] `Dismiss` action writes to `alert_acknowledgements` table and hides card from feed
- [ ] 7-day Alert Timeline renders as SVG horizontal strip with colored dots and hover tooltips
- [ ] Alert preference settings open in a modal (web) / bottom sheet (mobile) with all 4 sliders + channel toggles
- [ ] Preference changes are debounced 500ms and saved to `customer_alert_preferences` via PATCH
- [ ] Alert feed uses `react-virtual` for virtualized rendering — no performance degradation at 500+ items
- [ ] Admin view includes Alert Pipeline Monitor panel (last run times for `dag_dahdf_weekly` and `dag_imd_daily`)

---

### TASK-015: Middleman Intelligence Tool
**Requirement Refs:** REQ-005, Design Spec §3.8  
**Sprint:** S4  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-004  
**Status:** [ ] Not Started

#### Description
Implement the Middleman Check tool with D3 arc gauge, Claude API Hindi negotiation script generation, and personal price history.

#### Acceptance Criteria
- [ ] `src/components/tools/MiddlemanCheck.tsx` renders the price fairness gauge and negotiation script card
- [ ] D3 arc gauge renders with 3 zones (LOW: red, FAIR: green, HIGH: blue), needle animates to offered price position in 600ms ease-out
- [ ] Gauge zones defined as: < 90% of benchmark = LOW, 90–110% = FAIR, > 110% = HIGH
- [ ] 7-day AGMARKNET mandi benchmark fetched from `GET /api/v1/middleman/check` (existing endpoint per TRD §5.1) — no new endpoint needed
- [ ] Hindi negotiation script generated via Claude API call to `POST /api/v1/ai/negotiation-script` (new endpoint, see Technical Notes)
- [ ] Claude API response cached in Supabase `ai_cache` table for 4 hours per `district + offered_price_bucket` key (price rounded to nearest ₹2 for cache efficiency)
- [ ] Negotiation script displays in Hindi, with "Copy" and "Share on WhatsApp" buttons
- [ ] WhatsApp share link: `whatsapp://send?text=[URL-encoded script]` (works on both Android and iOS)
- [ ] Personal price history table (last 10 checks): date, offered price, benchmark, outcome (accepted/rejected) — stored in `localStorage` (web) and AsyncStorage (mobile)
- [ ] S2 Integrator Spread Analytics panel visible for `integrator` and `admin` roles

#### Technical Notes

**New API Endpoint — `POST /api/v1/ai/negotiation-script`:**
```typescript
// Request
{ district: string; offeredPrice: number; benchmarkPrice: number; }

// Response
{ script: string; cachedAt: string; }

// Claude API System Prompt:
`You are a poultry price assistant for farmers in Gorakhpur, UP, India.
Generate a 2-3 sentence negotiation script in Hindi (Devanagari script only) 
that a farmer can say to a trader to negotiate a better price.
Be direct, factual, and friendly. Reference the mandi benchmark price.
Respond with ONLY the Hindi script. No preamble, no explanation.
Input: Offered: ₹{offeredPrice}/kg, Mandi Benchmark: ₹{benchmarkPrice}/kg, District: {district}`
```

---

## Sprint 5 (Weeks 9–10): Feed Intelligence & Accuracy Dashboard

### TASK-016: Feed Cost Intelligence Dashboard
**Requirement Refs:** REQ-006, Design Spec §3  
**Sprint:** S5  
**Estimate:** 4 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-004  
**Status:** [x] Completed

#### Description
Implement the feed cost intelligence panel with commodity price charts, procurement timing recommendation, and feed cost impact calculator.

#### Acceptance Criteria
- [x] `src/components/feed/FeedCostDashboard.tsx` renders commodity ticker, procurement recommendation, and impact calculator
- [x] `CommodityTicker` renders 3 rows: Maize price, Soya Meal price, Composite Feed Cost Index — each with 7-day delta
- [x] 14-day commodity price chart (Recharts LineChart) shows actual + ARIMA forecast for maize and soya
- [x] Chart includes `⚠ Feed price forecast: indicative only. MAPE target <12%` disclaimer below chart (required by REQ-006 §6.5)
- [x] Procurement recommendation badge (`BUY NOW`, `WAIT`, `NEUTRAL`) with threshold logic from REQ-006 §6.2
- [x] Feed Cost Impact Calculator: input (current cost, procurement volume in tonnes) → output (₹ savings if wait N days)
- [x] Dashboard works offline with 48-hour cached commodity data (per REQ-006 §6.6)
- [x] S3 Feed Manufacturer Demand Signal panel: visible for `admin` role only in Phase 1; placeholder with "Coming Soon" for others

#### Technical Notes
- Commodity forecasts are generated by `dag_ncdex_daily` writing to a new `commodity_forecasts` Supabase table (structure: `commodity`, `forecast_date`, `predicted_price`, `model_version`)
- A simple ARIMA(0,1,1) model is used for commodity forecasting (not TFT — no GPU needed). Implemented in Railway.app alongside the main model.

---

### TASK-017: `commodity_forecasts` Table & ARIMA Commodity Model
**Requirement Refs:** REQ-006 §6.5, Architecture §3  
**Sprint:** S5  
**Estimate:** 3 days  
**Assigned Role:** ML + Backend  
**Depends On:** None  
**Status:** [x] Completed

#### Description
Create the commodity forecasting model (ARIMA for maize and soya) and the database table that stores its outputs. This is a lightweight model — not held to the same accuracy standard as the broiler price model.

#### Acceptance Criteria
- [x] `commodity_forecasts` Supabase table: `id, commodity (maize/soya/palm_oil), forecast_date, predicted_price, confidence_low, confidence_high, model_version, created_at`
- [x] Python ARIMA(0,1,1) model implemented in `ml/commodity_forecaster.py` using `statsmodels`
- [x] Model trains on 36-month NCDEX/MCX historical prices (subset of data already collected by existing DAGs)
- [x] Model runs daily after `dag_ncdex_daily` completes, generates 14-day forecast, writes to `commodity_forecasts` table
- [x] Airflow DAG `dag_commodity_forecast` added (total DAG count now 10 — triggers self-hosted Airflow migration per TRD §3.2.1 note)
- [x] MAPE validation: commodity MAPE logged to Supabase `accuracy_log` with `commodity_type` discriminator. Target: <12% (disclosed, per REQ-006 §6.5)
- [x] No champion/challenger framework needed for commodity model — simpler weekly retrain with last-N-days MAPE check

---

### TASK-018: Accuracy Dashboard (Admin)
**Requirement Refs:** REQ-007, Design Spec §3.9  
**Sprint:** S5  
**Estimate:** 4 days  
**Assigned Role:** Frontend + Backend  
**Depends On:** TASK-004  
**Status:** [x] Completed

#### Description
Implement the admin-only accuracy dashboard with all 5 chart components and the investor-ready PDF export.

#### Acceptance Criteria
- [x] `src/components/admin/AccuracyDashboard.tsx` renders all 5 sections: scorecard gauges, MAPE trend, scatter plot, feature importance chart, model timeline
- [x] Route `/dashboard/accuracy` is protected by admin-only middleware (non-admin → redirect to `/dashboard`)
- [x] MAPE Gauge (`src/components/admin/MapeGauge.tsx`): Recharts `RadialBarChart` with 3 color zones, current MAPE value centered
- [x] MAPE 30-Day Trend: `ReferenceArea` for green/amber/red zones, `ReferenceLine` at 6% and 8% thresholds with labels
- [x] P50 vs Actual Scatter Plot: D3 scatter plot with perfect-prediction diagonal reference line; outlier points (>1 std dev from diagonal) colored red
- [x] Feature Importance H-Bar Chart: SHAP values from `model_registry` JSONB column `shap_importance`; alert displayed if `feed_cost_lag42` not in top-3
- [x] Model Timeline vertical component: last 5 promotion + rejection events, each with version, MAPE, directional accuracy, date, status badge
- [x] Investor PDF Export: `@react-pdf/renderer` generates branded one-page PDF with all 4 scorecards + current MAPE trend chart
- [x] PDF generated client-side in < 5 seconds; no server-side PDF processing (SEC-004)
- [x] All data sourced exclusively from `accuracy_log` and `model_registry` tables (per REQ-007 §7.6)
- [x] Enterprise (S5) read-only view: sees only scorecard gauges and ROI summary — not pipeline health or model internals

---

## Sprint 6 (Weeks 11–12): API Console & Enterprise Features

### TASK-019: API Usage Tracking & Rate Limit Dashboard
**Requirement Refs:** REQ-008 §8.1, §8.3, TRD §6.2  
**Sprint:** S6  
**Estimate:** 2 days  
**Assigned Role:** Backend  
**Depends On:** None  
**Status:** [x] Completed

#### Description
Extend the existing Upstash Redis rate limiting to track per-endpoint breakdown and expose usage data via an internal endpoint for the API Console widget.

#### Acceptance Criteria
- [ ] `GET /api/v2/enterprise/usage` endpoint returns: `{ used_today, quota_daily, used_this_month, quota_monthly, calls_by_day: [{date, count}], calls_by_endpoint: Record<string, number> }`
- [ ] Upstash Redis keys updated to include endpoint discriminator: `ratelimit:{api_key}:{endpoint}:{date}`
- [ ] Usage data retained for 30 days in Upstash Redis (no Supabase storage for usage data — keep hot path fast)
- [ ] Rate limit 429 response includes `X-RateLimit-Remaining` and `Retry-After` headers (per TRD §7.1)
- [ ] API key values are masked in all DB and UI responses: format `sk-pp-****...{last4chars}` (SEC-005)

---

### TASK-020: In-Browser API Playground
**Requirement Refs:** REQ-008 §8.2, Design Spec §3.10  
**Sprint:** S6  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-019  
**Status:** [x] Completed

#### Description
Implement the in-browser API Playground within the API Console. Visible only to S5 Enterprise and Admin users.

#### Acceptance Criteria
- [ ] `src/components/enterprise/ApiPlayground.tsx` renders endpoint selector, parameter fields, Send button, response viewer
- [ ] Endpoint selector covers all `v2/forecast/enterprise` parameters: district (dropdown), date_from/to (date pickers), confidence levels (checkboxes)
- [ ] `Send Request` button executes a real API call to the live endpoint using the user's real API key from the API Key Manager
- [ ] Response viewer uses Monaco Editor (loaded via dynamic import `{ ssr: false }`) with JSON syntax highlighting and collapsible tree
- [ ] Response header line shows: HTTP status code, response time in ms
- [ ] `Copy as cURL` button constructs the correct `curl` command including the Authorization header (API key masked as `$POULSE_API_KEY` in the copied command)
- [ ] `⚠ Live API — calls are counted` warning banner permanently visible in the playground area (REQ-008 §8.6)
- [ ] Monaco Editor is lazy-loaded (dynamic import) — adds < 50KB to initial bundle

---

## Sprint 7 (Weeks 13–14): Mobile Enhancements & Onboarding

### TASK-021: Mobile Enhanced Home Screen
**Requirement Refs:** REQ-011 §11.1–11.3, Design Spec §4.1  
**Sprint:** S7  
**Estimate:** 3 days  
**Assigned Role:** Frontend (React Native)  
**Depends On:** TASK-004 (mobile SWR equivalent using Zustand + AsyncStorage)  
**Status:** [ ] Not Started

#### Description
Update the React Native Tab 1 home screen to implement the enhanced scroll architecture with all new widgets from the dashboard enhancement spec.

#### Acceptance Criteria
- [ ] Price hero card is always the first visible element — no content above it in the scroll view
- [ ] Accuracy Trust Strip (48dp) renders immediately below price hero card
- [ ] Sell Signal Badge (52dp full-width pill) renders immediately below accuracy strip
- [ ] Feed Cost Mini-Card (80dp) renders below the 7-day sparkline
- [ ] Middleman quick-entry (72dp, ₹ input + submit) renders below feed cost card
- [ ] Alert feed renders as `FlatList` below middleman entry (virtualized)
- [ ] All financial impact tags on alert cards: `~₹[range] असर हो सकता है आपके झुंड पर`
- [ ] Cold start TTI ≤ 1.5s with cached data (Zustand + AsyncStorage hydration)
- [ ] Detox performance test asserts TTI < 1.5s on a mid-range Android device (Pixel 4a equivalent)

---

### TASK-022: Mobile Sell Signal Screen — Horizontally Scrollable Decision Cards
**Requirement Refs:** REQ-011 §11.3, Design Spec §4.2  
**Sprint:** S7  
**Estimate:** 2 days  
**Assigned Role:** Frontend (React Native)  
**Depends On:** TASK-011  
**Status:** [ ] Not Started

#### Description
Update the React Native Tab 2 (Sell Signal) screen to use horizontally scrollable decision cards instead of a vertical table.

#### Acceptance Criteria
- [ ] 4 cards (Today, +3D, +7D, +14D) render in a horizontal `FlatList` with `snapToInterval`
- [ ] On initial render, the optimal card (highest net profit) is scrolled to center using `scrollToIndex`
- [ ] Optimal card has `transform: [{ scale: 1.05 }]` and green shadow glow effect
- [ ] Each card shows: scenario label, projected P50 price, estimated revenue in ₹, sell/hold/wait signal chip
- [ ] Swiping between cards is smooth (native `FlatList` scroll, no JS-driven animation)
- [ ] Tapping a non-optimal card navigates to a detail sheet for that scenario

---

### TASK-023: Biometric Quick Lock
**Requirement Refs:** REQ-011 §11.4, Design Spec §4.3  
**Sprint:** S7  
**Estimate:** 1.5 days  
**Assigned Role:** Frontend (React Native)  
**Depends On:** None  
**Status:** [ ] Not Started

#### Description
Implement biometric/PIN quick lock that protects the forecast screen from shoulder-surfing while maintaining instant unlock for the authenticated user.

#### Acceptance Criteria
- [ ] `expo-local-authentication` used for Face ID / fingerprint unlock
- [ ] Lock triggers after 2 minutes of app backgrounding (AppState change → `background`)
- [ ] Lock screen renders: `expo-blur` `BlurView` (intensity 80) over the blurred app content + PoultryPulse logo centered + "Touch to Unlock" in Hindi
- [ ] Blurred background shows the shape (but not values) of the price hero card — values are unreadable
- [ ] Successful biometric unlock dismisses blur with a 150ms fade animation
- [ ] Fallback: 6-digit PIN entry if biometric unavailable
- [ ] Toggle to enable/disable biometric lock in Settings screen (default: OFF)
- [ ] Biometric lock does NOT log the user out — only obscures the screen. JWT remains valid.

---

### TASK-024: First Run Experience & Setup Checklist
**Requirement Refs:** REQ-012, Design Spec (general onboarding)  
**Sprint:** S7  
**Estimate:** 2.5 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-011, TASK-004  
**Status:** [ ] Not Started

#### Description
Implement the guided first run experience (single-screen activation moment) and the web dashboard setup checklist. Implement PostHog activation event tracking.

#### Acceptance Criteria
- [ ] After OTP verification + profile setup, user is navigated to a "Your First Forecast" screen (separate from the main home tab)
- [ ] First Forecast screen shows: pre-filled batch calculation "Your [flock_size]-bird batch at ₹[P50]/kg = ₹[revenue] estimated revenue" as the dominant content
- [ ] First Forecast screen also shows sell signal, top 3 drivers — all pre-populated from live data
- [ ] "मुझे समझ गया — डैशबोर्ड पर जाएं" button navigates to main home screen
- [ ] First run screen shown for first 3 sessions only (session count tracked in AsyncStorage / localStorage)
- [ ] Setup Checklist widget renders on web dashboard for first 7 days post-signup; dismissible via ✕ button
- [ ] Checklist 5 items are individually marked complete when the user performs each action (tracked via PostHog event receipt + localStorage flags)
- [ ] PostHog events implemented: `forecast_viewed`, `batch_calculator_used`, `middleman_check_used`, `alert_threshold_set`, all with `tier`, `district`, `flock_size_bucket` properties
- [ ] PostHog events are fired from the frontend using `posthog-js` (web) and `posthog-react-native` (mobile)

---

## Sprint 8 (Weeks 15–16): Admin Consoles, Testing & Performance

### TASK-025: WhatsApp Analytics Dashboard
**Requirement Refs:** REQ-009, Design Spec §2.2  
**Sprint:** S8  
**Estimate:** 2 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-013  
**Status:** [ ] Not Started

#### Description
Implement the WhatsApp message analytics dashboard for admin users. Includes delivery webhook processing and engagement analytics.

#### Acceptance Criteria
- [ ] `message_events` Supabase table: `id, customer_id (FK, not raw phone), message_type, sent_at, delivered_at, read_at, deep_link_clicked (bool)`
- [ ] Twilio delivery webhook endpoint `POST /api/v1/webhooks/twilio` processes delivery status events and writes to `message_events`
- [ ] WhatsApp Analytics dashboard renders: sent/delivered/read counts per message type, CTR for deep link, time-to-open histogram
- [ ] Engagement heatmap: day × hour grid (7 columns × 24 rows), cell color = avg open rate for that time slot
- [ ] High-churn-risk list: customers with 5+ consecutive unread messages, sorted by subscription value (MRR)
- [ ] No phone numbers appear anywhere in the UI — only `customer_id` (truncated to first 8 chars)

---

### TASK-026: Watermark Audit Console
**Requirement Refs:** REQ-010, Design Spec §2.2  
**Sprint:** S8  
**Estimate:** 2 days  
**Assigned Role:** Frontend + Backend  
**Depends On:** None  
**Status:** [ ] Not Started

#### Description
Implement the watermark audit console for admin users — the leak detection and remediation workflow.

#### Acceptance Criteria
- [ ] Route `/dashboard/watermark` is admin-only (middleware enforced)
- [ ] Leak Event Feed renders all `watermark_events` with state machine status badges
- [ ] Action buttons: `Send Warning` (writes state update to `watermark_events`), `Suspend Account` (PATCH `customers.is_suspended = true`), `Mark Resolved`
- [ ] Watermark Coverage Monitor: real-time percentage of today's served predictions with valid watermark_token. Displays red alert if < 100%
- [ ] Decode Success Rate: percentage of processed screenshots that yielded a valid decoded customer_id
- [ ] All `watermark_events` records are read-only in the UI — action buttons write NEW state records, never UPDATE existing rows (per REQ-010 §10.5)
- [ ] Customer identity displayed as `{initials} - ****{last4}` format only (per REQ-010 §10.1)

---

### TASK-027: End-to-End Test Suite (Playwright)
**Requirement Refs:** Architecture §7.1, Acceptance Criteria table in Requirements doc  
**Sprint:** S8  
**Estimate:** 4 days  
**Assigned Role:** Full-Stack (QA-focused)  
**Depends On:** All TASK-001 through TASK-026  
**Status:** [ ] Not Started

#### Description
Implement comprehensive Playwright E2E test suite covering all critical user flows and acceptance criteria from the Requirements document.

#### Acceptance Criteria
- [ ] `tests/e2e/commandCenter.spec.ts`: Command Center renders, price hero correct value, accuracy card correct color, all 5 KPI cards render
- [ ] `tests/e2e/priceHero.spec.ts`: price renders within 200ms of component mount (using `performance.now()` timing assertion)
- [ ] `tests/e2e/batchOptimizer.spec.ts`: input change → ROI update ≤ 50ms, optimal row highlighted correctly, break-even warning shows for low price input
- [ ] `tests/e2e/middlemanCheck.spec.ts`: offered price below benchmark → LOW zone, above → HIGH zone, WhatsApp share link constructed correctly
- [ ] `tests/e2e/alertFeed.spec.ts`: mock Supabase Realtime event → alert card appears within 3 seconds, alert count badge increments
- [ ] `tests/e2e/accessControl.spec.ts`: non-admin cannot access `/dashboard/accuracy`, non-enterprise cannot access `/dashboard/api-console`
- [ ] `tests/e2e/accessibility.spec.ts`: axe-core assertions on all dashboard pages — 0 WCAG 2.1 AA violations
- [ ] `tests/e2e/offline.spec.ts`: service worker intercepts API calls → cached data displayed with stale banner, no empty/broken states
- [ ] All tests pass in CI on every PR to main (GitHub Actions)

---

### TASK-028: Performance Audit & Lighthouse CI Integration
**Requirement Refs:** PERF-001 through PERF-004, REQ-001 §1.7  
**Sprint:** S8  
**Estimate:** 2 days  
**Assigned Role:** Frontend + DevOps  
**Depends On:** All TASK-001 through TASK-026  
**Status:** [ ] Not Started

#### Description
Run final performance audit, implement Lighthouse CI in the CI/CD pipeline as a merge gate, and optimize any components that fail the performance budget.

#### Acceptance Criteria
- [ ] Lighthouse CI configured in `.github/workflows/lighthouse.yml` — runs on every PR to `main`
- [ ] Lighthouse CI merge gate: LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1, TTI ≤ 1.8s — PR blocked if any target breached
- [ ] Code-splitting verified: Recharts, Monaco Editor, react-simple-maps, @react-pdf/renderer all loaded as dynamic imports — confirmed in Next.js bundle analyzer
- [ ] `React.memo` applied to all chart components — verified via React DevTools Profiler that no chart re-renders on unrelated state changes
- [ ] `GET /api/v2/dashboard/summary` P95 response time ≤ 300ms confirmed in Artillery.io load test (50 concurrent, 1-minute run)
- [ ] Cloudflare cache hit rate ≥ 60% for `dashboard/summary` endpoint (verified in Cloudflare Analytics)
- [ ] Mobile bundle size: React Native Expo JS bundle ≤ 2.5MB (checked via `expo-bundle-analyzer`)

---

## Task Dependency Graph

```
TASK-001 (tokens)
    └── TASK-002 (shell layout)
            └── TASK-005 (price hero)   → Sprint 2 widgets
            └── TASK-006 (accuracy card)
            └── TASK-007 (KPI row)
            └── TASK-008 (chart)

TASK-003 (API endpoint)
    └── TASK-004 (widget hook)
            └── All widget components (TASK-005 through TASK-016)

TASK-009 (map) ← TASK-010 (DB view)

TASK-011 (ROI calculator)
    └── TASK-012 (multi-farm queue)
    └── TASK-022 (mobile cards)

TASK-013 (alerts DB)
    └── TASK-014 (alert center UI)
    └── TASK-025 (WhatsApp analytics)

TASK-015 (middleman) ← requires Claude API endpoint (internal)

TASK-016 (feed dashboard) ← TASK-017 (commodity model)

TASK-018 (accuracy dashboard) — can start in parallel with TASK-013

TASK-019 (API tracking) ← TASK-020 (playground)

TASK-021–TASK-024 (mobile + onboarding) — parallel with Sprints 5–6

TASK-027 (E2E tests) ← all previous tasks
TASK-028 (perf audit) ← all previous tasks
```

---

## Definition of Done (DoD)

A task is only marked complete when ALL of the following are true:

- [ ] Code is merged to `main` branch via approved PR (minimum 1 engineer reviewer + 1 product reviewer)
- [ ] All acceptance criteria in the task are checked off
- [ ] Unit tests written for all pure functions (coverage ≥ 80% for new code)
- [ ] Playwright E2E tests updated if the task adds or modifies a user flow
- [ ] No new Lighthouse CI failures introduced (PR gate passes)
- [ ] No new axe-core WCAG violations introduced
- [ ] No TypeScript type errors (`tsc --noEmit` passes)
- [ ] No ESLint errors (`eslint --max-warnings 0` passes)
- [ ] `CHANGELOG.md` updated with a one-line entry for the feature
- [ ] For backend tasks: Supabase migration has been applied to staging and verified before PR merge
- [ ] For ML tasks: model accuracy gates met before any DB write
- [ ] For admin tasks: access control verified with both admin and non-admin test accounts

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| React-simple-maps GeoJSON rendering slow on large district dataset | Medium | Medium | Pre-simplify GeoJSON to 1% tolerance using Mapshaper; target < 200KB file size |
| Claude API latency for Hindi negotiation script > 2s | Medium | Medium | Cache aggressively (4h per district+price bucket); show cached script instantly, refresh in background |
| Supabase Realtime alert delivery > 3s | Low | High | Test with production Realtime subscription under load; fallback to polling every 30s if Realtime fails |
| Recharts performance degradation on 180-day price history | Medium | Medium | Implement chart windowing (TASK-008, Design Spec §5.3); reduce rendered points to max 90 |
| Biometric lock (expo-local-authentication) compatibility on older Android | Medium | Low | Test on Android 8 (API 26) minimum; fallback to PIN-only if biometric not available |
| Mobile bundle size > 2.5MB due to new dependencies | Low | Medium | Monitor bundle size in CI with `expo-bundle-analyzer`; tree-shake lodash and recharts if needed |
| Airflow free-tier DAG limit hit when adding `dag_commodity_forecast` (10th DAG) | High | Medium | This is expected — TASK-017 triggers the planned self-hosted Airflow migration (2hr operation per TRD §3.2.1) |

---

*End of Task Specification — PoultryPulse Dashboard Enhancement v1.0*  
*Sprint 1 commences immediately upon stakeholder sign-off. Target: All 28 tasks complete by Week 16.*
