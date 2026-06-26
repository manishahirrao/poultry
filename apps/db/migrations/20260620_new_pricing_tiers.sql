-- ════════════════════════════════════════════════════
-- PRICING TIER REDESIGN — FlockIQ v2 Pricing
-- Migration: 20260620_new_pricing_tiers.sql
-- Description: Complete pricing tier redesign from 3 tiers to 2 tiers with lifetime deals
-- Requirements: specs/pricing.md § DATABASE CHANGES
-- ════════════════════════════════════════════════════

-- Create subscriptions table (doesn't exist yet)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plan_name subscription_tier NOT NULL DEFAULT 'PULSE_FARM',
  subscription_type VARCHAR(20) DEFAULT 'monthly'
    CHECK (subscription_type IN ('monthly', 'annual', 'lifetime')),
  status subscription_status NOT NULL DEFAULT 'active',
  
  -- Lifetime deal tracking columns
  lifetime_start_date DATE,
  lifetime_end_date DATE,
  lifetime_renewal_offered BOOLEAN DEFAULT FALSE,
  lifetime_renewal_accepted BOOLEAN DEFAULT FALSE,
  
  -- Annual billing support
  billing_period_months INTEGER DEFAULT 1,
  next_renewal_date DATE,
  grandfathered_until DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id)
);

-- Create index for efficient queries
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_name ON subscriptions(plan_name);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_subscription_type ON subscriptions(subscription_type);

-- Update plan enum to new plan names
-- (Do NOT drop old values yet — needed for migration mapping)
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'FLOCKIQ_FARM';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'FLOCKIQ_PRO';

-- Price points table (source of truth for all pricing)
CREATE TABLE IF NOT EXISTS plan_price_points (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name         VARCHAR(50) NOT NULL,       -- 'FLOCKIQ_FARM' | 'FLOCKIQ_PRO'
  billing_type      VARCHAR(20) NOT NULL,       -- 'monthly' | 'annual' | 'lifetime'
  price_inr         NUMERIC(12,2) NOT NULL,     -- Price in ₹
  billing_months    INTEGER,                    -- NULL for lifetime; 1 for monthly; 12 for annual
  lifetime_tenure_years INTEGER,               -- 5 for lifetime deals; NULL for recurring
  renewal_price_inr NUMERIC(12,2),             -- Price after lifetime tenure; NULL for recurring
  is_active         BOOLEAN DEFAULT TRUE,
  effective_from    DATE NOT NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Seed plan price points
INSERT INTO plan_price_points
  (plan_name, billing_type, price_inr, billing_months, lifetime_tenure_years, renewal_price_inr, effective_from)
VALUES
  ('FLOCKIQ_FARM', 'monthly',  5000.00,   1,    NULL, NULL,    CURRENT_DATE),
  ('FLOCKIQ_FARM', 'annual',  50000.00,  12,    NULL, NULL,    CURRENT_DATE),
  ('FLOCKIQ_FARM', 'lifetime',150000.00, NULL,  5,   75000.00, CURRENT_DATE),
  ('FLOCKIQ_PRO',  'monthly',  8000.00,   1,    NULL, NULL,    CURRENT_DATE),
  ('FLOCKIQ_PRO',  'annual',  80000.00,  12,    NULL, NULL,    CURRENT_DATE),
  ('FLOCKIQ_PRO',  'lifetime',250000.00, NULL,  5,  125000.00, CURRENT_DATE);

-- Feature entitlements table (source of truth for feature gating)
CREATE TABLE IF NOT EXISTS plan_feature_entitlements (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name   VARCHAR(50) NOT NULL,
  feature_key VARCHAR(100) NOT NULL,
  is_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  limit_value INTEGER,    -- NULL = unlimited; number = the limit (e.g., 3 farms, 7 days)
  limit_unit  VARCHAR(50), -- 'farms' | 'users' | 'days' | 'batches' | null
  notes       TEXT,
  UNIQUE (plan_name, feature_key)
);

-- Seed all feature entitlements
-- FLOCKIQ_FARM features
INSERT INTO plan_feature_entitlements (plan_name, feature_key, is_enabled, limit_value, limit_unit) VALUES
  -- Price Intelligence
  ('FLOCKIQ_FARM', 'price_today',                   TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'price_history_7d',              TRUE,  7,    'days'),
  ('FLOCKIQ_FARM', 'price_history_30d',             FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'forecast_30day',                FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'forecast_7day',                 TRUE,  7,    'days'),
  ('FLOCKIQ_FARM', 'sell_signal_today',             TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'sell_signal_optimal_window',    FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'price_drivers_shap',            FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'accuracy_decay_viz',            FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'forecast_export_csv',           FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'compare_mandis',                FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'district_map',                  TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'disease_alerts',                TRUE,  NULL, NULL),
  -- Farm Operations
  ('FLOCKIQ_FARM', 'farm_management',               TRUE,  3,    'farms'),
  ('FLOCKIQ_FARM', 'daily_log_manual',              TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'whatsapp_daily_log',            TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'farm_metrics_tab',              TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'farm_health_tab',               TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'farm_feed_tab',                 TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'batch_history',                 TRUE,  3,    'batches'),
  ('FLOCKIQ_FARM', 'batch_status_board',            TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'gc_tracking',                   TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'harvest_window_banner',         TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'farm_compare',                  FALSE, NULL, NULL),
  -- Analytics
  ('FLOCKIQ_FARM', 'portfolio_metrics',             FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'calculator',                    TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'sell_hold_matrix_basic',        TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'sell_hold_matrix_ai',           FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'feed_intelligence',             TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'feed_procurement_multifarm',    FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'middleman_check',               TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'middleman_spread_history',      FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'negotiation_script_ai',         FALSE, NULL, NULL),
  -- Employee Module
  ('FLOCKIQ_FARM', 'employee_management',           FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'salary_management',             FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'expense_tracking',              FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'pl_overview',                   FALSE, NULL, NULL),
  -- Reports
  ('FLOCKIQ_FARM', 'daily_log_export_csv',          TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'batch_report_pdf',              TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'farm_compare_report',           FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'gc_report_pdf',                 TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'pl_report_pdf',                 FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'api_access',                    FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'scheduled_reports',             FALSE, NULL, NULL),
  -- Alerts
  ('FLOCKIQ_FARM', 'weather_alerts',                TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'price_alerts_basic',            TRUE,  NULL, NULL),
  ('FLOCKIQ_FARM', 'price_alerts_signal',           FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'custom_alert_rules',            FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'daily_digest',                  TRUE,  NULL, NULL),
  -- Team
  ('FLOCKIQ_FARM', 'team_members',                  FALSE, 1,    'users'),
  ('FLOCKIQ_FARM', 'role_based_access',             FALSE, NULL, NULL),
  ('FLOCKIQ_FARM', 'priority_support',              FALSE, NULL, NULL);

-- FLOCKIQ_PRO features (all FARM features + more)
INSERT INTO plan_feature_entitlements (plan_name, feature_key, is_enabled, limit_value, limit_unit)
SELECT
  'FLOCKIQ_PRO',
  feature_key,
  TRUE,   -- All features enabled for PRO
  CASE
    WHEN feature_key = 'farm_management'   THEN NULL   -- unlimited farms
    WHEN feature_key = 'batch_history'     THEN NULL   -- unlimited batches
    WHEN feature_key = 'team_members'      THEN 5      -- up to 5 users
    WHEN feature_key = 'price_history_7d'  THEN NULL   -- unlimited history
    WHEN feature_key = 'forecast_7day'     THEN NULL   -- full 30-day included
    ELSE NULL
  END,
  CASE
    WHEN feature_key = 'farm_management'   THEN NULL
    WHEN feature_key = 'batch_history'     THEN NULL
    WHEN feature_key = 'team_members'      THEN 'users'
    ELSE limit_unit
  END
FROM plan_feature_entitlements
WHERE plan_name = 'FLOCKIQ_FARM'
ON CONFLICT (plan_name, feature_key) DO NOTHING;

-- Update team_members for PRO specifically
UPDATE plan_feature_entitlements
SET is_enabled = TRUE, limit_value = 5, limit_unit = 'users'
WHERE plan_name = 'FLOCKIQ_PRO' AND feature_key = 'team_members';

-- Function to check if a user has access to a feature
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature_key VARCHAR
) RETURNS JSONB AS $$
DECLARE
  v_plan    VARCHAR;
  v_sub_type VARCHAR;
  v_lifetime_end DATE;
  v_result  JSONB;
BEGIN
  -- Get user's current plan
  SELECT s.plan_name, s.subscription_type, s.lifetime_end_date
    INTO v_plan, v_sub_type, v_lifetime_end
    FROM subscriptions s
   WHERE s.user_id = p_user_id
     AND (s.status = 'active' OR s.subscription_type = 'lifetime')
   LIMIT 1;

  -- Check if lifetime is still valid
  IF v_sub_type = 'lifetime' AND v_lifetime_end < CURRENT_DATE THEN
    -- Lifetime expired — treat as no active plan
    RETURN jsonb_build_object(
      'has_access', FALSE,
      'reason', 'lifetime_expired',
      'renewal_required', TRUE
    );
  END IF;

  IF v_plan IS NULL THEN
    RETURN jsonb_build_object('has_access', FALSE, 'reason', 'no_active_subscription');
  END IF;

  -- Check feature entitlement
  SELECT jsonb_build_object(
    'has_access',    pfe.is_enabled,
    'limit_value',   pfe.limit_value,
    'limit_unit',    pfe.limit_unit,
    'plan',          v_plan,
    'sub_type',      v_sub_type
  )
  INTO v_result
  FROM plan_feature_entitlements pfe
  WHERE pfe.plan_name = v_plan
    AND pfe.feature_key = p_feature_key;

  IF v_result IS NULL THEN
    RETURN jsonb_build_object('has_access', FALSE, 'reason', 'feature_not_found');
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_can_view_own_subscription" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "service_role_can_manage_subscriptions" ON subscriptions FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE plan_price_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_price_points" ON plan_price_points FOR SELECT USING (TRUE);

ALTER TABLE plan_feature_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_entitlements" ON plan_feature_entitlements FOR SELECT USING (TRUE);

-- Updated_at trigger for subscriptions table
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE subscriptions IS 'User subscription records with pricing tier, billing type, and lifetime deal tracking';
COMMENT ON TABLE plan_price_points IS 'Source of truth for all pricing across plans and billing types';
COMMENT ON TABLE plan_feature_entitlements IS 'Feature entitlements per plan - source of truth for feature gating';
COMMENT ON FUNCTION check_feature_access IS 'Checks if a user has access to a specific feature based on their subscription plan';
