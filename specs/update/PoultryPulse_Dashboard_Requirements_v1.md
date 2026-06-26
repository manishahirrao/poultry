# PoultryPulse AI — Dashboard Enhancement Requirements
**Document Type:** Requirements Specification (Kiro-Compatible)  
**Version:** 1.0 · May 2026  
**Classification:** CONFIDENTIAL — Engineering & Investor Use  
**Author:** Senior Software Head + SaaS Growth Strategy Layer  
**References:** PRD v3.0, TRD v1.0, Architecture v1.0, UI/UX Design v1.0  
**Competitors Analyzed:** Navfarm Poultry ERP, PoultryPlan (OptiSuite)

---

## Strategic Context

PoultryPulse's defensible moat is **AI-powered price intelligence** — not farm ERP. Navfarm owns operations management. PoultryPlan owns chain benchmarking. PoultryPulse owns the *sell decision*. These dashboard enhancements deepen that moat by transforming raw price forecasts into an **action-complete intelligence layer** that makes every other tool in a farmer's or integrator's stack dependent on PoultryPulse's signal.

The dashboard is the #1 revenue-retention surface in a B2B SaaS product. Every requirement below maps to one of three outcomes:
- **Activation** → First "aha" moment within 3 minutes of login
- **Retention** → Daily habit loop that makes PoultryPulse indispensable
- **Expansion** → Surfaces that justify tier upgrades (PulsePro → PulseEnterprise)

---

## Requirements

### REQ-001 · Command Center Dashboard (Tier: All B2B)

**Priority:** P0 — Must Have  
**User Stories:**
- As a commercial farm operator (S1), I want to open the web dashboard and immediately see the one number that determines my sell decision today, without scrolling or clicking.
- As a mid-size integrator (S2), I want a single view that aggregates price signals, active alerts, batch status, and model accuracy in one glance.
- As an internal admin, I want a real-time health panel of the full system (model accuracy, pipeline status, watermark audit) above the fold.

**Functional Requirements:**

1.1 The Command Center Dashboard shall render a **Price Signal Hero Widget** as the visually dominant element (minimum 35% of above-the-fold viewport area on a 1280px screen). This widget shall display:
   - P50 forecast price for the user's primary district in `font-size: 72px` minimum
   - Direction indicator (↑ UP / ↓ DOWN / → FLAT) with percentage delta vs yesterday
   - Confidence band (P10–P90) shown as a secondary line below the hero number
   - Sell Signal status badge: `SELL NOW` (green) / `HOLD` (amber) / `CAUTION` (red)
   - Time to next batch maturity countdown if batch data is present

1.2 The Command Center shall display a **Live Accuracy Trust Bar** — a horizontal strip immediately below the hero widget showing:
   - 30-day rolling MAPE as a single number with color coding (green <6%, amber 6–8%, red >8%)
   - Directional accuracy percentage
   - "Based on [N] verified predictions" count
   - Last model retrain timestamp

1.3 The Command Center shall display a **5-Card KPI Row** below the accuracy bar, rendering:
   - Card 1: Today's district mandi benchmark (AGMARKNET 7-day avg)
   - Card 2: Middleman spread indicator (delta between mandi benchmark and NECC zone price)
   - Card 3: Active alert count (disease + weather + policy) with severity icon
   - Card 4: Feed cost pressure index (maize/soya composite, 7-day delta)
   - Card 5: Subscription tier + API calls consumed this billing period (admin/enterprise view)

1.4 The Command Center shall display a **7-Day Price Trajectory Chart** (Recharts `ComposedChart`) below the KPI row, showing:
   - Last 7 days actual prices as a solid green line with data points
   - Next 7 days P10/P50/P90 as stacked area bands (green/amber shading)
   - Festival markers as vertical dashed lines with tooltip labels
   - HPAI/weather event markers as colored dots on the date axis

1.5 All Command Center widgets shall be independently refreshable without full-page reload. Each widget shall show its own `last updated` timestamp and a `Refresh` icon button.

1.6 The Command Center layout shall be **configurable by role**:
   - S1 (PulsePro): Price hero + accuracy bar + alerts only
   - S2 (Integrator): All widgets + multi-district toggle
   - S5 (Enterprise): All widgets + API usage + model details panel
   - Admin: All widgets + pipeline health + watermark audit panel

**Non-Functional Requirements:**

1.7 Command Center Time-to-Interactive (TTI) shall be ≤ 1.8 seconds on a 10 Mbps connection (Lighthouse CI gate in CI/CD pipeline).

1.8 All widget data shall be served from a single aggregated API endpoint `GET /api/v2/dashboard/summary` to minimize waterfall requests. Response shape shall be fully typed (TypeScript `DashboardSummary` interface, Zod-validated on ingest).

1.9 The Command Center shall function in **read-only offline mode**: all widget values shall be displayed from the last valid cache (AsyncStorage / SWR cache) with a `⚠ Offline — data from [timestamp]` banner. No empty or broken states shall be the default user experience.

---

### REQ-002 · Multi-District Price Intelligence Map (Tier: S2 Integrators + S5 Enterprise)

**Priority:** P0 — Must Have  
**User Stories:**
- As an integrator managing farms across Gorakhpur, Deoria, and Kushinagar, I want to see price variance across all my districts on a geographic map to decide optimal harvest routing.
- As an enterprise procurement manager, I want to identify arbitrage opportunities between districts before placing transport orders.

**Functional Requirements:**

2.1 The Price Intelligence Map shall render a **choropleth map** of active districts using `react-simple-maps` with UP district GeoJSON boundaries. Color intensity shall encode the P50 forecast price on a green-to-amber-to-red gradient scale (low = red, high = green representing sell opportunity).

2.2 Each district polygon shall be **interactive**:
   - Hover: tooltip showing P50, P10, P90, directional signal, active alert count
   - Click: opens a right-side panel ("District Deep-Dive") without leaving the map view
   - Double-click: sets as primary district and persists across sessions

2.3 The District Deep-Dive panel shall display:
   - 30-day price history chart for the clicked district
   - Top 3 AI-generated price drivers (Hindi for S1/S2, English for S5/Admin) sourced from the Claude API inference layer
   - Active HPAI + weather alerts for that district with severity badges
   - Nearest AGMARKNET mandi benchmark with data freshness indicator

2.4 The map shall support a **Price Differential Overlay** mode (toggle):
   - When enabled, each district shows its delta vs the user's primary district
   - Districts where price is ≥ ₹3/kg higher than primary district shall pulse with an amber animation
   - This enables integrators to identify transport arbitrage opportunities

2.5 The map shall display **real-time HPAI Zone Rings**: when `hpai_district_flag = 1`, the affected district shall display a red dashed border ring with radius animation and a "🦠 Disease Alert" label overlay.

2.6 The map view shall include a **Timeline Scrubber** (horizontal slider, date-range: last 90 days + next 30 days) that animates the choropleth through time, showing how price forecasts evolve across districts. This is a unique engagement feature with high demo value for enterprise sales.

**Non-Functional Requirements:**

2.7 Map render time (initial paint of all district polygons) shall be ≤ 800ms on a 1280px viewport.

2.8 GeoJSON assets shall be served from Cloudflare CDN with `Cache-Control: max-age=86400`. District boundaries are static — no daily download required.

2.9 Map must be screen-reader accessible: each district polygon must have an `aria-label` with the district name, P50 price, and active alert count.

---

### REQ-003 · Batch ROI Optimizer (Tier: S1 PulsePro + S2 Integrators)

**Priority:** P0 — Must Have  
**User Stories:**
- As a farm operator with 25,000 birds at day 38, I want the dashboard to tell me exactly how many rupees I gain or lose by selling today vs waiting 5 days, using the live price forecast.
- As an integrator coordinating harvest schedules across 15 farms, I want to see a prioritized harvest queue ranked by projected per-batch profit.

**Functional Requirements:**

3.1 The Batch ROI Optimizer shall allow users to input (or import from saved profile):
   - Flock size (birds)
   - Current age in days (slider: 28–60)
   - Average live weight (kg/bird, default from breed standard lookup by age)
   - Feed cost per kg consumed to date
   - Overhead cost per bird per day (computed from profile defaults)

3.2 The system shall compute and display a **Sell vs. Hold Decision Matrix** table:
   - Rows: Sell Today, Sell in 3 Days, Sell in 7 Days, Sell in 14 Days
   - Columns: Projected Price (P50), Revenue (₹), Feed + Holding Cost, Mortality Risk Cost, **Net Profit (₹)**, ROI %
   - The highest net-profit row shall be highlighted with a green background and "⭐ Optimal" badge
   - All projections shall use live P10/P50/P90 from the inference API, with separate columns for pessimistic and optimistic scenarios

3.3 The optimizer shall display a **Profit Waterfall Chart** (Recharts `BarChart` with reference lines) showing:
   - Base revenue at today's price (positive bar)
   - Additional revenue from waiting N days (positive/negative delta bar)
   - Cumulative feed cost during wait period (negative bar)
   - Estimated mortality cost during wait period (negative bar)
   - Net profit delta (reference line)

3.4 The optimizer shall surface a **Break-Even Price Alert**: if the offered price from a local trader (user input) is below the break-even price given current feed costs and mortality risk, the system shall display `🔴 Below Break-Even — Do Not Sell at This Price` with the recommended minimum acceptable price.

3.5 For integrators (S2), the optimizer shall support **Multi-Farm Harvest Queue**:
   - Import up to 20 farms with batch data (CSV upload or API sync)
   - Rank farms by projected net profit delta (selling today vs optimal window)
   - Display a prioritized harvest schedule with "Urgent" / "Optimal" / "Can Wait" tags
   - Export as PDF harvest schedule (React-to-PDF library)

3.6 All Batch ROI calculations shall be **100% client-side after initial data fetch** — no per-calculation API call. The computation module shall be a pure TypeScript function testable in isolation.

**Non-Functional Requirements:**

3.7 ROI recalculation on any input change shall complete in ≤ 50ms (synchronous computation, no loading state for updates).

3.8 Batch data entered in the Batch ROI Optimizer shall be persisted to `localStorage` with session key, surviving browser refresh for the active session, and cleared on logout.

---

### REQ-004 · AI-Powered Alert Intelligence Center (Tier: All)

**Priority:** P0 — Must Have  
**User Stories:**
- As a farm operator, I want to receive alerts ranked by their financial impact on MY flock specifically, not generic national alerts.
- As an admin, I want to see the full alert generation pipeline status and a history of all alerts sent across all customers.

**Functional Requirements:**

4.1 The Alert Intelligence Center shall display a **Severity-Ranked Alert Feed** where each alert card includes:
   - Alert type icon (🦠 Disease / 🌡️ Heat / ❄️ Cold / 📉 Price Crash / 🌾 Feed Cost / 📋 Policy)
   - Headline (Hindi for mobile/S1, English available toggle for S2/S5)
   - Estimated financial impact on the user's current flock: `"This alert may affect your batch by ₹X–₹Y"` (computed from flock size × price delta)
   - Source attribution and data freshness timestamp
   - Confidence percentage for AI-generated impact estimates

4.2 Alert cards shall support **three action states**:
   - `Acknowledge` (marks as read, reduces notification badge)
   - `Act Now` (deep-links to the relevant tool: sell signal, batch calculator, or middleman check)
   - `Dismiss` (hides from feed, logs dismissal for analytics)

4.3 The system shall support **Personalized Alert Thresholds** per user:
   - HPAI Distance Threshold: alert me if outbreak within N km of my district (dropdown: 50, 100, 150, 200 km)
   - Temperature Threshold: alert me if heat index > N °C (slider: 32–42°C)
   - Price Drop Threshold: alert me if forecast price drops > N% vs yesterday (slider: 3–20%)
   - Feed Cost Threshold: alert me if maize price rises > N% in 7 days (slider: 3–15%)
   - Settings saved per user in Supabase `customer_alert_preferences` table

4.4 The Alert Center shall display a **7-Day Alert Timeline** (horizontal event strip) showing all past alerts as colored dots on a date axis, providing a visual "stress history" of the past week. Hovering over a dot shows the full alert.

4.5 For Admin only: the Alert Center shall include an **Alert Pipeline Monitor** panel showing:
   - Last run time and status for each Airflow DAG that generates alerts (dag_dahdf_weekly, dag_imd_daily)
   - Number of alerts generated today vs 7-day average
   - Alert delivery rate (sent vs delivered via WhatsApp, with Twilio delivery status)
   - Failed alert deliveries with customer IDs and retry status

**Non-Functional Requirements:**

4.6 Alert cards shall load via **Supabase Realtime subscription** — new alerts appear without page refresh within 3 seconds of insertion into the `alerts` table.

4.7 Alert push notifications (mobile) shall reach the user's device within 60 seconds of the Airflow DAG writing the alert to Supabase, using Expo Notifications + FCM/APNs.

4.8 The alert feed shall support **infinite scroll with virtualization** (react-virtual) — no performance degradation with 500+ historical alert cards.

---

### REQ-005 · Middleman Intelligence & Negotiation Tool (Tier: S1 + S2)

**Priority:** P1 — High Priority  
**User Stories:**
- As a farm operator about to sell, I want to enter the price a trader offered me and instantly know if it's fair, low, or exploitative, with a specific counter-offer number.
- As an integrator, I want to see the historical spread between what my contract farms were offered vs the mandi benchmark.

**Functional Requirements:**

5.1 The Middleman Check shall display a **Price Fairness Gauge** (Recharts `RadialBarChart` or D3 arc):
   - Input: trader's offered price (₹/kg)
   - Display: the offered price plotted on a gauge against the 7-day AGMARKNET mandi benchmark
   - Zones: `Below Market` (red, <90% of benchmark), `Fair` (green, 90–110%), `Premium` (blue, >110%)

5.2 The tool shall generate a **Hindi Negotiation Script** via the Claude API:
   - Input: offered price, district, benchmark price
   - Output: 2–3 sentences in Hindi that a farmer can say to the trader to negotiate
   - Example: `"भाई, आज गोरखपुर मंडी में भाव ₹162/kg है। मुझे कम से कम ₹155 तो देना होगा। क्या ₹158 हो सकता है?"`
   - This is the #1 most shareable feature — drives viral adoption through WhatsApp referrals

5.3 The tool shall maintain a **Personal Price History** for the user: every time a user runs a middleman check, the offered price, benchmark, outcome (accepted/rejected), and date shall be logged locally (localStorage + sync to Supabase). This creates a negotiation history that increases engagement.

5.4 The tool shall display a **Spread Analytics Panel** (S2 Integrators only):
   - 30-day historical chart of: offered prices across farms vs mandi benchmark
   - Average spread per trader (if trader names are input)
   - District-level spread heatmap identifying which districts have the most middleman exploitation

**Non-Functional Requirements:**

5.5 The price fairness gauge shall update in ≤ 100ms on price input change (synchronous calculation from cached benchmark data).

5.6 The Claude API call for the Hindi negotiation script shall be cached for 4 hours per district+price combination to minimize token costs. Cached responses served in <50ms.

---

### REQ-006 · Feed Cost & Procurement Intelligence (Tier: S1 + S2 + S3 Feed Manufacturers)

**Priority:** P1 — High Priority  
**User Stories:**
- As a farm operator procuring 10 tonnes of maize next week, I want to know if the forecast suggests prices will be lower in 2 weeks so I can delay procurement and save ₹30,000.
- As a feed manufacturer (S3), I want a 30-day view of maize and soya commodity forecasts to plan production run scheduling.

**Functional Requirements:**

6.1 The Feed Cost Intelligence panel shall display a **Commodity Futures Dashboard**:
   - Maize price: 7-day actual + 14-day forecast (sourced from NCDEX DAG + trend model)
   - Soya meal price: 7-day actual + 14-day forecast (sourced from NCDEX DAG)
   - Palm oil index: 7-day actual (MCX DAG)
   - Composite Feed Cost Index (weighted: maize 65%, soya 25%, palm oil 10%)

6.2 The panel shall display a **Procurement Timing Recommendation**:
   - `BUY NOW` if the 14-day forecast shows an uptrend of >5% in maize/soya
   - `WAIT` if the 14-day forecast shows a downtrend of >3%
   - `NEUTRAL` otherwise
   - Recommendation shall include estimated ₹ savings for the user's typical procurement volume (input: tonnes per order)

6.3 The panel shall display a **Feed Cost Impact Calculator**:
   - Input: current feed cost per kg, procurement volume
   - Output: if I buy at today's price vs in 7 days: delta in ₹ for my batch

6.4 For S3 Feed Manufacturers, the panel shall surface a **Demand Signal Index**:
   - Predicted broiler price trends as a proxy for feed demand (high broiler prices → farmers hold birds longer → more feed consumed)
   - District-level "demand heat" showing where feed demand is likely to surge in the next 30 days

**Non-Functional Requirements:**

6.5 Commodity price forecasts shall be generated by a simple ARIMA model on the NCDEX/MCX price series (separate from the broiler price model). These forecasts carry a lower accuracy SLA: MAPE < 12% (not the 6% broiler mandate). The lower accuracy shall be disclosed in the UI with a `⚠ Feed price forecast: indicative only` disclaimer.

6.6 The Feed Cost dashboard shall be accessible offline using the last cached commodity data (up to 48-hour cache TTL, longer than the 24-hour broiler cache due to lower volatility).

---

### REQ-007 · Customer Success & Accuracy Transparency Dashboard (Tier: Admin + S5 Enterprise)

**Priority:** P1 — High Priority  
**User Stories:**
- As an enterprise customer's procurement head, I want a weekly accuracy report showing how many of our sell decisions (based on PoultryPulse signals) were correct.
- As an internal admin, I want a dashboard that proves our accuracy claims with auditable data I can show to investors.

**Functional Requirements:**

7.1 The Accuracy Dashboard shall display a **Rolling Accuracy Scorecard** with the following metrics, each with a 30-day trend sparkline:
   - MAPE (Mean Absolute Percentage Error) — green <6%, amber 6–8%, red >8%
   - Directional Accuracy (%) — green >95%, amber 92–95%, red <92%
   - Conformal Interval Coverage (%) — green 78–82%, amber 74–77% or 83–86%, red outside 74–86%
   - P50 vs Actual scatter plot (last 30 days), with a perfect-prediction diagonal reference line

7.2 The dashboard shall display a **Model Timeline** (vertical timeline component):
   - Each champion model promotion event as a node
   - Node details: version, MAPE, directional accuracy, promotion date, retrain trigger
   - Challenger rejection events shown as smaller nodes in amber
   - Rollback events shown in red with root-cause note

7.3 The dashboard shall display a **Customer ROI Summary** (S5 Enterprise view):
   - For each prediction served: the predicted sell signal vs what would have happened without the signal
   - Estimated ₹ saved/gained per batch (computed: [actual_price - price_at_decision_day] × [flock_size × avg_weight])
   - Cumulative ROI since subscription start vs subscription cost paid
   - This is the most important retention metric — the "did it pay for itself" number

7.4 The dashboard shall display a **Data Pipeline Health Panel** (Admin only):
   - Table of all 9 Airflow DAGs with last run status (success / failure / running), last run time, next scheduled run
   - Data freshness indicator per source (AGMARKNET, NECC, IMD, NCDEX, DAHDF)
   - Real-time alert if any critical DAG has not completed successfully in 48 hours

7.5 The dashboard shall support **Investor-Ready PDF Export**:
   - One-click export of the full accuracy scorecard as a branded PDF
   - Suitable for inclusion in investor data rooms
   - Generated client-side using `react-pdf` or `@react-pdf/renderer`

**Non-Functional Requirements:**

7.6 All accuracy metrics shall be sourced exclusively from the `accuracy_log` Supabase table (written by `dag_accuracy_monitor`) — never from in-memory calculations or approximations.

7.7 The Accuracy Dashboard shall be accessible only to `admin` JWT role. Enterprise (S5) customers see a read-only subset (ROI summary + scorecard) without pipeline health details.

---

### REQ-008 · API Usage & Developer Experience Console (Tier: S5 Enterprise)

**Priority:** P1 — High Priority  
**User Stories:**
- As an enterprise integration engineer, I want a developer console inside the dashboard to test API calls, view response schemas, and manage API keys without leaving the browser.
- As an enterprise procurement head, I want to see my API usage vs quota in real-time.

**Functional Requirements:**

8.1 The API Console shall display:
   - Current API keys with `Created`, `Last Used`, `Calls Today`, `Calls This Month` columns
   - Rate limit status: calls used vs quota (progress bar, real-time from Upstash Redis via backend)
   - `Generate New Key` action with clipboard copy on reveal (key shown once only)
   - `Rotate Key` action with confirmation modal and 24-hour grace period for old key
   - `Revoke Key` action with immediate effect and confirmation modal

8.2 The console shall include an **In-Browser API Playground**:
   - Endpoint selector (dropdown of all `/api/v2/forecast/enterprise` parameters)
   - Parameter input fields (district, date_range, confidence_levels)
   - `Send Request` button that executes against the live API using the user's real API key
   - Response viewer: syntax-highlighted JSON with collapsible nodes
   - Copy-as-cURL button generating the curl command for the exact request

8.3 The console shall display an **API Usage Chart**:
   - Bar chart: daily API calls for the last 30 days
   - Line overlay: rate limit quota
   - Tooltip: call count, endpoint breakdown, peak hour

8.4 The console shall link directly to the **Swagger/OpenAPI documentation** (hosted at `/api/docs`, generated from the FastAPI service) in a new tab.

**Non-Functional Requirements:**

8.5 API key values shall never appear in response bodies after initial generation. All API endpoints shall return masked values (`sk-pp-****...****` format) for security.

8.6 The in-browser API Playground shall use the user's real credentials — no test mode. All calls are counted against rate limits and logged in the audit trail, with a clearly visible `⚠ Live API — calls are counted` warning.

---

### REQ-009 · WhatsApp Engagement Analytics (Tier: Admin)

**Priority:** P2 — Standard Priority  
**User Stories:**
- As the Head of Growth, I want to see which WhatsApp messages drive app opens, trial conversions, and subscription renewals.

**Functional Requirements:**

9.1 The WhatsApp Analytics panel shall track and display per message type:
   - Sent count, Delivered count, Read count (via Twilio delivery webhook)
   - Deep link click-through rate (app opens via `poulse://` deep link after message)
   - Time-to-open distribution (histogram: <5min, 5–30min, 30min–6h, >6h)

9.2 The panel shall display a **Message Performance Heatmap** (day × hour grid) showing message engagement rates — enabling the team to optimize the 06:30 IST send time.

9.3 The panel shall flag **High-Churn-Risk Customers**: customers who received the last 5 daily messages but never opened the app in that period, ranked by subscription value.

**Non-Functional Requirements:**

9.4 Delivery webhook processing shall be handled by a dedicated Vercel Edge Function `/api/v1/webhooks/twilio` and stored in a `message_events` Supabase table. No personal data (phone numbers) shall appear in this table — only customer_id (hashed FK).

---

### REQ-010 · Watermark Audit Console (Tier: Admin)

**Priority:** P2 — Standard Priority  
**User Stories:**
- As the CTO, I want immediate visibility when a watermark leak is detected and a clear workflow to investigate and act.

**Functional Requirements:**

10.1 The Watermark Audit Console shall display a **Leak Event Feed** with:
   - Detection timestamp
   - Platform where detected (WhatsApp / Telegram / Screenshot)
   - Customer ID (decoded from watermark token) — **displayed as initials + last 4 digits only** for privacy
   - Prediction date and district encoded in the watermark
   - Current action state: `Detected → Warning Sent → Account Reviewed → Resolved`
   - Action buttons: `Send Warning`, `Suspend Account`, `Mark Resolved`

10.2 The console shall display a **Watermark Coverage Monitor**:
   - % of all predictions served today that have a valid watermark_token in `customer_predictions_served`
   - This must always be 100%. Any value below 100% is a critical alert.

10.3 The console shall display a **Decode Success Rate**:
   - Of all screenshots processed by `dag_watermark_audit`, what % returned a valid decoded customer_id
   - Degradation indicates the OCR pipeline or ZWC encoding is failing

**Non-Functional Requirements:**

10.4 The Watermark Audit Console shall be accessible only to users with `admin` role. No S1/S2/S5 user shall ever see this panel, even via direct URL.

10.5 All watermark event records shall be immutable (no edit/delete capability in the UI). The UI shall be read-plus-action-only: actions write new state records, never mutate existing ones.

---

### REQ-011 · Mobile Dashboard Parity (Tier: All Mobile)

**Priority:** P0 — Must Have  
**User Stories:**
- As a PulsePro farmer using only his Android phone, I want the mobile dashboard to give me the same "aha" experience as the web dashboard within 2 taps of opening the app.

**Functional Requirements:**

11.1 The mobile Home screen (Tab 1) shall implement the Command Center hierarchy adapted for mobile:
   - Price hero card (full-width, 180dp height) as the first visible element on scroll-start
   - Accuracy trust strip (full-width, 48dp) immediately below
   - Sell signal badge (full-width pill, 52dp) immediately below accuracy strip
   - 3 driver bullets (each one-line max in Hindi)
   - 7-day sparkline chart (full-width, 120dp)
   - Then: alerts feed, feed cost card, middleman check entry

11.2 The mobile alert feed (Tab 3) shall implement financial impact tags on every alert card: `~₹[range] impact on your flock` — computed from user's profile flock size.

11.3 The mobile Batch ROI Optimizer (Tab 2, "Sell Signal" screen) shall implement the Sell vs. Hold matrix as a **horizontally scrollable card row** (4 cards: Today, +3D, +7D, +14D) with the optimal card highlighted in green.

11.4 The mobile app shall implement a **Biometric/PIN Quick Lock** that protects the forecast screen from shoulder-surfing while allowing instant unlock for the authenticated user.

**Non-Functional Requirements:**

11.5 Mobile Time-to-Interactive (TTI) from cold start shall be ≤ 1.5 seconds using cached data (Zustand + AsyncStorage hydration).

11.6 All mobile screens shall support **Dynamic Type** (accessibility font scaling) without breaking layouts. Minimum touch target: 48×48dp on all interactive elements (WCAG 2.5.5).

---

### REQ-012 · Onboarding Activation Funnel (Tier: All)

**Priority:** P0 — Must Have  
**User Stories:**
- As the Head of Growth (Jason Lemkin lens), I need the product to deliver a measurable "first value moment" within 3 minutes of signup to achieve >60% Day-7 retention.

**Functional Requirements:**

12.1 The onboarding flow shall implement a **Guided First Run** experience:
   - After OTP verification and profile setup, the app shall navigate to a single-screen "Your First Forecast" experience that pre-fills the batch profit calculator with the user's district + flock size
   - It shall show: "Based on today's forecast, your 25,000-bird batch at ₹162/kg = ₹[X] estimated revenue" as the first screen the user sees after login
   - This is the activation moment — the user sees dollar (rupee) value in the first 60 seconds

12.2 The web dashboard shall implement a **Setup Checklist Widget** (dismissible, shown for first 7 days):
   - ✅ Complete your farm profile
   - ✅ View today's price forecast
   - ✅ Run the batch profit calculator
   - ✅ Set up price alert thresholds
   - ✅ Check the middleman tool
   - Each item deep-links to the relevant screen. Progress bar shows completion %.

12.3 The system shall track activation events in PostHog:
   - `forecast_viewed` (within session 1)
   - `batch_calculator_used` (within 3 days)
   - `middleman_check_used` (within 7 days)
   - `alert_threshold_set` (within 7 days)
   - All events tagged with `tier`, `district`, `flock_size_bucket` properties

**Non-Functional Requirements:**

12.4 The First Run experience shall be displayed to every new user for their first 3 app sessions. It shall not appear on the 4th session onwards.

12.5 Activation funnel data shall be surfaced in the Admin dashboard as a conversion funnel chart (PostHog-sourced, embedded via iframe or API).

---

## Cross-Cutting Requirements

### Security Requirements (Apply to All Dashboard Components)

SEC-001: All dashboard API calls shall include the JWT Bearer token in the `Authorization` header. Supabase RLS enforces row-level isolation beyond JWT validation.

SEC-002: No raw personal data (phone numbers, names) shall appear in any dashboard UI. Only masked identifiers (`customer_id` truncated to 8 chars) shall be displayed in admin views.

SEC-003: All admin-only routes shall be protected by middleware that checks JWT `role = admin` claim before rendering. A 403 redirect to the main dashboard shall occur for unauthorized access attempts.

SEC-004: All exported files (PDF, CSV) shall be generated client-side and shall not pass through any server endpoint — preventing server-side data exfiltration risk.

SEC-005: The dashboard shall enforce a **Content Security Policy (CSP)** header blocking all inline scripts and unauthorized external resource loads. Cloudflare WAF shall enforce this at the edge.

### Performance Requirements (Apply to All Dashboard Components)

PERF-001: Core Web Vitals targets (measured by Lighthouse CI in the CI/CD pipeline):
- LCP (Largest Contentful Paint): ≤ 2.5 seconds
- FID (First Input Delay): ≤ 100ms
- CLS (Cumulative Layout Shift): ≤ 0.1

PERF-002: All chart components shall use **React.memo** and shall only re-render when their specific data slice changes (not on unrelated state updates).

PERF-003: Chart libraries (Recharts) shall be **code-split** and loaded only when the chart tab/section is first accessed (Next.js dynamic imports with `{ ssr: false }`).

PERF-004: All API responses shall include `Cache-Control` headers. The `GET /api/v2/dashboard/summary` endpoint shall be cached at Cloudflare edge for 5 minutes per `customer_id` cache key.

### Accessibility Requirements (Apply to All Dashboard Components)

A11Y-001: All dashboard pages shall achieve **WCAG 2.1 AA** compliance as validated by axe DevTools in CI/CD.

A11Y-002: All charts shall provide accessible data tables as `aria-hidden` alternatives for screen reader users.

A11Y-003: Color is never the sole indicator of state — every color-coded element shall also include an icon and/or text label.

A11Y-004: All interactive elements shall have visible focus rings styled with the brand-green-700 color token.

---

## Acceptance Criteria (System-Level)

| Criterion | Target | Measurement Method |
|---|---|---|
| Command Center TTI | ≤ 1.8s | Lighthouse CI on CI/CD |
| Price Hero accuracy (displayed vs DB) | 100% match | Automated E2E test (Playwright) |
| Alert delivery latency | ≤ 60s from DAG write to push | Integration test with mock DAG trigger |
| Batch ROI recalculation time | ≤ 50ms | Unit test with performance.now() |
| Mobile cold-start TTI | ≤ 1.5s | Detox performance test |
| Watermark coverage rate | 100% | DAG assertion in dag_watermark_audit |
| WCAG 2.1 AA compliance | 0 violations | axe-core in Playwright E2E |
| LCP | ≤ 2.5s | Lighthouse CI |
| API playground response display | ≤ 300ms after response | Playwright timing assertion |
| PostHog activation event tracking | >99% delivery rate | PostHog pipeline health check |

---

*End of Requirements Document — PoultryPulse Dashboard Enhancement v1.0*  
*Next: See Design Specification (PoultryPulse_Dashboard_Design_v1.md) and Task Specification (PoultryPulse_Dashboard_Tasks_v1.md)*
