# GA4 Setup Guide for PoultryPulse AI

## Prerequisites

Before starting, ensure you have:
- Google Analytics account with Admin access
- PoultryPulse AI development environment access

## Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Admin" (gear icon) → "Create Account"
3. Account name: "PoultryPulse AI"
4. Create property:
   - Property name: "PoultryPulse AI Web"
   - Reporting time zone: "India (GMT+05:30)"
   - Currency: "Indian Rupee (INR)"
5. Business information:
   - Industry category: "Technology" or "Agriculture"
   - Business size: "Small" or "Medium"
   - Use cases: "Measure user engagement"

## Step 2: Configure Data Stream

1. In the new property, go to Admin → Data Streams
2. Click "Add stream" → "Web"
3. Stream details:
   - Website URL: `https://poultrypulse.ai`
   - Stream name: "PoultryPulse Web"
   - Enhanced measurement: Enable all options
4. Click "Create stream"
5. **Copy the Measurement ID** (format: `G-XXXXXXXXXX`)

## Step 3: Add Measurement ID to Environment Variables

Add the Measurement ID to your environment files:

**Development:**
```bash
# apps/web/.env.local
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Production (Vercel):**
1. Go to Vercel Project Settings → Environment Variables
2. Add: `NEXT_PUBLIC_GA4_MEASUREMENT_ID` = `G-XXXXXXXXXX`
3. Redeploy the application

## Step 4: Configure Conversions

In GA4 Admin, mark key events as conversions:

1. Go to Admin → Events → Mark as conversion
2. Mark these events as conversions:
   - `signup_completed` - High priority
   - `onboarding_completed` - High priority
   - `trial_started` - High priority
   - `whatsapp_verified` - Medium priority
   - `app_download_initiated` - Medium priority
   - `lead_submitted` - Medium priority

## Step 5: Set Up Custom Dimensions

1. Go to Admin → Custom definitions → Create custom dimensions
2. Create user-scoped dimensions:
   - **User Segment**: `user_type` (S1/S2)
   - **District**: `district` (Gorakhpur, Deoria, Kushinagar)
   - **Language**: `locale` (hi/en)

3. Create event-scoped dimensions:
   - **Button Text**: `button_text`
   - **Location**: `location`
   - **Form Type**: `form_type`
   - **Step Name**: `step_name`

## Step 6: Test Implementation

### Using GA4 DebugView

1. Open GA4 → Configure → DebugView
2. Enable debug mode in your browser:
   ```
   https://poultrypulse.ai/?gtm_debug=1
   ```
3. Navigate through the application
4. Verify events appear in DebugView in real-time

### Key Events to Test

- Page views on different routes
- Hero CTA click
- Signup flow (signup_started → signup_completed)
- Onboarding flow (onboarding_step_completed → onboarding_completed)
- WhatsApp verification
- Language toggle

## Step 7: Verify Data Quality

### Checklist

- [ ] Events firing on correct triggers
- [ ] Property values populating correctly (device_type, locale, UTM parameters)
- [ ] No duplicate events
- [ ] Works across mobile and desktop
- [ ] Conversions recorded correctly
- [ ] No PII in event properties

### Common Issues

| Issue | Solution |
|-------|----------|
| Events not firing | Check Measurement ID in env, verify GoogleAnalytics component loads |
| Wrong property values | Check sessionStorage for UTM params, localStorage for locale |
| Duplicate events | Check if multiple gtag instances are loading |
| Events in DebugView but not reports | Wait 24-48 hours for data processing |

## Step 8: Create Dashboards

### Recommended Reports

1. **Acquisition Report**
   - Source/Medium breakdown
   - UTM campaign performance
   - Geographic distribution

2. **Conversion Funnel**
   - Landing page → Signup → Onboarding → Trial
   - Drop-off analysis at each step

3. **User Engagement**
   - Active users by locale (hi/en)
   - Device type distribution
   - Session duration

4. **Feature Adoption**
   - WhatsApp verification rate
   - App download initiation
   - Signal reception tracking

## Step 9: Set Up Alerts

Configure custom alerts for:

1. **Conversion drop**: If signup_completed drops >20% week-over-week
2. **Traffic spike**: If pageviews increase >50% unexpectedly
3. **Event failure**: If key events stop firing for >1 hour

## Privacy & Compliance

### DPDP Act 2023 Compliance

- ✅ IP anonymization enabled (`anonymize_ip: true`)
- ✅ No PII in event properties
- ✅ Data stored in Google's EU/US servers
- ⚠️ Cookie consent banner needed (future enhancement)

### Data Retention

- Default: 2 months (adjustable to 14 months)
- Recommendation: Set to 14 months for better analysis

## UTM Parameter Strategy

### Standard Format

```
utm_source={source}
utm_medium={medium}
utm_campaign={campaign}
utm_content={content}
utm_term={term}
```

### Examples

- Google Ads: `?utm_source=google&utm_medium=cpc&utm_campaign=broiler_price_gorakhpur`
- WhatsApp: `?utm_source=whatsapp&utm_medium=social&utm_campaign=referral_program`
- Email: `?utm_source=newsletter&utm_medium=email&utm_campaign=price_alert_may2026`

### Naming Conventions

- Lowercase only
- Use underscores for multi-word values
- Be specific: `broiler_price_gorakhpur` not `campaign1`
- Document all campaigns in shared spreadsheet

## Maintenance

### Monthly Tasks

- Review event firing in DebugView
- Check for new custom dimension needs
- Audit UTM parameter usage
- Review conversion funnel performance

### Quarterly Tasks

- Review and update tracking plan
- Audit data quality
- Review privacy compliance
- Update dashboards based on business questions

## Troubleshooting

### Events Not Appearing

1. Check browser console for errors
2. Verify Measurement ID is correct
3. Check if ad blockers are blocking gtag.js
4. Verify GoogleAnalytics component is rendering

### Wrong Data

1. Check property names in trackEvent calls
2. Verify UTM parameters are being set by middleware
3. Check localStorage for locale values
4. Review event properties in DebugView

### Performance Issues

If analytics slows down the app:
- Events are already sent asynchronously via queueMicrotask
- Supabase events use keepalive for page unload safety
- GA4 gtag loads asynchronously
- Consider sampling for high-traffic events

## Support Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GA4 DebugView](https://support.google.com/analytics/answer/7209852)
- [Custom Dimensions](https://support.google.com/analytics/answer/10075209)
- [Event Tracking](https://support.google.com/analytics/answer/9216061)

## Next Steps

After completing this setup:

1. Monitor data for 1-2 weeks to establish baseline
2. Create custom reports based on key business questions
3. Set up regular review cadence with stakeholders
4. Consider implementing Google Tag Manager for additional tracking needs
5. Plan for cookie consent implementation for EU/UK compliance
