-- FlockIQ Gap Remediation - Flock Benchmarking
-- Migration: 20260602_aggregated_benchmarks.sql
-- Description: Creates aggregated_benchmarks table and adds batch completion fields
-- Requirements: REQ-GAP5-BENCH-001 through REQ-GAP5-BENCH-007
-- Task: TASK-GAP5-DB-001

-- Add batch completion fields to batches table
ALTER TABLE batches
  ADD COLUMN IF NOT EXISTS harvest_ready BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS birds_alive INTEGER,
  ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS batch_closed_at TIMESTAMPTZ;

-- ─────────────────────────────────────────────────────────

-- aggregated_benchmarks: pre-computed anonymised benchmark data
-- Populated by a nightly scheduled Supabase Edge Function
-- Never exposes individual farm data — min sample_count = 10
CREATE TABLE IF NOT EXISTS aggregated_benchmarks (
  benchmark_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed           TEXT NOT NULL DEFAULT 'All',
  region          TEXT NOT NULL DEFAULT 'All India',
  flock_size_cat  TEXT NOT NULL DEFAULT 'All'
    CHECK (flock_size_cat IN ('All','small','medium','large','commercial')),
  period          TEXT NOT NULL DEFAULT 'last_3_batches',
  metric_name     TEXT NOT NULL,
  p10_value       NUMERIC(10,4),
  p25_value       NUMERIC(10,4),
  p50_value       NUMERIC(10,4),
  p75_value       NUMERIC(10,4),
  p90_value       NUMERIC(10,4),
  sample_count    INTEGER NOT NULL,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bench_filters ON aggregated_benchmarks(breed, region, flock_size_cat, period, metric_name);

-- This table is READ-ONLY for all authenticated users
-- No RLS write policy (insert only via service role from Edge Function)
ALTER TABLE aggregated_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users read benchmarks" ON aggregated_benchmarks FOR SELECT
  TO authenticated USING (true);

-- Seed with initial placeholder data (will be replaced by Edge Function nightly)
-- These are approximate real-world Indian broiler averages for Gorakhpur region
INSERT INTO aggregated_benchmarks (breed, region, flock_size_cat, period, metric_name, p25_value, p50_value, p75_value, sample_count, computed_at) VALUES
('All','All India','All','last_3_batches','fcr', 1.85, 1.92, 2.05, 0, NOW()),
('All','All India','All','last_3_batches','mortality_pct', 2.1, 3.2, 4.8, 0, NOW()),
('All','All India','All','last_3_batches','adg_g', 44, 48, 53, 0, NOW()),
('All','All India','All','last_3_batches','harvest_weight_kg', 1.72, 1.85, 2.0, 0, NOW()),
('All','All India','All','last_3_batches','batch_duration_days', 38, 40, 43, 0, NOW()),
('All','All India','All','last_3_batches','gross_margin_pct', 12, 18, 24, 0, NOW()),
('Cobb 430','UP/Bihar Belt','All','last_3_batches','fcr', 1.80, 1.88, 2.00, 0, NOW()),
('Cobb 430','UP/Bihar Belt','All','last_3_batches','mortality_pct', 2.0, 3.0, 4.5, 0, NOW()),
('Ross 308','Maharashtra/Gujarat','All','last_3_batches','fcr', 1.78, 1.87, 1.98, 0, NOW()),
('Ross 308','Maharashtra/Gujarat','All','last_3_batches','mortality_pct', 1.8, 2.9, 4.2, 0, NOW());
-- NOTE: sample_count = 0 for placeholder data; Edge Function sets real counts after first run
