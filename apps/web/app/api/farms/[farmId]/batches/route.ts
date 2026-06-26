import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Zod schema for batch creation
const BatchCreateSchema = z.object({
  breed: z.enum(['Cobb 430', 'Ross 308', 'Hubbard', 'Vencobb', 'Srinivasa', 'Other']),
  doc_supplier: z.string().min(1),
  placement_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birds_placed: z.number().int().positive(),
  price_per_doc: z.number().optional(),
  target_harvest_age: z.number().int().default(42),
  target_market_weight: z.number().int().default(2100),
  feed_supplier: z.string().optional(),
  notes: z.string().optional(),
});

type BatchCreateInput = z.infer<typeof BatchCreateSchema>;

// Vaccination schedules for different breeds (simplified for Phase 1)
const VACCINATION_SCHEDULES: Record<string, Array<{ day: number; name: string }>> = {
  'Cobb 430': [
    { day: 5, name: 'Marek\'s Disease' },
    { day: 7, name: 'Newcastle Disease (Lasota)' },
    { day: 14, name: 'Infectious Bursal Disease (Gumboro)' },
    { day: 21, name: 'Newcastle Disease (R2B)' },
    { day: 28, name: 'Infectious Bronchitis' },
  ],
  'Ross 308': [
    { day: 5, name: 'Marek\'s Disease' },
    { day: 7, name: 'Newcastle Disease (Lasota)' },
    { day: 14, name: 'Infectious Bursal Disease (Gumboro)' },
    { day: 21, name: 'Newcastle Disease (R2B)' },
    { day: 28, name: 'Infectious Bronchitis' },
  ],
  'Hubbard': [
    { day: 5, name: 'Marek\'s Disease' },
    { day: 7, name: 'Newcastle Disease (Lasota)' },
    { day: 14, name: 'Infectious Bursal Disease (Gumboro)' },
    { day: 21, name: 'Newcastle Disease (R2B)' },
  ],
  'Vencobb': [
    { day: 5, name: 'Marek\'s Disease' },
    { day: 7, name: 'Newcastle Disease (Lasota)' },
    { day: 14, name: 'Infectious Bursal Disease (Gumboro)' },
    { day: 21, name: 'Newcastle Disease (R2B)' },
  ],
  'Srinivasa': [
    { day: 5, name: 'Marek\'s Disease' },
    { day: 7, name: 'Newcastle Disease (Lasota)' },
    { day: 14, name: 'Infectious Bursal Disease (Gumboro)' },
    { day: 21, name: 'Newcastle Disease (R2B)' },
  ],
  'Other': [
    { day: 5, name: 'Marek\'s Disease' },
    { day: 7, name: 'Newcastle Disease (Lasota)' },
    { day: 14, name: 'Infectious Bursal Disease (Gumboro)' },
    { day: 21, name: 'Newcastle Disease (R2B)' },
  ],
};

// POST /api/farms/[farmId]/batches
// Creates a new batch, closes any existing active batch first
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
      .select('id, status')
      .eq('id', farmId)
      .eq('integrator_id', customer.id)
      .single();

    if (farmError || !farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    // Check if there's an existing active batch
    const { data: existingActiveBatch, error: existingBatchError } = await supabase
      .from('batches')
      .select('*')
      .eq('farm_id', farmId)
      .eq('status', 'active')
      .single();

    let warningMessage = null;

    if (existingActiveBatch && !existingBatchError) {
      // Check if existing batch is within 7 days of target harvest age
      const placementDate = new Date((existingActiveBatch as any).placement_date);
      const targetHarvestAge = (existingActiveBatch as any).target_harvest_age || 42;
      const targetHarvestDate = new Date(placementDate.getTime() + targetHarvestAge * 24 * 60 * 60 * 1000);
      const today = new Date();
      const daysUntilHarvest = Math.floor((targetHarvestDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

      if (daysUntilHarvest <= 7) {
        warningMessage = `Existing batch is within ${daysUntilHarvest} days of harvest window. Consider harvesting before starting new batch.`;
      }

      // Close existing active batch
      const { error: closeError } = await (supabase.from('batches') as any)
        .update({
          status: 'closed',
          closed_at: new Date().toISOString().split('T')[0],
        })
        .eq('id', (existingActiveBatch as any).id);

      if (closeError) {
        console.error('Batch close error:', closeError);
        return NextResponse.json(
          { error: 'Failed to close existing batch' },
          { status: 500 }
        );
      }
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = BatchCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const batchData = validationResult.data;

    // Get next batch number for this farm
    const { data: existingBatches } = await supabase
      .from('batches')
      .select('batch_number')
      .eq('farm_id', farmId)
      .order('batch_number', { ascending: false })
      .limit(1);

    const nextBatchNumber = existingBatches && existingBatches.length > 0 
      ? (existingBatches[0] as any).batch_number + 1 
      : 1;

    // Create new batch
    const { data: batch, error: batchError } = await (supabase.from('batches') as any)
      .insert({
        farm_id: farmId,
        batch_number: nextBatchNumber,
        breed: batchData.breed,
        doc_supplier: batchData.doc_supplier,
        placement_date: batchData.placement_date,
        birds_placed: batchData.birds_placed,
        price_per_doc: batchData.price_per_doc,
        target_harvest_age: batchData.target_harvest_age,
        target_market_weight: batchData.target_market_weight,
        feed_supplier: batchData.feed_supplier,
        notes: batchData.notes,
        status: 'active',
      })
      .select()
      .single();

    if (batchError || !batch) {
      console.error('Batch creation error:', batchError);
      return NextResponse.json(
        { error: 'Failed to create batch' },
        { status: 500 }
      );
    }

    // Update farm status to active
    const { error: farmUpdateError } = await (supabase.from('farms') as any)
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', farmId);

    if (farmUpdateError) {
      console.error('Farm status update error:', farmUpdateError);
    }

    // Auto-generate vaccination schedule based on breed
    const vaccinationSchedule = VACCINATION_SCHEDULES[batchData.breed] || VACCINATION_SCHEDULES['Other'];
    const placementDate = new Date(batchData.placement_date);
    const vaccinationsToInsert = vaccinationSchedule.map(vaccine => {
      const dueDate = new Date(placementDate.getTime() + vaccine.day * 24 * 60 * 60 * 1000);
      return {
        batch_id: (batch as any).id,
        vaccine_name: vaccine.name,
        vaccine_type: 'routine',
        scheduled_day: vaccine.day,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
      };
    });

    const { error: vaccinationError } = await (supabase.from('vaccinations') as any)
      .insert(vaccinationsToInsert);

    if (vaccinationError) {
      console.error('Vaccination schedule creation error:', vaccinationError);
      // Don't fail the batch creation if vaccination schedule fails
    }

    return NextResponse.json({
      success: true,
      batchId: (batch as any).id,
      batch,
      vaccinationSchedule: vaccinationsToInsert,
      warning: warningMessage,
    }, { status: 201 });

  } catch (error) {
    console.error('Batches POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/farms/[farmId]/batches
// Returns all batches for this farm (including closed), paginated
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Build query
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: batches, error, count } = await supabase
      .from('batches')
      .select('*')
      .eq('farm_id', farmId)
      .order('batch_number', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Batches fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch batches' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      batches: batches || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        from,
        to,
      },
    });

  } catch (error) {
    console.error('Batches GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
