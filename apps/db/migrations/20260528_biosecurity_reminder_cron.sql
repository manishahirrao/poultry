-- PoultryPulse AI - Biosecurity Audit Fortnightly Reminder
-- Migration: 20260528_biosecurity_reminder_cron.sql
-- Description: Creates CRON job for fortnightly biosecurity audit reminders
-- Requirements: REQ-015 §15.4, TASK-037
-- Task: TASK-037

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to check for customers who haven't submitted biosecurity audit in 14 days
CREATE OR REPLACE FUNCTION check_biosecurity_audit_reminders()
RETURNS VOID AS $$
DECLARE
  customer_record RECORD;
  batch_record RECORD;
  last_audit_date DATE;
  days_since_audit INTEGER;
  message_text TEXT;
BEGIN
  -- Iterate through all customers with active batches
  FOR customer_record IN 
    SELECT DISTINCT c.id, c.name, c.phone
    FROM customers c
    INNER JOIN batches b ON b.customer_id = c.id
    WHERE b.status IN ('placement', 'growing', 'pre_harvest', 'harvest_ready')
  LOOP
    -- Check each active batch for this customer
    FOR batch_record IN
      SELECT id, batch_id, doc_placement_date
      FROM batches
      WHERE customer_id = customer_record.id
      AND status IN ('placement', 'growing', 'pre_harvest', 'harvest_ready')
    LOOP
      -- Get the most recent biosecurity audit for this batch
      SELECT MAX(audit_date) INTO last_audit_date
      FROM biosecurity_audits
      WHERE batch_id = batch_record.id;
      
      -- Calculate days since last audit
      IF last_audit_date IS NULL THEN
        -- No audit ever submitted, use DOC placement date as reference
        days_since_audit := CURRENT_DATE - batch_record.doc_placement_date;
      ELSE
        days_since_audit := CURRENT_DATE - last_audit_date;
      END IF;
      
      -- If it's been 14 days or more since last audit (or DOC placement if no audit)
      IF days_since_audit >= 14 THEN
        -- Create reminder alert
        message_text := 'Biosecurity audit overdue for batch ' || batch_record.batch_id || 
                       '. Last audit was ' || days_since_audit || ' days ago. Please complete the fortnightly audit.';
        
        INSERT INTO alerts (
          customer_id,
          alert_type,
          severity,
          title,
          message,
          metadata,
          is_read,
          created_at
        ) VALUES (
          customer_record.id,
          'biosecurity_audit_overdue',
          'warning',
          'Biosecurity Audit Overdue',
          message_text,
          jsonb_build_object(
            'batch_id', batch_record.id,
            'batch_id_display', batch_record.batch_id,
            'days_since_audit', days_since_audit,
            'last_audit_date', COALESCE(last_audit_date::TEXT, batch_record.doc_placement_date::TEXT)
          ),
          false,
          NOW()
        ) ON CONFLICT DO NOTHING; -- Avoid duplicate alerts
        
        -- Log the reminder event for WhatsApp/push notification processing
        INSERT INTO message_events (
          customer_id,
          event_type,
          message_type,
          recipient_phone,
          message_content,
          metadata,
          status,
          created_at
        ) VALUES (
          customer_record.id,
          'biosecurity_reminder',
          'whatsapp',
          customer_record.phone,
          '🐔 *PoultryPulse - Biosecurity Audit Reminder*' || E'\n\n' ||
          'Fortnightly biosecurity audit is due for batch ' || batch_record.batch_id || '.' || E'\n' ||
          'Last audit: ' || COALESCE(last_audit_date::TEXT, 'Never submitted') || E'\n\n' ||
          'Please complete the audit in the app to maintain biosecurity standards.' || E'\n\n' ||
          '[Open App: poulse://batch/' || batch_record.batch_id || '/biosecurity]',
          jsonb_build_object(
            'batch_id', batch_record.id,
            'batch_id_display', batch_record.batch_id,
            'days_since_audit', days_since_audit
          ),
          'pending',
          NOW()
        ) ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule the CRON job to run daily at 9:00 AM IST
-- This checks for any batches that haven't had an audit in 14+ days
SELECT cron.schedule(
  'biosecurity_audit_reminder',
  '0 9 * * *', -- Daily at 9:00 AM
  'SELECT check_biosecurity_audit_reminders();'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_biosecurity_audit_reminders() TO postgres;
GRANT USAGE ON SCHEMA cron TO postgres;
