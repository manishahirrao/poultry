// FlockIQ — Cookie Consent Banner (DPDP Act 2023 Compliant)
// File: apps/web/components/analytics/CookieConsentBanner.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-023
// Requirement Refs: CW-002, CW-004

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COOKIE_CONSENT_KEY = 'pp_cookie_consent';
const CONSENT_ACCEPTED = 'accepted';
const CONSENT_DECLINED = 'declined';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDecided, setHasDecided] = useState(false);

  useEffect(() => {
    // Check if user has already made a decision
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay (non-intrusive)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setHasDecided(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, CONSENT_ACCEPTED);
    setIsVisible(false);
    setHasDecided(true);
    // Dispatch event to notify PostHog provider
    window.dispatchEvent(new CustomEvent('cookieConsentAccepted'));
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, CONSENT_DECLINED);
    setIsVisible(false);
    setHasDecided(true);
    // Dispatch event to notify PostHog provider
    window.dispatchEvent(new CustomEvent('cookieConsentDeclined'));
  };

  // Don't render if user has already decided
  if (hasDecided) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 px-4 py-3 md:px-6 md:py-4"
          role="dialog"
          aria-labelledby="cookie-consent-title"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p
              id="cookie-consent-title"
              className="text-sm text-neutral-300 text-center sm:text-left"
            >
              हम analytics के लिए cookies use करते हैं।
              <span className="hidden sm:inline ml-2 text-neutral-400">
                We use cookies for analytics to improve your experience.
              </span>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800"
                aria-label="Decline cookies"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-green-700 hover:bg-brand-green-800 transition-colors rounded-lg"
                aria-label="Accept cookies"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Utility function to check cookie consent status
export function getCookieConsent(): 'accepted' | 'declined' | null {
  if (typeof window === 'undefined') return null;
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (consent === CONSENT_ACCEPTED) return 'accepted';
  if (consent === CONSENT_DECLINED) return 'declined';
  return null;
}
