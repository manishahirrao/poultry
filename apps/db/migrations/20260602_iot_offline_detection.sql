-- PoultryPulse AI - IoT Device Offline Detection
-- Migration: 20260602_iot_offline_detection.sql
-- Description: Creates CRON job and function for detecting offline IoT devices
-- Requirements: REQ-018 §18.1, Design Addendum §17.1
-- Task: TASK-049

-- Function to check for offline devices and create alerts
CREATE OR REPLACE FUNCTION check_offline_devices()
RETURNS void AS $$
DECLARE
  offline_device RECORD;
  alert_message TEXT;
  alert_message_hindi TEXT;
BEGIN
  -- Check all devices that haven't reported in 2× their reporting interval
  FOR offline_device IN 
    SELECT 
      id,
      customer_id,
      device_name,
      shed_id,
      reporting_interval_minutes,
      last_reading_at,
      status
    FROM iot_devices
    WHERE 
      status = 'online'
      AND (
        last_reading_at IS NULL 
        OR last_reading_at < NOW() - (reporting_interval_minutes * 2 || ' minutes')::INTERVAL
      )
  LOOP
    -- Update device status to offline
    UPDATE iot_devices
    SET 
      status = 'offline',
      updated_at = NOW()
    WHERE id = offline_device.id;
    
    -- Create alert for customer
    alert_message := 'Device offline: ' || offline_device.device_name || 
                     ' in ' || COALESCE(offline_device.shed_id, 'Unknown shed') ||
                     '. Last reading: ' || COALESCE(offline_device.last_reading_at::TEXT, 'Never');
    
    alert_message_hindi := 'डिवाइस ऑफ़लाइन: ' || offline_device.device_name || 
                          ' में ' || COALESCE(offline_device.shed_id, 'अज्ञात शेड') ||
                          '. अंतिम रीडिंग: ' || COALESCE(offline_device.last_reading_at::TEXT, 'कभी नहीं');
    
    INSERT INTO alerts (
      customer_id,
      alert_type,
      severity,
      message,
      message_hindi,
      batch_id,
      metadata,
      created_at
    ) VALUES (
      offline_device.customer_id,
      'device_offline',
      'medium',
      alert_message,
      alert_message_hindi,
      NULL,
      jsonb_build_object(
        'device_id', offline_device.id,
        'device_name', offline_device.device_name,
        'shed_id', offline_device.shed_id,
        'last_reading_at', offline_device.last_reading_at,
        'reporting_interval_minutes', offline_device.reporting_interval_minutes
      ),
      NOW()
    );
    
    RAISE NOTICE 'Offline device detected: % for customer %', offline_device.device_name, offline_device.customer_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create pg_cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the offline check to run every 5 minutes
-- This checks devices that haven't reported in 2× their reporting interval
SELECT cron.schedule(
  'check_offline_devices',
  '*/5 * * * *',  -- Every 5 minutes
  'SELECT check_offline_devices();'
);

-- Function to manually trigger offline check (for testing)
CREATE OR REPLACE FUNCTION trigger_offline_device_check()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  PERFORM check_offline_devices();
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Offline device check completed',
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_offline_devices() TO postgres;
GRANT EXECUTE ON FUNCTION trigger_offline_device_check() TO postgres;

-- Comment on functions
COMMENT ON FUNCTION check_offline_devices() IS 'Checks for IoT devices that haven''t reported in 2× their reporting interval and creates alerts';
COMMENT ON FUNCTION trigger_offline_device_check() IS 'Manually triggers the offline device check (for testing)';
