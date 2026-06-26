# FlockIQ — Updated UI/UX Design Master (v2.0)
# Supersedes: 04_postlogin_design_master.md + 14_integrator_farms_design_master.md
# Version: v2.0 | June 2026 | CONFIDENTIAL
# Strategic Pivot: Poultry Management Platform (Global + Pan-India)
# Brand: FlockIQ (formerly PoultryPulse AI)

---

## STRATEGIC CONTEXT FOR DESIGNERS & ENGINEERS

```
PIVOT SUMMARY:
  OLD FOCUS: Price intelligence / forecasting tool for Indian farmers
  NEW FOCUS: Full poultry management platform (global) with price intelligence as one module
  
  TARGET MARKETS:
    Primary: India (Hindi + English bilingual), Southeast Asia (Indonesia, Vietnam, Thailand),
             Middle East (Arabic RTL support planned v3), Sub-Saharan Africa (English)
    Secondary: Eastern Europe, Latin America (Spanish planned v3)
  
  NEW POSITIONING:
    "The operating system for commercial poultry farms"
    Competing with: PoultryPlan OptiLink, Poultry.care Broiler Management,
                    PigCHAMP Poultry, Hendrix Genetics flock tools
    Differentiator: AI-native, mobile-first, WhatsApp-integrated daily log automation,
                    price intelligence embedded (not bolted on)

  BRAND RENAME: PoultryPulse AI → FlockIQ
    Primary colour: #1A5C34 (darker forest green — premium, global)
    Accent: #3DAE72 (fresh mid-green for interactive elements)
    Secondary accent: #E8611A (saffron/orange for alerts and signals)
    Neutral: #F4F7F5 (page background), #FFFFFF (cards)
    Dark: #0D1F16 (sidebar)

  WHATSAPP DAILY LOG AUTOMATION (New Flagship Feature):
    Platform sends daily WhatsApp reminder at configurable time (default 6 PM)
    Farmer replies to WhatsApp with structured data (birds dead, weight, feed kg)
    System parses reply and auto-fills that day's farm log
    Integration person NO LONGER needs to manually collect data from farmer
    This is the biggest operational pain-point removal in the product

  REFERENCE PRODUCTS STUDIED:
    - https://www.poultry.care/broiler-management (daily log, batch close, health events)
    - https://www.poultryplan.com/solutions/optibroilers (FCR benchmarking, growth curves,
      flock analysis, harvest decision support)
```

---

## 1. UPDATED DESIGN SYSTEM

### 1.1 Brand & Colour Tokens (v2 — FlockIQ)

```typescript
export const FlockIQTokens = {
  // Primary brand
  brand700:       '#1A5C34',  // Primary CTA, sidebar, active states
  brand600:       '#1F7040',  // Button hover
  brand500:       '#25874D',  // Link text, icons on white
  brand400:       '#3DAE72',  // Interactive accent, progress bars
  brand100:       '#D4EFDE',  // Subtle tint backgrounds
  brand50:        '#EDF7F1',  // Page section backgrounds

  // Signal colours
  signalSell:     '#16A34A',  // SELL NOW
  signalHold:     '#D97706',  // HOLD
  signalCaution:  '#DC2626',  // AVOID / CAUTION
  signalInfo:     '#2563EB',  // Informational

  // Batch/flock health (industry standard colour coding)
  fcrExcellent:   '#16A34A',  // FCR < 1.70
  fcrGood:        '#65A30D',  // FCR 1.70–1.90
  fcrWatch:       '#D97706',  // FCR 1.90–2.10
  fcrAlert:       '#DC2626',  // FCR > 2.10

  mortalityOk:    '#16A34A',  // < 2.5% cumulative
  mortalityWatch: '#D97706',  // 2.5–4%
  mortalityAlert: '#DC2626',  // > 4%

  weightOnTrack:  '#1A5C34',  // Within ±5% standard growth curve
  weightBehind:   '#D97706',  // > 5% below target
  weightAhead:    '#2563EB',  // > 5% above target

  // UI surface
  sidebarBg:      '#0D1F16',  // Near-black green sidebar
  sidebarText:    '#9BBDA8',  // Muted text in sidebar
  sidebarActive:  '#FFFFFF',  // Active nav item
  sidebarHover:   'rgba(255,255,255,0.07)',
  sidebarBorder:  'rgba(255,255,255,0.08)',
  contentBg:      '#F4F7F5',  // Page background
  cardBg:         '#FFFFFF',
  cardBorder:     '#E3EDE7',
  cardShadow:     '0 1px 4px rgba(0,0,0,0.06)',
  cardShadowHover:'0 4px 20px rgba(0,0,0,0.10)',
  divider:        '#E3EDE7',
  inputBorder:    '#CBD5CE',
  inputFocus:     '#1A5C34',
  tableStriped:   '#F8FBF9',
  tableHover:     '#EDF7F1',

  // Alert/status colours
  alertYellow:    '#FEF9C3',  // Warning background
  alertRed:       '#FEE2E2',  // Error/critical background
  alertGreen:     '#DCFCE7',  // Success background
  alertBlue:      '#DBEAFE',  // Info background

  // WhatsApp brand (for integration UI)
  whatsappGreen:  '#25D366',
  whatsappBg:     '#ECF8F1',
} as const;
```

### 1.2 Typography Scale

```typescript
export const FlockIQTypography = {
  // Display — hero metrics, price numbers
  displayXL: {
    fontFamily: "'Sora', system-ui",
    fontSize: '2.5rem',    // 40px
    fontWeight: 800,
    lineHeight: 1.0,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.03em',
  },
  displayLG: {
    fontFamily: "'Sora', system-ui",
    fontSize: '2rem',      // 32px
    fontWeight: 700,
    lineHeight: 1.0,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
  },
  displayMD: {
    fontFamily: "'Sora', system-ui",
    fontSize: '1.5rem',    // 24px
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },

  // Headings
  h1: { fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.015em' },
  h2: { fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.3 },
  h3: { fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.35 },

  // Body
  bodyLG: { fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '0.9375rem', fontWeight: 400, lineHeight: 1.6 },
  bodyMD: { fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
  bodySM: { fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.5 },
  label:  { fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.02em' },

  // Hindi UI (bilingual)
  hindiBody: { fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.7 },
  hindiLabel:{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.5 },

  // Monospace
  mono: { fontFamily: "'Geist Mono', 'JetBrains Mono', monospace", fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.5 },
} as const;
```

### 1.3 Layout Grid

```
Sidebar:          240px (fixed, collapsible to 64px icon rail on tablet)
Top header:       60px
Content max-w:    1440px
Content padding:  24px desktop | 16px tablet | 12px mobile
Card grid:        CSS Grid, gap-4 (16px)
Section spacing:  32px between major sections
Card radius:      12px
Button radius:    8px (standard) | 999px (pill — CTAs only)
```

### 1.4 Chart Standards (Recharts)

```typescript
export const ChartConfig = {
  // Growth curve benchmarks (industry standard — Ross 308, Cobb 430 etc)
  targetLine:     { stroke: '#9CA3AF', strokeWidth: 1.5, strokeDasharray: '6 3' },
  industryAvg:    { stroke: '#C4B5FD', strokeWidth: 1.5, strokeDasharray: '4 2' },
  actualLine:     { stroke: '#1A5C34', strokeWidth: 2.5, dot: { r: 3 } },
  warningZone:    { fill: '#FEF9C3', fillOpacity: 0.4 },
  criticalZone:   { fill: '#FEE2E2', fillOpacity: 0.4 },

  // Price forecast bands
  p50:  { stroke: '#1A5C34', strokeWidth: 2.5 },
  p10:  { stroke: '#7CC49A', strokeWidth: 1, strokeDasharray: '4 4' },
  p90:  { stroke: '#0F4A28', strokeWidth: 1, strokeDasharray: '4 4' },
  actual: { stroke: '#E8611A', strokeWidth: 2 },

  // Standard tooltip style
  tooltip: {
    contentStyle: {
      background: '#FFFFFF',
      border: '1px solid #E3EDE7',
      borderRadius: '10px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontSize: '13px',
    },
  },
} as const;
```

---

## 2. GLOBAL NAVIGATION STRUCTURE

### 2.1 Left Sidebar (All Authenticated Users)

```
SIDEBAR STRUCTURE (240px, collapsible)
Background: #0D1F16

┌─ LOGO BLOCK (64px) ────────────────────────┐
│  FlockIQ logo (SVG, white, 130px wide)      │
│  "Beta" badge (amber pill)                  │
└─────────────────────────────────────────────┘

┌─ USER BLOCK ───────────────────────────────┐
│  [Avatar: initials, brand400 bg]            │
│  User Name (white, 14px semibold)           │
│  Plan badge: PULSE_PRO / PULSE_INTEL        │
│  [⚠ Trial expires in N days — Renew →]     │  ← amber banner if <30 days
└─────────────────────────────────────────────┘

NAV SECTIONS:

── INTELLIGENCE ────────────────────────────
  📊 Overview              /dashboard
  📈 Price Intelligence    /dashboard/price
  🗺  District Map          /dashboard/map
  🔔 Alerts                /dashboard/alerts

── FARM OPERATIONS ─────────────────────────  [S1 Farm / S2 Integrator only]
  🏠 My Farms              /dashboard/farms          [badge: N active]
     ↳ All Farms
     ↳ + Add Farm
     ↳ Compare (if ≥2)
  📋 Batch Status Board    /dashboard/batch-board
  🧬 Feed Intelligence     /dashboard/feed
  🔍 Middleman Check       /dashboard/middleman

── ANALYTICS ───────────────────────────────  [S2+ only]
  📊 Portfolio Metrics     /dashboard/metrics
  📄 Reports               /dashboard/reports
  🧮 Calculator            /dashboard/calculator

── ENTERPRISE ──────────────────────────────  [S5 Enterprise / Admin only]
  🔑 API Access            /dashboard/api
  ✅ Model Accuracy         /dashboard/accuracy
  👥 Customers             /dashboard/customers

── BOTTOM ──────────────────────────────────
  ⚙️  Settings             /dashboard/settings
  💬 WhatsApp Support      (opens new tab)
  🚪 Logout

──────────────────────────────────────────────
IMPROVEMENTS VS CURRENT:
- Add section headers (INTELLIGENCE / FARM OPERATIONS / ANALYTICS) with muted label
  This groups nav items logically instead of a flat list
- Add "Integrations" tab → shows WhatsApp status, webhook config
- Sidebar collapses to 64px icon-only rail on 1024–1280px viewports
  (hover shows tooltip with label, click expands)
- Keyboard accessible: Tab + Enter navigates all items
- Add subtle green glow on active item left border (3px brand400)
```

### 2.2 Top Header Bar (Improved)

```
HEIGHT: 60px | BACKGROUND: white | BORDER-BOTTOM: 1px #E3EDE7

LEFT:
  Breadcrumb navigation: "My Farms / Shivaji Poultry Farm / Feed"
  (replaces static page title — more context for nested pages)

CENTER:
  District filter pills (compact, scrollable on mobile):
  [All] [Gorakhpur ×] [Deoria ×] [Kushinagar ×]
  — clicking pill filters entire page data
  — 'x' removes district filter

RIGHT (L→R):
  [● 4.8% MAPE] accuracy pill (green if <6%, amber 6-9%, red >9%)
  [🔄] refresh icon (manual refresh, shows "2m ago" tooltip)
  [🔔 3] notification bell (badge count)
  [D ▾] user avatar dropdown
  [🛒] upgrade/cart icon (shows if trial or PULSE_FARM plan)

IMPROVEMENT NOTE:
  Currently the header shows flat district tags with no clear interaction model.
  New design: districts are interactive filter pills. Active district is highlighted.
  MAPE badge should show tooltip on hover: "Model accuracy (last 30 days): 4.8% MAPE
  — 150 predictions verified. Directional accuracy: 95.2%"
```

---

## 3. PAGE-BY-PAGE DESIGN SPECIFICATIONS

---

### PAGE 1: Overview / Dashboard (`/dashboard`)

**Current State (from screenshots):** Shows today's price, model accuracy widget, mandi benchmark, sell signal, middleman spread, active alerts, feed cost index, subscription info, district coverage map, mandi-wise prices table, and alert cards.

**Improvement Goals:**
- Add farm-level summary for S1/S2 users (not just price intelligence)
- Make it truly a "command centre" for both price intel AND farm ops
- WhatsApp integration status card (new)
- Daily log completion rate tracker (new)

```
LAYOUT: 12-column CSS Grid

─── ROW 1: HERO PRICE CARD + MODEL ACCURACY (spans full width) ────────────

CARD: "Today's Price" — Gorakhpur Mandi (primary mandi for logged-in user)
  ┌──────────────────────────────────────────────────────┐
  │  Gorakhpur · आज का भाव            [Mandi ▾]          │
  │  03:24 PM                                             │
  │                                                       │
  │  ₹168.00/kg                     MODEL ACCURACY       │
  │  ↑ 2.3% vs कल          │    MAPE: 4.8% ●             │
  │                         │    Direction: 95.2% ━━━━━   │
  │  ─── 80% confidence ─── │    150 predictions ✓        │
  │  ₹160 ━━━━━━━━━━━━ ₹176 │    v1.0 | Retrained: now   │
  └──────────────────────────────────────────────────────┘

  IMPROVEMENT: Add "Why today's price?" expandable section below price card
    Shows top 3 drivers in bullet form:
    • 📈 Maize price ↑5% this week (feed cost pressure)
    • 🌤 Heat wave expected D+3 (demand dip risk)
    • 🐔 Oversupply signal from Deoria mandi (-8% arrivals)

─── ROW 2: KPI STRIP (5 cards in scrollable row) ─────────────────────────

  [Mandi Benchmark] [Middleman Spread] [Active Alerts] [Feed Cost Index] [Subscription]
  EXACTLY as current but add:
  - Mandi Benchmark: clicking opens price history chart modal
  - Active Alerts: show category breakdown on hover (2 disease, 1 weather)
  - Feed Cost Index: show 7-day trend sparkline inside card

─── ROW 3: SELL SIGNAL + ALERT FEED (8-col / 4-col split) ────────────────

LEFT (8 cols): PRICE FORECAST CHART
  30-day chart: P10 / P50 / P90 bands + actual prices plotted
  Controls: [7D] [14D] [30D] [90D] time range pills
  Below chart: "आज बेचें ✓ — P50 = ₹168, Range ₹160–₹176"
  IMPROVEMENT: Add annotated markers on chart for:
    - Festival dates (Eid, Diwali etc) shown as vertical dashed lines
    - Disease alerts shown as red zone shading
    - Historical "SELL NOW" signals shown as green triangles

RIGHT (4 cols): ACTIVE ALERTS (scrollable list)
  Alert cards:
    [🔴] भाव में गिरावट की संभावना        ← red left border
    [🔵] सामान्य मौसम की स्थिति          ← blue
    [📄] बाज़ार अपडेट                     ← grey
  Each card: title + subtitle (2 lines max) + mandi + timestamp + [×] dismiss

─── ROW 4: DISTRICT MAP + MANDI TABLE (5-col / 7-col split) ──────────────

LEFT (5 cols): DISTRICT COVERAGE MAP
  Interactive Leaflet map, same as current
  IMPROVEMENT: Add cluster markers showing number of active farms per district
    on hover shows: "Gorakhpur: 12 farms, avg FCR 1.84, avg mortality 3.2%"

RIGHT (7 cols): MANDI-WISE PRICE TABLE
  Columns: Mandi | P50 (₹/kg) | P10-P90 Range | Signal | Change | Updated
  IMPROVEMENT:
  - Add sparkline column (7-day mini chart) per mandi
  - Signal column: coloured pill (आज बेचें / रुकें / सावधान)
  - Row click → navigates to that mandi's detail page
  - "Download CSV" moved to table header (not page header)

─── ROW 5 (S1/S2 USERS ONLY): FARM QUICK SUMMARY ────────────────────────
  NEW SECTION — shows for logged-in farmers/integrators

  Header: "आज के Farms" | "Today's Farm Status"
  SUBTITLE: "X farms · Y today's logs pending"

  GRID OF MINI FARM CARDS (horizontal scroll if >3):
  ┌─────────────────────┐
  │ Shivaji Farm        │  ● Active
  │ Batch #24 · Day 21  │
  │ FCR: 1.82  Mort: 0.4%│
  │ [⚠ Log pending today]│  ← amber if not yet submitted
  └─────────────────────┘

  "View All Farms →" link

─── ROW 6 (ADMIN ONLY): SYSTEM HEALTH ────────────────────────────────────
  4 mini tiles: API uptime | Data freshness | Model version | Active customers
```

---

### PAGE 2: Price Intelligence (`/dashboard/price`)

**Current State:** Forecast tab (empty), Historical tab (data table), Download tab.

**Improvement Goals:**
- Forecast tab should show rich chart, not be blank
- Add driver annotations on forecast
- Historical tab needs sparklines not just raw table
- Add confidence explainer

```
TAB 1: FORECAST
─────────────────────────────────────────────────────

FILTERS ROW:
  Mandi: [Gorakhpur ▾]  Range: [7D] [14D] [30D ●] [60D]  Compare: [+ Add Mandi]

MAIN FORECAST CHART (full-width, 380px height):
  - P10 / P50 / P90 bands (shaded area between P10–P90)
  - Actual price line (last 30 days)
  - Forecast line starts at "Today" vertical marker
  - Annotations: festival markers, HPAI zone markers
  - Tooltip on hover: date, P50, range, sell signal
  - Legend at bottom: ━ Actual  ╌╌ P50 Forecast  ▓ 80% Range

SELL SIGNAL CALLOUT CARD (below chart, right-aligned):
  ┌─────────────────────────────────┐
  │  📅 Optimal Sell Window         │
  │  Jun 3–Jun 6 (D+2 to D+5)      │
  │  Expected P50: ₹172–₹176/kg    │
  │  Confidence: High ●●●●○         │
  └─────────────────────────────────┘

PRICE DRIVERS TABLE:
  "Why is FlockIQ predicting this?" (expandable, collapsed by default)
  | Driver | Impact | Direction | Confidence |
  | Maize price (42-day lag) | ₹+4.2/kg | ↑ | High |
  | Upcoming festivals | ₹+2.1/kg | ↑ | Medium |
  | District supply index | ₹-1.3/kg | ↓ | Medium |

IMPROVEMENT: This tab was BLANK in current build — must be fully implemented.
  This is the core value proposition of the product. Never show blank state here.
  Always show last-fetched forecast with staleness timestamp if live fails.

TAB 2: HISTORICAL
─────────────────────────────────────────────────────

FILTERS: Mandi selector + Range selector (up to 90 days)

PERFORMANCE SUMMARY CARDS (3 tiles):
  MAPE: 4.8%  |  P10–P90 Hit Rate: 87.3%  |  Total Predictions: 150

DATA TABLE:
  Columns: Date | Mandi | Predicted P50 | Actual | Error% | Within Range? | Sell Signal
  - "Within Range" column: green ✓ or red ✗
  - Error% column: coloured (green <6%, amber 6–10%, red >10%)
  - Each row is expandable → shows all 3 metrics + drivers for that day
  - Pagination: 25 rows per page
  
  NEW: Add "Accuracy by Month" chart above table
    Bar chart: each month's MAPE
    Shows model improvement over time — builds trust

TAB 3: DOWNLOAD
─────────────────────────────────────────────────────

IMPROVEMENT: Same as current but add:
  - "API Access" section if user is PULSE_INTEL → shows sample cURL command
  - "Scheduled Reports" toggle → send CSV every Monday 8 AM to email
  - JSON format only for Enterprise (existing behaviour — keep)
  - Add "Quick Download" button for last 30 days (most common use case)
    so user doesn't need to configure anything
```

---

### PAGE 3: District Map (`/dashboard/map`)

**Current State:** Shows coloured map (red = low price, amber = moderate, green = high) with a time slider. Currently rendering incorrectly (all red).

**Improvement Goals:**
- Fix map rendering to show correct geographic shapes
- Add proper legend and interaction
- Add farm density overlay option

```
LAYOUT: Full-width map (takes entire content area minus header)

MAP CONTROLS (floating overlay, top-left):
  ┌──────────────────────┐
  │  Layer: [Price ●] [Farms] [Disease Risk]  │
  │  Period: [▶] ─────●──────── 28 May        │
  └──────────────────────┘

MAP FEATURES:
  - Choropleth: district polygons coloured by current P50 price
    Green (#16A34A): High price — sell opportunity (P50 > P75 of 30-day range)
    Amber (#D97706): Moderate price
    Red (#DC2626): Low price — hold if possible
    Hatched red overlay: HPAI alert zone (shows when active alert in that district)
  - District labels with current price shown on map
  - Hover tooltip: District name | Today P50 | Signal | Active alerts count
  - Click district → panel slides in from right:
      District: Gorakhpur
      Today: ₹168/kg ↑2.3%
      7-day forecast: ₹165–₹174
      Signal: आज बेचें ✓
      Active farms: 12 (for logged-in integrator)
      [View Price History →]

BOTTOM LEGEND (fixed):
  ● High Price (Sell Now)  ● Moderate Price  ● Low Price  ⠿ HPAI Alert Zone
  [Farms Layer] toggle → shows farm count bubbles per district

IMPROVEMENT — FARM LAYER:
  When "Farms" toggle is on → blue circle markers appear per district
  Radius of circle proportional to number of farms
  Hover: "Gorakhpur: 12 farms monitoring today"
  This shows integrators their farm footprint geographically

TIME SLIDER (bottom):
  Play button + date slider (7-day history playback)
  Shows how price signal has changed over the week
  
NOTE FOR ENGINEER: Map rendering fix is CRITICAL.
  Use react-leaflet + GeoJSON for India district boundaries.
  Source: https://github.com/datameet/maps/tree/master/Districts
  Choropleth via leaflet.choropleth or manual fillColor mapping.
  Do NOT use any mapping library that requires paid API key.
```

---

### PAGE 4: Alerts (`/dashboard/alerts`)

**Current State:** Filter tabs (Disease/Weather/Price/Policy), Active Alerts tab, Alert History, Settings. Showing "सब ठीक है ✓" empty state.

**Improvement Goals:**
- Improve empty state design
- Add alert severity levels
- Add "Test Alert" feature for onboarding
- Better notification settings UI

```
LAYOUT: Standard page with tabs

ALERT SUMMARY STRIP (top):
  4 category tiles:
  [🦠 Disease: 0] [🌩 Weather: 0] [📉 Price: 0] [📋 Policy: 0]
  Clicking a tile → scrolls/filters to that category below

  IMPROVEMENT: Add "Alert Radius" setting here:
    "Alerts cover: 50km radius from Gorakhpur [Edit]"
    This makes it clear WHICH geographic area alerts cover

TAB 1: ACTIVE ALERTS
  District filter: [Gorakhpur ▾]
  
  EMPTY STATE (improved):
    Current: Shows sun emoji + "सब ठीक है ✓"
    NEW DESIGN:
      Large green checkmark illustration (SVG, not emoji)
      "आपके क्षेत्र में कोई सक्रिय अलर्ट नहीं है"
      Subtext: "FlockIQ HPAI, weather, and price movements in Gorakhpur, Deoria,
               Kushinagar, Basti, Maharajganj, Sant Kabir Nagar"
      [Test Alert →] button (ghost, shows sample alert for onboarding)
      [Configure Alert Radius →] link

  ALERT CARD (when alerts exist):
    ┌──────────────────────────────────────────────┐
    │ [🦠] HPAI Detected — Maharajganj         [×] │  ← red left border
    │  Severity: HIGH                               │
    │  Affected zone: within 80km of your farms     │
    │  Recommendation: Do not sell until cleared.   │
    │  Source: DAHDF Bulletin | 28 May 2026         │
    │  [Read Full Advisory →]                       │
    └──────────────────────────────────────────────┘

    Severity levels: HIGH (red border), MEDIUM (amber), LOW (blue)

TAB 2: ALERT HISTORY
  Table: Date | Type | District | Severity | Duration | Action Taken
  IMPROVEMENT: Add "Impact" column — "Price dropped ₹8/kg during alert period"
    This shows farmers the real financial impact of alerts — builds trust

TAB 3: SETTINGS (Alert Preferences)
  IMPROVEMENT: Redesign from current confusing duplicate rows layout

  CURRENT ISSUE: Notification Preferences shows repeated WhatsApp/Email/InApp
    rows in a confusing grid. Redesign to:

  CATEGORY CARDS:
  ┌─────────────────────────────────────────────┐
  │ 🦠 Disease Alerts                           │
  │  Trigger when: HPAI within [100 ▾] km       │
  │  Notify via: [✓ WhatsApp] [✓ Email] [✓ App] │
  │  Severity: [HIGH only ●] [HIGH+MEDIUM]       │
  └─────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────┐
  │ 🌩 Weather Alerts                           │
  │  Trigger when: Heat wave ≥42°C or cold <5°C │
  │  Notify via: [✓ WhatsApp] [  Email] [✓ App] │
  └─────────────────────────────────────────────┘
  [+ Add Custom Alert Rule] button (Pro feature)

  SAVE PREFERENCES button (primary, bottom-right)
```

---

### PAGE 5: My Farms — Portfolio (`/dashboard/farms`)

**Current State (from screenshots):** Shows "My Farms" header, 3 active farms with batch info, FCR, mortality. Navigation shows sub-items.

**Improvement Goals:**
- Portfolio KPI bar (missing from current)
- Better farm card design with health indicators
- Add "Daily Log Status" prominently
- Add WhatsApp Log Status indicator

```
LAYOUT: Standard page

─── PORTFOLIO KPI BAR (4 cards, full width) ──────────────────────────────
  [Total Birds: 1,25,000] [Avg FCR: 1.84 ✓] [Avg Mortality: 3.4% ⚠] [Pending Logs: 2 ⚠]

  "Pending Logs" card:
    Value: N (number of farms with no log today)
    Colour: red if >0, green if 0
    Click → filters farm list to show only farms missing today's log

─── FILTERS & SORT BAR ───────────────────────────────────────────────────
  LEFT: [All ●] [Active] [Between Batches] [Paused]  ← status filter tabs
  RIGHT: Sort by [FCR ▾]  [🔍 Search farms...]  [+ Add Farm]

─── FARM CARDS GRID (3-col desktop, 2-col tablet, 1-col mobile) ──────────

FARM CARD DESIGN:
┌─────────────────────────────────────────────────┐
│ ● Active          Batch #24 · Day 21 of ~42     │  ← status pill TL, batch info TR
│                                                  │
│ 🏠 Shivaji Poultry Farm                         │  ← farm name (bold 17px)
│ Pune, Narhe                                     │  ← location (muted 13px)
│ Broiler · Max 15,000 birds                      │
│                                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│ │Birds │ │ FCR  │ │Mort% │ │Weight│            │
│ │12,450│ │ 1.82 │ │ 0.40 │ │1680g │            │
│ │  /12K│ │ 🟢   │ │ 🟢   │ │⚠-2% │            │
│ └──────┘ └──────┘ └──────┘ └──────┘            │
│                                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ 50% (Day 21/42)     │  ← progress bar
│                                                  │
│ [✓ Log submitted today 09:23 AM]                │  ← green if done
│   OR                                             │
│ [⚠ Today's log pending — Submit now →]          │  ← amber if missing
│                                                  │
│ WhatsApp: [● Connected — Reminder at 6 PM]       │  ← NEW: WA status
└─────────────────────────────────────────────────┘

  HOVER STATE: shadow increases, slight scale(1.01), cursor pointer
  CLICK → navigates to /dashboard/farms/[id]
  LEFT BORDER: 4px green (active), amber (log pending), grey (between batches)

─── EMPTY STATE (no farms) ────────────────────────────────────────────────
  Illustration: isometric farm illustration (SVG)
  Hindi heading: "अभी तक कोई Farm नहीं जोड़ा"
  English sub: "Add your first farm to start tracking flock performance"
  CTA: [+ Add Your First Farm →] (primary button)
```

---

### PAGE 6: Single Farm Detail (`/dashboard/farms/[id]`)

**Current State:** Farm header, batch progress strip, 5 tabs (Metrics / Daily Log / Health / Feed / Batch History). Each tab has substantial content. Overall design is good but needs improvements.

**Improvements:**

```
FARM HEADER BAND (always visible above tabs):
┌────────────────────────────────────────────────────────────┐
│ ← My Farms                                                  │
│                                                             │
│  Shivaji Poultry Farm            [Active ●] Batch #24  [⋮] │
│  📍 Pune, Narhe (18.4567, 73.8567)                          │
│  Broiler · Max 15,000 birds                                 │
└────────────────────────────────────────────────────────────┘

BATCH PROGRESS STRIP:
┌────────────────────────────────────────────────────────────┐
│ Batch #34 · Day 21 of ~42      ━━━━━━━━━━━━━━━━━     50%  │
│ Placed: 10/5/2026                                           │
│                                                             │
│ [Birds: 12,450/12,500  Mort: 0.40%]  [Weight: 1680g/2100g target] │
│                                       [↑ +35g today 🟢]            │
└────────────────────────────────────────────────────────────┘

IMPROVEMENT: Add "Days to Target Harvest" banner when weight ≥ 85% of target:
  "🌟 Harvest Window: Est. June 14–17 (D+35–38) — P50 price: ₹168/kg"
  This is the killer feature: connects farm grow-out data with price forecast.
  Farmer sees: "My birds will be ready on Jun 14 — price forecast says SELL"

TABS (5 tabs + new WhatsApp tab):
  [📊 Metrics] [📅 Daily Log] [🏥 Health] [🌾 Feed] [📋 Batch History] [📲 WhatsApp]

── TAB: METRICS ────────────────────────────────────────────────

  IMPROVEMENT OVER CURRENT:
  Current shows 5 charts: FCR Trend, Mortality Cumulative, Weight Progression,
    Daily Feed Intake per Bird, Daily Weight Gain.

  ENHANCEMENT 1 — Add standard growth curve benchmark line to Weight Progression:
    Show Ross 308 standard growth curve as dashed grey line
    Show Cobb 430 standard growth curve as dashed purple line
    Actual weight plotted as solid green line
    If actual > standard: "Above average ↑" badge
    If actual < standard by >10%: amber alert "Growth behind standard curve"

  ENHANCEMENT 2 — FCR chart: Add industry benchmark band (shaded zone 1.6–1.9)
    When FCR goes above 1.9 zone: show red warning annotation on chart
    Tooltip: "FCR 1.82 — Within good range (1.7–1.9). Industry avg: 1.85"

  ENHANCEMENT 3 — Add "Performance Score" card at top of metrics tab:
    Composite score 0–100 based on FCR, mortality, weight vs target, log compliance
    "Batch Health: 78/100 — Good"
    Shows which metric is dragging the score down with 1-line fix suggestion

  ENHANCEMENT 4 — Weight Progression: show "No weight logs" with CTA button
    Current shows empty chart with "No weight logs recorded yet"
    NEW: Show estimated weight based on breed growth curve + age
    "Estimated: ~1,680g based on Ross 308 D21 standard"
    [+ Log Today's Weight →] button directly on chart

── TAB: DAILY LOG ──────────────────────────────────────────────

  CURRENT: Shows data table with Export CSV button. No entry form visible.

  IMPROVEMENT — Add "Log Today's Data" inline form at TOP of table:

  ┌─────────────────────────────────────────────────────┐
  │ 📅 Log for Today (June 1, 2026) — Day 21           │
  │                                                     │
  │ Birds Dead Today  Feed (kg)    Water (L)  Temp (°C) │
  │ [    0    ]       [ 1250 ]     [ 230  ]   [23-31 ]  │
  │                                                     │
  │ Avg Weight (g)    Notes (optional)                  │
  │ [   1680  ]       [________________________]        │
  │                                                     │
  │ Auto-computed: FCR 1.82 ✓  ADG 48g ✓  Mort% 0.40%  │
  │                                                     │
  │ [Save Today's Log ✓]  [Clear]    ← green CTA button │
  └─────────────────────────────────────────────────────┘

  BELOW FORM: Data table (existing design is good)
  IMPROVEMENT on table:
  - Add colour coding: mortality% column red if >4%
  - FCR column: colour based on fcrExcellent/fcrGood/fcrWatch
  - Sticky header on scroll
  - Export CSV button stays in table toolbar (not page header)

── TAB: HEALTH ─────────────────────────────────────────────────

  CURRENT: Good design overall. Shows health status, vaccination schedule,
    health events, symptom log, 14-day checklist calendar.

  IMPROVEMENTS:
  1. Vaccination Schedule: Add "Overdue" banner at page top if any vaccine overdue
     Current shows it per row — add a summary banner too:
     "⚠ 2 vaccinations overdue — IB (Day 21) and ND+IB (Day 28)"

  2. Symptom Quick-Log: Improve from binary नहीं/हाँ to multi-select chips:
     "आज कोई symptom?" followed by:
     [✓ Normal] OR
     [Respiratory] [Leg Weakness] [Low Feed Intake] [High Mortality] [Lethargy] [Other]
     On selecting any abnormal → opens notes field + severity selector

  3. Health Checklist: Currently shows coloured squares but no clear meaning.
     IMPROVEMENT: Show "14-day Log Completion Rate" as percentage with trend:
     "Completion: 2/14 (14%) ↓ — Submit logs to improve batch tracking"
     Each day square: click → opens that day's log entry

  4. Add "Vet Contact" card at bottom:
     "Need a vet? Contact your assigned field officer: [Name] +91-XXXXXXXXXX"
     This bridges the digital tool to real-world support

── TAB: FEED ───────────────────────────────────────────────────

  CURRENT: Shows Feed Inventory (stock level bar), Feed Purchase Log table,
    Feed Cost Summary. Good functionality, minor improvements needed.

  IMPROVEMENTS:
  1. Feed Inventory: Add "Days Remaining" visual urgency:
     If >14 days: green bar + "12 days remaining ✓"
     If 7–14 days: amber bar + "⚠ 7 days remaining — consider reorder"
     If <7 days: red bar + "🔴 URGENT: Only 3 days of feed left — order now"
     Add [Order Feed Now →] button that opens Purchase Order form directly

  2. Feed Purchase Log: Add "Price vs Market" column:
     Shows actual rate vs market rate from Feed Intelligence page
     "₹45/kg (Market: ₹43) ↑ Above market by 4.7%"
     This helps farmers see if they're overpaying

  3. Feed Cost Summary: Add "Cost per Kg Live Weight Projection":
     Current shows "Cost per kg Produced (est.): ₹42,286"
     NEW: "If sold today at ₹168/kg: Revenue ₹21L | Net margin ~₹4.2L (~20%)"
     This is the connection farmers need: feed cost → profit margin

── TAB: BATCH HISTORY ──────────────────────────────────────────

  CURRENT: Shows table of past batches + Farm Lifetime Averages. Good.

  IMPROVEMENTS:
  1. Add "Trend Charts" toggle (table vs charts view):
     Charts view: bar charts of FCR trend, profit trend, weight trend across batches
     Makes improvement/degradation visually obvious

  2. Each batch row: [View Report] button → generates PDF batch closure report
     Current has [View] link — needs to show WHAT it shows
     PDF report includes: all metrics, health events, P&L summary, comparisons

  3. Farm Lifetime Averages: Add "vs Industry Benchmark" comparison:
     "Avg FCR: 1.85 (Industry avg: 1.90 ✓ +0.05 better)"
     "Avg Mortality: 3.43% (Industry avg: 3.0% ⚠ -0.43% worse)"

── TAB: WHATSAPP (NEW) ─────────────────────────────────────────

  NEW TAB — Core differentiator feature

  ┌─────────────────────────────────────────────────────────┐
  │  📲 WhatsApp Daily Log Automation                       │
  │                                                         │
  │  Status: ● Connected (+91-9876543210)                   │
  │  Daily Reminder: 6:00 PM every day (when batch active)  │
  │  Language: हिंदी                                        │
  │                                                         │
  │  [Change Time ✏] [Test Reminder 📤] [Disconnect ✗]      │
  └─────────────────────────────────────────────────────────┘

  HOW IT WORKS (explainer, collapsible):
  1. FlockIQ sends you a WhatsApp message at 6 PM every day
  2. The message asks for today's data (birds dead, feed kg, weight)
  3. You reply with the numbers — even just "5 bird dead 1200 kg feed"
  4. FlockIQ automatically fills your daily log — no app needed!
  5. Your integration manager can see the data instantly on their dashboard

  RECENT LOG SUBMISSIONS (table):
  | Date    | Source        | Birds Dead | Feed kg | Status       |
  | Jun 1   | WhatsApp ✓    | 0          | 1250    | ✓ Synced     |
  | May 31  | WhatsApp ✓    | 1          | 1146    | ✓ Synced     |
  | May 30  | Manual entry  | 3          | 1145    | ✓ Synced     |
  | May 29  | WhatsApp ✓    | 4          | 1285    | ✓ Synced     |

  CONVERSATION PREVIEW (last 5 messages — WhatsApp style):
  Shows last 5 WhatsApp exchanges in a chat bubble UI
  Makes it clear what the interaction looks like to the farmer

  SETUP WIZARD (if not connected):
  Step 1: Enter farmer's WhatsApp number
  Step 2: Choose reminder time (dropdown: 5 PM, 6 PM, 7 PM, 8 PM)
  Step 3: Choose language (Hindi / English)
  Step 4: Send test message → farmer confirms receipt
  Step 5: Connected ✓
```

---

### PAGE 7: Batch Status Board (`/dashboard/batch-board`)

**Current State:** Kanban-style board with columns: Placement / Growing / Pre-Harvest / Harvest Ready / Harvested. Each column has batch cards.

**Improvement Goals:**
- Better batch card design
- Add hover details
- Add bulk action (e.g., "Send harvest reminder to all Harvest Ready")

```
PAGE HEADER:
  "बैच स्टेटस बोर्ड" / "Batch Status Board"
  RIGHT: [Active ▾ filter] [+ New Batch] [📥 Export]

KANBAN COLUMNS (horizontal scroll on narrow viewports):
  [Placement D1–7 · 1 batch]  [Growing D8–28 · 1]  [Pre-Harvest D29–42 · 1]
  [Harvest Ready D43+ · 1]    [Harvested · 1]

BATCH CARD (enhanced):
┌────────────────────────────────────┐
│ GKP-202605-001              ● S    │  ← sell signal badge
│ Shed 1                             │
│                                    │
│ Day 30  🐔 24.8k  ⚖ 1.85 kg      │
│                                    │
│ FCR: 1.78  ●  Mort: 1.0% ●        │  ← colour coded
│                                    │
│ ──── Batch progress ──── 71%       │
│                                    │
│ Est. harvest: Jun 8–10             │  ← NEW: estimated harvest window
│ Price forecast: ₹168/kg            │  ← NEW: shows current price signal
└────────────────────────────────────┘

HOVER CARD (popover on hover, 320px wide):
  Shows full metrics: births, current mortality, FCR trend, feed consumed,
  last log time, health status, upcoming vaccinations

HARVEST READY column SPECIAL DESIGN:
  Column background: subtle amber tint (#FFFBEB)
  Column header: "🌟 Harvest Ready — Action Required"
  Each card has: [Contact Buyer →] button + price signal prominently displayed
  Bulk action bar appears when items in this column:
    "[✉ Notify all Harvest Ready farms about today's price →]"

FILTER BAR (above board):
  [All ●] [Has Alert] [Log Missing Today] [FCR > 2.0] [Mortality > 4%]
  These filters help integrators find problem farms quickly
```

---

### PAGE 8: Feed Intelligence (`/dashboard/feed`)

**Current State:** Good design with Commodity Prices, Procurement Timing Recommendation, 14-Day Commodity Forecast chart, Feed Cost Impact Calculator.

**Improvements:**

```
IMPROVEMENTS:
1. Commodity Prices section: Add historical chart on click
   Clicking any commodity row → expands to show 30-day price chart
   This gives context to the current price

2. Procurement Timing Recommendation: Make it more actionable
   CURRENT: "अभी खरीदें BUY NOW — 14-day forecast shows 5.2% uptrend"
   IMPROVED:
   ┌────────────────────────────────────────────────────┐
   │  📈 Buy Window: NOW → Jun 5 (next 5 days)          │
   │  Maize expected to rise 5.2% after Jun 5           │
   │  Potential savings if you buy today:                │
   │  10 MT × ₹42 potential rise = ₹4,200 savings       │
   │                                                     │
   │  Farms needing restock in next 14 days: 3 farms    │
   │  [Pre-order for multiple farms →]                   │
   └────────────────────────────────────────────────────┘

3. Feed Cost Impact Calculator: Existing is good. Add:
   "Your average farm (12,500 birds, 42-day batch) estimated feed cost:"
   Pre-fills calculator with average farm data from user's portfolio
   "vs last batch: ₹3,500 savings projected 📉"

4. ADD: Feed Supplier Market (new section, global market awareness):
   "Feed Market Insight"
   Shows regional supplier comparison (anonymised):
   "Average price in Gorakhpur: ₹45/kg | Lowest seen: ₹42/kg"
   "3 farms recently bought at ₹43/kg from local mill"
   (Aggregate data, no individual farm names)
```

---

### PAGE 9: Middleman Check (`/dashboard/middleman`)

**Current State:** Price Comparison (Mandi Benchmark vs Middleman Price → Spread), Fair Pricing result, Negotiation Tips, Check Your Price form.

**Improvement Goals:**
- Add historical spread tracking
- Add "Share with Farmer" feature

```
IMPROVEMENT 1 — Add "Spread History" chart:
  Shows how this middleman's spread has changed over 30 days
  "Is your middleman getting more or less fair over time?"
  Line chart: 30-day spread trend
  This is powerful — shows if a farmer is being squeezed progressively

IMPROVEMENT 2 — Fair Pricing result card (enhanced):
  CURRENT: "Fair Pricing — 4.9% spread. Appears to be fair market pricing."
  NEW:
  ┌──────────────────────────────────────────────────────┐
  │  📊 Price Analysis                                   │
  │                                                      │
  │  Your price:     ₹170/kg                            │
  │  Mandi P50:      ₹168/kg (Gorakhpur)                │
  │  Spread:         +₹2/kg (1.2%)   ← FAIR ✓          │
  │                                                      │
  │  vs Last 30 days: Spread avg was ₹3.5/kg            │
  │  vs Industry:     Typical spread ₹1–5/kg            │
  │                                                      │
  │  Verdict: ✅ FAIR PRICING                            │
  │  "This middleman is within acceptable range"         │
  └──────────────────────────────────────────────────────┘

  If spread > 8%:
  ┌──────────────────────────────────────────────────────┐
  │  🔴 POSSIBLE EXPLOITATION DETECTED                   │
  │  Spread: ₹16/kg (9.5%) — above fair range (5%)     │
  │  At 10,000 kg, you may be losing ₹1,10,000          │
  │  Recommended: Negotiate or find alternative buyer    │
  └──────────────────────────────────────────────────────┘

IMPROVEMENT 3 — Negotiation Script Generator:
  "Generate Negotiation Script" button (AI-powered)
  Shows a Hindi script the farmer can use in conversation:
  "आपके भाई, Gorakhpur mandi में आज P50 ₹168/kg है।
   मुझे ₹170 दे रहे हैं, जो fair है। लेकिन..."

IMPROVEMENT 4 — Share via WhatsApp button:
  [📤 WhatsApp पर Share करें]
  Sends message to farmer's WhatsApp: "आज का Middleman Check:
    Mandi P50: ₹168 | आपका भाव: ₹170 | Spread: 1.2% (Fair ✓)"
```

---

### PAGE 10: Batch ROI Optimizer / Calculator (`/dashboard/calculator`)

**Current State:** Batch ROI Optimizer with Batch Parameters, Sell vs Hold Decision Matrix, Profit Waterfall Analysis. Also shows Batch Profit Calculator with 14-Day Profit Projection.

**Improvements:**

```
IMPROVEMENT 1 — Connect to live farm data:
  "Load from Farm" dropdown at top:
  [Load from: Shivaji Farm — Batch #24 ▾]
  Auto-fills all batch parameters from live farm data
  Eliminates manual re-entry — huge UX improvement

IMPROVEMENT 2 — Sell vs Hold Decision Matrix enhancements:
  Add "Market Timing Score" for each scenario:
  | Scenario | Price (P50) | Revenue | Feed Cost | Net Profit | ROI% | Market Score |
  | TODAY ⭐ | ₹162.40     | ₹7.3M   | -₹0       | ₹7.3M      | 0%   | 8.5/10       |
  | +3D      | ₹162.40     | ₹7.9M   | -₹574K    | ₹7.2M      | +1%  | 7.2/10       |
  Market Score considers: price forecast + mortality risk + weight gain rate

IMPROVEMENT 3 — Harvest Window Visualizer (new card):
  ┌───────────────────────────────────────────────────────┐
  │  🌟 Optimal Harvest Window                            │
  │                                                       │
  │  TODAY         +3D        +7D        +14D            │
  │  ██████████    ████████   ████████   ██████          │
  │  SELL NOW ⭐   Good       Acceptable  Risky           │
  │  ₹7.3M profit                                        │
  │                                                       │
  │  Price forecast: Stable this week, ↓ likely +14D     │
  │  Mortality risk: Low (Day 21, normal range)          │
  │  Feed cost: +₹574K every 3 days you hold             │
  └───────────────────────────────────────────────────────┘

IMPROVEMENT 4 — Multi-Farm Calculator tab:
  Compare optimal sell timing across all farms simultaneously
  Table: Farm A (sell Jun 3) | Farm B (sell Jun 6) | Farm C (sell Jun 8)
  "Optimised revenue across portfolio: ₹3.8 Cr"
```

---

### PAGE 11: Portfolio Metrics (`/dashboard/metrics`)

**Current State:** Shows KPI strip (total birds, avg FCR, mortality, feed consumed), FCR Trend chart, Mortality Events Timeline, Farm Ranking table, Pending Actions.

**Improvements:**

```
IMPROVEMENT 1 — Add period selector that actually works:
  [This Week] [This Month ●] [Last 90 Days] [This Batch] [Custom]
  Currently all tabs show but charts show "Loading..." — must be functional

IMPROVEMENT 2 — FCR Trend chart: Add benchmark overlay
  Current FCR Trend: shows loading state
  NEW: Line chart with:
    - Your portfolio FCR (solid green line)
    - Industry benchmark line (dashed grey): 1.90
    - Target FCR line (dashed blue): 1.80
    Annotation: "Portfolio avg FCR 1.77 — 7% better than industry ✓"

IMPROVEMENT 3 — Mortality Events Timeline:
  Current: shows loading state
  NEW: Timeline with event markers + cumulative mortality area chart
    Red markers: mortality spike events (>2x daily average)
    Hover → shows: "Day 15: +8 deaths (Shed 3) — attributed to leg weakness event"

IMPROVEMENT 4 — Farm Ranking table: Enhance
  CURRENT columns: Rank | Farm Name | FCR | Mortality | ADG | Birds Alive | Status | Last Log
  ADD columns:
    - Trend column (mini sparkline of FCR last 7 days)
    - Health column (green/amber/red circle)
    - Log Compliance % (e.g. "85%")
  Row click → navigates to that farm's detail page

IMPROVEMENT 5 — Pending Actions section:
  Current shows "Loading..." — must show real actionable items:
  ┌──────────────────────────────────────────────────────┐
  │  ⚠ Pending Actions (3)                              │
  │                                                      │
  │  [🔴] Shivaji Farm — IB Vaccine overdue (Day 21+2)  │
  │  [🟡] Demo Farm 2 — No log submitted today          │
  │  [🟡] Demo Farm 1 — FCR trending upward (1.95, ↑)  │
  └──────────────────────────────────────────────────────┘
  Each action has [Resolve →] link

IMPROVEMENT 6 — Add Benchmark Comparison section:
  "How do your farms compare to FlockIQ network averages?"
  (Aggregate anonymised data from all platform farms)
  | Metric | Your Portfolio | Platform Average | Top 25% |
  | FCR    | 1.77           | 1.90             | 1.72    |
  | Mort%  | 4.8%           | 3.2%        ⚠   | 2.1%    |
  This gives farmers/integrators competitive context
```

---

### PAGE 12: Settings (`/dashboard/settings`)

**Current State:** Profile tab, Notifications tab, Team tab, Billing tab, Data & Privacy tab.

**Improvements:**

```
PROFILE TAB:
  IMPROVEMENT: Add profile completion percentage
    "Profile 65% complete — add farm location to improve price accuracy"
  Add "Primary Mandi" setting (which mandi's price shows on dashboard)
  Add "Bird Type" setting (Broiler / Layer / Breeder)
  Language toggle: Hindi | English (already exists, keep)
  ADD: Timezone setting (for global users)
  ADD: Currency setting (₹ INR / $ USD / € EUR — for global market)

NOTIFICATIONS TAB:
  Redesign the confusing duplicated rows (see Alerts page design above)
  Add "Daily Summary" toggle:
    "Send me a daily summary at [7:00 AM ▾] with: today's price, farm status, pending actions"
    This is one message per day with everything — farmers love this

  ADD: WhatsApp Daily Log Reminder sub-section:
    "Farm Daily Log Reminders"
    [✓] Enable daily log reminder via WhatsApp
    Send reminder at: [6:00 PM ▾]
    Language: [हिंदी ●] [English]
    Applies to: [All farms ●] [Select specific farms]
    [Send Test Reminder →] button

TEAM TAB:
  IMPROVEMENT: Make team management more visual
  Show team members as cards (not just table)
  Each card: avatar, name, role badge, status, joined date
  [+ Invite] button: adds via phone number or email
  Role management: Owner / Manager / Field Supervisor / View Only
  Field Supervisor role: can only submit daily logs, cannot access price intelligence

BILLING TAB:
  IMPROVEMENT — Plan comparison cards (current design is good, minor tweaks):
  Add "Most Popular" badge on PULSE_PRO
  Add feature comparison table below cards:
  | Feature              | PULSE_FARM | PULSE_PRO | PULSE_INTEL |
  | Price forecasts      | 1 mandi    | All mandis | All mandis  |
  | Farm tracking        | 1 farm     | 5 farms    | Unlimited   |
  | WhatsApp log automation | ✗       | ✓          | ✓           |
  | API access           | ✗          | ✗          | ✓           |
  Add "Annual billing: save 20%" toggle above plan cards

ADD NEW: INTEGRATIONS TAB (new):
  Shows all external integrations:
  ┌─────────────────────────────────────────────────────┐
  │  📲 WhatsApp Business                               │
  │  Status: ● Connected (Meta Business API)           │
  │  Sending to: 3 farms  |  Last message: 2h ago      │
  │  [Manage] [Disconnect]                              │
  └─────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────┐
  │  📧 Email                                           │
  │  Status: ● Connected (user@example.com)             │
  │  [Change Email] [Manage Frequency]                  │
  └─────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────┐
  │  🔗 Webhook (Enterprise)                            │
  │  Status: ○ Not configured                          │
  │  [Configure →]  ← only for PULSE_INTEL             │
  └─────────────────────────────────────────────────────┘
```

---

### PAGE 13: Farm Add Wizard (`/dashboard/farms/new`)

**Current State:** 4-step wizard: Farm Info → Shed Setup → First Batch → Review & Save. Good functional flow.

**Improvements:**

```
OVERALL: Wizard is well-designed. Focus on content improvements.

STEP 1: FARM INFO
  ADD: "Why do we need GPS?" info tooltip next to GPS field
    "GPS coordinates help us show you the most relevant price data
     for your nearest mandi and improve disease risk alerts."
  ADD: "Nearest Mandi" auto-detection after GPS entry:
    "Based on your location: Nearest mandi is Gorakhpur (12 km)"
    [Use Gorakhpur ✓] or [Select different mandi]
  ADD: "Farm Photo" optional field (for visual identification in portfolio)

STEP 2: SHED SETUP
  IMPROVEMENT: Show capacity utilisation visualisation
    After entering shed capacity, show:
    "Shed 1: 33,555 birds capacity
     Density: [████░] — Standard (2.5 birds/m² at 50% fill)"
  ADD: "Standard shed size for this capacity: ~670 m²" auto-calculation

STEP 3: FIRST BATCH
  ADD: Breed-specific growth chart preview after breed selection
    "Ross 308 standard growth curve: Target harvest weight 2.1 kg at Day 38–42"
    Shows mini chart of expected growth trajectory
  ADD: "WhatsApp Daily Log Setup" section in Step 3 (not separate):
    "Set up automatic daily log collection via WhatsApp?"
    [Yes — farmer's WhatsApp number: ________________]
    [I'll enter logs manually]
    This makes WhatsApp setup part of the onboarding flow, not an afterthought

STEP 4: REVIEW & SAVE
  IMPROVEMENT: Show setup checklist with what's configured vs what's optional:
  ✓ Farm Information
  ✓ Shed Setup (1 shed, 33,555 birds)
  ✓ First Batch (Hubbard, 64,555 chicks, placed May 12)
  ○ WhatsApp Daily Log — not set up [Set up now →]
  ○ Vaccination Schedule — not imported [Add →]
  
  "Save Farm & Start Tracking" button
  After save: redirect to farm detail page with onboarding checklist modal
```

---

### PAGE 14: Farm Performance Compare (`/dashboard/farms/compare`)

**Current State:** Select farms (2-5), period selector, Performance Radar chart, Detailed Comparison table with industry avg.

**Improvements:**

```
IMPROVEMENT 1 — Add "Trend Comparison" view alongside radar:
  Toggle: [Radar ●] [Trend Charts]
  Trend Charts view: 3 side-by-side line charts:
    FCR over time: Farm A vs Farm B vs Farm C (each different colour)
    Mortality over time: same
    Weight progression: same
  This shows improvement/degradation trajectory, not just current state

IMPROVEMENT 2 — Detailed Comparison table:
  Add "Rank vs Platform" column:
  | Metric   | Farm A | Farm B | Best | Industry | Platform Rank |
  | FCR      | 1.82   | 1.95   | 1.82 | 1.85     | Top 25% ✓    |
  | Mort %   | 2.1%   | 3.8%   | 2.1% | 3.0%     | Top 15% ✓    |

IMPROVEMENT 3 — Add "Key Insight" card below table:
  AI-generated 2-3 line insight:
  "Farm A outperforms Farm B on all 6 metrics. The FCR gap (0.13) suggests
   Farm B may have a feed efficiency issue — check feed type or conversion."
  This is a lightweight AI layer that makes the comparison actionable.

IMPROVEMENT 4 — Download Comparison Report:
  PDF report with all charts + table + insights
  Report header: FlockIQ logo + farm names + period
  Good for sharing with investors / lenders / co-op meetings
```

---

## 4. NEW FEATURE: WHATSAPP DAILY LOG AUTOMATION

### 4.1 Overview

```
FEATURE: WhatsApp Daily Log Bot
BRAND: "FlockIQ Daily Assistant"
PURPOSE: Eliminate manual daily data entry by farm integration managers.
         Instead, the farmer replies to a structured WhatsApp message daily.
         System parses the reply and auto-fills the farm's daily log.

OPERATIONAL FLOW:
  6:00 PM → FlockIQ sends WhatsApp message to farmer's number
  Farmer reads message, replies in natural Hindi/English
  System parses reply within 60 seconds
  Daily log for that farm is auto-filled
  Integration manager sees "✓ WhatsApp" badge on farm card
  If no reply by 8 PM → sends one reminder
  If still no reply → "⚠ Log pending" shown on dashboard, manager notified

BUSINESS IMPACT:
  Integration manager currently visits/calls each farmer to collect daily data.
  With this feature: data collection is fully automated.
  Manager's time = focused on farm visits for real issues, not data collection.
```

### 4.2 WhatsApp Message Template

```
OUTBOUND MESSAGE (sent at 6 PM each day the batch is active):
────────────────────────────────────────────────────────────
🐔 FlockIQ — Shivaji Farm आज का लॉग (Jun 1, Day 21)

नमस्ते [Farmer Name]! आज का डेटा भेजें:

Reply करें इस format में:
[मरी हुई मुर्गी] [खाना kg] [वज़न grams (optional)]

Example reply:
2 1250 1680
(मतलब: 2 मुर्गी मरी, 1250 kg खाना, 1680 gm वज़न)

अगर सब ठीक है और आज कोई मौत नहीं:
0 1250

FlockIQ — आपके Farm का Digital साथी 🌱
────────────────────────────────────────────────────────────

ENGLISH VERSION (switchable):
────────────────────────────────────────────────────────────
🐔 FlockIQ — Shivaji Farm Daily Log (Jun 1, Day 21)

Hi [Farmer Name]! Please send today's data:

Reply in this format:
[birds dead] [feed kg] [weight grams (optional)]

Example: 2 1250 1680
(means: 2 birds dead, 1250 kg feed, 1680g weight)

If all good, no deaths: 0 1250

FlockIQ — Your Farm's Digital Partner 🌱
────────────────────────────────────────────────────────────
```

### 4.3 Reply Parsing Logic

```
PARSER handles natural language, not just rigid format:

Accepted input variations:
  "2 1250 1680"              → {dead: 2, feed: 1250, weight: 1680}
  "2 birds 1250 kg feed"     → {dead: 2, feed: 1250}
  "aaj 3 muri, khaana 1200"  → {dead: 3, feed: 1200}
  "0 1150"                   → {dead: 0, feed: 1150}
  "sab theek hai 1200"       → {dead: 0, feed: 1200}
  "all good 1350kg"          → {dead: 0, feed: 1350}
  "3 mre 1250"               → {dead: 3, feed: 1250}

Confirmation reply sent back:
────────────────────────────────────────────────────────────
✅ Log saved for Shivaji Farm (Jun 1):
• Mri hui murgiyan: 2
• Khaana: 1,250 kg
• Wazn: 1,680 g
• FCR (estimated): 1.82 ✓
• Sanchiit mort: 0.40%

Agar koi galti hai, reply karein: REDO
────────────────────────────────────────────────────────────

If reply is ambiguous:
"Aapka reply samajh nahi aaya. Kripya is format mein bhejein:
[birds dead] [feed kg]
Example: 2 1250"

REDO command: farmer replies "REDO" → bot asks them to re-send
HELP command: farmer replies "HELP" → sends format instructions again
STOP command: farmer replies "STOP" → pauses reminders (admin notified)
```

### 4.4 Data Validation & Error Handling

```
SERVER-SIDE VALIDATION:
  birds_dead: 0 ≤ value ≤ (birds_alive × 0.15)
    If >15% daily mortality: flag for manual review + alert integration manager
  feed_kg: 0 < value ≤ (birds_alive × 0.3)
    If outside range: send clarification message to farmer
  weight_g: 0 < value ≤ 4000 (max realistic for broiler)

IF VALIDATION FAILS:
  System sends WhatsApp message:
  "⚠ आपका डेटा असामान्य लग रहा है:
   • [मरी हुई मुर्गी: 850] — यह बहुत ज़्यादा लग रहा है
   क्या आप confirm करना चाहते हैं? Reply: YES / NO"

  If YES → saves with flag, alerts integration manager
  If NO → asks to re-send

AUDIT LOG:
  Every WhatsApp submission stored with:
    - raw_message (original text)
    - parsed_values
    - confirmation_sent_at
    - source: 'whatsapp'
  Viewable in farm detail → Daily Log tab → Source column
```

---

## 5. RESPONSIVE DESIGN

```
BREAKPOINTS:
  Mobile:   320px–767px  (farmer's primary access device)
  Tablet:   768px–1279px (integration manager on site)
  Desktop: 1280px+       (office/admin use)

MOBILE-SPECIFIC RULES:
  - Sidebar: hidden by default, hamburger toggle
  - Farm cards: single column, larger touch targets (min 44px height)
  - Charts: horizontal scroll enabled, reduced height (200px)
  - Daily log form: stacked inputs, single column
  - Bottom sheet pattern for secondary info (not modals)
  - Minimum touch target: 44×44px for all interactive elements
  - WhatsApp button: pinned to bottom on farm detail (easy access)

TABLET:
  - Sidebar collapses to 64px icon rail
  - Farm cards: 2-column grid
  - Charts: full width

DESKTOP:
  - Full sidebar (240px)
  - Farm cards: 3-column grid
  - Split panels (e.g., form + live preview)
```

---

## 6. LOADING & EMPTY STATES

```
LOADING STATE PATTERN (mandatory on all data-dependent components):
  Step 1: Skeleton screens (grey shimmer rectangles matching content layout)
  Step 2: Data loads → fade in with 200ms opacity transition
  Step 3: If error → error card with retry button (not raw error message)

SKELETON DIMENSIONS:
  KPI card: 200px × 80px rectangle skeleton
  Chart: full-width × 280px skeleton
  Table row: 3 rows of skeleton lines

EMPTY STATES:
  Each page has a specific empty state (never just white space):
  - No farms: isometric farm illustration + Hindi CTA
  - No alerts: green checkmark illustration + reassurance message
  - No price data: grey chart placeholder + "Data loading at 6 AM" message
  - No batch history: batch timeline illustration + "Your history will appear here"

ERROR STATES:
  Never show: error codes, stack traces, API error messages
  Always show: friendly Hindi message + what to do
  Example: "डेटा लोड नहीं हो सका। कृपया Refresh करें।" + [🔄 Refresh]
```

---

## 7. ACCESSIBILITY

```
WCAG 2.1 AA REQUIREMENTS (mandatory):
  - All colour combinations: min 4.5:1 contrast ratio for text
  - All interactive elements: keyboard navigable with Tab/Enter/Space
  - All images: alt text in Hindi and English
  - All charts: data table alternative available (toggle "View as table")
  - Form validation: errors announced to screen readers via aria-live
  - Focus indicators: visible 3px outline in brand400 on all focusable elements
  - Language attribute: lang="hi" for Hindi sections, lang="en" for English
  - Font size: minimum 13px for all readable text (no smaller)

COLOUR ACCESSIBILITY:
  - Do not use colour alone to convey status — always add icon or text
    Wrong: Red cell in table (colour only)
    Right: Red cell + "⚠ Critical" text
  - All charts: tested with Coblis colour blindness simulator
    (The P10/P50/P90 green/white/dark-green palette passes deuteranopia test)
```

---

*End of FlockIQ Updated Design Master v2.0*
*Next file: FlockIQ_Updated_Requirements_v2.md*
*Companion: FlockIQ_Updated_Tasks_v2.md*
