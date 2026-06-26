// FlockIQ — Referral Code Generation API
// File: apps/web/app/api/referral/generate/route.ts
// Task Reference: H-02
// Requirements: FR-REFERRAL-001

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Zod schema for referral code generation request
const ReferralCodeRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Characters to use for referral code (no confusable chars: 0/O, 1/I)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

// Generate random 8-character alphanumeric code
function generateReferralCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARS.length);
    code += CODE_CHARS[randomIndex];
  }
  return code;
}

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ReferralCodeRequestSchema.parse(body);
    
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
    
    // Check if user already has a referral code
    const { data: existingCode, error: fetchError } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('customer_id', validatedData.userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found", which is expected if no code exists
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    // If code already exists, return it (idempotent)
    if (existingCode) {
      return NextResponse.json(
        { 
          success: true, 
          code: existingCode.code,
          message: 'Existing referral code returned',
        },
        { status: 200 }
      );
    }
    
    // Generate new unique code
    let newCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      newCode = generateReferralCode();
      
      // Check if code already exists in database
      const { data: codeCheck } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('code', newCode)
        .single();
      
      if (!codeCheck) {
        isUnique = true;
      }
      
      attempts++;
    }
    
    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique code' },
        { status: 500 }
      );
    }
    
    // Store new referral code in Supabase
    const { data: insertedCode, error: insertError } = await supabase
      .from('referral_codes')
      .insert({
        code: newCode!,
        customer_id: validatedData.userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        code: insertedCode.code,
        message: 'New referral code generated',
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Referral code generation error:', error);
    
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
