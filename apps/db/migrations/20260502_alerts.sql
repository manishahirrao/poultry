-- PoultryPulse AI - Alert System Enhancement
-- Migration: 20260502_alerts.sql
-- Description: Enhanced alert tables with customer preferences, acknowledgements, and Realtime support
-- Requirements: REQ-004 §4.6, Architecture §4.2, TASK-013

-- Drop existing alerts table if it exists (for migration reruns)
-- Note: This will recreate the alerts table with enhanced schema
DROP TABLE IF EXISTS alert_acknowledgements CASCADE;
DROP TABLE IF EXISTS customer_alert_preferences CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;

-- Drop existing enum types to recreate with enhanced values
DROP TYPE IF EXISTS alert_severity CASCADE;
DROP TYPE IF EXISTS alert_type CASCADE;

-- Create enhanced enum types
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_type AS ENUM ('disease', 'weather', 'price_crash', 'feed_cost', 'policy', 'hpai');

-- Create enhanced alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district TEXT NOT NULL,
    type alert_type NOT NULL,
    title_hindi TEXT NOT NULL,
    title_english TEXT NOT NULL,
    body_hindi TEXT NOT NULL,
    body_english TEXT NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'medium',
    estimated_impact_low NUMERIC,  -- Estimated financial impact (lower bound)
    estimated_impact_high NUMERIC, -- Estimated financial impact (upper bound)
    source TEXT NOT NULL,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Create indexes for efficient queries
CREATE INDEX idx_alerts_district ON alerts(district);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_expires_at ON alerts(expires_at) WHERE expires_at IS NOT NULL;

-- Create customer alert preferences table
CREATE TABLE customer_alert_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    hpai_distance_km INTEGER NOT NULL DEFAULT 100 CHECK (hpai_distance_km IN (50, 100, 150, 200)),
    temp_threshold_c NUMERIC NOT NULL DEFAULT 35 CHECK (temp_threshold_c >= 32 AND temp_threshold_c <= 42),
    price_drop_pct NUMERIC NOT NULL DEFAULT 5 CHECK (price_drop_pct >= 3 AND price_drop_pct <= 20),
    feed_cost_rise_pct NUMERIC NOT NULL DEFAULT 5 CHECK (feed_cost_rise_pct >= 3 AND feed_cost_rise_pct <= 15),
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Create index for customer preferences
CREATE INDEX idx_customer_alert_preferences_customer_id ON customer_alert_preferences(customer_id);

-- Create alert acknowledgements table
CREATE TABLE alert_acknowledgements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('acknowledged', 'acted', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for acknowledgements
CREATE INDEX idx_alert_acknowledgements_customer_id ON alert_acknowledgements(customer_id);
CREATE INDEX idx_alert_acknowledgements_alert_id ON alert_acknowledgements(alert_id);
CREATE INDEX idx_alert_acknowledgements_created_at ON alert_acknowledgements(created_at DESC);

-- Enable Row Level Security
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_acknowledgements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alerts (publicly readable)
CREATE POLICY "Alerts are publicly readable"
    ON alerts FOR SELECT
    USING (true);

-- RLS Policies for customer_alert_preferences (customer-specific)
CREATE POLICY "Customers can view own preferences"
    ON customer_alert_preferences FOR SELECT
    USING (customer_id = auth.uid());

CREATE POLICY "Customers can insert own preferences"
    ON customer_alert_preferences FOR INSERT
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own preferences"
    ON customer_alert_preferences FOR UPDATE
    USING (customer_id = auth.uid());

-- RLS Policies for alert_acknowledgements (customer-specific)
CREATE POLICY "Customers can view own acknowledgements"
    ON alert_acknowledgements FOR SELECT
    USING (customer_id = auth.uid());

CREATE POLICY "Customers can insert own acknowledgements"
    ON alert_acknowledgements FOR INSERT
    WITH CHECK (customer_id = auth.uid());

-- Enable Supabase Realtime on alerts table
ALTER TABLE alerts REPLICA IDENTITY FULL;

-- Create publication for Realtime
DROP PUBLICATION IF EXISTS alerts_realtime;
CREATE PUBLICATION alerts_realtime FOR TABLE alerts;

-- Create function to set default alert preferences for new customers
CREATE OR REPLACE FUNCTION create_default_alert_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO customer_alert_preferences (customer_id)
    VALUES (NEW.id)
    ON CONFLICT (customer_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create default preferences on customer signup
DROP TRIGGER IF EXISTS on_customer_created ON customers;
CREATE TRIGGER on_customer_created
    AFTER INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION create_default_alert_preferences();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customer_alert_preferences updated_at
DROP TRIGGER IF EXISTS update_customer_alert_preferences_updated_at ON customer_alert_preferences;
CREATE TRIGGER update_customer_alert_preferences_updated_at
    BEFORE UPDATE ON customer_alert_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON customer_alert_preferences TO authenticated;
GRANT SELECT, INSERT ON alert_acknowledgements TO authenticated;

-- Grant service role permissions for background jobs
GRANT ALL ON alerts TO service_role;
GRANT ALL ON customer_alert_preferences TO service_role;
GRANT ALL ON alert_acknowledgements TO service_role;

-- Add comments for documentation
COMMENT ON TABLE alerts IS 'Enhanced alert table with Hindi/English titles, severity levels, and financial impact estimates. Supports Realtime subscriptions.';
COMMENT ON TABLE customer_alert_preferences IS 'Customer-specific alert threshold preferences for HPAI distance, temperature, price drops, and feed cost rises.';
COMMENT ON TABLE alert_acknowledgements IS 'Tracks customer actions on alerts (acknowledged, acted, dismissed) for analytics and feed filtering.';
COMMENT ON COLUMN alerts.estimated_impact_low IS 'Lower bound of estimated financial impact in rupees for a standard 20,000-bird flock';
COMMENT ON COLUMN alerts.estimated_impact_high IS 'Upper bound of estimated financial impact in rupees for a standard 20,000-bird flock';
