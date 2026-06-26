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
    const { data: shedReadiness } = await supabase
      .from('shed_readiness')
      .select('id, status, farm_id')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!shedReadiness) {
      return NextResponse.json(
        { error: 'Shed readiness not found or unauthorized / शेड रेडिनेस नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    if (shedReadiness.status !== 'pending') {
      return NextResponse.json(
        { error: 'Shed readiness already processed / शेड रेडिनेस पहले ही प्रोसेस हो चुकी है' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('shed_readiness')
      .update({
        status: 'approved',
        approved_by: user.id,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data: {
        ...data,
        message: 'Shed readiness approved successfully / शेड रेडिनेस सफलतापूर्वक अनुमोदित'
      },
      error: null
    });

  } catch (error) {
    console.error('Error approving shed readiness:', error);
    return NextResponse.json(
      { error: 'Failed to approve shed readiness / शेड रेडिनेस अनुमोदित करने में विफल' },
      { status: 500 }
    );
  }
}
