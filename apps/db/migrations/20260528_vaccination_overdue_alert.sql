-- PoultryPulse AI - Vaccination Overdue Alert Logic
-- Migration: 20260528_vaccination_overdue_alert.sql
-- Description: Function to detect overdue vaccinations and create alerts
-- Requirements: REQ-015 §15.1, TASK-034

-- Function to check and create overdue vaccination alerts
CREATE OR REPLACE FUNCTION check_vaccination_overdue()
RETURNS VOID AS $$
DECLARE
  v_overdue_vaccinations RECORD;
BEGIN
  -- Find vaccinations that are overdue (not logged within 2 days of scheduled date)
  FOR v_overdue_vaccinations IN
    SELECT 
      vs.id,
      vs.batch_id,
      vs.vaccine_name,
      vs.scheduled_day,
      vs.due_date,
      b.batch_id as batch_identifier,
      b.customer_id
    FROM vaccination_schedules vs
    JOIN batches b ON vs.batch_id = b.id
    WHERE 
      vs.status = 'pending'
      AND vs.due_date < CURRENT_DATE - INTERVAL '2 days'
      AND NOT EXISTS (
        SELECT 1 FROM alerts 
        WHERE type = 'vaccination_overdue' 
        AND related_id = vs.id::TEXT
      )
  LOOP
    -- Create alert for overdue vaccination
    INSERT INTO alerts (
      customer_id,
      type,
      severity,
      title,
      message,
      related_id,
      metadata,
      created_at
    ) VALUES (
      v_overdue_vaccinations.customer_id,
      'vaccination_overdue',
      'medium',
      'Vaccination Overdue',
      format('%s (Day %s) is overdue by %s days', 
        v_overdue_vaccinations.vaccine_name,
        v_overdue_vaccinations.scheduled_day,
        CURRENT_DATE - v_overdue_vaccinations.due_date
      ),
      v_overdue_vaccinations.id::TEXT,
      jsonb_build_object(
        'batch_id', v_overdue_vaccinations.batch_identifier,
        'vaccine_name', v_overdue_vaccinations.vaccine_name,
        'scheduled_day', v_overdue_vaccinations.scheduled_day,
        'due_date', v_overdue_vaccinations.due_date,
        'days_overdue', CURRENT_DATE - v_overdue_vaccinations.due_date
      ),
      NOW()
    );

    -- Update vaccination status to overdue
    UPDATE vaccination_schedules
    SET status = 'overdue'
    WHERE id = v_overdue_vaccinations.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_vaccination_overdue TO authenticated;

-- Create a trigger to check for overdue vaccinations when vaccination schedules are updated
CREATE OR REPLACE FUNCTION trigger_check_vaccination_overdue()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check on status changes or new insertions
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM check_vaccination_overdue();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to vaccination_schedules table
CREATE TRIGGER trg_check_vaccination_overdue
  AFTER INSERT OR UPDATE ON vaccination_schedules
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_vaccination_overdue();

-- Create a scheduled job to check for overdue vaccinations daily
-- This would typically be done via pg_cron or an external scheduler
-- For now, we'll create a function that can be called manually or via CRON
COMMENT ON FUNCTION check_vaccination_overdue IS 'Checks for overdue vaccinations and creates alerts. Should be run daily via CRON job.';
