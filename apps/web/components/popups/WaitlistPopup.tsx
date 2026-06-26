'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePopup } from '@/providers/PopupProvider';
import { X } from '@phosphor-icons/react';
import { trackEvent } from '@/lib/analytics';

export default function WaitlistPopup() {
  const { activePopup, closePopup, isPopupOpen, canShowPopup } = usePopup();
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [formData, setFormData] = useState({ phone: '', district: '', flockSize: '', consent: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const isOpen = isPopupOpen('waitlist');

  useEffect(() => {
    // Check if user is already on waitlist (check localStorage)
    const onWaitlist = localStorage.getItem('on_waitlist');
    if (onWaitlist) {
      return;
    }

    // Check cooldown from PopupProvider (15 minutes)
    if (!canShowPopup('waitlist')) {
      return;
    }

    // Check localStorage for 14-day cooldown
    const lastShown = localStorage.getItem('waitlist_last_shown');
    if (lastShown) {
      const daysSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < 14) {
        return;
      }
    }

    // Check sessionStorage for session-based frequency capping
    const sessionShown = sessionStorage.getItem('waitlist_session_shown');
    if (sessionShown) {
      return;
    }

    // 45-second delay before showing waitlist popup
    timeoutRef.current = setTimeout(() => {
      if (!hasTriggered) {
        setHasTriggered(true);
        setIsVisible(true);
        
        // Track analytics event
        trackEvent('waitlist_popup_shown');
        
        // Store in sessionStorage and localStorage
        sessionStorage.setItem('waitlist_session_shown', 'true');
        localStorage.setItem('waitlist_last_shown', Date.now().toString());
      }
    }, 45000);

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

    if (!formData.district) {
      setError('जिला चुनें');
      return;
    }

    if (!formData.flockSize) {
      setError('झुंड का आकार चुनें');
      return;
    }

    if (!formData.consent) {
      setError('सहमति आवश्यक है');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          district: formData.district,
          flock_size: formData.flockSize,
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
      
      // Mark user as on waitlist
      localStorage.setItem('on_waitlist', 'true');
      
      // Track analytics event
      trackEvent('waitlist_popup_converted', {
        phone: formData.phone,
        district: formData.district,
        flock_size: formData.flockSize,
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
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      Pre-Launch Access
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      Join 200+ farms on waitlist
                    </h2>
                    <p className="text-gray-600">
                      Be first to get 7-day price predictions when we launch in your district
                    </p>
                  </div>

                  {/* Social proof */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex -space-x-2">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">200+ farms</span> already waiting
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj
                    </p>
                  </div>

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

                    {/* District */}
                    <div>
                      <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                        जिला (District)
                      </label>
                      <select
                        id="district"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                        required
                      >
                        <option value="">जिला चुनें</option>
                        <option value="gorakhpur">गोरखपुर (Gorakhpur)</option>
                        <option value="deoria">देवरिया (Deoria)</option>
                        <option value="kushinagar">कुशीनगर (Kushinagar)</option>
                        <option value="basti">बस्ती (Basti)</option>
                        <option value="maharajganj">महाराजगंज (Maharajganj)</option>
                        <option value="other">अन्य (Other)</option>
                      </select>
                    </div>

                    {/* Flock Size */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        झुंड का आकार (Flock Size)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: '10k-25k', label: '10K-25K' },
                          { value: '25k-50k', label: '25K-50K' },
                          { value: '50k-1l', label: '50K-1L' },
                          { value: '1l+', label: '1L+' },
                        ].map((size) => (
                          <button
                            key={size.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, flockSize: size.value })}
                            className={`py-3 px-4 rounded-xl border-2 transition-all ${
                              formData.flockSize === size.value
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {size.label}
                          </button>
                        ))}
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
                        मैं सहमत हूँ कि मेरा नंबर सिर्फ launch updates के लिए उपयोग किया जाएगा। 
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
                      {isSubmitting ? 'जमा हो रहा है...' : 'Join Waitlist →'}
                    </button>

                    {/* Decline */}
                    <button
                      type="button"
                      onClick={handleDecline}
                      className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
                    >
                      नहीं, मुझे waitlist में नहीं जाना
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
                    You're on the list!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We'll notify you when FlockIQ launches in your district. Early access guaranteed.
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
