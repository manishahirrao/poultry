// FlockIQ — Password Reset Request API
// File: apps/web/app/api/auth/reset-password/request/route.ts
// Version: v1.0 | May 2026
// Task Reference: AUTH-04 — Password Reset and Account Recovery

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { PhoneSchema } from '@/lib/validations/schemas';

// Rate limiting: In-memory for demo, use Redis/Vercel KV in production
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function checkRateLimit(ip: string): Promise<boolean> {
  const hashedIP = await hashIP(ip);
  const now = Date.now();
  const record = rateLimitMap.get(hashedIP);
  
  if (!record) {
    rateLimitMap.set(hashedIP, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return true;
  }
  
  if (now > record.resetTime) {
    rateLimitMap.set(hashedIP, { count: 1, resetTime: now + 3600000 });
    return true;
  }
  
  if (record.count >= 3) {
    return false;
  }
  
  record.count++;
  return true;
}

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    if (!(await checkRateLimit(ip))) {
      return NextResponse.json(
        { error: 'बहुत ज़्यादा कोशिशें — 1 घंटे बाद try करें' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const validatedData = PhoneSchema.parse(body);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if user exists with this phone number
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('phone, name')
      .eq('phone', `+91${validatedData}`)
      .single();
    
    if (customerError || !customer) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        { success: true, message: 'अगर account है तो OTP भेजा जाएगा' },
        { status: 200 }
      );
    }
    
    // Send OTP via Supabase Auth for password reset
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${validatedData}`,
      options: {
        channel: 'sms',
        shouldCreateUser: false,
      },
    });
    
    if (error) {
      console.error('Supabase OTP send error:', error);
      return NextResponse.json(
        { error: 'OTP भेजने में error — दोबारा try करें' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true,
        message: 'OTP भेजा गया',
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Password reset request error:', error);
    
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
