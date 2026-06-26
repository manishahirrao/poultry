// FlockIQ — Page View Tracker Component
// File: apps/web/app/(marketing)/solutions/components/PageViewTracker.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-013

'use client';

import { useEffect } from 'react';

interface PageViewTrackerProps {
  segment: 'integrators' | 'feed-companies' | 'enterprise';
}

export default function PageViewTracker({ segment }: PageViewTrackerProps) {
  useEffect(() => {
    // PostHog event tracking
    try {
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('page_viewed', {
          page: 'solutions',
          segment: segment,
        });
      }
    } catch (error) {
      console.error('PostHog tracking error:', error);
    }
  }, [segment]);

  return null;
}
