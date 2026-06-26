import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// PATCH - Update alert preferences
// Auth: Supabase session required
// Body: { hpai_distance_km, temp_threshold_c, price_drop_pct, feed_cost_rise_pct, push_enabled, whatsapp_enabled, email_enabled }
// Returns updated preferences
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.phone) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get customer from phone
    const { data: customerData } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', user.phone)
      .single();
    const customer = customerData as { id: string } | null;

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      hpai_distance_km,
      temp_threshold_c,
      price_drop_pct,
      feed_cost_rise_pct,
      push_enabled,
      whatsapp_enabled,
      email_enabled,
    } = body;

    // Validate inputs
    if (hpai_distance_km !== undefined && ![50, 100, 150, 200].includes(hpai_distance_km)) {
      return NextResponse.json(
        { error: 'hpai_distance_km must be one of: 50, 100, 150, 200' },
        { status: 400 }
      );
    }

    if (temp_threshold_c !== undefined && (temp_threshold_c < 32 || temp_threshold_c > 42)) {
      return NextResponse.json(
        { error: 'temp_threshold_c must be between 32 and 42' },
        { status: 400 }
      );
    }

    if (price_drop_pct !== undefined && (price_drop_pct < 3 || price_drop_pct > 20)) {
      return NextResponse.json(
        { error: 'price_drop_pct must be between 3 and 20' },
        { status: 400 }
      );
    }

    if (feed_cost_rise_pct !== undefined && (feed_cost_rise_pct < 3 || feed_cost_rise_pct > 15)) {
      return NextResponse.json(
        { error: 'feed_cost_rise_pct must be between 3 and 15' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (hpai_distance_km !== undefined) updateData.hpai_distance_km = hpai_distance_km;
    if (temp_threshold_c !== undefined) updateData.temp_threshold_c = temp_threshold_c;
    if (price_drop_pct !== undefined) updateData.price_drop_pct = price_drop_pct;
    if (feed_cost_rise_pct !== undefined) updateData.feed_cost_rise_pct = feed_cost_rise_pct;
    if (push_enabled !== undefined) updateData.push_enabled = push_enabled;
    if (whatsapp_enabled !== undefined) updateData.whatsapp_enabled = whatsapp_enabled;
    if (email_enabled !== undefined) updateData.email_enabled = email_enabled;

    // Update preferences
    const { data: preferencesData, error: updateError } = await supabase
      .from('customer_alert_preferences')
      .update(updateData)
      .eq('customer_id', customer.id)
      .select()
      .single();

    if (updateError) {
      console.error('Preferences update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: preferencesData,
    });

  } catch (error) {
    console.error('Alert preferences API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch current alert preferences
// Auth: Supabase session required
// Returns customer's alert preferences
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient() as any;
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.phone) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get customer from phone
    const { data: customerData } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', user.phone)
      .single();
    const customer = customerData as { id: string } | null;

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Fetch preferences
    const { data: preferencesData, error: fetchError } = await supabase
      .from('customer_alert_preferences')
      .select('*')
      .eq('customer_id', customer.id)
      .single();

    if (fetchError) {
      console.error('Preferences fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: preferencesData,
    });

  } catch (error) {
    console.error('Alert preferences API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
