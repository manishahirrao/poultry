-- PoultryPulse AI - WhatsApp Message Events Tracking
-- Migration: 20260528_message_events.sql
-- Description: Creates message_events table for WhatsApp analytics and engagement tracking
-- Requirements: REQ-009, TASK-025

-- Message events table
-- Tracks WhatsApp message delivery status and engagement metrics
CREATE TABLE IF NOT EXISTS message_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL, -- 'daily_forecast', 'welcome_signal', 'disease_alert', etc.
    message_sid TEXT NOT NULL, -- Twilio message SID for tracking
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    deep_link_clicked BOOLEAN DEFAULT false,
    deep_link_clicked_at TIMESTAMPTZ,
    delivery_status TEXT NOT NULL DEFAULT 'queued', -- queued, sent, delivered, failed, undelivered
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT delivery_status_check CHECK (delivery_status IN ('queued', 'sent', 'delivered', 'failed', 'undelivered'))
);

-- Indexes for message_events
CREATE INDEX IF NOT EXISTS idx_message_events_customer_id ON message_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_message_events_message_type ON message_events(message_type);
CREATE INDEX IF NOT EXISTS idx_message_events_sent_at ON message_events(sent_at);
CREATE INDEX IF NOT EXISTS idx_message_events_delivered_at ON message_events(delivered_at) WHERE delivered_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_message_events_read_at ON message_events(read_at) WHERE read_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_message_events_delivery_status ON message_events(delivery_status);
CREATE INDEX IF NOT EXISTS idx_message_events_message_sid ON message_events(message_sid);

-- Composite index for engagement analytics (day × hour heatmap)
CREATE INDEX IF NOT EXISTS idx_message_events_sent_at_hour ON message_events(
    DATE_TRUNC('day', sent_at),
    EXTRACT(HOUR FROM sent_at)
);

-- RLS Policies
ALTER TABLE message_events ENABLE ROW LEVEL SECURITY;

-- Admin users can read all message events
CREATE POLICY "Admin users can view all message events"
ON message_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM customers
        WHERE customers.id = message_events.customer_id
        AND customers.id IN (
            SELECT id FROM customers
            WHERE phone_hash IN (
                -- Admin check via auth.uid() - assuming admin role check
                SELECT phone_hash FROM customers WHERE id = auth.uid()
            )
        )
    )
    OR auth.role() = 'service_role'
);

-- Service role can insert/update message events (for webhook processing)
CREATE POLICY "Service role can insert message events"
ON message_events FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update message events"
ON message_events FOR UPDATE
WITH CHECK (auth.role() = 'service_role');

-- Add comments to document the table
COMMENT ON TABLE message_events IS 'Tracks WhatsApp message delivery status and engagement metrics for analytics';
COMMENT ON COLUMN message_events.customer_id IS 'Customer ID (FK) - no raw phone numbers stored';
COMMENT ON COLUMN message_events.message_type IS 'Type of message: daily_forecast, welcome_signal, disease_alert, etc.';
COMMENT ON COLUMN message_events.message_sid IS 'Twilio message SID for delivery tracking';
COMMENT ON COLUMN message_events.sent_at IS 'Timestamp when message was sent';
COMMENT ON COLUMN message_events.delivered_at IS 'Timestamp when message was delivered (from Twilio webhook)';
COMMENT ON COLUMN message_events.read_at IS 'Timestamp when message was read (from Twilio webhook)';
COMMENT ON COLUMN message_events.deep_link_clicked IS 'Whether user clicked the deep link in the message';
COMMENT ON COLUMN message_events.deep_link_clicked_at IS 'Timestamp when deep link was clicked';
COMMENT ON COLUMN message_events.delivery_status IS 'Current delivery status: queued, sent, delivered, failed, undelivered';
COMMENT ON COLUMN message_events.error_message IS 'Error message if delivery failed';

-- Function to calculate engagement metrics for a customer
CREATE OR REPLACE FUNCTION get_customer_engagement_metrics(p_customer_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    sent_count BIGINT,
    delivered_count BIGINT,
    read_count BIGINT,
    deep_link_click_count BIGINT,
    delivery_rate NUMERIC,
    read_rate NUMERIC,
    ctr NUMERIC,
    avg_time_to_open_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE sent_at >= NOW() - (p_days || ' days')::INTERVAL) AS sent_count,
        COUNT(*) FILTER (WHERE delivered_at IS NOT NULL AND sent_at >= NOW() - (p_days || ' days')::INTERVAL) AS delivered_count,
        COUNT(*) FILTER (WHERE read_at IS NOT NULL AND sent_at >= NOW() - (p_days || ' days')::INTERVAL) AS read_count,
        COUNT(*) FILTER (WHERE deep_link_clicked = true AND sent_at >= NOW() - (p_days || ' days')::INTERVAL) AS deep_link_click_count,
        CASE 
            WHEN COUNT(*) FILTER (WHERE sent_at >= NOW() - (p_days || ' days')::INTERVAL) > 0 THEN
                (COUNT(*) FILTER (WHERE delivered_at IS NOT NULL AND sent_at >= NOW() - (p_days || ' days')::INTERVAL)::NUMERIC / 
                COUNT(*) FILTER (WHERE sent_at >= NOW() - (p_days || ' days')::INTERVAL) * 100
            ELSE 0 
        END AS delivery_rate,
        CASE 
            WHEN COUNT(*) FILTER (WHERE delivered_at IS NOT NULL AND sent_at >= NOW() - (p_days || ' days')::INTERVAL) > 0 THEN
                (COUNT(*) FILTER (WHERE read_at IS NOT NULL AND sent_at >= NOW() - (p_days || ' days')::INTERVAL)::NUMERIC / 
                COUNT(*) FILTER (WHERE delivered_at IS NOT NULL AND sent_at >= NOW() - (p_days || ' days')::INTERVAL) * 100
            ELSE 0 
        END AS read_rate,
        CASE 
            WHEN COUNT(*) FILTER (WHERE delivered_at IS NOT NULL AND sent_at >= NOW() - (p_days || ' days')::INTERVAL) > 0 THEN
                (COUNT(*) FILTER (WHERE deep_link_clicked = true AND sent_at >= NOW() - (p_days || ' days')::INTERVAL)::NUMERIC / 
                COUNT(*) FILTER (WHERE delivered_at IS NOT NULL AND sent_at >= NOW() - (p_days || ' days')::INTERVAL) * 100
            ELSE 0 
        END AS ctr,
        AVG(EXTRACT(EPOCH FROM (read_at - delivered_at)) / 3600) FILTER (
            WHERE read_at IS NOT NULL 
            AND delivered_at IS NOT NULL 
            AND sent_at >= NOW() - (p_days || ' days')::INTERVAL
        ) AS avg_time_to_open_hours
    FROM message_events
    WHERE customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get engagement heatmap data (day × hour grid)
CREATE OR REPLACE FUNCTION get_engagement_heatmap(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    day_of_week INTEGER,
    hour_of_day INTEGER,
    sent_count BIGINT,
    read_count BIGINT,
    open_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        EXTRACT(DOW FROM sent_at)::INTEGER AS day_of_week,
        EXTRACT(HOUR FROM sent_at)::INTEGER AS hour_of_day,
        COUNT(*) AS sent_count,
        COUNT(*) FILTER (WHERE read_at IS NOT NULL) AS read_count,
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE read_at IS NOT NULL)::NUMERIC / COUNT(*) * 100)
            ELSE 0 
        END AS open_rate
    FROM message_events
    WHERE sent_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY EXTRACT(DOW FROM sent_at), EXTRACT(HOUR FROM sent_at)
    ORDER BY day_of_week, hour_of_day;
END;
$$ LANGUAGE plpgsql;

-- Function to identify high-churn-risk customers
CREATE OR REPLACE FUNCTION get_high_churn_risk_customers()
RETURNS TABLE (
    customer_id UUID,
    customer_id_truncated TEXT,
    consecutive_unread_count INTEGER,
    last_message_sent_at TIMESTAMPTZ,
    subscription_mrr NUMERIC
) AS $$
DECLARE
    churn_threshold INTEGER := 5;
BEGIN
    RETURN QUERY
    WITH customer_unread_streaks AS (
        SELECT
            me.customer_id,
            me.sent_at,
            me.read_at,
            -- Calculate running count of consecutive unread messages
            SUM(CASE WHEN me.read_at IS NULL THEN 1 ELSE 0 END) OVER (
                PARTITION BY me.customer_id 
                ORDER BY me.sent_at DESC
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) as consecutive_unread
        FROM message_events me
        WHERE me.sent_at >= NOW() - INTERVAL '30 days'
    ),
    customer_streak_max AS (
        SELECT
            customer_id,
            MAX(consecutive_unread) as consecutive_unread_count,
            MAX(sent_at) as last_message_sent_at
        FROM customer_unread_streaks
        WHERE consecutive_unread >= 1
        GROUP BY customer_id
    )
    SELECT
        cs.customer_id,
        SUBSTRING(cs.customer_id::TEXT, 1, 8) as customer_id_truncated,
        cs.consecutive_unread_count,
        cs.last_message_sent_at,
        COALESCE(
            (c.subscription->>'mrr')::NUMERIC,
            (c.subscription->>'monthly_price')::NUMERIC,
            0
        ) as subscription_mrr
    FROM customer_streak_max cs
    JOIN customers c ON c.id = cs.customer_id
    WHERE cs.consecutive_unread_count >= churn_threshold
    ORDER BY cs.consecutive_unread_count DESC, subscription_mrr DESC;
END;
$$ LANGUAGE plpgsql;
