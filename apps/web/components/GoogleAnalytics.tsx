'use client';

import { useEffect } from 'react';

export default function GoogleAnalytics() {
  useEffect(() => {
    const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    
    if (!measurementId) {
      console.warn('GA4 Measurement ID not configured. Set NEXT_PUBLIC_GA4_MEASUREMENT_ID in .env.local');
      return;
    }

    // Load gtag.js
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true, // Privacy compliance
      cookie_flags: 'secure;samesite=none',
      send_page_view: false, // We'll handle page views manually
    });

    return () => {
      // Cleanup script on unmount
      document.head.removeChild(script);
    };
  }, []);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
