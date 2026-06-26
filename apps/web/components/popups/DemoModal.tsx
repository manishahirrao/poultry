'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePopup } from '@/providers/PopupProvider';
import { X } from '@phosphor-icons/react';
import { trackEvent } from '@/lib/analytics';

interface DemoFormData {
  name: string;
  phone: string;
  district: string;
  flockSize: string;
  preferredTime: string;
  consent: boolean;
}

export default function DemoModal() {
  const { activePopup, closePopup, isPopupOpen, canShowPopup } = usePopup();
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [formData, setFormData] = useState<DemoFormData>({
    name: '',
    phone: '',
    district: '',
    flockSize: '',
    preferredTime: '',
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const isOpen = isPopupOpen('demo_modal');

  // Check cooldown before allowing the modal to open
  useEffect(() => {
    if (isOpen && !canShowPopup('demo_modal')) {
      closePopup();
    }
  }, [isOpen, canShowPopup, closePopup]);

  // Focus trap implementation + analytics
  useEffect(() => {
    if (isOpen) {
      // Track analytics event
      trackEvent('demo_modal_open');
      
      // Store trigger element
      triggerRef.current = document.activeElement as HTMLElement;
      
      // Focus first input
      const firstInput = modalRef.current?.querySelector('input') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }

      // Trap focus within modal
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        
        const modal = modalRef.current;
        if (!modal) return;
        
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleTab);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleTab);
        document.removeEventListener('keydown', handleEscape);
        // Return focus to trigger
        triggerRef.current?.focus();
      };
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Phone validation - Indian mobile number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('कृपया सही मोबाइल नंबर दर्ज करें');
      return;
    }

    if (!formData.name.trim()) {
      setError('नाम आवश्यक है');
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
      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          district: formData.district,
          flock_size: formData.flockSize,
          preferred_time: formData.preferredTime,
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
      trackEvent('lead_submitted', {
        source: 'demo_modal',
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
    closePopup();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-[640px] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-3 hover:bg-gray-100 rounded-full transition-colors z-10"
              aria-label="Close modal"
            >
              <X size={24} className="text-gray-500" />
            </button>

            <div className="p-6 md:p-8">
              {!submitSuccess ? (
                <>
                  {/* Header */}
                  <div className="mb-6">
                    <h2 id="demo-modal-title" className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      Live Demo बुक करें
                    </h2>
                    <p className="text-gray-600">
                      हमारी टीम 15 मिनट में दिखाएगी कैसे काम करता है — आपके farm के data से
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        नाम (Name) *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="आपका नाम"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        WhatsApp Number *
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
                        जिला (District) *
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
                      </select>
                    </div>

                    {/* Flock Size */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        झुंड का आकार (Flock Size) *
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

                    {/* Preferred Time */}
                    <div>
                      <label htmlFor="preferredTime" className="block text-sm font-semibold text-gray-700 mb-2">
                        पसंदीदा समय (Preferred Time)
                      </label>
                      <input
                        type="datetime-local"
                        id="preferredTime"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      />
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
                      {isSubmitting ? 'जमा हो रहा है...' : 'Demo कॉल बुक करें'}
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
                    हमारी टीम जल्द ही आपसे संपर्क करेगी और demo schedule करेगी।
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
