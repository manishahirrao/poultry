import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const feedAllocItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit_rate: z.number().min(0).optional(),
  batch_no: z.string().optional(),
});

const feedAllocSchema = z.object({
  alloc_type: z.enum(['feed', 'medicine', 'vaccine', 'other']).default('feed'),
  farm_id: z.string().uuid(),
  farmer_id: z.string().uuid(),
  batch_id: z.string().uuid().nullable().optional(),
  from_branch_id: z.string().uuid(),
  vehicle_id: z.string().uuid().nullable().optional(),
  driver_id: z.string().uuid().nullable().optional(),
  supervisor_id: z.string().uuid().nullable().optional(),
  remarks: z.string().optional(),
  items: z.array(feedAllocItemSchema).min(1, 'At least one item is required'),
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
    const allocType = searchParams.get('alloc_type');

    let query = supabase
      .from('feed_medicine_allocations')
      .select(`
        *,
        farms!inner(id, farm_name, village),
        farmers!inner(id, full_name, village),
        batches!inner(id, batch_number),
        branches!inner(id, branch_name),
        vehicles!inner(id, vehicle_number),
        employees!inner(id, name)
      `)
      .eq('integrator_id', user.id)
      .order('alloc_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (allocType) {
      query = query.eq('alloc_type', allocType);
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
    console.error('Error fetching feed allocations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch feed allocations / फीड एलोकेशन प्राप्त करने में विफल',
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
    const validatedData = feedAllocSchema.parse(body);

    // Generate allocation number
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    const { data: lastAlloc } = await supabase
      .from('feed_medicine_allocations')
      .select('alloc_number')
      .eq('integrator_id', user.id)
      .like('alloc_number', `FA/${yearSuffix}/%`)
      .order('alloc_number', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastAlloc) {
      const lastSequence = parseInt(lastAlloc.alloc_number.split('/').pop() || '0');
      sequence = lastSequence + 1;
    }

    const allocNumber = `FA/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;

    // Get current financial year
    const { data: financialYear } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    // Calculate totals
    let totalQuantity = 0;
    let totalValue = 0;
    const allocItems = validatedData.items.map(item => {
      const lineValue = item.quantity * (item.unit_rate || 0);
      totalQuantity += item.quantity;
      totalValue += lineValue;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_rate: item.unit_rate || null,
        line_value: lineValue,
        batch_no: item.batch_no || null,
        created_at: new Date().toISOString(),
      };
    });

    // Create allocation
    const { data: allocation, error: allocError } = await supabase
      .from('feed_medicine_allocations')
      .insert({
        integrator_id: user.id,
        alloc_number: allocNumber,
        alloc_date: new Date().toISOString().split('T')[0],
        alloc_type: validatedData.alloc_type,
        farm_id: validatedData.farm_id,
        farmer_id: validatedData.farmer_id,
        batch_id: validatedData.batch_id,
        from_branch_id: validatedData.from_branch_id,
        vehicle_id: validatedData.vehicle_id,
        driver_id: validatedData.driver_id,
        supervisor_id: validatedData.supervisor_id,
        total_quantity: totalQuantity,
        total_value: totalValue,
        remarks: validatedData.remarks || null,
        financial_year_id: financialYear?.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (allocError) throw allocError;

    // Create allocation items
    const itemsWithAllocId = allocItems.map(item => ({
      ...item,
      allocation_id: allocation.id,
    }));

    const { error: itemsError } = await supabase
      .from('feed_medicine_alloc_items')
      .insert(itemsWithAllocId);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      data: allocation,
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

    console.error('Error creating feed allocation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create feed allocation / फीड एलोकेशन बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
