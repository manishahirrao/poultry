// PoultryPulse AI — Domain Types
// File: packages/types/src/domain.ts
// Version: v1.0 | May 2026
// Design Reference: PRD v3.0 §4, TRD v1.0 §3

/**
 * Customer Segment Types
 * S1: Commercial Farm (10K-50K birds)
 * S2: Mid-Size Integrator (50K-500K birds)
 * S3: Feed Manufacturer (Regional)
 * S4: Poultry Trader/Commission Agent
 * S5: QSR / Processor (Enterprise)
 * S6: Livestock Insurer
 */
export type CustomerSegment = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

/**
 * Mandi (Market) Slugs for Gorakhpur Belt
 * Phase 0 coverage: Gorakhpur + adjacent districts
 */
export type MandiSlug = 'gorakhpur' | 'deoria' | 'basti' | 'kushinagar' | 'maharajganj';

/**
 * Price Driver - Factor influencing price movement
 */
export interface PriceDriver {
  factor: string;
  impact: 'positive' | 'negative';
  magnitude: number;
  description_hi: string;
}

/**
 * Prediction Result - ML model output
 */
export interface PredictionResult {
  p10: number;
  p50: number;
  p90: number;
  drivers: PriceDriver[];
  confidence: number;
  model_version: string;
  staleness_flag: boolean;
  predicted_at: string;
}

/**
 * Sell Signal - Actionable recommendation for farmers
 */
export type SellSignal = 'SELL_NOW' | 'HOLD' | 'SELL_SOON';

export interface SellSignalWithStrength {
  signal: SellSignal;
  signal_strength: number; // 0.0 - 1.0
  optimal_window_start: string;
  optimal_window_end: string;
  profit_estimate: number;
}

/**
 * Alert Types
 */
export type AlertType = 'HPAI_OUTBREAK' | 'WEATHER_EXTREME' | 'PRICE_CRASH' | 'PRICE_SPIKE' | 'FEED_COST_ALERT';

/**
 * Alert - Disease, weather, or price alert
 */
export interface Alert {
  id: string;
  type: AlertType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title_hi: string;
  body_hi: string;
  district: MandiSlug;
  issued_at: string;
  expires_at: string;
}

/**
 * Subscription Tiers
 */
export type SubscriptionTier = 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL';

export type SubscriptionStatus = 'active' | 'trial' | 'expired';

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expires_at: string;
}

/**
 * Batch Record - For batch profit calculator
 */
export interface BatchRecord {
  batch_id: string;
  bird_count: number;
  grow_start: string;
  expected_harvest_range: [string, string];
  feed_cost_total: number;
}

/**
 * Customer Profile
 */
export interface CustomerProfile {
  id: string;
  segment: CustomerSegment;
  mandi: MandiSlug;
  bird_count: number;
  subscription: Subscription;
  device_fingerprint: string;
  created_at: string;
}

/**
 * Accuracy Metrics
 */
export interface AccuracyMetrics {
  mape_30d: number;
  directional_accuracy_30d: number;
  conformal_coverage_80: number;
  as_of: string;
}
