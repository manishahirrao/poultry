# PoultryPulse AI — Post-Login Web Dashboard UI/UX Design Master
# File: 04_postlogin_design_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
DESIGNER_PERSONA: Aidan Murphy (B2B SaaS/dashboard density) × Jessica Lin (accessibility-first) × Don Norman (human-centered)
DESIGN_VARIANCE: 5 — Structured, precise, functional (not artsy)
MOTION_INTENSITY: 4 — Purposeful feedback animations, no cinematic effects
VISUAL_DENSITY: 6 — Data-dense dashboard, B2B precision
TARGET: S2 Integrators (50K–500K birds), S3 Feed Manufacturers, S4 Traders, S5 QSR, Admin
PRINCIPLE: "P10/P50/P90 bands always visible" — Aidan Murphy data hierarchy rule
ACCESSIBILITY: WCAG 2.1 AA mandatory — Jessica Lin principle
ERRORS: Never show raw error codes to users — Don Norman principle
FOUNDATION: PRD v3.0 §4 (segments S2–S6) + UI/UX Design v1.0 §2.2 (Web Dashboard)
```

---

## 1. DASHBOARD DESIGN SYSTEM

### 1.1 Dashboard-Specific Colour Tokens

```typescript
// Dashboard extends base WebTokens with data-specific tokens
export const DashboardTokens = {
  // Chart colours (accessible, colour-blind safe)
  chartP50:    '#1A6B3C',  // Predicted median — brand green
  chartP10:    '#7CC49A',  // P10 lower bound — light green
  chartP90:    '#0F4A28',  // P90 upper bound — dark green
  chartActual: '#E8621A',  // Actual price — saffron (high contrast vs green)
  chartGood:   '#1A6B3C',  // Within 5% error
  chartWarn:   '#F5A623',  // 5-10% error
  chartBad:    '#C0392B',  // >10% error

  // Status indicators
  statusGreen:  '#16A34A',  // Active, connected, healthy
  statusAmber:  '#D97706',  // Warning, near threshold
  statusRed:    '#DC2626',  // Critical, gate failed
  statusBlue:   '#2563EB',  // Info, neutral

  // Sell signal (dashboard)
  sellNow:      '#16A34A',  // SELL_NOW signal
  holdSignal:   '#D97706',  // HOLD signal
  cautionSignal:'#DC2626',  // CAUTION/SELL_SOON signal

  // Dashboard surface
  sidebarBg:    '#0F1E15',  // Near-black green sidebar
  sidebarText:  '#A8C5B0',  // Muted green text in sidebar
  sidebarActive:'#FFFFFF',  // Active nav item text
  sidebarHover: 'rgba(255,255,255,0.06)',  // Hover state
  contentBg:    '#F7FAF8',  // Main content area background
  cardBg:       '#FFFFFF',  // Card background
  tableBg:      '#FFFFFF',  // Table background
  tableRowHover:'#F0F7F3',  // Table row hover
  tableStriped: '#F7FAF8',  // Alternating rows
  divider:      '#E2EBE6',  // Separator lines
} as const;
```

### 1.2 Dashboard Typography (App UI — Fixed Scale, No Fluid)

```typescript
// App UI: fixed rem scale (not fluid clamp — predictability matters for data)
export const DashboardTypography = {
  // Page titles
  pageTitle: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   '1.5rem',   // 24px
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.015em',
  },
  // Section headings
  sectionTitle: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   '1.0625rem',  // 17px
    fontWeight: 600,
    lineHeight: 1.3,
  },
  // Card titles
  cardTitle: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   '0.9375rem',  // 15px
    fontWeight: 600,
    lineHeight: 1.35,
  },
  // Body text
  body: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   '0.875rem',  // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  // Data labels
  dataLabel: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   '0.75rem',  // 12px
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.02em',
  },
  // Large metric numbers
  metricLarge: {
    fontFamily: "'Sora', 'Plus Jakarta Sans', system-ui",
    fontSize:   '2rem',  // 32px
    fontWeight: 700,
    lineHeight: 1.0,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
  },
  metricMedium: {
    fontFamily: "'Sora', system-ui",
    fontSize:   '1.375rem',  // 22px
    fontWeight: 700,
    lineHeight: 1.0,
    fontVariantNumeric: 'tabular-nums',
  },
  // Mono for API keys, timestamps
  mono: {
    fontFamily: "'Geist Mono', 'JetBrains Mono', 'Roboto Mono', monospace",
    fontSize:   '0.8125rem',  // 13px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  // Hindi in dashboard (error messages, alerts, admin notes)
  hindiUI: {
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    fontSize:   '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
} as const;
```

### 1.3 Spacing System (8px Base Grid)

```
All spacing is multiples of 8px:
- xs:  4px  — tight internal spacing
- sm:  8px  — component internal padding
- md:  16px — standard gap
- lg:  24px — card padding
- xl:  32px — section separation
- 2xl: 48px — page section gap
- 3xl: 64px — max section padding

Sidebar: 240px width (fixed)
Top header: 60px height
Content max-width: 1440px
Content padding: 24px (desktop), 16px (tablet), 12px (mobile)
```

### 1.4 Chart Configuration Standards

```typescript
// Recharts global config for dashboard
export const chartDefaults = {
  // All charts use these Recharts props
  margin: { top: 8, right: 16, bottom: 8, left: 0 },
  style: { fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '12px' },

  // Axis styling
  xAxis: {
    tickLine: false,
    axisLine: false,
    tick: { fill: '#5A7A68', fontSize: 11 },
  },
  yAxis: {
    tickLine: false,
    axisLine: false,
    tick: { fill: '#5A7A68', fontSize: 11 },
    width: 48,
  },

  // Tooltip
  tooltip: {
    contentStyle: {
      background: '#FFFFFF',
      border: '1px solid #E2EBE6',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontSize: '13px',
    },
  },

  // P10/P50/P90 band always visible (Aidan Murphy rule)
  p50: { stroke: '#1A6B3C', strokeWidth: 2, type: 'monotone' },
  p10: { stroke: '#7CC49A', strokeWidth: 1, strokeDasharray: '4 4', type: 'monotone' },
  p90: { stroke: '#0F4A28', strokeWidth: 1, strokeDasharray: '4 4', type: 'monotone' },
  actual: { stroke: '#E8621A', strokeWidth: 2, dot: { r: 3 }, type: 'monotone' },
} as const;
```

---

## 2. DASHBOARD INFORMATION ARCHITECTURE

### 2.1 Left Sidebar Navigation

```
Structure: Fixed left sidebar, 240px width
Background: DashboardTokens.sidebarBg (#0F1E15)

Header block (top 64px):
  - PoultryPulse AI logo (white, 120px wide)
  - Version badge: "Phase 0 Beta"

User block (below header, before nav):
  - Avatar (initials-based, brandGreen700)
  - Name + Role (S2 Integrator / Admin)
  - Plan badge (PulsePro / PulseIntel)
  - Subscription expiry (countdown if < 30 days)

Navigation items (vertical list):
  1. 📊 Overview           /dashboard
  2. 📈 Price Intelligence  /dashboard/price-intelligence
  3. 🔔 Alerts             /dashboard/alerts
  4. 🧮 Calculator         /dashboard/calculator    [S2 Integrators only]
  5. 🔑 API Access         /dashboard/api           [Enterprise S5 only]
  6. ✅ Accuracy            /dashboard/accuracy      [Admin only]
  7. 👥 Customers          /dashboard/customers     [Admin only]
  8. ⚙️ Settings           /dashboard/settings

Footer of sidebar:
  - Support: WhatsApp chat link
  - Logout button

Nav item styles:
  Default: 40px height, px-4, rounded-lg, sidebarText colour
  Hover: sidebarHover background, transition 150ms
  Active: white text, brandGreen700 left border (3px), sidebarHover bg
  Icon: Phosphor Light, 18px, mr-3, aligned optical center

Collapsed state (mobile <1024px): 
  - Sidebar off-screen (translateX(-240px))
  - Hamburger in top header
  - Overlay backdrop when open
```

### 2.2 Top Header Bar

```
Height: 60px
Background: white
Border-bottom: 1px solid divider

Left: Page title (dynamic, matches current nav section)
Centre: (empty or breadcrumb on deeper pages)
Right (L→R):
  - District selector (dropdown, shows "All Districts" or specific district)
  - Mandi selector (shows "All Mandis" or specific mandi — linked to district)  
  - Refresh button (manual data refresh, shows last-updated timestamp)
  - Notification bell (badge with unread count)
  - User menu dropdown (avatar → Profile, Settings, Logout)

Last-updated indicator (below header or in header right):
  "अंतिम अपडेट: आज 06:12 AM" — if stale (>24h): amber "⚠ डेटा पुराना है"
```

---

## 3. DASHBOARD PAGES — DETAILED SPECS

### Page D-01: Overview (`/dashboard`)

**Purpose:** High-level view for integrators and admin. "Command centre" for farm operators.

**Layout:** 12-column CSS Grid, 4 metric cards top row, then mixed-width widgets below

```
Row 1 — KPI Metric Cards (4 equal columns):

Card 1: "आज का P50 भाव" (Today's P50 Price)
  Value: ₹168/kg (Sora font, 32px, brandGreen700)
  Sub: "Gorakhpur Mandi"
  Trend: ↑ ₹4 vs yesterday (green) or ↓ (red)
  Border-top: 3px brandGreen700 left accent

Card 2: "Sell Signal" (today's recommendation)  
  Value: "आज बेचें ✓" or "रुकें" or "सावधान"
  Badge: green/amber/red pill
  Sub: Signal strength: ●●●●○ (4/5)
  Border-top: colour matches signal

Card 3: "30-Day Accuracy"
  Value: 95.2%
  Sub: Directional accuracy
  Trend: +0.3% vs last month
  Gate indicator: ✓ green if ≥95%, ✗ red if <95%
  CRITICAL: If accuracy gate not cleared → show "Validating..." not a number

Card 4: "Active Farms" (Admin only) or "Active Districts" (Integrators)
  Value: Integer count
  Sub: "Under monitoring"
  Trend: change vs last week

Row 2 — Mixed width:

Left (col-span-8): "7-Day Price Forecast Chart"
  Recharts AreaChart
  X-axis: Today (Mon) to +7 days
  Areas: P10–P90 band (filled, low opacity) + P50 line (solid)
  Scatter: actual prices for past days (where available)
  Always visible: all three bands (P10/P50/P90) — never hidden
  Height: 280px
  Legend: P10 · P50 · P90 · Actual

Right (col-span-4): "Alerts Feed" (condensed)
  Last 5 alerts (HPAI, weather, price warning)
  Each: icon + title + district + time
  "सभी Alerts देखें →" link to /dashboard/alerts
  Empty state: "✓ कोई सक्रिय alert नहीं" (No active alerts) — not blank

Row 3 — Mixed width:

Left (col-span-5): "District Coverage Map"
  Leaflet.js map, ap-south-1 region centred on Gorakhpur
  Districts highlighted: Gorakhpur (dark green), adjacent (lighter green)
  Click district → filter dashboard to that district

Right (col-span-7): "Mandi-wise Price Table"
  Table: Mandi | P50 | Change | Signal | Last Updated
  Rows: Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj
  Colour-coded signal badges
  CSV download button (top-right of table)
  Accessible: th scope="col", aria-sort
```

---

### Page D-02: Price Intelligence (`/dashboard/price-intelligence`)

**Purpose:** Deep-dive into price forecasts, historical analysis, and data export.

```
Sub-navigation tabs (horizontal, below page title):
  Forecast | Historical | Download

TAB: Forecast
  
  Top controls (row):
    - Mandi selector (dropdown)
    - Date range picker (default: last 30 days)
    - View toggle: Chart | Table
  
  Chart: Full-width AreaChart (400px height)
    P10 band (dashed lower bound)
    P50 line (primary — solid, 2px)
    P90 band (dashed upper bound)
    Actual prices overlay (scatter dots, saffronOrange)
    Today marker: vertical dashed line
    +7 day forecast: dashed continuation from today
    
    Annotations:
    - HPAI events: red vertical band
    - Weather events: amber vertical band
    - Model retraining events: grey dotted vertical line
    
    Tooltip (hover): 
      Date, P50 ₹X/kg, Range ₹Y–Z, Actual ₹A (if available), Error: ±B%

  Price Drivers Panel (below chart, collapsible):
    "आज के भाव के 3 मुख्य कारण" (3 main reasons for today's price)
    Driver 1: icon + factor name + direction (positive/negative) + magnitude bar
    Driver 2: same
    Driver 3: same
    Source: Claude API generated description (Hindi + English)
    
  Confidence Explainer (collapsible):
    "P10/P50/P90 का मतलब क्या है?" accordion item
    Plain Hindi explanation of confidence intervals

TAB: Historical

  30-day actual vs predicted table:
    Columns: Date | Mandi | Predicted P50 | Actual | Error % | Within Range?
    Row colour: green <5% error, amber 5-10%, red >10%
    Summary row: Average MAPE, Hit rate for P10-P90 range
    Pagination: 30 rows/page
    Sort: any column, ascending/descending
    Filter: by mandi, by error range

TAB: Download

  CSV Export form:
    - Mandi selector (multi-select allowed)
    - Date range (max 90 days)
    - Include fields checkboxes: P50, P10, P90, Actual, Error %, Signal, Drivers
    - Format: CSV (default) or JSON (Enterprise only)
  
  CTA: "CSV Download करें" → GET /api/export/predictions
  
  Sample data preview (first 5 rows shown before download)
  
  Note: "S2+ access required. S1 customers: app only."
```

---

### Page D-03: Alerts (`/dashboard/alerts`)

**Purpose:** Disease, weather, policy, and price alerts for the district.

```
Alert Feed Layout:

Sub-navigation:
  Active Alerts | Alert History | Settings

TAB: Active Alerts

  Threshold-based alert count (top badge row):
    🦠 Disease: X active  | 🌡️ Weather: X active | 📉 Price: X active | 📋 Policy: X active

  Alert cards (full-width list):
    
    HPAI Alert card (red):
      Header: [RED ●] HPAI Alert — Gorakhpur / 16 मई 2026
      Body: "Gorakhpur border area में HPAI (H5N1) case confirmed. Zone radius: 10km from [location]."
      Action buttons: "Advisory पढ़ें" (govt link) | "Sell Signal देखें" (→ price intelligence)
      Dismiss: "Acknowledge" button (logs admin action)
      
    Heat Wave card (amber):
      Header: [AMBER ●] Heat Wave Warning — 3 दिन
      Body: "IMD forecast: 43°C peak on 18 May. Increased poultry mortality risk."
      Action: "Shed Management Tips →" (bottom sheet with actionable steps)
      
    Price Warning card (red):
      Header: [RED ●] Price Crash Risk — Next 5 Days
      Body: "AP/Telangana surplus transport to UP expected. Model predicts ₹12-18/kg decline."
      Action: "Sell Signal देखें →"

  Empty state:
    Illustration: friendly chicken icon (Leo Natsume style)
    Text: "✓ अभी कोई सक्रिय चेतावनी नहीं"
    Sub: "सब ठीक है! जब कोई alert आएगा, यहाँ दिखाई देगा।"

TAB: Alert History

  Table: Date | Type | District | Severity | Resolution | Action Taken
  Filter: by type, by district, by date range
  Export: CSV

TAB: Alert Settings

  Per-alert-type toggles (WhatsApp + Email + In-app):
  
  Table:
    Alert Type | WhatsApp | Email | In-app | Threshold
    HPAI Disease | ✓ | ✓ | ✓ | 200km radius
    Weather (Heat) | ✓ | ✗ | ✓ | District level
    Price Drop Warning | ✓ | ✗ | ✓ | >10% drop predicted
    Price Spike Alert | ✗ | ✗ | ✓ | >8% rise predicted
    Feed Cost Alert | ✓ | ✗ | ✓ | >5% weekly rise
    Subscription Expiry | ✓ | ✓ | ✓ | 3 days prior
  
  Save button: "Settings Save करें"
```

---

### Page D-04: Calculator (`/dashboard/calculator`) — S2 Integrators Only

**Purpose:** Multi-farm profit optimization and feed procurement timing.

```
Sub-navigation:
  Batch Profit | Feed Cost Timing | Multi-Farm View

TAB: Batch Profit Calculator

  Farm selector (multi-farm integrators): dropdown showing all registered farms
  
  Batch inputs (card):
    - झुंड का आकार (Flock size): number input, 10,000+
    - उम्र (Batch age): slider 28–56 days
    - अनुमानित वजन (Avg weight): number input kg (default 2.2kg)
    - चारा लागत (Total feed cost): ₹ input
    - अन्य लागत (Other costs): ₹ input
    
  Projection output card (live update as inputs change):
    "आज बेचने पर" (If sold today):
      Gross Revenue: ₹X (birds × weight × P50)
      Net Profit: ₹Y (revenue - costs)
      Profit/bird: ₹Z
    
    "5 दिन में बेचने पर" (If sold in 5 days):
      Same calculation with P50 forecast for D+5
      Delta vs today: green/red badge
    
    "Optimal selling window": D+2 to D+4 (highlighted)
    
  Chart: 14-day profit projection (bar chart, coloured by sell-signal)
    Green bars = recommended sell days
    Amber = acceptable
    Red = avoid

TAB: Feed Cost Timing

  "अगले 30 दिनों में चारे की ज़रूरत" calculator
  
  Inputs:
    - Current batch size
    - Current batch age
    - Feed consumption rate (auto-filled from breed defaults)
  
  Feed commodity prices widget:
    Maize: ₹X/qtl | Soybean: ₹Y/qtl | Broiler feed complete: ₹Z/qtl
    Source: "AgMarknet commodity prices, updated daily"
    7-day trend sparklines for each
  
  Recommendation:
    "अभी खरीदें" if prices trending up vs "3 दिन रुकें" if dip expected
    With ₹ savings estimate if recommendation followed

TAB: Multi-Farm View (S2 integrators)

  Farm grid (card per farm, up to 20):
    Farm name | Location | Batch age | Flock size | Current signal | Estimated harvest revenue
    
  Consolidated summary:
    Total birds under management: X
    Combined estimated revenue next 14 days: ₹Y
    Highest priority sell (most urgent): Farm A (sell by Day 38)
```

---

### Page D-05: API Access (`/dashboard/api`) — Enterprise S5 Only

**Purpose:** API key management, usage monitoring, documentation.

```
Layout: Two columns

Left column:

  API Key Management card:
    Active key display: masked (show last 4 chars + copy button)
    "नई Key बनाएं" button (modal confirmation)
    Key expiry date
    Rotate key: "Key Rotate करें" (with confirmation modal)
    
  Rate Limit Status:
    Plan: PulseIntel (X req/day)
    Used today: Y/X (progress bar, brandGreen700)
    Reset at: midnight IST
    
  Webhook configuration:
    Endpoint URL input
    Event types checkboxes: price_update, alert_issued, model_retrained
    Test webhook button

Right column:

  API Usage Chart (last 30 days):
    Daily request counts vs limit
    Recharts BarChart, brandGreen700 bars
    
  Quick Start card:
    Code snippet selector: cURL | Python | Node.js | PHP
    Example: GET /v1/predictions?mandi=gorakhpur&days=7
    "Swagger Docs →" link to /api-docs
    
  Response example (syntax-highlighted JSON):
    {
      "mandi": "gorakhpur",
      "predicted_at": "2026-05-16T00:30:00+05:30",
      "p10": 155, "p50": 168, "p90": 175,
      "sell_signal": "SELL_NOW",
      "confidence": 0.89,
      "drivers": [...]
    }
```

---

### Page D-06: Accuracy (`/dashboard/accuracy`) — Admin Only

**Purpose:** Model performance monitoring. Mission-critical — this is the 95%+ accuracy gate dashboard.

```
ACCESS CONTROL: role === 'admin' only. Redirect to /dashboard/403 otherwise.

CRITICAL BANNER (shown when any gate is amber or red):
  Red banner (full-width): "⚠ चेतावनी: मॉडल सटीकता लक्ष्य से नीचे है"
  Sub: "तत्काल action लें। Customer notifications paused."
  
  Green banner when all green: "✓ सभी accuracy gates पास हैं"

Three Accuracy Gate Indicators (top row, large):

  Gate 1: "Directional Accuracy"
    Value: 95.2% (large, Sora font)
    Target: ≥ 95%
    Status badge: ✓ PASS (green) or ✗ FAIL (red)
    30-day trend sparkline
    
  Gate 2: "MAPE (Mean Absolute % Error)"
    Value: 4.8%
    Target: < 6%
    Status badge: ✓ PASS or ✗ FAIL
    
  Gate 3: "Conformal Coverage"
    Value: 80.1%
    Target: 78–82%
    Status badge: ✓ PASS or ✗ FAIL

Charts Section (below gates):

  Chart 1 (col-span-8): 90-Day Rolling MAPE Trend
    Recharts LineChart
    X: dates, Y: MAPE %
    Reference line at 6% (fail threshold) — red dashed
    Reference line at 4% (excellent) — green dotted
    
  Chart 2 (col-span-4): Directional Accuracy by Mandi
    Recharts BarChart, horizontal
    Bar per mandi: Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj
    Colour: green if ≥95%, amber if 90-95%, red if <90%

Model Registry Table (below charts):

  Columns: Version | Type | Promoted On | MAPE | Directional | Coverage | Status
  Rows: last 10 model versions
  Champion row highlighted (bold, green left border)
  Challenger row: italic, amber badge
  
  Actions column (admin only):
    "Details" → model detail modal
    "Rollback" → confirmation modal (⚠ irreversible)

Retrain Schedule:
  "अगला retrain: रविवार 02:00 AM IST"
  Manual retrain trigger button (⚠ confirmation required)
```

---

### Page D-07: Customers (`/dashboard/customers`) — Admin Only

**Purpose:** Customer management, subscription status, usage monitoring.

```
Access: Admin only.

Top metrics (4 cards):
  Active Customers: X
  Trial Customers: Y (expiring in 7 days: Z)
  MRR: ₹X,XX,XXX
  Churn this month: X%

Filter bar:
  Search (phone masked, name)
  Segment filter: S1 | S2 | S3 | S4 | S5 | S6
  Status filter: Active | Trial | Expired | Paused
  District filter: All | Gorakhpur | Deoria | Kushinagar | Basti | Maharajganj
  Sort: by created_at, last_active, subscription_value

Customer table:
  Columns:
    Phone: +91-XXXXX (last 5 digits shown, hover to reveal full — admin permission)
    Name: optional, shown if provided
    Segment: badge (S1, S2, etc.)
    District: mandi name
    Birds: formatted (25K, 1.2L)
    Plan: badge (PulseFarm / PulsePro / PulseIntel)
    Status: badge (Active / Trial / Expired)
    WhatsApp Delivery Rate: X% (last 30 days)
    Last Active: relative time ("3 घंटे पहले")
    Actions: "View" | "Edit Plan" | "Message"

Row detail expansion (click row):
  Subscription: created_at, expires_at, auto_renew
  Usage: API calls (30d), forecasts viewed (30d), calculator uses
  WhatsApp delivery log (last 7 days)
  Payment history (Phase 1: Razorpay integration)

Export:
  "CSV Export" — all filtered results
  Auth: service_role key, logged action
```

---

### Page D-08: Settings (`/dashboard/settings`)

**Purpose:** Account settings, notification preferences, team management.

```
Sub-navigation tabs:
  Profile | Notifications | Team | Billing | Data & Privacy

TAB: Profile
  Phone number (display only, non-editable)
  Farm name (editable)
  District (editable — affects mandi shown by default)
  Flock size range (segmented control)
  Language preference: हिंदी | English (immediate effect)
  Time zone: IST (non-editable)

TAB: Notifications
  (Same as Alert Settings in D-03 Tab 3, but broader)
  + Daily forecast digest: WhatsApp | Email | None
  + Weekly accuracy report: WhatsApp | Email | None
  + Marketing communications: opt-in/out

TAB: Team (S2 Integrators and above)
  Add team member: email + role (Viewer / Analyst / Admin)
  Existing members table: Name | Email | Role | Last active | Remove
  Max members by plan: PulsePro: 5, PulseIntel: unlimited

TAB: Billing
  Current plan + next billing date
  Invoice history table
  Upgrade plan CTA
  Cancel subscription: destructive button (red, confirmation modal)
  Cancellation: "सदस्यता रद्द करने से पहले" — retention modal with offer

TAB: Data & Privacy
  "अपना डेटा Download करें" — DPDP right to access
  "अपना Account Delete करें" — DPDP right to erasure (destructive, red)
  Data processing agreement link
  Consent management: view consents given with dates
```

---

## 4. EMPTY STATES (Leo Natsume Principle — Never Blank)

```
Every empty state has:
1. Friendly illustration (chicken character family — consistent across app)
2. Friendly heading in Hindi
3. Sub-text explaining why empty + what to do
4. Optional CTA

Examples:

No alerts:
  Illustration: chicken standing in sunshine
  Heading: "सब ठीक है! ✓"
  Sub: "अभी कोई active alert नहीं है। HPAI, मौसम, या भाव की चेतावनी आने पर यहाँ दिखेगी।"

No customers (fresh admin):
  Illustration: chicken with welcome sign
  Heading: "अभी कोई Customer नहीं है"
  Sub: "Phase 0 launch होते ही customers यहाँ दिखाई देंगे।"
  CTA: "Accuracy Gate Status देखें →"

No data in chart:
  Illustration: chicken looking at empty chalkboard
  Heading: "डेटा आ रहा है..."
  Sub: "Daily forecast pipeline 06:00 AM पर चलती है। कल की prediction आज रात तक available होगी।"

API key not generated:
  Illustration: key illustration
  Heading: "अभी तक कोई API Key नहीं"
  CTA: "पहली API Key बनाएं →"
```

---

## 5. ERROR STATES (Don Norman Principle — Human-Centered)

```
RULE: Never show raw error codes, stack traces, or technical jargon to users.
      Always show what happened + what to do next.

Network error (general):
  Icon: cloud with X
  Heading: "इंटरनेट से जुड़ने में समस्या"
  Sub: "अपना internet connection check करें और दोबारा कोशिश करें।"
  CTA: "दोबारा कोशिश करें" (retry button)

Data stale (>24h):
  Icon: clock with warning
  Banner: "⚠ डेटा 24+ घंटे पुराना है — ताज़ा data के लिए Refresh करें"
  Not a full-page error — inline warning banner with Refresh CTA

Accuracy gate failed (Admin):
  Full-width red banner (critical, cannot dismiss)
  "⚠ CRITICAL: Model accuracy below 95% threshold"
  "Customer notifications paused automatically. Investigate immediately."
  Actions: View model log | Trigger manual retrain | Contact data team

403 Forbidden:
  Heading: "यह Page आपके plan में शामिल नहीं है"
  Sub: "इस section को access करने के लिए [PulsePro / Admin] access चाहिए।"
  CTA: "Upgrade करें →" or "Admin से संपर्क करें"

Session expired:
  Modal (not page redirect):
  "आपका session expire हो गया है। Please login फिर से करें।"
  CTA: "Login करें" → preserves current URL as redirect
```

---

## 6. LOADING STATES (Never Generic Spinner)

```
Rule: Loading skeletons match the layout of the content they replace.
      Skeleton shimmer animation: left-to-right light sweep, 1.5s loop.

Price chart loading:
  Skeleton: same dimensions as chart, 3 horizontal bands (P90/P50/P10)

Metric cards loading:
  Skeleton: 4 cards, each with rect for number + 2 rects for labels

Customer table loading:
  Skeleton: 10 rows, each with 7 column-width rects

Alert feed loading:
  Skeleton: 3 alert card shapes, left-border rect visible

Critical rule:
  Price P50 number NEVER shows loading spinner — always shows last cached value
  with "⏱ X मिनट पहले" timestamp. If absolutely no cache: "— — —" placeholder,
  never blank, never spinner on this specific element.
```

---

## 7. MOBILE RESPONSIVENESS (Dashboard)

```
The Web Dashboard is designed primarily for desktop (S2 integrators with laptops).
S1 farmers use mobile app only — they cannot access this dashboard.

However, the dashboard must be usable on tablet (768px+):

Sidebar: 
  - Hidden off-screen below 1024px
  - Hamburger in header opens sidebar as overlay
  - Navigation items larger tap targets (48px height)

Grid layout:
  - Row 1 cards: 2×2 grid on tablet (not 4×1)
  - Charts: full-width on tablet
  - Mandi table: horizontal scroll container

Typography:
  - All sizes maintained (app UI uses fixed rem — not fluid)
  - No text below 14px on mobile

Touch targets:
  - All buttons minimum 44×44px
  - Table row actions: expand to full-width button bar on mobile
  - Filters: slide-down panel on mobile (not inline)
```

---

## 8. ACCESSIBILITY (WCAG 2.1 AA — Jessica Lin Principle)

```
Keyboard navigation:
  - All sidebar items: Tab/Enter to activate, arrow keys for sub-menus
  - Chart data: accessible via hidden data table (<caption> + <th> + <td>)
  - Modals: focus trap, Escape to close
  - Tables: keyboard sortable, <th scope="col"> on all headers
  - Dropdowns: keyboard selectable, aria-expanded

Screen reader:
  - Charts: aria-label on container, title inside SVG
  - Live regions: accuracy gate status uses aria-live="assertive" for critical alerts
  - Price updates: aria-live="polite" on P50 price display
  - Status badges: not colour-only — text label always present

Colour contrast:
  - Dashboard sidebar text on #0F1E15: all white/sidebarText meets AA
  - Data labels (neutral-500) on white: 4.6:1 ✓
  - Red status on white: checked for AA compliance
  - Chart accessibility: patterns + labels, not colour alone

Skip links:
  - "Skip to main content" → #main-dashboard-content
  - "Skip to navigation" → #sidebar-nav
```

---

*Document: 04_postlogin_design_master.md*
*Next: 05_postlogin_requirements_master.md*
