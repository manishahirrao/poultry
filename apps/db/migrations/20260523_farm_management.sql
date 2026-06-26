-- PoultryPulse AI - Farm Management Database Schema
-- Migration: 20260523_farm_management.sql
-- Description: Creates all tables for farm management module (S2 Integrators)
-- Requirements: 14_integrator_farms_design_master.md §8, 15_integrator_farms_tasks_master.md FD-01
-- Dependencies: 001_initial_schema.sql (customers table must exist)

-- ────────────────────────────────────────────────────────────
-- farms: one row per physical farm location
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrator_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  farm_type         TEXT NOT NULL CHECK (farm_type IN ('broiler','layer','breeder')),
  district          TEXT NOT NULL,
  state             TEXT NOT NULL DEFAULT 'Uttar Pradesh',
  block             TEXT,
  village           TEXT,
  lat               DECIMAL(10,7),
  lng               DECIMAL(10,7),
  manager_name      TEXT,
  manager_phone     TEXT,
  total_capacity    INTEGER,       -- max birds this farm can hold
  status            TEXT NOT NULL DEFAULT 'onboarding'
                    CHECK (status IN ('active','between_batches','paused','archived','onboarding')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for farms
CREATE INDEX idx_farms_integrator ON farms(integrator_id, status);
CREATE INDEX idx_farms_district ON farms(district);

-- RLS: integrator can only see/modify their own farms
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY farms_owner ON farms
  USING (integrator_id = auth.uid());
CREATE POLICY farms_insert ON farms
  WITH CHECK (integrator_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- sheds: sheds within a farm
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sheds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id     UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,      -- "Shed A", "Shed 1"
  capacity    INTEGER NOT NULL,
  shed_type   TEXT CHECK (shed_type IN ('open_sided','env_controlled','semi_controlled')),
  floor_type  TEXT CHECK (floor_type IN ('litter','slat','cage')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for sheds
CREATE INDEX idx_sheds_farm ON sheds(farm_id);

-- RLS: integrator can only see sheds of their own farms
ALTER TABLE sheds ENABLE ROW LEVEL SECURITY;
CREATE POLICY sheds_owner ON sheds
  USING (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));
CREATE POLICY sheds_insert ON sheds
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- batches: one flock cycle per farm
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batches (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id               UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_number          INTEGER NOT NULL,
  breed                 TEXT,
  doc_supplier          TEXT,
  placement_date        DATE NOT NULL,
  birds_placed          INTEGER NOT NULL,
  price_per_doc         DECIMAL(8,2),       -- ₹/chick
  target_harvest_age    INTEGER DEFAULT 42, -- days
  target_market_weight  INTEGER DEFAULT 2100, -- grams
  feed_supplier         TEXT,
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','harvesting','closed')),
  closed_at             DATE,
  birds_harvested       INTEGER,
  notes                 TEXT,
  deleted_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (farm_id, batch_number)
);

-- Indexes for batches
CREATE INDEX idx_batches_farm_status ON batches(farm_id, status);

-- RLS: integrator can only see batches of their own farms
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY batches_owner ON batches
  USING (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));
CREATE POLICY batches_insert ON batches
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- daily_logs: one row per farm per day
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id              UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  farm_id               UUID NOT NULL REFERENCES farms(id),
  log_date              DATE NOT NULL,
  batch_day             INTEGER NOT NULL,  -- computed: log_date - placement_date
  deaths_today          INTEGER NOT NULL DEFAULT 0,
  death_cause           TEXT CHECK (death_cause IN ('unknown','heat','disease','injury','cull','other')),
  cumulative_deaths     INTEGER,          -- maintained by trigger
  cumulative_mortality_pct DECIMAL(5,2),  -- maintained by trigger
  feed_consumed_kg      DECIMAL(10,2) NOT NULL,
  feed_type             TEXT CHECK (feed_type IN ('starter','grower','finisher')),
  feed_per_bird_g       DECIMAL(8,2),     -- computed
  cumulative_feed_kg    DECIMAL(12,2),    -- maintained by trigger
  -- Weight (only on weigh-in days)
  sample_birds          INTEGER,
  sample_weight_kg      DECIMAL(8,2),
  avg_weight_g          DECIMAL(8,2),     -- computed: sample_weight_kg/sample_birds*1000
  -- FCR: computed when weight available
  fcr                   DECIMAL(5,3),     -- computed: cumulative_feed / (live_birds * avg_weight/1000)
  -- Environment
  water_litres          DECIMAL(8,2),
  temp_min_c            DECIMAL(4,1),
  temp_max_c            DECIMAL(4,1),
  humidity_pct          DECIMAL(4,1),
  -- Health
  health_issue          BOOLEAN DEFAULT FALSE,
  health_symptoms       TEXT[],           -- array of symptom tags
  health_severity       TEXT CHECK (health_severity IN ('mild','moderate','severe')),
  health_notes          TEXT,
  -- Meta
  notes                 TEXT,
  submitted_by          UUID REFERENCES customers(id),
  submitted_at          TIMESTAMPTZ DEFAULT now(),
  is_amended            BOOLEAN DEFAULT FALSE,
  amended_at            TIMESTAMPTZ,
  amended_by            UUID REFERENCES customers(id),
  deleted_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (batch_id, log_date)
);

-- Indexes for daily_logs
CREATE INDEX idx_daily_logs_batch_date ON daily_logs(batch_id, log_date DESC);
CREATE INDEX idx_daily_logs_farm_date ON daily_logs(farm_id, log_date DESC);

-- RLS: integrator can only see logs of their own farms
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_logs_owner ON daily_logs
  USING (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));
CREATE POLICY daily_logs_insert ON daily_logs
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- vaccinations: vaccination schedule per batch
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vaccinations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  vaccine_name    TEXT NOT NULL,
  vaccine_type    TEXT,
  scheduled_day   INTEGER NOT NULL,
  due_date        DATE NOT NULL,
  administered_date DATE,
  admin_route     TEXT,     -- drinking water, spray, injection
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','done','overdue','skipped')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for vaccinations
CREATE INDEX idx_vaccinations_batch_due ON vaccinations(batch_id, due_date);

-- RLS: integrator can only see vaccinations of their own farms
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY vaccinations_owner ON vaccinations
  USING (batch_id IN (
    SELECT b.id FROM batches b
    JOIN farms f ON b.farm_id = f.id
    WHERE f.integrator_id = auth.uid()
  ));
CREATE POLICY vaccinations_insert ON vaccinations
  WITH CHECK (batch_id IN (
    SELECT b.id FROM batches b
    JOIN farms f ON b.farm_id = f.id
    WHERE f.integrator_id = auth.uid()
  ));

-- ────────────────────────────────────────────────────────────
-- feed_purchases: feed stock management
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feed_purchases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id      UUID REFERENCES batches(id),
  purchase_date DATE NOT NULL,
  supplier      TEXT,
  feed_type     TEXT CHECK (feed_type IN ('starter','grower','finisher','other')),
  qty_kg        DECIMAL(10,2) NOT NULL,
  rate_per_kg   DECIMAL(8,2),
  total_cost    DECIMAL(12,2),
  invoice_number TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for feed_purchases
CREATE INDEX idx_feed_purchases_farm ON feed_purchases(farm_id, purchase_date DESC);

-- RLS: integrator can only see feed purchases of their own farms
ALTER TABLE feed_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY feed_purchases_owner ON feed_purchases
  USING (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));
CREATE POLICY feed_purchases_insert ON feed_purchases
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- health_checklist_state: for HPAI biosecurity checklist persistence
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_checklist_state (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id     UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  alert_id    UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  items       JSONB NOT NULL DEFAULT '{}',  -- { "item_key": boolean }
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(farm_id, alert_id)
);

-- RLS: integrator can only see checklist state of their own farms
ALTER TABLE health_checklist_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY health_checklist_state_owner ON health_checklist_state
  USING (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));
CREATE POLICY health_checklist_state_insert ON health_checklist_state
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- batch_report_jobs: async PDF generation queue
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batch_report_jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id    UUID NOT NULL REFERENCES batches(id),
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','processing','complete','failed')),
  pdf_path    TEXT,    -- Supabase Storage path
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ────────────────────────────────────────────────────────────
-- Materialized view: farm_metrics_summary (refreshed hourly)
-- For fast portfolio dashboard loads
-- ────────────────────────────────────────────────────────────
CREATE MATERIALIZED VIEW IF NOT EXISTS farm_metrics_summary AS
SELECT
  f.id AS farm_id,
  f.integrator_id,
  f.name AS farm_name,
  f.status AS farm_status,
  b.id AS batch_id,
  b.batch_number,
  b.placement_date,
  b.birds_placed,
  CURRENT_DATE - b.placement_date AS batch_day,
  b.birds_placed - COALESCE(SUM(dl.deaths_today), 0) AS birds_alive,
  ROUND(COALESCE(SUM(dl.deaths_today), 0)::NUMERIC / NULLIF(b.birds_placed - COALESCE(SUM(dl.deaths_today), 0), 0) * 100, 2) AS mortality_pct,
  ROUND(MAX(dl.fcr), 3) AS latest_fcr,
  MAX(dl.avg_weight_g) AS latest_weight_g,
  MAX(dl.log_date) AS last_log_date
FROM farms f
LEFT JOIN batches b ON b.farm_id = f.id AND b.status = 'active' AND b.deleted_at IS NULL
LEFT JOIN daily_logs dl ON dl.batch_id = b.id
  AND dl.log_date >= CURRENT_DATE - INTERVAL '90 days'
  AND dl.deleted_at IS NULL
GROUP BY f.id, f.integrator_id, f.name, f.status, b.id, b.batch_number, b.placement_date, b.birds_placed
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_farm_metrics_summary_farm_id ON farm_metrics_summary (farm_id);

-- ────────────────────────────────────────────────────────────
-- Triggers for computed fields in daily_logs
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION compute_daily_log_metrics()
RETURNS TRIGGER AS $$
DECLARE
  birds_placed INTEGER;
  cumulative_deaths INTEGER;
  birds_alive INTEGER;
BEGIN
  -- Compute batch_day
  NEW.batch_day := NEW.log_date - (SELECT placement_date FROM batches WHERE id = NEW.batch_id);
  
  -- Get bird counts for accurate feed_per_bird_g calculation
  SELECT birds_placed INTO birds_placed FROM batches WHERE id = NEW.batch_id;
  SELECT COALESCE(SUM(deaths_today), 0) INTO cumulative_deaths
  FROM daily_logs
  WHERE batch_id = NEW.batch_id AND log_date < NEW.log_date AND deleted_at IS NULL;
  birds_alive := birds_placed - cumulative_deaths - NEW.deaths_today;
  
  -- FIXED: Compute feed_per_bird_g using birds_alive (current living birds) instead of birds_placed
  IF NEW.feed_consumed_kg IS NOT NULL AND birds_alive > 0 THEN
    NEW.feed_per_bird_g := (NEW.feed_consumed_kg * 1000) / birds_alive;
  END IF;
  
  -- Compute avg_weight_g
  IF NEW.sample_birds IS NOT NULL AND NEW.sample_weight_kg IS NOT NULL AND NEW.sample_birds > 0 THEN
    NEW.avg_weight_g := (NEW.sample_weight_kg / NEW.sample_birds) * 1000;
  END IF;
  
  -- Compute cumulative values (will be updated by trigger after insert)
  NEW.cumulative_deaths := (
    SELECT COALESCE(SUM(deaths_today), 0) + NEW.deaths_today
    FROM daily_logs
    WHERE batch_id = NEW.batch_id AND log_date < NEW.log_date AND deleted_at IS NULL
  );
  
  NEW.cumulative_feed_kg := (
    SELECT COALESCE(SUM(feed_consumed_kg), 0) + NEW.feed_consumed_kg
    FROM daily_logs
    WHERE batch_id = NEW.batch_id AND log_date < NEW.log_date AND deleted_at IS NULL
  );
  
  -- Compute cumulative_mortality_pct
  IF NEW.cumulative_deaths IS NOT NULL THEN
    NEW.cumulative_mortality_pct := ROUND(
      (NEW.cumulative_deaths::NUMERIC / (SELECT birds_placed FROM batches WHERE id = NEW.batch_id)) * 100, 2
    );
  END IF;
  
  -- Compute FCR when weight available
  IF NEW.avg_weight_g IS NOT NULL AND NEW.cumulative_feed_kg IS NOT NULL THEN
    DECLARE
      birds_alive INTEGER;
    BEGIN
      birds_alive := (SELECT birds_placed - COALESCE(SUM(deaths_today), 0) 
                      FROM daily_logs 
                      WHERE batch_id = NEW.batch_id AND log_date <= NEW.log_date AND deleted_at IS NULL);
      IF birds_alive > 0 THEN
        NEW.fcr := ROUND(NEW.cumulative_feed_kg / (birds_alive * NEW.avg_weight_g / 1000), 3);
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_daily_log_metrics
  BEFORE INSERT OR UPDATE ON daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION compute_daily_log_metrics();

-- ────────────────────────────────────────────────────────────
-- Materialized view refresh function
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION refresh_farm_metrics_summary()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY farm_metrics_summary;
END;
$$ LANGUAGE SQL;

-- ────────────────────────────────────────────────────────────
-- pg_cron extension for scheduled jobs (if available)
-- ────────────────────────────────────────────────────────────
-- Note: pg_cron must be enabled in Supabase first
-- This will be scheduled via Supabase dashboard or separate migration
-- Schedule: every 30 minutes
-- SELECT cron.schedule('refresh-farm-metrics', '*/30 * * * *',
--   'SELECT refresh_farm_metrics_summary()');

-- ────────────────────────────────────────────────────────────
-- Grant permissions (if needed for service role)
-- ────────────────────────────────────────────────────────────
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
