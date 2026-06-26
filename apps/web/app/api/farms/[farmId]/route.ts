import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@poultrypulse/types';

// Zod schema for partial updates
const FarmUpdateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  district: z.string().min(1).optional(),
  state: z.string().optional(),
  block: z.string().optional(),
  village: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  manager_name: z.string().optional(),
  manager_phone: z.string().optional(),
  status: z.enum(['active', 'between_batches', 'paused', 'archived', 'onboarding']).optional(),
}).strict();

type FarmUpdateInput = z.infer<typeof FarmUpdateSchema>;

// GET /api/farms/[farmId]
// Returns full farm detail with active batch and last 30 daily logs
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

    // Fetch farm with RLS check (integrator_id = auth.uid())
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .eq('integrator_id', customer.id)
      .single();

    const typedFarm = farm as Database['public']['Tables']['farms']['Row'] | null;

    if (farmError || !typedFarm) {
      // Return 404 (not 403) to avoid leaking farm existence
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    // Fetch sheds
    const { data: sheds, error: shedsError } = await supabase
      .from('sheds')
      .select('*')
      .eq('farm_id', farmId);

    const typedSheds = (sheds as Database['public']['Tables']['sheds']['Row'][]) || [];

    if (shedsError) {
      console.error('Sheds fetch error:', shedsError);
    }

    // Fetch active batch
    const { data: activeBatch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('farm_id', farmId)
      .eq('status', 'active')
      .single();

    const typedActiveBatch = activeBatch as Database['public']['Tables']['batches']['Row'] | null;

    if (batchError && batchError.code !== 'PGRST116') {
      // PGRST116 = not found, which is expected if no active batch
      console.error('Batch fetch error:', batchError);
    }

    // Fetch last 30 daily logs if active batch exists
    let dailyLogs: Database['public']['Tables']['daily_logs']['Row'][] = [];
    if (typedActiveBatch) {
      const { data: logs, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('batch_id', typedActiveBatch.id)
        .order('log_date', { ascending: false })
        .limit(30);

      if (logsError) {
        console.error('Daily logs fetch error:', logsError);
      } else {
        dailyLogs = (logs as Database['public']['Tables']['daily_logs']['Row'][]) || [];
      }
    }

    return NextResponse.json({
      success: true,
      farm: typedFarm,
      sheds: typedSheds,
      activeBatch: typedActiveBatch,
      dailyLogs,
    });

  } catch (error) {
    console.error('Farm detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/farms/[farmId]
// Partially updates farm fields
export async function PATCH(
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

    // Check segment: only S2 or admin can update farms
    if (customer.segment !== 'S2' && customer.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: farm management is available for S2 integrators only' },
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

    const typedFarm = farm as Database['public']['Tables']['farms']['Row'];

    // Parse and validate request body
    const body = await request.json();
    const validationResult = FarmUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Add updated_at timestamp
    const { data: updatedFarm, error: updateError } = await (supabase.from('farms') as any)
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', farmId)
      .select()
      .single();

    const typedUpdatedFarm = updatedFarm as Database['public']['Tables']['farms']['Row'] | null;

    if (updateError || !typedUpdatedFarm) {
      console.error('Farm update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update farm' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      farm: typedUpdatedFarm,
    });

  } catch (error) {
    console.error('Farm PATCH API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/farms/[farmId]
// Archives a farm (sets status to 'archived', does not hard delete)
export async function DELETE(
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

    // Check segment: only S2 or admin can archive farms
    if (customer.segment !== 'S2' && customer.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: farm management is available for S2 integrators only' },
        { status: 403 }
      );
    }

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

    const typedFarm = farm as Database['public']['Tables']['farms']['Row'];

    // Check if farm has active batch
    const { data: activeBatch } = await supabase
      .from('batches')
      .select('id')
      .eq('farm_id', farmId)
      .eq('status', 'active')
      .single();

    const typedActiveBatch = activeBatch as Database['public']['Tables']['batches']['Row'] | null;

    if (typedActiveBatch) {
      return NextResponse.json(
        { error: 'Cannot archive farm with active batch. Please close the batch first.' },
        { status: 400 }
      );
    }

    // Archive farm (soft delete)
    const { data: archivedFarm, error: archiveError } = await (supabase.from('farms') as any)
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', farmId)
      .select()
      .single();

    const typedArchivedFarm = archivedFarm as Database['public']['Tables']['farms']['Row'] | null;

    if (archiveError || !typedArchivedFarm) {
      console.error('Farm archive error:', archiveError);
      return NextResponse.json(
        { error: 'Failed to archive farm' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      farm: typedArchivedFarm,
    });

  } catch (error) {
    console.error('Farm DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
