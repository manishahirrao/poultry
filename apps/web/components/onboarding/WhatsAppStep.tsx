'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WhatsAppStepProps {
  onNext: (data: { whatsappVerified: boolean; whatsappLanguage?: 'en' | 'hi' }) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData?: { whatsappVerified?: boolean; whatsappLanguage?: 'en' | 'hi' };
}

export function WhatsAppStep({ onNext, onBack, onSkip, initialData }: WhatsAppStepProps) {
  const [isVerified, setIsVerified] = useState(initialData?.whatsappVerified || false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [whatsappLanguage, setWhatsAppLanguage] = useState<'en' | 'hi'>(initialData?.whatsappLanguage || 'en');

  const handleSendTestMessage = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/onboarding/whatsapp-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: whatsappLanguage }),
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessageSent(true);
      setIsVerified(true);
      
      // Auto-advance to Step 4 after 2 seconds
      setTimeout(() => {
        onNext({ whatsappVerified: true, whatsappLanguage });
      }, 2000);
    } catch (error) {
      console.error('Failed to send test message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    onNext({ whatsappVerified: isVerified, whatsappLanguage });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-neutral-600 text-sm hover:text-neutral-900 transition-colors"
      >
        ← Back
      </button>

      {/* Headline */}
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center font-space-grotesk">
        Set up WhatsApp alerts
      </h1>
      <p className="text-neutral-600 text-center">
        We send your daily price signal at 6:30 AM — save our number to receive it
      </p>

      {/* Language Selector */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-neutral-700">
          Receive messages in:
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWhatsAppLanguage('en')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
              whatsappLanguage === 'en'
                ? 'border-brand-700 bg-brand-50 text-brand-700'
                : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setWhatsAppLanguage('hi')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
              whatsappLanguage === 'hi'
                ? 'border-brand-700 bg-brand-50 text-brand-700'
                : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Contact Save Section */}
      <div className="rounded-xl p-6 text-center space-y-4 bg-brand-50">
        <p className="text-sm text-neutral-700">Save FlockIQ's number:</p>
        <div className="bg-white rounded-lg p-4 border-2 border-brand-400">
          <p className="text-2xl font-bold font-space-grotesk text-brand-700">+91-XXXXXXXXXX</p>
        </div>
        <button className="font-semibold hover:underline text-sm text-brand-700">
          Save Contact
        </button>
      </div>

      {/* Test Message Section */}
      <div className="space-y-3">
        {!messageSent ? (
          <button
            onClick={handleSendTestMessage}
            disabled={isLoading}
            className="w-full min-h-[52px] py-4 bg-brand-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending test message...
              </>
            ) : (
              'Send me a test message →'
            )}
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Message sent! Check WhatsApp ✓</span>
            </div>
            <p className="text-xs text-green-600 mt-2">Moving to next step...</p>
          </motion.div>
        )}
      </div>

      {/* Troubleshooting Accordion */}
      <div className="space-y-2">
        <button
          onClick={() => setShowTroubleshoot(!showTroubleshoot)}
          className="w-full text-left text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showTroubleshoot ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Didn't receive a message?
        </button>
        {showTroubleshoot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm text-neutral-600"
          >
            <p>• Make sure +91-XXXXXXXXXX is saved in your contacts</p>
            <p>• Check WhatsApp → Settings → Privacy — is "Message from unknown numbers" blocked?</p>
            <p>• You can skip this now and verify later</p>
          </motion.div>
        )}
      </div>

      {/* Skip Link */}
      <button
        onClick={onSkip}
        className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700"
      >
        I'll verify later →
      </button>

      {/* CTA */}
      {!messageSent && (
        <button
          onClick={handleNext}
          className="w-full min-h-[52px] py-4 bg-brand-700 text-white font-semibold rounded-xl transition-all duration-200 hover:bg-brand-600"
        >
          Continue →
        </button>
      )}
    </motion.div>
  );
}
