// FlockIQ — Waitlist API
// File: apps/web/app/api/waitlist/route.ts
// Task Reference: E-02
// Requirements: FR-WAITLIST-001

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Zod schema for waitlist request validation
const WaitlistRequestSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, { message: 'कृपया सही 10-digit mobile number दर्ज करें' }),
  district: z.enum(['gorakhpur', 'deoria', 'kushinagar', 'basti', 'maharajganj', 'sant_kabir_nagar', 'other']),
  flock_size: z.enum(['10k-25k', '25k-50k', '50k-1l', '1l+']),
  consent_given: z.literal(true, { errorMap: () => ({ message: 'DPDP consent आवश्यक है' }) }),
  utm: z.object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
  }).optional(),
});

// Simple in-memory rate limiting (for production, use Vercel KV or Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Hash IP using SHA-256 for DPDP compliance (never store raw IP)
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
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    // Check rate limit (async due to IP hashing)
    if (!(await checkRateLimit(ip))) {
      return NextResponse.json(
        { error: 'बहुत ज़्यादा requests — 1 घंटे बाद try करें' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = WaitlistRequestSchema.parse(body);
    
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
    
    // Hash IP for DPDP compliance (never store raw IP)
    const ipHash = await hashIP(ip);
    
    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('phone', `+91${validatedData.phone}`)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'आप पहले से waitlist में हैं',
          alreadyOnWaitlist: true,
        },
        { status: 200 }
      );
    }
    
    // Insert into waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        phone: `+91${validatedData.phone}`,
        district: validatedData.district,
        flock_size: validatedData.flock_size,
        consent_given: validatedData.consent_given,
        utm_source: validatedData.utm?.source,
        utm_medium: validatedData.utm?.medium,
        utm_campaign: validatedData.utm?.campaign,
        ip_hash: ipHash,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    console.log(`Waitlist signup: +91${validatedData.phone} from ${validatedData.district}`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Waitlist में जुड़ गए',
        waitlistId: data.id,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Waitlist signup error:', error);
    
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
