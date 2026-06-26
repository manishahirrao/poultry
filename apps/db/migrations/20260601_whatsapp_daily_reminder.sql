-- PoultryPulse AI - WhatsApp Daily Reminder Schema
-- Migration: 20260601_whatsapp_daily_reminder.sql
-- Description: Adds WhatsApp reminder fields to farms table and creates whatsapp_reminders log table
-- Requirements: REQ-WA-002 (Daily Reminder Scheduling), T-WA-003 (Daily Reminder Cron Job)
-- Dependencies: 20260523_farm_management.sql (farms table must exist)

-- ────────────────────────────────────────────────────────────
-- Add WhatsApp reminder fields to farms table
-- ────────────────────────────────────────────────────────────
ALTER TABLE farms
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_reminder_hour INTEGER CHECK (whatsapp_reminder_hour BETWEEN 5 AND 22),
  ADD COLUMN IF NOT EXISTS whatsapp_language TEXT DEFAULT 'hindi' CHECK (whatsapp_language IN ('hindi', 'english')),
  ADD COLUMN IF NOT EXISTS whatsapp_reminders_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_reminders_paused BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_batch_id UUID REFERENCES batches(id) ON DELETE SET NULL;

-- Indexes for WhatsApp reminder queries
CREATE INDEX IF NOT EXISTS idx_farms_whatsapp_reminder ON farms(whatsapp_reminders_enabled, whatsapp_reminders_paused, whatsapp_reminder_hour)
  WHERE whatsapp_reminders_enabled = true AND whatsapp_reminders_paused = false;

CREATE INDEX IF NOT EXISTS idx_farms_whatsapp_number ON farms(whatsapp_number)
  WHERE whatsapp_number IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- whatsapp_reminders: log all sent reminders
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message_type TEXT NOT NULL DEFAULT 'daily_reminder' CHECK (message_type IN ('daily_reminder', 'follow_up', 'test')),
  day_number INTEGER,
  message_content TEXT,
  phone_number TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'queued' CHECK (delivery_status IN ('queued', 'sent', 'delivered', 'failed')),
  twilio_message_sid TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for whatsapp_reminders
CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_farm ON whatsapp_reminders(farm_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_batch ON whatsapp_reminders(batch_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_sent_at ON whatsapp_reminders(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_reminders_status ON whatsapp_reminders(delivery_status);

-- RLS: integrator can only see reminders for their own farms
ALTER TABLE whatsapp_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY whatsapp_reminders_owner ON whatsapp_reminders
  USING (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));
CREATE POLICY whatsapp_reminders_insert ON whatsapp_reminders
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- Function to calculate batch day number from placement date
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_batch_day(placement_date DATE, target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN target_date - placement_date;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- Function to check if today's log already exists for a farm
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_today_log_exists(farm_id UUID, log_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN AS $$
DECLARE
  log_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM daily_logs
    WHERE farm_id = farm_id AND log_date = log_date
  ) INTO log_exists;
  
  RETURN log_exists;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- Function to get farms needing reminder for a specific hour
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_farms_needing_reminder(target_hour INTEGER, log_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  farm_id UUID,
  farm_name TEXT,
  whatsapp_number TEXT,
  whatsapp_language TEXT,
  batch_id UUID,
  batch_day INTEGER,
  placement_date DATE,
  batch_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.whatsapp_number,
    f.whatsapp_language,
    b.id,
    calculate_batch_day(b.placement_date, log_date),
    b.placement_date,
    b.status
  FROM farms f
  LEFT JOIN batches b ON b.id = f.current_batch_id
  WHERE f.whatsapp_reminders_enabled = true
    AND f.whatsapp_reminders_paused = false
    AND f.whatsapp_reminder_hour = target_hour
    AND f.whatsapp_number IS NOT NULL
    AND f.current_batch_id IS NOT NULL
    AND b.status = 'active'
    AND NOT check_today_log_exists(f.id, log_date);
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- Grant permissions (if needed for service role)
-- ────────────────────────────────────────────────────────────
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
