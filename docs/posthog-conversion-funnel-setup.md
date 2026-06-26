# PostHog Conversion Funnel Setup Guide

**Task Reference:** TASK-WEB-023  
**Requirement Refs:** CW-002  
**Date:** May 2026

## Overview

This document provides instructions for configuring the PostHog conversion funnel as specified in TASK-WEB-023. The conversion funnel tracks the user journey from page view to signup completion.

## Conversion Funnel Steps

The conversion funnel should be configured with the following steps:

1. **page_viewed (home)** - User views the homepage
2. **hero_cta_clicked** - User clicks on a hero CTA button
3. **signup_started** - User initiates the signup process
4. **login success** - User successfully logs in/signup completes

## Configuration Steps in PostHog Dashboard

### Step 1: Access PostHog Dashboard

1. Log in to your PostHog dashboard
2. Navigate to your project
3. Go to **Insights** → **Funnels**

### Step 2: Create New Funnel

1. Click **"New insight"** or **"Create funnel"**
2. Select **"Funnel"** as the insight type

### Step 3: Configure Funnel Steps

Add the following events in sequence:

#### Step 1: page_viewed
- **Event:** `page_viewed`
- **Filters:**
  - `route` equals `/` (homepage)
  - OR `page_path` contains `/` (to capture homepage views)

#### Step 2: hero_cta_clicked
- **Event:** `hero_cta_clicked`
- **Filters:** (optional)
  - `position` equals `above_fold` or `below_fold` or `navigation`

#### Step 3: signup_started
- **Event:** `signup_started`
- **Filters:** (optional)
  - `source_page` equals `home` (if you want to track only homepage-initiated signups)

#### Step 4: login success
- **Event:** `login_success` (this event needs to be added to the auth flow)
- **Filters:** (optional)
  - `method` equals `signup` (to track new signups specifically)

### Step 4: Set Time Window

- **Time to complete:** 7 days (recommended)
- This gives users enough time to complete the signup process

### Step 5: Add Breakdowns (Optional)

You can add breakdowns to analyze the funnel by:

- **UTM Source:** `utm_source`
- **UTM Medium:** `utm_medium`
- **UTM Campaign:** `utm_campaign`
- **Language:** `language`
- **Device Type:** `device_type`
- **Segment:** `segment` (if available)

### Step 6: Save and Name

- **Name:** "Homepage to Signup Conversion Funnel"
- **Description:** "Tracks user journey from homepage view to signup completion"
- **Save** the funnel

## Additional Funnels to Consider

### Demo Request Funnel
1. `page_viewed` (any page)
2. `hero_cta_clicked` (position: 'navigation')
3. `demo_requested`

### ROI Calculator Funnel
1. `page_viewed` (home)
2. `roi_calculator_used`
3. `hero_cta_clicked` (source: roi_calculator)

### Pricing Page Funnel
1. `page_viewed` (pricing)
2. `pricing_viewed`
3. `hero_cta_clicked` (page: pricing)

## Event Properties Reference

### page_viewed
- `route` - Current page route
- `language` - User's language preference (en/hi)
- `referrer` - Referrer URL
- `utm_source` - UTM source parameter
- `utm_medium` - UTM medium parameter
- `utm_campaign` - UTM campaign parameter
- `utm_term` - UTM term parameter
- `utm_content` - UTM content parameter
- `page_path` - Full page path
- `device_type` - Mobile or desktop
- `page_url` - Full page URL

### hero_cta_clicked
- `button_label` - Text on the button clicked
- `page` - Page where the click occurred
- `position` - Position of the CTA (above_fold/below_fold/navigation)

### signup_started
- `source_page` - Page where signup was initiated
- `segment` - User segment (if known)

### login success
- `method` - Signup or login
- `user_id` - User ID

## Monitoring and Optimization

### Key Metrics to Track

1. **Funnel Drop-off Rate** - Where users are dropping off
2. **Conversion Rate** - Overall conversion percentage
3. **Time to Convert** - Average time between steps
4. **Segment Performance** - How different segments perform

### Common Issues to Investigate

1. **High drop-off at hero_cta_clicked** - CTA copy/design optimization needed
2. **High drop-off at signup_started** - Signup form friction
3. **High drop-off at login success** - Onboarding flow issues

## Notes

- The `login_success` event needs to be implemented in the authentication flow (not yet done in this task)
- UTM parameters are automatically captured and stored in sessionStorage for attribution
- All events include common properties like device type, language, and UTM params
- Cookie consent is required before any PostHog events are fired (DPDP Act 2023 compliant)

## Next Steps

1. Implement the `login_success` event in the authentication flow
2. Set up the conversion funnel in PostHog dashboard
3. Monitor funnel performance weekly
4. A/B test CTAs to improve conversion rates
5. Add additional funnels for specific user journeys (demo, pricing, etc.)
