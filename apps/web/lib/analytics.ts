// FlockIQ — Analytics Event Tracker (PostHog)
// File: apps/web/lib/analytics.ts
// Version: v3.0 | June 2026
// Task Reference: ANALYTICS-001
// Requirement Refs: FR-ANALYTICS-001, FR-ANALYTICS-002

import posthog from 'posthog-js';

type EventName =
  | 'hero_cta_click' | 'hero_demo_click'
  | 'nav_trial_click' | 'nav_click'
  | 'pricing_tab_toggle' | 'plan_cta_click'
  | 'whatsapp_feature_cta_click'
  | 'signup_step1_complete' | 'signup_step2_complete'
  | 'signup_step3_complete' | 'signup_complete'
  | 'login_success'
  | 'announcement_bar_click'
  | 'faq_item_open'
  | 'referral_link_generated'
  | 'loss_calculator_interact'
  | 'exit_intent_shown' | 'exit_intent_submit'
  | 'announcement_banner_clicked'
  | 'exit_popup_shown' | 'exit_popup_converted'
  | 'demo_modal_open' | 'lead_submitted'
  | 'free_trial_popup_shown' | 'free_trial_popup_converted'
  | 'waitlist_popup_shown' | 'waitlist_popup_converted'
  | 'blog_post_view' | 'blog_post_read_complete' | 'blog_cta_click' | 'blog_share_click' | 'blog_category_filter' | 'blog_search'
  | 'onboarding_step_completed'
  | (string & {});

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export function track(event: EventName, properties?: EventProperties) {
  if (typeof window === 'undefined') return;
  posthog.capture(event, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
}

// Backward compatibility alias for existing code
export const trackEvent = track;

// UTM passthrough helper
export function getUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const result: Record<string, string> = {};
  utmKeys.forEach((key) => {
    const val = params.get(key);
    if (val) result[key] = val;
  });
  return result;
}
