-- FlockIQ Gap Remediation - Treatment Log & Vet Directory
-- Migration: 20260602_batch_treatments_vets.sql
-- Description: Creates batch_treatments and vets tables for medication tracking
-- Requirements: REQ-GAP3-HEALTH-001 through REQ-GAP3-HEALTH-005
-- Task: TASK-GAP3-DB-001

CREATE TABLE IF NOT EXISTS vets (
  vet_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrator_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  specialisation TEXT,
  phone         TEXT,
  location      TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vets" ON vets FOR ALL
  USING (integrator_id = auth.uid()::TEXT)
  WITH CHECK (integrator_id = auth.uid()::TEXT);

-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS batch_treatments (
  treatment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id          UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  treatment_date    DATE NOT NULL,
  medicine_name     TEXT NOT NULL,
  brand_name        TEXT,
  lot_number        TEXT,
  purpose           TEXT[],  -- multi-select: ['respiratory', 'enteric', etc.]
  dosage_amount     NUMERIC(10,3),
  dosage_unit       TEXT,
  dosage_per        TEXT CHECK (dosage_per IN ('per_litre_water','per_bird','per_kg_bw','per_kg_feed')),
  route             TEXT CHECK (route IN ('water','feed','injectable','topical','spray')),

  treatment_day_start INTEGER,
  treatment_day_end   INTEGER,
  last_dose_date      DATE,
  withdrawal_days     INTEGER NOT NULL DEFAULT 0,
  clearance_date      DATE,
  is_complete         BOOLEAN NOT NULL DEFAULT FALSE,

  vet_id            UUID REFERENCES vets(vet_id) ON DELETE SET NULL,
  vet_name_snapshot TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES customers(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatments_batch_id ON batch_treatments(batch_id);
CREATE INDEX IF NOT EXISTS idx_treatments_clearance ON batch_treatments(clearance_date) WHERE withdrawal_days > 0;

ALTER TABLE batch_treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own treatments" ON batch_treatments FOR ALL
  USING (integrator_id = auth.uid()::TEXT)
  WITH CHECK (integrator_id = auth.uid()::TEXT);

CREATE TRIGGER set_batch_treatments_updated_at
  BEFORE UPDATE ON batch_treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
