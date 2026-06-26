import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// GET: Fetch current GC for the active batch of a farm
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
    
    // Mock data for demo farm
    if (farmId === 'demo-farm-2') {
      return NextResponse.json({
        gc: {
          batchId: 'mock-batch-1',
          farmName: 'Shivaji Poultry Farm',
          batchDay: 21,
          docCost: 125000,
          feedCost: 437500,
          medicineCost: 25000,
          vaccineCost: 15000,
          litterCost: 8000,
          electricityCost: 12000,
          waterCost: 5000,
          labourCost: 35000,
          miscCost: 10000,
          fixedOverhead: 15000,
          totalCost: 687500,
          gcPerKg: 92.50,
          liveKgs: 7434,
          birdsAlive: 12450,
          avgWeightKg: 0.597,
          targetSellPriceP50: 105,
          margin: 12.50,
          marginPct: 11.90,
          estimatedProfit: 92925,
          industryBenchmarkGC: 95,
          vsIndustry: -2.50,
        }
      });
    }
    
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

    // Verify farm belongs to this user
    const { data: farm } = await supabase
      .from('farms')
      .select('id, name, current_batch_id')
      .eq('id', farmId)
      .eq('integrator_id', user.id)
      .single();

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const farmData = farm as { id: string; name: string; current_batch_id: string | null };

    if (!farmData.current_batch_id) {
      return NextResponse.json({ gc: null, message: 'No active batch' });
    }

    // Get GC cost record
    const { data: gc } = await supabase
      .from('batch_gc_costs')
      .select('*')
      .eq('batch_id', farmData.current_batch_id)
      .single();

    // Get feed cost (computed from feed_purchases)
    const { data: feedPurchases } = await supabase
      .from('feed_purchases')
      .select('quantity_kg, rate_per_kg')
      .eq('batch_id', farmData.current_batch_id);

    const feedCost = (feedPurchases as any[])?.reduce((sum: number, p: any) => sum + (p.quantity_kg * p.rate_per_kg), 0) ?? 0;

    // Get batch stats
    const { data: batch } = await supabase
      .from('batches')
      .select('birds_alive, avg_weight_g, day_number, birds_placed')
      .eq('id', farmData.current_batch_id)
      .single();

    const batchData = batch as { birds_alive?: number; avg_weight_g?: number; day_number?: number; birds_placed?: number } | null;

    const birdsAlive = batchData?.birds_alive ?? 0;
    const avgWeightKg = (batchData?.avg_weight_g ?? 0) / 1000;
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

    // Get today's forecast price for margin calculation
    const { data: forecast } = await supabase
      .from('sell_signals')
      .select('expected_p50_high')
      .order('signal_date', { ascending: false })
      .limit(1)
      .single();

    const forecastData = forecast as { expected_p50_high?: number } | null;
    const forecastPrice = forecastData?.expected_p50_high ?? null;
    const margin = forecastPrice ? forecastPrice - gcPerKg : null;
    const marginPct = forecastPrice && forecastPrice > 0 ? (margin! / forecastPrice) * 100 : null;
    const estimatedProfit = margin ? margin * liveKgs : null;

    return NextResponse.json({
      gc: {
        batchId: farmData.current_batch_id,
        farmName: farmData.name,
        batchDay: batchData?.day_number ?? 0,
        docCost, feedCost, medicineCost, vaccineCost, litterCost,
        electricityCost, waterCost, labourCost, miscCost, fixedOverhead,
        totalCost, gcPerKg, liveKgs, birdsAlive, avgWeightKg,
        targetSellPriceP50: forecastPrice,
        margin, marginPct, estimatedProfit,
        industryBenchmarkGC: 95,
        vsIndustry: gcPerKg - 95,
      }
    });
  } catch (error) {
    console.error('GC API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update GC cost inputs for the active batch
const UpdateGCSchema = z.object({
  docCostTotal: z.number().min(0).optional(),
  litterCostTotal: z.number().min(0).optional(),
  fixedOverheadAlloc: z.number().min(0).optional(),
  medicineCostTotal: z.number().min(0).optional(),
  vaccineCostTotal: z.number().min(0).optional(),
  electricityCostTotal: z.number().min(0).optional(),
  waterCostTotal: z.number().min(0).optional(),
  labourCostTotal: z.number().min(0).optional(),
  miscCostTotal: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
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

    const body = await req.json();
    const parsed = UpdateGCSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: farm } = await supabase
      .from('farms')
      .select('id, current_batch_id')
      .eq('id', farmId)
      .eq('integrator_id', user.id)
      .single();

    const farmData = farm as { id: string; current_batch_id: string | null } | null;

    if (!farmData?.current_batch_id) {
      return NextResponse.json({ error: 'No active batch' }, { status: 404 });
    }

    // Map camelCase to snake_case
    const updateData: Record<string, any> = {};
    if (parsed.data.docCostTotal !== undefined) updateData.doc_cost_total = parsed.data.docCostTotal;
    if (parsed.data.litterCostTotal !== undefined) updateData.litter_cost_total = parsed.data.litterCostTotal;
    if (parsed.data.fixedOverheadAlloc !== undefined) updateData.fixed_overhead_alloc = parsed.data.fixedOverheadAlloc;
    if (parsed.data.medicineCostTotal !== undefined) updateData.medicine_cost_total = parsed.data.medicineCostTotal;
    if (parsed.data.vaccineCostTotal !== undefined) updateData.vaccine_cost_total = parsed.data.vaccineCostTotal;
    if (parsed.data.electricityCostTotal !== undefined) updateData.electricity_cost_total = parsed.data.electricityCostTotal;
    if (parsed.data.waterCostTotal !== undefined) updateData.water_cost_total = parsed.data.waterCostTotal;
    if (parsed.data.labourCostTotal !== undefined) updateData.labour_cost_total = parsed.data.labourCostTotal;
    if (parsed.data.miscCostTotal !== undefined) updateData.misc_cost_total = parsed.data.miscCostTotal;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
    updateData.updated_at = new Date().toISOString();

    // Upsert GC record
    await supabase
      .from('batch_gc_costs')
      .upsert({
        ...updateData,
        farm_id: farmId,
        batch_id: farmData.current_batch_id,
        integrator_id: user.id,
      } as any, { onConflict: 'batch_id' });

    // Trigger GC recomputation
    await supabase.rpc('compute_batch_gc', { p_batch_id: farmData.current_batch_id } as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GC PUT Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
