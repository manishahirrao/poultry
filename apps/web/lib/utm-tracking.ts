// FlockIQ — UTM Parameter Capture Utility
// File: apps/web/lib/utm-tracking.ts
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-023
// Requirement Refs: CW-002 §CW-2.2

/**
 * Capture UTM parameters from URL and store in sessionStorage
 * This should be called on first page load to capture attribution
 */
export function captureUTMParameters(): void {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  
  const utmParams = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_term: urlParams.get('utm_term'),
    utm_content: urlParams.get('utm_content'),
  };

  // Only store if at least one UTM parameter is present
  const hasUTMParams = Object.values(utmParams).some(param => param !== null);

  if (hasUTMParams) {
    // Store in sessionStorage (persists for the session)
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        sessionStorage.setItem(key, value);
      }
    });
  }
}

/**
 * Get stored UTM parameters from sessionStorage
 */
export function getStoredUTMParams(): Record<string, string | undefined> {
  if (typeof window === 'undefined') return {};

  return {
    utm_source: sessionStorage.getItem('utm_source') || undefined,
    utm_medium: sessionStorage.getItem('utm_medium') || undefined,
    utm_campaign: sessionStorage.getItem('utm_campaign') || undefined,
    utm_term: sessionStorage.getItem('utm_term') || undefined,
    utm_content: sessionStorage.getItem('utm_content') || undefined,
  };
}

/**
 * Clear UTM parameters from sessionStorage
 * Call this after conversion to prevent double attribution
 */
export function clearUTMParams(): void {
  if (typeof window === 'undefined') return;

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  utmKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });
}

/**
 * Generate WhatsApp link with UTM parameters
 * @param phoneNumber - WhatsApp phone number
 * @param message - Pre-filled message
 * @param campaign - Campaign name
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  message: string,
  campaign?: string
): string {
  const baseUrl = `https://wa.me/${phoneNumber}`;
  const encodedMessage = encodeURIComponent(message);
  
  const utmParams = new URLSearchParams({
    utm_source: 'whatsapp',
    utm_medium: 'farmer_group',
    utm_campaign: campaign || 'direct',
  });

  return `${baseUrl}?text=${encodedMessage}&${utmParams.toString()}`;
}
