-- Internal Notes system for Ramesh's team (GAP-018)
-- Allows integrators to leave notes for field supervisors on specific farms

CREATE TABLE IF NOT EXISTS internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES customers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES customers(id)
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_internal_notes_farm_id ON internal_notes(farm_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_integrator_id ON internal_notes(integrator_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_created_at ON internal_notes(created_at DESC);

-- RLS policies
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;

-- Integrators can view notes for their farms
CREATE POLICY "Integrators can view notes for their farms"
  ON internal_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = internal_notes.farm_id
      AND f.integrator_id = auth.uid()
    )
  );

-- Integrators can create notes for their farms
CREATE POLICY "Integrators can create notes for their farms"
  ON internal_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = internal_notes.farm_id
      AND f.integrator_id = auth.uid()
    )
  );

-- Integrators can update notes for their farms
CREATE POLICY "Integrators can update notes for their farms"
  ON internal_notes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = internal_notes.farm_id
      AND f.integrator_id = auth.uid()
    )
  );

-- Integrators can delete notes for their farms
CREATE POLICY "Integrators can delete notes for their farms"
  ON internal_notes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = internal_notes.farm_id
      AND f.integrator_id = auth.uid()
    )
  );
