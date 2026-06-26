# FlockIQ — Broiler Price Forecast Screen: Design Specification (v1.0)
# Screen Route: /dashboard/price-intelligence/forecast
# Version: v1.0 | June 2026 | CONFIDENTIAL
# Status: NEW DEDICATED SCREEN — replaces the broken "Forecast" tab inside Price Intelligence
# Design Reference: FlockIQ_Updated_Design_Master_v2.md (parent)

---

## WHAT THIS SCREEN IS AND WHY IT EXISTS

```
CURRENT STATE (BROKEN):
  Forecast lives as Tab 1 inside /dashboard/price-intelligence
  That tab renders BLANK in production (confirmed from screenshots)
  The most important feature of the product — the price forecast —
  is completely invisible to every paying customer

NEW APPROACH:
  Forecast gets its own DEDICATED route and full-page layout
  Route: /dashboard/price-intelligence/forecast
  This is the PRIMARY landing page for S1 (farmer), S2 (integrator), S4 (trader)
  After login, all three user types land HERE first — not on Overview

  WHY A DEDICATED SCREEN:
  1. The broiler live-weight price forecast is the ONLY price that matters
     to a farmer, integration company, and trader. Egg price, feed price,
     and poultry product prices are secondary and derivative.
  2. The product's entire value proposition is "when to sell" — this screen
     answers that question. It deserves full-page real estate, not a tab.
  3. Forecast accuracy DECREASES as prediction horizon increases. This
     must be communicated visually and prominently so customers do not
     hold FlockIQ liable for 30-day predictions used as firm price contracts.
  4. Market context (live mandi prices) must sit alongside the forecast
     so users can compare prediction vs reality in one view.
```

---

## 1. SCREEN ANATOMY — TOP TO BOTTOM

```
SCREEN: /dashboard/price-intelligence/forecast
TITLE: "Broiler Price Forecast" (full page, not a tab)

┌─────────────────────────────────────────────────────────────────────┐
│  TOPBAR (global — standard FlockIQ header with breadcrumb)          │
│  Flock IQ > Price Intelligence > Broiler Forecast                   │
│  RIGHT: District pills | 4.8% MAPE pill | Refresh | Bell | User    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER                                                        │
│  LEFT: "Broiler Price Forecast" (h1)                               │
│  "Live weight broiler (farm gate) — updated daily 6:00 AM"         │
│  RIGHT: [Export CSV] [Set Price Alert] buttons                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DISCLAIMER STRIP (amber, always visible — never collapsible)       │
│  "Forecast accuracy decreases with prediction horizon. Day 1–3:     │
│  high confidence (<6% MAPE). Day 7–14: moderate (<10%). Day 15–30:  │
│  indicative only (<15%). FlockIQ is not liable for trading          │
│  decisions. Verify with local mandi before transacting."            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CONTROLS ROW                                                       │
│  [Mandi ▾] [7D | 30D ● | Compare Mandis]   [Chart ● | Table]      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  KPI STRIP (4 cards, full width)                                    │
│  [Today's P50] [80% Band] [D+7 Forecast] [D+30 Forecast]           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┬───────────────┐
│  MAIN CHART CARD (8-col)                            │  RIGHT PANEL  │
│  "30-Day Broiler Price Forecast — Gorakhpur APMC"   │  (4-col)      │
│  Legend row                                         │               │
│  [300px Recharts chart]                             │  SELL SIGNAL  │
│  • P10/P50/P90 bands                               │  CARD         │
│  • Actual prices (orange dots)                      │               │
│  • Today vertical line                              │  ACCURACY     │
│  • Festival annotations                             │  DECAY CARD   │
│  • HPAI zone shading                               │               │
│  Annotations legend below chart                     │               │
└─────────────────────────────────────────────────────┴───────────────┘

┌───────────────────┬─────────────────────┬──────────────────────────┐
│  PRICE DRIVERS    │  SELL vs HOLD        │  LIVE MARKET CONTEXT    │
│  CARD (1/3)       │  MATRIX CARD (1/3)   │  CARD (1/3)             │
│                   │                      │                          │
│  Top 5 SHAP       │  TODAY → D+30        │  All mandis + live      │
│  features with    │  price + signal +    │  prices + signals +     │
│  ₹ impact bars    │  confidence stars    │  feed cost index        │
└───────────────────┴─────────────────────┴──────────────────────────┘
```

---

## 2. COMPONENT SPECIFICATIONS

### 2.1 Disclaimer Strip (MANDATORY — never remove)

```
VISUAL:
  Background: #FFFBEB (amber-50)
  Border: 0.5px solid #D97706
  Border-radius: 8px
  Padding: 7px 12px
  Font: 11px, #92400E
  Icon: ti-info-circle (Tabler, 14px)

CONTENT (bilingual):
  Hindi: "पूर्वानुमान की सटीकता दूर की तारीखों के लिए कम होती है।
         D+1-3: उच्च विश्वास। D+7-14: मध्यम। D+15-30: केवल संकेत।
         FlockIQ व्यापार निर्णयों के लिए जिम्मेदार नहीं है।"
  English: "Forecast accuracy decreases with prediction horizon.
           Day 1-3: high confidence (<6% MAPE). Day 7-14: moderate (<10%).
           Day 15-30: indicative only (<15%). FlockIQ is not liable for
           trading decisions. Verify with local mandi before transacting."

BEHAVIOUR:
  NEVER collapsible — always visible on screen
  NEVER hidden by user settings
  This is the legal liability shield — must remain visible at all times
  If language is Hindi: show Hindi version
  If language is English: show English version
```

### 2.2 KPI Strip (4 cards)

```
CARD 1: Today's P50
  Label: "Today's P50 — [Mandi Name]"
  Value: ₹168/kg (24px, font-weight 500)
  Trend: ↑ ₹3.8 vs yesterday (+2.3%) — green
         ↓ ₹X vs yesterday (-N%)    — red
  Sub: Updated at 06:04 AM
  CRITICAL: If data stale >6h → amber left border + "⚠ Stale" badge

CARD 2: 80% Confidence Band
  Label: "80% confidence band"
  Value: ₹160 – ₹176 (16px bold, monospace)
  Trend: "Range width: ₹16/kg"
  Colour: neutral grey
  Tooltip: "80% probability: actual price will fall in this range today"

CARD 3: D+7 Forecast P50
  Label: "D+7 Forecast P50"
  Value: ₹171/kg
  Trend: ↑ +₹3 from today (green)
  Sub: Confidence: ●●●○○ (moderate)

CARD 4: D+30 Forecast P50
  Label: "D+30 Forecast P50"
  Value: ₹163/kg
  Trend: ↓ Indicative — low confidence
  Colour: muted (grey value text)
  CRITICAL: Show warning badge "Low confidence — indicative only"
  This card intentionally looks less important than D+7 card
  (visual hierarchy communicates confidence decreasing)
```

### 2.3 Main Forecast Chart (PRIMARY component)

```
LIBRARY: Recharts ComposedChart
HEIGHT: 300px minimum (320px preferred)
WIDTH: 100% responsive

DATA SERIES:
  1. P50 Forecast Line
     - Past (before today): solid line, #1A5C34, 2.5px width
     - Future (after today): dashed line, #1A5C34, 2px, dash [4,3]
     - NO dots (clutter-free)
     - Tension: 0.35 (smooth)

  2. P10–P90 Confidence Band
     - Area fill between P10 and P90
     - Fill: rgba(61,174,114,0.12) — very light green
     - No stroke on P10/P90 lines (transparent border)
     - Band VISUALLY WIDENS as dates move further into future
       (P10 gets lower, P90 gets higher — this communicates accuracy decay)

  3. Actual Price Line
     - Only plotted for past dates (where actual data exists)
     - Colour: #E8611A (saffron orange — distinct from forecast green)
     - Line width: 2.5px
     - Dots: radius 4px, filled orange — shows individual data points
     - ConnectNulls: false (gaps where no actual data)

ANNOTATIONS (rendered as custom Chart.js plugins or Recharts custom):

  4. TODAY VERTICAL LINE
     - Style: dashed grey, rgba(100,100,100,0.5)
     - Dash: [4,3]
     - Label: "Today" in 9px grey text above line
     - This is the dividing point between actual data and forecast

  5. FESTIVAL MARKERS
     - When a festival falls within the date range:
     - Render: light amber vertical band (column width: 3 data points)
     - Fill: rgba(217,119,6,0.08)
     - Label above: festival name in 9px amber text
     - Example: Bakrid, Diwali, Eid, Holi, Christmas

  6. HPAI DISEASE ZONE
     - When active HPAI alert in any district within 200km:
     - Render: light red vertical band
     - Fill: rgba(220,38,38,0.08)
     - Dot on x-axis: red circle (6px radius)
     - Label above: "HPAI Alert" in 9px red

  7. MODEL RETRAIN MARKERS
     - Thin grey dotted vertical line on dates when model was retrained
     - No label (would clutter) — shows only in tooltip

TOOLTIP (on hover):
  Style: white card, 8px radius, 10px shadow
  Content:
    [Date: Jun 3, 2026]
    P50 Forecast: ₹171/kg
    P90 (upper): ₹179/kg
    P10 (lower): ₹163/kg
    Actual: ₹— (future dates show "—")
    Confidence: High (D+3)
    Sell signal: SELL NOW ✓

AXES:
  X-axis: date labels (MM-DD format), 10px, muted grey
    Show every 3rd date to avoid clutter on 30-day view
    Show every date on 7-day view
  Y-axis: ₹ price, 10px, muted grey
    Formatted: ₹NNN (no decimals)
    Min: data_min - 15 (padding below)
    Max: data_max + 15 (padding above)
  Both axes: no tick lines, no axis line

LEGEND (custom HTML, above chart):
  [━ green] P50 Forecast
  [▓ light green] P10–P90 band
  [━ orange] Actual price
  [-- grey] Today
  [● red] Disease alert
  [● amber] Festival

BELOW CHART (annotation key row):
  [amber square] HPAI zone (district name, active status)
  [amber square] Festival name + expected demand direction
  [muted text] "Model v1.0 · Retrained 3 days ago · 150 predictions verified"
```

### 2.4 Sell Signal Card (RIGHT PANEL, top)

```
SELL NOW STATE:
  Background: #EDF7F1 (green-50)
  Border: 0.5px solid #3DAE72
  Label: "Sell signal — Gorakhpur" (10px, uppercase, #1A5C34)
  Badge: Green pill "✓ आज बेचें — SELL NOW" (13px, #1A5C34 bg, white text)
  Window text: "Optimal window: Jun 3–Jun 8"
               "Expected P50: ₹170–₹174/kg"
               "Post-window risk: declining trend"
  Price display: ₹171/kg (22px, font-weight 500)
  Range: "Expected D+3–D+5 · P10 ₹163 — P90 ₹179"
  Confidence stars: 5 circles, filled = high conf, empty = low
  "High (4/5)" label in green

HOLD STATE:
  Background: #FFFBEB (amber-50)
  Border: 0.5px solid #D97706
  Badge: Amber "⏳ रुकें — HOLD"
  Reason text shown

CAUTION STATE:
  Background: #FEE2E2 (red-50)
  Border: 0.5px solid #DC2626
  Badge: Red "⚠ सावधान — CAUTION"
  Risk factors listed

NOTE: Signal is computed from P50 trend + volatility + festival + HPAI
  SELL NOW: P50 trending up + window closing + price above 3-month avg
  HOLD:     P50 expected to rise in next 3-7 days + low mortality risk
  CAUTION:  P50 declining + high uncertainty + or HPAI nearby
```

### 2.5 Accuracy Decay Card (RIGHT PANEL, bottom)

```
PURPOSE: THIS IS THE LIABILITY SHIELD VISUALIZED
  Shows customers that forecast gets LESS accurate as horizon extends
  Prevents them from treating D+30 as a price guarantee
  Makes them confident about near-term (D+1-3) while realistic about long-term

VISUAL: Horizontal bar chart (not the chart library — simple CSS divs)
  Each row: [Day label] [Progress bar] [Accuracy %]

  D+1:   ██████████████████████████████  ~96%  (green)
  D+3:   ████████████████████████████    ~92%  (green)
  D+7:   █████████████████████████       ~82%  (light green)
  D+14:  █████████████████████           ~70%  (amber)
  D+21:  ████████████████                ~58%  (amber)
  D+30:  █████████████                   ~46%  (red)

COLOUR CODING:
  >85%: #16A34A (green) — rely on this for decisions
  70–85%: #65A30D (light green) — use with caution
  55–70%: #D97706 (amber) — indicative only
  <55%: #DC2626 (red) — directional trend only

WARNING BOX (below bars):
  Background: var(--color-background-secondary)
  Text: "Day 15–30 forecasts are trend indicators only. Actual accuracy
         is lower than near-term forecasts. Always verify with local
         mandi data before making harvest or procurement decisions."
  Font: 10px

HOW ACCURACY IS CALCULATED:
  Based on actual model backtesting on 90-day rolling holdout
  Directional accuracy (not just MAPE) at each horizon
  Updated weekly when model is retrained
  Displayed numbers come from model_accuracy_by_horizon DB table
  NEVER hardcoded — must be real data from the model
```

### 2.6 Price Drivers Card (BOTTOM ROW, left)

```
HEADER: "Why is the price moving? — Top drivers"
SUBHEADER: "AI-powered SHAP feature analysis (model v1.0)"

DRIVER ROW FORMAT:
  [Rank #] [Driver Name + sub-label] [Impact bar] [₹ impact]

  Layout:
  #1  Feed cost (maize lag 42d)         ━━━━━━━━━━  +₹4.2
      Maize ₹2,200/qtl ↑50 (7D)        [90% bar, green]

  #2  Bakrid festival +14D              ━━━━━━━━    +₹2.1
      Demand spike signal               [72% bar, green]

  #3  7-day price momentum              ━━━━━━      +₹1.8
      Uptrend last 7 days               [60% bar, green]

  #4  District supply index             ━━━━        -₹1.3
      Arrivals +8% vs last week         [42% bar, red]

  #5  Heat stress index                 ━━          -₹0.7
      3 days >38°C forecast             [28% bar, amber]

IMPACT BAR:
  Green bar: positive driver (pushes price UP)
  Red bar: negative driver (pushes price DOWN)
  Width: proportional to absolute impact magnitude
  Track: var(--color-background-secondary)

IMPACT VALUE:
  Green text for positive (↑ price)
  Red text for negative (↓ price)
  Format: +₹N.N or -₹N.N

WATERMARK NOTE (bottom of card):
  "This forecast is personalized & watermarked.
   Sharing outside your organization violates FlockIQ terms.
   Unique token: FQ-[CustomerID]-[invisible zero-width chars]"
  Font: 10px, muted
  Lock icon
```

### 2.7 Sell vs Hold Decision Matrix (BOTTOM ROW, centre)

```
PURPOSE: Shows optimal sell timing for farmer's SPECIFIC batch
  Not just "will price go up or down" but "what does it mean for MY farm"

FARM CONTEXT (above matrix):
  "Based on: 25,000 birds @ Day 21 · Avg weight 1.68 kg"
  [Load from Farm ▾] dropdown to auto-fill from actual farm data

MATRIX ROWS:
  TODAY   ₹168/kg   [आज बेचें]   ●●●●○
  D+3 ⭐  ₹171/kg   [आज बेचें]   ●●●●●  ← OPTIMAL badge
  D+7     ₹170/kg   [रुकें]      ●●●○○
  D+14    ₹167/kg   [रुकें]      ●●○○○
  D+21    ₹165/kg   [सावधान]     ●○○○○
  D+30    ₹163/kg   [सावधान]     ○○○○○

SIGNAL PILLS:
  आज बेचें: green pill (#EDF7F1 bg, #1A5C34 text)
  रुकें: amber pill (#FFFBEB bg, #92400E text)
  सावधान: red pill (#FEE2E2 bg, #991B1B text)

CONFIDENCE DOTS:
  5 dots per row (filled = high confidence, empty = low)
  D+1 = 5 filled, D+30 = 0 filled
  This visually reinforces the accuracy decay concept

OPTIMAL ROW:
  Background: #EDF7F1 (green tint)
  Border: 0.5px solid #3DAE72
  Small "Optimal ⭐" badge on the day label
  This is the primary recommendation

BREAK-EVEN CARD (below matrix):
  "Break-even price"
  Value: ₹152/kg
  Current vs break-even: "Current ₹168 — ₹16/kg above break-even" (green)
  If price < break-even: RED alert "⚠ Below break-even — do not sell"

CALCULATION:
  Break-even = (total_feed_cost + overhead_cost) / (birds_alive × avg_weight_kg)
  Computed client-side from farm data or manual inputs
  Updates instantly when farm selection changes
```

### 2.8 Live Market Context Card (BOTTOM ROW, right)

```
PURPOSE: Ground the AI forecast in real-world current mandi prices
  "The model says ₹171 in 3 days. Here's what mandis show TODAY."

MANDI TABLE:
  For each covered mandi (user's district + adjacent):
  [Mandi Name]    [₹XXX/kg]    [Signal pill]
  [X km · N hr ago]

  Sort: by distance from user's primary farm location
  Max: 5 mandis shown (scroll if more)

  Gorakhpur APMC    ₹168/kg    [आज बेचें]   · Primary · 0 min ago
  Deoria Mandi      ₹165/kg    [रुकें]       · 12 km · 2 hr ago
  Basti Mandi       ₹162/kg    [रुकें]       · 48 km · 3 hr ago
  Kushinagar        ₹166/kg    [आज बेचें]   · 55 km · 4 hr ago

DATA FRESHNESS:
  "0 min ago" → green dot
  "2–4 hr ago" → neutral grey
  "> 6 hr ago" → amber "⚠ Stale" label
  "> 24 hr ago" → red "Outdated" label

FEED COST INDEX (below mandi table):
  Divider line
  Section title: "Feed cost index"
  Maize (Gorakhpur):    ₹2,200/qtl  ↑50  (red for feed rising = bad)
  Soya meal:            ₹3,800/qtl  ↓30  (green for feed falling = good)
  Feed cost index:      ₹2,850       ↑35

  Contextual recommendation (amber card):
  "Feed costs rising — buy feed NOW to lock in current rates"
  Or: "Feed costs falling — wait 3–5 days before bulk purchase"

NECC BENCHMARK (if available):
  "NECC zone avg (UP): ₹159.50 · Middleman spread: ₹8.50/kg (Fair)"
  This gives integrators and traders the wholesale benchmark
```

---

## 3. ACCURACY DECAY — VISUAL COMMUNICATION STRATEGY

```
CORE PRINCIPLE:
  The product MUST communicate that D+30 forecasts are trend signals,
  not price contracts. Failure to do this creates customer complaints,
  demands for refunds, and legal liability when the model is wrong at 30 days.

FIVE PLACES ACCURACY DECAY IS COMMUNICATED:

1. DISCLAIMER STRIP (always visible at top — cannot be dismissed)
   Explicit legal disclaimer with specific MAPE numbers by horizon

2. KPI STRIP (D+30 card intentionally muted)
   D+30 card uses grey text (not bold green like D+7)
   Shows "Indicative — low confidence" label
   Small amber warning badge

3. MAIN CHART (P10-P90 band visually widens into the future)
   Near-term: narrow band (₹16 range)
   Day 30: wide band (₹44 range)
   The visual expansion of the band IS the confidence decay — no text needed

4. SELL vs HOLD MATRIX (confidence dots decrease with horizon)
   TODAY: ●●●●●  (5 filled)
   D+30:  ○○○○○  (0 filled)
   User sees dots decrease as they scan DOWN the matrix rows

5. ACCURACY DECAY CARD (explicit bar chart)
   Shows directional accuracy % for each horizon
   Colour-coded: green → amber → red
   Explicit warning box below
```

---

## 4. PERSONALISATION & WATERMARKING (visible design)

```
Every prediction shown on this screen must carry visible personalisation:
  - Mandi selected = user's primary mandi (set in profile)
  - Sell signal = computed for user's batch size and day
  - Decision matrix = pre-loaded with user's farm data if available
  - Break-even price = specific to user's feed cost and overhead

VISIBLE WATERMARK in Price Drivers card:
  "Unique token: FQ-[CustomerID]-[zero-width chars]"
  Customer can see their ID but not the hidden chars embedded in text
  This TELLS them they are watermarked — reduces sharing incentive
  ("even if I share this, they know it came from me")

INVISIBLE WATERMARK (technical, see PRD Section 7.2):
  Zero-width Unicode chars embedded in all text fields
  Micro-perturbation on price values (±0.5% — within model error)
  Both applied server-side before response is sent
```

---

## 5. EMPTY & ERROR STATES (mandatory — never blank)

```
DATA LOADING:
  KPI strip: 4 skeleton rectangles (animate-pulse)
  Chart: grey shimmer 300px tall with decorative bars suggesting chart shape
  Right panel: skeleton rectangles matching card dimensions

DATA UNAVAILABLE (API error or model not trained):
  KPI strip: grey placeholder values + "Updating..." badge
  Chart: grey placeholder with text:
    "Price forecast loads daily at 6:00 AM IST
     If this persists after 8:00 AM, please contact support."
    [Retry →] button
  NEVER show a blank chart rectangle

STALE DATA (>6 hours):
  Amber banner below disclaimer strip:
  "⚠ Data last updated N hours ago — this morning's forecast may differ"
  [🔄 Refresh] button

MODEL ACCURACY GATE NOT CLEARED:
  If MAPE > 9% or directional accuracy < 90%:
  Replace forecast chart with:
  "🔧 Model is being recalibrated — forecast temporarily unavailable
   Last valid forecast: [date]. Check back in a few hours."
  Show last valid forecast data with heavy "OUTDATED" watermark overlay
```

---

## 6. RESPONSIVE DESIGN

```
DESKTOP (1280px+):
  Main grid: chart (8-col) + right panel (4-col)
  Bottom grid: 3-equal columns (drivers / matrix / market)
  KPI strip: 4 equal columns

TABLET (768px–1279px):
  Main grid: chart full-width, right panel below (stacked)
  Bottom grid: 2-col (drivers + matrix) / market below
  KPI strip: 2×2 grid

MOBILE (< 768px):
  ALL sections stacked vertically
  KPI strip: 1-col (full width each card, 4 cards stacked)
  Chart: 250px height, horizontal scroll enabled for 30-day view
  Right panel: Sell Signal first, Accuracy Decay below
  Bottom section: Market Context first (most actionable), then Drivers, then Matrix
  IMPORTANT: On mobile, market context comes BEFORE drivers because
    farmers on mobile want to ACT first, understand later
```

---

## 7. COLOUR USAGE SUMMARY

```
PRICE UP / POSITIVE DRIVER:   #16A34A (green)
PRICE DOWN / NEGATIVE DRIVER: #DC2626 (red)
NEUTRAL / STABLE:             #6B7280 (grey)
SELL NOW signal:              #1A5C34 (dark green) — bg, white text
HOLD signal:                  #D97706 (amber)
CAUTION signal:               #DC2626 (red)
FORECAST LINE:                #1A5C34
ACTUAL PRICE LINE:            #E8611A (saffron orange — distinct!)
CONFIDENCE BAND:              rgba(61,174,114,0.12) (very light green)
HPAI ZONE:                   rgba(220,38,38,0.08)
FESTIVAL ZONE:                rgba(217,119,6,0.08)
TODAY LINE:                   rgba(100,100,100,0.5)
DISCLAIMER STRIP:             #FFFBEB bg, #D97706 border, #92400E text
ACCURACY DECAY BARS:
  >85%: #16A34A | 70-85%: #65A30D | 55-70%: #D97706 | <55%: #DC2626
```

---

*End of FlockIQ Broiler Price Forecast Screen Design v1.0*
