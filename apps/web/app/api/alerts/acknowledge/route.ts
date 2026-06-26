import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST { alert_id: string }
// Auth: Supabase session required
// Inserts to alert_acknowledgements: { alert_id, customer_id, acknowledged_at }
// Returns updated alert + acknowledgement status
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { alert_id, action = 'acknowledged' } = body;

    if (!alert_id) {
      return NextResponse.json(
        { error: 'alert_id is required' },
        { status: 400 }
      );
    }

    if (!['acknowledged', 'acted', 'dismissed'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be one of: acknowledged, acted, dismissed' },
        { status: 400 }
      );
    }

    // Check if alert exists
    const { data: alertData } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', alert_id)
      .single();
    const alert = alertData as any;

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    // Check if already acknowledged
    const { data: existingAckData } = await supabase
      .from('alert_acknowledgements')
      .select('*')
      .eq('alert_id', alert_id)
      .eq('customer_id', customer.id)
      .single();
    const existingAck = existingAckData as { acknowledged_at: string } | null;

    if (existingAck) {
      return NextResponse.json({
        success: true,
        already_acknowledged: true,
        acknowledged_at: existingAck.acknowledged_at,
      });
    }

    // Insert acknowledgement
    const { data: acknowledgementData, error: ackError } = await (supabase.from('alert_acknowledgements') as any)
      .insert({
        alert_id,
        customer_id: customer.id,
        action,
      })
      .select()
      .single();
    const acknowledgement = acknowledgementData as any;

    if (ackError) {
      console.error('Acknowledgement error:', ackError);
      return NextResponse.json(
        { error: 'Failed to acknowledge alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alert,
      acknowledgement,
    });

  } catch (error) {
    console.error('Alert acknowledge API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
