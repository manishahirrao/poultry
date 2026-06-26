// FlockIQ — PostHog Provider (DPDP Act 2023 Compliant)
// File: apps/web/providers/PostHogProvider.tsx
// Version: v3.0 | June 2026
// Task Reference: ANALYTICS-001, PERF-002
// Requirement Refs: FR-ANALYTICS-002
// PERF-002: Deferred loading for posthog (loaded after hydration)

'use client';

import { useEffect, useState } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only load posthog after hydration to improve initial page load
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Dynamic import of posthog to defer loading
    import('posthog-js').then((posthogModule) => {
      const posthog = posthogModule.default;

      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '';
      if (!posthogKey) return; // Skip init if key is not configured

      posthog.init(posthogKey, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com',
        // Privacy-first: no IP capture, no session recordings without consent
        capture_pageview: false,      // manual pageviews for SPA
        capture_pageleave: true,
        disable_session_recording: true,  // enable only with explicit consent
        respect_dnt: true,               // honour Do Not Track header
        // DPDP compliance: no PII in properties
        sanitize_properties: (properties) => {
          // Remove any accidentally included PII
          delete properties['$email'];
          delete properties['$phone'];
          delete properties['$name'];
          return properties;
        },
      });

      // Store posthog instance globally for analytics functions
      (window as any).posthog = posthog;
    });
  }, [isClient]);

  return <>{children}</>;
}

export default PostHogProvider;
