# FlockIQ — Windsurf Cascade Full Implementation Prompt
# Version: v1.0 | June 2026
# Copy this ENTIRE document into Windsurf Cascade (Agent mode)
# Estimated implementation: 8–12 hours of agent work across ~40 files

---

## ROLE & PROJECT CONTEXT

You are a senior full-stack engineer working on **FlockIQ** — a poultry farm management and price intelligence SaaS platform built for commercial broiler farmers and integrators in India.

**Tech Stack:**
- Next.js 15 App Router (TypeScript strict mode, `noImplicitAny: true`)
- Tailwind CSS v3 (no custom CSS files — utility classes only)
- Recharts (ALL charts — no other chart library)
- Supabase (SSR auth, RLS, Postgres, Realtime)
- SWR for client-side data fetching
- react-hook-form + Zod for all forms
- next-i18next (Hindi `hi` + English `en`)
- Framer Motion (purposeful animations only)
- Phosphor Icons or Tabler Icons (consistent set)

**Brand colours (use ONLY these — no other hex values):**
```
brand700: #1A5C34   ← primary dark green (buttons, sidebar, headings)
brand400: #3DAE72   ← accent green (interactive, progress bars)
brand50:  #EDF7F1   ← light green background tint
signal:   #E8611A   ← saffron/orange (actual prices, alerts)
amber:    #D97706   ← warning/hold signal
red:      #DC2626   ← danger/caution signal
sidebar:  #0D1F16   ← near-black sidebar background
pageBg:   #F4F7F5   ← page background
cardBg:   #FFFFFF
border:   #E3EDE7
textPrimary: #111827
textSecondary: #6B7280
whatsapp: #25D366
```

**Project location:** The codebase already exists. You are adding new features to an existing Next.js 15 project. All new files go in their correct locations within the existing `apps/web/` structure.

---

## WHAT YOU ARE BUILDING — TWO MAJOR FEATURES

### FEATURE 1: GC (Growing Cost) Module
### FEATURE 2: Employee & Expense Management Module

Both features integrate across multiple existing screens. Read all specifications below carefully before writing any code.

---

# ═══════════════════════════════════════════════════════════════
# FEATURE 1: GC (GROWING COST) MODULE
# ═══════════════════════════════════════════════════════════════

## WHAT IS GC?

In the Indian poultry industry, **GC = Growing Cost** is the most important operational metric for a broiler farmer. It represents the **total cost per kg of live weight produced** for a batch. Every farmer and integrator benchmarks their performance using GC.

GC is NOT just feed cost. It includes EVERY cost involved in raising broilers from Day-Old Chick (DOC) to harvest:

```
GC (₹/kg live weight) =
  (DOC Cost + Feed Cost + Medicine Cost + Vaccine Cost +
   Litter Cost + Electricity Cost + Water Cost + Labour Cost +
   Miscellaneous Cost + Fixed Overhead Allocation)
  ÷
  (Live Birds × Average Live Weight in kg)
```

**Why GC matters to a farmer:**
- GC is the farmer's break-even threshold — if sell price < GC, he loses money
- Industry benchmark GC in UP: ₹90–₹115/kg (varies by season, feed price, breed)
- If a farmer's GC is ₹98/kg and today's price is ₹168/kg → margin = ₹70/kg
- If GC creeps to ₹125/kg (bad FCR + expensive feed) and price drops to ₹130 → margin = ₹5/kg (near ruin)
- Integrators compare GC across all their contract farms to find poor performers

**GC Cost Components (all required):**

| Component | Hindi Label | Typical % of GC | Input Method |
|-----------|-------------|-----------------|--------------|
| DOC Cost | DOC लागत | 15–20% | Total ₹ paid for day-old chicks |
| Feed Cost | चारा लागत | 60–70% | Auto-computed from feed purchase log |
| Medicine Cost | दवाई लागत | 3–6% | Running total from health log |
| Vaccine Cost | टीका लागत | 1–3% | Running total from vaccination log |
| Litter Cost | लिटर लागत | 2–4% | One-time input at batch start |
| Electricity Cost | बिजली लागत | 2–4% | Monthly input or estimated |
| Water Cost | पानी लागत | 0.5–1% | Estimated from water consumption |
| Labour Cost | मजदूरी लागत | 3–6% | Computed from employee module OR manual |
| Miscellaneous | अन्य लागत | 1–3% | Free-form entry |
| Fixed Overhead | स्थायी खर्च | 2–5% | Allocated from farm fixed costs |

**GC Formula in code:**
```typescript
const gcPerKgLiveWeight = (
  docCost + feedCost + medicineCost + vaccineCost +
  litterCost + electricityCost + waterCost + labourCost +
  miscCost + fixedOverheadAllocation
) / (livebirds * avgWeightKg)

const margin = currentPrice - gcPerKgLiveWeight
const marginPct = (margin / currentPrice) * 100
const estimatedBatchProfit = margin * livebirds * avgWeightKg
```

---

## DATABASE CHANGES — Add to Supabase

Create this migration file at: `supabase/migrations/[timestamp]_gc_employee_module.sql`

```sql
-- ═══════════════════════════════════════════════════
-- GC (GROWING COST) TABLES
-- ═══════════════════════════════════════════════════

-- Store GC cost inputs per batch (one row per batch)
CREATE TABLE IF NOT EXISTS batch_gc_costs (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id               UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id              UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  integrator_id         UUID NOT NULL REFERENCES auth.users(id),

  -- Fixed costs (entered at batch start or updated as batch progresses)
  doc_cost_total        NUMERIC(12,2) DEFAULT 0,   -- Total ₹ paid for DOC
  doc_cost_per_chick    NUMERIC(8,2),              -- Auto-computed (doc_cost_total / chicks_placed)
  litter_cost_total     NUMERIC(12,2) DEFAULT 0,   -- One-time litter purchase
  fixed_overhead_alloc  NUMERIC(12,2) DEFAULT 0,   -- Allocated from farm fixed overhead

  -- Running costs (updated throughout batch — can be updated daily or per entry)
  medicine_cost_total   NUMERIC(12,2) DEFAULT 0,
  vaccine_cost_total    NUMERIC(12,2) DEFAULT 0,
  electricity_cost_total NUMERIC(12,2) DEFAULT 0,
  water_cost_total      NUMERIC(12,2) DEFAULT 0,
  labour_cost_total     NUMERIC(12,2) DEFAULT 0,   -- Populated from employee module OR manual
  misc_cost_total       NUMERIC(12,2) DEFAULT 0,

  -- Feed cost: computed from feed_purchases table (do NOT store here — always live compute)
  -- feed_cost_total is a computed column in the GC view

  -- Computed metrics (denormalized for fast read — recomputed on any update)
  total_variable_cost   NUMERIC(12,2),             -- All costs excluding fixed overhead
  total_cost_all_in     NUMERIC(12,2),             -- All costs including fixed overhead
  gc_per_kg             NUMERIC(8,2),              -- ₹/kg live weight produced
  gc_computation_date   DATE,                      -- Date GC was last computed
  birds_alive_at_compute INTEGER,                  -- Snapshot of birds alive when GC last computed
  avg_weight_at_compute  NUMERIC(6,2),             -- Average weight when GC last computed

  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (batch_id)  -- One GC record per batch
);

ALTER TABLE batch_gc_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrators_own_gc" ON batch_gc_costs
  FOR ALL USING (integrator_id = auth.uid());

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_batch_gc_farm_batch
  ON batch_gc_costs(farm_id, batch_id);

-- ═══════════════════════════════════════════════════
-- EMPLOYEE & EXPENSE MANAGEMENT TABLES
-- ═══════════════════════════════════════════════════

-- Employees managed by the integrator
CREATE TABLE IF NOT EXISTS employees (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_code     VARCHAR(20),                   -- Auto-generated: EMP-001, EMP-002 etc.
  full_name         VARCHAR(200) NOT NULL,
  name_hindi        VARCHAR(200),                  -- Hindi name optional
  phone             VARCHAR(15),
  role              VARCHAR(50) NOT NULL,          -- 'farm_manager'|'field_supervisor'|'farm_worker'|'driver'|'accountant'|'office_staff'|'other'
  role_custom       VARCHAR(100),                  -- If role='other', describe
  assigned_farm_ids UUID[],                        -- NULL = not assigned to specific farm (office staff)
  employment_type   VARCHAR(20) DEFAULT 'permanent', -- 'permanent'|'contractual'|'daily_wage'|'part_time'
  join_date         DATE NOT NULL,
  end_date          DATE,                          -- NULL if currently active
  is_active         BOOLEAN DEFAULT TRUE,

  -- Compensation
  base_salary_monthly NUMERIC(10,2),              -- Monthly fixed salary in ₹ (NULL for daily wage)
  daily_wage_rate     NUMERIC(8,2),               -- ₹ per day (NULL for salaried)
  pf_applicable       BOOLEAN DEFAULT FALSE,       -- Provident Fund
  esi_applicable      BOOLEAN DEFAULT FALSE,       -- Employee State Insurance
  bonus_pct           NUMERIC(5,2),               -- % bonus on salary (if any)

  -- Bank details (for salary transfer)
  bank_account_number VARCHAR(25),
  bank_ifsc           VARCHAR(15),
  bank_name           VARCHAR(100),

  -- Documents
  aadhaar_last4       VARCHAR(4),                 -- Last 4 digits only (not full Aadhaar)
  profile_photo_url   TEXT,

  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrators_own_employees" ON employees
  FOR ALL USING (integrator_id = auth.uid());

-- Monthly salary records
CREATE TABLE IF NOT EXISTS salary_records (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id),
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month             INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year              INTEGER NOT NULL,
  days_present      INTEGER,                      -- For daily wage workers
  days_absent       INTEGER DEFAULT 0,
  days_holiday      INTEGER DEFAULT 0,
  overtime_hrs      NUMERIC(5,1) DEFAULT 0,
  overtime_rate     NUMERIC(8,2),                 -- ₹ per overtime hour

  -- Earnings
  basic_salary      NUMERIC(10,2) NOT NULL DEFAULT 0,
  hra               NUMERIC(10,2) DEFAULT 0,       -- House Rent Allowance
  conveyance        NUMERIC(10,2) DEFAULT 0,
  bonus_amount      NUMERIC(10,2) DEFAULT 0,
  overtime_amount   NUMERIC(10,2) DEFAULT 0,
  other_earnings    NUMERIC(10,2) DEFAULT 0,
  gross_earnings    NUMERIC(10,2) DEFAULT 0,       -- Auto-computed sum

  -- Deductions
  pf_deduction      NUMERIC(10,2) DEFAULT 0,
  esi_deduction     NUMERIC(10,2) DEFAULT 0,
  advance_deduction NUMERIC(10,2) DEFAULT 0,       -- Salary advance deducted this month
  other_deductions  NUMERIC(10,2) DEFAULT 0,
  total_deductions  NUMERIC(10,2) DEFAULT 0,       -- Auto-computed sum

  -- Net
  net_salary        NUMERIC(10,2) DEFAULT 0,       -- gross_earnings - total_deductions

  -- Payment
  payment_status    VARCHAR(20) DEFAULT 'pending', -- 'pending'|'processing'|'paid'|'on_hold'
  payment_date      DATE,
  payment_mode      VARCHAR(20),                   -- 'bank_transfer'|'cash'|'upi'
  payment_reference VARCHAR(100),                  -- UTR or transaction ID
  payment_notes     TEXT,

  -- Farm allocation (for GC computation — which farms does this employee's cost apply to)
  farm_allocations  JSONB,                         -- [{farm_id: uuid, allocation_pct: 30}, ...]

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (employee_id, month, year)
);

ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrators_own_salary" ON salary_records
  FOR ALL USING (integrator_id = auth.uid());

-- Advance salary tracker
CREATE TABLE IF NOT EXISTS salary_advances (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id),
  employee_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  advance_date      DATE NOT NULL,
  amount            NUMERIC(10,2) NOT NULL,
  reason            TEXT,
  recovery_months   INTEGER DEFAULT 1,             -- Over how many months to recover
  status            VARCHAR(20) DEFAULT 'outstanding', -- 'outstanding'|'partially_recovered'|'fully_recovered'
  recovered_amount  NUMERIC(10,2) DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrators_own_advances" ON salary_advances
  FOR ALL USING (integrator_id = auth.uid());

-- Business expenses (non-employee operational expenses)
CREATE TABLE IF NOT EXISTS business_expenses (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integrator_id     UUID NOT NULL REFERENCES auth.users(id),
  farm_id           UUID REFERENCES farms(id),     -- NULL = general business expense
  batch_id          UUID REFERENCES batches(id),   -- NULL = not batch-specific
  expense_date      DATE NOT NULL,
  category          VARCHAR(50) NOT NULL,          -- 'vehicle_fuel'|'vehicle_maintenance'|'equipment'|'office'|'travel'|'communication'|'insurance'|'rent'|'utilities'|'professional_fees'|'marketing'|'other'
  description       TEXT NOT NULL,
  amount            NUMERIC(10,2) NOT NULL,
  payment_mode      VARCHAR(20),                   -- 'cash'|'upi'|'bank_transfer'|'card'
  receipt_url       TEXT,                          -- Supabase storage URL
  is_tax_deductible BOOLEAN DEFAULT TRUE,
  gst_amount        NUMERIC(10,2) DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE business_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrators_own_expenses" ON business_expenses
  FOR ALL USING (integrator_id = auth.uid());

-- ═══════════════════════════════════════════════════
-- DATABASE FUNCTIONS
-- ═══════════════════════════════════════════════════

-- Function: compute GC for a batch
-- Called after any cost update to refresh the denormalized GC values
CREATE OR REPLACE FUNCTION compute_batch_gc(p_batch_id UUID)
RETURNS VOID AS $$
DECLARE
  v_gc          batch_gc_costs%ROWTYPE;
  v_feed_cost   NUMERIC;
  v_birds_alive INTEGER;
  v_avg_weight  NUMERIC;
  v_total_cost  NUMERIC;
BEGIN
  -- Get GC cost record
  SELECT * INTO v_gc FROM batch_gc_costs WHERE batch_id = p_batch_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Compute feed cost from feed_purchases (live, not stored)
  SELECT COALESCE(SUM(quantity_kg * rate_per_kg), 0)
    INTO v_feed_cost
    FROM feed_purchases
   WHERE batch_id = p_batch_id;

  -- Get current batch stats
  SELECT birds_alive, COALESCE(avg_weight_g / 1000.0, 0)
    INTO v_birds_alive, v_avg_weight
    FROM batches WHERE id = p_batch_id;

  -- Compute total cost
  v_total_cost := v_feed_cost
    + v_gc.doc_cost_total
    + v_gc.medicine_cost_total
    + v_gc.vaccine_cost_total
    + v_gc.litter_cost_total
    + v_gc.electricity_cost_total
    + v_gc.water_cost_total
    + v_gc.labour_cost_total
    + v_gc.misc_cost_total
    + v_gc.fixed_overhead_alloc;

  -- Update GC record
  UPDATE batch_gc_costs SET
    total_cost_all_in       = v_total_cost,
    total_variable_cost     = v_total_cost - v_gc.fixed_overhead_alloc,
    gc_per_kg               = CASE
                                WHEN v_birds_alive > 0 AND v_avg_weight > 0
                                THEN ROUND(v_total_cost / (v_birds_alive * v_avg_weight), 2)
                                ELSE NULL
                              END,
    gc_computation_date     = CURRENT_DATE,
    birds_alive_at_compute  = v_birds_alive,
    avg_weight_at_compute   = v_avg_weight,
    updated_at              = NOW()
  WHERE batch_id = p_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get monthly labour cost for a farm (for GC allocation)
CREATE OR REPLACE FUNCTION get_farm_labour_cost_for_month(
  p_farm_id UUID,
  p_month INTEGER,
  p_year INTEGER
)
RETURNS NUMERIC AS $$
DECLARE
  v_total NUMERIC := 0;
BEGIN
  -- Sum up salary amounts allocated to this farm based on farm_allocations JSONB
  SELECT COALESCE(SUM(
    sr.net_salary * COALESCE(
      (SELECT (fa->>'allocation_pct')::NUMERIC / 100
         FROM jsonb_array_elements(sr.farm_allocations) fa
        WHERE (fa->>'farm_id')::UUID = p_farm_id
        LIMIT 1
      ), 0)
  ), 0)
  INTO v_total
  FROM salary_records sr
  WHERE sr.month = p_month
    AND sr.year  = p_year;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for employee module
CREATE INDEX IF NOT EXISTS idx_employees_integrator ON employees(integrator_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_salary_records_employee_month ON salary_records(employee_id, year, month);
CREATE INDEX IF NOT EXISTS idx_business_expenses_farm ON business_expenses(farm_id, expense_date DESC);
```

---

## FEATURE 1 IMPLEMENTATION: GC MODULE

### FILE 1A: GC Types
**Create:** `apps/web/lib/types/gc.ts`

```typescript
export interface GCCostInputs {
  docCostTotal:         number
  litterCostTotal:      number
  fixedOverheadAlloc:   number
  medicineCostTotal:    number
  vaccineCostTotal:     number
  electricityCostTotal: number
  waterCostTotal:       number
  labourCostTotal:      number
  miscCostTotal:        number
}

export interface GCBreakdown {
  docCost:         number
  feedCost:        number   // computed from feed_purchases
  medicineCost:    number
  vaccineCost:     number
  litterCost:      number
  electricityCost: number
  waterCost:       number
  labourCost:      number
  miscCost:        number
  fixedOverhead:   number
  totalCost:       number
  gcPerKg:         number   // total_cost / (live_birds × avg_weight_kg)
  liveKgs:         number   // live_birds × avg_weight_kg
  birdsAlive:      number
  avgWeightKg:     number
}

export interface GCSummary extends GCBreakdown {
  batchId:           string
  farmName:          string
  batchDay:          number
  targetSellPriceP50: number | null   // from forecast
  margin:            number | null    // targetSellPriceP50 - gcPerKg
  marginPct:         number | null
  estimatedProfit:   number | null   // margin × liveKgs
  industryBenchmarkGC: number        // 95 (hardcoded UP belt benchmark)
  vsIndustry:        number          // gcPerKg - industryBenchmarkGC (positive = above benchmark = worse)
}

export const INDUSTRY_BENCHMARK_GC_PER_KG = 95  // ₹/kg — UP belt broiler benchmark
export const GC_EXCELLENT_THRESHOLD = 88         // Below this = excellent performance
export const GC_GOOD_THRESHOLD = 100             // 88–100 = good
export const GC_WATCH_THRESHOLD = 112            // 100–112 = watch
// Above 112 = alert (approaching or exceeding typical sell price)

export function gcStatusColour(gcPerKg: number): string {
  if (gcPerKg <= GC_EXCELLENT_THRESHOLD) return '#16A34A'  // green
  if (gcPerKg <= GC_GOOD_THRESHOLD)      return '#65A30D'  // light green
  if (gcPerKg <= GC_WATCH_THRESHOLD)     return '#D97706'  // amber
  return '#DC2626'                                          // red
}

export function gcStatusLabel(gcPerKg: number): { en: string; hi: string } {
  if (gcPerKg <= GC_EXCELLENT_THRESHOLD) return { en: 'Excellent', hi: 'बेहतरीन' }
  if (gcPerKg <= GC_GOOD_THRESHOLD)      return { en: 'Good',      hi: 'अच्छा' }
  if (gcPerKg <= GC_WATCH_THRESHOLD)     return { en: 'Watch',     hi: 'ध्यान दें' }
  return { en: 'Alert — High Cost', hi: 'अलर्ट — उच्च लागत' }
}
```

---

### FILE 1B: GC API Route
**Create:** `apps/web/app/api/farms/[farmId]/gc/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// GET: Fetch current GC for the active batch of a farm
export async function GET(req: NextRequest, { params }: { params: { farmId: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { farmId } = params

  // Verify farm belongs to this user
  const { data: farm } = await supabase
    .from('farms')
    .select('id, name, current_batch_id')
    .eq('id', farmId)
    .eq('integrator_id', session.user.id)
    .single()

  if (!farm) return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
  if (!farm.current_batch_id) return NextResponse.json({ gc: null, message: 'No active batch' })

  // Get GC cost record
  const { data: gc } = await supabase
    .from('batch_gc_costs')
    .select('*')
    .eq('batch_id', farm.current_batch_id)
    .single()

  // Get feed cost (computed from feed_purchases)
  const { data: feedPurchases } = await supabase
    .from('feed_purchases')
    .select('quantity_kg, rate_per_kg')
    .eq('batch_id', farm.current_batch_id)

  const feedCost = feedPurchases?.reduce((sum, p) => sum + (p.quantity_kg * p.rate_per_kg), 0) ?? 0

  // Get batch stats
  const { data: batch } = await supabase
    .from('batches')
    .select('birds_alive, avg_weight_g, day_number, birds_placed')
    .eq('id', farm.current_batch_id)
    .single()

  const birdsAlive  = batch?.birds_alive ?? 0
  const avgWeightKg = (batch?.avg_weight_g ?? 0) / 1000
  const liveKgs     = birdsAlive * avgWeightKg

  const docCost         = gc?.doc_cost_total ?? 0
  const medicineCost    = gc?.medicine_cost_total ?? 0
  const vaccineCost     = gc?.vaccine_cost_total ?? 0
  const litterCost      = gc?.litter_cost_total ?? 0
  const electricityCost = gc?.electricity_cost_total ?? 0
  const waterCost       = gc?.water_cost_total ?? 0
  const labourCost      = gc?.labour_cost_total ?? 0
  const miscCost        = gc?.misc_cost_total ?? 0
  const fixedOverhead   = gc?.fixed_overhead_alloc ?? 0

  const totalCost = docCost + feedCost + medicineCost + vaccineCost +
                    litterCost + electricityCost + waterCost + labourCost +
                    miscCost + fixedOverhead

  const gcPerKg = liveKgs > 0 ? Math.round((totalCost / liveKgs) * 100) / 100 : 0

  // Get today's forecast price for margin calculation
  const { data: forecast } = await supabase
    .from('sell_signals')
    .select('expected_p50_high')
    .order('signal_date', { ascending: false })
    .limit(1)
    .single()

  const forecastPrice = forecast?.expected_p50_high ?? null
  const margin        = forecastPrice ? forecastPrice - gcPerKg : null
  const marginPct     = forecastPrice && forecastPrice > 0 ? (margin! / forecastPrice) * 100 : null
  const estimatedProfit = margin ? margin * liveKgs : null

  return NextResponse.json({
    gc: {
      batchId:           farm.current_batch_id,
      farmName:          farm.name,
      batchDay:          batch?.day_number ?? 0,
      docCost, feedCost, medicineCost, vaccineCost, litterCost,
      electricityCost, waterCost, labourCost, miscCost, fixedOverhead,
      totalCost, gcPerKg, liveKgs, birdsAlive, avgWeightKg,
      targetSellPriceP50: forecastPrice,
      margin, marginPct, estimatedProfit,
      industryBenchmarkGC: 95,
      vsIndustry: gcPerKg - 95,
    }
  })
}

// PUT: Update GC cost inputs for the active batch
const UpdateGCSchema = z.object({
  docCostTotal:         z.number().min(0).optional(),
  litterCostTotal:      z.number().min(0).optional(),
  fixedOverheadAlloc:   z.number().min(0).optional(),
  medicineCostTotal:    z.number().min(0).optional(),
  vaccineCostTotal:     z.number().min(0).optional(),
  electricityCostTotal: z.number().min(0).optional(),
  waterCostTotal:       z.number().min(0).optional(),
  labourCostTotal:      z.number().min(0).optional(),
  miscCostTotal:        z.number().min(0).optional(),
  notes:                z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { farmId: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateGCSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { farmId } = params
  const { data: farm } = await supabase
    .from('farms')
    .select('id, current_batch_id')
    .eq('id', farmId)
    .eq('integrator_id', session.user.id)
    .single()

  if (!farm?.current_batch_id) return NextResponse.json({ error: 'No active batch' }, { status: 404 })

  // Map camelCase to snake_case
  const updateData: Record<string, any> = {}
  if (parsed.data.docCostTotal         !== undefined) updateData.doc_cost_total           = parsed.data.docCostTotal
  if (parsed.data.litterCostTotal      !== undefined) updateData.litter_cost_total        = parsed.data.litterCostTotal
  if (parsed.data.fixedOverheadAlloc   !== undefined) updateData.fixed_overhead_alloc     = parsed.data.fixedOverheadAlloc
  if (parsed.data.medicineCostTotal    !== undefined) updateData.medicine_cost_total      = parsed.data.medicineCostTotal
  if (parsed.data.vaccineCostTotal     !== undefined) updateData.vaccine_cost_total       = parsed.data.vaccineCostTotal
  if (parsed.data.electricityCostTotal !== undefined) updateData.electricity_cost_total   = parsed.data.electricityCostTotal
  if (parsed.data.waterCostTotal       !== undefined) updateData.water_cost_total         = parsed.data.waterCostTotal
  if (parsed.data.labourCostTotal      !== undefined) updateData.labour_cost_total        = parsed.data.labourCostTotal
  if (parsed.data.miscCostTotal        !== undefined) updateData.misc_cost_total          = parsed.data.miscCostTotal
  if (parsed.data.notes                !== undefined) updateData.notes                   = parsed.data.notes
  updateData.updated_at = new Date().toISOString()

  // Upsert GC record
  await supabase
    .from('batch_gc_costs')
    .upsert({
      ...updateData,
      farm_id: farmId,
      batch_id: farm.current_batch_id,
      integrator_id: session.user.id,
    }, { onConflict: 'batch_id' })

  // Trigger GC recomputation
  await supabase.rpc('compute_batch_gc', { p_batch_id: farm.current_batch_id })

  return NextResponse.json({ success: true })
}
```

---

### FILE 1C: GC Summary Card (reusable component)
**Create:** `apps/web/components/gc/GCSummaryCard.tsx`

This component shows the GC at a glance. Used on:
- Farm detail page (dedicated GC tab)
- Farm portfolio card (mini version)
- Overview dashboard (portfolio GC strip)
- Calculator page (auto-fill)
- Price forecast screen (break-even = GC)

```typescript
'use client'
import useSWR from 'swr'
import { gcStatusColour, gcStatusLabel, INDUSTRY_BENCHMARK_GC_PER_KG } from '@/lib/types/gc'

interface GCSummaryCardProps {
  farmId:   string
  size?:    'mini' | 'standard' | 'full'  // mini = portfolio card, standard = farm header, full = GC tab
  language?: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function GCSummaryCard({ farmId, size = 'standard', language = 'hi' }: GCSummaryCardProps) {
  const isHindi = language === 'hi'
  const { data, isLoading } = useSWR(`/api/farms/${farmId}/gc`, fetcher, {
    revalidateOnFocus: true,
    revalidateInterval: 5 * 60 * 1000,
  })

  const gc = data?.gc

  // ── MINI VERSION (for farm cards in portfolio) ────────────────────────────
  if (size === 'mini') {
    if (isLoading) return <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
    if (!gc)       return null
    const colour = gcStatusColour(gc.gcPerKg)
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-500">GC:</span>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: colour }}>
          ₹{gc.gcPerKg.toFixed(0)}/kg
        </span>
        {gc.margin !== null && (
          <span className={`text-[10px] ${gc.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({gc.margin > 0 ? '+' : ''}₹{gc.margin.toFixed(0)} {isHindi ? 'मार्जिन' : 'margin'})
          </span>
        )}
      </div>
    )
  }

  // ── STANDARD VERSION (for farm detail header / GC tab summary) ────────────
  if (isLoading) return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-7 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )

  if (!gc || !gc.gcPerKg) return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 text-center py-8">
      <p className="text-sm text-gray-400">
        {isHindi ? 'GC डेटा उपलब्ध नहीं — DOC और चारा लागत दर्ज करें' : 'GC data not available — enter DOC and feed costs to compute'}
      </p>
    </div>
  )

  const colour    = gcStatusColour(gc.gcPerKg)
  const status    = gcStatusLabel(gc.gcPerKg)
  const vsIndStr  = gc.vsIndustry >= 0
    ? `+₹${gc.vsIndustry.toFixed(0)} ${isHindi ? 'बेंचमार्क से ऊपर' : 'above benchmark'}`
    : `-₹${Math.abs(gc.vsIndustry).toFixed(0)} ${isHindi ? 'बेंचमार्क से नीचे' : 'below benchmark'}`
  const vsIndColour = gc.vsIndustry <= 0 ? '#16A34A' : '#DC2626'

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {isHindi ? 'Growing Cost (GC)' : 'Growing Cost (GC)'}
          </h3>
          <p className="text-[11px] text-gray-400">
            {isHindi ? 'प्रति किलो जीवित वजन उत्पादन लागत' : 'Total cost per kg live weight produced'}
          </p>
        </div>
        <span
          className="text-[11px] font-medium px-2.5 py-1 rounded-full"
          style={{ background: colour + '1A', color: colour }}
        >
          {isHindi ? status.hi : status.en}
        </span>
      </div>

      {/* Primary GC metric */}
      <div className="flex items-end gap-4 mb-4 pb-4 border-b border-[#E3EDE7]">
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">{isHindi ? 'GC प्रति किलो' : 'GC per kg'}</p>
          <p className="text-3xl font-bold tabular-nums" style={{ color }}>
            ₹{gc.gcPerKg.toFixed(2)}
            <span className="text-base font-normal text-gray-400">/kg</span>
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: vsIndColour }}>{vsIndStr}</p>
        </div>
        {gc.margin !== null && (
          <div className="ml-6">
            <p className="text-[10px] text-gray-400 mb-0.5">
              {isHindi ? 'वर्तमान मार्जिन' : 'Current margin'}
            </p>
            <p className={`text-2xl font-bold tabular-nums ${gc.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gc.margin > 0 ? '+' : ''}₹{gc.margin.toFixed(2)}/kg
            </p>
            <p className="text-[11px] text-gray-400">
              {isHindi ? 'बाज़ार भाव ₹' : 'at market ₹'}{gc.targetSellPriceP50}/kg
            </p>
          </div>
        )}
        {gc.estimatedProfit !== null && (
          <div className="ml-auto text-right">
            <p className="text-[10px] text-gray-400 mb-0.5">
              {isHindi ? 'अनुमानित बैच लाभ' : 'Est. batch profit'}
            </p>
            <p className={`text-xl font-bold tabular-nums ${gc.estimatedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(gc.estimatedProfit / 100000).toFixed(2)}L
            </p>
            <p className="text-[10px] text-gray-400">
              {gc.liveKgs.toFixed(0)} kg live weight
            </p>
          </div>
        )}
      </div>

      {/* Cost breakdown grid — 5 columns */}
      {size === 'full' && (
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[
            { label: isHindi ? 'DOC' : 'DOC',         labelHi: 'DOC लागत',          value: gc.docCost,         pct: gc.totalCost > 0 ? (gc.docCost / gc.totalCost * 100) : 0 },
            { label: isHindi ? 'चारा' : 'Feed',       labelHi: 'चारा लागत',          value: gc.feedCost,        pct: gc.totalCost > 0 ? (gc.feedCost / gc.totalCost * 100) : 0 },
            { label: isHindi ? 'दवाई' : 'Medicine',   labelHi: 'दवाई + टीका',        value: gc.medicineCost + gc.vaccineCost, pct: gc.totalCost > 0 ? ((gc.medicineCost + gc.vaccineCost) / gc.totalCost * 100) : 0 },
            { label: isHindi ? 'मजदूरी' : 'Labour',   labelHi: 'मजदूरी लागत',        value: gc.labourCost,      pct: gc.totalCost > 0 ? (gc.labourCost / gc.totalCost * 100) : 0 },
            { label: isHindi ? 'अन्य' : 'Other',      labelHi: 'बिजली+पानी+अन्य',   value: gc.electricityCost + gc.waterCost + gc.miscCost + gc.fixedOverhead, pct: gc.totalCost > 0 ? ((gc.electricityCost + gc.waterCost + gc.miscCost + gc.fixedOverhead) / gc.totalCost * 100) : 0 },
          ].map(item => (
            <div key={item.label} className="bg-[#F4F7F5] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900 tabular-nums">
                ₹{(item.value / 1000).toFixed(1)}K
              </p>
              <p className="text-[10px] text-gray-400">{item.pct.toFixed(0)}% of total</p>
            </div>
          ))}
        </div>
      )}

      {/* Industry benchmark comparison bar */}
      <div>
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>{isHindi ? 'उद्योग बेंचमार्क: ₹95/kg' : 'Industry benchmark: ₹95/kg'}</span>
          <span>{isHindi ? 'आपका GC: ₹' : 'Your GC: ₹'}{gc.gcPerKg.toFixed(0)}/kg</span>
        </div>
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          {/* Benchmark marker */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
               style={{ left: `${(INDUSTRY_BENCHMARK_GC_PER_KG / 150) * 100}%` }} />
          {/* GC fill */}
          <div className="absolute top-0 left-0 bottom-0 rounded-full"
               style={{ width: `${Math.min((gc.gcPerKg / 150) * 100, 100)}%`, background: colour }} />
        </div>
        <div className="flex justify-between text-[9px] text-gray-300 mt-0.5">
          <span>₹0</span>
          <span>₹75</span>
          <span>₹95↑</span>
          <span>₹112</span>
          <span>₹150</span>
        </div>
      </div>
    </div>
  )
}
```

---

### FILE 1D: GC Input Form (for entering/editing GC costs)
**Create:** `apps/web/components/gc/GCInputForm.tsx`

This form allows updating all GC cost components. It should appear:
1. As a tab in Farm Detail (`/dashboard/farms/[id]?tab=gc`)
2. As a step in the batch start wizard (after placing chicks)

Build a form with `react-hook-form` + Zod that has:
- All 9 cost input fields (DOC cost total, litter, fixed overhead, medicine, vaccine, electricity, water, labour, misc)
- Each field: label in Hindi + English, ₹ prefix, numeric input
- Below each field: show the auto-computed per-bird or per-kg contribution
- "Labour cost" field: shows a note "Auto-populated from Employee module" if employees are assigned to this farm
- "Feed cost" field: read-only, shown as computed from feed purchase log
- Submit button: PUT `/api/farms/[farmId]/gc`
- After save: show updated GCSummaryCard immediately (SWR mutate)
- Add a "Quick Entry" collapsible section at top for first-time setup

---

### FILE 1E: GC Tab in Farm Detail
**Update:** `apps/web/app/dashboard/farms/[id]/page.tsx`

Add a new tab "GC / लागत" (6th tab, between Feed and Batch History) that renders:
1. `<GCSummaryCard farmId={farmId} size="full" />`
2. `<GCInputForm farmId={farmId} />` below it
3. `<GCCostTrendChart farmId={farmId} />` — mini Recharts LineChart showing GC per batch (historical trend across last 5 batches)
4. `<GCBreakdownPieChart gc={gcData} />` — Recharts PieChart showing cost component proportions

**GCCostTrendChart:** Fetch from `/api/farms/[farmId]/gc/history` — returns last 5 completed batches with their final GC values. Plot as a line chart with industry benchmark (₹95) as a reference line.

**GCBreakdownPieChart:** Standard Recharts PieChart with 5 slices: DOC, Feed, Medicine+Vaccine, Labour, Other. Colours: each slice uses a different shade of the brand green palette.

---

### FILE 1F: GC on Farm Portfolio Cards
**Update:** `apps/web/components/farms/FarmCard.tsx`

Add `<GCSummaryCard farmId={farm.id} size="mini" />` inside the farm card, below the FCR and Mortality metrics row.

---

### FILE 1G: GC on Portfolio Metrics page
**Update:** `apps/web/app/dashboard/metrics/page.tsx`

Add a new section "Portfolio GC Overview" showing:
- Average GC across all active batches
- GC range: best performing farm vs worst performing farm
- A bar chart (Recharts) showing GC per farm (horizontal bar chart, sorted worst to best, industry benchmark line)
- Red bars for GC > ₹112, amber for ₹100–112, green for < ₹100

---

### FILE 1H: GC on Price Forecast Screen
**Update:** `apps/web/app/dashboard/price-intelligence/forecast/components/SellHoldMatrix.tsx`

Replace the static break-even price display with live GC data:
- When a farm is selected in the matrix dropdown: fetch its real GC
- Show: "Break-even (GC): ₹[gcPerKg]/kg" sourced from real data
- Show: "Current margin: ₹[price - GC]/kg" in green or red
- Show: "Batch profit if sold today: ₹[margin × liveKgs]L"

Also update the `ForecastKPIStrip` to show a 5th card "Your GC" when user has active farms — showing the portfolio average GC vs current sell price.

---

### FILE 1I: GC on Calculator Page
**Update:** `apps/web/app/dashboard/calculator/page.tsx`

- "Load from Farm" dropdown: when farm is selected, also pull GC from the GC API
- Auto-fill the "Break-even price" field with `gcPerKg`
- Show "GC: ₹XX/kg (computed from your cost records)" label next to the field
- In the Sell vs Hold Matrix: replace manual "Feed Cost" input with read-only "GC per kg" from real data
- Show "Margin at sell-today: ₹[P50 - GC]/kg" in the matrix

---

# ═══════════════════════════════════════════════════════════════
# FEATURE 2: EMPLOYEE & EXPENSE MANAGEMENT MODULE
# ═══════════════════════════════════════════════════════════════

## NEW SCREEN: `/dashboard/employees`

This is a completely new page in the sidebar under "ANALYTICS" section.
Sidebar navigation: add "👥 Employees & Expenses" → `/dashboard/employees`

This screen gives the integrator owner a complete view of:
1. All employees, their roles, and monthly salary status
2. Business expenses (non-employee costs like vehicle fuel, office)
3. Monthly P&L overview (revenue from farms vs total costs)

### SCREEN LAYOUT (top to bottom)

**Section 1: Monthly Summary Strip (4 KPI cards)**
- Total Payroll This Month: sum of all net_salary for current month
- Total Business Expenses: sum of business_expenses for current month
- Total Staff: count of active employees
- Labour Cost per Bird (portfolio average): total_labour_cost / total_birds_alive

**Section 2: Tabs — [👥 Employees] [💰 Salaries] [📋 Expenses] [📊 P&L Overview]**

---

### FILE 2A: Employee List Tab
**Route:** `/dashboard/employees?tab=employees`

Layout:
- Filter bar: [All Roles ▾] [All Farms ▾] [Active ●] [Inactive] + [+ Add Employee] button
- Employee cards grid (3-col desktop, 2-col tablet, 1-col mobile)

Each employee card shows:
- Avatar circle (initials, brand colour)
- Name (English + Hindi if available)
- Role badge (Farm Manager / Field Supervisor / Farm Worker / Driver / etc.)
- Assigned farms (pill list of farm names, max 2 shown + "+N more")
- Employment type badge (Permanent / Contractual / Daily Wage)
- Join date
- Monthly salary: "₹XX,XXX/month" or "₹XXX/day"
- Salary status: "✓ Paid — June 2026" (green) or "⚠ Pending — June 2026" (amber)
- [View Details] and [Process Salary] action buttons

**Add Employee flow:** Slide-in panel (not modal, not new page) with all fields from the `employees` table schema above. Multi-step: (1) Personal Info → (2) Role & Assignment → (3) Compensation → (4) Bank Details → (5) Review & Save.

---

### FILE 2B: Salary Management Tab
**Route:** `/dashboard/employees?tab=salaries`

Layout:
- Month/Year selector (defaults to current month)
- Summary: [Gross Payroll] [Total Deductions] [Net Payable] [Paid] [Pending]
- Employee salary table:

Columns: Employee Name | Role | Days Present | Basic Salary | Allowances | Deductions | Net Salary | Status | Action

Each row:
- Status: green "Paid ✓" / amber "Pending" / red "On Hold"
- Action: [Process ▾] dropdown → Mark as Paid | Add Advance | Put on Hold

**Process Salary Modal:** When clicking "Process" for an employee:
- Pre-fills gross earnings from employee base salary
- Editable fields: days present, HRA, conveyance, bonus, overtime hours, advances, other deductions
- Shows computed: total deductions, net salary
- Shows farm allocation: [Farm A: 40%] [Farm B: 40%] [Office: 20%] (drag to adjust)
  - This allocation determines how labour cost is split across GC for each farm
- [Mark as Paid] button with payment mode selector (Bank Transfer / Cash / UPI)

**Bulk Actions:**
- [Process All Pending] — generates salary for all employees with salary_records
- [Download Salary Sheet] — CSV/Excel export of the month's salary data
- [Mark All as Paid] — bulk payment confirmation

---

### FILE 2C: Business Expenses Tab
**Route:** `/dashboard/employees?tab=expenses`

Layout:
- Filter bar: [This Month] [Last 3 Months] [This Year] + [Category ▾] + [Farm ▾] + [+ Add Expense]
- Expense summary cards: Total | Farm-linked | General Business | Tax Deductible
- Expense list (table):

Columns: Date | Category | Description | Farm | Amount | Payment Mode | Receipt | Actions

**Add Expense form (inline, above table):**
- Date, Category (dropdown), Description, Amount, Farm (optional), Batch (optional), Payment mode, GST amount, Receipt upload, Notes
- Category icons: 🚗 Vehicle, 🏢 Office, 📱 Communication, ✈️ Travel, 🔧 Equipment, 🏥 Insurance, etc.

**Expense categories by type:**
```
Farm Operations: veterinary_visit, farm_repair, equipment_purchase, equipment_maintenance
Vehicle: vehicle_fuel, vehicle_maintenance, vehicle_insurance
Office: office_supplies, communication, internet, printing
Professional: audit_fees, legal_fees, consultant_fees
Other: miscellaneous, bank_charges, travel
```

---

### FILE 2D: P&L Overview Tab
**Route:** `/dashboard/employees?tab=pl`

This is the most important tab — it shows the integrator's complete financial picture.

**P&L Structure:**

```
REVENUE
  ├─ Farm Revenue (from completed + active batches)
  │    ├─ Completed batches this quarter: ₹XX.XL (actual)
  │    └─ Active batches (projected at P50): ₹XX.XL (forecast)
  └─ TOTAL REVENUE: ₹XX.XL

VARIABLE COSTS (per batch)
  ├─ DOC Cost (all farms): ₹X.XL
  ├─ Feed Cost (all farms): ₹X.XL (from feed_purchases)
  ├─ Medicine & Vaccine: ₹X.XL
  ├─ Litter & Consumables: ₹X.XL
  └─ TOTAL VARIABLE COSTS: ₹X.XL

GROSS MARGIN: ₹X.XL (Revenue - Variable Costs)
GROSS MARGIN %: XX%

FIXED & OVERHEAD COSTS
  ├─ Employee Salaries (this month): ₹X.XL
  ├─ Business Expenses (this month): ₹X.XL
  ├─ Fixed Overhead (allocated): ₹X.XL
  └─ TOTAL FIXED COSTS: ₹X.XL

NET PROFIT / LOSS: ₹X.XL
NET MARGIN %: XX%

PER-BIRD ECONOMICS (portfolio average)
  ├─ Revenue per bird: ₹XXX
  ├─ Variable cost per bird (GC): ₹XX
  ├─ Fixed cost per bird: ₹XX
  └─ Net profit per bird: ₹XX
```

**Visual components on P&L tab:**
1. Revenue vs Cost waterfall chart (Recharts BarChart showing each component as a stack)
2. Month-over-month trend line (last 6 months net profit)
3. Farm-wise contribution table (which farms are most/least profitable)
4. GC comparison table across farms

**API:** `GET /api/pl/overview?period=current_quarter` — fetches all data from batch_gc_costs, salary_records, business_expenses, and completed batch revenue records.

---

### FILE 2E: API Routes for Employee Module
**Create:** `apps/web/app/api/employees/route.ts` — GET (list) + POST (create)
**Create:** `apps/web/app/api/employees/[id]/route.ts` — GET + PUT + DELETE
**Create:** `apps/web/app/api/salary/route.ts` — GET (list for month) + POST (create record)
**Create:** `apps/web/app/api/salary/[id]/route.ts` — PUT (update/process)
**Create:** `apps/web/app/api/expenses/route.ts` — GET + POST
**Create:** `apps/web/app/api/expenses/[id]/route.ts` — PUT + DELETE
**Create:** `apps/web/app/api/pl/overview/route.ts` — GET P&L summary

All routes:
- Require authentication (check session, return 401 if missing)
- Validate request body with Zod schema
- Scope all queries to `integrator_id = session.user.id` (RLS)
- Return user-friendly error messages (not raw Postgres errors)
- Response time < 300ms

---

### FILE 2F: GC Labour Cost Auto-Sync
**Create:** `apps/web/lib/gc/syncLabourCost.ts`

When a salary record is marked as "Paid" or saved:
1. Get the farm allocations from the salary record
2. For each allocated farm: compute the farm's share of this employee's net salary
3. Fetch the active batch for that farm
4. Add/update the `labour_cost_total` in `batch_gc_costs` for that batch
5. Trigger `compute_batch_gc` RPC to refresh GC metrics

This creates the automatic connection: paying an employee → automatically updates GC for all affected farms.

```typescript
export async function syncLabourCostToGC(
  supabase: any,
  salaryRecordId: string
): Promise<void> {
  const { data: record } = await supabase
    .from('salary_records')
    .select('net_salary, farm_allocations, month, year')
    .eq('id', salaryRecordId)
    .single()

  if (!record?.farm_allocations) return

  const allocations = record.farm_allocations as Array<{ farm_id: string; allocation_pct: number }>

  for (const alloc of allocations) {
    const farmLabourShare = record.net_salary * (alloc.allocation_pct / 100)

    // Get active batch for this farm
    const { data: farm } = await supabase
      .from('farms')
      .select('current_batch_id')
      .eq('id', alloc.farm_id)
      .single()

    if (!farm?.current_batch_id) continue

    // Sum ALL salary allocations for this farm for the current batch period
    // (we re-aggregate rather than adding incrementally to avoid double-counting)
    const { data: allSalaries } = await supabase
      .from('salary_records')
      .select('net_salary, farm_allocations')
      .eq('month', record.month)
      .eq('year', record.year)
      .eq('payment_status', 'paid')

    const totalFarmLabour = allSalaries?.reduce((sum: number, sr: any) => {
      const fa = sr.farm_allocations?.find((a: any) => a.farm_id === alloc.farm_id)
      return sum + (fa ? sr.net_salary * (fa.allocation_pct / 100) : 0)
    }, 0) ?? 0

    // Update GC
    await supabase
      .from('batch_gc_costs')
      .upsert({ labour_cost_total: totalFarmLabour, batch_id: farm.current_batch_id, farm_id: alloc.farm_id })
      .eq('batch_id', farm.current_batch_id)

    await supabase.rpc('compute_batch_gc', { p_batch_id: farm.current_batch_id })
  }
}
```

---

## SIDEBAR NAVIGATION UPDATE

**Update:** `apps/web/components/layout/Sidebar.tsx`

Add to ANALYTICS section:
```
👥 Employees & Expenses    /dashboard/employees
```

The existing nav items remain. Place this below "Portfolio Metrics" and above "Reports".

---

## INTEGRATION SUMMARY: WHERE GC APPEARS

After implementing all the above, GC must be visible on these screens:

1. **Farm Portfolio** (`/dashboard/farms`): GC mini badge on each farm card
2. **Farm Detail** (`/dashboard/farms/[id]`): New "GC / लागत" tab with full breakdown
3. **Portfolio Metrics** (`/dashboard/metrics`): New "Portfolio GC Overview" section
4. **Price Forecast** (`/dashboard/price-intelligence/forecast`): Break-even = GC, margin shown in Sell vs Hold matrix
5. **Calculator** (`/dashboard/calculator`): GC auto-fills break-even price from real data
6. **Overview Dashboard** (`/dashboard`): New KPI card "Avg Portfolio GC" for S1/S2 users
7. **Batch History** (`/dashboard/farms/[id]?tab=batch-history`): Final GC column in batch history table
8. **WhatsApp Confirmation messages**: Add "GC अब तक: ₹XX/kg" in daily log confirmation

---

## IMPORTANT IMPLEMENTATION RULES

1. **Never show blank states** — every loading state has a skeleton, every empty state has a message + CTA
2. **All ₹ values**: formatted with `toLocaleString('en-IN')` for Indian number formatting (₹1,25,000 not ₹125,000)
3. **GC colours** always come from `gcStatusColour()` function — never hardcode hex in JSX
4. **Labour cost auto-sync**: always runs after any salary record is saved as "paid"
5. **Feed cost in GC**: NEVER store in batch_gc_costs — always compute live from feed_purchases table
6. **RLS on every API route**: every query must be scoped to `integrator_id = session.user.id`
7. **Zod validation**: every API route body validated with Zod before touching database
8. **SWR revalidation**: GC data revalidates every 5 minutes and on window focus
9. **Hindi labels**: every field, status, and message has both Hindi and English versions
10. **Error messages**: never show Postgres error codes — map all errors to user-friendly Hindi/English

---

## FILE CREATION CHECKLIST

Create the following files (✅ = create new, 🔄 = update existing):

```
DATABASE:
  ✅ supabase/migrations/[timestamp]_gc_employee_module.sql

GC MODULE:
  ✅ apps/web/lib/types/gc.ts
  ✅ apps/web/app/api/farms/[farmId]/gc/route.ts
  ✅ apps/web/app/api/farms/[farmId]/gc/history/route.ts
  ✅ apps/web/components/gc/GCSummaryCard.tsx
  ✅ apps/web/components/gc/GCInputForm.tsx
  ✅ apps/web/components/gc/GCCostTrendChart.tsx
  ✅ apps/web/components/gc/GCBreakdownPieChart.tsx
  🔄 apps/web/app/dashboard/farms/[id]/page.tsx       ← add GC tab
  🔄 apps/web/components/farms/FarmCard.tsx            ← add GC mini badge
  🔄 apps/web/app/dashboard/metrics/page.tsx           ← add Portfolio GC section
  🔄 apps/web/app/dashboard/price-intelligence/forecast/components/SellHoldMatrix.tsx  ← real GC break-even
  🔄 apps/web/app/dashboard/calculator/page.tsx        ← auto-fill GC
  🔄 apps/web/app/dashboard/page.tsx                   ← GC KPI card for S1/S2

EMPLOYEE MODULE:
  ✅ apps/web/app/dashboard/employees/page.tsx
  ✅ apps/web/app/dashboard/employees/components/EmployeeCard.tsx
  ✅ apps/web/app/dashboard/employees/components/AddEmployeePanel.tsx
  ✅ apps/web/app/dashboard/employees/components/SalaryTable.tsx
  ✅ apps/web/app/dashboard/employees/components/ProcessSalaryModal.tsx
  ✅ apps/web/app/dashboard/employees/components/ExpenseList.tsx
  ✅ apps/web/app/dashboard/employees/components/AddExpenseForm.tsx
  ✅ apps/web/app/dashboard/employees/components/PLOverview.tsx
  ✅ apps/web/app/api/employees/route.ts
  ✅ apps/web/app/api/employees/[id]/route.ts
  ✅ apps/web/app/api/salary/route.ts
  ✅ apps/web/app/api/salary/[id]/route.ts
  ✅ apps/web/app/api/expenses/route.ts
  ✅ apps/web/app/api/expenses/[id]/route.ts
  ✅ apps/web/app/api/pl/overview/route.ts
  ✅ apps/web/lib/gc/syncLabourCost.ts
  🔄 apps/web/components/layout/Sidebar.tsx            ← add Employees nav item
```

---

## START HERE — Implementation Order

Work in this exact order to avoid dependency errors:

1. **Database migration** — run `FlockIQ_gc_employee_module.sql` first
2. **Types** — create `gc.ts` types file
3. **GC API routes** — GET and PUT for `/api/farms/[farmId]/gc`
4. **GCSummaryCard component** — the most-used component across all screens
5. **GCInputForm component**
6. **GC tab in Farm Detail page** — integrates the two components above
7. **GC mini badge on Farm Cards** — quick win, visible immediately
8. **Employee database + API routes** — complete CRUD
9. **Employee page** — all 4 tabs
10. **syncLabourCost utility** — connects Employee + GC modules
11. **P&L Overview tab** — depends on all previous data being available
12. **Integration updates** — forecast screen, calculator, metrics, dashboard

---

Begin with Step 1 (database migration). After each step, confirm the file was created successfully before moving to the next step. If any file already exists in the codebase, update it rather than replacing it — preserve any existing functionality.
