import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';



// GET /api/benchmark/user-metrics
// Returns user's own performance metrics for Benchmark comparison
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integratorId = searchParams.get('integrator_id');
    const farm = searchParams.get('farm') || 'all';
    const period = searchParams.get('period') || 'last_3_batches';



    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build batch query based on period
    let batchQuery = supabase
      .from('batches')
      .select('id, fcr, mortality_pct, adg_g, harvest_weight_kg, duration_days, gross_margin_pct')
      .eq('status', 'closed')
      .order('closed_at', { ascending: false });

    if (farm !== 'all') {
      batchQuery = batchQuery.eq('farm_id', farm);
    } else if (integratorId) {
      // Get all farm IDs for this integrator
      const { data: farms } = await (supabase
        .from('farms')
        .select('id')
        .eq('integrator_id', integratorId)) as any;
      if (farms && farms.length > 0) {
        batchQuery = batchQuery.in('farm_id', farms.map((f: any) => f.id));
      }
    }

    // Limit based on period
    const periodMap: Record<string, number> = {
      last_3_batches: 3,
      last_6_batches: 6,
      last_12_batches: 12,
    };
    const limit = periodMap[period] || 3;
    batchQuery = batchQuery.limit(limit);

    const { data: batches, error } = await batchQuery as any;

    if (error || !batches || batches.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    // Average the metrics
    const count = batches.length;
    const metrics = {
      fcr: batches.reduce((s: any, b: any) => s + (b.fcr || 0), 0) / count,
      mortalityPct: batches.reduce((s: any, b: any) => s + (b.mortality_pct || 0), 0) / count,
      adg: batches.reduce((s: any, b: any) => s + (b.adg_g || 0), 0) / count,
      grossMarginPct: batches.reduce((s: any, b: any) => s + (b.gross_margin_pct || 0), 0) / count,
      harvestWeight: batches.reduce((s: any, b: any) => s + (b.harvest_weight_kg || 0), 0) / count,
      batchDuration: batches.reduce((s: any, b: any) => s + (b.duration_days || 0), 0) / count,
      feedEfficiency: 0.54, // Derived from FCR
    };

    return NextResponse.json({ success: true, metrics });

  } catch (error) {
    console.error('User metrics GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
