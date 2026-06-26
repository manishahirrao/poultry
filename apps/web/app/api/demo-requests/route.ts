// FlockIQ — Demo Request API
// File: apps/web/app/api/demo-requests/route.ts
// Task Reference: E-02
// Requirements: FR-POPUP-001 (Demo variant)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { sendEmailNotification } from '@/lib/notifications';

// Zod schema for demo request validation
const DemoRequestSchema = z.object({
  name: z.string().min(2, 'नाम कम से कम 2 अक्षर का होना चाहिए'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'कृपया सही मोबाइल नंबर दर्ज करें'),
  district: z.enum(['gorakhpur', 'deoria', 'kushinagar', 'basti', 'maharajganj', 'sant_kabir_nagar']),
  flock_size: z.enum(['10k-25k', '25k-50k', '50k-1l', '1l+']),
  preferred_time: z.string().optional(),
  consent_given: z.literal(true, { errorMap: () => ({ message: 'सहमति आवश्यक है' }) }),
  utm: z.object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
  }).optional(),
});

// Simple in-memory rate limiting by phone number (for production, use Vercel KV or Redis)
const phoneRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkPhoneRateLimit(phone: string): boolean {
  const now = Date.now();
  const record = phoneRateLimitMap.get(phone);
  
  if (!record) {
    phoneRateLimitMap.set(phone, { count: 1, resetTime: now + 86400000 }); // 24 hours
    return true;
  }
  
  if (now > record.resetTime) {
    phoneRateLimitMap.set(phone, { count: 1, resetTime: now + 86400000 });
    return true;
  }
  
  if (record.count >= 2) {
    return false;
  }
  
  record.count++;
  return true;
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = DemoRequestSchema.parse(body);
    
    // Check rate limit by phone number (2 per day)
    if (!checkPhoneRateLimit(validatedData.phone)) {
      return NextResponse.json(
        { error: 'आपने दैनिक सीमा पूरी कर ली है। कल पुनः प्रयास करें।' },
        { status: 429 }
      );
    }
    
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
    
    // Insert demo request to Supabase
    const { data, error } = await supabase
      .from('demo_requests')
      .insert({
        name: validatedData.name,
        phone: `+91${validatedData.phone}`,
        district: validatedData.district,
        flock_size: validatedData.flock_size,
        preferred_time: validatedData.preferred_time,
        consent_given: validatedData.consent_given,
        utm_source: validatedData.utm?.source,
        utm_medium: validatedData.utm?.medium,
        utm_campaign: validatedData.utm?.campaign,
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
    
    // Send email notification to team
    console.log(`Demo request from ${validatedData.name} (${validatedData.phone}) - ${validatedData.district}`);
    
    // Send email notification
    await sendEmailNotification({
      to: 'team@FlockIQ.ai',
      subject: `New Demo Request: ${validatedData.name}`,
      html: `
        <h2>New Demo Request</h2>
        <p><strong>Name:</strong> ${validatedData.name}</p>
        <p><strong>Phone:</strong> +91${validatedData.phone}</p>
        <p><strong>District:</strong> ${validatedData.district}</p>
        <p><strong>Flock Size:</strong> ${validatedData.flock_size}</p>
        ${validatedData.preferred_time ? `<p><strong>Preferred Time:</strong> ${validatedData.preferred_time}</p>` : ''}
      `,
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Demo request submitted successfully',
        requestId: data.id,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Demo request error:', error);
    
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
