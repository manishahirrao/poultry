import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Fetch onboarding progress for current user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch or create onboarding progress
    const { data: progress, error } = await (supabase.from('user_onboarding_progress') as any)
      .select('*')
      .eq('customer_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is ok for new users
      console.error('Error fetching onboarding progress:', error);
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    // If no progress exists, create initial record
    if (!progress) {
      const { data: newProgress, error: insertError } = await (supabase.from('user_onboarding_progress') as any)
        .insert({
          customer_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating onboarding progress:', insertError);
        return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 });
      }

      return NextResponse.json({ progress: newProgress });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Onboarding progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update onboarding progress
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { dismissed, stepUpdates } = body;

    // Build update object
    const updateData: any = {};
    if (typeof dismissed === 'boolean') {
      updateData.dismissed = dismissed;
      if (dismissed) {
        updateData.dismissed_at = new Date().toISOString();
      }
    }
    if (stepUpdates) {
      Object.assign(updateData, stepUpdates);
    }

    // Check if all steps are complete
    const { data: currentProgress } = await (supabase.from('user_onboarding_progress') as any)
      .select('*')
      .eq('customer_id', user.id)
      .single();

    if (currentProgress) {
      const allComplete = 
        (currentProgress.step_1_farm_added || stepUpdates?.step_1_farm_added) &&
        (currentProgress.step_2_whatsapp_setup || stepUpdates?.step_2_whatsapp_setup) &&
        (currentProgress.step_3_gc_costs_entered || stepUpdates?.step_3_gc_costs_entered) &&
        (currentProgress.step_4_employees_added || stepUpdates?.step_4_employees_added) &&
        (currentProgress.step_5_price_alerts_configured || stepUpdates?.step_5_price_alerts_configured);

      if (allComplete && !currentProgress.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }
    }

    const { data: progress, error } = await (supabase.from('user_onboarding_progress') as any)
      .update(updateData)
      .eq('customer_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating onboarding progress:', error);
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Onboarding progress PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
