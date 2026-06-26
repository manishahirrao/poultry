'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PlanConfirmStepProps {
  onNext: (data: { planConfirmed: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL' }) => void;
  onBack: () => void;
  recommendedPlan: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL';
  initialData?: { planConfirmed?: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL' };
}

export function PlanConfirmStep({ onNext, onBack, recommendedPlan, initialData }: PlanConfirmStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL'>(
    initialData?.planConfirmed || recommendedPlan === 'PULSE_INTEL' ? 'PULSE_PRO' : recommendedPlan
  );

  const handleNext = () => {
    if (selectedPlan) {
      onNext({ planConfirmed: selectedPlan });
    }
  };

  const handleDowngrade = () => {
    setSelectedPlan('PULSE_FARM');
  };

  const plan = selectedPlan === 'PULSE_FARM' ? {
    name: 'PulseFarm',
    price: '₹2,000/month',
    trial: '14 days free',
    features: [
      'Daily WhatsApp sell signal (6:30 AM)',
      '7-day price forecast (P10/P50/P90)',
      'Gorakhpur belt mandi coverage',
      'HPAI disease alerts',
      'Hindi-first mobile app',
    ],
    afterTrial: 'After 14 days: ₹2,000/month — cancel anytime',
  } : selectedPlan === 'PULSE_INTEL' ? {
    name: 'PulseIntel',
    price: '₹25,000/month',
    trial: '14 days free',
    features: [
      'All PulsePro features',
      'Enterprise integrator dashboard',
      'Custom API access',
      'Dedicated account manager',
      'White-label options',
    ],
    afterTrial: 'After 14 days: ₹25,000/month — cancel anytime',
  } : {
    name: 'PulsePro',
    price: '₹5,000/month',
    trial: '14 days free',
    features: [
      'All PulseFarm features',
      'Multi-farm command centre',
      'Revenue forecasting',
      'Integrator analytics',
      'Priority support',
    ],
    afterTrial: 'After 14 days: ₹5,000/month — cancel anytime',
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
        Your plan
      </h1>
      <p className="text-neutral-600 text-center">
        14 days completely free — no credit card, no commitment
      </p>

      {/* Plan Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white rounded-2xl border-2 border-brandGreen-200 p-6 shadow-lg"
      >
        {/* Plan Name */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-900 font-space-grotesk">{plan.name}</h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-50 text-brand-700">
            {plan.trial}
          </span>
        </div>

        {/* Price */}
        <div className="mb-6">
          <p className="text-3xl font-bold text-neutral-900 font-space-grotesk">{plan.price}</p>
          {selectedPlan === 'PULSE_FARM' && (
            <p className="text-sm text-neutral-500 mt-1">₹67/day — less than your daily chai</p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-neutral-700">{feature}</span>
            </li>
          ))}
        </ul>

        {/* After Trial */}
        <p className="text-xs text-neutral-500 border-t pt-4">
          {plan.afterTrial}
        </p>
      </motion.div>

      {/* Reassurance Text - No Plan Lock Warning */}
      <motion.div
        role="alert"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl p-4 bg-brand-50"
      >
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-brand-700">You can switch plans anytime in Settings</p>
            <p className="text-xs mt-1 text-neutral-800">
              Start with any plan — upgrade or downgrade whenever you need. No lock-in.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Downgrade Option */}
      {recommendedPlan === 'PULSE_PRO' && selectedPlan === 'PULSE_PRO' && (
        <button
          onClick={handleDowngrade}
          className="w-full text-center text-sm text-brand-700 hover:underline"
        >
          ← Want to start with PulseFarm?
        </button>
      )}

      {/* CTA */}
      <button
        onClick={handleNext}
        className="w-full min-h-[52px] py-4 bg-brand-700 text-white font-semibold rounded-xl transition-all duration-200 hover:bg-brand-600"
      >
        Start 14-Day Free Trial →
      </button>
      <p className="text-center text-xs text-neutral-500">
        No payment needed now — we'll remind you before the trial ends
      </p>
    </motion.div>
  );
}
