-- PoultryPulse AI - Custom Vaccination Protocols
-- Migration: 20260528_custom_vaccination_protocols.sql
-- Description: Table and functions for custom vaccination protocols
-- Requirements: REQ-015 §15.1, TASK-034

-- Custom vaccination protocols table
CREATE TABLE IF NOT EXISTS custom_vaccination_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  batch_type batch_type NOT NULL DEFAULT 'broiler',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_protocol_unique UNIQUE (customer_id, name)
);

-- Custom vaccination protocol items table
CREATE TABLE IF NOT EXISTS custom_vaccination_protocol_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id UUID NOT NULL REFERENCES custom_vaccination_protocols(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccine_type TEXT,
  scheduled_day INTEGER NOT NULL CHECK (scheduled_day > 0),
  route vaccination_route,
  dose_per_bird TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_custom_vaccination_protocols_customer_id ON custom_vaccination_protocols(customer_id);
CREATE INDEX idx_custom_vaccination_protocols_batch_type ON custom_vaccination_protocols(batch_type);
CREATE INDEX idx_custom_vaccination_protocol_items_protocol_id ON custom_vaccination_protocol_items(protocol_id);

-- Row Level Security
ALTER TABLE custom_vaccination_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_vaccination_protocol_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_vaccination_protocols
CREATE POLICY "Users can view own custom protocols"
ON custom_vaccination_protocols FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own custom protocols"
ON custom_vaccination_protocols FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own custom protocols"
ON custom_vaccination_protocols FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own custom protocols"
ON custom_vaccination_protocols FOR DELETE
USING (customer_id = auth.uid());

-- RLS Policies for custom_vaccination_protocol_items (via protocol ownership)
CREATE POLICY "Users can view own protocol items"
ON custom_vaccination_protocol_items FOR SELECT
USING (protocol_id IN (SELECT id FROM custom_vaccination_protocols WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own protocol items"
ON custom_vaccination_protocol_items FOR INSERT
WITH CHECK (protocol_id IN (SELECT id FROM custom_vaccination_protocols WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own protocol items"
ON custom_vaccination_protocol_items FOR UPDATE
USING (protocol_id IN (SELECT id FROM custom_vaccination_protocols WHERE customer_id = auth.uid()));

CREATE POLICY "Users can delete own protocol items"
ON custom_vaccination_protocol_items FOR DELETE
USING (protocol_id IN (SELECT id FROM custom_vaccination_protocols WHERE customer_id = auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_custom_vaccination_protocols_updated_at
  BEFORE UPDATE ON custom_vaccination_protocols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create vaccination schedules from custom protocol
CREATE OR REPLACE FUNCTION create_vaccination_schedules_from_custom_protocol(
  p_batch_id UUID,
  p_protocol_id UUID,
  p_doc_placement_date DATE
)
RETURNS VOID AS $$
DECLARE
  v_protocol_item RECORD;
BEGIN
  -- Insert vaccination schedules from custom protocol
  FOR v_protocol_item IN
    SELECT 
      vaccine_name,
      vaccine_type,
      scheduled_day,
      route,
      dose_per_bird,
      notes
    FROM custom_vaccination_protocol_items
    WHERE protocol_id = p_protocol_id
    ORDER BY scheduled_day ASC
  LOOP
    INSERT INTO vaccination_schedules (
      batch_id,
      vaccine_name,
      vaccine_type,
      scheduled_day,
      due_date,
      route,
      dose_per_bird,
      notes,
      status
    ) VALUES (
      p_batch_id,
      v_protocol_item.vaccine_name,
      v_protocol_item.vaccine_type,
      v_protocol_item.scheduled_day,
      p_doc_placement_date + (v_protocol_item.scheduled_day || ' days')::INTERVAL,
      v_protocol_item.route,
      v_protocol_item.dose_per_bird,
      v_protocol_item.notes,
      'pending'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_vaccination_schedules_from_custom_protocol TO authenticated;

-- Add comments
COMMENT ON TABLE custom_vaccination_protocols IS 'Custom vaccination protocols defined by users for non-standard breeds or requirements';
COMMENT ON TABLE custom_vaccination_protocol_items IS 'Individual vaccination items within custom protocols';
COMMENT ON FUNCTION create_vaccination_schedules_from_custom_protocol IS 'Creates vaccination schedules from a custom protocol for a specific batch';
