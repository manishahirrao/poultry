-- Onboarding Progress Tracking (GAP-021)
-- Tracks completion of onboarding steps for new users

CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  step_1_farm_added BOOLEAN DEFAULT FALSE,
  step_2_whatsapp_setup BOOLEAN DEFAULT FALSE,
  step_3_gc_costs_entered BOOLEAN DEFAULT FALSE,
  step_4_employees_added BOOLEAN DEFAULT FALSE,
  step_5_price_alerts_configured BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress_customer_id ON user_onboarding_progress(customer_id);

-- RLS policies
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own onboarding progress
CREATE POLICY "Users can view their own onboarding progress"
  ON user_onboarding_progress
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Users can insert their own onboarding progress
CREATE POLICY "Users can insert their own onboarding progress"
  ON user_onboarding_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Users can update their own onboarding progress
CREATE POLICY "Users can update their own onboarding progress"
  ON user_onboarding_progress
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER onboarding_progress_updated_at
  BEFORE UPDATE ON user_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_progress_updated_at();

-- Function to check if onboarding is complete
CREATE OR REPLACE FUNCTION is_onboarding_complete(p_customer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_progress user_onboarding_progress;
BEGIN
  SELECT * INTO v_progress FROM user_onboarding_progress
  WHERE customer_id = p_customer_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN v_progress.step_1_farm_added
    AND v_progress.step_2_whatsapp_setup
    AND v_progress.step_3_gc_costs_entered
    AND v_progress.step_4_employees_added
    AND v_progress.step_5_price_alerts_configured;
END;
$$ LANGUAGE plpgsql;
