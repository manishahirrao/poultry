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

    // Check if month is closed
    const { data: monthClose, error } = await supabase
      .from('month_closing')
      .select('*')
      .eq('integrator_id', user.id)
      .eq('month', month)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      data: {
        is_closed: !!monthClose,
        closed_date: monthClose?.closed_date || null,
        closed_by: monthClose?.closed_by || null
      },
      error: null
    });

  } catch (error) {
    console.error('Error fetching month closing status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch month closing status / महीना बंद स्थिति प्राप्त करने में विफल' },
      { status: 500 }
    );
  }
}
