-- FlockIQ - WhatsApp Daily Log Automation Enhancements
-- Migration: 20260610_whatsapp_daily_log_enhancements.sql
-- Description: Adds missing WhatsApp fields for daily log automation per T-INFRA-001
-- Requirements: REQ-WA-003 (Reply Parsing), REQ-WA-004 (Data Validation & Storage)
-- Dependencies: 20260601_whatsapp_daily_reminder.sql (whatsapp_reminders table must exist)
--              20260523_farm_management.sql (farms and daily_logs tables must exist)

-- ────────────────────────────────────────────────────────────
-- Add missing WhatsApp field to farms table
-- ────────────────────────────────────────────────────────────
ALTER TABLE farms
  ADD COLUMN IF NOT EXISTS whatsapp_connected_at TIMESTAMPTZ;

-- ────────────────────────────────────────────────────────────
-- Add source tracking to daily_logs table
-- ────────────────────────────────────────────────────────────
ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'whatsapp')),
  ADD COLUMN IF NOT EXISTS raw_whatsapp_message TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_message_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS review_needed BOOLEAN DEFAULT FALSE;

-- Index for WhatsApp message lookups
CREATE INDEX IF NOT EXISTS idx_daily_logs_whatsapp_message_id
  ON daily_logs(whatsapp_message_id)
  WHERE whatsapp_message_id IS NOT NULL;

-- Index for review-needed logs (for integration manager dashboard)
CREATE INDEX IF NOT EXISTS idx_daily_logs_review_needed
  ON daily_logs(review_needed, log_date DESC)
  WHERE review_needed = TRUE;

-- ────────────────────────────────────────────────────────────
-- WhatsApp pending confirmations table (for ambiguous replies)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_pending_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  pending_data JSONB NOT NULL,  -- parsed values awaiting confirmation
  original_message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,  -- 10 minutes from creation
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for expiring confirmations (cleanup job)
CREATE INDEX IF NOT EXISTS idx_whatsapp_pending_confirmations_expires_at
  ON whatsapp_pending_confirmations(expires_at)
  WHERE confirmed = FALSE;

-- Index for farm-specific pending confirmations
CREATE INDEX IF NOT EXISTS idx_whatsapp_pending_confirmations_farm
  ON whatsapp_pending_confirmations(farm_id, created_at DESC);

-- ────────────────────────────────────────────────────────────
-- RLS policies for whatsapp_pending_confirmations
-- ────────────────────────────────────────────────────────────
ALTER TABLE whatsapp_pending_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrators_own_pending_confirmations" ON whatsapp_pending_confirmations
  FOR ALL USING (
    farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────
-- Function to cleanup expired pending confirmations
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cleanup_expired_pending_confirmations()
RETURNS VOID AS $$
BEGIN
  DELETE FROM whatsapp_pending_confirmations
  WHERE confirmed = FALSE AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- Function to check if phone number is already connected to another farm
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_whatsapp_number_available(phone_number TEXT, exclude_farm_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM farms
  WHERE whatsapp_number = phone_number
    AND (exclude_farm_id IS NULL OR id != exclude_farm_id);
  
  RETURN count = 0;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- Update existing whatsapp_reminders table to match T-INFRA-001 spec
-- (Add replied_at and reply_text fields if they don't exist)
-- ────────────────────────────────────────────────────────────
ALTER TABLE whatsapp_reminders
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reply_text TEXT;

-- ────────────────────────────────────────────────────────────
-- Grant permissions (if needed for service role)
-- ────────────────────────────────────────────────────────────
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
