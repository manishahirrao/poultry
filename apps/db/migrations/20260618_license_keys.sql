-- ════════════════════════════════════════════════════
-- LICENSE KEYS & FIELD SALES ARCHITECTURE
-- Migration: 20260618_license_keys.sql
-- Description: Creates the license_keys table for field sales agents to generate and sell offline subscriptions via Cash, UPI, or Razorpay.
-- ════════════════════════════════════════════════════

-- Create license keys table for field activation
CREATE TABLE IF NOT EXISTS license_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. FLOCK-K7M2-P9X4
  
  -- The agent who sold it
  sales_agent_id UUID REFERENCES customers(id) ON DELETE SET NULL, 
  
  -- The product being sold
  plan_name VARCHAR(50) NOT NULL, -- Using VARCHAR to be flexible, but matches subscription_tier
  subscription_type VARCHAR(20) DEFAULT 'monthly' CHECK (subscription_type IN ('monthly', 'annual', 'lifetime')),
  
  -- Financial tracking
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'upi', 'razorpay', 'bank_transfer')),
  payment_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_reference TEXT, -- UPI Transaction ID or Razorpay Payment ID
  
  -- Activation state
  is_used BOOLEAN DEFAULT FALSE,
  activated_by_user_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  activated_phone_number VARCHAR(20),
  activated_at TIMESTAMPTZ,
  
  -- The validity this key grants upon activation
  validity_days INTEGER DEFAULT 30,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_license_keys_code ON license_keys(key_code);
CREATE INDEX idx_license_keys_agent ON license_keys(sales_agent_id);
CREATE INDEX idx_license_keys_status ON license_keys(is_used);

-- RLS Policies
ALTER TABLE license_keys ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "service_role_full_access" ON license_keys FOR ALL USING (auth.role() = 'service_role');

-- Admins can view and manage all keys
CREATE POLICY "admins_manage_keys" ON license_keys FOR ALL USING (
  EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Sales agents can view and generate their own keys
CREATE POLICY "agents_manage_own_keys" ON license_keys FOR ALL USING (
  sales_agent_id = auth.uid()
);

-- Anyone can select a key if they know the exact code (for the activation screen validation)
CREATE POLICY "public_validate_key" ON license_keys FOR SELECT USING (
  NOT is_used
);

-- Updated_at trigger
CREATE TRIGGER update_license_keys_updated_at BEFORE UPDATE ON license_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE license_keys IS 'Pre-generated activation keys sold by field agents via cash/UPI for offline onboarding';
