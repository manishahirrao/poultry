// FlockIQ — Sentry Server Configuration
// File: apps/web/sentry.server.config.ts
// Task Reference: TASK-WEB-027
// Requirement: Sentry error monitoring for marketing site (server-side)

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  
  // Sample rate for errors (100% in production)
  sampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0.1,
  
  // Sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.0,
  
  // Server-side integrations
  integrations: [
    // Add server-specific integrations if needed
  ],
  
  // Before send callback for error filtering
  beforeSend(event: any, hint: any) {
    // Filter out specific errors if needed
    if (event.exception) {
      const error = hint.originalException;
      // Filter out expected errors
      if (error instanceof Error) {
        // Filter out specific error messages
        const ignoredMessages = [
          'Non-Error exception',
          'ResizeObserver loop limit exceeded',
        ];
        if (ignoredMessages.some(msg => error.message.includes(msg))) {
          return null;
        }
      }
    }
    return event;
  },
  
  // Filter out unnecessary breadcrumbs
  beforeBreadcrumb(breadcrumb: any, hint?: any) {
    // Filter out certain breadcrumbs
    if (breadcrumb.category === 'http') {
      // Filter out health check endpoints
      if (breadcrumb.data?.url?.includes('/health')) {
        return null;
      }
    }
    return breadcrumb;
  },
  
  // Attach stack traces to all messages
  attachStacktrace: true,
  
  // Set maximum breadcrumbs
  maxBreadcrumbs: 50,
});
