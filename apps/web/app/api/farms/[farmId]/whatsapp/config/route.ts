import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@poultrypulse/types';

// Zod schema for WhatsApp config update
const WhatsAppConfigSchema = z.object({
  reminder_hour: z.number().int().min(17).max(20).optional(),
  language: z.enum(['hindi', 'english']).optional(),
});

type WhatsAppConfigInput = z.infer<typeof WhatsAppConfigSchema>;

// GET /api/farms/[farmId]/whatsapp/config
// Fetches WhatsApp configuration for a farm
export async function GET(
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
      .select('id, whatsapp_number, whatsapp_reminders_enabled, whatsapp_reminders_paused, whatsapp_reminder_hour, whatsapp_language, whatsapp_connected_at')
      .eq('id', farmId)
      .eq('integrator_id', customer.id)
      .single();

    if (farmError || !farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    const typedFarm = farm as Database['public']['Tables']['farms']['Row'];

    return NextResponse.json({
      whatsapp_number: typedFarm.whatsapp_number,
      whatsapp_reminders_enabled: typedFarm.whatsapp_reminders_enabled,
      whatsapp_reminders_paused: typedFarm.whatsapp_reminders_paused,
      whatsapp_reminder_hour: typedFarm.whatsapp_reminder_hour,
      whatsapp_language: typedFarm.whatsapp_language,
      whatsapp_connected_at: typedFarm.whatsapp_connected_at,
    });

  } catch (error) {
    console.error('WhatsApp config GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/farms/[farmId]/whatsapp/config
// Updates WhatsApp configuration for a farm
export async function PATCH(
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = WhatsAppConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const configData = validationResult.data;

    // Update WhatsApp configuration
    const { data: updatedFarm, error: updateError } = await (supabase.from('farms') as any)
      .update({
        ...(configData.reminder_hour && { whatsapp_reminder_hour: configData.reminder_hour }),
        ...(configData.language && { whatsapp_language: configData.language }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', farmId)
      .select()
      .single();

    if (updateError || !updatedFarm) {
      console.error('WhatsApp config update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update WhatsApp configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp configuration updated successfully',
    });

  } catch (error) {
    console.error('WhatsApp config PATCH API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
