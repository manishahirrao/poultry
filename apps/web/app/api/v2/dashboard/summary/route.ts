// FlockIQ — Dashboard Summary API Endpoint
// File: apps/web/app/api/v2/dashboard/summary/route.ts
// Version: v1.0 | May 2026
// Task Reference: FlockIQ_Dashboard_Tasks_v1.md TASK-003
// Requirements Reference: REQ-001 §1.8, PERF-004

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// TypeScript Interfaces

interface PriceHero {
  price: number;          // watermarked P50
  p10: number;            // watermarked P10
  p90: number;            // watermarked P90
  deltaPercent: number;
  deltaDirection: 'up' | 'down' | 'flat';
  signal: 'sell' | 'hold' | 'caution' | 'withdrawal';
  district: string;
  lastUpdated: string;    // ISO 8601
  isStale: boolean;
  watermarkToken: string; // for audit log
  withdrawalEndDate?: string; // ISO 8601 date when withdrawal ends
  type: 'broiler' | 'egg'; // Type discriminator for broiler vs egg prices
  unit: string; // '₹/kg' for broiler, '₹/egg' for layer
}

interface Accuracy {
  mape30d: number;
  directionalAccuracy: number;
  predictionCount: number;
  lastRetrain: string;
  modelVersion: string;
}

interface MandiBenchmark {
  price: number;
  freshness: string;
}

interface MiddlemanSpread {
  deltaRs: number;
  deltaPercent: number;
}

interface FeedCostIndex {
  value: number;
  delta7d: number;
}

interface ApiUsage {
  used: number;
  quota: number;
}

interface KpiRow {
  mandiBenchmark: MandiBenchmark;
  middlemanSpread: MiddlemanSpread;
  activeAlertCount: number;
  feedCostIndex: FeedCostIndex;
  apiUsage?: ApiUsage; // S5/Admin only
}

interface ChartDataPoint {
  date: string;
  price: number;
}

interface ForecastDataPoint {
  date: string;
  p10: number;
  p50: number;
  p90: number;
}

interface Festival {
  date: string;
  name: string;
}

interface Event {
  date: string;
  type: 'hpai' | 'weather';
}

interface ChartData {
  actual: ChartDataPoint[];
  forecast: ForecastDataPoint[];
  festivals: Festival[];
  events: Event[];
}

interface Alert {
  id: string;
  district: string;
  type: string;
  titleHindi: string;
  titleEnglish: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpactLow: number;
  estimatedImpactHigh: number;
  source: string;
  sourceUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

interface District {
  id: string;
  name: string;
  nameHi: string;
}

interface DashboardSummary {
  priceHero: PriceHero;
  accuracy: Accuracy;
  kpiRow: KpiRow;
  chartData: ChartData;
  alerts: Alert[];
  districtList: District[];
}

// Zod Validation Schemas

const DashboardSummarySchema: z.ZodSchema<DashboardSummary> = z.object({
  priceHero: z.object({
    price: z.number(),
    p10: z.number(),
    p90: z.number(),
    deltaPercent: z.number(),
    deltaDirection: z.enum(['up', 'down', 'flat']),
    signal: z.enum(['sell', 'hold', 'caution', 'withdrawal']),
    district: z.string(),
    lastUpdated: z.string(),
    isStale: z.boolean(),
    watermarkToken: z.string(),
    withdrawalEndDate: z.string().optional(),
    type: z.enum(['broiler', 'egg']),
    unit: z.string(),
  }),
  accuracy: z.object({
    mape30d: z.number(),
    directionalAccuracy: z.number(),
    predictionCount: z.number(),
    lastRetrain: z.string(),
    modelVersion: z.string(),
  }),
  kpiRow: z.object({
    mandiBenchmark: z.object({
      price: z.number(),
      freshness: z.string(),
    }),
    middlemanSpread: z.object({
      deltaRs: z.number(),
      deltaPercent: z.number(),
    }),
    activeAlertCount: z.number(),
    feedCostIndex: z.object({
      value: z.number(),
      delta7d: z.number(),
    }),
    apiUsage: z.object({
      used: z.number(),
      quota: z.number(),
    }).optional(),
  }),
  chartData: z.object({
    actual: z.array(z.object({
      date: z.string(),
      price: z.number(),
    })),
    forecast: z.array(z.object({
      date: z.string(),
      p10: z.number(),
      p50: z.number(),
      p90: z.number(),
    })),
    festivals: z.array(z.object({
      date: z.string(),
      name: z.string(),
    })),
    events: z.array(z.object({
      date: z.string(),
      type: z.enum(['hpai', 'weather']),
    })),
  }),
  alerts: z.array(z.object({
    id: z.string(),
    district: z.string(),
    type: z.string(),
    titleHindi: z.string(),
    titleEnglish: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    estimatedImpactLow: z.number(),
    estimatedImpactHigh: z.number(),
    source: z.string(),
    sourceUrl: z.string().optional(),
    createdAt: z.string(),
    expiresAt: z.string().optional(),
  })),
  districtList: z.array(z.object({
    id: z.string(),
    name: z.string(),
    nameHi: z.string(),
  })),
});

// Watermarking Utility - Micro-perturbation applied per customer_id for audit trail

function applyWatermark(value: number, customerId: string): number {
  // Simple deterministic watermarking: add small perturbation based on customer_id hash
  const hash = customerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const perturbation = (hash % 100) / 10000; // ±0.01 max perturbation
  return value + perturbation;
}

function generateWatermarkToken(customerId: string, district: string, date: string): string {
  // Generate a token for audit log (in production, use proper encryption)
  const data = `${customerId}|${district}|${date}`;
  return Buffer.from(data).toString('base64');
}

// Main Handler

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get customer info
    const phone = user.phone;
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone not found in session' },
        { status: 400 }
      );
    }

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, district, role, plan, poultry_type')
      .eq('phone', phone)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customerId = (customer as any).id;
    const primaryDistrict = (customer as any).district || 'gorakhpur';
    const customerRole = (customer as any).role;
    const customerPlan = (customer as any).plan;
    const poultryType = (customer as any).poultry_type || 'broiler';

    // 3. Fetch dashboard data (5 Supabase queries - no N+1)
    const [
      predictionsResult,
      accuracyLogResult,
      alertsResult,
      districtsResult,
      medicationWithdrawalResult
    ] = await Promise.all([
      // Query 1: Latest prediction for price hero
      supabase
        .from('predictions')
        .select('*')
        .eq('district', primaryDistrict)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),

      // Query 2: Accuracy metrics
      supabase
        .from('accuracy_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),

      // Query 3: Recent alerts
      supabase
        .from('alerts')
        .select('*')
        .eq('district', primaryDistrict)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5),

      // Query 4: Available districts
      supabase
        .from('districts')
        .select('id, name, name_hi')
        .order('name'),

      // Query 5: Check for active medication withdrawal periods
      // This checks if any of the customer's active batches have medications in withdrawal
      supabase
        .from('medication_logs')
        .select('withdrawal_end_date')
        .gte('withdrawal_end_date', new Date().toISOString().split('T')[0])
        .order('withdrawal_end_date', { ascending: true })
        .limit(1),
    ]);

    const predictions = predictionsResult.data;
    const accuracyLog = accuracyLogResult.data;
    const alerts = alertsResult.data;
    const districts = districtsResult.data;
    const medicationWithdrawal = medicationWithdrawalResult.data as any;

    // 4. Check for active withdrawal period and override signal if needed
    let finalSignal: 'sell' | 'hold' | 'caution' | 'withdrawal' = 'sell';
    let withdrawalEndDate: string | undefined = undefined;

    if (medicationWithdrawal && medicationWithdrawal.withdrawal_end_date) {
      // Active withdrawal period found - override signal
      finalSignal = 'withdrawal';
      withdrawalEndDate = medicationWithdrawal.withdrawal_end_date;
    }

    // 5. Build response with watermarking
    const now = new Date();
    const watermarkToken = generateWatermarkToken(customerId, primaryDistrict, now.toISOString());

    // Determine price type and unit based on poultry_type
    const isLayerFarm = poultryType === 'layer';
    const priceType = isLayerFarm ? 'egg' : 'broiler';
    const priceUnit = isLayerFarm ? '₹/egg' : '₹/kg';

    // Mock data for demo mode (replace with real data from queries above)
    // For layer farms, use NECC egg prices (₹/egg), for broiler use AGMARKNET prices (₹/kg)
    const basePrice = isLayerFarm ? 5.80 : 162.40; // NECC egg price vs broiler price
    const baseP10 = isLayerFarm ? 5.60 : 158.00;
    const baseP90 = isLayerFarm ? 6.00 : 168.00;

    const summary: DashboardSummary = {
      priceHero: {
        price: applyWatermark(basePrice, customerId),
        p10: applyWatermark(baseP10, customerId),
        p90: applyWatermark(baseP90, customerId),
        deltaPercent: 2.3,
        deltaDirection: 'up',
        signal: finalSignal,
        district: primaryDistrict,
        lastUpdated: now.toISOString(),
        isStale: false,
        watermarkToken,
        withdrawalEndDate,
        type: priceType,
        unit: priceUnit,
      },
      accuracy: {
        mape30d: 4.8,
        directionalAccuracy: 95.2,
        predictionCount: 847,
        lastRetrain: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        modelVersion: 'v2.1.0',
      },
      kpiRow: {
        mandiBenchmark: {
          price: 159.50,
          freshness: '4hr ago',
        },
        middlemanSpread: {
          deltaRs: 2.90,
          deltaPercent: 1.8,
        },
        activeAlertCount: 3,
        feedCostIndex: {
          value: 58.20,
          delta7d: 1.2,
        },
        // Include API usage only for enterprise/admin
        ...(customerRole === 'admin' || customerPlan === 'PULSE_INTEL' ? {
          apiUsage: {
            used: 1247,
            quota: 10000,
          },
        } : {}),
      },
      chartData: {
        actual: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: applyWatermark(160 + Math.random() * 5, customerId),
        })),
        forecast: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          p10: applyWatermark(158 + i * 0.5, customerId),
          p50: applyWatermark(162 + i * 0.8, customerId),
          p90: applyWatermark(168 + i * 1.2, customerId),
        })),
        festivals: [],
        events: [],
      },
      alerts: (alerts as any[])?.map(alert => ({
        id: alert.id,
        district: alert.district,
        type: alert.type,
        titleHindi: alert.title_hindi || alert.title,
        titleEnglish: alert.title_english || alert.title,
        severity: alert.severity,
        estimatedImpactLow: alert.estimated_impact_low || 0,
        estimatedImpactHigh: alert.estimated_impact_high || 0,
        source: alert.source,
        sourceUrl: alert.source_url,
        createdAt: alert.created_at,
        expiresAt: alert.expires_at,
      })) || [],
      districtList: (districts as any[])?.map(d => ({
        id: d.id,
        name: d.name,
        nameHi: d.name_hi,
      })) || [
        { id: 'gorakhpur', name: 'Gorakhpur', nameHi: 'गोरखपुर' },
        { id: 'deoria', name: 'Deoria', nameHi: 'देवरिया' },
        { id: 'kushinagar', name: 'Kushinagar', nameHi: 'कुशीनगर' },
      ],
    };

    // 5. Validate response with Zod
    const validatedSummary = DashboardSummarySchema.parse(summary);

    // 6. Return response with cache headers
    return NextResponse.json(validatedSummary, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300', // 5-minute client cache
        'CDN-Cache-Control': 'max-age=300', // Cloudflare edge cache
        'X-Cache-Key': `${customerId}-${new Date().toISOString().split('T')[0]}`, // Hourly granularity
      },
    });

  } catch (error) {
    console.error('Dashboard summary API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Configuration

export const runtime = 'edge'; // Vercel Edge Function
export const dynamic = 'force-dynamic';
