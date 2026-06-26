# FlockIQ — Gap Remediation Design Master (v1.0)
# Addresses: 7 Competitive Gaps vs PoultryCare & PoultryPlan
# Version: v1.0 | June 2026 | CONFIDENTIAL
# Builds on: FlockIQ_Updated_Design_Master_v2.md
# Target: Global Market (India Primary + SEA + MENA + Africa)

---

## STRATEGIC CONTEXT

This document addresses 7 confirmed competitive gaps identified against:
- **PoultryCare** (https://www.poultry.care/broiler-management) — batch P&L journal, bird lifting, medication management, environment data
- **PoultryPlan OptiLink** (https://www.poultryplan.com/solutions/optibroilers) — flock benchmarking, calamity warning system with per-farm risk scores, document library

All 7 gaps must be implemented to position FlockIQ as a **full poultry management platform** competing globally. The design language, tokens, and typography are inherited from `FlockIQ_Updated_Design_Master_v2.md` and are NOT repeated here — only gap-specific screens are specified.

---

## GAP 1: BATCH P&L — COMPLETE COST TRACKING

### Overview

**Problem:** FlockIQ v2.0 shows "Revenue" and "Profit" in Batch History but has no mechanism to record the actual costs that generate those numbers. PoultryCare's batch journal tracks chick costs, feed, medicine, labour, and overhead to produce a real live cost-per-bird figure.

**Design Approach:** Add a dedicated **"P&L" tab** to the Farm Detail page (between Feed tab and Batch History tab). This tab is the financial journal for the active batch. It always shows a running real-time P&L as costs are entered.

**Global Design Note:** All currency values use the user's currency setting (₹ INR default, switchable to USD/EUR/IDR for global users). Labels are bilingual (Hindi/English). Cost categories are universally applicable across India, SEA, and global markets.

---

### 1.1 P&L Tab — Page Layout

```
ROUTE: /dashboard/farms/[id] → Tab: "P&L"
TAB POSITION: 5th tab, between Feed and Batch History
TAB ICON: 💰 (coin emoji or a ledger icon)
TAB LABEL: "P&L" (bilingual: "P&L / लागत")
```

```
PAGE STRUCTURE:
┌──────────────────────────────────────────────────────────────────┐
│  BATCH P&L SUMMARY BANNER (always visible, full-width)          │
│  Batch #24 · Day 21 · [Active ●]                                │
│                                                                   │
│  [Revenue: ₹0 (est.)] [Total Cost: ₹4,23,500] [Profit: -₹4.2L] │
│  [Live Cost/Bird: ₹33.9] [Target Margin: 12%] [Days to Harvest: ~21] │
│                                                                   │
│  Progress: ████░░░░░░ 50%  "Cost is building — Harvest on time"  │
└──────────────────────────────────────────────────────────────────┘

BELOW BANNER: Two-column layout (60/40 split on desktop, stacked on mobile)

LEFT COLUMN (60%): COST ENTRY SECTIONS (accordion-style)
  Section 1: Chick Procurement Cost          [Entered ✓]
  Section 2: Feed Cost                       [Auto from Feed tab ✓]
  Section 3: Medicine & Vaccine Cost         [2 entries]
  Section 4: Labour Cost                     [7 entries]
  Section 5: Overhead Cost                   [1 entry]
  Section 6: Other / Miscellaneous           [Empty — click to add]

RIGHT COLUMN (40%): LIVE P&L WATERFALL CHART + COST BREAKDOWN PIE
  Waterfall: shows each cost category as a negative bar, revenue as positive
  Pie chart: cost breakdown % (Feed 65%, Chicks 22%, Medicine 7%, Labour 4%, Overhead 2%)
  "Live Cost per Bird: ₹33.9 (Target: ≤₹35)"
```

---

### 1.2 Cost Entry Sections — Detailed Design

#### Section 1: Chick Procurement Cost

```
SECTION HEADER: [🐣 Chick Procurement Cost]   [Edit ✏] if already entered
SHOWN AS CARD when entry exists:
┌──────────────────────────────────────────────────────────┐
│  DOC Supplier:     Godrej Agrovet Gorakhpur depot        │
│  Breed:            Cobb 430                              │
│  Date Placed:      10 May 2026                           │
│  Birds Placed:     12,500                                │
│  Price per DOC:    ₹42.00                                │
│  Transport Cost:   ₹3,500                                │
│  ──────────────────────────────────                      │
│  TOTAL CHICK COST: ₹5,28,500                             │
│  Cost per Bird:    ₹42.28                                │
└──────────────────────────────────────────────────────────┘

IF NOT ENTERED: Shows inline form:
Fields: DOC Supplier (text), Breed (auto-filled from batch), Date Placed (auto-filled),
        Birds Placed (auto-filled), Price per DOC (₹, required), Transport Cost (₹, optional)
[Save Chick Cost ✓] button

DESIGN RULE: Once entered, section collapses to summary card.
             [Edit] reopens form pre-filled. Changes update running P&L instantly.
```

#### Section 2: Feed Cost

```
SECTION HEADER: [🌽 Feed Cost]   [Auto-synced from Feed tab ✓]
This section is READ-ONLY — data flows automatically from the Feed tab's purchase log.

DISPLAY:
┌──────────────────────────────────────────────────────────┐
│  Total feed purchased this batch: 42.5 MT                │
│  Total feed cost:                 ₹1,91,250              │
│  Average rate:                    ₹45.0/kg               │
│  ──────────────────────────────────                      │
│  Synced from Feed tab · Last updated: just now           │
│  [View Feed Detail →]                                    │
└──────────────────────────────────────────────────────────┘

INFO CALLOUT: "Feed cost is pulled automatically from your Feed Purchase Log.
              To add feed costs, go to the Feed tab."
```

#### Section 3: Medicine & Vaccine Cost

```
SECTION HEADER: [💊 Medicine & Vaccine Cost]   [+ Add Entry]
Shows table of all medicine cost entries for current batch:

TABLE COLUMNS:
Date | Medicine Name | Brand | Batch No. | Purpose | Quantity | Unit | Rate | Total Cost | Withdrawal Days | Treatment Complete?

TABLE ROW EXAMPLE:
15 May | Tylosin | Tyla 10% | TL2024-B | Respiratory Tx | 500 | g | ₹180/kg | ₹90 | 7 days | ✓ Yes

WITHDRAWAL PERIOD ALERT CARD (shown if any active withdrawal):
┌─────────────────────────────────────────────────────────┐
│  ⚠ WITHDRAWAL PERIOD ACTIVE                            │
│  Tylosin administered: May 15                           │
│  Withdrawal period: 7 days                              │
│  Earliest safe harvest date: May 22 ✓ (already passed) │
│  Status: CLEARED — birds can be sold                    │
└─────────────────────────────────────────────────────────┘

IF withdrawal period NOT yet cleared:
┌─────────────────────────────────────────────────────────┐
│  🔴 DO NOT SELL — WITHDRAWAL PERIOD ACTIVE             │
│  Enrofloxacin administered: Jun 1                       │
│  Withdrawal period: 10 days                             │
│  Earliest safe harvest date: June 11                    │
│  Selling before this date is a food safety violation.   │
└─────────────────────────────────────────────────────────┘

[+ Add Medicine Entry] button → inline expandable form:
Fields:
  Date (date picker)
  Medicine Name (text, with autocomplete from common medicines list)
  Brand Name (text, optional)
  Batch/Lot Number (text, for traceability)
  Purpose: [Preventive ▾] [Therapeutic] [Vaccination]
  Quantity (number) + Unit (dropdown: ml, g, kg, tablets, vials)
  Rate (₹ per unit, optional)
  Duration of Treatment: Day ___ to Day ___
  Withdrawal Period (days): [auto-suggested based on medicine name if in DB, else manual]
  [+ Mark as Completed ✓]
  [Save Entry] button

TOTAL MEDICINE COST shown at bottom of section:
"Total medicine & vaccine cost this batch: ₹4,250"
```

#### Section 4: Labour Cost

```
SECTION HEADER: [👷 Labour Cost]   [+ Add Entry]
Supports two input modes (toggle at top of section):

MODE A: Daily Rate Entry (simpler — for small farms)
  "Enter daily labour cost and apply to the full batch"
  Fields: Labour Rate (₹/day), Number of Workers
  Auto-calculation: "₹800/day × 2 workers × 42 days = ₹67,200 (estimated)"
  [Apply to Batch]

MODE B: Weekly/Monthly Log (for larger farms)
  Table of labour cost entries:
  Period | Workers | Days | Rate/Day | Notes | Total
  May 10–16 | 2 | 7 | ₹800 | Regular labour | ₹11,200
  May 17–23 | 2 | 7 | ₹800 |  | ₹11,200
  [+ Add Period] button

TOTAL LABOUR COST shown at bottom:
"Total labour cost logged: ₹22,400 of ~₹67,200 estimated (21 of ~42 days)"
```

#### Section 5: Overhead Cost

```
SECTION HEADER: [⚡ Overhead Cost]   [+ Add Entry]
Overhead categories (predefined chips to select + custom):
[Electricity] [Water] [Litter/Bedding] [Fuel] [Repairs] [Insurance] [Depreciation] [Other]

Entry table:
Date | Category | Description | Amount | Frequency | Batch Share

FREQUENCY FIELD explanation (tooltip):
"If this is a monthly cost (e.g. electricity bill), enter the monthly amount.
FlockIQ will calculate the share attributable to this batch automatically."

Example entry:
May 31 | Electricity | Monthly bill | ₹8,500 | Monthly | ₹4,250 (50% of month)

[+ Add Overhead Entry] inline form (same as medicine section style)

TOTAL OVERHEAD shown at bottom: "Total overhead: ₹8,750"
```

#### Section 6: Other / Miscellaneous

```
SECTION HEADER: [📎 Other Costs]   [+ Add Entry]
Free-form cost entry for anything not covered above.
Fields: Date, Description, Amount, Notes
[+ Add Entry] → simple 3-field inline form
TOTAL shown at bottom.
```

---

### 1.3 P&L Summary Banner (Top of Tab) — Detailed Design

```
LIVE P&L SUMMARY STRIP:
Background: white card with bottom shadow
Padding: 20px 24px
Display: horizontal flex row (6 KPI tiles), wraps to 2-row grid on mobile

KPI TILES:
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  Est. Revenue      Total Cost      Gross Profit    Live Cost/Bird            │
│  ₹0               ₹4,23,500       –₹4,23,500      ₹33.9                    │
│  (at harvest)     ● Tracked        (pre-harvest)   Target: ≤₹35 ✓          │
│                                                                              │
│  Target Margin     Estimated Days to Harvest                                │
│  12%              ~21 days  [See Harvest Forecast →]                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

REVENUE ESTIMATE LOGIC:
  Est. Revenue = birds_alive × avg_weight_kg × today_P50_price
  When shown: "Est. Revenue at today's price (₹168/kg): ₹21,04,560"
  Shown in muted grey until batch is actually sold (then shows real revenue from Sales tab)
  
  NOTE: Revenue = ₹0 until first sale event is recorded (see Gap 2 design below)
  After any partial sale: revenue updates to actual recorded figure

LIVE COST/BIRD FORMULA:
  live_cost_per_bird = total_tracked_cost / birds_placed
  Updates in real-time as new cost entries are saved
  
  Colour: green if ≤ target_cost_per_bird, amber if within 10% above target, red if >10% above

GROSS PROFIT WHEN ACTIVE BATCH (pre-harvest):
  Shows as negative (cost accumulation) — this is expected and clearly labelled
  "Profit will be calculated at harvest"
  Progress bar shows: "Cost is building normally ✓" or "⚠ Cost tracking incomplete — add chick cost"
```

---

### 1.4 P&L Waterfall Chart

```
COMPONENT: Recharts BarChart (custom waterfall rendering via stacked bars)
POSITION: Right column, top half
HEIGHT: 280px desktop, 200px mobile

BARS (left to right):
  Revenue (green bar, positive) — shown as "Est." until harvest
  Chick Cost (red bar, negative)
  Feed Cost (red bar, negative)
  Medicine (red bar, negative)
  Labour (red bar, negative)
  Overhead (red bar, negative)
  Other (red bar, negative)
  Net Profit (green if positive, red if negative) — final bar

AXIS: Y-axis in ₹ (formatted as ₹XL or ₹XK for readability)

TOOLTIP ON HOVER: "Feed Cost: ₹1,91,250 (65.2% of total cost)"

BELOW CHART: Cost Breakdown Pie Chart
  Pie chart (donut style): shows same categories as %, colour-coded
  Legend below: Feed 65% | Chicks 22% | Medicine 7% | Labour 4% | Overhead 2%
  "Total cost tracked: ₹4,23,500"
```

---

### 1.5 Batch History Tab — P&L Integration

```
EXISTING: Batch History tab shows table of past batches
UPDATE: Add full P&L columns to the table (new columns added to right)

ADDITIONAL COLUMNS for Batch History:
  Chick Cost (₹) | Feed Cost (₹) | Medicine Cost (₹) | Labour Cost (₹) | Overhead (₹) | Total Cost (₹) | Gross Margin %

ROW EXPANSION (clicking any batch row):
  Expands to show full P&L breakdown for that historical batch
  Mini waterfall chart for that batch

FARM LIFETIME P&L AVERAGES (bottom of Batch History tab):
  "Average Cost Breakdown across N batches"
  | Category | Avg Cost | % of Total Cost | Trend |
  | Feed     | ₹1.9L    | 65%             | →     |
  | Chicks   | ₹0.65L   | 22%             | ↑ +2% |
  | Medicine | ₹0.2L    | 7%              | ↓ -1% |
  | Labour   | ₹0.12L   | 4%              | →     |
  | Overhead | ₹0.06L   | 2%              | →     |
```

---

## GAP 2: BIRD LIFTING / SALES MANAGEMENT

### Overview

**Problem:** FlockIQ shows "Revenue" and "Profit" in Batch History but provides no workflow to actually record a sale/harvest event. PoultryCare has a full Bird Lifting Management module. PoultryPlan has Transport and Processor as modules.

**Design Approach:** Add a new **"Sales & Lifting"** tab to Farm Detail (between P&L and Batch History). Also add a **"Close Batch"** workflow triggered from this tab.

**Key Insight for Indian Context:** Partial harvests (selling 30–50% of birds first, remainder 5–10 days later) are extremely common in India and SEA markets. The design must support partial lifts natively.

---

### 2.1 Sales & Lifting Tab — Page Layout

```
ROUTE: /dashboard/farms/[id] → Tab: "Sales"
TAB POSITION: 6th tab (after P&L)
TAB ICON: 🚛
TAB LABEL: "Sales" (bilingual: "Sales / बिक्री")
```

```
PAGE STRUCTURE:

─── HARVEST READINESS PANEL (shown when batch age ≥ 85% of target duration) ────
┌──────────────────────────────────────────────────────────────────────────────┐
│  🌟 HARVEST WINDOW ACTIVE                                                   │
│                                                                              │
│  Birds: 12,450 alive  |  Avg Weight: 1.85 kg  |  FCR: 1.82                 │
│  Today's Price (Gorakhpur): ₹168/kg                                         │
│  Estimated Revenue if sold today: ₹38.7L                                    │
│                                                                              │
│  Withdrawal Status: ✅ CLEAR — No active withdrawal periods                 │
│  Sell Signal: 🟢 आज बेचें (Sell Now)                                       │
│                                                                              │
│  [+ Record Sale / Lifting Event →]  [Close Batch →]                         │
└──────────────────────────────────────────────────────────────────────────────┘

─── SALES LOG TABLE ──────────────────────────────────────────────────────────
Header: "Sales & Lifting Events — Batch #24"
[+ Record New Sale]  [Export CSV]

TABLE COLUMNS:
Sale# | Date | Birds Sold | Live Weight (kg) | Rate (₹/kg) | Revenue (₹) | Buyer | Vehicle | Notes | Status

EMPTY STATE:
  Icon: truck illustration (SVG)
  Hindi: "अभी कोई बिक्री दर्ज नहीं"
  English: "No sales recorded yet for this batch"
  Sub: "Record your first lifting event when birds are ready for sale"
  CTA: [+ Record First Sale →]

─── BATCH SALES SUMMARY (shown once ≥1 sale recorded) ─────────────────────
  [Total Birds Sold: X] [Total Revenue: ₹X] [Avg Rate: ₹X/kg] [Remaining Birds: X]
  Progress bar: N% of batch sold
  "Partial harvest: 30% of flock lifted. Remaining: 8,750 birds ready."

─── BUYERS / TRADERS DIRECTORY (bottom of tab) ──────────────────────────────
  Header: "Buyers & Traders"
  Shows saved buyer contacts for this farm's integrator
  [+ Add Buyer] button
  Each buyer card: Name | Phone | Location | Last purchase date | Rating
```

---

### 2.2 Record Sale / Lifting Event — Form Design

```
TRIGGER: [+ Record New Sale] button or [+ Record Sale / Lifting Event →] from harvest banner

FORM TYPE: Full-page sheet on mobile / Right-side drawer on desktop (600px wide)
TITLE: "Record Sale / Lifting Event"
SUBTITLE: "Batch #24 — Day 35 — Shivaji Poultry Farm"

FORM SECTIONS:

── SECTION 1: SALE DETAILS ─────────────────────────────────────────────────
Fields:
  Sale Date (date picker, defaults to today)
  
  Sale Type: [Full Harvest ●] [Partial Harvest]
    If Partial Harvest: show "Birds to sell in this lift" counter
      Default: all remaining birds
      [−] [12,450] [+] with helper text "Remaining after this lift: 0"
  
  Live Weight (total kg) — REQUIRED
    Helper: "Total live weight of birds being sold in this lift"
    Alternative: [Calculate from avg weight × birds]
      Click: auto-fills as birds_sold × latest_avg_weight_kg
  
  Rate (₹ per kg) — REQUIRED
    Helper: "Today's mandi P50: ₹168/kg" (auto-populated from price data)
    Deviation warning: if entered rate is >15% below mandi P50, show:
    "⚠ This rate is ₹28/kg below today's mandi price. Are you sure?"
  
  Auto-computed (read-only, updates as user types):
    Revenue = birds_sold × live_weight_per_bird × rate
    Show: "Revenue from this lift: ₹21,04,560"
  
  Deductions / Commissions (optional):
    Commission to trader: ₹ [___] | % [__]
    Weighment deduction: kg [___]
    Net Revenue after deductions: ₹ [auto-computed]

── SECTION 2: BUYER DETAILS ────────────────────────────────────────────────
  Buyer: [Select from saved ▾] or [+ New Buyer]
  
  If NEW BUYER selected, additional fields appear:
    Buyer Name (required)
    Phone (required)
    Location / Town
    [Save to buyer directory ✓] checkbox (default: checked)
  
  Payment Terms:
    [Cash ●] [Credit — due in N days] [Cheque] [NEFT/Bank Transfer]
  
  Invoice / Challan Number (optional, text)

── SECTION 3: TRANSPORT / LIFTING LOGISTICS ────────────────────────────────
  Vehicle Number (text, optional)
  Driver Name (optional)
  Departure Time (time picker, optional)
  Destination Processor / Market (text, optional)
  
  Crates Used (number, optional)
  Dead Birds in Transit (number — birds that died during transport)
    This is subtracted from final count and affects mortality total

── SECTION 4: ACTUAL WEIGHT AT HARVEST ─────────────────────────────────────
  Actual Average Weight at Sale (g/bird) — REQUIRED
    Helper: "This is the confirmed weight at buyer's weighment"
    Shows vs estimated: "Estimated was 1,850g — actual: [1,820g] — 1.6% lower"
  
  Weight Variance note: if actual < estimated by >5%:
    "Weight came in 3% below estimate. This will be reflected in batch performance analysis."

── SECTION 5: NOTES ────────────────────────────────────────────────────────
  Free text notes (optional, 300 char limit)

── FORM FOOTER ─────────────────────────────────────────────────────────────
  [Save Lifting Event ✓]  [Cancel]
  
  If this is a FULL HARVEST or if "birds remaining = 0" after this lift:
    Checkbox: [✓ Close batch after saving this sale]
    If checked: after save → triggers Batch Close Wizard (see below)
```

---

### 2.3 Batch Close Wizard

```
TRIGGER: User clicks [Close Batch →] or checks "Close batch" on final sale form
DISPLAY: Modal (640px wide, centred)
TITLE: "🎉 Close Batch #24 — Shivaji Poultry Farm"

WIZARD STEPS (3 steps, shown as progress dots at top):

STEP 1: CONFIRM FINAL NUMBERS
  "Review your batch summary before closing"
  
  Final Summary Card:
  ┌────────────────────────────────────────────────────────┐
  │  Batch #24 — Cobb 430 Broiler                         │
  │  Duration: Day 1 (May 10) → Day 35 (Jun 14)           │
  │                                                        │
  │  Birds Placed:    12,500                               │
  │  Birds Sold:      12,450  (2 partial lifts)           │
  │  Total Mortality: 50 birds (0.40%)                    │
  │  Avg Live Weight: 1.82 kg                             │
  │  FCR (final):     1.82                                │
  │                                                        │
  │  TOTAL REVENUE:   ₹38,71,500                          │
  │  TOTAL COST:      ₹4,23,500                           │
  │  GROSS PROFIT:    ₹34,48,000  (89.1% margin)          │
  │  PROFIT PER BIRD: ₹27.6                               │
  └────────────────────────────────────────────────────────┘
  
  Edit Any Number: [Edit Mortality] [Edit Revenue] [Edit Costs] links
  [Next →]

STEP 2: BATCH PERFORMANCE REVIEW
  "How did this batch compare?"
  
  Radar chart: this batch vs your farm average vs platform benchmark
    Metrics: FCR, Mortality %, Avg Weight, Batch Duration, Gross Margin
  
  AI-generated 3-line batch summary:
    "Batch #24 performed above your farm average. FCR improved from 1.85 → 1.82
     (↑1.6%). Mortality was excellent at 0.40% vs farm avg of 3.43%. Weight gain
     was slightly below Ross 308 standard (-2%) but within acceptable range."
  
  [Next →]

STEP 3: WHAT'S NEXT?
  "Ready to close this batch. What would you like to do next?"
  
  [✓] Download Batch Closure Report (PDF)
  [✓] Start New Batch immediately
  [ ] Take a break — I'll start next batch later
  [ ] Schedule next batch placement date: ___
  
  [Close Batch & Save ✓]  →  Batch status moves to "Harvested"
                           →  Triggers PDF generation
                           →  Confetti animation (3 seconds)
                           →  Redirect to farm detail (Batch History tab)
```

---

### 2.4 Buyer/Trader Directory

```
ROUTE: Embedded in Sales tab (bottom section) + accessible from Farm Detail header menu
TITLE: "Buyers & Traders — Shivaji Farm"

LIST VIEW (default):
  Each buyer row: [Avatar initials] | Name | Phone | Last Purchase | Rating | [⋮]
  Rating: 1–5 stars (user rates their experience with each buyer)
  [+ Add Buyer] button (top right)

ADD BUYER FORM (inline, appears below header):
  Name (required), Phone (required), Location/Town, Type (Trader/Processor/Cooperative),
  Notes (payment habits, etc.), [Save]

BUYER DETAIL PANEL (click any buyer → right panel opens):
  All purchase history from this buyer across all batches
  Average rate paid | Payment reliability (cash/credit history)
  Notes field
```

---

## GAP 3: MEDICATION / TREATMENT TRACKING (ENHANCED)

### Overview

**Problem:** The current Health tab has a vaccination schedule and symptom log but no way to record full treatment events (medicine name, dosage, duration, withdrawal period, cost). The withdrawal period omission is a food safety risk.

**Design Approach:** Add a **"Treatment Log"** section to the existing Health tab (as a new sub-section below the Symptom Log). The Treatment Log is distinct from the Vaccination Schedule — vaccinations are planned, treatments are reactive responses to health events.

Also: The medicine cost data entered here feeds directly into the **P&L tab (Gap 1, Section 3)** automatically.

---

### 3.1 Health Tab — Updated Structure

```
HEALTH TAB — SECTIONS (top to bottom):
  1. Health Status Card (existing — keep)
  2. ⚠ Overdue Vaccination Banner (existing — keep)
  3. Vaccination Schedule Table (existing — keep, with minor improvements)
  4. Symptom Quick-Log (improved from binary to chip-select — see v2.0 design)
  5. 🆕 Treatment Log (NEW — detailed below)
  6. Health Event Timeline (existing — keep, now feeds from Treatment Log too)
  7. 14-Day Health Checklist (existing — keep)
  8. Vet Contact Card (existing — keep)
  9. 🆕 Withdrawal Period Tracker (NEW — detailed below)
```

---

### 3.2 Treatment Log Section

```
SECTION HEADER ROW:
  Left: "💊 Treatment Log"
  Right: [+ Add Treatment]
  
  Active withdrawal alert (if any):
  ┌──────────────────────────────────────────────────────────┐
  │  ⚠ ACTIVE WITHDRAWAL PERIOD                            │
  │  Oxytetracycline · Administered Jun 1 · 10-day period  │
  │  Earliest harvest: June 11                             │
  │  [View Details →]                                       │
  └──────────────────────────────────────────────────────────┘

TREATMENT LOG TABLE:
  Columns:
    Date Started | Medicine | Brand | Purpose | Dosage | Route | Duration | Withdrawal | Cost | Status
  
  EXAMPLE ROW:
    May 20 | Tylosin | Tyla 10% | Respiratory | 100g/100L water | Water | D18–D21 | 7 days | ₹90 | ● Complete
  
  STATUS BADGES:
    ● Active Treatment (blue) — currently in treatment period
    ● Withdrawal (amber) — treatment done, withdrawal period running
    ● Cleared (green) — withdrawal period over, safe to harvest
    ● Complete (grey) — no withdrawal period (vaccination etc)
  
  Row expansion (clicking a row):
    Shows full treatment details:
    - Indication (why treatment was prescribed)
    - Dosage calculation: "100g per 100L of water = approx 8ml per bird at current flock size"
    - Batch number of medicine (for traceability / recall alerts)
    - Prescribed by: Vet Name (if entered)
    - Completion confirmed: [Yes ✓] [No — still in progress]
    - Notes field

[+ Add Treatment] FORM (inline expandable form):
  Treatment Date (date picker — defaults to today)
  Medicine Name (text with autocomplete — common broiler medicines pre-loaded)
    Autocomplete suggestions include: Tylosin, Enrofloxacin, Oxytetracycline, Ampicillin,
    Colistin, Doxycycline, Trimethoprim-Sulfa, Vitamin C/E, Electrolytes, etc.
  Brand Name (text, optional)
  Batch / Lot Number (text, optional — important for recalls)
  
  Purpose / Indication:
    [Respiratory ●] [Enteric] [Leg Weakness] [CRD] [Coccidiosis] [Newcastle]
    [Preventive] [Growth Promoter] [Vitamin/Mineral] [Other — specify]
  
  Dosage Amount (number + unit dropdown: ml, g, mg)
  Per: [Per litre of water] [Per bird] [Per kg body weight] [Per kg feed]
  
  Route of Administration:
    [Water ●] [Feed] [Injectable] [Topical] [Spray]
  
  Treatment Duration:
    From Day: [___] To Day: [___] (of current batch)
    OR From Date: [___] To Date: [___]
  
  Withdrawal Period (days):
    [Auto-suggest based on medicine name if in DB]
    [Custom: ___ days] option
    Helper text: "This is the number of days after the last dose that birds cannot be sold.
                  Check your medicine package insert or consult your vet."
    If withdrawal > 0: shows "Do not sell before: [calculated date]"
  
  Cost:
    Quantity purchased: ___ [unit] at ₹___/unit = Total: ₹___
    [This cost will be added to your Batch P&L automatically]
  
  Prescribed by (optional):
    [Vet Name: ________________] [Phone: ________________]
    [Save vet to directory ✓] checkbox
  
  Notes (optional, 300 chars)
  
  [Save Treatment ✓] [Cancel]
  
  ON SAVE:
    - Entry appears in Treatment Log table
    - If withdrawal period > 0: Withdrawal Period Tracker is updated
    - Cost auto-flows to P&L tab → Medicine section
    - Health Event Timeline gets a new entry
    - If harvest date falls within withdrawal period: RED WARNING shown on Harvest Readiness panel
```

---

### 3.3 Withdrawal Period Tracker (New Component)

```
POSITION: Below Treatment Log table, above Health Event Timeline

WIDGET DESIGN:
┌────────────────────────────────────────────────────────────────┐
│  ⏱ Withdrawal Period Tracker                                  │
│                                                                │
│  All medicines administered this batch:                       │
│                                                                │
│  Tylosin (Tyla 10%)          Treated: May 20    Cleared ✅    │
│  7-day withdrawal            Last dose: May 23  May 30 → OK   │
│                                                                │
│  Oxytetracycline             Treated: Jun 1     ⚠ ACTIVE      │
│  10-day withdrawal           Last dose: Jun 5   Jun 15 → Safe │
│  ████████░░░░░░░░░░  Day 5 of 10 withdrawal                  │
│                                                                │
│  HARVEST SAFETY STATUS:                                       │
│  🔴 DO NOT HARVEST before June 15                            │
│  (Oxytetracycline withdrawal period active)                   │
└────────────────────────────────────────────────────────────────┘

INTEGRATION WITH HARVEST PANEL:
  If any withdrawal period is active AND estimated harvest date is before withdrawal end:
  Show red banner on the Sales & Lifting tab:
  "🔴 HARVEST BLOCKED: Oxytetracycline withdrawal period active until June 15.
   Selling before this date is a food safety and legal violation."
  
  This banner CANNOT be dismissed — it stays until the date passes.
```

---

### 3.4 Vet Directory (New Supporting Feature)

```
ACCESSIBLE FROM: Health tab → Treatment form → "Prescribed by" field → [View Vet Directory]
ALSO ACCESSIBLE FROM: Farm Detail header [⋮] menu → "Vet Directory"

DIRECTORY CARD DESIGN:
┌────────────────────────────────────────────────────────┐
│  Dr. Rajesh Kumar                  [Call →] [Edit ✏]  │
│  📍 Gorakhpur · Poultry Specialist                     │
│  📞 +91-9876543210                                      │
│  Last consulted: June 1, 2026                          │
│  Associated with: Shivaji Farm, Demo Farm 2            │
└────────────────────────────────────────────────────────┘

[+ Add Vet] button at top of directory
Form: Name, Specialisation, Phone, Location, Notes, Associated Farms (multi-select)
```

---

## GAP 4: ENVIRONMENT DATA TRACKING

### Overview

**Problem:** The Daily Log form captures only temperature (min/max). PoultryCare tracks environment data as a dedicated feature. PoultryPlan integrates IoT sensor data. Critical missing inputs: humidity %, ammonia levels, light programme, ventilation settings.

**Design Approach:** Expand the Daily Log form to include an **Environment Data section** (collapsible for simple farms, expanded by default for advanced users). Also add **Environment Trend Charts** to the Metrics tab.

**Global Note:** Humidity and ammonia are the two most common causes of respiratory disease in broilers globally. These fields are critical for any market (not India-specific). IoT sensor auto-fill is designed as a "phase 2" layer on top of manual entry.

---

### 4.1 Daily Log Form — Environment Section (Enhanced)

```
LOCATION: Daily Log form (Farm Detail → Daily Log tab → "Log Today's Data" form)
POSITION: After the existing Temperature field, before Notes

NEW ENVIRONMENT SECTION (collapsible accordion, default EXPANDED):

SECTION HEADER: [🌡️ Environment Data]   [▲ Collapse]

FIELD GROUP — ROW 1 (Temperature — existing, redesigned):
  Morning Temp (°C)  |  Afternoon Temp (°C)  |  Evening Temp (°C)
  [  22  ]           |  [  31  ]             |  [  27  ]
  Helper: "Min | Max | Evening reading"
  
  Heat Stress Alert (auto-triggered):
  If any temp > 35°C: show "⚠ Heat stress risk — monitor water intake and ventilation"
  If any temp < 10°C: show "⚠ Cold stress risk — check heating and litter moisture"

FIELD GROUP — ROW 2 (Humidity — NEW):
  Morning Humidity (%)   |   Afternoon Humidity (%)
  [  65  ]               |   [  75  ]
  Acceptable range: 50–70%
  
  Auto-alert:
  If humidity > 75%: "🔴 HIGH HUMIDITY — Respiratory disease risk elevated.
                      Check ventilation and litter condition."
  If humidity < 40%: "⚠ LOW HUMIDITY — Dust and respiratory irritation risk."

FIELD GROUP — ROW 3 (Ammonia — NEW):
  Ammonia Level (ppm) — [   8  ]   [Measured ●] [Estimated]
  
  Acceptable range: < 10 ppm
  Auto-alert bands:
    Green: < 10 ppm — "Normal ✓"
    Amber: 10–25 ppm — "⚠ Elevated — check litter condition and ventilation"
    Red: > 25 ppm — "🔴 DANGEROUS — Birds experience eye damage and respiratory disease.
                     Immediate ventilation increase required. Consult your vet."
  
  Helper tooltip: "Ammonia rises from litter decomposition. High ammonia (>25ppm) is
                   the #1 cause of chronic respiratory disease in broilers.
                   Use colour detector tubes or electronic meters for measurement."
  
  "I don't have measurement equipment" option:
    [Use Litter Condition Estimate instead]:
    Litter condition: [Dry & Crumbly ●] [Damp] [Wet / Caked] [Very Wet / Ammonia Smell]
    System maps litter condition to estimated ammonia range:
      Dry → ~2–5 ppm | Damp → ~10–20 ppm | Wet → ~25–40 ppm | Very Wet → ~40+ ppm
    Shows: "Estimated ammonia: ~15–20 ppm ⚠"

FIELD GROUP — ROW 4 (Light Programme — NEW):
  Light Hours Today (hours)   |   Light Schedule
  [  16  ]                    |   [Continuous] [Intermittent ▾]
  
  Helper: "Light programme affects feed intake and growth rate.
           Standard broiler light programme: 18–20 hours at D1–7, 
           then 18 hours D8–28, stepping down to 16h pre-harvest."
  
  LIGHT SCHEDULE DEVIATION ALERT:
  If light hours entered differs from breed-standard by >2 hours:
  "⚠ Light deviation: Standard for Day 21 Cobb 430 is 18h. You entered 14h.
   This may affect feed intake and growth rate."

FIELD GROUP — ROW 5 (Ventilation — NEW, Optional):
  [▼ Ventilation Settings (Optional)]
  Fan Speed: [Tunnel ●] [Low] [Medium] [High]
  Curtain/Sidewall Position: [Fully Open ●] [Half Open] [Closed]
  Inlet Opening (% open): [  70  ]
  Notes on ventilation: _______________

FIELD GROUP — ROW 6 (Water — existing, minor improvement):
  Water Consumption (L)   |   Water Temp (°C, optional)
  [   230   ]             |   [  25  ]
  
  Auto-computation:
  Water:Feed ratio = water_litres / feed_kg
  Show: "W:F ratio today: 1.84 (Normal range: 1.7–2.0 ✓)"
  If ratio < 1.5: "⚠ Low water intake — check drinkers, water quality, temperature"
  If ratio > 2.5: "⚠ High water intake — check for respiratory stress or diarrhoea"

SECTION SUMMARY (shown at bottom of environment section after all fields filled):
  "Today's Environment: 🟢 Temperature OK | 🟡 Humidity elevated (72%) | 🟢 Ammonia OK"
  This gives a quick single-line health status.
```

---

### 4.2 Environment Trend Charts (New — Metrics Tab)

```
LOCATION: Farm Detail → Metrics tab → NEW sub-section "Environment Trends"
POSITION: Below the existing 5 growth/performance charts

SECTION HEADER: "🌡️ Environment Trends"

CHART 1: Temperature & Humidity (combined dual-axis chart)
  LEFT Y-AXIS: Temperature (°C), range 0–45
  RIGHT Y-AXIS: Humidity (%), range 0–100
  Lines:
    - Morning Temp (solid green)
    - Afternoon Temp (solid red)
    - Morning Humidity (dashed blue)
    - Afternoon Humidity (dashed purple)
  Reference bands:
    - Optimal temp zone: 18–28°C (light green shaded band)
    - High temp warning: >35°C (red shaded band)
    - Optimal humidity: 50–70% (light blue shaded band)
  X-AXIS: Batch days (D1, D2, D3... current day)
  TOOLTIP: Shows all 4 values + whether within optimal range

CHART 2: Ammonia Trend
  Single line chart: Ammonia (ppm) per day
  Reference lines:
    - Safe threshold: 10 ppm (dashed green)
    - Warning threshold: 25 ppm (dashed red)
    - Critical threshold: 40 ppm (solid red)
  Background bands: green zone (<10), amber zone (10–25), red zone (>25)
  X-AXIS: Batch days

CHART 3: Light Programme Compliance
  Bar chart: planned vs actual light hours per day
  Green bar: actual hours | Grey line: target hours
  Deviation shown: "Day 21: 2h below target"

ENVIRONMENT HEALTH SUMMARY CARD (above charts):
  "Environment Summary — Last 7 days"
  ┌─────────────────────────────────────────────────────────┐
  │  Temperature: 7/7 days within safe range ✅             │
  │  Humidity: 5/7 days OK, 2 days elevated (>70%) ⚠       │
  │  Ammonia: 6/7 days OK, 1 day elevated (Day 18: 28ppm) ⚠│
  │  Light Compliance: 100% ✅                              │
  └─────────────────────────────────────────────────────────┘

ENVIRONMENT INSIGHTS (AI-generated, 2 lines):
  "Humidity above 70% on 2 of the last 7 days correlates with the respiratory
   event recorded on May 18. Monitor litter moisture and increase ventilation
   during afternoon peak temps."
```

---

### 4.3 IoT Sensor Integration Layer (Phase 2 Design, UI-Ready Now)

```
LOCATION: Farm Detail → Settings (accessible via [⋮] menu on farm header) → "Sensors & IoT"

SENSOR SETUP CARD:
┌────────────────────────────────────────────────────────────────┐
│  🌡️ Sensor Integration                           [Beta]       │
│                                                                │
│  Connect IoT sensors to auto-fill your daily environment data │
│  and get real-time alerts when conditions go out of range.    │
│                                                                │
│  Compatible sensors: Any MQTT-capable temperature/humidity     │
│  sensor. Popular options: SHT31, DHT22, DS18B20 + MQ-137     │
│  (ammonia). Plug-and-play with FlockIQ Hub (coming soon).     │
│                                                                │
│  Current Status: ○ No sensors connected                       │
│                                                                │
│  [+ Connect Sensor]   [Learn More →]                          │
└────────────────────────────────────────────────────────────────┘

NOTE FOR ENGINEER: This card is a UI placeholder for Phase 2 IoT integration.
  - When a sensor IS connected: daily log fields show "Auto-filled by sensor ✓" badge
  - Real-time chart updates via WebSocket when sensor data available
  - API endpoint /api/farms/[id]/sensor-data (POST) for sensor push
  - For Phase 1 (current): all fields are manual — sensor UI is informational only
```

---

## GAP 5: FLOCK BENCHMARKING — FILTERED BY BREED + REGION

### Overview

**Problem:** v2.0's Portfolio Metrics page shows a "Network Benchmark" section but it's a single platform average — not filterable by breed, region, or flock size. PoultryPlan explicitly separates "Flock Benchmark vs Self" from "Flock Benchmark vs Group" (same breed, same region).

**Design Approach:** Add a new **"Benchmark"** page (sub-page under Portfolio Metrics) and update the existing Portfolio Metrics benchmark section to support breed + region + flock size filtering.

---

### 5.1 New Benchmark Page — Layout

```
ROUTE: /dashboard/metrics/benchmark
NAV: Accessible from sidebar under ANALYTICS → "Benchmark"
     Also accessible via "View Detailed Benchmark →" link from Portfolio Metrics page

PAGE TITLE: "Flock Benchmark" | "झुंड की तुलना"
```

```
PAGE STRUCTURE:

─── BENCHMARK FILTERS BAR (top, sticky on scroll) ─────────────────────────
  Background: white, 1px bottom border
  
  FILTER CONTROLS (left to right):
  
  [My Farm/Portfolio ▾]       — which of the user's farms to benchmark
    Options: All Farms (portfolio average) | Individual farm names
  
  [Breed: All ▾]              — filter comparison group by breed
    Options: All Breeds | Ross 308 | Cobb 430 | Cobb 500 | Hubbard JV | Vencobb 400 | Other
  
  [Region: All India ▾]       — filter comparison group by geography
    Options: All India | UP/Bihar Belt | Maharashtra/Gujarat | Andhra/Telangana |
             Karnataka | Tamil Nadu | Punjab/Haryana | Other State | [Custom Region]
  
  [Flock Size: All ▾]         — filter by farm size category
    Options: All | Small (5K–20K) | Medium (20K–50K) | Large (50K–200K) | Commercial (200K+)
  
  [Period: Last 3 Batches ▾]  — how many historical batches to include
    Options: Last Batch | Last 3 Batches | Last 6 Batches | Last 12 Months
  
  [Reset Filters]   [Apply ✓]
  
  RESULTS COUNT (shown after Apply):
  "Comparing to 847 batches from 312 farms matching your filters"
  (anonymised aggregate data — individual farm data never exposed)

─── YOUR PERFORMANCE SUMMARY (left side, 40%) ────────────────────────────
  Header: "Your Farm(s) — Last 3 Batches"
  
  KPI CARDS (4 cards):
  FCR: 1.82      Mortality: 0.40%     ADG: 51g/day     Margin: 22%
  Each card shows: Your value | Trend (vs previous period)

─── BENCHMARK COMPARISON TABLE (full width below) ────────────────────────
  "How you compare to filtered group (Cobb 430 | UP Region | 10K–50K flock)"

  TABLE DESIGN:
  ┌────────────────────┬───────────┬───────────┬────────────┬────────────┬──────────────┐
  │ Metric             │ Your Avg  │ Group Avg │ Top 25%    │ Top 10%    │ Your Rank    │
  ├────────────────────┼───────────┼───────────┼────────────┼────────────┼──────────────┤
  │ FCR                │ 1.82 ✅   │ 1.90      │ 1.75       │ 1.68       │ Top 28% ↑   │
  │ Mortality %        │ 0.40% ✅  │ 3.20%     │ 2.10%      │ 1.40%      │ Top 10% ✅  │
  │ ADG (g/day)        │ 51g       │ 48g       │ 54g        │ 58g        │ Top 35%     │
  │ Harvest Weight     │ 1.82 kg   │ 1.85 kg   │ 1.95 kg    │ 2.05 kg ⚠ │ Bottom 40%  │
  │ Batch Duration     │ 35 days   │ 38 days   │ 36 days    │ 35 days ✅ │ Top 20% ✅  │
  │ Feed Efficiency    │ 65% ✅    │ 62%       │ 67%        │ 70%        │ Top 30%     │
  │ Gross Margin       │ 22% ✅    │ 18%       │ 24%        │ 28%        │ Top 32%     │
  └────────────────────┴───────────┴───────────┴────────────┴────────────┴──────────────┘

  COLOUR CODING:
    Your Avg column: green if ≥ Group Avg, amber if 5–10% below, red if >10% below
    Rank column: green if Top 25%, amber if 25–50%, red if bottom 50%

─── PERFORMANCE RADAR CHART ─────────────────────────────────────────────
  Recharts RadarChart, 7 axes (FCR, Mortality, ADG, Weight, Duration, Feed Eff, Margin)
  
  3 overlaid areas:
  - Your Portfolio (dark green filled area)
  - Group Average (dashed grey outline)
  - Top 25% (dashed purple outline)
  
  Legend: ■ You  ⃝ Group Avg  ⃝ Top 25%

─── BENCHMARK INSIGHTS (AI-generated, 4 cards) ──────────────────────────
  "Based on your performance vs Cobb 430 farms in UP with 10K–50K birds:"
  
  Card 1 — STRENGTH:
    "💪 Your mortality rate (0.40%) puts you in the Top 10% of your peer group.
     This is exceptional — the group average is 3.2%."
  
  Card 2 — IMPROVEMENT OPPORTUNITY:
    "⚠ Harvest Weight Gap: Your average harvest weight (1.82 kg) is below the group
     average (1.85 kg) and well below Top 25% (1.95 kg). A 3-day longer grow-out period
     or breed-standard light programme could close this gap."
  
  Card 3 — BENCHMARK CONTEXT:
    "📊 Your FCR of 1.82 is 4% better than the group average (1.90). At 12,500 birds,
     this saves approximately ₹28,000 in feed cost per batch vs average farmers."
  
  Card 4 — ACTION SUGGESTION:
    "📈 To reach Top 25% in harvest weight, target 1.95 kg. Based on Ross 308 growth
     curves, this requires extending your grow-out by approximately 3–4 days.
     Price forecast for that window: ₹170/kg — positive."

─── BREED GROWTH CURVE COMPARISON (below insights) ─────────────────────
  Header: "Your Weight Progression vs Breed Standard"
  
  Line chart:
  - Your actual weights (solid green, plotted day-by-day)
  - Your selected breed standard (dashed grey — from official breed performance targets)
  - Group average weight progression (dashed purple)
  - Top 25% weight progression (dashed amber)
  
  BREED SELECTOR (above chart):
  [Ross 308 ●] [Cobb 430] [Cobb 500] [Hubbard JV] [Vencobb 400]
  Note: breed standards loaded from Aviagen/Cobb official performance objectives
  
  X-AXIS: Days of age (D1–D42)
  Y-AXIS: Average live weight (grams)
  
  Tooltip: "Day 21: Your farm 1,680g | Ross 308 standard: 1,720g | Group avg: 1,650g"
```

---

### 5.2 Portfolio Metrics Page — Benchmark Section Update

```
LOCATION: /dashboard/metrics → scroll to Network Benchmark section (existing)

CURRENT DESIGN: Single unfiltered platform average cards
UPDATED DESIGN:

SECTION HEADER: "📊 Network Benchmark"
  Right: [View Detailed Benchmark →] link (navigates to /dashboard/metrics/benchmark)

FILTER PILLS (quick filters, no full page redirect):
  Breed: [All ●] [Ross 308] [Cobb 430] [Other]
  Region: [All ●] [My State] [My District]
  
  These filter pills immediately update the benchmark cards below.

BENCHMARK CARDS (4 cards):
  | Metric | Your Portfolio | Peer Group (filtered) | Top 25% |
  | FCR    | 1.82           | 1.90                  | 1.75    |
  | Mort%  | 0.40%          | 3.20%                 | 2.10%   |
  | ADG    | 51g            | 48g                   | 54g     |
  | Margin | 22%            | 18%                   | 24%     |
  
  Each card: your value (large, coloured), peer avg (small grey), top 25% (small purple)
  "Filtered: Cobb 430 | UP Region | Last 3 batches | 847 farms"

DATA PRIVACY CALLOUT (first-time users):
  ℹ "All benchmark data is fully anonymised. No individual farm data is ever exposed.
     Minimum 10 farms required in a filter group before data is shown."
```

---

## GAP 6: CALAMITY & OUTBREAK WARNING SYSTEM (PER-FARM RISK SCORE)

### Overview

**Problem:** FlockIQ alerts are district-level only. PoultryPlan has a Calamity Warning System that calculates per-farm risk scores based on proximity to outbreak, flock age, vaccination status, and biosecurity level. A farm 5km from an HPAI outbreak has very different risk than one 80km away.

**Design Approach:** Add per-farm risk scoring to the existing Alerts page. Also surface high-risk farms prominently on the Portfolio Metrics page and the Batch Status Board.

---

### 6.1 Alerts Page — Per-Farm Risk Score Section

```
ROUTE: /dashboard/alerts → Active Alerts tab → NEW SUB-SECTION at top

NEW SECTION: "⚠ Farm Risk Assessment"
Position: ABOVE the existing district-level alert cards (most prominent position)
Shows: only when there is an active HPAI/disease outbreak within 200km of any user farm

SECTION DESIGN:
┌────────────────────────────────────────────────────────────────────────────┐
│  🦠 HPAI Alert Active — Maharajganj District (60km from Gorakhpur)        │
│  Alert issued: Jun 1, 2026  |  Source: DAHDF Bulletin #2026-UP-042        │
│                                                                            │
│  PER-FARM RISK SCORES (updated every 6 hours):                           │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  Farm                   Distance   Flock Age   Vaccination  RISK    │ │
│  │  ─────────────────────────────────────────────────────────────────  │ │
│  │  Shivaji Poultry Farm   62 km      Day 21      ✓ Complete   MEDIUM  │ │
│  │                         ──────     ──────      ────────     🟡 5.2  │ │
│  │                                                             /10     │ │
│  │  Demo Farm 2            45 km      Day 8       ⚠ Partial   HIGH    │ │
│  │                                                             🔴 7.8  │ │
│  │                                                             /10     │ │
│  │  Demo Farm 3 (Empty)    80 km      No batch    N/A          LOW     │ │
│  │                                                             🟢 1.1  │ │
│  │                                                             /10     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  [View Risk Details for Each Farm →]                                      │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Risk Score Calculation (Displayed to User)

```
RISK SCORE: 0–10 scale (0 = no risk, 10 = maximum risk)
DISPLAYED AS: coloured badge (🟢 <4, 🟡 4–7, 🔴 >7)

RISK FACTORS (shown transparently to user — builds trust):
  Factor 1: Proximity to outbreak (0–4 points)
    - <20 km: 4 points
    - 20–50 km: 3 points
    - 50–100 km: 2 points
    - 100–200 km: 1 point
    - >200 km: 0 points
  
  Factor 2: Flock age vulnerability (0–2 points)
    - D1–D7 (chicks): 2 points (most susceptible)
    - D8–D21: 1.5 points
    - D22–D35: 1 point
    - D36+: 0.5 points (near harvest, shorter exposure window)
    - No active batch: 0 points
  
  Factor 3: Vaccination status (0–2 points)
    - No ND vaccination completed: 2 points
    - Partial vaccination: 1 point
    - Full vaccination complete: 0 points
  
  Factor 4: Reported farm biosecurity level (0–2 points)
    - Low (open access, no footbath): 2 points
    - Medium (some controls): 1 point
    - High (full biosecurity protocol): 0 points
    
    BIOSECURITY LEVEL is set during farm setup / can be updated in farm settings:
    [Low — Open access] [Medium — Basic controls] [High — Full protocol]

TOTAL = Sum of 4 factors, capped at 10
RISK LEVEL: LOW 0–3 | MEDIUM 4–7 | HIGH 8–10

NOTE FOR ENGINEER: Risk score recalculated every 6 hours for all active farms.
  Stored in farm_risk_scores table with: farm_id, alert_id, proximity_score,
  age_score, vaccination_score, biosecurity_score, total_score, calculated_at
```

---

### 6.3 Farm Risk Detail Page

```
TRIGGER: Click "View Risk Details for Each Farm →" from Alerts page
         OR click any farm's risk badge in risk score table

ROUTE: /dashboard/alerts/risk/[farmId]?alertId=[alertId]
DISPLAY: Full page OR right-panel drawer

CONTENT:
  HEADER:
    Farm: Shivaji Poultry Farm
    Alert: HPAI — Maharajganj (Jun 1, 2026)
    RISK SCORE: 🟡 5.2 / 10 — MEDIUM RISK
  
  MAP (Leaflet mini-map, 300px height):
    Shows: Farm location (green marker) + Alert epicentre (red marker) + Distance line
    "62 km from outbreak epicentre"
  
  RISK BREAKDOWN TABLE:
  ┌──────────────────────────────────────────────────────────────────┐
  │  Risk Factor              Score    Reasoning                    │
  │  ──────────────────────────────────────────────────────────────  │
  │  Proximity (62 km)        2/4      Within 50–100 km zone        │
  │  Flock Age (Day 21)       1.5/2    Growing — moderate exposure  │
  │  Vaccination Status       0/2      ND vaccination complete ✅   │
  │  Biosecurity Level        1.7/2    Medium biosecurity (set)     │
  │  ─────────────────────────────────────────────────────────────   │
  │  TOTAL RISK SCORE         5.2/10   MEDIUM RISK 🟡               │
  └──────────────────────────────────────────────────────────────────┘
  
  HOW TO REDUCE YOUR RISK (actionable recommendations):
    ┌────────────────────────────────────────────────────────────────┐
    │  To reduce your risk score from 5.2 to <4:                    │
    │                                                                │
    │  1. Upgrade biosecurity: Restrict external visitors, enforce  │
    │     footbath use at all entry points (−1.7 points)            │
    │                                                                │
    │  2. If birds are eligible: Emergency ND booster vaccination   │
    │     (−0.5 points if partial was the case)                     │
    │                                                                │
    │  3. Report any suspicious symptoms immediately to your vet     │
    │     and district animal husbandry department                  │
    └────────────────────────────────────────────────────────────────┘
  
  OFFICIAL RECOMMENDATIONS:
    "DAHDF Advisory: [View full bulletin →]"
    "UP Animal Husbandry Department helpline: 1800-180-5141"
  
  MONITORING FREQUENCY:
    "Risk score will be recalculated every 6 hours.
     You will receive WhatsApp notification if risk level changes."
  
  HISTORY of risk score changes for this farm:
    Jun 1 06:00 → 7.8 (alert issued)
    Jun 1 12:00 → 6.2 (distance confirmed: 62km, not 40km as initially reported)
    Jun 1 18:00 → 5.2 (vaccination status verified from health records)
```

---

### 6.4 Batch Status Board — Risk Overlay

```
LOCATION: /dashboard/batch-board — existing Kanban columns

ADD: Risk alert badge to batch cards when outbreak active

BATCH CARD UPDATE (when farm has risk score > 4):
┌────────────────────────────────────────────────────────┐
│  GKP-202605-001              🟡 RISK 5.2  ← NEW BADGE  │
│  Shed 1                                                 │
│  Day 21  🐔 12.4k  ⚖ 1.82 kg                          │
│  FCR: 1.82 ●  Mort: 0.40% ●                           │
│  ──────────────── 50%                                  │
│  Est. harvest: Jun 14-17                               │
│  [⚠ HPAI 62km away — View Risk →]                     │  ← NEW LINK
└────────────────────────────────────────────────────────┘

FILTER BAR UPDATE (Batch Status Board):
  [All ●] [Has Alert] [Log Missing] [FCR > 2.0] [Mortality > 4%] [HIGH RISK ▾]
  "HIGH RISK" filter shows all farms with risk score > 7
```

---

### 6.5 Portfolio Metrics — Risk Summary Card

```
LOCATION: /dashboard/metrics → below Pending Actions section (existing)

NEW CARD: "🦠 Disease Risk Monitor"
  Shown when any farm has risk score > 0 (i.e., any nearby outbreak active)
  
┌──────────────────────────────────────────────────────────────────────┐
│  🦠 Disease Risk Monitor                                            │
│                                                                      │
│  Active alerts in your region: 1                                    │
│  HPAI — Maharajganj District                                        │
│                                                                      │
│  Farm Risk Summary:                                                  │
│  ● Shivaji Farm: MEDIUM 5.2 🟡                                      │
│  ● Demo Farm 2: HIGH 7.8 🔴  ← action needed                       │
│  ● Demo Farm 3: LOW 1.1 🟢                                          │
│                                                                      │
│  [View Full Risk Details →]    [Alert Settings →]                   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## GAP 7: DOCUMENT LIBRARY PER FLOCK / FARM

### Overview

**Problem:** PoultryPlan has a "Flock Document Library" where every batch can have associated documents: purchase invoices, lab reports, vaccination certificates, government movement permits, buyer invoices. FlockIQ has no document attachment capability anywhere.

**Design Approach:** Add a **"Documents"** tab to Farm Detail page. Documents are organised by batch and by document type. This serves audit, insurance, and government inspection needs globally.

**Global Note:** Document traceability requirements exist in all markets (India, EU, USA, SEA). The design is market-neutral with document type labels adaptable to local regulations.

---

### 7.1 Documents Tab — Page Layout

```
ROUTE: /dashboard/farms/[id] → Tab: "Docs"
TAB POSITION: Last tab (after Sales, Batch History)
TAB ICON: 📄
TAB LABEL: "Docs" (bilingual: "Docs / दस्तावेज़")
```

```
PAGE STRUCTURE:

─── DOCUMENT STORAGE INFO BAR (top) ──────────────────────────────────────
  "22 documents · 45.2 MB used of 500 MB"
  [Upload Document +]  [📁 Folder View ▾]  [🔍 Search docs...]

─── BATCH SELECTOR (tabs or dropdown) ────────────────────────────────────
  [All Batches ●] [Batch #24 (Current)] [Batch #23] [Batch #22] [Farm-Level Docs]
  
  "Farm-Level Docs" = documents not tied to a specific batch (registrations, maps, permits)

─── DOCUMENT CATEGORY SECTIONS (accordion) ───────────────────────────────
  For each batch: documents shown in categorised sections

  SECTION 1: Chick Purchase Documents
    Category icon: 🐣
    Documents shown as cards: thumbnail + filename + date + [Download] [Delete]
    [+ Upload Invoice] button
  
  SECTION 2: Feed Purchase Invoices
    Category icon: 🌽
    [+ Upload Invoice] button
    Links to Feed Purchase Log entries (documents can be attached per purchase entry)
  
  SECTION 3: Vaccination & Health Certificates
    Category icon: 💉
    Includes: vaccination completion certificates, vet visit records, lab reports
    [+ Upload Document] button
  
  SECTION 4: Medicine Purchase Bills
    Category icon: 💊
    [+ Upload Bill] button
    Links to Treatment Log entries
  
  SECTION 5: Movement Permits (India: Form 8 / Transport Permit)
    Category icon: 🚛
    Includes: government movement permits, transport challans
    [+ Upload Permit] button
  
  SECTION 6: Sales / Buyer Invoices
    Category icon: 💰
    Includes: sale invoices, weighment slips, buyer challans
    [+ Upload Invoice] button
    Links to Sales & Lifting tab entries
  
  SECTION 7: Lab Test Reports
    Category icon: 🧪
    Includes: water quality tests, litter tests, post-mortem reports
    [+ Upload Report] button
  
  SECTION 8: Insurance Documents
    Category icon: 🛡️
    [+ Upload Policy / Claim] button
  
  SECTION 9: Other / Miscellaneous
    [+ Upload Document] button

─── DOCUMENT CARD DESIGN ─────────────────────────────────────────────────
  ┌──────────────────────────────────────────────────────────┐
  │  [📄 thumbnail or type icon]                            │
  │                                                          │
  │  DOC Purchase Invoice — Godrej Agrovet              [⋮] │
  │  Uploaded: May 10, 2026 · PDF · 245 KB                  │
  │  Batch: #24  |  Tagged: Chick Purchase                  │
  │                                                          │
  │  [👁 Preview] [⬇ Download] [✏ Rename] [🗑 Delete]       │
  └──────────────────────────────────────────────────────────┘

─── DOCUMENT UPLOAD FLOW ─────────────────────────────────────────────────
  TRIGGER: Any [+ Upload] button
  
  UPLOAD MODAL (centred, 480px):
  Title: "Upload Document — Batch #24"
  
  STEP 1: FILE SELECTION
    Drag & drop zone: "Drag PDF, JPG, or PNG here, or click to browse"
    Accepted: PDF, JPG, JPEG, PNG, HEIF (iPhone photo)
    Max size: 10 MB per file
    Max files per batch: 50
  
  STEP 2: DOCUMENT DETAILS (after file selected)
    Preview: thumbnail or PDF icon
    Document Name: [auto-populated from filename, editable]
    Document Type: [dropdown — categories from sections above]
    Batch: [Batch #24 ●] [Farm-Level]
    Date of Document: [date picker — important for sorting]
    Notes: [optional, 200 chars]
    Tags: [Invoice] [Certificate] [Permit] [Report] [Other] — multi-select chips
    
    [Upload ✓] button  →  uploads to Supabase Storage
                        →  creates document record in DB
                        →  appears in relevant section card
  
  UPLOADING STATE: progress bar + file name + cancel option
  SUCCESS STATE: green checkmark + "Document saved" + [Upload Another] [Done]

─── SEARCH & FILTER (header search bar) ─────────────────────────────────
  Full-text search across document names, notes, tags
  Filters: [Date Range] [Document Type] [Batch]
  Results shown as list view with match highlighting

─── DOCUMENT AUDIT TRAIL ────────────────────────────────────────────────
  Below document list: "Document Activity Log" (expandable)
  Shows: who uploaded/deleted/downloaded documents + timestamps
  Important for multi-user farms (manager + owner accountability)
```

---

### 7.2 Batch Closure Report — Auto-Generated Document

```
TRIGGER: Batch Close Wizard → Step 3 → [✓ Download Batch Closure Report]
FORMAT: PDF (auto-generated by server)
AUTO-SAVED to Documents tab → "Batch Closure Reports" section

PDF CONTENT STRUCTURE:
  Page 1: Cover page
    FlockIQ logo | Farm name | Batch number | Date closed
    Summary: Duration, total birds, final FCR, mortality, revenue, profit
  
  Page 2: Performance vs Benchmarks
    FCR Trend chart | Weight Progression chart
    vs breed standard | vs platform benchmark
  
  Page 3: Complete P&L Statement
    Full cost breakdown table | Revenue table | Net profit
    Gross margin % | Cost per kg live weight
    
  Page 4: Health Events Summary
    Vaccination schedule completion
    Treatment log summary
    Health events chronology
    Withdrawal compliance ✅
  
  Page 5: Environment Summary
    Average temp/humidity per week
    Ammonia level trend
    Any environmental health events
  
  Page 6: Documents Checklist
    Lists all documents attached to this batch
    "This batch has: ✓ Purchase invoice | ✓ Sale invoice | ✓ Vacc cert | ✗ Movement permit"
    Good for audit preparation
  
  Footer: "Generated by FlockIQ on [date] | Batch data is self-reported by the farm manager"
```

---

### 7.3 Documents on Other Pages — Integration Points

```
FARM CARD (Portfolio page / My Farms):
  Add "📄 N docs" badge to farm cards when documents are present
  Shows count of documents for the active batch

SALES & LIFTING TAB:
  Each sale entry row: [📎 Attach Invoice] button
  Clicking → upload shortcut directly from sales row
  Once attached: shows document name with link

TREATMENT LOG:
  Each treatment row: [📎 Attach Prescription / Bill] button
  Medical traceability: attach the vet's prescription or pharmacy bill

FEED PURCHASE LOG:
  Each purchase row: [📎 Attach Invoice] button

BATCH STATUS BOARD (Harvest Ready column):
  Cards show "📄 Docs ready" or "⚠ 2 docs missing" badge
  Missing docs alert: if batch entering Harvest Ready without sale invoice
  "Consider attaching movement permit and buyer contact before lifting"
```

---

## SHARED DESIGN PATTERNS (ACROSS ALL 7 GAPS)

### Data Entry Forms — Universal Standards

```
All new forms follow these standards (consistent with v2.0 design):

1. INLINE FORMS (not modals) for simple single-record entry
   Forms expand within the section card, not in a separate modal
   Reduces context switching on mobile

2. DRAWER PATTERN (right-side, 600px) for complex multi-field forms
   Used for: Bird Lifting/Sale events, Full Treatment entries
   Drawer overlays content, does not replace it
   Mobile: full-screen bottom sheet

3. FIELD VALIDATION:
   - Real-time validation as user types (not just on submit)
   - Error messages below field in red, 12px
   - Success indicators: green checkmark on field right side
   - Required fields: asterisk (*) + helper text "Required"

4. AUTO-COMPUTATION:
   - Derived fields (Revenue, FCR, Cost per bird) update in real-time
   - Shown in read-only fields with grey background + "Auto-calculated" label
   - Calculation formula shown on hover tooltip

5. AUTO-SAVE:
   - Draft saving every 30 seconds while form is open (IndexedDB)
   - "Draft saved" shown in bottom-left corner
   - Restores draft if user navigates away and returns

6. SUBMIT CONFIRMATION:
   - Toast: "✓ Saved" (3 seconds, top-right)
   - For significant actions (Close Batch, Record Sale): confirm modal with summary

7. BILINGUAL FIELD LABELS:
   All field labels show English + Hindi below (smaller, muted)
   Example: "Birds Dead Today" / "आज मरी हुई मुर्गियां"
```

### Cross-Tab Data Flows

```
The 7 new features are not isolated — they share data:

TREATMENT LOG (Gap 3) → P&L Tab (Gap 1) → Medicine Cost section
  When treatment is saved with cost → medicine cost auto-appears in P&L

SALES & LIFTING (Gap 2) → P&L Tab (Gap 1) → Revenue section
  When sale is saved → revenue updates in P&L summary

SALES & LIFTING (Gap 2) → Withdrawal Tracker (Gap 3)
  Sale cannot be recorded if withdrawal period is active (blocked by validation)

ENVIRONMENT DATA (Gap 4) → Health Tab
  High humidity/ammonia → auto-creates health alert in symptom log

DOCUMENT UPLOAD (Gap 7) → Multiple tabs
  Documents attached in Feed/Sales/Treatment tabs appear in Documents tab

RISK SCORE (Gap 6) → Batch Status Board + Portfolio Metrics
  Risk score shown on farm cards and batch cards everywhere

BENCHMARK (Gap 5) → Portfolio Metrics (existing)
  Benchmark section on metrics page now uses new filtered benchmark engine
```

### Empty States for All New Features

```
Each new section has a specific, helpful empty state:

P&L Tab (no costs entered):
  Illustration: simple ledger/coin icon (SVG, brand colours)
  Hindi: "इस बैच की लागत अभी दर्ज नहीं है"
  English: "No costs tracked for this batch yet"
  Sub: "Start by adding your chick procurement cost above"
  CTA: [Add Chick Cost →] (scrolls to Section 1)

Sales Tab (no sales):
  Illustration: truck/harvest icon (SVG)
  Hindi: "अभी कोई बिक्री दर्ज नहीं"
  English: "No lifting events recorded yet"
  Sub: "Record your first sale when birds are ready for harvest"
  CTA: [+ Record First Sale →]

Treatment Log (no treatments):
  Illustration: medical kit icon (SVG)
  Hindi: "इस बैच में कोई उपचार दर्ज नहीं"
  English: "No treatments recorded for this batch"
  Sub: "Add a treatment record when your vet prescribes medication"
  CTA: [+ Add First Treatment →]

Documents Tab (no documents):
  Illustration: folder/document stack icon (SVG)
  Hindi: "कोई दस्तावेज़ अभी तक अपलोड नहीं किए"
  English: "No documents uploaded yet"
  Sub: "Upload invoices, certificates, and permits for easy access and audit readiness"
  CTA: [+ Upload First Document →]

Benchmark Page (not enough data):
  Shows if user has fewer than 2 completed batches:
  "You need at least 2 completed batches to see benchmark comparisons"
  "You have 1 batch. Complete your next batch and benchmarks will appear automatically."

Risk Assessment (no active alerts):
  Shows green checkmark
  "No active disease alerts near your farms"
  "FlockIQ monitors HPAI and other disease alerts within 200km of your farms"
```

---

## NAVIGATION UPDATES (Sidebar + Farm Detail Tabs)

### Updated Sidebar Navigation

```
── FARM OPERATIONS ─────────────────────────────────────────────────
  🏠 My Farms              /dashboard/farms
  📋 Batch Status Board    /dashboard/batch-board
  🧬 Feed Intelligence     /dashboard/feed
  🔍 Middleman Check       /dashboard/middleman

── ANALYTICS ───────────────────────────────────────────────────────
  📊 Portfolio Metrics     /dashboard/metrics
  📈 Benchmark             /dashboard/metrics/benchmark    ← NEW
  📄 Reports               /dashboard/reports
  🧮 Calculator            /dashboard/calculator
```

### Updated Farm Detail Tabs

```
CURRENT TABS (v2.0):
  [📊 Metrics] [📅 Daily Log] [🏥 Health] [🌾 Feed] [📋 Batch History] [📲 WhatsApp]

NEW TABS (Gap Remediation v1.0):
  [📊 Metrics] [📅 Daily Log] [🏥 Health] [🌾 Feed] [💰 P&L] [🚛 Sales] [📋 History] [📄 Docs] [📲 WhatsApp]

TABS THAT CHANGE CONTENT:
  [🏥 Health] — adds Treatment Log section + Withdrawal Tracker (Gap 3)
  [📅 Daily Log] — adds Environment Data fields (Gap 4)
  [📊 Metrics] — adds Environment Trend Charts (Gap 4)

TABS THAT ARE NEW:
  [💰 P&L]  — new (Gap 1)
  [🚛 Sales] — new (Gap 2)
  [📄 Docs]  — new (Gap 7)

NOTE: Tab bar may overflow on narrow screens (≤480px).
  On mobile: tabs become horizontally scrollable (swipe to reveal more tabs)
  Active tab stays centered when scrolled to
  Minimum tab width: 64px on mobile (icon + 2-char label)
```

---

## GLOBAL MARKET ADAPTATIONS

```
All 7 gap features are designed to work globally. Specific adaptations:

CURRENCY:
  All monetary fields: use user's currency setting from Settings → Profile
  Default: ₹ INR for India users
  Also supported: $ USD, € EUR, Rp IDR (Indonesia), ₫ VND (Vietnam), Riyals SAR

DOCUMENT TYPES (Gap 7):
  India: Form 8 (movement permit), FSSAI certificate, NABARD documents
  Indonesia: Surat Keterangan Asal (movement permit), BPOM clearance
  Global: generic "Government Permit" + custom label option
  User can rename document categories

MEDICINE DATABASE (Gap 3):
  Pre-loaded common medicines for India (Tylosin, Enrofloxacin, Oxytetracycline, etc.)
  Withdrawal periods pre-filled based on India FSSAI guidelines
  Global: generic withdrawal period entry, no pre-filled suggestions outside India (Phase 2)
  API: VetGlobal or custom DB can be integrated in Phase 3

BENCHMARK DATA (Gap 5):
  India: sufficient data from Phase 1 (Gorakhpur launch)
  SEA markets: platform benchmarks will be sparse initially
  "Group too small to show benchmark" graceful fallback shown when <10 farms in filter group
  Global benchmarks from Aviagen/Cobb breed performance objectives always shown

RISK SCORE (Gap 6):
  Outbreak data sources:
    India: DAHDF bulletins, NADCP, state AHD
    Global: OIE/WOAH WAHIS, FAO EMPRES-i
  Disease types tracked: HPAI, NDV, IBD, Marek's, Infectious Bronchitis
  Risk score algorithm is market-neutral (proximity + age + vaccination + biosecurity)
```

---

*End of FlockIQ Gap Remediation Design Master v1.0*
*Companion files: FlockIQ_Gap_Remediation_Requirements_v1.md | FlockIQ_Gap_Remediation_Tasks_v1.md*
*References: FlockIQ_Updated_Design_Master_v2.md | https://www.poultry.care/broiler-management | https://www.poultryplan.com/solutions/optibroilers*
