import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const adjustmentSchema = z.object({
  adj_type: z.enum(['write_off', 'write_in', 'damage', 'expired', 'transfer_correction']).default('write_off'),
  branch_id: z.string().uuid().nullable().optional(),
  farmer_id: z.string().uuid().nullable().optional(),
  product_id: z.string().uuid(),
  quantity: z.number(),
  unit_rate: z.number().min(0).optional(),
  reason: z.string().optional(),
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
    const adjType = searchParams.get('adj_type');

    let query = supabase
      .from('stock_adjustments')
      .select(`
        *,
        branches!inner(id, branch_name, branch_type),
        farmers!inner(id, full_name, village),
        products!inner(id, product_name, unit_of_measure)
      `)
      .eq('integrator_id', user.id)
      .order('adj_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (adjType) {
      query = query.eq('adj_type', adjType);
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
    console.error('Error fetching stock adjustments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stock adjustments / स्टॉक समायोजन प्राप्त करने में विफल',
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
    const validatedData = adjustmentSchema.parse(body);

    // Generate adjustment number
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSuffix = `${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    
    const { data: lastAdj } = await supabase
      .from('stock_adjustments')
      .select('adj_number')
      .eq('integrator_id', user.id)
      .like('adj_number', `SA/${yearSuffix}/%`)
      .order('adj_number', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastAdj) {
      const lastSequence = parseInt(lastAdj.adj_number.split('/').pop() || '0');
      sequence = lastSequence + 1;
    }

    const adjNumber = `SA/${yearSuffix}/${sequence.toString().padStart(3, '0')}`;

    // Get current financial year
    const { data: financialYear } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    const { data, error } = await supabase
      .from('stock_adjustments')
      .insert({
        integrator_id: user.id,
        adj_number: adjNumber,
        adj_date: new Date().toISOString().split('T')[0],
        adj_type: validatedData.adj_type,
        branch_id: validatedData.branch_id,
        farmer_id: validatedData.farmer_id,
        product_id: validatedData.product_id,
        quantity: validatedData.quantity,
        unit_rate: validatedData.unit_rate || null,
        reason: validatedData.reason || null,
        financial_year_id: financialYear?.id,
        approved_by: user.id,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
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

    console.error('Error creating stock adjustment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create stock adjustment / स्टॉक समायोजन बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
