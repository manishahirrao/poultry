import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const incentiveSchema = z.object({
  batch_id: z.string().uuid(),
  supervisor_id: z.string().uuid(),
  farm_id: z.string().uuid(),
  calculation_date: z.string(),
  actual_gc: z.number(),
  target_gc: z.number(),
  birds_sold: z.number().optional(),
  total_weight_kg: z.number(),
  incentive_rate: z.number(),
  penalty_rate: z.number().optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supervisor_id = searchParams.get('supervisor_id');

    let query = supabase
      .from('supervisor_incentives')
      .select(`
        *,
        batches!inner(batch_number, placement_date, harvest_date, birds_placed),
        farms!inner(farm_name),
        employees!inner(name)
      `)
      .eq('integrator_id', user.id)
      .order('calculation_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (supervisor_id) {
      query = query.eq('supervisor_id', supervisor_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: data?.length || 0 }
    });
  } catch (error: any) {
    console.error('Error fetching incentives:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch incentives / प्रोत्साहन डेटा प्राप्त करने में विफल',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = incentiveSchema.parse(body);

    // Calculate GC saving and incentive amount
    const gc_saving = validatedData.target_gc - validatedData.actual_gc;
    const incentive_amount = gc_saving > 0 
      ? gc_saving * validatedData.total_weight_kg * validatedData.incentive_rate
      : 0;
    
    const penalty_amount = gc_saving < 0 && validatedData.penalty_rate
      ? Math.abs(gc_saving) * validatedData.total_weight_kg * validatedData.penalty_rate
      : 0;
    
    const net_incentive = incentive_amount - penalty_amount;

    const { data, error } = await supabase
      .from('supervisor_incentives')
      .insert({
        integrator_id: user.id,
        ...validatedData,
        gc_saving,
        incentive_amount,
        penalty_amount,
        net_incentive,
        status: 'pending',
        calculation_date: validatedData.calculation_date,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: 1 }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating incentive:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create incentive / प्रोत्साहन बनाने में विफल',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
