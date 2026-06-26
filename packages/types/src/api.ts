// PoultryPulse AI — API Request/Response Schemas
// File: packages/types/src/api.ts
// Version: v1.0 | May 2026
// Design Reference: TRD v1.0 §4, Architecture v1.0 §3

import { z } from 'zod';
import type { MandiSlug, SellSignal, AlertType } from './domain';

/**
 * Prediction Request Schema
 */
export const PredictionRequestSchema = z.object({
  mandi: z.enum(['gorakhpur', 'deoria', 'basti', 'kushinagar', 'maharajganj']),
  date: z.string().optional(), // ISO date string, defaults to today
});

export type PredictionRequest = z.infer<typeof PredictionRequestSchema>;

/**
 * Price Driver Schema
 */
export const PriceDriverSchema = z.object({
  factor: z.string(),
  impact: z.enum(['positive', 'negative']),
  magnitude: z.number(),
  description_hi: z.string(),
});

/**
 * Prediction Response Schema
 */
export const PredictionResponseSchema = z.object({
  p10: z.number(),
  p50: z.number(),
  p90: z.number(),
  drivers: z.array(PriceDriverSchema),
  confidence: z.number().min(0).max(1),
  model_version: z.string(),
  staleness_flag: z.boolean(),
  predicted_at: z.string(),
  mandi: z.enum(['gorakhpur', 'deoria', 'basti', 'kushinagar', 'maharajganj']),
});

export type PredictionResponse = z.infer<typeof PredictionResponseSchema>;

/**
 * Accuracy Report Schema
 */
export const AccuracyReportSchema = z.object({
  mape_30d: z.number(),
  directional_accuracy_30d: z.number(),
  conformal_coverage_80: z.number(),
  as_of: z.string(),
});

export type AccuracyReport = z.infer<typeof AccuracyReportSchema>;

/**
 * Webhook Payload Schema (Twilio WhatsApp inbound)
 */
export const WebhookPayloadSchema = z.object({
  message_sid: z.string(),
  from: z.string(), // Phone number in format +91XXXXXXXXXX
  to: z.string(),
  body: z.string(),
  num_media: z.number().default(0),
  media_url: z.array(z.string()).optional(),
});

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

/**
 * OTP Request Schema
 */
export const OTPRequestSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
});

export type OTPRequest = z.infer<typeof OTPRequestSchema>;

/**
 * OTP Verify Schema
 */
export const OTPVerifySchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
  otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
  device_fingerprint: z.string().optional(),
});

export type OTPVerify = z.infer<typeof OTPVerifySchema>;

/**
 * Batch Calculator Request Schema
 */
export const BatchCalculatorRequestSchema = z.object({
  flock_size: z.number().min(1000).max(1000000),
  age_days: z.number().min(1).max(60),
  avg_weight_kg: z.number().min(0.5).max(5),
  feed_cost_per_kg: z.number().min(0),
  mandi: z.enum(['gorakhpur', 'deoria', 'basti', 'kushinagar', 'maharajganj']).optional(),
});

export type BatchCalculatorRequest = z.infer<typeof BatchCalculatorRequestSchema>;

/**
 * Batch Calculator Response Schema
 */
export const BatchCalculatorResponseSchema = z.object({
  gross_revenue: z.number(),
  feed_cost_total: z.number(),
  net_margin: z.number(),
  break_even_price: z.number(),
  current_price: z.number(),
  recommendation: z.enum(['SELL_NOW', 'HOLD', 'SELL_SOON']),
  confidence: z.number(),
});

export type BatchCalculatorResponse = z.infer<typeof BatchCalculatorResponseSchema>;

/**
 * Middleman Check Request Schema
 */
export const MiddlemanCheckRequestSchema = z.object({
  offered_price_per_kg: z.number().min(50).max(300),
  district: z.enum(['gorakhpur', 'deoria', 'basti', 'kushinagar', 'maharajganj']),
});

export type MiddlemanCheckRequest = z.infer<typeof MiddlemanCheckRequestSchema>;

/**
 * Middleman Check Response Schema
 */
export const MiddlemanCheckResponseSchema = z.object({
  classification: z.enum(['fair', 'low', 'high']),
  benchmark_price: z.number(),
  spread: z.number(),
  recommended_range: z.tuple([z.number(), z.number()]),
  message_hi: z.string(),
});

export type MiddlemanCheckResponse = z.infer<typeof MiddlemanCheckResponseSchema>;

/**
 * Enterprise Forecast Request Schema
 */
export const EnterpriseForecastRequestSchema = z.object({
  districts: z.array(z.enum(['gorakhpur', 'deoria', 'basti', 'kushinagar', 'maharajganj'])),
  from: z.string(), // ISO date
  to: z.string(), // ISO date
});

export type EnterpriseForecastRequest = z.infer<typeof EnterpriseForecastRequestSchema>;

/**
 * Enterprise Forecast Response Schema
 */
export const EnterpriseForecastResponseSchema = z.object({
  data: z.array(
    z.object({
      date: z.string(),
      mandi: z.enum(['gorakhpur', 'deoria', 'basti', 'kushinagar', 'maharajganj']),
      p10: z.number(),
      p50: z.number(),
      p90: z.number(),
      drivers: z.array(PriceDriverSchema),
      model_version: z.string(),
    })
  ),
});

export type EnterpriseForecastResponse = z.infer<typeof EnterpriseForecastResponseSchema>;

/**
 * Customer Profile Update Schema
 */
export const CustomerProfileUpdateSchema = z.object({
  district: z.enum(['gorakhpur', 'deoria', 'basti', 'kushinagar', 'maharajganj']).optional(),
  flock_range: z.enum(['10K-25K', '25K-50K', '50K-1L', '1L+']).optional(),
  batches_per_year: z.number().min(1).max(12).optional(),
  farm_type: z.enum(['independent', 'integrator']).optional(),
});

export type CustomerProfileUpdate = z.infer<typeof CustomerProfileUpdateSchema>;
