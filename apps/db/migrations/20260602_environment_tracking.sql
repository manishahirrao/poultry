-- FlockIQ Gap Remediation - Environment Data Tracking
-- Migration: 20260602_environment_tracking.sql
-- Description: Adds environment columns to daily_logs and creates breed standards tables
-- Requirements: REQ-GAP4-ENV-001 through REQ-GAP4-ENV-003
-- Task: TASK-GAP4-DB-001

-- Add environment tracking columns to existing daily_logs table
-- All nullable for backwards compatibility
ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS temp_morning       NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS temp_afternoon     NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS temp_evening       NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS humidity_morning   NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS humidity_afternoon NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS ammonia_ppm        NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS ammonia_method     TEXT CHECK (ammonia_method IN ('measured','estimated_litter')),
  ADD COLUMN IF NOT EXISTS litter_condition   TEXT CHECK (litter_condition IN ('dry','damp','wet','very_wet')),
  ADD COLUMN IF NOT EXISTS light_hours        NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS light_schedule     TEXT CHECK (light_schedule IN ('continuous','intermittent','other')),
  ADD COLUMN IF NOT EXISTS fan_speed          TEXT CHECK (fan_speed IN ('tunnel','low','medium','high')),
  ADD COLUMN IF NOT EXISTS curtain_position   TEXT CHECK (curtain_position IN ('fully_open','half_open','closed')),
  ADD COLUMN IF NOT EXISTS inlet_pct          SMALLINT CHECK (inlet_pct BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS ventilation_notes  TEXT,
  ADD COLUMN IF NOT EXISTS water_temp_c       NUMERIC(5,1);

-- NOTE: existing temperature column (if named 'temp_c' or 'temperature') is kept for backwards
-- compatibility; new columns are temp_morning, temp_afternoon, temp_evening
-- Map old temp_c to temp_afternoon on read if temp_afternoon is NULL

-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS breed_growth_standards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed       TEXT NOT NULL,
  day         SMALLINT NOT NULL,
  standard_weight_g NUMERIC(8,1) NOT NULL,
  source      TEXT, -- 'Aviagen Ross 308 2022 Performance Objectives'
  PRIMARY KEY (breed, day) -- no duplication
);

-- Seed with standard Aviagen/Cobb data (publicly available from their breed guides)
-- Ross 308 Male+Female average (approximate from Aviagen 2022 guide):
INSERT INTO breed_growth_standards (breed, day, standard_weight_g, source) VALUES
('Ross 308', 1, 42, 'Aviagen 2022'),('Ross 308', 3, 67, 'Aviagen 2022'),
('Ross 308', 5, 100, 'Aviagen 2022'),('Ross 308', 7, 147, 'Aviagen 2022'),
('Ross 308', 10, 232, 'Aviagen 2022'),('Ross 308', 14, 393, 'Aviagen 2022'),
('Ross 308', 17, 548, 'Aviagen 2022'),('Ross 308', 21, 775, 'Aviagen 2022'),
('Ross 308', 24, 992, 'Aviagen 2022'),('Ross 308', 28, 1322, 'Aviagen 2022'),
('Ross 308', 31, 1600, 'Aviagen 2022'),('Ross 308', 35, 1970, 'Aviagen 2022'),
('Ross 308', 38, 2245, 'Aviagen 2022'),('Ross 308', 42, 2580, 'Aviagen 2022'),
-- Cobb 430 (approximate from Cobb-Vantress 2020 guide):
('Cobb 430', 1, 44, 'Cobb-Vantress 2020'),('Cobb 430', 7, 152, 'Cobb-Vantress 2020'),
('Cobb 430', 14, 404, 'Cobb-Vantress 2020'),('Cobb 430', 21, 793, 'Cobb-Vantress 2020'),
('Cobb 430', 28, 1350, 'Cobb-Vantress 2020'),('Cobb 430', 35, 2005, 'Cobb-Vantress 2020'),
('Cobb 430', 42, 2638, 'Cobb-Vantress 2020'),
-- Hubbard JV (approximate):
('Hubbard JV', 7, 162, 'Hubbard 2021'),('Hubbard JV', 14, 430, 'Hubbard 2021'),
('Hubbard JV', 21, 835, 'Hubbard 2021'),('Hubbard JV', 28, 1410, 'Hubbard 2021'),
('Hubbard JV', 35, 2050, 'Hubbard 2021'),('Hubbard JV', 42, 2700, 'Hubbard 2021');

-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS breed_light_programme (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed       TEXT NOT NULL,
  day_start   SMALLINT NOT NULL,
  day_end     SMALLINT NOT NULL,
  target_hours NUMERIC(4,1) NOT NULL,
  notes       TEXT
);

INSERT INTO breed_light_programme (breed, day_start, day_end, target_hours, notes) VALUES
('Ross 308', 1, 7, 22, 'First week near-continuous light'),
('Ross 308', 8, 21, 18, 'Standard growing phase'),
('Ross 308', 22, 35, 18, 'Pre-harvest phase'),
('Ross 308', 36, 42, 20, 'Final growth stimulation'),
('Cobb 430', 1, 7, 23, 'Near-continuous early light'),
('Cobb 430', 8, 28, 18, 'Standard growing'),
('Cobb 430', 29, 42, 20, 'Pre-harvest increase'),
('Hubbard JV', 1, 7, 22, 'Early growth'),
('Hubbard JV', 8, 35, 18, 'Standard phase'),
('Hubbard JV', 36, 42, 20, 'Harvest prep');
