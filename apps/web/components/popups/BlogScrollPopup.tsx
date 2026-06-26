'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { trackEvent } from '@/lib/analytics';

export default function BlogScrollPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Check if this is a blog post page
    if (typeof window === 'undefined') return;
    
    const pathname = window.location.pathname;
    if (!pathname.match(/^\/blog\/[^/]+$/)) {
      return;
    }

    // Check cooldown from PopupProvider (15 minutes)
    const cooldownKey = 'popup_cooldown_blog_scroll';
    const lastClosed = localStorage.getItem(cooldownKey);
    if (lastClosed) {
      const minutesSinceClosed = (Date.now() - parseInt(lastClosed)) / (1000 * 60);
      if (minutesSinceClosed < 15) {
        return;
      }
    }

    // Check sessionStorage for dismissal
    const dismissed = sessionStorage.getItem('blog_scroll_popup_dismissed');
    if (dismissed) {
      return;
    }

    // Set up IntersectionObserver at 50% scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            setIsVisible(true);
            
            // Track analytics event
            trackEvent('exit_popup_shown', { source: 'blog_scroll' });
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px',
      }
    );

    // Find the article body element
    const articleBody = document.querySelector('article') || document.querySelector('[role="article"]');
    if (articleBody) {
      observer.observe(articleBody);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Phone validation - Indian mobile number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('कृपया सही मोबाइल नंबर दर्ज करें');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          source: 'blog_scroll',
          consent_given: true,
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
        source: 'blog_scroll',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('blog_scroll_popup_dismissed', 'true');
    // Store cooldown timestamp
    localStorage.setItem('popup_cooldown_blog_scroll', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <div>
          {/* Desktop: Bottom-right slide-in */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="hidden md:block fixed bottom-4 right-4 left-4 md:left-auto z-50 bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-3 hover:bg-gray-100 rounded-full transition-colors z-10"
              aria-label="Close"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="p-5">
              {!submitSuccess ? (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 pr-6">
                    ब्लॉग पढ़ने के लिए धन्यवाद!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Gorakhpur का daily भाव WhatsApp पर मुफ़्त पाएं
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-red-600 text-xs">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isSubmitting ? 'जमा हो रहा है...' : 'FREE signal पाएं →'}
                    </button>
                  </form>

                  <p className="text-xs text-gray-500 mt-3">
                    आपका नंबर सिर्फ price alerts के लिए
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-semibold mb-1">धन्यवाद!</p>
                  <p className="text-sm text-gray-600">
                    कल सुबह 6:30 AM को भाव भेजा जाएगा
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Mobile: Full-bottom sheet */}
          <motion.div
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 400 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="p-5 pb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    ब्लॉग पढ़ने के लिए धन्यवाद!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gorakhpur का daily भाव WhatsApp पर मुफ़्त पाएं
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {!submitSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'जमा हो रहा है...' : 'FREE signal पाएं →'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    आपका नंबर सिर्फ price alerts के लिए
                  </p>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg mb-2">धन्यवाद!</p>
                  <p className="text-gray-600">
                    कल सुबह 6:30 AM को भाव भेजा जाएगा
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
