import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const closeMonthSchema = z.object({
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
    const validatedData = closeMonthSchema.parse(body);

    // Check if month is already closed
    const { data: existingClose } = await supabase
      .from('month_closing')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('month', validatedData.month)
      .single();

    if (existingClose) {
      return NextResponse.json(
        { error: 'Month already closed / महीना पहले से बंद है' },
        { status: 400 }
      );
    }

    // Verify all payroll is paid for the month
    const [year, monthNum] = validatedData.month.split('-').map(Number);
    const { data: unpaidPayroll } = await supabase
      .from('supervisor_payroll')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('month', validatedData.month)
      .eq('year', year)
      .neq('status', 'paid');

    if (unpaidPayroll && unpaidPayroll.length > 0) {
      return NextResponse.json(
        { error: 'Cannot close month with unpaid payroll / अवैतनिक पेरोल के साथ महीना बंद नहीं किया जा सकता' },
        { status: 400 }
      );
    }

    // Get financial year
    const { data: financialYear } = await supabase
      .from('financial_years')
      .select('id')
      .eq('integrator_id', user.id)
      .eq('is_current', true)
      .single();

    // Close the month
    const { data, error } = await supabase
      .from('month_closing')
      .insert({
        integrator_id: user.id,
        month: validatedData.month,
        year,
        closed_date: new Date().toISOString(),
        closed_by: user.id,
        financial_year_id: financialYear?.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data: {
        ...data,
        message: 'Month closed successfully / महीना सफलतापूर्वक बंद किया गया'
      },
      error: null
    });

  } catch (error) {
    console.error('Error closing month:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error / सत्यापन त्रुटि', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to close month / महीना बंद करने में विफल' },
      { status: 500 }
    );
  }
}
