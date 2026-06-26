import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Zod schema for daily log entry
const DailyLogSchema = z.object({
  birds_dead: z.number().int().min(0).max(10000),
  feed_kg: z.number().positive().max(50000),
  water_liters: z.number().positive().max(100000).optional(),
  temp_min: z.number().min(-10).max(60).optional(),
  temp_max: z.number().min(-10).max(60).optional(),
  avg_weight_g: z.number().positive().max(4000).optional(),
  notes: z.string().max(500).optional(),
  date: z.string(),
  source: z.enum(['manual', 'whatsapp']).default('manual'),
  // Environment fields (TASK-GAP4-API-001)
  temp_morning: z.number().min(-10).max(60).optional(),
  temp_afternoon: z.number().min(-10).max(60).optional(),
  temp_evening: z.number().min(-10).max(60).optional(),
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

// GET /api/farms/[farmId]/logs
// Fetches daily log entries for a farm with optional source filtering
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // 'all', 'manual', 'whatsapp'
    const limit = parseInt(searchParams.get('limit') || '20');

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

    // Build query with source filter
    let query = supabase
      .from('daily_logs')
      .select(`
        id,
        log_date,
        birds_dead,
        feed_kg,
        water_liters,
        temp_min_c,
        temp_max_c,
        avg_weight_g,
        notes,
        source,
        created_at,
        temp_morning,
        temp_afternoon,
        temp_evening,
        humidity_morning,
        humidity_afternoon,
        ammonia_ppm,
        ammonia_method,
        litter_condition,
        light_hours,
        light_schedule,
        fan_speed,
        curtain_position,
        inlet_pct,
        ventilation_notes,
        water_temp_c,
        batches!inner(farm_id)
      `)
      .eq('batches.farm_id', farmId)
      .order('log_date', { ascending: false })
      .limit(limit);

    if (source && source !== 'all') {
      query = query.eq('source', source);
    }

    const { data: logs, error: logsError } = await query;

    if (logsError) {
      console.error('Daily logs fetch error:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch daily logs' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const transformedLogs = logs?.map((log: any) => ({
      id: log.id,
      date: log.log_date,
      birds_dead: log.birds_dead,
      feed_kg: log.feed_kg,
      water_liters: log.water_liters,
      temp_min_c: log.temp_min_c,
      temp_max_c: log.temp_max_c,
      avg_weight_g: log.avg_weight_g,
      notes: log.notes,
      source: log.source,
      status: 'synced', // Default status, could be enhanced with review_needed field
      created_at: log.created_at,
      // Environment fields (TASK-GAP4-API-001)
      temp_morning: log.temp_morning,
      temp_afternoon: log.temp_afternoon,
      temp_evening: log.temp_evening,
      humidity_morning: log.humidity_morning,
      humidity_afternoon: log.humidity_afternoon,
      ammonia_ppm: log.ammonia_ppm,
      ammonia_method: log.ammonia_method,
      litter_condition: log.litter_condition,
      light_hours: log.light_hours,
      light_schedule: log.light_schedule,
      fan_speed: log.fan_speed,
      curtain_position: log.curtain_position,
      inlet_pct: log.inlet_pct,
      ventilation_notes: log.ventilation_notes,
      water_temp_c: log.water_temp_c,
    })) || [];

    return NextResponse.json(transformedLogs);

  } catch (error) {
    console.error('Daily logs GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/farms/[farmId]/logs
// Creates a new daily log entry for a farm's active batch
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

    // Check segment: only S1, S2 or admin can create logs
    if (!['S1', 'S2'].includes(customer.segment) && customer.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: daily log creation is available for S1/S2 integrators only' },
        { status: 403 }
      );
    }

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
      .select('id, birds_placed')
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

    // Check if log already exists for this date
    const { data: existingLog } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('batch_id', (activeBatch as any).id)
      .eq('log_date', logData.date)
      .single();

    if (existingLog) {
      // Update existing log instead of creating new one
      const { data: updatedLog, error: updateError } = await (supabase.from('daily_logs') as any)
        .update({
          birds_dead: logData.birds_dead,
          feed_kg: logData.feed_kg,
          water_liters: logData.water_liters,
          temp_min_c: logData.temp_min,
          temp_max_c: logData.temp_max,
          avg_weight_g: logData.avg_weight_g,
          notes: logData.notes,
          source: logData.source,
          updated_at: new Date().toISOString(),
          // Environment fields (TASK-GAP4-API-001)
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
        .eq('id', (existingLog as any).id)
        .select()
        .single();

      if (updateError || !updatedLog) {
        console.error('Daily log update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update daily log' },
          { status: 500 }
        );
      }

      // Trigger GC recomputation after daily log update
      try {
        await supabase.rpc('compute_batch_gc', { p_batch_id: (activeBatch as any).id } as any);
      } catch (gcError) {
        console.error('GC recomputation error after log update:', gcError);
        // Don't fail the log update if GC recomputation fails
      }

      // Compute environment alerts (TASK-GAP4-API-001)
      const env_alerts: Array<{ type: string; severity: string; message?: string }> = [];
      if (logData.temp_afternoon && logData.temp_afternoon > 35) {
        env_alerts.push({ type: 'HEAT_STRESS', severity: 'WARNING', message: 'Heat stress risk detected' });
      }
      if (logData.temp_morning && logData.temp_morning < 10) {
        env_alerts.push({ type: 'COLD_STRESS', severity: 'WARNING', message: 'Cold stress risk detected' });
      }
      if (logData.humidity_morning && logData.humidity_morning > 75) {
        env_alerts.push({ type: 'HIGH_HUMIDITY', severity: 'WARNING', message: 'High humidity - respiratory disease risk' });
      }
      if (logData.humidity_afternoon && logData.humidity_afternoon > 75) {
        env_alerts.push({ type: 'HIGH_HUMIDITY', severity: 'WARNING', message: 'High humidity - respiratory disease risk' });
      }
      if (logData.ammonia_ppm && logData.ammonia_ppm > 25) {
        env_alerts.push({ type: 'HIGH_AMMONIA', severity: 'CRITICAL', message: 'Dangerous ammonia level - immediate ventilation increase required' });
      }

      return NextResponse.json({
        success: true,
        log: updatedLog,
        env_alerts,
        message: 'Daily log updated successfully',
      });
    }

    // Create new daily log entry
    const { data: newLog, error: insertError } = await (supabase.from('daily_logs') as any)
      .insert({
        batch_id: (activeBatch as any).id,
        log_date: logData.date,
        birds_dead: logData.birds_dead,
        feed_kg: logData.feed_kg,
        water_liters: logData.water_liters,
        temp_min_c: logData.temp_min,
        temp_max_c: logData.temp_max,
        avg_weight_g: logData.avg_weight_g,
        notes: logData.notes,
        source: logData.source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Environment fields (TASK-GAP4-API-001)
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

    if (insertError || !newLog) {
      console.error('Daily log creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create daily log' },
        { status: 500 }
      );
    }

    // Trigger GC recomputation after daily log creation
    try {
      await supabase.rpc('compute_batch_gc', { p_batch_id: (activeBatch as any).id } as any);
    } catch (gcError) {
      console.error('GC recomputation error after log creation:', gcError);
      // Don't fail the log creation if GC recomputation fails
    }

    // Compute environment alerts (TASK-GAP4-API-001)
    const env_alerts: Array<{ type: string; severity: string; message?: string }> = [];
    if (logData.temp_afternoon && logData.temp_afternoon > 35) {
      env_alerts.push({ type: 'HEAT_STRESS', severity: 'WARNING', message: 'Heat stress risk detected' });
    }
    if (logData.temp_morning && logData.temp_morning < 10) {
      env_alerts.push({ type: 'COLD_STRESS', severity: 'WARNING', message: 'Cold stress risk detected' });
    }
    if (logData.humidity_morning && logData.humidity_morning > 75) {
      env_alerts.push({ type: 'HIGH_HUMIDITY', severity: 'WARNING', message: 'High humidity - respiratory disease risk' });
    }
    if (logData.humidity_afternoon && logData.humidity_afternoon > 75) {
      env_alerts.push({ type: 'HIGH_HUMIDITY', severity: 'WARNING', message: 'High humidity - respiratory disease risk' });
    }
    if (logData.ammonia_ppm && logData.ammonia_ppm > 25) {
      env_alerts.push({ type: 'HIGH_AMMONIA', severity: 'CRITICAL', message: 'Dangerous ammonia level - immediate ventilation increase required' });
    }

    return NextResponse.json({
      success: true,
      log: newLog,
      env_alerts,
      message: 'आज का लॉग सुरक्षित हो गया ✓',
    });

  } catch (error) {
    console.error('Daily log POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
