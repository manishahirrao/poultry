# Analytics Dashboard Setup Guide

## Overview

This document outlines the analytics configuration for PoultryPulse AI, combining Vercel Analytics for web analytics and Supabase for custom event tracking.

## Vercel Analytics

### Setup

Vercel Analytics is automatically enabled when deploying to Vercel. No additional configuration is required.

### Metrics Tracked

Vercel Analytics provides:

- **Page Views**: Total page views by URL
- **Top Pages**: Most visited pages
- **Bounce Rate**: Single-page session percentage
- **Session Duration**: Average time on site
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint)
  - INP (Interaction to Next Paint)
  - CLS (Cumulative Layout Shift)
- **Geographic Data**: User location by country/region
- **Device Data**: Desktop vs. mobile vs. tablet
- **Referrer Data**: Traffic sources (organic, direct, social, etc.)

### Access

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Navigate to Analytics tab
4. View real-time and historical data

### Custom Events

Vercel Analytics also tracks custom events via the `trackEvent` function. See `apps/web/lib/analytics.ts` for implementation.

## Supabase Events Dashboard

### Database Schema

Custom events are stored in the `events` table in Supabase:

```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  properties JSONB,
  page_path TEXT,
  session_id TEXT,
  device_type TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_name ON events(event_name);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_session ON events(session_id);
```

### Event Types Tracked

The following custom events are tracked:

#### Conversion Events
- `hero_cta_click` - Primary CTA clicked on hero section
- `nav_cta_click` - CTA clicked in navigation
- `signup_initiated` - User started signup flow
- `signup_completed` - User completed signup
- `demo_request_submitted` - Demo request form submitted

#### Engagement Events
- `language_toggle` - Language switched (hi ↔ en)
- `faq_expanded` - FAQ item expanded
- `pricing_plan_selected` - Pricing plan viewed/selected
- `calculator_used` - Loss calculator or ROI calculator used

#### Lead Capture Events
- `lead_captured` - Lead form submitted (exit intent, WhatsApp demo, blog scroll)
- `popup_opened` - Popup modal opened
- `popup_closed` - Popup modal closed

#### Feature Usage Events
- `whatsapp_demo_requested` - WhatsApp demo requested
- `accuracy_dashboard_viewed` - Accuracy dashboard viewed
- `case_study_viewed` - Case study viewed

### Dashboard Queries

#### Daily Signups
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as signups
FROM events
WHERE event_name = 'signup_completed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

#### Lead Captures by Source
```sql
SELECT 
  properties->>'source' as source,
  COUNT(*) as leads
FROM events
WHERE event_name = 'lead_captured'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY properties->>'source'
ORDER BY leads DESC;
```

#### Demo Requests (Last 7 Days)
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as demo_requests
FROM events
WHERE event_name = 'demo_request_submitted'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

#### CTA Click Performance
```sql
SELECT 
  event_name,
  properties->>'source' as source,
  COUNT(*) as clicks
FROM events
WHERE event_name LIKE '%cta_click%'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_name, properties->>'source'
ORDER BY clicks DESC;
```

#### Language Toggle Usage
```sql
SELECT 
  properties->>'from_language' as from_lang,
  properties->>'to_language' as to_lang,
  COUNT(*) as toggles
FROM events
WHERE event_name = 'language_toggle'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY properties->>'from_language', properties->>'to_language'
ORDER BY toggles DESC;
```

#### Top Pages by Custom Events
```sql
SELECT 
  page_path,
  COUNT(*) as events
FROM events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY page_path
ORDER BY events DESC
LIMIT 10;
```

### Accessing the Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to SQL Editor
4. Run any of the queries above
5. Save frequently used queries as "Saved Queries"

### Weekly Automated Report

A weekly report is generated with the following metrics:

#### Report Contents
- Total signups (week-over-week change)
- Lead captures by source
- Demo requests count
- Top 5 pages by custom events
- CTA click performance
- Language toggle usage
- Conversion funnel (signup_initiated → signup_completed)

#### Report Schedule
- **Frequency**: Every Monday at 9:00 AM IST
- **Delivery**: Email to engineering@poultrypulse.ai
- **Format**: PDF summary + CSV raw data

#### Automation Setup

The weekly report is generated via a Supabase Edge Function:

```typescript
// functions/generate-weekly-report/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Query events for the past week
  // Generate report
  // Send email via Resend
  // Return success
})
```

## Event Tracking Implementation

### Using the trackEvent Utility

The `trackEvent` function in `apps/web/lib/analytics.ts` handles both Vercel Analytics and Supabase events:

```typescript
import { trackEvent } from '@/lib/analytics';

// Track a simple event
trackEvent('hero_cta_click', {
  source: 'hero',
  plan: 'pulsefarm',
});

// Track with UTM params (auto-attached)
trackEvent('signup_completed', {
  plan: 'pulsepro',
  billing_cycle: 'annual',
});
```

### Auto-Attached Properties

The following properties are automatically attached to every event:

- `page_path` - Current URL path
- `session_id` - Unique session identifier
- `device_type` - Desktop, mobile, or tablet
- `utm_source` - UTM source if present
- `utm_medium` - UTM medium if present
- `utm_campaign` - UTM campaign if present

### Server-Safe Implementation

The `trackEvent` function is server-safe - it's a no-op when `window` is undefined, preventing errors during SSR.

## Privacy & Compliance

### Data Retention

- **Vercel Analytics**: Data retained for 90 days (Vercel default)
- **Supabase Events**: Data retained for 365 days, then archived
- **PII**: No personally identifiable information stored (session IDs are anonymous)

### DPDP Act 2023 Compliance

- All analytics data stored in AWS ap-south-1 (Mumbai)
- No cross-border data transfer
- User consent required for tracking (via DPDP checkbox)
- Users can request data deletion via privacy@poultrypulse.ai

### Opt-Out

Users can opt out of analytics by:
- Disabling cookies in browser settings
- Using "Do Not Track" browser setting
- Contacting privacy@poultrypulse.ai for explicit opt-out

## Troubleshooting

### Events Not Appearing in Supabase

1. Check if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
2. Verify RLS policies on `events` table allow anonymous inserts
3. Check browser console for errors
4. Verify Supabase connection is working

### Vercel Analytics Not Showing Data

1. Verify project is deployed to Vercel
2. Check that Analytics is enabled in project settings
3. Wait 5-10 minutes for data to appear (initial delay)
4. Check that `@vercel/analytics` package is installed

### High Event Volume

If event volume is unexpectedly high:
1. Check for event duplication in implementation
2. Verify that events are only fired on user actions, not on every render
3. Consider sampling for high-frequency events
4. Add rate limiting to event tracking

## Contact

For analytics-related questions or issues:
- **Engineering Team**: engineering@poultrypulse.ai
- **Data Team**: data@poultrypulse.ai

---

**Last Updated**: May 2026
**Version**: 1.0.0
