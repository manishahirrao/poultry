# PoultryPulse AI — Dashboard Design Addendum v1.0
**Document Type:** Design Specification Addendum — Navfarm Competitive Parity  
**Version:** Addendum 1.0 · May 2026  
**Extends:** PoultryPulse_Dashboard_Design_v1.md (Sections 1–10)  
**Classification:** CONFIDENTIAL — Engineering & Design Use  
**Kiro Note:** Merge into base Design document before Kiro project initialization. New sections begin at §11.

---

## §11. Batch Lifecycle Management — Design Specifications

### §11.1 Batch Status Board (Kanban View)

**File:** `components/batch/BatchStatusBoard.tsx`  
**Route:** `/dashboard/batches`  
**Visible to:** All roles (S1 sees own batches only; S2 sees all contract farm batches)

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│  बैच स्टेटस बोर्ड · Batch Status Board      [+ नया बैच]  [Filter ▼]     │
├─────────────┬──────────────┬──────────────┬──────────────┬──────────────┤
│ Placement   │ Growing      │ Pre-Harvest  │ Harvest Ready│ Harvested    │
│ Day 1–7     │ Day 8–28     │ Day 29–42    │ Day 43+      │ Complete     │
│             │              │              │              │              │
│ ┌─────────┐ │ ┌─────────┐  │ ┌─────────┐  │ ┌─────────┐  │ ┌─────────┐ │
│ │GKP-001  │ │ │GKP-002  │  │ │GKP-003  │  │ │GKP-004  │  │ │GKP-000  │ │
│ │Shed 1   │ │ │Shed 2   │  │ │Shed 1   │  │ │Shed 3   │  │ │Shed 1   │ │
│ │Day 3    │ │ │Day 18   │  │ │Day 35   │  │ │Day 44   │  │ │Harvested│ │
│ │25,000🐤 │ │ │25,000🐤 │  │ │24,800🐤 │  │ │24,500🐤 │  │ │24,100🐤 │ │
│ │1.45 kg  │ │ │         │  │ │1.82 kg  │  │ │2.10 kg  │  │ │2.18 kg  │ │
│ │FCR: 1.5 │ │ │FCR: 1.8 │  │ │FCR: 1.9 │  │ │FCR: 2.1 │  │ │P: ₹1.2L │ │
│ │         │ │ │         │  │ │         │  │ │⭐ SELL  │  │ │         │ │
│ └─────────┘ │ └─────────┘  │ └─────────┘  │ └─────────┘  │ └─────────┘ │
└─────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

**Batch Card Design:**
```typescript
interface BatchCardProps {
  batchId: string;
  shedId: string;
  ageDays: number;
  birdCount: number;
  avgWeightKg: number | null;    // null if no weigh event yet
  fcr: number | null;
  status: BatchStatus;
  sellSignal: 'sell' | 'hold' | 'caution' | 'withdrawal'; // withdrawal = new state
  netProfit?: number;            // only for Harvested column
  mortalityPct: number;
}
```

**Card States:**
- `withdrawal`: Grey badge "HOLD — Withdrawal" — overrides any price signal (REQ-015 §15.6)
- `sell`: Green border glow + ⭐ SELL badge
- `hold`: Amber border + ⏳ HOLD badge
- `caution`: Red border + ⚠️ CAUTION badge

**Card Interaction:**
- Click → opens Batch Detail Drawer (full right panel, 480px wide on desktop)
- Drag to adjacent column (only allowed for natural progression: Growing → Pre-Harvest etc.)

---

### §11.2 Batch Registration Form

**File:** `components/batch/BatchRegistrationForm.tsx`  
**Trigger:** "+ नया बैच" button on Batch Status Board

**Mobile — Step-by-step Wizard (4 steps):**
```
STEP 1: बैच जानकारी (Batch Info)
┌─────────────────────────────┐
│ शेड नंबर: [Shed 1 ▼]        │
│ DOC तारीख: [16/06/2026 📅]  │
│ DOC संख्या: [25000]         │
│ DOC सप्लायर: [Navbharat ▼]  │
│                             │
│         [अगला →]            │
└─────────────────────────────┘

STEP 2: नस्ल (Breed)
┌─────────────────────────────┐
│ [Cobb 500] [Ross 308]       │
│ [Vencobb]  [Hubbard]        │
│ [Other ___]                 │
│                             │
│ टारगेट वज़न: 2.2 kg (auto)  │
│         [अगला →]            │
└─────────────────────────────┘

STEP 3: चारा (Feed)
┌─────────────────────────────┐
│ प्रारंभिक चारा ब्रांड:      │
│ [Godrej Agrovet ▼]         │
│                             │
│ स्टार्टर चारा: [___] kg     │
│         [अगला →]            │
└─────────────────────────────┘

STEP 4: पुष्टि (Confirm)
┌─────────────────────────────┐
│ GKP-202606-005 बनाया जाएगा │
│ शेड 1 · 25,000 पक्षी       │
│ DOC: 16 Jun · Cobb 500     │
│                             │
│ [✓ बैच शुरू करें]          │
└─────────────────────────────┘
```

**Desktop:** Single-page form with all 4 sections visible simultaneously (2-column layout).

---

### §11.3 Batch Detail Drawer

When a batch card is clicked, a right-side drawer slides in (480px wide, full height):

```
┌─────────────────────────────────────────────────────┐
│ GKP-202606-004 · Shed 3          ✕                 │
│ Day 44 · 24,500 birds · Cobb 500                   │
│                                                     │
│ ── LIVE STATUS ──────────────────────────────────   │
│  Weight: 2.10 kg  FCR: 2.1  Mortality: 2.04%       │
│  ⭐ [SELL NOW] — Price ₹164.20/kg today            │
│                                                     │
│ ── TABS ─────────────────────────────────────────   │
│ [Overview] [Feed] [Health] [Mortality] [Costs]     │
│ ─────────────────────────────────────────────────   │
│                                                     │
│  [Overview tab content — performance charts]        │
│                                                     │
│ ── ACTIONS ──────────────────────────────────────   │
│ [📊 Open ROI Optimizer]  [📋 View Traceability]    │
│ [✅ Mark as Harvested]                              │
└─────────────────────────────────────────────────────┘
```

**Drawer Tabs:**
- `Overview`: Performance spider chart vs benchmarks, key KPIs
- `Feed`: FCR trend chart, daily feed log, feed allocation recommendation
- `Health`: Vaccination timeline, medication log, health checklist history
- `Mortality`: Cumulative mortality chart by cause, abnormal alert history
- `Costs`: Running batch P&L (actual costs vs projected)

---

## §12. FCR Analytics — Design Specifications

### §12.1 FCR Dashboard Widget

**File:** `components/feed/FcrDashboard.tsx`

**FCR Gauge:**
```
        OPTIMAL  ACCEPTABLE  HIGH
    ╔═══════════════════════════╗
    ║  [■■■■■■■■░░░░░░░░░░░░]  ║
    ║   1.0         2.0     3.0 ║
    ║          FCR: 1.91        ║
    ║   ▲ Breed Standard: 1.75  ║
    ╚═══════════════════════════╝
```

**FCR Trend Chart:**
```
FCR
2.5│
   │          actual FCR
2.0│  -----/-------           (breed standard dashed)
   │ /
1.5│/
   └──────────────────────────── Days
    7   14   21   28   35   42
   
    Shaded region: deviation above standard
    Color: amber at <15% deviation, red at >15%
```

**Daily Feed Allocation Recommendation Card:**
```
┌─────────────────────────────────────────────────────┐
│ 🌾 कल के लिए चारे की सिफारिश                       │
│                                                     │
│         कुल: 3,960 kg                              │
│         सुबह: 1,980 kg  ·  शाम: 1,980 kg           │
│                                                     │
│ आधार: 24,500 पक्षी × 0.162 kg/पक्षी (Day 44 मानक) │
│                                                     │
│  [रसोई में लॉग करें]  [बदलें]                       │
└─────────────────────────────────────────────────────┘
```

**Feed-Water Ratio Alert Card** (new alert type, appears in Alert Intelligence Center):
```
┌────────────────────────────────────────────────────┐
│ 🚰 पानी कम पिया जा रहा है          🟡 MEDIUM      │
│                                                    │
│ आज चारा-पानी अनुपात: 1:1.6                       │
│ मानक: 1:1.8 से 1:3.5                              │
│                                                    │
│ संभावित कारण: गर्मी या बीमारी                     │
│ आपके झुंड पर असर: ~₹15,000–₹30,000              │
│                                                    │
│ [जाँच करें — Health Checklist खोलें]              │
└────────────────────────────────────────────────────┘
```

---

## §13. Health, Vaccination & Biosecurity — Design Specifications

### §13.1 Vaccination Calendar View

**File:** `components/health/VaccinationCalendar.tsx`

```
JUNE 2026
Mo  Tu  We  Th  Fr  Sa  Su
         1   2   3   4   5
 6   7   8   9  10  11  12
13  [14] 15  16  17  18  19   ← 14 Jun: Newcastle IBD (Day 14)
20  21  22  [23] 24  25  26   ← 23 Jun: IB Spray (Day 23)
27  28  29  30

[14] = highlighted vaccination day (tappable → vaccine detail modal)
```

**Vaccination Detail Modal:**
```
┌──────────────────────────────────────┐
│ Newcastle Disease Vaccine · Day 14   │
│ Batch: GKP-202606-004               │
│                                      │
│ Vaccine: La Sota strain              │
│ Route: Drinking water                │
│ Dose: 1 dose/bird                    │
│                                      │
│ Status: ✅ Completed — 14 Jun       │
│ Brand: Venky's ND-La Sota           │
│ Batch No: VEN2026/04/1234           │
│ Given by: Ram Prasad (supervisor)   │
│                                      │
│           [Close]                    │
└──────────────────────────────────────┘
```

**Upcoming Vaccination Reminder (WhatsApp format):**
```
🐔 *PoultryPulse — टीकाकरण अनुस्मारक*

कल (14 Jun) को GKP-202606-004 का
Newcastle Disease Vaccine देना है।

✅ विवरण: La Sota · पीने के पानी में
📋 Checklist भरना न भूलें

[ऐप में देखें: poulse://batch/GKP-202606-004/vaccination]
```

### §13.2 Biosecurity Audit Form & Score Gauge

**Biosecurity Score Gauge (D3 arc):**
```
            100
         80     (GOOD)
        /   \
   60 ─┤  72 ├─ 80
        \   /
         40  
          (POOR)
```

Color zones: 80–100 = green (Excellent), 60–80 = amber (Acceptable), 40–60 = orange (Needs Improvement), < 40 = red (Critical Risk)

**Audit Form Design:** A mobile-optimized checklist with Yes (green tap) / No (red tap) / Partial (amber tap) options for each of 12 biosecurity items. Score computed live as items are tapped. Submit button active only after all 12 items are answered.

### §13.3 Sell Signal Withdrawal Override — Visual Treatment

When a batch is in medication withdrawal period, the Sell Signal badge on ALL surfaces (Batch Card, Price Hero, WhatsApp) shows:

```
┌────────────────────────────────┐
│  🚫  HOLD — Withdrawal Period  │
│  ⏱ 4 days remaining           │
│  Ends: 20 Jun 2026            │
│                                │
│  कानूनी: इस तारीख से पहले     │
│  बेचना मना है                  │
└────────────────────────────────┘
```
Color: Grey background (neutral-400), white text — explicitly NOT the same red as CAUTION so farmers understand this is a legal hold, not a market signal.

---

## §14. Mortality Tracking — Design Specifications

### §14.1 Daily Mortality Entry Screen (Mobile)

**Design principle:** This is the most frequently used data entry screen after the home tab. It must be completable in < 30 seconds.

```
┌─────────────────────────────────────┐
│ आज की मृत्यु · Today's Mortality   │
│ GKP-202606-004 · Day 44            │
│                                     │
│  कितने पक्षी मरे?                  │
│  ┌─────────────────────────────┐   │
│  │  [  -  ]  [ 12 ]  [  +  ]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  कारण:                             │
│  [श्वसन] [पेट] [गर्मी] [चोट]      │
│  [ठंड]   [अज्ञात]  [अन्य]         │
│                                     │
│  📷 फोटो (वैकल्पिक)                │
│                                     │
│  [✓ दर्ज करें — 3 seconds]         │
└─────────────────────────────────────┘
```

The count input uses a large +/- stepper (not a keyboard) — easier to use in a shed with gloves.

### §14.2 Cumulative Mortality Dashboard

```
MORTALITY DASHBOARD — GKP-202606-004
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Placed:  25,000  Alive: 24,493  Dead: 507
Cumulative Rate: 2.03%  (Standard: <3.5% at Day 44 ✅)

BY CAUSE (pie or H-bar):
Respiratory  ████████████ 38%  (192 birds)
Unknown      ████████     25%  (127 birds)
Heat Stress  ██████       18%  (91 birds)
Digestive    ████         12%  (61 birds)
Other        ██            7%  (36 birds)

DAILY TREND CHART:
Deaths/day
  8│    ·
  6│  ·   ·
  4│·       ·   ·  ·
  2│          ·       ·  ·  ·
  0└────────────────────────────── Days
   1  7  14  21  28  35  42
   
   ─── Actual  ·····Standard (0.3/day at Day 44)
```

**Abnormal Mortality Alert Card:**
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  असामान्य मृत्यु              🔴 CRITICAL        │
│                                                     │
│ आज 28 पक्षी मरे — 7-दिन के औसत (8/दिन) से 3.5×   │
│                                                     │
│ आपके झुंड पर असर: ~₹28,000–₹56,000              │
│ सुझाव: तुरंत पशु चिकित्सक को बुलाएं             │
│                                                     │
│ [Health Checklist भरें]  [Doctor ढूंढें]          │
└─────────────────────────────────────────────────────┘
```

### §14.3 Performance Benchmarking — Spider Chart

**File:** `components/batch/PerformanceBenchmarkChart.tsx`  
**Library:** Recharts `RadarChart` + `PolarGrid`

```
              FCR (lower=better)
               ★ 1.91
              / \
     Mortality/   \Avg Harvest
     1.9% ★   \   ★ Weight
              \  2.10kg
               ★
        Net   / ★  Feed Cost
       Profit/   /kg Meat
       ₹4.2/bird ★

LEGEND:
━━ This Batch      (blue)
- - District Avg   (grey dashed)
···  Breed Standard (green dotted)
```

Axes are normalized 0–1 (best to worst) so the radar is always legible regardless of unit differences.

---

## §15. Field Worker Supervisor App — Design Specifications

### §15.1 Supervisor Role — Simplified App Shell

The supervisor view of the mobile app uses a **3-tab structure** (not 4), with no price forecast tab:

| Tab # | Label (Hindi) | Icon | Content |
|---|---|---|---|
| 1 | आज का काम (Today's Work) | checklist | Daily health checklist + mortality entry + feed log |
| 2 | मेरी रिपोर्ट (My Reports) | history | Last 7 days of submissions with sync status |
| 3 | मेरा खाता (Account) | user | Assigned sheds, supervisor name, support |

**Missing Tabs vs Farmer App:** The price forecast tab and batch optimizer tab are completely hidden from supervisors.

### §15.2 Today's Work Screen (Supervisor)

```
┌─────────────────────────────────────────────────────┐
│  सुप्रवाइज़र: राम प्रसाद · आज 16 Jun              │
│  शेड 1 और शेड 2                                   │
├─────────────────────────────────────────────────────┤
│  📋 शेड 1 — सुबह चेकलिस्ट        ✅ पूरा         │
│  📋 शेड 2 — सुबह चेकलिस्ट        ⏳ बाकी है      │
│  ⚖️  शेड 1 — चारा लॉग            ✅ पूरा          │
│  ⚖️  शेड 2 — चारा लॉग            ⏳ बाकी है      │
│  💀 शेड 1 — मृत्यु लॉग           ✅ पूरा          │
│  💀 शेड 2 — मृत्यु लॉग           ⏳ बाकी है      │
├─────────────────────────────────────────────────────┤
│  📶 Offline Mode — 2 records pending sync           │
└─────────────────────────────────────────────────────┘
```

**Sync Status Indicator:** A persistent strip at the bottom of the supervisor app showing offline status and pending sync count. Green when all synced, amber when records pending, red when oldest pending > 24h.

### §15.3 QR Code Scan for Inventory

```
┌─────────────────────────────────────────────────────┐
│  📦 QR स्कैन · Inventory                           │
│                                                     │
│  ┌─────────────────────────────────────┐           │
│  │          [Camera View]              │           │
│  │                                     │           │
│  │     [Scan QR code on bag/box]       │           │
│  └─────────────────────────────────────┘           │
│                                                     │
│  या मैन्युअल चुनें:                               │
│  [Godrej Starter ▼]                                │
│                                                     │
│  मात्रा: [___] kg                                  │
│  [✓ उपयोग दर्ज करें]                               │
└─────────────────────────────────────────────────────┘
```

After scan: camera closes, item name appears pre-filled, user only enters quantity. If QR not recognized → manual fallback selection shown.

---

## §16. Inventory & Costing — Design Specifications

### §16.1 Inventory Stock Overview

**File:** `components/inventory/StockOverview.tsx`

```
┌──────────────────────────────────────────────────────────────┐
│  स्टॉक सारांश · Inventory Summary              [+ खरीदें]  │
├────────────────┬──────────────────────────────────────────────┤
│  FEED          │  ████████████████░░░░  4,200 kg             │
│                │  Min: 2,000 kg  ·  Lasts: ~4 days ✅         │
├────────────────┼──────────────────────────────────────────────┤
│  MEDICINES     │  ██░░░░░░░░░░░░░░░░░░  3 items               │
│                │  ⚠ Tylosin — only 2 vials left               │
├────────────────┼──────────────────────────────────────────────┤
│  VACCINES      │  ████████████░░░░░░░░  8 doses               │
│                │  Next vaccination in 4 days — sufficient ✅  │
└────────────────┴──────────────────────────────────────────────┘
```

**Low Stock Alert Card** (Alert Intelligence Center, new type: `low_stock`):
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ कम स्टॉक · Low Stock                🟡 MEDIUM   │
│                                                     │
│ Maize — current: 2,200 kg                          │
│ FCR 2.1 पर: ~2.6 दिन बचा है                       │
│                                                     │
│ [खरीद ऑर्डर बनाएं]                                 │
└─────────────────────────────────────────────────────┘
```

### §16.2 Batch P&L Real-Time View

**File:** `components/batch/BatchPnL.tsx`

```
BATCH P&L — GKP-202606-004 · Day 44
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REVENUE (projected at today's price)
  24,493 birds × 2.10 kg × ₹164.20/kg    = ₹8,44,270

COSTS (actual to date)
  DOC cost (25,000 × ₹42)                = ₹10,50,000
  Feed cost (48,300 kg × ₹24.80/kg)      = ₹11,97,840
  Medicine & Vaccine                      = ₹   18,500
  Labor (₹800/day × 44 days)             = ₹   35,200
  Electricity                             = ₹    9,600
  Overhead                                = ₹   12,000
                                    ─────────────────
  TOTAL COST                              = ₹23,23,140

NET PROFIT (projected)                   = ₹ -4,78,870 🔴
NET PROFIT PER BIRD                      = ₹ -19.55/bird

💡 Wait 7 days: price ₹168/kg → NET PROFIT = +₹1,23,400 ✅
   [ROI Optimizer खोलें →]
```

The negative current-day profit shown alongside the positive wait-7-days scenario is the most powerful possible motivator to use the ROI Optimizer.

---

## §17. IoT Smart Farm Dashboard — Design Specifications

### §17.1 Shed Environment Panel

**File:** `components/iot/ShedEnvironmentPanel.tsx`  
**Visible:** Only for customers with registered IoT devices

```
SHED ENVIRONMENT — Shed 3  [Last updated: 2 min ago]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌡️  Temperature   [══════████════]  34.2°C  🟡 HIGH
💧  Humidity       [════████═════]   62%    ✅ OK
🫁  Ammonia        [████══════════]   8 ppm  ✅ OK
💧  Water Flow     [══════════████]  Auto   ✅ Connected

24H TREND CHART:
      ╭──╮    ╭─────╮
34°C─╯  ╰──╯         ╰──...  Temperature (current: 34.2°C)
      ─ ─ ─ ─ ─ ─ ─ ─ ─      Safe max (28°C dashed)

ACTIVE DEVICE STATUS:
🟢 Temp/Humidity Sensor  ·  Last: 2 min ago
🟢 Water Meter           ·  Last: 5 min ago
🔴 Feed Silo Sensor      ·  OFFLINE — check connection
```

**IoT Out-of-Range Alert** (new alert type: `iot_environment`):
```
┌─────────────────────────────────────────────────────┐
│ 🌡️ Shed 3 — बहुत गर्म             🔴 CRITICAL      │
│                                                     │
│ तापमान: 39.4°C (मानक: < 28°C)                     │
│ अंतिम 2 घंटों से HIGH                              │
│                                                     │
│ आपके झुंड पर असर: ~₹25,000–₹80,000              │
│                                                     │
│ [वेंटिलेशन बढ़ाएं]  [पशु चिकित्सक को बुलाएं]    │
└─────────────────────────────────────────────────────┘
```

---

## §18. Traceability & Compliance — Design Specifications

### §18.1 Batch Traceability Report (FSSAI Format)

**Generated by:** `src/lib/traceabilityReportGenerator.ts` using `@react-pdf/renderer`

**PDF Layout:**
```
┌─────────────────────────────────────────────────────┐
│  🐔 POULTRYPULSE AI                    [QR CODE]    │
│  FSSAI Batch Traceability Report                    │
│  ────────────────────────────────────────────────   │
│  Batch ID: GKP-202606-004                          │
│  Farm District: Gorakhpur, UP                      │
│  Breed: Cobb 500  ·  Harvest Date: 30 Jun 2026    │
│                                                     │
│  ── BIRD ORIGIN ──────────────────────────────────  │
│  DOC Supplier: Navbharat Hatchery, Gorakhpur       │
│  Placement: 25,000 birds · 16 Jun 2026             │
│                                                     │
│  ── NUTRITION ─────────────────────────────────────  │
│  Total Feed Consumed: 48,300 kg                    │
│  Feed Brand(s): Godrej Starter, Godrej Grower      │
│  FCR Achieved: 2.13                                │
│                                                     │
│  ── HEALTH & VACCINATION ──────────────────────────  │
│  ✅ Newcastle La Sota (Day 7)                       │
│  ✅ IBD (Gumboro) (Day 14)                         │
│  ✅ IB Spray (Day 21)                              │
│  Medication: Nil                                   │
│  Antibiotic Use: None ✅ — AB-Free Eligible        │
│                                                     │
│  ── HARVEST ────────────────────────────────────────  │
│  Live Birds Sold: 24,493                           │
│  Average Weight: 2.18 kg/bird                      │
│  Total Weight: 53,395 kg                           │
│  Buyer: Shri Ram Processors, Gorakhpur             │
│                                                     │
│  ── CERTIFICATION ─────────────────────────────────  │
│  FSSAI Status: Compliant ✅                         │
│  Generated: 30 Jun 2026 · PoultryPulse AI v2.0    │
│                                                     │
│  Verify at: poulse.ai/trace/GKP-202606-004         │
└─────────────────────────────────────────────────────┘
```

### §18.2 Antibiotic-Free Badge System

Three certification states shown on every batch card and traceability report:

| Badge | Color | Condition |
|---|---|---|
| ✅ AB-Free | Green | No antibiotics logged in this batch |
| ⚠️ Conventional | Grey | Farm not registered as AB-Free |
| 🚫 AB Used | Red | Antibiotic logged — AB-Free certification withdrawn for this batch |

---

## §19. Layer Farm — Design Specifications

### §19.1 Egg Production Dashboard

**File:** `components/layer/EggProductionDashboard.tsx`  
**Shown when:** Farm profile `poultry_type = 'layer'` (replaces broiler-specific widgets)

**HDP (Hen-Day Production) Gauge:**
```
HDP Today: 91.2%      ✅ Excellent

[══════════════════════════════════════]
  60%  70%  80%  90%  95%  100%
       ↑ Breed Std    ↑ This Flock
```

**Production Log Entry (mobile):**
```
┌─────────────────────────────────────┐
│ आज का अंडा उत्पादन · 16 Jun        │
│                                     │
│ कुल अंडे:     [22,800]             │
│ टूटे अंडे:    [120]                │
│ फ़्लोर अंडे:  [45]                  │
│                                     │
│ बिक्री योग्य: 22,635               │
│ HDP: 91.2% ✅                       │
│                                     │
│ [✓ दर्ज करें]                       │
└─────────────────────────────────────┘
```

**Price Hero Widget (Layer variant):**
The price hero card shows NECC egg price for the user's zone instead of broiler price:
```
₹ 5.80
/egg (NECC North Zone)
↑ +₹0.10 vs yesterday
Range: ₹5.60 – ₹6.10
[आज बेचें ✓]
```

---

## §20. New Navigation Additions (Addendum)

The sidebar navigation adds the following new sections:

```
SIDEBAR — UPDATED STRUCTURE
────────────────────────────────
  🏠 Overview              [All]
  ────────────────────────
  📊 Price Intelligence    [All]
  🗺️  District Map          [S2, S5, Admin]
  ⚡ Alerts               [All]
  ────────────────────────
  🐔 My Batches           [S1, S2]   ← NEW (REQ-013)
     └ Batch Status Board
     └ Batch Detail
     └ Register New Batch
  🌾 Feed & FCR           [S1, S2]   ← NEW (REQ-014)
     └ FCR Dashboard
     └ Daily Feed Log
     └ Feed Allocation
     └ Feed Purchases
  💊 Health & Biosecurity [S1, S2]   ← NEW (REQ-015)
     └ Vaccination Calendar
     └ Medication Records
     └ Daily Health Checklist
     └ Biosecurity Audit
  📉 Mortality Tracking   [S1, S2]   ← NEW (REQ-016)
     └ Daily Mortality Log
     └ Mortality Dashboard
     └ Performance Benchmarks
  📦 Inventory & Costs    [S1, S2]   ← NEW (REQ-017) [Phase 2]
     └ Stock Overview
     └ Purchase Orders
     └ Batch P&L
  🌡️  Smart Farm / IoT     [S2, Admin]← NEW (REQ-018) [Phase 2]
     └ Device Registry
     └ Shed Environment
     └ IoT Alerts
  🔗 Integrations         [S2, S5]   ← NEW (REQ-019) [Phase 2]
     └ Tally Export
     └ Zoho Sync
     └ ERP Webhook
  ────────────────────────
  📋 Traceability         [S1, S2, S5]← NEW (REQ-021) [Phase 2]
  🥚 Layer Farm           [Layer farms]← NEW (REQ-022) [Phase 2]
  ────────────────────────
  🔑 API Console          [S5, Admin]
  📈 Accuracy             [Admin, S5]
  👥 Customers            [Admin]
  🔍 Watermark Audit      [Admin]
  📱 WhatsApp Analytics   [Admin]
  ────────────────────────
  ⚙️  Settings             [All]
```

---

## §21. Updated Alert Type Registry

The Alert Intelligence Center (REQ-004) now supports these alert types including new ones from the addendum:

| Alert Type | Icon | Source | Color | New? |
|---|---|---|---|---|
| `hpai_disease` | 🦠 | DAHDF DAG | Red | Existing |
| `heat_wave` | 🌡️ | IMD DAG | Amber | Existing |
| `cold_wave` | ❄️ | IMD DAG | Amber | Existing |
| `price_crash` | 📉 | Price model | Red | Existing |
| `feed_cost_spike` | 🌾 | Commodity model | Amber | Existing |
| `policy_regulatory` | 📋 | Manual admin entry | Blue | Existing |
| `feed_water_deviation` | 🚰 | Feed log computation | Amber | **NEW** |
| `abnormal_mortality` | 💀 | Mortality log | Red | **NEW** |
| `vaccination_due` | 💉 | Vaccination schedule | Green | **NEW** |
| `low_stock` | 📦 | Inventory threshold | Amber | **NEW** |
| `iot_environment` | 🌡️ | IoT sensor | Red/Amber | **NEW** |
| `medication_withdrawal` | 🚫 | Medication log | Grey | **NEW** |
| `biosecurity_score_low` | 🔒 | Audit submission | Amber | **NEW** |
| `supervisor_checklist_missing` | 📋 | Checklist absence | Amber | **NEW** |
| `weight_gain_deviation` | ⚖️ | Weight log | Amber | **NEW** |

Each new alert type uses the same `AlertCard` component (TASK-014) with the `type` prop extended — no new component required.

---

## §22. Updated File & Folder Structure (Addendum)

```
/src
  /components
    /batch                       ← NEW MODULE
      BatchStatusBoard.tsx       ← REQ-013
      BatchCard.tsx
      BatchRegistrationForm.tsx
      BatchDetailDrawer.tsx
      BatchPnL.tsx
      PerformanceBenchmarkChart.tsx  ← REQ-016, §14.3
      MultiFlockHarvestQueue.tsx     ← existing TASK-012, moved here
    /feed                        ← EXTENDED MODULE
      FcrDashboard.tsx           ← NEW REQ-014
      DailyFeedLogForm.tsx       ← NEW REQ-014
      FeedAllocationCard.tsx     ← NEW REQ-014
      FeedPurchaseLog.tsx        ← NEW REQ-017
      FeedCostDashboard.tsx      ← existing TASK-016, kept here
    /health                      ← NEW MODULE
      VaccinationCalendar.tsx    ← REQ-015
      MedicationLog.tsx          ← REQ-015
      DailyHealthChecklist.tsx   ← REQ-015
      BiosecurityAuditForm.tsx   ← REQ-015
      BiosecurityScoreGauge.tsx  ← REQ-015
    /mortality                   ← NEW MODULE
      DailyMortalityForm.tsx     ← REQ-016
      MortalityDashboard.tsx     ← REQ-016
      WeightLogForm.tsx          ← REQ-016
    /inventory                   ← NEW MODULE (Phase 2)
      StockOverview.tsx          ← REQ-017
      PurchaseOrderForm.tsx      ← REQ-017
      InventoryMovementLog.tsx   ← REQ-017
      QRInventoryScan.tsx        ← REQ-020
    /iot                         ← NEW MODULE (Phase 2)
      ShedEnvironmentPanel.tsx   ← REQ-018
      DeviceRegistry.tsx         ← REQ-018
      IotReadingsChart.tsx       ← REQ-018
    /traceability                ← NEW MODULE (Phase 2)
      TraceabilityReport.tsx     ← REQ-021
      BatchQrCode.tsx            ← REQ-021
      ComplianceBadge.tsx        ← REQ-021
    /layer                       ← NEW MODULE (Phase 2)
      EggProductionDashboard.tsx ← REQ-022
      EggProductionLogForm.tsx   ← REQ-022
      EggGradingLog.tsx          ← REQ-022
    /supervisor                  ← NEW MODULE (Phase 2)
      SupervisorDailyWork.tsx    ← REQ-020
      SyncStatusBar.tsx          ← REQ-020
  /lib
    fcrCalculator.ts             ← NEW REQ-014
    mortalityAnalyzer.ts         ← NEW REQ-016
    weightGainPredictor.ts       ← NEW REQ-016/REQ-024
    traceabilityReportGenerator.ts ← NEW REQ-021
    layerCalculator.ts           ← NEW REQ-022
    biosecurityScorer.ts         ← NEW REQ-015
    withdrawalPeriodChecker.ts   ← NEW REQ-015
```

---

*End of Design Addendum — PoultryPulse Dashboard Enhancement v1.0*  
*Merge into base Design document (Sections 1–10) before Kiro initialization. New sections: §11–§22.*
