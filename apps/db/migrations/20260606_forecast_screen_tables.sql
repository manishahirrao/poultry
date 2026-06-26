-- FlockIQ - Forecast Screen Tables
-- Migration: 20260606_forecast_screen_tables.sql
-- Description: Creates tables for broiler price forecast screen
-- Requirements: FSC-DB-001 from FlockIQ_Forecast_Screen_Tasks_v1.md

-- ─── TABLE: model_accuracy_by_horizon ────────────────────────────────────────
-- Stores directional accuracy % per forecast horizon day.
-- Populated by model validation pipeline after each weekly retrain.
CREATE TABLE IF NOT EXISTS model_accuracy_by_horizon (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_version    VARCHAR(20) NOT NULL,           -- e.g., 'v1.0'
  horizon_days     INTEGER NOT NULL,               -- 1, 3, 7, 14, 21, 30
  directional_acc  NUMERIC(5,2) NOT NULL,          -- % e.g., 95.20
  mape             NUMERIC(5,2) NOT NULL,          -- e.g., 4.80
  sample_size      INTEGER NOT NULL,               -- number of predictions tested
  computed_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (model_version, horizon_days)
);

-- Seed with current values (update after each retrain):
INSERT INTO model_accuracy_by_horizon
  (model_version, horizon_days, directional_acc, mape, sample_size) VALUES
  ('v1.0', 1,  96.00, 2.1,  90),
  ('v1.0', 3,  92.00, 3.8,  85),
  ('v1.0', 7,  82.00, 5.9,  78),
  ('v1.0', 14, 70.00, 8.2,  65),
  ('v1.0', 21, 58.00, 11.4, 52),
  ('v1.0', 30, 46.00, 14.7, 40)
ON CONFLICT (model_version, horizon_days) DO NOTHING;

-- ─── TABLE: sell_signals ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sell_signals (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mandi_id          VARCHAR(50) NOT NULL,
  signal_date       DATE NOT NULL,               -- date signal was computed for
  signal            VARCHAR(20) NOT NULL,         -- SELL_NOW | HOLD | CAUTION
  optimal_win_start DATE,
  optimal_win_end   DATE,
  expected_p50_low  NUMERIC(8,2),
  expected_p50_high NUMERIC(8,2),
  confidence        INTEGER CHECK (confidence BETWEEN 1 AND 5),
  reasons           TEXT[],                      -- array of reason strings
  computed_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (mandi_id, signal_date)
);

-- ─── TABLE: price_drivers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_drivers (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mandi_id          VARCHAR(50) NOT NULL,
  prediction_date   DATE NOT NULL,
  rank              INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 10),
  feature_key       VARCHAR(100) NOT NULL,        -- e.g., 'maize_lag42d'
  name_en           VARCHAR(200) NOT NULL,
  name_hi           VARCHAR(200) NOT NULL,
  description_en    VARCHAR(500),
  description_hi    VARCHAR(500),
  impact_rs         NUMERIC(8,2) NOT NULL,        -- ₹ impact (positive=up, neg=down)
  magnitude_pct     NUMERIC(5,2) NOT NULL,        -- 0–100 for bar width
  confidence        VARCHAR(20) DEFAULT 'HIGH',
  UNIQUE (mandi_id, prediction_date, rank)
);

-- ─── TABLE: festivals ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS festivals (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en         VARCHAR(100) NOT NULL,
  name_hi         VARCHAR(100) NOT NULL,
  festival_date   DATE NOT NULL,
  end_date        DATE,                          -- NULL if single-day
  demand_impact   VARCHAR(20) DEFAULT 'HIGH',    -- HIGH | MEDIUM | LOW
  district_scope  TEXT[],                        -- NULL = all districts
  notes           TEXT
);

-- Seed upcoming festivals (India poultry demand calendar):
INSERT INTO festivals (name_en, name_hi, festival_date, end_date, demand_impact) VALUES
  ('Bakrid / Eid ul-Adha', 'बकरीद', '2026-06-17', '2026-06-19', 'HIGH'),
  ('Muharram',             'मुहर्रम', '2026-07-06', NULL,          'MEDIUM'),
  ('Independence Day',     'स्वतंत्रता दिवस', '2026-08-15', NULL, 'LOW'),
  ('Navratri',             'नवरात्रि', '2026-09-22', '2026-09-30', 'HIGH'),
  ('Dussehra',             'दशहरा',   '2026-10-02', NULL,          'MEDIUM'),
  ('Diwali',               'दीपावली',  '2026-10-20', '2026-10-24', 'HIGH'),
  ('Christmas',            'क्रिसमस',  '2026-12-25', NULL,          'MEDIUM')
ON CONFLICT DO NOTHING;

-- ─── TABLE: price_alerts (user-configured) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS price_alerts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mandi_id        VARCHAR(50) NOT NULL,
  alert_type      VARCHAR(30) NOT NULL,   -- 'above_price'|'below_price'|'signal_sell'
  threshold_rs    NUMERIC(8,2),           -- NULL for signal_sell type
  notify_whatsapp BOOLEAN DEFAULT TRUE,
  notify_email    BOOLEAN DEFAULT TRUE,
  notify_inapp    BOOLEAN DEFAULT TRUE,
  is_active       BOOLEAN DEFAULT TRUE,
  last_triggered  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_alerts" ON price_alerts
  FOR ALL USING (user_id = auth.uid());

-- ─── TABLE: prediction_access_log ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prediction_access_log (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID NOT NULL,
  mandi_id              VARCHAR(50),
  horizon               INTEGER,           -- days requested
  ip_hash               VARCHAR(64),       -- SHA-256 of IP (not raw IP)
  device_fingerprint    VARCHAR(64),       -- SHA-256 of User-Agent + Accept headers
  watermark_token       VARCHAR(100),      -- unique watermark applied to this response
  accessed_at           TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS on access log — admin-only table, not user-facing
-- Access via service role only

-- ─── TABLE: price_forecasts ────────────────────────────────────────────────────
-- Stores P10/P50/P90 forecast values per mandi per date
CREATE TABLE IF NOT EXISTS price_forecasts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mandi_id        VARCHAR(50) NOT NULL,
  forecast_date   DATE NOT NULL,
  p10             NUMERIC(8,2) NOT NULL,
  p50             NUMERIC(8,2) NOT NULL,
  p90             NUMERIC(8,2) NOT NULL,
  model_version   VARCHAR(20) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT forecast_range_order CHECK (p10 <= p50 AND p50 <= p90),
  UNIQUE (mandi_id, forecast_date, model_version)
);

-- ─── TABLE: price_actuals ────────────────────────────────────────────────────────
-- Stores actual recorded mandi prices per date
CREATE TABLE IF NOT EXISTS price_actuals (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mandi_id        VARCHAR(50) NOT NULL,
  price_date      DATE NOT NULL,
  actual_price    NUMERIC(8,2) NOT NULL,
  source          VARCHAR(50) DEFAULT 'AGMARKNET',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (mandi_id, price_date)
);

-- ─── TABLE: hpai_alerts ─────────────────────────────────────────────────────────
-- Stores HPAI (bird flu) disease alerts by district
CREATE TABLE IF NOT EXISTS hpai_alerts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district_name   VARCHAR(100) NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  radius_km       INTEGER DEFAULT 200,
  severity        VARCHAR(20) DEFAULT 'HIGH',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_price_forecasts_mandi_date
  ON price_forecasts(mandi_id, forecast_date);

CREATE INDEX IF NOT EXISTS idx_price_actuals_mandi_date
  ON price_actuals(mandi_id, price_date DESC);

CREATE INDEX IF NOT EXISTS idx_hpai_alerts_district_active
  ON hpai_alerts(district_name, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_sell_signals_mandi_date
  ON sell_signals(mandi_id, signal_date DESC);

CREATE INDEX IF NOT EXISTS idx_price_drivers_mandi_date
  ON price_drivers(mandi_id, prediction_date DESC);

CREATE INDEX IF NOT EXISTS idx_festivals_date
  ON festivals(festival_date);

CREATE INDEX IF NOT EXISTS idx_prediction_access_user
  ON prediction_access_log(user_id, accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_accuracy_version_horizon
  ON model_accuracy_by_horizon(model_version, horizon_days);
