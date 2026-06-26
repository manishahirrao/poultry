import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const transferUpdateSchema = z.object({
  status: z.enum(['draft', 'in_transit', 'received', 'cancelled']),
  remarks: z.string().optional(),
});

const receiveItemSchema = z.object({
  item_id: z.string().uuid(),
  quantity_received: z.number().min(0),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('stock_transfers')
      .select(`
        *,
        branches!from_branch_stock_transfers(id, branch_name, city),
        farmers!from_farmer_stock_transfers(id, full_name, village),
        branches!to_branch_stock_transfers(id, branch_name, city),
        farmers!to_farmer_stock_transfers(id, full_name, village),
        batches!inner(id, batch_number),
        farms!inner(id, farm_name),
        vehicles!inner(id, vehicle_number),
        employees!inner(id, name),
        stock_transfer_items!inner(
          id, 
          product_id, 
          quantity_sent, 
          quantity_received,
          shortage_qty,
          products!inner(id, product_name, unit_of_measure)
        )
      `)
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Stock transfer not found / स्टॉक ट्रांसफर नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching stock transfer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock transfer / स्टॉक ट्रांसफर प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = transferUpdateSchema.parse(body);

    // Verify ownership
    const { data: existingTransfer } = await supabase
      .from('stock_transfers')
      .select('id, status')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingTransfer) {
      return NextResponse.json(
        { error: 'Stock transfer not found or unauthorized / स्टॉक ट्रांसफर नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('stock_transfers')
      .update({
        status: validatedData.status,
        remarks: validatedData.remarks || null,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error updating stock transfer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update stock transfer / स्टॉक ट्रांसफर अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = receiveItemSchema.parse(body);

    // Verify ownership and get transfer
    const { data: transfer } = await supabase
      .from('stock_transfers')
      .select('id, status')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!transfer) {
      return NextResponse.json(
        { error: 'Stock transfer not found / स्टॉक ट्रांसफर नहीं मिला' },
        { status: 404 }
      );
    }

    if (transfer.status === 'received') {
      return NextResponse.json(
        { error: 'Transfer already received / ट्रांसफर पहले ही प्राप्त हो चुका है' },
        { status: 400 }
      );
    }

    // Update transfer item
    const { error: itemError } = await supabase
      .from('stock_transfer_items')
      .update({
        quantity_received: validatedData.quantity_received,
      })
      .eq('id', validatedData.item_id)
      .eq('transfer_id', params.id);

    if (itemError) throw itemError;

    // Check if all items are received
    const { data: items } = await supabase
      .from('stock_transfer_items')
      .select('quantity_sent, quantity_received')
      .eq('transfer_id', params.id);

    if (items) {
      const allReceived = items.every((item: any) => item.quantity_received !== null && item.quantity_received >= 0);
      if (allReceived) {
        await supabase
          .from('stock_transfers')
          .update({ status: 'received' })
          .eq('id', params.id);
      }
    }

    return NextResponse.json({
      data: { success: true },
      error: null
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error / सत्यापन त्रुटि', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error receiving stock transfer:', error);
    return NextResponse.json(
      { error: 'Failed to receive stock transfer / स्टॉक ट्रांसफर प्राप्त करने में विफल' },
      { status: 500 }
    );
  }
}
