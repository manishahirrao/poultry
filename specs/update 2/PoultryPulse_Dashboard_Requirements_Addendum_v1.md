# PoultryPulse AI — Dashboard Requirements Addendum v1.0
**Document Type:** Requirements Addendum — Navfarm Competitive Parity + Enhancement  
**Version:** Addendum 1.0 · May 2026  
**Extends:** PoultryPulse_Dashboard_Requirements_v1.md (REQ-001 through REQ-012)  
**Classification:** CONFIDENTIAL — Engineering & Investor Use  
**Trigger:** Full gap analysis against Navfarm Poultry ERP whitepaper — 34 unaddressed features identified  
**Kiro Note:** Merge this addendum into the base requirements file before Kiro project initialization. New requirement IDs begin at REQ-013 to avoid collision.

---

## Strategic Framing — What We Take From Navfarm and Why

PoultryPulse is a **price intelligence platform**, not a farm ERP. That distinction is load-bearing: it determines our pricing power, our sales motion, and our defensible moat. We do not become Navfarm by copying their ERP features. However, Navfarm's whitepaper reveals exactly which **operational data inputs** a farmer generates daily that — if captured inside PoultryPulse — make our price intelligence dramatically more accurate and our Batch ROI Optimizer genuinely precise rather than estimation-based.

The 34 gaps fall into three strategic buckets:

| Bucket | Treatment | Phases |
|---|---|---|
| **A — Operational Intelligence Inputs** (FCR, mortality, weight gain, DOC) | Build inside PoultryPulse — these data points directly improve ML model accuracy and ROI calculations | Phase 1 (addendum) |
| **B — Farm Operations Management** (vaccination, inventory, procurement, field worker app, biosecurity) | Build as a complementary "Farm Ops" module — a natural upsell from price intelligence | Phase 2 (addendum, roadmap) |
| **C — Enterprise & Ecosystem** (ERP integrations, IoT, traceability, compliance, hatchery, layer) | Build as integration connectors and compliance layer — opens enterprise and export market | Phase 2–3 (addendum, roadmap) |

Every requirement below is categorized by bucket and phase. Phase 1 items are immediately buildable. Phase 2–3 items have architecture-level requirements but no sprint assignment yet.

---

## Bucket A — Operational Intelligence Inputs (Phase 1)

### REQ-013 · Farm, Shed & Batch Lifecycle Management

**Priority:** P0 — Must Have (Phase 1)  
**Navfarm Gap Closed:** Section 4.1 (Batch-wise bird placement, DOC tracking, supplier integration, multi-shed visibility)  
**User Stories:**
- As a commercial farm operator (S1), I want to log each batch from DOC placement through to harvest so that the Batch ROI Optimizer uses my actual flock data rather than manual inputs every time.
- As an integrator (S2), I want to track all batches across all my contract farms — each with its own DOC date, shed, supplier, and target harvest date — in a single dashboard view.

**Functional Requirements:**

13.1 The system shall provide a **Batch Registration Form** allowing users to record:
   - Batch ID (auto-generated: `[district-code]-[YYYYMM]-[sequence]`, e.g., `GKP-202606-001`)
   - DOC (Day-Old Chick) placement date
   - DOC count (number of chicks placed)
   - DOC supplier name (freetext + dropdown from saved suppliers)
   - Breed/strain (dropdown: Cobb 500, Ross 308, Vencobb, Hubbard, Other)
   - Shed ID (auto-populated from farm profile; multi-shed farms select from dropdown)
   - Target harvest weight (kg/bird, default from breed standard lookup)
   - Feed type at placement (from saved feed brands list)

13.2 The system shall maintain a **Live Batch Status Board** — a Kanban-style view showing all active batches across all sheds:
   - Columns: `Placement (Day 1–7)` → `Growing (Day 8–28)` → `Pre-Harvest (Day 29–42)` → `Harvest Ready (Day 43+)` → `Harvested`
   - Each card shows: Batch ID, shed, DOC count, current age (days), latest weight (kg/bird), projected harvest date, sell signal badge (SELL/HOLD/CAUTION from price intelligence)
   - Cards transition columns automatically based on DOC date + current date

13.3 The Batch ROI Optimizer (REQ-003) shall be pre-populated with data from the selected active batch — no manual re-entry of flock size, age, weight, feed cost. All fields editable for "what-if" scenarios.

13.4 The system shall maintain a **DOC Supplier Registry**:
   - Supplier name, location, contact details
   - Historical DOC quality rating per batch (user-assigned 1–5 stars at harvest)
   - Average survival rate per supplier across past batches
   - This data feeds the mortality risk model in REQ-003

13.5 The system shall provide a **Multi-Shed Performance Grid** (S2 integrators):
   - Table: Shed × Metric (current age, bird count, avg weight, FCR, mortality %, sell signal)
   - Color-coded cells: green (on track), amber (deviation < 10%), red (deviation > 10% from breed standard)
   - Click any shed row → opens Batch Detail drawer

13.6 **Harvested Batch Archive**: All completed batches move to an archive with full lifecycle data. This archive powers:
   - Performance benchmarking (REQ-016)
   - ML model retraining with actual user data (future enrichment signal)
   - Batch-to-buyer traceability (REQ-021)

**Non-Functional Requirements:**

13.7 Batch data shall be stored in a new `batches` Supabase table with RLS: `customer_id = auth.uid()`.

13.8 For S2 integrators with contract farmers, batches can be assigned to sub-accounts (contract farm IDs) with the integrator having read access to all sub-account batches.

13.9 Batch Status Board shall render with skeleton loading and show cached data within 300ms of navigation.

---

### REQ-014 · FCR Analytics & Daily Feed Efficiency Dashboard

**Priority:** P0 — Must Have (Phase 1)  
**Navfarm Gap Closed:** Section 4.2 (FCR analytics, daily feed allocation planner, feed-water ratio deviation alerts), Section 8 (FCR forecasting, input cost projections)  
**User Stories:**
- As a farm operator, I want to log daily feed consumption and see my FCR trend so I can catch under/over-feeding before it costs me ₹20,000 in wasted feed.
- As an integrator, I want to compare FCR across all my contract farms to identify which farm managers are wasting feed.

**Functional Requirements:**

14.1 The **Daily Feed Log** shall allow entry of:
   - Date (auto-populated, editable)
   - Batch selection (from active batches in REQ-013)
   - Morning feed (kg)
   - Evening feed (kg)
   - Water consumption (litres) — optional; required if IoT water meter connected (REQ-018)
   - Feed brand/type (from saved feed brands registry)
   - Any feed refusal (kg left over, if applicable)

14.2 The system shall compute and display **FCR (Feed Conversion Ratio)** continuously:
   - Formula: `total_feed_consumed_kg / total_weight_gain_kg`
   - Displayed as a live-updating gauge widget on the Batch Detail screen
   - Color coding: green (< 1.7 for day 35 Cobb 500), amber (1.7–2.0), red (> 2.0)
   - Breed-standard FCR benchmarks hardcoded per breed × age × season (lookup table, updatable by admin)

14.3 The system shall display a **FCR Trend Chart** (7-day and batch-to-date):
   - Line chart: actual FCR by day vs breed-standard FCR by age (reference line)
   - Divergence from standard highlighted with shaded region
   - Tooltip: day, actual FCR, standard FCR, delta, cumulative excess feed cost (₹)

14.4 The system shall compute and display **Feed Cost per Kg of Meat Produced**:
   - Formula: `(total_feed_kg × feed_price_per_kg) / total_weight_gain_kg`
   - Displayed as a KPI card on the Batch Detail screen
   - Trend vs last batch and vs district average (benchmarking from REQ-016)

14.5 **Daily Feed Allocation Planner**: Based on the flock's current age, weight, and FCR, the system shall recommend the next day's feed quantity:
   - Calculation: `(target_weight_gain_per_bird × flock_size × recommended_FCR_for_age) / feed_density`
   - Display: "कल के लिए अनुशंसित चारा: [X] kg (सुबह: [Y] kg · शाम: [Z] kg)"
   - Adjustable: user can override and the system logs the variance

14.6 **Feed-Water Ratio Deviation Alert** (Navfarm Section 4.2):
   - When water consumption drops below 1.8× feed consumption (standard ratio for broilers), the system shall fire an amber alert: "⚠ पानी कम पिया जा रहा है — बीमारी की संभावना"
   - When water consumption is > 3.5× feed, the system shall fire an alert: "⚠ बहुत अधिक पानी — डायरिया की जाँच करें"
   - These alerts are added to the Alert Intelligence Center (REQ-004) as a new alert type: `feed_water_deviation`

14.7 **FCR Forecasting** (ML-enhanced, Navfarm Section 8):
   - A simple linear regression model trained on historical FCR data by age × breed × season shall forecast the remaining batch FCR
   - Forecast used in Batch ROI Optimizer (REQ-003) to improve feed cost projection accuracy
   - Replaces the hardcoded `FCR = 2.2` constant in TASK-011

14.8 **Feed Mill Integration** (Navfarm Section 4.2):
   - Phase 1: Manual entry of feed purchase receipts (quantity, price, supplier, delivery date) into the Feed Purchases log
   - Phase 2: API integration with major feed brands (Godrej Agrovet, Amrit Feeds) for automated purchase confirmation

14.9 **Multi-Farm FCR Comparison** (S2 Integrators):
   - Bar chart ranking all active batches by current FCR (lowest = best)
   - Identifies outlier farms with FCR > breed standard + 10%
   - Alert: "Farm [X] ka FCR bahut zyaada hai — immediate review karein"

**Non-Functional Requirements:**

14.10 FCR computation shall be a pure TypeScript function in `src/lib/fcrCalculator.ts`, unit-tested with known inputs/outputs.

14.11 Daily feed log entry shall work fully offline (mobile) using expo-sqlite, syncing to Supabase on reconnection.

---

### REQ-015 · Health, Vaccination & Biosecurity Management

**Priority:** P1 — High Priority (Phase 1)  
**Navfarm Gap Closed:** Section 4.3 (Vaccination scheduling/logs, medication records, health checklists, biosecurity audit workflows)  
**User Stories:**
- As a farm operator, I want vaccination reminders so I never miss a critical schedule point and expose my flock to preventable disease.
- As an integrator, I want biosecurity audit scores across all my farms to identify which farms are disease risk.

**Functional Requirements:**

15.1 The **Vaccination Schedule Manager** shall:
   - Pre-load standard vaccination protocols for broiler (Marek's, Newcastle, IBD, IB — standard UP belt protocol)
   - Allow custom protocol entry for non-standard breeds
   - Display a calendar view of upcoming vaccinations with day-countdown badges
   - Send push notification + WhatsApp reminder 24 hours before each scheduled vaccination
   - After vaccination: log date, vaccine brand, batch number, dose, route of administration (drinking water / spray / injection), administered by

15.2 The **Medication & Treatment Records** log shall capture:
   - Date and batch
   - Symptom observed (dropdown: Respiratory / Digestive / Nervous / Other)
   - Diagnosis (freetext or dropdown from common conditions)
   - Treatment prescribed (drug name, dose, route, duration)
   - Veterinary consultation (yes/no; if yes: vet name, contact)
   - Treatment outcome (recovered / mortality increased / no change)
   - Withdrawal period tracked: `⚠ Do not sell until [date]` banner shown on Batch Status Board

15.3 **Daily Health Checklist** — a mobile-native checklist that farm supervisors complete each morning:
   - Bird behaviour (Normal / Lethargic / Aggressive)
   - Appetite (Normal / Reduced / Refused)
   - Droppings (Normal / Loose / Yellow / Bloody)
   - Respiratory (Normal / Coughing / Sneezing / Gasping)
   - Mortality today (count by cause: Unknown / Respiratory / Digestive / Injury / Heat Stress)
   - Water consumption (Normal / Reduced / Excessive)
   - Submission is timestamped and stored per batch per day
   - Missing checklist for > 24h → alert to farm owner (and integrator if applicable)

15.4 **Biosecurity Audit Workflow**:
   - A fortnightly self-audit form covering: visitor log, vehicle entry log, footbath maintenance, feed store hygiene, dead bird disposal, equipment sanitation
   - Scoring: each item Yes/No/Partial → weighted biosecurity score out of 100
   - Score displayed as a gauge on the Farm Profile page
   - Score < 60: amber warning on dashboard. Score < 40: red alert + "immediate corrective action required"
   - Historical trend chart: biosecurity score over last 8 audits

15.5 **Health-to-Price Intelligence Integration**:
   - If the daily health checklist shows respiratory symptoms in a batch AND the HPAI zone flag is active within 200km, the system shall escalate the HPAI alert from amber to red for that specific customer
   - This is the most defensible feature differentiator: combining local farm health data with regional disease intelligence to produce a personalized risk score
   - Output: "⚠ आपके झुंड में लक्षण + पास में बीमारी — तुरंत पशु चिकित्सक से मिलें और बेचने से पहले जाँच कराएं"

15.6 **Withdrawal Period Price Intelligence Link**:
   - When a batch is in medication withdrawal period, the Sell Signal badge shall automatically change to "HOLD — Withdrawal" (grey badge) overriding any SELL signal
   - This prevents the farmer from getting a legal liability by following a sell signal when birds can't legally be sold

**Non-Functional Requirements:**

15.7 Vaccination schedule data stored in `vaccination_schedules` and `vaccination_logs` Supabase tables with `batch_id` FK.

15.8 Health checklist shall work 100% offline on mobile (expo-sqlite), with automatic sync on reconnection.

15.9 Medication withdrawal period tracking shall be enforced at the Sell Signal computation layer — not just as a UI overlay.

---

### REQ-016 · Daily Mortality Tracking & Performance Benchmarking

**Priority:** P0 — Must Have (Phase 1)  
**Navfarm Gap Closed:** Section 4.4 (Daily mortality tracking by cause/age, weight gain tracking, automatic alerts for abnormal losses, performance benchmarking per farm & breed), Section 8 (Mortality pattern detection, weight gain predictions)  
**User Stories:**
- As a farm operator, I want to log daily mortality with cause so I can track patterns before they become flock-wide disasters.
- As an integrator, I want to benchmark all my farms against each other and against district averages to identify underperformers.

**Functional Requirements:**

16.1 **Daily Mortality Log** (mobile-first entry):
   - Date, batch selection (auto-populated to today's active batch)
   - Count of birds died
   - Cause of death (dropdown: Unknown / Respiratory / Digestive / Heat Stress / Cold Stress / Injury / Predator / Other)
   - Age at death (auto-calculated from DOC date)
   - Photo attachment (optional, for vet consultation)
   - The log must be submittable in < 30 seconds (single screen, no navigation)

16.2 **Cumulative Mortality Dashboard**:
   - Running total: birds placed vs birds alive today (survivor count)
   - Cumulative mortality rate % (updated live as logs entered)
   - Mortality rate trend chart: daily deaths per 1000 birds, last 42 days
   - Color coding: green (< 0.3%/day), amber (0.3–0.5%/day), red (> 0.5%/day)
   - Breed-standard mortality curve as reference line on the chart

16.3 **Abnormal Mortality Alert** (Navfarm Section 4.4):
   - If a single day's mortality exceeds 3× the 7-day rolling average, fire an immediate alert:
     - Push notification + WhatsApp: "⚠ असामान्य मृत्यु — आज [N] पक्षी मरे। तुरंत जाँच करें।"
     - Alert added to Alert Intelligence Center (REQ-004) as type `abnormal_mortality`
   - Threshold adjustable per farm (slider in alert preferences)

16.4 **Weight Gain Tracking** (replaces hardcoded values in TASK-011):
   - Weekly weighing event log: date, sample size (min 30 birds), average weight (kg/bird), standard deviation
   - Weight gain chart: actual weekly weight vs breed-standard growth curve (Cobb 500 / Ross 308 standard tables)
   - Deviation alerts: if actual weight < 90% of breed standard for age → amber alert "चारे की जाँच करें या डॉक्टर से मिलें"
   - This actual weight data replaces the hardcoded `0.06 kg/day gain` in TASK-011 TechnicalNotes

16.5 **Weight Gain Prediction ML** (Navfarm Section 8):
   - A ridge regression model trained on the user's own batch history predicts weight at harvest given current weight trajectory
   - Used in Batch ROI Optimizer to compute revenue more accurately than the breed-standard default
   - Model trains on the user's last 5+ batches (personalized, not a shared model)

16.6 **Performance Benchmarking Dashboard** (Navfarm Section 4.4, 2.6):
   - Compares the current batch against:
     - User's own last 5 batches (personal history)
     - District average (anonymized aggregate from all PoultryPulse customers in the same district)
     - Breed standard (Cobb/Ross published specifications)
   - Metrics benchmarked: FCR, mortality %, avg weight at day 35/42, feed cost per kg of meat, batch net profit per bird
   - Displayed as a spider/radar chart with 5 axes — user's batch vs benchmarks
   - This is the "How do I rank?" feature that drives competitive engagement and retention

16.7 **Mortality Pattern Detection** (Navfarm Section 8, ML):
   - A time-series analysis model detects anomalous mortality spikes and identifies likely cause patterns:
     - Spike on days 5–10 → likely DOC stress / transportation mortality
     - Spike on day 15–25 → likely IBD / gumboro
     - Spike in summer (April–June) → likely heat stress
   - Output displayed as an insight card below the mortality chart: "इस पैटर्न से लगता है: [cause]. सुझाव: [action]"

**Non-Functional Requirements:**

16.8 Daily mortality log entry on mobile: single screen, ≤ 30 seconds from opening to submission.

16.9 Benchmarking data uses only anonymized, aggregated data across customers — no individual farm data is exposed to other users. Aggregation requires minimum 5 farms per district before district average is shown (privacy threshold).

---

## Bucket B — Farm Operations Management (Phase 2)

### REQ-017 · Inventory, Procurement & Batch Costing Module

**Priority:** P1 — High Priority (Phase 2)  
**Navfarm Gap Closed:** Section 4.7 (Feed/medicine/vaccine inventory, automated consumption, vendor management, purchase orders, batch-wise operational costing), Section 2.4 (Disconnected manual records), Section 2.6 (Unclear profitability)  
**User Stories:**
- As a farm operator, I want every rupee of cost associated with a batch automatically tracked so I know the exact net profit when I sell.
- As an integrator, I want purchase orders integrated with my batch costs to eliminate manual reconciliation.

**Functional Requirements:**

17.1 **Inventory Management**:
   - Three inventory categories: Feed Stock, Medicines & Vaccines, Consumables (litter, disinfectants, packaging)
   - Current stock levels with minimum stock alerts: "⚠ Maize stock will last only 3 more days at current FCR"
   - Stock movements: manual entry (purchase, consumption, adjustment, wastage, theft)
   - Scan-based consumption entry: QR code on feed bags scanned by farm supervisor → auto-deducts from stock
   - Wastage tracking: spoiled feed, expired medicines logged separately for insurance claims

17.2 **Vendor Management & Purchase Orders**:
   - Vendor registry: feed suppliers, medicine suppliers, equipment vendors with contact, payment terms, delivery lead time
   - Purchase Order creation: vendor, items, quantities, negotiated price, expected delivery date
   - PO status tracking: Created → Sent → Delivered → Invoiced → Paid
   - GRN (Goods Receipt Note): actual quantity received vs PO quantity — variance flagged

17.3 **Batch-Wise Full P&L** (Navfarm Section 4.7):
   - Auto-aggregated from all cost entries for the batch:
     - DOC cost (unit price × placement count)
     - Feed cost (consumed kg × avg price per kg, weighted for price changes during batch)
     - Medicine & vaccine cost (actual purchase cost per batch)
     - Labor cost (daily entry, configurable as ₹/day/shed)
     - Electricity cost (daily entry or fixed overhead per batch)
     - Miscellaneous overhead (configurable)
   - Revenue: actual sale price × kg × birds sold (entered at harvest)
   - **Net Profit per Batch**, **Net Profit per Bird**, **Net Profit per kg of Meat** — all three KPIs displayed
   - Comparison to Batch ROI Optimizer prediction (projected vs actual variance)

17.4 **Automated Consumption Updates** (Navfarm Section 4.7):
   - When daily feed log is entered (REQ-014), stock levels automatically decrease
   - When vaccination log is entered (REQ-015), vaccine stock automatically decreases
   - When medication is logged (REQ-015), medicine stock automatically decreases
   - Low stock trigger → system suggests a re-order with pre-filled purchase order

17.5 **Accounting Export**:
   - One-click export of batch P&L as CSV (compatible with Tally import format)
   - Monthly summary report: total revenue, total cost, net profit, GST summary — downloadable as PDF

**Non-Functional Requirements:**

17.6 All inventory movements are immutable audit log entries — no edit/delete. Corrections are made via adjustment entries with reason code.

17.7 Batch P&L is recomputed on every new cost entry (not batched) to ensure the operator always sees the current profitability position.

---

### REQ-018 · IoT Smart Farm Integration Layer

**Priority:** P1 — High Priority (Phase 2)  
**Navfarm Gap Closed:** Section 5 (Auto-weighing scales, smart water meters, environment sensors temperature/humidity/ammonia, RFID bird tracking, climate controllers, smart feed silos)  
**User Stories:**
- As a tech-forward integrator (S2), I want my auto-weighing scale and environment sensors connected so that PoultryPulse receives real data rather than manual entries.

**Functional Requirements:**

18.1 **IoT Device Registry**:
   - Users register IoT devices with: device type, manufacturer, model, shed assignment, API endpoint or MQTT topic
   - Supported device types: auto-weighing scale, environment sensor (temp/humidity/ammonia), water meter, feed silo level sensor
   - Device status indicators: Online (green), Offline (red), Last Reading timestamp

18.2 **Environment Sensor Dashboard** (per shed):
   - Real-time display: temperature (°C), humidity (%), ammonia level (ppm)
   - Safe range bands: temperature 18–25°C optimal for broilers (age-dependent), humidity 50–70%, ammonia < 20 ppm
   - Out-of-range alert: "⚠ Shed 2 — Ammonia bahut zyaada: 35 ppm. Ventilation badhayein." → alert type `iot_environment` in Alert Intelligence Center (REQ-004)
   - Historical chart: last 24h trends for all 3 metrics (line chart, 15-minute resolution)

18.3 **Auto-Weighing Scale Integration**:
   - When a weight reading is received from a connected scale, it automatically updates the Weight Gain Tracking log (REQ-016)
   - Eliminates manual weekly weighing — data becomes daily/continuous
   - Weight data improves the Batch ROI Optimizer accuracy in real-time

18.4 **Water Meter Integration**:
   - Daily water consumption auto-logged from smart water meter → eliminates manual entry in REQ-014
   - Feed-water ratio alert (REQ-014 §14.6) fires automatically without any human input
   - Water consumption anomaly detection: > 30% deviation from 7-day rolling average → alert

18.5 **Climate Controller Integration** (future):
   - PoultryPulse can push temperature setpoints to compatible climate controllers based on IMD forecast
   - Example: IMD predicts 42°C tomorrow → system suggests pre-cooling shed tonight, can auto-execute if operator approves
   - Phase 2 implementation — architecture must support bidirectional IoT (read AND write) from Phase 1 device registry

18.6 **RFID Bird Tracking** (Phase 3):
   - Architecture note: the data schema for `bird_events` table should include an optional `rfid_tag` column from Phase 1 so RFID data can be added without schema migration
   - Full RFID implementation deferred to Phase 3

**Non-Functional Requirements:**

18.7 IoT data ingestion via MQTT (AWS IoT Core, Phase 2) or REST webhook (Phase 1 simpler approach). Phase 1: devices POST to `POST /api/v1/iot/reading` with API key authentication.

18.8 IoT data stored in a time-series optimized table `iot_readings` (partitioned by month per TRD architecture). Retention: 6 months at full resolution, 2 years at daily aggregates.

18.9 Real-time display in the shed environment dashboard uses Supabase Realtime subscription on `iot_readings` — same pattern as alert delivery (REQ-004 §4.6).

---

### REQ-019 · Enterprise ERP & Accounting System Integrations

**Priority:** P1 — High Priority (Phase 2)  
**Navfarm Gap Closed:** Section 6 (Microsoft Dynamics, SAP, Oracle, Tally/Zoho, Custom ERPs — centralized financials, cost accounting, unified inventory, traceability)  
**User Stories:**
- As an integrator's finance head, I want batch P&L data to sync automatically to our Tally accounting software so our accountant doesn't manually re-enter 200 batches per year.
- As an enterprise QSR procurement head (S5), I want PoultryPulse price forecasts to feed directly into our SAP procurement module.

**Functional Requirements:**

19.1 **Tally Integration** (Phase 2, highest priority for India market):
   - Export batch P&L entries in Tally XML format (TallyPrime-compatible)
   - One-click export from Batch Archive (REQ-013 §13.6)
   - Field mapping: PoultryPulse `batch_cost` → Tally `stock_item`, `batch_revenue` → Tally `sales_voucher`
   - Reconciliation report: exported entries vs Tally entries, flagging mismatches

19.2 **Zoho Books / Zoho Inventory Integration** (Phase 2):
   - OAuth 2.0 connection to Zoho account
   - Bidirectional sync: purchase orders from REQ-017 sync to Zoho as bills, sales sync as invoices
   - Inventory sync: feed stock levels sync to Zoho Inventory

19.3 **SAP / Oracle REST API Integration** (Phase 2, enterprise tier S5):
   - PoultryPulse exposes a standardized REST API for ERP pull:
     - `GET /api/v2/enterprise/forecast/erp` — 30-day price forecast in ERP-consumable JSON
     - `GET /api/v2/enterprise/batch/erp` — batch cost and status data
   - Authentication: existing HMAC-signed API key (TRD §7.1)
   - Response format: configurable (JSON default; XML available for legacy SAP)

19.4 **Custom ERP Webhook** (Phase 2):
   - Operators can register a webhook URL to receive events:
     - `batch.created`, `batch.harvested`, `forecast.updated`, `alert.fired`
   - Payload: JSON, signed with HMAC-SHA256 for authenticity verification
   - Retry logic: 3 retries with exponential backoff on non-2xx responses

19.5 **Integration Hub Dashboard** (Admin):
   - Lists all active integrations per customer (Tally, Zoho, SAP, Webhook)
   - Last sync timestamp, sync success/failure status, error log for failed syncs
   - "Test Connection" button for each integration

**Non-Functional Requirements:**

19.6 All ERP integrations are customer-configurable from Settings → Integrations. No code deployment required to add a new integration for an existing customer.

19.7 ERP integrations operate asynchronously via a background job queue (Supabase Edge Functions or Railway.app worker) — integration failures do not affect the core application.

---

### REQ-020 · Field Worker Supervisor App (Offline-First Data Capture)

**Priority:** P1 — High Priority (Phase 2)  
**Navfarm Gap Closed:** Section 7 (Works without internet, captures feed/mortality/production/health/temperature, multilingual UI, scan-based inventory, instant sync)  
**User Stories:**
- As a farm supervisor managing 3 sheds for an integrator, I want a simple app that lets me log the morning checklist, mortality count, and feed given — even when there's no network signal in the shed.

**Functional Requirements:**

20.1 The Field Worker App is a **separate user role** within the existing React Native app:
   - Role: `supervisor` — created by the farm owner (S1) or integrator (S2) from their Settings → Team
   - Supervisors have restricted access: they can ENTER data but cannot VIEW price forecasts or batch P&L
   - This role separation addresses the privacy concern that farm owners don't want workers seeing full business financials

20.2 **Supervisor Daily Data Entry Flow** (mobile, 3 minutes max daily):
   - Step 1: Select shed (from assigned sheds)
   - Step 2: Health Checklist (REQ-015 §15.3) — 6 fields, tap-based
   - Step 3: Mortality count + cause (REQ-016 §16.1) — 2 fields
   - Step 4: Feed given (morning + evening kg) — 2 numeric inputs
   - Step 5: Water reading (if meter connected or visual estimate) — 1 field
   - Step 6: Any note (freetext, optional)
   - Submit → data queued locally → auto-sync when network available

20.3 **Offline Queue Management**:
   - All submitted entries stored in expo-sqlite with `synced=false` flag
   - Background sync triggered whenever network is available (NetInfo listener)
   - Sync status indicator in the app header: "3 records pending sync" with timestamp of oldest pending

20.4 **QR Code Scan for Inventory** (Navfarm Section 7):
   - Farm owner prints QR codes and affixes them to feed bags, medicine boxes
   - Supervisor scans QR → inventory item identified → quantity consumed entered → stock automatically deducted
   - Camera permission requested on first scan; fallback to manual item selection

20.5 **Team Management** (farm owner view):
   - Add/remove supervisors by phone number (same OTP onboarding flow)
   - Assign supervisors to specific sheds (not all sheds)
   - View supervisor submission history: "Supervisor did not submit morning checklist — Day 3 missing"
   - Missing submission alert sent to farm owner after 10:00 AM if no morning checklist received

20.6 **Multilingual Support** (Navfarm Section 7):
   - Supervisor app interface in Hindi (default)
   - Phase 2 additions: Bhojpuri, Bengali, Telugu labels for non-Hindi speaking workers in respective regions
   - Language selection per supervisor account (not tied to farm owner's language setting)

**Non-Functional Requirements:**

20.7 Supervisor app data entry works with ZERO network connectivity. No online API calls during data entry flow.

20.8 Maximum sync conflict resolution: last-write-wins with timestamp. Conflict log maintained for admin review.

---

## Bucket C — Enterprise & Ecosystem (Phase 2–3)

### REQ-021 · Batch-to-Buyer Traceability & Compliance Module

**Priority:** P1 — High Priority (Phase 2)  
**Navfarm Gap Closed:** Section 9 (FSSAI, HACCP, Organic/Antibiotic-Free, Export Documentation, Batch-to-buyer traceability DOC → harvest)  
**User Stories:**
- As a processor (S5) buying from contract farms, I want full traceability of every batch: DOC source, feed used, vaccinations given, medications administered, harvest date and weight.
- As a farm operator selling to a FSSAI-compliant processor, I want to generate a one-click traceability report to satisfy their audit requirements.

**Functional Requirements:**

21.1 **Batch Traceability Record** — automatically compiled from all data entered across REQ-013 through REQ-016:
   - DOC: supplier, placement date, breed, count
   - Feed: every feed brand and quantity consumed, with purchase receipts
   - Health: all vaccinations (vaccine brand, batch number, date, dose), all medications (drug name, dose, withdrawal period)
   - Environment: summary of temperature/humidity profile during growth (from IoT or manual)
   - Mortality: total cumulative mortality, causes breakdown
   - Harvest: date, weight at harvest, buyer name, invoice number

21.2 **FSSAI Compliance Report**:
   - One-click PDF generation: "Batch Traceability Report — FSSAI Format"
   - Contains all data from §21.1 in the format required for FSSAI inspections
   - Includes QR code linking to a digital copy (hosted on Cloudflare, accessible without login for buyer verification)

21.3 **Antibiotic-Free / Organic Certification Tracking**:
   - If the farm is registered as "Antibiotic-Free", the system validates:
     - No antibiotic medications logged in the batch (from REQ-015 §15.2)
     - If an antibiotic is logged → automatic certification flag withdrawal for that batch
     - Alert to farm owner: "⚠ इस बैच में एंटीबायोटिक दी गई — AB-Free सर्टिफिकेशन इस बैच के लिए लागू नहीं होगा"
   - Certification status badge on the batch card (AB-Free ✅ / Conventional)

21.4 **HACCP Audit Workflow** (for processors and exporters):
   - Digital HACCP checklist: critical control points for broiler processing
   - Deviation logging with corrective action records
   - HACCP audit report generation

21.5 **Export Documentation Pack** (Phase 3):
   - Health certificate generation (for APEDA-approved exports)
   - Veterinary inspection record
   - Consignment-level traceability report
   - Phase 3 — requires government API integration (APEDA, DAHDF)

21.6 **Buyer Portal** (read-only, no login required):
   - When a buyer scans the QR code on the traceability report, they see a public-facing summary
   - Shows: farm district, breed, key health events, harvest date, FSSAI status
   - Does NOT show: financial data, exact farm location, customer's personal data

**Non-Functional Requirements:**

21.7 The traceability QR code link must remain accessible for 5 years after harvest date (per FSSAI retention requirements). Cloudflare CDN delivery with static HTML — no DB dependency for the buyer-facing page.

21.8 All traceability data is immutable once the batch is marked "Harvested." Any post-harvest correction requires an amendment entry with reason code and timestamp.

---

### REQ-022 · Layer Farm Production Tracking

**Priority:** P2 — Standard Priority (Phase 2)  
**Navfarm Gap Closed:** Section 4.5 (Daily egg production logs, feed intake vs egg output correlation, egg grading/packing/dispatch, yield forecasting 7–30 days)  
**User Stories:**
- As a layer farm operator in Basti district, I want PoultryPulse to track my daily egg production and forecast my production for the next 30 days so I can plan grading and dispatch.

**Functional Requirements:**

22.1 **Daily Egg Production Log**:
   - Date, flock age (weeks), total eggs collected, broken eggs, floor eggs, total saleable eggs
   - Hen-Day Production % (HDP): `saleable_eggs / surviving_hens × 100`
   - Standard HDP benchmark for age (Lohmann Brown / HH-260 standard curves)
   - Color coding: green (> 90% standard), amber (80–90%), red (< 80%)

22.2 **Feed Intake vs Egg Output Correlation** (Navfarm Section 4.5):
   - Chart: daily feed consumed vs daily egg count, 30-day rolling
   - Correlation coefficient displayed: helps identify if feed changes are impacting production
   - Alert: if feed consumption drops > 10% and egg production drops > 5% in the same day → "⚠ Stress signal — जाँच करें"

22.3 **Egg Grading, Packing & Dispatch Log**:
   - Grading entry: Large / Medium / Small / Cracked counts per day
   - Packing log: eggs packed into trays/crates with packing date
   - Dispatch log: buyer, quantity, price per dozen, invoice number
   - Cold storage inventory (if applicable)

22.4 **Egg Production Yield Forecasting** (Navfarm Section 8):
   - A polynomial regression model (fitted on layer breed standard curves) forecasts HDP for the next 30 days
   - Enables operators to plan grading labor, packaging procurement, and buyer commitments in advance
   - Forecast displayed as a chart with confidence bands (similar pattern to broiler price forecast UI)

22.5 **NECC Price Integration for Layers**:
   - The existing NECC data pipeline (dag_necc_daily per Architecture §2.2) already collects egg prices
   - For layer farms: the price hero widget (REQ-001 §1.1) shows NECC egg price for the user's zone instead of broiler price
   - The Middleman Check tool (REQ-005) adapts to compare NECC zone price vs offered price for eggs

**Non-Functional Requirements:**

22.6 The farm profile setup (UI/UX Design v1.0, Screen OB-04) already has a "Poultry Type" selector: Broiler / Layer (currently "Layer = Coming Soon"). REQ-022 fulfills this "Coming Soon" promise.

22.7 All layer-specific computations (HDP, yield forecast) are in a separate `src/lib/layerCalculator.ts` module — cleanly separated from broiler logic for maintainability.

---

### REQ-023 · Hatchery & Breeder Module

**Priority:** P3 — Future Roadmap (Phase 3)  
**Navfarm Gap Closed:** Section 4.6 (Egg collection/grading, fertility/hatchability tracking, setter/hatcher process control, chick quality scoring)  
**Architecture Note:**

23.1 The Hatchery & Breeder Module is a Phase 3 feature. It is documented here for architecture awareness only — the database schema and API design should accommodate hatchery data structures from Phase 1 to avoid costly migrations.

23.2 **Schema reservation**: The `batches` table (REQ-013) shall include a `batch_type` column: `broiler | layer | breeder | hatchery`. Phase 1 only populates `broiler` and `layer`. The column enables hatchery batch tracking in Phase 3 without schema changes.

23.3 **Planned features (Phase 3 design, not built)**:
   - Setter and hatcher tray tracking with fertility and hatchability rates
   - Chick quality scoring at hatch (activity score, navel condition, weight uniformity)
   - Hatching egg supply chain: breeder farm → hatchery → broiler farm DOC delivery
   - Integration with REQ-013 DOC supplier registry: hatchery customers become DOC suppliers for broiler customers

---

## Cross-Cutting Addendum Requirements

### REQ-024 · ML Model Enhancement — Operational Data Integration

**Priority:** P0 — Must Have (Phase 1, parallel with ML training)  
**Navfarm Gap Closed:** Section 8 (FCR forecasting, mortality pattern detection, weight gain predictions, input cost projections)  
**Description:**

The 45-feature model (Architecture §3.4) was designed using only public data sources. Operational data from REQ-013 through REQ-016 creates a private, proprietary feature set that competitors cannot replicate. This is PoultryPulse's ultimate moat.

24.1 **New ML Features from Operational Data** (add to the 45-feature matrix):

| Feature | Source | Expected Importance |
|---|---|---|
| `flock_avg_weight_actual` | REQ-016 weekly weighing | High — actual weight vs estimated |
| `cumulative_mortality_rate_14d` | REQ-016 daily mortality log | High — supply signal |
| `fcr_current_batch` | REQ-014 daily feed log | High — cost signal |
| `vaccination_compliance_score` | REQ-015 vaccination log | Medium — disease risk |
| `biosecurity_score` | REQ-015 audit workflow | Medium — disease risk |
| `shed_temperature_7d_avg` | REQ-018 IoT sensor | High if IoT connected |
| `ammonia_level_7d_avg` | REQ-018 IoT sensor | Medium if IoT connected |
| `district_cumulative_mortality_7d` | Aggregated from REQ-016 across customers | Very High — supply shock signal |

24.2 **District Mortality Aggregation** (privacy-preserving):
   - Anonymize and aggregate daily mortality rates across all PoultryPulse customers in each district
   - This creates a real-time supply shock signal: if 20% of farms in Gorakhpur report elevated mortality, supply is tightening and price will rise
   - This feature is impossible for any competitor to replicate — it requires the customer base to generate it
   - Privacy: only district-level aggregates exposed; no individual farm data shared

24.3 **Personalized Weight Gain Model** (REQ-016 §16.5):
   - Replace the hardcoded `0.06 kg/day` constant in TASK-011 Technical Notes
   - A Ridge regression model trained on the user's own batch history
   - Input: current age, current weight, FCR, season → output: predicted weight at harvest date
   - Model stored in Supabase `customer_ml_models` table, loaded at Batch ROI computation time

---

### REQ-025 · Profitability Benchmarking & Industry Comparison

**Priority:** P1 — High Priority (Phase 1)  
**Navfarm Gap Closed:** Section 2.6 (No visibility on profit per flock/shed/farm, no benchmarking against industry), Section 8 (Profitability per batch, input cost projections)  
**User Stories:**
- As a farm operator, I want to know how my profit per bird compares to other farms in my district so I understand whether my performance is competitive.

**Functional Requirements:**

25.1 **Batch Profitability KPI Cards** (added to the Batch Detail view):
   - Net Profit per Bird (₹/bird)
   - Net Profit per Kg of Meat (₹/kg)
   - Return on Input Cost (ROIC %)
   - Days-to-Breakeven (when did the batch become profitable?)
   - All four compared to: personal last batch, district average (anonymized), breed standard benchmark

25.2 **Industry Benchmark Comparison Chart** (spider/radar chart):
   - 5 axes: FCR, Mortality %, Avg Harvest Weight, Feed Cost/kg, Net Profit/bird
   - Three overlaid series: this batch (blue), personal best batch (green), district average (dashed grey)
   - One-sentence AI insight below chart: "आपका FCR जिले के औसत से बेहतर है, लेकिन मृत्यु दर थोड़ी अधिक है।"

25.3 **Input Cost Projection** (Navfarm Section 8):
   - Based on current FCR trajectory and commodity price forecasts (REQ-006), project total input cost at harvest
   - Formula: `projected_feed_cost + actual_medicine_cost + actual_DOC_cost + estimated_overhead`
   - Displayed as a running total on the Batch Detail screen with "₹X to harvest" counter

25.4 **Profitability Trend Across Batches**:
   - Line chart: net profit per bird across the user's last 10 batches
   - Regression trend line: is profitability improving or declining?
   - Annotation: "Your profitability is trending down 8% per batch — price timing and FCR are the main drivers"

**Non-Functional Requirements:**

25.5 District benchmark aggregations computed daily by a new Supabase Edge Function that runs after `dag_accuracy_monitor` completes. Minimum 5 farms per district for benchmark to be shown (privacy threshold, same as REQ-016 §16.9).

---

## Addendum Database Schema Extensions

The following new Supabase tables are required for this addendum:

```sql
-- REQ-013: Batch Lifecycle Management
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  batch_id TEXT UNIQUE NOT NULL, -- e.g. GKP-202606-001
  batch_type TEXT DEFAULT 'broiler' CHECK (batch_type IN ('broiler','layer','breeder','hatchery')),
  shed_id TEXT NOT NULL,
  doc_placement_date DATE NOT NULL,
  doc_count INTEGER NOT NULL,
  doc_supplier TEXT,
  breed TEXT NOT NULL,
  target_harvest_weight_kg NUMERIC(4,2),
  status TEXT DEFAULT 'growing' CHECK (status IN ('placement','growing','pre_harvest','harvest_ready','harvested')),
  harvest_date DATE,
  harvest_weight_kg NUMERIC(4,2),
  harvest_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: customer_id = auth.uid()

-- REQ-014: Feed Logs
CREATE TABLE feed_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  log_date DATE NOT NULL,
  morning_feed_kg NUMERIC(6,2),
  evening_feed_kg NUMERIC(6,2),
  water_litres NUMERIC(8,2),
  feed_brand TEXT,
  feed_refusal_kg NUMERIC(5,2) DEFAULT 0,
  synced BOOLEAN DEFAULT true, -- false when submitted offline, set to true on sync
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REQ-015: Vaccination Logs
CREATE TABLE vaccination_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  vaccine_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  disease_target TEXT NOT NULL,
  route TEXT CHECK (route IN ('drinking_water','spray','injection','eye_drop'))
);

CREATE TABLE vaccination_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES vaccination_schedules(id),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  administered_date DATE NOT NULL,
  vaccine_brand TEXT,
  batch_number TEXT,
  dose_per_bird NUMERIC(6,3),
  administered_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  log_date DATE NOT NULL,
  symptom TEXT,
  diagnosis TEXT,
  drug_name TEXT NOT NULL,
  dose TEXT,
  route TEXT,
  duration_days INTEGER,
  withdrawal_days INTEGER NOT NULL DEFAULT 0,
  withdrawal_end_date DATE GENERATED ALWAYS AS (log_date + withdrawal_days * INTERVAL '1 day') STORED,
  outcome TEXT CHECK (outcome IN ('recovered','mortality_increased','no_change','pending')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REQ-016: Mortality & Weight Logs
CREATE TABLE mortality_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  log_date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  cause TEXT CHECK (cause IN ('unknown','respiratory','digestive','heat_stress','cold_stress','injury','predator','other')),
  age_at_death INTEGER, -- auto-calculated from DOC date
  photo_url TEXT,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  weigh_date DATE NOT NULL,
  sample_size INTEGER NOT NULL,
  avg_weight_kg NUMERIC(4,3) NOT NULL,
  std_deviation NUMERIC(4,3),
  age_days INTEGER, -- auto-calculated
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REQ-017: Inventory & Costing
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  category TEXT CHECK (category IN ('feed','medicine','vaccine','consumable')),
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- kg, litres, doses, pieces
  current_stock NUMERIC(10,2) DEFAULT 0,
  min_stock_alert NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventory_items(id),
  customer_id UUID REFERENCES customers(id),
  batch_id UUID REFERENCES batches(id), -- nullable for purchases
  movement_type TEXT CHECK (movement_type IN ('purchase','consumption','adjustment','wastage','theft')),
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(8,2),
  total_cost NUMERIC(10,2),
  reason TEXT,
  qr_scan BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REQ-018: IoT
CREATE TABLE iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  shed_id TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('weighing_scale','environment_sensor','water_meter','feed_silo','climate_controller')),
  manufacturer TEXT,
  model TEXT,
  api_key_hash TEXT,
  last_seen_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE iot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES iot_devices(id),
  customer_id UUID REFERENCES customers(id),
  shed_id TEXT,
  reading_type TEXT, -- temperature_c, humidity_pct, ammonia_ppm, weight_kg, water_litres
  value NUMERIC(10,4) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
) PARTITION BY RANGE (recorded_at); -- monthly partitions
```

---

## Addendum Acceptance Criteria

| Requirement | Phase | Key Gate |
|---|---|---|
| REQ-013 Batch Management | Phase 1 | Batch ROI Optimizer auto-populated from active batch — zero manual re-entry |
| REQ-014 FCR Analytics | Phase 1 | FCR chart renders within 48h of daily feed log entry; feed-water alert fires correctly |
| REQ-015 Health/Vaccination | Phase 1 | Vaccination reminder fires 24h before scheduled date via push + WhatsApp |
| REQ-015 §15.5 | Phase 1 | Health checklist symptom + HPAI zone → escalated red alert fires within 60s |
| REQ-015 §15.6 | Phase 1 | Withdrawal period overrides SELL signal to HOLD — verified by Playwright test |
| REQ-016 Mortality Tracking | Phase 1 | Abnormal mortality alert fires within 60s of log entry |
| REQ-016 Benchmarking | Phase 1 | Radar chart renders with minimum 5 farms in district (privacy threshold enforced) |
| REQ-017 Inventory | Phase 2 | Tally export CSV accepted by TallyPrime without error |
| REQ-018 IoT | Phase 2 | Environment sensor out-of-range alert fires within 30s of reading via Supabase Realtime |
| REQ-019 ERP Integration | Phase 2 | Zoho OAuth flow completes; batch P&L syncs as Zoho bill within 60s |
| REQ-020 Field Worker App | Phase 2 | Supervisor submits full daily log with ZERO network, 30s max entry time, syncs on reconnect |
| REQ-021 Traceability | Phase 2 | FSSAI PDF generated in < 5s client-side; QR code link resolves without login |
| REQ-022 Layer Farm | Phase 2 | Layer profile selection unlocks egg production log; NECC price shown in price hero |
| REQ-024 ML Enhancement | Phase 1 | District mortality aggregation feature added to model; MAPE improvement ≥ 0.5% vs baseline |
| REQ-025 Benchmarking | Phase 1 | Radar chart data matches manual calculation on test batch dataset |

---

*End of Requirements Addendum — PoultryPulse Dashboard Enhancement v1.0*  
*Merge into base Requirements document before Kiro initialization. New REQ IDs: REQ-013 through REQ-025.*
