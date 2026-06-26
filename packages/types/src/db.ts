// PoultryPulse AI — Supabase Database Row Types
// File: packages/types/src/db.ts
// Version: v1.0 | May 2026
// Design Reference: Architecture v1.0 §2

import type { MandiSlug, CustomerSegment, SubscriptionTier, SubscriptionStatus, AlertType } from './domain';

/**
 * Customer Row Type
 */
export interface CustomerRow {
  id: string;
  phone_hash: string;
  segment: CustomerSegment;
  mandi: MandiSlug | null;
  bird_count: number | null;
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    expires_at: string;
  } | null;
  device_fingerprint_hash: string | null;
  consent_given: boolean;
  consent_given_at: string | null;
  consent_text_version: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Prediction Row Type
 */
export interface PredictionRow {
  id: string;
  mandi: MandiSlug;
  prediction_date: string;
  p10: number;
  p50: number;
  p90: number;
  drivers: {
    factor: string;
    impact: 'positive' | 'negative';
    magnitude: number;
    description_hi: string;
  }[];
  confidence: number;
  model_version: string;
  staleness_flag: boolean;
  created_at: string;
}

/**
 * Accuracy Log Row Type
 */
export interface AccuracyLogRow {
  id: string;
  prediction_id: string;
  actual_price: number;
  mape_1d: number;
  directional_correct: boolean;
  evaluated_at: string;
}

/**
 * Alert Row Type
 */
export interface AlertRow {
  id: string;
  type: AlertType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title_hi: string;
  body_hi: string;
  district: MandiSlug;
  issued_at: string;
  expires_at: string | null;
  created_at: string;
}

/**
 * Batch Row Type
 */
export interface BatchRow {
  id: string;
  customer_id: string;
  batch_id: string;
  bird_count: number;
  grow_start: string;
  expected_harvest_range: [string, string];
  feed_cost_total: number;
  created_at: string;
  updated_at: string;
}

/**
 * Model Registry Row Type
 */
export interface ModelRegistryRow {
  id: string;
  version: string;
  mape_30d: number;
  directional_accuracy: number;
  conformal_coverage: number;
  promoted_at: string | null;
  archived_at: string | null;
  is_champion: boolean;
  s3_artifact_path: string;
  created_at: string;
}

/**
 * Customer Predictions Served Row Type (Audit Log)
 */
export interface CustomerPredictionsServedRow {
  id: string;
  customer_id: string;
  prediction_id: string;
  served_at: string;
  device_fingerprint_hash: string;
  watermark_token: string;
}

/**
 * Watermark Events Row Type
 */
export interface WatermarkEventsRow {
  id: string;
  watermark_token: string;
  detected_at: string;
  platform: string;
  customer_id: string | null;
  action_taken: string | null;
  resolved_at: string | null;
}

/**
 * Raw Prices Row Type
 */
export interface RawPricesRow {
  id: string;
  source: string;
  district: MandiSlug;
  commodity: string;
  price: number;
  price_date: string;
  fetched_at: string;
  validated: boolean;
  staleness_flag: boolean;
}

/**
 * Sessions Row Type
 */
export interface SessionsRow {
  id: string;
  customer_id: string;
  device_fingerprint_hash: string;
  created_at: string;
  last_active_at: string;
  is_active: boolean;
}
