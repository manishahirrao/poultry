import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Fetch historical GC data for the last 5 completed batches of a farm
export async function GET(
  request: NextRequest,
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

    // Get customer to check segment
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerData as { id: string };

    // Verify farm belongs to this user
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('id, name')
      .eq('id', farmId)
      .eq('integrator_id', customer.id)
      .single();

    if (farmError || !farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    // Get last 5 completed batches with their GC data
    const { data: batches, error: batchesError } = await supabase
      .from('batches')
      .select(`
        id,
        batch_number,
        placement_date,
        birds_placed,
        birds_harvested,
        status,
        closed_at,
        batch_gc_costs (
          gc_per_kg,
          total_cost_all_in,
          gc_computation_date
        )
      `)
      .eq('farm_id', farmId)
      .eq('status', 'closed')
      .order('placement_date', { ascending: false })
      .limit(5);

    if (batchesError) {
      console.error('Batches query error:', batchesError);
      return NextResponse.json(
        { error: 'Failed to fetch batch history' },
        { status: 500 }
      );
    }

    // Transform data for the response
    const history = (batches as any[])?.map((batch: any) => {
      const gcData = batch.batch_gc_costs?.[0] || {};
      return {
        batchId: batch.id,
        batchNumber: batch.batch_number,
        placementDate: batch.placement_date,
        birdsPlaced: batch.birds_placed,
        birdsHarvested: batch.birds_harvested,
        closedAt: batch.closed_at,
        gcPerKg: gcData.gc_per_kg || null,
        totalCost: gcData.total_cost_all_in || null,
        computationDate: gcData.gc_computation_date || null,
      };
    }) || [];

    return NextResponse.json({
      farmId,
      farmName: (farm as any).name,
      history,
    });
  } catch (error) {
    console.error('GC History API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
