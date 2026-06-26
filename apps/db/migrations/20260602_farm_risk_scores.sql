-- FlockIQ Gap Remediation - Farm Risk Scores
-- Migration: 20260602_farm_risk_scores.sql
-- Description: Creates farm_risk_scores table and adds biosecurity_level to farms
-- Requirements: REQ-GAP6-RISK-001 through REQ-GAP6-RISK-004
-- Task: TASK-GAP6-DB-001

-- Add biosecurity level to farms table
ALTER TABLE farms
  ADD COLUMN IF NOT EXISTS biosecurity_level TEXT
    NOT NULL DEFAULT 'medium'
    CHECK (biosecurity_level IN ('low', 'medium', 'high'));

-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS farm_risk_scores (
  score_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  alert_id          UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  integrator_id     UUID NOT NULL REFERENCES customers(id),

  proximity_km      NUMERIC(8,2),
  proximity_score   NUMERIC(4,2) NOT NULL,
  age_score         NUMERIC(4,2) NOT NULL,
  vaccination_score NUMERIC(4,2) NOT NULL,
  biosecurity_score NUMERIC(4,2) NOT NULL,
  total_score       NUMERIC(5,2) NOT NULL,
  risk_level        TEXT NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH')),

  calculated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (farm_id, alert_id, calculated_at)  -- history of recalculations
);

CREATE INDEX IF NOT EXISTS idx_risk_farm_alert ON farm_risk_scores(farm_id, alert_id);
CREATE INDEX IF NOT EXISTS idx_risk_level ON farm_risk_scores(risk_level, alert_id);

ALTER TABLE farm_risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own risk scores" ON farm_risk_scores FOR SELECT
  USING (integrator_id = auth.uid()::TEXT);
-- INSERT/UPDATE only via service role (from Edge Function)
