import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// PATCH { whatsapp_hpai: boolean, whatsapp_weather: boolean, ... }
// Auth: customer can only update own settings (session.user.id check)
// Validates: id matches authenticated customer
// Updates: customer_notification_settings table
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
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

    // Validate: customer can only update own settings
    if (customer.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden: can only update own settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      whatsapp_hpai,
      whatsapp_weather,
      whatsapp_price,
      email_hpai,
      email_weather,
      email_price,
      in_app_hpai,
      in_app_weather,
      in_app_price,
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (whatsapp_hpai !== undefined) updateData.whatsapp_hpai = whatsapp_hpai;
    if (whatsapp_weather !== undefined) updateData.whatsapp_weather = whatsapp_weather;
    if (whatsapp_price !== undefined) updateData.whatsapp_price = whatsapp_price;
    if (email_hpai !== undefined) updateData.email_hpai = email_hpai;
    if (email_weather !== undefined) updateData.email_weather = email_weather;
    if (email_price !== undefined) updateData.email_price = email_price;
    if (in_app_hpai !== undefined) updateData.in_app_hpai = in_app_hpai;
    if (in_app_weather !== undefined) updateData.in_app_weather = in_app_weather;
    if (in_app_price !== undefined) updateData.in_app_price = in_app_price;

    // Update or insert notification settings
    const { data: settings, error } = await supabase
      .from('customer_notification_settings')
      .upsert({
        customer_id: customer.id,
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Notification settings error:', error);
      return NextResponse.json(
        { error: 'Failed to update notification settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error('Notification settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
