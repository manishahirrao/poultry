import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

function generateKeyCode() {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `FLOCK-${part1}-${part2}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan_name, payment_method, payment_amount, payment_reference, validity_days, assigned_phone } = body;

    const keyCode = generateKeyCode();

    const data = {
      key_code: keyCode,
      sales_agent_id: user.id,
      plan_name,
      payment_method,
      payment_amount,
      payment_reference,
      validity_days,
      assigned_phone: assigned_phone || null
    };

    const { data: responseData, error } = await supabase.from('license_keys').insert(data).select().single();

    if (error) {
      console.error('License generation error:', error);
      return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      key_code: keyCode,
      id: responseData.id
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
