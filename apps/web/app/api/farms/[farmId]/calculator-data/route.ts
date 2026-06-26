import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/farms/[farmId]/calculator-data
// Returns calculator parameters from live farm data
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
      .select('id, segment, role')
      .eq('id', user.id)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerData as { id: string; segment: string; role: string | null };

    // Check segment: only S2 or admin can access farms
    if (customer.segment !== 'S2' && customer.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: farm management is available for S2 integrators only' },
        { status: 403 }
      );
    }

    // Fetch farm with RLS check
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .eq('integrator_id', customer.id)
      .single();

    if (farmError || !farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    // Fetch active batch
    const { data: activeBatch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('farm_id', farmId)
      .eq('status', 'active')
      .single();

    if (batchError || !activeBatch) {
      return NextResponse.json(
        { error: 'No active batch found for this farm' },
        { status: 404 }
      );
    }

    // Calculate batch day number
    const placementDate = new Date((activeBatch as any).placement_date);
    const today = new Date();
    const batchDayNumber = Math.floor((today.getTime() - placementDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Fetch latest daily log for weight
    const { data: latestLog, error: logError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('batch_id', (activeBatch as any).id)
      .order('log_date', { ascending: false })
      .limit(1)
      .single();

    let avgWeightG = null;
    let birdsAlive = (activeBatch as any).birds_placed;
    let cumulativeMortality = 0;

    if (latestLog && !logError) {
      avgWeightG = (latestLog as any).avg_weight_g;
      birdsAlive = (latestLog as any).birds_alive || (activeBatch as any).birds_placed;
      
      // Calculate cumulative mortality from logs
      const { data: allLogs } = await supabase
        .from('daily_logs')
        .select('birds_dead')
        .eq('batch_id', (activeBatch as any).id);
      
      if (allLogs) {
        cumulativeMortality = allLogs.reduce((sum: number, log: any) => sum + (log.birds_dead || 0), 0);
        birdsAlive = (activeBatch as any).birds_placed - cumulativeMortality;
      }
    }

    // Estimate weight if no log exists (using breed growth curve)
    let estimatedWeightG = avgWeightG;
    if (!avgWeightG) {
      estimatedWeightG = getEstimatedWeight((activeBatch as any).breed, batchDayNumber);
    }

    // Calculate average feed cost per kg from feed purchases
    const { data: feedPurchases, error: feedError } = await supabase
      .from('feed_purchases')
      .select('quantity_mt, rate_per_kg')
      .eq('farm_id', farmId)
      .eq('batch_id', (activeBatch as any).id);

    let avgFeedCostPerKg = 45; // default market rate
    if (feedPurchases && feedPurchases.length > 0 && !feedError) {
      const totalKg = feedPurchases.reduce((sum: number, p: any) => sum + (p.quantity_mt * 1000), 0);
      const totalCost = feedPurchases.reduce((sum: number, p: any) => sum + (p.quantity_mt * 1000 * p.rate_per_kg), 0);
      if (totalKg > 0) {
        avgFeedCostPerKg = totalCost / totalKg;
      }
    }

    // Fetch GC data for break-even price
    const { data: gcData } = await supabase
      .from('batch_gc_costs')
      .select('*')
      .eq('batch_id', (activeBatch as any).id)
      .single();

    // Calculate GC per kg if GC data exists
    let gcPerKg = 0;
    if (gcData) {
      const feedCostTotal = feedPurchases?.reduce((sum: number, p: any) => sum + (p.quantity_mt * 1000 * p.rate_per_kg), 0) ?? 0;
      const totalCost = (gcData as any).doc_cost_total + feedCostTotal +
                       (gcData as any).medicine_cost_total + (gcData as any).vaccine_cost_total +
                       (gcData as any).litter_cost_total + (gcData as any).electricity_cost_total +
                       (gcData as any).water_cost_total + (gcData as any).labour_cost_total +
                       (gcData as any).misc_cost_total + (gcData as any).fixed_overhead_alloc;
      const avgWeightKg = (avgWeightG || estimatedWeightG) / 1000;
      const liveKgs = birdsAlive * avgWeightKg;
      gcPerKg = liveKgs > 0 ? Math.round((totalCost / liveKgs) * 100) / 100 : 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        birdsAlive,
        batchDayNumber,
        avgWeightG,
        estimatedWeightG,
        avgFeedCostPerKg,
        breed: (activeBatch as any).breed,
        targetHarvestAge: (activeBatch as any).target_harvest_age || 42,
        targetMarketWeight: (activeBatch as any).target_market_weight || 2100,
        gcPerKg, // Add GC per kg for break-even price
      },
    });

  } catch (error) {
    console.error('Calculator data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to estimate weight based on breed and day number
// Using standard growth curves for common broiler breeds
function getEstimatedWeight(breed: string, dayNumber: number): number {
  // Simplified growth curve estimation (in grams)
  // These are approximate values based on standard breed performance
  const baseGrowth = {
    'Cobb 430': [40, 80, 150, 250, 380, 530, 700, 890, 1090, 1310, 1540, 1780, 2020, 2260, 2490, 2710, 2920, 3110, 3290, 3450, 3600, 3740, 3870, 3990, 4100, 4200, 4290, 4370, 4440, 4500, 4550, 4590, 4620, 4640, 4650, 4660, 4660, 4660, 4660, 4660, 4660],
    'Ross 308': [42, 85, 160, 270, 400, 560, 740, 940, 1160, 1390, 1630, 1880, 2130, 2380, 2620, 2850, 3070, 3280, 3470, 3650, 3810, 3960, 4100, 4220, 4330, 4430, 4520, 4600, 4670, 4730, 4780, 4820, 4850, 4870, 4890, 4900, 4900, 4900, 4900, 4900, 4900],
    'Hubbard': [38, 75, 140, 240, 360, 510, 680, 870, 1070, 1280, 1500, 1730, 1960, 2190, 2410, 2620, 2820, 3010, 3190, 3360, 3510, 3650, 3780, 3900, 4010, 4110, 4200, 4280, 4350, 4410, 4460, 4500, 4530, 4550, 4570, 4580, 4580, 4580, 4580, 4580, 4580],
    'Vencobb': [40, 80, 150, 250, 380, 530, 700, 890, 1090, 1310, 1540, 1780, 2020, 2260, 2490, 2710, 2920, 3110, 3290, 3450, 3600, 3740, 3870, 3990, 4100, 4200, 4290, 4370, 4440, 4500, 4550, 4590, 4620, 4640, 4650, 4660, 4660, 4660, 4660, 4660, 4660],
    'Srinivasa': [35, 70, 130, 220, 340, 480, 640, 820, 1010, 1210, 1420, 1630, 1840, 2040, 2230, 2410, 2580, 2740, 2890, 3030, 3160, 3280, 3390, 3490, 3580, 3660, 3730, 3790, 3840, 3880, 3910, 3930, 3950, 3960, 3970, 3970, 3970, 3970, 3970, 3970, 3970],
  };

  const growthCurve = baseGrowth[breed as keyof typeof baseGrowth] || baseGrowth['Cobb 430'];
  
  // Clamp day number to valid range
  const clampedDay = Math.max(1, Math.min(dayNumber, 42));
  
  // Interpolate if between known points
  if (clampedDay <= growthCurve.length) {
    return growthCurve[clampedDay - 1];
  }
  
  // Extrapolate for days beyond 42 (minimal growth)
  return growthCurve[growthCurve.length - 1] + (clampedDay - 42) * 10;
}
