# FlockIQ — Updated Product Requirements Document (v2.0)
# Supersedes: PoultryPulse_Dashboard_Requirements_v1.md + PoultryPulse_Dashboard_Requirements_Addendum_v1.md
#             + 05_postlogin_requirements_tasks.md + 16_integrator_farms_requirements_tasks.md
# Version: v2.0 | June 2026 | CONFIDENTIAL
# Brand: FlockIQ (formerly PoultryPulse AI)
# Design Reference: FlockIQ_Updated_Design_Master_v2.md

---

## REQUIREMENTS OVERVIEW

This document defines ALL functional requirements for the FlockIQ platform.
Each requirement follows the format:
  - ID: REQ-[MODULE]-[NUMBER]
  - Priority: P0 (launch blocker) | P1 (v1 release) | P2 (v1.1) | P3 (future)
  - Acceptance Criteria: testable conditions that prove the requirement is met
  - Dependencies: other requirements or systems this depends on

---

## MODULE: GLOBAL / SHARED

### REQ-GLOBAL-001: Brand Rename — PoultryPulse AI → FlockIQ
**Priority:** P0
**Acceptance Criteria:**
- [ ] All UI text, page titles, email templates, WhatsApp messages show "FlockIQ"
- [ ] Logo updated to new FlockIQ brand (provided as SVG asset)
- [ ] Sidebar header shows "FlockIQ" not "PoultrySense" or "PoultryPulse AI"
- [ ] Browser tab title: "FlockIQ — [Page Name]"
- [ ] HTML meta: og:site_name = "FlockIQ"
- [ ] No references to "PoultryPulse AI" or "PoultrySense" anywhere in production UI

### REQ-GLOBAL-002: Bilingual Support (Hindi + English)
**Priority:** P0
**Acceptance Criteria:**
- [ ] Language toggle available in Settings → Profile tab
- [ ] Toggle persists across sessions (stored in user profile, not just localStorage)
- [ ] ALL user-facing text has translations for both Hindi and English
- [ ] Switching language does not require page reload (React i18n context)
- [ ] Hindi text uses Noto Sans Devanagari font (loaded via next/font)
- [ ] Numbers in Hindi UI show in Hindu-Arabic numerals (1,2,3 not ١,٢,٣) 
- [ ] Date format: DD/MM/YYYY for India; configurable for global users
- [ ] Currency: ₹ for India users; configurable symbol for global (USD, EUR)

### REQ-GLOBAL-003: Global Market Readiness
**Priority:** P1
**Acceptance Criteria:**
- [ ] Timezone setting in Settings → user can select their timezone (default: IST)
- [ ] Currency setting: INR, USD, EUR, IDR, VND (Indonesian Rupiah, Vietnamese Dong)
- [ ] "District/Region" concept is generic — works with states/provinces for non-India users
- [ ] Mandi concept maps to "Market" or "Hub" for non-India users
- [ ] No hardcoded India-specific content outside of India-specific modules
- [ ] Date/time formatting respects user locale setting
- [ ] Country selector on signup (India, Indonesia, Vietnam, Thailand, Other)

### REQ-GLOBAL-004: Authentication — Phone OTP + Email
**Priority:** P0
**Acceptance Criteria:**
- [ ] Phone OTP login works for Indian (+91) and international numbers
- [ ] Email + password login as alternative (for global users without reliable SMS)
- [ ] Session management: JWT tokens, 30-day refresh
- [ ] "Remember me" option
- [ ] Logout button in sidebar footer works correctly
- [ ] Password reset via email
- [ ] OTP resend: max 3 resends, 10-minute lockout after 3 failed OTPs
- [ ] Supabase RLS: every query scoped to authenticated user's org/integrator_id

### REQ-GLOBAL-005: Responsive Design
**Priority:** P0
**Acceptance Criteria:**
- [ ] All pages functional at 375px (iPhone SE), 768px (tablet), 1280px+ (desktop)
- [ ] Sidebar collapses to icon rail at 1024px, hidden at 768px (hamburger)
- [ ] All tables: horizontal scroll on mobile (not truncated)
- [ ] All charts: horizontal scroll enabled on mobile with touch support
- [ ] All forms: single-column stacked layout on mobile
- [ ] Minimum touch target: 44×44px (all buttons, links, interactive elements)
- [ ] No horizontal overflow (no content cut off) at any breakpoint

### REQ-GLOBAL-006: Performance
**Priority:** P1
**Acceptance Criteria:**
- [ ] First Contentful Paint (FCP): < 1.5s on 4G connection
- [ ] Largest Contentful Paint (LCP): < 3s on 4G connection
- [ ] Time to Interactive (TTI): < 4s
- [ ] Lighthouse Performance score: ≥ 75
- [ ] All images: WebP format with fallbacks, properly sized
- [ ] Charts: lazy-loaded (not rendered until visible in viewport)
- [ ] API routes: response time < 300ms for 95th percentile
- [ ] Critical CSS inlined; non-critical deferred

### REQ-GLOBAL-007: Error Handling
**Priority:** P0
**Acceptance Criteria:**
- [ ] No raw error codes, HTTP status numbers, or stack traces shown to users
- [ ] Every error state has: Hindi message + English message + action CTA
- [ ] API failures: show stale data with timestamp, not blank screen
- [ ] Network offline: show "No internet connection" banner, keep last data visible
- [ ] 404 pages: Hindi + English message + navigation back to dashboard
- [ ] Form validation errors: shown inline below field, not toast-only
- [ ] Supabase errors: mapped to user-friendly messages before display

---

## MODULE: NAVIGATION & LAYOUT

### REQ-NAV-001: Left Sidebar Navigation
**Priority:** P0
**Acceptance Criteria:**
- [ ] Sidebar width: 240px desktop, 64px icon rail at 1024–1279px, off-screen mobile
- [ ] Sidebar sections: INTELLIGENCE, FARM OPERATIONS, ANALYTICS, ENTERPRISE (see design)
- [ ] Section headers visible as muted labels (not bold nav items)
- [ ] Active nav item: white text + 3px brand400 left border + sidebarHover background
- [ ] Farm count badge on "My Farms" nav item (green pill showing active farm count)
- [ ] Sub-nav for My Farms: appears when section is active; shows All Farms, Add Farm, Compare
- [ ] Role-based visibility: Farm Operations only visible to S1/S2; Enterprise to S5/Admin
- [ ] Keyboard navigable: Tab cycles through items, Enter activates, Escape closes sub-nav
- [ ] WCAG 2.1 AA: all nav items meet colour contrast requirements
- [ ] Trial banner: shown below user block if subscription expires < 30 days
  - < 30 days: amber banner "Trial expires in N days — Renew →"
  - < 7 days: red banner with urgency
  - Expired: red banner, all paid features disabled (price data blurred/locked)

### REQ-NAV-002: Top Header Bar
**Priority:** P0
**Acceptance Criteria:**
- [ ] Breadcrumb navigation shows current path (e.g., "My Farms / Shivaji Farm / Feed")
- [ ] District filter pills: interactive, clicking filters page data to selected district
- [ ] Multiple districts can be selected simultaneously
- [ ] MAPE accuracy pill: green if <6%, amber if 6–9%, red if >9%
- [ ] MAPE pill tooltip: shows full accuracy breakdown on hover
- [ ] Refresh button: shows "N minutes ago" last-updated text; clicking fetches fresh data
- [ ] Notification bell: shows unread badge count; clicking opens notifications panel
- [ ] User avatar dropdown: Profile, Settings, Logout options
- [ ] Upgrade icon (shopping cart): visible to non-PULSE_INTEL users, links to billing

### REQ-NAV-003: Notification Panel
**Priority:** P1
**Acceptance Criteria:**
- [ ] Panel slides in from right (not full-page modal)
- [ ] Shows last 20 notifications, newest first
- [ ] Categories: Price Alert, Disease Alert, Weather Alert, Farm Alert (daily log missing), System
- [ ] Each notification: icon + title + message + timestamp + [Mark as read ✓]
- [ ] [Mark all as read] button at top
- [ ] Notifications older than 30 days: automatically archived
- [ ] Clicking notification: navigates to relevant page and closes panel

### REQ-NAV-004: S1 Farmer Access Control (FLOW GROUP B)
**Priority:** P0
**Acceptance Criteria:**
- [ ] S1 users post-login redirect to /dashboard/price-intelligence/forecast (not /dashboard/mobile-only)
- [ ] S1 users can access their own farm detail pages (/dashboard/farms/[farmId])
- [ ] S1 users cannot access /dashboard/employees (blocked by middleware)
- [ ] S1 users cannot access /dashboard/metrics (blocked by middleware)
- [ ] S1 users cannot access /dashboard/reports (blocked by middleware)
- [ ] S1 users can view price intelligence features (forecast, map, alerts)
- [ ] S1 users can view their farm's GC data but cannot edit it (view-only mode)
- [ ] GC tab shows Hindi/English message for S1 users: "GC cost editing is only available for integrators"
- [ ] Farm detail tabs support horizontal scrolling on 375px mobile viewport (GAP-025)

---

## MODULE: OVERVIEW / DASHBOARD (`/dashboard`)

### REQ-DASH-001: Hero Price Card
**Priority:** P0
**Acceptance Criteria:**
- [ ] Shows today's P50 price for user's primary mandi (set in Settings → Profile)
- [ ] Last-updated timestamp visible (e.g., "03:24 PM")
- [ ] Price change vs yesterday: absolute (₹+4) and percentage (↑2.3%)
  - Green arrow + colour for price up, red for price down
- [ ] 80% confidence interval shown as a range bar (P10 to P90)
  - "₹160 ─────── ₹176 (80% confidence)"
- [ ] Sell signal badge: "आज बेचें ✓" / "रुकें" / "सावधान" with matching colour
- [ ] If model accuracy gate not cleared (<95%): show "Validating model..." instead of price
- [ ] If data is stale (>6 hours old): amber "⚠ Last updated N hours ago" below card
- [ ] "Why today's price?" expandable section (collapsed by default):
  - Shows top 3 drivers as bulleted list with emoji icons
  - Drivers sourced from SHAP feature importance of that day's prediction

### REQ-DASH-002: Model Accuracy Widget
**Priority:** P0
**Acceptance Criteria:**
- [ ] MAPE percentage displayed prominently (e.g., "4.8%")
- [ ] Direction accuracy percentage (e.g., "95.2%")
- [ ] Accuracy bar: filled dots representing quality (●●○○○ = 2/5)
- [ ] "N predictions verified" count
- [ ] "Last retrain: [timestamp]" and "v[version]"
- [ ] Tooltip on hover: "Mean Absolute Percentage Error — measures how close price
     predictions are to actual prices. 4.8% means within ₹7.6 on a ₹160 price."
- [ ] If accuracy drops below 6%: widget stays green
- [ ] If MAPE 6–9%: widget turns amber with "⚠ Accuracy degraded" label
- [ ] If MAPE > 9%: widget turns red, admin notified via Slack alert

### REQ-DASH-003: KPI Strip (5 cards below hero)
**Priority:** P0
**Acceptance Criteria:**
- [ ] Mandi Benchmark card: 7-day avg price | clicking opens price history modal
- [ ] Middleman Spread card: spread in ₹/kg vs NECC zone
- [ ] Active Alerts card: count with category breakdown on hover
- [ ] Feed Cost Index card: composite index value + 7-day sparkline
- [ ] Subscription card: current plan name + renewal date
- [ ] All cards: loading skeleton shown while data fetches
- [ ] All cards: clicking navigates to the relevant detail page

### REQ-DASH-004: Price Forecast Chart (Overview)
**Priority:** P0
**Acceptance Criteria:**
- [ ] Recharts area/line chart showing 30-day forecast by default
- [ ] Time range selector: [7D] [14D] [30D] [90D]
- [ ] Three lines: P10 (dashed light green), P50 (solid dark green), P90 (dashed dark)
- [ ] Shaded area between P10 and P90 (light green, 20% opacity)
- [ ] Actual prices plotted as orange dots/line where data exists
- [ ] Today's date: vertical dashed grey line
- [ ] Annotations: festival markers, disease alert zones, historical sell signals
- [ ] Tooltip on hover: date, P10/P50/P90, actual (if exists), sell signal, error%
- [ ] Legend at bottom of chart
- [ ] Export chart as PNG option (right-click or [⋮] menu)
- [ ] This chart must NEVER be blank (empty chart = broken trust)

### REQ-DASH-005: Active Alerts Feed
**Priority:** P1
**Acceptance Criteria:**
- [ ] Max 5 alerts visible in right column; scrollable if more
- [ ] Alert card: left border colour (red = high, amber = medium, blue = info)
- [ ] Alert card: icon + title (bold) + short description + mandi + timestamp
- [ ] [×] dismiss button: marks alert as read, removes from feed
- [ ] Empty state: green illustration + "No active alerts"
- [ ] "View all →" link navigates to /dashboard/alerts

### REQ-DASH-006: Mandi Price Table
**Priority:** P0
**Acceptance Criteria:**
- [ ] Columns: Mandi | P50 (₹/kg) | Range (P10–P90) | Signal | Change | Sparkline | Updated
- [ ] Sell signal column: coloured pill ("आज बेचें / रुकें / सावधान")
- [ ] Sparkline column: 7-day mini chart (Recharts Sparkline component)
- [ ] Change column: green ↑ or red ↓ with amount and percentage
- [ ] "Updated" column: relative time ("2 minutes ago")
- [ ] Row click → navigates to /dashboard/price?mandi=[mandiId]
- [ ] "Download CSV" button in table toolbar
- [ ] Pagination if >10 mandis (default 10 per page)

### REQ-DASH-007: Farm Quick Summary (S1/S2 users only)
**Priority:** P1
**Acceptance Criteria:**
- [ ] Shows only for users with farms onboarded (S1 / S2 roles)
- [ ] Section header: "आज के Farms | Today's Farm Status"
- [ ] Horizontal scrolling mini-cards (max 5 visible at once)
- [ ] Each mini-card: farm name, batch day, FCR, mortality, log status badge
- [ ] Log status badge: green "✓ Log submitted" or amber "⚠ Log pending"
- [ ] Mini-card click → navigates to that farm's detail page
- [ ] "View All Farms →" link at end of scroll

---

## MODULE: PRICE INTELLIGENCE (`/dashboard/price`)

### REQ-PI-001: Forecast Tab — Must Never Be Blank
**Priority:** P0 (CRITICAL — currently broken in production)
**Acceptance Criteria:**
- [ ] Forecast chart renders immediately on page load with latest forecast data
- [ ] If fresh data unavailable: renders with most recent data + "Last fetched at [time]" notice
- [ ] Never shows blank/empty chart UI (this is the product's core value prop)
- [ ] Mandi selector: dropdown with all covered mandis
- [ ] Date range selector: [7D] [14D] [30D ●] [60D]
- [ ] "Compare mandi" button: adds a second mandi's forecast as dashed line on same chart
- [ ] Chart: P10/P50/P90 bands + actual data where available
- [ ] Festival markers: vertical dashed lines for upcoming festivals in date range
- [ ] HPAI alert zones: red-shaded vertical bands when active disease alerts
- [ ] Sell Signal callout card (separate from chart):
  - Optimal sell window date range
  - Expected P50 price in that window
  - Confidence level (High/Medium/Low + star rating)
- [ ] Price Drivers table: expandable section showing top 5 SHAP features for today's prediction

### REQ-PI-002: Historical Tab
**Priority:** P0
**Acceptance Criteria:**
- [ ] Performance summary: MAPE, P10–P90 hit rate, total predictions (3 KPI tiles)
- [ ] "Accuracy by Month" bar chart showing MAPE trend over past 6 months
- [ ] Data table: columns Date | Mandi | Predicted P50 | Actual | Error% | Within Range? | Signal
- [ ] Error% column: coloured green/amber/red
- [ ] "Within Range" column: ✓ or ✗ icon + colour
- [ ] Row expandable: shows full prediction details + drivers for that day
- [ ] Pagination: 25 rows per page; Previous/Next buttons
- [ ] Mandi filter + date range filter (up to 90 days)
- [ ] Data sorted by date descending (newest first)

### REQ-PI-003: Download Tab
**Priority:** P1
**Acceptance Criteria:**
- [ ] Fields selector: P10, P50, P90, Actual Price, Sell Signal (checkboxes)
- [ ] Mandi selector (dropdown)
- [ ] Date range: max 90 days
- [ ] Format: CSV (all plans) | JSON (PULSE_INTEL only)
- [ ] "Sample Data Preview" table shows first 5 rows before download
- [ ] [Download] button: triggers CSV/JSON download via browser
- [ ] [Quick Download: Last 30 Days] button for common use case (no configuration)
- [ ] Scheduled report toggle: "Email this report every [Monday ▾] at [8:00 AM ▾]"
  - If toggled on: creates a scheduled_report record in DB
  - Email sent via existing email pipeline
- [ ] API sample shown for PULSE_INTEL users (cURL command ready to copy)

---

## MODULE: DISTRICT MAP (`/dashboard/map`)

### REQ-MAP-001: Choropleth Map Rendering (CRITICAL FIX)
**Priority:** P0 (currently broken — all districts show red)
**Acceptance Criteria:**
- [ ] India district boundary GeoJSON loaded correctly (source: datameet/maps GitHub)
- [ ] District fill colour correctly reflects current P50 price signal:
  - Green: P50 > 75th percentile of 30-day range (sell opportunity)
  - Amber: P50 between 25th–75th percentile
  - Red: P50 < 25th percentile (low price, hold if possible)
  - Grey: No data for this district
- [ ] HPAI alert zone: hatched overlay on districts with active disease alerts
- [ ] Map renders correctly at all zoom levels without visual artifacts
- [ ] Map is interactive: hover + click work correctly

### REQ-MAP-002: Map Interaction
**Priority:** P1
**Acceptance Criteria:**
- [ ] District hover: tooltip shows district name + P50 + signal + farm count
- [ ] District click: right panel slides in with full district details
  - District name, today P50, 7-day forecast, signal, active alerts count, farm count
  - [View Price History →] link
- [ ] Layer toggle: [Price] [Farms] [Disease Risk]
  - Farms layer: shows bubble markers sized by farm count per district
  - Disease Risk layer: shows risk heatmap
- [ ] Time slider: play 7-day history of price changes
  - Play button + date slider at bottom of map
  - Animation speed: 1 day per second
- [ ] Map is usable on mobile (touch pan/zoom, no hover-only interactions)

---

## MODULE: ALERTS (`/dashboard/alerts`)

### REQ-ALERT-001: Alert Display
**Priority:** P0
**Acceptance Criteria:**
- [ ] Alert summary strip: 4 category tiles showing count for Disease/Weather/Price/Policy
- [ ] "Alert Radius" displayed: "Alerts cover 50km from [primary location]"
- [ ] Active alerts list: sorted by severity (HIGH first), then recency
- [ ] Alert card: severity border (red/amber/blue), icon, title, description, source, timestamp
- [ ] Dismiss button [×]: marks as read in database, removes from active list
- [ ] Empty state: proper illustration + reassurance text (not just emoji)
- [ ] [Test Alert →] button sends a sample alert to user (for onboarding/testing)

### REQ-ALERT-002: Alert History
**Priority:** P1
**Acceptance Criteria:**
- [ ] Table columns: Date | Type | District | Severity | Duration | Impact (price change during alert)
- [ ] Impact column: shows actual price movement during alert period
- [ ] Filter by type (Disease/Weather/Price/Policy)
- [ ] Filter by date range
- [ ] Exportable as CSV

### REQ-ALERT-003: Alert Settings
**Priority:** P1
**Acceptance Criteria:**
- [ ] Each category (Disease, Weather, Price, Policy) has its own settings card
- [ ] Per-category: trigger threshold (e.g., HPAI within N km, price drop > N%)
- [ ] Per-category: notification channels (WhatsApp ✓, Email ✓, In-App ✓) — independent toggles
- [ ] Per-category: severity filter (HIGH only / HIGH + MEDIUM / All)
- [ ] [+ Add Custom Alert Rule] button (P2 feature, shown as "Pro" locked)
- [ ] [Save Preferences] button: saves all settings, shows success toast
- [ ] Changes take effect immediately (not on next day)

---

## MODULE: MY FARMS — PORTFOLIO (`/dashboard/farms`)

### REQ-FARMS-001: Portfolio KPI Bar
**Priority:** P0
**Acceptance Criteria:**
- [ ] 4 KPI cards: Total Birds (live) | Avg FCR | Avg Mortality | Pending Logs today
- [ ] "Pending Logs" card: red if >0, green if 0
- [ ] Clicking "Pending Logs" card → filters farm list to show only farms missing today's log
- [ ] KPI cards use `farm_metrics_summary` materialized view (server-side, SSR)
- [ ] Skeleton shown while loading, error state if fetch fails

### REQ-FARMS-002: Farm Card Grid
**Priority:** P0
**Acceptance Criteria:**
- [ ] Grid: 3-col desktop, 2-col tablet, 1-col mobile
- [ ] Each card shows: farm name, location, type, capacity, batch day, birds alive, FCR, 
     mortality %, weight progress, batch progress bar, log status, WhatsApp status
- [ ] Log status badge: green "✓ Log submitted [time]" or amber "⚠ Log pending — Submit now →"
- [ ] WhatsApp status: green pill "● Connected" or grey "○ Not connected"
- [ ] Left border colour: green (active + log submitted), amber (active + log missing), grey (no active batch)
- [ ] Hover: shadow increase + scale(1.01) animation (Framer Motion)
- [ ] Card click → navigates to /dashboard/farms/[id]
- [ ] RLS enforced: integrator sees ONLY their own farms

### REQ-FARMS-003: Filter & Sort
**Priority:** P1
**Acceptance Criteria:**
- [ ] Status filter tabs: All | Active | Between Batches | Paused
- [ ] Sort dropdown: Name | FCR | Mortality | Birds | Last Log
- [ ] Search input: debounced 300ms, searches farm name via Supabase ilike
- [ ] All filters/sorts sync to URL query params (browser back/forward works)
- [ ] Filter state persists on page reload (read from URL params on mount)

### REQ-FARMS-004: Empty State & Add Farm
**Priority:** P0
**Acceptance Criteria:**
- [ ] If no farms: isometric farm SVG illustration + Hindi heading + English sub + CTA button
- [ ] [+ Add Farm] button: always visible in filter bar (top-right)
- [ ] Add Farm wizard accessible at /dashboard/farms/new

---

## MODULE: SINGLE FARM DETAIL (`/dashboard/farms/[id]`)

### REQ-FARM-001: Farm Header & Access Control
**Priority:** P0
**Acceptance Criteria:**
- [ ] Server-side RLS: if farms.integrator_id ≠ auth.uid() → return 404 (not 403)
- [ ] Farm header: name, location, type, capacity, status badge, batch number, [⋮] menu
- [ ] [⋮] menu: Edit Farm Details | Start New Batch | Deactivate Farm | Delete Farm
- [ ] Breadcrumb: "My Farms / [Farm Name]"

### REQ-FARM-002: Batch Progress Strip
**Priority:** P0
**Acceptance Criteria:**
- [ ] Shows: batch number, day X of ~Y, placement date, progress bar (%)
- [ ] Birds alive count and as percentage of placed birds
- [ ] Mortality % (cumulative)
- [ ] Current weight vs target weight (grams + % of target)
- [ ] "Harvest Window" banner: shown when weight ≥ 85% of target
  - Shows: estimated harvest window (date range) + P50 price forecast for that window
  - This is the killer cross-feature connecting farm ops to price intelligence

### REQ-FARM-003: Metrics Tab
**Priority:** P0
**Acceptance Criteria:**
- [ ] 5 Recharts charts: FCR Trend, Mortality Cumulative, Weight Progression,
     Daily Feed Intake, Daily Weight Gain (ADG)
- [ ] FCR chart: industry benchmark band (grey shaded zone 1.6–1.9) + target line
- [ ] Weight chart: breed standard growth curve as dashed line (Ross 308 / Cobb 430 / etc)
- [ ] Weight chart: if no actual weights, show estimated weight from growth curve + [+ Log Weight] CTA
- [ ] Mortality chart: "Entbird" threshold line (typically 5%) as horizontal dashed red
- [ ] "Performance Score" card at top: composite score 0–100 + breakdown + improvement tip
- [ ] All charts: hover tooltips with exact values
- [ ] All charts: "View as table" accessibility toggle

### REQ-FARM-004: Daily Log Tab
**Priority:** P0
**Acceptance Criteria:**
- [ ] "Log Today's Data" form shown at TOP (before historical table) if today's log missing
- [ ] Form fields: Birds Dead Today, Feed (kg), Water (L), Temp (°C min-max), Avg Weight (g), Notes
- [ ] Auto-computed read-only fields (shown immediately as user types): FCR, ADG, Mortality %
- [ ] [Save Today's Log ✓] button: POST to /api/farms/[id]/logs
- [ ] If today's log already submitted: form hidden, shows "[✓ Log submitted at HH:MM — Edit]"
- [ ] Edit: clicking [Edit] re-shows form pre-filled with today's data
- [ ] Historical table: Date | Day# | Birds Dead | Mort% | Feed | FCR | Avg Weight | Water | Temp | Notes
- [ ] Table: mortality% column red if >4%, FCR colour-coded
- [ ] Table: sticky header on scroll
- [ ] Export CSV: downloads all log entries for current batch
- [ ] Offline draft: if user fills form with no internet, draft saved to IndexedDB,
     auto-submitted on reconnect with toast notification

### REQ-FARM-005: Health Tab
**Priority:** P1
**Acceptance Criteria:**
- [ ] Health status indicator: green "Healthy" / amber "Monitoring" / red "Critical"
  Last updated timestamp shown
- [ ] Overdue vaccination banner: shown at top if any vaccine is overdue
  "⚠ 2 vaccinations overdue — IB (Day 21) and ND+IB (Day 28)"
- [ ] Vaccination Schedule table: Vaccine | Type | Scheduled Day | Due Date | Status | Route | Notes
  Status: Done (green) | Upcoming (blue) | Overdue (red, pulsing border)
- [ ] Symptom Quick-Log: multi-select chips (not binary yes/no)
  Options: Normal | Respiratory | Leg Weakness | Low Feed | High Mortality | Lethargy | Other
  On any abnormal selection: notes field + severity selector appear
  [Save Symptom Report] → adds entry to Health Event Timeline
- [ ] Health Event Timeline: chronological list of recorded health events
  Each event: date + severity badge + symptoms + notes + action taken
- [ ] Health Checklist: 14-day calendar grid showing log completion
  Each day: colour-coded (green = submitted, amber = abnormal, red = critical, grey = not submitted)
  "Completion rate: N/14 (N%) — Submit logs daily to track flock health"
  Clicking any day opens that day's log
- [ ] Vet Contact card: shows assigned field officer name + phone

### REQ-FARM-006: Feed Tab
**Priority:** P1
**Acceptance Criteria:**
- [ ] Feed Inventory: grouped by feed type (Starter/Grower/Finisher)
  Each type: stock level bar + kg remaining + min level + days remaining
  Days remaining: green >14d, amber 7–14d, red <7d
  If <7 days: show "🔴 URGENT: Only N days left — Order now" + [Order Feed Now →] button
- [ ] [+ Add Feed Purchase] button → inline form (not modal) to record new purchase
  Fields: Date, Supplier, Feed Type, Quantity (MT), Rate (₹/kg), Invoice#
  After save: auto-calculates total cost, updates inventory
- [ ] Feed Purchase Log table: existing columns + "vs Market Rate" column
  "vs Market Rate" fetched from Feed Intelligence page data
  Colour: green if ≤ market, amber if 1–5% above, red if >5% above
- [ ] Feed Cost Summary: existing 3 KPI cards + new "If sold today" projection
  "Revenue at today's P50 (₹168/kg): ₹XXL | Feed cost: ₹XXK | Estimated margin: N%"

### REQ-FARM-007: Batch History Tab
**Priority:** P1
**Acceptance Criteria:**
- [ ] Table: Batch# | Breed | Placed | Birds In | Birds Out | Mortality% | FCR | Avg Weight | Revenue | Profit | Duration | Report
- [ ] View toggle: [Table ●] [Charts] — charts view shows trend bars across batches
- [ ] Each row: [View Report] → generates and downloads PDF batch closure report
- [ ] Farm Lifetime Averages section (4 cards): Avg FCR | Avg Mortality | Avg Revenue | Avg Profit
- [ ] "vs Industry" comparison shown on each card
- [ ] "3 batches completed since onboarding" metadata text

### REQ-FARM-008: WhatsApp Tab (NEW)
**Priority:** P1
**Acceptance Criteria:**
- [ ] Connection status card: shows connected/disconnected state + phone number
- [ ] [Change Time] button: updates daily reminder time
- [ ] [Test Reminder] button: sends a sample WhatsApp immediately
- [ ] [Disconnect] button: removes WhatsApp connection for this farm (confirms before executing)
- [ ] "How it works" expandable explainer (3 steps)
- [ ] Recent submissions table: Date | Source | Birds Dead | Feed kg | Status
  Source column: "WhatsApp ✓" (green) or "Manual" (grey)
- [ ] Conversation preview: last 5 WhatsApp exchanges in chat bubble UI
  Sent messages: right-aligned (light green bg)
  Received replies: left-aligned (white bg)
- [ ] Setup wizard if not connected:
  Step 1: Enter phone number → Step 2: Choose time → Step 3: Language → Step 4: Test → Connected

---

## MODULE: BATCH STATUS BOARD (`/dashboard/batch-board`)

### REQ-BSB-001: Kanban Board
**Priority:** P1
**Acceptance Criteria:**
- [ ] 5 columns: Placement (D1–7) | Growing (D8–28) | Pre-Harvest (D29–42) |
     Harvest Ready (D43+) | Harvested
- [ ] Each column shows: column title + stage description + batch count
- [ ] Batch card: farm name, shed, day, bird count, weight, FCR, mortality, progress bar
- [ ] FCR and mortality: colour-coded values
- [ ] NEW: estimated harvest window on Harvest Ready cards
- [ ] NEW: current price forecast shown on Harvest Ready cards
- [ ] Hover: popover with full batch details (320px card)
- [ ] Harvest Ready column: amber background tint + "Action Required" header
- [ ] Bulk action on Harvest Ready: [Notify farms about today's price →]
- [ ] Filter bar: All | Has Alert | Log Missing | FCR > 2.0 | Mortality > 4%
- [ ] Board is scroll-synced horizontally on mobile

---

## MODULE: PORTFOLIO METRICS (`/dashboard/metrics`)

### REQ-METRICS-001: KPI Strip + Charts
**Priority:** P1
**Acceptance Criteria:**
- [ ] Period selector: [This Week] [This Month] [Last 90 Days] [This Batch] [Custom]
  Selecting period updates ALL charts and KPI cards immediately
- [ ] KPI cards: Total Birds | Avg FCR (with colour) | Mortality Rate (with colour) | Feed Consumed
- [ ] FCR Trend chart: portfolio avg line + industry benchmark + target lines
  Chart not blank — shows data for selected period
- [ ] Mortality Events Timeline chart: cumulative mortality area + event markers
  Not blank — shows data
- [ ] Farm Ranking table: Rank | Farm | FCR + sparkline | Mortality | ADG | Birds | Status | Last Log | Log% | Health
  Row click → farm detail page
- [ ] Pending Actions section: real actionable items (not "Loading...")
  Item types: overdue vaccination | log missing | FCR alert | mortality alert
  Each has [Resolve →] link
- [ ] Network Benchmark section: your portfolio vs platform averages vs top 25%
  Anonymised aggregate data, no farm names

---

## MODULE: FEED INTELLIGENCE (`/dashboard/feed`)

### REQ-FEED-001: Core Page (Existing + Improvements)
**Priority:** P1
**Acceptance Criteria:**
- [ ] Commodity Prices (7-day delta): Maize | Soya Meal | Palm Oil | Composite Index
  Clicking any row expands to show 30-day price chart
- [ ] Procurement Timing Recommendation: actionable card with potential savings calculation
  "Farms needing restock in next 14 days: N farms [Pre-order →]"
- [ ] 14-Day Commodity Forecast chart: Maize + Soya actual + forecast lines
- [ ] Feed Cost Impact Calculator: pre-fills with user's avg farm data
  Shows "vs last batch" comparison

---

## MODULE: MIDDLEMAN CHECK (`/dashboard/middleman`)

### REQ-MM-001: Price Comparison
**Priority:** P1
**Acceptance Criteria:**
- [ ] Mandi Benchmark: auto-populated from today's P50 for user's primary mandi
- [ ] Middleman Price: user-entered field
- [ ] Spread calculation: automatic, shown as ₹/kg + percentage
- [ ] Verdict: colour-coded card (Fair / Caution / Exploit Alert)
  Exploit alert triggers if spread > 8% (configurable threshold)
- [ ] At-scale impact: "At N kg, spread costs you ₹X"
- [ ] 30-day Spread History chart (NEW):
  Shows how this middleman's spread has changed over time
  "Is your middleman getting more or less fair?"
- [ ] Negotiation Tips: bullet list + NEW "Generate Script" button
  AI-generated negotiation script in Hindi
- [ ] [📤 Share via WhatsApp] button: sends analysis summary to farmer's WhatsApp

---

## MODULE: CALCULATOR (`/dashboard/calculator`)

### REQ-CALC-001: Batch Profit Calculator (Improved)
**Priority:** P1
**Acceptance Criteria:**
- [ ] [Load from Farm] dropdown: auto-fills all parameters from live farm data
- [ ] Sell vs Hold Decision Matrix: all existing functionality
- [ ] NEW: Market Timing Score column (0–10) per sell scenario
- [ ] NEW: Harvest Window Visualizer (colour-coded timeline TODAY to +14D)
- [ ] Multi-Farm tab: calculate optimal harvest timing across all farms simultaneously

---

## MODULE: WHATSAPP DAILY LOG AUTOMATION (NEW FLAGSHIP FEATURE)

### REQ-WA-001: WhatsApp Integration Setup
**Priority:** P1
**Acceptance Criteria:**
- [ ] Meta WhatsApp Business API integration configured (using Twilio or direct WABA)
- [ ] Each farm can have ONE associated WhatsApp number (the farmer's number)
- [ ] Setup wizard in Farm Detail → WhatsApp tab (4 steps)
- [ ] Test message sent as part of setup to verify connectivity
- [ ] Multiple farms can share same WhatsApp number (for small integrators managing multiple sheds)

### REQ-WA-002: Daily Reminder Scheduling
**Priority:** P1
**Acceptance Criteria:**
- [ ] Reminder sent daily at user-configured time (default 6:00 PM IST) 
- [ ] Reminder ONLY sent when there is an active batch for that farm
- [ ] Reminder NOT sent on day batch is closed/harvested
- [ ] Reminder template: includes farm name, batch day number, date, simple instructions
- [ ] Language: Hindi or English (configurable per farm)
- [ ] If today's log already submitted (manual or WhatsApp): no reminder sent that day
- [ ] One follow-up reminder at 8:00 PM if no reply received
- [ ] Max 2 messages per day (initial + one follow-up)

### REQ-WA-003: Reply Parsing
**Priority:** P1
**Acceptance Criteria:**
- [ ] Parser handles all documented input variations (see Design doc Section 4.3)
- [ ] Minimum required data: birds_dead (integer ≥ 0) + feed_kg (decimal > 0)
- [ ] Optional data: weight_g (decimal), notes (free text)
- [ ] Parser runs within 60 seconds of receiving farmer reply
- [ ] On successful parse: confirmation WhatsApp sent back to farmer within 90 seconds
- [ ] Confirmation includes: parsed values + auto-computed FCR + cumulative mortality
- [ ] REDO command: farmer can correct by replying "REDO" → re-prompts for input
- [ ] HELP command: sends format instructions
- [ ] STOP command: pauses reminders for this farm (admin notified via dashboard alert)

### REQ-WA-004: Data Validation & Storage
**Priority:** P1
**Acceptance Criteria:**
- [ ] birds_dead: 0 ≤ value ≤ (birds_alive × 0.15) — else flag for review
- [ ] feed_kg: 0 < value ≤ (birds_alive × 0.30) — else send clarification
- [ ] weight_g: 0 < value ≤ 4000 — else send clarification
- [ ] Flagged entries: saved with review_needed = true, integration manager notified
- [ ] All WhatsApp submissions stored in daily_logs table with source = 'whatsapp'
- [ ] Audit trail: raw_message, parsed_values, sent_at, replied_at, confirmation_sent_at
- [ ] If validation fails: system sends clarification WhatsApp to farmer asking to confirm
- [ ] Duplicate prevention: if log already exists for today, bot asks "Already have your log
     for today. Want to update it? Reply YES/NO"

### REQ-WA-005: Dashboard Visibility
**Priority:** P1
**Acceptance Criteria:**
- [ ] Farm card: WhatsApp status badge visible (Connected / Not Connected)
- [ ] Farm card log badge: shows source "via WhatsApp" when today's log from WhatsApp
- [ ] Daily Log table: Source column shows "📱 WhatsApp" or "✏ Manual"
- [ ] Portfolio Metrics: log compliance includes WhatsApp submissions
- [ ] Integration manager can see all WhatsApp submissions in farm detail → WhatsApp tab

---

## MODULE: SETTINGS (`/dashboard/settings`)

### REQ-SETTINGS-001: Profile Tab
**Priority:** P0
**Acceptance Criteria:**
- [ ] Profile information card: name, plan, phone, district/region
- [ ] Edit button: opens inline edit form (not modal)
- [ ] Language preference: Hindi | English toggle (persists to DB)
- [ ] Timezone setting: dropdown (for global users)
- [ ] Currency setting: INR / USD / EUR / IDR / VND
- [ ] Primary Mandi: which mandi's price shows as hero on dashboard
- [ ] Profile completion percentage + tips to complete

### REQ-SETTINGS-002: Notifications Tab
**Priority:** P1
**Acceptance Criteria:**
- [ ] Redesigned category cards (not confusing repeated rows) — see design
- [ ] Per-category: threshold, channel toggles (WhatsApp/Email/App), severity filter
- [ ] "Daily Summary" toggle: single daily digest at configurable time
- [ ] WhatsApp Daily Log Reminder section:
  - Enable/disable toggle
  - Time selector (5 PM / 6 PM / 7 PM / 8 PM)
  - Language selector
  - Farm selection (All / specific farms)
  - [Send Test Reminder →] button
- [ ] [Save Preferences] button with success toast

### REQ-SETTINGS-003: Team Tab
**Priority:** P1
**Acceptance Criteria:**
- [ ] Team members shown as cards (not just table rows)
- [ ] Roles: Owner | Manager | Field Supervisor | View Only
- [ ] [+ Invite] button: via phone number or email
- [ ] Field Supervisor role: can submit daily logs only, no price intelligence access
- [ ] Remove member: confirmation dialog before removal
- [ ] Plan-based limits enforced (S2+ plans for team management)

### REQ-SETTINGS-004: Billing Tab
**Priority:** P1
**Acceptance Criteria:**
- [ ] Plan comparison with "Most Popular" badge on PULSE_PRO
- [ ] Feature comparison table (see design)
- [ ] Annual billing toggle with "Save 20%" callout
- [ ] Current plan highlighted with "Your Plan" badge
- [ ] Upgrade flow: clicking [Upgrade] → payment flow (Razorpay for India, Stripe for global)
- [ ] Payment method management: add/remove/update card
- [ ] Subscription cancellation: confirmation dialog with "pause instead" alternative
- [ ] Invoice history: downloadable PDF invoices

### REQ-SETTINGS-005: Integrations Tab (NEW)
**Priority:** P1
**Acceptance Criteria:**
- [ ] WhatsApp Business card: connected status, farm count, last message sent
- [ ] Email card: connected address, frequency settings
- [ ] Webhook card (PULSE_INTEL only): endpoint URL, secret, test button
- [ ] Each integration: [Manage] and [Disconnect] buttons

---

## MODULE: FARM ADD WIZARD (`/dashboard/farms/new`)

### REQ-WIZARD-001: 4-Step Wizard
**Priority:** P0
**Acceptance Criteria:**
- [ ] Step 1 Farm Info: Name, Type (Broiler/Layer/Breeder), State, District, Block, Village,
     GPS (with "Use My Location" auto-detect), Farm Manager Name + Phone
- [ ] After GPS entry: auto-detect nearest mandi + display "Nearest: Gorakhpur (12km) [Use ✓]"
- [ ] Farm Photo upload: optional, max 5MB, JPEG/PNG/WebP
- [ ] Step 2 Shed Setup: shed name, capacity, type (Open/EC/Semi), floor type (Litter/Slat/Cage)
  [+ Add Shed] allows multiple sheds; capacity visualisation shown
- [ ] Step 3 First Batch: breed (dropdown with common breeds + Ross/Cobb standard curves shown),
     placement date, chick count
  - Show breed-specific growth chart preview after breed selection
  - WhatsApp daily log setup: phone number input + time + language (or "I'll enter manually")
- [ ] Step 4 Review: checklist of configured items + optional items not yet set
- [ ] [Save Farm & Start Tracking]: creates farm + batch + redirects to farm detail
- [ ] Back/Next navigation: form state preserved when navigating back
- [ ] Progress indicator: 4 steps, current step highlighted

---

## MODULE: FARM PERFORMANCE COMPARE (`/dashboard/farms/compare`)

### REQ-COMPARE-001: Multi-Farm Comparison
**Priority:** P2
**Acceptance Criteria:**
- [ ] Farm selector: 2–5 farms, shown as toggle pills
- [ ] Period: Current Batch | Last 30 Days | Last 90 Days | Custom
- [ ] Radar chart: FCR, Mortality, ADG, Feed Efficiency, Harvest Weight, Batch Duration
  Each farm shown in different colour
- [ ] View toggle: [Radar] [Trend Charts]
  Trend Charts: 3 line charts (FCR, Mortality, Weight) with all farms overlaid
- [ ] Detailed comparison table: all metrics + Best column + Industry Avg + Platform Rank
- [ ] AI-generated Key Insight card (1–2 sentence summary of comparison)
- [ ] [Download Comparison Report] → PDF with all charts + table + insight

---

## NON-FUNCTIONAL REQUIREMENTS

### REQ-NFR-001: Security
**Priority:** P0
**Acceptance Criteria:**
- [ ] All API routes: authentication required (except public price data endpoints)
- [ ] SUPABASE_SERVICE_ROLE_KEY: never in client-side code or environment variables
- [ ] RLS: every Supabase query has integrator_id / user_id scoping
- [ ] Farm detail: farmId not owned by user → 404 (not 403, to prevent enumeration)
- [ ] WhatsApp webhook: HMAC signature verification before processing any message
- [ ] Rate limiting: /api/* endpoints max 100 req/min per IP
- [ ] CORS: restricted to app domain only
- [ ] CSP headers: configured to prevent XSS
- [ ] No PII in error logs or console.log statements

### REQ-NFR-002: Data Freshness
**Priority:** P0
**Acceptance Criteria:**
- [ ] Price data: refreshed daily at 6 AM IST (after model inference)
- [ ] Price data: if not refreshed by 8 AM → admin Slack alert
- [ ] Stale data indicator: shown if data > 6 hours old (amber warning)
- [ ] Critical stale: if data > 24 hours old → red warning + admin notified
- [ ] Manual refresh button: always available in header, max 1 refresh per minute per user
- [ ] SWR revalidation: background refresh every 5 minutes on active pages

### REQ-NFR-003: Accessibility
**Priority:** P1
**Acceptance Criteria:**
- [ ] WCAG 2.1 AA compliance: all pages pass automated Axe/Lighthouse accessibility audit
- [ ] All colour-only status indicators: have text/icon label as well
- [ ] All charts: data table alternative available via toggle
- [ ] Focus visible: keyboard focus ring visible on all interactive elements (3px brand400)
- [ ] aria-live regions: form validation errors, toast notifications
- [ ] Language attribute: correct lang="" on Hindi sections
- [ ] Alt text: all informational images have alt text in relevant language

### REQ-NFR-004: Offline Support
**Priority:** P1
**Acceptance Criteria:**
- [ ] Service worker: caches last viewed dashboard page for offline viewing
- [ ] Daily log form: IndexedDB draft saving — form data survives browser close
- [ ] On reconnect: draft auto-submitted with notification "Log submitted after reconnecting"
- [ ] Network status banner: appears when offline, disappears on reconnect
- [ ] Stale price data: visible with clear "Last online at [time]" notice when offline

---

*End of FlockIQ Updated Requirements v2.0*
*Companion files: FlockIQ_Updated_Design_Master_v2.md | FlockIQ_Updated_Tasks_v2.md*
