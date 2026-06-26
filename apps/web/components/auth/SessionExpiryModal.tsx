'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionExpiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl?: string;
}

export function SessionExpiryModal({ isOpen, onClose, currentUrl }: SessionExpiryModalProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Handle escape key to close modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    setShowBanner(true);
  };

  const handleLogin = () => {
    const redirectUrl = currentUrl || window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const loginUrl = currentUrl 
    ? `/login?redirect=${encodeURIComponent(currentUrl)}`
    : '/login';

  return (
    <>
      {/* Modal */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <div>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
                {/* ThinkingPullu Illustration Placeholder */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 bg-brandGreen-100 rounded-full flex items-center justify-center"
                  >
                    <span className="text-5xl">🐔</span>
                  </motion.div>
                </div>

                {/* Headline */}
                <h2 className="text-2xl font-bold text-neutral-900 text-center mb-2 font-space-grotesk">
                  Session expire हो गया
                </h2>
                <p className="text-neutral-600 text-center mb-6">
                  सुरक्षा के लिए आपका session समाप्त हो गया है। दोबारा login करें और जहाँ छोड़ा था वहाँ से जारी रखें।
                </p>

                {/* CTAs */}
                <div className="space-y-3">
                  <button
                    onClick={handleLogin}
                    className="w-full h-[52px] bg-brandGreen-700 text-white font-semibold rounded-xl hover:bg-brandGreen-600 transition-all duration-200"
                  >
                    Login करें →
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full h-[52px] bg-white text-neutral-700 font-semibold rounded-xl border-2 border-neutral-200 hover:bg-neutral-50 transition-all duration-200"
                  >
                    बाद में जारी रखें
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sticky Banner (shown after modal is closed) */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 z-40"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-amber-800">
                  Session expire हो गया — कुछ features काम नहीं करेंगे
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={loginUrl}
                  className="text-sm font-semibold text-amber-700 hover:underline"
                >
                  Login करें →
                </a>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-amber-600 hover:text-amber-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
