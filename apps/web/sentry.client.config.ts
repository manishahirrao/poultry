// FlockIQ — Sentry Client Configuration
// File: apps/web/sentry.client.config.ts
// Task Reference: TASK-WEB-027
// Requirement: Sentry error monitoring for marketing site

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
  
  // Sample rate for session replay
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Before send callback for error filtering
  beforeSend(event: any, hint: any) {
    // Filter out specific errors if needed
    if (event.exception) {
      const error = hint.originalException;
      // Example: Filter out specific error types
      if (error instanceof Error && error.message.includes('Non-Error exception')) {
        return null;
      }
    }
    return event;
  },
  
  // Filter out unnecessary breadcrumbs
  beforeBreadcrumb(breadcrumb: any, hint?: any) {
    // Filter out certain breadcrumbs if needed
    if (breadcrumb.category === 'console') {
      return null;
    }
    return breadcrumb;
  },
  
  // Performance monitoring
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.0,
  
  // Attach stack traces to all messages
  attachStacktrace: true,
});
