import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';



const BatchCloseSchema = z.object({
  birds_harvested: z.number().int().positive(),
  closed_at: z.string(),
});

// PATCH /api/farms/[farmId]/batches/[batchId]/close
// Closes a batch (sets status to 'closed')
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string; batchId: string }> }
) {
  try {
    const { farmId, batchId } = await params;



    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = BatchCloseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }

    const data = validation.data;

    // Verify batch belongs to this farm
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('id, status, farm_id')
      .eq('id', batchId)
      .eq('farm_id', farmId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (batch.status === 'closed') {
      return NextResponse.json({ error: 'Batch is already closed' }, { status: 400 });
    }

    // Update batch status to closed
    const { data: updatedBatch, error: updateError } = await supabase
      .from('batches')
      .update({
        status: 'closed',
        birds_harvested: data.birds_harvested,
        closed_at: data.closed_at,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', batchId)
      .select()
      .single();

    if (updateError) {
      console.error('Batch close error:', updateError);
      return NextResponse.json({ error: 'Failed to close batch' }, { status: 500 });
    }

    // Update farm status to between_batches
    await supabase
      .from('farms')
      .update({ status: 'between_batches', updated_at: new Date().toISOString() } as any)
      .eq('id', farmId);

    return NextResponse.json({ success: true, batch: updatedBatch });

  } catch (error) {
    console.error('Batch close PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
