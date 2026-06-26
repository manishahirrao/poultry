import { NextResponse } from 'next/server';

// GET /api/v1/admin/accuracy-data
// Returns accuracy metrics for the admin accuracy dashboard
// Per REQ-007, TASK-018
// This endpoint is protected by admin-only middleware

export async function GET() {
  try {
    // Mock data - in production, this would fetch from Supabase accuracy_log and model_registry tables
    const data = {
      mape: 4.8,
      directionalAccuracy: 96.2,
      conformalCoverage: 80.5,
      mapeTrend: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        mape: 4.5 + Math.random() * 1.5,
      })),
      scatterData: Array.from({ length: 30 }, (_, i) => ({
        actual: 160 + Math.random() * 10,
        predicted: 160 + Math.random() * 10,
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })),
      featureImportance: [
        { feature: 'feed_cost_lag42', importance: 0.35 },
        { feature: 'hpai_district_flag', importance: 0.22 },
        { feature: 'temperature_avg_7d', importance: 0.18 },
        { feature: 'mandi_price_lag7', importance: 0.15 },
        { feature: 'festival_indicator', importance: 0.10 },
      ],
      modelTimeline: [
        {
          version: 'v2.3.0',
          mape: 4.8,
          directionalAccuracy: 96.2,
          date: '2026-05-20',
          status: 'promoted' as const,
        },
        {
          version: 'v2.2.1',
          mape: 5.1,
          directionalAccuracy: 95.8,
          date: '2026-05-13',
          status: 'rejected' as const,
        },
        {
          version: 'v2.2.0',
          mape: 4.9,
          directionalAccuracy: 96.0,
          date: '2026-05-06',
          status: 'promoted' as const,
        },
        {
          version: 'v2.1.5',
          mape: 5.5,
          directionalAccuracy: 94.5,
          date: '2026-04-29',
          status: 'rollback' as const,
        },
        {
          version: 'v2.1.0',
          mape: 5.2,
          directionalAccuracy: 95.2,
          date: '2026-04-22',
          status: 'promoted' as const,
        },
      ],
      lastUpdated: new Date().toISOString(),
    };

    // Set cache headers for 1-hour cache
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1 hour
        'CDN-Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching accuracy data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accuracy data' },
      { status: 500 }
    );
  }
}
