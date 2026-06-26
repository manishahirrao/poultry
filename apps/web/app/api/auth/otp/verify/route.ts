// FlockIQ — OTP Verify API
// File: apps/web/app/api/auth/otp/verify/route.ts
// Version: v1.0 | May 2026
// Task Reference: API-02 — OTP Verification with Twilio
// Requirements: FR-AUTH-001, FR-AUTH-002

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { z } from 'zod';
import { VerifyOTPRequestSchema } from '@/lib/validations/schemas';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = VerifyOTPRequestSchema.parse(body);
    
    // Initialize Supabase client with service role key for server-side operations
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
    
    // Verify OTP using Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${validatedData.phone}`,
      token: validatedData.otp,
      type: 'sms',
    });
    
    if (error) {
      console.error('Supabase OTP verify error:', error);
      return NextResponse.json(
        { error: 'गलत OTP — दोबारा try करें' },
        { status: 400 }
      );
    }
    
    if (!data.user) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }
    
    // Check if user exists in customers table, create if not
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', `+91${validatedData.phone}`)
      .single();
    
    if (customerError && customerError.code === 'PGRST116') {
      // Customer doesn't exist, create new customer
      const { error: createError } = await supabase
        .from('customers')
        .insert({
          phone: `+91${validatedData.phone}`,
          segment: 'S1', // Default segment, will be updated during onboarding
          role: 'farmer',
          plan: 'PULSE_FARM', // Default plan, will be confirmed during onboarding
          district: 'gorakhpur', // Default, will be updated during onboarding
          whatsappVerified: true,
          onboardingCompleted: false,
          subscriptionActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      
      if (createError) {
        console.error('Customer creation error:', createError);
        // Don't fail the request, just log the error
      }
    }
    
    // Create session cookie
    const cookieStore = await cookies();
    const sessionData = {
      userId: data.user.id,
      phone: `+91${validatedData.phone}`,
      accessToken: data.session?.access_token,
    };
    
    cookieStore.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return NextResponse.json(
      { 
        success: true,
        message: 'OTP verified successfully',
        userId: data.user.id,
        phone: `+91${validatedData.phone}`,
        isNewUser: !customer,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('OTP verify error:', error);
    
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
