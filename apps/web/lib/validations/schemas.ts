// FlockIQ — Centralized Zod Schemas
// File: apps/web/lib/validations/schemas.ts
// Version: v1.0 | May 2026
// Task Reference: F-07 — Zod Schemas for Validation

import { z } from 'zod';

// ============================================================================
// PHONE VALIDATION
// ============================================================================

export const PhoneSchema = z.string()
  .regex(/^[6-9]\d{9}$/, { message: 'कृपया सही 10-digit mobile number दर्ज करें' });

export const PhoneWithCountryCodeSchema = z.string()
  .regex(/^\+91[6-9]\d{9}$/, { message: 'कृपया सही mobile number दर्ज करें (+91 XXXXX XXXXX)' });

// ============================================================================
// LEAD VALIDATION
// ============================================================================

export const LeadRequestSchema = z.object({
  phone: PhoneSchema,
  source: z.enum(['exit_intent', 'whatsapp_demo', 'blog_scroll', 'hero', 'pricing', 'faq', 'nav', 'homepage_cta']),
  district: z.enum(['gorakhpur', 'deoria', 'kushinagar', 'basti', 'maharajganj', 'sant_kabir_nagar']).optional(),
  plan: z.enum(['pulsefarm', 'pulsepro', 'pulseintel']).optional(),
  consent_given: z.literal(true, { errorMap: () => ({ message: 'DPDP consent आवश्यक है' }) }),
  utm: z.object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
  }).optional(),
});

export type LeadRequest = z.infer<typeof LeadRequestSchema>;

// ============================================================================
// ONBOARDING VALIDATION
// ============================================================================

export const OnboardingStepSchema = z.enum(['OB-01', 'OB-02', 'OB-03', 'OB-04', 'OB-05', 'OB-06', 'OB-07', 'OB-08', 'OB-09', 'OB-10']);

export const OnboardingDistrictSchema = z.enum([
  'gorakhpur',
  'deoria',
  'kushinagar',
  'basti',
  'maharajganj',
  'sant_kabir_nagar',
], { required_error: 'कृपया अपना जिला चुनें' });

export const OnboardingFlockRangeSchema = z.enum([
  '10,000 – 25,000',
  '25,000 – 50,000',
  '50,000 – 1 लाख',
  '1 लाख – 5 लाख',
  '5 लाख+',
], { required_error: 'कृपया अपने farm की size चुनें' });

export const OnboardingBatchesPerYearSchema = z.union([z.literal(2), z.literal(3), z.literal(4)], {
  required_error: 'कृपया batches per year चुनें',
});

export const OnboardingFarmTypeSchema = z.enum(['independent', 'integrator'], {
  required_error: 'कृपया अपने farm का type चुनें',
});

export const OnboardingPlanSchema = z.enum(['PULSE_FARM', 'PULSE_PRO', 'PULSE_INTEL'], {
  required_error: 'कृपया अपना plan confirm करें',
});

export const OnboardingStateSchema = z.object({
  currentStep: OnboardingStepSchema,
  completedSteps: z.array(OnboardingStepSchema),
  data: z.object({
    district: OnboardingDistrictSchema.optional(),
    flockRange: OnboardingFlockRangeSchema.optional(),
    batchesPerYear: OnboardingBatchesPerYearSchema.optional(),
    farmType: OnboardingFarmTypeSchema.optional(),
    integratorName: z.string().min(2, 'Integrator name कम से कम 2 characters होना चाहिए').optional(),
    planConfirmed: OnboardingPlanSchema.optional(),
    whatsappVerified: z.boolean().optional(),
    appDownloaded: z.boolean().optional(),
    referralSource: z.string().optional(),
    referralCode: z.string().min(4, 'Referral code कम से कम 4 characters होना चाहिए').optional(),
  }),
  trialDurationDays: z.union([z.literal(14), z.literal(30)]),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export type OnboardingState = z.infer<typeof OnboardingStateSchema>;

// ============================================================================
// CUSTOMER VALIDATION
// ============================================================================

export const CustomerSegmentSchema = z.enum(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']);

export const CustomerRoleSchema = z.enum(['farmer', 'admin', 'integrator', 'feed_manufacturer', 'trader', 'qsr', 'insurer', 'bank']);

export const CustomerPlanSchema = z.enum(['PULSE_FARM', 'PULSE_PRO', 'PULSE_INTEL']);

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  phone: PhoneWithCountryCodeSchema,
  name: z.string().min(2, 'Name कम से कम 2 characters होना चाहिए').optional(),
  segment: CustomerSegmentSchema,
  role: CustomerRoleSchema,
  plan: CustomerPlanSchema,
  district: OnboardingDistrictSchema,
  integratorName: z.string().optional(),
  flockRange: OnboardingFlockRangeSchema.optional(),
  batchesPerYear: OnboardingBatchesPerYearSchema.optional(),
  whatsappVerified: z.boolean().default(false),
  onboardingCompleted: z.boolean().default(false),
  onboardingCompletedAt: z.string().datetime().optional(),
  trialStartedAt: z.string().datetime().optional(),
  trialEndsAt: z.string().datetime().optional(),
  subscriptionActive: z.boolean().default(false),
  subscriptionStartsAt: z.string().datetime().optional(),
  referralCode: z.string().optional(),
  referredBy: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Customer = z.infer<typeof CustomerSchema>;

// ============================================================================
// AUTH VALIDATION
// ============================================================================

export const OTPSchema = z.string()
  .regex(/^\d{6}$/, { message: 'OTP 6 digits होना चाहिए' });

export const SendOTPRequestSchema = z.object({
  phone: PhoneSchema,
});

export type SendOTPRequest = z.infer<typeof SendOTPRequestSchema>;

export const VerifyOTPRequestSchema = z.object({
  phone: PhoneSchema,
  otp: OTPSchema,
});

export type VerifyOTPRequest = z.infer<typeof VerifyOTPRequestSchema>;

// ============================================================================
// API KEY VALIDATION
// ============================================================================

export const APIKeyCreateSchema = z.object({
  name: z.string().min(3, 'API key name कम से कम 3 characters होना चाहिए').max(100),
  scopes: z.array(z.enum(['read:predictions', 'read:alerts', 'read:customers'])).min(1),
});

export type APIKeyCreate = z.infer<typeof APIKeyCreateSchema>;

// ============================================================================
// NOTIFICATION SETTINGS VALIDATION
// ============================================================================

export const NotificationSettingsSchema = z.object({
  whatsappEnabled: z.boolean(),
  whatsappTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  emailEnabled: z.boolean().optional(),
  email: z.string().email('Invalid email address').optional(),
  alertTypes: z.array(z.enum(['price_spike', 'price_drop', 'hpai_alert', 'market_trend'])),
});

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

// ============================================================================
// REFERRAL VALIDATION
// ============================================================================

export const ReferralApplySchema = z.object({
  referralCode: z.string().min(4, 'Referral code कम से कम 4 characters होना चाहिए').max(20),
});

export type ReferralApply = z.infer<typeof ReferralApplySchema>;

export const ReferralGenerateSchema = z.object({
  customerId: z.string().uuid(),
});

export type ReferralGenerate = z.infer<typeof ReferralGenerateSchema>;

// ============================================================================
// PREDICTION VALIDATION
// ============================================================================

export const PredictionRequestSchema = z.object({
  district: OnboardingDistrictSchema,
  days: z.number().int().min(1).max(30).default(7),
});

export type PredictionRequest = z.infer<typeof PredictionRequestSchema>;

export const PredictionDataSchema = z.object({
  date: z.string().datetime(),
  p10: z.number(),
  p50: z.number(),
  p90: z.number(),
  confidence: z.number().min(0).max(1),
});

export type PredictionData = z.infer<typeof PredictionDataSchema>;

// ============================================================================
// ANALYTICS EVENT VALIDATION
// ============================================================================

export const AnalyticsEventSchema = z.object({
  eventName: z.string(),
  properties: z.record(z.any()).optional(),
  userId: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const Schemas = {
  Phone: PhoneSchema,
  PhoneWithCountryCode: PhoneWithCountryCodeSchema,
  LeadRequest: LeadRequestSchema,
  OnboardingStep: OnboardingStepSchema,
  OnboardingDistrict: OnboardingDistrictSchema,
  OnboardingFlockRange: OnboardingFlockRangeSchema,
  OnboardingBatchesPerYear: OnboardingBatchesPerYearSchema,
  OnboardingFarmType: OnboardingFarmTypeSchema,
  OnboardingPlan: OnboardingPlanSchema,
  OnboardingState: OnboardingStateSchema,
  Customer: CustomerSchema,
  CustomerSegment: CustomerSegmentSchema,
  CustomerRole: CustomerRoleSchema,
  CustomerPlan: CustomerPlanSchema,
  OTP: OTPSchema,
  SendOTPRequest: SendOTPRequestSchema,
  VerifyOTPRequest: VerifyOTPRequestSchema,
  APIKeyCreate: APIKeyCreateSchema,
  NotificationSettings: NotificationSettingsSchema,
  ReferralApply: ReferralApplySchema,
  ReferralGenerate: ReferralGenerateSchema,
  PredictionRequest: PredictionRequestSchema,
  PredictionData: PredictionDataSchema,
  AnalyticsEvent: AnalyticsEventSchema,
};
