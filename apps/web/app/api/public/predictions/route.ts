import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export type MandiSlug = 'gorakhpur' | 'deoria' | 'kushinagar' | 'basti' | 'maharajganj' | 'sant_kabir_nagar';

// GET /api/public/predictions?mandi=gorakhpur
// No auth required (public price widget on district pages)
// Rate limit: 30 req/min per IP
// Returns: latest PredictionRow for specified mandi
// Cache: Cache-Control: public, max-age=600 (10 min)
// ACCURACY GATE: if NEXT_PUBLIC_ACCURACY_GATE_CLEARED !== 'true' → returns demo data with is_demo: true flag
// Never returns null — demo data on Supabase error
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mandiParam = searchParams.get('mandi');

    // Validate mandi parameter
    const validMandis: MandiSlug[] = ['gorakhpur', 'deoria', 'kushinagar', 'basti', 'maharajganj', 'sant_kabir_nagar'];
    const mandi = mandiParam as MandiSlug;

    if (!mandi || !validMandis.includes(mandi)) {
      return NextResponse.json(
        { error: 'Invalid mandi parameter' },
        { status: 400 }
      );
    }

    // Fetch from Supabase
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('mandi', mandi)
      .order('predicted_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    });

  } catch (error) {
    console.error('Public predictions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
