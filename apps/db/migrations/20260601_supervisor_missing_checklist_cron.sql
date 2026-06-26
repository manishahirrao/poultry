-- PoultryPulse AI - Supervisor Missing Checklist Alert CRON Job
-- Migration: 20260601_supervisor_missing_checklist_cron.sql
-- Description: Creates CRON job to check for missing supervisor checklists at 10:00 AM IST
-- Requirements: REQ-020 §20.5, Design Addendum §15.2
-- Task: TASK-045

-- Update the alerts enum to include supervisor_checklist_missing type
-- Note: This requires adding the new type to the existing enum
-- For PostgreSQL, we need to add the type to the enum definition

-- Add supervisor_checklist_missing to alert_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'supervisor_checklist_missing' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'alert_type')) THEN
    ALTER TYPE alert_type ADD VALUE 'supervisor_checklist_missing';
  END IF;
END $$;

-- Create a function to check for missing supervisor checklists and create alerts
CREATE OR REPLACE FUNCTION check_missing_supervisor_checklists()
RETURNS VOID AS $$
DECLARE
  supervisor_record RECORD;
  alert_text_hi TEXT;
  alert_text_en TEXT;
  customer_id UUID;
BEGIN
  -- For each supervisor with no completed health checklist today
  FOR supervisor_record IN
    SELECT 
      s.id,
      s.customer_id,
      s.name,
      s.phone
    FROM supervisors s
    WHERE s.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM supervisor_daily_tasks t
      WHERE t.supervisor_id = s.id
      AND t.task_date = CURRENT_DATE
      AND t.task_type = 'health_checklist'
      AND t.status = 'completed'
    )
  LOOP
    customer_id := supervisor_record.customer_id;
    
    -- Create alert for farm owner
    alert_text_hi := '⚠ सुपरवाइज़र ' || supervisor_record.name || ' ने आज की हेल्थ चेकलिस्ट नहीं भरी';
    alert_text_en := '⚠ Supervisor ' || supervisor_record.name || ' has not submitted today''s health checklist';
    
    -- Check if alert already exists for today to avoid duplicates
    IF NOT EXISTS (
      SELECT 1 FROM alerts 
      WHERE type = 'supervisor_checklist_missing'::alert_type
      AND issued_at >= CURRENT_DATE
      AND title_hi = alert_text_hi
    ) THEN
      INSERT INTO alerts (type, severity, title_hi, body_hi, district, issued_at, expires_at, is_active)
      VALUES (
        'supervisor_checklist_missing'::alert_type,
        'MEDIUM'::alert_severity,
        alert_text_hi,
        alert_text_en,
        'all', -- This will be filtered by customer_id in application logic
        NOW(),
        NOW() + INTERVAL '24 hours',
        true
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create pg_cron extension if not exists (for scheduling)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run daily at 10:00 AM IST (which is 4:30 AM UTC)
-- Note: IST is UTC+5:30, so 10:00 AM IST = 4:30 AM UTC
SELECT cron.schedule(
  'check_missing_supervisor_checklists',
  '30 4 * * *', -- 4:30 AM UTC = 10:00 AM IST
  'SELECT check_missing_supervisor_checklists();'
);

-- Create a table to track CRON job execution for monitoring
CREATE TABLE IF NOT EXISTS cron_job_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL, -- 'success' or 'error'
  error_message TEXT,
  records_affected INTEGER DEFAULT 0
);

-- Create a wrapper function that logs execution
CREATE OR REPLACE FUNCTION check_missing_supervisor_checklists_with_logging()
RETURNS VOID AS $$
DECLARE
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  error_message TEXT;
  records_count INTEGER;
BEGIN
  start_time := NOW();
  
  BEGIN
    -- Get count of supervisors before running
    SELECT COUNT(*) INTO records_count
    FROM supervisors s
    WHERE s.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM supervisor_daily_tasks t
      WHERE t.supervisor_id = s.id
      AND t.task_date = CURRENT_DATE
      AND t.task_type = 'health_checklist'
      AND t.status = 'completed'
    );
    
    -- Run the actual check
    PERFORM check_missing_supervisor_checklists();
    
    -- Log success
    INSERT INTO cron_job_log (job_name, executed_at, status, records_affected)
    VALUES ('check_missing_supervisor_checklists', start_time, 'success', records_count);
    
  EXCEPTION WHEN OTHERS THEN
    error_message := SQLERRM;
    
    -- Log error
    INSERT INTO cron_job_log (job_name, executed_at, status, error_message)
    VALUES ('check_missing_supervisor_checklists', start_time, 'error', error_message);
    
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql;

-- Update the cron schedule to use the logging version
SELECT cron.unschedule('check_missing_supervisor_checklists');

SELECT cron.schedule(
  'check_missing_supervisor_checklists',
  '30 4 * * *', -- 4:30 AM UTC = 10:00 AM IST
  'SELECT check_missing_supervisor_checklists_with_logging();'
);

-- Create index for faster queries on cron job log
CREATE INDEX idx_cron_job_log_job_name ON cron_job_log(job_name);
CREATE INDEX idx_cron_job_log_executed_at ON cron_job_log(executed_at);
