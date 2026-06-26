-- PoultryPulse AI - Weight Deviation Alert Trigger
-- Migration: 20260529_weight_deviation_alert.sql
-- Description: Creates trigger function for weight deviation alerts on weight_logs INSERT
-- Requirements: REQ-016 §16.4, TASK-039

-- Function to get breed standard weight for a given age and breed
CREATE OR REPLACE FUNCTION get_breed_standard_weight(p_breed TEXT, p_age_days INTEGER)
RETURNS DECIMAL(5,3) AS $$
DECLARE
  v_standard_weight DECIMAL(5,3);
BEGIN
  -- Breed standard weights (kg) by age for common broiler breeds
  -- These are simplified values - in production would use breed_standards table
  CASE p_breed
    WHEN 'Cobb 500' THEN
      CASE 
        WHEN p_age_days <= 7 THEN v_standard_weight := 0.18;
        WHEN p_age_days <= 14 THEN v_standard_weight := 0.45;
        WHEN p_age_days <= 21 THEN v_standard_weight := 0.85;
        WHEN p_age_days <= 28 THEN v_standard_weight := 1.35;
        WHEN p_age_days <= 35 THEN v_standard_weight := 1.85;
        WHEN p_age_days <= 42 THEN v_standard_weight := 2.20;
        ELSE v_standard_weight := 2.20;
      END CASE;
    WHEN 'Ross 308' THEN
      CASE 
        WHEN p_age_days <= 7 THEN v_standard_weight := 0.19;
        WHEN p_age_days <= 14 THEN v_standard_weight := 0.48;
        WHEN p_age_days <= 21 THEN v_standard_weight := 0.90;
        WHEN p_age_days <= 28 THEN v_standard_weight := 1.42;
        WHEN p_age_days <= 35 THEN v_standard_weight := 1.95;
        WHEN p_age_days <= 42 THEN v_standard_weight := 2.30;
        ELSE v_standard_weight := 2.30;
      END CASE;
    WHEN 'Vencobb' THEN
      CASE 
        WHEN p_age_days <= 7 THEN v_standard_weight := 0.16;
        WHEN p_age_days <= 14 THEN v_standard_weight := 0.40;
        WHEN p_age_days <= 21 THEN v_standard_weight := 0.78;
        WHEN p_age_days <= 28 THEN v_standard_weight := 1.25;
        WHEN p_age_days <= 35 THEN v_standard_weight := 1.72;
        WHEN p_age_days <= 40 THEN v_standard_weight := 2.00;
        ELSE v_standard_weight := 2.00;
      END CASE;
    WHEN 'Hubbard' THEN
      CASE 
        WHEN p_age_days <= 7 THEN v_standard_weight := 0.17;
        WHEN p_age_days <= 14 THEN v_standard_weight := 0.42;
        WHEN p_age_days <= 21 THEN v_standard_weight := 0.82;
        WHEN p_age_days <= 28 THEN v_standard_weight := 1.30;
        WHEN p_age_days <= 35 THEN v_standard_weight := 1.78;
        WHEN p_age_days <= 41 THEN v_standard_weight := 2.10;
        ELSE v_standard_weight := 2.10;
      END CASE;
    ELSE
      -- Default to Cobb 500 standards
      CASE 
        WHEN p_age_days <= 7 THEN v_standard_weight := 0.18;
        WHEN p_age_days <= 14 THEN v_standard_weight := 0.45;
        WHEN p_age_days <= 21 THEN v_standard_weight := 0.85;
        WHEN p_age_days <= 28 THEN v_standard_weight := 1.35;
        WHEN p_age_days <= 35 THEN v_standard_weight := 1.85;
        WHEN p_age_days <= 42 THEN v_standard_weight := 2.20;
        ELSE v_standard_weight := 2.20;
      END CASE;
  END CASE;
  
  RETURN v_standard_weight;
END;
$$ LANGUAGE plpgsql;

-- Function to check weight deviation and create alert if needed
CREATE OR REPLACE FUNCTION check_weight_deviation()
RETURNS TRIGGER AS $$
DECLARE
  v_batch RECORD;
  v_age_days INTEGER;
  v_breed_standard_weight DECIMAL(5,3);
  v_deviation_percent DECIMAL(5,2);
  v_alert_message TEXT;
  v_alert_severity TEXT;
BEGIN
  -- Get batch information
  SELECT * INTO v_batch
  FROM batches
  WHERE id = NEW.batch_id;
  
  -- Calculate age in days
  v_age_days := NEW.log_date - v_batch.doc_placement_date;
  
  -- Get breed standard weight for this age
  v_breed_standard_weight := get_breed_standard_weight(v_batch.breed, v_age_days);
  
  -- Calculate deviation percentage
  IF v_breed_standard_weight > 0 THEN
    v_deviation_percent := ((NEW.avg_weight_kg - v_breed_standard_weight) / v_breed_standard_weight) * 100;
  ELSE
    v_deviation_percent := 0;
  END IF;
  
  -- Check if deviation is below 90% of breed standard (alert threshold)
  IF NEW.avg_weight_kg < (v_breed_standard_weight * 0.90) THEN
    -- Determine alert severity based on how far below standard
    IF NEW.avg_weight_kg < (v_breed_standard_weight * 0.85) THEN
      v_alert_severity := 'critical';
      v_alert_message := 'वज़न मानक से ' || ABS(v_deviation_percent)::TEXT || '% कम है। तुरंत डॉक्टर से मिलें।';
    ELSE
      v_alert_severity := 'medium';
      v_alert_message := 'वज़न मानक से ' || ABS(v_deviation_percent)::TEXT || '% कम है। चारे की जाँच करें।';
    END IF;
    
    -- Insert alert into alerts table
    INSERT INTO alerts (
      customer_id,
      batch_id,
      alert_type,
      severity,
      message,
      message_hindi,
      data,
      created_at
    ) VALUES (
      v_batch.customer_id,
      NEW.batch_id,
      'weight_gain_deviation',
      v_alert_severity,
      'Weight is ' || ABS(v_deviation_percent)::TEXT || '% below breed standard for age ' || v_age_days || ' days',
      v_alert_message,
      jsonb_build_object(
        'actual_weight_kg', NEW.avg_weight_kg,
        'breed_standard_weight_kg', v_breed_standard_weight,
        'deviation_percent', v_deviation_percent,
        'age_days', v_age_days,
        'breed', v_batch.breed
      ),
      NOW()
    );
    
    -- Update batch current_avg_weight_kg
    UPDATE batches
    SET current_avg_weight_kg = NEW.avg_weight_kg
    WHERE id = NEW.batch_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on weight_logs INSERT
DROP TRIGGER IF EXISTS trg_check_weight_deviation ON weight_logs;
CREATE TRIGGER trg_check_weight_deviation
  AFTER INSERT ON weight_logs
  FOR EACH ROW
  EXECUTE FUNCTION check_weight_deviation();

-- Comment explaining the trigger
COMMENT ON FUNCTION check_weight_deviation() IS 'Trigger function that checks if weight log entry is below 90% of breed standard and creates an alert if so. Updates batch current_avg_weight_kg.';
