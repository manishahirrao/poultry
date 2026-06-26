import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user already has a referral code
    const { data: existingReferral } = await supabase
      .from('customers')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    if (existingReferral?.referral_code) {
      return NextResponse.json({ referralCode: existingReferral.referral_code });
    }

    // Generate unique referral code
    const referralCode = generateReferralCode();

    // Update customer with referral code
    const { error: updateError } = await supabase
      .from('customers')
      .update({ referral_code: referralCode })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update referral code:', updateError);
      return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
    }

    return NextResponse.json({ referralCode });
  } catch (error) {
    console.error('Referral API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
