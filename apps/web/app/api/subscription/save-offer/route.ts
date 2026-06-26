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
    const { offerType, reason, feedback, score } = body;

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

    // Record cancellation reason (even if they accept the offer)
    const { error: reasonError } = await supabase
      .from('cancellation_reasons')
      .insert({
        customer_id: user.id,
        reason: reason || 'OTHER',
        reason_text: feedback || null,
        feedback_score: score || null,
        would_consider_returning: true,
      });

    if (reasonError) {
      console.error('Error recording cancellation reason:', reasonError);
    }

    // Create save offer record
    const offerDescriptions: Record<string, string> = {
      'DISCOUNT': 'Discount offer applied to account',
      'FREE_MONTH': 'Free month credit applied to account',
      'DOWNGRADE': 'Plan downgrade processed',
      'PAUSE': 'Subscription pause activated',
    };

    const offerValues: Record<string, number> = {
      'DISCOUNT': 20, // 20%
      'FREE_MONTH': 1, // 1 month
      'DOWNGRADE': 499, // new price
      'PAUSE': 90, // 90 days
    };

    const { error: offerError } = await supabase
      .from('save_offers')
      .insert({
        customer_id: user.id,
        offer_type: offerType,
        offer_value: offerValues[offerType] || 0,
        offer_description: offerDescriptions[offerType] || 'Special offer',
        status: 'ACCEPTED',
        presented_at: new Date().toISOString(),
        responded_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

    if (offerError) {
      console.error('Error creating save offer:', offerError);
    }

    // Apply the offer to customer subscription
    let updatedSubscription = { ...customer.subscription };

    switch (offerType) {
      case 'DISCOUNT':
        updatedSubscription = {
          ...updatedSubscription,
          discount_percentage: 20,
          discount_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
        };
        break;
      case 'FREE_MONTH':
        const currentExpiry = new Date(customer.subscription_expires_at || new Date());
        updatedSubscription = {
          ...updatedSubscription,
          expires_at: new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +1 month
        };
        break;
      case 'DOWNGRADE':
        updatedSubscription = {
          ...updatedSubscription,
          tier: 'PULSE_FARM',
        };
        break;
      case 'PAUSE':
        updatedSubscription = {
          ...updatedSubscription,
          status: 'paused',
          paused_at: new Date().toISOString(),
          pause_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        };
        break;
    }

    const { error: updateError } = await supabase
      .from('customers')
      .update({
        subscription: updatedSubscription,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error applying save offer:', updateError);
      return NextResponse.json({ error: 'Failed to apply save offer' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      offerApplied: offerType,
      newSubscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Error in save offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
