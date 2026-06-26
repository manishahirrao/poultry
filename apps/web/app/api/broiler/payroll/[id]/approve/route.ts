import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify ownership
    const { data: payroll } = await supabase
      .from('supervisor_payroll')
      .select('id, status, supervisor_id')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!payroll) {
      return NextResponse.json(
        { error: 'Payroll not found or unauthorized / पेरोल नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    if (payroll.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payroll already processed / पेरोल पहले ही प्रोसेस हो चुकी है' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('supervisor_payroll')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data: {
        ...data,
        message: 'Payroll approved successfully / पेरोल सफलतापूर्वक अनुमोदित'
      },
      error: null
    });

  } catch (error) {
    console.error('Error approving payroll:', error);
    return NextResponse.json(
      { error: 'Failed to approve payroll / पेरोल अनुमोदित करने में विफल' },
      { status: 500 }
    );
  }
}
