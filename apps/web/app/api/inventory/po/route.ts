import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const poItemSchema = z.object({
  product_id: z.string().uuid(),
  ordered_qty: z.number().positive(),
  unit_rate: z.number().min(0),
  tax_id: z.string().uuid().nullable().optional(),
});

const poSchema = z.object({
  supplier_id: z.string().uuid(),
  branch_id: z.string().uuid().nullable().optional(),
  expected_delivery: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid delivery date').optional().or(z.literal('')),
  remarks: z.string().optional(),
  items: z.array(poItemSchema).min(1, 'At least one item is required'),
});

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers!inner(id, supplier_name, supplier_type),
        branches!inner(id, branch_name, branch_type),
        purchase_order_items!inner(id, product_id, ordered_qty, received_qty, unit_rate, tax_amount, line_total)
      `)
      .eq('integrator_id', user.id)
      .order('po_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      error: null,
      meta: {
        total: count || 0,
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch purchase orders / खरीद आदेश प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = poSchema.parse(body);

    // Generate PO number
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    const { data: lastPO } = await supabase
      .from('purchase_orders')
      .select('po_number')
      .eq('integrator_id', user.id)
      .like('po_number', `PO/${yearSuffix}/%`)
      .order('po_number', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastPO) {
      const lastSequence = parseInt(lastPO.po_number.split('/').pop() || '0');
      sequence = lastSequence + 1;
    }

    const poNumber = `PO/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;

    // Get current financial year
    const { data: financialYear } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    // Create PO with items
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        integrator_id: user.id,
        po_number: poNumber,
        po_date: new Date().toISOString().split('T')[0],
        supplier_id: validatedData.supplier_id,
        branch_id: validatedData.branch_id,
        expected_delivery: validatedData.expected_delivery || null,
        status: 'open',
        remarks: validatedData.remarks || null,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (poError) throw poError;

    // Create PO items
    const items = validatedData.items.map(item => ({
      po_id: po.id,
      product_id: item.product_id,
      ordered_qty: item.ordered_qty,
      received_qty: 0,
      unit_rate: item.unit_rate,
      tax_id: item.tax_id,
      tax_amount: 0,
      line_total: item.ordered_qty * item.unit_rate,
      created_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(items);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      data: po,
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

    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create purchase order / खरीद आदेश बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
