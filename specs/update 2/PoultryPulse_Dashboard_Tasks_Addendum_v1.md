# PoultryPulse AI — Dashboard Tasks Addendum v1.0
**Document Type:** Task Specification Addendum — Navfarm Competitive Parity  
**Version:** Addendum 1.0 · May 2026  
**Extends:** PoultryPulse_Dashboard_Tasks_v1.md (TASK-001 through TASK-028)  
**Classification:** CONFIDENTIAL — Engineering Use  
**Kiro Note:** Merge into base Tasks document before Kiro initialization. New task IDs begin at TASK-029 to avoid collision. Phase 1 tasks (TASK-029–TASK-045) slot into Sprints 3–8 alongside existing tasks. Phase 2 tasks (TASK-046–TASK-066) form Sprints 9–16.

---

## Phase 1 Tasks — Operational Intelligence Inputs (Sprints 3–8)

These tasks deliver the Navfarm Bucket A features: operational data capture that makes PoultryPulse's price intelligence dramatically more precise. They run in parallel with the existing Sprint 3–8 tasks.

---

### TASK-029: `batches` Table, Schema & RLS Policies
**Requirement Refs:** REQ-013 §13.7, Design Addendum §11, DB Schema Addendum
**Sprint:** S3
**Estimate:** 1.5 days
**Assigned Role:** Backend
**Depends On:** None
**Status:** [x] Completed

#### Description
Create the full batch lifecycle database schema — the foundational table that all operational data (feed, mortality, health, costs) links to via FK.

#### Acceptance Criteria
- [ ] Migration `supabase/migrations/20260503_batches.sql` creates the `batches` table with all columns per DB Schema Addendum (REQ-013)
- [ ] `batch_id` auto-generation function: `[district_code]-[YYYYMM]-[3-digit-sequence]` implemented as a Supabase database function `generate_batch_id(district TEXT, placement_date DATE)`
- [ ] `batch_type` column includes all 4 types: `broiler | layer | breeder | hatchery` — Phase 1 only populates broiler/layer
- [ ] `status` column auto-updates via a database trigger based on `doc_placement_date` + `current_date` (placement 1–7, growing 8–28, pre_harvest 29–42, harvest_ready 43+)
- [ ] RLS policy: `customer_id = auth.uid()` — no batch data visible across customers
- [ ] S2 Integrator cross-account policy: integrators can SELECT batches where `integrator_id = auth.uid()` on sub-accounts
- [ ] Index on `customer_id`, `status`, `doc_placement_date` for efficient Batch Status Board queries
- [ ] Feed, mortality, vaccination, medication tables (from DB Schema Addendum) created in the same migration file
- [ ] All tables include `synced BOOLEAN DEFAULT true` column for offline mobile sync pattern
- [ ] Seed data: 3 sample batches per dev environment customer for testing

#### Technical Notes
- The `withdrawal_end_date` on `medication_logs` uses PostgreSQL `GENERATED ALWAYS AS` computed column — no application logic needed to compute this date
- The status trigger must fire on INSERT and UPDATE, not just INSERT — status changes as days pass without any user action

---

### TASK-030: Batch Registration Form & DOC Supplier Registry
**Requirement Refs:** REQ-013 §13.1, §13.4, Design Addendum §11.2  
**Sprint:** S3  
**Estimate:** 3 days  
**Assigned Role:** Frontend (Web + React Native)  
**Depends On:** TASK-029  
**Status:** [ ] Not Started

#### Description
Implement the batch registration wizard (mobile: 4-step; web: single-page form) and the DOC supplier registry with historical quality tracking.

#### Acceptance Criteria
- [ ] `BatchRegistrationForm.tsx` (web) renders as a single 2-column form with all required fields from REQ-013 §13.1
- [ ] Mobile: 4-step wizard with progress indicator (Design Addendum §11.2) — back/forward navigation, no data loss on back
- [ ] Breed dropdown pre-populates `target_harvest_weight_kg` from a static breed standards lookup table: Cobb 500 → 2.2kg, Ross 308 → 2.3kg, Vencobb → 2.0kg, Hubbard → 2.1kg
- [ ] DOC Supplier Registry: supplier names saved to `doc_suppliers` Supabase table per customer; autocomplete on supplier field from saved list
- [ ] After registration: user navigated to new batch's Batch Detail Drawer with a success toast "GKP-202606-005 बनाया गया ✅"
- [ ] On successful batch creation: Batch ROI Optimizer (TASK-011) automatically pre-populates flock_size from new batch — no manual re-entry
- [ ] DOC Supplier quality rating (1–5 stars): appears in supplier dropdown history as `[Supplier Name] ★★★★☆ (last 3 batches avg)`
- [ ] Works offline (React Native): form submission queued in expo-sqlite, sync on reconnect
- [ ] Playwright test (web): register batch → verify it appears in Batch Status Board in "Placement" column

#### Technical Notes
- The breed standards lookup table is a static JSON file (`src/lib/breedStandards.json`) — not a DB table. It includes FCR benchmarks by age, standard weight by age, and standard mortality curves.
- Batch ID generation calls `generate_batch_id()` Postgres function on form submission, not on client

---

### TASK-031: Batch Status Board (Kanban View)
**Requirement Refs:** REQ-013 §13.2, §13.5, Design Addendum §11.1  
**Sprint:** S3  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-029, TASK-030  
**Status:** [x] Completed

#### Description
Implement the Kanban-style batch status board — the primary operational view for farm operators and integrators to see all active batches at a glance.

#### Acceptance Criteria
- [x] `BatchStatusBoard.tsx` renders 5 columns: Placement / Growing / Pre-Harvest / Harvest Ready / Harvested
- [x] Batches auto-sorted into columns based on `status` field (computed by DB trigger from TASK-029)
- [x] Each `BatchCard` renders: Batch ID, shed, age in days, bird count, latest avg weight (from weight_logs), FCR (from feed_logs), sell signal badge, mortality % badge
- [x] Sell signal badge uses live price data from `DashboardSummary` (TASK-003) — NOT a separate API call
- [x] Withdrawal period override: if `medication_logs` shows an active withdrawal, badge displays "🚫 HOLD — Withdrawal" in grey regardless of price signal
- [x] Click batch card → opens `BatchDetailDrawer` (Design Addendum §11.3) sliding from right, 480px desktop / full-screen mobile
- [x] Multi-Shed Performance Grid (S2 integrators): table view toggle showing all batches × metrics with color-coded cells (Design Addendum §11.1)
- [x] `+ नया बैच` button in header opens `BatchRegistrationForm`
- [x] Board loads with skeleton loading state; cached data shown within 300ms of navigation
- [x] Harvested batches move to archive after 7 days (hidden from board, accessible via filter)
- [x] Playwright test: 3 batches in different statuses render in correct columns

---

### TASK-032: Daily Feed Log & FCR Calculator
**Requirement Refs:** REQ-014 §14.1–14.3, §14.7, Design Addendum §12.1  
**Sprint:** S4  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-029, TASK-030  
**Status:** [x] Completed

#### Description
Implement daily feed log entry, live FCR calculation, the FCR trend chart, and the feed-water ratio deviation alert. The FCR calculator replaces the hardcoded FCR=2.2 constant in TASK-011.

#### Acceptance Criteria
- [x] `DailyFeedLogForm.tsx` (mobile + web): date, batch selector, morning feed kg, evening feed kg, water litres, feed brand, feed refusal kg — all fields per REQ-014 §14.1
- [x] Mobile form completable in < 60 seconds (large numeric inputs, minimal navigation)
- [x] `fcrCalculator.ts` pure TypeScript function: `calculateFCR(totalFeedKg, totalWeightGainKg): number` — unit tested with breed-standard inputs
- [x] FCR Gauge renders (Design Addendum §12.1) with color coding: green < 1.7 (Cobb 500 day 35 standard), amber 1.7–2.0, red > 2.0
- [x] FCR Trend Chart: actual FCR vs breed-standard reference line, last 42 days, shaded divergence region
- [x] **Feed-Water Deviation Alert**: when `water_litres / total_feed_kg < 1.8` or `> 3.5`, writes alert to `alerts` table with type `feed_water_deviation` — appears in Alert Intelligence Center (TASK-014) within 60 seconds
- [x] FCR value from latest `feed_logs` automatically replaces hardcoded `FCR = 2.2` in TASK-011 Batch ROI Optimizer computation
- [x] Daily Feed Log works offline (expo-sqlite), syncs on reconnect — `synced` flag pattern
- [x] Unit test: feed-water ratio alert fires correctly for ratio 1.6 (too low) and ratio 3.8 (too high), not for 2.2 (normal)

#### Technical Notes
- FCR computation: `total_feed_consumed / total_weight_gain`. `total_weight_gain` = `(latest_avg_weight - DOC_weight) × current_bird_count`. DOC weight standard: 42g for Cobb 500.
- The feed-water alert logic runs as a Supabase Edge Function triggered by INSERT on `feed_logs` table — not in the frontend, to ensure alerts fire even from mobile submissions.

---

### TASK-033: Feed Allocation Recommendation Engine
**Requirement Refs:** REQ-014 §14.5, §14.6, Design Addendum §12.1  
**Sprint:** S4  
**Estimate:** 1.5 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-032  
**Status:** [x] Completed

#### Description
Implement the daily feed allocation recommendation card and FCR-based feed quantity planner.

#### Acceptance Criteria
- [ ] `FeedAllocationCard.tsx` renders on Batch Detail Drawer → Feed tab, and as a widget on mobile Home screen (below existing widgets)
- [ ] Recommendation computed from: `target_weight_gain_per_bird × flock_size × recommended_FCR_for_age` using breed standards lookup
- [ ] Output: total feed in kg, split morning/evening, formatted in Hindi as Design Addendum §12.1
- [ ] User can override recommended quantity — variance logged with reason code
- [ ] FCR Forecasting (REQ-014 §14.7): simple linear regression on user's own feed_logs + weight_logs, forecasts FCR at harvest
- [ ] Forecast FCR displayed as a projection on the FCR Trend Chart with a dashed line beyond current date
- [ ] Multi-Farm FCR Comparison (S2): bar chart of all active batches ranked by FCR, red highlight for batches > breed standard + 10%
- [ ] Unit test: recommendation correct for day 35 Cobb 500, 25,000 birds, FCR standard 1.9 at that age

---

### TASK-034: Vaccination Schedule Manager
**Requirement Refs:** REQ-015 §15.1, Design Addendum §13.1  
**Sprint:** S4  
**Estimate:** 2.5 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-029  
**Status:** [ ] Not Started

#### Description
Implement the vaccination schedule manager with pre-loaded UP broiler protocol, calendar view, reminders, and vaccination log entry.

#### Acceptance Criteria
- [ ] On batch registration (TASK-030), vaccination schedules are auto-created from the breed standard protocol:
  - Day 1: Marek's (injection, if not in-ovo)
  - Day 7: Newcastle La Sota (drinking water)
  - Day 14: IBD/Gumboro (drinking water)
  - Day 21: IB Spray (spray)
  - Day 28: Newcastle clone 30 booster (drinking water)
  - Schedule stored in `vaccination_schedules` table
- [ ] `VaccinationCalendar.tsx` renders monthly calendar with vaccination day markers (Design Addendum §13.1)
- [ ] Clicking a vaccination day opens a vaccination detail modal: scheduled vaccine info + log completion form
- [ ] Vaccination completion form: administered date, vaccine brand, batch number, dose per bird, route, administered by
- [ ] WhatsApp reminder sent 24h before each scheduled vaccination via Twilio (same pattern as existing alerts in TASK-014)
- [ ] Push notification reminder sent 6h before scheduled vaccination
- [ ] Overdue vaccination (not logged within 2 days of scheduled date) → amber alert in Alert Intelligence Center: type `vaccination_overdue`
- [ ] Custom protocol: user can add, edit, or remove scheduled vaccinations from the default protocol
- [ ] Playwright test: create batch → verify 5 vaccination schedule rows created in DB → verify first reminder fires at correct time

---

### TASK-035: Medication Log & Withdrawal Period Enforcement
**Requirement Refs:** REQ-015 §15.2, §15.6, Design Addendum §13.3  
**Sprint:** S4  
**Estimate:** 2 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-029, TASK-034  
**Status:** [x] Completed

#### Description
Implement medication and treatment record logging with automatic withdrawal period tracking that overrides the sell signal across all surfaces.

#### Acceptance Criteria
- [ ] `MedicationLog.tsx` form: date, batch, symptom dropdown, diagnosis, drug name, dose, route, duration_days, withdrawal_days, administered by
- [ ] `withdrawal_end_date` auto-computed by DB generated column (TASK-029) — no frontend calculation
- [ ] When `withdrawal_end_date >= today`: sell signal badge on ALL surfaces (Batch Card, Price Hero, WhatsApp message) replaced with "🚫 HOLD — Withdrawal" grey badge (Design Addendum §13.3)
- [ ] Withdrawal override implemented at the Sell Signal computation layer in the `GET /api/v2/dashboard/summary` endpoint (TASK-003) — not UI-only. The API itself returns `signal: 'withdrawal'` when active
- [ ] Withdrawal end alert: 24h before withdrawal period ends → push + WhatsApp: "✅ कल से बेच सकते हैं — withdrawal खत्म होने वाला है"
- [ ] Playwright test: log medication with 7-day withdrawal → verify price hero shows withdrawal badge → verify API response has `signal: 'withdrawal'` → advance mock date past withdrawal end → verify sell signal resumes
- [ ] Antibiotic-Free flag: when drug_name is in the `antibiotics_list` static lookup, set `is_antibiotic = true` on the log entry → triggers AB-Free badge withdrawal on batch card

#### Technical Notes
- `antibiotics_list` is a static JSON file (`src/lib/antibioticsList.json`) with ~30 common poultry antibiotics. Admin-updatable via Supabase admin table.
- The withdrawal override in the API endpoint checks: `SELECT 1 FROM medication_logs WHERE batch_id = $1 AND withdrawal_end_date >= CURRENT_DATE LIMIT 1`

---

### TASK-036: Daily Health Checklist (Mobile-First)
**Requirement Refs:** REQ-015 §15.3, §15.5, Design Addendum §13  
**Sprint:** S5  
**Estimate:** 2.5 days  
**Assigned Role:** Frontend (React Native primary, web secondary)  
**Depends On:** TASK-029, TASK-034  
**Status:** [ ] Not Started

#### Description
Implement the daily health checklist as a fast mobile-native experience. Includes the critical health-to-price intelligence integration where local symptoms + HPAI zone triggers an escalated alert.

#### Acceptance Criteria
- [ ] `DailyHealthChecklist.tsx` (mobile): 6 fields, tap-based response (no keyboard for standard fields)
- [ ] Submission completable in < 45 seconds from opening to submit
- [ ] Each field uses visual tap-buttons: Normal (green) / Abnormal Option 1 (amber/red) / Abnormal Option 2 (red)
- [ ] Missing checklist alert: if no checklist submitted by 10:00 AM IST → push notification to farm owner + alert type `supervisor_checklist_missing` (if supervisor assigned)
- [ ] **Health-to-Price Intelligence Integration** (REQ-015 §15.5): Supabase Edge Function triggers on health checklist INSERT → if `respiratory != 'normal'` AND `alerts` table has active HPAI alert within 200km → escalate HPAI alert severity to `critical` for this customer → push notification fires immediately
- [ ] Escalated alert card shows: "⚠ आपके झुंड में लक्षण + पास में बर्ड फ्लू — तुरंत डॉक्टर को बुलाएं" (Design Addendum §13 alert card)
- [ ] Health checklist history: last 14 days displayed as a color-coded grid (green = all normal, amber = some abnormal, red = critical) in Batch Detail Drawer → Health tab
- [ ] Works offline (expo-sqlite), sync on reconnect
- [ ] Unit test for edge function: mock checklist with respiratory=coughing + mock active HPAI alert 150km away → verify alert escalation fires

---

### TASK-037: Biosecurity Audit Form & Score Tracker
**Requirement Refs:** REQ-015 §15.4, Design Addendum §13.2  
**Sprint:** S5  
**Estimate:** 2 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-029  
**Status:** [x] Completed

#### Description
Implement the fortnightly biosecurity audit form with scoring, trend tracking, and dashboard integration.

#### Acceptance Criteria
- [x] `BiosecurityAuditForm.tsx`: 12-item checklist, each item has Yes (1.0) / Partial (0.5) / No (0.0) response
- [x] Score computed live as items are tapped: weighted sum → score out of 100 shown in real time
- [x] Score gauge (D3 arc, same pattern as TASK-015 Middleman Check gauge) renders with 4 color zones (Design Addendum §13.2)
- [x] Score < 60 → amber alert on Command Center dashboard badge. Score < 40 → red alert type `biosecurity_score_low` in Alert Intelligence Center
- [x] Historical trend chart: last 8 audit scores as a line chart in Batch Detail Drawer → Health tab
- [x] Fortnightly reminder: Supabase CRON job sends WhatsApp + push reminder if no audit submitted in 14 days
- [x] 12 default audit items hardcoded in `src/lib/biosecurityAuditItems.ts` (visitor log, vehicle entry, footbath, feed store hygiene, dead bird disposal, equipment sanitation, rodent control, flock isolation, worker PPE, vaccination records up to date, sick bird isolation protocol, biosecurity training up to date)

---

### TASK-038: Daily Mortality Log & Abnormal Alert
**Requirement Refs:** REQ-016 §16.1–16.3, Design Addendum §14.1–14.2
**Sprint:** S5
**Estimate:** 2 days
**Assigned Role:** Full-Stack
**Depends On:** TASK-029
**Status:** [x] Completed

#### Description
Implement the daily mortality entry form (30-second target), cumulative mortality dashboard, and abnormal mortality alert detection.

#### Acceptance Criteria
- [x] `DailyMortalityForm.tsx` (mobile): stepper input (large +/- buttons, no keyboard), cause dropdown, optional photo — completable in < 30 seconds
- [x] Mortality dashboard: birds placed vs alive counter, cumulative rate %, daily trend chart with breed-standard reference line, cause breakdown chart (Design Addendum §14.2)
- [x] Color coding: green (< 0.3%/day), amber (0.3–0.5%/day), red (> 0.5%/day)
- [x] Survivor count auto-decremented on each mortality log entry: `UPDATE batches SET current_bird_count = current_bird_count - $count WHERE id = $batch_id`
- [x] **Abnormal Mortality Alert**: Supabase Edge Function on `mortality_logs` INSERT: if `today_count > 3 × 7day_rolling_avg` → write alert type `abnormal_mortality` to `alerts` table → Supabase Realtime delivers to dashboard within 60 seconds
- [x] Alert card shows financial impact: `count × avg_weight × P50_price` as estimated loss
- [x] Photo attachments uploaded to Supabase Storage bucket `mortality-photos`, URL stored in `mortality_logs.photo_url`
- [x] Works offline (expo-sqlite), syncs on reconnect
- [x] Unit test: rolling average calculation correct for edge cases (first 7 days with < 7 data points)

#### Technical Notes
```typescript
// Abnormal mortality detection
const isAbnormal = (todayCount: number, last7Days: number[]): boolean => {
  if (last7Days.length < 3) return todayCount > 50; // fallback for new batches
  const rollingAvg = last7Days.reduce((a, b) => a + b, 0) / last7Days.length;
  return todayCount > (rollingAvg * 3);
};
```

---

### TASK-039: Weight Gain Tracking & Performance Benchmarking
**Requirement Refs:** REQ-016 §16.4–16.6, §16.9, Design Addendum §14.3  
**Sprint:** S5  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-029, TASK-038  
**Status:** [x] Completed

#### Description
Implement weekly weight gain logging (replacing hardcoded estimates), performance benchmarking radar chart, and the district-average aggregation that powers competitive benchmarking.

#### Acceptance Criteria
- [x] `WeightLogForm.tsx`: date, sample size (min 30 birds validation), avg weight kg, std deviation — all fields per REQ-016 §16.4
- [x] Weight gain chart: actual weekly weight vs breed-standard growth curve (Cobb/Ross table), deviation alerts when actual < 90% of standard
- [x] Weight deviation alert: Supabase Edge Function on `weight_logs` INSERT: if `actual_weight < 0.90 × breed_standard_weight_for_age` → write alert `weight_gain_deviation` to `alerts` table
- [x] **Actual weight replaces hardcoded estimate in Batch ROI Optimizer**: `roiCalculator.ts` checks `weight_logs` for latest entry; if found, uses it; if not, falls back to breed standard estimate (not hardcoded 0.06 kg/day gain)
- [x] `PerformanceBenchmarkChart.tsx` renders Recharts `RadarChart` with 5 axes (Design Addendum §14.3): this batch (blue), personal best (green), district average (grey dashed)
- [x] District average aggregation: new Supabase Edge Function runs nightly, computes anonymized district-level benchmarks from all customers; writes to `district_benchmarks` table
- [x] Privacy enforcement: district benchmark only shown if `COUNT(DISTINCT customer_id) >= 5` for that district (returns null otherwise, showing "Not enough data in your district yet")
- [x] Personalized weight gain model (REQ-016 §16.5): Ridge regression trained on user's last 5+ weight_logs batches; Python script in `ml/weight_predictor.py`; outputs stored in `customer_ml_models` Supabase table
- [x] Playwright test: log weight 90% of breed standard → verify `weight_gain_deviation` alert fires → verify alert appears in Alert Intelligence Center

---

### TASK-040: Mortality Pattern Detection (ML)
**Requirement Refs:** REQ-016 §16.7, REQ-024 §24.1
**Sprint:** S6
**Estimate:** 2 days
**Assigned Role:** ML
**Depends On:** TASK-038, TASK-039
**Status:** [x] Completed

#### Description
Implement the mortality pattern detection model that identifies likely cause patterns from mortality spike timing and provides an insight card with actionable recommendations.

#### Acceptance Criteria
- [x] `ml/mortality_pattern_detector.py` implements rule-based + simple ML detection:
  - Rules: spike on days 5–10 → DOC stress pattern; days 15–25 → IBD pattern; April–June spikes → heat stress pattern; sudden spike all causes → disease outbreak pattern
  - ML: logistic regression on mortality day, cause distribution, season, FCR trend → predicts most likely cause category
- [x] Pattern insight card renders below mortality dashboard chart: "इस पैटर्न से लगता है: [cause in Hindi]. सुझाव: [action in Hindi]"
- [x] Model runs when: (a) abnormal mortality alert fires, (b) batch is marked as Harvested (post-mortem analysis)
- [x] Model output stored in `mortality_patterns` table: `batch_id, detected_pattern, confidence, recommendation_hindi, recommendation_english`
- [x] Unit tests for all 4 rule-based patterns with representative day/cause data

---

### TASK-041: District Mortality Aggregation & ML Feature Pipeline
**Requirement Refs:** REQ-024 §24.1–24.2  
**Sprint:** S6  
**Estimate:** 2 days  
**Assigned Role:** ML + Backend  
**Depends On:** TASK-038  
**Status:** [x] Completed

#### Description
Implement the district-level mortality aggregation that creates the "supply shock signal" — the most defensible ML feature in PoultryPulse's model because it requires the customer base to generate it.

#### Acceptance Criteria
- [x] New Airflow DAG `dag_district_mortality_aggregation` runs daily at 23:00 IST
- [x] DAG query: `SELECT district, AVG(daily_mortality_rate) as avg_mortality_7d, STDDEV(daily_mortality_rate) as stddev FROM mortality_logs JOIN batches USING(batch_id) WHERE log_date >= CURRENT_DATE - 7 GROUP BY district HAVING COUNT(DISTINCT customer_id) >= 3`
- [x] Results written to `district_supply_signals` Supabase table: `district, date, avg_mortality_rate_7d, z_score_vs_30d_baseline, supply_signal` (high/normal/low)
- [x] New ML feature `district_cumulative_mortality_7d` added to the 45-feature matrix in `ml/feature_engineering.py`
- [x] Feature back-filled for historical training data using existing mortality_logs (for all customers who had logs)
- [ ] Champion model retrained with new feature set after 30 days of data collection; A/B tested against existing model (pending 30-day data collection)
- [ ] MAPE improvement target: ≥ 0.5% reduction vs baseline (measured over 30-day evaluation window) (pending model retraining)
- [x] Privacy audit: aggregation SQL confirmed to expose only district-level aggregates, no individual batch data

---

### TASK-042: Profitability Benchmarking Dashboard
**Requirement Refs:** REQ-025, Design Addendum §14.3
**Sprint:** S6
**Estimate:** 2 days
**Assigned Role:** Frontend
**Depends On:** TASK-039, TASK-041
**Status:** [x] Completed

#### Description
Implement the profitability benchmarking view — how does the user's batch compare to their own history, district average, and breed standard?

#### Acceptance Criteria
- [x] `PerformanceBenchmarkChart.tsx` renders 5-axis radar chart (FCR, Mortality%, AvgWeight, FeedCost/kg, NetProfit/bird) with 3 series overlaid
- [x] Data sources confirmed: this batch from live `batches`/`feed_logs`/`weight_logs`/`mortality_logs`; personal best from harvested batch archive; district average from `district_benchmarks` table
- [x] One-sentence AI insight card (Claude API call, cached 24h): "आपका FCR जिले के औसत से [X]% [बेहतर/कमज़ोर] है" with 2 specific actionable suggestions
- [x] **Input Cost Projection** (REQ-025 §25.3): running total visible on Batch Detail → Costs tab: actual costs to date + projected feed cost to harvest based on current FCR trajectory + commodity forecast
- [x] Profitability trend chart (REQ-025 §25.4): net profit per bird across last 10 batches, trend line, annotation if trending down
- [x] District average only shown when `count >= 5` (privacy threshold enforced client-side check on `district_benchmarks.sample_size`)

---

### TASK-043: Batch Detail Drawer — Full Implementation
**Requirement Refs:** REQ-013 §13.2, Design Addendum §11.3  
**Sprint:** S6  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-031, TASK-032, TASK-034, TASK-035, TASK-036, TASK-038, TASK-039  
**Status:** [x] Completed

#### Description
Implement the complete Batch Detail Drawer with all 5 tabs fully wired to their respective data sources. This is the consolidation task that brings all batch-related components together.

#### Acceptance Criteria
- [ ] `BatchDetailDrawer.tsx` renders as a right-side drawer (480px desktop, full-screen mobile) with 5 tabs: Overview / Feed / Health / Mortality / Costs
- [ ] **Overview tab**: performance radar chart (TASK-042), current KPIs (weight, FCR, mortality%, sell signal, days to harvest), sell signal badge with withdrawal override, "Open ROI Optimizer" action, "View Traceability" action
- [ ] **Feed tab**: FCR gauge + trend chart (TASK-032), daily feed log history, feed allocation recommendation (TASK-033), FCR forecast line
- [ ] **Health tab**: vaccination calendar mini-view (TASK-034), next vaccination countdown, medication log entries (TASK-035), biosecurity score gauge (TASK-037), last 14-day health checklist grid (TASK-036)
- [ ] **Mortality tab**: cumulative mortality dashboard (TASK-038), mortality pattern insight card (TASK-040), abnormal alert history
- [ ] **Costs tab**: running batch P&L (Design Addendum §16.2), input cost projection (TASK-042)
- [ ] "Mark as Harvested" button: opens a harvest confirmation modal collecting actual harvest weight, bird count sold, sale price, buyer name — writes to `batches` and moves card to Harvested column
- [ ] Drawer opens/closes with 220ms ease-out animation matching Design Spec §3.5 panel animation
- [ ] Drawer maintains scroll position per tab (React useRef scroll restoration)

---

### TASK-044: Update E2E Test Suite for Operational Features
**Requirement Refs:** TASK-027 extension  
**Sprint:** S7  
**Estimate:** 2.5 days  
**Assigned Role:** Full-Stack (QA)  
**Depends On:** TASK-029 through TASK-043  
**Status:** [x] Completed

#### Description
Extend the Playwright E2E test suite to cover all Phase 1 operational features.

#### Acceptance Criteria
- [x] `tests/e2e/batchLifecycle.spec.ts`: register batch → appears in Placement column → logs feed → FCR updates → logs mortality → alert fires → mark as harvested → moves to Harvested column
- [x] `tests/e2e/withdrawalEnforcement.spec.ts`: log antibiotic medication → verify sell signal changes to withdrawal on price hero, batch card, and API response → advance date past withdrawal end → verify sell signal resumes
- [x] `tests/e2e/healthIntelligence.spec.ts`: submit checklist with respiratory symptoms → mock active HPAI alert → verify escalated critical alert appears in Alert Intelligence Center
- [x] `tests/e2e/abnormalMortality.spec.ts`: log mortality 3× rolling average → verify alert fires within 5 seconds → verify alert card shows financial impact
- [x] `tests/e2e/fcr.spec.ts`: log feed data → verify FCR gauge color correct → verify batch ROI optimizer auto-uses actual FCR not hardcoded 2.2
- [x] `tests/e2e/offline.spec.ts` extended: submit feed log offline → verify `synced=false` in DB → restore network → verify `synced=true` within 30 seconds
- [x] All 6 new test files pass in CI on every PR to main

---

### TASK-045: Supervisor Role & Team Management
**Requirement Refs:** REQ-020 §20.1, §20.5  
**Sprint:** S7  
**Estimate:** 2 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-029, TASK-036, TASK-038, TASK-032  
**Status:** [x] Completed

#### Description
Implement the supervisor role creation flow, shed assignment, and the farm owner's team management dashboard. Supervisor sees a simplified 3-tab app. Farm owner sees submission history.

#### Acceptance Criteria
- [x] New user role `supervisor` in Supabase `auth.users.user_metadata.role`
- [x] Farm owner (S1) can create supervisor accounts from Settings → Team: enter phone number → OTP sent → supervisor creates account → assigned sheds
- [x] Supervisor's mobile app renders 3-tab structure (Design Addendum §15.1): Today's Work / My Reports / Account — Price forecast tab hidden
- [x] "Today's Work" screen shows checklist of assigned daily tasks with completion status (Design Addendum §15.2)
- [x] Sync status bar shows offline status and pending record count (Design Addendum §15.2)
- [x] Farm owner "Team" page shows supervisor submission history: calendar heatmap of checklist submissions per supervisor, missing days highlighted red
- [x] Missing checklist alert fires to farm owner at 10:00 AM IST via push notification if no submission received from that day (Supabase CRON job)
- [x] Supervisor CANNOT view: price forecasts, batch P&L, customer subscription details, other supervisors' data

---

## Phase 2 Tasks — Farm Operations Management (Sprints 9–16)

### TASK-046: Inventory Management Core (Feed, Medicine, Vaccine)
**Requirement Refs:** REQ-017 §17.1, §17.4, Design Addendum §16.1  
**Sprint:** S9  
**Estimate:** 4 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-029, TASK-032, TASK-034, TASK-035  
**Status:** [x] Completed

#### Description
Implement the full inventory management system with stock tracking, automated consumption updates from feed/medication logs, and low-stock alerts.

#### Acceptance Criteria
- [x] `StockOverview.tsx` renders 3-category stock summary (Feed / Medicines / Vaccines) with progress bars and "days remaining" estimates (Design Addendum §16.1)
- [x] Feed stock auto-decremented when daily feed log submitted (Supabase Edge Function trigger on `feed_logs` INSERT)
- [x] Vaccine stock auto-decremented when vaccination log submitted (trigger on `vaccination_logs` INSERT)
- [x] Medicine stock auto-decremented when medication log submitted (trigger on `medication_logs` INSERT)
- [x] Low stock alert: when stock falls below `min_stock_alert` threshold → write `low_stock` alert to `alerts` table → appears in Alert Intelligence Center
- [x] Days-remaining estimate: `current_stock / (7day_avg_consumption_per_day)` with "Lasts ~N days" display
- [x] QR Code generation: farm owner can generate and print QR codes for saved inventory items (using `qrcode` npm library → `@react-pdf/renderer` PDF)

---

### TASK-047: Purchase Orders & Vendor Management
**Requirement Refs:** REQ-017 §17.2, §17.5  
**Sprint:** S9  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-046  
**Status:** [x] Completed

#### Description
Implement vendor registry, purchase order creation and tracking, GRN receipt, and Tally-compatible CSV export.

#### Acceptance Criteria
- [x] `PurchaseOrderForm.tsx`: vendor selector, line items (item, quantity, negotiated price), expected delivery date, notes
- [x] PO status workflow: Created → Sent → Delivered → Invoiced → Paid (status buttons on PO detail view)
- [x] GRN (Goods Receipt Note): when PO is marked Delivered, GRN form opens to confirm actual received quantity vs ordered — variance flagged with amber highlight if > 5%
- [x] On GRN submission: inventory levels automatically increased for received items
- [x] Tally XML export: one-click from PO list; generates TallyPrime-compatible XML of all paid invoices for the month
- [ ] Zoho Books webhook (Phase 2 stretch): when PO is marked Paid → POST to registered Zoho webhook endpoint

---

### TASK-048: Full Batch P&L & Costing Engine
**Requirement Refs:** REQ-017 §17.3, §17.7, Design Addendum §16.2  
**Sprint:** S9  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-046, TASK-047  
**Status:** [x] Completed

#### Description
Implement the complete batch P&L view that auto-aggregates all cost categories and displays the real-time profitability position.

#### Acceptance Criteria
- [ ] `BatchPnL.tsx` renders all cost categories with auto-populated values (Design Addendum §16.2)
- [ ] DOC cost: auto-populated from batch registration (DOC count × supplier price, if entered)
- [ ] Feed cost: auto-aggregated from `inventory_movements` where `batch_id = $batch_id AND category = 'feed'`
- [ ] Medicine/vaccine cost: aggregated from `inventory_movements` where `category IN ('medicine', 'vaccine')`
- [ ] Revenue: auto-computed from harvest record (bird count × avg weight × sale price)
- [ ] Net profit, net profit per bird, net profit per kg — all three KPIs with color coding
- [ ] "Wait N days" suggestion link when current-day net profit is negative but ROI Optimizer shows positive result in N days (Design Addendum §16.2 narrative)
- [ ] All P&L entries immutable in DB (REQ-017 §17.6) — corrections via adjustment entries only

---

### TASK-049: IoT Device Registry & Environment Sensor Dashboard
**Requirement Refs:** REQ-018 §18.1–18.4, Design Addendum §17.1  
**Sprint:** S10  
**Estimate:** 4 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-029  
**Status:** [x] Completed

#### Description
Implement IoT device registration, the `POST /api/v1/iot/reading` ingestion endpoint, and the shed environment real-time dashboard.

#### Acceptance Criteria
- [x] `DeviceRegistry.tsx`: add/edit/remove IoT devices with type, manufacturer, model, shed assignment
- [x] `POST /api/v1/iot/reading` endpoint: API-key authenticated (device uses its own API key, not customer JWT); writes to `iot_readings` table; responds < 100ms
- [x] `ShedEnvironmentPanel.tsx` renders real-time temperature, humidity, ammonia with safe-range progress bars (Design Addendum §17.1)
- [x] Supabase Realtime subscription on `iot_readings` updates the environment panel within 5 seconds of a new reading
- [x] IoT out-of-range alert: Edge Function on `iot_readings` INSERT checks against safe ranges; writes `iot_environment` alert to `alerts` table when range exceeded
- [x] 24-hour trend chart for each metric (Design Addendum §17.1) using windowed rendering for 15-minute resolution data
- [x] Device offline detection: if no reading received in 2× the device's expected reporting interval → `device_offline` alert fires
- [x] `iot_readings` table partitioned by month (TASK-029 migration extension)

---

### TASK-050: QR Code Inventory Scan (Supervisor App)
**Requirement Refs:** REQ-020 §20.4, Design Addendum §15.3  
**Sprint:** S10  
**Estimate:** 2 days  
**Assigned Role:** Frontend (React Native)  
**Depends On:** TASK-046, TASK-045  
**Status:** [x] Completed

#### Description
Implement QR code scanning for inventory consumption in the supervisor app.

#### Acceptance Criteria
- [ ] Camera permission flow using `expo-camera` — request on first scan with a clear explanation
- [ ] QR code on scan resolves to inventory item ID from `inventory_items` table (QR encodes `item_id`)
- [ ] After scan: item name pre-fills, user enters quantity consumed → submits → `inventory_movements` record created
- [ ] Works offline: consumption entry queued in expo-sqlite, item identity resolved from locally cached inventory list
- [ ] Fallback: "QR पढ़ नहीं हुआ" → manual dropdown selection of item

---

### TASK-051: Layer Farm Profile & Egg Production Dashboard
**Requirement Refs:** REQ-022, Design Addendum §19.1  
**Sprint:** S10  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-029  
**Status:** [ ] Not Started

#### Description
Implement the Layer farm type — fulfilling the "Coming Soon" promise in the existing onboarding flow. Includes daily egg production logging, HDP tracking, and the NECC price hero variant.

#### Acceptance Criteria
- [ ] Farm profile `poultry_type = 'layer'` selection unlocks the Layer module across all screens
- [ ] `EggProductionLogForm.tsx`: date, flock age (auto from DOC), total eggs, broken, floor eggs — HDP computed live
- [ ] `EggProductionDashboard.tsx`: HDP gauge, 30-day production chart vs breed standard curve, feed vs egg correlation chart (Design Addendum §19.1)
- [ ] Price hero widget (REQ-001) shows NECC egg price for layer farms — `DashboardSummary.priceHero.type = 'egg'` discriminator added to API response
- [ ] Middleman Check tool adapts: benchmark shown is NECC zone egg price (₹/egg), not AGMARKNET broiler price
- [ ] Yield forecasting (REQ-022 §22.4): polynomial regression model in `ml/layer_yield_forecaster.py` generates 30-day HDP forecast; displayed as chart with confidence bands
- [ ] Egg grading log: Large/Medium/Small/Cracked counts per day entry
- [ ] Batch registration for layers uses a different step 2 (breed = Lohmann Brown / HH-260 / BV-300 / Other; production peak age pre-filled)

---

### TASK-052: Batch Traceability Report & FSSAI PDF
**Requirement Refs:** REQ-021 §21.1–21.3, §21.6, Design Addendum §18.1  
**Sprint:** S11  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-043, TASK-034, TASK-035, TASK-046  
**Status:** [x] Completed

#### Description
Implement the one-click FSSAI traceability report PDF generation and the public buyer verification portal.

#### Acceptance Criteria
- [x] `traceabilityReportGenerator.ts` assembles all batch data (DOC, feed, vaccinations, medications, mortality summary, harvest) into a structured report object
- [x] `@react-pdf/renderer` generates the branded PDF per Design Addendum §18.1 layout — client-side, < 5 seconds for a complete batch
- [x] PDF includes QR code linking to `poulse.ai/trace/[batch_id]` (static public URL)
- [x] "View Traceability" button appears on Batch Detail Drawer → Overview tab for all Harvested batches
- [x] Public buyer portal `pages/trace/[batch_id].tsx`: static HTML page showing non-sensitive batch data (farm district, breed, key health events, harvest date, FSSAI status, AB-Free badge) — no login required
- [x] Public page served from Cloudflare CDN, accessible for 5 years after harvest date
- [x] AB-Free badge logic correct: green ✅ if no antibiotic medication logged; red 🚫 if any antibiotic logged
- [x] Playwright test: complete batch lifecycle → mark harvested → generate traceability PDF → verify QR code URL resolves to public page

---

### TASK-053: ERP Integration Hub — Tally & Zoho
**Requirement Refs:** REQ-019 §19.1–19.2, Design Addendum §  
**Sprint:** S11  
**Estimate:** 4 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-048  
**Status:** [x] Completed

#### Description
Implement the Tally XML export and Zoho Books OAuth integration. These are the two most-used accounting systems among PoultryPulse's Indian SMB target segment.

#### Acceptance Criteria
- [x] Tally export: generates TallyPrime-compatible XML from batch P&L data with correct voucher types (Purchase voucher for costs, Sales voucher for revenue)
- [x] Tally field mapping hardcoded in `src/lib/tallyExporter.ts`: PoultryPulse `batch_cost` → Tally `stock_item` + `purchase_voucher`; `batch_revenue` → Tally `sales_voucher`
- [x] Zoho Books OAuth 2.0 flow: Settings → Integrations → Connect Zoho → OAuth redirect → token stored in `customer_integrations` table (encrypted)
- [x] Zoho sync: after batch is marked Harvested, Zoho API creates an Invoice for the sale and Bills for feed/medicine costs
- [x] Integration Hub dashboard (Admin view): all customer integrations, last sync status, error log
- [x] "Test Connection" button verifies OAuth token validity and Supabase → Zoho connectivity
- [x] Integration failures do not block core app — handled by background job queue (Supabase Edge Function + retry logic)

---

### TASK-054: Enterprise ERP Webhook & API Enhancement
**Requirement Refs:** REQ-019 §19.3–19.5  
**Sprint:** S12  
**Estimate:** 3 days  
**Assigned Role:** Backend  
**Depends On:** TASK-019  
**Status:** [ ] Not Started

#### Description
Extend the enterprise API with ERP-consumable batch endpoints and implement the outbound webhook system for custom ERP integrations.

#### Acceptance Criteria
- [ ] `GET /api/v2/enterprise/batch/erp` endpoint returns: batch lifecycle data in ERP-friendly flat JSON (no nested objects); date fields in ISO 8601; prices in INR as strings to avoid float precision issues
- [ ] XML response format available via `Accept: application/xml` header (using `fast-xml-parser` library)
- [ ] Webhook registry: `POST /api/v1/webhooks` creates a webhook subscription with URL, events list, and HMAC secret
- [ ] Webhook delivery: Supabase Edge Function fires on batch/forecast/alert events; sends HMAC-signed POST to registered URL
- [ ] Retry logic: 3 retries with exponential backoff (1min, 5min, 15min); failed deliveries logged to `webhook_delivery_log` table
- [ ] Webhook dashboard in Integration Hub: last 20 delivery attempts per webhook with status codes and response times

---

### TASK-055: Field Worker App — Full Offline Data Capture
**Requirement Refs:** REQ-020 §20.2–20.3, Design Addendum §15.1–15.3  
**Sprint:** S12  
**Estimate:** 4 days  
**Assigned Role:** Frontend (React Native)  
**Depends On:** TASK-045, TASK-036, TASK-038, TASK-032, TASK-050  
**Status:** [x] Completed

#### Description
Complete the supervisor field worker app with the full daily data entry flow, offline queue management, and Bhojpuri/regional language support.

#### Acceptance Criteria
- [ ] Full offline capability: all 6 daily data entry tasks completable with zero network connectivity
- [ ] Offline queue manager: counts pending records, shows oldest pending timestamp, triggers sync automatically on network restoration
- [ ] Sync conflict resolution: last-write-wins by `created_at` timestamp; conflicts logged to `sync_conflicts` table for admin review
- [ ] Regional language support: Bhojpuri labels added for all field worker UI strings (translations stored in `src/i18n/bhojpuri.json`)
- [ ] App performance: Today's Work screen renders from cache in < 1 second on cold start

---

### TASK-056: HACCP Compliance Module
**Requirement Refs:** REQ-021 §21.4  
**Sprint:** S13  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-052  
**Status:** [x] Completed

#### Description
Implement the HACCP audit workflow for processors and exporters (S5 Enterprise tier).

#### Acceptance Criteria
- [x] HACCP checklist: 8 Critical Control Points (CCPs) for broiler processing: live bird receiving, slaughter, evisceration, chilling, cutting, packaging, cold storage, dispatch
- [x] Each CCP has measurable limits (e.g., chilling temperature ≤ 4°C) and corrective action procedures
- [x] Deviation logging: when a CCP limit is breached, corrective action is recorded with timestamp and supervisor ID
- [x] HACCP audit PDF generation: complete CCP log for a processing run, suitable for FSSAI/export inspection
- [x] Visible only to `enterprise` and `admin` roles

---

### TASK-057: Updated Performance Audit — Phase 2 Features
**Requirement Refs:** TASK-028 extension  
**Sprint:** S14  
**Estimate:** 2 days  
**Assigned Role:** DevOps + Frontend  
**Depends On:** TASK-046 through TASK-056  
**Status:** [x] Completed

#### Description
Re-run Lighthouse CI and performance tests to ensure Phase 2 additions don't degrade the Core Web Vitals targets established in TASK-028.

#### Acceptance Criteria
- [x] All TASK-028 Lighthouse CI gates still passing after Phase 2 additions (LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1)
- [x] New routes benchmarked: `/dashboard/batches`, `/dashboard/feed`, `/dashboard/health`, `/dashboard/mortality`
- [x] IoT realtime subscription does not cause memory leaks — confirmed via 30-minute soak test in browser profiler
- [x] Mobile bundle size still ≤ 2.5MB after new expo-sqlite, expo-camera dependencies
- [x] `POST /api/v1/iot/reading` P95 ≤ 100ms under load (100 concurrent device reads/second) — Artillery.io load test

---

## Task Dependency Graph — Addendum

```
TASK-029 (batches DB) [S3]
   ├── TASK-030 (batch registration) [S3]
   │      └── TASK-031 (status board) [S3]
   │             └── TASK-043 (batch detail drawer) [S6]
   ├── TASK-032 (feed log + FCR) [S4]
   │      └── TASK-033 (feed allocation) [S4]
   ├── TASK-034 (vaccination schedule) [S4]
   │      └── TASK-035 (medication + withdrawal) [S4]
   ├── TASK-036 (health checklist) [S5]
   ├── TASK-037 (biosecurity audit) [S5]
   ├── TASK-038 (mortality log) [S5]
   │      └── TASK-040 (mortality pattern ML) [S6]
   │      └── TASK-041 (district aggregation ML) [S6]
   └── TASK-039 (weight gain + benchmarking) [S5]
          └── TASK-042 (profitability benchmarking) [S6]

TASK-043 (drawer) ← All TASK-032 through TASK-042
TASK-044 (E2E tests) ← All Phase 1 tasks
TASK-045 (supervisor role) [S7] ← TASK-029, TASK-036, TASK-038

PHASE 2:
TASK-046 (inventory) ← TASK-029, TASK-032, TASK-034, TASK-035
TASK-047 (purchase orders) ← TASK-046
TASK-048 (batch P&L) ← TASK-046, TASK-047
TASK-049 (IoT) ← TASK-029
TASK-050 (QR scan) ← TASK-046, TASK-045
TASK-051 (layer farm) ← TASK-029
TASK-052 (traceability) ← TASK-043, TASK-034, TASK-035, TASK-046
TASK-053 (Tally + Zoho) ← TASK-048
TASK-054 (ERP webhook) ← TASK-019
TASK-055 (field worker full) ← TASK-045, all entry tasks
TASK-056 (HACCP) ← TASK-052
TASK-057 (perf audit phase 2) ← all Phase 2
```

---

## Updated Total Task Count

| Phase | Sprint Range | Task Range | Count | Scope |
|---|---|---|---|---|
| Phase 1 (base) | S1–S8 | TASK-001–028 | 28 tasks | Price intelligence + alerts + API + onboarding |
| Phase 1 (addendum) | S3–S8 (parallel) | TASK-029–045 | 17 tasks | Operational intelligence inputs from Navfarm Bucket A |
| Phase 2 (addendum) | S9–S14 | TASK-046–057 | 12 tasks | Farm ops management from Navfarm Buckets B & C |
| **Total** | **S1–S14** | **TASK-001–057** | **57 tasks** | **Full competitive parity with Navfarm + PoultryPulse moat** |

---

## Navfarm Feature Coverage — Final Reconciliation

| Navfarm Feature | Coverage Status | Task(s) |
|---|---|---|
| Batch-wise bird placement | ✅ Fully covered | TASK-029, TASK-030 |
| DOC tracking & supplier integration | ✅ Fully covered | TASK-029, TASK-030 |
| Real-time performance dashboards | ✅ Fully covered | TASK-031, TASK-043 |
| Multi-farm, multi-shed visibility | ✅ Fully covered | TASK-031 (multi-shed grid) |
| Daily feed allocation planner | ✅ Fully covered | TASK-033 |
| FCR analytics | ✅ Fully covered | TASK-032 |
| Feed mill integration | 🔶 Phase 2 partial (Phase 1: manual entry) | TASK-047 |
| Feed-water ratio deviation alerts | ✅ Fully covered | TASK-032 |
| Vaccination scheduling and logs | ✅ Fully covered | TASK-034 |
| Medication and treatment records | ✅ Fully covered | TASK-035 |
| Daily health checklists | ✅ Fully covered | TASK-036 |
| Biosecurity audit workflows | ✅ Fully covered | TASK-037 |
| Daily mortality tracking (causes/age) | ✅ Fully covered | TASK-038 |
| Weight gain tracking & trend analysis | ✅ Fully covered | TASK-039 |
| Automatic alerts for abnormal losses | ✅ Fully covered | TASK-038 |
| Performance benchmarking per farm/breed | ✅ Fully covered | TASK-039, TASK-042 |
| Layer farm production tracking | ✅ Fully covered | TASK-051 |
| Egg grading, packing & dispatch | ✅ Covered | TASK-051 |
| Yield forecasting 7–30 days (layer) | ✅ Covered | TASK-051 |
| Hatchery & Breeder Module | 📋 Phase 3 roadmap | REQ-023 (schema reserved) |
| Feed, medicine, vaccine inventory | ✅ Fully covered | TASK-046 |
| Automated consumption updates | ✅ Fully covered | TASK-046 |
| Vendor management and purchase orders | ✅ Fully covered | TASK-047 |
| Batch-wise operational costing | ✅ Fully covered | TASK-048 |
| Auto-weighing scales (IoT) | ✅ Covered | TASK-049 |
| Smart water meters (IoT) | ✅ Covered | TASK-049 |
| Environment sensors temp/humidity/ammonia | ✅ Covered | TASK-049 |
| RFID bird tracking | 📋 Phase 3 (schema reserved) | REQ-018 §18.6 |
| Climate controllers (IoT) | 📋 Phase 2 stretch | REQ-018 §18.5 |
| Smart feed silos | ✅ Device type registered | TASK-049 |
| Microsoft Dynamics / SAP / Oracle | ✅ Via webhook + REST API | TASK-054 |
| Tally / Zoho integration | ✅ Fully covered | TASK-053 |
| Field Worker App (offline first) | ✅ Fully covered | TASK-045, TASK-055 |
| Scan-based inventory usage | ✅ Fully covered | TASK-050 |
| FCR forecasting (ML) | ✅ Fully covered | TASK-032, TASK-033 |
| Mortality pattern detection (ML) | ✅ Fully covered | TASK-040 |
| Weight gain predictions (ML) | ✅ Fully covered | TASK-039 |
| Egg production forecasting | ✅ Covered | TASK-051 |
| Profitability per batch | ✅ Fully covered | TASK-048, TASK-042 |
| Input cost projections | ✅ Fully covered | TASK-042 |
| Early disease risk alerts | ✅ Fully covered (+ enhanced) | TASK-036, TASK-038 |
| FSSAI compliance | ✅ Fully covered | TASK-052 |
| HACCP compliance | ✅ Fully covered | TASK-056 |
| Organic / Antibiotic-Free certification | ✅ Fully covered | TASK-035, TASK-052 |
| Export documentation | 📋 Phase 3 (APEDA integration) | REQ-021 §21.5 |
| Batch-to-buyer traceability | ✅ Fully covered | TASK-052 |
| Offline-first mobile app | ✅ Fully covered | TASK-045, TASK-055 |
| Multilingual UI | ✅ Covered (Hindi + Bhojpuri) | TASK-055 |

**Final Gap Status:**
- ✅ Fully covered: 40 / 45 features
- 🔶 Partially covered (Phase 1 manual, Phase 2 automated): 1 / 45
- 📋 Phase 3 roadmap (architecture reserved, not built): 4 / 45
  - Hatchery & Breeder Module (REQ-023)
  - RFID Bird Tracking (REQ-018 §18.6)
  - Climate Controller Auto-Push (REQ-018 §18.5)
  - Export Documentation / APEDA Integration (REQ-021 §21.5)

---

## Updated Definition of Done (Addendum Extension)

In addition to the base DoD (TASK-028), all Phase 1 operational tasks must also satisfy:

- [ ] Offline submission tested on Android 10 (minimum) with airplane mode enabled — data queues, syncs on reconnect
- [ ] `synced` flag verified in DB as `false` on offline submit, `true` within 30 seconds of network restore
- [ ] Alert Edge Functions tested with mock INSERT events — alert fires within 60 seconds
- [ ] Withdrawal period override verified across 3 surfaces: API response, web price hero, mobile price hero
- [ ] ML models (mortality pattern, weight gain predictor) have documented MAPE or accuracy metrics in code comments

---

*End of Tasks Addendum — PoultryPulse Dashboard Enhancement v1.0*  
*Merge into base Tasks document (TASK-001 through TASK-028) before Kiro initialization.*  
*Complete 57-task coverage achieves full competitive parity with Navfarm Poultry ERP whitepaper features.*
