import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    // Get leave policy
    const { data: policy } = await supabase
      .from('leave_policies')
      .select('*')
      .eq('integrator_id', user.id)
      .single();

    // Get approved leave entries for this employee in current financial year
    const { data: currentFY } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    const { data: leaveEntries } = await supabase
      .from('leave_entries')
      .select('leave_type, days_count, status')
      .eq('employee_id', employeeId)
      .eq('financial_year_id', currentFY?.id)
      .in('status', ['approved', 'pending']);

    // Calculate used leave by type
    const usedLeave = {
      casual: 0,
      sick: 0,
      earned: 0,
    };

    leaveEntries?.forEach((entry: any) => {
      if (entry.status === 'approved' && usedLeave[entry.leave_type as keyof typeof usedLeave] !== undefined) {
        usedLeave[entry.leave_type as keyof typeof usedLeave] += entry.days_count;
      }
    });

    // Calculate balance
    const balance = {
      casual: (policy?.casual_leave_days || 12) - usedLeave.casual,
      sick: (policy?.sick_leave_days || 12) - usedLeave.sick,
      earned: (policy?.earned_leave_days || 15) - usedLeave.earned,
    };

    return NextResponse.json({
      data: {
        policy,
        usedLeave,
        balance,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
