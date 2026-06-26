# PoultryPulse AI - GA4 Tracking Plan

## Overview
- **Tools:** GA4 (Google Analytics 4), Vercel Analytics, Supabase Events
- **Last Updated:** May 22, 2026
- **Measurement ID:** NEXT_PUBLIC_GA4_MEASUREMENT_ID (to be configured)

## Business Context
PoultryPulse AI is India's first AI-powered broiler price intelligence platform. Key business decisions informed by analytics:
- User acquisition effectiveness by channel
- Onboarding funnel optimization
- Feature adoption patterns
- Trial-to-paid conversion rates
- Geographic penetration (Gorakhpur, Deoria, Kushinagar)

## Core Events

### Marketing Site Events

| Event Name | Description | Properties | Trigger |
|------------|-------------|------------|---------|
| hero_cta_click | User clicks main CTA on hero | button_text, location | Hero section button click |
| demo_modal_open | User opens demo request modal | location | Demo button click |
| exit_popup_shown | Exit intent popup displayed | - | Mouse leave viewport |
| exit_popup_converted | User converts via exit popup | form_type | Exit popup form submit |
| lead_submitted | User submits lead form | form_type, location | Any lead form |
| signup_started | User begins signup flow | method | Signup form opened |
| signup_completed | User completes signup | method, source | Successful signup |
| pricing_viewed | User views pricing page | - | Pricing page view |
| language_toggled | User switches language | from_lang, to_lang | Language toggle click |
| referral_shared | User shares referral link | method, platform | Share button click |
| free_trial_popup_shown | Free trial popup displayed | - | Popup trigger |
| free_trial_popup_converted | User converts via trial popup | - | Trial signup |
| waitlist_popup_shown | Waitlist popup displayed | - | Popup trigger |
| waitlist_popup_converted | User joins waitlist | - | Waitlist signup |
| announcement_banner_clicked | User clicks announcement banner | banner_id | Banner click |
| blog_scroll_popup_shown | Blog scroll popup displayed | - | Scroll depth trigger |
| blog_scroll_popup_converted | User converts via blog popup | - | Popup form submit |

### Onboarding Events

| Event Name | Description | Properties | Trigger |
|------------|-------------|------------|---------|
| onboarding_started | User starts onboarding flow | - | Onboarding page load |
| onboarding_step_completed | User completes onboarding step | step, step_number, step_name | Step completion |
| onboarding_completed | User completes full onboarding | trial_duration, plan | Final step completion |
| onboarding_abandoned | User abandons onboarding | step, step_number | Inactivity timeout |
| otp_requested | User requests OTP verification | method | OTP request |
| otp_verified | User verifies OTP successfully | method | OTP verification success |
| whatsapp_verified | User verifies WhatsApp number | - | WhatsApp verification success |
| plan_confirmed | User confirms subscription plan | plan, billing_cycle | Plan selection |
| trial_started | User starts free trial | trial_duration, plan | Trial activation |
| app_download_initiated | User initiates app download | platform | App download button click |

### Product Events

| Event Name | Description | Properties | Trigger |
|------------|-------------|------------|---------|
| first_signal_received | User receives first price signal | district, accuracy | Signal delivery |
| welcome_signal_sent | Welcome signal sent to user | district | Onboarding completion |

## Standard Properties

### User Properties
- `user_id` - Unique user identifier (from Supabase auth)
- `user_type` - User segment (S1: Small farmers, S2: Commercial farmers)
- `locale` - User language preference (hi/en)
- `device_type` - mobile/desktop

### Session Properties
- `page_path` - Current page path
- `utm_source` - Traffic source
- `utm_medium` - Marketing medium
- `utm_campaign` - Campaign name
- `utm_content` - Content identifier
- `utm_term` - Search terms

### Business Properties
- `district` - User's district (Gorakhpur, Deoria, Kushinagar)
- `flock_size` - Number of birds in flock
- `farm_type` - Type of farm (broiler, layer, mixed)
- `plan` - Subscription plan (PULSE_FARM, PULSE_PRO)

## Conversions

### Key Conversions

| Conversion Name | Event | Counting Method | Value |
|-----------------|-------|-----------------|-------|
| Signup | signup_completed | Once per session | High |
| Onboarding Complete | onboarding_completed | Once per user | High |
| Trial Start | trial_started | Once per user | High |
| WhatsApp Verified | whatsapp_verified | Once per user | Medium |
| App Download | app_download_initiated | Once per user | Medium |
| Lead Capture | lead_submitted | Once per session | Medium |

## Custom Dimensions

### User-scoped Dimensions
| Name | Parameter | Description |
|------|-----------|-------------|
| User Segment | user_type | S1 (Small) or S2 (Commercial) |
| District | district | User's geographic district |
| Language | locale | hi or en |

### Event-scoped Dimensions
| Name | Parameter | Description |
|------|-----------|-------------|
| Button Text | button_text | Text of clicked button |
| Location | location | Where event occurred on page |
| Form Type | form_type | Type of form submitted |
| Step Name | step_name | Onboarding step identifier |

## Implementation Notes

### Privacy & Compliance
- DPDP Act 2023 compliant
- No PII in analytics properties
- IP anonymization enabled
- Cookie consent required (to be implemented)
- Data retention: 14 months (default GA4)

### Data Quality
- Validate event firing on key user flows
- Monitor for duplicate events
- Regular audits of property values
- Test across mobile and desktop

### UTM Parameter Strategy
- Lowercase all parameters
- Use underscores for multi-word values
- Document all campaigns in spreadsheet
- Standard naming: `utm_source=google&utm_medium=cpc&utm_campaign=broiler_price_gorakhpur`

## Next Steps

1. Configure GA4 property and measurement ID
2. Add GA4 initialization to root layout
3. Update analytics.ts to send events to GA4
4. Test event firing with GA4 DebugView
5. Configure conversions in GA4 Admin
6. Set up custom dimensions
7. Create dashboards for key metrics
8. Document UTM parameter strategy

## Questions for Implementation

- What is the GA4 Measurement ID? (To be provided)
- Should we implement cookie consent banner for EU/UK compliance?
- Who will configure conversions in GA4 Admin?
- Should we set up Google Tag Manager for additional tags?
