// FlockIQ — Analytics Events API
// File: apps/web/app/api/events/route.ts
// Version: v1.0 | May 2026
// Task Reference: UI-09
// Design Reference: 12_implementation_quick_reference.md §7.3

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Analytics event schema
const AnalyticsEventSchema = z.object({
  event: z.enum([
    'hero_cta_click',
    'demo_modal_open',
    'exit_popup_shown',
    'exit_popup_converted',
    'lead_submitted',
    'signup_started',
    'signup_completed',
    'otp_requested',
    'otp_verified',
    'onboarding_started',
    'onboarding_completed',
    'plan_confirmed',
    'trial_started',
    'whatsapp_verified',
    'app_download_initiated',
    'language_toggled',
    'pricing_viewed',
    'referral_shared',
    'waitlist_popup_shown',
    'free_trial_popup_shown',
    'announcement_banner_clicked',
  ]),
  properties: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = AnalyticsEventSchema.parse(body);

    // In production, this would:
    // 1. Store events in Supabase analytics_events table
    // 2. Send to Vercel Analytics (automatic via @vercel/analytics)
    // 3. Send to Google Analytics 4 if configured
    // 4. Send to Mixpanel/Amplitude if configured

    // For now, just log the event (non-blocking)
    console.log('Analytics event:', {
      event: validatedData.event,
      properties: validatedData.properties,
      timestamp: new Date().toISOString(),
    });

    // Return success immediately (fire-and-forget pattern)
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    // Silent fail — never block user action on analytics errors
    console.error('Analytics event error:', error);
    
    // Always return success to avoid blocking the client
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
