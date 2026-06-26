// FlockIQ — PostHog Analytics Utility Functions
// File: apps/web/lib/posthog-analytics.ts
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-023
// Requirement Refs: CW-002 §CW-2.1

import posthog from 'posthog-js';

// Event types as per CW-002 §CW-2.1
export type PostHogEvent =
  | 'page_viewed'
  | 'hero_cta_clicked'
  | 'roi_calculator_used'
  | 'demo_requested'
  | 'signup_started'
  | 'pricing_viewed'
  | 'accuracy_page_viewed';

// Utility to check if PostHog is available and consent is given
function isPostHogAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const consent = localStorage.getItem('pp_cookie_consent');
  return consent === 'accepted' && typeof posthog !== 'undefined';
}

// Get UTM parameters from sessionStorage
function getUTMParams(): Record<string, string | undefined> {
  if (typeof window === 'undefined') return {};
  return {
    utm_source: sessionStorage.getItem('utm_source') || undefined,
    utm_medium: sessionStorage.getItem('utm_medium') || undefined,
    utm_campaign: sessionStorage.getItem('utm_campaign') || undefined,
    utm_term: sessionStorage.getItem('utm_term') || undefined,
    utm_content: sessionStorage.getItem('utm_content') || undefined,
  };
}

// Get common properties for all events
function getCommonProperties(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  
  return {
    page_path: window.location.pathname,
    page_url: window.location.href,
    referrer: document.referrer || undefined,
    device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
    language: localStorage.getItem('pp_lang') || 'hi',
    ...getUTMParams(),
  };
}

/**
 * Track page view event
 * @param route - Current page route
 * @param language - Current language (en/hi)
 */
export function trackPageViewed(route: string, language: string): void {
  if (!isPostHogAvailable()) return;

  posthog.capture('page_viewed', {
    ...getCommonProperties(),
    route,
    language,
  });
}

/**
 * Track hero CTA click event
 * @param buttonLabel - Label of the button clicked
 * @param page - Page where the click occurred
 * @param position - Position of the CTA (above_fold/below_fold/navigation)
 */
export function trackHeroCtaClicked(
  buttonLabel: string,
  page: string,
  position: 'above_fold' | 'below_fold' | 'navigation'
): void {
  if (!isPostHogAvailable()) return;

  posthog.capture('hero_cta_clicked', {
    ...getCommonProperties(),
    button_label: buttonLabel,
    page,
    position,
  });
}

/**
 * Track ROI calculator usage
 * @param flockSize - Flock size selected
 * @param avgWeight - Average weight selected
 * @param frequency - Sell frequency selected
 * @param outputValue - Calculated output value
 */
export function trackRoiCalculatorUsed(
  flockSize: number,
  avgWeight: number,
  frequency: string,
  outputValue: number
): void {
  if (!isPostHogAvailable()) return;

  posthog.capture('roi_calculator_used', {
    ...getCommonProperties(),
    flock_size: flockSize,
    avg_weight: avgWeight,
    sell_frequency: frequency,
    output_value: outputValue,
  });
}

/**
 * Track demo request submission
 * @param segment - User segment
 * @param flockSize - Flock size bucket
 * @param language - User's language preference
 */
export function trackDemoRequested(
  segment: string,
  flockSize: string,
  language: string
): void {
  if (!isPostHogAvailable()) return;

  posthog.capture('demo_requested', {
    ...getCommonProperties(),
    segment,
    flock_size_bucket: flockSize,
    language,
  });
}

/**
 * Track signup start
 * @param sourcePage - Page where signup was initiated
 * @param segment - User segment (if known)
 */
export function trackSignupStarted(sourcePage: string, segment?: string): void {
  if (!isPostHogAvailable()) return;

  posthog.capture('signup_started', {
    ...getCommonProperties(),
    source_page: sourcePage,
    segment,
  });
}

/**
 * Track pricing page view with tier hover
 * @param tierHovered - Tier that was hovered (pulsepro/enterprise)
 * @param timeOnPage - Time spent on page in seconds
 */
export function trackPricingViewed(tierHovered?: string, timeOnPage?: number): void {
  if (!isPostHogAvailable()) return;

  posthog.capture('pricing_viewed', {
    ...getCommonProperties(),
    tier_hovered: tierHovered,
    time_on_page_seconds: timeOnPage,
  });
}

/**
 * Track accuracy page scroll depth
 * @param scrollDepth - Scroll depth percentage (25/50/75/100)
 */
export function trackAccuracyPageViewed(scrollDepth: 25 | 50 | 75 | 100): void {
  if (!isPostHogAvailable()) return;

  posthog.capture('accuracy_page_viewed', {
    ...getCommonProperties(),
    scroll_depth: scrollDepth,
  });
}

/**
 * Track segment CTA click
 * @param segment - Segment clicked
 * @param page - Page where click occurred
 */
export function trackSegmentCtaClicked(segment: string, page: string): void {
  if (!isPostHogAvailable()) return;

  posthog.capture('segment_cta_clicked', {
    ...getCommonProperties(),
    segment,
    page,
  });
}

/**
 * Identify user (call after login/signup)
 * @param userId - User ID
 * @param properties - User properties
 */
export function identifyUser(userId: string, properties?: Record<string, any>): void {
  if (!isPostHogAvailable()) return;

  posthog.identify(userId, properties);
}

/**
 * Reset user (call after logout)
 */
export function resetUser(): void {
  if (!isPostHogAvailable()) return;

  posthog.reset();
}

/**
 * Track custom event
 * @param eventName - Custom event name
 * @param properties - Event properties
 */
export function trackCustomEvent(eventName: string, properties?: Record<string, any>): void {
  if (!isPostHogAvailable()) return;

  posthog.capture(eventName, {
    ...getCommonProperties(),
    ...properties,
  });
}
