-- ═══════════════════════════════════════════════════════════════════════════════
-- POULTRYPULSE AI - COMBINED DATABASE MIGRATIONS
-- 
-- This file contains all 55 migration files combined into a single SQL document
-- for easy one-time setup of the entire database schema.
-- 
-- Generated: 2025-01-09
-- Total migrations: 55
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 001: Initial Schema
-- File: 001_initial_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enum types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('active', 'trial', 'past_due', 'cancelled', 'expired');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prediction_status') THEN
    CREATE TYPE prediction_status AS ENUM ('pending', 'processing', 'completed', 'failed');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_severity') THEN
    CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
    CREATE TYPE alert_type AS ENUM ('price_spike', 'price_drop', 'disease_outbreak', 'weather_alert', 'system_notification');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_status') THEN
    CREATE TYPE batch_status AS ENUM ('planned', 'growing', 'pre_harvest', 'harvest_ready', 'harvested', 'closed');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_type') THEN
    CREATE TYPE batch_type AS ENUM ('broiler', 'layer', 'breeder');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vaccination_route') THEN
    CREATE TYPE vaccination_route AS ENUM ('drinking_water', 'spray', 'injection', 'eye_drop', 'nasal');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medication_route') THEN
    CREATE TYPE medication_route AS ENUM ('oral', 'injection', 'topical', 'feed_additive');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mortality_cause') THEN
    CREATE TYPE mortality_cause AS ENUM ('respiratory', 'digestive', 'heat_stress', 'predation', 'unknown', 'other');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_category') THEN
    CREATE TYPE inventory_category AS ENUM ('feed', 'medicine', 'vaccine', 'equipment', 'other');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_type') THEN
    CREATE TYPE movement_type AS ENUM ('purchase', 'consumption', 'transfer', 'adjustment', 'sale');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'po_status') THEN
    CREATE TYPE po_status AS ENUM ('pending', 'approved', 'ordered', 'partial', 'received', 'cancelled');
  END IF;
END $$;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  name TEXT NOT NULL,
  farm_name TEXT,
  district TEXT,
  state TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'trial',
  subscription_start_date DATE,
  subscription_end_date DATE,
  whatsapp_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_district ON customers(district);
CREATE INDEX idx_customers_subscription_tier ON customers(subscription_tier);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  district TEXT NOT NULL,
  prediction_date DATE NOT NULL,
  prediction_status prediction_status DEFAULT 'pending',
  predicted_price DECIMAL(10,2),
  confidence_interval_lower DECIMAL(10,2),
  confidence_interval_upper DECIMAL(10,2),
  model_version TEXT,
  features_used JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for predictions
CREATE INDEX idx_predictions_customer_id ON predictions(customer_id);
CREATE INDEX idx_predictions_district ON predictions(district);
CREATE INDEX idx_predictions_prediction_date ON predictions(prediction_date);
CREATE INDEX idx_predictions_status ON predictions(prediction_status);

-- Accuracy logs table
CREATE TABLE IF NOT EXISTS accuracy_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
  actual_price DECIMAL(10,2),
  predicted_price DECIMAL(10,2),
  error_percentage DECIMAL(5,2),
  log_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for accuracy_logs
CREATE INDEX idx_accuracy_logs_customer_id ON accuracy_logs(customer_id);
CREATE INDEX idx_accuracy_logs_prediction_id ON accuracy_logs(prediction_id);
CREATE INDEX idx_accuracy_logs_log_date ON accuracy_logs(log_date);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  severity alert_severity NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for alerts
CREATE INDEX idx_alerts_customer_id ON alerts(customer_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- Batches table
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  batch_id TEXT UNIQUE NOT NULL,
  batch_type batch_type DEFAULT 'broiler',
  status batch_status DEFAULT 'planned',
  doc_placement_date DATE NOT NULL,
  doc_count INTEGER NOT NULL,
  doc_supplier TEXT,
  breed TEXT,
  target_harvest_weight_kg DECIMAL(5,2),
  target_harvest_age_days INTEGER,
  shed_id TEXT,
  initial_feed_brand TEXT,
  initial_feed_type TEXT,
  current_bird_count INTEGER,
  current_avg_weight_kg DECIMAL(5,2),
  current_fcr DECIMAL(5,2),
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for batches
CREATE INDEX idx_batches_customer_id ON batches(customer_id);
CREATE INDEX idx_batches_batch_id ON batches(batch_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_doc_placement_date ON batches(doc_placement_date);

-- Model registry table
CREATE TABLE IF NOT EXISTS model_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  model_type TEXT NOT NULL,
  accuracy_score DECIMAL(5,4),
  training_date DATE,
  is_active BOOLEAN DEFAULT FALSE,
  model_path TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for model_registry
CREATE INDEX idx_model_registry_model_name ON model_registry(model_name);
CREATE INDEX idx_model_registry_is_active ON model_registry(is_active);

-- Scraper config table
CREATE TABLE IF NOT EXISTS scraper_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  scrape_frequency_hours INTEGER DEFAULT 24,
  last_scrape_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for scraper_config
CREATE INDEX idx_scraper_config_source_name ON scraper_config(source_name);
CREATE INDEX idx_scraper_config_is_active ON scraper_config(is_active);

-- Anomaly logs table
CREATE TABLE IF NOT EXISTS anomaly_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT,
  data JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for anomaly_logs
CREATE INDEX idx_anomaly_logs_customer_id ON anomaly_logs(customer_id);
CREATE INDEX idx_anomaly_logs_resolved ON anomaly_logs(resolved);
CREATE INDEX idx_anomaly_logs_created_at ON anomaly_logs(created_at DESC);

-- NECC weekly data table
CREATE TABLE IF NOT EXISTS necc_weekly_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  mandi_name TEXT NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  volume_tonnes DECIMAL(10,2),
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for necc_weekly_data
CREATE INDEX idx_necc_weekly_data_week_start ON necc_weekly_data(week_start_date);
CREATE INDEX idx_necc_weekly_data_mandi_name ON necc_weekly_data(mandi_name);

-- Macro data table
CREATE TABLE IF NOT EXISTS macro_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_date DATE NOT NULL,
  data_type TEXT NOT NULL,
  data_value DECIMAL(15,4),
  data_source TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for macro_data
CREATE INDEX idx_macro_data_data_date ON macro_data(data_date);
CREATE INDEX idx_macro_data_data_type ON macro_data(data_type);

-- Row Level Security (RLS) Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_logs ENABLE ROW LEVEL SECURITY;

-- Customers RLS
CREATE POLICY "Users can view own customer data" ON customers FOR SELECT USING (auth.uid()::TEXT = id::TEXT);
CREATE POLICY "Users can update own customer data" ON customers FOR UPDATE USING (auth.uid()::TEXT = id::TEXT);

-- Predictions RLS
CREATE POLICY "Users can view own predictions" ON predictions FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can insert own predictions" ON predictions FOR INSERT WITH CHECK (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can update own predictions" ON predictions FOR UPDATE USING (customer_id::TEXT = auth.uid()::TEXT);

-- Accuracy logs RLS
CREATE POLICY "Users can view own accuracy logs" ON accuracy_logs FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can insert own accuracy logs" ON accuracy_logs FOR INSERT WITH CHECK (customer_id::TEXT = auth.uid()::TEXT);

-- Alerts RLS
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can update own alerts" ON alerts FOR UPDATE USING (customer_id::TEXT = auth.uid()::TEXT);

-- Batches RLS
CREATE POLICY "Users can view own batches" ON batches FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can insert own batches" ON batches FOR INSERT WITH CHECK (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can update own batches" ON batches FOR UPDATE USING (customer_id::TEXT = auth.uid()::TEXT);

-- Anomaly logs RLS
CREATE POLICY "Users can view own anomaly logs" ON anomaly_logs FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can update own anomaly logs" ON anomaly_logs FOR UPDATE USING (customer_id::TEXT = auth.uid()::TEXT);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scraper_config_updated_at BEFORE UPDATE ON scraper_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 002: Accuracy Functions
-- File: 002_accuracy_functions.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to compute rolling MAPE (Mean Absolute Percentage Error)
DO $$
DECLARE
  func_record RECORD;
BEGIN
  -- Drop all functions with the name compute_rolling_mape regardless of signature
  FOR func_record IN 
    SELECT oid FROM pg_proc WHERE proname = 'compute_rolling_mape'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS compute_rolling_mape(' || pg_get_function_identity_arguments(func_record.oid) || ') CASCADE';
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION compute_rolling_mape(p_customer_id UUID, p_window_days INTEGER DEFAULT 30)
RETURNS TABLE (
  prediction_date DATE,
  mape DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.log_date,
    AVG(ABS((al.actual_price - al.predicted_price) / al.actual_price) * 100) as mape
  FROM accuracy_logs al
  WHERE al.customer_id = p_customer_id
    AND al.log_date >= CURRENT_DATE - (p_window_days || ' days')::INTERVAL
  GROUP BY al.log_date
  ORDER BY al.log_date;
END;
$$ LANGUAGE plpgsql;

-- Function to compute directional accuracy
DO $$
BEGIN
  DROP FUNCTION IF EXISTS compute_directional_accuracy(UUID, INTEGER);
END $$;

CREATE OR REPLACE FUNCTION compute_directional_accuracy(p_customer_id UUID, p_window_days INTEGER DEFAULT 30)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_correct_predictions INTEGER := 0;
  v_total_predictions INTEGER := 0;
  v_accuracy DECIMAL(5,2);
BEGIN
  SELECT
    COUNT(CASE WHEN 
      (al.actual_price > LAG(al.actual_price) OVER (ORDER BY al.log_date) AND 
       al.predicted_price > LAG(al.predicted_price) OVER (ORDER BY al.log_date))
      OR
      (al.actual_price < LAG(al.actual_price) OVER (ORDER BY al.log_date) AND 
       al.predicted_price < LAG(al.predicted_price) OVER (ORDER BY al.log_date))
      THEN 1 END) as correct,
    COUNT(*) as total
  INTO v_correct_predictions, v_total_predictions
  FROM accuracy_logs al
  WHERE al.customer_id = p_customer_id
    AND al.log_date >= CURRENT_DATE - (p_window_days || ' days')::INTERVAL
    AND LAG(al.actual_price) OVER (ORDER BY al.log_date) IS NOT NULL;
  
  IF v_total_predictions > 0 THEN
    v_accuracy := (v_correct_predictions::DECIMAL / v_total_predictions) * 100;
  ELSE
    v_accuracy := 0;
  END IF;
  
  RETURN v_accuracy;
END;
$$ LANGUAGE plpgsql;

-- Function to compute conformal coverage
DO $$
BEGIN
  DROP FUNCTION IF EXISTS compute_conformal_coverage(UUID, INTEGER);
END $$;

CREATE OR REPLACE FUNCTION compute_conformal_coverage(p_customer_id UUID, p_window_days INTEGER DEFAULT 30)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_covered_predictions INTEGER := 0;
  v_total_predictions INTEGER := 0;
  v_coverage DECIMAL(5,2);
BEGIN
  SELECT
    COUNT(CASE WHEN al.actual_price BETWEEN al.confidence_interval_lower AND al.confidence_interval_upper THEN 1 END) as covered,
    COUNT(*) as total
  INTO v_covered_predictions, v_total_predictions
  FROM accuracy_logs al
  WHERE al.customer_id = p_customer_id
    AND al.log_date >= CURRENT_DATE - (p_window_days || ' days')::INTERVAL
    AND al.confidence_interval_lower IS NOT NULL
    AND al.confidence_interval_upper IS NOT NULL;
  
  IF v_total_predictions > 0 THEN
    v_coverage := (v_covered_predictions::DECIMAL / v_total_predictions) * 100;
  ELSE
    v_coverage := 0;
  END IF;
  
  RETURN v_coverage;
END;
$$ LANGUAGE plpgsql;

-- Materialized view for accuracy dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_accuracy_dashboard AS
SELECT
  c.id as customer_id,
  c.email,
  c.name,
  c.district,
  COUNT(DISTINCT al.id) as total_predictions,
  AVG(ABS((al.actual_price - al.predicted_price) / al.actual_price) * 100) as avg_mape,
  compute_directional_accuracy(c.id) as directional_accuracy,
  compute_conformal_coverage(c.id) as conformal_coverage,
  MAX(al.log_date) as last_prediction_date
FROM customers c
LEFT JOIN accuracy_logs al ON c.id = al.customer_id
GROUP BY c.id, c.email, c.name, c.district;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_accuracy_dashboard_customer_id ON mv_accuracy_dashboard(customer_id);

-- Function to refresh accuracy dashboard materialized view
CREATE OR REPLACE FUNCTION refresh_accuracy_dashboard()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_accuracy_dashboard;
END;
$$ LANGUAGE plpgsql;

-- Function to get champion model metrics
CREATE OR REPLACE FUNCTION get_champion_model_metrics(p_model_name TEXT)
RETURNS TABLE (
  model_version TEXT,
  accuracy_score DECIMAL(5,4),
  training_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mr.model_version,
    mr.accuracy_score,
    mr.training_date
  FROM model_registry mr
  WHERE mr.model_name = p_model_name
    AND mr.is_active = TRUE
  ORDER BY mr.accuracy_score DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check accuracy gates
CREATE OR REPLACE FUNCTION check_accuracy_gates(p_customer_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_mape DECIMAL(5,2);
  v_directional_accuracy DECIMAL(5,2);
  v_conformal_coverage DECIMAL(5,2);
  v_result JSONB;
BEGIN
  SELECT AVG(mape), AVG(directional_accuracy), AVG(conformal_coverage)
  INTO v_mape, v_directional_accuracy, v_conformal_coverage
  FROM mv_accuracy_dashboard
  WHERE customer_id = p_customer_id;
  
  v_result := jsonb_build_object(
    'mape', COALESCE(v_mape, 0),
    'directional_accuracy', COALESCE(v_directional_accuracy, 0),
    'conformal_coverage', COALESCE(v_conformal_coverage, 0),
    'mape_pass', COALESCE(v_mape, 0) <= 10,
    'directional_accuracy_pass', COALESCE(v_directional_accuracy, 0) >= 70,
    'conformal_coverage_pass', COALESCE(v_conformal_coverage, 0) >= 80,
    'overall_pass', COALESCE(v_mape, 0) <= 10 AND COALESCE(v_directional_accuracy, 0) >= 70 AND COALESCE(v_conformal_coverage, 0) >= 80
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to log accuracy check results
CREATE OR REPLACE FUNCTION log_accuracy_check(p_customer_id UUID, p_check_result JSONB)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO anomaly_logs (
    customer_id,
    anomaly_type,
    severity,
    description,
    data,
    resolved
  ) VALUES (
    p_customer_id,
    'accuracy_check',
    CASE WHEN (p_check_result->>'overall_pass')::BOOLEAN THEN 'low' ELSE 'high' END,
    'Accuracy gate check result',
    p_check_result,
    (p_check_result->>'overall_pass')::BOOLEAN
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION compute_rolling_mape(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_directional_accuracy(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_conformal_coverage(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_accuracy_dashboard() TO service_role;
GRANT EXECUTE ON FUNCTION get_champion_model_metrics(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_accuracy_gates(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_accuracy_check(UUID, JSONB) TO authenticated;

-- Grant select on materialized view
GRANT SELECT ON mv_accuracy_dashboard TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 003: Onboarding Fields
-- File: 003_onboarding_fields.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add onboarding tracking fields to customers table
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'initial',
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_metadata JSONB DEFAULT '{}';

-- Create indexes for onboarding fields
CREATE INDEX IF NOT EXISTS idx_customers_onboarding_step ON customers(onboarding_step);
CREATE INDEX IF NOT EXISTS idx_customers_onboarding_completed_at ON customers(onboarding_completed_at);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 004: Email Field
-- File: 004_email_field.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add email-related fields to customers table
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_opt_in BOOLEAN DEFAULT TRUE;

-- Create index for email field
CREATE INDEX IF NOT EXISTS idx_customers_email_verified ON customers(email_verified);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 005: Churn Tracking
-- File: 005_churn_tracking.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enum for cancellation reasons
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cancellation_reason') THEN
    CREATE TYPE cancellation_reason AS ENUM ('price', 'features', 'technical', 'competitor', 'business_closure', 'other');
  END IF;
END $$;

-- Cancellation reasons table
CREATE TABLE IF NOT EXISTS cancellation_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  reason cancellation_reason NOT NULL,
  reason_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Save offers table
CREATE TABLE IF NOT EXISTS save_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  offer_type TEXT NOT NULL,
  discount_percentage DECIMAL(5,2),
  valid_until DATE,
  is_accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer health scores table
CREATE TABLE IF NOT EXISTS customer_health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  health_score DECIMAL(5,2) CHECK (health_score BETWEEN 0 AND 100),
  engagement_score DECIMAL(5,2) CHECK (engagement_score BETWEEN 0 AND 100),
  feature_usage_score DECIMAL(5,2) CHECK (feature_usage_score BETWEEN 0 AND 100),
  support_ticket_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Churn events table
CREATE TABLE IF NOT EXISTS churn_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feature usage table
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Engagement metrics table
CREATE TABLE IF NOT EXISTS engagement_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  metric_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for churn tracking tables
CREATE INDEX idx_cancellation_reasons_customer_id ON cancellation_reasons(customer_id);
CREATE INDEX idx_save_offers_customer_id ON save_offers(customer_id);
CREATE INDEX idx_customer_health_scores_customer_id ON customer_health_scores(customer_id);
CREATE INDEX idx_churn_events_customer_id ON churn_events(customer_id);
CREATE INDEX idx_feature_usage_customer_id ON feature_usage(customer_id);
CREATE INDEX idx_engagement_metrics_customer_id ON engagement_metrics(customer_id);

-- Row Level Security for churn tracking tables
ALTER TABLE cancellation_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for churn tracking
CREATE POLICY "Users can view own cancellation_reasons" ON cancellation_reasons FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can view own save_offers" ON save_offers FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can view own customer_health_scores" ON customer_health_scores FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can view own churn_events" ON churn_events FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can view own feature_usage" ON feature_usage FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can view own engagement_metrics" ON engagement_metrics FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);

-- Apply updated_at trigger to feature_usage table
CREATE TRIGGER update_feature_usage_updated_at BEFORE UPDATE ON feature_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 006: Referral System
-- File: 006_referral_system.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enum for referral status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referral_status') THEN
    CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'expired');
  END IF;
END $$;

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  status referral_status DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Referral rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  reward_value DECIMAL(10,2),
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for referral tables
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX idx_referral_rewards_referral_id ON referral_rewards(referral_id);
CREATE INDEX idx_referral_rewards_customer_id ON referral_rewards(customer_id);

-- Row Level Security for referral tables
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral tables
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (referrer_id::TEXT = auth.uid()::TEXT OR referee_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can insert own referrals" ON referrals FOR INSERT WITH CHECK (referrer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can view own referral_rewards" ON referral_rewards FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);

-- Insert default reward configurations
INSERT INTO referral_rewards (referral_id, customer_id, reward_type, reward_value)
SELECT 
  r.id,
  r.referrer_id,
  'discount',
  500.00
FROM referrals r
WHERE NOT EXISTS (
  SELECT 1 FROM referral_rewards rr WHERE rr.referral_id = r.id
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 007: Free Disease Alerts
-- File: 007_free_disease_alerts.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Free alert subscribers table
CREATE TABLE IF NOT EXISTS free_alert_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  district TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Alert delivery log table
CREATE TABLE IF NOT EXISTS alert_delivery_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES free_alert_subscribers(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for free alert tables
CREATE INDEX idx_free_alert_subscribers_phone ON free_alert_subscribers(phone);
CREATE INDEX idx_free_alert_subscribers_district ON free_alert_subscribers(district);
CREATE INDEX idx_free_alert_subscribers_is_active ON free_alert_subscribers(is_active);
CREATE INDEX idx_alert_delivery_log_subscriber_id ON alert_delivery_log(subscriber_id);
CREATE INDEX idx_alert_delivery_log_delivery_status ON alert_delivery_log(delivery_status);

-- Row Level Security for free alert tables
ALTER TABLE free_alert_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_delivery_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for free alert tables
CREATE POLICY "Service role can manage free_alert_subscribers" ON free_alert_subscribers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage alert_delivery_log" ON alert_delivery_log FOR ALL USING (auth.role() = 'service_role');

-- Function to check if phone is a paid customer
CREATE OR REPLACE FUNCTION is_paid_customer(p_phone TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_paid BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM customers 
    WHERE phone = p_phone 
    AND subscription_tier IN ('starter', 'professional', 'enterprise')
    AND subscription_status = 'active'
  ) INTO v_is_paid;
  
  RETURN v_is_paid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent duplicate free alert signups
CREATE OR REPLACE FUNCTION prevent_duplicate_free_alert_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF is_paid_customer(NEW.phone) THEN
    RAISE EXCEPTION 'Phone number is already a paid customer';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_duplicate_free_alert_signup
  BEFORE INSERT ON free_alert_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_free_alert_signup();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 008: Lead Magnet System
-- File: 008_lead_magnet_system.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  email TEXT,
  name TEXT,
  district TEXT,
  lead_source TEXT NOT NULL,
  lead_status TEXT DEFAULT 'new',
  converted_to_customer BOOLEAN DEFAULT FALSE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lead events table
CREATE TABLE IF NOT EXISTS lead_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lead tables
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_lead_source ON leads(lead_source);
CREATE INDEX idx_leads_lead_status ON leads(lead_status);
CREATE INDEX idx_leads_converted_to_customer ON leads(converted_to_customer);
CREATE INDEX idx_lead_events_lead_id ON lead_events(lead_id);

-- Row Level Security for lead tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for lead tables
CREATE POLICY "Service role can manage leads" ON leads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage lead_events" ON lead_events FOR ALL USING (auth.role() = 'service_role');

-- Function to update lead updated_at
CREATE OR REPLACE FUNCTION update_lead_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_lead_updated_at();

-- Function to track lead conversions
CREATE OR REPLACE FUNCTION track_lead_conversion(p_lead_id UUID, p_customer_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE leads
  SET converted_to_customer = TRUE,
      customer_id = p_customer_id,
      lead_status = 'converted',
      updated_at = NOW()
  WHERE id = p_lead_id;
  
  INSERT INTO lead_events (lead_id, event_type, event_data)
  VALUES (p_lead_id, 'conversion', jsonb_build_object('customer_id', p_customer_id));
END;
$$ LANGUAGE plpgsql;

-- View for lead magnet performance
CREATE OR REPLACE VIEW lead_magnet_performance AS
SELECT
  lead_source,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE converted_to_customer = TRUE) as converted_leads,
  ROUND((COUNT(*) FILTER (WHERE converted_to_customer = TRUE)::DECIMAL / COUNT(*)) * 100, 2) as conversion_rate_pct,
  MIN(created_at) as first_lead_date,
  MAX(created_at) as last_lead_date
FROM leads
GROUP BY lead_source;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 009: Watermarking Sessions
-- File: 009_watermarking_sessions.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Customer sessions table
CREATE TABLE IF NOT EXISTS customer_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Watermark logs table
CREATE TABLE IF NOT EXISTS watermark_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  watermark_token TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Watermark violations table
CREATE TABLE IF NOT EXISTS watermark_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL,
  violation_data JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ
);

-- OTP requests table
CREATE TABLE IF NOT EXISTS otp_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for watermarking tables
CREATE INDEX idx_customer_sessions_customer_id ON customer_sessions(customer_id);
CREATE INDEX idx_customer_sessions_session_token ON customer_sessions(session_token);
CREATE INDEX idx_customer_sessions_is_active ON customer_sessions(is_active);
CREATE INDEX idx_watermark_logs_customer_id ON watermark_logs(customer_id);
CREATE INDEX idx_watermark_logs_prediction_id ON watermark_logs(prediction_id);
CREATE INDEX idx_watermark_violations_customer_id ON watermark_violations(customer_id);
CREATE INDEX idx_watermark_violations_resolved ON watermark_violations(resolved);
CREATE INDEX idx_otp_requests_customer_id ON otp_requests(customer_id);
CREATE INDEX idx_otp_requests_phone ON otp_requests(phone);
CREATE INDEX idx_otp_requests_expires_at ON otp_requests(expires_at);

-- Row Level Security for watermarking tables
ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermark_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermark_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for watermarking tables
CREATE POLICY "Users can view own customer_sessions" ON customer_sessions FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can insert own customer_sessions" ON customer_sessions FOR INSERT WITH CHECK (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can view own watermark_logs" ON watermark_logs FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Service role can manage watermark_violations" ON watermark_violations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Users can view own otp_requests" ON otp_requests FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can insert own otp_requests" ON otp_requests FOR INSERT WITH CHECK (customer_id::TEXT = auth.uid()::TEXT);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260501: District Price Summary
-- File: 20260501_district_price_summary.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Materialized view for district price summary
CREATE MATERIALIZED VIEW IF NOT EXISTS district_price_summary AS
SELECT
  p.district,
  p.prediction_date,
  PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY p.predicted_price) as p10_price,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.predicted_price) as p50_price,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY p.predicted_price) as p90_price,
  AVG(p.predicted_price) as avg_price,
  COUNT(*) as prediction_count
FROM predictions p
WHERE p.prediction_status = 'completed'
GROUP BY p.district, p.prediction_date;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_district_price_summary_district_date ON district_price_summary(district, prediction_date);

-- Function to refresh district price summary
CREATE OR REPLACE FUNCTION refresh_district_price_summary()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY district_price_summary;
END;
$$ LANGUAGE plpgsql;

-- Note: Materialized views do not support Row Level Security in PostgreSQL
-- Access control is handled via GRANT statements instead

-- Grant select on materialized view
GRANT SELECT ON district_price_summary TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260502: AI Cache
-- File: 20260502_ai_cache.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- AI cache table
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,
  cache_type TEXT NOT NULL,
  response JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_cache
CREATE INDEX idx_ai_cache_cache_key ON ai_cache(cache_key);
CREATE INDEX idx_ai_cache_cache_type ON ai_cache(cache_type);
CREATE INDEX idx_ai_cache_expires_at ON ai_cache(expires_at);

-- Row Level Security for ai_cache
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_cache
CREATE POLICY "Service role can manage ai_cache" ON ai_cache FOR ALL USING (auth.role() = 'service_role');

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_ai_cache()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM ai_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260502: Alerts (Enhanced)
-- File: 20260502_alerts.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop existing alerts table and recreate with enhanced schema
DROP TABLE IF EXISTS alerts CASCADE;

-- Recreate alert_severity enum with additional values
DO $$
BEGIN
  -- Check if the enum needs to be recreated
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_severity') THEN
    -- Check if 'info' value exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'info' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'alert_severity')) THEN
      DROP TYPE alert_severity CASCADE;
      CREATE TYPE alert_severity AS ENUM ('info', 'low', 'medium', 'high', 'critical');
    END IF;
  ELSE
    CREATE TYPE alert_severity AS ENUM ('info', 'low', 'medium', 'high', 'critical');
  END IF;
END $$;

-- Recreate alert_type enum with additional values
DO $$
BEGIN
  -- Check if the enum needs to be recreated
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
    -- Check if 'vaccination_overdue' value exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'vaccination_overdue' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'alert_type')) THEN
      DROP TYPE alert_type CASCADE;
      CREATE TYPE alert_type AS ENUM (
        'price_spike', 'price_drop', 'disease_outbreak', 'weather_alert', 'system_notification',
        'vaccination_overdue', 'weight_gain_deviation', 'iot_environment', 'device_offline',
        'supervisor_checklist_missing', 'biosecurity_audit_overdue'
      );
    END IF;
  ELSE
    CREATE TYPE alert_type AS ENUM (
      'price_spike', 'price_drop', 'disease_outbreak', 'weather_alert', 'system_notification',
      'vaccination_overdue', 'weight_gain_deviation', 'iot_environment', 'device_offline',
      'supervisor_checklist_missing', 'biosecurity_audit_overdue'
    );
  END IF;
END $$;

-- Enhanced alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  type alert_type NOT NULL,
  severity alert_severity NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  message_hindi TEXT,
  data JSONB,
  district TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Customer alert preferences table
CREATE TABLE IF NOT EXISTS customer_alert_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  notify_whatsapp BOOLEAN DEFAULT TRUE,
  notify_email BOOLEAN DEFAULT TRUE,
  notify_in_app BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, alert_type)
);

-- Alert acknowledgements table
CREATE TABLE IF NOT EXISTS alert_acknowledgements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledgement_notes TEXT
);

-- Indexes for enhanced alerts
CREATE INDEX idx_alerts_customer_id ON alerts(customer_id);
CREATE INDEX idx_alerts_batch_id ON alerts(batch_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_district ON alerts(district);
CREATE INDEX idx_alerts_issued_at ON alerts(issued_at DESC);
CREATE INDEX idx_alerts_is_active ON alerts(is_active);
CREATE INDEX idx_customer_alert_preferences_customer_id ON customer_alert_preferences(customer_id);
CREATE INDEX idx_alert_acknowledgements_alert_id ON alert_acknowledgements(alert_id);
CREATE INDEX idx_alert_acknowledgements_customer_id ON alert_acknowledgements(customer_id);

-- Row Level Security for enhanced alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_acknowledgements ENABLE ROW LEVEL SECURITY;

-- RLS policies for enhanced alerts
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Service role can manage alerts" ON alerts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Users can manage own alert_preferences" ON customer_alert_preferences FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can manage own alert_acknowledgements" ON alert_acknowledgements FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);

-- Trigger for default alert preferences
CREATE OR REPLACE FUNCTION set_default_alert_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_alert_preferences (customer_id, alert_type)
  SELECT NEW.id, unnest(ARRAY[
    'price_spike'::alert_type, 'price_drop'::alert_type, 'disease_outbreak'::alert_type,
    'weather_alert'::alert_type, 'vaccination_overdue'::alert_type, 'weight_gain_deviation'::alert_type
  ])
  ON CONFLICT (customer_id, alert_type) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_default_alert_preferences
  AFTER INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION set_default_alert_preferences();

-- Apply updated_at trigger to customer_alert_preferences
CREATE TRIGGER update_customer_alert_preferences_updated_at BEFORE UPDATE ON customer_alert_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260503: Batches (Extensive)
-- File: 20260503_batches.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop and recreate batches table with extensive schema
DROP TABLE IF EXISTS batches CASCADE;

-- Enhanced batch types enum
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_type') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'duck' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'batch_type')) THEN
      DROP TYPE batch_type CASCADE;
      CREATE TYPE batch_type AS ENUM ('broiler', 'layer', 'breeder', 'duck');
    END IF;
  ELSE
    CREATE TYPE batch_type AS ENUM ('broiler', 'layer', 'breeder', 'duck');
  END IF;
END $$;

-- Enhanced batch status enum
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_status') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'batch_status')) THEN
      DROP TYPE batch_status CASCADE;
      CREATE TYPE batch_status AS ENUM ('planned', 'growing', 'pre_harvest', 'harvest_ready', 'harvested', 'closed', 'cancelled');
    END IF;
  ELSE
    CREATE TYPE batch_status AS ENUM ('planned', 'growing', 'pre_harvest', 'harvest_ready', 'harvested', 'closed', 'cancelled');
  END IF;
END $$;

-- Vaccination route enum
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vaccination_route') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'feed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'vaccination_route')) THEN
      DROP TYPE vaccination_route CASCADE;
      CREATE TYPE vaccination_route AS ENUM ('drinking_water', 'spray', 'injection', 'eye_drop', 'nasal', 'feed');
    END IF;
  ELSE
    CREATE TYPE vaccination_route AS ENUM ('drinking_water', 'spray', 'injection', 'eye_drop', 'nasal', 'feed');
  END IF;
END $$;

-- Medication route enum
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medication_route') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'water' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'medication_route')) THEN
      DROP TYPE medication_route CASCADE;
      CREATE TYPE medication_route AS ENUM ('oral', 'injection', 'topical', 'feed_additive', 'water');
    END IF;
  ELSE
    CREATE TYPE medication_route AS ENUM ('oral', 'injection', 'topical', 'feed_additive', 'water');
  END IF;
END $$;

-- Mortality cause enum
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mortality_cause') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cannibalism' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'mortality_cause')) THEN
      DROP TYPE mortality_cause CASCADE;
      CREATE TYPE mortality_cause AS ENUM ('respiratory', 'digestive', 'heat_stress', 'predation', 'cannibalism', 'unknown', 'other');
    END IF;
  ELSE
    CREATE TYPE mortality_cause AS ENUM ('respiratory', 'digestive', 'heat_stress', 'predation', 'cannibalism', 'unknown', 'other');
  END IF;
END $$;

-- Enhanced batches table
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  batch_id TEXT UNIQUE NOT NULL,
  batch_type batch_type DEFAULT 'broiler',
  status batch_status DEFAULT 'planned',
  
  -- DOC (Day Old Chick) information
  doc_placement_date DATE NOT NULL,
  doc_count INTEGER NOT NULL,
  doc_supplier TEXT,
  breed TEXT,
  doc_price_per_bird DECIMAL(8,2),
  
  -- Target metrics
  target_harvest_weight_kg DECIMAL(5,2),
  target_harvest_age_days INTEGER,
  target_fcr DECIMAL(5,2),
  
  -- Shed information
  shed_id TEXT,
  shed_capacity INTEGER,
  
  -- Feed information
  initial_feed_brand TEXT,
  initial_feed_type TEXT,
  
  -- Current metrics
  current_bird_count INTEGER,
  current_avg_weight_kg DECIMAL(5,2),
  current_fcr DECIMAL(5,2),
  current_age_days INTEGER,
  
  -- Harvest information
  harvest_date DATE,
  harvest_weight_kg DECIMAL(8,2),
  harvest_price_per_kg DECIMAL(8,2),
  total_revenue DECIMAL(12,2),
  
  -- Sync and metadata
  synced BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DOC suppliers table
CREATE TABLE IF NOT EXISTS doc_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  breed_specialization TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feed logs table
CREATE TABLE IF NOT EXISTS feed_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  feed_type TEXT NOT NULL,
  feed_brand TEXT,
  quantity_kg DECIMAL(10,2) NOT NULL,
  rate_per_kg DECIMAL(8,2),
  total_cost DECIMAL(12,2),
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mortality logs table
CREATE TABLE IF NOT EXISTS mortality_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  count INTEGER NOT NULL,
  cause mortality_cause NOT NULL,
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vaccination schedules table
CREATE TABLE IF NOT EXISTS vaccination_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccine_type TEXT,
  scheduled_day INTEGER NOT NULL,
  due_date DATE NOT NULL,
  route vaccination_route NOT NULL,
  dose_per_bird TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'skipped')),
  administered_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Medication logs table
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  medicine_name TEXT NOT NULL,
  brand_name TEXT,
  purpose TEXT,
  dosage TEXT,
  route medication_route NOT NULL,
  quantity DECIMAL(10,2),
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weight logs table
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  sample_size INTEGER NOT NULL,
  avg_weight_kg DECIMAL(5,3) NOT NULL,
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Health checklists table
CREATE TABLE IF NOT EXISTS health_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  checklist_date DATE NOT NULL,
  temperature_c DECIMAL(5,2),
  humidity_pct DECIMAL(5,2),
  ventilation_status TEXT,
  litter_condition TEXT,
  water_quality TEXT,
  feed_intake TEXT,
  bird_behavior TEXT,
  overall_health TEXT,
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Biosecurity audits table
CREATE TABLE IF NOT EXISTS biosecurity_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  audit_date DATE NOT NULL,
  foot_dip BOOLEAN,
  vehicle_disinfection BOOLEAN,
  visitor_log BOOLEAN,
  pest_control BOOLEAN,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for extensive batch tables
CREATE INDEX idx_batches_customer_id ON batches(customer_id);
CREATE INDEX idx_batches_batch_id ON batches(batch_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_doc_placement_date ON batches(doc_placement_date);
CREATE INDEX idx_batches_shed_id ON batches(shed_id);
CREATE INDEX idx_doc_suppliers_customer_id ON doc_suppliers(customer_id);
CREATE INDEX idx_feed_logs_batch_id ON feed_logs(batch_id);
CREATE INDEX idx_feed_logs_log_date ON feed_logs(log_date);
CREATE INDEX idx_mortality_logs_batch_id ON mortality_logs(batch_id);
CREATE INDEX idx_mortality_logs_log_date ON mortality_logs(log_date);
CREATE INDEX idx_vaccination_schedules_batch_id ON vaccination_schedules(batch_id);
CREATE INDEX idx_vaccination_schedules_due_date ON vaccination_schedules(due_date);
CREATE INDEX idx_vaccination_schedules_status ON vaccination_schedules(status);
CREATE INDEX idx_medication_logs_batch_id ON medication_logs(batch_id);
CREATE INDEX idx_medication_logs_log_date ON medication_logs(log_date);
CREATE INDEX idx_weight_logs_batch_id ON weight_logs(batch_id);
CREATE INDEX idx_weight_logs_log_date ON weight_logs(log_date);
CREATE INDEX idx_health_checklists_batch_id ON health_checklists(batch_id);
CREATE INDEX idx_health_checklists_checklist_date ON health_checklists(checklist_date);
CREATE INDEX idx_biosecurity_audits_batch_id ON biosecurity_audits(batch_id);
CREATE INDEX idx_biosecurity_audits_audit_date ON biosecurity_audits(audit_date);

-- Row Level Security for extensive batch tables
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortality_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE biosecurity_audits ENABLE ROW LEVEL SECURITY;

-- RLS policies for extensive batch tables
CREATE POLICY "Users can view own batches" ON batches FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can insert own batches" ON batches FOR INSERT WITH CHECK (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can update own batches" ON batches FOR UPDATE USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can manage own doc_suppliers" ON doc_suppliers FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can manage own feed_logs" ON feed_logs FOR ALL USING (customer_id::TEXT IN (SELECT customer_id::TEXT FROM batches WHERE id = batch_id));
CREATE POLICY "Users can manage own mortality_logs" ON mortality_logs FOR ALL USING (customer_id::TEXT IN (SELECT customer_id::TEXT FROM batches WHERE id = batch_id));
CREATE POLICY "Users can manage own vaccination_schedules" ON vaccination_schedules FOR ALL USING (customer_id::TEXT IN (SELECT customer_id::TEXT FROM batches WHERE id = batch_id));
CREATE POLICY "Users can manage own medication_logs" ON medication_logs FOR ALL USING (customer_id::TEXT IN (SELECT customer_id::TEXT FROM batches WHERE id = batch_id));
CREATE POLICY "Users can manage own weight_logs" ON weight_logs FOR ALL USING (customer_id::TEXT IN (SELECT customer_id::TEXT FROM batches WHERE id = batch_id));
CREATE POLICY "Users can manage own health_checklists" ON health_checklists FOR ALL USING (customer_id::TEXT IN (SELECT customer_id::TEXT FROM batches WHERE id = batch_id));
CREATE POLICY "Users can manage own biosecurity_audits" ON biosecurity_audits FOR ALL USING (customer_id::TEXT IN (SELECT customer_id::TEXT FROM batches WHERE id = batch_id));

-- Function to generate batch ID
CREATE OR REPLACE FUNCTION generate_batch_id(p_district TEXT, p_doc_date DATE)
RETURNS TEXT AS $$
DECLARE
  v_batch_count INTEGER;
  v_batch_id TEXT;
BEGIN
  SELECT COUNT(*) INTO v_batch_count
  FROM batches
  WHERE doc_placement_date = p_doc_date
    AND customer_id IN (SELECT id FROM customers WHERE district = p_district);
  
  v_batch_id := UPPER(SUBSTRING(p_district, 1, 3)) || '-' || 
                TO_CHAR(p_doc_date, 'YYYYMM') || '-' || 
                LPAD((v_batch_count + 1)::TEXT, 3, '0');
  
  RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update batch status
CREATE OR REPLACE FUNCTION update_batch_status(p_batch_id UUID, p_new_status batch_status)
RETURNS VOID AS $$
BEGIN
  UPDATE batches
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = p_batch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to compute current_age_days
CREATE OR REPLACE FUNCTION compute_current_age_days()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.doc_placement_date IS NOT NULL THEN
    NEW.current_age_days := CURRENT_DATE - NEW.doc_placement_date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to compute current_age_days on insert/update
CREATE TRIGGER compute_batch_age
BEFORE INSERT OR UPDATE OF doc_placement_date ON batches
FOR EACH ROW
EXECUTE FUNCTION compute_current_age_days();

-- Trigger to update current bird count on mortality log
CREATE OR REPLACE FUNCTION update_bird_count_on_mortality()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE batches
  SET current_bird_count = GREATEST(0, current_bird_count - NEW.count),
      updated_at = NOW()
  WHERE id = NEW.batch_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_bird_count_on_mortality
  AFTER INSERT ON mortality_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_bird_count_on_mortality();

-- Apply updated_at trigger to all batch-related tables
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doc_suppliers_updated_at BEFORE UPDATE ON doc_suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_logs_updated_at BEFORE UPDATE ON feed_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mortality_logs_updated_at BEFORE UPDATE ON mortality_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vaccination_schedules_updated_at BEFORE UPDATE ON vaccination_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medication_logs_updated_at BEFORE UPDATE ON medication_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weight_logs_updated_at BEFORE UPDATE ON weight_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_checklists_updated_at BEFORE UPDATE ON health_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_biosecurity_audits_updated_at BEFORE UPDATE ON biosecurity_audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for development
INSERT INTO doc_suppliers (id, customer_id, name, phone, location, breed_specialization)
VALUES 
  (uuid_generate_v4(), (SELECT id FROM customers LIMIT 1), 'Venkateshwara Hatchery', '+919876543210', 'Hyderabad', ARRAY['Cobb 500', 'Ross 308']),
  (uuid_generate_v4(), (SELECT id FROM customers LIMIT 1), 'Suguna Poultry', '+919876543211', 'Chennai', ARRAY['Cobb 500', 'Vencobb'])
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260504: Inventory Management
-- File: 20260504_inventory_management.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Inventory category enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_category') THEN
    CREATE TYPE inventory_category AS ENUM ('feed', 'medicine', 'vaccine', 'equipment', 'other');
  END IF;
END $$;

-- Movement type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_type') THEN
    CREATE TYPE movement_type AS ENUM ('purchase', 'consumption', 'transfer', 'adjustment', 'sale');
  END IF;
END $$;

-- PO status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'po_status') THEN
    CREATE TYPE po_status AS ENUM ('pending', 'approved', 'ordered', 'partial', 'received', 'cancelled');
  END IF;
END $$;

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category inventory_category NOT NULL,
  sku TEXT UNIQUE,
  description TEXT,
  unit TEXT NOT NULL,
  current_stock DECIMAL(12,2) DEFAULT 0,
  minimum_stock DECIMAL(12,2),
  maximum_stock DECIMAL(12,2),
  reorder_point DECIMAL(12,2),
  unit_cost DECIMAL(10,2),
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type movement_type NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  reference_id UUID,
  reference_type TEXT,
  notes TEXT,
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gst_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  po_number TEXT UNIQUE NOT NULL,
  status po_status DEFAULT 'pending',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  total_amount DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchase order items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity DECIMAL(12,2) NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  received_quantity DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for inventory management tables
CREATE INDEX idx_inventory_items_customer_id ON inventory_items(customer_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_movements_item_id ON inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_movement_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_movement_date ON inventory_movements(movement_date);
CREATE INDEX idx_vendors_customer_id ON vendors(customer_id);
CREATE INDEX idx_vendors_is_active ON vendors(is_active);
CREATE INDEX idx_purchase_orders_customer_id ON purchase_orders(customer_id);
CREATE INDEX idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX idx_purchase_order_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_item_id ON purchase_order_items(item_id);

-- Row Level Security for inventory management tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory management tables
CREATE POLICY "Users can manage own inventory_items" ON inventory_items FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can manage own inventory_movements" ON inventory_movements FOR ALL USING (customer_id::TEXT IN (SELECT customer_id::TEXT FROM inventory_items WHERE id = item_id));
CREATE POLICY "Users can manage own vendors" ON vendors FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can manage own purchase_orders" ON purchase_orders FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can manage own purchase_order_items" ON purchase_order_items FOR ALL USING (customer_id::TEXT IN (SELECT customer_id::TEXT FROM purchase_orders WHERE id = purchase_order_id));

-- Function to generate PO number
CREATE OR REPLACE FUNCTION generate_po_number(p_customer_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_po_count INTEGER;
  v_po_number TEXT;
BEGIN
  SELECT COUNT(*) INTO v_po_count
  FROM purchase_orders
  WHERE customer_id = p_customer_id
    AND order_date = CURRENT_DATE;
  
  v_po_number := 'PO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((v_po_count + 1)::TEXT, 4, '0');
  
  RETURN v_po_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update inventory stock
CREATE OR REPLACE FUNCTION update_inventory_stock(p_item_id UUID, p_quantity DECIMAL, p_movement_type movement_type)
RETURNS VOID AS $$
BEGIN
  CASE p_movement_type
    WHEN 'purchase' THEN
      UPDATE inventory_items SET current_stock = current_stock + p_quantity WHERE id = p_item_id;
    WHEN 'consumption' THEN
      UPDATE inventory_items SET current_stock = GREATEST(0, current_stock - p_quantity) WHERE id = p_item_id;
    WHEN 'adjustment' THEN
      UPDATE inventory_items SET current_stock = p_quantity WHERE id = p_item_id;
    ELSE
      UPDATE inventory_items SET current_stock = current_stock + p_quantity WHERE id = p_item_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger low stock alert
CREATE OR REPLACE FUNCTION trigger_low_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock <= NEW.reorder_point AND NEW.reorder_point IS NOT NULL THEN
    INSERT INTO alerts (customer_id, type, severity, title, message, data)
    VALUES (
      NEW.customer_id,
      'system_notification',
      'medium',
      'Low Stock Alert',
      'Item ' || NEW.item_name || ' is below reorder point',
      jsonb_build_object('item_id', NEW.id, 'item_name', NEW.item_name, 'current_stock', NEW.current_stock, 'reorder_point', NEW.reorder_point)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trigger_low_stock_alert
  AFTER UPDATE ON inventory_items
  FOR EACH ROW
  WHEN (NEW.current_stock IS DISTINCT FROM OLD.current_stock)
  EXECUTE FUNCTION trigger_low_stock_alert();

-- Function to auto-decrement stock based on feed, vaccine, and medicine logs
CREATE OR REPLACE FUNCTION auto_decrement_feed_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_item_id UUID;
BEGIN
  SELECT id INTO v_item_id FROM inventory_items WHERE item_name = NEW.feed_brand AND category = 'feed' LIMIT 1;
  IF v_item_id IS NOT NULL THEN
    PERFORM update_inventory_stock(v_item_id, NEW.quantity_kg, 'consumption');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_decrement_feed_stock
  AFTER INSERT ON feed_logs
  FOR EACH ROW
  EXECUTE FUNCTION auto_decrement_feed_stock();

-- Apply updated_at trigger to inventory management tables
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260523: Farm Management
-- File: 20260523_farm_management.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Farms table for S2 Integrators
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integrator_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  total_sheds INTEGER,
  total_capacity INTEGER,
  contact_person TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sheds table
CREATE TABLE IF NOT EXISTS sheds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  shed_number TEXT NOT NULL,
  shed_type TEXT,
  capacity INTEGER,
  length_m DECIMAL(6,2),
  width_m DECIMAL(6,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (farm_id, shed_number)
);

-- Separate batches table for integrators
CREATE TABLE IF NOT EXISTS integrator_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  shed_id UUID REFERENCES sheds(id) ON DELETE SET NULL,
  batch_identifier TEXT UNIQUE NOT NULL,
  batch_type TEXT DEFAULT 'broiler',
  placement_date DATE NOT NULL,
  doc_count INTEGER NOT NULL,
  breed TEXT,
  current_bird_count INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily logs table for integrators
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES integrator_batches(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  morning_mortality INTEGER DEFAULT 0,
  evening_mortality INTEGER DEFAULT 0,
  total_mortality INTEGER,
  feed_given_kg DECIMAL(10,2),
  water_consumed_litres DECIMAL(10,2),
  temperature_c DECIMAL(5,2),
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to compute total_mortality
CREATE OR REPLACE FUNCTION compute_total_mortality()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_mortality := COALESCE(NEW.morning_mortality, 0) + COALESCE(NEW.evening_mortality, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to compute total_mortality on insert/update
CREATE TRIGGER compute_daily_log_total_mortality
BEFORE INSERT OR UPDATE ON daily_logs
FOR EACH ROW
EXECUTE FUNCTION compute_total_mortality();

-- Vaccinations table for integrators
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES integrator_batches(id) ON DELETE SET NULL,
  vaccine_name TEXT NOT NULL,
  vaccination_date DATE NOT NULL,
  day_number INTEGER,
  route TEXT,
  dosage TEXT,
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feed purchases table for integrators
CREATE TABLE IF NOT EXISTS feed_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  feed_type TEXT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  rate_per_kg DECIMAL(8,2),
  total_cost DECIMAL(12,2),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Health checklist state table
CREATE TABLE IF NOT EXISTS health_checklist_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  checklist_date DATE NOT NULL,
  temperature_recorded BOOLEAN DEFAULT FALSE,
  mortality_recorded BOOLEAN DEFAULT FALSE,
  feed_recorded BOOLEAN DEFAULT FALSE,
  water_recorded BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (farm_id, checklist_date)
);

-- Batch report jobs table
CREATE TABLE IF NOT EXISTS batch_report_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES integrator_batches(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  generated_at TIMESTAMPTZ,
  report_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materialized view for farm metrics summary
CREATE MATERIALIZED VIEW IF NOT EXISTS farm_metrics_summary AS
SELECT
  f.id as farm_id,
  f.name as farm_name,
  f.integrator_id,
  COUNT(DISTINCT s.id) as total_sheds,
  COUNT(DISTINCT ib.id) as active_batches,
  SUM(ib.current_bird_count) as total_birds,
  AVG(dl.total_mortality) as avg_daily_mortality,
  SUM(dl.feed_given_kg) as total_feed_consumed,
  MAX(dl.log_date) as last_log_date
FROM farms f
LEFT JOIN sheds s ON f.id = s.farm_id AND s.is_active = TRUE
LEFT JOIN integrator_batches ib ON f.id = ib.farm_id AND ib.status = 'active'
LEFT JOIN daily_logs dl ON f.id = dl.farm_id AND dl.log_date = CURRENT_DATE
GROUP BY f.id, f.name, f.integrator_id;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_farm_metrics_summary_farm_id ON farm_metrics_summary(farm_id);

-- Function to refresh farm metrics summary
CREATE OR REPLACE FUNCTION refresh_farm_metrics_summary()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY farm_metrics_summary;
END;
$$ LANGUAGE plpgsql;

-- Function to compute daily log metrics
DO $$
BEGIN
  DROP FUNCTION IF EXISTS compute_daily_log_metrics(UUID, DATE);
END $$;

CREATE OR REPLACE FUNCTION compute_daily_log_metrics(p_farm_id UUID, p_log_date DATE)
RETURNS TABLE (
  total_mortality INTEGER,
  feed_efficiency DECIMAL(10,2),
  water_to_feed_ratio DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(dl.total_mortality),
    CASE 
      WHEN SUM(dl.feed_given_kg) > 0 
      THEN SUM(ib.current_bird_count) / SUM(dl.feed_given_kg)
      ELSE NULL 
    END,
    CASE 
      WHEN SUM(dl.feed_given_kg) > 0 
      THEN SUM(dl.water_consumed_litres) / SUM(dl.feed_given_kg)
      ELSE NULL 
    END
  FROM daily_logs dl
  JOIN integrator_batches ib ON dl.batch_id = ib.id
  WHERE dl.farm_id = p_farm_id AND dl.log_date = p_log_date
  GROUP BY dl.farm_id;
END;
$$ LANGUAGE plpgsql;

-- Indexes for farm management tables
CREATE INDEX idx_farms_integrator_id ON farms(integrator_id);
CREATE INDEX idx_farms_district ON farms(district);
CREATE INDEX idx_farms_is_active ON farms(is_active);
CREATE INDEX idx_sheds_farm_id ON sheds(farm_id);
CREATE INDEX idx_sheds_is_active ON sheds(is_active);
CREATE INDEX idx_integrator_batches_farm_id ON integrator_batches(farm_id);
CREATE INDEX idx_integrator_batches_shed_id ON integrator_batches(shed_id);
CREATE INDEX idx_integrator_batches_status ON integrator_batches(status);
CREATE INDEX idx_daily_logs_farm_id ON daily_logs(farm_id);
CREATE INDEX idx_daily_logs_batch_id ON daily_logs(batch_id);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date);
CREATE INDEX idx_vaccinations_farm_id ON vaccinations(farm_id);
CREATE INDEX idx_vaccinations_batch_id ON vaccinations(batch_id);
CREATE INDEX idx_vaccinations_vaccination_date ON vaccinations(vaccination_date);
CREATE INDEX idx_feed_purchases_farm_id ON feed_purchases(farm_id);
CREATE INDEX idx_feed_purchases_purchase_date ON feed_purchases(purchase_date);
CREATE INDEX idx_health_checklist_state_farm_id ON health_checklist_state(farm_id);
CREATE INDEX idx_health_checklist_state_checklist_date ON health_checklist_state(checklist_date);
CREATE INDEX idx_batch_report_jobs_batch_id ON batch_report_jobs(batch_id);
CREATE INDEX idx_batch_report_jobs_status ON batch_report_jobs(status);

-- Row Level Security for farm management tables
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheds ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrator_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checklist_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_report_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for farm management tables
CREATE POLICY "Integrators can manage own farms" ON farms FOR ALL USING (integrator_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Integrators can manage own sheds" ON sheds FOR ALL USING (integrator_id::TEXT IN (SELECT integrator_id::TEXT FROM farms WHERE id = farm_id));
CREATE POLICY "Integrators can manage own integrator_batches" ON integrator_batches FOR ALL USING (integrator_id::TEXT IN (SELECT integrator_id::TEXT FROM farms WHERE id = farm_id));
CREATE POLICY "Integrators can manage own daily_logs" ON daily_logs FOR ALL USING (integrator_id::TEXT IN (SELECT integrator_id::TEXT FROM farms WHERE id = farm_id));
CREATE POLICY "Integrators can manage own vaccinations" ON vaccinations FOR ALL USING (integrator_id::TEXT IN (SELECT integrator_id::TEXT FROM farms WHERE id = farm_id));
CREATE POLICY "Integrators can manage own feed_purchases" ON feed_purchases FOR ALL USING (integrator_id::TEXT IN (SELECT integrator_id::TEXT FROM farms WHERE id = farm_id));
CREATE POLICY "Integrators can manage own health_checklist_state" ON health_checklist_state FOR ALL USING (integrator_id::TEXT IN (SELECT integrator_id::TEXT FROM farms WHERE id = farm_id));
CREATE POLICY "Integrators can manage own batch_report_jobs" ON batch_report_jobs FOR ALL USING (integrator_id::TEXT IN (SELECT integrator_id::TEXT FROM farms WHERE id = (SELECT farm_id FROM integrator_batches WHERE id = batch_id)));

-- Apply updated_at trigger to farm management tables
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sheds_updated_at BEFORE UPDATE ON sheds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrator_batches_updated_at BEFORE UPDATE ON integrator_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant select on materialized view
GRANT SELECT ON farm_metrics_summary TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260528: Biosecurity Reminder CRON
-- File: 20260528_biosecurity_reminder_cron.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to check biosecurity audit reminders
CREATE OR REPLACE FUNCTION check_biosecurity_audit_reminders()
RETURNS VOID AS $$
DECLARE
  v_overdue_audit RECORD;
BEGIN
  -- Find batches with overdue biosecurity audits (every 14 days)
  FOR v_overdue_audit IN
    SELECT 
      b.id,
      b.batch_id,
      b.customer_id,
      MAX(ba.audit_date) as last_audit_date
    FROM batches b
    LEFT JOIN biosecurity_audits ba ON b.id = ba.batch_id
    WHERE b.status IN ('growing', 'pre_harvest')
    GROUP BY b.id, b.batch_id, b.customer_id
    HAVING (MAX(ba.audit_date) IS NULL OR MAX(ba.audit_date) < CURRENT_DATE - INTERVAL '14 days')
      AND NOT EXISTS (
        SELECT 1 FROM alerts 
        WHERE type = 'biosecurity_audit_overdue' 
        AND batch_id = b.id 
        AND issued_at >= CURRENT_DATE - INTERVAL '7 days'
      )
  LOOP
    -- Create alert for overdue biosecurity audit
    INSERT INTO alerts (
      customer_id,
      batch_id,
      type,
      severity,
      title,
      message,
      issued_at
    ) VALUES (
      v_overdue_audit.customer_id,
      v_overdue_audit.id,
      'biosecurity_audit_overdue',
      'medium',
      'Biosecurity Audit Overdue',
      'Batch ' || v_overdue_audit.batch_id || ' is due for biosecurity audit',
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule the function to run daily at 8:00 AM IST
SELECT cron.schedule(
  'check_biosecurity_audit_reminders',
  '30 2 * * *', -- 8:00 AM IST = 2:30 AM UTC
  'SELECT check_biosecurity_audit_reminders();'
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_biosecurity_audit_reminders TO postgres;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260528: Commodity Forecasts
-- File: 20260528_commodity_forecasts.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Commodity forecasts table
CREATE TABLE IF NOT EXISTS commodity_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commodity TEXT NOT NULL CHECK (commodity IN ('maize', 'soya', 'palm_oil')),
  forecast_date DATE NOT NULL,
  price_per_ton DECIMAL(10,2),
  confidence_interval_lower DECIMAL(10,2),
  confidence_interval_upper DECIMAL(10,2),
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (commodity, forecast_date)
);

-- Indexes for commodity_forecasts
CREATE INDEX idx_commodity_forecasts_commodity ON commodity_forecasts(commodity);
CREATE INDEX idx_commodity_forecasts_forecast_date ON commodity_forecasts(forecast_date);

-- Row Level Security for commodity_forecasts
ALTER TABLE commodity_forecasts ENABLE ROW LEVEL SECURITY;

-- RLS policies for commodity_forecasts
CREATE POLICY "Public read commodity_forecasts" ON commodity_forecasts FOR SELECT USING (TRUE);
CREATE POLICY "Service role can insert commodity_forecasts" ON commodity_forecasts FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update commodity_forecasts" ON commodity_forecasts FOR UPDATE USING (auth.role() = 'service_role');

-- Function to refresh commodity forecasts (placeholder)
CREATE OR REPLACE FUNCTION refresh_commodity_forecasts()
RETURNS VOID AS $$
BEGIN
  -- This function would be implemented to call external ML models
  -- For now, it's a placeholder
  NULL;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260528: Create Batch Function
-- File: 20260528_create_batch_function.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to create batch with auto-generated ID
CREATE OR REPLACE FUNCTION create_batch_with_id(
  p_district TEXT,
  p_doc_placement_date DATE,
  p_doc_count INTEGER,
  p_doc_supplier TEXT,
  p_breed TEXT,
  p_target_harvest_weight_kg DECIMAL,
  p_shed_id TEXT,
  p_initial_feed_brand TEXT DEFAULT NULL,
  p_initial_feed_type TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_batch_id TEXT;
  v_customer_id UUID;
  v_new_batch_id UUID;
BEGIN
  -- Get current customer ID
  v_customer_id := auth.uid();
  
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Generate batch ID using the existing function
  v_batch_id := generate_batch_id(p_district, p_doc_placement_date);
  
  -- Insert the batch record
  INSERT INTO batches (
    customer_id,
    batch_id,
    doc_placement_date,
    doc_count,
    doc_supplier,
    breed,
    target_harvest_weight_kg,
    shed_id,
    initial_feed_brand,
    initial_feed_type,
    current_bird_count
  ) VALUES (
    v_customer_id,
    v_batch_id,
    p_doc_placement_date,
    p_doc_count,
    p_doc_supplier,
    p_breed,
    p_target_harvest_weight_kg,
    p_shed_id,
    p_initial_feed_brand,
    p_initial_feed_type,
    p_doc_count
  )
  RETURNING id INTO v_new_batch_id;
  
  -- Return the generated batch ID
  RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_batch_with_id TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260528: Custom Vaccination Protocols
-- File: 20260528_custom_vaccination_protocols.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Custom vaccination protocols table
CREATE TABLE IF NOT EXISTS custom_vaccination_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  protocol_name TEXT NOT NULL,
  batch_type TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom vaccination protocol items table
CREATE TABLE IF NOT EXISTS custom_vaccination_protocol_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id UUID NOT NULL REFERENCES custom_vaccination_protocols(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccine_type TEXT,
  scheduled_day INTEGER NOT NULL,
  route vaccination_route NOT NULL,
  dose_per_bird TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for custom vaccination protocol tables
CREATE INDEX idx_custom_vaccination_protocols_customer_id ON custom_vaccination_protocols(customer_id);
CREATE INDEX idx_custom_vaccination_protocols_batch_type ON custom_vaccination_protocols(batch_type);
CREATE INDEX idx_custom_vaccination_protocol_items_protocol_id ON custom_vaccination_protocol_items(protocol_id);
CREATE INDEX idx_custom_vaccination_protocol_items_scheduled_day ON custom_vaccination_protocol_items(scheduled_day);

-- Row Level Security for custom vaccination protocol tables
ALTER TABLE custom_vaccination_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_vaccination_protocol_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom vaccination protocol tables
CREATE POLICY "Users can manage own custom_vaccination_protocols" ON custom_vaccination_protocols FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can manage own custom_vaccination_protocol_items" ON custom_vaccination_protocol_items FOR ALL USING (customer_id::TEXT IN (SELECT customer_id::TEXT FROM custom_vaccination_protocols WHERE id = protocol_id));

-- Function to create vaccination schedules from custom protocol
CREATE OR REPLACE FUNCTION create_vaccination_schedules_from_custom_protocol(
  p_protocol_id UUID,
  p_batch_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_protocol_item RECORD;
  v_batch_doc_date DATE;
BEGIN
  -- Get batch DOC date
  SELECT doc_placement_date INTO v_batch_doc_date
  FROM batches
  WHERE id = p_batch_id;
  
  -- Insert vaccination schedules from protocol items
  FOR v_protocol_item IN
    SELECT * FROM custom_vaccination_protocol_items
    WHERE protocol_id = p_protocol_id
    ORDER BY scheduled_day
  LOOP
    INSERT INTO vaccination_schedules (
      batch_id,
      vaccine_name,
      vaccine_type,
      scheduled_day,
      due_date,
      route,
      dose_per_bird,
      status
    ) VALUES (
      p_batch_id,
      v_protocol_item.vaccine_name,
      v_protocol_item.vaccine_type,
      v_protocol_item.scheduled_day,
      v_batch_doc_date + (v_protocol_item.scheduled_day || ' days')::INTERVAL,
      v_protocol_item.route,
      v_protocol_item.dose_per_bird,
      'pending'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to custom_vaccination_protocols
CREATE TRIGGER update_custom_vaccination_protocols_updated_at BEFORE UPDATE ON custom_vaccination_protocols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260528: Message Events
-- File: 20260528_message_events.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Message events table for WhatsApp tracking
CREATE TABLE IF NOT EXISTS message_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  message_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  message_content TEXT,
  template_name TEXT,
  external_message_id TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for message_events
CREATE INDEX idx_message_events_customer_id ON message_events(customer_id);
CREATE INDEX idx_message_events_phone ON message_events(phone);
CREATE INDEX idx_message_events_message_type ON message_events(message_type);
CREATE INDEX idx_message_events_direction ON message_events(direction);
CREATE INDEX idx_message_events_status ON message_events(status);
CREATE INDEX idx_message_events_created_at ON message_events(created_at DESC);
CREATE INDEX idx_message_events_external_message_id ON message_events(external_message_id);

-- Row Level Security for message_events
ALTER TABLE message_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_events
CREATE POLICY "Admin users can view all message_events" ON message_events FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Users can view own message_events" ON message_events FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Service role can insert message_events" ON message_events FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Function to calculate customer engagement metrics
CREATE OR REPLACE FUNCTION calculate_customer_engagement_metrics(p_customer_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_messages INTEGER,
  inbound_messages INTEGER,
  outbound_messages INTEGER,
  delivered_messages INTEGER,
  read_messages INTEGER,
  failed_messages INTEGER,
  engagement_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE direction = 'inbound') as inbound_messages,
    COUNT(*) FILTER (WHERE direction = 'outbound') as outbound_messages,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered_messages,
    COUNT(*) FILTER (WHERE status = 'read') as read_messages,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_messages,
    CASE 
      WHEN COUNT(*) > 0 
      THEN (COUNT(*) FILTER (WHERE status IN ('delivered', 'read'))::DECIMAL / COUNT(*)) * 100
      ELSE 0 
    END as engagement_rate
  FROM message_events
  WHERE customer_id = p_customer_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to generate engagement heatmap
CREATE OR REPLACE FUNCTION generate_engagement_heatmap(p_customer_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  hour_of_day INTEGER,
  day_of_week INTEGER,
  message_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(HOUR FROM created_at) as hour_of_day,
    EXTRACT(DOW FROM created_at) as day_of_week,
    COUNT(*) as message_count
  FROM message_events
  WHERE customer_id = p_customer_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY hour_of_day, day_of_week
  ORDER BY day_of_week, hour_of_day;
END;
$$ LANGUAGE plpgsql;

-- Function to identify high churn risk customers
CREATE OR REPLACE FUNCTION identify_high_churn_risk_customers(p_unread_threshold INTEGER DEFAULT 7)
RETURNS TABLE (
  customer_id UUID,
  phone TEXT,
  unread_streak_days INTEGER,
  last_message_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    me.customer_id,
    me.phone,
    CURRENT_DATE - MAX(me.created_at)::DATE as unread_streak_days,
    MAX(me.created_at) as last_message_at
  FROM message_events me
  WHERE me.direction = 'outbound'
    AND me.status IN ('delivered', 'sent')
    AND NOT EXISTS (
      SELECT 1 FROM message_events me2
      WHERE me2.customer_id = me.customer_id
        AND me2.direction = 'inbound'
        AND me2.created_at > MAX(me.created_at)
    )
  GROUP BY me.customer_id, me.phone
  HAVING CURRENT_DATE - MAX(me.created_at)::DATE >= p_unread_threshold
  ORDER BY unread_streak_days DESC;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to message_events
CREATE TRIGGER update_message_events_updated_at BEFORE UPDATE ON message_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260528: Purchase Order Enhancements
-- File: 20260528_purchase_order_enhancements.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add GRN and integration fields to purchase_orders
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS grn_number TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS grn_date DATE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS tally_reference TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS zoho_webhook_id TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid'));
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_date DATE;

-- Add variance tracking to purchase_order_items
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS variance_quantity DECIMAL(12,2) DEFAULT 0;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS variance_reason TEXT;

-- Trigger to calculate variance
CREATE OR REPLACE FUNCTION calculate_po_item_variance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance_quantity := NEW.received_quantity - NEW.quantity;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_po_item_variance
  BEFORE UPDATE ON purchase_order_items
  FOR EACH ROW
  WHEN (NEW.received_quantity IS DISTINCT FROM OLD.received_quantity OR NEW.quantity IS DISTINCT FROM OLD.quantity)
  EXECUTE FUNCTION calculate_po_item_variance();

-- Trigger to set GRN date on delivery
CREATE OR REPLACE FUNCTION set_grn_date_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'received' AND OLD.status != 'received' THEN
    NEW.grn_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_grn_date_on_delivery
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_grn_date_on_delivery();

-- Trigger to set payment date on paid status
CREATE OR REPLACE FUNCTION set_payment_date_on_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    NEW.payment_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_payment_date_on_paid
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_date_on_paid();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260528: Vaccination Overdue Alert
-- File: 20260528_vaccination_overdue_alert.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to check vaccination overdue
CREATE OR REPLACE FUNCTION check_vaccination_overdue()
RETURNS VOID AS $$
DECLARE
  v_overdue_vaccination RECORD;
BEGIN
  -- Find vaccinations that are overdue (not logged within 2 days of scheduled date)
  FOR v_overdue_vaccination IN
    SELECT 
      vs.id,
      vs.batch_id,
      b.customer_id,
      b.batch_id as batch_identifier,
      vs.vaccine_name,
      vs.due_date
    FROM vaccination_schedules vs
    JOIN batches b ON vs.batch_id = b.id
    WHERE vs.status = 'pending'
      AND vs.due_date < CURRENT_DATE - INTERVAL '2 days'
      AND NOT EXISTS (
        SELECT 1 FROM alerts 
        WHERE type = 'vaccination_overdue' 
        AND batch_id = vs.batch_id 
        AND issued_at >= CURRENT_DATE - INTERVAL '7 days'
      )
  LOOP
    -- Create alert for overdue vaccination
    INSERT INTO alerts (
      customer_id,
      batch_id,
      type,
      severity,
      title,
      message,
      issued_at
    ) VALUES (
      v_overdue_vaccination.customer_id,
      v_overdue_vaccination.batch_id,
      'vaccination_overdue',
      'high',
      'Vaccination Overdue',
      'Batch ' || v_overdue_vaccination.batch_identifier || ' - ' || v_overdue_vaccination.vaccine_name || ' is overdue',
      NOW()
    );
    
    -- Update vaccination status to overdue
    UPDATE vaccination_schedules
    SET status = 'overdue'
    WHERE id = v_overdue_vaccination.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run vaccination overdue check after vaccination schedule inserts/updates
CREATE TRIGGER trg_check_vaccination_overdue
  AFTER INSERT OR UPDATE ON vaccination_schedules
  FOR EACH ROW
  EXECUTE FUNCTION check_vaccination_overdue();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260528: Vaccination Reminder Functions
-- File: 20260528_vaccination_reminder_functions.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to send WhatsApp vaccination reminder (24 hours before)
CREATE OR REPLACE FUNCTION send_vaccination_whatsapp_reminder()
RETURNS VOID AS $$
DECLARE
  v_upcoming_vaccination RECORD;
BEGIN
  -- Find vaccinations due in 24 hours
  FOR v_upcoming_vaccination IN
    SELECT 
      vs.id,
      vs.batch_id,
      b.customer_id,
      c.phone,
      vs.vaccine_name,
      vs.due_date
    FROM vaccination_schedules vs
    JOIN batches b ON vs.batch_id = b.id
    JOIN customers c ON b.customer_id = c.id
    WHERE vs.status = 'pending'
      AND vs.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day'
      AND NOT EXISTS (
        SELECT 1 FROM message_events 
        WHERE message_type = 'vaccination_reminder' 
        AND metadata->>'vaccination_schedule_id' = vs.id::TEXT
        AND created_at >= CURRENT_DATE - INTERVAL '1 day'
      )
  LOOP
    -- Log WhatsApp reminder (actual sending would be done by external service)
    INSERT INTO message_events (
      customer_id,
      phone,
      message_type,
      direction,
      status,
      message_content,
      metadata
    ) VALUES (
      v_upcoming_vaccination.customer_id,
      v_upcoming_vaccination.phone,
      'vaccination_reminder',
      'outbound',
      'queued',
      'Reminder: ' || v_upcoming_vaccination.vaccine_name || ' is due tomorrow for your batch.',
      jsonb_build_object('vaccination_schedule_id', v_upcoming_vaccination.id, 'batch_id', v_upcoming_vaccination.batch_id)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to send push notification vaccination reminder (6 hours before)
CREATE OR REPLACE FUNCTION send_vaccination_push_reminder()
RETURNS VOID AS $$
DECLARE
  v_upcoming_vaccination RECORD;
BEGIN
  -- Find vaccinations due in 6 hours
  FOR v_upcoming_vaccination IN
    SELECT 
      vs.id,
      vs.batch_id,
      b.customer_id,
      vs.vaccine_name,
      vs.due_date
    FROM vaccination_schedules vs
    JOIN batches b ON vs.batch_id = b.id
    WHERE vs.status = 'pending'
      AND vs.due_date = CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM message_events 
        WHERE message_type = 'vaccination_push_reminder' 
        AND metadata->>'vaccination_schedule_id' = vs.id::TEXT
        AND created_at >= CURRENT_DATE
      )
  LOOP
    -- Log push reminder (actual sending would be done by external service)
    INSERT INTO message_events (
      customer_id,
      phone,
      message_type,
      direction,
      status,
      message_content,
      metadata
    ) VALUES (
      v_upcoming_vaccination.customer_id,
      NULL,
      'vaccination_push_reminder',
      'outbound',
      'queued',
      'Vaccination due today: ' || v_upcoming_vaccination.vaccine_name,
      jsonb_build_object('vaccination_schedule_id', v_upcoming_vaccination.id, 'batch_id', v_upcoming_vaccination.batch_id)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION send_vaccination_whatsapp_reminder TO authenticated;
GRANT EXECUTE ON FUNCTION send_vaccination_push_reminder TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260528: Vaccination Schedule Auto Create
-- File: 20260528_vaccination_schedule_auto_create.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to create vaccination schedules for a batch based on batch type
CREATE OR REPLACE FUNCTION create_vaccination_schedules_for_batch(p_batch_id UUID, p_batch_type TEXT)
RETURNS VOID AS $$
DECLARE
  v_doc_date DATE;
BEGIN
  -- Get batch DOC date
  SELECT doc_placement_date INTO v_doc_date
  FROM batches
  WHERE id = p_batch_id;
  
  -- Insert standard vaccination schedules based on batch type
  IF p_batch_type = 'broiler' THEN
    -- Standard broiler vaccination schedule
    INSERT INTO vaccination_schedules (batch_id, vaccine_name, vaccine_type, scheduled_day, due_date, route, dose_per_bird, status)
    VALUES
      (p_batch_id, 'IBD (Gumboro)', 'Live', 7, v_doc_date + INTERVAL '7 days', 'drinking_water', '1 dose', 'pending'),
      (p_batch_id, 'IB (Newcastle)', 'Live', 10, v_doc_date + INTERVAL '10 days', 'drinking_water', '1 dose', 'pending'),
      (p_batch_id, 'IBD (Gumboro) Booster', 'Live', 14, v_doc_date + INTERVAL '14 days', 'drinking_water', '1 dose', 'pending'),
      (p_batch_id, 'IB (Newcastle) Booster', 'Live', 21, v_doc_date + INTERVAL '21 days', 'drinking_water', '1 dose', 'pending');
  ELSIF p_batch_type = 'layer' THEN
    -- Standard layer vaccination schedule
    INSERT INTO vaccination_schedules (batch_id, vaccine_name, vaccine_type, scheduled_day, due_date, route, dose_per_bird, status)
    VALUES
      (p_batch_id, 'Marek''s', 'Live', 0, v_doc_date, 'injection', '0.2 ml', 'pending'),
      (p_batch_id, 'IBD (Gumboro)', 'Live', 7, v_doc_date + INTERVAL '7 days', 'drinking_water', '1 dose', 'pending'),
      (p_batch_id, 'IB (Newcastle)', 'Live', 10, v_doc_date + INTERVAL '10 days', 'drinking_water', '1 dose', 'pending'),
      (p_batch_id, 'Fowl Pox', 'Live', 21, v_doc_date + INTERVAL '21 days', 'wing_web', '1 dose', 'pending');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update create_batch_with_id function to call vaccination schedule creation
CREATE OR REPLACE FUNCTION create_batch_with_id(
  p_district TEXT,
  p_doc_placement_date DATE,
  p_doc_count INTEGER,
  p_doc_supplier TEXT,
  p_breed TEXT,
  p_target_harvest_weight_kg DECIMAL,
  p_shed_id TEXT,
  p_initial_feed_brand TEXT DEFAULT NULL,
  p_initial_feed_type TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_batch_id TEXT;
  v_customer_id UUID;
  v_new_batch_id UUID;
  v_batch_type TEXT DEFAULT 'broiler';
BEGIN
  -- Get current customer ID
  v_customer_id := auth.uid();
  
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Determine batch type from breed if specified
  IF p_breed ILIKE '%layer%' OR p_breed ILIKE '%hen%' THEN
    v_batch_type := 'layer';
  END IF;
  
  -- Generate batch ID using the existing function
  v_batch_id := generate_batch_id(p_district, p_doc_placement_date);
  
  -- Insert the batch record
  INSERT INTO batches (
    customer_id,
    batch_id,
    batch_type,
    doc_placement_date,
    doc_count,
    doc_supplier,
    breed,
    target_harvest_weight_kg,
    shed_id,
    initial_feed_brand,
    initial_feed_type,
    current_bird_count
  ) VALUES (
    v_customer_id,
    v_batch_id,
    v_batch_type,
    p_doc_placement_date,
    p_doc_count,
    p_doc_supplier,
    p_breed,
    p_target_harvest_weight_kg,
    p_shed_id,
    p_initial_feed_brand,
    p_initial_feed_type,
    p_doc_count
  )
  RETURNING id INTO v_new_batch_id;
  
  -- Auto-create vaccination schedules for the batch
  PERFORM create_vaccination_schedules_for_batch(v_new_batch_id, v_batch_type);
  
  -- Return the generated batch ID
  RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260528: Watermark Events
-- File: 20260528_watermark_events.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Watermark events table for leak detection
CREATE TABLE IF NOT EXISTS watermark_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  detection_source TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  watermark_id TEXT,
  content_type TEXT,
  content_id UUID,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_positive')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES customers(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit trail for watermark events
CREATE TABLE IF NOT EXISTS watermark_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watermark_event_id UUID NOT NULL REFERENCES watermark_events(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actioned_by UUID NOT NULL REFERENCES customers(id),
  actioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details JSONB DEFAULT '{}'
);

-- Add suspension tracking to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS suspension_metadata JSONB DEFAULT '{}';

-- Indexes for watermark tables
CREATE INDEX idx_watermark_events_customer_id ON watermark_events(customer_id);
CREATE INDEX idx_watermark_events_event_type ON watermark_events(event_type);
CREATE INDEX idx_watermark_events_status ON watermark_events(status);
CREATE INDEX idx_watermark_events_detected_at ON watermark_events(detected_at DESC);
CREATE INDEX idx_watermark_audit_log_watermark_event_id ON watermark_audit_log(watermark_event_id);
CREATE INDEX idx_watermark_audit_log_actioned_by ON watermark_audit_log(actioned_by);

-- Row Level Security for watermark tables
ALTER TABLE watermark_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermark_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for watermark tables
CREATE POLICY "Users can view own watermark_events" ON watermark_events FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Service role can manage watermark_events" ON watermark_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Users can view own watermark_audit_log" ON watermark_audit_log FOR SELECT USING (watermark_event_id IN (SELECT id FROM watermark_events WHERE customer_id::TEXT = auth.uid()::TEXT));
CREATE POLICY "Service role can manage watermark_audit_log" ON watermark_audit_log FOR ALL USING (auth.role() = 'service_role');

-- Function to get watermark coverage
CREATE OR REPLACE FUNCTION get_watermark_coverage(p_customer_id UUID)
RETURNS TABLE (
  content_type TEXT,
  total_content INTEGER,
  watermarked_content INTEGER,
  coverage_percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wl.content_type,
    COUNT(*) as total_content,
    COUNT(*) FILTER (WHERE wl.watermark_id IS NOT NULL) as watermarked_content,
    CASE 
      WHEN COUNT(*) > 0 
      THEN (COUNT(*) FILTER (WHERE wl.watermark_id IS NOT NULL)::DECIMAL / COUNT(*)) * 100
      ELSE 0 
    END as coverage_percentage
  FROM watermark_logs wl
  WHERE wl.customer_id = p_customer_id
  GROUP BY wl.content_type;
END;
$$ LANGUAGE plpgsql;

-- Function to get decode success rate
CREATE OR REPLACE FUNCTION get_decode_success_rate(p_customer_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_total_attempts INTEGER;
  v_successful_decodes INTEGER;
BEGIN
  SELECT 
    COUNT(*) INTO v_total_attempts
  FROM watermark_events
  WHERE customer_id = p_customer_id
    AND event_type = 'decode_attempt'
    AND detected_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  SELECT 
    COUNT(*) INTO v_successful_decodes
  FROM watermark_events
  WHERE customer_id = p_customer_id
    AND event_type = 'decode_success'
    AND detected_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  IF v_total_attempts > 0 THEN
    RETURN (v_successful_decodes::DECIMAL / v_total_attempts) * 100;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create new watermark event
CREATE OR REPLACE FUNCTION create_watermark_event(
  p_customer_id UUID,
  p_event_type TEXT,
  p_detection_source TEXT,
  p_watermark_id TEXT DEFAULT NULL,
  p_content_type TEXT DEFAULT NULL,
  p_content_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO watermark_events (
    customer_id,
    event_type,
    detection_source,
    watermark_id,
    content_type,
    content_id,
    metadata
  ) VALUES (
    p_customer_id,
    p_event_type,
    p_detection_source,
    p_watermark_id,
    p_content_type,
    p_content_id,
    p_metadata
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add action to watermark event
CREATE OR REPLACE FUNCTION add_watermark_event_action(
  p_watermark_event_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO watermark_audit_log (
    watermark_event_id,
    action,
    actioned_by,
    details
  ) VALUES (
    p_watermark_event_id,
    p_action,
    auth.uid(),
    p_details
  );
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260529: District Aggregation Function
-- File: 20260529_district_aggregation_function.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to aggregate district benchmarks (nightly job)
CREATE OR REPLACE FUNCTION aggregate_district_benchmarks()
RETURNS VOID AS $$
DECLARE
  v_district RECORD;
  v_benchmark_data RECORD;
  v_sample_size INTEGER;
BEGIN
  -- Loop through all districts
  FOR v_district IN
    SELECT DISTINCT district FROM customers WHERE district IS NOT NULL
  LOOP
    -- Calculate performance metrics
    FOR v_benchmark_data IN
      SELECT
        v_district.district,
        'performance' as metric_type,
        AVG(b.current_fcr) as avg_value,
        STDDEV(b.current_fcr) as std_dev,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY b.current_fcr) as p50,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY b.current_fcr) as p25,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY b.current_fcr) as p75,
        COUNT(DISTINCT b.customer_id) as sample_size
      FROM batches b
      JOIN customers c ON b.customer_id = c.id
      WHERE c.district = v_district.district
        AND b.status = 'growing'
        AND b.current_fcr IS NOT NULL
      GROUP BY v_district.district
      
      UNION ALL
      
      SELECT
        v_district.district,
        'weight_gain' as metric_type,
        AVG(wl.avg_weight_kg) as avg_value,
        STDDEV(wl.avg_weight_kg) as std_dev,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY wl.avg_weight_kg) as p50,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY wl.avg_weight_kg) as p25,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY wl.avg_weight_kg) as p75,
        COUNT(DISTINCT b.customer_id) as sample_size
      FROM weight_logs wl
      JOIN batches b ON wl.batch_id = b.id
      JOIN customers c ON b.customer_id = c.id
      WHERE c.district = v_district.district
        AND b.status = 'growing'
        AND wl.log_date = CURRENT_DATE - INTERVAL '1 day'
      GROUP BY v_district.district
      
      UNION ALL
      
      SELECT
        v_district.district,
        'mortality' as metric_type,
        AVG(ml.count::DECIMAL / b.doc_count) as avg_value,
        STDDEV(ml.count::DECIMAL / b.doc_count) as std_dev,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ml.count::DECIMAL / b.doc_count) as p50,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY ml.count::DECIMAL / b.doc_count) as p25,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ml.count::DECIMAL / b.doc_count) as p75,
        COUNT(DISTINCT b.customer_id) as sample_size
      FROM mortality_logs ml
      JOIN batches b ON ml.batch_id = b.id
      JOIN customers c ON b.customer_id = c.id
      WHERE c.district = v_district.district
        AND b.status = 'growing'
        AND ml.log_date = CURRENT_DATE - INTERVAL '1 day'
      GROUP BY v_district.district
    LOOP
      -- Only insert if sample size is at least 5 distinct customers (privacy)
      IF v_benchmark_data.sample_size >= 5 THEN
        INSERT INTO district_benchmarks (
          district,
          metric_type,
          avg_value,
          std_dev,
          p25,
          p50,
          p75,
          sample_size,
          benchmark_date
        ) VALUES (
          v_benchmark_data.district,
          v_benchmark_data.metric_type,
          v_benchmark_data.avg_value,
          v_benchmark_data.std_dev,
          v_benchmark_data.p25,
          v_benchmark_data.p50,
          v_benchmark_data.p75,
          v_benchmark_data.sample_size,
          CURRENT_DATE
        )
        ON CONFLICT (district, metric_type, benchmark_date) DO UPDATE SET
          avg_value = EXCLUDED.avg_value,
          std_dev = EXCLUDED.std_dev,
          p25 = EXCLUDED.p25,
          p50 = EXCLUDED.p50,
          p75 = EXCLUDED.p75,
          sample_size = EXCLUDED.sample_size;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION aggregate_district_benchmarks TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260529: District Benchmarks
-- File: 20260529_district_benchmarks.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- District benchmarks table for anonymized performance data
CREATE TABLE IF NOT EXISTS district_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('performance', 'weight_gain', 'mortality')),
  avg_value DECIMAL(10,2),
  std_dev DECIMAL(10,2),
  p25 DECIMAL(10,2),
  p50 DECIMAL(10,2),
  p75 DECIMAL(10,2),
  sample_size INTEGER NOT NULL,
  benchmark_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (district, metric_type, benchmark_date)
);

-- Indexes for district_benchmarks
CREATE INDEX idx_district_benchmarks_district ON district_benchmarks(district);
CREATE INDEX idx_district_benchmarks_metric_type ON district_benchmarks(metric_type);
CREATE INDEX idx_district_benchmarks_benchmark_date ON district_benchmarks(benchmark_date DESC);
CREATE INDEX idx_district_benchmarks_sample_size ON district_benchmarks(sample_size);

-- Row Level Security for district_benchmarks
ALTER TABLE district_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for district_benchmarks
CREATE POLICY "Authenticated users can view district_benchmarks" ON district_benchmarks FOR SELECT USING (sample_size >= 5);
CREATE POLICY "Service role can manage district_benchmarks" ON district_benchmarks FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260529: Weight Deviation Alert
-- File: 20260529_weight_deviation_alert.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Breed growth standards table
CREATE TABLE IF NOT EXISTS breed_growth_standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  breed TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  standard_weight_kg DECIMAL(5,3) NOT NULL,
  min_weight_kg DECIMAL(5,3),
  max_weight_kg DECIMAL(5,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (breed, day_number)
);

-- Function to get breed standard weight
CREATE OR REPLACE FUNCTION get_breed_standard_weight(p_breed TEXT, p_day_number INTEGER)
RETURNS DECIMAL(5,3) AS $$
DECLARE
  v_standard_weight DECIMAL(5,3);
BEGIN
  SELECT standard_weight_kg INTO v_standard_weight
  FROM breed_growth_standards
  WHERE breed = p_breed AND day_number = p_day_number;
  
  IF v_standard_weight IS NULL THEN
    -- Return a default if no standard found
    RETURN 0;
  END IF;
  
  RETURN v_standard_weight;
END;
$$ LANGUAGE plpgsql;

-- Function to check weight deviation and create alert
CREATE OR REPLACE FUNCTION check_weight_deviation()
RETURNS TRIGGER AS $$
DECLARE
  v_standard_weight DECIMAL(5,3);
  v_deviation_pct DECIMAL(5,2);
  v_batch_record RECORD;
BEGIN
  -- Get batch information
  SELECT b.id, b.customer_id, b.batch_id, b.breed, b.doc_placement_date
  INTO v_batch_record
  FROM batches b
  WHERE b.id = NEW.batch_id;
  
  -- Calculate batch day
  DECLARE v_batch_day INTEGER;
  v_batch_day := CURRENT_DATE - v_batch_record.doc_placement_date;
  
  -- Get standard weight for this breed and day
  v_standard_weight := get_breed_standard_weight(v_batch_record.breed, v_batch_day);
  
  IF v_standard_weight > 0 THEN
    -- Calculate deviation percentage
    v_deviation_pct := ((v_standard_weight - NEW.avg_weight_kg) / v_standard_weight) * 100;
    
    -- Create alert if weight is below 90% of standard
    IF v_deviation_pct > 10 THEN
      INSERT INTO alerts (
        customer_id,
        batch_id,
        type,
        severity,
        title,
        message,
        data,
        issued_at
      ) VALUES (
        v_batch_record.customer_id,
        v_batch_record.id,
        'weight_gain_deviation',
        'medium',
        'Weight Gain Deviation Alert',
        'Batch ' || v_batch_record.batch_id || ' weight is ' || v_deviation_pct::TEXT || '% below standard',
        jsonb_build_object(
          'batch_id', v_batch_record.id,
          'batch_identifier', v_batch_record.batch_id,
          'current_weight', NEW.avg_weight_kg,
          'standard_weight', v_standard_weight,
          'deviation_pct', v_deviation_pct,
          'batch_day', v_batch_day
        ),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check weight deviation on weight log insert
CREATE TRIGGER trg_check_weight_deviation
  AFTER INSERT ON weight_logs
  FOR EACH ROW
  EXECUTE FUNCTION check_weight_deviation();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260530: Mortality Patterns
-- File: 20260530_mortality_patterns.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Mortality pattern enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mortality_pattern') THEN
    CREATE TYPE mortality_pattern AS ENUM ('normal', 'spike', 'trend_increase', 'cluster', 'seasonal');
  END IF;
END $$;

-- Mortality patterns table
CREATE TABLE IF NOT EXISTS mortality_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  pattern_date DATE NOT NULL,
  pattern_type mortality_pattern NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  mortality_count INTEGER,
  expected_range_lower DECIMAL(5,2),
  expected_range_upper DECIMAL(5,2),
  z_score DECIMAL(8,4),
  confidence DECIMAL(5,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for mortality_patterns
CREATE INDEX idx_mortality_patterns_batch_id ON mortality_patterns(batch_id);
CREATE INDEX idx_mortality_patterns_pattern_date ON mortality_patterns(pattern_date);
CREATE INDEX idx_mortality_patterns_pattern_type ON mortality_patterns(pattern_type);
CREATE INDEX idx_mortality_patterns_severity ON mortality_patterns(severity);

-- Row Level Security for mortality_patterns
ALTER TABLE mortality_patterns ENABLE ROW LEVEL SECURITY;

-- RLS policies for mortality_patterns
CREATE POLICY "Users can view own mortality_patterns" ON mortality_patterns FOR SELECT USING (batch_id IN (SELECT id FROM batches WHERE customer_id::TEXT = auth.uid()::TEXT));
CREATE POLICY "Service role can manage mortality_patterns" ON mortality_patterns FOR ALL USING (auth.role() = 'service_role');

-- Function to trigger mortality pattern detection
CREATE OR REPLACE FUNCTION trigger_mortality_pattern_detection()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_mortality DECIMAL(5,2);
  v_std_dev DECIMAL(5,2);
  v_z_score DECIMAL(8,4);
  v_pattern_type mortality_pattern;
BEGIN
  -- Calculate average mortality for this batch over the last 7 days
  SELECT AVG(count), STDDEV(count) INTO v_avg_mortality, v_std_dev
  FROM mortality_logs
  WHERE batch_id = NEW.batch_id
    AND log_date >= CURRENT_DATE - INTERVAL '7 days';
  
  IF v_avg_mortality IS NOT NULL AND v_std_dev IS NOT NULL AND v_std_dev > 0 THEN
    -- Calculate z-score
    v_z_score := (NEW.count - v_avg_mortality) / v_std_dev;
    
    -- Determine pattern type based on z-score
    IF v_z_score > 3 THEN
      v_pattern_type := 'spike';
    ELSIF v_z_score > 2 THEN
      v_pattern_type := 'trend_increase';
    ELSE
      v_pattern_type := 'normal';
    END IF;
    
    -- Log the pattern if it's not normal
    IF v_pattern_type != 'normal' THEN
      INSERT INTO mortality_patterns (
        batch_id,
        pattern_date,
        pattern_type,
        severity,
        mortality_count,
        expected_range_lower,
        expected_range_upper,
        z_score,
        confidence
      ) VALUES (
        NEW.batch_id,
        NEW.log_date,
        v_pattern_type,
        CASE WHEN v_z_score > 3 THEN 'high' ELSE 'medium' END,
        NEW.count,
        v_avg_mortality - v_std_dev,
        v_avg_mortality + v_std_dev,
        v_z_score,
        CASE WHEN v_z_score > 3 THEN 95 ELSE 80 END
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run mortality pattern detection on mortality log insert
CREATE TRIGGER trg_mortality_pattern_detection
  AFTER INSERT ON mortality_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_mortality_pattern_detection();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260531: District Supply Signals
-- File: 20260531_district_supply_signals.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Supply signal enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supply_signal') THEN
    CREATE TYPE supply_signal AS ENUM ('normal', 'low_supply', 'high_supply', 'supply_shock');
  END IF;
END $$;

-- District supply signals table
CREATE TABLE IF NOT EXISTS district_supply_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  signal_date DATE NOT NULL,
  signal_type supply_signal NOT NULL,
  total_mortality INTEGER,
  avg_mortality_rate DECIMAL(8,4),
  expected_mortality_rate DECIMAL(8,4),
  deviation_pct DECIMAL(8,2),
  affected_batches INTEGER,
  total_batches INTEGER,
  confidence DECIMAL(5,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (district, signal_date)
);

-- Indexes for district_supply_signals
CREATE INDEX idx_district_supply_signals_district ON district_supply_signals(district);
CREATE INDEX idx_district_supply_signals_signal_date ON district_supply_signals(signal_date DESC);
CREATE INDEX idx_district_supply_signals_signal_type ON district_supply_signals(signal_type);

-- Row Level Security for district_supply_signals
ALTER TABLE district_supply_signals ENABLE ROW LEVEL SECURITY;

-- RLS policies for district_supply_signals
CREATE POLICY "Authenticated users can view district_supply_signals" ON district_supply_signals FOR SELECT USING (TRUE);
CREATE POLICY "Service role can manage district_supply_signals" ON district_supply_signals FOR ALL USING (auth.role() = 'service_role');

-- Function to calculate daily mortality rate
CREATE OR REPLACE FUNCTION calculate_daily_mortality_rate(p_batch_id UUID, p_log_date DATE)
RETURNS DECIMAL(8,4) AS $$
DECLARE
  v_mortality_count INTEGER;
  v_current_bird_count INTEGER;
  v_mortality_rate DECIMAL(8,4);
BEGIN
  SELECT COUNT INTO v_mortality_count
  FROM mortality_logs
  WHERE batch_id = p_batch_id AND log_date = p_log_date;
  
  SELECT current_bird_count INTO v_current_bird_count
  FROM batches
  WHERE id = p_batch_id;
  
  IF v_current_bird_count > 0 THEN
    v_mortality_rate := (v_mortality_count::DECIMAL / v_current_bird_count) * 100;
  ELSE
    v_mortality_rate := 0;
  END IF;
  
  RETURN v_mortality_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate district mortality
CREATE OR REPLACE FUNCTION aggregate_district_mortality(p_district TEXT, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_total_mortality INTEGER;
  v_avg_mortality_rate DECIMAL(8,4);
  v_expected_rate DECIMAL(8,4);
  v_deviation_pct DECIMAL(8,2);
  v_affected_batches INTEGER;
  v_total_batches INTEGER;
  v_signal_type supply_signal;
BEGIN
  -- Calculate total mortality and average rate for the district
  SELECT 
    SUM(ml.count),
    AVG((ml.count::DECIMAL / b.current_bird_count) * 100),
    COUNT(DISTINCT ml.batch_id),
    COUNT(DISTINCT b.id)
  INTO v_total_mortality, v_avg_mortality_rate, v_affected_batches, v_total_batches
  FROM mortality_logs ml
  JOIN batches b ON ml.batch_id = b.id
  JOIN customers c ON b.customer_id = c.id
  WHERE c.district = p_district
    AND ml.log_date = p_date
    AND b.status = 'growing';
  
  -- Get expected mortality rate from historical data (7-day average)
  SELECT AVG((ml.count::DECIMAL / b.current_bird_count) * 100) INTO v_expected_rate
  FROM mortality_logs ml
  JOIN batches b ON ml.batch_id = b.id
  JOIN customers c ON b.customer_id = c.id
  WHERE c.district = p_district
    AND ml.log_date BETWEEN p_date - INTERVAL '7 days' AND p_date - INTERVAL '1 day'
    AND b.status = 'growing';
  
  -- Calculate deviation
  IF v_expected_rate > 0 THEN
    v_deviation_pct := ((v_avg_mortality_rate - v_expected_rate) / v_expected_rate) * 100;
  ELSE
    v_deviation_pct := 0;
  END IF;
  
  -- Determine signal type
  IF v_deviation_pct > 50 THEN
    v_signal_type := 'supply_shock';
  ELSIF v_deviation_pct > 25 THEN
    v_signal_type := 'high_supply';
  ELSIF v_deviation_pct < -25 THEN
    v_signal_type := 'low_supply';
  ELSE
    v_signal_type := 'normal';
  END IF;
  
  -- Insert or update supply signal
  INSERT INTO district_supply_signals (
    district,
    signal_date,
    signal_type,
    total_mortality,
    avg_mortality_rate,
    expected_mortality_rate,
    deviation_pct,
    affected_batches,
    total_batches,
    confidence
  ) VALUES (
    p_district,
    p_date,
    v_signal_type,
    v_total_mortality,
    v_avg_mortality_rate,
    v_expected_rate,
    v_deviation_pct,
    v_affected_batches,
    v_total_batches,
    CASE WHEN v_total_batches >= 5 THEN 90 ELSE 60 END
  )
  ON CONFLICT (district, signal_date) DO UPDATE SET
    signal_type = EXCLUDED.signal_type,
    total_mortality = EXCLUDED.total_mortality,
    avg_mortality_rate = EXCLUDED.avg_mortality_rate,
    expected_mortality_rate = EXCLUDED.expected_mortality_rate,
    deviation_pct = EXCLUDED.deviation_pct,
    affected_batches = EXCLUDED.affected_batches,
    total_batches = EXCLUDED.total_batches,
    confidence = EXCLUDED.confidence;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260601: Supervisor Missing Checklist CRON
-- File: 20260601_supervisor_missing_checklist_cron.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add supervisor_checklist_missing to alert_type enum
ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'supervisor_checklist_missing';

-- Function to check missing supervisor health checklists
CREATE OR REPLACE FUNCTION check_missing_supervisor_checklists()
RETURNS VOID AS $$
DECLARE
  v_missing_checklist RECORD;
BEGIN
  -- Find farms with missing supervisor health checklists for today
  FOR v_missing_checklist IN
    SELECT 
      f.id as farm_id,
      f.name as farm_name,
      f.integrator_id,
      COUNT(DISTINCT ib.id) as active_batches
    FROM farms f
    JOIN integrator_batches ib ON f.id = ib.farm_id
    LEFT JOIN health_checklist_state hcs ON f.id = hcs.farm_id AND hcs.checklist_date = CURRENT_DATE
    WHERE ib.status = 'active'
      AND hcs.id IS NULL
    GROUP BY f.id, f.name, f.integrator_id
  LOOP
    -- Create alert for farm owner
    INSERT INTO alerts (
      customer_id,
      type,
      severity,
      title,
      message,
      data,
      issued_at
    ) VALUES (
      v_missing_checklist.integrator_id,
      'supervisor_checklist_missing',
      'medium',
      'Supervisor Health Checklist Missing',
      'Farm ' || v_missing_checklist.farm_name || ' has ' || v_missing_checklist.active_batches || ' active batches with missing health checklists for today',
      jsonb_build_object('farm_id', v_missing_checklist.farm_id, 'farm_name', v_missing_checklist.farm_name, 'active_batches', v_missing_checklist.active_batches),
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule the function to run daily at 10:00 AM IST
SELECT cron.schedule(
  'check_missing_supervisor_checklists',
  '30 4 * * *', -- 10:00 AM IST = 4:30 AM UTC
  'SELECT check_missing_supervisor_checklists();'
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_missing_supervisor_checklists TO postgres;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260601: Supervisor Role
-- File: 20260601_supervisor_role.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- User role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'supervisor', 'admin', 'service_role');
  END IF;
END $$;

-- Task type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type') THEN
    CREATE TYPE task_type AS ENUM ('health_check', 'vaccination', 'feed_monitoring', 'mortality_check', 'biosecurity');
  END IF;
END $$;

-- Task status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue', 'skipped');
  END IF;
END $$;

-- Supervisors table
CREATE TABLE IF NOT EXISTS supervisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  assigned_farms UUID[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supervisor daily tasks table
CREATE TABLE IF NOT EXISTS supervisor_daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supervisor_id UUID NOT NULL REFERENCES supervisors(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  task_type task_type NOT NULL,
  task_status task_status DEFAULT 'pending',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  UNIQUE (supervisor_id, farm_id, task_date, task_type)
);

-- Indexes for supervisor tables
CREATE INDEX idx_supervisors_customer_id ON supervisors(customer_id);
CREATE INDEX idx_supervisors_is_active ON supervisors(is_active);
CREATE INDEX idx_supervisor_daily_tasks_supervisor_id ON supervisor_daily_tasks(supervisor_id);
CREATE INDEX idx_supervisor_daily_tasks_farm_id ON supervisor_daily_tasks(farm_id);
CREATE INDEX idx_supervisor_daily_tasks_task_date ON supervisor_daily_tasks(task_date);
CREATE INDEX idx_supervisor_daily_tasks_task_status ON supervisor_daily_tasks(task_status);

-- Row Level Security for supervisor tables
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_daily_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for supervisor tables
CREATE POLICY "Users can view own supervisors" ON supervisors FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Service role can manage supervisors" ON supervisors FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Supervisors can view own tasks" ON supervisor_daily_tasks FOR SELECT USING (supervisor_id IN (SELECT id FROM supervisors WHERE customer_id::TEXT = auth.uid()::TEXT));
CREATE POLICY "Service role can manage supervisor_daily_tasks" ON supervisor_daily_tasks FOR ALL USING (auth.role() = 'service_role');

-- Function to check supervisor status
CREATE OR REPLACE FUNCTION check_supervisor_status(p_supervisor_id UUID)
RETURNS TABLE (
  total_tasks INTEGER,
  pending_tasks INTEGER,
  completed_tasks INTEGER,
  overdue_tasks INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE task_status = 'pending') as pending_tasks,
    COUNT(*) FILTER (WHERE task_status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE task_status = 'overdue') as overdue_tasks
  FROM supervisor_daily_tasks
  WHERE supervisor_id = p_supervisor_id
    AND task_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to get assigned sheds for supervisor
CREATE OR REPLACE FUNCTION get_supervisor_assigned_sheds(p_supervisor_id UUID)
RETURNS TABLE (
  farm_id UUID,
  farm_name TEXT,
  shed_id UUID,
  shed_number TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id as farm_id,
    f.name as farm_name,
    s.id as shed_id,
    s.shed_number
  FROM supervisors sup
  JOIN farms f ON f.id = ANY (sup.assigned_farms)
  JOIN sheds s ON s.farm_id = f.id
  WHERE sup.id = p_supervisor_id
    AND s.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get supervisor's customer
CREATE OR REPLACE FUNCTION get_supervisor_customer(p_supervisor_id UUID)
RETURNS UUID AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  SELECT customer_id INTO v_customer_id
  FROM supervisors
  WHERE id = p_supervisor_id;
  
  RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to supervisors
CREATE TRIGGER update_supervisors_updated_at BEFORE UPDATE ON supervisors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260601: WhatsApp Daily Reminder
-- File: 20260601_whatsapp_daily_reminder.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add WhatsApp reminder fields to farms table
ALTER TABLE farms ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS whatsapp_reminder_time TIME DEFAULT '09:00';
ALTER TABLE farms ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;

-- WhatsApp reminders log table
CREATE TABLE IF NOT EXISTS whatsapp_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  reminder_time TIME NOT NULL,
  reminder_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  message_content TEXT,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for whatsapp_reminders
CREATE INDEX idx_whatsapp_reminders_farm_id ON whatsapp_reminders(farm_id);
CREATE INDEX idx_whatsapp_reminders_reminder_date ON whatsapp_reminders(reminder_date);
CREATE INDEX idx_whatsapp_reminders_status ON whatsapp_reminders(status);

-- Row Level Security for whatsapp_reminders
ALTER TABLE whatsapp_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for whatsapp_reminders
CREATE POLICY "Integrators can manage own whatsapp_reminders" ON whatsapp_reminders FOR ALL USING (farm_id IN (SELECT id FROM farms WHERE integrator_id::TEXT = auth.uid()::TEXT));

-- Function to calculate batch day
CREATE OR REPLACE FUNCTION calculate_batch_day(p_batch_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_doc_date DATE;
  v_batch_day INTEGER;
BEGIN
  SELECT placement_date INTO v_doc_date
  FROM integrator_batches
  WHERE id = p_batch_id;
  
  v_batch_day := CURRENT_DATE - v_doc_date;
  
  RETURN v_batch_day;
END;
$$ LANGUAGE plpgsql;

-- Function to check for existing daily log
CREATE OR REPLACE FUNCTION check_existing_daily_log(p_farm_id UUID, p_log_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
  v_log_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM daily_logs
    WHERE farm_id = p_farm_id AND log_date = p_log_date
  ) INTO v_log_exists;
  
  RETURN v_log_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to get farms needing reminders for a specific hour
CREATE OR REPLACE FUNCTION get_farms_needing_reminders(p_hour INTEGER)
RETURNS TABLE (
  farm_id UUID,
  farm_name TEXT,
  whatsapp_phone TEXT,
  reminder_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id as farm_id,
    f.name as farm_name,
    f.whatsapp_phone,
    CASE 
      WHEN NOT check_existing_daily_log(f.id, CURRENT_DATE) THEN 'daily_log_reminder'
      ELSE 'general_reminder'
    END as reminder_type
  FROM farms f
  WHERE f.whatsapp_enabled = TRUE
    AND EXTRACT(HOUR FROM f.whatsapp_reminder_time) = p_hour
    AND f.is_active = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM whatsapp_reminders
      WHERE farm_id = f.id
        AND reminder_date = CURRENT_DATE
        AND status = 'sent'
    );
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: Aggregated Benchmarks
-- File: 20260602_aggregated_benchmarks.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add batch completion fields to batches table
ALTER TABLE batches ADD COLUMN IF NOT EXISTS actual_harvest_date DATE;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS actual_harvest_weight_kg DECIMAL(8,2);
ALTER TABLE batches ADD COLUMN IF NOT EXISTS actual_fcr DECIMAL(5,2);
ALTER TABLE batches ADD COLUMN IF NOT EXISTS total_mortality_count INTEGER;

-- Aggregated benchmarks table for pre-computed anonymized data
CREATE TABLE IF NOT EXISTS aggregated_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12,2),
  percentile DECIMAL(5,2),
  breed TEXT,
  district TEXT,
  date_range_start DATE,
  date_range_end DATE,
  sample_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for aggregated_benchmarks
CREATE INDEX idx_aggregated_benchmarks_metric_name ON aggregated_benchmarks(metric_name);
CREATE INDEX idx_aggregated_benchmarks_breed ON aggregated_benchmarks(breed);
CREATE INDEX idx_aggregated_benchmarks_district ON aggregated_benchmarks(district);

-- Row Level Security for aggregated_benchmarks
ALTER TABLE aggregated_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for aggregated_benchmarks
CREATE POLICY "Authenticated users can view aggregated_benchmarks" ON aggregated_benchmarks FOR SELECT USING (TRUE);
CREATE POLICY "Service role can insert aggregated_benchmarks" ON aggregated_benchmarks FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Insert initial placeholder data
INSERT INTO aggregated_benchmarks (metric_name, metric_value, percentile, breed, sample_size)
VALUES
  ('avg_fcr_broiler_42_days', 1.65, 50, 'Cobb 500', 100),
  ('avg_fcr_broiler_42_days', 1.55, 25, 'Cobb 500', 100),
  ('avg_fcr_broiler_42_days', 1.75, 75, 'Cobb 500', 100),
  ('avg_weight_broiler_42_days', 2.4, 50, 'Cobb 500', 100),
  ('avg_mortality_rate_broiler_42_days', 3.5, 50, 'Cobb 500', 100)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: Batch Costs
-- File: 20260602_batch_costs.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Batch costs table
CREATE TABLE IF NOT EXISTS batch_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('chick_procurement', 'labor', 'overhead', 'other')),
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for batch_costs
CREATE INDEX idx_batch_costs_batch_id ON batch_costs(batch_id);
CREATE INDEX idx_batch_costs_cost_type ON batch_costs(cost_type);
CREATE INDEX idx_batch_costs_cost_date ON batch_costs(cost_date);

-- Row Level Security for batch_costs
ALTER TABLE batch_costs ENABLE ROW LEVEL SECURITY;

-- RLS policies for batch_costs
CREATE POLICY "Users can manage own batch_costs" ON batch_costs FOR ALL USING (batch_id IN (SELECT id FROM batches WHERE customer_id::TEXT = auth.uid()::TEXT));

-- Apply updated_at trigger to batch_costs
CREATE TRIGGER update_batch_costs_updated_at BEFORE UPDATE ON batch_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: Batch Medicine Costs
-- File: 20260602_batch_medicine_costs.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Batch medicine costs table
CREATE TABLE IF NOT EXISTS batch_medicine_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  brand_name TEXT,
  treatment_purpose TEXT,
  quantity DECIMAL(10,2),
  unit TEXT,
  unit_cost DECIMAL(8,2),
  total_cost DECIMAL(12,2),
  administration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  withdrawal_days INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for batch_medicine_costs
CREATE INDEX idx_batch_medicine_costs_batch_id ON batch_medicine_costs(batch_id);
CREATE INDEX idx_batch_medicine_costs_administration_date ON batch_medicine_costs(administration_date);

-- Row Level Security for batch_medicine_costs
ALTER TABLE batch_medicine_costs ENABLE ROW LEVEL SECURITY;

-- RLS policies for batch_medicine_costs
CREATE POLICY "Users can manage own batch_medicine_costs" ON batch_medicine_costs FOR ALL USING (batch_id IN (SELECT id FROM batches WHERE customer_id::TEXT = auth.uid()::TEXT));

-- Apply updated_at trigger to batch_medicine_costs
CREATE TRIGGER update_batch_medicine_costs_updated_at BEFORE UPDATE ON batch_medicine_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: Batch Sales Buyers
-- File: 20260602_batch_sales_buyers.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Buyers table
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gst_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Batch sales table
CREATE TABLE IF NOT EXISTS batch_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  birds_sold INTEGER NOT NULL,
  avg_weight_per_bird_kg DECIMAL(5,3),
  total_weight_kg DECIMAL(10,2),
  price_per_kg DECIMAL(8,2),
  total_revenue DECIMAL(12,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
  payment_date DATE,
  logistics_provider TEXT,
  logistics_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for buyers and batch_sales
CREATE INDEX idx_buyers_customer_id ON buyers(customer_id);
CREATE INDEX idx_buyers_is_active ON buyers(is_active);
CREATE INDEX idx_batch_sales_batch_id ON batch_sales(batch_id);
CREATE INDEX idx_batch_sales_buyer_id ON batch_sales(buyer_id);
CREATE INDEX idx_batch_sales_sale_date ON batch_sales(sale_date);
CREATE INDEX idx_batch_sales_payment_status ON batch_sales(payment_status);

-- Row Level Security for buyers and batch_sales
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_sales ENABLE ROW LEVEL SECURITY;

-- RLS policies for buyers and batch_sales
CREATE POLICY "Users can manage own buyers" ON buyers FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can manage own batch_sales" ON batch_sales FOR ALL USING (batch_id IN (SELECT id FROM batches WHERE customer_id::TEXT = auth.uid()::TEXT));

-- Apply updated_at trigger to buyers and batch_sales
CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batch_sales_updated_at BEFORE UPDATE ON batch_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: Batch Treatments Vets
-- File: 20260602_batch_treatments_vets.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Vets table
CREATE TABLE IF NOT EXISTS vets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  clinic_name TEXT,
  specialization TEXT,
  license_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Batch treatments table
CREATE TABLE IF NOT EXISTS batch_treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES vets(id) ON DELETE SET NULL,
  treatment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  medicine_name TEXT NOT NULL,
  brand_name TEXT,
  diagnosis TEXT,
  dosage TEXT,
  route medication_route NOT NULL,
  quantity DECIMAL(10,2),
  withdrawal_days INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for vets and batch_treatments
CREATE INDEX idx_vets_customer_id ON vets(customer_id);
CREATE INDEX idx_vets_is_active ON vets(is_active);
CREATE INDEX idx_batch_treatments_batch_id ON batch_treatments(batch_id);
CREATE INDEX idx_batch_treatments_vet_id ON batch_treatments(vet_id);
CREATE INDEX idx_batch_treatments_treatment_date ON batch_treatments(treatment_date);

-- Row Level Security for vets and batch_treatments
ALTER TABLE vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_treatments ENABLE ROW LEVEL SECURITY;

-- RLS policies for vets and batch_treatments
CREATE POLICY "Users can manage own vets" ON vets FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can manage own batch_treatments" ON batch_treatments FOR ALL USING (batch_id IN (SELECT id FROM batches WHERE customer_id::TEXT = auth.uid()::TEXT));

-- Apply updated_at trigger to vets and batch_treatments
CREATE TRIGGER update_vets_updated_at BEFORE UPDATE ON vets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batch_treatments_updated_at BEFORE UPDATE ON batch_treatments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: Documents
-- File: 20260602_documents.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Documents table for farm document management
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'certificate', 'report', 'prescription', 'lab_test', 'other')),
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  description TEXT,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document audit log table
CREATE TABLE IF NOT EXISTS document_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('uploaded', 'viewed', 'downloaded', 'deleted', 'updated')),
  actioned_by UUID REFERENCES customers(id),
  actioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details JSONB DEFAULT '{}'
);

-- Indexes for documents and document_audit_log
CREATE INDEX idx_documents_customer_id ON documents(customer_id);
CREATE INDEX idx_documents_batch_id ON documents(batch_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_upload_date ON documents(upload_date);
CREATE INDEX idx_document_audit_log_document_id ON document_audit_log(document_id);
CREATE INDEX idx_document_audit_log_actioned_by ON document_audit_log(actioned_by);

-- Row Level Security for documents and document_audit_log
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents and document_audit_log
CREATE POLICY "Users can manage own documents" ON documents FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can view own document_audit_log" ON document_audit_log FOR SELECT USING (document_id IN (SELECT id FROM documents WHERE customer_id::TEXT = auth.uid()::TEXT));
CREATE POLICY "Service role can manage document_audit_log" ON document_audit_log FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: Environment Tracking
-- File: 20260602_environment_tracking.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add environmental tracking columns to daily_logs
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS temperature_c DECIMAL(5,2);
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS humidity_pct DECIMAL(5,2);
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS ammonia_ppm DECIMAL(6,2);
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS litter_condition TEXT;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS lighting_hours DECIMAL(4,1);
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS ventilation_status TEXT;

-- Breed growth standards table (if not exists)
CREATE TABLE IF NOT EXISTS breed_growth_standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  breed TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  standard_weight_kg DECIMAL(5,3) NOT NULL,
  min_weight_kg DECIMAL(5,3),
  max_weight_kg DECIMAL(5,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (breed, day_number)
);

-- Breed light programme table
CREATE TABLE IF NOT EXISTS breed_light_programme (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  breed TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  light_hours DECIMAL(4,1) NOT NULL,
  light_intensity_lux DECIMAL(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (breed, day_number)
);

-- Seed breed growth standards for common broiler breeds
INSERT INTO breed_growth_standards (breed, day_number, standard_weight_kg, min_weight_kg, max_weight_kg)
VALUES
  ('Cobb 500', 1, 0.040, 0.038, 0.042),
  ('Cobb 500', 7, 0.160, 0.150, 0.170),
  ('Cobb 500', 14, 0.400, 0.380, 0.420),
  ('Cobb 500', 21, 0.800, 0.750, 0.850),
  ('Cobb 500', 28, 1.300, 1.200, 1.400),
  ('Cobb 500', 35, 1.900, 1.750, 2.050),
  ('Cobb 500', 42, 2.500, 2.300, 2.700),
  ('Ross 308', 1, 0.042, 0.040, 0.044),
  ('Ross 308', 7, 0.170, 0.160, 0.180),
  ('Ross 308', 14, 0.420, 0.400, 0.440),
  ('Ross 308', 21, 0.850, 0.800, 0.900),
  ('Ross 308', 28, 1.350, 1.250, 1.450),
  ('Ross 308', 35, 1.950, 1.800, 2.100),
  ('Ross 308', 42, 2.550, 2.350, 2.750)
ON CONFLICT DO NOTHING;

-- Seed breed light programme for common broiler breeds
INSERT INTO breed_light_programme (breed, day_number, light_hours, light_intensity_lux)
VALUES
  ('Cobb 500', 1, 24.0, 40.0),
  ('Cobb 500', 7, 23.0, 30.0),
  ('Cobb 500', 14, 20.0, 25.0),
  ('Cobb 500', 21, 18.0, 20.0),
  ('Cobb 500', 28, 16.0, 20.0),
  ('Cobb 500', 35, 16.0, 20.0),
  ('Cobb 500', 42, 16.0, 20.0),
  ('Ross 308', 1, 24.0, 40.0),
  ('Ross 308', 7, 23.0, 30.0),
  ('Ross 308', 14, 20.0, 25.0),
  ('Ross 308', 21, 18.0, 20.0),
  ('Ross 308', 28, 16.0, 20.0),
  ('Ross 308', 35, 16.0, 20.0),
  ('Ross 308', 42, 16.0, 20.0)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: Farm Risk Scores
-- File: 20260602_farm_risk_scores.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add biosecurity_level to farms table
ALTER TABLE farms ADD COLUMN IF NOT EXISTS biosecurity_level TEXT DEFAULT 'medium' CHECK (biosecurity_level IN ('low', 'medium', 'high'));

-- Farm risk scores table
CREATE TABLE IF NOT EXISTS farm_risk_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
  proximity_score DECIMAL(5,2),
  age_score DECIMAL(5,2),
  vaccination_score DECIMAL(5,2),
  biosecurity_score DECIMAL(5,2),
  total_score DECIMAL(5,2),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes for farm_risk_scores
CREATE INDEX idx_farm_risk_scores_farm_id ON farm_risk_scores(farm_id);
CREATE INDEX idx_farm_risk_scores_alert_id ON farm_risk_scores(alert_id);
CREATE INDEX idx_farm_risk_scores_risk_level ON farm_risk_scores(risk_level);
CREATE INDEX idx_farm_risk_scores_calculated_at ON farm_risk_scores(calculated_at DESC);

-- Row Level Security for farm_risk_scores
ALTER TABLE farm_risk_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for farm_risk_scores
CREATE POLICY "Integrators can view own farm_risk_scores" ON farm_risk_scores FOR SELECT USING (farm_id IN (SELECT id FROM farms WHERE integrator_id::TEXT = auth.uid()::TEXT));
CREATE POLICY "Service role can manage farm_risk_scores" ON farm_risk_scores FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: IoT Devices
-- File: 20260602_iot_devices.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Device type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_type') THEN
    CREATE TYPE device_type AS ENUM ('temperature_sensor', 'humidity_sensor', 'ammonia_sensor', 'water_meter', 'feed_meter', 'controller');
  END IF;
END $$;

-- Device status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_status') THEN
    CREATE TYPE device_status AS ENUM ('active', 'inactive', 'offline', 'maintenance', 'error');
  END IF;
END $$;

-- IoT devices table
CREATE TABLE IF NOT EXISTS iot_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  shed_id UUID REFERENCES sheds(id) ON DELETE SET NULL,
  device_name TEXT NOT NULL,
  device_type device_type NOT NULL,
  device_status device_status DEFAULT 'active',
  serial_number TEXT UNIQUE,
  manufacturer TEXT,
  model TEXT,
  firmware_version TEXT,
  installation_date DATE,
  last_maintenance_date DATE,
  api_key TEXT UNIQUE,
  reporting_interval_minutes INTEGER DEFAULT 15,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for iot_devices
CREATE INDEX idx_iot_devices_customer_id ON iot_devices(customer_id);
CREATE INDEX idx_iot_devices_batch_id ON iot_devices(batch_id);
CREATE INDEX idx_iot_devices_farm_id ON iot_devices(farm_id);
CREATE INDEX idx_iot_devices_shed_id ON iot_devices(shed_id);
CREATE INDEX idx_iot_devices_device_type ON iot_devices(device_type);
CREATE INDEX idx_iot_devices_device_status ON iot_devices(device_status);
CREATE INDEX idx_iot_devices_serial_number ON iot_devices(serial_number);
CREATE INDEX idx_iot_devices_api_key ON iot_devices(api_key);

-- Row Level Security for iot_devices
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;

-- RLS policies for iot_devices
CREATE POLICY "Users can view own iot_devices" ON iot_devices FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can insert own iot_devices" ON iot_devices FOR INSERT WITH CHECK (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can update own iot_devices" ON iot_devices FOR UPDATE USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Service role can manage iot_devices" ON iot_devices FOR ALL USING (auth.role() = 'service_role');

-- Function to generate API key for device
CREATE OR REPLACE FUNCTION generate_device_api_key()
RETURNS TEXT AS $$
DECLARE
  v_api_key TEXT;
BEGIN
  v_api_key := 'DEV-' || encode(gen_random_bytes(16), 'hex');
  RETURN v_api_key;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate API key on device creation
CREATE OR REPLACE FUNCTION set_device_api_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_key IS NULL THEN
    NEW.api_key := generate_device_api_key();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_device_api_key
  BEFORE INSERT ON iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION set_device_api_key();

-- Function to update device status
CREATE OR REPLACE FUNCTION update_device_status(p_device_id UUID, p_new_status device_status)
RETURNS VOID AS $$
BEGIN
  UPDATE iot_devices
  SET device_status = p_new_status,
      updated_at = NOW()
  WHERE id = p_device_id;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to iot_devices
CREATE TRIGGER update_iot_devices_updated_at BEFORE UPDATE ON iot_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed sample devices for development
INSERT INTO iot_devices (id, customer_id, device_name, device_type, serial_number, manufacturer, model)
SELECT 
  uuid_generate_v4(),
  (SELECT id FROM customers LIMIT 1),
  'Temperature Sensor 1',
  'temperature_sensor',
  'SN-' || encode(gen_random_bytes(8), 'hex'),
  'SensorCo',
  'TempPro 2000'
FROM (SELECT 1) LIMIT 1
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: IoT Offline Detection
-- File: 20260602_iot_offline_detection.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add last_reading_at to iot_devices
ALTER TABLE iot_devices ADD COLUMN IF NOT EXISTS last_reading_at TIMESTAMPTZ;

-- Function to check for offline IoT devices
CREATE OR REPLACE FUNCTION check_offline_iot_devices()
RETURNS VOID AS $$
DECLARE
  v_offline_device RECORD;
BEGIN
  -- Find devices that haven't reported in 2x their reporting interval
  FOR v_offline_device IN
    SELECT 
      id,
      customer_id,
      device_name,
      device_type,
      reporting_interval_minutes,
      last_reading_at
    FROM iot_devices
    WHERE device_status = 'active'
      AND (last_reading_at IS NULL OR last_reading_at < NOW() - (reporting_interval_minutes * 2 || ' minutes')::INTERVAL)
      AND NOT EXISTS (
        SELECT 1 FROM alerts 
        WHERE type = 'device_offline' 
        AND data->>'device_id' = id::TEXT
        AND issued_at >= CURRENT_DATE - INTERVAL '1 day'
      )
  LOOP
    -- Create alert for offline device
    INSERT INTO alerts (
      customer_id,
      type,
      severity,
      title,
      message,
      data,
      issued_at
    ) VALUES (
      v_offline_device.customer_id,
      'device_offline',
      'medium',
      'IoT Device Offline',
      'Device ' || v_offline_device.device_name || ' (' || v_offline_device.device_type || ') has not reported data',
      jsonb_build_object(
        'device_id', v_offline_device.id,
        'device_name', v_offline_device.device_name,
        'device_type', v_offline_device.device_type,
        'last_reading_at', v_offline_device.last_reading_at
      ),
      NOW()
    );
    
    -- Update device status to offline
    UPDATE iot_devices
    SET device_status = 'offline'
    WHERE id = v_offline_device.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule the function to run every 5 minutes
SELECT cron.schedule(
  'check_offline_iot_devices',
  '*/5 * * * *',
  'SELECT check_offline_iot_devices();'
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_offline_iot_devices TO postgres;

-- Manual trigger function
CREATE OR REPLACE FUNCTION trigger_offline_device_check()
RETURNS VOID AS $$
BEGIN
  PERFORM check_offline_iot_devices();
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: IoT Readings
-- File: 20260602_iot_readings.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- IoT readings table (partitioned monthly for time-series data)
CREATE TABLE IF NOT EXISTS iot_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
  reading_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temperature_c DECIMAL(5,2),
  humidity_pct DECIMAL(5,2),
  ammonia_ppm DECIMAL(6,2),
  water_flow_litres DECIMAL(10,2),
  feed_consumed_kg DECIMAL(10,2),
  battery_level_pct DECIMAL(5,2),
  signal_strength INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (reading_timestamp);

-- Create monthly partitions (current and next 2 months)
CREATE TABLE IF NOT EXISTS iot_readings_2025_01 PARTITION OF iot_readings
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS iot_readings_2025_02 PARTITION OF iot_readings
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE IF NOT EXISTS iot_readings_2025_03 PARTITION OF iot_readings
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Indexes for iot_readings
CREATE INDEX idx_iot_readings_device_id ON iot_readings(device_id);
CREATE INDEX idx_iot_readings_reading_timestamp ON iot_readings(reading_timestamp DESC);
CREATE INDEX idx_iot_readings_temperature_c ON iot_readings(temperature_c);
CREATE INDEX idx_iot_readings_humidity_pct ON iot_readings(humidity_pct);

-- Row Level Security for iot_readings
ALTER TABLE iot_readings ENABLE ROW LEVEL SECURITY;

-- RLS policies for iot_readings
CREATE POLICY "Users can view own iot_readings" ON iot_readings FOR SELECT USING (device_id IN (SELECT id FROM iot_devices WHERE customer_id::TEXT = auth.uid()::TEXT));
CREATE POLICY "Service role can insert iot_readings" ON iot_readings FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Trigger to update device last reading timestamp
CREATE OR REPLACE FUNCTION update_device_last_reading()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE iot_devices
  SET last_reading_at = NEW.reading_timestamp,
      device_status = 'active'
  WHERE id = NEW.device_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_device_last_reading
  AFTER INSERT ON iot_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_device_last_reading();

-- Trigger to check reading ranges and create alerts
CREATE OR REPLACE FUNCTION check_iot_reading_ranges()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
  v_device_name TEXT;
BEGIN
  -- Get device info
  SELECT customer_id, device_name INTO v_customer_id, v_device_name
  FROM iot_devices
  WHERE id = NEW.device_id;
  
  -- Check temperature range
  IF NEW.temperature_c IS NOT NULL AND (NEW.temperature_c < 20 OR NEW.temperature_c > 35) THEN
    INSERT INTO alerts (
      customer_id,
      type,
      severity,
      title,
      message,
      data,
      issued_at
    ) VALUES (
      v_customer_id,
      'iot_environment',
      'high',
      'Temperature Out of Range',
      'Device ' || v_device_name || ' reports temperature: ' || NEW.temperature_c || '°C',
      jsonb_build_object('device_id', NEW.device_id, 'temperature', NEW.temperature_c),
      NOW()
    );
  END IF;
  
  -- Check ammonia levels
  IF NEW.ammonia_ppm IS NOT NULL AND NEW.ammonia_ppm > 25 THEN
    INSERT INTO alerts (
      customer_id,
      type,
      severity,
      title,
      message,
      data,
      issued_at
    ) VALUES (
      v_customer_id,
      'iot_environment',
      'high',
      'High Ammonia Levels',
      'Device ' || v_device_name || ' reports ammonia: ' || NEW.ammonia_ppm || ' ppm',
      jsonb_build_object('device_id', NEW.device_id, 'ammonia', NEW.ammonia_ppm),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_iot_reading_ranges
  AFTER INSERT ON iot_readings
  FOR EACH ROW
  EXECUTE FUNCTION check_iot_reading_ranges();

-- Seed sample readings for development
INSERT INTO iot_readings (device_id, temperature_c, humidity_pct, ammonia_ppm)
SELECT 
  (SELECT id FROM iot_devices LIMIT 1),
  28.5,
  65.0,
  15.0
FROM (SELECT 1) LIMIT 1
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260602: Medicines DB
-- File: 20260602_medicines_db.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Medicines database reference table
CREATE TABLE IF NOT EXISTS medicines_db (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicine_name TEXT NOT NULL,
  category TEXT NOT NULL,
  withdrawal_days INTEGER NOT NULL,
  dosage_guidance TEXT,
  common_brand_names TEXT[],
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for medicines_db
CREATE INDEX idx_medicines_db_medicine_name ON medicines_db(medicine_name);
CREATE INDEX idx_medicines_db_category ON medicines_db(category);
CREATE INDEX idx_medicines_db_is_active ON medicines_db(is_active);

-- No RLS on medicines_db as it's a read-only reference table

-- Seed common broiler medicines
INSERT INTO medicines_db (medicine_name, category, withdrawal_days, dosage_guidance, common_brand_names, notes)
VALUES
  ('Enrofloxacin', 'Antibiotic', 7, '10 mg/kg body weight for 3-5 days', ARRAY['Baytril', 'Enrovet'], 'Broad-spectrum antibiotic'),
  ('Tylosin', 'Antibiotic', 5, '20-40 mg/kg in feed for 3-5 days', ARRAY['Tylan', 'Tylovet'], 'Effective against mycoplasma'),
  ('Oxytetracycline', 'Antibiotic', 5, '20-25 mg/kg in feed for 5-7 days', ARRAY['Terramycin', 'Oxyvet'], 'Broad-spectrum tetracycline'),
  ('Amoxicillin', 'Antibiotic', 3, '15-20 mg/kg in water for 3-5 days', ARRAY['Amoxil', 'Amoxivet'], 'Penicillin-class antibiotic'),
  ('Sulfadimidine', 'Antibiotic', 5, '25-50 mg/kg in feed for 5-7 days', ARRAY['Sulfa-D', 'Dimidine'], 'Sulfonamide antibiotic'),
  ('Vitamin A', 'Vitamin', 0, '10000-15000 IU/kg in feed', ARRAY['Vita-A', 'Retinol'], 'Essential for vision and immunity'),
  ('Vitamin D3', 'Vitamin', 0, '2000-3000 IU/kg in feed', ARRAY['Vita-D3', 'Cholecalciferol'], 'Calcium absorption and bone health'),
  ('Vitamin E', 'Vitamin', 0, '30-50 IU/kg in feed', ARRAY['Vita-E', 'Tocopherol'], 'Antioxidant and immunity'),
  ('Vitamin B Complex', 'Vitamin', 0, '1-2 ml/liter in water', ARRAY['B-Complex', 'Multivit'], 'Energy metabolism and nervous system'),
  ('Calcium', 'Mineral', 0, '1-1.5% in feed', ARRAY['Cal-D', 'Oyster Shell'], 'Bone formation and egg shell quality'),
  ('Phosphorus', 'Mineral', 0, '0.5-0.7% in feed', ARRAY['Phos-D', 'Dical'], 'Bone formation and energy metabolism'),
  ('Zinc', 'Mineral', 0, '40-60 ppm in feed', ARRAY['Zinc-Sul', 'Zinc-Ox'], 'Immunity and wound healing'),
  ('Selenium', 'Mineral', 0, '0.1-0.3 ppm in feed', ARRAY['Selen', 'E-Sel'], 'Antioxidant with Vitamin E'),
  ('Ivermectin', 'Antiparasitic', 14, '0.2 mg/kg body weight', ARRAY['Ivomec', 'Ivome'], 'External and internal parasites'),
  ('Albendazole', 'Antiparasitic', 7, '10-20 mg/kg body weight', ARRAY['Alben', 'Albendazol'], 'Broad-spectrum dewormer'),
  ('Fenbendazole', 'Antiparasitic', 7, '10-20 mg/kg body weight', ARRAY['Panacur', 'Safe-Guard'], 'Gastrointestinal parasites'),
  ('Diclazuril', 'Anticoccidial', 0, '1 ppm in feed', ARRAY['Clinacox', 'Diclaz'], 'Coccidiosis prevention'),
  ('Toltrazuril', 'Anticoccidial', 0, '7 ppm in feed', ARRAY['Baycox', 'Toltra'], 'Coccidiosis treatment'),
  ('Monensin', 'Anticoccidial', 0, '100-125 ppm in feed', ARRAY['Rumensin', 'Monensin'], 'Ionophore coccidiostat'),
  ('Salinomycin', 'Anticoccidial', 0, '60-70 ppm in feed', ARRAY['Sacox', 'Salino'], 'Ionophore coccidiostat'),
  ('Lasalocid', 'Anticoccidial', 0, '75-125 ppm in feed', ARRAY['Avatec', 'Lasalo'], 'Ionophore coccidiostat')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260603: ERP Integrations
-- File: 20260603_erp_integrations.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Integration type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_type') THEN
    CREATE TYPE integration_type AS ENUM ('tally', 'zoho', 'sap', 'oracle', 'custom');
  END IF;
END $$;

-- Integration status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_status') THEN
    CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'error', 'pending_setup');
  END IF;
END $$;

-- Sync status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sync_status') THEN
    CREATE TYPE sync_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'skipped');
  END IF;
END $$;

-- Customer integrations table
CREATE TABLE IF NOT EXISTS customer_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  integration_type integration_type NOT NULL,
  status integration_status DEFAULT 'pending_setup',
  credentials_encrypted TEXT,
  oauth_access_token TEXT,
  oauth_refresh_token TEXT,
  oauth_token_expires_at TIMESTAMPTZ,
  webhook_url TEXT,
  webhook_secret TEXT,
  last_sync_at TIMESTAMPTZ,
  sync_frequency_minutes INTEGER DEFAULT 60,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, integration_type)
);

-- Integration sync logs table
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID NOT NULL REFERENCES customer_integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  sync_status sync_status DEFAULT 'pending',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_succeeded INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for ERP integration tables
CREATE INDEX idx_customer_integrations_customer_id ON customer_integrations(customer_id);
CREATE INDEX idx_customer_integrations_integration_type ON customer_integrations(integration_type);
CREATE INDEX idx_customer_integrations_status ON customer_integrations(status);
CREATE INDEX idx_integration_sync_logs_integration_id ON integration_sync_logs(integration_id);
CREATE INDEX idx_integration_sync_logs_sync_status ON integration_sync_logs(sync_status);
CREATE INDEX idx_integration_sync_logs_started_at ON integration_sync_logs(started_at DESC);

-- Row Level Security for ERP integration tables
ALTER TABLE customer_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for ERP integration tables
CREATE POLICY "Users can manage own customer_integrations" ON customer_integrations FOR ALL USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can view own integration_sync_logs" ON integration_sync_logs FOR SELECT USING (integration_id IN (SELECT id FROM customer_integrations WHERE customer_id::TEXT = auth.uid()::TEXT));
CREATE POLICY "Service role can manage integration_sync_logs" ON integration_sync_logs FOR ALL USING (auth.role() = 'service_role');

-- Apply updated_at trigger to customer_integrations
CREATE TRIGGER update_customer_integrations_updated_at BEFORE UPDATE ON customer_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to calculate sync duration
CREATE OR REPLACE FUNCTION calculate_sync_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    NEW.metadata := jsonb_set(
      COALESCE(NEW.metadata, '{}'),
      '{duration_seconds}',
      (EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)))::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_sync_duration
  BEFORE UPDATE ON integration_sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sync_duration();

-- Function to update integration status
CREATE OR REPLACE FUNCTION update_integration_status(p_integration_id UUID, p_new_status integration_status)
RETURNS VOID AS $$
BEGIN
  UPDATE customer_integrations
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = p_integration_id;
END;
$$ LANGUAGE plpgsql;

-- Function to retry failed sync
CREATE OR REPLACE FUNCTION retry_failed_sync(p_sync_log_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE integration_sync_logs
  SET sync_status = 'pending',
      started_at = NOW(),
      completed_at = NULL,
      error_message = NULL
  WHERE id = p_sync_log_id AND sync_status = 'failed';
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260603: Layer Farm Tables
-- File: 20260603_layer_farm_tables.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add poultry_type to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS poultry_type TEXT DEFAULT 'broiler' CHECK (poultry_type IN ('broiler', 'layer', 'both'));

-- Egg production logs table for layer farms
CREATE TABLE IF NOT EXISTS egg_production_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  total_eggs_produced INTEGER NOT NULL,
  good_eggs INTEGER,
  cracked_eggs INTEGER,
  dirty_eggs INTEGER,
  misshapen_eggs INTEGER,
  total_weight_kg DECIMAL(8,2),
  avg_egg_weight_g DECIMAL(5,2),
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Egg grading logs table
CREATE TABLE IF NOT EXISTS egg_grading_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  grade_a_count INTEGER,
  grade_b_count INTEGER,
  grade_c_count INTEGER,
  grade_d_count INTEGER,
  total_weight_kg DECIMAL(8,2),
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Egg packing logs table
CREATE TABLE IF NOT EXISTS egg_packing_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  tray_size INTEGER,
  trays_packed INTEGER,
  total_eggs_packed INTEGER,
  packing_type TEXT,
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Egg dispatch logs table
CREATE TABLE IF NOT EXISTS egg_dispatch_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  dispatch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
  total_trays INTEGER,
  total_eggs INTEGER,
  total_weight_kg DECIMAL(8,2),
  price_per_tray DECIMAL(8,2),
  total_revenue DECIMAL(12,2),
  vehicle_number TEXT,
  driver_name TEXT,
  notes TEXT,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for layer farm tables
CREATE INDEX idx_egg_production_logs_batch_id ON egg_production_logs(batch_id);
CREATE INDEX idx_egg_production_logs_log_date ON egg_production_logs(log_date);
CREATE INDEX idx_egg_grading_logs_batch_id ON egg_grading_logs(batch_id);
CREATE INDEX idx_egg_grading_logs_log_date ON egg_grading_logs(log_date);
CREATE INDEX idx_egg_packing_logs_batch_id ON egg_packing_logs(batch_id);
CREATE INDEX idx_egg_packing_logs_log_date ON egg_packing_logs(log_date);
CREATE INDEX idx_egg_dispatch_logs_batch_id ON egg_dispatch_logs(batch_id);
CREATE INDEX idx_egg_dispatch_logs_dispatch_date ON egg_dispatch_logs(dispatch_date);
CREATE INDEX idx_egg_dispatch_logs_buyer_id ON egg_dispatch_logs(buyer_id);

-- Row Level Security for layer farm tables
ALTER TABLE egg_production_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_grading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_packing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_dispatch_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for layer farm tables
CREATE POLICY "Users can manage own egg_production_logs" ON egg_production_logs FOR ALL USING (batch_id IN (SELECT id FROM batches WHERE customer_id::TEXT = auth.uid()::TEXT));
CREATE POLICY "Users can manage own egg_grading_logs" ON egg_grading_logs FOR ALL USING (batch_id IN (SELECT id FROM batches WHERE customer_id::TEXT = auth.uid()::TEXT));
CREATE POLICY "Users can manage own egg_packing_logs" ON egg_packing_logs FOR ALL USING (batch_id IN (SELECT id FROM batches WHERE customer_id::TEXT = auth.uid()::TEXT));
CREATE POLICY "Users can manage own egg_dispatch_logs" ON egg_dispatch_logs FOR ALL USING (batch_id IN (SELECT id FROM batches WHERE customer_id::TEXT = auth.uid()::TEXT));

-- Function to calculate Hen-Day Production percentage
CREATE OR REPLACE FUNCTION calculate_hdp(p_batch_id UUID, p_log_date DATE)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_eggs_produced INTEGER;
  v_current_bird_count INTEGER;
  v_hdp DECIMAL(5,2);
BEGIN
  SELECT total_eggs_produced INTO v_eggs_produced
  FROM egg_production_logs
  WHERE batch_id = p_batch_id AND log_date = p_log_date;
  
  SELECT current_bird_count INTO v_current_bird_count
  FROM batches
  WHERE id = p_batch_id;
  
  IF v_current_bird_count > 0 THEN
    v_hdp := (v_eggs_produced::DECIMAL / v_current_bird_count) * 100;
  ELSE
    v_hdp := 0;
  END IF;
  
  RETURN v_hdp;
END;
$$ LANGUAGE plpgsql;

-- Seed sample layer batch and egg logs
INSERT INTO batches (customer_id, batch_id, batch_type, doc_placement_date, doc_count, breed, current_bird_count)
SELECT 
  (SELECT id FROM customers LIMIT 1),
  'HYD-LAY-202501-001',
  'layer',
  CURRENT_DATE - INTERVAL '120 days',
  5000,
  'Hy-Line Brown',
  4850
FROM (SELECT 1) LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO egg_production_logs (batch_id, log_date, total_eggs_produced, good_eggs, cracked_eggs, total_weight_kg)
SELECT 
  (SELECT id FROM batches WHERE batch_type = 'layer' LIMIT 1),
  CURRENT_DATE,
  4800,
  4700,
  100,
  288.0
FROM (SELECT 1) LIMIT 1
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260603: Webhook Delivery Log
-- File: 20260603_webhook_delivery_log.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Webhook delivery log table
CREATE TABLE IF NOT EXISTS webhook_delivery_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'retrying')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for webhook_delivery_log
CREATE INDEX idx_webhook_delivery_log_customer_id ON webhook_delivery_log(customer_id);
CREATE INDEX idx_webhook_delivery_log_event_type ON webhook_delivery_log(event_type);
CREATE INDEX idx_webhook_delivery_log_delivery_status ON webhook_delivery_log(delivery_status);
CREATE INDEX idx_webhook_delivery_log_next_retry_at ON webhook_delivery_log(next_retry_at);
CREATE INDEX idx_webhook_delivery_log_created_at ON webhook_delivery_log(created_at DESC);

-- Row Level Security for webhook_delivery_log
ALTER TABLE webhook_delivery_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhook_delivery_log
CREATE POLICY "Users can view own webhook_delivery_log" ON webhook_delivery_log FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Users can insert own webhook_delivery_log" ON webhook_delivery_log FOR INSERT WITH CHECK (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Admin users can view all webhook_delivery_log" ON webhook_delivery_log FOR SELECT USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260606: Forecast Screen Tables
-- File: 20260606_forecast_screen_tables.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Model accuracy by horizon table
CREATE TABLE IF NOT EXISTS model_accuracy_by_horizon (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  horizon_days INTEGER NOT NULL,
  model_name TEXT NOT NULL,
  mape DECIMAL(5,2),
  directional_accuracy DECIMAL(5,2),
  sample_size INTEGER,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (horizon_days, model_name)
);

-- Sell signals table
CREATE TABLE IF NOT EXISTS sell_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  signal_date DATE NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('sell', 'hold', 'buy')),
  confidence DECIMAL(5,2),
  predicted_price DECIMAL(8,2),
  current_price DECIMAL(8,2),
  target_price DECIMAL(8,2),
  horizon_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Price drivers table
CREATE TABLE IF NOT EXISTS price_drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_name TEXT NOT NULL,
  driver_category TEXT NOT NULL,
  impact_weight DECIMAL(5,2),
  current_value DECIMAL(10,2),
  trend TEXT CHECK (trend IN ('up', 'down', 'stable', 'volatile')),
  description TEXT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Festivals table
CREATE TABLE IF NOT EXISTS festivals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  festival_name TEXT NOT NULL,
  festival_date DATE NOT NULL,
  region TEXT,
  impact_type TEXT CHECK (impact_type IN ('price_increase', 'price_decrease', 'neutral')),
  impact_magnitude DECIMAL(5,2),
  notes TEXT,
  UNIQUE (festival_name, festival_date, region)
);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  district TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('above_threshold', 'below_threshold', 'trend_change')),
  threshold_price DECIMAL(8,2),
  current_price DECIMAL(8,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prediction access log table
CREATE TABLE IF NOT EXISTS prediction_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  district TEXT,
  prediction_date DATE,
  access_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Price forecasts table
CREATE TABLE IF NOT EXISTS price_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  forecast_date DATE NOT NULL,
  prediction_date DATE NOT NULL,
  predicted_price DECIMAL(8,2),
  confidence_interval_lower DECIMAL(8,2),
  confidence_interval_upper DECIMAL(8,2),
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (district, forecast_date, prediction_date)
);

-- Price actuals table
CREATE TABLE IF NOT EXISTS price_actuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  price_date DATE NOT NULL,
  actual_price DECIMAL(8,2),
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (district, price_date)
);

-- HPAI alerts table
CREATE TABLE IF NOT EXISTS hpai_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  alert_date DATE NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_radius_km INTEGER,
  description TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for forecast screen tables
CREATE INDEX idx_model_accuracy_by_horizon_horizon ON model_accuracy_by_horizon(horizon_days);
CREATE INDEX idx_sell_signals_district ON sell_signals(district);
CREATE INDEX idx_sell_signals_signal_date ON sell_signals(signal_date DESC);
CREATE INDEX idx_price_alerts_customer_id ON price_alerts(customer_id);
CREATE INDEX idx_price_alerts_district ON price_alerts(district);
CREATE INDEX idx_price_forecasts_district ON price_forecasts(district);
CREATE INDEX idx_price_forecasts_forecast_date ON price_forecasts(forecast_date DESC);
CREATE INDEX idx_price_actuals_district ON price_actuals(district);
CREATE INDEX idx_price_actuals_price_date ON price_actuals(price_date DESC);
CREATE INDEX idx_hpai_alerts_district ON hpai_alerts(district);
CREATE INDEX idx_hpai_alerts_alert_date ON hpai_alerts(alert_date DESC);

-- Row Level Security for forecast screen tables
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_access_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for forecast screen tables
CREATE POLICY "Users can manage own price_alerts" ON price_alerts FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Users can insert own prediction_access_log" ON prediction_access_log FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Seed model accuracy data
INSERT INTO model_accuracy_by_horizon (horizon_days, model_name, mape, directional_accuracy, sample_size)
VALUES
  (1, 'ensemble', 2.5, 85.0, 500),
  (3, 'ensemble', 4.2, 78.0, 450),
  (7, 'ensemble', 6.8, 72.0, 400),
  (14, 'ensemble', 9.5, 65.0, 350)
ON CONFLICT DO NOTHING;

-- Seed festivals data
INSERT INTO festivals (festival_name, festival_date, region, impact_type, impact_magnitude)
VALUES
  ('Diwali', '2025-10-20', 'All India', 'price_increase', 15.0),
  ('Eid', '2025-06-16', 'All India', 'price_increase', 12.0),
  ('Christmas', '2025-12-25', 'All India', 'price_increase', 8.0),
  ('Pongal', '2025-01-14', 'South India', 'price_increase', 10.0)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260606: GC Employee Module
-- File: 20260606_gc_employee_module.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Batch GC costs table
CREATE TABLE IF NOT EXISTS batch_gc_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  cost_category TEXT NOT NULL CHECK (cost_category IN ('electricity', 'fuel', 'labor', 'maintenance', 'other')),
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  department TEXT,
  salary_monthly DECIMAL(10,2),
  joining_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Salary records table
CREATE TABLE IF NOT EXISTS salary_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  basic_salary DECIMAL(10,2),
  allowance DECIMAL(10,2),
  deduction DECIMAL(10,2),
  net_salary DECIMAL(10,2),
  payment_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, month, year)
);

-- Salary advances table
CREATE TABLE IF NOT EXISTS salary_advances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  advance_amount DECIMAL(10,2) NOT NULL,
  advance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  repayment_month INTEGER,
  repayment_year INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'repaid', 'partial')),
  repaid_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business expenses table
CREATE TABLE IF NOT EXISTS business_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  expense_category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  vendor TEXT,
  bill_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for GC employee module tables
CREATE INDEX idx_batch_gc_costs_batch_id ON batch_gc_costs(batch_id);
CREATE INDEX idx_batch_gc_costs_cost_category ON batch_gc_costs(cost_category);
CREATE INDEX idx_employees_customer_id ON employees(customer_id);
CREATE INDEX idx_employees_is_active ON employees(is_active);
CREATE INDEX idx_salary_records_employee_id ON salary_records(employee_id);
CREATE INDEX idx_salary_records_month_year ON salary_records(month, year);
CREATE INDEX idx_salary_advances_employee_id ON salary_advances(employee_id);
CREATE INDEX idx_business_expenses_customer_id ON business_expenses(customer_id);
CREATE INDEX idx_business_expenses_expense_category ON business_expenses(expense_category);
CREATE INDEX idx_business_expenses_expense_date ON business_expenses(expense_date);

-- Row Level Security for GC employee module tables
ALTER TABLE batch_gc_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for GC employee module tables
CREATE POLICY "Users can manage own batch_gc_costs" ON batch_gc_costs FOR ALL USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));
CREATE POLICY "Users can manage own employees" ON employees FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Users can manage own salary_records" ON salary_records FOR ALL USING (employee_id IN (SELECT id FROM employees WHERE customer_id = auth.uid()));
CREATE POLICY "Users can manage own salary_advances" ON salary_advances FOR ALL USING (employee_id IN (SELECT id FROM employees WHERE customer_id = auth.uid()));
CREATE POLICY "Users can manage own business_expenses" ON business_expenses FOR ALL USING (customer_id = auth.uid());

-- Apply updated_at triggers
CREATE TRIGGER update_batch_gc_costs_updated_at BEFORE UPDATE ON batch_gc_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to compute GC for a batch
DO $$
BEGIN
  DROP FUNCTION IF EXISTS compute_batch_gc(UUID);
END $$;

CREATE OR REPLACE FUNCTION compute_batch_gc(p_batch_id UUID)
RETURNS DECIMAL(12,2) AS $$
DECLARE
  v_total_gc DECIMAL(12,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_total_gc
  FROM batch_gc_costs
  WHERE batch_id = p_batch_id;
  
  RETURN v_total_gc;
END;
$$ LANGUAGE plpgsql;

-- Function to get farm labour cost
CREATE OR REPLACE FUNCTION get_farm_labour_cost(p_customer_id UUID, p_month INTEGER, p_year INTEGER)
RETURNS DECIMAL(12,2) AS $$
DECLARE
  v_labour_cost DECIMAL(12,2);
BEGIN
  SELECT COALESCE(SUM(sr.net_salary), 0) INTO v_labour_cost
  FROM salary_records sr
  JOIN employees e ON sr.employee_id = e.id
  WHERE e.customer_id = p_customer_id
    AND sr.month = p_month
    AND sr.year = p_year
    AND sr.status = 'paid';
  
  RETURN v_labour_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to update GC on cost change
CREATE OR REPLACE FUNCTION update_gc_on_cost_change()
RETURNS TRIGGER AS $$
BEGIN
  -- This trigger would update a cached GC value on the batch
  -- Implementation depends on batch table structure
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_gc_on_cost_change
  AFTER INSERT OR UPDATE ON batch_gc_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_gc_on_cost_change();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260607: Internal Notes
-- File: 20260607_internal_notes.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Internal notes table for integrators to leave notes for field supervisors
CREATE TABLE IF NOT EXISTS internal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES supervisors(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for internal_notes
CREATE INDEX idx_internal_notes_farm_id ON internal_notes(farm_id);
CREATE INDEX idx_internal_notes_integrator_id ON internal_notes(integrator_id);
CREATE INDEX idx_internal_notes_supervisor_id ON internal_notes(supervisor_id);
CREATE INDEX idx_internal_notes_is_resolved ON internal_notes(is_resolved);
CREATE INDEX idx_internal_notes_created_at ON internal_notes(created_at DESC);

-- Row Level Security for internal_notes
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for internal_notes
CREATE POLICY "Integrators can view own internal_notes" ON internal_notes FOR SELECT USING (integrator_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Integrators can create own internal_notes" ON internal_notes FOR INSERT WITH CHECK (integrator_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Integrators can update own internal_notes" ON internal_notes FOR UPDATE USING (integrator_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Integrators can delete own internal_notes" ON internal_notes FOR DELETE USING (integrator_id::TEXT = auth.uid()::TEXT);

-- Apply updated_at trigger to internal_notes
CREATE TRIGGER update_internal_notes_updated_at BEFORE UPDATE ON internal_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260607: Onboarding Progress
-- File: 20260607_onboarding_progress.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- User onboarding progress table
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  profile_completed BOOLEAN DEFAULT FALSE,
  profile_completed_at TIMESTAMPTZ,
  first_batch_created BOOLEAN DEFAULT FALSE,
  first_batch_created_at TIMESTAMPTZ,
  first_prediction_viewed BOOLEAN DEFAULT FALSE,
  first_prediction_viewed_at TIMESTAMPTZ,
  first_alert_acknowledged BOOLEAN DEFAULT FALSE,
  first_alert_acknowledged_at TIMESTAMPTZ,
  whatsapp_verified BOOLEAN DEFAULT FALSE,
  whatsapp_verified_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id)
);

-- Indexes for user_onboarding_progress
CREATE INDEX idx_user_onboarding_progress_customer_id ON user_onboarding_progress(customer_id);
CREATE INDEX idx_user_onboarding_progress_onboarding_completed ON user_onboarding_progress(onboarding_completed);

-- Row Level Security for user_onboarding_progress
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_onboarding_progress
CREATE POLICY "Users can view own user_onboarding_progress" ON user_onboarding_progress FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Users can insert own user_onboarding_progress" ON user_onboarding_progress FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Users can update own user_onboarding_progress" ON user_onboarding_progress FOR UPDATE USING (customer_id = auth.uid());

-- Function to update onboarding timestamp
CREATE OR REPLACE FUNCTION update_onboarding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_completed = TRUE AND OLD.profile_completed = FALSE THEN
    NEW.profile_completed_at := NOW();
  END IF;
  IF NEW.first_batch_created = TRUE AND OLD.first_batch_created = FALSE THEN
    NEW.first_batch_created_at := NOW();
  END IF;
  IF NEW.first_prediction_viewed = TRUE AND OLD.first_prediction_viewed = FALSE THEN
    NEW.first_prediction_viewed_at := NOW();
  END IF;
  IF NEW.first_alert_acknowledged = TRUE AND OLD.first_alert_acknowledged = FALSE THEN
    NEW.first_alert_acknowledged_at := NOW();
  END IF;
  IF NEW.whatsapp_verified = TRUE AND OLD.whatsapp_verified = FALSE THEN
    NEW.whatsapp_verified_at := NOW();
  END IF;
  
  -- Check if onboarding is complete
  IF NEW.profile_completed = TRUE 
    AND NEW.first_batch_created = TRUE 
    AND NEW.first_prediction_viewed = TRUE 
    AND NEW.whatsapp_verified = TRUE
    AND OLD.onboarding_completed = FALSE
  THEN
    NEW.onboarding_completed := TRUE;
    NEW.onboarding_completed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_onboarding_timestamp
  BEFORE UPDATE ON user_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_timestamp();

-- Apply updated_at trigger to user_onboarding_progress
CREATE TRIGGER update_user_onboarding_progress_updated_at BEFORE UPDATE ON user_onboarding_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check onboarding completion
CREATE OR REPLACE FUNCTION check_onboarding_completion(p_customer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_complete BOOLEAN;
BEGIN
  SELECT onboarding_completed INTO v_is_complete
  FROM user_onboarding_progress
  WHERE customer_id = p_customer_id;
  
  RETURN COALESCE(v_is_complete, FALSE);
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260610: WhatsApp Daily Log Enhancements
-- File: 20260610_whatsapp_daily_log_enhancements.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add missing WhatsApp-related fields to farms table
ALTER TABLE farms ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT TRUE;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS whatsapp_language TEXT DEFAULT 'hi';

-- Add missing WhatsApp-related fields to daily_logs table
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS whatsapp_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS whatsapp_confirmed_at TIMESTAMPTZ;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS whatsapp_confirmed_by TEXT;

-- WhatsApp pending confirmations table for ambiguous replies
CREATE TABLE IF NOT EXISTS whatsapp_pending_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  phone TEXT NOT NULL,
  message_content TEXT NOT NULL,
  confirmation_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  UNIQUE (farm_id, log_date, confirmation_type)
);

-- Update whatsapp_reminders table with new columns
ALTER TABLE whatsapp_reminders ADD COLUMN IF NOT EXISTS confirmation_required BOOLEAN DEFAULT FALSE;
ALTER TABLE whatsapp_reminders ADD COLUMN IF NOT EXISTS confirmation_received BOOLEAN DEFAULT FALSE;
ALTER TABLE whatsapp_reminders ADD COLUMN IF NOT EXISTS confirmation_received_at TIMESTAMPTZ;

-- Indexes for whatsapp_pending_confirmations
CREATE INDEX idx_whatsapp_pending_confirmations_farm_id ON whatsapp_pending_confirmations(farm_id);
CREATE INDEX idx_whatsapp_pending_confirmations_log_date ON whatsapp_pending_confirmations(log_date);
CREATE INDEX idx_whatsapp_pending_confirmations_status ON whatsapp_pending_confirmations(status);
CREATE INDEX idx_whatsapp_pending_confirmations_phone ON whatsapp_pending_confirmations(phone);

-- Row Level Security for whatsapp_pending_confirmations
ALTER TABLE whatsapp_pending_confirmations ENABLE ROW LEVEL SECURITY;

-- RLS policies for whatsapp_pending_confirmations
CREATE POLICY "Integrators can manage own whatsapp_pending_confirmations" ON whatsapp_pending_confirmations FOR ALL USING (farm_id IN (SELECT id FROM farms WHERE integrator_id::TEXT = auth.uid()::TEXT));

-- Function to cleanup expired pending confirmations
CREATE OR REPLACE FUNCTION cleanup_expired_confirmations()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM whatsapp_pending_confirmations
  WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check phone number availability
CREATE OR REPLACE FUNCTION check_phone_availability(p_phone TEXT, p_farm_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_available BOOLEAN;
BEGIN
  SELECT NOT EXISTS(
    SELECT 1 FROM farms
    WHERE whatsapp_phone = p_phone
      AND id != p_farm_id
      AND whatsapp_phone IS NOT NULL
  ) INTO v_is_available;
  
  RETURN v_is_available;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 20260620: New Pricing Tiers
-- File: 20260620_new_pricing_tiers.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop existing subscription-related tables if they exist
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS pricing_tiers CASCADE;

-- Create new subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  auto_renew BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plan price points table
CREATE TABLE IF NOT EXISTS plan_price_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  price_inr DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (plan_id, billing_cycle)
);

-- Plan feature entitlements table
CREATE TABLE IF NOT EXISTS plan_feature_entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  feature_limit INTEGER,
  is_unlimited BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (plan_id, feature_name)
);

-- Indexes for pricing tables
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_plan_price_points_plan_id ON plan_price_points(plan_id);
CREATE INDEX idx_plan_price_points_is_active ON plan_price_points(is_active);
CREATE INDEX idx_plan_feature_entitlements_plan_id ON plan_feature_entitlements(plan_id);

-- Row Level Security for pricing tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_price_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_feature_entitlements ENABLE ROW LEVEL SECURITY;

-- RLS policies for pricing tables
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (customer_id::TEXT = auth.uid()::TEXT);
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public can view plan_price_points" ON plan_price_points FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view plan_feature_entitlements" ON plan_feature_entitlements FOR SELECT USING (TRUE);
CREATE POLICY "Service role can manage plan_price_points" ON plan_price_points FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage plan_feature_entitlements" ON plan_feature_entitlements FOR ALL USING (auth.role() = 'service_role');

-- Apply updated_at triggers
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_price_points_updated_at BEFORE UPDATE ON plan_price_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check feature access
CREATE OR REPLACE FUNCTION check_feature_access(p_customer_id UUID, p_feature_name TEXT)
RETURNS TABLE (
  has_access BOOLEAN,
  limit_value INTEGER,
  is_unlimited BOOLEAN
) AS $$
DECLARE
  v_plan_id UUID;
BEGIN
  -- Get customer's active subscription plan
  SELECT plan_id::UUID INTO v_plan_id
  FROM subscriptions
  WHERE customer_id = p_customer_id
    AND status = 'active'
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, FALSE;
  END IF;
  
  RETURN QUERY
  SELECT 
    TRUE as has_access,
    feature_limit as limit_value,
    is_unlimited
  FROM plan_feature_entitlements
  WHERE plan_id::TEXT = v_plan_id::TEXT AND feature_name = p_feature_name;
END;
$$ LANGUAGE plpgsql;

-- Seed pricing and feature entitlements for FARM and PRO plans
INSERT INTO plan_price_points (plan_id, plan_name, billing_cycle, price_inr, discount_percentage, features, is_active)
VALUES
  (uuid_generate_v4(), 'FARM', 'monthly', 499, 0, ARRAY['Basic predictions', 'WhatsApp alerts', 'Batch tracking'], TRUE),
  (uuid_generate_v4(), 'FARM', 'quarterly', 1299, 13.3, ARRAY['Basic predictions', 'WhatsApp alerts', 'Batch tracking'], TRUE),
  (uuid_generate_v4(), 'FARM', 'annual', 4499, 25.0, ARRAY['Basic predictions', 'WhatsApp alerts', 'Batch tracking'], TRUE),
  (uuid_generate_v4(), 'PRO', 'monthly', 1499, 0, ARRAY['Advanced predictions', 'WhatsApp alerts', 'Batch tracking', 'IoT integration', 'District benchmarks'], TRUE),
  (uuid_generate_v4(), 'PRO', 'quarterly', 3999, 11.1, ARRAY['Advanced predictions', 'WhatsApp alerts', 'Batch tracking', 'IoT integration', 'District benchmarks'], TRUE),
  (uuid_generate_v4(), 'PRO', 'annual', 13999, 22.2, ARRAY['Advanced predictions', 'WhatsApp alerts', 'Batch tracking', 'IoT integration', 'District benchmarks'], TRUE)
ON CONFLICT DO NOTHING;

-- Seed feature entitlements
INSERT INTO plan_feature_entitlements (plan_id, feature_name, feature_limit, is_unlimited, description)
SELECT 
  pp.plan_id,
  unnest(ARRAY['max_batches', 'max_predictions', 'max_alerts', 'iot_devices', 'district_benchmarks']),
  CASE 
    WHEN pp.plan_name = 'FARM' THEN 5
    ELSE 50
  END,
  CASE 
    WHEN pp.plan_name = 'PRO' THEN TRUE
    ELSE FALSE
  END,
  CASE 
    WHEN unnest(ARRAY['max_batches', 'max_predictions', 'max_alerts', 'iot_devices', 'district_benchmarks']) = 'max_batches' THEN 'Maximum number of active batches'
    WHEN unnest(ARRAY['max_batches', 'max_predictions', 'max_alerts', 'iot_devices', 'district_benchmarks']) = 'max_predictions' THEN 'Maximum predictions per month'
    WHEN unnest(ARRAY['max_batches', 'max_predictions', 'max_alerts', 'iot_devices', 'district_benchmarks']) = 'max_alerts' THEN 'Maximum active alerts'
    WHEN unnest(ARRAY['max_batches', 'max_predictions', 'max_alerts', 'iot_devices', 'district_benchmarks']) = 'iot_devices' THEN 'Maximum IoT devices'
    ELSE 'Access to district-level benchmarks'
  END
FROM plan_price_points pp
WHERE pp.billing_cycle = 'monthly'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- END OF COMBINED MIGRATIONS
-- Total migrations combined: 55
-- ═══════════════════════════════════════════════════════════════════════════════
