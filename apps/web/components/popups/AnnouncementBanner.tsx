'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { trackEvent } from '@/lib/analytics';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check cooldown from PopupProvider (15 minutes)
    const cooldownKey = 'popup_cooldown_announcement';
    const lastClosed = localStorage.getItem(cooldownKey);
    if (lastClosed) {
      const minutesSinceClosed = (Date.now() - parseInt(lastClosed)) / (1000 * 60);
      if (minutesSinceClosed < 15) {
        setIsDismissed(true);
        return;
      }
    }

    // Check if banner was dismissed in the last 7 days
    const lastDismissed = localStorage.getItem('announcement_banner_dismissed');
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
        return;
      }
    }

    // Show banner after a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('announcement_banner_dismissed', Date.now().toString());
    // Store cooldown timestamp
    localStorage.setItem('popup_cooldown_announcement', Date.now().toString());
  };

  const handleClick = () => {
    trackEvent('announcement_banner_clicked');
    // Scroll to trial section or open signup modal
    const trialSection = document.querySelector('[data-trial-section]');
    if (trialSection) {
      trialSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: open free trial popup
      window.dispatchEvent(new CustomEvent('open-free-trial-popup'));
    }
  };

  if (isDismissed || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="hidden sm:flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    <span className="hidden sm:inline">🚀 </span>
                    200+ farms already on waitlist — 14-day FREE trial now available for Gorakhpur belt
                  </p>
                </div>
                <button
                  onClick={handleClick}
                  className="ml-4 px-4 py-1.5 bg-white text-green-700 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors whitespace-nowrap"
                >
                  Start Free Trial
                </button>
              </div>
              <button
                onClick={handleDismiss}
                className="ml-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Dismiss announcement"
              >
                <X size={20} className="text-white/80 hover:text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
