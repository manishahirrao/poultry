'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePopup } from '@/providers/PopupProvider';
import { X } from '@phosphor-icons/react';
import { trackEvent } from '@/lib/analytics';

export default function ExitIntentPopup() {
  const { activePopup, closePopup, isPopupOpen, canShowPopup } = usePopup();
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [hasShownEvent, setHasShownEvent] = useState(false);
  const [formData, setFormData] = useState({ phone: '', consent: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Check if this is a marketing page (not dashboard, auth, etc.)
    if (typeof window === 'undefined') return;
    
    const pathname = window.location.pathname;
    const isMarketingPage = pathname === '/' || pathname === '/hi' || pathname.startsWith('/blog') || pathname.startsWith('/districts');
    if (!isMarketingPage) {
      return;
    }

    // Check if user already converted
    const alreadyConverted = localStorage.getItem('trial_started') || localStorage.getItem('on_waitlist');
    if (alreadyConverted) {
      return;
    }

    // Check cooldown from PopupProvider (15 minutes)
    if (!canShowPopup('exit_intent')) {
      return;
    }

    // Check if mobile - use alternative trigger for mobile
    const isMobile = window.innerWidth < 768;

    // Check localStorage for 7-day cooldown
    const lastShown = localStorage.getItem('exit_intent_last_shown');
    if (lastShown) {
      const daysSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < 7) {
        return;
      }
    }

    // Check sessionStorage for session-based frequency capping
    const sessionShown = sessionStorage.getItem('exit_intent_session_shown');
    if (sessionShown) {
      return;
    }

    // 30-second delay before activating trigger
    timeoutRef.current = setTimeout(() => {
      if (isMobile) {
        // Mobile: trigger on scroll up (indicating intent to leave)
        let lastScrollTop = 0;
        const handleScroll = () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          if (scrollTop < lastScrollTop && scrollTop < 100 && !hasTriggered) {
            setHasTriggered(true);
            setIsVisible(true);
            trackEvent('exit_popup_shown');
            sessionStorage.setItem('exit_intent_session_shown', 'true');
            localStorage.setItem('exit_intent_last_shown', Date.now().toString());
          }
          lastScrollTop = scrollTop;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      } else {
        // Desktop: trigger on mouseleave towards top
        const handleMouseLeave = (e: MouseEvent) => {
          if (e.clientY <= 0 && !hasTriggered) {
            setHasTriggered(true);
            setIsVisible(true);
            trackEvent('exit_popup_shown');
            sessionStorage.setItem('exit_intent_session_shown', 'true');
            localStorage.setItem('exit_intent_last_shown', Date.now().toString());
          }
        };
        document.documentElement.addEventListener('mouseleave', handleMouseLeave);
        return () => document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    }, 30000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasTriggered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Phone validation - Indian mobile number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('कृपया सही मोबाइल नंबर दर्ज करें');
      return;
    }

    if (!formData.consent) {
      setError('सहमति आवश्यक है');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          source: 'exit_intent',
          consent_given: formData.consent,
          utm: {
            source: sessionStorage.getItem('utm_source') || undefined,
            medium: sessionStorage.getItem('utm_medium') || undefined,
            campaign: sessionStorage.getItem('utm_campaign') || undefined,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitSuccess(true);
      
      // Track analytics event
      trackEvent('exit_popup_converted', {
        phone: formData.phone,
        source: 'exit_intent',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    closePopup();
  };

  const handleDecline = () => {
    setIsVisible(false);
    closePopup();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-[520px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-3 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={24} className="text-gray-500" />
            </button>

            <div className="p-6 md:p-8">
              {!submitSuccess ? (
                <>
                  {/* Headline */}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    रुकिए! पहला signal FREE पाएं
                  </h2>
                  <p className="text-gray-600 mb-6">
                    बस WhatsApp number दें — कल सुबह 6:30 AM को Gorakhpur का भाव मिलेगा
                  </p>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        WhatsApp Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          +91
                        </span>
                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="9876543210"
                          maxLength={10}
                          className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* DPDP Consent Checkbox */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                        className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        required
                      />
                      <label htmlFor="consent" className="text-sm text-gray-600">
                        मैं सहमत हूँ कि मेरा नंबर सिर्फ price alerts के लिए उपयोग किया जाएगा। 
                        DPDP Act 2023 के अनुसार।
                      </label>
                    </div>

                    {error && (
                      <p className="text-red-600 text-sm">{error}</p>
                    )}

                    {/* CTA Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'जमा हो रहा है...' : 'एक दिन का FREE signal →'}
                    </button>

                    {/* Decline */}
                    <button
                      type="button"
                      onClick={handleDecline}
                      className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
                    >
                      नहीं, मुझे daily price नहीं चाहिए
                    </button>
                  </form>
                </>
              ) : (
                /* Success State */
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    धन्यवाद!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    कल सुबह 6:30 AM को आपके WhatsApp पर Gorakhpur का भाव भेजा जाएगा।
                  </p>
                  <button
                    onClick={handleClose}
                    className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-8 rounded-xl transition-all"
                  >
                    बंद करें
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
