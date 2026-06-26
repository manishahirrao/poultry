// FlockIQ — Referral Credit Confirmation API
// File: apps/web/app/api/referral/confirm/route.ts
// Task Reference: H-04
// Requirements: FR-REFERRAL-001

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { sendReferralNotification } from '@/lib/notifications';

// Zod schema for credit confirmation request
const CreditConfirmRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  paymentAmount: z.number().positive('Payment amount must be positive'),
  paymentId: z.string().min(1, 'Payment ID is required'),
});

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreditConfirmRequestSchema.parse(body);
    
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
    
    // Step 1: Find pending referral credit for this customer
    const { data: pendingCredit, error: fetchError } = await supabase
      .from('referral_credits')
      .select('*')
      .eq('referred_customer_id', validatedData.customerId)
      .eq('status', 'pending')
      .single();
    
    if (fetchError || !pendingCredit) {
      // No pending referral credit - this is normal for non-referred users
      return NextResponse.json(
        { 
          success: true, 
          message: 'No pending referral credit found',
          credited: false,
        },
        { status: 200 }
      );
    }
    
    // Step 2: Check if this payment has already been processed
    if (pendingCredit.payment_id === validatedData.paymentId) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Payment already processed',
          credited: false,
        },
        { status: 200 }
      );
    }
    
    // Step 3: Update the credit status to 'confirmed'
    const { data: updatedCredit, error: updateError } = await supabase
      .from('referral_credits')
      .update({
        status: 'confirmed',
        payment_id: validatedData.paymentId,
        payment_amount: validatedData.paymentAmount,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', pendingCredit.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    // Step 4: Add credit to referrer's account
    // This would typically update a customer_credits table or adjust billing
    const { error: creditError } = await supabase
      .from('customers')
      .update({
        referral_credits: (pendingCredit.credit_amount || 1),
      })
      .eq('id', pendingCredit.referrer_id);
    
    if (creditError) {
      console.error('Error updating referrer credits:', creditError);
      // Don't fail the request - credit confirmation succeeded, just log the error
    }
    
    // Step 5: Send notification to referrer
    await sendReferralNotification(
      pendingCredit.referrer_id,
      updatedCredit.id
    );
    
    // Step 6: Log the conversion for analytics
    console.log(`Referral conversion: ${pendingCredit.referrer_id} credited ${pendingCredit.credit_amount} months for customer ${validatedData.customerId}`);
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Referral credit confirmed successfully',
        credited: true,
        creditAmount: pendingCredit.credit_amount || 1,
        creditId: updatedCredit.id,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Referral credit confirmation error:', error);
    
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
