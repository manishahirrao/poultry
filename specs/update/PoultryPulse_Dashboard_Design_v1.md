# PoultryPulse AI — Dashboard Enhancement Design Specification
**Document Type:** Design Specification (Kiro-Compatible)  
**Version:** 1.0 · May 2026  
**Classification:** CONFIDENTIAL — Engineering & Design Use  
**Author:** Senior Software Head · Apple Design Philosophy + SaaS Growth Layer  
**References:** PRD v3.0, TRD v1.0, Architecture v1.0, UI/UX Design v1.0, Requirements v1.0  
**Competitors Analyzed:** Navfarm Poultry ERP, PoultryPlan (OptiSuite)

---

## 1. Design Philosophy & Direction

### 1.1 The Immovable Design Truth

PoultryPulse is not an analytics product. It is a **decision product**. Every pixel exists to answer one question: *"What should I do with my birds right now?"*

This distinction separates PoultryPulse from Navfarm (operations management) and PoultryPlan (chain benchmarking). Our visual language must embody decisiveness: clear hierarchy, high-contrast signals, zero ambiguity in the primary number.

The design direction is **Precision Industrial** — the aesthetic of a Bloomberg terminal refined for a Hindi-speaking farmer. Dense with meaning, sparse with decoration. Every element earns its place by informing a decision.

### 1.2 Enhanced Design Token System

All dashboard enhancement components extend the existing v1.0 design token system. New tokens are additive — no existing tokens are modified.

```
/* EXTENDED DESIGN TOKENS — Dashboard Enhancement v1.0 */

/* Existing tokens preserved (see UI/UX Design v1.0 Section 1.2) */

/* NEW: Data Visualization Tokens */
--color-viz-actual: #1A6B3C;          /* Solid green — historical/actual data lines */
--color-viz-forecast: #F5A623;         /* Amber — forecast/predicted data */
--color-viz-p10-p90: rgba(26,107,60,0.12);  /* Low-opacity green — confidence bands */
--color-viz-p50: #1A6B3C;             /* Green — P50 median forecast line */
--color-viz-negative: #C0392B;         /* Red — price drops, losses */
--color-viz-neutral: #7A9C8A;          /* Neutral green-grey — reference lines */

/* NEW: Status Tokens */
--color-status-excellent: #1A6B3C;    /* MAPE <6%, directional >95% */
--color-status-good: #2ECC71;          /* Within acceptable range */
--color-status-warning: #F5A623;       /* MAPE 6–8%, approaching threshold */
--color-status-critical: #C0392B;      /* MAPE >8%, directional <90% */
--color-status-offline: #7A9C8A;       /* Stale data, offline mode */

/* NEW: Map Tokens */
--color-map-high-price: #1A6B3C;      /* Green — high sell opportunity */
--color-map-mid-price: #F5A623;        /* Amber — moderate opportunity */
--color-map-low-price: #C0392B;        /* Red — poor selling conditions */
--color-map-hpai-ring: #C0392B;        /* Red ring — disease zone */
--color-map-selected: #1C2B22;         /* Dark — selected district */

/* NEW: Chart Grid Tokens */
--color-chart-grid: rgba(122,156,138,0.15);   /* Subtle grid lines */
--color-chart-axis: #7A9C8A;                   /* Axis labels */
--color-chart-tooltip-bg: #1C2B22;             /* Dark tooltip background */
--color-chart-tooltip-text: #FFFFFF;           /* White tooltip text */

/* NEW: Layout Tokens */
--sidebar-width: 240px;               /* Collapsed: 64px */
--header-height: 64px;
--widget-border-radius: 16px;          /* Slightly larger than card radius for dashboard feel */
--widget-padding: 24px;
--widget-gap: 20px;

/* NEW: Animation Tokens */
--animation-data-refresh: 0.3s ease-in-out;  /* Widget data update transition */
--animation-alert-pulse: 2s ease-in-out infinite;  /* Alert badge pulse */
--animation-hpai-ring: 3s ease-out infinite;        /* Disease zone ring animation */
--animation-skeleton: 1.5s ease-in-out infinite alternate;  /* Loading shimmer */
```

### 1.3 Typography Additions (Web Dashboard)

The mobile spec uses Noto Sans Devanagari exclusively. The web dashboard adds a secondary typeface for data-dense B2B contexts where Latin numerals and labels dominate:

| Style | Font | Size | Weight | Usage |
|---|---|---|---|---|
| `data-hero` | IBM Plex Mono | 64px | 600 | Price hero on web dashboard |
| `data-label` | IBM Plex Sans | 14px | 500 | Chart axis labels, widget headers |
| `data-value` | IBM Plex Mono | 24px | 600 | KPI card values |
| `data-meta` | IBM Plex Sans | 12px | 400 | Timestamps, data source labels |
| `dashboard-heading` | IBM Plex Sans | 20px | 600 | Widget titles |
| `sidebar-label` | IBM Plex Sans | 13px | 500 | Navigation labels |

*Rationale: IBM Plex Mono for data values evokes precision instruments (Bloomberg, trading terminals). IBM Plex Sans for supporting text maintains the industrial precision aesthetic. The contrast with Noto Sans Devanagari on Hindi elements creates a clear visual hierarchy between "system information" and "user-facing content."*

---

## 2. Web Dashboard — Layout Architecture

### 2.1 Shell Layout

The enhanced web dashboard uses a **fixed-sidebar + scrollable-main** layout pattern, replacing any earlier full-page navigation approach.

```
┌─────────────────────────────────────────────────────────────┐
│ TOPBAR (64px) — Logo · District Selector · Alert Bell · User│
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  SIDEBAR     │         MAIN CONTENT AREA                   │
│  (240px)     │         (scrollable)                        │
│              │                                              │
│  Navigation  │         Current Route Component             │
│  (role-      │                                              │
│  filtered)   │                                              │
│              │                                              │
│  [collapsed  │                                              │
│  on mobile:  │                                              │
│  bottom tabs]│                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**Topbar Specification:**

| Element | Position | Spec |
|---|---|---|
| PoultryPulse Logo | Left, 16px from edge | 32px height SVG wordmark. Links to dashboard root. |
| Global District Selector | Center-left | Multi-select pill group. Persists via URL params. Accessible from every route. |
| Active Alerts Bell | Right, 48px from user | Bell icon with count badge (red dot). Clicking opens alert drawer overlay. |
| Model Status Dot | Right, 80px from user | Green/amber/red dot indicating current model health. Tooltip: MAPE + last retrain. |
| User Avatar + Role | Right edge | Initials avatar. Dropdown: Profile, API Keys, Logout. Role badge beneath name. |

**Sidebar Navigation Specification (Role-Filtered):**

```
SIDEBAR STRUCTURE
─────────────────
  🏠 Overview          [All roles]
  ────────────
  📊 Price Intelligence
     └ Forecast
     └ Historical
     └ Download
  🗺️ District Map       [S2, S5, Admin]
  ⚡ Alerts              [All roles]
  ────────────
  🧮 Batch Optimizer   [S1, S2]
  🌾 Feed Intelligence  [S1, S2, S3]
  🤝 Middleman Check   [S1, S2]
  ────────────
  🔑 API Console        [S5, Admin]
  📈 Accuracy           [Admin, S5 subset]
  👥 Customers          [Admin]
  🔍 Watermark Audit    [Admin]
  📱 WhatsApp Analytics [Admin]
  ────────────
  ⚙️ Settings           [All roles]
```

**Sidebar Collapsed State (64px):** Icons only, tooltips on hover. Collapse trigger: chevron button at bottom of sidebar. State persisted to localStorage.

### 2.2 Command Center Dashboard — Layout Grid

The Overview/Command Center uses a **12-column CSS Grid** with defined widget slot assignments:

```
ROW 1 (col span: 8) | ROW 1 (col span: 4)
Price Signal Hero     | Accuracy Trust Card

ROW 2 (col span: 12 → 5 equal cards)
[District] [Middleman] [Alerts] [Feed Cost] [API Usage]

ROW 3 (col span: 8) | ROW 3 (col span: 4)
7-Day Price Chart     | Alert Feed (mini)

ROW 4 (col span: 12)
Setup Checklist (shown first 7 days only, then dismissed)
```

**CSS Grid Declaration:**
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto;
  gap: var(--widget-gap); /* 20px */
  padding: 24px;
  max-width: 1440px;
  margin: 0 auto;
}

.widget-price-hero   { grid-column: 1 / 9; }
.widget-accuracy     { grid-column: 9 / 13; }
.widget-kpi-row      { grid-column: 1 / 13; display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.widget-chart        { grid-column: 1 / 9; }
.widget-alert-mini   { grid-column: 9 / 13; }
.widget-checklist    { grid-column: 1 / 13; }

/* Responsive: tablet (768px–1024px) */
@media (max-width: 1024px) {
  .widget-price-hero   { grid-column: 1 / 8; }
  .widget-accuracy     { grid-column: 8 / 13; }
  .widget-kpi-row      { grid-template-columns: repeat(3, 1fr); }
  .widget-chart        { grid-column: 1 / 13; }
  .widget-alert-mini   { grid-column: 1 / 13; }
}
```

---

## 3. Widget Design Specifications

### 3.1 Price Signal Hero Widget

**File:** `components/dashboard/PriceSignalHero.tsx`

**Visual Layout:**
```
┌──────────────────────────────────────────────────┐
│  गोरखपुर · आज का भाव              ⟳ 06:12 AM    │
│                                                    │
│              ₹ 162.40                             │
│               /kg                                  │
│                                                    │
│         ↑ +2.3% vs कल                            │
│                                                    │
│    ┌──────────────────────────────────┐           │
│    │  ₹158 ━━━━━━━━━━━━━━━━━ ₹168   │           │
│    │      80% संभावना की सीमा        │           │
│    └──────────────────────────────────┘           │
│                                                    │
│    ╔══════════════════════════════╗               │
│    ║  ✅  आज बेचें  ·  SELL NOW  ║               │
│    ╚══════════════════════════════╝               │
└──────────────────────────────────────────────────┘
```

**Implementation Detail:**

```typescript
interface PriceSignalHeroProps {
  price: number;           // P50 value
  p10: number;
  p90: number;
  deltaPercent: number;    // vs yesterday
  deltaDirection: 'up' | 'down' | 'flat';
  signal: 'sell' | 'hold' | 'caution';
  district: string;        // Hindi district name
  lastUpdated: Date;
  isStale: boolean;        // >24h since update
  isOffline: boolean;
}
```

**States:**

| State | Visual Treatment |
|---|---|
| `fresh` | White card, brand-green shadow, price in #1C2B22 |
| `stale (>24h)` | Amber left border (4dp), `⚠ डेटा पुराना है` badge in amber |
| `offline` | Grey border, desaturated colors, `📴 ऑफलाइन` overlay badge |
| `loading` | Shimmer skeleton matching the card dimensions |
| `error` | Red left border, `⚠ डेटा उपलब्ध नहीं` with retry button |

**Sell Signal Badge Colors:**
- `SELL NOW` → brand-green-700 background, white text, ✅ icon
- `HOLD` → amber-500 background, white text, ⏳ icon  
- `CAUTION` → red-600 background, white text, ⚠️ icon

**Animation:** The price number shall animate from the previous value to the new value on data refresh using a counting animation (100ms duration, linear easing). Direction arrow shall fade-slide in from bottom on update.

### 3.2 Accuracy Trust Card

**File:** `components/dashboard/AccuracyTrustCard.tsx`

**Visual Layout:**
```
┌──────────────────────────────┐
│  मॉडल सटीकता                │
│  Model Accuracy              │
│                              │
│  MAPE: 4.8%   [●●●●●○]     │
│  ████████████ 95.2% ↑       │
│  दिशा सटीकता  Directional   │
│                              │
│  🕐 Last retrain: 3 days ago │
│  ✓ 847 predictions verified │
└──────────────────────────────┘
```

**MAPE Color Coding:**
- < 6%: `--color-status-excellent` with green dot indicator
- 6–8%: `--color-status-warning` with amber dot indicator
- > 8%: `--color-status-critical` with red pulsing dot indicator + Slack alert triggered

**Directional Accuracy Bar:** Custom CSS progress bar (no library). Width = directional_accuracy_pct. Color follows MAPE color coding.

### 3.3 KPI Card Row

**File:** `components/dashboard/KpiCard.tsx` (reusable, 5 instances)

**Standard KPI Card Template:**
```
┌─────────────────────┐
│ 🏪 Mandi Benchmark  │
│                     │
│  ₹159.50 / kg      │
│  7-day avg          │
│  ↑ +1.2% vs last wk│
│                     │
│  📍 Gorakhpur APMC  │
│  ⏱ 4hr ago          │
└─────────────────────┘
```

**Props Interface:**
```typescript
interface KpiCardProps {
  icon: string;          // emoji or icon name
  title: string;         // English (admin) or Hindi (S1)
  value: string;         // formatted display value
  subtitle: string;      // unit or context
  delta?: string;        // optional % change
  deltaDirection?: 'up' | 'down' | 'flat';
  source?: string;       // data source label
  freshness?: string;    // "4hr ago", "just now"
  onClick?: () => void;  // optional drill-down action
  isLoading?: boolean;
}
```

**The 5 KPI Cards (Command Center):**

| Slot | Icon | Title | Value Source | Drill-Down |
|---|---|---|---|---|
| 1 | 🏪 | Mandi Benchmark | AGMARKNET 7-day avg | Opens Price Intelligence → Historical |
| 2 | 🤝 | Middleman Spread | AGMARKNET avg - NECC zone price | Opens Middleman Check |
| 3 | 🚨 | Active Alerts | `alerts` table count | Opens Alert Center |
| 4 | 🌾 | Feed Cost Index | Maize/soya composite delta | Opens Feed Intelligence |
| 5 | 🔌 | API Usage | Upstash rate limit status | Opens API Console (S5/Admin only; subscription tier for S1/S2) |

### 3.4 7-Day Price Trajectory Chart

**File:** `components/charts/PriceTrajectoryChart.tsx`  
**Library:** Recharts `ComposedChart`

**Layer Stack (bottom to top):**
1. `Area` component: P10–P90 confidence band (fill: `--color-viz-p10-p90`)
2. `Line` component: P50 forecast (stroke: `--color-viz-forecast`, dashed, strokeDasharray="6 3")
3. `Line` component: Actual historical price (stroke: `--color-viz-actual`, solid, strokeWidth: 2.5)
4. `ReferenceLine` components: Festival markers (stroke: amber-500, label above axis)
5. `ReferenceLine` component: Today's date (stroke: neutral-900, strokeWidth: 2, label: "आज")
6. `ReferenceDot` components: HPAI/weather event markers (fill: red-600, r: 6)

**Tooltip Design:**
```
┌─────────────────────┐
│  Mon, 19 May        │
│  ───────────────    │
│  P50: ₹164.20       │
│  Range: ₹159–₹169   │
│  ↑ Trend: Rising    │
│  Festival: Eid -2d  │
└─────────────────────┘
```

**Responsive Behavior:**
- Full 12-column span on desktop: 680px × 220px chart area
- Full-width on tablet: 100% × 200px
- On mobile (React Native): Victory Native `VictoryChart`, 100% × 160dp

**Loading State:** Recharts renders an empty skeleton with grey placeholder bars (same dimensions as final chart) using a CSS shimmer animation. No "Loading..." text — the skeleton IS the loading indicator.

### 3.5 Multi-District Price Intelligence Map

**File:** `components/maps/DistrictPriceMap.tsx`  
**Libraries:** `react-simple-maps`, `@visx/geo`, `topojson-client`

**Map Configuration:**
```typescript
const MAP_CONFIG = {
  projection: 'geoMercator',
  center: [82.5, 27.0],     // Centered on eastern UP / Gorakhpur belt
  scale: 5000,               // Zoomed to UP district level
  rotate: [0, 0, 0],
};

const UP_ACTIVE_DISTRICTS = [
  'Gorakhpur', 'Deoria', 'Kushinagar', 
  'Maharajganj', 'Basti', 'Sant Kabir Nagar'
];
```

**Choropleth Color Scale:**
```typescript
const priceToColor = (price: number, min: number, max: number): string => {
  const ratio = (price - min) / (max - min);
  // Green (high sell opportunity) → Amber → Red (poor conditions)
  if (ratio > 0.66) return '#1A6B3C'; // brand-green-700
  if (ratio > 0.33) return '#F5A623'; // amber-500
  return '#C0392B';                   // red-600
};
```

**HPAI Ring Animation:**
```css
@keyframes hpai-ring-pulse {
  0%   { stroke-opacity: 1; stroke-width: 3; r: 12px; }
  50%  { stroke-opacity: 0.4; stroke-width: 6; r: 18px; }
  100% { stroke-opacity: 1; stroke-width: 3; r: 12px; }
}

.hpai-ring {
  stroke: #C0392B;
  fill: none;
  animation: hpai-ring-pulse var(--animation-hpai-ring);
}
```

**District Deep-Dive Side Panel:**
```
┌──────────────────────────────────────────────┐
│  ✕              गोरखपुर                      │
│                                              │
│  ₹162.40  /kg  [P50]   ↑ +2.3%             │
│  Range: ₹157 — ₹168                         │
│                                              │
│  आज की वजहें:                               │
│  🐔 चारे की कीमत ↑ — ₹4/kg असर            │
│  🌡️ गर्मी — 7 दिन में 5 दिन >35°C         │
│  🎉 ईद से 6 दिन पहले — माँग बढ़ रही है    │
│                                              │
│  ── 30-day Price Chart ──                   │
│  [mini Recharts LineChart]                  │
│                                              │
│  🚨 Active Alerts                           │
│  [Alert card list]                          │
│                                              │
│  [Set as Primary District]                  │
└──────────────────────────────────────────────┘
```

**Timeline Scrubber:**
```typescript
interface TimelineScrubberProps {
  dateRange: { min: Date; max: Date };  // last 90 days to +30 days
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isAnimating: boolean;
  onPlayToggle: () => void;
}
```
Animation: When play is pressed, the scrubber auto-advances 1 day every 200ms, re-rendering the choropleth for each date. Pause button stops the animation.

### 3.6 Batch ROI Optimizer

**File:** `components/batch/BatchRoiOptimizer.tsx`

**Layout (Desktop — Split Panel):**
```
┌──────────────────────┬───────────────────────────────────┐
│  INPUT PANEL         │  RESULTS PANEL                    │
│                      │                                   │
│  Flock Size: [25000] │  ⭐ Optimal: Sell in +7 Days      │
│  Age: [38 days] ─○─  │                                   │
│  Avg Weight: [1.8kg] │  ┌─────┬─────┬─────┬─────┐       │
│  Feed Cost: [₹58/kg] │  │Today│+3D  │+7D★ │+14D │       │
│  Overhead: [₹0.50/d] │  │₹162 │₹164 │₹168 │₹165 │       │
│                      │  │     │     │Green│     │       │
│  [Calculate]         │  └─────┴─────┴─────┴─────┘       │
│                      │                                   │
│  Trader Offer:       │  Profit Waterfall Chart           │
│  ₹[___] /kg          │  [Recharts BarChart]              │
│  [Check Fairness]    │                                   │
│                      │  Break-Even: ₹148/kg              │
│                      │  Your offer: ABOVE ✅              │
└──────────────────────┴───────────────────────────────────┘
```

**Sell vs Hold Matrix Table Specification:**

```typescript
interface SellHoldRow {
  scenario: 'today' | '+3d' | '+7d' | '+14d';
  projectedPrice: { p10: number; p50: number; p90: number };
  revenue: { pessimistic: number; base: number; optimistic: number };
  holdingCost: number;       // feed + overhead per day × days
  mortalityRiskCost: number; // estimated mortality rate × bird value × days
  netProfit: { pessimistic: number; base: number; optimistic: number };
  roi: number;               // (net_profit / total_cost) × 100
  isOptimal: boolean;        // highest base net profit row
}
```

**Profit Waterfall Chart:**
- Bar 1: `Base Revenue` → green, positive
- Bar 2: `Price Gain/Loss from Waiting` → green if positive, red if negative
- Bar 3: `Feed + Holding Cost` → always negative (red)
- Bar 4: `Mortality Risk Cost` → always negative, lighter red
- Reference Line: `Break-Even Price` → horizontal dashed line
- The chart updates in real-time as inputs change (no submit button, reactive computation)

**Multi-Farm Harvest Queue (S2 Integrators):**
```
┌──────────────────────────────────────────────────────┐
│ Farm Harvest Priority Queue           [Export PDF]    │
│                                                       │
│ Priority │ Farm         │ Birds  │ Signal │ Net Delta │
│ ──────── │ ──────────── │ ──────│ ────── │ ───────── │
│ 🔴 URGENT│ Sharma Farm  │ 28,000│ SELL   │ -₹42,000  │
│ 🟡 OPTIMAL│ Gupta Farms │ 15,000│ +7 Days│ +₹18,500  │
│ 🟢 WAIT  │ Singh Farms  │ 40,000│ Hold   │ +₹56,000  │
└──────────────────────────────────────────────────────┘
```

### 3.7 AI-Powered Alert Intelligence Center

**File:** `components/alerts/AlertIntelligenceCenter.tsx`

**Alert Card Full Specification:**
```
┌────────────────────────────────────────────────────────┐
│ 🦠 HPAI Disease Alert                    🔴 HIGH       │
│                                                        │
│ देवरिया जिले में बर्ड फ्लू की चेतावनी               │
│ Bird Flu Warning — Deoria District                     │
│                                                        │
│ आपके झुंड पर असर: ~₹40,000 – ₹80,000              │
│ Est. flock impact: ₹40K–₹80K (25K birds)              │
│                                                        │
│ स्रोत: DAHDF  ·  22 May 2026  ·  95% confidence       │
│                                                        │
│  [Act Now — Sell Before Zone Expands]  [Dismiss]      │
└────────────────────────────────────────────────────────┘
```

**7-Day Alert Timeline Component:**
```
      May 16   17   18   19   20   21   22
         │    │    │    │    │    │    │
         🟡   ·    🔴   🟡   ·    ·    🔴
         │              │              │
       Heat          HPAI          Price
       Wave         Alert          Drop
```
Implementation: SVG timeline with colored dots. Each dot is hoverable (tooltip with full alert summary) and clickable (expands full alert card below timeline).

**Alert Threshold Settings Panel:**
```typescript
interface AlertPreferences {
  hpaiDistanceKm: 50 | 100 | 150 | 200;
  temperatureThresholdC: number;    // 32–42°C slider
  priceDropPercent: number;         // 3–20% slider
  feedCostRisePercent: number;      // 3–15% slider
  channels: {
    pushNotification: boolean;
    whatsapp: boolean;
    email: boolean;
  };
}
```
The threshold settings panel shall be a bottom drawer on mobile, a modal on web. Changes save immediately (debounced 500ms) to Supabase `customer_alert_preferences` table.

### 3.8 Middleman Intelligence Tool

**File:** `components/tools/MiddlemanCheck.tsx`

**Price Fairness Gauge:**
```
                  FAIR ZONE
               ┌──────────┐
        LOW    │  ₹162.40 │    HIGH
  ─────[RED]───┼──[GREEN]─┼───[BLUE]─────
     <90%     90%        110%
   benchmark       benchmark
```

**Implementation:** D3 arc gauge with three zones. The "needle" animates to the position corresponding to the offered price relative to the benchmark. Needle animation: 600ms ease-out from 0° on initial render.

**Hindi Negotiation Script Card:**
```
┌──────────────────────────────────────────────────┐
│ 💬 बातचीत के लिए कहें:                          │
│                                                   │
│ "भाई, आज गोरखपुर मंडी में भाव ₹162/kg          │
│  है। मुझे कम से कम ₹155 तो देना होगा।           │
│  क्या ₹158 हो सकता है?"                          │
│                                                   │
│  [📋 Copy]  [📤 Share on WhatsApp]              │
└──────────────────────────────────────────────────┘
```
The "Share on WhatsApp" button constructs a WhatsApp deep link: `whatsapp://send?text=[encoded negotiation script]`. This is the most viral sharing mechanic in the product.

### 3.9 Accuracy Dashboard (Admin)

**File:** `components/admin/AccuracyDashboard.tsx`

**Layout:**
```
ROW 1: [MAPE Gauge] [Directional Accuracy Gauge] [Conformal Coverage Gauge]
ROW 2: [MAPE 30-Day Trend Chart — full width]
ROW 3: [P50 vs Actual Scatter Plot] [Feature Importance H-Bar Chart]
ROW 4: [Model Timeline — vertical]
ROW 5: [Champion vs Challenger Table]
```

**MAPE 30-Day Trend Chart:**
- `Recharts LineChart` with daily MAPE values as data points
- `ReferenceArea` regions: green fill for <6%, amber for 6–8%, red for >8%
- `ReferenceLine` at y=6 (warning threshold) and y=8 (critical threshold) with labels
- On click of any data point: opens a detail panel showing that day's prediction vs actual prices

**P50 vs Actual Scatter Plot:**
```
Actual ₹
  │          ·  · ·
  │       · ·  ·
  │    · ·  ·
  │  · ·  /  (perfect prediction diagonal)
  │ ·    /
  └────────────── P50 Forecast ₹
```
Points that are more than 1 standard deviation from the diagonal are colored red. All other points are green. This is the most honest visualization of model performance — it cannot be gamed.

### 3.10 API Console (Enterprise)

**File:** `components/enterprise/ApiConsole.tsx`

**In-Browser Playground:**
```
┌──────────────────────────────────────────────────────┐
│  API Playground                      [⚠ Live API]    │
│                                                       │
│  Endpoint: GET /api/v2/forecast/enterprise  ▼        │
│                                                       │
│  district:    [Gorakhpur ▼]                          │
│  date_from:   [2026-05-16]                           │
│  date_to:     [2026-06-15]                           │
│  confidence:  [☑ P10  ☑ P50  ☑ P90]               │
│                                                       │
│  [▶ Send Request]            [📋 Copy as cURL]       │
│  ─────────────────────────────────────────────       │
│  Response (200 OK · 187ms)                           │
│  {                                                    │
│    "district": "Gorakhpur",                          │
│    "predictions": [                                   │
│      { "date": "2026-05-17",                         │
│        "p10": 158.2,                                 │
│        "p50": 162.4, ← highlighted                   │
│        "p90": 167.8, ...}                            │
│    ]                                                  │
│  }                                                    │
└──────────────────────────────────────────────────────┘
```
**Implementation:** Monaco Editor (lightweight) for the response viewer, with JSON syntax highlighting. Response time shown in the header. Error responses shown with red border + error code highlighted.

---

## 4. Mobile Dashboard Enhancements

### 4.1 Enhanced Home Screen (Tab 1) — Scroll Architecture

The mobile home screen is a single scrollable column. The scroll architecture is strictly ordered — no re-ordering based on any logic. Order is fixed by design:

```
[1] PRICE HERO CARD         ← Full width, 180dp, ALWAYS FIRST
[2] ACCURACY TRUST STRIP    ← Full width, 48dp
[3] SELL SIGNAL BADGE       ← Full width pill, 52dp  
[4] AI DRIVERS (3 bullets)  ← Full width, variable height
[5] SPARKLINE CHART         ← Full width, 140dp
[6] FEED COST MINI-CARD     ← Full width, 80dp
[7] MIDDLEMAN ENTRY         ← Full width, 72dp (input + submit)
[8] ALERT FEED              ← Scrollable card list
[9] [End of scroll]
```

**Critical Rule:** The price hero card (item 1) shall always begin at the same Y position on every app launch — no content above it. The district + date label shall be embedded within the hero card, not above it.

### 4.2 Sell Signal Screen (Tab 2) — Enhanced Layout

**Horizontally Scrollable Decision Cards:**
```
← Swipe Horizontally →
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ आज  │ │+3दिन│ │+7दिन│ │+14दिन│
│₹162 │ │₹164 │ │₹168★│ │₹165 │
│SELL │ │WAIT │ │BEST │ │WAIT │
│     │ │     │ │GREEN│ │     │
│₹41L │ │₹42L │ │₹43L★│ │₹42L │
└──────┘ └──────┘ └──────┘ └──────┘
   Revenue estimates for 25K birds
```

The optimal card (★) snaps to center on initial render via `FlatList` with `scrollToIndex`. The optimal card has `transform: scale(1.05)` and a green shadow glow.

### 4.3 Biometric Quick Lock

**Implementation:** `expo-local-authentication` library

```typescript
interface BiometricLockConfig {
  enabled: boolean;         // user toggle in Settings
  lockAfterMs: 120000;      // 2 minutes of backgrounding
  unlockWithFaceId: boolean;
  unlockWithFingerprint: boolean;
  unlockWithPin: boolean;   // fallback 6-digit PIN
  showBlurredContentBehindLock: boolean; // iOS-style backdrop blur
}
```

**Lock Screen Visual:** A full-screen blur overlay (`expo-blur` `BlurView` with intensity 80) with the PoultryPulse logo centered, biometric icon, and "Touch to Unlock" instruction in Hindi. The blurred background shows a desaturated version of the price hero card — the user can see shape but not value. This creates urgency to unlock.

---

## 5. Component Interaction Patterns

### 5.1 Widget Refresh Pattern

All dashboard widgets follow the same refresh pattern:

```typescript
// Standard widget refresh hook
const useWidgetData = <T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  ttlMs: number
): { data: T | null; isLoading: boolean; isStale: boolean; refresh: () => void } => {
  // SWR with manual refresh capability
  // Shows cached data immediately, fetches in background
  // Sets isStale=true if data is older than ttlMs
  // Never shows empty state when cache has data
};
```

**Rule:** No widget shall ever show an empty/null state when cached data exists. Stale data with a timestamp is always preferable to an empty widget.

### 5.2 Real-Time Alert Pattern (Supabase Realtime)

```typescript
// Supabase Realtime subscription for alerts
const useAlertSubscription = (districtId: string) => {
  useEffect(() => {
    const channel = supabase
      .channel('alerts-' + districtId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `district_id=eq.${districtId}`,
      }, (payload) => {
        // Append to alert feed state
        // Increment bell badge count
        // Trigger push notification if app is foregrounded (expo-notifications)
        addAlert(payload.new as Alert);
        incrementAlertBadge();
      })
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }, [districtId]);
};
```

### 5.3 Chart Data Virtualization

All charts that display more than 90 data points shall use **windowed rendering**:

```typescript
// Only render data points visible in the current zoom window
const useChartWindowing = (
  allData: DataPoint[],
  viewportWidth: number,
  zoomLevel: number
): DataPoint[] => {
  const maxPoints = Math.floor(viewportWidth / 4); // 4px minimum per point
  const stride = Math.max(1, Math.floor(allData.length / maxPoints));
  return allData.filter((_, i) => i % stride === 0);
};
```

---

## 6. Accessibility Design Specifications

### 6.1 Chart Accessibility Patterns

Every chart component shall include an accessible data table:

```tsx
<PriceTrajectoryChart data={data} />
<VisuallyHidden>
  <table aria-label="Price forecast for the next 7 days">
    <thead>
      <tr>
        <th>Date</th>
        <th>Forecast Price (P50)</th>
        <th>Range (P10-P90)</th>
        <th>Signal</th>
      </tr>
    </thead>
    <tbody>
      {data.forecast.map(d => (
        <tr key={d.date}>
          <td>{format(d.date, 'dd MMM yyyy')}</td>
          <td>₹{d.p50.toFixed(2)}/kg</td>
          <td>₹{d.p10.toFixed(0)}–₹{d.p90.toFixed(0)}</td>
          <td>{d.signal}</td>
        </tr>
      ))}
    </tbody>
  </table>
</VisuallyHidden>
```

### 6.2 Color Blindness Accommodations

All status colors are paired with icons and/or patterns:
- `SELL NOW` (green): always shows ✅ icon
- `HOLD` (amber): always shows ⏳ icon
- `CAUTION` (red): always shows ⚠️ icon
- Charts use both color AND line style (solid vs dashed vs dotted) to distinguish series

### 6.3 Hindi RTL Considerations

Hindi (Devanagari) is not an RTL language — it is LTR like English. However, Devanagari numeral rendering must be tested on Android 8–14 and iOS 14–17. The `Noto Sans Devanagari` font must be loaded before any price number renders to prevent FOUT (Flash of Unstyled Text) with fallback numerals.

---

## 7. Error States & Empty States Design

### 7.1 Standard Error State Pattern

Every widget implements these error states, never showing a broken/empty widget to the user:

| Error Type | Visual Treatment | Action Available |
|---|---|---|
| Network error (no cached data) | Grey card, cloud-slash icon, "डेटा लोड नहीं हो सका" in Hindi | [Retry] button |
| Network error (cached data exists) | Stale data displayed, amber border, ⚠ staleness label | [Retry] button |
| Server error (5xx) | Same as network error + "हमारी टीम को पता है" note | None — auto-retry |
| Auth error (401/403) | White card, lock icon, "लॉगिन आवश्यक है" | [Login Again] button |
| Data validation error | Data displayed with ⚠ "डेटा की जांच की जा रही है" | None |

### 7.2 Skeleton Loading Design

All skeletons exactly match the layout dimensions of the final content. No generic "loading spinner" at the widget level — only at the full-page level during initial hydration.

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--brand-green-50) 25%,
    rgba(26, 107, 60, 0.08) 50%,
    var(--brand-green-50) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer var(--animation-skeleton);
}

@keyframes skeleton-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
```

---

## 8. Responsive Design Breakpoints

| Breakpoint | Width | Layout | Sidebar |
|---|---|---|---|
| Mobile | < 768px | Single column, bottom tabs | Hidden (mobile nav) |
| Tablet | 768px–1024px | 2-column grid, compact sidebar | Collapsed (icons only) |
| Desktop | 1024px–1280px | Full 12-col grid, sidebar | Expanded (240px) |
| Wide | > 1280px | Full grid, max-width 1440px centered | Expanded (240px) |

**Mobile Web Redirect:** Any access to the web dashboard on a viewport < 768px shall display a full-screen interstitial: "PoultryPulse डैशबोर्ड मोबाइल ऐप पर बेहतर काम करता है" with App Store / Play Store download buttons. The mobile web is not a supported surface.

---

## 9. Animation & Motion Design

### 9.1 Page Transition

Route changes use a **fade + slight Y-translate** transition:
```css
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 180ms ease-out, transform 180ms ease-out;
}
```

### 9.2 Data Update Animations

Price number updates: count animation (200ms linear) from old value to new value.  
Chart updates: new data points slide in from the right (200ms ease-out).  
Alert card appearance: slide-in from top + fade (200ms ease-out). Cards that disappear on dismiss: slide-out to right + fade (150ms ease-in).

### 9.3 Reduce Motion

All animations respect `prefers-reduced-motion: reduce`. When set, all transitions collapse to an immediate state change (0ms duration). No animation shall be essential to understanding the UI — it is always decorative enhancement.

---

## 10. File & Folder Structure

```
/src
  /components
    /dashboard
      CommandCenter.tsx          ← Main dashboard layout
      PriceSignalHero.tsx
      AccuracyTrustCard.tsx
      KpiCard.tsx
      KpiCardRow.tsx
    /charts
      PriceTrajectoryChart.tsx
      ProfitWaterfallChart.tsx
      MapeGauge.tsx
      DirectionalAccuracyGauge.tsx
      ScatterPlotChart.tsx
      FeatureImportanceChart.tsx
    /maps
      DistrictPriceMap.tsx
      TimelineScrubber.tsx
      DistrictDeepDivePanel.tsx
    /batch
      BatchRoiOptimizer.tsx
      SellHoldMatrix.tsx
      MultiFlockHarvestQueue.tsx
    /alerts
      AlertIntelligenceCenter.tsx
      AlertCard.tsx
      AlertTimeline.tsx
      AlertThresholdSettings.tsx
    /tools
      MiddlemanCheck.tsx
      PriceFairnessGauge.tsx
      NegotiationScriptCard.tsx
    /feed
      FeedCostDashboard.tsx
      CommodityTicker.tsx
      ProcurementRecommendation.tsx
    /enterprise
      ApiConsole.tsx
      ApiKeyManager.tsx
      ApiUsageChart.tsx
      ApiPlayground.tsx
    /admin
      AccuracyDashboard.tsx
      PipelineHealthPanel.tsx
      ModelTimeline.tsx
      WatermarkAuditConsole.tsx
      WhatsAppAnalytics.tsx
    /onboarding
      FirstRunExperience.tsx
      SetupChecklist.tsx
  /hooks
    useWidgetData.ts
    useAlertSubscription.ts
    useDashboardSummary.ts
    useBatchRoiCalculation.ts
    useChartWindowing.ts
  /lib
    watermarkDecoder.ts
    roiCalculator.ts           ← Pure functions, unit-testable
    priceFormatter.ts
    alertImpactEstimator.ts
  /styles
    tokens.css                 ← Extended token system
    skeleton.css
    animations.css
  /types
    dashboard.types.ts
    alert.types.ts
    batch.types.ts
```

---

*End of Design Specification — PoultryPulse Dashboard Enhancement v1.0*  
*Next: See Task Specification (PoultryPulse_Dashboard_Tasks_v1.md)*
