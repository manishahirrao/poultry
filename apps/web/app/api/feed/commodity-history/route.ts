import { NextRequest, NextResponse } from 'next/server';

// GET /api/feed/commodity-history?id={commodityId}&days={days}
// Returns 30-day price history for a specific commodity
// Used by CommodityPriceRow component for expandable charts

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const commodityId = searchParams.get('id');
    const days = parseInt(searchParams.get('days') || '30');

    if (!commodityId) {
      return NextResponse.json(
        { error: 'Missing commodity ID' },
        { status: 400 }
      );
    }

    // Validate commodity ID
    const validCommodities = ['maize', 'soya_meal', 'palm_oil', 'composite'];
    if (!validCommodities.includes(commodityId)) {
      return NextResponse.json(
        { error: 'Invalid commodity ID' },
        { status: 400 }
      );
    }

    // Mock data - in production, this would fetch from Supabase commodity_prices table
    // Generate 30 days of historical price data
    const history = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Base prices for each commodity (in ₹ per quintal or per 10kg as appropriate)
      const basePrices: Record<string, number> = {
        maize: 2200,
        soya_meal: 3800,
        palm_oil: 1400,
        composite: 2850,
      };

      const basePrice = basePrices[commodityId];
      
      // Add some random variation to simulate real price movements
      const variation = (Math.random() - 0.5) * 100; // ±50 variation
      const price = Math.round(basePrice + variation + (i * 2)); // Slight upward trend

      return {
        date: dateStr,
        price: price,
      };
    });

    // Set cache headers for 1-hour cache (historical data changes less frequently)
    return NextResponse.json(history, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1 hour in seconds
        'CDN-Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching commodity history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commodity history' },
      { status: 500 }
    );
  }
}
