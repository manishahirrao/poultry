import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@poultrypulse/types';
const CostCreateSchema = z.object({
  batchId: z.string(),
  category: z.string(),
  amount: z.number().min(0),
  date: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  vendor: z.string().optional(),
  doc_supplier: z.string().optional(),
  price_per_doc: z.number().optional(),
  transport_cost: z.number().optional(),
  workers_count: z.number().optional(),
  rate_per_day: z.number().optional(),
  period_start_date: z.string().optional(),
  period_end_date: z.string().optional(),
  days_count: z.number().optional(),
  overhead_category: z.string().optional(),
  frequency: z.string().optional(),
  batch_share_pct: z.number().optional(),
  notes: z.string().optional(),
  entry_date: z.string().optional()
});
// GET /api/v1/farms/[farmId]/costs?batchId=XXX
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({ error: 'batchId query parameter required' }, { status: 400 });
    }



    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch batch costs
    const { data: costs, error: costsError } = await supabase
      .from('batch_costs')
      .select('*')
      .eq('batch_id', batchId)
      .eq('farm_id', farmId)
      .order('entry_date', { ascending: false });

    if (costsError) {
      console.error('Costs fetch error:', costsError);
    }

    // Fetch medicine costs
    const { data: medicineCosts, error: medError } = await supabase
      .from('batch_medicine_costs')
      .select('*')
      .eq('batch_id', batchId)
      .eq('farm_id', farmId)
      .order('entry_date', { ascending: false });

    if (medError) {
      console.error('Medicine costs fetch error:', medError);
    }

    // Fetch feed costs from daily_logs aggregation
    const { data: feedLogs } = await supabase
      .from('daily_logs')
      .select('feed_consumed_kg, feed_rate_per_kg')
      .eq('batch_id', batchId);

    const typedFeedLogs = (feedLogs as any[]) || [];

    const feedTotal = typedFeedLogs.reduce((sum, log) => {
      const feedKg = log.feed_consumed_kg || 0;
      const rate = log.feed_rate_per_kg || 30;
      return sum + (feedKg * rate);
    }, 0);

    const feedTotalMt = typedFeedLogs.reduce((sum, log) => sum + (log.feed_consumed_kg || 0), 0);

    // Calculate P&L summary
    const allCosts = (costs as any[]) || [];
    const allMedCosts = (medicineCosts as any[]) || [];

    const chickTotal = allCosts.filter((c: any) => c.category === 'chick').reduce((s: number, c: any) => s + (c.amount || 0), 0);
    const labourTotal = allCosts.filter((c: any) => c.category === 'labour_daily' || c.category === 'labour_period').reduce((s: number, c: any) => s + (c.amount || 0), 0);
    const overheadTotal = allCosts.filter((c: any) => c.category === 'overhead').reduce((s: number, c: any) => s + (c.amount || 0), 0);
    const otherTotal = allCosts.filter((c: any) => c.category === 'other').reduce((s: number, c: any) => s + (c.amount || 0), 0);
    const medicineTotal = allMedCosts.reduce((s: number, c: any) => s + (c.total_cost || 0), 0);
    const grandTotal = chickTotal + feedTotal + medicineTotal + labourTotal + overheadTotal + otherTotal;

    // Get batch data for birds alive
    const { data: batch } = await supabase
      .from('batches')
      .select('current_bird_count, birds_placed')
      .eq('id', batchId)
      .single();

    const typedBatch = batch as Database['public']['Tables']['batches']['Row'] | null;
    const birdsAlive = typedBatch?.current_bird_count || 1;
    const liveCostPerBird = birdsAlive > 0 ? grandTotal / birdsAlive : 0;

    const plSummary = {
      chick_total: chickTotal,
      feed_total: feedTotal,
      medicine_total: medicineTotal,
      labour_total: labourTotal,
      overhead_total: overheadTotal,
      other_total: otherTotal,
      grand_total: grandTotal,
      live_cost_per_bird: liveCostPerBird,
      estimated_revenue: 0,
      target_margin: 20,
      target_cost_per_bird: 70,
      days_to_harvest: 21,
      current_price_p50: 162,
    };

    return NextResponse.json({
      success: true,
      costs: allCosts,
      pl_summary: plSummary,
      feed_costs: {
        total: feedTotal,
        avg_rate: feedTotalMt > 0 ? feedTotal / feedTotalMt : 30.5,
        total_mt: feedTotalMt / 1000,
      },
      medicine_costs: allMedCosts,
    });

  } catch (error) {
    console.error('Costs GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/farms/[farmId]/costs
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;



    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = CostCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }

    const data = validation.data;

    const { data: newCost, error } = await (supabase.from('batch_costs') as any)
      .insert({
        batch_id: data.batchId,
        farm_id: farmId,
        category: data.category,
        amount: data.amount,
        description: data.description,
        doc_supplier: data.doc_supplier,
        price_per_doc: data.price_per_doc,
        transport_cost: data.transport_cost,
        workers_count: data.workers_count,
        rate_per_day: data.rate_per_day,
        period_start_date: data.period_start_date,
        period_end_date: data.period_end_date,
        days_count: data.days_count,
        overhead_category: data.overhead_category,
        frequency: data.frequency,
        batch_share_pct: data.batch_share_pct,
        notes: data.notes,
        entry_date: data.entry_date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Cost insert error:', error);
      return NextResponse.json({ error: 'Failed to create cost entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true, cost: newCost });
  } catch (error) {
    console.error('Costs POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
