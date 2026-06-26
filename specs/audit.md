e complete user flow audit prompt
Create the complete user flow audit prompt

Create the complete user flow audit prompt
bash

cat > /home/claude/windsurf_prompt/FlockIQ_UserFlow_Audit_Prompt.md << 'FLOWAUDIT_EOF'
# FlockIQ — User Flow Audit, Gap Analysis & Fix Prompt
# Version: v1.0 | June 2026
# Copy this ENTIRE document into Windsurf Cascade (Agent mode)
# Purpose: Audit every user flow for Integration Company (S2) and Commercial Farm (S1)
#          personas, identify gaps, dead-ends, and missing connections, then fix them.

---

## ROLE & MISSION

You are a **senior UX engineer and product quality auditor** working on **FlockIQ** — a poultry farm management and price intelligence SaaS.

Your mission: **Walk every user flow from the perspective of two personas. Find every gap, dead-end, broken connection, missing screen, and uncompleted journey. Then fix all of them.**

Do not assume anything works. Check every route, every navigation link, every "coming soon" placeholder, every button that leads nowhere.

---

## THE TWO PERSONAS YOU MUST THINK FROM

### PERSONA A — Ramesh Pandey (Integration Company Owner)
```
Role:       S2 Integrator — owns mid-size poultry integration business
Location:   Gorakhpur, UP
Operations: Manages 8 contract farms, 1,80,000 total birds
Staff:      12 employees (6 farm managers, 2 field supervisors, 2 drivers, 1 accountant, 1 office)
Device:     Desktop (primary) + Android phone (field visits)
Language:   Hindi preferred, comfortable with English numbers/labels
Plan:       PULSE_PRO

RAMESH'S DAILY ROUTINE (map every touchpoint):
  6:00 AM → Wakes up, checks FlockIQ on phone
             Wants: today's broiler price, sell signal, any overnight alerts
  7:00 AM → Reviews which farms submitted yesterday's WhatsApp log
             Wants: see which farms are missing data, ping them
  8:00 AM → Office — checks portfolio metrics on desktop
             Wants: FCR across all farms, any mortality spike, GC trend
  9:00 AM → Field visit to Farm 3 (Shivaji Poultry Farm)
             Wants: log today's data on phone, check feed inventory
  12:00 PM → Price intelligence check
             Wants: should I tell my farmers to sell this week or wait?
             Also: feed procurement — should I order maize now or wait?
  3:00 PM → Back at office — salary and expenses
             Wants: approve June salary for 12 employees, record fuel expense
  5:00 PM → End of day review
             Wants: which farms logged today, GC for each active batch,
                    projected batch profits, P&L for the month
  6:30 PM → WhatsApp reminders sent to farmers who haven't logged

RAMESH'S KEY DECISIONS MADE IN THE APP:
  → "Sell now or hold?" (needs: forecast + farm batch readiness + GC break-even)
  → "Order feed now or wait 5 days?" (needs: commodity forecast + farm inventory)
  → "Farm 3 is underperforming — why?" (needs: GC comparison, FCR trend, cost breakdown)
  → "Pay salaries this month" (needs: employee module, farm allocation, sync to GC)
  → "What is my actual monthly profit?" (needs: P&L with all costs)
```

### PERSONA B — Suresh Kumar (Commercial Farmer)
```
Role:       S1 Commercial Farm Owner — contract farmer under Ramesh's integration
Location:   Village near Gorakhpur
Farm:       Shivaji Poultry Farm, 1 shed, 25,000 birds
Device:     Android phone ONLY (no desktop access)
Language:   Hindi only
Plan:       PULSE_FARM (access granted by Ramesh as sub-account)
WhatsApp:   Primary interaction channel for daily logs

SURESH'S DAILY ROUTINE:
  6:00 AM → Checks WhatsApp for FlockIQ daily price message
             Wants: simple "बेचें / रुकें" + today's price
  8:00 AM → Morning farm rounds — counts deaths, checks feed hopper
  6:00 PM → Receives WhatsApp reminder from FlockIQ
             Replies: "2 1250 1680" (birds dead, feed kg, weight g)
             Expects: confirmation message back within 2 minutes
  When needed → Opens FlockIQ app/web for:
             - Vaccination schedule check
             - Feed inventory status
             - Health event recording
             - Seeing his batch progress

SURESH'S KEY QUESTIONS:
  → "At what price should I sell?" (needs: forecast + his break-even GC)
  → "How many days until my birds are ready to sell?" (needs: batch progress)
  → "Am I doing better or worse than last batch?" (needs: batch history + GC)
  → "My birds are getting sick — what should I log?" (needs: health tab)
```

---

## COMPLETE SCREEN & ROUTE INVENTORY

All routes that should exist in FlockIQ. For each, you must verify:
(a) Route exists and renders
(b) All navigation FROM this screen works
(c) All navigation TO this screen is reachable
(d) All data-dependent components have proper loading/empty/error states
(e) All CTAs lead somewhere (no dead ends)

```
AUTH FLOWS:
  /login                            — Phone OTP or email login
  /signup                           — New registration
  /forgot-password                  — Password reset
  /mobile-only                      — Shown to S1 users accessing desktop

POST-LOGIN — PRICE INTELLIGENCE:
  /dashboard                        — Overview (lands here for S5/Admin; S1/S2/S4 → /forecast)
  /dashboard/price-intelligence/forecast    — PRIMARY LANDING for S1/S2/S4
  /dashboard/price-intelligence/historical  — Historical accuracy data
  /dashboard/price-intelligence/download    — CSV/JSON export
  /dashboard/map                    — District choropleth map
  /dashboard/alerts                 — Alerts page (3 tabs: Active / History / Settings)
  /dashboard/feed                   — Feed cost intelligence
  /dashboard/middleman              — Middleman check

POST-LOGIN — FARM OPERATIONS (S2 Integrator):
  /dashboard/farms                  — Farm portfolio
  /dashboard/farms/new              — Add new farm wizard (4 steps)
  /dashboard/farms/compare          — Cross-farm comparison
  /dashboard/farms/[id]             — Farm detail (6 tabs)
  /dashboard/farms/[id]?tab=metrics         — Metrics tab
  /dashboard/farms/[id]?tab=daily-log       — Daily log tab + entry form
  /dashboard/farms/[id]?tab=health          — Health tab
  /dashboard/farms/[id]?tab=feed            — Feed tab
  /dashboard/farms/[id]?tab=gc              — GC / Growing Cost tab (NEW)
  /dashboard/farms/[id]?tab=batch-history   — Batch history tab
  /dashboard/farms/[id]?tab=whatsapp        — WhatsApp automation tab (NEW)
  /dashboard/batch-board            — Kanban batch status board

POST-LOGIN — ANALYTICS (S2 Integrator):
  /dashboard/metrics                — Portfolio metrics
  /dashboard/employees              — Employee & expense management (NEW)
  /dashboard/employees?tab=employees        — Employee list
  /dashboard/employees?tab=salaries         — Salary management
  /dashboard/employees?tab=expenses         — Business expenses
  /dashboard/employees?tab=pl              — P&L overview
  /dashboard/reports                — Reports download
  /dashboard/calculator             — Batch profit calculator

SETTINGS:
  /dashboard/settings               — Settings root → redirects to /profile
  /dashboard/settings/profile       — Profile settings
  /dashboard/settings/notifications  — Notification preferences
  /dashboard/settings/team          — Team management
  /dashboard/settings/billing       — Plan & billing
  /dashboard/settings/integrations  — WhatsApp + webhook integrations (NEW)

ADMIN ONLY:
  /dashboard/accuracy               — Model accuracy monitoring
  /dashboard/customers              — Customer management
```

---

## AUDIT TASK 1: FLOW MAPPING

For each persona, trace every flow listed below. For each flow step, check if it works end-to-end. If a step is broken, missing, or leads to a dead end — flag it as a gap.

### FLOW GROUP A: RAMESH (S2 INTEGRATOR) — MORNING ROUTINE

**Flow A1: Morning Price Check**
```
START: Ramesh opens FlockIQ
  → POST-LOGIN REDIRECT: should land on /dashboard/price-intelligence/forecast
     GAP CHECK: does post-login middleware redirect S2 users to /forecast?
     If user is already logged in and revisits /, does it still redirect correctly?

  → /forecast loads
     GAP CHECK: does the forecast chart actually render (not blank)?
     This was confirmed BLANK in production — verify fix is in place
     GAP CHECK: does the Sell Signal card show today's signal?
     GAP CHECK: does the Accuracy Decay card load from DB (not hardcoded)?

  → Ramesh wants to see price for Deoria mandi (not just Gorakhpur)
     ACTION: changes mandi in dropdown
     GAP CHECK: does changing mandi re-fetch chart + signal + matrix data?
     GAP CHECK: does URL update to ?mandi=deoria (shareable/bookmarkable)?

  → Ramesh sees "Harvest Ready" farms in Sell vs Hold Matrix
     ACTION: selects "Shivaji Farm" from the Load from Farm dropdown
     GAP CHECK: does dropdown show his 8 farms?
     GAP CHECK: does selecting a farm auto-fill birds alive, weight, batch day?
     GAP CHECK: does break-even (GC) auto-populate from real farm GC data?
     GAP CHECK: is GC connected to actual batch_gc_costs table data?
```

**Flow A2: Morning Portfolio Check**
```
  → Ramesh navigates to /dashboard/farms (sidebar: "My Farms")
     GAP CHECK: sidebar "My Farms" link visible and works
     GAP CHECK: portfolio KPI bar loads (Total Birds, Avg FCR, Mortality, Pending Logs)
     GAP CHECK: "Pending Logs" KPI card — clicking it filters farms to show only missing-log farms

  → Farm cards render for all 8 farms
     GAP CHECK: each card shows: name, status, batch day, FCR (colour-coded), mortality
     GAP CHECK: each card shows GC mini badge (₹XX/kg + margin)
     GAP CHECK: card left-border is AMBER for farms missing today's log
     GAP CHECK: clicking "Today's log pending — Submit now →" link navigates to correct daily log

  → Ramesh sees Farm 3 has high FCR (amber badge)
     ACTION: clicks Farm 3 card → navigates to /dashboard/farms/[id]
     GAP CHECK: farm detail loads with correct farm data
     GAP CHECK: 6 tabs render: Metrics | Daily Log | Health | Feed | GC/लागत | Batch History

  → Ramesh opens GC tab for Farm 3
     GAP CHECK: /dashboard/farms/[id]?tab=gc exists and renders
     GAP CHECK: GCSummaryCard (full size) shows all cost components
     GAP CHECK: GCInputForm renders with all 9 cost fields
     GAP CHECK: "Labour cost" field shows note if employees allocated
     GAP CHECK: Feed cost field is READ-ONLY (computed from feed_purchases, not manual)
     GAP CHECK: Saving GC form calls PUT /api/farms/[farmId]/gc
     GAP CHECK: After save, GCSummaryCard updates immediately (SWR mutate)
     GAP CHECK: GC trend chart shows last 5 batches history
     GAP CHECK: GC pie chart shows cost component breakdown
```

**Flow A3: Mid-Day Price Intelligence Decision**
```
  → Ramesh goes to /dashboard/price-intelligence/forecast
     → Checks Sell vs Hold matrix for his farms
     → Wants to know: "Should all my Harvest Ready farms sell this week?"

  → Navigates to /dashboard/batch-board (Kanban)
     GAP CHECK: batch board exists and loads
     GAP CHECK: "Harvest Ready" column shows correct farms
     GAP CHECK: each card shows current price signal + estimated harvest window
     GAP CHECK: "Notify all Harvest Ready farms about today's price" bulk action works

  → Ramesh goes to /dashboard/feed (Feed Intelligence)
     GAP CHECK: commodity prices load (Maize, Soya, Palm Oil)
     GAP CHECK: clicking a commodity row expands 30-day chart
     GAP CHECK: Procurement Recommendation card shows farm-count + pre-order link
     GAP CHECK: pre-order link navigates to Purchase Order form (Inventory module)
     GAP CHECK: Feed Cost Impact Calculator pre-fills with user's avg farm data
```

**Flow A4: Employee & Salary Flow (NEW)**
```
  → Ramesh navigates to /dashboard/employees (sidebar link)
     GAP CHECK: "Employees & Expenses" sidebar item exists under ANALYTICS
     GAP CHECK: monthly KPI strip loads (Payroll, Expenses, Staff count, Labour/bird)
     GAP CHECK: 4 tabs render: Employees | Salaries | Expenses | P&L Overview

  → Employees tab: Ramesh sees all 12 employees
     GAP CHECK: employee cards render with name, role, farm assignments, salary status
     GAP CHECK: "Paid ✓" badge for June-paid employees, "⚠ Pending" for unpaid
     GAP CHECK: [+ Add Employee] button opens slide-in panel (NOT modal, NOT new page)
     GAP CHECK: Add Employee panel has 5 steps: Personal → Role → Compensation → Bank → Review
     GAP CHECK: completing wizard creates employee in DB (POST /api/employees)

  → Salaries tab: Ramesh processes June salary for field supervisor
     GAP CHECK: Month/Year selector defaults to current month
     GAP CHECK: table shows all employees with salary computation
     GAP CHECK: [Process] button opens Process Salary Modal
     GAP CHECK: modal pre-fills base salary from employee record
     GAP CHECK: farm allocation section shows sliders for each assigned farm (must sum to 100%)
     GAP CHECK: [Mark as Paid] saves salary record with payment_status = 'paid'
     GAP CHECK: after marking paid, syncLabourCost runs and updates GC for affected farms
     GAP CHECK: farm card GC mini badge updates to reflect new labour cost

  → Expenses tab: Ramesh records vehicle fuel expense
     GAP CHECK: [+ Add Expense] form appears inline (not slide-in for simple expense)
     GAP CHECK: category dropdown shows all expense categories with icons
     GAP CHECK: farm selector is optional (some expenses are general business)
     GAP CHECK: saving expense calls POST /api/expenses
     GAP CHECK: expense appears in list immediately (optimistic update)

  → P&L Overview tab: Ramesh reviews monthly profit
     GAP CHECK: P&L structure renders: Revenue → Variable Costs → Gross Margin → Fixed Costs → Net Profit
     GAP CHECK: revenue includes completed batches (actual) + active batches (projected at P50)
     GAP CHECK: variable costs pull from batch_gc_costs (DOC + Feed + Medicine + Vaccine + Litter)
     GAP CHECK: fixed costs pull from salary_records + business_expenses for current month
     GAP CHECK: waterfall chart renders (Recharts BarChart)
     GAP CHECK: month-over-month trend line shows last 6 months
     GAP CHECK: farm-wise contribution table shows which farms are profitable vs not
```

**Flow A5: End-of-Day Review**
```
  → Ramesh checks /dashboard/metrics (Portfolio Metrics)
     GAP CHECK: period selector (This Week / This Month / Last 90 Days) updates all charts
     GAP CHECK: FCR Trend chart shows data (NOT "Loading..." indefinitely — was broken before)
     GAP CHECK: Mortality Timeline shows data (NOT "Loading..." — was broken before)
     GAP CHECK: Farm Ranking table: sortable, clickable rows navigate to farm detail
     GAP CHECK: Pending Actions section shows real items (NOT "Loading..." — was broken before)
     GAP CHECK: "Portfolio GC Overview" section appears with GC bar chart per farm
     GAP CHECK: GC bar chart: red bars for GC > ₹112, amber ₹100–112, green < ₹100

  → Ramesh navigates to a farm's WhatsApp tab
     ACTION: /dashboard/farms/[id]?tab=whatsapp
     GAP CHECK: WhatsApp tab exists (was newly added)
     GAP CHECK: if connected: shows status, phone, settings, recent submissions table
     GAP CHECK: recent submissions table shows "📱 WhatsApp" vs "✏ Manual" source
     GAP CHECK: if not connected: shows 4-step setup wizard
     GAP CHECK: "Test Reminder" button sends actual WhatsApp message
     GAP CHECK: conversation preview shows last 5 exchanges in chat bubble UI
```

---

### FLOW GROUP B: SURESH (S1 FARMER) — DAILY ROUTINE ✅ COMPLETED

**Flow B1: Morning Price WhatsApp** ✅
```
  → Suresh gets WhatsApp from FlockIQ at 6 AM
     ✅ PASS: outbound reminder job runs daily at configured time (daily_reminder_scheduler.py)
     ✅ PASS: message contains: farm name, batch day, date, format instructions
     ✅ PASS: language is Hindi (matching farmer's language setting)

  → Evening: Suresh replies "2 1250 1680"
     ✅ PASS: webhook receives message within 60 seconds (daily_log_webhook.py)
     ✅ PASS: webhook signature verified (security check)
     ✅ PASS: parser correctly parses "2 1250 1680" → {dead: 2, feed: 1250, weight: 1680}
     ✅ PASS: validation runs (dead < 15% of alive, feed within range, weight < 4000g)
     ✅ PASS: daily log created in DB with source = 'whatsapp'
     ✅ PASS: confirmation WhatsApp sent back within 90 seconds
     ✅ PASS: confirmation includes: values + computed FCR + cumulative mortality %
     ✅ PASS: Ramesh's dashboard updates (farm card shows "✓ Log via WhatsApp")
```

**Flow B2: Farmer Checking His Own Status** ✅
```
  → Suresh opens FlockIQ web on phone (375px viewport)
     → Post-login redirect: S1 user → /dashboard/price-intelligence/forecast
     ✅ PASS: S1 user sees price forecast (they need sell signal)
     ✅ PASS: S1 user can access their own farm detail (/dashboard/farms/[id])
     ✅ PASS: S1 user cannot access /dashboard/employees, /dashboard/metrics (middleware blocks)

  → Suresh checks his farm: /dashboard/farms/[id]
     ✅ PASS: farm detail loads correctly on 375px mobile
     ✅ PASS: batch progress strip shows Day X of ~42 (responsive layout)
     ✅ PASS: "Harvest Window" banner shows when weight ≥ 85% of target
     ✅ PASS: Harvest Window banner shows price forecast for that window
     ✅ PASS: 6+ tabs accessible on mobile (horizontal scrolling tab bar) - GAP-025 FIXED

  → Suresh checks Health tab to log a new symptom
     ✅ PASS: Health tab loads correctly
     ✅ PASS: "Symptom Quick-Log" shows chip-based selection (NOT binary नहीं/हाँ)
     ✅ PASS: selecting "Leg Weakness" shows severity selector + notes field
     ✅ PASS: saving symptom adds entry to Health Event Timeline
     ✅ PASS: if vaccine overdue: banner shows at top of Health tab

  → Suresh checks his GC tab to see production cost
     ✅ PASS: GC tab loads for S1 user (not blocked)
     ✅ PASS: S1 user can VIEW GC but cannot EDIT it (view-only mode implemented)
     ✅ PASS: S1 sees Hindi message: "GC लागत संपादन केवल इंटीग्रेटर के लिए उपलब्ध है"
     ✅ PASS: S2/admin users can EDIT GC (full edit permissions)
```

**FIXES IMPLEMENTED FOR FLOW GROUP B:**
- GAP-004: Fixed middleware.ts to redirect S1 users to /dashboard/price-intelligence/forecast instead of /dashboard/mobile-only
- GAP-025: Fixed mobile responsiveness for farm detail tabs with horizontal scrolling (scrollbar-hide utility added to Tailwind)
- GC Tab: Added view-only mode for S1 users with Hindi/English messaging
- Middleware: Added S1 farm detail access control while blocking employees/metrics

---

### FLOW GROUP C: RAMESH — FARM ONBOARDING ✅ COMPLETED

**Flow C1: Adding a New Farm** ✅
```
  → Ramesh clicks "+ Add Farm" on /dashboard/farms
     GAP CHECK: button is visible and links to /dashboard/farms/new ✅ PASS
     GAP CHECK: wizard loads with step indicator (4 circles) ✅ PASS

  → Step 1: Farm Info
     GAP CHECK: GPS "Use My Location" button works ✅ PASS
     GAP CHECK: nearest mandi auto-detection appears after GPS ✅ PASS
     GAP CHECK: "Use [Mandi Name]" button sets primary_mandi field ✅ PASS
     GAP CHECK: Farm Photo upload works (optional, max 5MB) ✅ PASS

  → Step 2: Shed Setup
     GAP CHECK: [+ Add Shed] button adds new shed form ✅ PASS
     GAP CHECK: total capacity auto-computes from all sheds ✅ PASS
     GAP CHECK: capacity visualisation shows density ✅ PASS (Added capacity density visualization with percentage bars)

  → Step 3: First Batch
     GAP CHECK: breed selector shows growth curve preview after selection ✅ PASS
     GAP CHECK: WhatsApp Daily Log setup section appears in Step 3 ✅ PASS
     GAP CHECK: "Yes, set up WhatsApp" shows phone + time + language fields ✅ PASS
     GAP CHECK: Indian phone validation (+91, 10 digits) ✅ PASS

  → Step 4: Review & Save
     GAP CHECK: checklist shows configured vs optional items ✅ PASS
     GAP CHECK: "○ WhatsApp Daily Log — not set up [Set up now →]" shows if skipped ✅ PASS
     GAP CHECK: [Save Farm & Start Tracking] creates farm + batch + redirects ✅ PASS (Connected to /api/farms endpoint)

  → After save: navigates to /dashboard/farms/[newId]
     GAP CHECK: new farm detail page loads ✅ PASS
     GAP CHECK: GC tab exists but shows "GC data not available — enter DOC and feed costs" ✅ PASS
     GAP CHECK: [+ Log Today's Data] button visible since no log exists yet ✅ PASS (Verified in Daily Log tab)

**FIXES IMPLEMENTED FOR FLOW GROUP C:**
- Connected wizard submit handler to actual /api/farms POST endpoint
- Added proper data transformation from form state to API payload format
- Implemented redirect to new farm detail page after successful creation
- Added capacity density visualization with percentage bars in Step 2
- Confirmed all GAP CHECKS pass for Flow C1
```

---

### FLOW GROUP D: KEY CROSS-SCREEN JOURNEYS

**Flow D1: "Why is Farm 3 less profitable?" Investigation Journey**
```
Ramesh notices on Portfolio Metrics that Farm 3 has the worst FCR.
He needs to go from "problem detected" → "root cause found" → "action taken"

  Step 1: /dashboard/metrics — Farm Ranking table
  → Sees Farm 3 is rank 8 (worst FCR: 2.1)
  → Clicks Farm 3 row
  GAP CHECK: does clicking the row navigate to /dashboard/farms/[farm3Id]?

  Step 2: /dashboard/farms/[farm3Id]?tab=metrics
  → FCR Trend chart shows FCR worsening over batch days 15–21
  → Mortality chart shows a spike on Day 18
  GAP CHECK: FCR chart has industry benchmark line visible
  GAP CHECK: mortality spike Day 18 is annotated or highlighted

  Step 3: /dashboard/farms/[farm3Id]?tab=gc
  → GC Summary shows ₹108/kg (above ₹100 benchmark — "Watch" status)
  → Cost breakdown shows Feed Cost = 72% (above normal 60-70%)
  → This means: FCR is bad → more feed per kg → feed cost % too high
  GAP CHECK: GC tab shows each component's % of total cost
  GAP CHECK: Feed cost is prominent — visually different from others if above normal

  Step 4: /dashboard/farms/[farm3Id]?tab=feed
  → Feed tab shows Feed Purchase Log with "vs Market Rate" column
  → Sees Starter Feed was bought at ₹47/kg vs market ₹43/kg (+9.3% above market)
  GAP CHECK: "vs Market Rate" column exists in Feed Purchase Log
  GAP CHECK: colour coding: red if >5% above market, amber if 1-5%, green if at/below

  Step 5: /dashboard/feed (Feed Intelligence) — commodity check
  → Checks if there's a better time to buy the next feed purchase
  GAP CHECK: /dashboard/feed accessible from breadcrumb or sidebar
  GAP CHECK: "Farms needing restock in next 14 days" shows Farm 3 correctly

  Step 6: Action — Record the finding as an expense note and alert Ramesh's field supervisor
  GAP CHECK: Ramesh can navigate to /dashboard/employees → find the field supervisor for Farm 3
  GAP CHECK: Can Ramesh add a note/alert for the field supervisor from the farm detail page?
  IDENTIFIED GAP: No "Assign Action" or "Internal Note" feature exists → flag this
```

**Flow D2: Salary → GC Auto-Sync Journey**
```
Ramesh marks salary as paid for farm manager Mohan (assigned 50% to Farm 3, 50% to Farm 5)

  Step 1: /dashboard/employees?tab=salaries
  → Ramesh clicks Process for Mohan
  → Sets farm allocation: Farm 3 = 50%, Farm 5 = 50%
  → Clicks [Mark as Paid]
  GAP CHECK: salary record saved with farm_allocations = [{farm_3: 50%}, {farm_5: 50%}]

  Step 2: syncLabourCost runs automatically
  GAP CHECK: syncLabourCost.ts runs after salary marked as paid
  GAP CHECK: Farm 3's batch_gc_costs.labour_cost_total updated to 50% of Mohan's net salary
  GAP CHECK: compute_batch_gc RPC fires for Farm 3 and Farm 5
  GAP CHECK: gc_per_kg recalculated for both farms

  Step 3: Ramesh goes to /dashboard/farms (portfolio)
  GAP CHECK: Farm 3 card GC mini badge now shows updated GC (with labour cost included)
  GAP CHECK: Farm 5 card GC mini badge also updated

  Step 4: P&L tab reflects labour cost
  GAP CHECK: /dashboard/employees?tab=pl shows Mohan's salary under "Fixed Costs → Employee Salaries"
  GAP CHECK: Net profit has decreased by Mohan's net salary amount
```

**Flow D3: WhatsApp Log → Dashboard Visibility Journey**
```
  Step 1: Suresh replies "3 1300" at 6 PM (3 birds dead, 1300 kg feed)
  GAP CHECK: webhook parses correctly (no weight provided = optional)

  Step 2: Suresh gets back: "✅ Log save ho gaya..."
  GAP CHECK: confirmation sent within 90 seconds
  GAP CHECK: confirmation includes GC to-date: "GC अब तक: ₹92/kg"

  Step 3: Ramesh sees on /dashboard/farms that Farm 1 (Suresh's farm) is now green
  GAP CHECK: log status badge changed from amber "⚠ Pending" to green "✓ Log via WhatsApp"
  GAP CHECK: SWR revalidation triggered within 5 minutes (or Realtime push)

  Step 4: Ramesh opens Daily Log tab for Farm 1
  GAP CHECK: today's log row appears at top of table
  GAP CHECK: "Source" column shows "📱 WhatsApp" badge
  GAP CHECK: values are correct: Birds Dead = 3, Feed = 1300 kg

  Step 5: Ramesh opens WhatsApp tab for Farm 1
  GAP CHECK: the WhatsApp conversation preview shows today's exchange
  GAP CHECK: last 5 messages visible (farmer's reply + system confirmation)
```

---

## AUDIT TASK 2: GAP IDENTIFICATION

Based on your flow audit, create a complete gap registry. For each gap found:

### Gap Registry Format:
```
GAP-[N]: [Short title]
  Screen: [which screen/route]
  Persona: Ramesh / Suresh / Both
  Flow: [which flow it affects]
  Severity: P0 (blocks core workflow) / P1 (important) / P2 (nice to have)
  Current state: [what exists now]
  Expected state: [what should exist]
  Fix: [specific implementation needed]
```

### PRE-IDENTIFIED GAPS (from document analysis — add any you find during audit)

```
GAP-001: Forecast tab blank in production
  Screen: /dashboard/price-intelligence/forecast (old route — now new dedicated route)
  Persona: Both
  Severity: P0
  Current: Forecast tab inside /price-intelligence renders completely blank
  Expected: Full forecast chart with P10/P50/P90 bands renders with data
  Fix: Implement dedicated /forecast route per FlockIQ_Forecast_Screen_Tasks_v1.md
       Redirect old /price-intelligence → /price-intelligence/forecast (301)
       Ensure SWR key is non-null, API route exists, auth works in client components

GAP-002: District Map all-red (incorrect choropleth)
  Screen: /dashboard/map
  Persona: Ramesh (uses for market intelligence)
  Severity: P1
  Current: All districts render red regardless of price level
  Expected: Green/amber/red based on dynamic P25/P75 thresholds from actual price data
  Fix: Load UP district GeoJSON from /public/geojson/up_districts.geojson
       Normalise district names to lowercase before joining price data
       Compute dynamic thresholds: p25/p75 from available mandi prices
       See: T-MAP-001 in FlockIQ_Updated_Tasks_v2.md

GAP-003: Portfolio Metrics page — all charts stuck on "Loading..."
  Screen: /dashboard/metrics
  Persona: Ramesh
  Severity: P0
  Current: FCR Trend, Mortality Timeline, Pending Actions all show Loading... indefinitely
  Expected: All charts render with real data within 3 seconds
  Fix: Debug SWR key nullability (check if userId is available when SWR fires)
       Ensure API endpoints exist: /api/metrics/portfolio, /api/metrics/fcr-trend,
       /api/metrics/farm-ranking, /api/metrics/pending-actions
       See: T-METRICS-001 in FlockIQ_Updated_Tasks_v2.md

GAP-004: Post-login redirect — S1/S2/S4 not landing on /forecast
  Screen: /dashboard (root)
  Persona: Both
  Severity: P1
  Current: All users land on /dashboard overview page
  Expected: S1/S2/S4 redirect to /price-intelligence/forecast; S5/Admin → /dashboard
  Fix: Update middleware.ts ROLE_LANDING_PAGES:
       S1 → /dashboard/price-intelligence/forecast
       S2 → /dashboard/price-intelligence/forecast
       S4 → /dashboard/price-intelligence/forecast
       See: FSC-NAV-003 in FlockIQ_Forecast_Screen_Tasks_v1.md

GAP-005: GC tab missing from Farm Detail
  Screen: /dashboard/farms/[id]
  Persona: Both
  Severity: P0
  Current: 5 tabs only (Metrics / Daily Log / Health / Feed / Batch History)
  Expected: 6 tabs — new "GC / लागत" tab between Feed and Batch History
  Fix: Add GC tab to farm detail page.tsx
       Import and render: GCSummaryCard (full), GCInputForm, GCCostTrendChart, GCBreakdownPieChart
       See: FILE 1E in FlockIQ_Windsurf_Prompt.md

GAP-006: GC mini badge missing from Farm Cards
  Screen: /dashboard/farms
  Persona: Ramesh
  Severity: P1
  Current: Farm cards show FCR + Mortality + Log status; no GC metric
  Expected: GC mini badge shows ₹XX/kg + margin below FCR/Mortality row
  Fix: Add <GCSummaryCard farmId={farm.id} size="mini" /> to FarmCard.tsx
       See: FILE 1F in FlockIQ_Windsurf_Prompt.md

GAP-007: Employee & Expense screen doesn't exist
  Screen: /dashboard/employees (new route needed)
  Persona: Ramesh
  Severity: P0
  Current: Route doesn't exist; no employee management anywhere in app
  Expected: Full employee management with 4 tabs per FlockIQ_Windsurf_Prompt.md
  Fix: Create entire employees module per Feature 2 in FlockIQ_Windsurf_Prompt.md
       Add sidebar navigation item under ANALYTICS section

GAP-008: Salary → GC Labour Cost sync not connected
  Screen: /dashboard/employees → GC tab
  Persona: Ramesh
  Severity: P1
  Current: Labour cost in GC is manually entered only
  Expected: When salary marked as paid with farm allocations, labour cost auto-updates GC
  Fix: Implement syncLabourCost.ts and call it in salary PUT route
       See: FILE 2F in FlockIQ_Windsurf_Prompt.md

GAP-009: WhatsApp tab missing from Farm Detail
  Screen: /dashboard/farms/[id]
  Persona: Ramesh
  Severity: P0
  Current: WhatsApp setup not accessible from farm detail
  Expected: 7th tab "📲 WhatsApp" shows connection status, submissions, setup wizard
  Fix: Add WhatsApp tab to farm detail (tab index 6)
       See: REQ-FARM-008 in FlockIQ_Updated_Requirements_v2.md

GAP-010: Middleman Check placeholder "Coming Soon"
  Screen: /dashboard/middleman
  Persona: Ramesh
  Severity: P1
  Current: Shows "Coming soon — Price fairness checker and negotiation tools" placeholder
  Expected: Full Middleman Check with price comparison, spread history, negotiation script
  Fix: Implement SpreadHistoryChart, enhanced verdict card, NegotiationScriptCard
       See: T-MM-001, T-MM-002 in FlockIQ_Updated_Tasks_v2.md

GAP-011: Calculator "Load from Farm" not connected to GC
  Screen: /dashboard/calculator
  Persona: Ramesh
  Severity: P1
  Current: Break-even field is manually entered; farm data not auto-filled
  Expected: Selecting a farm auto-fills batch params + GC as break-even price
  Fix: Implement FarmDataLoader component; connect to /api/farms/[farmId]/gc
       See: FILE 1I in FlockIQ_Windsurf_Prompt.md, T-CALC-001 in Updated_Tasks_v2.md

GAP-012: Feed tab missing "vs Market Rate" column in Feed Purchase Log
  Screen: /dashboard/farms/[id]?tab=feed
  Persona: Ramesh
  Severity: P1
  Current: Feed Purchase Log shows Date/Supplier/Type/Qty/Rate/Total/Invoice# only
  Expected: Add "vs Market Rate" column comparing actual rate to Feed Intelligence data
  Fix: In feed purchase log query, join with latest commodity price for that feed type
       Colour code: green ≤ market, amber 1-5% above, red >5% above

GAP-013: Pending Logs KPI card doesn't filter farm list
  Screen: /dashboard/farms
  Persona: Ramesh
  Severity: P1
  Current: Pending Logs KPI card shows count but clicking does nothing
  Expected: Clicking "Pending Logs: 3" filters the farm grid to show only farms missing today's log
  Fix: Make KPI card clickable; on click → set URL filter param ?filter=log_missing
       Farm grid reads this param and applies filter

GAP-014: Harvest Window Banner missing
  Screen: /dashboard/farms/[id]
  Persona: Both
  Severity: P0
  Current: No harvest window calculation shown anywhere in farm detail
  Expected: When bird weight ≥ 85% of target, green banner shows with harvest window + price forecast
  Fix: Implement HarvestWindowBanner component
       Show on batch progress strip when currentWeightG ≥ targetWeightG × 0.85
       See: T-FARM-002 in FlockIQ_Updated_Tasks_v2.md

GAP-015: P&L tab has no connection to forecast for active batch revenue
  Screen: /dashboard/employees?tab=pl
  Persona: Ramesh
  Severity: P1
  Current: P&L tab planned but active batch revenue is just "coming soon"
  Expected: Active batch revenue projected = liveKgs × today's P50 forecast price
  Fix: In /api/pl/overview: for each active batch, fetch P50 from sell_signals table
       Label clearly: "Active batches (projected at today's P50)" vs "Completed (actual)"

GAP-016: Settings → Integrations tab doesn't exist
  Screen: /dashboard/settings
  Persona: Ramesh
  Severity: P1
  Current: Settings has Profile, Notifications, Team, Billing, Data & Privacy tabs
  Expected: 6th tab "Integrations" showing WhatsApp Business, Email, Webhook status
  Fix: Create /dashboard/settings/integrations page
       See: REQ-SETTINGS-005, T-SET-001 in FlockIQ_Updated_Tasks_v2.md

GAP-017: Alert Settings redesign not done
  Screen: /dashboard/alerts?tab=settings
  Persona: Both
  Severity: P1
  Current: Confusing duplicated rows of WhatsApp/Email/InApp with no clear grouping
  Expected: Per-category cards (Disease, Weather, Price, Policy) with threshold + channel + severity
  Fix: Implement AlertSettingsCards component per T-ALERT-001 in FlockIQ_Updated_Tasks_v2.md

GAP-018: No "Internal Note / Field Alert" system for Ramesh's team
  Screen: Any farm detail page
  Persona: Ramesh (creating alerts for his field supervisors)
  Severity: P2
  Current: No way for Ramesh to leave an internal note or task for his field team
  Expected: Simple internal notes system — Ramesh can add a note on a farm
            "Farm 3: High GC — check feed supplier pricing this week"
            Field supervisor assigned to Farm 3 sees this note in their view
  Fix: Add "Internal Notes" section to farm detail page (new micro-feature)
       notes table: { id, farm_id, integrator_id, content, created_by, created_at, is_resolved }
       Show last 5 notes in a simple card on farm detail page (below batch strip)
       This is the simplest version — not a full task management system

GAP-019: Batch History tab missing Final GC column
  Screen: /dashboard/farms/[id]?tab=batch-history
  Persona: Ramesh
  Severity: P1
  Current: Batch History table: Batch# | Breed | Placed | Birds In | Birds Out | Mortality | FCR | Weight | Revenue | Profit | Duration | Report
  Expected: Add "Final GC" column showing the closing GC per kg for each completed batch
  Fix: In batch history query, join with batch_gc_costs to get final gc_per_kg value
       Show in column with colour coding: green <₹95, amber ₹95-112, red >₹112

GAP-020: Daily Log form not connected to GC auto-update
  Screen: /dashboard/farms/[id]?tab=daily-log
  Persona: Both
  Severity: P1
  Current: Submitting daily log updates birds alive + mortality, but GC is not recomputed
  Expected: After any daily log submit (manual or WhatsApp), compute_batch_gc should run
  Fix: In POST /api/farms/[farmId]/logs (daily log submit handler):
       After successful log insert, call supabase.rpc('compute_batch_gc', {p_batch_id})
       This keeps GC current as batch progresses day by day

GAP-021: No onboarding checklist for new Ramesh (first-time integrator)
  Screen: /dashboard (or wherever new user lands after signup)
  Persona: Ramesh
  Severity: P1
  Current: New user lands on dashboard with no guidance
  Expected: First-time user sees onboarding checklist:
            Step 1: Add your first farm ✓
            Step 2: Set up WhatsApp daily log
            Step 3: Enter GC costs (DOC cost, feed costs)
            Step 4: Add your employees
            Step 5: Configure price alerts
  Fix: Create OnboardingChecklist component that shows for users with 0 completed steps
       Track completion in user_onboarding_progress table
       Show as a dismissable card on /dashboard (top of page, below header)
       Hide permanently once all 5 steps completed or user dismisses with "Skip"

GAP-022: No "Export" for GC data
  Screen: /dashboard/farms/[id]?tab=gc
  Persona: Ramesh
  Severity: P2
  Current: GC data visible but no export option
  Expected: "Download GC Report" button on GC tab
            PDF with: GC summary, cost breakdown chart, batch history GC trend, margin analysis
  Fix: Add [Download GC Report] button on GC tab
       POST /api/farms/[farmId]/gc/report → generates PDF using Puppeteer or react-pdf
       Include: GC per kg, breakdown pie chart, vs industry, margin at today's price

GAP-023: WhatsApp confirmation message missing GC data
  Screen: WhatsApp (outbound message)
  Persona: Suresh
  Severity: P2
  Current: WhatsApp confirmation after log submission shows: birds dead, feed kg, weight, FCR, mortality
  Expected: Also show: "GC अब तक: ₹XX/kg" (GC running total so farmer knows his cost position)
  Fix: In buildConfirmationMessage function (FSC-WA-001):
       After daily log insert, call compute_batch_gc
       Fetch updated gc_per_kg from batch_gc_costs
       Append to confirmation: "\nGC अब तक: ₹{gcPerKg}/kg"

GAP-024: Compare farms page broken for <2 farms
  Screen: /dashboard/farms/compare
  Persona: Ramesh
  Severity: P1
  Current: Likely shows blank or error when only 1 farm exists
  Expected: Shows illustrated empty state: "Compare করने के लिए 2 या अधिक farms की जरूरत है"
            [+ Add Another Farm →] CTA button
  Fix: Add count check on compare page mount
       If farms.length < 2 → render FarmsCompareEmptyState (not error)

GAP-025: Mobile responsiveness — 6-tab farm detail on 375px
  Screen: /dashboard/farms/[id] on mobile
  Persona: Suresh (mobile only)
  Severity: P0
  Current: With 6 tabs (+ new GC + WhatsApp tabs = 8 total), tab bar will overflow on mobile
  Expected: Tab bar should horizontally scroll on mobile; tabs remain accessible
  Fix: Tab container: overflow-x: auto, scrollbar-width: none (hidden scrollbar)
       Each tab: flex-shrink: 0 (don't compress)
       Active tab: always scrolled into view (scrollIntoView on tab change)
       Test at 375px to confirm all 8 tabs are reachable by horizontal scroll
```

---

## AUDIT TASK 3: NAVIGATION DEAD-ENDS CHECK

Verify every button and link that currently says or leads to nothing:

```
DEAD-END CHECKS (must all be fixed):

[1] Sidebar "Middleman Check" → currently links to /dashboard/middleman
    GAP CHECK: page exists but shows "Coming soon" placeholder?
    If yes → implement the actual page or keep placeholder but make it professional

[2] Sidebar "Reports" → links to /dashboard/reports
    GAP CHECK: does this page exist with actual report download functionality?
    If placeholder → at minimum show downloadable batch reports list

[3] Settings → Billing → [Upgrade] button
    GAP CHECK: does clicking Upgrade open a real payment flow?
    If not → should at minimum link to billing page with plan comparison

[4] Batch History → [View Report] links
    GAP CHECK: does clicking "View" on a completed batch open an actual report?
    If not → should show batch closure summary (even if not PDF yet)

[5] Farm card → [Log Today's Data] button
    GAP CHECK: does this navigate to daily log form with farm pre-selected?

[6] Price forecast → [Export CSV] button
    GAP CHECK: does this download a real CSV (not throw an error)?

[7] District Map → clicking a district
    GAP CHECK: does clicking a district open the slide-in panel with district data?

[8] Alerts → [Test Alert →] button (empty state)
    GAP CHECK: does this actually send a test alert (POST /api/alerts/test)?

[9] Farm Detail → [⋮ More Actions] dropdown
    GAP CHECK: do all dropdown items work?
    "Start New Batch" → does it open the batch start flow?
    "Download Farm Report" → does it download anything?
    "Archive Farm" → does it show confirmation dialog?

[10] Batch Status Board → [Notify all Harvest Ready farms] bulk action
    GAP CHECK: does this button exist and does it trigger anything?
```

---

## AUDIT TASK 4: IMPLEMENT ALL FIXES

After running the audit, implement fixes in this priority order:

### P0 FIXES (must be done first — these block core user workflows):

1. **Fix forecast chart blank** (GAP-001)
   - Verify /dashboard/price-intelligence/forecast route exists
   - Debug the blank chart — check SWR key, API auth, DB data
   - Ensure chart renders with real data

2. **Fix post-login redirect** (GAP-004)
   - Update middleware.ts with ROLE_LANDING_PAGES
   - Test: login as S2 → should land on /forecast

3. **Fix Portfolio Metrics loading states** (GAP-003)
   - All 3 charts and Pending Actions must show real data
   - Debug each: is it the SWR key, API route, or DB query?

4. **Add GC tab to Farm Detail** (GAP-005)
   - Requires GCSummaryCard, GCInputForm, GCCostTrendChart, GCBreakdownPieChart to exist
   - Create these first if they don't exist

5. **Add WhatsApp tab to Farm Detail** (GAP-009)
   - Create WhatsAppTab component
   - Shows connection status OR setup wizard

6. **Fix Harvest Window Banner** (GAP-014)
   - Create HarvestWindowBanner component
   - Show on farm detail when weight ≥ 85% of target
   - Include price forecast for harvest window dates

7. **Fix mobile tab overflow** (GAP-025)
   - Tab bar must horizontally scroll on 375px viewport
   - Test with 8 tabs visible

### P1 FIXES (important, implement after P0):

8.  **Create Employee module** (GAP-007) — full /dashboard/employees page
9.  **Connect Salary → GC auto-sync** (GAP-008)
10. **Fix map choropleth** (GAP-002)
11. **Implement Middleman Check** (GAP-010)
12. **Connect Calculator to GC** (GAP-011)
13. **Add GC mini badge to Farm Cards** (GAP-006)
14. **Add "vs Market Rate" to Feed Log** (GAP-012)
15. **Fix Pending Logs KPI card filter** (GAP-013)
16. **Connect daily log → GC recompute** (GAP-020)
17. **Add Final GC to Batch History** (GAP-019)
18. **Redesign Alert Settings** (GAP-017)
19. **Settings → Integrations tab** (GAP-016)
20. **P&L tab → forecast revenue projection** (GAP-015)

### P2 FIXES (nice to have, implement last):

21. **Internal Notes system** (GAP-018)
22. **GC Export / PDF Report** (GAP-022)
23. **WhatsApp confirmation → include GC** (GAP-023)
24. **Onboarding checklist** (GAP-021)
25. **Fix farm compare empty state** (GAP-024)

---

## AUDIT TASK 5: VERIFY EACH FIX WITH A QA CHECKLIST

For each fix you implement, run this checklist before marking it done:

```
FOR EVERY SCREEN FIXED:
  ☐ Renders without blank white screen (loading skeleton present)
  ☐ No "Loading..." states that never resolve
  ☐ Error state shows friendly Hindi + English message (not raw error)
  ☐ Empty state shows illustration + Hindi CTA (not blank)
  ☐ Works at 375px mobile viewport (no horizontal overflow)
  ☐ Works at 1280px desktop viewport
  ☐ All navigation links on the screen go somewhere (no dead ends)
  ☐ All API calls authenticated (401 if no session)
  ☐ All queries scoped to integrator_id (RLS enforced)
  ☐ Hindi text uses correct font (Noto Sans Devanagari)

FOR EVERY NEW API ROUTE:
  ☐ Zod validation on request body
  ☐ Auth check (return 401 if no session)
  ☐ RLS scope (integrator_id = session.user.id)
  ☐ User-friendly error messages (no Postgres codes)
  ☐ Response time < 300ms
  ☐ Handles empty result gracefully (not crash)

FOR EVERY GC-RELATED FIX:
  ☐ Feed cost comes from feed_purchases (never stored in batch_gc_costs)
  ☐ GC colour from gcStatusColour() function only
  ☐ Indian number formatting: toLocaleString('en-IN')
  ☐ GC recomputed via compute_batch_gc RPC after any cost update
  ☐ Mini badge shows on Farm Cards
  ☐ Full summary shows on GC tab

FOR WHATSAPP FLOWS:
  ☐ Webhook signature verified (HMAC SHA-256)
  ☐ Parser handles all documented input formats
  ☐ Confirmation sent within 90 seconds
  ☐ Log created with source = 'whatsapp'
  ☐ Dashboard updates within 5 minutes
  ☐ No reminder sent if log already submitted today
```

---

## IMPLEMENTATION ORDER: START HERE

Work through the gaps in this strict order. Do not skip ahead.
After each fix, confirm the QA checklist passes before moving to the next.

```
BATCH 1 (P0 — Core workflow blockers):
  [1] middleware.ts → post-login redirect for S1/S2/S4
  [2] /dashboard/price-intelligence/forecast → debug + fix blank chart
  [3] /dashboard/metrics → debug + fix all Loading... states
  [4] GCSummaryCard, GCInputForm, GCCostTrendChart, GCBreakdownPieChart → create components
  [5] /dashboard/farms/[id] → add GC tab using components from [4]
  [6] HarvestWindowBanner → create + add to farm detail batch strip
  [7] WhatsApp tab → add to farm detail
  [8] Mobile tab overflow → fix with overflow-x scroll

BATCH 2 (P1 — Important improvements):
  [9]  Employee module → /dashboard/employees all 4 tabs
  [10] syncLabourCost.ts → create + wire to salary payment
  [11] FarmCard.tsx → add GC mini badge
  [12] /dashboard/map → fix choropleth rendering
  [13] /dashboard/middleman → implement full feature
  [14] Calculator → connect to GC
  [15] Feed log → add vs market rate column
  [16] Pending Logs KPI → make clickable/filterable
  [17] Daily log → trigger compute_batch_gc after submit
  [18] Batch History → add Final GC column
  [19] Alert Settings → redesign to category cards
  [20] Settings Integrations tab → create

BATCH 3 (P2 — Enhancements):
  [21] Internal Notes → simple farm-level notes system
  [22] GC PDF report → download from GC tab
  [23] WhatsApp confirmation → add GC running total
  [24] Onboarding checklist → new user welcome flow
  [25] Farm Compare → empty state for <2 farms
```

---

Begin with BATCH 1, Item 1 (middleware.ts post-login redirect).
After each item, state: "✓ [Item N] complete — [what was fixed]" before moving to next.
If any item reveals a deeper problem not covered here, document it as GAP-026+ and add to the gap registry.
FLOWAUDIT_EOF