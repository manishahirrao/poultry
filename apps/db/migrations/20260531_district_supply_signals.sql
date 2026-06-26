-- PoultryPulse AI - District Supply Signals Schema
-- Migration: 20260531_district_supply_signals.sql
-- Description: Creates table for district-level mortality aggregation and supply shock signals
-- Requirements: REQ-024 §24.1–24.2, TASK-041

-- Enum for supply signal levels
CREATE TYPE supply_signal AS ENUM ('high', 'normal', 'low');

-- District supply signals table
CREATE TABLE IF NOT EXISTS district_supply_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- District identification
  district TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Aggregated mortality metrics (7-day rolling)
  avg_mortality_rate_7d DECIMAL(5,4) NOT NULL,
  stddev_mortality_rate_7d DECIMAL(5,4),
  
  -- Statistical comparison vs 30-day baseline
  z_score_vs_30d_baseline DECIMAL(5,4),
  
  -- Supply signal classification
  supply_signal supply_signal NOT NULL,
  
  -- Sample size (number of distinct customers contributing)
  sample_size INTEGER NOT NULL CHECK (sample_size >= 3),
  
  -- Additional metrics for ML feature engineering
  total_birds_monitored INTEGER,
  total_mortality_count_7d INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT district_date_unique UNIQUE (district, date)
);

-- Indexes for efficient querying
CREATE INDEX idx_district_supply_signals_district ON district_supply_signals(district);
CREATE INDEX idx_district_supply_signals_date ON district_supply_signals(date DESC);
CREATE INDEX idx_district_supply_signals_supply_signal ON district_supply_signals(supply_signal);
CREATE INDEX idx_district_supply_signals_sample_size ON district_supply_signals(sample_size);

-- Row Level Security
ALTER TABLE district_supply_signals ENABLE ROW LEVEL SECURITY;

-- RLS: Service role can manage district signals (for aggregation jobs)
CREATE POLICY "Service role can manage district_supply_signals"
ON district_supply_signals FOR ALL
USING (true);

-- RLS: Users can view district signals (aggregated data, no individual customer data)
CREATE POLICY "Users can view district_supply_signals"
ON district_supply_signals FOR SELECT
USING (true);

-- Function to calculate daily mortality rate for a batch
CREATE OR REPLACE FUNCTION calculate_daily_mortality_rate(batch_uuid UUID, target_date DATE)
RETURNS DECIMAL(5,4) AS $$
DECLARE
  total_deaths INTEGER;
  doc_count INTEGER;
  daily_rate DECIMAL(5,4);
BEGIN
  -- Get total deaths for the target date
  SELECT COALESCE(SUM(count), 0) INTO total_deaths
  FROM mortality_logs
  WHERE batch_id = batch_uuid AND log_date = target_date;
  
  -- Get DOC count for the batch
  SELECT doc_count INTO doc_count
  FROM batches
  WHERE id = batch_uuid;
  
  -- Calculate daily mortality rate (deaths per 100 birds)
  IF doc_count > 0 THEN
    daily_rate := (total_deaths::DECIMAL / doc_count::DECIMAL) * 100;
  ELSE
    daily_rate := 0;
  END IF;
  
  RETURN daily_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate district mortality data
CREATE OR REPLACE FUNCTION aggregate_district_mortality(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  district_record RECORD;
  avg_mortality DECIMAL(5,4);
  stddev_mortality DECIMAL(5,4);
  z_score DECIMAL(5,4);
  signal_level supply_signal;
  sample_count INTEGER;
  total_birds INTEGER;
  total_deaths INTEGER;
  baseline_avg DECIMAL(5,4);
  baseline_stddev DECIMAL(5,4);
BEGIN
  -- Loop through each district with sufficient data (>= 3 customers)
  FOR district_record IN 
    SELECT 
      c.district,
      COUNT(DISTINCT b.customer_id) as customer_count
    FROM batches b
    JOIN customers c ON b.customer_id = c.id
    JOIN mortality_logs ml ON b.id = ml.batch_id
    WHERE ml.log_date >= target_date - INTERVAL '7 days'
      AND ml.log_date <= target_date
      AND c.district IS NOT NULL
    GROUP BY c.district
    HAVING COUNT(DISTINCT b.customer_id) >= 3
  LOOP
    -- Calculate 7-day average mortality rate for this district
    SELECT 
      AVG(daily_rate) as avg_rate,
      STDDEV(daily_rate) as std_rate,
      COUNT(DISTINCT b.customer_id) as sample_size,
      SUM(b.doc_count) as total_birds_count,
      SUM(ml.count) as total_mortality_count
    INTO avg_mortality, stddev_mortality, sample_count, total_birds, total_deaths
    FROM (
      SELECT 
        b.customer_id,
        b.id as batch_id,
        b.doc_count,
        ml.log_date,
        (ml.count::DECIMAL / b.doc_count::DECIMAL) * 100 as daily_rate
      FROM mortality_logs ml
      JOIN batches b ON ml.batch_id = b.id
      JOIN customers c ON b.customer_id = c.id
      WHERE c.district = district_record.district
        AND ml.log_date >= target_date - INTERVAL '7 days'
        AND ml.log_date <= target_date
    ) daily_data;
    
    -- Calculate 30-day baseline for z-score comparison
    SELECT 
      AVG(daily_rate) as baseline_avg,
      STDDEV(daily_rate) as baseline_std
    INTO baseline_avg, baseline_stddev
    FROM (
      SELECT 
        (ml.count::DECIMAL / b.doc_count::DECIMAL) * 100 as daily_rate
      FROM mortality_logs ml
      JOIN batches b ON ml.batch_id = b.id
      JOIN customers c ON b.customer_id = c.id
      WHERE c.district = district_record.district
        AND ml.log_date >= target_date - INTERVAL '37 days'
        AND ml.log_date < target_date - INTERVAL '7 days'
    ) baseline_data;
    
    -- Calculate z-score vs 30-day baseline
    IF baseline_stddev > 0 THEN
      z_score := (avg_mortality - baseline_avg) / baseline_stddev;
    ELSE
      z_score := 0;
    END IF;
    
    -- Classify supply signal based on z-score
    IF z_score > 1.5 THEN
      signal_level := 'high';  -- Higher mortality than normal = supply constraint
    ELSIF z_score < -1.5 THEN
      signal_level := 'low';   -- Lower mortality than normal = supply surplus
    ELSE
      signal_level := 'normal';
    END IF;
    
    -- Insert or update district supply signal
    INSERT INTO district_supply_signals (
      district,
      date,
      avg_mortality_rate_7d,
      stddev_mortality_rate_7d,
      z_score_vs_30d_baseline,
      supply_signal,
      sample_size,
      total_birds_monitored,
      total_mortality_count_7d,
      updated_at
    ) VALUES (
      district_record.district,
      target_date,
      avg_mortality,
      stddev_mortality,
      z_score,
      signal_level,
      sample_count,
      total_birds,
      total_deaths,
      NOW()
    )
    ON CONFLICT (district, date)
    DO UPDATE SET
      avg_mortality_rate_7d = EXCLUDED.avg_mortality_rate_7d,
      stddev_mortality_rate_7d = EXCLUDED.stddev_mortality_rate_7d,
      z_score_vs_30d_baseline = EXCLUDED.z_score_vs_30d_baseline,
      supply_signal = EXCLUDED.supply_signal,
      sample_size = EXCLUDED.sample_size,
      total_birds_monitored = EXCLUDED.total_birds_monitored,
      total_mortality_count_7d = EXCLUDED.total_mortality_count_7d,
      updated_at = NOW();
    
  END LOOP;
  
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger for district_supply_signals
CREATE TRIGGER update_district_supply_signals_updated_at
  BEFORE UPDATE ON district_supply_signals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments explaining the table and functions
COMMENT ON TABLE district_supply_signals IS 'Stores district-level aggregated mortality data and supply shock signals for ML feature engineering';
COMMENT ON COLUMN district_supply_signals.district IS 'District name (e.g., Gorakhpur, Basti, Varanasi)';
COMMENT ON COLUMN district_supply_signals.date IS 'Date of the aggregation';
COMMENT ON COLUMN district_supply_signals.avg_mortality_rate_7d IS 'Average daily mortality rate across all batches in district over 7 days';
COMMENT ON COLUMN district_supply_signals.stddev_mortality_rate_7d IS 'Standard deviation of mortality rates across district over 7 days';
COMMENT ON COLUMN district_supply_signals.z_score_vs_30d_baseline IS 'Z-score comparing 7-day mortality to 30-day historical baseline';
COMMENT ON COLUMN district_supply_signals.supply_signal IS 'Supply signal classification: high (mortality spike = supply constraint), normal, low (mortality drop = supply surplus)';
COMMENT ON COLUMN district_supply_signals.sample_size IS 'Number of distinct customers contributing to this aggregation (privacy threshold: >= 3)';
COMMENT ON COLUMN district_supply_signals.total_birds_monitored IS 'Total number of birds monitored across all batches in district';
COMMENT ON COLUMN district_supply_signals.total_mortality_count_7d IS 'Total mortality count across district over 7 days';

COMMENT ON FUNCTION aggregate_district_mortality IS 'Aggregates mortality data by district and calculates supply shock signals. Should run daily via Airflow DAG.';
