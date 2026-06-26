import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@poultrypulse/types';

// Zod schema for WhatsApp setup
const WhatsAppSetupSchema = z.object({
  step: z.enum(['test', 'confirm']),
  phone: z.string().min(10).max(13),
  reminder_hour: z.number().int().min(17).max(20),
  language: z.enum(['hindi', 'english']),
});

type WhatsAppSetupInput = z.infer<typeof WhatsAppSetupSchema>;

// POST /api/farms/[farmId]/whatsapp/setup
// Handles WhatsApp setup wizard steps (test message and confirmation)
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
      .select('id')
      .eq('id', user.id)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerData as { id: string };

    // Verify farm ownership (RLS check)
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('id, name')
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = WhatsAppSetupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { step, phone, reminder_hour, language } = validationResult.data;

    if (step === 'test') {
      // Send test message via WhatsApp
      // In production, this would call the WhatsApp service
      // For now, we'll simulate the test message
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      // TODO: Integrate with actual WhatsApp service (Twilio or Meta WABA)
      // await sendWhatsAppNotification({
      //   to: formattedPhone,
      //   message: `नमस्ते! यह FlockIQ का test message है। 🐔\nआपके farm "${typedFarm.name}" के लिए daily reminder ${reminder_hour === 17 ? '5 PM' : reminder_hour === 18 ? '6 PM' : reminder_hour === 19 ? '7 PM' : '8 PM'} पर भेजा जाएगा।\n—FlockIQ Team`,
      // });

      return NextResponse.json({
        success: true,
        message: 'Test message sent successfully',
        phone: formattedPhone,
      });
    }

    if (step === 'confirm') {
      // Save WhatsApp configuration to database
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      const { data: updatedFarm, error: updateError } = await (supabase.from('farms') as any)
        .update({
          whatsapp_number: formattedPhone,
          whatsapp_reminders_enabled: true,
          whatsapp_reminders_paused: false,
          whatsapp_reminder_hour: reminder_hour,
          whatsapp_language: language,
          whatsapp_connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', farmId)
        .select()
        .single();

      if (updateError || !updatedFarm) {
        console.error('WhatsApp setup confirmation error:', updateError);
        return NextResponse.json(
          { error: 'Failed to save WhatsApp configuration' },
          { status: 500 }
        );
      }

      // Fetch current GC data for the active batch
      let gcRunningTotal = null;
      try {
        const { data: farmWithBatch } = await supabase
          .from('farms')
          .select('current_batch_id')
          .eq('id', farmId)
          .single();

        if ((farmWithBatch as any)?.current_batch_id) {
          const { data: gc } = await supabase
            .from('batch_gc_costs')
            .select('total_cost, gc_per_kg')
            .eq('batch_id', (farmWithBatch as any).current_batch_id)
            .single();

          if (gc) {
            gcRunningTotal = {
              totalCost: (gc as any).total_cost,
              gcPerKg: (gc as any).gc_per_kg,
            };
          }
        }
      } catch (gcError) {
        console.error('Error fetching GC data for WhatsApp confirmation:', gcError);
        // Don't fail the confirmation if GC data fetch fails
      }

      return NextResponse.json({
        success: true,
        message: 'WhatsApp connected successfully',
        gcRunningTotal,
      });
    }

    return NextResponse.json(
      { error: 'Invalid step' },
      { status: 400 }
    );

  } catch (error) {
    console.error('WhatsApp setup POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
