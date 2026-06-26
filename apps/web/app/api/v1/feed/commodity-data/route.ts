import { NextResponse } from 'next/server';

// GET /api/v1/feed/commodity-data
// Returns commodity price data for feed cost intelligence dashboard
// Per REQ-006 §6.1: Maize, Soya Meal, Palm Oil, Composite Feed Cost Index
// Per REQ-006 §6.6: 48-hour cache TTL

export async function GET() {
  try {
    // Mock data - in production, this would fetch from Supabase commodity_forecasts table
    // This data structure matches the FeedCostDashboard component expectations
    const data = {
      commodities: {
        maize: { price: 2200, delta: 50, trend: 'up' as const },
        soya: { price: 3800, delta: -30, trend: 'down' as const },
        palmOil: { price: 1400, delta: 20, trend: 'up' as const },
        composite: { price: 2850, delta: 35, trend: 'up' as const },
      },
      forecast: Array.from({ length: 21 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maizeActual: i < 7 ? 2200 + i * 10 : undefined,
        maizeForecast: i >= 7 ? 2270 + (i - 7) * 8 : undefined,
        soyaActual: i < 7 ? 3800 - i * 5 : undefined,
        soyaForecast: i >= 7 ? 3765 - (i - 7) * 3 : undefined,
      })),
      recommendation: 'BUY_NOW' as const,
      recommendationReason: '14-day forecast shows 5.2% uptrend in maize prices',
      estimatedSavings: 42000,
      lastUpdated: new Date().toISOString(),
    };

    // Set cache headers for 48-hour cache (per REQ-006 §6.6)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=172800', // 48 hours in seconds
        'CDN-Cache-Control': 'public, max-age=172800',
      },
    });
  } catch (error) {
    console.error('Error fetching commodity data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commodity data' },
      { status: 500 }
    );
  }
}
