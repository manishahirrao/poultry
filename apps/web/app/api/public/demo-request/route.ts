// FlockIQ — Public Demo Request API
// File: apps/web/app/api/public/demo-request/route.ts
// Task Reference: TASK-WEB-019
// Requirements: REQ-WEB-010

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Zod schema for demo request validation (as per TASK-WEB-019 Technical Notes)
const DemoRequestSchema = z.object({
  name: z.string().min(2).max(100),
  company: z.string().min(2).max(200),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  segment: z.enum(['commercial_farm', 'integrator', 'feed_company', 'enterprise', 'other']),
  flockSize: z.string(),
  message: z.string().max(500).optional(),
  language: z.enum(['en', 'hi']),
});

// Simple in-memory rate limiting by IP (for production, use Upstash Redis)
const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRateLimitMap.get(ip);
  
  if (!record) {
    ipRateLimitMap.set(ip, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return true;
  }
  
  if (now > record.resetTime) {
    ipRateLimitMap.set(ip, { count: 1, resetTime: now + 3600000 });
    return true;
  }
  
  if (record.count >= 5) {
    return false;
  }
  
  record.count++;
  return true;
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    // Check rate limit (5 submissions per IP per hour)
    if (!checkIpRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = DemoRequestSchema.parse(body);
    
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
        company: validatedData.company,
        phone: `+91${validatedData.phone}`,
        segment: validatedData.segment,
        flock_size: validatedData.flockSize,
        message: validatedData.message,
        language: validatedData.language,
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
    
    // Send Slack notification to #leads channel
    const slackWebhookUrl = process.env.SLACK_LEADS_WEBHOOK_URL;
    if (slackWebhookUrl) {
      try {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🎯 New Demo Request from ${validatedData.name}`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*New Demo Request*\n\n*Name:* ${validatedData.name}\n*Company:* ${validatedData.company}\n*Phone:* +91${validatedData.phone}\n*Segment:* ${validatedData.segment}\n*Flock Size:* ${validatedData.flockSize}\n*Language:* ${validatedData.language}\n${validatedData.message ? `*Message:* ${validatedData.message}` : ''}`,
                },
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: 'View in Supabase',
                    },
                    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/project/_/editor/dataset/demo_requests`,
                    style: 'primary',
                  },
                ],
              },
            ],
          }),
        });
      } catch (slackError) {
        console.error('Slack notification error:', slackError);
        // Don't fail the request if Slack notification fails
      }
    }
    
    console.log(`Demo request from ${validatedData.name} (${validatedData.phone}) - ${validatedData.segment}`);
    
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
