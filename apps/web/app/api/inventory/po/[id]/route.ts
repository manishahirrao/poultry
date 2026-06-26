import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const poUpdateSchema = z.object({
  status: z.enum(['draft', 'open', 'partial', 'received', 'cancelled']).optional(),
  expected_delivery: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid delivery date').optional().or(z.literal('')),
  remarks: z.string().optional(),
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
      .from('purchase_orders')
      .select(`
        *,
        suppliers!inner(id, supplier_name, supplier_type, phone, address),
        branches!inner(id, branch_name, branch_type, city),
        purchase_order_items!inner(
          id, 
          product_id, 
          ordered_qty, 
          received_qty, 
          unit_rate, 
          tax_amount, 
          line_total,
          products!inner(id, product_name, unit_of_measure)
        )
      `)
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Purchase order not found / खरीद आदेश नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch purchase order / खरीद आदेश प्राप्त करने में विफल',
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
    const validatedData = poUpdateSchema.parse(body);

    // Verify ownership
    const { data: existingPO } = await supabase
      .from('purchase_orders')
      .select('id, status')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingPO) {
      return NextResponse.json(
        { error: 'Purchase order not found or unauthorized / खरीद आदेश नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .update({
        status: validatedData.status,
        expected_delivery: validatedData.expected_delivery || null,
        remarks: validatedData.remarks || null,
        updated_at: new Date().toISOString(),
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

    console.error('Error updating purchase order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update purchase order / खरीद आदेश अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify ownership
    const { data: existingPO } = await supabase
      .from('purchase_orders')
      .select('id, status')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingPO) {
      return NextResponse.json(
        { error: 'Purchase order not found or unauthorized / खरीद आदेश नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    if (existingPO.status !== 'draft' && existingPO.status !== 'open') {
      return NextResponse.json(
        { error: 'Cannot delete purchase order that is not draft or open / ड्राफ्ट या ओपन नहीं होने वाले खरीद आदेश को हटाया नहीं जा सकता' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      data: { success: true },
      error: null,
      meta: { total: 0 }
    });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete purchase order / खरीद आदेश हटाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
