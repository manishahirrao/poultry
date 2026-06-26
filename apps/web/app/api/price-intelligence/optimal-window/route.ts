import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export type MandiSlug = 'gorakhpur' | 'deoria' | 'kushinagar' | 'basti' | 'maharajganj' | 'sant_kabir_nagar';

// GET /api/price-intelligence/optimal-window?mandi=gorakhpur
// Auth required (dashboard users only)
// Returns: Optimal sell window data with confidence level
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

    // Check authentication
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.phone) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate optimal sell window based on forecast data
    // In production, this would calculate based on actual forecast data
    const optimalWindow = generateOptimalWindow(mandi);

    return NextResponse.json(optimalWindow, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300',
      },
    });

  } catch (error) {
    console.error('Optimal window API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateOptimalWindow(mandi: MandiSlug) {
  const today = new Date();
  const windowStart = new Date(today);
  windowStart.setDate(today.getDate() + 2); // D+2

  const windowEnd = new Date(today);
  windowEnd.setDate(today.getDate() + 5); // D+5

  const base: Record<MandiSlug, number> = {
    gorakhpur: 172,
    deoria: 169,
    kushinagar: 167,
    basti: 168,
    maharajganj: 166,
    sant_kabir_nagar: 165,
  };

  const expectedP50 = base[mandi];
  const confidence = Math.random() > 0.3 ? 'HIGH' : Math.random() > 0.5 ? 'MEDIUM' : 'LOW';

  return {
    windowStart: windowStart.toISOString().split('T')[0],
    windowEnd: windowEnd.toISOString().split('T')[0],
    expectedP50Min: expectedP50 - 4,
    expectedP50Max: expectedP50 + 4,
    confidence,
  };
}
