// FlockIQ — Password Reset Verify API
// File: apps/web/app/api/auth/reset-password/verify/route.ts
// Version: v1.0 | May 2026
// Task Reference: AUTH-04 — Password Reset and Account Recovery

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { PhoneSchema, OTPSchema } from '@/lib/validations/schemas';

const ResetPasswordRequestSchema = z.object({
  phone: PhoneSchema,
  otp: OTPSchema,
  newPassword: z.string().min(8, 'Password कम से कम 8 characters होना चाहिए'),
});

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ResetPasswordRequestSchema.parse(body);
    
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
    
    // Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${validatedData.phone}`,
      token: validatedData.otp,
      type: 'sms',
    });
    
    if (error || !data.user) {
      console.error('OTP verification error:', error);
      return NextResponse.json(
        { error: 'गलत OTP — दोबारा try करें' },
        { status: 400 }
      );
    }
    
    // Update user password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      data.user.id,
      { password: validatedData.newPassword }
    );
    
    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { error: 'Password update में error — दोबारा try करें' },
        { status: 500 }
      );
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
        message: 'Password successfully reset',
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Password reset verify error:', error);
    
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
