-- PoultryPulse AI - Vaccination Schedule Auto-Creation
-- Migration: 20260528_vaccination_schedule_auto_create.sql
-- Description: Function to auto-create vaccination schedules when batch is created
-- Requirements: REQ-015 §15.1, TASK-034

-- Function to auto-create vaccination schedules for a new batch
CREATE OR REPLACE FUNCTION create_vaccination_schedules_for_batch(
  p_batch_id UUID,
  p_batch_type TEXT DEFAULT 'broiler',
  p_doc_placement_date DATE
)
RETURNS VOID AS $$
DECLARE
  v_protocol RECORD;
BEGIN
  -- Insert vaccination schedules based on batch type
  IF p_batch_type = 'broiler' THEN
    -- Day 1: Marek's Disease Vaccine
    INSERT INTO vaccination_schedules (
      batch_id,
      vaccine_name,
      vaccine_type,
      scheduled_day,
      due_date,
      route,
      dose_per_bird,
      status
    ) VALUES (
      p_batch_id,
      'Marek''s Disease Vaccine',
      'Live',
      1,
      p_doc_placement_date + INTERVAL '1 day',
      'injection',
      '1 dose',
      'pending'
    );

    -- Day 7: Newcastle La Sota
    INSERT INTO vaccination_schedules (
      batch_id,
      vaccine_name,
      vaccine_type,
      scheduled_day,
      due_date,
      route,
      dose_per_bird,
      status
    ) VALUES (
      p_batch_id,
      'Newcastle Disease (La Sota)',
      'Live',
      7,
      p_doc_placement_date + INTERVAL '7 days',
      'drinking_water',
      '1 dose',
      'pending'
    );

    -- Day 14: IBD/Gumboro
    INSERT INTO vaccination_schedules (
      batch_id,
      vaccine_name,
      vaccine_type,
      scheduled_day,
      due_date,
      route,
      dose_per_bird,
      status
    ) VALUES (
      p_batch_id,
      'IBD (Gumboro)',
      'Live',
      14,
      p_doc_placement_date + INTERVAL '14 days',
      'drinking_water',
      '1 dose',
      'pending'
    );

    -- Day 21: IB Spray
    INSERT INTO vaccination_schedules (
      batch_id,
      vaccine_name,
      vaccine_type,
      scheduled_day,
      due_date,
      route,
      dose_per_bird,
      status
    ) VALUES (
      p_batch_id,
      'Infectious Bronchitis',
      'Live',
      21,
      p_doc_placement_date + INTERVAL '21 days',
      'spray',
      '1 dose',
      'pending'
    );

    -- Day 28: Newcastle Clone 30 Booster
    INSERT INTO vaccination_schedules (
      batch_id,
      vaccine_name,
      vaccine_type,
      scheduled_day,
      due_date,
      route,
      dose_per_bird,
      status
    ) VALUES (
      p_batch_id,
      'Newcastle Clone 30 Booster',
      'Live',
      28,
      p_doc_placement_date + INTERVAL '28 days',
      'drinking_water',
      '1 dose',
      'pending'
    );
  
  ELSIF p_batch_type = 'layer' THEN
    -- Layer vaccination protocol (simplified)
    INSERT INTO vaccination_schedules (
      batch_id,
      vaccine_name,
      vaccine_type,
      scheduled_day,
      due_date,
      route,
      dose_per_bird,
      status
    ) VALUES (
      p_batch_id,
      'Marek''s Disease Vaccine',
      'Live',
      1,
      p_doc_placement_date + INTERVAL '1 day',
      'injection',
      '1 dose',
      'pending'
    );

    INSERT INTO vaccination_schedules (
      batch_id,
      vaccine_name,
      vaccine_type,
      scheduled_day,
      due_date,
      route,
      dose_per_bird,
      status
    ) VALUES (
      p_batch_id,
      'Newcastle Disease (La Sota)',
      'Live',
      7,
      p_doc_placement_date + INTERVAL '7 days',
      'drinking_water',
      '1 dose',
      'pending'
    );

    INSERT INTO vaccination_schedules (
      batch_id,
      vaccine_name,
      vaccine_type,
      scheduled_day,
      due_date,
      route,
      dose_per_bird,
      status
    ) VALUES (
      p_batch_id,
      'IBD (Gumboro)',
      'Live',
      14,
      p_doc_placement_date + INTERVAL '14 days',
      'drinking_water',
      '1 dose',
      'pending'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the create_batch_with_id function to call vaccination schedule creation
CREATE OR REPLACE FUNCTION create_batch_with_id(
  p_district TEXT,
  p_doc_placement_date DATE,
  p_doc_count INTEGER,
  p_doc_supplier TEXT,
  p_breed TEXT,
  p_target_harvest_weight_kg DECIMAL,
  p_shed_id TEXT,
  p_initial_feed_brand TEXT DEFAULT NULL,
  p_initial_feed_type TEXT DEFAULT NULL,
  p_batch_type TEXT DEFAULT 'broiler'
)
RETURNS TEXT AS $$
DECLARE
  v_batch_id TEXT;
  v_customer_id UUID;
  v_new_batch_id UUID;
BEGIN
  -- Get current customer ID
  v_customer_id := auth.uid();
  
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Generate batch ID using the existing function
  v_batch_id := generate_batch_id(p_district, p_doc_placement_date);
  
  -- Insert the batch record
  INSERT INTO batches (
    customer_id,
    batch_id,
    batch_type,
    doc_placement_date,
    doc_count,
    doc_supplier,
    breed,
    target_harvest_weight_kg,
    shed_id,
    initial_feed_brand,
    initial_feed_type,
    current_bird_count
  ) VALUES (
    v_customer_id,
    v_batch_id,
    p_batch_type,
    p_doc_placement_date,
    p_doc_count,
    p_doc_supplier,
    p_breed,
    p_target_harvest_weight_kg,
    p_shed_id,
    p_initial_feed_brand,
    p_initial_feed_type,
    p_doc_count
  )
  RETURNING id INTO v_new_batch_id;
  
  -- Auto-create vaccination schedules for the new batch
  PERFORM create_vaccination_schedules_for_batch(v_new_batch_id, p_batch_type, p_doc_placement_date);
  
  -- Return the generated batch ID
  RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_vaccination_schedules_for_batch TO authenticated;
GRANT EXECUTE ON FUNCTION create_batch_with_id TO authenticated;

-- Add comments
COMMENT ON FUNCTION create_vaccination_schedules_for_batch IS 'Auto-creates vaccination schedules for a new batch based on batch type';
COMMENT ON FUNCTION create_batch_with_id IS 'Creates a new batch with auto-generated batch ID, vaccination schedules, and returns the batch_id string';
