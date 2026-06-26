# PoultryPulse AI — Integrator Farm Management & Daily Metrics UI/UX Design Master
# File: 14_integrator_farms_design_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL
# Extends: 04_postlogin_design_master.md

---

## AGENT CONTEXT BLOCK
```
DESIGNER_PERSONA: Aidan Murphy (B2B SaaS/dashboard density) × Jessica Lin (accessibility-first) × Don Norman (human-centered)
DESIGN_VARIANCE: 5 — Structured, precise, functional
MOTION_INTENSITY: 3 — Minimal animation on data-entry forms; purposeful feedback only
VISUAL_DENSITY: 7 — Operational data-dense; integrators need farm + flock overview at a glance
TARGET: S2 Integrators (50K–500K birds) — primary; S3 Feed Manufacturers — secondary
PRINCIPLE: "One screen, one farm, full flock health picture" — operational clarity rule
ACCESSIBILITY: WCAG 2.1 AA mandatory
ERRORS: Never raw codes — friendly Hindi + English error messages
FOUNDATION: PRD v3.0 §3 (S2 segment) + 04_postlogin_design_master.md §1 (design system) + TRD v1.0
NEW_ROUTES:
  /dashboard/farms                  — Farm portfolio overview
  /dashboard/farms/[id]             — Single farm detail + daily log
  /dashboard/farms/[id]/daily-log   — Daily metric entry form
  /dashboard/farms/[id]/batches     — Batch history for a farm
  /dashboard/farms/new              — Onboard a new farm
  /dashboard/farms/compare          — Cross-farm comparison
  /dashboard/metrics                — Aggregated integrator metrics dashboard
  /dashboard/metrics/fcr            — FCR analysis & trends
  /dashboard/metrics/mortality      — Mortality tracking & alerts
  /dashboard/metrics/feed           — Feed consumption & cost
  /dashboard/metrics/health         — Flock health log & disease tracker
  /dashboard/reports/integrator     — Batch closure & integrator performance reports
SIDEBAR_ADDITIONS:
  🏠 My Farms           /dashboard/farms        [S2+ only]
  📋 Daily Metrics      /dashboard/metrics      [S2+ only]
  📄 Reports            /dashboard/reports      [S2+ only]
```

---

## 1. DESIGN SYSTEM EXTENSIONS (extends 04_postlogin_design_master.md §1)

### 1.1 Additional Colour Tokens — Farm & Metrics Module

```typescript
// Extends DashboardTokens from 04_postlogin_design_master.md
export const FarmMetricTokens = {
  // FCR status bands (Feed Conversion Ratio — lower is better)
  fcrExcellent:  '#16A34A',  // FCR < 1.7 — excellent
  fcrGood:       '#65A30D',  // FCR 1.7–1.9 — good
  fcrWarning:    '#D97706',  // FCR 1.9–2.1 — needs attention
  fcrCritical:   '#DC2626',  // FCR > 2.1 — alert
  fcrNeutral:    '#6B7280',  // No data / not yet calculable

  // Mortality rate bands
  mortalityNormal:   '#16A34A',  // < 3% cumulative — normal
  mortalityElevated: '#D97706',  // 3–5% — elevated, monitor
  mortalityCritical: '#DC2626',  // > 5% — critical, investigate

  // Weight gain trend
  gainOnTrack:  '#1A6B3C',  // Within ±5% of target
  gainBehind:   '#D97706',  // >5% below target
  gainAhead:    '#2563EB',  // >5% above target (harvest timing check)

  // Feed consumption
  feedNormal:   '#1A6B3C',  // Within expected range
  feedHigh:     '#D97706',  // >10% above expected
  feedLow:      '#DC2626',  // >15% below expected (sick birds)

  // Farm status badges
  farmActive:    '#16A34A',  // Active batch running
  farmBetween:   '#6B7280',  // Between batches (cleanout/rest)
  farmOnboarding:'#2563EB',  // Recently onboarded, first batch setup
  farmPaused:    '#D97706',  // Paused — issue flagged

  // Batch lifecycle
  batchPlacement: '#2563EB',  // Day 0 — day-old chick placement
  batchGrow:      '#1A6B3C',  // Growing phase
  batchHarvest:   '#F5A623',  // Harvest window open
  batchClosed:    '#6B7280',  // Batch closed, data locked

  // Flock health indicators
  healthGreen:   '#16A34A',  // No disease flags
  healthAmber:   '#D97706',  // Respiratory / minor flags
  healthRed:     '#DC2626',  // HPAI risk or confirmed disease

  // Chart accent (farm-module specific)
  targetLine:    '#9CA3AF',  // Dashed target/benchmark line on charts
  industryAvg:   '#C4B5FD',  // Industry average comparison line
} as const;
```

### 1.2 Farm-Module-Specific Component Tokens

```typescript
export const FarmCardTokens = {
  // Farm summary card
  cardBorder:      '1px solid #E2EBE6',
  cardRadius:      '12px',
  cardPadding:     '20px',
  cardShadow:      '0 1px 4px rgba(0,0,0,0.06)',
  cardHoverShadow: '0 4px 16px rgba(0,0,0,0.10)',
  cardHoverBg:     '#F0F7F3',

  // Status pill (on farm card top-right)
  pillRadius:   '999px',
  pillPaddingX: '10px',
  pillPaddingY: '3px',
  pillFontSize: '11px',
  pillFontWt:   600,

  // Metric mini-card inside farm card
  miniCardBg:       '#F7FAF8',
  miniCardBorder:   '1px solid #E2EBE6',
  miniCardRadius:   '8px',
  miniCardPadding:  '12px',
} as const;
```

### 1.3 Daily Log Form Design Tokens

```typescript
export const DailyLogTokens = {
  // Input field
  inputBorder:      '1px solid #D1D9D4',
  inputBorderFocus: '2px solid #1A6B3C',  // brandGreen700
  inputBorderError: '1px solid #DC2626',
  inputRadius:      '8px',
  inputPadding:     '10px 14px',
  inputFontSize:    '0.9375rem',  // 15px

  // Input group label
  labelColor:    '#374151',
  labelFontSize: '0.8125rem',  // 13px
  labelFontWt:   600,
  labelMarginB:  '6px',

  // Unit badge (kg, %, gm) shown inside/beside input
  unitBadgeBg:    '#F3F7F5',
  unitBadgeColor: '#5A7A68',
  unitBadgeFontSize: '0.75rem',

  // Auto-computed fields (FCR, daily gain — read-only)
  computedBg:    '#EEF4F1',
  computedBorder:'1px dashed #7CC49A',
  computedColor: '#1A6B3C',
  computedFontWt: 700,
} as const;
```

---

## 2. INFORMATION ARCHITECTURE — NEW SIDEBAR SECTIONS

### 2.1 Updated Left Sidebar Navigation

```
EXISTING items (unchanged — see 04_postlogin_design_master.md §2.1)

NEW items (inserted after Calculator, before API Access):
  🏠 My Farms         /dashboard/farms        [S2 Integrators only]
      ↳ Farm Portfolio (badge: X active farms)
  📋 Daily Metrics    /dashboard/metrics      [S2 Integrators only]
      ↳ Aggregated metrics across all farms
  📄 Reports          /dashboard/reports      [S2 Integrators only]
      ↳ Batch reports, P&L, performance

Sidebar item style: same as 04_postlogin_design_master.md §2.1
Farm count badge: small green pill right-aligned in nav item
  - "3" → 3 active farms
  - Updates via SWR (no Realtime subscription needed — slow-changing)

Sub-nav (appears below "My Farms" when active):
  Indented 12px, fontSize 13px, sidebarText color
  ↳ All Farms  /dashboard/farms
  ↳ + Add Farm /dashboard/farms/new
  ↳ Compare    /dashboard/farms/compare [appears only when ≥2 farms]
```

---

## 3. PAGE DESIGNS

---

### Page F-01: Farm Portfolio (`/dashboard/farms`)

**Purpose:** Overview of all onboarded farms for this integrator. Quick health scan across flock.

```
Page title: "My Farms" | "मेरे Farms"
Sub-title: "X farms · Y active batches · Z total birds under management"

─────────────────────────────────────────────────────────────────
PORTFOLIO KPI BAR (4 cards, top of page)
─────────────────────────────────────────────────────────────────
[Card 1] Total Birds (live)          [Card 2] Avg FCR (portfolio)
  Metric: 1,25,000                     Metric: 1.84
  Sub: across 5 active batches         Sub: last 7 days avg
  Icon: Phosphor Bird                  Status: fcrGood colour pill
  Trend: ▲ 5K vs last week            Sub: ↓ 0.03 vs last week (better)

[Card 3] Mortality Rate (7-day)      [Card 4] Feed Consumed (this week)
  Metric: 2.3%                         Metric: 48.2 MT
  Status: mortalityNormal green        Sub: across 5 farms
  Sub: ▲ 0.2% vs last week            Sub: ₹19.28L estimated cost
  Tooltip: cumulative mortality        Trend: ▼ 1.2 MT vs last week

─────────────────────────────────────────────────────────────────
ACTION BAR (below KPI cards)
─────────────────────────────────────────────────────────────────
Left:
  Search farms (input, 240px wide)
  Filter by status: All | Active | Between Batches | Paused (segmented control)
  Sort: By name | FCR | Mortality | Bird count | Last log

Right:
  [+ Add Farm] button — primary, brandGreen700, links to /dashboard/farms/new
  [Compare Farms] button — secondary, links to /dashboard/farms/compare

─────────────────────────────────────────────────────────────────
FARM CARDS GRID (responsive: 3-col desktop, 2-col tablet, 1-col mobile)
─────────────────────────────────────────────────────────────────
Each Farm Card:

┌─────────────────────────────────────────────┐
│  [Farm Name]                    [● Active ▾]│  ← Status pill (click = quick actions)
│  📍 Gorakhpur · Shed 4          Batch #7    │
│  ─────────────────────────────────────────  │
│  [Birds]      [Batch Age]   [Harvest In]    │
│   25,000        Day 28        ~14 days      │
│  ─────────────────────────────────────────  │
│  FCR         Mortality    Today's Log       │
│  [1.82 🟢]   [2.1% 🟢]   [✓ Logged 09:23] │
│  ─────────────────────────────────────────  │
│  Weight Gain Trend (7-day sparkline chart)  │
│  [▁▂▃▃▄▄▅] 52g/day avg (target: 55g/day)  │
│  ─────────────────────────────────────────  │
│  [View Farm]          [Log Today's Data ✏️] │
└─────────────────────────────────────────────┘

Farm Card States:
  Active (green left-border 3px):  Full data shown
  Today's log missing (amber left-border):  "⚠ आज का log pending" warning row
  Between batches (grey):  "Cleanout · Rest day X of Y" shown instead of metrics
  Paused/Issue (red left-border):  Issue description shown + "View Details" CTA
  No batch yet (blue):  "Batch setup करें" CTA, no metric rows

Hover: cardHoverShadow, subtle scale(1.01) — Framer Motion, 150ms

─────────────────────────────────────────────────────────────────
EMPTY STATE (no farms onboarded)
─────────────────────────────────────────────────────────────────
  Illustration: friendly chicken with welcome clipboard
  Heading: "पहला Farm जोड़ें"
  Sub: "अपना पहला farm onboard करें और daily metrics track करना शुरू करें।"
  CTA: "Farm जोड़ें →" (primary button, links to /dashboard/farms/new)
```

---

### Page F-02: Single Farm Detail (`/dashboard/farms/[farmId]`)

**Purpose:** Complete operational picture for one farm — current batch status, metrics history, logs.

```
Page title: "[Farm Name]"
Breadcrumb: My Farms > [Farm Name]

─────────────────────────────────────────────────────────────────
FARM HEADER BAND (top, 80px, full width, contentBg)
─────────────────────────────────────────────────────────────────
Left:
  Farm name (pageTitle style)
  📍 District · Village · GPS coordinates (if entered)
  Farm type badge: "Broiler" | "Layer" | "Breeder"
  Capacity badge: "Max 30,000 birds"

Right:
  [● Active — Batch #7]  status badge (large)
  [Edit Farm] ghost button
  [⋮ More actions] dropdown:
    → Start New Batch
    → Mark Between Batches
    → Download Farm Report (PDF)
    → Archive Farm (destructive)

─────────────────────────────────────────────────────────────────
CURRENT BATCH SUMMARY STRIP (highlighted card, full-width)
─────────────────────────────────────────────────────────────────
Batch card style: slightly elevated, brandGreen700 left-border 4px

[Batch #7]  Day 28 of ~42    Placed: 2 May 2026    Breed: Cobb 430
Birds placed: 25,000         Birds alive: 24,220    Mortality: 780 (3.12%)
Target harvest weight: 2.1 kg  Current avg weight: 1.52 kg (projected Day 42: 2.08kg)

Progress bar (0 → 42 days):  ████████████████░░░░░░ Day 28
  Markers: Day 0 (Placement) | Day 14 | Day 28 ← (today) | Day 35 (harvest window opens) | Day 42+

─────────────────────────────────────────────────────────────────
TABS (below batch strip)
─────────────────────────────────────────────────────────────────
  [📊 Metrics]  [📅 Daily Log]  [💊 Health]  [🌾 Feed]  [📦 Batch History]

── TAB: Metrics ──────────────────────────────────────────────────

ROW 1: 3 metric trend charts (Recharts LineChart, 28 days)

  [FCR Trend Chart]
    Y-axis: FCR value
    Lines: Daily FCR (chartActual colour), 7-day rolling avg (P50 colour)
    Reference line: Industry benchmark FCR 1.8 (dashed, targetLine colour)
    Background band: fcrGood zone (1.7–1.9) light green fill
    Annotation: "Best FCR: 1.74 on Day 21"
    Legend: Daily | 7-day avg | Industry avg

  [Mortality Cumulative Chart]
    Y-axis: cumulative % dead
    Line: Running mortality %
    Reference lines: 3% (warning threshold), 5% (critical threshold)
    Bar overlay: daily deaths (secondary Y-axis, bars in chartBad colour)
    Annotations: any spike events (e.g. "Day 12: heat stress — 45 deaths")

  [Avg Body Weight Progression]
    Y-axis: avg weight (grams)
    Lines: Actual weight (chartActual), Target weight curve (dashed targetLine)
    Breed standard overlay: Cobb 430 growth standard curve (industryAvg colour)
    Data points: actual weigh-in measurements (dots)
    Tooltip: date, actual weight, target weight, deviation %

ROW 2: 2 metric trend charts

  [Daily Feed Intake per Bird]
    Y-axis: grams/bird/day
    Bar chart: daily feed intake
    Line overlay: 7-day rolling avg
    Reference band: age-appropriate target intake range

  [Daily Weight Gain]
    Y-axis: grams/bird/day
    Bar chart: actual gain per day
    Target line: target ADG for breed/age
    Colour: green if on target, amber if 5-10% off, red if >10% off

─────────────────────────────────────────────────────────────────
── TAB: Daily Log ──────────────────────────────────────────────

Log table: chronological, newest first, paginated 30 rows/page

Columns:
  Date | Day # | Birds Dead | Mortality % | Feed Consumed | FCR | Avg Weight | Water | Temp | Notes | Actions

Row colour-coding:
  Normal day: white
  High mortality (>1% daily): amber row tint
  Missing data fields: orange dot in cell
  Log entered late (>6h after 06:00): grey italic timestamp

Above table: [+ Log Today's Data] primary button (if today not logged)
             [Export CSV] ghost button

Quick entry: click any cell → inline edit (for corrections, admin only)
Entry lock: logs >7 days old are locked (grey, cannot edit without admin override)

─────────────────────────────────────────────────────────────────
── TAB: Health ─────────────────────────────────────────────────

Current health status:
  Large status badge: "🟢 Healthy" | "🟡 Monitor" | "🔴 Alert"
  Last updated: "Aaj, 09:23 AM"

Vaccination schedule table:
  Columns: Vaccine | Type | Scheduled Day | Due Date | Status | Admin Route | Notes
  Status badges: Pending | Done | Overdue (red)

Disease / Treatment log:
  Timeline of health events:
    [Day 14] Mild respiratory symptoms in Shed A — treated with [Drug]
    [Day 20] HPAI advisory: district alert issued — no farm-level signs
  Each event: severity badge, symptoms recorded, treatment given, outcome

Symptom quick-log:
  Inline card: "आज कोई symptom है? [हाँ / नहीं]"
  If yes → expands: checkboxes for symptom type (respiratory, digestive, neurological, mortality spike)
  + free text notes

─────────────────────────────────────────────────────────────────
── TAB: Feed ───────────────────────────────────────────────────

Feed inventory tracker:
  Current stock: [Opening stock - consumed to date = remaining]
  Visual: horizontal progress bar (stock level)
  Low stock warning: amber banner if <5 days of feed remaining

Feed purchase log table:
  Columns: Date | Supplier | Type (Starter/Grower/Finisher) | Qty (MT) | Rate (₹/kg) | Total Cost | Invoice #

Feed cost summary card:
  Feed cost this batch: ₹X
  Feed cost per kg of bird produced (estimated): ₹X
  Feed as % of total cost: X%
  Comparison: ₹X vs last batch (▲▼ X%)

─────────────────────────────────────────────────────────────────
── TAB: Batch History ──────────────────────────────────────────

Table of all completed batches for this farm:
  Columns: Batch # | Breed | Placed | Birds In | Birds Out | Mortality % | FCR | Avg Weight | Revenue | Profit | Duration | Report

  Current batch row: highlighted with "Current" badge
  Each row: [View Report] links to /dashboard/reports/integrator?batch=[id]

Bottom summary:
  Farm lifetime averages: Avg FCR, Avg Mortality, Avg Revenue/batch
  "X batches completed since onboarding"
```

---

### Page F-03: Daily Metric Log Entry (`/dashboard/farms/[farmId]/daily-log`)

**Purpose:** The primary daily-use screen for farm managers. Mobile-friendly, fast entry, submit in <60 seconds.

```
Page title: "Daily Log — [Farm Name]"
Sub-title: "[Date] · Batch #7 · Day 28"

Design principle: Form-first, friction-minimal. Most fields pre-filled or auto-computed.
Mobile: this page must be fully usable at 390px width (farm managers log on phones).

─────────────────────────────────────────────────────────────────
ALREADY LOGGED STATE (if today's log submitted)
─────────────────────────────────────────────────────────────────
Full-width success card:
  ✅ "आज का log submit हो गया है — 09:23 AM"
  Shows submitted values summary (read-only)
  [Edit Log] ghost button (triggers edit mode, timestamps amendment)

─────────────────────────────────────────────────────────────────
ENTRY FORM (if not yet logged today)
─────────────────────────────────────────────────────────────────

SECTION A: Mortality
  Field: Today's deaths (integer)       Unit badge: birds
  Field: Cause (optional)               Dropdown: Unknown | Heat | Disease | Injury | Cull | Other
  Auto-computed (read-only):
    Cumulative deaths: [X birds] [X%]
    Status indicator: 🟢 Normal | 🟡 Elevated | 🔴 Critical

SECTION B: Feed
  Field: Feed given today               Unit badge: kg
  Field: Feed type                      Dropdown: Starter | Grower | Finisher
  Auto-computed (read-only):
    Feed per bird today: [X gm/bird]
    Cumulative feed total: [X kg]
    Estimated FCR (if weight entered): [X.XX]

SECTION C: Weight (enter on weigh-in days — optional)
  Toggle: "आज weigh-in हुआ?"  [हाँ / नहीं]
  If हाँ:
    Field: Sample size (birds weighed)  Unit badge: birds
    Field: Total sample weight          Unit badge: kg
    Auto-computed: Avg weight per bird [X gm]
    vs target: [+X gm / -X gm]
    vs last weigh-in: [+X gm gain in X days = X g/day ADG]

SECTION D: Water & Environment
  Field: Water consumed today           Unit badge: litres
  Field: Min temp today                 Unit badge: °C
  Field: Max temp today                 Unit badge: °C
  Field: Humidity (optional)            Unit badge: %

SECTION E: Health Observation
  Toggle: "कोई health issue?"  [नहीं (default) / हाँ]
  If हाँ:
    Multi-select checkboxes: Respiratory | Digestive | Leg weakness | Skin lesions | Neuro signs | Other
    Text area: Description (optional, 200 char max)
    Severity: [Mild / Moderate / Severe] segmented control

SECTION F: Notes (optional)
  Text area: Free text, 500 chars max
  Placeholder: "कोई special observation? Visitor, power cut, water issue, medication given..."

─────────────────────────────────────────────────────────────────
FORM FOOTER
─────────────────────────────────────────────────────────────────
[Submit Log for Today]   primary button, full-width on mobile
  Disabled until Section A (mortality) and Section B (feed) are filled
  On submit: POST /api/farms/[id]/daily-log
  Success: inline ✅ confirmation + redirect to farm detail page
  Error: inline error message (Don Norman — never raw API error)

Autosave: localStorage draft every 30 seconds (draft badge shown)
  "Draft saved 09:14 AM — आपका draft save हो गया है"

─────────────────────────────────────────────────────────────────
LATE SUBMISSION HANDLING
─────────────────────────────────────────────────────────────────
If today's log not submitted by 20:00 IST:
  WhatsApp reminder sent (automated)
  In-app banner on all dashboard pages: "⚠ [Farm Name] का आज का log pending है"
  Log for previous days (within 7 days): yellow banner on form: "यह [date] का log है"
```

---

### Page F-04: Add / Onboard New Farm (`/dashboard/farms/new`)

**Purpose:** Multi-step wizard to onboard a new farm under this integrator account.

```
Page title: "नया Farm जोड़ें"
Layout: centered wizard, max-width 640px, step indicator at top

─────────────────────────────────────────────────────────────────
STEP INDICATOR (top of page)
─────────────────────────────────────────────────────────────────
  ● Farm Info → ● Shed Setup → ● First Batch → ● Review & Save
  (4 circles, connected by line, filled for completed steps)

─────────────────────────────────────────────────────────────────
STEP 1: Farm Information
─────────────────────────────────────────────────────────────────
  Farm name*                   Text input, max 60 chars
  Farm type*                   Radio: Broiler | Layer | Breeder
  State*                       Dropdown (pre-filled: Uttar Pradesh)
  District*                    Dropdown (linked to state)
  Block / Tehsil               Text input (optional)
  Village                      Text input (optional)
  GPS Coordinates              [Use my location] button OR manual lat/lon
  Farm manager name            Text input (optional — for multi-farm integrators)
  Farm manager phone           Phone input (for WhatsApp alerts routing)

─────────────────────────────────────────────────────────────────
STEP 2: Shed Setup
─────────────────────────────────────────────────────────────────
  Number of sheds*             Number input (1–20)
  Per shed: (repeat for N sheds)
    Shed name/number           Text input ("Shed A", "Shed 1", etc.)
    Shed capacity (birds)*     Number input
    Shed type                  Radio: Open-sided | Environment-controlled | Semi-controlled
    Floor type                 Radio: Litter | Slat | Cage (Layer)
  Total farm capacity:         Auto-computed, shown as read-only summary

─────────────────────────────────────────────────────────────────
STEP 3: First Batch (optional — can skip and set up later)
─────────────────────────────────────────────────────────────────
  "पहला Batch अभी setup करें?" toggle [हाँ / बाद में करूँगा]
  If हाँ:
    Breed*                     Dropdown: Cobb 430 | Ross 308 | Hubbard | Vencobb | Srinivasa | Other
    Day-old chick (DOC) supplier Text input
    Placement date*            Date picker (today or past date)
    Chicks placed*             Number input
    Price per DOC              Number input (₹) — optional, for P&L tracking
    Target harvest age         Number input (days, default: 42)
    Target market weight       Number input (grams, default: 2100)
    Feed supplier              Text input (optional)
    Batch notes                Text area (optional)
  If skip: farm saved with "No active batch" status

─────────────────────────────────────────────────────────────────
STEP 4: Review & Save
─────────────────────────────────────────────────────────────────
  Summary card showing all entered data
  Edit links for each section
  [Save Farm & Start Tracking] primary button
  Success state: confetti micro-animation + redirect to /dashboard/farms/[newFarmId]
  "🎉 [Farm Name] successfully onboarded!"
```

---

### Page F-05: Farm Compare (`/dashboard/farms/compare`)

**Purpose:** Side-by-side comparison of 2–5 farms across key performance metrics.

```
Page title: "Farm Performance Compare करें"
Access: S2 integrators with ≥2 active farms

─────────────────────────────────────────────────────────────────
FARM SELECTOR (top of page)
─────────────────────────────────────────────────────────────────
  Multi-select pill picker: shows all integrator's farms
  Select 2–5 farms to compare
  Period selector: Current Batch | Last 30 Days | Last 90 Days | Custom

─────────────────────────────────────────────────────────────────
COMPARISON TABLE (radar + table hybrid)
─────────────────────────────────────────────────────────────────
  Radar chart (Recharts RadarChart):
    Axes: FCR | Mortality | ADG | Feed Efficiency | Harvest Weight | Batch Duration
    Each selected farm = one polygon, different colour
    Legend: farm names with colour swatch

  Table below radar:
    Metric         | Farm A  | Farm B  | Farm C  | Best   | Industry Avg
    FCR            | 1.82 🟢 | 1.95 🟡 | 1.77 🟢 | 1.77   | 1.85
    Mortality      | 2.1% 🟢 | 3.8% 🟡 | 1.8% 🟢 | 1.8%   | 3.0%
    Avg Daily Gain | 52 g/d  | 48 g/d  | 56 g/d  | 56 g/d | 54 g/d
    ...

  Best performer: column highlighted in faint brandGreen700 bg
  Industry avg column: sourced from aggregated (anonymised) platform data

Export: [Download Comparison Report] → PDF via /api/reports/compare
```

---

### Page M-01: Aggregated Metrics Dashboard (`/dashboard/metrics`)

**Purpose:** Portfolio-level metrics for the integrator — a bird's-eye view across all farms.

```
Page title: "Portfolio Metrics"
Sub-title: "X farms · Y active batches · Period: [selector]"

Period selector (top-right): This Week | This Month | This Batch Cycle | Custom

─────────────────────────────────────────────────────────────────
ROW 1: 5 KPI Cards (portfolio-level)
─────────────────────────────────────────────────────────────────
  [Total Live Birds]     [Portfolio FCR]    [Portfolio Mortality]
  [Total Feed Consumed]  [Est. Revenue at Harvest]

  Each card: same design as 04_postlogin_design_master.md §3 KPI cards
  + trend arrow vs previous equivalent period
  + click → navigates to that metric's detail page

─────────────────────────────────────────────────────────────────
ROW 2: 2 Charts (side by side, 50/50)
─────────────────────────────────────────────────────────────────
  Left: FCR Trend (30 days)
    Multi-line chart: one line per active farm + portfolio avg
    Target/benchmark line: industry avg FCR (dashed)

  Right: Mortality Events Timeline
    Combined bar+line chart: daily deaths (bars) + cumulative % (line)
    Click any spike → opens investigation sidebar with farm + date context

─────────────────────────────────────────────────────────────────
ROW 3: Farm Performance League Table
─────────────────────────────────────────────────────────────────
  Heading: "Farm Performance Ranking"
  Table:
    Rank | Farm Name | FCR | Mortality | ADG | Birds | Status | Last Log
    Rows sorted by FCR (ascending — lower is better)
    Best farm: green trophy icon
    Worst: amber flag icon
  Click row → /dashboard/farms/[id]

─────────────────────────────────────────────────────────────────
ROW 4: Pending Actions Panel
─────────────────────────────────────────────────────────────────
  Amber banner if any:
    "⚠ 2 farms have not logged today's data"  [Log Now →]
    "⚠ 1 farm has overdue vaccination: Ram Nagar Farm, Batch #3"
    "⚠ Feed stock low: Sahib Farm — est. 4 days remaining"  [View →]
```

---

### Page M-02: FCR Analysis (`/dashboard/metrics/fcr`)

```
Page title: "Feed Conversion Ratio — Analysis"

Period + Farm filter (top)

Section 1: Portfolio FCR trend (30/90-day Recharts LineChart)
  All-farm overlay + portfolio average + industry benchmark

Section 2: FCR by Farm (horizontal bar chart)
  Sorted ascending (best first)
  Colour-coded by FCR band (fcrExcellent / fcrGood / fcrWarning / fcrCritical)
  Click bar → opens farm detail drawer (right side panel)

Section 3: FCR Breakdown Table
  Farm | Batch # | Day | Feed/Bird/Day | Avg Weight | FCR | vs Last Batch | vs Industry
  Sortable, exportable

Section 4: FCR Improvement Recommendations (AI-generated)
  Card: "Sahib Farm FCR 1.97 — यहाँ क्या देखें:"
  Bullet points: feed wastage check, feeder height, diet formulation, ventilation
  Note: "यह सुझाव हैं, पोल्ट्री expert से confirm करें"
  Source badge: "PoultryPulse AI Recommendations · Not veterinary advice"
```

---

### Page M-03: Mortality Tracking (`/dashboard/metrics/mortality`)

```
Page title: "Mortality Tracking"

Alert strip (if any farm in elevated/critical zone):
  Red banner: "⚠ [Farm] में mortality rate X% — investigate करें"
  Links to farm detail

Section 1: Combined mortality chart (area chart, cumulative %, by farm)

Section 2: Daily death events timeline (all farms)
  Stacked bar chart: deaths per farm per day (different colour per farm)
  Click any bar → drill to that farm's daily log entry

Section 3: Cause of death analysis (if cause logged)
  Pie/donut chart: Unknown | Heat | Disease | Injury | Cull | Other

Section 4: Mortality log table (all farms, 30 days)
  Farm | Date | Day # | Deaths | Cause | Cumulative % | Action Taken

Section 5: HPAI Risk Correlation (links to price intelligence alerts)
  "क्या आपके जिले में HPAI advisory है?"
  Cross-reference with /dashboard/alerts HPAI data
```

---

### Page M-04: Feed Consumption & Cost (`/dashboard/metrics/feed`)

```
Page title: "Feed Management"

Section 1: Feed consumption chart (all farms, 30 days)
  Stacked bar chart: kg/day per farm
  Overlay: gm/bird/day efficiency line (secondary Y-axis)

Section 2: Feed cost tracker
  Table: Farm | Batch | Feed Type | Qty (MT) | Rate | Total Cost | Cost/kg Produced
  Bottom row: Portfolio total

Section 3: Feed rate trend (line chart)
  Purchase price per kg over last 6 months
  Links to NCDEX maize/soya data from price intelligence module

Section 4: Low stock alerts
  Cards for any farm with <7 days feed stock remaining
  [Order Now CTA] — opens WhatsApp with pre-filled supplier message

Section 5: Feed efficiency comparison
  Farm | Avg Feed/Bird/Day (this batch) | Target | Variance | Status
```

---

### Page M-05: Health Log & Disease Tracker (`/dashboard/metrics/health`)

```
Page title: "Flock Health"

Section 1: Portfolio health status summary
  Traffic light grid: one cell per farm, colour = health status (green/amber/red)
  Click cell → farm detail

Section 2: Vaccination compliance tracker
  Table: Farm | Vaccine | Due Date | Status | Days Overdue
  Overdue rows highlighted red

Section 3: Health event timeline (all farms, 60 days)
  Chronological event cards:
    [Farm] [Date] [Severity badge] [Symptom summary] [Action taken]
  Filter: All | Critical | Moderate | Mild

Section 4: HPAI district alert integration
  Pulls from /dashboard/alerts HPAI data
  "आपके district में HPAI advisory active है — precautions:"
  Biosecurity checklist (toggleable checkboxes, saved state)
```

---

### Page R-01: Batch Report (`/dashboard/reports/integrator`)

**Purpose:** Full batch performance report — auto-generated at batch close, downloadable as PDF.

```
Page title: "Batch Report — [Farm] Batch #X"

Report sections:
  1. Batch Summary
     Farm, batch #, breed, DOC supplier, dates, duration
     Birds in → birds out → mortality count & %

  2. Growth Performance
     FCR, ADG, harvest weight, vs target, vs last batch, vs industry

  3. Mortality Analysis
     Day-by-day chart, causes breakdown, spike events

  4. Feed Summary
     Total feed, cost, cost/kg produced, feed types used

  5. Health Log Summary
     Vaccination compliance, health events, treatments

  6. Financial Summary (if cost data entered)
     Revenue (birds × avg weight × PoultryPulse P50 price)
     Feed cost, DOC cost, other costs
     Estimated gross profit

  7. Recommendations for Next Batch
     Auto-generated based on this batch's performance

Footer: Report generated by PoultryPulse AI · [Date] · Not a certified audit report

Export:
  [Download PDF] → /api/reports/[batchId]/pdf
  [Export CSV] → raw data
  [Share via WhatsApp] → PDF link shared to integrator's phone
```

---

## 4. MOBILE DESIGN — DAILY LOG PRIORITY

```
The daily log form (/dashboard/farms/[id]/daily-log) is the highest-frequency
mobile touchpoint. Farm managers log on phones, often with one hand, in shed conditions.

Mobile-specific design rules (375–430px viewports):

Layout:
  - Single-column, full-width inputs
  - Section headers as full-width dividers (not inline labels)
  - [Submit] button: fixed-bottom, full-width, 56px height

Input sizing:
  - All inputs: 52px height (larger touch target than desktop 40px)
  - Font size: 16px minimum (prevents iOS zoom on focus)
  - Number inputs: native numeric keyboard (inputmode="numeric")

Section collapsing:
  - Section D (Water & Environment) and E (Health) collapsed by default on mobile
  - Tap header to expand — reduces initial form length

Numeric pad optimization:
  - Deaths, feed, weight fields: inputMode="numeric" + pattern="[0-9]*"
  - FCR and computed fields: auto-calculated and displayed in large green text

Offline mode:
  - Form data saved to IndexedDB if network drops
  - "Offline — log will submit when connection returns" amber banner
  - Auto-submit when connection restored

Auto-fill intelligence:
  - Deaths default: 0 (most common value)
  - Feed default: yesterday's feed quantity (pre-filled, editable)
  - Temperature: pre-filled from IMD forecast for that district (if available)
```

---

## 5. EMPTY STATES — FARM MODULE

```
All empty states follow 04_postlogin_design_master.md §4 pattern.

No farms onboarded:
  Illustration: chicken with clipboard and welcome sign
  Heading: "पहला Farm जोड़ें 🐔"
  Sub: "Integrators के लिए: अपने सभी farms को PoultryPulse पर manage करें।
        FCR, mortality, feed — सब एक जगह।"
  CTA: "+ Farm जोड़ें"

No active batch on a farm:
  Illustration: empty shed drawing
  Heading: "कोई active batch नहीं"
  Sub: "नया batch place होने पर daily tracking शुरू हो जाएगी।"
  CTA: "Batch Setup करें"

No health events:
  Illustration: healthy chicken with stethoscope
  Heading: "सब ठीक है! 🐓"
  Sub: "कोई health issue record नहीं है। Daily health check log करते रहें।"

No data in metric chart (first day):
  Heading: "Data collect हो रहा है..."
  Sub: "Daily log submit करते रहें — 3–5 दिन में charts दिखने लगेंगे।"

Compare page — only 1 farm:
  Heading: "Compare के लिए कम से कम 2 farms चाहिए"
  Sub: "एक और farm onboard करें।"
  CTA: "+ Farm जोड़ें"
```

---

## 6. ERROR STATES — FARM MODULE

```
All errors follow Don Norman's principle from 04_postlogin_design_master.md §5.

Log already submitted today:
  Not an error — success state with edit option.

Log submit failed (network):
  Toast: "Log save नहीं हो सका — internet check करें"
  Draft preserved in localStorage
  Retry button shown

Farm not found (invalid farmId):
  Heading: "यह Farm नहीं मिला"
  Sub: "यह farm आपके account में नहीं है।"
  CTA: "All Farms →"

Batch data corrupted / missing:
  Amber inline banner: "⚠ कुछ data load नहीं हो सका। Page refresh करें।"
  Refresh button inline

Duplicate log submission attempt:
  Modal: "आज का log पहले से submit हो चुका है (09:23 AM)।
          क्या आप उसे edit करना चाहते हैं?"
  Actions: [Edit Existing Log] | [Cancel]
```

---

## 7. NOTIFICATIONS — FARM & METRICS MODULE

```
New notification types (extends 04_postlogin_design_master.md §D-03 Alerts):

  DAILY_LOG_REMINDER:
    Trigger: 08:00 IST if yesterday's log not submitted
    Channel: WhatsApp + in-app banner
    Message: "[Farm Name] का कल का log submit करें"

  HIGH_MORTALITY_ALERT:
    Trigger: daily mortality > 1.5% on any farm
    Channel: WhatsApp (immediate) + in-app badge
    Message: "[Farm Name] में आज mortality X% — जाँच करें"

  FCR_DEGRADATION_ALERT:
    Trigger: 7-day rolling FCR worsens by >0.15 vs previous 7 days
    Channel: In-app alert card + WhatsApp weekly digest
    Message: "[Farm Name] FCR बढ़ रहा है (1.82 → 1.97) — feed/ventilation check करें"

  LOW_FEED_STOCK_ALERT:
    Trigger: Estimated feed stock < 5 days remaining
    Channel: WhatsApp + in-app banner
    Message: "[Farm Name] में feed stock कम है (est. 4 दिन) — order करें"

  VACCINATION_DUE_ALERT:
    Trigger: Vaccination due in 3 days
    Channel: WhatsApp + in-app notification
    Message: "[Farm Name] में [Vaccine] due है: [Date]"

  HARVEST_WINDOW_ALERT:
    Trigger: Bird reaches target weight / harvest age approaches (Day 35+)
    Channel: WhatsApp + in-app + links to Price Intelligence
    Message: "[Farm Name] harvest window खुल रही है। आज का broiler P50 price: ₹X/kg"

  BATCH_CLOSE_REPORT_READY:
    Trigger: Batch marked as closed
    Channel: WhatsApp link + in-app
    Message: "[Farm Name] Batch #X report ready है — download करें"
```

---

## 8. DATABASE SCHEMA — NEW TABLES (Supabase PostgreSQL)

```sql
-- ────────────────────────────────────────────────────────────
-- farms: one row per physical farm location
-- ────────────────────────────────────────────────────────────
CREATE TABLE farms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  farm_type         TEXT NOT NULL CHECK (farm_type IN ('broiler','layer','breeder')),
  district          TEXT NOT NULL,
  state             TEXT NOT NULL DEFAULT 'Uttar Pradesh',
  block             TEXT,
  village           TEXT,
  lat               DECIMAL(10,7),
  lng               DECIMAL(10,7),
  manager_name      TEXT,
  manager_phone     TEXT,
  total_capacity    INTEGER,       -- max birds this farm can hold
  status            TEXT NOT NULL DEFAULT 'onboarding'
                    CHECK (status IN ('active','between_batches','paused','archived','onboarding')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: integrator can only see/modify their own farms
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY farms_owner ON farms
  USING (integrator_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- sheds: sheds within a farm
-- ────────────────────────────────────────────────────────────
CREATE TABLE sheds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id     UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,      -- "Shed A", "Shed 1"
  capacity    INTEGER NOT NULL,
  shed_type   TEXT CHECK (shed_type IN ('open_sided','env_controlled','semi_controlled')),
  floor_type  TEXT CHECK (floor_type IN ('litter','slat','cage')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- batches: one flock cycle per farm
-- ────────────────────────────────────────────────────────────
CREATE TABLE batches (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id               UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_number          INTEGER NOT NULL,
  breed                 TEXT,
  doc_supplier          TEXT,
  placement_date        DATE NOT NULL,
  birds_placed          INTEGER NOT NULL,
  price_per_doc         DECIMAL(8,2),       -- ₹/chick
  target_harvest_age    INTEGER DEFAULT 42, -- days
  target_market_weight  INTEGER DEFAULT 2100, -- grams
  feed_supplier         TEXT,
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','harvesting','closed')),
  closed_at             DATE,
  birds_harvested       INTEGER,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (farm_id, batch_number)
);

-- ────────────────────────────────────────────────────────────
-- daily_logs: one row per farm per day
-- ────────────────────────────────────────────────────────────
CREATE TABLE daily_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id              UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  farm_id               UUID NOT NULL REFERENCES farms(id),
  log_date              DATE NOT NULL,
  batch_day             INTEGER NOT NULL,  -- computed: log_date - placement_date
  deaths_today          INTEGER NOT NULL DEFAULT 0,
  death_cause           TEXT CHECK (death_cause IN ('unknown','heat','disease','injury','cull','other')),
  cumulative_deaths     INTEGER,          -- maintained by trigger
  cumulative_mortality_pct DECIMAL(5,2),  -- maintained by trigger
  feed_consumed_kg      DECIMAL(10,2) NOT NULL,
  feed_type             TEXT CHECK (feed_type IN ('starter','grower','finisher')),
  feed_per_bird_g       DECIMAL(8,2),     -- computed
  cumulative_feed_kg    DECIMAL(12,2),    -- maintained by trigger
  -- Weight (only on weigh-in days)
  sample_birds          INTEGER,
  sample_weight_kg      DECIMAL(8,2),
  avg_weight_g          DECIMAL(8,2),     -- computed: sample_weight_kg/sample_birds*1000
  -- FCR: computed when weight available
  fcr                   DECIMAL(5,3),     -- computed: cumulative_feed / (live_birds * avg_weight/1000)
  -- Environment
  water_litres          DECIMAL(8,2),
  temp_min_c            DECIMAL(4,1),
  temp_max_c            DECIMAL(4,1),
  humidity_pct          DECIMAL(4,1),
  -- Health
  health_issue          BOOLEAN DEFAULT FALSE,
  health_symptoms       TEXT[],           -- array of symptom tags
  health_severity       TEXT CHECK (health_severity IN ('mild','moderate','severe')),
  health_notes          TEXT,
  -- Meta
  notes                 TEXT,
  submitted_by          UUID REFERENCES customers(id),
  submitted_at          TIMESTAMPTZ DEFAULT now(),
  is_amended            BOOLEAN DEFAULT FALSE,
  amended_at            TIMESTAMPTZ,
  amended_by            UUID REFERENCES customers(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (batch_id, log_date)
);

-- ────────────────────────────────────────────────────────────
-- vaccinations: vaccination schedule per batch
-- ────────────────────────────────────────────────────────────
CREATE TABLE vaccinations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  vaccine_name    TEXT NOT NULL,
  vaccine_type    TEXT,
  scheduled_day   INTEGER NOT NULL,
  due_date        DATE NOT NULL,
  administered_date DATE,
  admin_route     TEXT,     -- drinking water, spray, injection
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','done','overdue','skipped')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- feed_purchases: feed stock management
-- ────────────────────────────────────────────────────────────
CREATE TABLE feed_purchases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id      UUID REFERENCES batches(id),
  purchase_date DATE NOT NULL,
  supplier      TEXT,
  feed_type     TEXT CHECK (feed_type IN ('starter','grower','finisher','other')),
  qty_kg        DECIMAL(10,2) NOT NULL,
  rate_per_kg   DECIMAL(8,2),
  total_cost    DECIMAL(12,2),
  invoice_number TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- Materialized view: farm_metrics_summary (refreshed hourly)
-- For fast portfolio dashboard loads
-- ────────────────────────────────────────────────────────────
CREATE MATERIALIZED VIEW farm_metrics_summary AS
SELECT
  f.id AS farm_id,
  f.integrator_id,
  f.name AS farm_name,
  f.status AS farm_status,
  b.id AS batch_id,
  b.batch_number,
  b.placement_date,
  b.birds_placed,
  CURRENT_DATE - b.placement_date AS batch_day,
  b.birds_placed - COALESCE(SUM(dl.deaths_today), 0) AS birds_alive,
  ROUND(COALESCE(SUM(dl.deaths_today), 0)::NUMERIC / NULLIF(b.birds_placed, 0) * 100, 2) AS mortality_pct,
  ROUND(MAX(dl.fcr), 3) AS latest_fcr,
  MAX(dl.avg_weight_g) AS latest_weight_g,
  MAX(dl.log_date) AS last_log_date
FROM farms f
LEFT JOIN batches b ON b.farm_id = f.id AND b.status = 'active'
LEFT JOIN daily_logs dl ON dl.batch_id = b.id
GROUP BY f.id, f.integrator_id, f.name, f.status, b.id, b.batch_number, b.placement_date, b.birds_placed
WITH DATA;

CREATE UNIQUE INDEX ON farm_metrics_summary (farm_id);
```

---

## 9. ACCESSIBILITY — FARM MODULE (extends §8 of 04_postlogin_design_master.md)

```
Daily log form:
  - All form fields: associated <label htmlFor> — no placeholder-only labels
  - Computed fields: aria-label="Computed FCR value" + aria-readonly="true"
  - Section toggles: aria-expanded on section headers
  - Submit button: aria-busy="true" while submitting, aria-disabled when fields incomplete
  - Offline state: aria-live="polite" region for offline/sync status

Farm cards grid:
  - Each card: <article> element with aria-label="[Farm Name] — [Status]"
  - Status badges: not colour-only — text label always present
  - FCR/mortality badges: aria-label="FCR 1.82, Good" (not just colour)

Charts (all Recharts):
  - aria-label on all ResponsiveContainer
  - Hidden data table as screen reader alternative
  - Radar chart: aria-describedby pointing to comparison table below

Metric status indicators (🟢🟡🔴):
  - Never emoji-only — always text: "FCR Good 🟢" not just "🟢"
  - aria-label on status icon: aria-label="Status: Good"
```

---

*Document: 14_integrator_farms_design_master.md*
*Next: 15_integrator_farms_tasks_master.md*
*© 2026 PoultryPulse AI Technologies Pvt. Ltd. | CONFIDENTIAL*
