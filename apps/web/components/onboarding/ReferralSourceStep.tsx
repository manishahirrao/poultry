'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ReferralSourceStepProps {
  onNext: (data: { referralSource?: string; referralCode?: string; trialExtended?: boolean }) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData?: { referralSource?: string; referralCode?: string };
  onValid?: (data: any) => void;
}

const REFERRAL_OPTIONS = [
  { id: 'farmer_friend', icon: '🌾', label: 'किसी किसान दोस्त से', hasCodeField: true },
  { id: 'whatsapp_group', icon: '📱', label: 'WhatsApp group / Forward से', hasCodeField: false },
  { id: 'google_search', icon: '🔍', label: 'Google / MagnifyingGlass से', hasCodeField: false },
  { id: 'youtube_social', icon: '📺', label: 'YouTube / Social Media से', hasCodeField: false },
  { id: 'newspaper', icon: '🗞️', label: 'Newspaper / Magazine से', hasCodeField: false },
  { id: 'feed_dealer', icon: '🏪', label: 'Feed dealer / Vet से', hasCodeField: false },
  { id: 'team_call', icon: '📞', label: 'FlockIQ team call', hasCodeField: false },
  { id: 'dont_remember', icon: '🤔', label: 'याद नहीं', hasCodeField: false },
];

export function ReferralSourceStep({ onNext, onBack, onSkip, initialData, onValid }: ReferralSourceStepProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(initialData?.referralSource || null);
  const [referralCode, setReferralCode] = useState(initialData?.referralCode || '');
  const [isValidating, setIsValidating] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const [trialExtended, setTrialExtended] = useState(false);
  const [error, setError] = useState('');

  const selectedOption = REFERRAL_OPTIONS.find((opt) => opt.id === selectedSource);

  const handleValidateCode = async () => {
    if (!referralCode.trim()) return;

    setIsValidating(true);
    try {
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralCode }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setCodeValid(true);
        setTrialExtended(true);
        onValid?.(data);
      } else {
        setError(data.error || 'Invalid referral code');
        setCodeValid(false);
      }
    } catch (error) {
      console.error('Failed to validate referral code:', error);
      setCodeValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = () => {
    onNext({
      referralSource: selectedSource || undefined,
      referralCode: selectedOption?.hasCodeField ? referralCode : undefined,
      trialExtended: trialExtended,
    });
  };

  const handleSkip = () => {
    onNext({});
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
        ← पिछला
      </button>

      {/* Headline */}
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center font-space-grotesk">
        हमारे बारे में कैसे पता चला?
      </h1>
      <p className="text-neutral-600 text-center">
        यह जानकारी optional है — हमें बेहतर बनाने में मदद करती है
      </p>

      {/* Referral Options */}
      <div className="space-y-3">
        {REFERRAL_OPTIONS.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => setSelectedSource(option.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`
              w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${selectedSource === option.id
                ? 'border-brandGreen-700 bg-brandGreen-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{option.icon}</span>
              <span className="font-semibold text-neutral-900">{option.label}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Referral Code Field */}
      {selectedOption?.hasCodeField && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="text-sm text-neutral-600">Referral code डालें (optional)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => {
                setReferralCode(e.target.value.toUpperCase());
                setCodeValid(null);
              }}
              placeholder="जैसे: FARM500"
              className="flex-1 min-h-[52px] py-4 px-4 rounded-xl border-2 border-neutral-200 bg-white focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-500 outline-none uppercase"
            />
            <button
              onClick={handleValidateCode}
              disabled={!referralCode.trim() || isValidating}
              className="min-h-[52px] py-4 px-6 bg-brandGreen-700 text-white font-semibold rounded-xl hover:bg-brandGreen-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isValidating ? '...' : 'Validate'}
            </button>
          </div>
          
          {/* Validation Result */}
          {codeValid !== null && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                p-3 rounded-lg text-sm
                ${codeValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
              `}
            >
              {codeValid ? (
                <p>✓ code valid है — आपका trial 30 दिन का हो गया!</p>
              ) : (
                <p>✗ code invalid है — कृपया check करें</p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Skip Link */}
      <button
        onClick={handleSkip}
        className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700"
      >
        → Skip
      </button>

      {/* CTA */}
      <button
        onClick={handleNext}
        className="w-full min-h-[52px] py-4 bg-brandGreen-700 text-white font-semibold rounded-xl hover:bg-brandGreen-600 transition-all duration-200"
      >
        आगे →
      </button>
    </motion.div>
  );
}
