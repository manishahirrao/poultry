-- PoultryPulse AI - Watermarking & Sessions Migration
-- File: apps/db/migrations/009_watermarking_sessions.sql
-- Reference: TRD v1.0 §6.1, §6.2

BEGIN;

-- 1. Create sessions table for device fingerprinting
CREATE TABLE IF NOT EXISTS customer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    device_fingerprint_hash TEXT NOT NULL,
    fpjs_visitor_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, device_fingerprint_hash)
);

CREATE INDEX idx_customer_sessions_fp ON customer_sessions(device_fingerprint_hash);

-- 2. Create watermark generation log
CREATE TABLE IF NOT EXISTS watermark_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_id UUID REFERENCES customer_sessions(id) ON DELETE SET NULL,
    prediction_date DATE NOT NULL,
    mandi TEXT NOT NULL,
    perturbation_factor NUMERIC(8,6) NOT NULL,
    zwc_payload_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_watermark_logs_date ON watermark_logs(prediction_date);
CREATE INDEX idx_watermark_logs_customer ON watermark_logs(customer_id);

-- 3. Create watermark violations table
CREATE TABLE IF NOT EXISTS watermark_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT,
    screenshot_url TEXT,
    extracted_customer_id UUID REFERENCES customers(id),
    extracted_timestamp TIMESTAMP WITH TIME ZONE,
    extracted_device_fp TEXT,
    confidence_score NUMERIC(4,2),
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'confirmed', 'false_positive')),
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create OTP requests table
CREATE TABLE IF NOT EXISTS otp_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_hash TEXT UNIQUE NOT NULL,
    otp_hash TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_requests_phone ON otp_requests(phone_hash);

COMMIT;
