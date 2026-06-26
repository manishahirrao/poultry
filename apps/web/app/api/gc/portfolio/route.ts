import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Fetch portfolio GC data across all farms
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all farms with their active batches
    const { data: farms, error: farmsError } = await supabase
      .from('farms')
      .select(`
        id,
        name,
        district,
        current_batch_id,
        batches!inner (
          id,
          birds_alive,
          avg_weight_g,
          day_number
        )
      `)
      .eq('integrator_id', user.id)
      .eq('status', 'active')
      .not('current_batch_id', 'is', null);

    if (farmsError) {
      console.error('Farms query error:', farmsError);
      return NextResponse.json(
        { error: 'Failed to fetch farms' },
        { status: 500 }
      );
    }

    const farmData = farms as any[];
    const farmGCData: any[] = [];

    // Fetch GC data for each farm
    for (const farm of farmData) {
      if (!farm.current_batch_id) continue;

      const batch = farm.batches?.[0];
      if (!batch) continue;

      // Get GC cost record
      const { data: gc } = await supabase
        .from('batch_gc_costs')
        .select('*')
        .eq('batch_id', farm.current_batch_id)
        .single();

      // Get feed cost (computed from feed_purchases)
      const { data: feedPurchases } = await supabase
        .from('feed_purchases')
        .select('quantity_kg, rate_per_kg')
        .eq('batch_id', farm.current_batch_id);

      const feedCost = (feedPurchases as any[])?.reduce((sum: number, p: any) => sum + (p.quantity_kg * p.rate_per_kg), 0) ?? 0;

      const birdsAlive = batch.birds_alive ?? 0;
      const avgWeightKg = (batch.avg_weight_g ?? 0) / 1000;
      const liveKgs = birdsAlive * avgWeightKg;

      const gcData = gc as any;
      const docCost = gcData?.doc_cost_total ?? 0;
      const medicineCost = gcData?.medicine_cost_total ?? 0;
      const vaccineCost = gcData?.vaccine_cost_total ?? 0;
      const litterCost = gcData?.litter_cost_total ?? 0;
      const electricityCost = gcData?.electricity_cost_total ?? 0;
      const waterCost = gcData?.water_cost_total ?? 0;
      const labourCost = gcData?.labour_cost_total ?? 0;
      const miscCost = gcData?.misc_cost_total ?? 0;
      const fixedOverhead = gcData?.fixed_overhead_alloc ?? 0;

      const totalCost = docCost + feedCost + medicineCost + vaccineCost +
                        litterCost + electricityCost + waterCost + labourCost +
                        miscCost + fixedOverhead;

      const gcPerKg = liveKgs > 0 ? Math.round((totalCost / liveKgs) * 100) / 100 : 0;

      // Only include farms with valid GC data
      if (gcPerKg > 0) {
        farmGCData.push({
          farmId: farm.id,
          farmName: farm.name,
          district: farm.district,
          gcPerKg,
          birdsAlive,
          liveKgs,
          totalCost,
        });
      }
    }

    // Calculate portfolio statistics
    const gcValues = farmGCData.map(f => f.gcPerKg);
    const averageGC = gcValues.length > 0 ? gcValues.reduce((a, b) => a + b, 0) / gcValues.length : 0;
    const bestGC = gcValues.length > 0 ? Math.min(...gcValues) : 0;
    const worstGC = gcValues.length > 0 ? Math.max(...gcValues) : 0;

    // Sort farms by GC (worst to best)
    const sortedFarms = [...farmGCData].sort((a, b) => b.gcPerKg - a.gcPerKg);

    return NextResponse.json({
      averageGC,
      bestGC,
      worstGC,
      farms: sortedFarms,
      industryBenchmark: 95,
    });
  } catch (error) {
    console.error('Portfolio GC API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
