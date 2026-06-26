-- FlockIQ Gap Remediation - Sales & Lifting Management
-- Migration: 20260602_batch_sales_buyers.sql
-- Description: Creates batch_sales and buyers tables for bird lifting/sales tracking
-- Requirements: REQ-GAP2-SALES-001 through REQ-GAP2-SALES-006
-- Task: TASK-GAP2-DB-001

CREATE TABLE IF NOT EXISTS buyers (
  buyer_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrator_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT,
  location      TEXT,
  buyer_type    TEXT CHECK (buyer_type IN ('trader','processor','cooperative','direct','other')),
  notes         TEXT,
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own buyers" ON buyers FOR ALL
  USING (integrator_id = auth.uid()::TEXT)
  WITH CHECK (integrator_id = auth.uid()::TEXT);

-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS batch_sales (
  sale_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id          UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  sale_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  sale_type         TEXT NOT NULL CHECK (sale_type IN ('full','partial')),

  birds_sold        INTEGER NOT NULL CHECK (birds_sold > 0),
  total_weight_kg   NUMERIC(10,3) NOT NULL,
  actual_avg_weight_g NUMERIC(8,1),
  rate_per_kg       NUMERIC(10,2) NOT NULL,
  gross_revenue     NUMERIC(14,2) GENERATED ALWAYS AS (total_weight_kg * rate_per_kg) STORED,

  commission_amount NUMERIC(10,2) DEFAULT 0,
  commission_pct    NUMERIC(5,2),
  weighment_deduction_kg NUMERIC(8,3) DEFAULT 0,
  net_revenue       NUMERIC(14,2),

  buyer_id          UUID REFERENCES buyers(buyer_id) ON DELETE SET NULL,
  buyer_name_snapshot TEXT, -- stores name at time of sale if no buyer_id

  vehicle_number    TEXT,
  driver_name       TEXT,
  departure_time    TIMESTAMPTZ,
  destination       TEXT,
  crates_used       INTEGER,
  dead_in_transit   INTEGER DEFAULT 0,

  payment_status    TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','confirmed','paid')),
  challan_number    TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES customers(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batch_sales_batch_id ON batch_sales(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_sales_farm_id ON batch_sales(farm_id);

ALTER TABLE batch_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own batch_sales" ON batch_sales FOR ALL
  USING (integrator_id = auth.uid()::TEXT)
  WITH CHECK (integrator_id = auth.uid()::TEXT);

CREATE TRIGGER set_batch_sales_updated_at
  BEFORE UPDATE ON batch_sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
