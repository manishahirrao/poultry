// FlockIQ — Referral List API
// File: apps/web/app/api/referral/list/route.ts
// Task Reference: H-01
// Requirements: FR-REFERRAL-001

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Zod schema for referral list request
const ReferralListRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ReferralListRequestSchema.parse(body);
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder')) {
      console.error('Missing or invalid Supabase credentials');
      return NextResponse.json(
        { error: 'Referral program not configured - missing Supabase credentials' },
        { status: 503 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch referral credits for this referrer
    const { data: referrals, error: fetchError } = await supabase
      .from('referral_credits')
      .select(`
        id,
        referred_customer_id,
        referral_code,
        credit_amount,
        status,
        created_at,
        customers!referred_customer_id (
          phone
        )
      `)
      .eq('referrer_id', validatedData.userId)
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    // Transform data to match frontend interface
    const transformedReferrals = referrals?.map((ref: any) => ({
      id: ref.id,
      referredPhone: ref.customers?.phone || '',
      status: ref.status,
      creditAmount: ref.credit_amount,
      createdAt: ref.created_at,
    })) || [];
    
    return NextResponse.json(
      { 
        success: true, 
        referrals: transformedReferrals,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Referral list error:', error);
    
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
