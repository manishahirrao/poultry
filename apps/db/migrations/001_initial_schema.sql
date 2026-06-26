-- PoultryPulse AI - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates all core tables for PoultryPulse AI platform
-- Requirements: TRD §2 (L2 Supabase), Architecture §2, PRD v3.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enum types for consistent data
CREATE TYPE customer_segment AS ENUM ('S1', 'S2', 'S3', 'S4', 'S5', 'S6');
CREATE TYPE mandi_slug AS ENUM ('gorakhpur', 'deoria', 'basti', 'kushinagar', 'maharajganj');
CREATE TYPE alert_type AS ENUM ('HPAI_OUTBREAK', 'WEATHER_EXTREME', 'PRICE_CRASH', 'PRICE_SPIKE', 'FEED_COST_ALERT');
CREATE TYPE alert_severity AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE subscription_tier AS ENUM ('PULSE_FARM', 'PULSE_PRO', 'PULSE_INTEL');
CREATE TYPE subscription_status AS ENUM ('active', 'trial', 'expired');

-- Customers table
-- Stores farmer/integrator customer profiles with DPDP-compliant phone hashing
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of phone number (DPDP compliant)
    segment customer_segment NOT NULL,
    mandi mandi_slug NOT NULL,
    bird_count INTEGER NOT NULL CHECK (bird_count >= 10000), -- Minimum 10K birds per PRD
    subscription JSONB NOT NULL,
    device_fingerprint_hash TEXT,
    farm_location geography(Point, 4326), -- PostGIS for geo queries
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_given_at TIMESTAMPTZ,
    consent_text_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for customers
CREATE INDEX idx_customers_phone_hash ON customers(phone_hash);
CREATE INDEX idx_customers_district ON customers(mandi);
CREATE INDEX idx_customers_segment ON customers(segment);
CREATE INDEX idx_customers_farm_location ON customers USING GIST(farm_location);

-- Predictions table
-- Stores ML model predictions (shared, no customer-specific data)
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mandi mandi_slug NOT NULL,
    predicted_for DATE NOT NULL,
    p10 NUMERIC NOT NULL CHECK (p10 >= 80 AND p10 <= 250),
    p50 NUMERIC NOT NULL CHECK (p50 >= 80 AND p50 <= 250),
    p90 NUMERIC NOT NULL CHECK (p90 >= 80 AND p90 <= 250),
    drivers JSONB NOT NULL,
    confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    model_version TEXT NOT NULL,
    staleness_flag BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint: p10 <= p50 <= p90
    CONSTRAINT prediction_range_order CHECK (p10 <= p50 AND p50 <= p90)
);

-- Indexes for predictions
CREATE INDEX idx_predictions_district_date ON predictions(mandi, predicted_for);
CREATE INDEX idx_predictions_model_version ON predictions(model_version);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);

-- Accuracy log table
-- Stores prediction accuracy metrics (admin only)
CREATE TABLE accuracy_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    actual_price NUMERIC NOT NULL CHECK (actual_price >= 80 AND actual_price <= 250),
    mape_1d NUMERIC NOT NULL,
    directional_correct BOOLEAN NOT NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for accuracy_log
CREATE INDEX idx_accuracy_prediction_id ON accuracy_log(prediction_id);
CREATE INDEX idx_accuracy_evaluated_at ON accuracy_log(evaluated_at);

-- Alerts table
-- Stores disease, weather, and price alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type alert_type NOT NULL,
    severity alert_severity NOT NULL,
    title_hi TEXT NOT NULL,
    body_hi TEXT NOT NULL,
    district TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    source_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Indexes for alerts
CREATE INDEX idx_alerts_district ON alerts(district);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_issued_at ON alerts(issued_at);
CREATE INDEX idx_alerts_is_active ON alerts(is_active);

-- Batches table
-- Stores customer batch records for profit calculator
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    batch_id TEXT NOT NULL,
    bird_count INTEGER NOT NULL CHECK (bird_count > 0),
    grow_start DATE NOT NULL,
    expected_harvest_start DATE,
    expected_harvest_end DATE,
    feed_cost_total NUMERIC NOT NULL CHECK (feed_cost_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT customer_batch_unique UNIQUE (customer_id, batch_id)
);

-- Indexes for batches
CREATE INDEX idx_batches_customer_id ON batches(customer_id);
CREATE INDEX idx_batches_grow_start ON batches(grow_start);

-- Model registry table
-- Tracks ML model versions and champion/challenger status
CREATE TABLE model_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version TEXT NOT NULL UNIQUE,
    mape_30d NUMERIC NOT NULL,
    directional_accuracy NUMERIC NOT NULL CHECK (directional_accuracy >= 0 AND directional_accuracy <= 1),
    conformal_coverage NUMERIC NOT NULL CHECK (conformal_coverage >= 0 AND conformal_coverage <= 1),
    promoted_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    is_champion BOOLEAN NOT NULL DEFAULT false,
    s3_artifact_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for model_registry
CREATE INDEX idx_model_registry_is_champion ON model_registry(is_champion) WHERE is_champion = true;
CREATE INDEX idx_model_registry_promoted_at ON model_registry(promoted_at);
CREATE INDEX idx_model_registry_version ON model_registry(version);

-- Partial unique index: only one champion at any time
CREATE UNIQUE INDEX idx_model_registry_single_champion ON model_registry(is_champion) WHERE is_champion = true;

-- Scraper config table
-- Stores web scraper configuration and CSS selectors
CREATE TABLE scraper_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name TEXT NOT NULL UNIQUE,
    base_url TEXT NOT NULL,
    css_selector JSONB NOT NULL,
    rate_limit_per_hour INTEGER NOT NULL DEFAULT 10,
    last_successful_fetch TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for scraper_config
CREATE INDEX idx_scraper_config_source_name ON scraper_config(source_name);
CREATE INDEX idx_scraper_config_is_active ON scraper_config(is_active);

-- Anomaly log table
-- Logs data quality anomalies for investigation
CREATE TABLE anomaly_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    anomaly_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    data JSONB,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT
);

-- Indexes for anomaly_log
CREATE INDEX idx_anomaly_log_source ON anomaly_log(source);
CREATE INDEX idx_anomaly_log_detected_at ON anomaly_log(detected_at);
CREATE INDEX idx_anomaly_log_resolved_at ON anomaly_log(resolved_at) WHERE resolved_at IS NOT NULL;

-- NECC weekly table
-- Stores weekly NECC production statistics
CREATE TABLE necc_weekly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    zone TEXT NOT NULL,
    egg_price_weekly NUMERIC,
    national_egg_production_index NUMERIC,
    broiler_production_index NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT necc_weekly_unique UNIQUE (week_start, zone)
);

-- Indexes for necc_weekly
CREATE INDEX idx_necc_weekly_week_start ON necc_weekly(week_start);
CREATE INDEX idx_necc_weekly_zone ON necc_weekly(zone);

-- Macro data table
-- Stores macroeconomic and agricultural data from FAO, USDA, etc.
CREATE TABLE macro_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    data_type TEXT NOT NULL,
    country TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER,
    value NUMERIC NOT NULL,
    unit TEXT,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT macro_data_unique UNIQUE (source, data_type, country, year, month)
);

-- Indexes for macro_data
CREATE INDEX idx_macro_data_source ON macro_data(source);
CREATE INDEX idx_macro_data_data_type ON macro_data(data_type);
CREATE INDEX idx_macro_data_country_year ON macro_data(country, year);

-- Row Level Security (RLS) Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- Customers RLS: Users can only read/write their own row
CREATE POLICY "Users can view own customer data" 
ON customers FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own customer data" 
ON customers FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own customer data" 
ON customers FOR UPDATE 
USING (auth.uid() = id);

-- Predictions RLS: All authenticated users can read predictions
CREATE POLICY "Authenticated users can view predictions" 
ON predictions FOR SELECT 
USING (auth.role() = 'authenticated');

-- Accuracy log RLS: Admin only write, authenticated read
CREATE POLICY "Authenticated users can view accuracy log" 
ON accuracy_log FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can insert accuracy log" 
ON accuracy_log FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Batches RLS: Users can only read/write their own batches
CREATE POLICY "Users can view own batches" 
ON batches FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert own batches" 
ON batches FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own batches" 
ON batches FOR UPDATE 
USING (auth.uid() = customer_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables with updated_at column
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraper_config_updated_at BEFORE UPDATE ON scraper_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
