import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const body = await request.json();
    const { reason, feedback, score, offerDeclined } = body;

    // Get the user from the session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', user.id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Record cancellation reason
    const { error: reasonError } = await supabase
      .from('cancellation_reasons')
      .insert({
        customer_id: user.id,
        reason: reason || 'OTHER',
        reason_text: feedback || null,
        feedback_score: score || null,
        would_consider_returning: null,
      });

    if (reasonError) {
      console.error('Error recording cancellation reason:', reasonError);
    }

    // Record churn event
    const subscriptionAgeDays = Math.floor(
      (new Date().getTime() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const mrrMap: Record<string, number> = {
      'PULSE_FARM': 499,
      'PULSE_PRO': 999,
      'PULSE_INTEL': 1999,
    };

    const { error: churnError } = await supabase
      .from('churn_events')
      .insert({
        customer_id: user.id,
        subscription_tier: customer.subscription?.tier || 'PULSE_FARM',
        churn_date: new Date().toISOString(),
        subscription_age_days: subscriptionAgeDays,
        mrr_lost: mrrMap[customer.subscription?.tier || 'PULSE_FARM'],
        retention_attempted: !offerDeclined,
        cohort_month: new Date(customer.created_at).toISOString().slice(0, 7),
      });

    if (churnError) {
      console.error('Error recording churn event:', churnError);
    }

    // Update customer subscription status
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        subscription: {
          ...customer.subscription,
          status: 'expired',
          cancelled_at: new Date().toISOString(),
        },
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating customer subscription:', updateError);
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in cancel subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
