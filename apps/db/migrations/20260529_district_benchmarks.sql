-- PoultryPulse AI - District Benchmarks Table
-- Migration: 20260529_district_benchmarks.sql
-- Description: Creates district_benchmarks table for competitive performance benchmarking
-- Requirements: REQ-016 §16.6, REQ-016 §16.9, TASK-039
-- Privacy: Only shows benchmarks when COUNT(DISTINCT customer_id) >= 5

-- Create district_benchmarks table
CREATE TABLE IF NOT EXISTS district_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  breed TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('performance', 'weight_gain', 'mortality')),
  benchmark_date DATE NOT NULL,
  sample_size INTEGER NOT NULL, -- Number of distinct customers contributing to this benchmark
  
  -- Performance metrics (aggregated anonymized data)
  benchmark_data JSONB NOT NULL,
  
  -- Example benchmark_data structure for performance:
  -- {
  --   "avg_fcr": 1.75,
  --   "avg_mortality_pct": 3.2,
  --   "avg_weight_kg": 2.15,
  --   "avg_feed_cost_per_kg": 24.5,
  --   "avg_net_profit_per_bird": 32.0
  -- }
  
  -- Example benchmark_data structure for weight_gain:
  -- {
  --   "day_7_avg_weight": 0.18,
  --   "day_14_avg_weight": 0.45,
  --   "day_21_avg_weight": 0.85,
  --   "day_28_avg_weight": 1.35,
  --   "day_35_avg_weight": 1.85,
  --   "day_42_avg_weight": 2.20
  -- }
  
  -- Example benchmark_data structure for mortality:
  -- {
  --   "avg_daily_mortality_rate": 0.003,
  --   "avg_cumulative_mortality_pct": 3.2,
  --   "common_causes": ["respiratory", "unknown", "heat_stress"]
  -- }
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT district_breed_date_unique UNIQUE (district, breed, metric_type, benchmark_date)
);

-- Indexes for efficient queries
CREATE INDEX idx_district_benchmarks_district ON district_benchmarks(district);
CREATE INDEX idx_district_benchmarks_breed ON district_benchmarks(breed);
CREATE INDEX idx_district_benchmarks_metric_type ON district_benchmarks(metric_type);
CREATE INDEX idx_district_benchmarks_benchmark_date ON district_benchmarks(benchmark_date);
CREATE INDEX idx_district_benchmarks_sample_size ON district_benchmarks(sample_size);

-- Enable Row Level Security
ALTER TABLE district_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read district benchmarks (anonymized aggregated data)
CREATE POLICY "Authenticated users can view district benchmarks"
ON district_benchmarks FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policy: Only service role can insert/update district benchmarks (via Edge Functions)
CREATE POLICY "Service role can insert district benchmarks"
ON district_benchmarks FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update district benchmarks"
ON district_benchmarks FOR UPDATE
USING (auth.role() = 'service_role');

-- Function to check privacy threshold before returning benchmarks
CREATE OR REPLACE FUNCTION get_district_benchmarks_with_privacy_check(
  p_district TEXT,
  p_breed TEXT,
  p_metric_type TEXT
)
RETURNS TABLE (
  id UUID,
  district TEXT,
  breed TEXT,
  metric_type TEXT,
  benchmark_date DATE,
  sample_size INTEGER,
  benchmark_data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    db.id,
    db.district,
    db.breed,
    db.metric_type,
    db.benchmark_date,
    db.sample_size,
    CASE 
      WHEN db.sample_size >= 5 THEN db.benchmark_data
      ELSE NULL -- Return NULL if privacy threshold not met
    END as benchmark_data,
    db.created_at,
    db.updated_at
  FROM district_benchmarks db
  WHERE db.district = p_district
    AND db.breed = p_breed
    AND db.metric_type = p_metric_type
    AND db.benchmark_date = (
      SELECT MAX(benchmark_date) 
      FROM district_benchmarks 
      WHERE district = p_district 
        AND breed = p_breed 
        AND metric_type = p_metric_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger
CREATE TRIGGER update_district_benchmarks_updated_at 
  BEFORE UPDATE ON district_benchmarks
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant execute permission on the privacy check function to authenticated users
GRANT EXECUTE ON FUNCTION get_district_benchmarks_with_privacy_check(TEXT, TEXT, TEXT) TO authenticated;

-- Comment explaining privacy enforcement
COMMENT ON TABLE district_benchmarks IS 'Stores anonymized district-level performance benchmarks. Privacy enforced: benchmarks only shown when sample_size >= 5 distinct customers. Computed by nightly Edge Function aggregation.';
