import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@poultrypulse/types';

// POST /api/farms/[farmId]/whatsapp/disconnect
// Disconnects WhatsApp for a farm
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
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

    // Get customer to check segment
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id, segment, role')
      .eq('id', user.id)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerData as { id: string; segment: string; role: string | null };

    // Verify farm ownership (RLS check)
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('id')
      .eq('id', farmId)
      .eq('integrator_id', customer.id)
      .single();

    if (farmError || !farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    // Disconnect WhatsApp by clearing configuration
    const { data: updatedFarm, error: updateError } = await (supabase.from('farms') as any)
      .update({
        whatsapp_number: null,
        whatsapp_reminders_enabled: false,
        whatsapp_reminders_paused: false,
        whatsapp_reminder_hour: 18,
        whatsapp_language: 'hindi',
        whatsapp_connected_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', farmId)
      .select()
      .single();

    if (updateError || !updatedFarm) {
      console.error('WhatsApp disconnect error:', updateError);
      return NextResponse.json(
        { error: 'Failed to disconnect WhatsApp' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp disconnected successfully',
    });

  } catch (error) {
    console.error('WhatsApp disconnect POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
