# FlockIQ — Broiler Price Forecast Screen: Requirements (v1.0)
# Screen Route: /dashboard/price-intelligence/forecast
# Version: v1.0 | June 2026 | CONFIDENTIAL
# Parent: FlockIQ_Updated_Requirements_v2.md
# Design: FlockIQ_Forecast_Screen_Design_v1.md

---

## MODULE: FORECAST SCREEN (FSC)

### REQ-FSC-001: Dedicated Route — Replaces Broken Tab
**Priority:** P0 — Launch blocker
**Context:** The current "Forecast" tab inside /dashboard/price-intelligence renders blank
in production. This dedicated route replaces it entirely.

**Acceptance Criteria:**
- [ ] Route `/dashboard/price-intelligence/forecast` renders a full-page forecast view
- [ ] The old "Forecast" tab in Price Intelligence page now redirects (301) to this new route
- [ ] Sidebar navigation: "Price Intelligence" sub-item shows "Forecast" linking to this route
- [ ] This screen is the DEFAULT landing page after login for S1, S2, and S4 user roles
      (not the Overview dashboard — change the post-login redirect for these roles)
- [ ] Browser tab title: "Broiler Price Forecast — FlockIQ"
- [ ] Page renders with real forecast data within 3 seconds on 4G connection
- [ ] Page NEVER shows a blank white screen (loading skeleton always shown while data fetches)
- [ ] Breadcrumb: "Price Intelligence › Broiler Forecast"

---

### REQ-FSC-002: Disclaimer Strip — Legal Liability Communication
**Priority:** P0 — Non-negotiable
**Context:** FlockIQ is NOT liable for trading decisions based on 30-day forecasts.
This must be clearly communicated to protect the company legally.

**Acceptance Criteria:**
- [ ] Disclaimer strip renders IMMEDIATELY below the page header
- [ ] Strip is visible above the fold on all screen sizes (never scrolled out of view initially)
- [ ] Strip is NOT collapsible, NOT dismissible, NOT hidden by any user setting
- [ ] Strip shows in Hindi when user language = Hindi:
      "पूर्वानुमान की सटीकता दूर की तारीखों के लिए कम होती है।
       D+1-3: उच्च विश्वास (<6% MAPE)। D+7-14: मध्यम (<10%)।
       D+15-30: केवल संकेत (<15%)। FlockIQ व्यापार निर्णयों के लिए
       जिम्मेदार नहीं है। लेन-देन से पहले स्थानीय मंडी से सत्यापित करें।"
- [ ] Strip shows in English when user language = English:
      Full disclaimer text as specified in design doc Section 2.1
- [ ] Strip styling: amber (#FFFBEB bg, #D97706 border, #92400E text, ti-info-circle icon)
- [ ] Strip text references specific MAPE numbers that MATCH actual model accuracy table
      (not hardcoded — fetched from model_accuracy table and interpolated into message)
- [ ] If user prints the page: disclaimer strip prints with the page (no print: none CSS)
- [ ] If user exports CSV: disclaimer text included as first row of CSV file

---

### REQ-FSC-003: KPI Strip — Four Metric Cards
**Priority:** P0

**Acceptance Criteria:**
- [ ] Four cards rendered in a responsive grid (4-col desktop, 2×2 tablet, 1-col mobile)
- [ ] Card 1 — "Today's P50": Shows P50 price for user's primary mandi in large text
      P50 fetched from: `GET /api/price-intelligence/today?mandi={mandiId}`
      Price change vs yesterday: absolute (₹+3.8) and percentage (+2.3%)
      Green arrow if positive, red if negative
      "Updated at HH:MM AM/PM" below price
      If data stale >6h: amber left border + small "⚠ Stale" badge
- [ ] Card 2 — "80% Confidence Band": Shows P10–P90 range for today
      Format: "₹160 – ₹176" (em-dash separator, not hyphen)
      "Range width: ₹N/kg" below
      Tooltip: "80% probability: actual price will fall in this range today"
- [ ] Card 3 — "D+7 Forecast P50": Shows P50 forecast 7 days from today
      Price + direction vs today's P50
      Confidence: shown as filled/empty dot rating (3–4 dots typically)
- [ ] Card 4 — "D+30 Forecast P50": Shows P50 forecast 30 days from today
      Text colour: var(--color-text-secondary) — intentionally muted
      Small amber badge: "Indicative — low confidence"
      Tooltip: "30-day forecasts have ~46% directional accuracy. Use as trend signal only."
      This card MUST look less prominent than D+7 card (visual hierarchy = confidence hierarchy)
- [ ] All 4 cards: loading skeleton shown while data fetches (not blank white)
- [ ] All 4 cards: error state shows grey placeholder with "Updating..." text (not error codes)
- [ ] Card click: navigates to Historical tab filtered to that metric

---

### REQ-FSC-004: Mandi & Horizon Selector Controls
**Priority:** P0

**Acceptance Criteria:**
- [ ] Mandi dropdown: lists all mandis covered by the platform for user's districts
      Default: user's primary mandi (set in Settings → Profile)
      On change: all chart data, KPI cards, sell signal, and matrix refresh for new mandi
      Change persists to URL param: `?mandi=gorakhpur` (browser back/forward works)
- [ ] Horizon selector: [7D] [30D] tabs (default: 30D for integrators/traders, 7D for farmers)
      Switching changes date range shown in chart and matrix
      7D: show D+1 through D+7 with tighter confidence bands
      30D: show D+1 through D+30 with widening confidence bands
- [ ] "Compare Mandis" mode: adds a second mandi's P50 as a dashed line on same chart
      User selects second mandi from a secondary dropdown that appears
      Max 3 mandis shown simultaneously (performance constraint)
- [ ] View toggle: [Chart] [Table] — Chart is default
      Table view: shows all date rows with P10/P50/P90/Actual/Error%/Signal columns
      All controls sync to URL params (shareable/bookmarkable URL)

---

### REQ-FSC-005: Main Forecast Chart
**Priority:** P0 — CRITICAL (this is the core product feature)

**Acceptance Criteria:**
- [ ] Chart renders with real data within 3 seconds of page load
- [ ] Chart NEVER renders blank or white — loading skeleton shows while data fetches
- [ ] If API returns empty data: `ChartEmptyState` component renders with message:
      "Price forecast loads daily at 6:00 AM IST. Check back after 8:00 AM."
      [🔄 Retry] button
- [ ] P50 line: solid green (#1A5C34) for past dates, dashed green for future dates
      Visual distinction between "what happened" and "what we predict" is mandatory
- [ ] Actual price: orange (#E8611A) dots + line for past N days where data exists
      ConnectNulls: false — gaps for missing days shown as breaks, not interpolated
- [ ] P10–P90 confidence band: light green area fill
      Band MUST visually widen as chart moves further into future
      If band does not widen: check that P10/P90 data from API is correct
- [ ] Today's vertical line: dashed grey line with "Today" label
      Position: at today's date index (not always the last actual data point)
- [ ] Festival annotations: vertical amber shaded columns for festivals within date range
      Festival dates sourced from `festivals` DB table (includes Eid, Diwali, Holi, Navratri,
      Christmas, Bakrid — all major festivals affecting UP poultry demand)
      Labels appear above chart area (not over chart lines)
- [ ] HPAI zone annotations: vertical red shaded columns when hpai_district_flag=1
      For any district within 200km of user's primary mandi
      Red dot on x-axis at affected dates
- [ ] Model retrain markers: thin grey dotted line on retrain dates (no label — in tooltip only)
- [ ] Tooltip on hover: shows Date, P50, P90, P10, Actual (if available), Sell Signal
      Uses dark/light mode aware colours (not hardcoded white background)
- [ ] Chart is accessible: canvas has role="img" + aria-label summarising data
      "View as table" toggle shows data in HTML table for screen readers
- [ ] Chart responsive: 300px+ height on desktop, 250px on mobile with touch pan/zoom
- [ ] Legend above chart: custom HTML legend (not Chart.js default)
      Items: P50 Forecast | P10–P90 band | Actual price | Today | Disease alert | Festival
- [ ] Annotation key below chart: explains HPAI zones and festival zones with district names

---

### REQ-FSC-006: Sell Signal Card
**Priority:** P0

**Acceptance Criteria:**
- [ ] Signal computed server-side from: P50 trend direction + volatility regime +
      festival proximity + HPAI flag + current price vs 30-day average
- [ ] Three possible signal states: SELL_NOW / HOLD / CAUTION
      Each has distinct background colour, border, and badge (see design Section 2.4)
- [ ] Signal shows: optimal sell window date range (e.g., "Jun 3–Jun 8")
- [ ] Signal shows: expected P50 price in that window
- [ ] Signal shows: brief reason (e.g., "Post-window risk: declining trend")
- [ ] Confidence displayed as 5 filled/empty dots + text label ("High 4/5")
- [ ] If no signal computable (insufficient data): shows neutral grey card
      "Signal computing — check back after 6:00 AM"
- [ ] Signal updates when mandi selector changes (fetch new signal for new mandi)
- [ ] API: `GET /api/price-intelligence/sell-signal?mandi={mandiId}`
      Returns: { signal, optimalWindowStart, optimalWindowEnd, expectedP50,
                 windowP10, windowP90, confidence, reasons[] }

---

### REQ-FSC-007: Accuracy Decay Visualisation
**Priority:** P0 — Legal liability requirement

**Acceptance Criteria:**
- [ ] Shows directional accuracy (%) for each forecast horizon: D+1, D+3, D+7, D+14, D+21, D+30
- [ ] Values fetched from DB table `model_accuracy_by_horizon` — NOT hardcoded
      Table populated by model validation pipeline after each weekly retrain
      If table empty: show placeholder values with "(estimated)" label
- [ ] Bar chart rendered as pure CSS (no chart library) — horizontal filled divs
      Width proportional to accuracy percentage
      Colour: green >85%, light-green 70–85%, amber 55–70%, red <55%
- [ ] Warning box below bars: explicit text warning about D+15–D+30 reliability
      Text shown in user's preferred language (Hindi/English)
- [ ] This component must never be hidden on any screen size or user role
      It is a legal requirement, not a feature
- [ ] Values update after each model retrain (SWR revalidation on page focus)

---

### REQ-FSC-008: Price Drivers Panel
**Priority:** P1

**Acceptance Criteria:**
- [ ] Shows top 5 SHAP features for today's P50 prediction
- [ ] API: `GET /api/price-intelligence/drivers?date=today&mandi={mandiId}`
      Returns: Array<{ rank, name, nameHindi, description, descriptionHindi,
                       impact_rs, direction: 'up'|'down', confidence, magnitude_pct }>
- [ ] Each driver row: rank number + name (bilingual) + context sub-label +
      impact bar (proportional width, green=positive/red=negative) + ₹ impact value
- [ ] Impact bar colours: green for price-up drivers, red for price-down, amber for neutral
- [ ] If drivers data unavailable: grey placeholder rows with "Computing drivers..."
- [ ] Watermark note at bottom of card:
      "This forecast is personalized & watermarked. Sharing outside your
       organization violates FlockIQ Terms of Service.
       Unique token: FQ-[customer_id_short]-[zero-width-encoded-chars]"
      The zero-width chars are the actual invisible watermark (see PRD Section 7.2)
      The visible customer ID is a deterrent; the hidden chars are the actual identifier

---

### REQ-FSC-009: Sell vs Hold Decision Matrix
**Priority:** P0

**Acceptance Criteria:**
- [ ] Shows 6 rows: TODAY, D+3, D+7, D+14, D+21, D+30
- [ ] Each row: Day label | P50 price | Sell signal pill | Confidence dots (5 dots)
- [ ] Optimal row: highlighted with green background + "Optimal ⭐" badge
      Optimal = highest projected net profit considering feed cost accumulation
- [ ] Confidence dots: filled count decreases as horizon increases (TODAY=5, D+30=0)
      This reinforces accuracy decay theme across the screen
- [ ] Signal pills: आज बेचें (green) / रुकें (amber) / सावधान (red)
- [ ] "Load from Farm" dropdown (above matrix): pre-fills bird count + batch day + weight
      Fetches from: `GET /api/farms?status=active&fields=id,name,currentBatch`
      On selection: fetches batch data and pre-populates context line
      Context line: "Based on: 25,000 birds @ Day 21 · Avg weight 1.68 kg"
- [ ] Break-even calculator (below matrix):
      Break-even price = (total_feed_cost_to_date + overhead) / (birds_alive × avg_weight_kg)
      Computed 100% client-side, no API call
      Shows: break-even value + "₹N above / below break-even" with colour coding
      If no farm selected: shows generic placeholder "Enter farm data above"
- [ ] All matrix calculations update within 50ms of input changes (client-side, synchronous)

---

### REQ-FSC-010: Live Market Context Card
**Priority:** P0

**Acceptance Criteria:**
- [ ] Shows today's actual mandi prices for all mandis in user's selected districts
      API: `GET /api/market/today?districts={ids}` — returns live AGMARKNET data
      Returns: Array<{ mandiId, mandiName, price, distanceKm, lastUpdated, signal }>
- [ ] Each mandi row: name + distance + price + sell signal pill + data freshness
      Data freshness colour: green if <2h ago, grey if 2–6h, amber if >6h, red if >24h
- [ ] Default sort: ascending by distance from user's primary farm GPS
- [ ] Max 5 mandis shown; "Show all mandis →" link if more exist
- [ ] Feed cost section (below mandi table):
      Maize price (₹/qtl) + 7-day delta (colour: red if rising, green if falling)
      Soya meal price + delta
      Composite feed cost index + delta
      Contextual recommendation: "Buy feed NOW" or "Wait 3–5 days" based on forecast
      API: `GET /api/feed/commodity-prices` — returns from NCDEX/MCX scrape pipeline
- [ ] NECC benchmark row (if NECC data available for UP zone):
      "NECC UP zone avg: ₹159.50 · Middleman spread: ₹8.50/kg (Fair)"
- [ ] If market data unavailable: grey placeholder with last-known prices + staleness badge
- [ ] Clicking any mandi row: navigates to full mandi price history page

---

### REQ-FSC-011: Export & Alerts
**Priority:** P1

**Acceptance Criteria:**
- [ ] "Export CSV" button: downloads forecast data for selected mandi + horizon
      CSV columns: Date, P10, P50, P90, Actual (blank for future), Sell Signal, Horizon Day
      First row: disclaimer text (legal requirement)
      Filename: `flockiq-forecast-{mandi}-{date}.csv`
      Rate limited: max 10 downloads per hour per user
- [ ] "Set Price Alert" button: opens a slide-in panel (not a modal — modal breaks layout)
      Panel fields:
        Alert type: [Price above ₹___] [Price below ₹___] [Signal changes to SELL]
        Mandi: [pre-filled with current selection]
        Notify via: [WhatsApp ✓] [Email ✓] [In-App ✓]
        [Save Alert] button
      Saved to: `price_alerts` table in Supabase
      Alert fires: daily after price data refreshes at 6 AM

---

### REQ-FSC-012: Data Freshness & Offline Behaviour
**Priority:** P0

**Acceptance Criteria:**
- [ ] SWR revalidation: all forecast data re-fetches every 5 minutes (revalidateInterval)
      Also re-fetches on window focus (revalidateOnFocus: true)
- [ ] Stale detection: if any data >6h old, amber banner appears:
      "⚠ Data last updated N hours ago. Price forecast may have changed."
      [🔄 Refresh] button triggers immediate re-fetch
- [ ] Model accuracy gate: if MAPE >9% or directional accuracy <90%:
      Replace forecast chart with calibration notice (see design Section 5)
      Show last valid forecast with "OUTDATED" overlay
      Admin receives Slack alert automatically
- [ ] Offline mode: service worker caches last successful forecast response
      When offline: show cached data with "📴 Offline — data from [timestamp]" banner
      All interactive controls (mandi selector, horizon tabs) remain functional
      Offline data: all components show cached values (no white/blank states)
- [ ] Manual refresh button in top header: rate limited to 1 per 60 seconds
      Shows "Refreshed just now" for 5 seconds after refresh

---

### REQ-FSC-013: Access Control & Watermarking
**Priority:** P0 — Security requirement

**Acceptance Criteria:**
- [ ] Route requires authenticated session (middleware redirects to /login if not authed)
- [ ] Trial expired users: forecast data is BLURRED (CSS filter: blur(8px))
      "Your trial has expired. Renew to access price forecasts." overlay
      [Renew Now →] CTA button on the overlay
- [ ] PULSE_FARM (S1 basic) plan: access to 1 mandi only (their primary)
      Compare Mandis button disabled + "Upgrade to PULSE_PRO" tooltip
      D+30 forecast locked (shows blur) with upgrade CTA
- [ ] PULSE_PRO (S1 pro / S2): full access to all mandis and full horizon
- [ ] PULSE_INTEL (S5): full access + API download + JSON export enabled
- [ ] Prediction watermarking (server-side, before response):
      All price values: micro-perturbation ±0.5% unique per customer
      All text fields: zero-width Unicode chars embedded (invisible to human)
      customer_id + timestamp + device_fingerprint logged per prediction served
      Implementation: applied in `/api/price-intelligence/**` middleware layer
- [ ] Access log: every forecast page load logged to `prediction_access_log` table:
      { user_id, mandi_id, horizon, timestamp, ip_address, device_fingerprint_hash }

---

### REQ-FSC-014: Performance
**Priority:** P1

**Acceptance Criteria:**
- [ ] First Contentful Paint (FCP): <1.5s (forecast page)
- [ ] Largest Contentful Paint (LCP): <2.5s
- [ ] Time to Interactive (TTI): <3.5s
- [ ] Chart render (after data received): <200ms (Recharts is synchronous)
- [ ] Mandi selector change → chart refresh: <1.5s (new SWR fetch)
- [ ] Client-side calculations (break-even, matrix ROI): <50ms (synchronous)
- [ ] API endpoints (p50, band, signal, drivers, market): each <300ms (p95)
      Implement DB index on: date, mandi_id, model_version (composite)
- [ ] SWR cache: stale-while-revalidate pattern — user always sees data immediately,
      background refresh happens without loading spinner
- [ ] Chart data: 30 days × 3 values (P10/P50/P90) = 90 data points max
      This is lightweight — no pagination or lazy loading needed for chart data

---

### REQ-FSC-015: Accessibility
**Priority:** P1

**Acceptance Criteria:**
- [ ] WCAG 2.1 AA: all colour contrast ratios ≥4.5:1 for normal text
- [ ] Chart canvas: role="img" + descriptive aria-label + fallback text between canvas tags
- [ ] "View as table" toggle: shows all chart data as an HTML table for screen readers
      Table: accessible with scope headers, caption, and full data
- [ ] All form elements (dropdowns, tabs): keyboard navigable with Tab/Enter/Arrow keys
- [ ] Sell signal badge: colour + icon + text (never colour alone to convey status)
- [ ] Accuracy decay bars: colour + percentage text (never colour alone)
- [ ] Focus ring: visible 2px outline on all interactive elements
- [ ] Disclaimer strip: not hidden from screen readers (always in DOM)
- [ ] Hindi text: lang="hi" attribute on Hindi text containers

---

*End of FlockIQ Broiler Price Forecast Screen Requirements v1.0*
