// FlockIQ — Referral Stats API
// File: apps/web/app/api/referral/stats/route.ts
// Task Reference: H-01
// Requirements: FR-REFERRAL-001

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Zod schema for referral stats request
const ReferralStatsRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ReferralStatsRequestSchema.parse(body);
    
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
    
    // Fetch referral credits for this user
    const { data: credits, error: creditsError } = await supabase
      .from('referral_credits')
      .select('status, credit_amount')
      .eq('referrer_id', validatedData.userId);
    
    if (creditsError) {
      console.error('Supabase fetch error:', creditsError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    // Calculate stats
    const referredCount = credits?.length || 0;
    const creditsEarned = credits?.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + (c.credit_amount || 0), 0) || 0;
    const pendingCredits = credits?.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.credit_amount || 0), 0) || 0;
    
    return NextResponse.json(
      { 
        success: true,
        stats: {
          referredCount,
          creditsEarned,
          pendingCredits,
        },
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Referral stats error:', error);
    
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
