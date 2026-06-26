-- FlockIQ - GC (Growing Cost) & Employee Management Module
-- Migration: 20260606_gc_employee_module.sql
-- Description: Creates tables for GC cost tracking and employee/expense management
-- Requirements: FlockIQ_Windsurf_Prompt.md § DATABASE CHANGES
-- Dependencies: 001_initial_schema.sql (customers, farms, batches tables must exist)

-- ═══════════════════════════════════════════════════
-- GC (GROWING COST) TABLES
-- ═══════════════════════════════════════════════════

-- Store GC cost inputs per batch (one row per batch)
CREATE TABLE IF NOT EXISTS batch_gc_costs (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id               UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id              UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  integrator_id         UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

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
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
  integrator_id     UUID NOT NULL REFERENCES customers(id),
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
  integrator_id     UUID NOT NULL REFERENCES customers(id),
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
  integrator_id     UUID NOT NULL REFERENCES customers(id),
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
