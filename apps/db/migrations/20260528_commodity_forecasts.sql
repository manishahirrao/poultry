-- PoultryPulse AI - Commodity Forecasting System
-- Migration: 20260528_commodity_forecasts.sql
-- Description: Commodity price forecasting table for maize, soya, and palm oil
-- Requirements: REQ-006 §6.5, Architecture §3, TASK-017

-- Drop existing table if it exists (for migration reruns)
DROP TABLE IF EXISTS commodity_forecasts CASCADE;

-- Create commodity_forecasts table
CREATE TABLE commodity_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity TEXT NOT NULL CHECK (commodity IN ('maize', 'soya', 'palm_oil')),
    forecast_date DATE NOT NULL,
    predicted_price NUMERIC NOT NULL,
    confidence_low NUMERIC NOT NULL,  -- P10 equivalent
    confidence_high NUMERIC NOT NULL, -- P90 equivalent
    model_version TEXT NOT NULL DEFAULT 'arima_0_1_1_v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique commodity + forecast_date combinations
    CONSTRAINT unique_commodity_forecast UNIQUE (commodity, forecast_date)
);

-- Create indexes for efficient queries
CREATE INDEX idx_commodity_forecasts_commodity ON commodity_forecasts(commodity);
CREATE INDEX idx_commodity_forecasts_forecast_date ON commodity_forecasts(forecast_date);
CREATE INDEX idx_commodity_forecasts_created_at ON commodity_forecasts(created_at DESC);

-- Create a composite index for common query patterns
CREATE INDEX idx_commodity_forecasts_commodity_date ON commodity_forecasts(commodity, forecast_date DESC);

-- Add RLS policies
ALTER TABLE commodity_forecasts ENABLE ROW LEVEL SECURITY;

-- Public read access (commodity data is not customer-specific)
CREATE POLICY "Allow public read access" ON commodity_forecasts
    FOR SELECT USING (true);

-- Only service role can insert/update forecasts
CREATE POLICY "Allow service role insert" ON commodity_forecasts
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role update" ON commodity_forecasts
    FOR UPDATE USING (auth.role() = 'service_role');

-- Create a function to refresh commodity forecasts (called by Airflow DAG)
CREATE OR REPLACE FUNCTION refresh_commodity_forecasts()
RETURNS VOID AS $$
BEGIN
    -- This function is a placeholder for the actual refresh logic
    -- The actual refresh will be handled by the Python ARIMA model
    -- which writes directly to this table
    
    -- Log the refresh operation
    INSERT INTO accuracy_log (metric_name, metric_value, context, created_at)
    VALUES ('commodity_forecast_refresh', 1, 'commodity_forecasts_table_refresh', NOW())
    ON CONFLICT (metric_name, context) DO UPDATE SET
        metric_value = accuracy_log.metric_value + 1,
        created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comment to document the table
COMMENT ON TABLE commodity_forecasts IS 'Stores ARIMA-based commodity price forecasts for maize, soya meal, and palm oil. Used by Feed Cost Intelligence dashboard (REQ-006 §6.5). MAPE target: <12%.';

COMMENT ON COLUMN commodity_forecasts.commodity IS 'Commodity type: maize, soya, or palm_oil';
COMMENT ON COLUMN commodity_forecasts.forecast_date IS 'Date for which the price is forecasted';
COMMENT ON COLUMN commodity_forecasts.predicted_price IS 'P50 (median) forecasted price in INR per quintal';
COMMENT ON COLUMN commodity_forecasts.confidence_low IS 'P10 (lower bound) of forecast confidence interval';
COMMENT ON COLUMN commodity_forecasts.confidence_high IS 'P90 (upper bound) of forecast confidence interval';
COMMENT ON COLUMN commodity_forecasts.model_version IS 'Version identifier for the ARIMA model used for this forecast';
