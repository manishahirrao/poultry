import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const generatePayrollSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = generatePayrollSchema.parse(body);

    const [year, monthNum] = validatedData.month.split('-').map(Number);
    const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

    // Fetch supervisors
    const { data: supervisors, error: supervisorError } = await supabase
      .from('employees')
      .select('id, name, base_salary')
      .eq('integrator_id', user.id)
      .eq('role', 'supervisor')
      .eq('is_active', true);

    if (supervisorError) throw supervisorError;

    // Get financial year
    const { data: financialYear } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    // Generate payroll for each supervisor
    const payrollRecords = await Promise.all(
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
        const totalAmount = (supervisor.base_salary || 0) + totalIncentive;

        // Check if payroll already exists
        const { data: existingPayroll } = await supabase
          .from('supervisor_payroll')
          .select('id')
          .eq('supervisor_id', supervisor.id)
          .eq('month', validatedData.month)
          .eq('year', year)
          .single();

        if (existingPayroll) {
          return existingPayroll;
        }

        // Create payroll record
        const { data: payroll, error: payrollError } = await supabase
          .from('supervisor_payroll')
          .insert({
            integrator_id: user.id,
            supervisor_id: supervisor.id,
            month: validatedData.month,
            year,
            base_salary: supervisor.base_salary || 0,
            incentive_amount: totalIncentive,
            totalAmount,
            status: 'pending',
            visits_count: visits?.length || 0,
            batches_handled: batches?.length || 0,
            financial_year_id: financialYear?.id,
            created_by: user.id
          })
          .select()
          .single();

        if (payrollError) throw payrollError;
        return payroll;
      })
    );

    return NextResponse.json({
      data: payrollRecords,
      error: null,
      message: 'Payroll generated successfully / पेरोल सफलतापूर्वक बनाई गई'
    });

  } catch (error) {
    console.error('Error generating payroll:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error / सत्यापन त्रुटि', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate payroll / पेरोल बनाने में विफल' },
      { status: 500 }
    );
  }
}
