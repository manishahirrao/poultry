import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const transferItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity_sent: z.number().positive(),
  unit_rate: z.number().min(0).optional(),
});

const transferSchema = z.object({
  transfer_type: z.enum(['branch_to_branch', 'branch_to_farmer', 'farmer_to_branch', 'farmer_to_farmer']).default('branch_to_farmer'),
  from_branch_id: z.string().uuid().nullable().optional(),
  from_farmer_id: z.string().uuid().nullable().optional(),
  to_branch_id: z.string().uuid().nullable().optional(),
  to_farmer_id: z.string().uuid().nullable().optional(),
  batch_id: z.string().uuid().nullable().optional(),
  farm_id: z.string().uuid().nullable().optional(),
  vehicle_id: z.string().uuid().nullable().optional(),
  driver_id: z.string().uuid().nullable().optional(),
  remarks: z.string().optional(),
  items: z.array(transferItemSchema).min(1, 'At least one item is required'),
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
      .from('stock_transfers')
      .select(`
        *,
        branches!from_branch_stock_transfers(id, branch_name),
        farmers!from_farmer_stock_transfers(id, full_name),
        branches!to_branch_stock_transfers(id, branch_name),
        farmers!to_farmer_stock_transfers(id, full_name),
        batches!inner(id, batch_number),
        farms!inner(id, farm_name),
        vehicles!inner(id, vehicle_number),
        employees!inner(id, name),
        stock_transfer_items!inner(id, product_id, quantity_sent, quantity_received)
      `)
      .eq('integrator_id', user.id)
      .order('transfer_date', { ascending: false })
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
    console.error('Error fetching stock transfers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock transfers / स्टॉक ट्रांसफर प्राप्त करने में विफल',
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
    const validatedData = transferSchema.parse(body);

    // Generate transfer number
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    const { data: lastTransfer } = await supabase
      .from('stock_transfers')
      .select('transfer_number')
      .eq('integrator_id', user.id)
      .like('transfer_number', `TRF/${yearSuffix}/%`)
      .order('transfer_number', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastTransfer) {
      const lastSequence = parseInt(lastTransfer.transfer_number.split('/').pop() || '0');
      sequence = lastSequence + 1;
    }

    const transferNumber = `TRF/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;

    // Get current financial year
    const { data: financialYear } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    // Create stock transfer
    const { data: transfer, error: transferError } = await supabase
      .from('stock_transfers')
      .insert({
        integrator_id: user.id,
        transfer_number: transferNumber,
        transfer_date: new Date().toISOString().split('T')[0],
        transfer_type: validatedData.transfer_type,
        from_branch_id: validatedData.from_branch_id,
        from_farmer_id: validatedData.from_farmer_id,
        to_branch_id: validatedData.to_branch_id,
        to_farmer_id: validatedData.to_farmer_id,
        batch_id: validatedData.batch_id,
        farm_id: validatedData.farm_id,
        vehicle_id: validatedData.vehicle_id,
        driver_id: validatedData.driver_id,
        status: 'pending',
        remarks: validatedData.remarks || null,
        financial_year_id: financialYear?.id,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transferError) throw transferError;

    // Create transfer items
    const transferItems = validatedData.items.map(item => ({
      transfer_id: transfer.id,
      product_id: item.product_id,
      quantity_sent: item.quantity_sent,
      quantity_received: null,
      unit_rate: item.unit_rate || null,
      created_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await supabase
      .from('stock_transfer_items')
      .insert(transferItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      data: transfer,
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

    console.error('Error creating stock transfer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create stock transfer / स्टॉक ट्रांसफर बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
