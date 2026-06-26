-- FlockIQ Gap Remediation - Batch P&L Cost Tracking
-- Migration: 20260602_batch_costs.sql
-- Description: Creates batch_costs table for chick, labour, and overhead cost tracking
-- Requirements: REQ-GAP1-PL-001 through REQ-GAP1-PL-007
-- Task: TASK-GAP1-DB-001

-- batch_costs: stores chick procurement, labour, and overhead costs per batch
CREATE TABLE IF NOT EXISTS batch_costs (
  cost_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id      UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  category      TEXT NOT NULL CHECK (category IN ('chick', 'labour_daily', 'labour_period', 'overhead', 'other')),

  -- Chick-specific fields (nullable for other categories)
  doc_supplier        TEXT,
  price_per_doc       NUMERIC(10,2),
  transport_cost      NUMERIC(10,2),

  -- Labour-specific fields
  workers_count       INTEGER,
  rate_per_day        NUMERIC(10,2),
  period_start_date   DATE,
  period_end_date     DATE,
  days_count          INTEGER,

  -- Overhead-specific fields
  overhead_category   TEXT, -- electricity | water | litter | fuel | repairs | insurance | depreciation | other
  frequency           TEXT CHECK (frequency IN ('once', 'weekly', 'monthly')),
  batch_share_pct     NUMERIC(5,2) DEFAULT 100.00,

  -- Common fields
  description   TEXT,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes         TEXT,
  entry_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_batch_costs_batch_id ON batch_costs(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_costs_integrator_id ON batch_costs(integrator_id);
CREATE INDEX IF NOT EXISTS idx_batch_costs_category ON batch_costs(batch_id, category);

-- RLS
ALTER TABLE batch_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own batch_costs"
  ON batch_costs
  FOR ALL
  USING (integrator_id = auth.uid()::TEXT)
  WITH CHECK (integrator_id = auth.uid()::TEXT);

-- Trigger for updated_at
CREATE TRIGGER set_batch_costs_updated_at
  BEFORE UPDATE ON batch_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
