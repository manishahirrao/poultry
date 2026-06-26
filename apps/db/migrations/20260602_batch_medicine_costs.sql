-- FlockIQ Gap Remediation - Medicine Cost Tracking
-- Migration: 20260602_batch_medicine_costs.sql
-- Description: Creates batch_medicine_costs table for medicine and vaccine cost entries
-- Requirements: REQ-GAP1-PL-005, REQ-GAP3-HEALTH-002
-- Task: TASK-GAP1-DB-002

-- batch_medicine_costs: medicine and vaccine cost entries per batch
-- Also used by Treatment Log (Gap 3) — single source of truth
CREATE TABLE IF NOT EXISTS batch_medicine_costs (
  med_cost_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id          UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Treatment reference (nullable: medicine cost can exist without a treatment record)
  treatment_id      UUID REFERENCES batch_treatments(treatment_id) ON DELETE SET NULL,

  entry_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  medicine_name     TEXT NOT NULL,
  brand_name        TEXT,
  lot_number        TEXT,
  purpose           TEXT CHECK (purpose IN ('preventive','therapeutic','vaccination','vitamin','other')),

  quantity          NUMERIC(10,3) NOT NULL,
  unit              TEXT NOT NULL CHECK (unit IN ('ml','g','kg','tablets','vials')),
  rate_per_unit     NUMERIC(10,2),
  total_cost        NUMERIC(12,2),

  -- Treatment schedule
  treatment_day_start INTEGER,
  treatment_day_end   INTEGER,
  withdrawal_days     INTEGER DEFAULT 0,
  last_dose_date      DATE,
  clearance_date      DATE GENERATED ALWAYS AS (last_dose_date + withdrawal_days * INTERVAL '1 day') STORED,

  is_complete       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bmc_batch_id ON batch_medicine_costs(batch_id);
CREATE INDEX IF NOT EXISTS idx_bmc_clearance ON batch_medicine_costs(clearance_date) WHERE withdrawal_days > 0;

ALTER TABLE batch_medicine_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own batch_medicine_costs"
  ON batch_medicine_costs FOR ALL
  USING (integrator_id = auth.uid()::TEXT)
  WITH CHECK (integrator_id = auth.uid()::TEXT);

CREATE TRIGGER set_batch_medicine_costs_updated_at
  BEFORE UPDATE ON batch_medicine_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
