# FlockIQ — Gap Remediation Package Index (v1.0)
# Master cross-reference for all 3 companion documents
# June 2026 | CONFIDENTIAL

---

## WHAT THIS PACKAGE IS

This package addresses **7 confirmed competitive gaps** between FlockIQ v2.0 and leading global competitors (PoultryCare, PoultryPlan OptiLink). It consists of three companion documents:

| Document | Purpose | Lines |
|---|---|---|
| `FlockIQ_Gap_Remediation_Design_Master_v1.md` | UI/UX specs, wireframes-in-text, screen layouts, data flows | ~1,670 |
| `FlockIQ_Gap_Remediation_Requirements_v1.md` | Acceptance criteria, API contracts, DB schemas | ~870 |
| `FlockIQ_Gap_Remediation_Tasks_v1.md` | Granular dev tasks with full code snippets, ready for SWE | ~1,735 |

All three documents build on `FlockIQ_Updated_Design_Master_v2.md` and `FlockIQ_Updated_Requirements_v2.md` — they do NOT replace them.

---

## THE 7 GAPS — QUICK SUMMARY

### GAP 1 — Batch P&L: Complete Cost Tracking
**The problem:** Revenue and Profit numbers shown in Batch History are fictitious — there's no way to enter the costs that generate them.

**The fix:** New **P&L tab** (5th tab in Farm Detail) with 6 cost sections:
- Chick Procurement Cost (DOC price × birds + transport)
- Feed Cost (auto-synced from Feed tab — no duplicate entry)
- Medicine & Vaccine Cost (with withdrawal period tracking)
- Labour Cost (daily rate or period-by-period log)
- Overhead Cost (electricity, litter, fuel, insurance — with batch-share proration)
- Other/Miscellaneous

**Key output:** Live Cost per Bird (updates in real-time), P&L Waterfall Chart, Cost Breakdown Pie Chart. All cost inputs feed a complete Batch Closure Report at harvest.

**New DB tables:** `batch_costs`, `batch_medicine_costs`

---

### GAP 2 — Bird Lifting / Sales Management
**The problem:** There is no screen to record a sale — yet "Revenue" and "Profit" appear in Batch History.

**The fix:** New **Sales tab** (6th tab) with:
- Harvest Readiness Panel (triggered at 85% of target grow-out duration)
- Record Sale/Lifting Event form — supports **partial harvests** (sell 30%, rest later — very common in India/SEA)
- Full transport and logistics capture (vehicle, driver, destination, crates, dead in transit)
- Buyer/Trader directory with rating
- **Batch Close Wizard** (3-step guided process: confirm numbers → performance review → close & generate report)

**Critical safety integration:** The "Record Sale" button is **physically disabled** if any active antibiotic withdrawal period exists. Cannot be bypassed.

**New DB tables:** `batch_sales`, `buyers`

---

### GAP 3 — Medication / Treatment Tracking (Enhanced)
**The problem:** The Health tab has a vaccination schedule and symptom log, but no treatment record — no dosage, no duration, no withdrawal period, no cost.

**The fix:** New **Treatment Log section** in Health tab with:
- Full treatment entry: medicine, brand, lot number, dosage, route, duration, withdrawal period
- Autocomplete from a pre-seeded database of **55 common Indian broiler medicines** with standard FSSAI withdrawal periods
- **Withdrawal Period Tracker widget** — visual progress bar per medicine, "harvest safe" summary status
- Critical 🔴 banner blocks harvest if birds are in withdrawal period
- Treatment cost auto-flows into P&L tab Medicine section (no double entry)
- Vet Directory for saving veterinarian contacts

**New DB tables:** `batch_treatments`, `vets`, `medicines_db` (reference/seed)

---

### GAP 4 — Environment Data Tracking
**The problem:** Daily Log only captures temperature. Humidity and ammonia are the two primary causes of respiratory disease in broilers — both absent.

**The fix:** Expanded **Environment Data section** in Daily Log form:
- **3-point temperature** (morning / afternoon / evening) replaces single value
- **Humidity %** (morning + afternoon) with auto-alert >75%
- **Ammonia ppm** — direct entry OR estimated via litter condition (for farms without meters)
- **Light programme** (hours/day) vs breed standard — auto-alerts on deviation
- **Ventilation settings** (fan speed, curtain position, inlet %)
- Water temperature + Water:Feed ratio auto-computation

**New charts in Metrics tab:** Temperature & Humidity dual-axis chart, Ammonia Trend chart, Light Programme Compliance bar chart, 7-day Environment Health Summary card.

**New DB columns:** 15 new nullable columns on `daily_logs` (backwards compatible)
**New DB tables:** `breed_growth_standards`, `breed_light_programme` (seeded reference data)

---

### GAP 5 — Flock Benchmarking vs Filtered Peer Group
**The problem:** v2.0 shows a single platform average. A Cobb 430 farm in Gorakhpur is being compared to Ross 308 farms in Andhra Pradesh — meaningless.

**The fix:** New **Benchmark page** (`/dashboard/metrics/benchmark`) with:
- **5 filter dimensions:** My Farm/Portfolio | Breed | Region | Flock Size | Time Period
- **Privacy guard:** never shows data if fewer than 10 farms in filter group
- **Comparison table:** Your Avg | Group Avg | Top 25% | Top 10% | Your Rank — colour-coded
- **Performance Radar Chart:** 7-axis, 3 overlaid datasets (You / Group / Top 25%)
- **AI-generated insights** (4 cards: Strength | Improvement | Context | Action) via Claude Sonnet API
- **Breed Growth Curve Comparison:** your actual weights vs official Aviagen/Cobb breed performance objectives

**Also:** Portfolio Metrics page Network Benchmark section updated with quick breed/region filter pills.

**New DB tables:** `aggregated_benchmarks` (pre-computed nightly, never exposes individual data)

---

### GAP 6 — Calamity / Outbreak Warning with Per-Farm Risk Score
**The problem:** FlockIQ alerts are district-level only. PoultryPlan gives each farm its own risk score based on 4 factors. A farm 5km from an HPAI outbreak is very different from one 80km away.

**The fix:** Per-farm **Risk Score (0–10)** calculated from:
- **Proximity** to outbreak epicentre (0–4 points, Haversine formula)
- **Flock age vulnerability** (0–2 points — young chicks most at risk)
- **Vaccination status** (0–2 points — ND vaccination completion from Health tab)
- **Biosecurity level** (0–2 points — configurable per farm in setup/settings)

Risk level: 🟢 LOW (<4) | 🟡 MEDIUM (4–7) | 🔴 HIGH (8+)

**Risk is surfaced everywhere:** Alerts page (new "Farm Risk Assessment" section at top), Batch Status Board cards (badge), Portfolio Metrics (Disease Risk Monitor card), Farm Risk Detail page (with mini-map + breakdown table + recommendations).

**New DB tables:** `farm_risk_scores`; new column: `farms.biosecurity_level`
**New Supabase Edge Function:** `calculate-risk-scores` (runs every 6 hours when alerts active)

---

### GAP 7 — Document Library per Flock / Farm
**The problem:** PoultryPlan has a full document library per flock. FlockIQ has no document capability at all — a critical gap for audit, insurance, and government inspections globally.

**The fix:** New **Docs tab** (last tab in Farm Detail) with:
- **9 document categories:** Chick Purchase Invoice | Feed Invoice | Vaccination Certificate | Medicine Bill | Movement Permit | Sale Invoice | Lab Test Report | Insurance | Other
- **Batch-organised view** — documents grouped by batch, switch between batches easily
- **Upload flow:** drag & drop, accepts PDF/JPG/PNG/HEIF, 10 MB limit, progress bar
- **Storage:** Supabase private bucket, signed URLs (60s expiry), 500 MB per integrator
- **Cross-tab attachments:** [Attach Invoice] button on Sales rows, Treatment rows, Feed Purchase rows
- **Document Audit Trail** for accountability (who uploaded/downloaded/deleted + timestamps)
- **Auto-generated Batch Closure Report** (6-page PDF at batch close — auto-saved to Docs tab)

**New DB tables:** `documents`, `document_audit_log`
**New Supabase Storage bucket:** `farm-documents` (private)

---

## NAVIGATION CHANGES

### Farm Detail Tab Bar (updated)
```
OLD: [📊 Metrics] [📅 Daily Log] [🏥 Health] [🌾 Feed] [📋 History] [📲 WhatsApp]

NEW: [📊 Metrics] [📅 Daily Log] [🏥 Health] [🌾 Feed] [💰 P&L] [🚛 Sales] [📋 History] [📄 Docs] [📲 WhatsApp]
```

### Sidebar (updated)
```
ANALYTICS section gains:
  📈 Benchmark    /dashboard/metrics/benchmark    (NEW)
```

---

## DATA FLOWS BETWEEN GAPS

The 7 gaps are designed as a connected system, not isolated features:

```
Treatment Log (Gap 3)
  → cost entry → Medicine & Vaccine Cost section in P&L tab (Gap 1)  [auto-sync]
  → withdrawal period → blocks Sales tab Record Sale button (Gap 2)   [safety gate]

Sales & Lifting (Gap 2)
  → revenue → P&L Summary Banner Revenue tile (Gap 1)                 [auto-sync]
  → sale saved → attach invoice → Documents tab (Gap 7)               [cross-attach]

Environment Data (Gap 4)
  → high humidity/ammonia logged → Health Event Timeline gets entry    [alert creation]
  → 7 days of data → Environment Trend Charts appear in Metrics tab   [chart activation]

Treatment Log (Gap 3) + P&L (Gap 1)
  → batch closed → Batch Closure Report PDF (Gap 7)                   [auto-generate]
  → closure data → feeds Benchmark comparison (Gap 5)                  [data source]

Risk Score (Gap 6)
  → farm vaccination status read from Health tab (Gap 3)              [dependency]
  → risk badge → Batch Status Board cards                              [surface everywhere]
```

---

## IMPLEMENTATION ORDER (RECOMMENDED SPRINT SEQUENCE)

### Sprint 0 — Database (do all first, ~1 day)
All 7 DB migration tasks from Tasks doc. No UI work until these are done.

### Sprint 1 — Core Backend APIs (~3 days)
Priority order:
1. TASK-GAP7-API-001 (Documents upload — needed early for document attachments elsewhere)
2. TASK-GAP1-API-001 (Batch P&L API)
3. TASK-GAP2-API-001 (Sales API — critical path, withdrawal check on POST)
4. TASK-GAP3-API-001 (Treatment API — needed before Sales withdrawal gate works)
5. TASK-GAP4-API-001 (Extend daily log endpoint)
6. TASK-GAP5-API-001 (Benchmark data API)
7. TASK-GAP6-API-001 (Risk score Edge Function)
8. TASK-GAP2-API-002 (Batch close API — after sales API working)

### Sprint 2 — Frontend UI (~5 days)
Priority order:
1. TASK-GAP1-UI-001 to -004 (P&L tab — most complex, start early)
2. TASK-GAP3-UI-001 (Treatment Log — needed before Sales withdrawal gate)
3. TASK-GAP2-UI-001 to -003 (Sales tab + Batch Close Wizard)
4. TASK-GAP4-UI-001 (Environment fields in Daily Log)
5. TASK-GAP7-UI-001 (Documents tab)
6. TASK-GAP6-UI-001 (Risk section on Alerts page)
7. TASK-GAP5-UI-001 to -002 (Benchmark page)
8. TASK-GAP4-UI-002 (Environment trend charts — needs data from UI-001 first)

### Sprint 3 — Integration & Polish (~2 days)
1. TASK-INT-001 (Withdrawal block: Treatment → Sales)
2. TASK-INT-002 (Treatment cost → P&L auto-sync)
3. TASK-INT-003 (Benchmark nav + Portfolio Metrics filter pills)
4. TASK-INT-004 (Risk badge on Batch Status Board)
5. TASK-INT-005 (Document count badges)
6. TASK-INT-006 (Batch Closure Report PDF)

### Sprint 4 — Testing (~1 day)
All 35 smoke tests from the Testing Checklist at end of Tasks doc.

**Total estimated effort: 120–160 engineering hours (~3–4 weeks for 1 FTE developer)**

---

## GLOBAL MARKET ADAPTATIONS BUILT IN

All 7 features are designed for global use from day one:

| Feature | India | SEA (Indonesia/Vietnam) | MENA | Africa |
|---|---|---|---|---|
| Currency | ₹ INR (Indian notation) | Rp IDR / ₫ VND | SAR Riyal | USD |
| Medicine DB | 55 FSSAI-aligned medicines | Generic entry (Phase 2) | Generic | Generic |
| Doc types | Form 8 movement permit | SKA permit (configurable) | Custom label | Custom |
| Risk alerts | DAHDF bulletins | OIE WAHIS | OIE WAHIS | FAO EMPRES-i |
| Benchmark data | UP/Bihar/MH/AP regions | Phase 2 (sparse initially) | Phase 3 | Phase 3 |
| Language | Hindi / English | English only (Phase 1) | Arabic (Phase 3) | English |
| Withdrawal periods | FSSAI standard DB | WHO Codex fallback | WHO Codex | WHO Codex |

---

## FILES IN THIS PACKAGE

```
FlockIQ_Gap_Remediation_Design_Master_v1.md    — UI/UX design specifications
FlockIQ_Gap_Remediation_Requirements_v1.md     — Product requirements with acceptance criteria  
FlockIQ_Gap_Remediation_Tasks_v1.md            — Developer tasks with code snippets
FlockIQ_Gap_Remediation_Index_v1.md            — This file (executive summary + cross-reference)
```

---

*Package version: v1.0 | Created: June 2026*
*Competitive references: https://www.poultry.care/broiler-management | https://www.poultryplan.com/solutions/optibroilers*
*Builds on: FlockIQ_Updated_Design_Master_v2.md | FlockIQ_Updated_Requirements_v2.md*
