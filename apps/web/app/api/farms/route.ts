import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@poultrypulse/types';

// Zod schemas for validation
const FarmCreateSchema = z.object({
  name: z.string().min(1).max(60),
  farm_type: z.enum(['broiler', 'layer', 'breeder']),
  district: z.string().min(1),
  state: z.string().default('Uttar Pradesh'),
  block: z.string().optional(),
  village: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  manager_name: z.string().optional(),
  manager_phone: z.string().optional(),
  sheds: z.array(z.object({
    name: z.string().min(1),
    capacity: z.number().int().positive(),
    shed_type: z.enum(['open_sided', 'env_controlled', 'semi_controlled']).optional(),
    floor_type: z.enum(['litter', 'slat', 'cage']).optional(),
  })).min(1).max(20),
  batch: z.object({
    breed: z.enum(['Cobb 430', 'Ross 308', 'Hubbard', 'Vencobb', 'Srinivasa', 'Other']),
    doc_supplier: z.string(),
    placement_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    birds_placed: z.number().int().positive(),
    price_per_doc: z.number().optional(),
    target_harvest_age: z.number().int().default(42),
    target_market_weight: z.number().int().default(2100),
    feed_supplier: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

type FarmCreateInput = z.infer<typeof FarmCreateSchema>;

// GET /api/farms
// Returns all farms for the authenticated integrator
// Query params: status (filter), sort (name|fcr|mortality|birds|last_log)
export async function GET(request: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const sortBy = searchParams.get('sort') || 'name';

    // Build query
    let query = supabase
      .from('farms')
      .select(`
        *,
        sheds(id, name, capacity, shed_type, floor_type),
        batches!active_batches(
          id,
          batch_number,
          breed,
          placement_date,
          birds_placed,
          status,
          target_harvest_age
        )
      `)
      .eq('integrator_id', customer.id);

    // Apply status filter if provided
    if (statusFilter && ['active', 'between_batches', 'paused', 'archived', 'onboarding'].includes(statusFilter)) {
      query = query.eq('status', statusFilter);
    }

    const { data: farms, error } = await query;

    if (error) {
      console.error('Farms fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch farms' },
        { status: 500 }
      );
    }

    // Get last log dates for each farm
    const farmIds = (farms as any[]).map(f => f.id);
    const { data: lastLogs } = await supabase
      .from('daily_logs')
      .select('farm_id, log_date')
      .in('farm_id', farmIds)
      .order('log_date', { ascending: false });

    // Map last log dates to farms
    const lastLogMap = new Map<string, string>();
    if (lastLogs) {
      lastLogs.forEach((log: any) => {
        if (!lastLogMap.has(log.farm_id)) {
          lastLogMap.set(log.farm_id, log.log_date);
        }
      });
    }

    // Attach last_log_date to each farm
    const farmsWithLastLog = (farms as any[]).map(farm => ({
      ...farm,
      last_log_date: lastLogMap.get(farm.id) || null,
    }));

    // Apply sorting
    const sortedFarms = farmsWithLastLog.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'last_log':
          if (!a.last_log_date) return 1;
          if (!b.last_log_date) return -1;
          return new Date(b.last_log_date).getTime() - new Date(a.last_log_date).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return NextResponse.json({
      success: true,
      farms: sortedFarms,
    });

  } catch (error) {
    console.error('Farms API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/farms
// Creates a new farm with sheds and optional batch in a transaction
export async function POST(request: NextRequest) {
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

    // Check max farms limit (50 per integrator)
    const { count: farmCount, error: countError } = await supabase
      .from('farms')
      .select('*', { count: 'exact', head: true })
      .eq('integrator_id', customer.id);

    if (countError) {
      console.error('Farm count error:', countError);
      return NextResponse.json(
        { error: 'Failed to check farm limit' },
        { status: 500 }
      );
    }

    if (farmCount && farmCount >= 50) {
      return NextResponse.json(
        { error: 'Maximum farm limit reached (50 farms). Please contact support to increase your limit.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = FarmCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const farmData = validationResult.data;

    // Calculate total capacity from sheds
    const totalCapacity = farmData.sheds.reduce((sum, shed) => sum + shed.capacity, 0);

    // Start transaction: create farm
    const { data: farm, error: farmError } = await (supabase.from('farms') as any)
      .insert({
        integrator_id: customer.id,
        name: farmData.name,
        farm_type: farmData.farm_type,
        district: farmData.district,
        state: farmData.state,
        block: farmData.block,
        village: farmData.village,
        lat: farmData.lat,
        lng: farmData.lng,
        manager_name: farmData.manager_name,
        manager_phone: farmData.manager_phone,
        total_capacity: totalCapacity,
        status: farmData.batch ? 'active' : 'between_batches',
      })
      .select()
      .single();

    if (farmError || !farm) {
      console.error('Farm creation error:', farmError);
      return NextResponse.json(
        { error: 'Failed to create farm' },
        { status: 500 }
      );
    }

    // Create sheds
    const shedsToInsert = farmData.sheds.map((shed, index) => ({
      farm_id: (farm as any).id,
      shed_number: index + 1,
      name: shed.name,
      capacity: shed.capacity,
      shed_type: shed.shed_type,
      floor_type: shed.floor_type,
    }));

    const { error: shedsError } = await (supabase.from('sheds') as any)
      .insert(shedsToInsert);

    if (shedsError) {
      console.error('Sheds creation error:', shedsError);
      // Rollback: delete the farm
      await supabase.from('farms').delete().eq('id', (farm as any).id);
      return NextResponse.json(
        { error: 'Failed to create sheds. Farm creation rolled back.' },
        { status: 500 }
      );
    }

    let batchId = null;

    // Create batch if provided
    if (farmData.batch) {
      // Get next batch number for this farm
      const { data: existingBatches } = await supabase
        .from('batches')
        .select('batch_number')
        .eq('farm_id', (farm as any).id)
        .order('batch_number', { ascending: false })
        .limit(1);

      const nextBatchNumber = existingBatches && existingBatches.length > 0 
        ? (existingBatches[0] as any).batch_number + 1 
        : 1;

      const { data: batch, error: batchError } = await (supabase.from('batches') as any)
        .insert({
          farm_id: (farm as any).id,
          customer_id: customer.id,
          batch_number: nextBatchNumber,
          breed: farmData.batch.breed,
          doc_supplier: farmData.batch.doc_supplier,
          placement_date: farmData.batch.placement_date,
          birds_placed: farmData.batch.birds_placed,
          price_per_doc: farmData.batch.price_per_doc,
          target_harvest_age: farmData.batch.target_harvest_age,
          target_market_weight: farmData.batch.target_market_weight,
          feed_supplier: farmData.batch.feed_supplier,
          notes: farmData.batch.notes,
          status: 'growing',
        })
        .select()
        .single();

      if (batchError || !batch) {
        console.error('Batch creation error:', batchError);
        // Rollback: delete sheds and farm
        await supabase.from('sheds').delete().eq('farm_id', (farm as any).id);
        await supabase.from('farms').delete().eq('id', (farm as any).id);
        return NextResponse.json(
          { error: 'Failed to create batch. Farm creation rolled back.' },
          { status: 500 }
        );
      }

      batchId = (batch as any).id;

      // TODO: Generate vaccination schedule based on breed
      // This would be implemented in a separate function or trigger
    }

    return NextResponse.json({
      success: true,
      farmId: (farm as any).id,
      batchId,
      farm,
    }, { status: 201 });

  } catch (error) {
    console.error('Farms POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
