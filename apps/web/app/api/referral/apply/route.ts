// FlockIQ — Referral Attribution API
// File: apps/web/app/api/referral/apply/route.ts
// Task Reference: H-03
// Requirements: FR-REFERRAL-001

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { sendReferralNotification } from '@/lib/notifications';

// Zod schema for referral attribution request
const ReferralApplyRequestSchema = z.object({
  referralCode: z.string().min(8).max(8).regex(/^[A-HJ-NP-Z2-9]+$/, 'Invalid referral code format'),
  newCustomerId: z.string().min(1, 'New customer ID is required'),
  newCustomerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
});

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ReferralApplyRequestSchema.parse(body);
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Step 1: Validate referral code and get referrer customer_id
    const { data: referralData, error: referralError } = await supabase
      .from('referral_codes')
      .select('customer_id')
      .eq('code', validatedData.referralCode.toUpperCase())
      .single();
    
    if (referralError || !referralData) {
      return NextResponse.json(
        { error: 'अमान्य रेफरल कोड' },
        { status: 400 }
      );
    }
    
    const referrerCustomerId = referralData.customer_id;
    
    // Step 2: Fraud check - Self-referral (same customer ID)
    if (referrerCustomerId === validatedData.newCustomerId) {
      return NextResponse.json(
        { error: 'सेल्फ-रेफरल की अनुमति नहीं है' },
        { status: 400 }
      );
    }
    
    // Step 3: Fraud check - Same phone number
    // Get referrer's phone number
    const { data: referrerData, error: referrerFetchError } = await supabase
      .from('customers')
      .select('phone')
      .eq('id', referrerCustomerId)
      .single();
    
    if (referrerFetchError) {
      console.error('Error fetching referrer data:', referrerFetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    // Check if new customer phone matches referrer phone
    if (referrerData.phone === `+91${validatedData.newCustomerPhone}`) {
      return NextResponse.json(
        { error: 'समान फोन नंबर से रेफरल की अनुमति नहीं है' },
        { status: 400 }
      );
    }
    
    // Step 4: Check if this referral has already been credited
    const { data: existingCredit, error: creditCheckError } = await supabase
      .from('referral_credits')
      .select('id')
      .eq('referrer_id', referrerCustomerId)
      .eq('referred_customer_id', validatedData.newCustomerId)
      .single();
    
    if (existingCredit) {
      return NextResponse.json(
        { error: 'यह रेफरल पहले से क्रेडिट किया जा चुका है' },
        { status: 400 }
      );
    }

    // Step 5: Fraud check - Max 10 pending referrals per account
    const { data: pendingReferrals, error: pendingError } = await supabase
      .from('referral_credits')
      .select('id')
      .eq('referrer_id', referrerCustomerId)
      .eq('status', 'pending');
    
    if (pendingError) {
      console.error('Error fetching pending referrals:', pendingError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    if (pendingReferrals && pendingReferrals.length >= 10) {
      return NextResponse.json(
        { error: 'अधिकतम 10 पेंडिंग रेफरल की सीमा पूरी हो गई है। कृपया कुछ रेफरल क्रेडिट होने का इंतजार करें।' },
        { status: 400 }
      );
    }

    // Step 6: Fraud check - Velocity check (>5 referrals in 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentReferrals, error: recentError } = await supabase
      .from('referral_credits')
      .select('id, created_at')
      .eq('referrer_id', referrerCustomerId)
      .gte('created_at', sevenDaysAgo.toISOString());
    
    if (recentError) {
      console.error('Error fetching recent referrals:', recentError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    if (recentReferrals && recentReferrals.length >= 5) {
      // Flag for manual review - still allow but mark for review
      console.warn(`Velocity check triggered for referrer ${referrerCustomerId}: ${recentReferrals.length} referrals in 7 days`);
      // Could send notification to admin here
    }
    
    // Step 7: Create credit record
    const { data: creditData, error: creditInsertError } = await supabase
      .from('referral_credits')
      .insert({
        referrer_id: referrerCustomerId,
        referred_customer_id: validatedData.newCustomerId,
        referral_code: validatedData.referralCode.toUpperCase(),
        credit_amount: 1, // 1 month credit
        status: 'pending', // Pending until new customer makes first payment
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (creditInsertError) {
      console.error('Supabase insert error:', creditInsertError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    // Step 8: Trigger notification to referrer (optional)
    // This would typically send a WhatsApp message or email
    console.log(`Referral credit created: ${creditData.id} for referrer ${referrerCustomerId}`);
    
    // Send notification to referrer
    await sendReferralNotification(referrerCustomerId, creditData.id);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'रेफरल सफलतापूर्वक लागू किया गया',
        creditId: creditData.id,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Referral attribution error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
