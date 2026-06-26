import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    // Fetch district price summary from materialized view
    const { data: districts, error } = await supabase
      .from('district_price_summary')
      .select('*')
      .order('district', { ascending: true });

    if (error) {
      console.error('Error fetching district price summary:', error);
      return NextResponse.json(
        { error: 'Failed to fetch district data' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const transformedData = districts.map((d: any) => ({
      district: d.district,
      p50: d.p50,
      signal: d.signal,
    }));

    // Set cache headers for 15-minute Cloudflare edge cache per TASK-010
    const response = NextResponse.json(transformedData);
    response.headers.set('Cache-Control', 'public, max-age=900, s-maxage=900');
    response.headers.set('CDN-Cache-Control', 'public, max-age=900');
    response.headers.set('Cache-Key', 'district_prices_all');
    
    return response;
  } catch (error) {
    console.error('Error in district-prices API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
