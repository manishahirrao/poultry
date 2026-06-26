import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user?.id) {
      return NextResponse.json(
        { error: 'Authentication required / प्रमाणीकरण आवश्यक है' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM format

    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter required / महीना पैरामीटर आवश्यक है' },
        { status: 400 }
      );
    }

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

    // Fetch supervisors and calculate their payroll
    const { data: supervisors, error: supervisorError } = await supabase
      .from('employees')
      .select('id, name, base_salary')
      .eq('integrator_id', user.id)
      .eq('role', 'supervisor')
      .eq('is_active', true);

    if (supervisorError) throw supervisorError;

    const payrollData = await Promise.all(
      (supervisors || []).map(async (supervisor) => {
        // Count visits in the month
        const { data: visits } = await supabase
          .from('supervisor_visits')
          .select('id')
          .eq('supervisor_id', supervisor.id)
          .gte('visit_date', startDate)
          .lte('visit_date', endDate);

        // Count batches handled in the month
        const { data: batches } = await supabase
          .from('batches')
          .select('id')
          .eq('supervisor_id', supervisor.id)
          .gte('placement_date', startDate)
          .lte('placement_date', endDate);

        // Calculate incentives from closed batches
        const { data: incentives } = await supabase
          .from('supervisor_incentives')
          .select('net_incentive')
          .eq('supervisor_id', supervisor.id)
          .gte('calculation_date', startDate)
          .lte('calculation_date', endDate)
          .eq('status', 'paid');

        const totalIncentive = (incentives || []).reduce((sum, inc) => sum + (inc.net_incentive || 0), 0);

        // Check if payroll already exists
        const { data: existingPayroll } = await supabase
          .from('supervisor_payroll')
          .select('*')
          .eq('supervisor_id', supervisor.id)
          .eq('month', month)
          .eq('year', year)
          .single();

        if (existingPayroll) {
          return {
            id: existingPayroll.id,
            supervisor_id: supervisor.id,
            supervisor_name: supervisor.name,
            month,
            year,
            base_salary: existingPayroll.base_salary,
            incentive_amount: existingPayroll.incentive_amount,
            total_amount: existingPayroll.total_amount,
            status: existingPayroll.status,
            visits_count: visits?.length || 0,
            batches_handled: batches?.length || 0
          };
        }

        return {
          id: null,
          supervisor_id: supervisor.id,
          supervisor_name: supervisor.name,
          month,
          year,
          base_salary: supervisor.base_salary || 0,
          incentive_amount: totalIncentive,
          total_amount: (supervisor.base_salary || 0) + totalIncentive,
          status: 'pending',
          visits_count: visits?.length || 0,
          batches_handled: batches?.length || 0
        };
      })
    );

    return NextResponse.json({
      data: payrollData,
      error: null,
      meta: { total: payrollData.length }
    });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll / पेरोल प्राप्त करने में विफल' },
      { status: 500 }
    );
  }
}
