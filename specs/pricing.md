# FlockIQ — Pricing Tier Redesign & Feature Gating Implementation Prompt
# Version: v1.0 | June 2026
# Copy this ENTIRE document into Windsurf Cascade (Agent mode)
# Estimated work: 6–9 hours across ~25 files

---

## ROLE & MISSION

You are a senior full-stack engineer working on **FlockIQ** — a poultry farm management and price intelligence SaaS for commercial broiler farmers and integrators in India.

Your mission: **Completely redesign the subscription pricing from 3 tiers to 2 tiers, implement lifetime deal pricing, enforce feature gating across the entire application, and update every screen that shows pricing or plan-related UI.**

Read this entire document before writing a single line of code.

---

## NEW PRICING STRUCTURE — BUSINESS RULES

### THE TWO PLANS

```
┌─────────────────────────────────────────────────────────────────────┐
│  PLAN 1: FlockIQ FARM                                               │
│  Target: Commercial farmers (S1) + small integrators with ≤5 farms  │
│                                                                     │
│  Monthly:        ₹5,000/month                                       │
│  Lifetime Deal:  ₹1,50,000 (one-time) — valid for 5 years          │
│  Annual:         ₹50,000/year (saves ₹10,000 vs monthly)           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  PLAN 2: FlockIQ PRO                                                │
│  Target: Integration companies (S2) + traders (S4) + large ops      │
│                                                                     │
│  Monthly:        ₹8,000/month                                       │
│  Lifetime Deal:  ₹2,50,000 (one-time) — valid for 5 years          │
│  Annual:         ₹80,000/year (saves ₹16,000 vs monthly)           │
└─────────────────────────────────────────────────────────────────────┘
```

### LIFETIME DEAL RULES (CRITICAL — implement exactly)

```
LIFETIME DEAL KEY TERMS:
  1. "Lifetime" is subject to a 5-year tenure from purchase date
  2. After 5 years: user gets a renewal offer at 50% of lifetime price
     FARM renewal: ₹75,000 | PRO renewal: ₹1,25,000
  3. During the 5-year tenure: ALL feature updates included at no extra charge
  4. Lifetime deal is non-refundable (30-day money-back exception only if
     user has not accessed the platform more than 3 times)
  5. Lifetime deal is non-transferable (tied to the registered business entity)
  6. If FlockIQ shuts down: no refund (explicit in terms)

DISPLAY RULES FOR LIFETIME DEAL:
  - Always show the yearly equivalent: "₹1,50,000 = ₹2,500/month equivalent"
  - Show savings vs monthly: "Save ₹1,50,000 over 5 years vs monthly plan"
  - Show the tenure clearly: "Valid for 5 years from purchase date"
  - Show renewal terms: "Renewal at 50% after Year 5"
  - Expiry tracking: show days/months remaining on lifetime deal in user dashboard

DATABASE: subscription_type = 'monthly' | 'annual' | 'lifetime'
```

### OLD PLAN → NEW PLAN MIGRATION

```
OLD SYSTEM (remove completely):
  PULSE_FARM    ₹499/month
  PULSE_PRO     ₹999/month
  PULSE_INTEL   ₹1,999/month

NEW SYSTEM (replace with):
  FLOCKIQ_FARM  ₹5,000/month  (or ₹50,000/year or ₹1,50,000 lifetime-5yr)
  FLOCKIQ_PRO   ₹8,000/month  (or ₹80,000/year or ₹2,50,000 lifetime-5yr)

MIGRATION MAPPING for existing users:
  Old PULSE_FARM  → New FLOCKIQ_FARM (grandfather at old price for 3 months)
  Old PULSE_PRO   → New FLOCKIQ_PRO  (grandfather at old price for 3 months)
  Old PULSE_INTEL → New FLOCKIQ_PRO  (they had the top tier — no downgrade)

NOTE: Do NOT automatically charge existing users the new price.
  Show them a "Plan Update Notice" banner with 3-month grandfather period.
  After 3 months: they get charged new price OR shown cancellation option.
```

---

## FEATURE GATING DECISION

You (as the engineer) must decide which features are "advanced" (PRO only) vs "standard" (both plans).

### DECISION FRAMEWORK USED:
```
ADVANCED (PRO only) = Features that:
  a) Require AI/ML model inference (forecast, price drivers)
  b) Require multi-farm aggregation at enterprise scale
  c) Are time-sensitive intelligence that gives competitive edge
  d) Require backend data pipeline compute cost per request
  e) Are clearly integrator/trader tools (not farmer tools)

STANDARD (both plans) = Features that:
  a) Are operational necessities (daily log, health, feed tracking)
  b) Help the farmer do their job regardless of sophistication
  c) Are basic data collection and display
  d) Build trust and stickiness (farm management, inventory)
  e) WhatsApp automation (retention driver — give to both)
```

### FINAL FEATURE MATRIX

```
FEATURE                              FARM (₹5K)    PRO (₹8K)    NOTES
─────────────────────────────────────────────────────────────────────────────
PRICE INTELLIGENCE
  Live today's mandi price              ✓              ✓         Both — basic need
  Price history (7 days)               ✓              ✓         Both — basic transparency
  Price history (30+ days)             ✗              ✓         PRO — trend analysis
  30-Day AI Forecast (P10/P50/P90)     ✗              ✓         PRO — core advanced feature
  7-Day forecast (limited)             ✓              ✓         FARM gets 7-day only
  Sell signal (today only)            ✓              ✓         Both — basic sell/hold/caution
  Optimal sell window analysis         ✗              ✓         PRO — AI-computed window
  Price driver analysis (SHAP)        ✗              ✓         PRO — AI feature
  Accuracy decay visualisation        ✗              ✓         PRO — model transparency
  Forecast CSV/JSON download           ✗              ✓         PRO — enterprise data export
  Compare mandis simultaneously       ✗              ✓         PRO — multi-market intelligence
  District choropleth map              ✓              ✓         Both — geographic awareness
  HPAI/disease alerts                 ✓              ✓         Both — safety critical

FARM OPERATIONS
  Add/manage farms (up to 3)          ✓              ✗         FARM: max 3 farms
  Add/manage farms (unlimited)        ✗              ✓         PRO: unlimited farms
  Daily log entry (manual)            ✓              ✓         Both — core workflow
  WhatsApp daily log automation       ✓              ✓         Both — retention driver
  Farm detail tabs (Metrics/Log)      ✓              ✓         Both — basic ops
  Health tab (vaccination/symptoms)   ✓              ✓         Both — animal welfare
  Feed tab (inventory/purchase log)   ✓              ✓         Both — daily operations
  Batch history (last 3 batches)      ✓              ✗         FARM: limited history
  Batch history (unlimited)           ✗              ✓         PRO: full history
  Batch status board (Kanban)         ✓              ✓         Both — operational view
  GC (Growing Cost) tracking          ✓              ✓         Both — profitability
  GC cost input & breakdown           ✓              ✓         Both — cost management
  Harvest Window banner               ✓              ✓         Both — timing alert
  Farm compare (multi-farm radar)     ✗              ✓         PRO — multi-farm only

ANALYTICS & INTELLIGENCE
  Portfolio metrics dashboard         ✗              ✓         PRO — multi-farm aggregation
  FCR trend across portfolio          ✗              ✓         PRO — portfolio view
  Batch ROI Optimizer/Calculator      ✓              ✓         Both — decision support
  Calculator connected to GC         ✓              ✓         Both — real cost data
  Sell vs Hold matrix (basic)         ✓              ✓         Both — core feature
  Sell vs Hold matrix (full AI)       ✗              ✓         PRO — confidence dots, AI signal
  Feed Intelligence (commodity prices)✓              ✓         Both — procurement decision
  Feed cost timing recommendation     ✓              ✓         Both — saves money
  Feed cost impact calculator         ✓              ✓         Both — basic calculation
  Procurement pre-order (multi-farm)  ✗              ✓         PRO — multi-farm bulk order
  Middleman Check                     ✓              ✓         Both — fairness tool
  Spread history chart (30-day)       ✗              ✓         PRO — trend analysis
  Negotiation script generator (AI)   ✗              ✓         PRO — AI feature

EMPLOYEE & BUSINESS MANAGEMENT
  Employee management module          ✗              ✓         PRO — integrator feature
  Salary processing & records         ✗              ✓         PRO — payroll management
  Business expense tracking           ✗              ✓         PRO — P&L requirement
  P&L Overview dashboard              ✗              ✓         PRO — financial intelligence
  Salary → GC auto-sync               ✗              ✓         PRO — advanced cost tracking

REPORTING & EXPORT
  Daily log CSV export                ✓              ✓         Both — data ownership
  Batch report (PDF)                  ✓              ✓         Both — basic reporting
  Farm comparison report (PDF)        ✗              ✓         PRO — portfolio reporting
  GC report (PDF)                     ✓              ✓         Both — cost transparency
  P&L report (PDF)                    ✗              ✓         PRO — financial reporting
  API access (JSON webhook)           ✗              ✓         PRO — enterprise integration
  Scheduled email reports             ✗              ✓         PRO — enterprise automation

ALERTS & NOTIFICATIONS
  Disease/HPAI alerts                 ✓              ✓         Both — safety critical
  Weather alerts                      ✓              ✓         Both — farm operations
  Price alerts (basic: above/below)   ✓              ✓         Both — basic market intel
  Price alerts (signal change)        ✗              ✓         PRO — AI signal alerts
  Custom alert rules                  ✗              ✓         PRO — enterprise config
  Daily summary digest                ✓              ✓         Both — engagement

TEAM & SETTINGS
  1 user (owner only)                 ✓              ✗         FARM: single user
  Up to 5 team members                ✗              ✓         PRO: team access
  Role-based access control           ✗              ✓         PRO: role management
  WhatsApp integration setup          ✓              ✓         Both — retention critical
  Priority support                    ✗              ✓         PRO: dedicated support

LIMITS SUMMARY:
  FARM Plan:    Max 3 farms | 1 user | 7-day forecast | 3-batch history
  PRO Plan:     Unlimited farms | 5 users | 30-day forecast | Full history
```

---

## DATABASE CHANGES

### FILE: `supabase/migrations/[timestamp]_new_pricing_tiers.sql`

```sql
-- ════════════════════════════════════════════════════
-- PRICING TIER REDESIGN — FlockIQ v2 Pricing
-- ════════════════════════════════════════════════════

-- Update plan enum to new plan names
-- (Do NOT drop old values yet — needed for migration mapping)
ALTER TYPE subscription_plan_enum ADD VALUE IF NOT EXISTS 'FLOCKIQ_FARM';
ALTER TYPE subscription_plan_enum ADD VALUE IF NOT EXISTS 'FLOCKIQ_PRO';

-- Add subscription_type column for billing frequency
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS
  subscription_type VARCHAR(20) DEFAULT 'monthly'
    CHECK (subscription_type IN ('monthly', 'annual', 'lifetime'));

-- Add lifetime deal tracking columns
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS
  lifetime_start_date     DATE,           -- When lifetime deal was purchased
  lifetime_end_date       DATE,           -- 5 years from start date
  lifetime_renewal_offered BOOLEAN DEFAULT FALSE,  -- Has renewal been offered?
  lifetime_renewal_accepted BOOLEAN DEFAULT FALSE;

-- Add annual billing support
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS
  billing_period_months   INTEGER DEFAULT 1,  -- 1=monthly, 12=annual
  next_renewal_date       DATE,
  grandfathered_until     DATE;               -- Old price guaranteed until this date

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
ALTER TABLE plan_price_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_price_points" ON plan_price_points FOR SELECT USING (TRUE);

ALTER TABLE plan_feature_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_entitlements" ON plan_feature_entitlements FOR SELECT USING (TRUE);
```

---

## FEATURE GATING LIBRARY

### FILE: `apps/web/lib/plans/featureGates.ts`

```typescript
// Single source of truth for all feature gating logic.
// Import this wherever you need to check feature access.

export type PlanName = 'FLOCKIQ_FARM' | 'FLOCKIQ_PRO'
export type SubscriptionType = 'monthly' | 'annual' | 'lifetime'
export type BillingCycle = 'monthly' | 'annual'

export interface UserSubscription {
  planName:          PlanName | null
  subscriptionType:  SubscriptionType
  status:            'active' | 'expired' | 'cancelled' | 'grace_period'
  lifetimeStartDate: Date | null
  lifetimeEndDate:   Date | null
  nextRenewalDate:   Date | null
  grandfatheredUntil: Date | null  // old price guaranteed until this date
}

export interface FeatureAccess {
  hasAccess:    boolean
  limitValue:   number | null   // null = unlimited
  limitUnit:    string | null
  upgradeTarget: PlanName | null  // which plan unlocks this feature
  reason?:       string           // why access is denied
}

// ── PLAN PRICING CONSTANTS ────────────────────────────────────────────────────
export const PLAN_PRICING = {
  FLOCKIQ_FARM: {
    monthly:  5000,
    annual:   50000,
    lifetime: 150000,
    lifetimeTenureYears: 5,
    lifetimeRenewal: 75000,
    annualMonthlySavings: 833,     // ₹50K/12 = ₹4,167/mo (vs ₹5K = save ₹833/mo)
    lifetimeMonthlySavings: 2500,  // ₹1.5L/60mo = ₹2,500/mo vs ₹5K/mo
    lifetimeTotalSavings: 150000,  // ₹5K × 60mo - ₹1.5L = ₹1.5L savings
  },
  FLOCKIQ_PRO: {
    monthly:  8000,
    annual:   80000,
    lifetime: 250000,
    lifetimeTenureYears: 5,
    lifetimeRenewal: 125000,
    annualMonthlySavings: 1333,
    lifetimeMonthlySavings: 3833,  // ₹2.5L/60mo = ₹4,167 vs ₹8K = save ₹3,833/mo
    lifetimeTotalSavings: 230000,  // ₹8K × 60mo - ₹2.5L = ₹2.3L savings
  },
} as const

// ── FEATURE KEYS ──────────────────────────────────────────────────────────────
// These match exactly the feature_key values in plan_feature_entitlements table
export const FEATURES = {
  // Price Intelligence
  PRICE_TODAY:                'price_today',
  PRICE_HISTORY_7D:           'price_history_7d',
  PRICE_HISTORY_30D:          'price_history_30d',
  FORECAST_30DAY:             'forecast_30day',
  FORECAST_7DAY:              'forecast_7day',
  SELL_SIGNAL_TODAY:          'sell_signal_today',
  SELL_SIGNAL_OPTIMAL_WINDOW: 'sell_signal_optimal_window',
  PRICE_DRIVERS_SHAP:         'price_drivers_shap',
  ACCURACY_DECAY_VIZ:         'accuracy_decay_viz',
  FORECAST_EXPORT_CSV:        'forecast_export_csv',
  COMPARE_MANDIS:             'compare_mandis',
  DISTRICT_MAP:               'district_map',
  DISEASE_ALERTS:             'disease_alerts',
  // Farm Operations
  FARM_MANAGEMENT:            'farm_management',
  DAILY_LOG_MANUAL:           'daily_log_manual',
  WHATSAPP_DAILY_LOG:         'whatsapp_daily_log',
  FARM_METRICS_TAB:           'farm_metrics_tab',
  FARM_HEALTH_TAB:            'farm_health_tab',
  FARM_FEED_TAB:              'farm_feed_tab',
  BATCH_HISTORY:              'batch_history',
  BATCH_STATUS_BOARD:         'batch_status_board',
  GC_TRACKING:                'gc_tracking',
  HARVEST_WINDOW_BANNER:      'harvest_window_banner',
  FARM_COMPARE:               'farm_compare',
  // Analytics
  PORTFOLIO_METRICS:          'portfolio_metrics',
  CALCULATOR:                 'calculator',
  SELL_HOLD_MATRIX_BASIC:     'sell_hold_matrix_basic',
  SELL_HOLD_MATRIX_AI:        'sell_hold_matrix_ai',
  FEED_INTELLIGENCE:          'feed_intelligence',
  FEED_PROCUREMENT_MULTIFARM: 'feed_procurement_multifarm',
  MIDDLEMAN_CHECK:            'middleman_check',
  MIDDLEMAN_SPREAD_HISTORY:   'middleman_spread_history',
  NEGOTIATION_SCRIPT_AI:      'negotiation_script_ai',
  // Employee Module
  EMPLOYEE_MANAGEMENT:        'employee_management',
  SALARY_MANAGEMENT:          'salary_management',
  EXPENSE_TRACKING:           'expense_tracking',
  PL_OVERVIEW:                'pl_overview',
  // Reports
  DAILY_LOG_EXPORT_CSV:       'daily_log_export_csv',
  BATCH_REPORT_PDF:           'batch_report_pdf',
  FARM_COMPARE_REPORT:        'farm_compare_report',
  GC_REPORT_PDF:              'gc_report_pdf',
  PL_REPORT_PDF:              'pl_report_pdf',
  API_ACCESS:                 'api_access',
  SCHEDULED_REPORTS:          'scheduled_reports',
  // Alerts
  WEATHER_ALERTS:             'weather_alerts',
  PRICE_ALERTS_BASIC:         'price_alerts_basic',
  PRICE_ALERTS_SIGNAL:        'price_alerts_signal',
  CUSTOM_ALERT_RULES:         'custom_alert_rules',
  DAILY_DIGEST:               'daily_digest',
  // Team
  TEAM_MEMBERS:               'team_members',
  ROLE_BASED_ACCESS:          'role_based_access',
  PRIORITY_SUPPORT:           'priority_support',
} as const

export type FeatureKey = typeof FEATURES[keyof typeof FEATURES]

// ── CLIENT-SIDE FEATURE CHECK (from pre-fetched entitlements) ─────────────────
// Load this at app startup from /api/subscription/entitlements
// Store in Zustand or React Context for instant access throughout app

export interface UserEntitlements {
  planName:          PlanName | null
  subscriptionType:  SubscriptionType
  features:          Record<FeatureKey, FeatureAccess>
  isLifetimeExpired: boolean
  daysUntilExpiry:   number | null   // for lifetime deals: days left in 5-year tenure
}

// Check if a feature is accessible (use this everywhere in components)
export function canAccess(
  entitlements: UserEntitlements | null,
  feature: FeatureKey
): FeatureAccess {
  if (!entitlements) {
    return { hasAccess: false, limitValue: null, limitUnit: null, upgradeTarget: 'FLOCKIQ_FARM' }
  }

  const access = entitlements.features[feature]

  if (!access) {
    return { hasAccess: false, limitValue: null, limitUnit: null, upgradeTarget: 'FLOCKIQ_PRO' }
  }

  // Override: if lifetime deal has expired, deny access
  if (entitlements.isLifetimeExpired) {
    return {
      hasAccess: false,
      limitValue: null,
      limitUnit: null,
      upgradeTarget: entitlements.planName,
      reason: 'lifetime_expired'
    }
  }

  return access
}

// Get the upgrade target plan for a feature
export function getUpgradePlanFor(feature: FeatureKey): PlanName {
  // Features that require PRO
  const proOnlyFeatures: FeatureKey[] = [
    FEATURES.FORECAST_30DAY,
    FEATURES.PRICE_HISTORY_30D,
    FEATURES.SELL_SIGNAL_OPTIMAL_WINDOW,
    FEATURES.PRICE_DRIVERS_SHAP,
    FEATURES.ACCURACY_DECAY_VIZ,
    FEATURES.FORECAST_EXPORT_CSV,
    FEATURES.COMPARE_MANDIS,
    FEATURES.FARM_COMPARE,
    FEATURES.PORTFOLIO_METRICS,
    FEATURES.SELL_HOLD_MATRIX_AI,
    FEATURES.FEED_PROCUREMENT_MULTIFARM,
    FEATURES.MIDDLEMAN_SPREAD_HISTORY,
    FEATURES.NEGOTIATION_SCRIPT_AI,
    FEATURES.EMPLOYEE_MANAGEMENT,
    FEATURES.SALARY_MANAGEMENT,
    FEATURES.EXPENSE_TRACKING,
    FEATURES.PL_OVERVIEW,
    FEATURES.FARM_COMPARE_REPORT,
    FEATURES.PL_REPORT_PDF,
    FEATURES.API_ACCESS,
    FEATURES.SCHEDULED_REPORTS,
    FEATURES.PRICE_ALERTS_SIGNAL,
    FEATURES.CUSTOM_ALERT_RULES,
    FEATURES.TEAM_MEMBERS,
    FEATURES.ROLE_BASED_ACCESS,
    FEATURES.PRIORITY_SUPPORT,
  ]

  return proOnlyFeatures.includes(feature) ? 'FLOCKIQ_PRO' : 'FLOCKIQ_FARM'
}

// Format price for display
export function formatPlanPrice(plan: PlanName, billing: BillingCycle | 'lifetime'): string {
  const pricing = PLAN_PRICING[plan]
  if (billing === 'monthly')  return `₹${pricing.monthly.toLocaleString('en-IN')}/month`
  if (billing === 'annual')   return `₹${pricing.annual.toLocaleString('en-IN')}/year`
  if (billing === 'lifetime') return `₹${pricing.lifetime.toLocaleString('en-IN')} (one-time)`
  return ''
}

// Compute lifetime deal expiry info
export function getLifetimeExpiryInfo(startDate: Date): {
  endDate:         Date
  daysRemaining:   number
  yearsRemaining:  number
  isExpired:       boolean
  renewalPrice:    number
} {
  const endDate = new Date(startDate)
  endDate.setFullYear(endDate.getFullYear() + 5)
  const today = new Date()
  const msRemaining = endDate.getTime() - today.getTime()
  const daysRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60 * 24)))

  return {
    endDate,
    daysRemaining,
    yearsRemaining: Math.max(0, Math.floor(daysRemaining / 365)),
    isExpired: daysRemaining <= 0,
    renewalPrice: 0,   // caller determines based on plan
  }
}
```

---

## FEATURE GATE COMPONENT

### FILE: `apps/web/components/plans/FeatureGate.tsx`

```typescript
'use client'
// Wrap any PRO-only UI element in <FeatureGate feature={FEATURES.FORECAST_30DAY}>
// If user doesn't have access → renders the upgrade prompt instead

import { useEntitlements } from '@/lib/plans/useEntitlements'
import { canAccess, FEATURES, getUpgradePlanFor } from '@/lib/plans/featureGates'
import type { FeatureKey } from '@/lib/plans/featureGates'
import { PlanUpgradePrompt } from './PlanUpgradePrompt'

interface FeatureGateProps {
  feature:      FeatureKey
  children:     React.ReactNode
  fallback?:    React.ReactNode        // Custom fallback (if not provided, uses PlanUpgradePrompt)
  blurChildren?: boolean              // Instead of hiding, blur + overlay the children
  showLock?:    boolean               // Show lock icon on blurred content
}

export function FeatureGate({
  feature, children, fallback, blurChildren = false, showLock = true
}: FeatureGateProps) {
  const { entitlements } = useEntitlements()
  const access = canAccess(entitlements, feature)

  if (access.hasAccess) {
    return <>{children}</>
  }

  // Blur mode: shows content but blurred with upgrade overlay
  if (blurChildren) {
    return (
      <div className="relative">
        <div className="blur-sm select-none pointer-events-none" aria-hidden="true">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center
                        bg-white/70 backdrop-blur-sm rounded-xl">
          <PlanUpgradePrompt
            feature={feature}
            upgradeTarget={getUpgradePlanFor(feature)}
            compact={true}
          />
        </div>
      </div>
    )
  }

  // Default: replace with upgrade prompt
  if (fallback) return <>{fallback}</>

  return (
    <PlanUpgradePrompt
      feature={feature}
      upgradeTarget={getUpgradePlanFor(feature)}
    />
  )
}

// Simpler hook-based check for conditional rendering
export function useFeature(feature: FeatureKey) {
  const { entitlements } = useEntitlements()
  return canAccess(entitlements, feature)
}
```

---

## UPGRADE PROMPT COMPONENT

### FILE: `apps/web/components/plans/PlanUpgradePrompt.tsx`

```typescript
'use client'
// Shown wherever a feature is locked.
// Two variants: compact (for inline/overlay) and standard (for full empty states)

import Link from 'next/link'
import { Lock } from '@phosphor-icons/react'
import type { FeatureKey, PlanName } from '@/lib/plans/featureGates'
import { PLAN_PRICING } from '@/lib/plans/featureGates'

const FEATURE_LABELS: Partial<Record<FeatureKey, { en: string; hi: string; description: string }>> = {
  forecast_30day:             { en: '30-Day Price Forecast',    hi: '30 दिन का मूल्य पूर्वानुमान', description: 'See P10/P50/P90 forecast up to 30 days ahead' },
  price_drivers_shap:         { en: 'Price Driver Analysis',    hi: 'मूल्य कारण विश्लेषण',           description: 'AI-powered analysis of why prices move' },
  sell_signal_optimal_window: { en: 'Optimal Sell Window',      hi: 'सर्वोत्तम बिक्री विंडो',         description: 'AI-computed best days to sell your batch' },
  portfolio_metrics:          { en: 'Portfolio Dashboard',      hi: 'पोर्टफोलियो डैशबोर्ड',          description: 'Aggregated metrics across all your farms' },
  employee_management:        { en: 'Employee Management',      hi: 'कर्मचारी प्रबंधन',               description: 'Manage staff, salaries, and business expenses' },
  farm_compare:               { en: 'Farm Comparison',          hi: 'Farm तुलना',                    description: 'Compare performance across all your farms' },
  pl_overview:                { en: 'P&L Dashboard',            hi: 'लाभ-हानि डैशबोर्ड',              description: 'Complete monthly profit & loss overview' },
  api_access:                 { en: 'API Access',               hi: 'API एक्सेस',                     description: 'Programmatic access to price forecasts' },
  team_members:               { en: 'Team Management',          hi: 'टीम प्रबंधन',                    description: 'Add up to 5 team members with role-based access' },
  farm_management:            { en: 'Add More Farms',           hi: 'और Farms जोड़ें',                description: 'Manage unlimited farms across your portfolio' },
}

interface PlanUpgradePromptProps {
  feature:       FeatureKey
  upgradeTarget: PlanName
  compact?:      boolean
  language?:     string
}

export function PlanUpgradePrompt({
  feature, upgradeTarget, compact = false, language = 'hi'
}: PlanUpgradePromptProps) {
  const isHindi = language === 'hi'
  const label   = FEATURE_LABELS[feature]
  const pricing = PLAN_PRICING[upgradeTarget]
  const planDisplayName = upgradeTarget === 'FLOCKIQ_FARM' ? 'FlockIQ FARM' : 'FlockIQ PRO'

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <div className="w-9 h-9 rounded-full bg-[#EDF7F1] flex items-center justify-center">
          <Lock size={18} color="#1A5C34" weight="bold" />
        </div>
        <p className="text-xs font-semibold text-gray-900">
          {isHindi
            ? `यह feature ${planDisplayName} plan में है`
            : `Available in ${planDisplayName}`}
        </p>
        <p className="text-[10px] text-gray-500">
          ₹{pricing.monthly.toLocaleString('en-IN')}/month
        </p>
        <Link
          href="/dashboard/settings/billing"
          className="text-xs font-semibold text-[#1A5C34] underline"
        >
          {isHindi ? 'Upgrade करें →' : 'Upgrade →'}
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 text-center max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-full bg-[#EDF7F1] flex items-center justify-center mx-auto mb-4">
        <Lock size={22} color="#1A5C34" weight="bold" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {isHindi
          ? `${label?.hi ?? 'यह Feature'} उपलब्ध नहीं है`
          : `${label?.en ?? 'This Feature'} Not Available`}
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        {isHindi
          ? `यह ${planDisplayName} plan में उपलब्ध है। ₹${pricing.monthly.toLocaleString('en-IN')}/month से शुरू।`
          : `${label?.description ?? 'Upgrade to unlock this feature.'} Available in ${planDisplayName} at ₹${pricing.monthly.toLocaleString('en-IN')}/month.`}
      </p>
      <Link
        href="/dashboard/settings/billing"
        className="inline-flex items-center gap-2 bg-[#1A5C34] text-white text-sm font-medium
                   px-5 py-2.5 rounded-lg hover:bg-[#1F7040] transition-colors"
      >
        {isHindi ? `${planDisplayName} में Upgrade करें` : `Upgrade to ${planDisplayName}`}
      </Link>
      <p className="text-[10px] text-gray-400 mt-3">
        {isHindi
          ? 'या ₹' + pricing.lifetime.toLocaleString('en-IN') + ' में Lifetime Deal लें (5 साल)'
          : 'Or get Lifetime Deal at ₹' + pricing.lifetime.toLocaleString('en-IN') + ' (5 years)'}
      </p>
    </div>
  )
}
```

---

## BILLING PAGE — COMPLETE REDESIGN

### FILE: `apps/web/app/dashboard/settings/billing/page.tsx`

Build the complete billing page with these sections:

**SECTION 1: Current Plan Card**
```
If on FARM plan:
  ┌─────────────────────────────────────────────────────┐
  │  FlockIQ FARM                          Your Plan ✓  │
  │  ₹5,000/month · Monthly billing                     │
  │  Next billing: Jul 1, 2026                          │
  │  [Change to Annual — Save ₹10,000/year]             │
  └─────────────────────────────────────────────────────┘

If on LIFETIME deal:
  ┌─────────────────────────────────────────────────────┐
  │  FlockIQ PRO — LIFETIME DEAL          Your Plan ✓  │
  │  Purchased: Jan 15, 2026                            │
  │  Valid until: Jan 15, 2031 (5-year tenure)         │
  │  ████████████████░░░░░░ 1,680 days remaining        │  ← progress bar
  │  All future updates included during your tenure.    │
  │  Renewal after Jan 2031: ₹1,25,000                 │
  └─────────────────────────────────────────────────────┘
```

**SECTION 2: Plan Toggle — Monthly / Annual / Lifetime**
```
Build a 3-option toggle at top of plan comparison:
  [Monthly ●] [Annual — Save 17%] [Lifetime Deal — 5 Years]

When "Lifetime Deal" is selected, show special callout:
  ┌─────────────────────────────────────────────────────┐
  │  💎 Lifetime Deal — Subject to 5-Year Tenure        │
  │  Pay once. Use for 5 years. All updates included.  │
  │  After Year 5: renew at 50% price or keep monthly. │
  │  ⚠ Non-refundable after 3 accesses. Non-transferable│
  └─────────────────────────────────────────────────────┘
```

**SECTION 3: Plan Comparison Cards (side by side)**
```
Two cards: FARM | PRO

Each card shows:
  Plan name + "Most Popular" badge (on PRO)
  Price for selected billing cycle
  Monthly equivalent (for annual and lifetime)
  Total savings callout
  [Start with FARM / Upgrade to PRO] CTA button (disabled if current plan)

  Feature list (grouped, expandable):
    Price Intelligence section (show 3–5 key features)
    Farm Operations section
    Analytics section
    Team & Support section
    [Show all features ▼] expandable

FARM card example (when Lifetime selected):
  ┌─────────────────────────────────────────────────────┐
  │  FlockIQ FARM                                       │
  │                                                     │
  │  ₹1,50,000  one-time                               │
  │  = ₹2,500/month equivalent                         │
  │  Save ₹1,50,000 over 5 years vs monthly            │
  │  Renew at ₹75,000 after Year 5                     │
  │                                                     │
  │  ✓ Live mandi prices + 7-day forecast              │
  │  ✓ Up to 3 farms                                   │
  │  ✓ Daily log (manual + WhatsApp)                   │
  │  ✓ GC cost tracking                                │
  │  ✓ Basic sell/hold signal                          │
  │  ✗ 30-day AI forecast               [PRO only]     │
  │  ✗ Employee management              [PRO only]     │
  │  ✗ Portfolio metrics dashboard      [PRO only]     │
  │                                                     │
  │  [Get FARM Lifetime Deal]                           │
  │  Secure payment via Razorpay                        │
  └─────────────────────────────────────────────────────┘

PRO card example (when Lifetime selected):
  ┌─────────────────────────────────────────────────────┐
  │  FlockIQ PRO                         ⭐ BEST VALUE  │
  │                                                     │
  │  ₹2,50,000  one-time                               │
  │  = ₹4,167/month equivalent                         │
  │  Save ₹2,30,000 over 5 years vs monthly            │
  │  Renew at ₹1,25,000 after Year 5                   │
  │                                                     │
  │  ✓ Everything in FARM, plus:                       │
  │  ✓ 30-day AI price forecast (P10/P50/P90)          │
  │  ✓ Unlimited farms + team (5 users)                │
  │  ✓ Employee management + P&L dashboard             │
  │  ✓ Portfolio metrics across all farms              │
  │  ✓ AI sell window + price driver analysis          │
  │  ✓ Priority support                                │
  │  [Show all 40+ features ▼]                         │
  │                                                     │
  │  [Get PRO Lifetime Deal]                            │
  │  Secure payment via Razorpay                        │
  └─────────────────────────────────────────────────────┘
```

**SECTION 4: Full Feature Comparison Table (expandable)**
```
Collapsible table with ALL features grouped by category.
Use checkmarks (✓), x marks (✗), and limit badges (e.g., "3 farms", "7 days")
Export this as a reference for users comparing plans.
```

**SECTION 5: Lifetime Deal FAQ (when lifetime billing is selected)**
```
Collapsible FAQ section with these questions:
  Q: "Lifetime का मतलब क्या है?" / "What does 'lifetime' mean?"
  A: 5-year tenure from purchase date. After 5 years, renewal at 50% of current price.

  Q: "क्या यह refundable है?" / "Is it refundable?"
  A: Non-refundable after platform is accessed more than 3 times. 30-day money-back otherwise.

  Q: "क्या plan transfer हो सकता है?" / "Can I transfer the plan?"
  A: Non-transferable. Tied to the registered business entity.

  Q: "5 साल में क्या नए features मिलेंगे?" / "What about new features?"
  A: All feature updates during your tenure are included at no extra cost.

  Q: "5 साल बाद क्या होगा?" / "What happens after 5 years?"
  A: We'll offer renewal at 50% of the then-current lifetime price.
```

**SECTION 6: Payment Method + Invoice History (for recurring subscribers)**

---

## FEATURE GATING IMPLEMENTATION — WHERE TO ADD GATES

### LIST OF ALL PLACES THAT NEED FEATURE GATES:

Add `<FeatureGate>` wrapper or `useFeature()` check to ALL of these:

```typescript
// 1. FORECAST PAGE — entire forecast section
// File: apps/web/app/dashboard/price-intelligence/forecast/page.tsx
// FARM users: show 7-day forecast only; PRO: full 30-day
// Implementation:
const forecastAccess = canAccess(entitlements, FEATURES.FORECAST_30DAY)
const horizon = forecastAccess.hasAccess ? 30 : 7

// 2. FORECAST PAGE — Price Drivers Card
// File: .../ForecastPageClient.tsx
<FeatureGate feature={FEATURES.PRICE_DRIVERS_SHAP} blurChildren>
  <PriceDriversCard ... />
</FeatureGate>

// 3. FORECAST PAGE — Accuracy Decay Card
<FeatureGate feature={FEATURES.ACCURACY_DECAY_VIZ} blurChildren>
  <AccuracyDecayCard ... />
</FeatureGate>

// 4. FORECAST PAGE — Optimal Sell Window in SellSignalCard
// Show basic SELL/HOLD/CAUTION to FARM users
// Hide optimal window dates/prices (PRO only)
<FeatureGate feature={FEATURES.SELL_SIGNAL_OPTIMAL_WINDOW}>
  <div>Optimal window: {windowStart}–{windowEnd}</div>
</FeatureGate>

// 5. FORECAST PAGE — Export CSV button
<FeatureGate feature={FEATURES.FORECAST_EXPORT_CSV}>
  <button>Export CSV</button>
</FeatureGate>

// 6. FORECAST PAGE — Compare Mandis button
<FeatureGate feature={FEATURES.COMPARE_MANDIS}>
  <button>Compare Mandis</button>
</FeatureGate>

// 7. FARM PORTFOLIO — Add Farm button (check farm count limit)
// File: apps/web/app/dashboard/farms/page.tsx
// If FARM plan and farms.length >= 3: show upgrade prompt instead
const farmAccess = canAccess(entitlements, FEATURES.FARM_MANAGEMENT)
if (!farmAccess.hasAccess || (farmAccess.limitValue && farms.length >= farmAccess.limitValue)) {
  // Show: "You've reached the 3-farm limit on FlockIQ FARM. Upgrade to PRO for unlimited farms."
}

// 8. FARM COMPARE — entire page
// File: apps/web/app/dashboard/farms/compare/page.tsx
// Wrap entire page content
if (!canAccess(entitlements, FEATURES.FARM_COMPARE).hasAccess) {
  return <PlanUpgradePrompt feature={FEATURES.FARM_COMPARE} upgradeTarget="FLOCKIQ_PRO" />
}

// 9. PORTFOLIO METRICS — entire page
// File: apps/web/app/dashboard/metrics/page.tsx
if (!canAccess(entitlements, FEATURES.PORTFOLIO_METRICS).hasAccess) {
  return <PlanUpgradePrompt feature={FEATURES.PORTFOLIO_METRICS} upgradeTarget="FLOCKIQ_PRO" />
}

// 10. EMPLOYEES PAGE — entire page
// File: apps/web/app/dashboard/employees/page.tsx
if (!canAccess(entitlements, FEATURES.EMPLOYEE_MANAGEMENT).hasAccess) {
  return <PlanUpgradePrompt feature={FEATURES.EMPLOYEE_MANAGEMENT} upgradeTarget="FLOCKIQ_PRO" />
}

// 11. MIDDLEMAN CHECK — Spread History Chart (PRO only)
<FeatureGate feature={FEATURES.MIDDLEMAN_SPREAD_HISTORY} blurChildren>
  <SpreadHistoryChart ... />
</FeatureGate>

// 12. MIDDLEMAN CHECK — Negotiation Script Generator (PRO only)
<FeatureGate feature={FEATURES.NEGOTIATION_SCRIPT_AI}>
  <NegotiationScriptCard ... />
</FeatureGate>

// 13. SELL vs HOLD MATRIX — AI confidence dots and full analysis (PRO only)
// FARM users: see basic signal per horizon row only (no confidence dots)
// PRO users: see full matrix with AI confidence dots
<FeatureGate feature={FEATURES.SELL_HOLD_MATRIX_AI}>
  {/* Confidence dots */}
  <div className="flex gap-1 ml-auto">...</div>
</FeatureGate>

// 14. ALERTS — Signal change alerts (PRO only)
<FeatureGate feature={FEATURES.PRICE_ALERTS_SIGNAL}>
  <AlertTypeOption type="signal_sell" />
</FeatureGate>

// 15. ALERTS — Custom alert rules (PRO only)
<FeatureGate feature={FEATURES.CUSTOM_ALERT_RULES}>
  <button>+ Add Custom Alert Rule</button>
</FeatureGate>

// 16. SETTINGS TEAM — Team members (PRO only)
// FARM users: show "Team management requires FlockIQ PRO"
const teamAccess = canAccess(entitlements, FEATURES.TEAM_MEMBERS)
if (!teamAccess.hasAccess) {
  return <PlanUpgradePrompt feature={FEATURES.TEAM_MEMBERS} upgradeTarget="FLOCKIQ_PRO" />
}

// 17. REPORTS — P&L Report (PRO only)
<FeatureGate feature={FEATURES.PL_REPORT_PDF}>
  <button>Download P&L Report</button>
</FeatureGate>

// 18. REPORTS — Farm Compare Report (PRO only)
<FeatureGate feature={FEATURES.FARM_COMPARE_REPORT}>
  <button>Download Comparison Report</button>
</FeatureGate>

// 19. BATCH HISTORY — limit to 3 batches on FARM plan
// If FARM plan and viewing page > 1 (i.e., more than 3 batches):
const batchAccess = canAccess(entitlements, FEATURES.BATCH_HISTORY)
// Show only last 3 batches; after 3, show upgrade prompt row:
// "You have 7 completed batches. View all with FlockIQ PRO. [Upgrade →]"

// 20. PRICE HISTORY — limit to 7 days on FARM plan
// In /dashboard/price-intelligence/historical
// If FARM plan: date range picker maximum = today - 7 days
const historyAccess = canAccess(entitlements, FEATURES.PRICE_HISTORY_30D)
const maxDaysHistory = historyAccess.hasAccess ? 90 : 7
```

---

## SUBSCRIPTION CONTEXT PROVIDER

### FILE: `apps/web/lib/plans/useEntitlements.ts`

```typescript
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import type { UserEntitlements } from './featureGates'

const EntitlementsContext = createContext<{
  entitlements:    UserEntitlements | null
  isLoading:       boolean
  refresh:         () => Promise<void>
} | null>(null)

export function EntitlementsProvider({ children }: { children: React.ReactNode }) {
  const [entitlements, setEntitlements] = useState<UserEntitlements | null>(null)
  const [isLoading, setIsLoading]       = useState(true)

  async function fetchEntitlements() {
    try {
      const res  = await fetch('/api/subscription/entitlements')
      const data = await res.json()
      setEntitlements(data)
    } catch (err) {
      console.error('Failed to load entitlements:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEntitlements()
  }, [])

  return (
    <EntitlementsContext.Provider value={{ entitlements, isLoading, refresh: fetchEntitlements }}>
      {children}
    </EntitlementsContext.Provider>
  )
}

export function useEntitlements() {
  const ctx = useContext(EntitlementsContext)
  if (!ctx) throw new Error('useEntitlements must be used within EntitlementsProvider')
  return ctx
}
```

### FILE: `apps/web/app/api/subscription/entitlements/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get user subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_name, subscription_type, status, lifetime_start_date, lifetime_end_date, next_renewal_date, grandfathered_until')
    .eq('user_id', session.user.id)
    .single()

  const planName = sub?.plan_name ?? null

  // Check lifetime validity
  let isLifetimeExpired = false
  let daysUntilExpiry: number | null = null

  if (sub?.subscription_type === 'lifetime' && sub.lifetime_end_date) {
    const endDate     = new Date(sub.lifetime_end_date)
    const today       = new Date()
    const msRemaining = endDate.getTime() - today.getTime()
    daysUntilExpiry   = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60 * 24)))
    isLifetimeExpired = daysUntilExpiry <= 0
  }

  // Fetch all feature entitlements for this plan
  const { data: features } = await supabase
    .from('plan_feature_entitlements')
    .select('feature_key, is_enabled, limit_value, limit_unit')
    .eq('plan_name', planName ?? 'FLOCKIQ_FARM')

  const featureMap: Record<string, any> = {}
  for (const f of features ?? []) {
    featureMap[f.feature_key] = {
      hasAccess:    isLifetimeExpired ? false : f.is_enabled,
      limitValue:   f.limit_value,
      limitUnit:    f.limit_unit,
      upgradeTarget: f.is_enabled ? null : 'FLOCKIQ_PRO',
    }
  }

  return NextResponse.json({
    planName,
    subscriptionType:  sub?.subscription_type ?? 'monthly',
    features:          featureMap,
    isLifetimeExpired,
    daysUntilExpiry,
    grandfatheredUntil: sub?.grandfathered_until ?? null,
  })
}
```

---

## LIFETIME DEAL STATUS WIDGET

### FILE: `apps/web/components/plans/LifetimeDealStatus.tsx`

Show this in the sidebar (below user block) for lifetime deal customers only.

```typescript
'use client'
import { useEntitlements } from '@/lib/plans/useEntitlements'
import { getLifetimeExpiryInfo, PLAN_PRICING } from '@/lib/plans/featureGates'

export function LifetimeDealStatus() {
  const { entitlements } = useEntitlements()

  if (!entitlements || entitlements.subscriptionType !== 'lifetime') return null
  if (!entitlements.daysUntilExpiry) return null

  const daysLeft   = entitlements.daysUntilExpiry
  const totalDays  = 5 * 365   // 5 years
  const usedDays   = totalDays - daysLeft
  const pct        = Math.min(100, Math.round((usedDays / totalDays) * 100))

  // Show prominent warning when < 90 days left
  const isNearExpiry = daysLeft < 90
  const isHindi = true  // get from user preference

  return (
    <div className={`mx-3 mb-2 rounded-lg p-3 ${
      isNearExpiry
        ? 'bg-amber-900/30 border border-amber-700/40'
        : 'bg-[#1A5C34]/20 border border-[#3DAE72]/20'
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-white/80">
          {isHindi ? '💎 Lifetime Deal' : '💎 Lifetime Deal'}
        </span>
        <span className="text-[10px] text-white/60">
          {daysLeft} {isHindi ? 'दिन बाकी' : 'days left'}
        </span>
      </div>
      {/* Tenure progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isNearExpiry ? 'bg-amber-400' : 'bg-[#3DAE72]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isNearExpiry && (
        <p className="text-[10px] text-amber-300 mt-1.5">
          {isHindi
            ? `${daysLeft} दिनों में Renew करें`
            : `Renew in ${daysLeft} days`}
        </p>
      )}
    </div>
  )
}
```

---

## PLAN UPGRADE BANNER

### FILE: `apps/web/components/plans/GrandfatherBanner.tsx`

For existing users migrated from old plans — show during the 3-month grandfather period.

```typescript
'use client'
import { useEntitlements } from '@/lib/plans/useEntitlements'

export function GrandfatherBanner() {
  const { entitlements } = useEntitlements()
  if (!entitlements?.grandfatheredUntil) return null

  const grandfatherDate = new Date(entitlements.grandfatheredUntil)
  const today = new Date()
  if (grandfatherDate < today) return null  // grandfather period ended

  const daysLeft = Math.ceil((grandfatherDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">📢</span>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            हम अपनी pricing update कर रहे हैं
          </p>
          <p className="text-xs text-amber-800 mt-1">
            आप अगले <strong>{daysLeft} दिनों</strong> तक पुरानी कीमत पर FlockIQ use कर सकते हैं।
            उसके बाद नई pricing लागू होगी।
          </p>
          <a href="/dashboard/settings/billing"
             className="text-xs font-semibold text-amber-900 underline mt-2 inline-block">
            नई plans देखें →
          </a>
        </div>
      </div>
    </div>
  )
}
```

---

## SIDEBAR PLAN BADGE UPDATE

**Update:** `apps/web/components/layout/Sidebar.tsx`

Replace old plan badges (PULSE_FARM / PULSE_PRO / PULSE_INTEL) with new plan display:

```typescript
// In the user block section of sidebar:
// Old: <span className="...">PULSE_PRO</span>
// New:

function PlanBadge({ planName, subscriptionType }: { planName: string; subscriptionType: string }) {
  const displayName = planName === 'FLOCKIQ_FARM' ? 'FARM' : 'PRO'
  const isLifetime  = subscriptionType === 'lifetime'

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
      ${planName === 'FLOCKIQ_PRO'
        ? 'bg-[#3DAE72] text-white'
        : 'bg-white/20 text-white'}`}>
      {isLifetime ? `💎 ${displayName}` : displayName}
    </span>
  )
}
```

---

## PRICING PAGE (public-facing)

### FILE: `apps/web/app/pricing/page.tsx`

Create a public `/pricing` page (no auth required) for marketing:

This page is identical to the billing settings page's plan comparison section, but:
- Shows "Get Started" buttons (link to /signup)
- Does NOT show "Current Plan" or payment method sections
- Has a prominent "Compare Plans" full feature table at the bottom
- Has Lifetime Deal callout section
- Has FAQ section
- Mobile responsive

The design should match the FlockIQ brand exactly (same colours, fonts, card styles as the app).

---

## RAZORPAY PAYMENT INTEGRATION

### FILE: `apps/web/app/api/payment/create-order/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Razorpay from 'razorpay'
import { z } from 'zod'

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const OrderSchema = z.object({
  planName:        z.enum(['FLOCKIQ_FARM', 'FLOCKIQ_PRO']),
  billingType:     z.enum(['monthly', 'annual', 'lifetime']),
})

const PLAN_AMOUNTS: Record<string, Record<string, number>> = {
  FLOCKIQ_FARM: { monthly: 500000, annual: 5000000, lifetime: 15000000 },  // in paise (₹ × 100)
  FLOCKIQ_PRO:  { monthly: 800000, annual: 8000000, lifetime: 25000000 },
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { planName, billingType } = parsed.data
  const amountPaise = PLAN_AMOUNTS[planName][billingType]

  const planLabels = {
    FLOCKIQ_FARM: { monthly: 'FlockIQ FARM Monthly', annual: 'FlockIQ FARM Annual', lifetime: 'FlockIQ FARM Lifetime Deal (5 Years)' },
    FLOCKIQ_PRO:  { monthly: 'FlockIQ PRO Monthly',  annual: 'FlockIQ PRO Annual',  lifetime: 'FlockIQ PRO Lifetime Deal (5 Years)' },
  }

  const order = await razorpay.orders.create({
    amount:   amountPaise,
    currency: 'INR',
    notes: {
      user_id:      session.user.id,
      plan_name:    planName,
      billing_type: billingType,
      description:  planLabels[planName][billingType],
    },
  })

  return NextResponse.json({ orderId: order.id, amount: amountPaise, currency: 'INR' })
}
```

### FILE: `apps/web/app/api/payment/verify/route.ts`

```typescript
// Verify Razorpay signature after payment
// On successful verification:
//   1. Create/update subscription record in DB
//   2. Set plan_name, subscription_type, billing dates
//   3. For lifetime: set lifetime_start_date = today, lifetime_end_date = today + 5 years
//   4. Invalidate entitlements cache (user's next page load fetches fresh entitlements)
//   5. Return success + redirect URL to /dashboard?payment_success=1

import { createHmac } from 'crypto'
// ... verify HMAC of razorpay_order_id + razorpay_payment_id using RAZORPAY_KEY_SECRET
// ... then activate subscription
```

---

## ENVIRONMENT VARIABLES NEEDED

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

---

## FILE CREATION CHECKLIST

```
DATABASE:
  ✅ supabase/migrations/[ts]_new_pricing_tiers.sql

PLAN LIBRARY:
  ✅ apps/web/lib/plans/featureGates.ts
  ✅ apps/web/lib/plans/useEntitlements.ts

COMPONENTS:
  ✅ apps/web/components/plans/FeatureGate.tsx
  ✅ apps/web/components/plans/PlanUpgradePrompt.tsx
  ✅ apps/web/components/plans/LifetimeDealStatus.tsx
  ✅ apps/web/components/plans/GrandfatherBanner.tsx

API ROUTES:
  ✅ apps/web/app/api/subscription/entitlements/route.ts
  ✅ apps/web/app/api/payment/create-order/route.ts
  ✅ apps/web/app/api/payment/verify/route.ts

PAGES (create or update):
  ✅ apps/web/app/pricing/page.tsx                           (public pricing page)
  🔄 apps/web/app/dashboard/settings/billing/page.tsx       (complete redesign)

FEATURE GATES (update all these existing files):
  🔄 apps/web/app/dashboard/price-intelligence/forecast/ForecastPageClient.tsx
  🔄 apps/web/app/dashboard/price-intelligence/forecast/components/SellSignalCard.tsx
  🔄 apps/web/app/dashboard/price-intelligence/forecast/components/AccuracyDecayCard.tsx
  🔄 apps/web/app/dashboard/price-intelligence/forecast/components/PriceDriversCard.tsx
  🔄 apps/web/app/dashboard/price-intelligence/forecast/components/SellHoldMatrix.tsx
  🔄 apps/web/app/dashboard/price-intelligence/forecast/components/ForecastControls.tsx
  🔄 apps/web/app/dashboard/price-intelligence/historical/page.tsx
  🔄 apps/web/app/dashboard/farms/page.tsx
  🔄 apps/web/app/dashboard/farms/compare/page.tsx
  🔄 apps/web/app/dashboard/metrics/page.tsx
  🔄 apps/web/app/dashboard/employees/page.tsx
  🔄 apps/web/app/dashboard/middleman/page.tsx
  🔄 apps/web/app/dashboard/alerts/components/AlertSettingsCards.tsx
  🔄 apps/web/app/dashboard/settings/team/page.tsx
  🔄 apps/web/app/dashboard/reports/page.tsx
  🔄 apps/web/app/dashboard/farms/[id]/components/BatchHistoryTab.tsx
  🔄 apps/web/components/layout/Sidebar.tsx                 (plan badge update + lifetime status)

LAYOUT (add EntitlementsProvider):
  🔄 apps/web/app/(dashboard)/layout.tsx                    (wrap with EntitlementsProvider)
```

---

## IMPLEMENTATION ORDER

Work in this exact order to avoid import errors:

```
BATCH 1 — Foundation (no UI dependencies):
  [1] Database migration — run the SQL migration first
  [2] featureGates.ts — types, constants, helper functions
  [3] useEntitlements.ts — context provider
  [4] /api/subscription/entitlements route — fetches entitlements
  [5] dashboard layout.tsx — wrap with EntitlementsProvider

BATCH 2 — Components:
  [6] PlanUpgradePrompt component
  [7] FeatureGate component (depends on PlanUpgradePrompt)
  [8] LifetimeDealStatus widget
  [9] GrandfatherBanner

BATCH 3 — Billing & Pricing Pages:
  [10] Billing settings page (complete redesign)
  [11] Public /pricing page
  [12] Sidebar plan badge update + LifetimeDealStatus placement

BATCH 4 — Feature Gates Across App:
  [13] Forecast page — horizon limit (7-day FARM, 30-day PRO)
  [14] Forecast page — gate: PriceDriversCard, AccuracyDecay, OptimalWindow
  [15] Forecast page — gate: Export CSV, Compare Mandis
  [16] Farm portfolio — gate: farm count limit (3 for FARM plan)
  [17] Farm compare page — gate entire page for PRO
  [18] Portfolio Metrics — gate entire page for PRO
  [19] Employees page — gate entire page for PRO
  [20] Middleman — gate: SpreadHistory, NegotiationScript
  [21] Alerts — gate: signal alerts, custom rules
  [22] Settings Team — gate for PRO
  [23] Reports — gate: P&L report, compare report
  [24] Batch history — limit to 3 batches for FARM
  [25] Price history — limit to 7 days for FARM

BATCH 5 — Payment Integration:
  [26] Razorpay: /api/payment/create-order
  [27] Razorpay: /api/payment/verify
  [28] Connect payment buttons in billing page to Razorpay

BATCH 6 — Migration & QA:
  [29] Migration banner for grandfathered old-plan users
  [30] Test: FARM user cannot see PRO features (blurred or locked)
  [31] Test: PRO user sees all features
  [32] Test: Lifetime countdown shows correctly in sidebar
  [33] Test: Payment flow creates subscription with correct dates
```

---

## QA CHECKLIST

```
IMPLEMENTATION STATUS: ✅ COMPLETE
All feature gates, components, and payment integration have been implemented.
The following QA tests should now be performed to verify the implementation.

PLAN GATING:
  ☐ FARM user on /forecast: chart shows 7-day only, 30-day locked with blur
  ☐ FARM user on /forecast: Accuracy Decay card blurred with upgrade prompt
  ☐ FARM user on /forecast: Price Drivers card blurred with upgrade prompt
  ☐ FARM user on /farms: Add Farm button disabled after 3rd farm with upgrade prompt
  ☐ FARM user on /farms/compare: sees full upgrade prompt (not 404)
  ☐ FARM user on /metrics: sees full upgrade prompt (not blank)
  ☐ FARM user on /employees: sees full upgrade prompt (not blank)
  ☐ PRO user: sees ALL features without any upgrade prompts
  ☐ PRO user: 30-day forecast chart renders correctly (not 7-day)

BILLING PAGE:
  ☐ Monthly/Annual/Lifetime toggle switches all prices
  ☐ Lifetime callout box shows tenure + terms when Lifetime selected
  ☐ Lifetime FAQ section expands/collapses correctly
  ☐ "Get FARM Lifetime Deal" button opens Razorpay with correct amount (₹1,50,000)
  ☐ "Get PRO Lifetime Deal" button opens Razorpay with correct amount (₹2,50,000)
  ☐ Annual savings correctly shown: FARM saves ₹10,000/yr, PRO saves ₹16,000/yr
  ☐ Current plan highlighted with "Your Plan ✓" badge

LIFETIME DEAL:
  ☐ After payment: subscription_type = 'lifetime' in DB
  ☐ After payment: lifetime_start_date = today, lifetime_end_date = today + 5 years
  ☐ Sidebar shows LifetimeDealStatus widget for lifetime customers
  ☐ Days remaining count is correct and decrements daily
  ☐ Warning shown when < 90 days remaining
  ☐ After lifetime_end_date: user sees "Your lifetime deal has expired. Renew to continue."
  ☐ Expired lifetime: same as no subscription (features locked)

GRANDFATHER BANNER:
  ☐ Old PULSE_FARM/PRO/INTEL users see grandfather banner with days remaining
  ☐ Banner disappears after grandfathered_until date
  ☐ Banner links correctly to billing page

PAYMENT:
  ☐ Razorpay order created with correct amount in paise
  ☐ Razorpay signature verified on callback (security check)
  ☐ Subscription activated immediately after payment
  ☐ User sees success toast + redirected to dashboard with plan updated
  ☐ Failed payment: user stays on billing page with error message

ADDITIONAL LIMITS IMPLEMENTED:
  ☐ Batch history limited to 3 batches for FARM plan (verified in BatchHistoryTab)
  ☐ Price history limited to 7 days for FARM plan (verified in forecast API)
  ☐ Settings Team tab hidden for FARM plan users
  ☐ Reports P&L and compare report gated for PRO
  ☐ Middleman SpreadHistory and NegotiationScript gated for PRO
  ☐ Alerts custom rules gated for PRO
```

---