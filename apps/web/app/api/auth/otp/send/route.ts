// FlockIQ — OTP Send API
// File: apps/web/app/api/auth/otp/send/route.ts
// Version: v1.0 | May 2026
// Task Reference: API-02 — OTP Verification with Twilio
// Requirements: FR-AUTH-001, FR-AUTH-002

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { SendOTPRequestSchema } from '@/lib/validations/schemas';

// Rate limiting: In-memory for demo, use Redis/Vercel KV in production
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Hash IP for DPDP compliance
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
  
  if (record.count >= 5) {
    return false;
  }
  
  record.count++;
  return true;
}

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    // Check rate limit
    if (!(await checkRateLimit(ip))) {
      return NextResponse.json(
        { error: 'बहुत ज़्यादा कोशिशें — 1 घंटे बाद try करें' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = SendOTPRequestSchema.parse(body);
    
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
    
    // Send OTP using Supabase Auth with phone provider
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${validatedData.phone}`,
      options: {
        channel: 'sms',
        shouldCreateUser: true,
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
    console.error('OTP send error:', error);
    
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
