import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const travelSchema = z.object({
  employee_id: z.string().uuid(),
  travel_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  from_location: z.string().min(1, 'From location is required'),
  to_location: z.string().min(1, 'To location is required'),
  km_travelled: z.number().min(0, 'KM travelled must be positive'),
  vehicle_id: z.string().uuid().nullable().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  allowance_rate: z.number().min(0).optional(),
  allowance_amount: z.number().min(0).optional(),
  remarks: z.string().optional(),
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
    const employeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('travel_entries')
      .select(`
        *,
        employees!inner(name, role),
        vehicles(vehicle_number)
      `)
      .eq('integrator_id', user.id)
      .order('travel_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (startDate) {
      query = query.gte('travel_date', startDate);
    }

    if (endDate) {
      query = query.lte('travel_date', endDate);
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
    console.error('Error fetching travel entries:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch travel entries / यात्रा एंट्री प्राप्त करने में विफल',
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
    const validatedData = travelSchema.parse(body);

    // Calculate allowance amount if not provided
    const allowanceAmount = validatedData.allowance_amount || 
      (validatedData.km_travelled * (validatedData.allowance_rate || 0));

    const { data, error } = await supabase
      .from('travel_entries')
      .insert({
        integrator_id: user.id,
        employee_id: validatedData.employee_id,
        travel_date: validatedData.travel_date,
        from_location: validatedData.from_location,
        to_location: validatedData.to_location,
        km_travelled: validatedData.km_travelled,
        vehicle_id: validatedData.vehicle_id || null,
        purpose: validatedData.purpose,
        allowance_rate: validatedData.allowance_rate || null,
        allowance_amount: allowanceAmount,
        remarks: validatedData.remarks || null,
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

    console.error('Error creating travel entry:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create travel entry / यात्रा एंट्री बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
