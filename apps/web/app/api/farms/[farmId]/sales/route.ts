import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@poultrypulse/types';



const SaleCreateSchema = z.object({
  batchId: z.string(),
  sale_date: z.string(),
  sale_type: z.enum(['full', 'partial']),
  birds_sold: z.number().int().positive(),
  total_weight_kg: z.number().positive(),
  rate_per_kg: z.number().positive(),
  commission_amount: z.number().optional().default(0),
  commission_pct: z.number().optional(),
  weighment_deduction_kg: z.number().optional().default(0),
  net_revenue: z.number().optional(),
  buyer_name: z.string().optional(),
  vehicle_number: z.string().optional(),
  driver_name: z.string().optional(),
  departure_time: z.string().optional(),
  destination: z.string().optional(),
  crates_used: z.number().int().optional(),
  dead_in_transit: z.number().int().optional().default(0),
  payment_status: z.enum(['pending', 'confirmed', 'paid']).default('pending'),
  challan_number: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// GET /api/farms/[farmId]/sales?batchId=XXX
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

    // Fetch sales
    const { data: sales, error: salesError } = await supabase
      .from('batch_sales')
      .select('*')
      .eq('batch_id', batchId)
      .eq('farm_id', farmId)
      .order('sale_date', { ascending: false });

    const typedSales = (sales as Database['public']['Tables']['batch_sales']['Row'][]) || [];

    if (salesError) {
      console.error('Sales fetch error:', salesError);
    }

    // Fetch batch
    const { data: batch } = await supabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .eq('farm_id', farmId)
      .single();

    const typedBatch = batch as Database['public']['Tables']['batches']['Row'] | null;

    // Fetch latest price for farm district
    let priceData: { p50_price: number; region: string } | null = null;
    if (typedBatch) {
      const { data: farm } = await supabase
        .from('farms')
        .select('district')
        .eq('id', farmId)
        .single();

      const typedFarm = farm as Database['public']['Tables']['farms']['Row'] | null;

      if (typedFarm?.district) {
        const { data: prediction } = await supabase
          .from('predictions')
          .select('p50')
          .eq('mandi', typedFarm.district)
          .order('predicted_at', { ascending: false })
          .limit(1)
          .single();

        const typedPrediction = prediction as Database['public']['Tables']['predictions']['Row'] | null;
        if (typedPrediction) {
          priceData = { p50_price: typedPrediction.p50, region: typedFarm.district };
        }
      }
    }

    return NextResponse.json({
      success: true,
      sales: typedSales,
      batch: typedBatch,
      priceData,
    });

  } catch (error) {
    console.error('Sales GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/farms/[farmId]/sales
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
    const validation = SaleCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }

    const data = validation.data;
    const grossRevenue = data.total_weight_kg * data.rate_per_kg;
    const netRevenue = data.net_revenue ?? (grossRevenue - (data.commission_amount || 0));

    // Check for active withdrawal period before allowing sale
    const { data: activeTreatments } = await supabase
      .from('batch_treatments')
      .select('medicine_name, clearance_date, withdrawal_days')
      .eq('batch_id', data.batchId)
      .eq('farm_id', farmId)
      .eq('is_complete', false)
      .gt('clearance_date', new Date().toISOString().split('T')[0]);

    const typedActiveTreatments = activeTreatments as Database['public']['Tables']['batch_treatments']['Row'][] | null;

    if (typedActiveTreatments && typedActiveTreatments.length > 0) {
      return NextResponse.json({
        error: 'WITHDRAWAL_PERIOD_ACTIVE',
        message: `Cannot record sale: active withdrawal period. Latest clearance: ${typedActiveTreatments[0].clearance_date}`,
        active_treatments: typedActiveTreatments,
      }, { status: 422 });
    }

    // Get integrator_id
    const { data: farm } = await supabase
      .from('farms')
      .select('integrator_id')
      .eq('id', farmId)
      .single();

    const typedFarm = farm as Database['public']['Tables']['farms']['Row'] | null;

    const { data: newSale, error: saleError } = await (supabase.from('batch_sales') as any)
      .insert({
        batch_id: data.batchId,
        farm_id: farmId,
        integrator_id: typedFarm?.integrator_id || user.id,
        sale_date: data.sale_date,
        sale_type: data.sale_type,
        birds_sold: data.birds_sold,
        total_weight_kg: data.total_weight_kg,
        rate_per_kg: data.rate_per_kg,
        commission_amount: data.commission_amount,
        commission_pct: data.commission_pct,
        weighment_deduction_kg: data.weighment_deduction_kg,
        net_revenue: netRevenue,
        buyer_name_snapshot: data.buyer_name,
        vehicle_number: data.vehicle_number,
        driver_name: data.driver_name,
        departure_time: data.departure_time,
        destination: data.destination,
        crates_used: data.crates_used,
        dead_in_transit: data.dead_in_transit,
        payment_status: data.payment_status,
        challan_number: data.challan_number,
        notes: data.notes,
        created_by: user.id,
      })
      .select()
      .single();

    if (saleError) {
      console.error('Sale insert error:', saleError);
      return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
    }

    return NextResponse.json({ success: true, sale: newSale });
  } catch (error) {
    console.error('Sales POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
