import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Query referral_codes table
    const { data: referral, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !referral) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Check if referral has expired
    if (referral.expires_at && new Date(referral.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Referral code has expired' },
        { status: 400 }
      );
    }

    // Check max uses
    if (referral.max_uses && referral.uses_count >= referral.max_uses) {
      return NextResponse.json(
        { error: 'Referral code has reached maximum uses' },
        { status: 400 }
      );
    }

    // Return referrer info (without sensitive data)
    return NextResponse.json({
      valid: true,
      referrer_id: referral.referrer_id,
      credit_amount: referral.credit_amount || 500,
      message: 'Valid referral code',
    });
  } catch (error) {
    console.error('POST /api/referral/validate error:', error);
    return NextResponse.json(
      { error: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}
