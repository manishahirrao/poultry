-- PoultryPulse AI - Free Disease Alert System
-- Migration: 007_free_disease_alerts.sql
-- Description: Creates free tier for disease alerts for non-subscribers
-- Marketing Initiative #4: Free Disease Alert Early Access System

-- Free alert subscribers table
-- Stores non-subscribers who want free disease alerts only
CREATE TABLE free_alert_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of phone number (DPDP compliant)
    phone TEXT NOT NULL, -- For WhatsApp delivery (not stored long-term, used for broadcast)
    district TEXT NOT NULL,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    unsubscribed_at TIMESTAMPTZ,
    converted_to_paid BOOLEAN NOT NULL DEFAULT false,
    converted_at TIMESTAMPTZ,
    referral_code TEXT, -- If they came from referral
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for free_alert_subscribers
CREATE INDEX idx_free_alert_subscribers_phone_hash ON free_alert_subscribers(phone_hash);
CREATE INDEX idx_free_alert_subscribers_district ON free_alert_subscribers(district);
CREATE INDEX idx_free_alert_subscribers_is_active ON free_alert_subscribers(is_active) WHERE is_active = true;
CREATE INDEX idx_free_alert_subscribers_referral_code ON free_alert_subscribers(referral_code);

-- Alert delivery log table
-- Tracks disease alerts sent to free subscribers
CREATE TABLE alert_delivery_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    subscriber_id UUID NOT NULL REFERENCES free_alert_subscribers(id) ON DELETE CASCADE,
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivery_status TEXT NOT NULL, -- sent, failed, pending
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT delivery_status_check CHECK (delivery_status IN ('sent', 'failed', 'pending'))
);

-- Indexes for alert_delivery_log
CREATE INDEX idx_alert_delivery_log_alert_id ON alert_delivery_log(alert_id);
CREATE INDEX idx_alert_delivery_log_subscriber_id ON alert_delivery_log(subscriber_id);
CREATE INDEX idx_alert_delivery_log_delivered_at ON alert_delivery_log(delivered_at);
CREATE INDEX idx_alert_delivery_log_status ON alert_delivery_log(delivery_status);

-- RLS Policies
ALTER TABLE free_alert_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_delivery_log ENABLE ROW LEVEL SECURITY;

-- Free alert subscribers RLS: Service role can manage, authenticated can view own
CREATE POLICY "Service role can insert free alert subscribers" 
ON free_alert_subscribers FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update free alert subscribers" 
ON free_alert_subscribers FOR UPDATE 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete free alert subscribers" 
ON free_alert_subscribers FOR DELETE 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view own free alert subscription" 
ON free_alert_subscribers FOR SELECT 
USING (auth.role() = 'authenticated');

-- Alert delivery log RLS: Service role only
CREATE POLICY "Service role can manage alert delivery log" 
ON alert_delivery_log FOR ALL 
WITH CHECK (auth.role() = 'service_role');

-- Function to check if phone is already a paid customer
CREATE OR REPLACE FUNCTION is_paid_customer(phone_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM customers 
        WHERE phone_hash = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent duplicate signups
CREATE OR REPLACE FUNCTION prevent_duplicate_free_alert_signup()
RETURNS TRIGGER AS $$
BEGIN
    IF is_paid_customer(NEW.phone_hash) THEN
        RAISE EXCEPTION 'This phone is already a paid customer';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_duplicate_free_alert_signup
BEFORE INSERT ON free_alert_subscribers
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_free_alert_signup();
