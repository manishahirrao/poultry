// FlockIQ — Analytics Event API
// File: apps/web/app/api/analytics/event/route.ts
// Task Reference: F-09
// Requirements: FR-TECH-003

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Zod schema for analytics event
const AnalyticsEventSchema = z.object({
  event: z.string(),
  properties: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = AnalyticsEventSchema.parse(body);
    
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
    
    // Insert analytics event to Supabase
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: validatedData.event,
        properties: validatedData.properties || {},
        created_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Supabase insert error:', error);
      // Don't fail the request - analytics should never break the app
      return NextResponse.json(
        { success: true, message: 'Event logged (with database warning)' },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Event logged successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Analytics event error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    // Don't fail the request - analytics should never break the app
    return NextResponse.json(
      { success: true, message: 'Event logged (with error)' },
      { status: 200 }
    );
  }
}
