import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@poultrypulse/types';

// POST /api/farms/[farmId]/whatsapp/test-reminder
// Sends a test reminder message via WhatsApp
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

    // Verify farm ownership and get WhatsApp config
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('id, name, whatsapp_number, whatsapp_reminder_hour, whatsapp_language')
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

    if (!typedFarm.whatsapp_number) {
      return NextResponse.json(
        { error: 'WhatsApp not configured for this farm' },
        { status: 400 }
      );
    }

    // Get active batch for context
    const { data: activeBatch } = await supabase
      .from('batches')
      .select('id, batch_number, day_number, birds_alive')
      .eq('farm_id', farmId)
      .eq('status', 'active')
      .single();

    const typedActiveBatch = activeBatch as any;

    // Fetch GC data for the batch (GAP-023)
    let gcPerKg = null;
    if (typedActiveBatch) {
      const { data: gc } = await supabase
        .from('batch_gc_costs')
        .select('doc_cost_total, feed_cost_total, medicine_cost_total, vaccine_cost_total, litter_cost_total, electricity_cost_total, water_cost_total, labour_cost_total, misc_cost_total, fixed_overhead_alloc')
        .eq('batch_id', typedActiveBatch.id)
        .single();

      if (gc) {
        const typedGc = gc as any;
        const totalCost = (typedGc.doc_cost_total || 0) + (typedGc.feed_cost_total || 0) + (typedGc.medicine_cost_total || 0) + (typedGc.vaccine_cost_total || 0) + (typedGc.litter_cost_total || 0) + (typedGc.electricity_cost_total || 0) + (typedGc.water_cost_total || 0) + (typedGc.labour_cost_total || 0) + (typedGc.misc_cost_total || 0) + (typedGc.fixed_overhead_alloc || 0);
        const liveKgs = typedActiveBatch.birds_alive * 1.5; // Assuming avg weight 1.5kg for calculation
        gcPerKg = liveKgs > 0 ? (totalCost / liveKgs).toFixed(2) : null;
      }
    }

    // Send test reminder message
    // TODO: Integrate with actual WhatsApp service (Twilio or Meta WABA)
    const message = typedFarm.whatsapp_language === 'hindi'
      ? `📱 TEST REMINDER\n\nFarm: ${typedFarm.name}\n${typedActiveBatch ? `Batch #${typedActiveBatch.batch_number} · Day ${typedActiveBatch.day_number}\nBirds: ${typedActiveBatch.birds_alive}${gcPerKg ? `\nGC: ₹${gcPerKg}/kg` : ''}\n\n` : ''}आज का डेली लॉग भेजें:\n[mri hui murgiyan] [khaana kg]\n\nExample: 2 1250\n\n—FlockIQ`
      : `📱 TEST REMINDER\n\nFarm: ${typedFarm.name}\n${typedActiveBatch ? `Batch #${typedActiveBatch.batch_number} · Day ${typedActiveBatch.day_number}\nBirds: ${typedActiveBatch.birds_alive}${gcPerKg ? `\nGC: ₹${gcPerKg}/kg` : ''}\n\n` : ''}Send today's log:\n[dead birds] [feed kg]\n\nExample: 2 1250\n\n—FlockIQ`;

    // await sendWhatsAppNotification({
    //   to: typedFarm.whatsapp_number,
    //   message,
    // });

    return NextResponse.json({
      success: true,
      message: 'Test reminder sent successfully',
    });

  } catch (error) {
    console.error('WhatsApp test reminder POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
