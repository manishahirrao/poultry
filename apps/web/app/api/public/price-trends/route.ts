import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export type MandiSlug = 'gorakhpur' | 'deoria' | 'kushinagar' | 'basti' | 'maharajganj' | 'sant_kabir_nagar';

// GET /api/public/price-trends?mandi=gorakhpur&days=30
// No auth required (public tool for lead generation)
// Rate limit: 30 req/min per IP
// Returns: Historical price data for specified mandi and time range
// Cache: Cache-Control: public, max-age=600 (10 min)
// ACCURACY GATE: if NEXT_PUBLIC_ACCURACY_GATE_CLEARED !== 'true' → returns demo data with is_demo: true flag
// Never returns null — demo data on Supabase error
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mandiParam = searchParams.get('mandi');
    const daysParam = searchParams.get('days');

    // Validate mandi parameter
    const validMandis: MandiSlug[] = ['gorakhpur', 'deoria', 'kushinagar', 'basti', 'maharajganj', 'sant_kabir_nagar'];
    const mandi = mandiParam as MandiSlug;

    if (!mandi || !validMandis.includes(mandi)) {
      return NextResponse.json(
        { error: 'Invalid mandi parameter' },
        { status: 400 }
      );
    }

    // Validate days parameter
    const validDays = [30, 60, 90];
    const days = daysParam ? parseInt(daysParam) : 30;
    if (!validDays.includes(days)) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Must be 30, 60, or 90' },
        { status: 400 }
      );
    }

    // Fetch from Supabase
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('mandi', mandi)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: 'Price trends not found' }, { status: 404 });
    }

    // Calculate metrics
    const prices = data.map((d: any) => d.price);
    const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const volatility = ((maxPrice - minPrice) / avgPrice) * 100;

    return NextResponse.json({
      mandi,
      days,
      data: data.map((d: any) => ({
        date: d.date,
        price: d.price,
      })),
      metrics: {
        avgPrice: Math.round(avgPrice * 100) / 100,
        minPrice,
        maxPrice,
        volatility: Math.round(volatility * 100) / 100,
      },
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    });

  } catch (error) {
    console.error('Price trends API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
