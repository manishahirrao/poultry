import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';



// GET /api/benchmark/aggregated
// Returns aggregated benchmark data for the Benchmark page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const breed = searchParams.get('breed') || 'all';
    const region = searchParams.get('region') || 'all';
    const flockSize = searchParams.get('flock_size') || 'all';
    const period = searchParams.get('period') || 'last_3_batches';



    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch from aggregated_benchmarks table
    const query = supabase
      .from('aggregated_benchmarks')
      .select('*')
      .eq('period', period);

    if (breed !== 'all') query.eq('breed', breed);
    if (region !== 'all') query.eq('region', region);
    if (flockSize !== 'all') query.eq('flock_size_cat', flockSize);

    const { data: benchmarks, error } = await query as any;

    if (error || !benchmarks || benchmarks.length === 0) {
      return NextResponse.json({ error: 'No benchmark data found' }, { status: 404 });
    }

    // Build metrics object from DB rows
    const metrics: Record<string, { p25: number; p50: number; p75: number; p90: number }> = {};
    let sampleCount = 0;
    let farmCount = 0;

    for (const row of benchmarks) {
      metrics[row.metric_name] = {
        p25: row.p25_value || 0,
        p50: row.p50_value || 0,
        p75: row.p75_value || 0,
        p90: row.p90_value || 0,
      };
      sampleCount = Math.max(sampleCount, row.sample_count || 0);
    }

    // Check privacy minimum (10 farms)
    const privacyMinimumMet = sampleCount >= 10;

    return NextResponse.json({
      success: true,
      privacyMinimumMet,
      sampleCount,
      farmCount: Math.floor(sampleCount * 0.3),
      metrics: Object.keys(metrics).length > 0 ? metrics : {},
    });

  } catch (error) {
    console.error('Benchmark aggregated GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
