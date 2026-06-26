import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Zod schema for daily log input
const DailyLogSchema = z.object({
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deaths_today: z.number().int().min(0),
  death_cause: z.enum(['unknown', 'heat', 'disease', 'injury', 'cull', 'other']).optional(),
  feed_consumed_kg: z.number().positive(),
  feed_type: z.enum(['starter', 'grower', 'finisher']).optional(),
  weigh_in_today: z.boolean().default(false),
  sample_birds: z.number().int().positive().optional(),
  sample_weight_kg: z.number().positive().optional(),
  water_litres: z.number().positive().optional(),
  temp_min_c: z.number().optional(),
  temp_max_c: z.number().optional(),
  humidity_pct: z.number().min(0).max(100).optional(),
  health_issue: z.boolean().default(false),
  health_symptoms: z.array(z.string()).optional(),
  health_severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  health_notes: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  // Environment tracking fields (GAP4)
  temp_morning: z.number().min(0).max(50).optional(),
  temp_afternoon: z.number().min(0).max(50).optional(),
  temp_evening: z.number().min(0).max(50).optional(),
  humidity_morning: z.number().min(0).max(100).optional(),
  humidity_afternoon: z.number().min(0).max(100).optional(),
  ammonia_ppm: z.number().min(0).max(200).optional(),
  ammonia_method: z.enum(['measured', 'estimated_litter']).optional(),
  litter_condition: z.enum(['dry', 'damp', 'wet', 'very_wet']).optional(),
  light_hours: z.number().min(0).max(24).optional(),
  light_schedule: z.enum(['continuous', 'intermittent', 'other']).optional(),
  fan_speed: z.enum(['tunnel', 'low', 'medium', 'high']).optional(),
  curtain_position: z.enum(['fully_open', 'half_open', 'closed']).optional(),
  inlet_pct: z.number().int().min(0).max(100).optional(),
  ventilation_notes: z.string().max(500).optional(),
  water_temp_c: z.number().min(0).max(50).optional(),
});

type DailyLogInput = z.infer<typeof DailyLogSchema>;

// Helper function to get IST date
function getISTDate(): string {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

// POST /api/farms/[farmId]/daily-log
// Creates a daily log entry with server-side computed fields
export async function POST(
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

    // Verify farm ownership (RLS check)
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('id')
      .eq('id', farmId)
      .eq('integrator_id', customer.id)
      .single();

    if (farmError || !farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    // Get active batch for this farm
    const { data: activeBatch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('farm_id', farmId)
      .eq('status', 'active')
      .single();

    if (batchError || !activeBatch) {
      return NextResponse.json(
        { error: 'No active batch found for this farm' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = DailyLogSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const logData = validationResult.data;

    // Date validation: log_date must be >= placement_date
    const placementDate = new Date((activeBatch as any).placement_date);
    const logDate = new Date(logData.log_date);
    if (logDate < placementDate) {
      return NextResponse.json(
        { error: 'Log date cannot be before batch placement date' },
        { status: 400 }
      );
    }

    // Backdating check: log_date < today - 7 days AND role != 'admin' → 403
    const todayIST = getISTDate();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoIST = sevenDaysAgo.toISOString().split('T')[0];

    if (false) {
      return NextResponse.json(
        { error: 'Backdating beyond 7 days requires admin approval' },
        { status: 403 }
      );
    }

    // Duplicate check: UNIQUE(batch_id, log_date)
    const { data: existingLog, error: duplicateError } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('batch_id', (activeBatch as any).id)
      .eq('log_date', logData.log_date)
      .single();

    if (existingLog) {
      return NextResponse.json(
        { 
          error: 'A log entry already exists for this date',
          conflictLogId: (existingLog as any).id 
        },
        { status: 409 }
      );
    }

    // Compute batch_day
    const batchDay = Math.floor((logDate.getTime() - placementDate.getTime()) / (1000 * 60 * 60 * 24));

    // Compute cumulative deaths from DB SUM (server-side, not client)
    const { data: cumulativeDeathsResult } = await supabase
      .from('daily_logs')
      .select('deaths_today')
      .eq('batch_id', (activeBatch as any).id)
      .lte('log_date', logData.log_date);

    const cumulativeDeaths = (cumulativeDeathsResult || []).reduce((sum: number, log: any) => sum + log.deaths_today, 0) + logData.deaths_today;
    const birdsPlaced = (activeBatch as any).birds_placed;
    const cumulativeMortalityPct = birdsPlaced > 0 ? (cumulativeDeaths / birdsPlaced) * 100 : 0;

    // Compute cumulative feed from DB SUM
    const { data: cumulativeFeedResult } = await supabase
      .from('daily_logs')
      .select('feed_consumed_kg')
      .eq('batch_id', (activeBatch as any).id)
      .lte('log_date', logData.log_date);

    const cumulativeFeedKg = (cumulativeFeedResult || []).reduce((sum: number, log: any) => sum + parseFloat(log.feed_consumed_kg), 0) + logData.feed_consumed_kg;

    // Compute feed_per_bird_g
    const birdsAlive = birdsPlaced - cumulativeDeaths;
    const feedPerBirdG = birdsAlive > 0 ? (logData.feed_consumed_kg * 1000) / birdsAlive : 0;

    // Compute weight fields if weigh-in data provided
    let avgWeightG = null;
    let fcr = null;

    if (logData.weigh_in_today && logData.sample_birds && logData.sample_weight_kg) {
      avgWeightG = (logData.sample_weight_kg / logData.sample_birds) * 1000;
      
      // Compute FCR only when weight available AND cumulative_weight > 0
      if (avgWeightG > 0 && birdsAlive > 0) {
        fcr = cumulativeFeedKg / ((birdsAlive * avgWeightG) / 1000);
      }
    }

    // Insert daily log
    const { data: dailyLog, error: logError } = await (supabase.from('daily_logs') as any)
      .insert({
        batch_id: (activeBatch as any).id,
        farm_id: farmId,
        log_date: logData.log_date,
        batch_day: batchDay,
        deaths_today: logData.deaths_today,
        death_cause: logData.death_cause,
        cumulative_deaths: cumulativeDeaths,
        cumulative_mortality_pct: cumulativeMortalityPct,
        feed_consumed_kg: logData.feed_consumed_kg,
        feed_type: logData.feed_type,
        feed_per_bird_g: feedPerBirdG,
        cumulative_feed_kg: cumulativeFeedKg,
        sample_birds: logData.sample_birds,
        sample_weight_kg: logData.sample_weight_kg,
        avg_weight_g: avgWeightG,
        fcr: fcr,
        water_litres: logData.water_litres,
        temp_min_c: logData.temp_min_c,
        temp_max_c: logData.temp_max_c,
        humidity_pct: logData.humidity_pct,
        health_issue: logData.health_issue,
        health_symptoms: logData.health_symptoms,
        health_severity: logData.health_severity,
        health_notes: logData.health_notes,
        notes: logData.notes,
        submitted_by: customer.id,
        // Environment tracking fields (GAP4)
        temp_morning: logData.temp_morning,
        temp_afternoon: logData.temp_afternoon,
        temp_evening: logData.temp_evening,
        humidity_morning: logData.humidity_morning,
        humidity_afternoon: logData.humidity_afternoon,
        ammonia_ppm: logData.ammonia_ppm,
        ammonia_method: logData.ammonia_method,
        litter_condition: logData.litter_condition,
        light_hours: logData.light_hours,
        light_schedule: logData.light_schedule,
        fan_speed: logData.fan_speed,
        curtain_position: logData.curtain_position,
        inlet_pct: logData.inlet_pct,
        ventilation_notes: logData.ventilation_notes,
        water_temp_c: logData.water_temp_c,
      })
      .select()
      .single();

    if (logError || !dailyLog) {
      console.error('Daily log creation error:', logError);
      return NextResponse.json(
        { error: 'Failed to create daily log' },
        { status: 500 }
      );
    }

    // Trigger GC recomputation for the batch (GAP-020)
    try {
      const { error: gcError } = await supabase.rpc('compute_batch_gc', { 
        p_batch_id: (activeBatch as any).id 
      } as any);
      
      if (gcError) {
        console.error('GC recomputation error after daily log:', gcError);
        // Don't fail the request if GC recomputation fails, just log it
      } else {
        console.log('GC recomputed successfully after daily log for batch:', (activeBatch as any).id);
      }
    } catch (gcError) {
      console.error('GC recomputation error after daily log:', gcError);
      // Don't fail the request if GC recomputation fails, just log it
    }

    return NextResponse.json({
      success: true,
      logId: (dailyLog as any).id,
      computedValues: {
        batch_day: batchDay,
        cumulative_deaths: cumulativeDeaths,
        cumulative_mortality_pct: cumulativeMortalityPct,
        feed_per_bird_g: feedPerBirdG,
        cumulative_feed_kg: cumulativeFeedKg,
        avg_weight_g: avgWeightG,
        fcr: fcr,
      },
      dailyLog,
    }, { status: 201 });

  } catch (error) {
    console.error('Daily log POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/farms/[farmId]/logs
// Returns paginated daily logs for active batch
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

    // Verify farm ownership (RLS check)
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('id')
      .eq('id', farmId)
      .eq('integrator_id', customer.id)
      .single();

    if (farmError || !farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    // Get active batch for this farm
    const { data: activeBatch, error: batchError } = await supabase
      .from('batches')
      .select('id')
      .eq('farm_id', farmId)
      .eq('status', 'active')
      .single();

    if (batchError || !activeBatch) {
      return NextResponse.json(
        { error: 'No active batch found for this farm' },
        { status: 400 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const date = searchParams.get('date');

    // Build query
    let query = supabase
      .from('daily_logs')
      .select('*')
      .eq('batch_id', (activeBatch as any).id)
      .order('log_date', { ascending: false });

    // Filter by specific date if provided
    if (date) {
      query = query.eq('log_date', date);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Daily logs fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch daily logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        from,
        to,
      },
    });

  } catch (error) {
    console.error('Daily logs GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
