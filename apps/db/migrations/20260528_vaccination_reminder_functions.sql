-- PoultryPulse AI - Vaccination Reminder Functions
-- Migration: 20260528_vaccination_reminder_functions.sql
-- Description: Functions to send vaccination reminders (WhatsApp 24h before, Push 6h before)
-- Requirements: REQ-015 §15.1, TASK-034

-- Function to send WhatsApp reminder 24h before vaccination
CREATE OR REPLACE FUNCTION send_vaccination_whatsapp_reminder()
RETURNS VOID AS $$
DECLARE
  v_upcoming_vaccinations RECORD;
  v_customer_phone TEXT;
  v_customer_name TEXT;
  v_batch_id TEXT;
BEGIN
  -- Find vaccinations due in 24 hours (within next 24-48 hours)
  FOR v_upcoming_vaccinations IN
    SELECT 
      vs.id,
      vs.batch_id,
      vs.vaccine_name,
      vs.scheduled_day,
      vs.due_date,
      vs.route,
      b.batch_id as batch_identifier,
      b.customer_id,
      c.phone,
      c.name as customer_name
    FROM vaccination_schedules vs
    JOIN batches b ON vs.batch_id = b.id
    JOIN customers c ON b.customer_id = c.id
    WHERE 
      vs.status = 'pending'
      AND vs.due_date BETWEEN CURRENT_DATE + INTERVAL '24 hours' AND CURRENT_DATE + INTERVAL '48 hours'
      AND c.phone IS NOT NULL
      AND c.phone != ''
      AND NOT EXISTS (
        SELECT 1 FROM notification_logs 
        WHERE type = 'vaccination_whatsapp_reminder' 
        AND related_id = vs.id::TEXT
        AND created_at > CURRENT_DATE - INTERVAL '2 days'
      )
  LOOP
    -- Format WhatsApp message in Hindi
    DECLARE
      v_message TEXT;
    BEGIN
      v_message := format(
        '🐔 *PoultryPulse — टीकाकरण अनुस्मारक*

कल (%s) को %s का
%s देना है।

✅ विवरण: %s · %s
📋 Checklist भरना न भूलें

[ऐप में देखें: poulse://batch/%s/vaccination]',
        to_char(v_upcoming_vaccinations.due_date, 'DD Mon'),
        v_upcoming_vaccinations.batch_identifier,
        v_upcoming_vaccinations.vaccine_name,
        v_upcoming_vaccinations.vaccine_name,
        CASE v_upcoming_vaccinations.route
          WHEN 'drinking_water' THEN 'पीने के पानी में'
          WHEN 'spray' THEN 'स्प्रे'
          WHEN 'injection' THEN 'इंजेक्शन'
          WHEN 'eye_drop' THEN 'आई ड्रॉप'
          WHEN 'nasal' THEN 'नाक के जरिए'
          ELSE v_upcoming_vaccinations.route
        END,
        v_upcoming_vaccinations.batch_identifier
      );

      -- Log the notification attempt
      INSERT INTO notification_logs (
        customer_id,
        type,
        channel,
        recipient,
        message,
        related_id,
        status,
        created_at
      ) VALUES (
        v_upcoming_vaccinations.customer_id,
        'vaccination_whatsapp_reminder',
        'whatsapp',
        v_upcoming_vaccinations.phone,
        v_message,
        v_upcoming_vaccinations.id::TEXT,
        'pending',
        NOW()
      );

      -- In production, this would trigger a Supabase Edge Function or webhook
      -- to actually send the WhatsApp message via Twilio
      -- For now, we log it and the notification service will pick it up
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send push notification reminder 6h before vaccination
CREATE OR REPLACE FUNCTION send_vaccination_push_reminder()
RETURNS VOID AS $$
DECLARE
  v_upcoming_vaccinations RECORD;
BEGIN
  -- Find vaccinations due in 6 hours (within next 6-12 hours)
  FOR v_upcoming_vaccinations IN
    SELECT 
      vs.id,
      vs.batch_id,
      vs.vaccine_name,
      vs.scheduled_day,
      vs.due_date,
      vs.route,
      b.batch_id as batch_identifier,
      b.customer_id
    FROM vaccination_schedules vs
    JOIN batches b ON vs.batch_id = b.id
    WHERE 
      vs.status = 'pending'
      AND vs.due_date BETWEEN CURRENT_TIMESTAMP + INTERVAL '6 hours' AND CURRENT_TIMESTAMP + INTERVAL '12 hours'
      AND NOT EXISTS (
        SELECT 1 FROM notification_logs 
        WHERE type = 'vaccination_push_reminder' 
        AND related_id = vs.id::TEXT
        AND created_at > CURRENT_DATE - INTERVAL '1 days'
      )
  LOOP
    -- Log the push notification attempt
    INSERT INTO notification_logs (
      customer_id,
      type,
      channel,
      recipient,
      message,
      related_id,
      status,
      metadata,
      created_at
    ) VALUES (
      v_upcoming_vaccinations.customer_id,
      'vaccination_push_reminder',
      'push',
      v_upcoming_vaccinations.customer_id::TEXT,
      format('Vaccination reminder: %s due in 6 hours for batch %s', 
        v_upcoming_vaccinations.vaccine_name,
        v_upcoming_vaccinations.batch_identifier
      ),
      v_upcoming_vaccinations.id::TEXT,
      'pending',
      jsonb_build_object(
        'batch_id', v_upcoming_vaccinations.batch_identifier,
        'vaccine_name', v_upcoming_vaccinations.vaccine_name,
        'scheduled_day', v_upcoming_vaccinations.scheduled_day,
        'due_date', v_upcoming_vaccinations.due_date,
        'route', v_upcoming_vaccinations.route
      ),
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION send_vaccination_whatsapp_reminder TO authenticated;
GRANT EXECUTE ON FUNCTION send_vaccination_push_reminder TO authenticated;

-- Add comments
COMMENT ON FUNCTION send_vaccination_whatsapp_reminder IS 'Sends WhatsApp reminders 24h before scheduled vaccinations. Should be run hourly via CRON job.';
COMMENT ON FUNCTION send_vaccination_push_reminder IS 'Sends push notifications 6h before scheduled vaccinations. Should be run hourly via CRON job.';
