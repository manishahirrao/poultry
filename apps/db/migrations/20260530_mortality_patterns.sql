-- PoultryPulse AI - Mortality Pattern Detection Schema
-- Migration: 20260530_mortality_patterns.sql
-- Description: Creates table for storing mortality pattern detection results
-- Requirements: REQ-016 §16.7, REQ-024 §24.1, TASK-040

-- Enum for detected mortality patterns
CREATE TYPE mortality_pattern AS ENUM (
  'doc_stress',
  'ibd_pattern',
  'heat_stress',
  'disease_outbreak',
  'normal',
  'unknown'
);

-- Mortality patterns table
CREATE TABLE IF NOT EXISTS mortality_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  
  -- Pattern detection results
  detected_pattern mortality_pattern NOT NULL,
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  
  -- Recommendations in both languages
  recommendation_hindi TEXT NOT NULL,
  recommendation_english TEXT NOT NULL,
  
  -- Detection metadata
  detection_method TEXT NOT NULL CHECK (detection_method IN ('rule_based', 'ml', 'hybrid')),
  detection_trigger TEXT NOT NULL CHECK (detection_trigger IN ('abnormal_alert', 'harvest', 'manual')),
  
  -- Feature values used for detection (for debugging/analysis)
  spike_day INTEGER,
  cause_distribution JSONB,
  season TEXT,
  fcr_trend DECIMAL(5,3),
  mortality_rate_7d_avg DECIMAL(5,4),
  mortality_rate_today DECIMAL(5,4),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT batch_pattern_unique UNIQUE (batch_id, detection_trigger, created_at)
);

-- Indexes for efficient querying
CREATE INDEX idx_mortality_patterns_batch_id ON mortality_patterns(batch_id);
CREATE INDEX idx_mortality_patterns_detected_pattern ON mortality_patterns(detected_pattern);
CREATE INDEX idx_mortality_patterns_created_at ON mortality_patterns(created_at DESC);
CREATE INDEX idx_mortality_patterns_detection_trigger ON mortality_patterns(detection_trigger);

-- Row Level Security
ALTER TABLE mortality_patterns ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view patterns for their own batches
CREATE POLICY "Users can view own mortality_patterns"
ON mortality_patterns FOR SELECT
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- RLS: System can insert patterns (via service role)
CREATE POLICY "Service role can insert mortality_patterns"
ON mortality_patterns FOR INSERT
WITH CHECK (true);

-- Function to trigger pattern detection on abnormal mortality alert
CREATE OR REPLACE FUNCTION trigger_mortality_pattern_detection()
RETURNS TRIGGER AS $$
DECLARE
  batch_id_val UUID;
  spike_day_val INTEGER;
  mortality_rate_today_val DECIMAL(5,4);
  mortality_rate_7d_avg_val DECIMAL(5,4);
BEGIN
  -- Get batch_id from the new mortality log
  batch_id_val := NEW.batch_id;
  
  -- Calculate spike day (age at death)
  SELECT CURRENT_DATE - doc_placement_date INTO spike_day_val
  FROM batches
  WHERE id = batch_id_val;
  
  -- Calculate today's mortality rate
  SELECT (COUNT::DECIMAL / doc_count::DECIMAL) * 100 INTO mortality_rate_today_val
  FROM (
    SELECT COUNT(*) as count
    FROM mortality_logs
    WHERE batch_id = batch_id_val AND log_date = CURRENT_DATE
  ) daily_count,
  (
    SELECT doc_count
    FROM batches
    WHERE id = batch_id_val
  ) batch_doc;
  
  -- Calculate 7-day average mortality rate
  SELECT AVG(daily_rate) INTO mortality_rate_7d_avg_val
  FROM (
    SELECT (COUNT::DECIMAL / doc_count::DECIMAL) * 100 as daily_rate
    FROM mortality_logs ml
    CROSS JOIN (SELECT doc_count FROM batches WHERE id = batch_id_val) b
    WHERE ml.batch_id = batch_id_val
      AND ml.log_date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY ml.log_date
  ) rates;
  
  -- Only trigger if mortality is abnormal (3x 7-day average)
  IF mortality_rate_today_val > (mortality_rate_7d_avg_val * 3) THEN
    -- Call the pattern detection function (to be implemented in Python/Edge Function)
    -- This is a placeholder - actual implementation will call the ML model
    INSERT INTO mortality_patterns (
      batch_id,
      detected_pattern,
      confidence,
      recommendation_hindi,
      recommendation_english,
      detection_method,
      detection_trigger,
      spike_day,
      mortality_rate_today,
      mortality_rate_7d_avg
    ) VALUES (
      batch_id_val,
      'unknown',
      0.5,
      'विश्लेषण जारी है - Pattern detection pending',
      'Analysis in progress - Pattern detection pending',
      'rule_based',
      'abnormal_alert',
      spike_day_val,
      mortality_rate_today_val,
      mortality_rate_7d_avg_val
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call pattern detection on mortality log insert
CREATE TRIGGER trg_mortality_pattern_detection
  AFTER INSERT ON mortality_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_mortality_pattern_detection();

-- Comment explaining the table
COMMENT ON TABLE mortality_patterns IS 'Stores mortality pattern detection results from ML model and rule-based analysis';
COMMENT ON COLUMN mortality_patterns.detected_pattern IS 'The detected mortality pattern category';
COMMENT ON COLUMN mortality_patterns.confidence IS 'Model confidence score (0-1) for the detected pattern';
COMMENT ON COLUMN mortality_patterns.recommendation_hindi IS 'Actionable recommendation in Hindi';
COMMENT ON COLUMN mortality_patterns.recommendation_english IS 'Actionable recommendation in English';
COMMENT ON COLUMN mortality_patterns.detection_method IS 'Method used: rule_based, ml, or hybrid';
COMMENT ON COLUMN mortality_patterns.detection_trigger IS 'What triggered detection: abnormal_alert, harvest, or manual';
