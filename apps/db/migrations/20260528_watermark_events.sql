-- PoultryPulse AI - Watermark Audit Console
-- Migration: 20260528_watermark_events.sql
-- Description: Creates watermark_events table for leak detection and audit trail
-- Requirements: REQ-010, TASK-026

-- Watermark events table
-- Tracks watermark leak detection events and audit trail
CREATE TABLE IF NOT EXISTS watermark_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    district TEXT NOT NULL,
    detection_platform TEXT NOT NULL, -- 'whatsapp', 'telegram', 'screenshot', 'other'
    detection_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    watermark_token TEXT NOT NULL,
    decoded_customer_id UUID, -- Successfully decoded customer_id from watermark
    decode_success BOOLEAN NOT NULL DEFAULT false,
    screenshot_url TEXT, -- URL to processed screenshot (if applicable)
    current_state TEXT NOT NULL DEFAULT 'detected', -- detected, warning_sent, account_reviewed, resolved
    action_taken_by TEXT, -- Admin user ID who took action
    action_taken_at TIMESTAMPTZ,
    action_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT current_state_check CHECK (current_state IN ('detected', 'warning_sent', 'account_reviewed', 'resolved'))
);

-- Indexes for watermark_events
CREATE INDEX IF NOT EXISTS idx_watermark_events_customer_id ON watermark_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_watermark_events_detection_timestamp ON watermark_events(detection_timestamp);
CREATE INDEX IF NOT EXISTS idx_watermark_events_current_state ON watermark_events(current_state);
CREATE INDEX IF NOT EXISTS idx_watermark_events_prediction_date ON watermark_events(prediction_date);
CREATE INDEX IF NOT EXISTS idx_watermark_events_decode_success ON watermark_events(decode_success);

-- Composite index for coverage monitoring
CREATE INDEX IF NOT EXISTS idx_watermark_events_coverage ON watermark_events(
    prediction_date,
    decode_success
);

-- RLS Policies
ALTER TABLE watermark_events ENABLE ROW LEVEL SECURITY;

-- Admin users can read all watermark events
CREATE POLICY "Admin users can view all watermark events"
ON watermark_events FOR SELECT
USING (auth.role() = 'service_role');

-- Service role can insert watermark events (for DAG processing)
CREATE POLICY "Service role can insert watermark events"
ON watermark_events FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Service role can insert action records (state transitions)
CREATE POLICY "Service role can insert action records"
ON watermark_events FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Add comments to document the table
COMMENT ON TABLE watermark_events IS 'Tracks watermark leak detection events and audit trail for IP protection';
COMMENT ON COLUMN watermark_events.customer_id IS 'Customer ID (FK) - linked to customers table';
COMMENT ON COLUMN watermark_events.prediction_date IS 'Date of the prediction that was leaked';
COMMENT ON COLUMN watermark_events.district IS 'District of the prediction';
COMMENT ON COLUMN watermark_events.detection_platform IS 'Platform where leak was detected: whatsapp, telegram, screenshot, other';
COMMENT ON COLUMN watermark_events.detection_timestamp IS 'Timestamp when leak was detected';
COMMENT ON COLUMN watermark_events.watermark_token IS 'Watermark token found in the leaked content';
COMMENT ON COLUMN watermark_events.decoded_customer_id IS 'Successfully decoded customer_id from watermark (if decode succeeded)';
COMMENT ON COLUMN watermark_events.decode_success IS 'Whether watermark decoding was successful';
COMMENT ON COLUMN watermark_events.screenshot_url IS 'URL to processed screenshot (if applicable)';
COMMENT ON COLUMN watermark_events.current_state IS 'Current state in workflow: detected, warning_sent, account_reviewed, resolved';
COMMENT ON COLUMN watermark_events.action_taken_by IS 'Admin user ID who took action';
COMMENT ON COLUMN watermark_events.action_taken_at IS 'Timestamp when action was taken';
COMMENT ON COLUMN watermark_events.action_notes IS 'Notes about the action taken';

-- Function to get watermark coverage for a given date
CREATE OR REPLACE FUNCTION get_watermark_coverage(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_predictions BIGINT,
    watermarked_predictions BIGINT,
    coverage_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_predictions,
        COUNT(*) FILTER (WHERE watermark_token IS NOT NULL AND watermark_token != '') as watermarked_predictions,
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE watermark_token IS NOT NULL AND watermark_token != '')::NUMERIC / COUNT(*) * 100)
            ELSE 0 
        END as coverage_percentage
    FROM customer_predictions_served
    WHERE served_at::DATE = p_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get decode success rate
CREATE OR REPLACE FUNCTION get_decode_success_rate(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_processed BIGINT,
    successful_decodes BIGINT,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_processed,
        COUNT(*) FILTER (WHERE decode_success = true) as successful_decodes,
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE decode_success = true)::NUMERIC / COUNT(*) * 100)
            ELSE 0 
        END as success_rate
    FROM watermark_events
    WHERE detection_timestamp >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new watermark event (initial detection)
CREATE OR REPLACE FUNCTION create_watermark_event(
    p_customer_id UUID,
    p_prediction_date DATE,
    p_district TEXT,
    p_detection_platform TEXT,
    p_watermark_token TEXT,
    p_screenshot_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO watermark_events (
        customer_id,
        prediction_date,
        district,
        detection_platform,
        watermark_token,
        screenshot_url,
        current_state
    ) VALUES (
        p_customer_id,
        p_prediction_date,
        p_district,
        p_detection_platform,
        p_watermark_token,
        p_screenshot_url,
        'detected'
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add action record to watermark event (state transition)
CREATE OR REPLACE FUNCTION add_watermark_action(
    p_original_event_id UUID,
    p_new_state TEXT,
    p_action_taken_by TEXT,
    p_action_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_original_event watermark_events%ROWTYPE;
    v_new_event_id UUID;
BEGIN
    -- Get original event
    SELECT * INTO v_original_event
    FROM watermark_events
    WHERE id = p_original_event_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Original watermark event not found';
    END IF;
    
    -- Create new event record with new state (immutable pattern)
    INSERT INTO watermark_events (
        customer_id,
        prediction_date,
        district,
        detection_platform,
        detection_timestamp,
        watermark_token,
        decoded_customer_id,
        decode_success,
        screenshot_url,
        current_state,
        action_taken_by,
        action_taken_at,
        action_notes
    ) VALUES (
        v_original_event.customer_id,
        v_original_event.prediction_date,
        v_original_event.district,
        v_original_event.detection_platform,
        v_original_event.detection_timestamp,
        v_original_event.watermark_token,
        v_original_event.decoded_customer_id,
        v_original_event.decode_success,
        v_original_event.screenshot_url,
        p_new_state,
        p_action_taken_by,
        NOW(),
        p_action_notes
    ) RETURNING id INTO v_new_event_id;
    
    RETURN v_new_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to suspend customer account
CREATE OR REPLACE FUNCTION suspend_customer_account(p_customer_id UUID, p_suspended_by TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE customers
    SET is_suspended = true,
        suspended_at = NOW(),
        suspended_by = p_suspended_by
    WHERE id = p_customer_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Add columns to customers table for suspension tracking if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'is_suspended'
    ) THEN
        ALTER TABLE customers ADD COLUMN is_suspended BOOLEAN DEFAULT false;
        ALTER TABLE customers ADD COLUMN suspended_at TIMESTAMPTZ;
        ALTER TABLE customers ADD COLUMN suspended_by TEXT;
        
        COMMENT ON COLUMN customers.is_suspended IS 'Whether customer account is suspended due to watermark violations';
        COMMENT ON COLUMN customers.suspended_at IS 'Timestamp when account was suspended';
        COMMENT ON COLUMN customers.suspended_by IS 'Admin user ID who suspended the account';
    END IF;
END $$;
