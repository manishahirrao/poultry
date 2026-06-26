// FlockIQ — Lead Capture API
// File: apps/web/app/api/leads/route.ts
// Task Reference: E-01
// Requirements: FR-LEADS-001, FR-HOME-007, FR-POPUP-002

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Zod schema for lead request validation
const LeadRequestSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, { message: 'कृपया सही 10-digit mobile number दर्ज करें' }).optional(),
  email: z.string().email({ message: 'कृपया सही email दर्ज करें' }).optional(),
  source: z.enum(['exit_intent', 'whatsapp_demo', 'blog_scroll', 'hero', 'pricing', 'faq', 'nav', 'homepage_cta', 'free_trial_popup', 'price-trends-tool']),
  district: z.enum(['gorakhpur', 'deoria', 'kushinagar', 'basti', 'maharajganj', 'sant_kabir_nagar']).optional(),
  plan: z.enum(['pulsefarm', 'pulsepro', 'pulseintel']).optional(),
  consent_given: z.literal(true, { errorMap: () => ({ message: 'DPDP consent आवश्यक है' }) }).optional(),
  metadata: z.record(z.any()).optional(),
  utm: z.object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
  }).optional(),
}).refine(data => data.phone || data.email, {
  message: 'या तो phone number या email आवश्यक है',
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
    
    // Check rate limit (async due to IP hashing)
    if (!(await checkRateLimit(ip))) {
      return NextResponse.json(
        { error: 'बहुत ज़्यादा requests — 1 घंटे बाद try करें' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = LeadRequestSchema.parse(body);
    
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
    
    // Upsert lead to Supabase (prevent duplicates by phone or email)
    const leadData: any = {
      source: validatedData.source,
      district: validatedData.district,
      plan: validatedData.plan,
      consent_given: validatedData.consent_given,
      utm_source: validatedData.utm?.source,
      utm_medium: validatedData.utm?.medium,
      utm_campaign: validatedData.utm?.campaign,
      ip_hash: ipHash, // DPDP compliance: store hashed IP, not raw IP
      metadata: validatedData.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (validatedData.phone) {
      leadData.phone = `+91${validatedData.phone}`;
    }

    if (validatedData.email) {
      leadData.email = validatedData.email;
    }

    const conflictColumn = validatedData.phone ? 'phone' : 'email';

    const { data, error } = await supabase
      .from('leads')
      .upsert(leadData, {
        onConflict: conflictColumn,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    
    // Trigger WhatsApp welcome message via Supabase Edge Function (if configured)
    // This would call a Supabase Edge Function to send the WhatsApp message
    console.log(`Lead captured: +91${validatedData.phone} from ${validatedData.source}`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'कल सुबह signal मिलेगा',
        leadId: data.id,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Lead capture error:', error);
    
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
