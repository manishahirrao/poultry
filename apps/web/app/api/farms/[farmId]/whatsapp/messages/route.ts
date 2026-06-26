import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@poultrypulse/types';

// GET /api/farms/[farmId]/whatsapp/messages
// Fetches WhatsApp conversation history for a farm
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

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

    // Fetch WhatsApp messages from whatsapp_reminders table
    // This table stores sent reminders and received replies
    const { data: reminders, error: remindersError } = await supabase
      .from('whatsapp_reminders')
      .select('*')
      .eq('farm_id', farmId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (remindersError) {
      console.error('WhatsApp messages fetch error:', remindersError);
      return NextResponse.json(
        { error: 'Failed to fetch WhatsApp messages' },
        { status: 500 }
      );
    }

    const typedReminders = (reminders as any[]) || [];

    // Transform data to match expected format
    const messages = typedReminders.map(reminder => ({
      id: reminder.id,
      direction: reminder.replied_at ? 'received' : 'sent',
      message: reminder.reply_text || `Daily reminder for Day ${reminder.day_number}`,
      created_at: reminder.replied_at || reminder.sent_at,
    }));

    return NextResponse.json(messages);

  } catch (error) {
    console.error('WhatsApp messages GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
