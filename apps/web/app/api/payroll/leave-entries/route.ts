import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const leaveEntrySchema = z.object({
  employeeId: z.string().uuid(),
  leaveType: z.enum(['casual', 'sick', 'earned', 'unpaid', 'holiday']),
  fromDate: z.string(),
  toDate: z.string(),
  daysCount: z.number(),
  reason: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error('Failed to create supabase client');

    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    let query = supabase
      .from('leave_entries')
      .select(`
        *,
        employees (
          id,
          employee_code,
          full_name,
          name_hindi
        )
      `)
      .eq('integrator_id', user.id)
      .order('from_date', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: leaveEntries, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: leaveEntries });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error('Failed to create supabase client');

    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = leaveEntrySchema.parse(body);

    // Get current financial year
    const { data: currentFY } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    const { data: leaveEntry, error } = await supabase
      .from('leave_entries')
      .insert({
        integrator_id: user.id,
        employee_id: validatedData.employeeId,
        leave_type: validatedData.leaveType,
        from_date: validatedData.fromDate,
        to_date: validatedData.toDate,
        days_count: validatedData.daysCount,
        reason: validatedData.reason,
        status: 'pending',
        financial_year_id: currentFY?.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: leaveEntry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
