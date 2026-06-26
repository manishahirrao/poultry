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
  grandfatheredUntil: Date | null   // old price guaranteed until this date
}

// Check if a feature is accessible (use this everywhere in components)
// DEMO MODE: All features are accessible for testing
export function canAccess(
  entitlements: UserEntitlements | null,
  feature: FeatureKey
): FeatureAccess {
  // DEMO MODE: Grant access to all features
  return { hasAccess: true, limitValue: null, limitUnit: null, upgradeTarget: null }

  /* Original logic - disabled for demo mode
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
  */
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
