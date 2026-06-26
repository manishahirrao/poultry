-- PoultryPulse AI - Batch Creation Function
-- Migration: 20260528_create_batch_function.sql
-- Description: Creates a function to generate batch ID and insert batch record atomically
-- Requirements: REQ-013 §13.1, TASK-030

-- Function to create batch with auto-generated ID
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
  
  -- Return the generated batch ID
  RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_batch_with_id TO authenticated;

-- Add comment
COMMENT ON FUNCTION create_batch_with_id IS 'Creates a new batch with auto-generated batch ID and returns the batch_id string';
