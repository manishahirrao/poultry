# FlockIQ — Gap Remediation Product Requirements (v1.0)
# Addresses: 7 Competitive Gaps vs PoultryCare & PoultryPlan
# Version: v1.0 | June 2026 | CONFIDENTIAL
# Builds on: FlockIQ_Updated_Requirements_v2.md
# Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md
# Target: Global Market (India Primary + SEA + MENA + Africa)

---

## REQUIREMENTS OVERVIEW

**Priority Levels:**
- P0: Launch blocker — must be done before this feature can ship
- P1: Core feature — must be in v1 of this gap remediation release
- P2: Enhancement — v1.1 or next sprint
- P3: Future — planned but not scheduled

**Format:** Each requirement has:
- ID: REQ-GAP[N]-[MODULE]-[NUMBER]
- Priority
- Acceptance Criteria (testable checklist)
- Dependencies (what must exist first)
- Implementation Notes (specific guidance for engineers)

---

## GAP 1: BATCH P&L — COMPLETE COST TRACKING

### REQ-GAP1-PL-001: P&L Tab — Page & Tab Setup
**Priority:** P0
**Dependencies:** Farm Detail page (existing) must be functional
**Acceptance Criteria:**
- [ ] A new tab labelled "P&L" (English) / "P&L / लागत" (Hindi) appears in Farm Detail tab bar
- [ ] Tab icon: 💰 coin/ledger icon
- [ ] Tab position: 5th tab, between Feed tab and Batch History tab
- [ ] Tab is only visible when an active batch exists for the farm
- [ ] Tab is accessible on all breakpoints (desktop, tablet, mobile — horizontal scroll on mobile)
- [ ] URL: /dashboard/farms/[farmId] with ?tab=pl query param selecting this tab
- [ ] Page title in browser tab: "P&L — [Farm Name] — FlockIQ"

### REQ-GAP1-PL-002: P&L Summary Banner
**Priority:** P0
**Dependencies:** REQ-GAP1-PL-001
**Acceptance Criteria:**
- [ ] Full-width sticky banner at top of P&L tab showing 6 KPI values:
  - [ ] Estimated Revenue: 0 until first sale recorded; then actual revenue
  - [ ] Total Cost: sum of all cost entries across all 6 categories
  - [ ] Gross Profit: Total Cost subtracted from Revenue (negative pre-harvest = expected)
  - [ ] Live Cost per Bird: total_cost / birds_placed, updates in real-time
  - [ ] Target Margin: configurable per batch (default 15%), shown as %, editable inline
  - [ ] Days to Harvest: estimated days remaining (links to price forecast page)
- [ ] KPI cards load within 300ms (data from local state, not re-fetched on tab load)
- [ ] Live Cost per Bird colour: green if ≤ target, amber if ≤10% above, red if >10% above
- [ ] Revenue estimate tooltip: "Estimated revenue if sold today at [P50]/kg"
- [ ] Banner is sticky (remains visible when scrolling down the cost sections)

### REQ-GAP1-PL-003: Chick Procurement Cost Section
**Priority:** P0
**Dependencies:** REQ-GAP1-PL-001, batch data (breed, placement date, birds placed already in DB)
**Acceptance Criteria:**
- [ ] Section 1 shows "Chick Procurement Cost" with [Edit ✏] if already entered
- [ ] If not entered: inline form with fields: DOC Supplier, Breed (auto-filled), Date Placed (auto-filled), Birds Placed (auto-filled, editable), Price per DOC (₹, required), Transport Cost (₹, optional)
- [ ] Required field validation: "Price per DOC" cannot be empty on save
- [ ] On save: total_chick_cost = (birds_placed × price_per_doc) + transport_cost
- [ ] Section collapses to summary card after save
- [ ] Summary card shows: Supplier | Breed | Birds | Price per DOC | Transport | Total Chick Cost | Cost per Bird
- [ ] [Edit] reopens form pre-filled with saved values
- [ ] Editing and saving updates P&L banner totals immediately (no page refresh)
- [ ] Data stored in batch_costs table: batch_id, category='chick', supplier, breed, birds_placed, price_per_doc, transport_cost, total_cost, created_at, updated_at
- [ ] Supabase RLS: only authenticated user's own farm data accessible

### REQ-GAP1-PL-004: Feed Cost Auto-Sync
**Priority:** P0
**Dependencies:** Feed tab purchase log (REQ-FARM-006 from v2.0 Requirements) must be functional
**Acceptance Criteria:**
- [ ] Feed Cost section in P&L tab is READ-ONLY — no manual entry
- [ ] Data is computed from all feed purchase entries in the Feed Purchase Log for the current batch
- [ ] Shows: Total MT purchased | Total feed cost ₹ | Average rate ₹/kg
- [ ] "Synced from Feed tab · Last updated: [relative time]"
- [ ] [View Feed Detail →] link navigates to the Feed tab
- [ ] If no feed purchases recorded: shows "No feed purchases recorded. Add purchases in the Feed tab." with link
- [ ] Feed cost value in P&L banner updates automatically when new purchases added in Feed tab (reactive, no page refresh needed — use shared state or SWR revalidation)
- [ ] Feed cost = sum of (quantity_kg × rate_per_kg) for all feed_purchase records WHERE batch_id = current_batch AND farm_id = current_farm

### REQ-GAP1-PL-005: Medicine & Vaccine Cost Section
**Priority:** P1
**Dependencies:** REQ-GAP1-PL-001; also consumed by Gap 3 (Treatment Log auto-flows here)
**Acceptance Criteria:**
- [ ] Section shows table of all medicine/vaccine cost entries for current batch
- [ ] Table columns: Date | Medicine Name | Brand | Batch No. | Purpose | Quantity | Unit | Rate | Total Cost | Withdrawal Days | Status
- [ ] [+ Add Medicine Entry] button triggers inline expandable form (form expands within section, not modal)
- [ ] Form fields: Date, Medicine Name (with autocomplete), Brand, Batch/Lot Number (optional), Purpose (dropdown: Preventive/Therapeutic/Vaccination/Vitamin/Other), Quantity, Unit (dropdown: ml/g/kg/tablets/vials), Rate (₹ per unit, optional), Duration (Day X to Day Y), Withdrawal Period (days, optional), [Mark as Completed checkbox]
- [ ] Withdrawal period field: auto-suggests value if medicine name matches known medicines DB (preloaded list of 50+ common broiler medicines with standard withdrawal periods per FSSAI guidelines)
- [ ] If withdrawal period > 0 and active: show withdrawal alert card (🔴 orange border, "Do not harvest before [date]")
- [ ] If withdrawal period has passed: show "Cleared ✅" badge
- [ ] Total medicine cost shown at bottom: "Total medicine & vaccine cost this batch: ₹X"
- [ ] When treatment is saved here: if cost > 0, auto-reflected in P&L banner Total Cost
- [ ] Integration (Gap 3): when Treatment Log entry is saved with cost, it ALSO creates/updates a medicine cost entry here in the P&L tab. Both tabs stay in sync via shared DB records.
- [ ] Data stored in batch_medicine_costs table: batch_id, farm_id, date, medicine_name, brand, lot_number, purpose, quantity, unit, rate_per_unit, total_cost, treatment_day_start, treatment_day_end, withdrawal_days, is_complete, created_at

### REQ-GAP1-PL-006: Labour Cost Section
**Priority:** P1
**Dependencies:** REQ-GAP1-PL-001
**Acceptance Criteria:**
- [ ] Two input modes toggleable (mode persists per farm in localStorage): "Daily Rate" | "Period Log"
- [ ] Daily Rate Mode:
  - Fields: Labour Rate (₹/day), Number of Workers
  - Auto-calculation shown: "₹[rate]/day × [N] workers × [batch_days] days = ₹[total] (estimated)"
  - [Apply to Batch] button saves a single record with the calculation
- [ ] Period Log Mode:
  - Table of labour cost entries: Period | Workers | Days | Rate/Day | Notes | Total
  - [+ Add Period] expands inline form: Start Date, End Date, Workers, Rate/Day, Notes
  - Auto-calculates: total = workers × days × rate_per_day
  - Running total shown: "Labour cost logged: ₹X of ~₹Y estimated"
- [ ] Both modes contribute to "Total Labour Cost: ₹X" at section bottom
- [ ] Total auto-updates P&L banner
- [ ] Data stored in batch_labour_costs table

### REQ-GAP1-PL-007: Overhead Cost Section
**Priority:** P1
**Dependencies:** REQ-GAP1-PL-001
**Acceptance Criteria:**
- [ ] Category chips: Electricity | Water | Litter/Bedding | Fuel | Repairs | Insurance | Depreciation | Other (multi-select, one chip per entry not required — any combination)
- [ ] Inline form for each overhead entry: Date, Category (dropdown with same options), Description, Amount (₹), Frequency (Once / Monthly / Weekly), Batch Share % (auto-suggested based on frequency and batch duration, editable)
- [ ] Frequency tooltip: "If monthly, FlockIQ calculates the portion of this cost attributable to the current batch duration"
- [ ] Batch share calculation: monthly_cost × (batch_days / 30) — shown as auto-calculation preview
- [ ] Total overhead shown at bottom, updates P&L banner

### REQ-GAP1-PL-008: P&L Waterfall Chart
**Priority:** P1
**Dependencies:** REQ-GAP1-PL-001 through -007
**Acceptance Criteria:**
- [ ] Recharts BarChart rendered in right column of P&L tab (60/40 split)
- [ ] Waterfall chart bars: Revenue (green) | Chick (red) | Feed (red) | Medicine (red) | Labour (red) | Overhead (red) | Net Profit (green or red)
- [ ] Revenue bar: shown as "Est." with different visual treatment until batch closed
- [ ] Each bar: hover tooltip showing amount and % of total cost
- [ ] Chart height: 280px desktop, 200px mobile
- [ ] Below waterfall: donut pie chart showing cost category % breakdown
- [ ] "Total cost tracked: ₹X" label below pie chart
- [ ] Both charts render in ≤ 500ms
- [ ] "View as table" accessibility toggle: shows same data as data table (WCAG)

### REQ-GAP1-PL-009: Batch History P&L Columns
**Priority:** P2
**Dependencies:** REQ-GAP1-PL-001 through -008 (requires data to exist)
**Acceptance Criteria:**
- [ ] Batch History tab table gains additional columns: Chick Cost | Feed Cost | Medicine Cost | Labour Cost | Overhead Cost | Total Cost | Gross Margin %
- [ ] Columns are hidden by default behind a [+ Show P&L Columns] toggle button
- [ ] Expanding a batch row shows full P&L breakdown + mini waterfall chart
- [ ] Farm Lifetime P&L Averages section added at bottom of Batch History
- [ ] "Average cost breakdown across N batches" table with trend indicators
- [ ] Gross Margin % column: green if ≥15%, amber if 10–15%, red if <10%

---

## GAP 2: BIRD LIFTING / SALES MANAGEMENT

### REQ-GAP2-SALES-001: Sales & Lifting Tab Setup
**Priority:** P0
**Dependencies:** Farm Detail page (existing), Batch data
**Acceptance Criteria:**
- [ ] New tab labelled "Sales" / "Sales / बिक्री" appears in Farm Detail tab bar
- [ ] Tab icon: 🚛
- [ ] Tab position: 6th tab (after P&L, before Batch History)
- [ ] Tab visible when active batch exists (or recently closed batch — for late entry)
- [ ] URL: /dashboard/farms/[farmId]?tab=sales
- [ ] Empty state shown when no sale events recorded (illustration + CTA)

### REQ-GAP2-SALES-002: Harvest Readiness Panel
**Priority:** P1
**Dependencies:** REQ-GAP2-SALES-001, daily log weight data, price intelligence data
**Acceptance Criteria:**
- [ ] Harvest Readiness Panel shown at top of Sales tab when batch age ≥ 85% of target grow-out duration OR user manually marks batch as "Harvest Ready"
- [ ] Panel shows: Birds alive | Avg weight | FCR | Today's Price (P50, from price intelligence) | Estimated Revenue | Withdrawal Status | Sell Signal
- [ ] Withdrawal Status: reads from Treatment Log — if any withdrawal period active: show 🔴 "DO NOT SELL — Withdrawal active until [date]"; [+ Record Sale] button is DISABLED
- [ ] Withdrawal clear: show ✅ "CLEAR — No active withdrawal periods"
- [ ] Sell Signal: sourced from price intelligence (same logic as Batch Status Board)
- [ ] Panel is only shown to users with S1/S2/S5 roles (not View Only)

### REQ-GAP2-SALES-003: Record Sale / Lifting Event Form
**Priority:** P0
**Dependencies:** REQ-GAP2-SALES-001
**Acceptance Criteria:**
- [ ] [+ Record New Sale] button triggers right-side drawer on desktop (600px) or full-screen bottom sheet on mobile
- [ ] Form is blocked (button disabled + tooltip explanation) if active withdrawal period exists
- [ ] SECTION 1 — Sale Details:
  - [ ] Sale Date: date picker, defaults to today, cannot be future date
  - [ ] Sale Type: Full Harvest | Partial Harvest (radio)
  - [ ] If Partial: "Birds to sell in this lift" numeric input, default = all remaining birds, max = birds_alive
  - [ ] If Partial: auto-shows "Birds remaining after this lift: [N]"
  - [ ] Live Weight (total kg): numeric input, required
  - [ ] [Calculate from avg weight × birds] button: auto-fills as birds_sold × latest_avg_weight_kg (rounded)
  - [ ] Rate (₹/kg): numeric input, required, pre-populated with today's P50 price
  - [ ] Deviation warning: if entered rate < (P50 × 0.85): "⚠ Rate is [N]% below today's mandi price. Confirm?"
  - [ ] Auto-computed Revenue: shown in read-only field, updates as user types
  - [ ] Deductions: Commission (₹ or %), Weighment deduction (kg) — both optional
  - [ ] Net Revenue after deductions: auto-computed, read-only
- [ ] SECTION 2 — Buyer Details:
  - [ ] Buyer: dropdown of saved buyers + "New Buyer" option
  - [ ] If New Buyer: inline sub-form: Name (req), Phone (req), Location (opt), [Save to directory checkbox]
  - [ ] Payment Terms: Cash | Credit (days) | Cheque | Bank Transfer
  - [ ] Invoice / Challan Number: text, optional
- [ ] SECTION 3 — Transport/Logistics (all optional):
  - [ ] Vehicle Number, Driver Name, Departure Time, Destination, Crates Used
  - [ ] Dead Birds in Transit: numeric, subtracts from birds_alive count
- [ ] SECTION 4 — Actual Weight at Harvest:
  - [ ] Actual Avg Weight at Sale (g/bird): required, shows comparison vs estimated
  - [ ] If actual < estimated by >5%: "Weight [N]% below estimate. Batch analysis updated."
- [ ] SECTION 5 — Notes (optional, 300 chars)
- [ ] FOOTER:
  - [ ] [Save Lifting Event ✓] button: POST /api/farms/[id]/sales
  - [ ] If Full Harvest OR birds_remaining = 0: show "Close batch after saving" checkbox
  - [ ] If checkbox checked: triggers Batch Close Wizard (REQ-GAP2-SALES-005) after save
- [ ] On successful save: drawer closes, sales table updates, P&L revenue auto-updates, toast "✓ Sale recorded"

### REQ-GAP2-SALES-004: Sales Log Table
**Priority:** P0
**Dependencies:** REQ-GAP2-SALES-003
**Acceptance Criteria:**
- [ ] Table columns: Sale# | Date | Birds Sold | Live Weight (kg) | Rate (₹/kg) | Revenue (₹) | Buyer | Vehicle | Status
- [ ] Status column values: Pending | Confirmed | Paid
- [ ] Status can be updated inline (click to toggle)
- [ ] Row click: expands to show all fields including deductions, transport, notes
- [ ] [Edit] and [Delete] row actions available
- [ ] Delete: confirmation dialog "This will reverse the revenue and bird count changes. Confirm?"
- [ ] [Export CSV] button: exports all sale events for current batch
- [ ] Batch Sales Summary shown above table when ≥1 sale: Total Birds Sold | Total Revenue | Avg Rate | Remaining Birds
- [ ] Partial harvest progress bar: "N% of batch sold. [N] birds remaining."
- [ ] Table: sticky header on scroll
- [ ] Data stored in batch_sales table: sale_id, batch_id, farm_id, sale_date, sale_type, birds_sold, total_weight_kg, rate_per_kg, gross_revenue, commission, weighment_deduction, net_revenue, buyer_id (FK), vehicle_number, driver_name, departure_time, destination, crates, dead_in_transit, actual_avg_weight_g, notes, payment_status, challan_number, created_by, created_at
- [ ] Supabase RLS: only user's own farm data

### REQ-GAP2-SALES-005: Batch Close Wizard
**Priority:** P1
**Dependencies:** REQ-GAP2-SALES-003, P&L Tab (Gap 1), batch data
**Acceptance Criteria:**
- [ ] 3-step modal wizard triggered by: (a) "Close batch" checkbox on sale form, OR (b) standalone [Close Batch →] button on Sales tab
- [ ] STEP 1 — Confirm Final Numbers:
  - [ ] Shows final batch summary card with all computed values
  - [ ] Editable fields: [Edit Mortality] [Edit Revenue] [Edit Costs] links open respective forms
  - [ ] Revenue auto-populated from sales records
  - [ ] Cost auto-populated from P&L tab records
  - [ ] Computed Gross Profit and Margin displayed
  - [ ] [Next →] requires at least 1 sale event recorded
- [ ] STEP 2 — Batch Performance Review:
  - [ ] Radar chart: this batch vs farm average vs platform benchmark (3 overlays)
  - [ ] Metrics: FCR, Mortality %, Avg Weight, Batch Duration, Gross Margin
  - [ ] AI-generated 3-line batch summary (call to Claude Sonnet API with batch metrics as input)
  - [ ] AI summary fallback if API fails: show metric-based template text without AI
  - [ ] [Previous] [Next →] navigation
- [ ] STEP 3 — What's Next:
  - [ ] Checkbox options: Download Batch Closure Report | Start New Batch | Schedule next placement
  - [ ] [Close Batch & Save ✓] button: PATCH /api/batches/[id]/close
  - [ ] On close: batch status = 'harvested', batch_closed_at = now()
  - [ ] If "Download Report" checked: trigger PDF generation (see REQ-GAP7-DOC-005)
  - [ ] If "Start New Batch" checked: after modal closes, open new batch creation form
  - [ ] 3-second confetti animation on batch close (CSS animation, not library — keep bundle lean)
  - [ ] Redirect: to farm detail → Batch History tab after close

### REQ-GAP2-SALES-006: Buyer/Trader Directory
**Priority:** P2
**Dependencies:** REQ-GAP2-SALES-003 (buyers added via sale form), REQ-GAP2-SALES-004
**Acceptance Criteria:**
- [ ] Buyer directory shown at bottom of Sales tab
- [ ] List view: Avatar (initials) | Name | Phone | Location | Type | Last Purchase Date | Rating | [⋮ menu]
- [ ] [+ Add Buyer] button opens inline form: Name (req), Phone (req), Location, Type (Trader/Processor/Cooperative), Notes
- [ ] Rating: 1–5 star rating, user can rate after each transaction
- [ ] [⋮ menu] per buyer: Edit | View History | Delete
- [ ] Buyer detail panel (right panel on click): all purchase history across all batches, avg rate paid, payment notes
- [ ] Data stored in buyers table: buyer_id, integrator_id, name, phone, location, type, notes, created_at
- [ ] buyer_id FK on batch_sales table

---

## GAP 3: MEDICATION / TREATMENT TRACKING

### REQ-GAP3-HEALTH-001: Treatment Log Section in Health Tab
**Priority:** P0
**Dependencies:** Health tab (existing, REQ-FARM-005 from v2.0)
**Acceptance Criteria:**
- [ ] New "Treatment Log" section appears in Health tab between Symptom Quick-Log and Health Event Timeline
- [ ] Section header: "💊 Treatment Log" with [+ Add Treatment] button
- [ ] Active withdrawal alert card shown at top of section if any treatment has withdrawal_period > 0 AND last_dose_date + withdrawal_days > today
- [ ] "DO NOT SELL" alert: red border, ⚠ icon, medicine name, last dose date, earliest harvest date
- [ ] Treatment log table columns: Date Started | Medicine | Brand | Purpose | Dosage | Route | Duration | Withdrawal | Cost | Status
- [ ] Status badges: Active Treatment (blue) | Withdrawal (amber) | Cleared (green) | Complete (grey)
- [ ] Row expansion: click row to show full details (indication, dosage calc, batch lot number, prescribed by, notes)
- [ ] No treatments empty state: medical kit illustration + Hindi + English text + CTA

### REQ-GAP3-HEALTH-002: Add Treatment Form
**Priority:** P0
**Dependencies:** REQ-GAP3-HEALTH-001
**Acceptance Criteria:**
- [ ] [+ Add Treatment] opens inline expandable form (not modal) within the treatment section
- [ ] Form fields:
  - [ ] Treatment Date: date picker (required)
  - [ ] Medicine Name: text with autocomplete (required) — autocomplete list of 50+ common broiler medicines loaded from medicines_db table
  - [ ] Brand Name: text (optional)
  - [ ] Batch/Lot Number: text (optional, for recall traceability)
  - [ ] Purpose/Indication: multi-select chips: Respiratory | Enteric | Leg Weakness | CRD | Coccidiosis | Newcastle | Preventive | Growth Promoter | Vitamin/Mineral | Other
  - [ ] Dosage Amount: numeric + unit dropdown (ml, g, mg)
  - [ ] Per: Per litre of water | Per bird | Per kg body weight | Per kg feed
  - [ ] Route of Administration: Water | Feed | Injectable | Topical | Spray (radio)
  - [ ] Treatment Duration: Day Start to Day End (of batch) OR date range
  - [ ] Withdrawal Period (days): numeric, auto-suggested if medicine in DB, manual override allowed
  - [ ] Withdrawal period > 0: shows "Do not sell before: [auto-calculated date]" in amber box
  - [ ] Cost: Quantity purchased + Unit + Rate per unit = auto-computed total; optional but encouraged
  - [ ] Prescribed by: vet name text + phone; [Save vet to directory] checkbox
  - [ ] Notes: 300 chars optional
- [ ] [Save Treatment ✓] button: POST /api/farms/[id]/treatments
- [ ] On save:
  - [ ] Entry added to treatment log table
  - [ ] If withdrawal > 0: Withdrawal Period Tracker updates (REQ-GAP3-HEALTH-003)
  - [ ] If cost entered: P&L → Medicine Cost auto-creates/updates entry (REQ-GAP1-PL-005)
  - [ ] Health Event Timeline gets new entry
  - [ ] If harvest date within withdrawal period: RED BANNER added to Sales & Lifting tab header
- [ ] medicines_db table: pre-populated with common Indian broiler medicines + FSSAI withdrawal periods; extensible
- [ ] Supabase RLS: treatment records scoped to farm_id → integrator_id

### REQ-GAP3-HEALTH-003: Withdrawal Period Tracker
**Priority:** P0
**Dependencies:** REQ-GAP3-HEALTH-002
**Acceptance Criteria:**
- [ ] Withdrawal Period Tracker widget shown below Treatment Log table, above Health Event Timeline
- [ ] Shows all medicines administered in current batch that have withdrawal_period > 0
- [ ] Per medicine: name, treatment date, last dose date, withdrawal period duration, clearance date, current status
- [ ] Progress bar per active withdrawal: Day X of Y withdrawal period
- [ ] HARVEST SAFETY STATUS section at bottom:
  - [ ] If all cleared: "✅ HARVEST SAFE — No active withdrawal periods"
  - [ ] If any active: "🔴 DO NOT HARVEST before [latest clearance date]"
- [ ] Clearance date auto-recalculates if treatment duration is extended
- [ ] Cleared medicines shown in collapsed section (expandable) with ✅ badge
- [ ] Critical integration with Sales tab: REQ-GAP2-SALES-002 reads withdrawal status from this data

### REQ-GAP3-HEALTH-004: Vet Directory
**Priority:** P2
**Dependencies:** REQ-GAP3-HEALTH-002 (vets added via treatment form)
**Acceptance Criteria:**
- [ ] Vet directory accessible from Farm Detail header [⋮] menu → "Vet Directory"
- [ ] List view: avatar | name | specialisation | phone | last consulted | associated farms
- [ ] [+ Add Vet] form: Name, Specialisation, Phone, Location, Notes, Associated Farms (multi-select)
- [ ] Vet card [Call →] button: tel: link for direct call from mobile
- [ ] Data stored in vets table: vet_id, integrator_id, name, specialisation, phone, location, notes
- [ ] FK: treatment records reference vet_id

### REQ-GAP3-HEALTH-005: Medicines Database Seeding
**Priority:** P0 (must exist before Treatment Form can be useful)
**Dependencies:** Database setup
**Acceptance Criteria:**
- [ ] medicines_db table seeded with ≥ 50 common broiler medicines used in India
  - Required columns: medicine_id, generic_name, brand_names_json, category, standard_withdrawal_days_india, dosage_guidance, notes
  - Example records: Tylosin (7 days India WP), Enrofloxacin (10 days), Oxytetracycline (10 days), Ampicillin (7 days), Colistin (1 day), Doxycycline (10 days), Trimethoprim-Sulfa (10 days), Coccidiostats (Amprolium - 0 days), Vitamins/Electrolytes (0 days)
- [ ] Autocomplete endpoint: GET /api/medicines?q=[query] → returns top 10 matches
- [ ] Withdrawal period auto-fill: when medicine selected from autocomplete, withdrawal_period field auto-populates
- [ ] "Not in database? Enter manually" fallback always available

---

## GAP 4: ENVIRONMENT DATA TRACKING

### REQ-GAP4-ENV-001: Daily Log Form — Environment Section
**Priority:** P0
**Dependencies:** Daily Log tab (existing REQ-FARM-004 from v2.0) must be working
**Acceptance Criteria:**
- [ ] New "Environment Data" accordion section added to Daily Log form
- [ ] Section is EXPANDED by default on first use; user can collapse it; collapse preference saved in localStorage
- [ ] Section shows after temperature and before notes in the form
- [ ] TEMPERATURE fields (redesign existing):
  - [ ] Three fields: Morning Temp (°C), Afternoon Temp (°C), Evening Temp (°C) [required]
  - [ ] All three shown in single row on desktop, stacked on mobile
  - [ ] Replace existing single "Temp" field
  - [ ] Validation: 0–50°C range
  - [ ] Auto-alert (inline banner, not modal): if any > 35°C: "⚠ Heat stress risk"
  - [ ] Auto-alert: if any < 10°C: "⚠ Cold stress risk"
- [ ] HUMIDITY fields (new):
  - [ ] Two fields: Morning Humidity (%), Afternoon Humidity (%)
  - [ ] Validation: 0–100
  - [ ] Auto-alert: if > 75%: amber inline banner "🔴 HIGH HUMIDITY — Respiratory disease risk"
  - [ ] Auto-alert: if < 40%: amber inline banner "⚠ LOW HUMIDITY"
  - [ ] Fields optional but encouraged (tooltip explains why they matter)
- [ ] AMMONIA field (new):
  - [ ] One field: Ammonia Level (ppm), numeric
  - [ ] Toggle: [Measured ●] [Estimated via Litter Condition]
  - [ ] If "Measured": numeric ppm field
  - [ ] If "Estimated": litter condition radio: Dry / Damp / Wet / Very Wet → maps to estimated range
  - [ ] Estimated range shown: "Estimated: ~15–20 ppm ⚠"
  - [ ] Auto-alert: < 10 ppm: "Normal ✓" | 10–25 ppm: amber warning | > 25 ppm: red critical warning
  - [ ] Critical alert text: "DANGEROUS — Immediate ventilation increase required. Consult your vet."
  - [ ] Validation: 0–200 ppm
- [ ] LIGHT PROGRAMME field (new):
  - [ ] Light Hours Today (hours): numeric, 0–24
  - [ ] Light Schedule: Continuous | Intermittent (dropdown, optional)
  - [ ] Auto-alert: if hours differ from breed standard for this batch day by >2h: show advisory
  - [ ] Breed standards for light hours pre-loaded in breed_light_programme table
- [ ] VENTILATION fields (new, fully optional, collapsible sub-section):
  - [ ] Fan Speed: Tunnel | Low | Medium | High
  - [ ] Curtain/Sidewall Position: Fully Open | Half Open | Closed
  - [ ] Inlet Opening %: 0–100
  - [ ] Notes: free text
- [ ] WATER field update:
  - [ ] Add "Water Temp (°C)" optional field next to existing Water (L) field
  - [ ] Auto-computation: Water:Feed ratio = water_L / feed_kg; shown as "W:F: 1.84 ✓"
  - [ ] Alert if ratio < 1.5 or > 2.5
- [ ] ENVIRONMENT SUMMARY shown at bottom of section after all fields filled:
  "Today's Environment: ✅ Temp OK | ⚠ Humidity elevated (72%) | ✅ Ammonia OK"
- [ ] Daily log DB table: add columns temp_morning, temp_afternoon, temp_evening, humidity_morning, humidity_afternoon, ammonia_ppm, ammonia_method (measured/estimated), litter_condition, light_hours, light_schedule, fan_speed, curtain_position, inlet_pct, ventilation_notes, water_temp
- [ ] Backwards compatible: all new columns nullable (old log entries without them still display)

### REQ-GAP4-ENV-002: Environment Trend Charts — Metrics Tab
**Priority:** P1
**Dependencies:** REQ-GAP4-ENV-001 (need data to chart)
**Acceptance Criteria:**
- [ ] New "Environment Trends" sub-section added to Farm Detail → Metrics tab, below existing 5 charts
- [ ] Section header: "🌡️ Environment Trends"
- [ ] CHART 1 — Temperature & Humidity (dual-axis Recharts LineChart):
  - [ ] Left Y-axis: Temperature (°C), right Y-axis: Humidity (%)
  - [ ] Lines: Morning Temp (solid green), Afternoon Temp (solid red), Morning Humidity (dashed blue), Afternoon Humidity (dashed purple)
  - [ ] Reference bands: optimal temp zone 18–28°C (light green), high temp >35°C (light red), optimal humidity 50–70% (light blue)
  - [ ] X-axis: batch day numbers
  - [ ] Tooltip: all 4 values + "Within optimal range: Yes/No"
  - [ ] Chart height: 240px
- [ ] CHART 2 — Ammonia Trend (Recharts LineChart):
  - [ ] Single line: ammonia (ppm)
  - [ ] Reference lines: 10 ppm (dashed green), 25 ppm (dashed red)
  - [ ] Background zones: green <10, amber 10–25, red >25
  - [ ] X-axis: batch day numbers
  - [ ] "Missing data" days shown as gaps in line (not zero)
- [ ] CHART 3 — Light Programme Compliance (Recharts BarChart):
  - [ ] Grouped bars: actual hours (green) vs target hours (grey) per day
  - [ ] Days with deviation highlighted with amber border
- [ ] ENVIRONMENT HEALTH SUMMARY CARD (above charts):
  - [ ] "Environment Summary — Last 7 days"
  - [ ] Per metric: "N/7 days within safe range" with ✅ or ⚠
  - [ ] Shows which days had issues as clickable links (click → opens that day's log)
- [ ] AI-GENERATED ENVIRONMENT INSIGHT (2 lines):
  - [ ] Generated from: humidity/temp/ammonia 7-day data + health events
  - [ ] Only shown if ≥7 days of environment data exists
  - [ ] Fallback if API fails: "Continue logging environment data daily to see insights"
- [ ] "View as table" toggle (accessibility)

### REQ-GAP4-ENV-003: IoT Sensor UI Placeholder
**Priority:** P3 (UI-ready for Phase 2, no backend required in Phase 1)
**Acceptance Criteria:**
- [ ] Farm Settings page (accessible via Farm Detail [⋮] → Settings) includes "Sensors & IoT" section
- [ ] Shows informational card: "Connect IoT sensors to auto-fill environment data"
- [ ] Current Status: "○ No sensors connected"
- [ ] [+ Connect Sensor] button: opens informational page/modal (not functional in P1)
- [ ] [Learn More →] link: opens documentation or marketing page
- [ ] When sensor IS connected (Phase 2): daily log fields show "Auto-filled by sensor ✓" badge
- [ ] API endpoint defined but returning 501 in P1: POST /api/farms/[id]/sensor-data

---

## GAP 5: FLOCK BENCHMARKING — BREED + REGION FILTERED

### REQ-GAP5-BENCH-001: Benchmark Page Setup
**Priority:** P1
**Dependencies:** Portfolio Metrics page (existing), completed batches data from other users in DB
**Acceptance Criteria:**
- [ ] New route: /dashboard/metrics/benchmark
- [ ] Accessible via sidebar under ANALYTICS → "Benchmark" nav item (new nav item)
- [ ] Also accessible via "View Detailed Benchmark →" link from Portfolio Metrics page (existing)
- [ ] Page title: "Flock Benchmark" | "झुंड की तुलना"
- [ ] Requires ≥ 1 completed batch for the current user; otherwise shows "Complete your first batch" state
- [ ] Page accessible to S1, S2, S5 roles only; gated for S3/S4 basic plan (redirect to upgrade page)

### REQ-GAP5-BENCH-002: Benchmark Filters
**Priority:** P1
**Dependencies:** REQ-GAP5-BENCH-001, aggregated benchmark data in DB
**Acceptance Criteria:**
- [ ] Filter bar with 5 controls (sticky at top on scroll):
  - [ ] My Farm/Portfolio: dropdown (All Farms | individual farm names from user's farms)
  - [ ] Breed: All | Ross 308 | Cobb 430 | Cobb 500 | Hubbard JV | Vencobb 400 | Other
  - [ ] Region: All India | UP/Bihar Belt | Maharashtra/Gujarat | AP/Telangana | Karnataka | Tamil Nadu | Punjab/Haryana | Other
  - [ ] Flock Size: All | Small (5K–20K) | Medium (20K–50K) | Large (50K–200K) | Commercial (200K+)
  - [ ] Period: Last Batch | Last 3 Batches | Last 6 Batches | Last 12 Months
- [ ] [Apply ✓] button applies all filters simultaneously (single API call)
- [ ] [Reset Filters] clears to defaults
- [ ] Results count: "Comparing to [N] batches from [M] farms matching your filters"
- [ ] Privacy guard: if filter matches < 10 farms in DB, show "Not enough data to show benchmark for this filter combination. Try broader filters." (never show data from < 10 farms to protect privacy)
- [ ] Filters persist in URL query params (shareable link)
- [ ] Filter selections persist in localStorage between sessions

### REQ-GAP5-BENCH-003: Your Performance Summary
**Priority:** P1
**Dependencies:** REQ-GAP5-BENCH-002
**Acceptance Criteria:**
- [ ] Left section (40% width on desktop, full width on mobile) showing user's own farm performance
- [ ] Header: "Your Farm(s) — [Period]"
- [ ] 4 KPI cards: FCR | Mortality % | ADG (g/day) | Gross Margin %
- [ ] Each card: current value + trend vs previous period (↑/↓ with %)
- [ ] Aggregation: if "All Farms" selected, shows portfolio average across all farms for period

### REQ-GAP5-BENCH-004: Benchmark Comparison Table
**Priority:** P1
**Dependencies:** REQ-GAP5-BENCH-002, REQ-GAP5-BENCH-003, aggregated_benchmarks table in DB
**Acceptance Criteria:**
- [ ] Full-width table with columns: Metric | Your Avg | Group Avg | Top 25% | Top 10% | Your Rank
- [ ] Metrics rows: FCR | Mortality % | ADG (g/day) | Harvest Weight (kg) | Batch Duration (days) | Feed Efficiency (%) | Gross Margin %
- [ ] Your Avg column: green if ≥ Group Avg, amber if 5–10% below, red if >10% below
- [ ] Your Rank column: "Top X%" text with colour (green: top 25%, amber: 25–50%, red: bottom 50%)
- [ ] Table loads within 500ms with skeleton loading state
- [ ] "View as table" is already the default — no toggle needed
- [ ] Table data sourced from aggregated_benchmarks table (pre-computed, not real-time joins)
  - aggregated_benchmarks table: benchmark_id, breed, region, flock_size_category, period, metric_name, p25_value, p50_value, p75_value, p90_value, sample_count, computed_at
  - Refreshed nightly by a scheduled function

### REQ-GAP5-BENCH-005: Performance Radar Chart
**Priority:** P1
**Dependencies:** REQ-GAP5-BENCH-002, REQ-GAP5-BENCH-004
**Acceptance Criteria:**
- [ ] Recharts RadarChart, 7 axes: FCR | Mortality | ADG | Weight | Duration | Feed Efficiency | Margin
- [ ] 3 overlaid areas: Your Portfolio (dark green filled) | Group Average (grey outline dashed) | Top 25% (purple outline dashed)
- [ ] Each axis normalised to 0–100 scale (100 = best possible performance for that metric)
- [ ] Radar chart height: 340px
- [ ] Legend below chart with colour indicators
- [ ] Hover: shows exact values per metric per overlay

### REQ-GAP5-BENCH-006: Benchmark Insights (AI-Generated)
**Priority:** P2
**Dependencies:** REQ-GAP5-BENCH-004, REQ-GAP5-BENCH-005
**Acceptance Criteria:**
- [ ] 4 insight cards below radar chart: Strength | Improvement Opportunity | Benchmark Context | Action Suggestion
- [ ] Generated by Claude Sonnet API call with: user metrics, benchmark table data, filter context
- [ ] API call parameters: POST /api/benchmark/insights with {user_metrics, benchmark_data, filters}
- [ ] Prompt instructs model to output structured JSON: {strength, improvement, context, action}
- [ ] Loading state: skeleton cards while generating (up to 5s timeout)
- [ ] Fallback if API fails: show template-based insights using metric comparisons (no AI)
- [ ] Insight text: max 60 words per card; actionable and specific (no generic platitudes)

### REQ-GAP5-BENCH-007: Breed Growth Curve Comparison
**Priority:** P2
**Dependencies:** REQ-GAP5-BENCH-001, weight data from daily logs, breed_growth_standards table
**Acceptance Criteria:**
- [ ] Recharts LineChart below insights section
- [ ] Lines: Your actual weight progression (solid green) | Selected breed standard (dashed grey) | Group avg progression (dashed purple) | Top 25% progression (dashed amber)
- [ ] Breed selector above chart: Ross 308 | Cobb 430 | Cobb 500 | Hubbard JV | Vencobb 400
- [ ] Default breed: matches user's most recent batch breed
- [ ] breed_growth_standards table: seeded with Aviagen/Cobb official performance objectives (publicly available data from breed company websites)
  - Columns: breed, day, standard_weight_g, source
  - Pre-seeded for all common breeds D1–D56
- [ ] X-axis: Day 1 to Day 42 (or max batch day)
- [ ] Y-axis: Weight (grams), 0–2500
- [ ] Tooltip: day + your weight + standard + group avg + top 25%

### REQ-GAP5-BENCH-008: Portfolio Metrics Page — Benchmark Section Update
**Priority:** P1
**Dependencies:** REQ-GAP5-BENCH-004 (benchmark data engine), Portfolio Metrics page (existing)
**Acceptance Criteria:**
- [ ] Existing "Network Benchmark" section on Portfolio Metrics page updated
- [ ] Quick filter pills added: Breed (All/Ross 308/Cobb 430/Other) | Region (All/My State/My District)
- [ ] Filter pills immediately update benchmark cards on change (AJAX, no page reload)
- [ ] 4 comparison cards: FCR | Mortality % | ADG | Margin, each showing: Your value | Peer Group | Top 25%
- [ ] "Filtered: [breed] | [region] | [N] farms" shown below filter pills
- [ ] "View Detailed Benchmark →" link to /dashboard/metrics/benchmark
- [ ] Data privacy callout: "ℹ Benchmark data is fully anonymised. Minimum 10 farms required." (shown on first load, dismissable)

---

## GAP 6: CALAMITY & OUTBREAK WARNING SYSTEM

### REQ-GAP6-RISK-001: Per-Farm Risk Score Calculation Engine
**Priority:** P1
**Dependencies:** Farm data (GPS coordinates), batch data (age, vaccination status), alert data (location)
**Acceptance Criteria:**
- [ ] risk_scores table: farm_id, alert_id, proximity_km, proximity_score, age_score, vaccination_score, biosecurity_score, total_score, risk_level (LOW/MEDIUM/HIGH), calculated_at
- [ ] Risk score = proximity_score (0–4) + age_score (0–2) + vaccination_score (0–2) + biosecurity_score (0–2), capped at 10
- [ ] PROXIMITY SCORE: calculated from farm GPS coords and alert epicentre coords using Haversine formula
  - < 20km: 4 | 20–50km: 3 | 50–100km: 2 | 100–200km: 1 | > 200km: 0
- [ ] AGE SCORE: based on batch current day
  - D1–D7: 2 | D8–D21: 1.5 | D22–D35: 1 | D36+: 0.5 | No active batch: 0
- [ ] VACCINATION SCORE: derived from vaccination schedule completion status in health records
  - ND not vaccinated: 2 | ND partially vaccinated: 1 | ND fully vaccinated: 0
- [ ] BIOSECURITY SCORE: from farm.biosecurity_level field (set during farm setup or farm settings)
  - Low: 2 | Medium: 1 | High: 0
  - Default if not set: Medium (1)
- [ ] Risk level: LOW if total < 4 | MEDIUM if 4–7 | HIGH if ≥ 8
- [ ] Recalculated every 6 hours for all farms with active batches when ≥1 alert is active (scheduled Supabase Edge Function)
- [ ] Also recalculated on-demand when: new alert created, batch vaccination status updated, farm biosecurity updated

### REQ-GAP6-RISK-002: Farm Biosecurity Level Setting
**Priority:** P1
**Dependencies:** Farm setup (existing), REQ-GAP6-RISK-001
**Acceptance Criteria:**
- [ ] Farm Add Wizard (Step 1) gains new optional field: "Biosecurity Level"
  - Options: Low (open access) | Medium (basic controls) | High (full protocol)
  - Helper text: "This helps FlockIQ calculate your farm's disease risk score accurately"
  - Default: Medium
- [ ] Farm Settings page: biosecurity level visible and editable
- [ ] Changing biosecurity level: triggers risk score recalculation for all active alerts immediately
- [ ] biosecurity_level column added to farms table: ENUM('low', 'medium', 'high'), default 'medium'

### REQ-GAP6-RISK-003: Per-Farm Risk Score Display — Alerts Page
**Priority:** P1
**Dependencies:** REQ-GAP6-RISK-001, Alerts page (existing)
**Acceptance Criteria:**
- [ ] New section "⚠ Farm Risk Assessment" added at TOP of Alerts → Active Alerts tab
- [ ] Section shown ONLY when at least 1 active alert with at least 1 user farm within 200km radius
- [ ] Alert summary header: alert type + location + distance from nearest user farm + alert date
- [ ] Per-farm risk score table: Farm Name | Distance (km) | Flock Age (Day N) | Vaccination Status | Risk Score (badge) | Risk Level
- [ ] Risk badge colours: 🟢 LOW | 🟡 MEDIUM | 🔴 HIGH with numeric score
- [ ] Empty batch rows: show "No active batch" in Age column with risk shown as LOW
- [ ] Table sorted by risk score descending (highest risk first)
- [ ] "View Risk Details →" link per farm row + section footer link
- [ ] Section shows "Updated: N hours ago" timestamp

### REQ-GAP6-RISK-004: Farm Risk Detail Page
**Priority:** P1
**Dependencies:** REQ-GAP6-RISK-001, REQ-GAP6-RISK-003
**Acceptance Criteria:**
- [ ] Route: /dashboard/alerts/risk/[farmId]?alertId=[alertId]
- [ ] Also accessible as right-panel drawer triggered from risk score table
- [ ] Content: Farm header | Alert info | Risk badge + total score
- [ ] Leaflet mini-map (300px height): farm marker (green) + alert epicentre (red) + distance line + scale
- [ ] Risk Breakdown Table: 4 factors with scores, reasoning, subtotals, grand total
- [ ] "How to reduce your risk" section with 2–3 specific, actionable recommendations
- [ ] Official recommendations section: link to source bulletin, government helpline number
- [ ] Risk score history: table of recalculation timestamps and values (shows how score changed as information refined)
- [ ] WhatsApp notification mention: "You will receive WhatsApp notification if risk level changes"
- [ ] Page accessible to all roles (View Only can see risk, cannot edit farms)

### REQ-GAP6-RISK-005: Risk Score Integration — Batch Status Board
**Priority:** P1
**Dependencies:** REQ-GAP6-RISK-001, Batch Status Board (existing)
**Acceptance Criteria:**
- [ ] Batch cards gain risk badge when their farm has an active alert: "🟡 RISK 5.2" or "🔴 RISK 7.8"
- [ ] Badge links to /dashboard/alerts/risk/[farmId]
- [ ] Filter bar gets new option: [HIGH RISK] filter (shows farms with score ≥ 8)
- [ ] No badge shown when farm risk score = 0 (no active alerts nearby)

### REQ-GAP6-RISK-006: Risk Score Integration — Portfolio Metrics
**Priority:** P2
**Dependencies:** REQ-GAP6-RISK-001, REQ-GAP6-RISK-003
**Acceptance Criteria:**
- [ ] New "Disease Risk Monitor" card added below Pending Actions section on Portfolio Metrics page
- [ ] Card shown only when any farm has risk score > 0
- [ ] Shows: active alert count | per-farm risk summary list | [View Full Risk Details →] link
- [ ] Card hidden when no active alerts: no empty state needed (section simply absent)

### REQ-GAP6-RISK-007: WhatsApp Risk Score Notifications
**Priority:** P2
**Dependencies:** REQ-GAP6-RISK-001, WhatsApp integration (existing v2.0 feature)
**Acceptance Criteria:**
- [ ] When a farm's risk level changes (e.g., LOW → MEDIUM or MEDIUM → HIGH): send WhatsApp notification to integration manager
- [ ] Notification includes: farm name, old risk level, new risk level, brief recommendation
- [ ] Maximum 1 risk-change notification per farm per alert per 24 hours
- [ ] User can disable risk notifications in Settings → Notifications
- [ ] Notification is sent to integration manager number, not farmer's number

---

## GAP 7: DOCUMENT LIBRARY PER FLOCK / FARM

### REQ-GAP7-DOC-001: Documents Tab Setup
**Priority:** P0
**Dependencies:** Farm Detail page (existing), Supabase Storage configured
**Acceptance Criteria:**
- [ ] New tab "Docs" / "Docs / दस्तावेज़" in Farm Detail tab bar
- [ ] Tab icon: 📄
- [ ] Tab position: last tab
- [ ] URL: /dashboard/farms/[farmId]?tab=docs
- [ ] Supabase Storage bucket: "farm-documents" (private, authenticated access only)
- [ ] Storage path convention: [integrator_id]/[farm_id]/[batch_id]/[doc_type]/[filename]
- [ ] Farm-level docs path: [integrator_id]/[farm_id]/farm-level/[filename]
- [ ] documents table: doc_id, farm_id, batch_id (nullable for farm-level docs), integrator_id, doc_name, doc_type (ENUM), file_path (Supabase Storage path), file_size_bytes, file_ext, upload_date, document_date, tags_json, notes, uploaded_by (user_id), created_at, deleted_at (soft delete)
- [ ] Supabase RLS: only user's own integrator_id documents accessible

### REQ-GAP7-DOC-002: Document Upload Flow
**Priority:** P0
**Dependencies:** REQ-GAP7-DOC-001
**Acceptance Criteria:**
- [ ] [Upload Document +] button triggers upload modal (centred, 480px wide)
- [ ] STEP 1 — File Selection:
  - [ ] Drag & drop zone: "Drag PDF, JPG, or PNG here, or click to browse"
  - [ ] Accepted types: PDF, JPG, JPEG, PNG, HEIF (for iPhone photos)
  - [ ] Max file size: 10 MB (enforced client-side before upload)
  - [ ] Show error if file type or size invalid: "File must be PDF, JPG, or PNG under 10MB"
  - [ ] Preview: PDF shows PDF icon with filename; images show thumbnail
- [ ] STEP 2 — Document Details:
  - [ ] Document Name: text, auto-populated from filename, fully editable
  - [ ] Document Type: dropdown (Chick Purchase Invoice | Feed Invoice | Vaccination Certificate | Medicine Bill | Movement Permit | Sale Invoice | Lab Test Report | Insurance | Other)
  - [ ] Batch: dropdown (all batches for this farm + "Farm-Level")
  - [ ] Date of Document: date picker (important for chronological sorting)
  - [ ] Notes: optional, 200 chars
  - [ ] Tags: multi-select chips: Invoice | Certificate | Permit | Report | Other
- [ ] [Upload ✓] button:
  - [ ] Uploads file to Supabase Storage via PUT /api/farms/[id]/documents
  - [ ] Progress bar shown during upload
  - [ ] On success: "✓ Document saved" toast + [Upload Another] [Done] options
  - [ ] On failure: "Upload failed. Please try again." with retry option
- [ ] Cancel button available at any step
- [ ] Multiple file upload: [Upload Document] opens modal; after success modal offers "Upload Another"
  (Sequential upload, not batch upload — keeps UX simple)
- [ ] Storage quota display in tab header: "N docs · X MB used of 500 MB"

### REQ-GAP7-DOC-003: Document Categories and Viewing
**Priority:** P0
**Dependencies:** REQ-GAP7-DOC-001, REQ-GAP7-DOC-002
**Acceptance Criteria:**
- [ ] Documents displayed in 9 categorised accordion sections (see Design spec for categories)
- [ ] Each section shows: category icon + name + count badge + [+ Upload] shortcut button
- [ ] Empty section: shows add button only (no empty state message — keeps UI clean)
- [ ] Batch selector tabs at top: [All Batches] [Batch #N (Current)] [Batch #N-1] ... [Farm-Level Docs]
- [ ] Selecting a batch tab: only shows documents for that batch
- [ ] "All Batches" tab: shows all documents grouped by batch, then category
- [ ] DOCUMENT CARD design (within each section):
  - Thumbnail (image preview for JPG/PNG; PDF icon for PDFs)
  - Document name
  - Upload date · File type · File size
  - Batch tag + Document type tag
  - Action buttons: [👁 Preview] [⬇ Download] [✏ Rename] [🗑 Delete]
- [ ] [👁 Preview]: opens full-screen lightbox for images; inline PDF viewer (using browser native PDF rendering) for PDFs
- [ ] [⬇ Download]: triggers file download from Supabase Storage (signed URL, expires in 60s)
- [ ] [✏ Rename]: inline edit of document name (click to edit, Enter to save)
- [ ] [🗑 Delete]: confirmation dialog "Delete this document? This cannot be undone."
  - Soft-delete (set deleted_at timestamp, not physical deletion for 30 days)

### REQ-GAP7-DOC-004: Document Search and Filter
**Priority:** P2
**Dependencies:** REQ-GAP7-DOC-003
**Acceptance Criteria:**
- [ ] Search bar at top of Documents tab: full-text search across doc_name, notes, tags
- [ ] Results shown as flat list with match highlighting
- [ ] Filters: Date Range | Document Type | Batch
- [ ] Search results: "N documents found for '[query]'"
- [ ] "Clear search" × button

### REQ-GAP7-DOC-005: Batch Closure Report Auto-Generation
**Priority:** P1
**Dependencies:** Batch Close Wizard (REQ-GAP2-SALES-005), P&L data (Gap 1), Health data (Gap 3)
**Acceptance Criteria:**
- [ ] When "Download Batch Closure Report" is checked in Batch Close Wizard Step 3:
  - [ ] POST /api/batches/[id]/closure-report triggered
  - [ ] Server generates PDF using Puppeteer or equivalent Node.js PDF library
  - [ ] PDF auto-saved to Documents tab under farm's documents (doc_type = 'batch_closure_report')
  - [ ] PDF also offered as immediate download via browser
- [ ] PDF content (6 pages, see Design spec for full content): Cover | Performance vs Benchmarks | P&L Statement | Health Events | Environment Summary | Documents Checklist
- [ ] PDF uses FlockIQ brand colours (brand700 headers, brand100 section backgrounds)
- [ ] PDF generation timeout: 30 seconds; if exceeded, email PDF to user when ready
- [ ] PDF filename: "FlockIQ_BatchReport_[FarmName]_Batch[N]_[Date].pdf"
- [ ] Footer disclaimer on every page: "Generated by FlockIQ on [date] | Batch data is self-reported"

### REQ-GAP7-DOC-006: Cross-Tab Document Attachments
**Priority:** P2
**Dependencies:** REQ-GAP7-DOC-002, Sales tab (Gap 2), Treatment Log (Gap 3), Feed tab (existing)
**Acceptance Criteria:**
- [ ] Sales Log table: each sale row has [📎 Attach Invoice] button; opens document upload modal pre-filled with type = "Sale Invoice" and batch = current batch
- [ ] Once attached: row shows "📄 Invoice.pdf [View]" link
- [ ] Treatment Log table: each treatment row has [📎 Attach Bill/Prescription] button; opens upload modal pre-filled with type = "Medicine Bill"
- [ ] Feed Purchase Log table: each purchase row has [📎 Attach Invoice] button
- [ ] Farm card (Portfolio page): shows "📄 N docs" small badge
- [ ] Batch Status Board (Harvest Ready column): shows "📄 Docs: N/3 ready" or "⚠ Docs missing" badge

### REQ-GAP7-DOC-007: Document Audit Trail
**Priority:** P2
**Dependencies:** REQ-GAP7-DOC-001
**Acceptance Criteria:**
- [ ] document_audit_log table: log_id, doc_id, farm_id, action (upload/download/rename/delete/preview), performed_by (user_id), performed_at
- [ ] Every upload/download/delete is logged
- [ ] Audit log visible in Documents tab as expandable "Document Activity Log" at bottom
- [ ] Shows: action | document name | performed by | timestamp
- [ ] Only visible to Owner and Manager roles (not Field Supervisor or View Only)

---

## SHARED / CROSS-GAP REQUIREMENTS

### REQ-SHARED-001: Updated Farm Detail Tab Bar
**Priority:** P0
**Dependencies:** All Gap 1–7 tab implementations
**Acceptance Criteria:**
- [ ] Farm Detail tab bar updated to: Metrics | Daily Log | Health | Feed | P&L | Sales | History | Docs | WhatsApp
- [ ] On desktop: all tabs visible if horizontal space allows; otherwise [⋯ More] overflow menu
- [ ] On mobile (< 480px): tabs horizontally scrollable; active tab kept centered via JS scroll
- [ ] Tab bar height: 48px; minimum tab width: 64px on mobile
- [ ] URL param ?tab=[tab_id] controls active tab; shareable
- [ ] Tab switching: no full page reload (client-side routing)
- [ ] Tab bar is sticky below the farm header band on scroll

### REQ-SHARED-002: Updated Sidebar Navigation
**Priority:** P1
**Dependencies:** REQ-GAP5-BENCH-001
**Acceptance Criteria:**
- [ ] New "Benchmark" nav item added under ANALYTICS section
  - Label: "Benchmark" | "बेंचमार्क"
  - Icon: 📈 (or custom icon)
  - Route: /dashboard/metrics/benchmark
  - Visible to S1, S2, S5 roles only (same as Portfolio Metrics)

### REQ-SHARED-003: Global Currency Support for All New Cost Fields
**Priority:** P1
**Dependencies:** Settings → Currency setting (REQ-SETTINGS-001 from v2.0), all Gap 1 cost fields
**Acceptance Criteria:**
- [ ] All monetary fields in P&L tab, Sales tab, and Treatment cost field respect user's currency setting
- [ ] Currency symbol shown on all ₹ fields as the user's chosen symbol
- [ ] Exchange rate: no automatic conversion required (user enters amounts in their local currency)
- [ ] Currency stored in DB as the raw number; currency code stored separately per integrator
- [ ] Display logic: format amounts as: INR → ₹1,00,000 (Indian notation) | USD/EUR → $100,000 (standard notation) | IDR → Rp 100.000 | VND → ₫100.000

### REQ-SHARED-004: Real-Time Derived Field Updates
**Priority:** P0
**Dependencies:** All gap forms using computed fields
**Acceptance Criteria:**
- [ ] All auto-computed fields (Revenue, FCR, cost totals, risk scores, P&L banner) update in real-time as user types input fields
- [ ] Update happens within 100ms of keystroke (debounced at 300ms for expensive computations)
- [ ] No save required to see computed result (live preview)
- [ ] Computed fields visually distinguished: grey background, "Auto-calculated" label, read-only

### REQ-SHARED-005: Mobile Form Optimisation for All New Forms
**Priority:** P1
**Dependencies:** All new form designs (Sale event, Treatment, Medicine cost, Overhead, etc.)
**Acceptance Criteria:**
- [ ] All new forms tested at 375px (iPhone SE) and 390px (iPhone 14) viewport
- [ ] On mobile: drawers become full-screen bottom sheets (100vh, slide up animation)
- [ ] All input fields: minimum height 44px (WCAG touch target)
- [ ] Numeric inputs: inputMode="decimal" on mobile (triggers numeric keyboard)
- [ ] Date pickers: native on mobile (type="date"); custom on desktop
- [ ] Forms: single-column stacked layout on mobile
- [ ] [Save] button: pinned to bottom of screen on mobile (position sticky, never scrolls away)
- [ ] Form auto-save draft to IndexedDB (all new forms, same pattern as v2.0 Daily Log)

---

## NON-FUNCTIONAL REQUIREMENTS (Gap Additions)

### REQ-NFR-GAP-001: Database Migrations
**Priority:** P0
**Acceptance Criteria:**
- [ ] All new tables have migration files (Supabase migration format)
- [ ] New tables: batch_costs, batch_medicine_costs, batch_labour_costs, batch_sales, buyers, vets, documents, document_audit_log, risk_scores, aggregated_benchmarks, medicines_db, breed_growth_standards, breed_light_programme
- [ ] All new tables: RLS enabled with policies scoped to integrator_id
- [ ] All new columns on existing tables (daily_logs env fields, farms.biosecurity_level, batches.target_cost_per_bird, batches.target_margin): nullable for backwards compatibility
- [ ] Migration scripts tested on staging before production

### REQ-NFR-GAP-002: API Routes
**Priority:** P0
**Acceptance Criteria:**
- [ ] New API routes: POST /api/farms/[id]/costs (batch costs), POST /api/farms/[id]/sales (sale events), POST /api/batches/[id]/close, POST /api/farms/[id]/treatments, GET /api/medicines?q= (autocomplete), POST /api/farms/[id]/documents (upload), GET /api/benchmark/data?breed=&region=&size=&period=, POST /api/benchmark/insights, GET /api/alerts/risk/[farmId]?alertId=, POST /api/batches/[id]/closure-report
- [ ] All routes: authentication required, 401 if unauthenticated
- [ ] All routes: RLS enforced (user can only access their own data)
- [ ] All routes: response time < 300ms (95th percentile)
- [ ] Document upload route: handles multipart form data; validates file type/size

### REQ-NFR-GAP-003: Offline Support for New Forms
**Priority:** P1
**Acceptance Criteria:**
- [ ] P&L cost entries: drafts saved to IndexedDB, auto-submitted on reconnect
- [ ] Sale entry form: draft saved to IndexedDB
- [ ] Treatment log entry: draft saved to IndexedDB
- [ ] Document uploads: queued offline, uploaded on reconnect (with progress indicator)
- [ ] Environment data in daily log: existing offline draft support covers this (already scoped in v2.0)

### REQ-NFR-GAP-004: Performance — New Features
**Priority:** P1
**Acceptance Criteria:**
- [ ] Benchmark page: initial load (data fetch + radar chart render) < 2 seconds
  (Pre-computed benchmark table is the key — no real-time joins)
- [ ] Risk score display: loaded as part of alerts page, no separate fetch; < 300ms
- [ ] Document list: renders skeleton immediately; documents load progressively
- [ ] P&L tab: banner loads from batch local state (no new fetch on tab switch); < 100ms perceived
- [ ] Waterfall chart: renders within 500ms of P&L tab load
- [ ] Environment trend charts: lazy-loaded when user scrolls to them in Metrics tab

---

*End of FlockIQ Gap Remediation Requirements v1.0*
*Companion: FlockIQ_Gap_Remediation_Design_Master_v1.md | FlockIQ_Gap_Remediation_Tasks_v1.md*
