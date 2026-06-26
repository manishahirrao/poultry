# PoultryPulse AI — Launch Readiness Checklist
**Task Reference:** TASK-WEB-027
**Sprint:** WS8
**Date:** May 30, 2026
**Status:** In Progress

---

## Production Environment Variables Verification

### Required Environment Variables
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project API key
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (ap-south-1 Mumbai)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SLACK_WEBHOOK_URL` - Slack incoming webhook for lead notifications
- [ ] `UPSTASH_REDIS_REST_URL` - Upstash Redis for rate limiting
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL (https://poultrypulse.ai)

### Verification Steps
1. Check Vercel project environment variables
2. Verify all variables are set in production environment
3. Test that Supabase connection works with provided credentials
4. Verify PostHog key is valid for production project
5. Test Slack webhook with a test message
6. Verify Upstash Redis connection

---

## Page Availability Check (15 Pages)

### Core Marketing Pages
- [ ] `/` - Home page
- [ ] `/features` - Features page
- [ ] `/pricing` - Pricing page
- [ ] `/accuracy` - Accuracy & Proof page

### Solutions Pages
- [ ] `/solutions/commercial-farms` - Commercial farms solution
- [ ] `/solutions/integrators` - Integrators solution
- [ ] `/solutions/feed-companies` - Feed companies solution
- [ ] `/solutions/enterprise` - Enterprise solution

### Additional Marketing Pages
- [ ] `/farm-intelligence` - Farm intelligence page
- [ ] `/developers` - API & Developers page
- [ ] `/compliance` - Compliance & Traceability page
- [ ] `/about` - About page
- [ ] `/demo` - Request demo page
- [ ] `/login` - Login / Sign up page
- [ ] `/blog` - Blog listing page

### Verification Method
Run automated curl check or use Playwright to verify all pages return HTTP 200

---

## API Endpoint Verification

### Public API Endpoints
- [ ] `/api/public/accuracy-summary` - Returns valid JSON with accuracy metrics
- [ ] `/api/public/demo-request` - Accepts POST requests for demo requests
- [ ] `/api/public/predictions` - Returns prediction data (if implemented)

### Verification Steps
1. Test GET `/api/public/accuracy-summary` - verify JSON response structure
2. Test POST `/api/public/demo-request` - verify form submission works
3. Check rate limiting headers are present
4. Verify CORS headers are correctly configured

---

## Form Submission Testing

### Demo Request Form
- [ ] Form submits successfully to `/api/public/demo-request`
- [ ] Supabase row created in `demo_requests` table
- [ ] Slack notification sent to `#leads` channel
- [ ] Success redirect to `/demo/thank-you` page
- [ ] Error handling works for invalid inputs

### Verification Steps
1. Submit test demo request with valid data
2. Check Supabase dashboard for new row
3. Verify Slack channel receives notification
4. Test with invalid phone number format
5. Test with missing required fields

---

## Authentication Flow Testing

### Login / Sign-up Flow
- [ ] Phone number input accepts Indian format
- [ ] OTP is sent via Twilio WhatsApp
- [ ] OTP input auto-submits on 6th digit
- [ ] New user navigates to profile setup
- [ ] Returning user navigates to `/dashboard`
- [ ] Incorrect OTP shows error message
- [ ] 3 attempt limit enforced

### Verification Steps
1. Test sign-up with new phone number
2. Test login with existing phone number
3. Test OTP validation with wrong code
4. Verify UTM parameters are preserved
5. Test session persistence

---

## SSL Certificate Verification

### SSL Configuration
- [ ] SSL certificate valid (Let's Encrypt via Vercel)
- [ ] HTTPS enforced on all pages
- [ ] HSTS header configured with max-age=31536000
- [ ] No mixed content warnings
- [ ] Certificate auto-renewal enabled

### Verification Steps
1. Check SSL certificate using online SSL checker
2. Verify HSTS header in browser dev tools
3. Test HTTP to HTTPS redirect
4. Check for mixed content errors

---

## Domain DNS Configuration

### Canonical Domain Setup
- [ ] `poulse.ai` resolves to Vercel
- [ ] `www.poulse.ai` redirects to `https://poulse.ai`
- [ ] `poultrypulse.ai` resolves to Vercel
- [ ] `www.poultrypulse.ai` redirects to `https://poultrypulse.ai`
- [ ] DNS propagation complete
- [ ] No DNS errors or warnings

### Verification Steps
1. Use `dig` or `nslookup` to verify DNS records
2. Test redirects in browser
3. Check Vercel dashboard for domain status
4. Verify no DNS propagation delays

---

## Google Search Console Setup

### Sitemap Submission
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Sitemap submitted to Google Search Console
- [ ] All 15 pages included in sitemap
- [ ] Blog posts dynamically included
- [ ] Case studies dynamically included
- [ ] Programmatic SEO pages included
- [ ] Indexing status verified

### Verification Steps
1. Access `https://poultrypulse.ai/sitemap.xml`
2. Submit sitemap in Google Search Console
3. Check index coverage report
4. Verify no indexing errors
5. Check for blocked resources

---

## PostHog Analytics Verification

### Event Tracking
- [ ] PostHog initialized correctly
- [ ] `page_viewed` event fires on home page
- [ ] Cookie consent banner functional
- [ ] Events only fire after consent
- [ ] UTM parameters captured
- [ ] User identification works

### Verification Steps
1. Open PostHog dashboard
2. Visit home page and accept cookies
3. Verify `page_viewed` event appears
4. Check event properties include UTM params
5. Test cookie consent decline

---

## Sentry Error Monitoring

### Error Tracking Setup
- [ ] Sentry initialized in Next.js app
- [ ] Source maps uploaded for production
- [ ] JavaScript errors captured
- [ ] API errors captured
- [ ] Performance monitoring enabled
- [ ] Release tracking configured

### Verification Steps
1. Check Sentry dashboard for project
2. Trigger a test error in production
3. Verify error appears in Sentry
4. Check source maps are working
5. Verify release version is tagged

---

## WhatsApp CTA Testing

### Footer WhatsApp Link
- [ ] WhatsApp link in footer works
- [ ] Pre-filled message included
- [ ] Opens WhatsApp app on mobile
- [ ] Opens WhatsApp web on desktop
- [ ] Phone number format correct

### Verification Steps
1. Click WhatsApp link on mobile device
2. Verify pre-filled message appears
3. Test on desktop browser
4. Verify phone number format: +91XXXXXXXXXX

---

## Performance Smoke Test

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.0s (p75)
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] TTFB (Time to First Byte) < 600ms
- [ ] First Contentful Paint < 1.2s

### Verification Steps
1. Run Lighthouse audit on home page
2. Check Vercel Analytics for real-user data
3. Verify performance budgets met
4. Check bundle size analysis
5. Test on 3G connection simulation

---

## Final Pre-Launch Checklist

### Code Quality
- [ ] TypeScript compilation passes
- [ ] ESLint passes with no errors
- [ ] All tests passing (unit + E2E)
- [ ] No console warnings in production
- [ ] No 404 errors on any page

### Security
- [ ] Environment variables not exposed
- [ ] API routes protected with rate limiting
- [ ] CORS configured correctly
- [ ] Security headers in place
- [ ] No sensitive data in client-side code

### Content
- [ ] Hindi copy reviewed by native speaker
- [ ] All pages have unique meta titles
- [ ] All pages have meta descriptions
- [ ] OpenGraph tags configured
- [ ] Twitter Card tags configured
- [ ] Canonical URLs set

### Monitoring
- [ ] Uptime monitoring configured
- [ ] Error monitoring active
- [ ] Analytics tracking functional
- [ ] Performance monitoring enabled
- [ ] Slack alerts configured

---

## Post-Launch Verification (24-48 hours after launch)

### Traffic & Performance
- [ ] Real users accessing the site
- [ ] Vercel Analytics showing data
- [ ] PostHog events firing correctly
- [ ] No critical errors in Sentry
- [ ] Performance metrics within targets

### Functionality
- [ ] Demo requests coming through
- [ ] Sign-ups working
- [ ] WhatsApp CTAs functional
- [ ] All pages loading correctly
- [ ] No broken links

### SEO
- [ ] Google indexing pages
- [ ] Sitemap being crawled
- [ ] No crawl errors in GSC
- [ ] Search impressions appearing
- [ ] Core keywords ranking

---

## Sign-Off

### Pre-Launch Approval
- [ ] Engineering Lead: _______________
- [ ] Product Lead: _______________
- [ ] DevOps Lead: _______________
- [ ] Date: _______________

### Post-Launch Verification
- [ ] All checks passed
- [ ] No critical issues found
- [ ] Monitoring stable
- [ ] Date: _______________

---

## Notes

### Issues Found During Launch
- [Issue 1]
- [Issue 2]
- [Issue 3]

### Resolutions
- [Resolution 1]
- [Resolution 2]
- [Resolution 3]

### Post-Launch Action Items
- [Action 1]
- [Action 2]
- [Action 3]
