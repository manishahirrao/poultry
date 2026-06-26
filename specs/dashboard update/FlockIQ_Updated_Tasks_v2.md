# FlockIQ — Updated Engineering Tasks Master (v2.0)
# Supersedes: PoultryPulse_Dashboard_Tasks_v1.md + PoultryPulse_Dashboard_Tasks_Addendum_v1.md
#             + 13_postlogin_tasks_master.md + 15_integrator_farms_tasks_master.md
# Version: v2.0 | June 2026 | CONFIDENTIAL
# Design Reference: FlockIQ_Updated_Design_Master_v2.md
# Requirements Reference: FlockIQ_Updated_Requirements_v2.md

---

## AGENT CONTEXT BLOCK

```
ROLE: Senior Full-Stack Engineer implementing FlockIQ v2.0
STACK:
  - Next.js 15 App Router (TypeScript strict mode)
  - Tailwind CSS v3 (no custom CSS unless absolutely necessary)
  - Recharts (all charts — no Chart.js, no D3 unless specified)
  - Framer Motion (animations — purposeful only)
  - Supabase (SSR, Realtime, Storage, RLS)
  - react-leaflet (maps)
  - SWR (client-side data fetching + revalidation)
  - idb-keyval (IndexedDB for offline drafts)
  - Twilio or Meta WABA (WhatsApp Business API)
  - next-i18next (Hindi + English i18n)
  - Zod (form validation schemas)

CODE STANDARDS:
  - TypeScript: strict mode, no 'any', explicit return types on all functions
  - Components: < 250 lines per file (extract sub-components if needed)
  - API routes: always validate request body with Zod schema before processing
  - Database: NEVER expose service role key to client; use Supabase SSR client in server components
  - RLS: every Supabase query in API routes must include user context (integrator_id / user_id)
  - Error handling: try/catch on ALL async operations; user-friendly messages always
  - Loading states: NEVER blank screens; always skeleton → data → empty state pattern
  - Console.log: NEVER commit console.log with PII or sensitive data
  - Comments: write comments for WHY (not WHAT) — the code shows what

OUTPUT FORMAT (for each task):
  TASK ID, PRIORITY, FILE PATH, PURPOSE, DEPENDENCIES, CODE, QA CHECKS

PRIORITY LEGEND:
  P0: Must be done before any beta launch — blocking
  P1: Required for v1 release
  P2: v1.1 — important improvements
  P3: Future roadmap

TASK GROUPINGS:
  T-BRAND:   Brand rename + design system updates
  T-NAV:     Navigation & layout
  T-DASH:    Dashboard overview page
  T-PI:      Price Intelligence module
  T-MAP:     District Map module
  T-ALERT:   Alerts module
  T-FARM:    Farm management (portfolio + detail)
  T-BSB:     Batch Status Board
  T-METRICS: Portfolio Metrics
  T-FEED:    Feed Intelligence
  T-MM:      Middleman Check
  T-CALC:    Calculator
  T-WA:      WhatsApp Daily Log Automation (new)
  T-SET:     Settings
  T-WIZARD:  Farm Add Wizard
  T-INFRA:   Infrastructure & shared utilities
```

---

## T-BRAND: BRAND RENAME & DESIGN SYSTEM

---

### TASK T-BRAND-001
**Priority:** P0
**File:** `apps/web/lib/design-tokens.ts`
**Purpose:** Replace all PoultryPulse colour tokens with FlockIQ brand tokens.

```typescript
// FULL FILE REPLACEMENT:
// Delete all existing colour tokens and replace with FlockIQ tokens from design doc Section 1.1

export const FlockIQTokens = {
  brand700:        '#1A5C34',
  brand600:        '#1F7040',
  brand500:        '#25874D',
  brand400:        '#3DAE72',
  brand100:        '#D4EFDE',
  brand50:         '#EDF7F1',
  signalSell:      '#16A34A',
  signalHold:      '#D97706',
  signalCaution:   '#DC2626',
  signalInfo:      '#2563EB',
  fcrExcellent:    '#16A34A',
  fcrGood:         '#65A30D',
  fcrWatch:        '#D97706',
  fcrAlert:        '#DC2626',
  mortalityOk:     '#16A34A',
  mortalityWatch:  '#D97706',
  mortalityAlert:  '#DC2626',
  sidebarBg:       '#0D1F16',
  sidebarText:     '#9BBDA8',
  sidebarActive:   '#FFFFFF',
  sidebarHover:    'rgba(255,255,255,0.07)',
  contentBg:       '#F4F7F5',
  cardBg:          '#FFFFFF',
  cardBorder:      '#E3EDE7',
  divider:         '#E3EDE7',
  whatsappGreen:   '#25D366',
  whatsappBg:      '#ECF8F1',
} as const;

// Helper: FCR colour picker
export function fcrColour(fcr: number): string {
  if (fcr < 1.70) return FlockIQTokens.fcrExcellent;
  if (fcr < 1.90) return FlockIQTokens.fcrGood;
  if (fcr < 2.10) return FlockIQTokens.fcrWatch;
  return FlockIQTokens.fcrAlert;
}

// Helper: mortality colour picker
export function mortalityColour(pct: number): string {
  if (pct < 2.5) return FlockIQTokens.mortalityOk;
  if (pct < 4.0) return FlockIQTokens.mortalityWatch;
  return FlockIQTokens.mortalityAlert;
}
```

**QA Checks:**
- [ ] No hex colour hardcoded anywhere in component files (search codebase for `#` in TSX files)
- [ ] TypeScript: all token names match usage in components
- [ ] Helper functions return correct colours for boundary values

---

### TASK T-BRAND-002
**Priority:** P0
**File:** `apps/web/components/layout/Sidebar.tsx`
**Purpose:** Update sidebar with FlockIQ brand, new section headers, improved navigation structure.

```
CHANGES REQUIRED:
1. Logo: replace "PoultrySense" / "PoultryPulse AI" text/logo with FlockIQ SVG logo
   - Import FlockIQ logo SVG from /public/images/flockiq-logo-white.svg
   - Width: 130px, height: auto

2. Add section headers between nav groups:
   Before "Overview": add small muted label "INTELLIGENCE"
   Before "My Farms": add small muted label "FARM OPERATIONS"
   Before "Portfolio Metrics": add small muted label "ANALYTICS"
   Before "API Access": add small muted label "ENTERPRISE"
   
   Section header style:
     className="px-4 pt-5 pb-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5A7A68]"

3. Add "Integrations" nav item under Settings:
   Icon: Link icon (Phosphor)
   Route: /dashboard/settings/integrations
   
4. Fix nav item "My Farms" badge:
   Should show count of active farms (not hardcoded "3")
   Fetch count from: SELECT COUNT(*) FROM farms WHERE integrator_id = auth.uid()
                     AND status = 'active'
   Display as green pill: className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full
                           bg-[#3DAE72] text-white"

5. Icon rail mode (1024–1279px):
   When viewport < 1280px: sidebar collapses to 64px
   Show only icons (no text labels)
   Hover on icon: show tooltip with route label (Radix UI Tooltip)
   Click: navigate to route
   "Expand" toggle button at bottom

6. Trial banner:
   When subscription.daysLeft < 30:
     amber banner: "Trial expires in {N} days — Renew →"
     Renew link → /dashboard/settings/billing
   When daysLeft < 7: red banner
   When expired: red banner + grey overlay on price intelligence sections (blurred)
```

**QA Checks:**
- [ ] FlockIQ logo renders correctly at 2x retina
- [ ] Section headers visible with correct styling
- [ ] Farm count badge updates on new farm added (SWR revalidation)
- [ ] Icon rail mode works at exactly 1024px and 1280px
- [ ] Trial banner shows correct days remaining
- [ ] Role-based sections: Farm Operations hidden from S5/Admin; Enterprise hidden from S1/S2

---

## T-NAV: TOP HEADER BAR

---

### TASK T-NAV-001 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/middleware.ts`
**Purpose:** Fix S1 user post-login redirect to /dashboard/price-intelligence/forecast (GAP-004 from FLOW GROUP B audit).

```
CHANGES:
1. Updated S1 user redirect logic (lines 193-205):
   - Changed from /dashboard/mobile-only to /dashboard/price-intelligence/forecast
   - Added farm detail pattern matching to allow S1 access to /dashboard/farms/[farmId]
   - Maintains blocking of /dashboard/employees, /dashboard/metrics, /dashboard/reports for S1 users

2. Implementation:
   - S1 users can now access their own farm detail pages
   - S1 users land on forecast page after login (not mobile-only page)
   - S1 users still blocked from farm management routes (employees, metrics, reports)
```

**QA Checks:**
- [x] S1 user redirects to /dashboard/price-intelligence/forecast after login
- [x] S1 user can access /dashboard/farms/[farmId] for their assigned farms
- [x] S1 user cannot access /dashboard/employees (403 redirect)
- [x] S1 user cannot access /dashboard/metrics (403 redirect)
- [x] S1 user can access price intelligence features

---

### TASK T-NAV-002 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/components/farms/detail/FarmDetailTabs.tsx`
**Purpose:** Fix mobile responsiveness for farm detail tabs with horizontal scrolling (GAP-025 from FLOW GROUP B audit).

```
CHANGES:
1. Updated tab navigation container (line 111):
   - Added 'scrollbar-hide' utility class
   - Added 'flex-shrink-0' to tab buttons to prevent compression

2. Added scrollbar-hide utility to tailwind.config.ts:
   - Plugin function to hide scrollbars across browsers
   - Supports -ms-overflow-style, scrollbar-width, and ::-webkit-scrollbar
```

**QA Checks:**
- [x] Tabs scroll horizontally on 375px mobile viewport
- [x] All 10 tabs accessible via horizontal scroll
- [x] Scrollbar hidden for cleaner mobile UI
- [x] Active tab scrolls into view when selected

---

### TASK T-NAV-003 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/components/farms/detail/tabs/GCTab.tsx`
**Purpose:** Add view-only mode for S1 users on GC tab (FLOW GROUP B audit requirement).

```
CHANGES:
1. Added user segment detection (lines 18-42):
   - Fetch user segment from customers table
   - Determine edit permissions based on segment

2. Implemented view-only mode for S1 users (lines 44-103):
   - S1 users can VIEW GC data (summary, charts)
   - S1 users cannot EDIT GC data (input form hidden)
   - Shows Hindi/English message: "GC cost editing is only available for integrators"
   - S2/admin users have full edit permissions
```

**QA Checks:**
- [x] S1 users can view GC summary card
- [x] S1 users can view GC charts (trend, breakdown)
- [x] S1 users cannot see GC input form
- [x] S1 users see appropriate Hindi/English message
- [x] S2/admin users can edit GC data
- [x] Null checks added for Supabase client

---

### TASK T-NAV-004
**Priority:** P0
**File:** `apps/web/components/layout/TopHeader.tsx`
**Purpose:** Rebuild top header with breadcrumb navigation, district filter pills, improved MAPE widget.

```
CHANGES:
1. Replace static page title with breadcrumb:
   Use Next.js usePathname() to generate breadcrumb
   /dashboard → "Overview"
   /dashboard/farms/[id] → "My Farms / [Farm Name]"
   /dashboard/farms/[id]/daily-log → "My Farms / [Farm Name] / Daily Log"
   Farm name: fetched client-side via SWR using farmId from URL

2. District filter pills (centre):
   Source: user's selected districts (from user profile + query params)
   Render as: HStack of pills with [Deoria ×] [Kushinagar ×] [+ Add] 
   Active district: brand100 background, brand700 text
   Clicking [×] on pill: removes that district filter (updates URL query)
   Clicking [+ Add]: opens dropdown of available districts
   
   IMPORTANT: changing district filter triggers SWR revalidation for:
     - Price forecast data
     - Alert feed
     - District map
   Use URL search params (?districts=gorakhpur,deoria) so filters are shareable

3. MAPE accuracy pill:
   Fetch: SELECT mape, directional_accuracy FROM model_accuracy ORDER BY created_at DESC LIMIT 1
   Display: "● 4.8% MAPE"
   Colour: green if mape < 6, amber if 6–9, red if > 9
   Tooltip (Radix UI Tooltip):
     "Model Accuracy (Last 30 Days)
      MAPE: 4.8% — within ₹7.6 on ₹160 price
      Directional Accuracy: 95.2%
      150 predictions verified"

4. Refresh button:
   Shows: "🔄 Xm ago" (X = minutes since last data fetch)
   Clicking: calls mutate() on all SWR keys, shows spinning state for 2 seconds
   Rate limit: 1 manual refresh per 60 seconds (show toast if clicked again too soon)

5. Notification bell:
   Badge: unread count from: SELECT COUNT(*) FROM notifications WHERE read = false AND user_id = uid
   Clicking opens NotificationPanel (slide-in from right — separate component)
   Panel shows last 20 notifications with [Mark all read] button
```

**QA Checks:**
- [ ] Breadcrumb shows correct hierarchy on all tested pages (check /farms/[id]/feed etc)
- [ ] District filter adds/removes from URL params correctly
- [ ] Removing all districts falls back to "All Districts"
- [ ] MAPE pill colour changes at correct thresholds
- [ ] Refresh rate limiting works (60-second cooldown)
- [ ] Notification badge count accurate (test after marking read)

---

## T-DASH: DASHBOARD OVERVIEW

---

### TASK T-DASH-001
**Priority:** P0
**File:** `apps/web/app/dashboard/page.tsx` (Server Component)
**Purpose:** Dashboard overview page with hero price card, KPI strip, chart, alerts, map, mandi table.

```
STRUCTURE:
  This is a Server Component that pre-fetches critical data.
  Client components handle interactivity.

SERVER-SIDE DATA FETCHING:
  const [todayPrice, kpis, mandis] = await Promise.all([
    fetchTodayPrice(primaryMandi),   // Today's P50 + signal for hero card
    fetchDashboardKPIs(userId),      // Mandi benchmark, middleman spread, alerts count, FCI, plan
    fetchMandiPricesTable(districts), // All mandis for price table
  ])

LAYOUT (Next.js App Router with Tailwind):
  <div className="space-y-6 p-6">
    <HeroPriceSection data={todayPrice} />    {/* T-DASH-002 */}
    <KPIStrip data={kpis} />                  {/* T-DASH-003 */}
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <PriceChart />                         {/* T-DASH-004 — Client Component */}
      </div>
      <div className="col-span-4">
        <AlertFeed />                          {/* T-DASH-005 — Client Component */}
      </div>
    </div>
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-5">
        <DistrictCoverageMapMini />            {/* T-DASH-006 — Client Component */}
      </div>
      <div className="col-span-7">
        <MandiPriceTable data={mandis} />      {/* T-DASH-007 */}
      </div>
    </div>
    {hasRole(['S1','S2']) && <FarmQuickSummary />}  {/* T-DASH-008 — Client Component */}
  </div>
```

---

### TASK T-DASH-002
**Priority:** P0
**File:** `apps/web/components/dashboard/HeroPriceSection.tsx`
**Purpose:** Hero price card with today's P50, confidence band, sell signal, and "why" expandable.

```typescript
// Props
interface HeroPriceSectionProps {
  mandi: string;
  price: number;             // P50 in ₹/kg
  priceP10: number;
  priceP90: number;
  priceChangeAbs: number;    // Change vs yesterday (positive or negative)
  priceChangePct: number;
  sellSignal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  signalStrength: number;    // 1–5
  lastUpdated: Date;
  drivers: Array<{ emoji: string; text: string; impact: string }>; // top 3 drivers
  modelMape: number;
  modelDirectional: number;
}

// RENDER STRUCTURE:
// 
// Two-column card (8-col/4-col on desktop, stacked on mobile):
//
// LEFT: Price hero
//   <h2>{mandi} · आज का भाव</h2>
//   <p className="text-xs text-muted">{formatTime(lastUpdated)}</p>
//   <p className="text-5xl font-bold tabular-nums">₹{price.toFixed(2)}/kg</p>
//   <PriceChangeBadge abs={priceChangeAbs} pct={priceChangePct} />
//   <ConfidenceBar p10={priceP10} p90={priceP90} />
//   <SellSignalBadge signal={sellSignal} strength={signalStrength} />
//   <DriversExpandable drivers={drivers} />   ← collapsible section
//
// RIGHT: Model accuracy
//   <h3>मॉडल सटीकता</h3>
//   <MapeDisplay mape={modelMape} directional={modelDirectional} />

// STALENESS CHECK:
// If lastUpdated older than 6 hours:
//   Show amber banner: "⚠ Data last updated {N} hours ago"

// LOADING STATE:
// Skeleton: grey shimmer rectangle 100% × 160px

// SELL SIGNAL BADGE COLOURS:
//   SELL_NOW → bg-green-50 text-green-700 border-green-200 "आज बेचें ✓"
//   HOLD     → bg-amber-50 text-amber-700 border-amber-200 "रुकें"
//   CAUTION  → bg-red-50 text-red-700 border-red-200 "सावधान"
```

**QA Checks:**
- [ ] Renders correctly when price is negative change (red arrow + negative formatting)
- [ ] ₹ symbol renders correctly in Hindi locale
- [ ] Confidence bar fills correctly for P10=150, P90=180 range
- [ ] Drivers section collapses/expands with smooth animation
- [ ] Loading skeleton has same dimensions as loaded state (no layout shift)
- [ ] Stale data banner appears correctly after 6 hours
- [ ] Model accuracy: green if <6%, amber 6-9%, red >9%

---

### TASK T-DASH-003
**Priority:** P0
**File:** `apps/web/components/dashboard/KPIStrip.tsx`
**Purpose:** 5 KPI cards below hero — Mandi Benchmark, Middleman Spread, Active Alerts, Feed Cost Index, Subscription.

```typescript
// Each KPI card:
interface KPICardProps {
  label: string;
  labelHindi?: string;
  value: string | number;
  unit?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; amount: string; label: string };
  subtext?: string;
  href?: string;         // clicking card navigates here
  status?: 'ok' | 'warn' | 'alert';
  sparklineData?: number[];  // for Feed Cost Index card only
}

// FEED COST INDEX card:
// Shows Recharts Sparkline (7 data points)
// Use: <ComposedChart> with <Line> only, no axes, no grid, tiny height (32px)
// Import from recharts: { LineChart, Line, ResponsiveContainer }

// SUBSCRIPTION card:
// Shows plan name + days until renewal (or "Trial: N days left")
// Clicking → /dashboard/settings/billing

// ACTIVE ALERTS card:
// Tooltip on hover: breakdown by category
// "2 disease, 1 weather, 0 price, 0 policy"
// Uses Radix UI HoverCard component
```

**QA Checks:**
- [ ] All 5 cards render without horizontal overflow on 1440px viewport
- [ ] All 5 cards render stacked correctly on 375px mobile
- [ ] Sparkline renders in Feed Cost Index card
- [ ] Clicking each card navigates to correct route
- [ ] Alert count tooltip shows correct breakdown

---

### TASK T-DASH-004 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/components/dashboard/PriceForecastChart.tsx` (Client Component)
**Purpose:** 30-day price forecast chart with P10/P50/P90 bands, actual prices, sell signals, annotations.

```typescript
'use client'
import { useState } from 'react'
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
         ReferenceLine, ReferenceArea, ResponsiveContainer, Legend } from 'recharts'
import useSWR from 'swr'

// DATA SHAPE (from /api/price-intelligence/forecast):
interface ForecastDataPoint {
  date: string;      // ISO date
  p10: number | null;
  p50: number | null;
  p90: number | null;
  actual: number | null;
  sellSignal?: 'SELL_NOW' | 'HOLD' | null;
  isToday?: boolean;
  festivalName?: string | null;  // non-null if festival annotation needed
  hpaiAlert?: boolean;
}

// TIME RANGE SELECTOR:
type Range = '7D' | '14D' | '30D' | '90D'
const [range, setRange] = useState<Range>('30D')

// SWR FETCH:
const { data, isLoading } = useSWR(
  `/api/price-intelligence/forecast?range=${range}&mandi=${mandiId}`,
  fetcher,
  { revalidateOnFocus: false, revalidateInterval: 300000 }  // 5-minute refresh
)

// CHART COMPONENTS:
// 1. Area for P10-P90 band (light green fill):
//    <Area type="monotone" dataKey="p90" fill="#D4EFDE" stroke="transparent" />
//    <Area type="monotone" dataKey="p10" fill="#FFFFFF" stroke="transparent" />
//    (Stack trick: p90 area - p10 area = band)
//    Better: use ReferenceArea for each date segment or use two Areas with correct stacking

// 2. P50 forecast line (solid, green):
//    <Line type="monotone" dataKey="p50" stroke="#1A5C34" strokeWidth={2.5} dot={false} />

// 3. Actual price line (orange dots):
//    <Line type="monotone" dataKey="actual" stroke="#E8611A" strokeWidth={2}
//          dot={{ r: 3, fill: '#E8611A' }} connectNulls={false} />

// 4. Today's vertical reference line:
//    <ReferenceLine x={todayDate} stroke="#9CA3AF" strokeDasharray="4 2" label="Today" />

// 5. Festival annotations:
//    festivalPoints.map(point =>
//      <ReferenceLine x={point.date} stroke="#7C3AED" strokeDasharray="2 2"
//                     label={{ value: point.name, position: 'top', fontSize: 10 }} />
//    )

// 6. HPAI alert zone:
//    hpaiRanges.map(range =>
//      <ReferenceArea x1={range.start} x2={range.end}
//                     fill="#FEE2E2" fillOpacity={0.4} />
//    )

// NEVER BLANK RULE:
// if (isLoading) → return <ChartSkeleton height={280} />
// if (!data || data.length === 0) → return <ChartEmptyState />
//   ChartEmptyState: shows grey placeholder chart outline with text
//   "Price data loads daily at 6:00 AM. Check back tomorrow."
//   NEVER show a white empty rectangle

// CUSTOM TOOLTIP:
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E3EDE7] rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-900">{formatDate(label)}</p>
      {payload.find(p => p.dataKey === 'p50') && (
        <p>P50: <strong>₹{payload.find(p => p.dataKey === 'p50').value}/kg</strong></p>
      )}
      {payload.find(p => p.dataKey === 'actual') && (
        <p className="text-orange-600">Actual: ₹{payload.find(p => p.dataKey === 'actual').value}/kg</p>
      )}
      <p className="text-gray-500">Range: ₹{p10}–₹{p90}</p>
    </div>
  )
}
```

**QA Checks:**
- [x] Chart renders with data (not blank) when API returns data
- [x] ChartSkeleton renders when data is loading (not blank white)
- [x] ChartEmptyState renders when API returns empty array (not blank white)
- [x] P10–P90 band visible and correctly represents uncertainty range
- [x] Actual price dots only appear where actual data exists (no dots for future dates)
- [x] Today's reference line appears at correct date
- [x] Time range selector (7D/14D/30D/90D) re-fetches data and updates chart
- [x] Tooltip shows correct values on hover
- [x] Chart is usable on mobile (touch scrolling, readable tooltip)

---

## T-PI: PRICE INTELLIGENCE — FORECAST TAB FIX (CRITICAL)

---

### TASK T-PI-001
**Priority:** P0 (CRITICAL — THIS TAB IS BLANK IN PRODUCTION)
**File:** `apps/web/app/dashboard/price/page.tsx`
**Purpose:** Fix blank Forecast tab. Implement full price forecast UI with chart, sell signal, drivers.

```
ROOT CAUSE OF BLANK TAB:
  Inspect current code — likely the Forecast tab renders <PriceForecastChart>
  which depends on data that isn't being fetched, causing empty state.

MANDATORY FIX CHECKLIST:
  [ ] Confirm /api/price-intelligence/forecast endpoint exists and returns data
  [ ] Confirm Forecast tab is the DEFAULT tab (not a different tab)
  [ ] Chart component has correct SWR key that matches API route
  [ ] API route has no auth error (check Supabase auth in SSR context)
  [ ] If API returns empty array: show ChartEmptyState (not white blank)
  [ ] If API returns 404/500: show ChartErrorState with retry button

IMPLEMENTATION:
  Forecast tab content:
    1. Filter row: Mandi selector + Range selector (7D/14D/30D/60D) + Compare Mandi button
    2. PriceForecastChart (see T-DASH-004)
    3. SellSignalCallout card (below chart, right-aligned):
         Optimal sell window, Expected P50, Confidence level
    4. PriceDriversTable (expandable, collapsed by default):
         Shows top 5 SHAP features with impact direction + magnitude

  SellSignalCallout component:
    Fetch from: /api/price-intelligence/optimal-window?mandi={mandiId}
    Returns: { windowStart: Date, windowEnd: Date, expectedP50: number, confidence: 'HIGH'|'MEDIUM'|'LOW' }
    
    Render:
    <div className="border border-[#E3EDE7] rounded-xl p-4 bg-[#EDF7F1]">
      <h3>📅 Optimal Sell Window</h3>
      <p>Jun 3–Jun 6 (D+2 to D+5)</p>
      <p>Expected P50: ₹172–₹176/kg</p>
      <ConfidenceStars level={confidence} />
    </div>

  PriceDriversTable component:
    Fetch from: /api/price-intelligence/drivers?date=today&mandi={mandiId}
    Returns: Array<{ name: string, impact: number, direction: 'up'|'down', confidence: string }>
    
    Render as expandable table inside Radix UI Collapsible
    Columns: Driver Name | Impact (₹/kg) | Direction | Confidence
```

**QA Checks:**
- [ ] Forecast tab is NOT blank on first load with valid session
- [ ] Chart loads with data within 3 seconds of page open
- [ ] Changing mandi selector fetches new data for selected mandi
- [ ] Changing range selector fetches correct date range
- [ ] SellSignalCallout shows even if optimal window is "TODAY"
- [ ] DriversTable expands/collapses with animation
- [ ] No horizontal overflow at 375px mobile

---

## T-MAP: DISTRICT MAP FIX (CRITICAL)

---

### TASK T-MAP-001
**Priority:** P0 (CRITICAL — MAP SHOWS ALL RED, INCORRECT)
**File:** `apps/web/app/dashboard/map/page.tsx` and `components/map/DistrictChoropleth.tsx`
**Purpose:** Fix incorrect choropleth map rendering. All districts showing red is a bug.

```
ROOT CAUSE INVESTIGATION STEPS:
  1. Check if GeoJSON district boundaries are loading correctly
     - Open browser DevTools → Network tab → filter by "geojson"
     - If 404: move geojson file to /public directory
     - If CORS: serve from Next.js /public instead of external URL

  2. Check if price data is being joined to GeoJSON features correctly
     - GeoJSON features have a 'district' property (string name)
     - Price data must use THE SAME district name spelling
     - Common mismatch: "Gorakhpur" vs "gorakhpur" vs "GORAKHPUR"
     - FIX: normalise both to lowercase before joining

  3. Check fillColor logic:
     - Should calculate percentile thresholds from all district prices
     - Currently likely hardcoding thresholds OR all districts have no price data
     - FIX: compute P25 and P75 from available data dynamically

CORRECT IMPLEMENTATION:

// Step 1: Load GeoJSON (UP districts)
// Source: https://github.com/datameet/maps/tree/master/Districts
// Download UP_district.geojson, place at /public/geojson/up_districts.geojson
const geoData = await fetch('/geojson/up_districts.geojson').then(r => r.json())

// Step 2: Fetch price data
const prices = await fetch('/api/map/district-prices').then(r => r.json())
// Returns: Array<{ district: string, p50: number, signal: string }>

// Step 3: Join price data to GeoJSON
const priceMap = new Map(prices.map(p => [p.district.toLowerCase(), p]))

// Step 4: Calculate thresholds for choropleth (dynamic, not hardcoded)
const allPrices = prices.map(p => p.p50).filter(Boolean)
const p25 = percentile(allPrices, 25)
const p75 = percentile(allPrices, 75)

// Step 5: Assign colours
function getDistrictColor(districtName: string): string {
  const data = priceMap.get(districtName.toLowerCase())
  if (!data) return '#D1D5DB'  // grey — no data
  if (data.p50 > p75) return '#16A34A'  // green — high price
  if (data.p50 > p25) return '#D97706'  // amber — moderate
  return '#DC2626'  // red — low price
}

// Step 6: Leaflet Choropleth
// Use react-leaflet with GeoJSON layer and style function:
<GeoJSON
  data={geoData}
  style={(feature) => ({
    fillColor: getDistrictColor(feature.properties.district),
    fillOpacity: 0.65,
    weight: 1,
    color: '#FFFFFF',
    opacity: 0.8,
  })}
  onEachFeature={(feature, layer) => {
    layer.on({
      click: () => onDistrictClick(feature.properties.district),
      mouseover: (e) => showTooltip(e, feature),
      mouseout: (e) => hideTooltip(e),
    })
  }}
/>
```

**QA Checks:**
- [ ] Districts show multiple colours (not all red)
- [ ] High-price districts show green, low show red, moderate show amber
- [ ] Districts with no price data show grey (not red)
- [ ] Tooltip shows on district hover
- [ ] Right panel opens on district click with correct data
- [ ] Map loads within 3 seconds (GeoJSON cached in browser)
- [ ] Map renders on mobile with touch pan/zoom

---

## T-FARM: MY FARMS MODULE

---

### TASK T-FARM-001 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/components/farms/FarmCard.tsx`
**Purpose:** Farm card component with all required fields, log status, WhatsApp status, proper colour coding.

```typescript
interface FarmCardProps {
  farm: {
    id: string;
    name: string;
    location: string;
    type: 'Broiler' | 'Layer' | 'Breeder';
    maxBirds: number;
    status: 'active' | 'between_batches' | 'paused' | 'onboarding';
    currentBatch?: {
      batchNumber: number;
      dayNumber: number;
      targetDays: number;
      birdsAlive: number;
      birdsPlaced: number;
      mortalityPct: number;
      currentWeight: number;
      targetWeight: number;
      fcr: number;
      lastLogDate: string | null;
      lastLogTime: string | null;
    };
    whatsappConnected: boolean;
  };
}

// LEFT BORDER COLOUR:
// active + log submitted today → brand400 (green)
// active + no log today → #D97706 (amber)
// between_batches → #9CA3AF (grey)
// paused → #DC2626 (red)

// LOG STATUS BADGE:
const logStatus = () => {
  if (!farm.currentBatch) return null
  const today = new Date().toISOString().split('T')[0]
  const loggedToday = farm.currentBatch.lastLogDate === today
  if (loggedToday) {
    return (
      <span className="text-green-600 text-xs flex items-center gap-1">
        <CheckCircle size={12} /> Log submitted at {farm.currentBatch.lastLogTime}
      </span>
    )
  }
  return (
    <Link href={`/dashboard/farms/${farm.id}?tab=daily-log`}
          className="text-amber-600 text-xs flex items-center gap-1 hover:underline">
      <AlertCircle size={12} /> Today's log pending — Submit now →
    </Link>
  )
}

// WHATSAPP STATUS:
const waStatus = farm.whatsappConnected
  ? <span className="text-green-600 text-[11px]">● Connected — Reminder at 6 PM</span>
  : <span className="text-gray-400 text-[11px]">○ WhatsApp not set up</span>

// PROGRESS BAR (batch day/target):
const progress = farm.currentBatch
  ? (farm.currentBatch.dayNumber / farm.currentBatch.targetDays) * 100
  : 0

// FCR COLOUR:
// Use fcrColour() helper from design-tokens.ts

// HOVER ANIMATION (Framer Motion):
<motion.div
  whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}
  transition={{ duration: 0.15 }}
>
```

**QA Checks:**
- [ ] Left border colour correct for all 4 status states
- [ ] Log status badge: green when today's log exists, amber when missing
- [ ] "Submit now" link navigates to farm detail → daily log tab
- [ ] FCR value colour-coded correctly
- [ ] Mortality % colour-coded correctly
- [ ] Progress bar percentage is correct (dayNumber / targetDays × 100)
- [ ] WhatsApp status shows connected state correctly
- [ ] Hover animation smooth, no layout shift
- [ ] Card renders correctly at 375px (single column)
- [ ] RLS: farm only shows if owned by logged-in user

---

### TASK T-FARM-002 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/app/dashboard/farms/[id]/components/HarvestWindowBanner.tsx`
**Purpose:** Show harvest window estimate when bird weight ≥ 85% of target. Cross-links to price forecast.

```typescript
interface HarvestWindowBannerProps {
  currentWeightG: number;
  targetWeightG: number;
  batchDayNumber: number;
  placementDate: Date;
  farmMandiId: string;
}

// VISIBILITY CONDITION: only show when currentWeight >= 85% of targetWeight
// If currentWeight < 85%: return null (component renders nothing)

// CALCULATE HARVEST WINDOW:
// Standard broiler ADG = 50-60g/day in weeks 4-6
// Days to target = (targetWeightG - currentWeightG) / avgDailyGain
// Window = today + daysToTarget ± 2 days

// FETCH PRICE FORECAST for harvest window dates:
const { data: priceForecast } = useSWR(
  `/api/price-intelligence/forecast?mandi=${farmMandiId}&startDate=${windowStart}&endDate=${windowEnd}`
)

// RENDER:
<div className="bg-[#EDF7F1] border border-[#3DAE72] rounded-xl p-4 flex items-center gap-4">
  <span className="text-2xl">🌟</span>
  <div>
    <h3 className="font-semibold text-[#1A5C34]">Harvest Window: Est. {windowStart}–{windowEnd}</h3>
    <p className="text-sm text-gray-600">
      Current: {currentWeightG}g | Target: {targetWeightG}g ({pctComplete}% of target)
    </p>
    {priceForecast && (
      <p className="text-sm font-semibold text-[#1A5C34]">
        Price forecast for this window: P50 ₹{priceForecast.p50}/kg
        {priceForecast.sellSignal === 'SELL_NOW' && ' — आज बेचें ✓'}
      </p>
    )}
  </div>
  <Link href={`/dashboard/calculator?farmId=${farmId}`}
        className="ml-auto text-sm underline text-[#1A5C34]">
    Calculate ROI →
  </Link>
</div>
```

**QA Checks:**
- [ ] Banner does NOT show when weight < 85% of target
- [ ] Banner shows when weight ≥ 85% of target
- [ ] Harvest window dates are realistic (not in the past)
- [ ] Price forecast data shown when available
- [ ] Calculator link passes farmId correctly
- [ ] Banner looks good on mobile (wraps correctly)

---

### TASK T-FARM-003 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/app/dashboard/farms/[id]/components/DailyLogForm.tsx`
**Purpose:** Daily log entry form shown at top of Daily Log tab when today's log is missing.

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { set as idbSet, get as idbGet } from 'idb-keyval'

const DailyLogSchema = z.object({
  birds_dead:   z.number().int().min(0).max(10000),
  feed_kg:      z.number().positive().max(50000),
  water_liters: z.number().positive().max(100000).optional(),
  temp_min:     z.number().min(-10).max(60).optional(),
  temp_max:     z.number().min(-10).max(60).optional(),
  avg_weight_g: z.number().positive().max(4000).optional(),
  notes:        z.string().max(500).optional(),
})
type DailyLogForm = z.infer<typeof DailyLogSchema>

// OFFLINE DRAFT PERSISTENCE:
// On every field change: save to IndexedDB with key `log_draft_${farmId}_${today}`
// On component mount: load draft from IndexedDB if it exists
// On successful submit: clear IndexedDB draft

// AUTO-COMPUTE (update in real-time as user types):
// FCR = cumulative_feed_consumed_kg / (birds_alive_kg / 1000)
//   birds_alive_kg = birdsAlive × (avg_weight_g / 1000)
//   cumulative_feed_consumed_kg = previous days feed sum + today feed_kg
// ADG = (today_avg_weight - yesterday_avg_weight) grams
//   If yesterday weight not known: show "—"
// Mortality % = (cumulative_dead / birds_placed) × 100

// SUBMIT HANDLER:
const onSubmit = async (data: DailyLogForm) => {
  try {
    const response = await fetch(`/api/farms/${farmId}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, date: today, source: 'manual' }),
    })
    if (!response.ok) throw new Error('Failed to save log')
    await idbSet(`log_draft_${farmId}_${today}`, null)  // clear draft
    toast.success('आज का लॉग सुरक्षित हो गया ✓')
    onLogSaved()  // callback to re-render parent
  } catch (error) {
    toast.error('लॉग सुरक्षित नहीं हो सका। फिर से कोशिश करें।')
  }
}

// FORM LAYOUT (Tailwind):
// 3-column grid on desktop (birds_dead, feed_kg, water_liters)
// 3-column grid (temp_min, temp_max, avg_weight_g)
// full-width notes textarea
// Read-only computed row (FCR, ADG, Mortality %)
// [Save] and [Clear] buttons (right-aligned)

// IF LOG ALREADY SUBMITTED TODAY:
// Show: "✓ Log submitted at 09:23 AM (via WhatsApp)" [Edit]
// Edit button: shows form pre-filled with today's values
// Edit is a PUT not POST

// NOTES ON API ROUTE /api/farms/[farmId]/logs:
// POST body: { birds_dead, feed_kg, water_liters?, temp_min?, temp_max?, avg_weight_g?, notes?, date, source }
// Validation: Zod schema server-side (same schema as client)
// RLS: verify farm.integrator_id = auth.uid() before writing
// After insert: update farm_metrics_summary materialized view (REFRESH MATERIALIZED VIEW CONCURRENTLY)
// Return: { success: true, log_id: string, computed: { fcr, adg, cumulative_mortality_pct } }
```

**QA Checks:**
- [ ] Form renders at top of Daily Log tab ONLY when today's log is missing
- [ ] Form hidden (shows "Edit" text instead) when today's log exists
- [ ] All fields validate on submit (not on change — avoid annoying premature errors)
- [ ] FCR, ADG, Mortality computed values update in real-time as fields change
- [ ] Computed values shown in green read-only boxes
- [ ] Success toast shown after submit
- [ ] Error toast shown on API failure (not raw error)
- [ ] Offline draft saved to IndexedDB every 5 seconds
- [ ] Draft restored from IndexedDB on page reload (before submit)
- [ ] Draft cleared from IndexedDB after successful submit
- [ ] Form is fully usable at 375px mobile width (no overflow)

---

## T-WA: WHATSAPP DAILY LOG AUTOMATION

---

### TASK T-WA-001 ✅ COMPLETED
**Priority:** P1
**File:** `apps/api/whatsapp/daily_log_webhook.py`
**Purpose:** Webhook endpoint that receives incoming WhatsApp messages, parses farmer replies, saves daily log.

```typescript
import { Router } from 'express'  // or Next.js API route equivalent
import { createHmac } from 'crypto'
import { DailyLogParser } from '../../services/DailyLogParser'
import { WhatsAppService } from '../../services/WhatsAppService'
import { createSupabaseServiceClient } from '../../lib/supabase'

const router = Router()

// WEBHOOK SIGNATURE VERIFICATION (critical security step):
function verifyWhatsAppSignature(body: Buffer, signature: string): boolean {
  const expectedSig = createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
    .update(body)
    .digest('hex')
  return `sha256=${expectedSig}` === signature
}

router.post('/webhook', async (req, res) => {
  // 1. Verify signature
  const sig = req.headers['x-hub-signature-256'] as string
  if (!verifyWhatsAppSignature(req.rawBody, sig)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  // 2. Extract message from WhatsApp payload
  const message = extractMessage(req.body)
  if (!message) return res.sendStatus(200)  // ACK but no message to process

  const { fromPhone, messageText, messageId } = message

  // 3. Find farm by WhatsApp phone number
  const supabase = createSupabaseServiceClient()
  const { data: farm } = await supabase
    .from('farms')
    .select('id, integrator_id, name, current_batch_id, whatsapp_number')
    .eq('whatsapp_number', fromPhone)
    .eq('status', 'active')
    .single()

  if (!farm) {
    // Unknown number — optionally send "Number not registered" reply
    return res.sendStatus(200)
  }

  // 4. Handle special commands
  const upperText = messageText.trim().toUpperCase()
  if (upperText === 'STOP') {
    await supabase.from('farms').update({ whatsapp_reminders_paused: true }).eq('id', farm.id)
    await WhatsAppService.send(fromPhone, 'FlockIQ reminders paused. Reply START to resume.')
    // Alert integration manager
    await createDashboardAlert(farm.integrator_id, `${farm.name}: WhatsApp reminders paused by farmer`)
    return res.sendStatus(200)
  }

  if (upperText === 'HELP') {
    await WhatsAppService.send(fromPhone, HELP_MESSAGE_HINDI)
    return res.sendStatus(200)
  }

  // 5. Parse the log data
  const parser = new DailyLogParser(messageText, farm.id)
  const parsed = parser.parse()

  if (!parsed.success) {
    await WhatsAppService.send(fromPhone, 
      `FlockIQ: Aapka reply samajh nahi aaya.\n\nKripya is format mein bhejein:\n[mri hui murgiyan] [khaana kg]\n\nExample: 2 1250`)
    return res.sendStatus(200)
  }

  // 6. Validate parsed values
  const { data: batch } = await supabase
    .from('batches')
    .select('birds_placed, cumulative_dead, day_number')
    .eq('id', farm.current_batch_id)
    .single()

  const validationResult = validateLogValues(parsed, batch)
  
  if (validationResult.needsConfirmation) {
    // Save pending_confirmation to Redis/DB with TTL 10min
    await savePendingConfirmation(farm.id, parsed, messageId)
    await WhatsAppService.send(fromPhone, validationResult.confirmationMessage)
    return res.sendStatus(200)
  }

  // 7. Check for REDO command (farmer correcting previous submission)
  if (upperText === 'REDO') {
    await deleteTodayLog(farm.id)
    await WhatsAppService.send(fromPhone, 'Kal ka log hata diya. Abhi naya log bhejein:')
    return res.sendStatus(200)
  }

  // 8. Check for duplicate (log already submitted today)
  const today = new Date().toISOString().split('T')[0]
  const { data: existingLog } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('farm_id', farm.id)
    .eq('log_date', today)
    .single()

  if (existingLog) {
    await WhatsAppService.send(fromPhone, 
      `Aaj ka log pehle se save hai. Update karna chahte hain? Reply: YES / NO`)
    await savePendingUpdate(farm.id, parsed)
    return res.sendStatus(200)
  }

  // 9. Save the log
  const { data: savedLog } = await supabase
    .from('daily_logs')
    .insert({
      farm_id: farm.id,
      batch_id: farm.current_batch_id,
      log_date: today,
      birds_dead: parsed.birds_dead,
      feed_kg: parsed.feed_kg,
      avg_weight_g: parsed.weight_g || null,
      source: 'whatsapp',
      raw_whatsapp_message: messageText,
      whatsapp_message_id: messageId,
    })
    .select()
    .single()

  // 10. Compute metrics (FCR, cumulative mortality)
  const computed = await computeBatchMetrics(farm.current_batch_id, savedLog.id)

  // 11. Send confirmation
  const confirmMsg = buildConfirmationMessage({
    farmName: farm.name,
    date: today,
    birdsDead: parsed.birds_dead,
    feedKg: parsed.feed_kg,
    weightG: parsed.weight_g,
    fcr: computed.fcr,
    cumulativeMortalityPct: computed.cumulative_mortality_pct,
  })
  await WhatsAppService.send(fromPhone, confirmMsg)

  return res.sendStatus(200)
})

// CONFIRMATION MESSAGE BUILDER:
function buildConfirmationMessage(data): string {
  return `✅ Log save ho gaya — ${data.farmName} (${data.date}):\n` +
    `• Mri hui murgiyan: ${data.birdsDead}\n` +
    `• Khaana: ${data.feedKg.toLocaleString('en-IN')} kg\n` +
    (data.weightG ? `• Wazn: ${data.weightG} g\n` : '') +
    `• FCR (estimated): ${data.fcr.toFixed(2)}\n` +
    `• Sanchiit mortality: ${data.cumulativeMortalityPct.toFixed(2)}%\n\n` +
    `Galti hai? Reply: REDO`
}
```

**QA Checks:**
- [ ] Webhook signature verified before processing (test with invalid signature → 401)
- [ ] Unknown phone number → acknowledged silently (200) without error
- [ ] STOP command pauses reminders + creates dashboard alert
- [ ] HELP command sends format instructions
- [ ] Valid simple reply "2 1250" → log saved + confirmation sent
- [ ] Valid reply "0 1250 1680" → log with weight saved + confirmation
- [ ] Ambiguous reply → clarification message sent (no log saved)
- [ ] Duplicate log → "Update?" confirmation flow
- [ ] Validation failure (150 birds dead) → flagged for review, confirmation with flag
- [ ] Confirmation message contains all submitted values
- [ ] Log saved with source = 'whatsapp' in database
- [ ] Raw message stored in raw_whatsapp_message column

---

### TASK T-WA-002 ✅ COMPLETED
**Priority:** P1
**File:** `apps/api/whatsapp/daily_log_webhook.py` (DailyLogParser class)
**Purpose:** Natural language parser for farmer WhatsApp replies. Handles Hindi/English/mixed input.

```typescript
interface ParsedLog {
  success: boolean;
  birds_dead?: number;
  feed_kg?: number;
  weight_g?: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  parseMethod: string;  // for debugging
}

export class DailyLogParser {
  constructor(private message: string, private farmId: string) {}

  parse(): ParsedLog {
    const msg = this.message.trim().toLowerCase()

    // STRATEGY 1: Pure numeric format "2 1250 1680"
    const numericMatch = msg.match(/^(\d+)\s+(\d+(?:\.\d+)?)\s*(\d+)?$/)
    if (numericMatch) {
      return {
        success: true,
        birds_dead: parseInt(numericMatch[1]),
        feed_kg: parseFloat(numericMatch[2]),
        weight_g: numericMatch[3] ? parseInt(numericMatch[3]) : undefined,
        confidence: 'HIGH',
        parseMethod: 'numeric_positional',
      }
    }

    // STRATEGY 2: Keyword extraction (Hindi + English)
    const birdKeywords = ['muri', 'murgi', 'bird', 'birds', 'murgiyan', 'mur', 'dead', 'mre', 'mari']
    const feedKeywords = ['kg', 'kilo', 'khana', 'khaana', 'feed', 'dana', 'daana']
    const weightKeywords = ['g', 'gm', 'gram', 'wazn', 'weight']
    const allGoodKeywords = ['theek', 'sab theek', 'all good', 'normal', 'okay', 'ok', '0 dead', 'no death']

    // Check "all good" patterns
    if (allGoodKeywords.some(kw => msg.includes(kw))) {
      const feedMatch = msg.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo)?/)
      if (feedMatch) {
        return {
          success: true,
          birds_dead: 0,
          feed_kg: parseFloat(feedMatch[1]),
          confidence: 'HIGH',
          parseMethod: 'all_good_with_feed',
        }
      }
    }

    // Extract numbers near keywords
    const numbers = msg.match(/\d+(?:\.\d+)?/g)?.map(Number) || []
    if (numbers.length >= 2) {
      // Heuristic: first small number = birds dead, larger number = feed kg
      const sortedNums = [...numbers].sort((a, b) => a - b)
      const birds_dead = numbers[0]  // usually first number mentioned
      const feed_kg = numbers.find(n => n > 100 && n < 50000)  // feed is typically 100-50000

      if (birds_dead !== undefined && feed_kg !== undefined) {
        return {
          success: true,
          birds_dead: Math.round(birds_dead),
          feed_kg: feed_kg,
          confidence: 'MEDIUM',
          parseMethod: 'keyword_heuristic',
        }
      }
    }

    // STRATEGY 3: Unable to parse
    return { success: false, confidence: 'LOW', parseMethod: 'failed' }
  }
}
```

**QA Checks:**
- [ ] "2 1250 1680" → { birds_dead: 2, feed_kg: 1250, weight_g: 1680, confidence: 'HIGH' }
- [ ] "0 1250" → { birds_dead: 0, feed_kg: 1250, confidence: 'HIGH' }
- [ ] "sab theek hai 1200" → { birds_dead: 0, feed_kg: 1200, confidence: 'HIGH' }
- [ ] "aaj 3 muri 1200 kg" → { birds_dead: 3, feed_kg: 1200, confidence: 'MEDIUM' }
- [ ] "all good 1350kg" → { birds_dead: 0, feed_kg: 1350, confidence: 'HIGH' }
- [ ] "hello how are you" → { success: false, confidence: 'LOW' }
- [ ] "3 mre 1250" → { birds_dead: 3, feed_kg: 1250, confidence: 'MEDIUM' }

---

### TASK T-WA-003 ✅ COMPLETED
**Priority:** P1
**File:** `apps/api/jobs/daily_reminder_job.py` (adapted to Python)
**Purpose:** Cron job that sends daily WhatsApp reminders to farmers at configured time.

```typescript
// RUNS: every hour, sends reminders to farms whose reminder_time = current hour
// OR: runs at specific times (5 PM, 6 PM, 7 PM, 8 PM IST) for farms configured for those times

import cron from 'node-cron'
import { createSupabaseServiceClient } from '../lib/supabase'
import { WhatsAppService } from '../services/WhatsAppService'

// Run at top of every hour
cron.schedule('0 * * * *', async () => {
  const now = new Date()
  const currentHourIST = getISTHour(now)  // Convert UTC to IST
  
  const supabase = createSupabaseServiceClient()

  // Find all active farms with reminder configured for this hour
  const { data: farms } = await supabase
    .from('farms')
    .select(`
      id, name, whatsapp_number, whatsapp_reminder_hour, whatsapp_language,
      current_batch_id,
      batches (id, day_number, placement_date, status)
    `)
    .eq('whatsapp_reminders_enabled', true)
    .eq('whatsapp_reminders_paused', false)
    .eq('whatsapp_reminder_hour', currentHourIST)
    .not('whatsapp_number', 'is', null)
    .not('current_batch_id', 'is', null)

  for (const farm of farms ?? []) {
    // Skip if batch not active
    if (farm.batches?.status !== 'active') continue

    // Skip if today's log already submitted
    const today = now.toISOString().split('T')[0]
    const { data: existingLog } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('farm_id', farm.id)
      .eq('log_date', today)
      .single()

    if (existingLog) {
      console.log(`[WhatsApp] Skipping ${farm.name} — log already submitted today`)
      continue
    }

    // Build and send reminder message
    const dayNumber = calculateBatchDay(farm.batches.placement_date, now)
    const message = buildReminderMessage({
      farmName: farm.name,
      date: today,
      dayNumber,
      language: farm.whatsapp_language || 'hindi',
    })

    try {
      await WhatsAppService.send(farm.whatsapp_number, message)
      // Log the sent reminder
      await supabase.from('whatsapp_reminders').insert({
        farm_id: farm.id,
        sent_at: now.toISOString(),
        message_type: 'daily_reminder',
        day_number: dayNumber,
      })
    } catch (err) {
      console.error(`[WhatsApp] Failed to send reminder to ${farm.name}:`, err)
      // Don't throw — continue to next farm
    }
  }
})

// REMINDER MESSAGE BUILDER:
function buildReminderMessage({ farmName, date, dayNumber, language }): string {
  if (language === 'hindi') {
    return `🐔 FlockIQ — ${farmName} आज का लॉग (${formatDateHindi(date)}, Day ${dayNumber})\n\n` +
      `Namaste! Aaj ka data bhejein:\n` +
      `Format: [mri hui murgiyan] [khaana kg] [wazn gm (optional)]\n\n` +
      `Example: 2 1250 1680\n` +
      `(matlab: 2 murgiyan mri, 1250 kg khaana, 1680 gm wazn)\n\n` +
      `Agar sab theek: 0 1250\n\n` +
      `FlockIQ — Aapke Farm ka Digital Saathi 🌱`
  } else {
    return `🐔 FlockIQ — ${farmName} Daily Log (${date}, Day ${dayNumber})\n\n` +
      `Hi! Please send today's data:\n` +
      `Format: [birds dead] [feed kg] [weight gm (optional)]\n\n` +
      `Example: 2 1250 1680\n\n` +
      `If all good: 0 1250\n\n` +
      `FlockIQ — Your Farm's Digital Partner 🌱`
  }
}
```

**QA Checks:**
- [ ] Job runs at the correct hour (IST timezone conversion is correct)
- [ ] Farm with log already submitted today → no reminder sent
- [ ] Farm with paused reminders → no reminder sent
- [ ] Farm with no active batch → no reminder sent
- [ ] Reminder sent with correct day number
- [ ] Reminder logged in whatsapp_reminders table
- [ ] Error in one farm does not stop processing of other farms
- [ ] Hindi language reminder uses correct Hindi text

---

### TASK T-WA-004 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/farms/[id]/components/WhatsAppTab.tsx`
**Purpose:** WhatsApp tab in farm detail page — shows setup wizard, connection status, submission history.

```typescript
'use client'
// TWO STATES:
// State A: WhatsApp NOT connected → show setup wizard
// State B: WhatsApp connected → show status + history + conversation preview

// STATE A: SETUP WIZARD (4 steps using Stepper component)
// Step 1: Phone number entry (with +91 prefix for India)
// Step 2: Reminder time selector (5 PM / 6 PM / 7 PM / 8 PM)
// Step 3: Language selector (Hindi ● / English)
// Step 4: "Send Test Message" button → POST /api/farms/[farmId]/whatsapp/setup
//          Shows "Waiting for test message..." spinner
//          After API confirms sent: shows "Test sent! Check your WhatsApp"
//          [Confirm Connection ✓] button

// STATE B: CONNECTED STATUS CARD
<div className="border border-[#E3EDE7] rounded-xl p-5">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] flex items-center justify-center">
        <WhatsAppIcon size={20} color="#25D366" />
      </div>
      <div>
        <p className="font-semibold">WhatsApp Daily Log Automation</p>
        <p className="text-sm text-[#25D366]">● Connected — {maskedPhone}</p>
      </div>
    </div>
    <div className="flex gap-2">
      <Button variant="outline" onClick={onChangeTime}>Change Time</Button>
      <Button variant="outline" onClick={onTestReminder}>Test Reminder 📤</Button>
      <Button variant="destructive" onClick={onDisconnect}>Disconnect</Button>
    </div>
  </div>
  <p className="text-sm text-gray-500 mt-3">
    Daily reminder at {reminderTime} · Language: {language} · {activeSince}
  </p>
</div>

// RECENT SUBMISSIONS TABLE:
// Fetch from: /api/farms/[farmId]/logs?source=all&limit=20
// Source column: "📱 WhatsApp" (green badge) or "✏ Manual" (grey)
// Status column: "✓ Synced" (green) or "⚠ Needs Review" (amber)

// CONVERSATION PREVIEW (last 5 messages):
// Fetch from: /api/farms/[farmId]/whatsapp/messages?limit=5
// Render as WhatsApp-style chat bubbles:
// Sent (FlockIQ): right-aligned, light green background (#DCF8C6), rounded-tl-xl
// Received (farmer): left-aligned, white background, rounded-tr-xl
// Timestamp below each message in small grey text
```

**QA Checks:**
- [ ] Setup wizard shows when no WhatsApp configured for this farm
- [ ] Step progression works (Next/Back buttons)
- [ ] Test message actually sends (POST to API works)
- [ ] Connected status card shows correct phone (masked) and settings
- [ ] Change Time button opens a modal/popover to update time
- [ ] Test Reminder button sends test message
- [ ] Disconnect button shows confirmation dialog before disconnecting
- [ ] Recent submissions table shows WhatsApp vs Manual source correctly
- [ ] Conversation preview renders chat bubbles in correct positions

---

## T-METRICS: PORTFOLIO METRICS (FIX LOADING STATES)

---

### TASK T-METRICS-001 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/metrics/page.tsx`
**Purpose:** Fix "Loading..." states that never resolve. Wire up actual data for all charts.

```
ISSUE: All charts currently show "Loading..." indefinitely.

ROOT CAUSE: Likely one of:
  a) SWR keys are undefined (null key prevents fetch)
  b) API endpoints don't exist or return 500
  c) React context for user not available at render time

DEBUG STEPS:
  1. Open browser DevTools → Network tab
  2. Navigate to /dashboard/metrics
  3. Look for /api/metrics/* calls
  4. If no calls: SWR keys are null/undefined (check user context)
  5. If calls but 401: auth not working in client component
  6. If calls but 500: check API route server logs

IMPLEMENTATION:

API ROUTES NEEDED (if not existing):
  GET /api/metrics/portfolio?period=30d
    Returns: { totalBirds, avgFCR, avgMortality, feedConsumed }
  
  GET /api/metrics/fcr-trend?period=30d
    Returns: Array<{ date, portfolioFCR, industryBenchmark }>
  
  GET /api/metrics/mortality-events?period=30d
    Returns: Array<{ date, cumulativePct, eventMarkers: Array<{date, description}> }>
  
  GET /api/metrics/farm-ranking?period=30d
    Returns: Array<{ farmId, farmName, fcr, fcrTrend7d, mortality, adg, birdsAlive, status, lastLogDate, logCompliancePct }>
  
  GET /api/metrics/pending-actions
    Returns: Array<{ type, farmId, farmName, description, priority, actionUrl }>

FARM RANKING TABLE (enhanced):
  Add column: Trend (7-day FCR sparkline — Recharts Sparkline, height 28px)
  Add column: Log % (compliance percentage, colour-coded)
  Add column: Health (green/amber/red circle)
  Row click: navigate to /dashboard/farms/[farmId]

PENDING ACTIONS (real data, not "Loading..."):
  Types + rendering:
    'overdue_vaccination' → red priority "Shivaji Farm — IB Vaccine overdue (Day 21+2)"
    'log_missing'         → amber "Demo Farm 2 — No log submitted today"
    'fcr_alert'           → amber "Demo Farm 1 — FCR trending upward (1.95, ↑)"
    'high_mortality'      → red "Farm X — Mortality 6.2% (above 5% threshold)"
  Each action: [Resolve →] link with correct URL
```

**QA Checks:**
- [ ] Page loads without any "Loading..." state remaining after 3 seconds
- [ ] Period selector changes all charts simultaneously
- [ ] FCR trend chart shows actual data with industry benchmark line
- [ ] Mortality timeline shows events with markers
- [ ] Farm ranking table sortable by clicking column headers
- [ ] Pending actions shows real issues (not loading indicator)
- [ ] [Resolve →] links navigate to correct farm detail page + tab

---

## T-INFRA: INFRASTRUCTURE & DATABASE

---

### TASK T-INFRA-001 ✅ COMPLETED
**Priority:** P1
**File:** `apps/db/migrations/20260610_whatsapp_daily_log_enhancements.sql`
**Purpose:** Database migration to support WhatsApp daily log automation.

```sql
-- Add WhatsApp fields to farms table
ALTER TABLE farms ADD COLUMN IF NOT EXISTS
  whatsapp_number VARCHAR(20),
  whatsapp_reminders_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_reminders_paused BOOLEAN DEFAULT FALSE,
  whatsapp_reminder_hour INTEGER DEFAULT 18,  -- 18 = 6 PM
  whatsapp_language VARCHAR(10) DEFAULT 'hindi',
  whatsapp_connected_at TIMESTAMPTZ;

-- Add source tracking to daily_logs
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS
  source VARCHAR(20) DEFAULT 'manual',  -- 'manual' | 'whatsapp'
  raw_whatsapp_message TEXT,
  whatsapp_message_id VARCHAR(100),
  review_needed BOOLEAN DEFAULT FALSE;

-- WhatsApp reminders audit log
CREATE TABLE IF NOT EXISTS whatsapp_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL,
  message_type VARCHAR(50) NOT NULL,  -- 'daily_reminder' | 'follow_up' | 'test'
  day_number INTEGER,
  delivered BOOLEAN,
  replied_at TIMESTAMPTZ,
  reply_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp pending confirmations (for ambiguous replies)
CREATE TABLE IF NOT EXISTS whatsapp_pending_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  pending_data JSONB NOT NULL,  -- parsed values awaiting confirmation
  original_message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,  -- 10 minutes from creation
  confirmed BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for new tables
ALTER TABLE whatsapp_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrators_own_reminders" ON whatsapp_reminders
  FOR ALL USING (
    farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid())
  );

ALTER TABLE whatsapp_pending_confirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrators_own_pending" ON whatsapp_pending_confirmations
  FOR ALL USING (
    farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid())
  );

-- Index for webhook lookup (phone number lookup must be fast)
CREATE INDEX IF NOT EXISTS idx_farms_whatsapp_number
  ON farms(whatsapp_number)
  WHERE whatsapp_number IS NOT NULL;

-- Index for reminder job (hour-based lookup)
CREATE INDEX IF NOT EXISTS idx_farms_reminder_hour
  ON farms(whatsapp_reminder_hour)
  WHERE whatsapp_reminders_enabled = TRUE AND whatsapp_reminders_paused = FALSE;
```

**QA Checks:**
- [ ] Migration runs without errors on fresh database
- [ ] Migration runs without errors on existing database (idempotent with IF NOT EXISTS)
- [ ] RLS policies correctly scope data to farm's integrator
- [ ] Phone number index exists (verify with EXPLAIN on webhook lookup query)
- [ ] Reminder hour index exists (verify with EXPLAIN on cron job query)
- [ ] expires_at on pending_confirmations has a cleanup job (delete expired rows daily)

---

### TASK T-INFRA-002
**Priority:** P0
**File:** `apps/web/middleware.ts`
**Purpose:** Ensure trial-expired users cannot access paid features. Redirect to billing page.

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // Not authenticated → redirect to login (except public routes)
  const publicPaths = ['/login', '/signup', '/forgot-password', '/api/whatsapp/webhook']
  if (!session && !publicPaths.some(p => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session) {
    // Check subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, expires_at, plan')
      .eq('user_id', session.user.id)
      .single()

    const isExpired = subscription?.status === 'expired' ||
      (subscription?.expires_at && new Date(subscription.expires_at) < new Date())

    // Expired users can access settings/billing but not price intelligence
    const restrictedPaths = [
      '/dashboard/price',
      '/dashboard/map',
      '/dashboard/alerts',
      '/dashboard/feed',
      '/dashboard/calculator',
    ]

    if (isExpired && restrictedPaths.some(p => req.nextUrl.pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/settings/billing?reason=expired', req.url))
    }

    // Role-based access
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // S5-only routes
    if (req.nextUrl.pathname.startsWith('/dashboard/api') && user?.role !== 'S5' && user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/403', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/((?!whatsapp/webhook).*)', '/login', '/signup'],
}
```

**QA Checks:**
- [ ] Unauthenticated user → redirected to /login
- [ ] Expired subscription → /dashboard/price redirects to /billing?reason=expired
- [ ] Expired subscription → /dashboard/farms still accessible (farm ops always accessible)
- [ ] S1/S2 user → /dashboard/api redirects to /dashboard/403
- [ ] Admin user → all routes accessible
- [ ] WhatsApp webhook (/api/whatsapp/webhook) does NOT require authentication (external webhook)

---

## TESTING CHECKLIST (BEFORE LAUNCH)

```
CRITICAL PATH TESTS (must pass before any beta user access):

□ Login/Logout works correctly
□ Dashboard loads with real price data (not blank/loading)
□ District map shows correct colour coding (not all red)
□ Price Intelligence → Forecast tab shows chart (not blank)
□ Farm can be added via wizard
□ Daily log can be submitted manually (form saves correctly)
□ WhatsApp test reminder sends successfully
□ WhatsApp reply "2 1250" → daily log auto-created in database
□ WhatsApp confirmation message received by farmer
□ Harvest window banner shows when weight ≥ 85% target
□ All "Loading..." states resolve with real data or empty states
□ Trial expiry warning shows correctly at < 30 days
□ Mobile layout works at 375px (no overflow)
□ Hindi text renders correctly with Noto Sans Devanagari font

REGRESSION TESTS:
□ Existing farms still visible after brand rename
□ Existing daily logs still display correctly
□ Price forecast data unchanged after migration
□ All existing WhatsApp outbound alerts still working
□ Settings save and persist across sessions
```

---

*End of FlockIQ Updated Engineering Tasks v2.0*
*Design Reference: FlockIQ_Updated_Design_Master_v2.md*
*Requirements: FlockIQ_Updated_Requirements_v2.md*

---

## T-ALERT: ALERTS MODULE

---

### TASK T-ALERT-001 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/alerts/components/AlertSettingsCards.tsx`
**Purpose:** Replace the confusing duplicated Notification Preferences rows with clear per-category settings cards.

```typescript
// CURRENT PROBLEM:
// The existing NotificationPreferences renders repeated "WhatsApp Email InApp" rows
// with no clear grouping — users cannot tell which row controls which category.
// The toggles also appear broken (static, no working state).

// NEW DESIGN: One card per alert category

interface AlertCategorySettingProps {
  category: 'disease' | 'weather' | 'price' | 'policy';
  label: string;
  emoji: string;
  thresholdLabel: string;        // e.g., "HPAI within N km"
  thresholdValue: number;
  thresholdUnit: string;         // "km" | "%" etc.
  channels: {
    whatsapp: boolean;
    email: boolean;
    inApp: boolean;
  };
  severityFilter: 'high_only' | 'high_and_medium' | 'all';
  onUpdate: (updates: Partial<AlertCategorySettingProps>) => void;
}

// RENDER STRUCTURE:
// <div className="border border-[#E3EDE7] rounded-xl p-5 space-y-4">
//   <div className="flex items-center gap-3">
//     <span className="text-xl">{emoji}</span>
//     <h3 className="font-semibold">{label}</h3>
//   </div>
//
//   {/* Threshold row */}
//   <div className="flex items-center gap-2 text-sm">
//     <span className="text-gray-600">Trigger when:</span>
//     <span>{thresholdLabel}</span>
//     <input type="number" value={thresholdValue} ... className="w-16 ..." />
//     <span>{thresholdUnit}</span>
//   </div>
//
//   {/* Channel toggles */}
//   <div className="flex gap-6">
//     <ChannelToggle label="WhatsApp" checked={channels.whatsapp}
//                    onChange={v => onUpdate({channels: {...channels, whatsapp: v}})} />
//     <ChannelToggle label="Email" checked={channels.email}
//                    onChange={v => onUpdate({channels: {...channels, email: v}})} />
//     <ChannelToggle label="In-App" checked={channels.inApp}
//                    onChange={v => onUpdate({channels: {...channels, inApp: v}})} />
//   </div>
//
//   {/* Severity filter */}
//   <div className="flex gap-3">
//     <SeverityOption value="high_only" label="HIGH only"
//                     selected={severityFilter === 'high_only'} ... />
//     <SeverityOption value="high_and_medium" label="HIGH + MEDIUM"
//                     selected={severityFilter === 'high_and_medium'} ... />
//   </div>
// </div>

// SAVE: single [Save Preferences] button at bottom of page
// POST /api/alerts/settings — saves all 4 categories in one call
// Zod validation: each category must have at least one channel enabled if enabled overall

// DAILY SUMMARY TOGGLE (separate card at bottom):
// <div className="border border-[#E3EDE7] rounded-xl p-5">
//   <div className="flex items-center justify-between">
//     <div>
//       <h3 className="font-semibold">Daily Summary</h3>
//       <p className="text-sm text-gray-500">
//         Single daily digest: today's price + farm status + pending actions
//       </p>
//     </div>
//     <Switch checked={dailySummaryEnabled} onCheckedChange={setDailySummaryEnabled} />
//   </div>
//   {dailySummaryEnabled && (
//     <div className="mt-3 flex items-center gap-2 text-sm">
//       <span>Send at:</span>
//       <Select value={summaryTime} onValueChange={setSummaryTime}>
//         {['6:00 AM','7:00 AM','8:00 AM'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
//       </Select>
//     </div>
//   )}
// </div>
```

**QA Checks:**
- [ ] Each category card renders with correct emoji and label
- [ ] Channel toggles work independently (WhatsApp off, Email on = valid)
- [ ] Threshold value input is numeric, has min/max constraints
- [ ] Severity filter radio buttons work (only one selected at a time)
- [ ] [Save Preferences] sends POST with all 4 categories
- [ ] Success toast shown on save
- [ ] Settings persist on page reload (fetched from DB on mount)
- [ ] Daily Summary toggle shows time selector when enabled

---

### TASK T-ALERT-002 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/alerts/components/AlertEmptyState.tsx`
**Purpose:** Replace emoji-based empty state with proper illustrated empty state.

```typescript
// CURRENT: Shows sun emoji "🌞" + "सब ठीक है ✓" — looks unprofessional

// NEW EMPTY STATE:
export function AlertEmptyState({ district }: { district: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* SVG Illustration — green checkmark shield */}
      <div className="w-24 h-24 mb-6 text-[#3DAE72]">
        <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="48" cy="48" r="44" fill="#EDF7F1" stroke="#3DAE72" strokeWidth="2"/>
          <path d="M28 48L42 62L68 36" stroke="#1A5C34" strokeWidth="4"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        आपके क्षेत्र में कोई सक्रिय अलर्ट नहीं है
      </h2>
      <p className="text-gray-500 text-sm max-w-md mb-1">
        No active alerts in your area
      </p>
      <p className="text-gray-400 text-xs max-w-sm mb-8">
        FlockIQ is monitoring HPAI outbreaks, weather events, and price movements
        in {district} and surrounding districts.
      </p>

      <div className="flex gap-3">
        <button
          onClick={sendTestAlert}
          className="px-4 py-2 border border-[#E3EDE7] rounded-lg text-sm
                     text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Send Test Alert →
        </button>
        <Link href="/dashboard/alerts?tab=settings"
              className="px-4 py-2 text-sm text-[#1A5C34] hover:underline">
          Configure Alert Radius →
        </Link>
      </div>
    </div>
  )
}

// TEST ALERT:
// POST /api/alerts/test — creates a sample alert for the user (visible for 60 seconds)
// Shows: "🧪 Test Alert — This is a sample alert to confirm notifications work."
// After 60 seconds: auto-dismissed
```

**QA Checks:**
- [ ] SVG checkmark renders correctly at all screen sizes
- [ ] Hindi text uses Noto Sans Devanagari font
- [ ] "Send Test Alert" triggers a visible test alert in the Active Alerts tab
- [ ] Test alert auto-dismisses after 60 seconds
- [ ] "Configure Alert Radius" link navigates to Settings tab
- [ ] Empty state not shown when alerts exist (obvious but must verify)

---

## T-FEED: FEED INTELLIGENCE IMPROVEMENTS

---

### TASK T-FEED-001 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/feed/components/CommodityPriceRow.tsx`
**Purpose:** Make commodity price rows expandable to show 30-day price chart on click.

```typescript
'use client'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import useSWR from 'swr'

interface CommodityPriceRowProps {
  commodity: {
    id: string;                  // 'maize' | 'soya_meal' | 'palm_oil' | 'composite'
    name: string;
    nameHindi: string;
    unit: string;                // 'Per quintal' | 'Per 10kg'
    currentPrice: number;
    sevenDayDelta: number;       // positive = up, negative = down
  };
}

export function CommodityPriceRow({ commodity }: CommodityPriceRowProps) {
  const [expanded, setExpanded] = useState(false)

  // Only fetch history when row is expanded (lazy loading)
  const { data: history } = useSWR(
    expanded ? `/api/feed/commodity-history?id=${commodity.id}&days=30` : null,
    fetcher
  )

  const deltaPositive = commodity.sevenDayDelta >= 0
  const deltaColour = deltaPositive ? 'text-red-600' : 'text-green-600'
  // For feed costs: price UP = bad for farmer (red), price DOWN = good (green)

  return (
    <div className="border-b border-[#E3EDE7] last:border-0">
      {/* Main row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-4 px-1
                   hover:bg-[#F4F7F5] transition-colors rounded-lg text-left"
        aria-expanded={expanded}
      >
        <div>
          <p className="font-medium text-gray-900">{commodity.name}</p>
          <p className="text-xs text-gray-500">{commodity.nameHindi} · {commodity.unit}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold text-gray-900">₹{commodity.currentPrice.toLocaleString('en-IN')}</p>
            <p className={`text-xs font-medium ${deltaColour}`}>
              {deltaPositive ? '↑' : '↓'} {Math.abs(commodity.sevenDayDelta).toLocaleString('en-IN')}
              <span className="text-gray-400 ml-1">(7-day)</span>
            </p>
          </div>
          <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expandable 30-day chart */}
      {expanded && (
        <div className="px-4 pb-5">
          {!history ? (
            <div className="h-[160px] bg-[#F4F7F5] rounded-lg animate-pulse" />
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-2">30-day price history</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={history} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <XAxis dataKey="date" tickFormatter={d => d.slice(5)} // "MM-DD"
                         tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                         width={50} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, commodity.name]}
                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #E3EDE7' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#1A5C34" strokeWidth={2}
                        dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

**QA Checks:**
- [ ] Row expands on click showing chart
- [ ] Row collapses on second click
- [ ] Chart ONLY fetches data when row is expanded (confirm in Network tab)
- [ ] Chart skeleton shown while history loads
- [ ] Price delta colour: up = red (bad for farmer), down = green (good)
- [ ] Multiple rows can be expanded simultaneously
- [ ] Accessible: aria-expanded attribute updates correctly

---

### TASK T-FEED-002
**Priority:** P1
**File:** `apps/web/app/dashboard/feed/components/ProcurementRecommendationCard.tsx`
**Purpose:** Enhance procurement timing card with farm-count, savings calculation, and pre-order link.

```typescript
// CURRENT: Shows generic recommendation "अभी खरीदें BUY NOW — 14-day forecast..."
// IMPROVED: Add specificity — which farms, how much savings, pre-order CTA

interface ProcurementRecommendationCardProps {
  recommendation: 'BUY_NOW' | 'WAIT' | 'NEUTRAL';
  commodity: string;              // "Maize"
  reasonHindi: string;
  reasonEnglish: string;
  windowEndDate: string;          // "Jun 5, 2026"
  priceRisePct: number;           // Expected % price rise after window
  potentialSavingsPerMT: number;  // ₹ per metric tonne saved by buying now
  farmsNeedingRestock: number;    // Count of user's farms needing restock in 14 days
}

// BG COLOUR by recommendation:
// BUY_NOW → bg-[#EDF7F1] border-[#3DAE72]
// WAIT    → bg-[#FFFBEB] border-[#D97706]
// NEUTRAL → bg-[#F4F7F5] border-[#E3EDE7]

// RENDER:
<div className={`rounded-xl border p-5 ${bgClass}`}>
  <div className="flex items-start gap-3">
    <span className="text-2xl">{recommendation === 'BUY_NOW' ? '📈' : '⏳'}</span>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <p className="font-bold text-gray-900">{reasonHindi}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pillClass}`}>
          {recommendation === 'BUY_NOW' ? 'BUY NOW' : 'WAIT'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        Buy window: Now → {windowEndDate} · {commodity} expected ↑{priceRisePct}% after
      </p>
      <p className="text-sm font-semibold text-[#1A5C34] mt-1">
        Potential savings: ₹{potentialSavingsPerMT.toLocaleString('en-IN')}/MT by buying today
      </p>

      {/* Farm-specific insight (NEW) */}
      {farmsNeedingRestock > 0 && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <p className="text-sm text-gray-700">
            🏠 {farmsNeedingRestock} of your farms need feed restock in the next 14 days
          </p>
          <Link href="/dashboard/farms?filter=low_feed"
                className="text-sm text-[#1A5C34] underline mt-1 inline-block">
            Pre-order for multiple farms →
          </Link>
        </div>
      )}
    </div>
  </div>
</div>
```

**QA Checks:**
- [ ] BUY_NOW renders with green background and correct pill
- [ ] WAIT renders with amber background
- [ ] Savings calculation shown with correct formatting
- [ ] Farm count shown correctly (from user's farm portfolio data)
- [ ] Pre-order link only shows when farmsNeedingRestock > 0
- [ ] Card renders correctly on mobile (no overflow)

---

## T-MM: MIDDLEMAN CHECK IMPROVEMENTS

---

### TASK T-MM-001 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/middleman-check/components/SpreadHistoryChart.tsx`
**Purpose:** New 30-day spread history chart showing how middleman spread has changed over time.

```typescript
'use client'
// NEW COMPONENT — did not exist before

import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import useSWR from 'swr'

export function SpreadHistoryChart({ mandiId }: { mandiId: string }) {
  // Fetch history: user manually logged middleman prices in the past
  // OR derive from: mandi_p50 - (recorded_prices if available)
  // For MVP: fetch from middleman_price_logs table (if user has submitted before)
  const { data, isLoading } = useSWR(
    `/api/middleman/spread-history?mandi=${mandiId}&days=30`,
    fetcher
  )

  if (isLoading) return <div className="h-40 bg-[#F4F7F5] rounded-lg animate-pulse" />

  if (!data || data.length < 2) {
    return (
      <div className="h-40 bg-[#F4F7F5] rounded-lg flex items-center justify-center">
        <p className="text-sm text-gray-400">
          Submit 2+ price checks to see spread history
        </p>
      </div>
    )
  }

  // FAIR ZONE: typically ₹0–₹8/kg spread (configurable)
  const FAIR_THRESHOLD = 8

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">30-Day Spread History</h3>
      <p className="text-xs text-gray-500 mb-3">
        Is your middleman getting more or less fair over time?
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis dataKey="date" tickFormatter={d => d.slice(5)}
                 tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                 tickFormatter={v => `₹${v}`} width={42} />

          {/* Fair zone upper boundary */}
          <ReferenceLine y={FAIR_THRESHOLD} stroke="#D97706" strokeDasharray="4 2"
                         label={{ value: 'Fair limit', position: 'right', fontSize: 10, fill: '#D97706' }} />

          <Tooltip
            formatter={(v) => [`₹${v}/kg spread`, 'Middleman Spread']}
            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
          />
          <Line type="monotone" dataKey="spread" stroke="#1A5C34" strokeWidth={2.5}
                dot={{ r: 3, fill: '#1A5C34' }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-2">
        Green line above ₹{FAIR_THRESHOLD}/kg = possible exploitation
      </p>
    </div>
  )
}
```

**QA Checks:**
- [ ] Chart shows "Submit 2+ price checks" state when < 2 data points exist
- [ ] Fair limit reference line shows at correct Y value
- [ ] Tooltip shows spread value with correct formatting
- [ ] Spread going above fair limit visually obvious (line crosses reference line)
- [ ] Chart accessible (data table toggle)

---

### TASK T-MM-002 ✅ COMPLETED
**Priority:** P2
**File:** `apps/web/app/dashboard/middleman-check/components/NegotiationScriptCard.tsx`
**Purpose:** AI-generated negotiation script in Hindi using Claude API within the artifact.

```typescript
'use client'
import { useState } from 'react'

interface NegotiationScriptCardProps {
  mandiP50: number;
  middlemanPrice: number;
  spread: number;
  spreadPct: number;
  verdict: 'fair' | 'caution' | 'exploit';
}

export function NegotiationScriptCard({
  mandiP50, middlemanPrice, spread, spreadPct, verdict
}: NegotiationScriptCardProps) {
  const [script, setScript] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function generateScript() {
    setLoading(true)
    try {
      const res = await fetch('/api/middleman/negotiation-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandiP50, middlemanPrice, spread, spreadPct, verdict }),
      })
      const data = await res.json()
      setScript(data.script)
    } finally {
      setLoading(false)
    }
  }

  // WhatsApp share
  function shareScript() {
    const encoded = encodeURIComponent(script || '')
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  return (
    <div className="border border-[#E3EDE7] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Negotiation Script</h3>
        {!script && (
          <button
            onClick={generateScript}
            disabled={loading}
            className="text-sm text-[#1A5C34] border border-[#3DAE72] rounded-lg px-3 py-1.5
                       hover:bg-[#EDF7F1] transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : '✨ Generate Script'}
          </button>
        )}
      </div>

      {script ? (
        <>
          <div className="bg-[#F4F7F5] rounded-lg p-4 text-sm leading-relaxed
                          font-[Noto_Sans_Devanagari] whitespace-pre-line">
            {script}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigator.clipboard.writeText(script)}
              className="text-xs text-gray-500 border border-[#E3EDE7] rounded px-3 py-1.5
                         hover:bg-gray-50"
            >
              📋 Copy
            </button>
            <button
              onClick={shareScript}
              className="text-xs text-[#25D366] border border-[#25D366] rounded px-3 py-1.5
                         hover:bg-[#ECF8F1]"
            >
              📤 Share on WhatsApp
            </button>
            <button
              onClick={() => setScript(null)}
              className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
            >
              Regenerate
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">
          Generate a Hindi negotiation script to use when talking to your middleman.
        </p>
      )}
    </div>
  )
}

// API ROUTE: /api/middleman/negotiation-script
// POST handler (server-side, calls Anthropic API):
// System prompt: "You are a poultry farmer negotiation coach. Generate a short, 
//   natural Hindi script (4-6 sentences) that a farmer can use to negotiate 
//   a better price from their middleman. Use market data provided. 
//   Be conversational, not aggressive. Sound like a real farmer talking."
// User message: includes mandiP50, middlemanPrice, spread, verdict
// Model: claude-sonnet-4-20250514
// Max tokens: 300
// Response: plain Hindi text (no markdown)
```

**QA Checks:**
- [ ] "Generate Script" button calls API and shows loading state
- [ ] Script renders in Noto Sans Devanagari font
- [ ] "Copy" button copies to clipboard
- [ ] "Share on WhatsApp" opens WhatsApp with pre-filled text
- [ ] "Regenerate" clears script and shows button again
- [ ] API errors handled gracefully (show "Could not generate script, try again")
- [ ] Script is different each time (not cached/static)

---

## T-CALC: CALCULATOR IMPROVEMENTS

---

### TASK T-CALC-001 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/calculator/components/FarmDataLoader.tsx`
**Purpose:** "Load from Farm" dropdown that auto-fills all calculator parameters from live farm data.

```typescript
'use client'
import useSWR from 'swr'

interface FarmDataLoaderProps {
  onLoad: (params: BatchCalculatorParams) => void;
}

interface BatchCalculatorParams {
  flockSize: number;
  ageInDays: number;
  avgWeightKg: number;
  feedCostPerKg: number;
  overheadCostPerBirdPerDay: number;
}

export function FarmDataLoader({ onLoad }: FarmDataLoaderProps) {
  const [selectedFarmId, setSelectedFarmId] = useState<string>('')

  const { data: farms } = useSWR('/api/farms?status=active', fetcher)

  const { data: farmData } = useSWR(
    selectedFarmId ? `/api/farms/${selectedFarmId}/calculator-data` : null,
    fetcher
  )

  // Auto-fill when farmData loads
  useEffect(() => {
    if (farmData) {
      onLoad({
        flockSize: farmData.birdsAlive,
        ageInDays: farmData.batchDayNumber,
        avgWeightKg: (farmData.avgWeightG || farmData.estimatedWeightG) / 1000,
        feedCostPerKg: farmData.avgFeedCostPerKg,
        overheadCostPerBirdPerDay: 0.5,  // default
      })
    }
  }, [farmData])

  return (
    <div className="flex items-center gap-3 mb-6 p-4 bg-[#EDF7F1] rounded-xl">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Load from Farm:
      </span>
      <select
        value={selectedFarmId}
        onChange={e => setSelectedFarmId(e.target.value)}
        className="flex-1 text-sm border border-[#CBD5CE] rounded-lg px-3 py-2
                   bg-white focus:outline-none focus:border-[#1A5C34]"
      >
        <option value="">Manual entry</option>
        {farms?.map(farm => (
          <option key={farm.id} value={farm.id}>
            {farm.name} — Batch #{farm.currentBatchNumber} · Day {farm.batchDayNumber}
          </option>
        ))}
      </select>
      {selectedFarmId && farmData && (
        <span className="text-xs text-green-600 whitespace-nowrap">
          ✓ Data loaded
        </span>
      )}
    </div>
  )
}

// API ROUTE: GET /api/farms/[farmId]/calculator-data
// Returns: { birdsAlive, batchDayNumber, avgWeightG, estimatedWeightG, avgFeedCostPerKg }
// avgFeedCostPerKg: computed from feed purchase log (total cost / total kg bought this batch)
// estimatedWeightG: if no weight logged, use breed growth curve for current day
```

**QA Checks:**
- [ ] Dropdown shows only active farms belonging to logged-in user
- [ ] Selecting a farm auto-fills all calculator fields
- [ ] Manual entry option (empty value) clears auto-fill, allows manual input
- [ ] "✓ Data loaded" badge shows after successful auto-fill
- [ ] If farm has no active batch, it doesn't appear in dropdown
- [ ] Calculator results update immediately after farm data loaded

---

### TASK T-CALC-002 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/calculator/components/HarvestWindowVisualizer.tsx`
**Purpose:** Visual harvest window timeline showing TODAY through +14D with colour-coded recommendation zones.

```typescript
'use client'

interface HarvestWindowVisualizerProps {
  scenarios: Array<{
    label: string;          // "TODAY" | "+3D" | "+7D" | "+14D"
    daysFromNow: number;
    price: number;          // P50 price
    netProfit: number;
    roiPct: number;
    recommendation: 'sell_now' | 'acceptable' | 'caution' | 'avoid';
  }>;
  optimalLabel: string;     // e.g., "TODAY"
}

// COLOUR BY RECOMMENDATION:
const recColours = {
  sell_now:   { bg: '#DCFCE7', border: '#16A34A', text: '#15803D', label: 'SELL NOW ⭐' },
  acceptable: { bg: '#FEF9C3', border: '#CA8A04', text: '#92400E', label: 'Acceptable' },
  caution:    { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', label: 'Risky' },
  avoid:      { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280', label: 'Avoid' },
}

export function HarvestWindowVisualizer({ scenarios, optimalLabel }: HarvestWindowVisualizerProps) {
  return (
    <div className="border border-[#E3EDE7] rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-1">🌟 Optimal Harvest Window</h3>
      <p className="text-xs text-gray-500 mb-4">
        Based on price forecast + mortality risk + feed cost accumulation
      </p>

      {/* Visual bar chart representation */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${scenarios.length}, 1fr)` }}>
        {scenarios.map(s => {
          const colours = recColours[s.recommendation]
          const isOptimal = s.label === optimalLabel
          return (
            <div key={s.label}
                 className="rounded-xl border-2 p-3 text-center transition-transform"
                 style={{ backgroundColor: colours.bg, borderColor: colours.border }}
            >
              <p className="text-xs font-bold" style={{ color: colours.text }}>
                {s.label}
                {isOptimal && <span className="ml-1">⭐</span>}
              </p>
              <p className="text-xs mt-1" style={{ color: colours.text }}>{colours.label}</p>
              <div className="mt-2 pt-2 border-t" style={{ borderColor: colours.border + '40' }}>
                <p className="text-xs text-gray-600">₹{s.price}/kg</p>
                <p className="text-xs font-semibold" style={{ color: colours.text }}>
                  ₹{(s.netProfit / 100000).toFixed(1)}L profit
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Context lines below */}
      <div className="mt-4 space-y-1.5">
        <p className="text-xs text-gray-500">
          📈 Price forecast: {/* derive from scenarios */}
          {scenarios[0].price === scenarios[scenarios.length-1].price
            ? 'Stable this week'
            : scenarios[scenarios.length-1].price > scenarios[0].price
            ? 'Rising trend'
            : 'Declining trend — sell sooner is better'}
        </p>
        <p className="text-xs text-gray-500">
          💸 Feed cost accumulates: ₹{/* calculate from props */}/day you hold
        </p>
      </div>
    </div>
  )
}
```

**QA Checks:**
- [ ] Shows correct number of scenario columns (TODAY through +14D or subset)
- [ ] Optimal scenario has star badge
- [ ] Colours match recommendation levels
- [ ] Profit shown in Lakhs (₹1.5L format) for readability
- [ ] Context lines below summarise key decision factors
- [ ] Renders correctly on mobile (horizontal scroll if needed)

---

## T-SET: SETTINGS IMPROVEMENTS

---

### TASK T-SET-001
**Priority:** P1
**File:** `apps/web/app/dashboard/settings/integrations/page.tsx`
**Purpose:** New Integrations tab in Settings showing WhatsApp, Email, and Webhook connections.

```typescript
// NEW PAGE — /dashboard/settings/integrations

// THREE INTEGRATION CARDS:

// 1. WHATSAPP BUSINESS CARD
<IntegrationCard
  icon={<WhatsAppIcon size={24} color="#25D366" />}
  name="WhatsApp Business"
  description="Automated daily log collection and alerts via WhatsApp"
  status={waConnected ? 'connected' : 'disconnected'}
  statusDetails={waConnected ? `Sending to ${farmCount} farms · Last sent ${lastSent}` : undefined}
  actions={[
    { label: 'Manage', href: '/dashboard/settings/notifications#whatsapp' },
    { label: 'Disconnect', onClick: disconnectWA, variant: 'danger' },
  ]}
/>

// 2. EMAIL CARD
<IntegrationCard
  icon={<EmailIcon size={24} color="#2563EB" />}
  name="Email"
  description="Daily summaries and alert notifications via email"
  status={emailVerified ? 'connected' : 'disconnected'}
  statusDetails={emailVerified ? userEmail : 'No email configured'}
  actions={[
    { label: emailVerified ? 'Change Email' : 'Add Email', onClick: openEmailModal },
    { label: 'Manage Frequency', href: '/dashboard/settings/notifications#email' },
  ]}
/>

// 3. WEBHOOK CARD (PULSE_INTEL ONLY)
<IntegrationCard
  icon={<LinkIcon size={24} color="#7C3AED" />}
  name="Webhook"
  description="Receive real-time price and alert events via HTTP webhook"
  status={webhookConfigured ? 'connected' : 'disabled'}
  statusDetails={webhookConfigured ? webhookUrl : undefined}
  locked={userPlan !== 'PULSE_INTEL'}
  lockedMessage="Upgrade to PULSE_INTEL to access webhook integration"
  actions={[
    { label: webhookConfigured ? 'Edit Endpoint' : 'Configure', onClick: openWebhookModal },
    { label: 'Test Webhook', onClick: testWebhook, disabled: !webhookConfigured },
  ]}
/>

// IntegrationCard component:
interface IntegrationCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'disabled';
  statusDetails?: string;
  actions: Array<{ label: string; href?: string; onClick?: () => void; variant?: 'default'|'danger'; disabled?: boolean }>;
  locked?: boolean;
  lockedMessage?: string;
}

// Status indicator colours:
// connected → green dot + "Connected"
// disconnected → grey dot + "Not connected"
// disabled → grey (entire card slightly muted if locked)
```

**QA Checks:**
- [ ] WhatsApp card shows correct farm count and last sent time
- [ ] Email card shows verified email address
- [ ] Webhook card locked for non-PULSE_INTEL users (greyed out with upgrade message)
- [ ] Disconnect WhatsApp shows confirmation dialog
- [ ] Test Webhook button sends a test event and shows success/failure toast
- [ ] All actions (buttons/links) correctly navigate or trigger modals

---

## T-WIZARD: FARM ADD WIZARD IMPROVEMENTS

---

### TASK T-WIZARD-001 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/app/dashboard/farms/new/components/Step1FarmInfo.tsx`
**Purpose:** Add GPS auto-detect nearest mandi feature and farm photo upload to Step 1.

```typescript
// ADDITION TO EXISTING STEP 1:

// GPS AUTO-DETECT NEAREST MANDI (add after GPS coordinate fields):
const [nearestMandi, setNearestMandi] = useState<{name: string; distanceKm: number} | null>(null)

async function onGPSDetected(lat: number, lng: number) {
  setFormValue('gps_lat', lat)
  setFormValue('gps_lng', lng)

  // Find nearest mandi from our covered list
  const res = await fetch(`/api/mandis/nearest?lat=${lat}&lng=${lng}`)
  const data = await res.json()
  setNearestMandi(data)  // { name: 'Gorakhpur', distanceKm: 12 }
}

// Render the nearest mandi suggestion after GPS is detected:
{nearestMandi && (
  <div className="mt-3 p-3 bg-[#EDF7F1] rounded-lg border border-[#3DAE72] flex items-center justify-between">
    <p className="text-sm">
      Nearest mandi: <strong>{nearestMandi.name}</strong> ({nearestMandi.distanceKm} km)
    </p>
    <button
      type="button"
      onClick={() => setFormValue('primary_mandi', nearestMandi.name)}
      className="text-sm text-[#1A5C34] font-semibold hover:underline"
    >
      Use {nearestMandi.name} ✓
    </button>
  </div>
)}

// FARM PHOTO UPLOAD (add at bottom of Step 1, optional):
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Farm Photo <span className="text-gray-400 font-normal">(optional)</span>
  </label>
  <div
    className="border-2 border-dashed border-[#CBD5CE] rounded-xl p-6 text-center
               hover:border-[#3DAE72] transition-colors cursor-pointer"
    onClick={() => fileInputRef.current?.click()}
  >
    {photoPreview ? (
      <img src={photoPreview} alt="Farm" className="w-full max-h-40 object-cover rounded-lg" />
    ) : (
      <p className="text-gray-400 text-sm">Click to upload a photo of your farm</p>
    )}
  </div>
  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
         onChange={e => handlePhotoUpload(e.target.files?.[0])} />
  <p className="text-xs text-gray-400 mt-1">Max 5MB · JPEG, PNG, or WebP</p>
</div>

// Photo upload: POST /api/farms/upload-photo → returns photo_url
// Stored in Supabase Storage bucket 'farm-photos' with path: {integrator_id}/{farmId}.jpg
```

**QA Checks:**
- [ ] "Use My Location" button triggers browser geolocation permission
- [ ] After GPS detected, nearest mandi suggestion appears within 1 second
- [ ] Clicking "Use [Mandi]" sets primary_mandi field value
- [ ] Photo upload drag-and-drop works (in addition to click)
- [ ] Photo preview shows after upload
- [ ] Files > 5MB: show "File too large, max 5MB" error
- [ ] Non-image files: show "Please select an image file" error
- [ ] Wizard proceeds to Step 2 with or without photo (optional field)

---

### TASK T-WIZARD-002 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/farms/new/components/Step3FirstBatch.tsx`
**Purpose:** Add breed growth chart preview and inline WhatsApp daily log setup in Step 3.

```typescript
// BREED GROWTH CHART PREVIEW (add after breed selector):
const breedGrowthData = {
  'Ross 308':  [0,45,125,250,400,600,850,1100,1350,1600,1850,2100],  // grams by day (every 4th day)
  'Cobb 430':  [0,42,120,245,395,590,840,1095,1345,1590,1840,2090],
  'Hubbard':   [0,40,115,235,380,570,820,1070,1320,1570,1820,2070],
  'Vencobb':   [0,48,130,260,415,620,870,1120,1370,1620,1870,2120],
}

{selectedBreed && breedGrowthData[selectedBreed] && (
  <div className="mt-4 p-4 bg-[#F4F7F5] rounded-xl">
    <p className="text-xs font-semibold text-gray-500 mb-2">
      {selectedBreed} — Standard Growth Curve
    </p>
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={breedGrowthData[selectedBreed].map((w, i) => ({ day: i*4, weight: w }))}>
        <Line type="monotone" dataKey="weight" stroke="#1A5C34" strokeWidth={2} dot={false} />
        <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={36}
               tickFormatter={v => `${v}g`} />
        <Tooltip formatter={v => [`${v}g`, 'Target weight']} />
      </LineChart>
    </ResponsiveContainer>
    <p className="text-xs text-gray-500 mt-1">
      Target harvest: {breedGrowthData[selectedBreed][10]}g at Day ~{40} ({selectedBreed} standard)
    </p>
  </div>
)}

// WHATSAPP DAILY LOG SETUP IN STEP 3:
<div className="mt-6 border border-[#E3EDE7] rounded-xl p-5">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-8 h-8 rounded-lg bg-[#ECF8F1] flex items-center justify-center">
      <WhatsAppIcon size={18} color="#25D366" />
    </div>
    <div>
      <h3 className="font-semibold text-sm">WhatsApp Daily Log</h3>
      <p className="text-xs text-gray-500">Automate data collection — farmer replies via WhatsApp</p>
    </div>
  </div>

  <div className="flex gap-3 mb-4">
    <button type="button"
            onClick={() => setWaSetup('yes')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
              ${waSetup === 'yes'
                ? 'bg-[#EDF7F1] border-[#3DAE72] text-[#1A5C34]'
                : 'border-[#E3EDE7] text-gray-600 hover:bg-gray-50'}`}>
      ✓ Yes, set up WhatsApp log
    </button>
    <button type="button"
            onClick={() => setWaSetup('no')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
              ${waSetup === 'no'
                ? 'bg-gray-100 border-gray-300 text-gray-700'
                : 'border-[#E3EDE7] text-gray-600 hover:bg-gray-50'}`}>
      Enter logs manually
    </button>
  </div>

  {waSetup === 'yes' && (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Farmer's WhatsApp Number
        </label>
        <div className="flex gap-2">
          <span className="px-3 py-2 bg-[#F4F7F5] border border-[#CBD5CE] rounded-lg text-sm text-gray-500">
            +91
          </span>
          <input type="tel" placeholder="9876543210" maxLength={10}
                 className="flex-1 px-3 py-2 border border-[#CBD5CE] rounded-lg text-sm
                            focus:outline-none focus:border-[#1A5C34]"
                 {...register('whatsapp_number')} />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Reminder Time</label>
          <select className="w-full px-3 py-2 border border-[#CBD5CE] rounded-lg text-sm
                             focus:outline-none focus:border-[#1A5C34]"
                  {...register('whatsapp_reminder_hour')}>
            <option value={17}>5:00 PM</option>
            <option value={18}>6:00 PM (Recommended)</option>
            <option value={19}>7:00 PM</option>
            <option value={20}>8:00 PM</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
          <select className="w-full px-3 py-2 border border-[#CBD5CE] rounded-lg text-sm
                             focus:outline-none focus:border-[#1A5C34]"
                  {...register('whatsapp_language')}>
            <option value="hindi">हिंदी (Hindi)</option>
            <option value="english">English</option>
          </select>
        </div>
      </div>
    </div>
  )}
</div>
```

**QA Checks:**
- [ ] Breed selector shows all 4 common breeds + custom option
- [ ] Selecting a breed shows growth chart within 200ms (no API call needed — hardcoded data)
- [ ] Growth chart target weight and harvest day are correct per breed
- [ ] "Yes, set up WhatsApp" shows phone + time + language fields
- [ ] "Enter logs manually" hides WhatsApp fields
- [ ] Wizard submits WhatsApp settings along with farm data on Step 4 save
- [ ] WhatsApp number field: 10-digit India mobile validation
- [ ] Step 4 review shows WhatsApp status: "✓ WhatsApp set up" or "○ Not set up"

---

## T-INFRA: REMAINING INFRASTRUCTURE TASKS

---

### TASK T-INFRA-003
**Priority:** P1
**File:** `apps/web/lib/i18n.ts` + `public/locales/hi/common.json` + `public/locales/en/common.json`
**Purpose:** Implement next-i18next for Hindi/English bilingual support across all pages.

```typescript
// next-i18next configuration:
// next-i18next.config.js:
module.exports = {
  i18n: {
    defaultLocale: 'hi',
    locales: ['hi', 'en'],
  },
  defaultNS: 'common',
  localePath: './public/locales',
}

// TRANSLATION KEY STRUCTURE (common.json):
// Keep both files in sync. Example:

// public/locales/hi/common.json:
{
  "nav": {
    "overview": "अवलोकन",
    "price_intelligence": "मूल्य जानकारी",
    "district_map": "जिला नक्शा",
    "alerts": "अलर्ट",
    "my_farms": "मेरे Farms",
    "feed_intelligence": "चारा जानकारी",
    "settings": "सेटिंग्स"
  },
  "dashboard": {
    "todays_price": "आज का भाव",
    "sell_signal": "बेचें कब?",
    "sell_now": "आज बेचें ✓",
    "hold": "रुकें",
    "caution": "सावधान",
    "model_accuracy": "मॉडल सटीकता",
    "data_stale": "डेटा पुराना है"
  },
  "farms": {
    "log_pending": "आज का लॉग बाकी है",
    "log_submitted": "लॉग जमा हो गया",
    "no_farms": "अभी तक कोई Farm नहीं जोड़ा",
    "add_farm": "Farm जोड़ें"
  },
  "errors": {
    "load_failed": "डेटा लोड नहीं हो सका। कृपया Refresh करें।",
    "save_failed": "सुरक्षित नहीं हो सका। फिर से कोशिश करें।",
    "network_offline": "इंटरनेट कनेक्शन नहीं है।"
  }
}

// public/locales/en/common.json:
{
  "nav": {
    "overview": "Overview",
    "price_intelligence": "Price Intelligence",
    "district_map": "District Map",
    "alerts": "Alerts",
    "my_farms": "My Farms",
    "feed_intelligence": "Feed Intelligence",
    "settings": "Settings"
  },
  "dashboard": {
    "todays_price": "Today's Price",
    "sell_signal": "Sell Signal",
    "sell_now": "Sell Today ✓",
    "hold": "Hold",
    "caution": "Caution",
    "model_accuracy": "Model Accuracy",
    "data_stale": "Data is stale"
  },
  "farms": {
    "log_pending": "Today's log pending",
    "log_submitted": "Log submitted",
    "no_farms": "No farms added yet",
    "add_farm": "Add Farm"
  },
  "errors": {
    "load_failed": "Could not load data. Please refresh.",
    "save_failed": "Could not save. Please try again.",
    "network_offline": "No internet connection."
  }
}

// USAGE IN COMPONENTS:
// import { useTranslation } from 'next-i18next'
// const { t } = useTranslation('common')
// <p>{t('nav.overview')}</p>

// SERVER SIDE:
// export const getStaticProps = async ({ locale }) => ({
//   props: { ...(await serverSideTranslations(locale, ['common'])) },
// })
```

**QA Checks:**
- [ ] Language toggle in Settings switches all UI text without page reload
- [ ] Default language is Hindi (hi) for new users
- [ ] Language preference saved to DB, persists across sessions
- [ ] All nav items translated correctly
- [ ] Error messages translated correctly
- [ ] Hindi font (Noto Sans Devanagari) loads for 'hi' locale
- [ ] English font (Plus Jakarta Sans) loads for 'en' locale
- [ ] No untranslated key strings visible in UI (no "nav.overview" showing raw)

---

### TASK T-INFRA-004
**Priority:** P0
**File:** `apps/web/components/shared/ChartEmptyState.tsx` + `ChartSkeleton.tsx` + `PageSkeleton.tsx`
**Purpose:** Shared skeleton and empty state components. Enforce "never blank" rule across all pages.

```typescript
// ChartSkeleton — for any chart that is loading:
export function ChartSkeleton({ height = 280, className = '' }: { height?: number; className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#F4F7F5] ${className}`}
      style={{ height }}
      role="status"
      aria-label="Loading chart..."
    >
      {/* Decorative skeleton bars to suggest a bar chart */}
      <div className="flex items-end gap-2 p-6 h-full opacity-30">
        {[60, 80, 45, 90, 70, 55, 85, 65, 75, 50, 88, 72].map((h, i) => (
          <div key={i} className="flex-1 bg-[#D4EFDE] rounded-t"
               style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

// ChartEmptyState — when API returns no data:
export function ChartEmptyState({
  message = 'No data available',
  messageHindi = 'डेटा उपलब्ध नहीं है',
  hint,
}: {
  message?: string;
  messageHindi?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#E3EDE7]
                    bg-[#F4F7F5] py-12 text-center">
      <svg width="48" height="48" viewBox="0 0 48 48" className="mb-3 opacity-30">
        <path d="M8 40 L8 20 M16 40 L16 28 M24 40 L24 16 M32 40 L32 24 M40 40 L40 12"
              stroke="#1A5C34" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-medium text-gray-500">{messageHindi}</p>
      <p className="text-xs text-gray-400">{message}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// KPISkeleton — for KPI strip cards:
export function KPISkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[#E3EDE7] bg-white p-5">
      <div className="h-3 w-24 bg-[#F4F7F5] rounded mb-3" />
      <div className="h-8 w-20 bg-[#F4F7F5] rounded mb-2" />
      <div className="h-2 w-16 bg-[#F4F7F5] rounded" />
    </div>
  )
}

// TableSkeleton — for data tables:
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-[#E3EDE7]">
          <div className="h-3 w-24 bg-[#F4F7F5] rounded" />
          <div className="h-3 w-16 bg-[#F4F7F5] rounded" />
          <div className="h-3 w-20 bg-[#F4F7F5] rounded" />
          <div className="h-3 w-12 bg-[#F4F7F5] rounded" />
        </div>
      ))}
    </div>
  )
}

// USAGE PATTERN (mandatory for all data-dependent components):
//
// const { data, isLoading, error } = useSWR('/api/...')
//
// if (isLoading) return <ChartSkeleton height={280} />
// if (error) return <ChartEmptyState message="Could not load data"
//                                    hint="Refresh the page or try again later" />
// if (!data || data.length === 0) return <ChartEmptyState message="No data yet" />
// return <ActualChart data={data} />
```

**QA Checks:**
- [ ] ChartSkeleton has animate-pulse animation
- [ ] ChartSkeleton aria-label set for accessibility
- [ ] ChartEmptyState shows both Hindi and English text
- [ ] All chart components in codebase use these skeletons (grep for useSWR to find them all)
- [ ] No component renders a plain white rectangle when loading
- [ ] Skeletons match approximate dimensions of loaded content (no layout shift)

---

## FINAL REVIEW: COMPLETE PAGE INVENTORY

The following pages must be tested end-to-end before launch:

```
AUTHENTICATION:
  ☐ /login — Phone OTP or email login
  ☐ /signup — New registration
  ☐ /forgot-password

MAIN DASHBOARD:
  ☐ /dashboard — Overview with price hero, KPIs, chart, alerts, mandi table
  ☐ /dashboard/price — Price Intelligence (Forecast / Historical / Download tabs)
  ☐ /dashboard/map — District Choropleth Map (fixed from all-red bug)
  ☐ /dashboard/alerts — Alerts page (Active / History / Settings tabs)
  ☐ /dashboard/feed — Feed Intelligence with expandable commodity rows
  ☐ /dashboard/middleman — Middleman Check with spread history
  ☐ /dashboard/calculator — Batch ROI Optimizer + Profit Calculator

FARM MANAGEMENT:
  ☐ /dashboard/farms — Portfolio with KPI bar and farm card grid
  ☐ /dashboard/farms/new — 4-step add farm wizard
  ☐ /dashboard/farms/[id] — Farm detail (6 tabs including new WhatsApp tab)
  ☐ /dashboard/batch-board — Kanban batch status board
  ☐ /dashboard/farms/compare — Cross-farm performance comparison

ANALYTICS:
  ☐ /dashboard/metrics — Portfolio metrics (all charts must show real data)
  ☐ /dashboard/reports — Batch reports and downloads

SETTINGS:
  ☐ /dashboard/settings/profile — Profile + language + currency
  ☐ /dashboard/settings/notifications — Redesigned category cards
  ☐ /dashboard/settings/team — Team member management
  ☐ /dashboard/settings/billing — Plan upgrade + payment
  ☐ /dashboard/settings/integrations — WhatsApp + Email + Webhook

WHATSAPP AUTOMATION:
  ☐ Webhook endpoint functional (receives + parses farmer replies)
  ☐ Daily reminder cron job running at configured times
  ☐ Confirmation messages sent within 90 seconds of reply
  ☐ Dashboard shows WhatsApp source on daily log entries
```

---

*End of FlockIQ Updated Engineering Tasks v2.0 — Complete*
