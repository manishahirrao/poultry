'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FlockSizeStepProps {
  onNext: (data: { flockRange: string; batchesPerYear?: 2 | 3 | 4 }) => void;
  onBack: () => void;
  initialData?: { flockRange?: string; batchesPerYear?: 2 | 3 | 4 };
}

const FLOCK_OPTIONS = [
  { id: '10k-25k', label: '10,000 – 25,000 पंछी', segment: 'S1' },
  { id: '25k-50k', label: '25,000 – 50,000 पंछी', segment: 'S1' },
  { id: '50k-1l', label: '50,000 – 1 लाख पंछी', segment: 'S2' },
  { id: '1l-5l', label: '1 लाख – 5 लाख पंछी', segment: 'S2' },
  { id: '5l+', label: '5 लाख+ पंछी (Integrator)', segment: 'S2' },
];

const BATCH_OPTIONS = [
  { value: 2 as const, label: '2' },
  { value: 3 as const, label: '3' },
  { value: 4 as const, label: '4' },
];

export function FlockSizeStep({ onNext, onBack, initialData }: FlockSizeStepProps) {
  const [selectedFlock, setSelectedFlock] = useState<string | null>(
    initialData?.flockRange || null
  );
  const [selectedBatches, setSelectedBatches] = useState<2 | 3 | 4>(
    initialData?.batchesPerYear || 3
  );

  const handleNext = () => {
    if (selectedFlock) {
      onNext({ flockRange: selectedFlock, batchesPerYear: selectedBatches });
    }
  };

  const recommendedPlan = selectedFlock
    ? FLOCK_OPTIONS.find((opt) => opt.id === selectedFlock)?.segment === 'S2'
      ? 'PulsePro'
      : 'PulseFarm'
    : null;

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
        आपके farm में कितने पंछी हैं?
      </h1>
      <p className="text-neutral-600 text-center">
        अनुमान ठीक है — exact count ज़रूरी नहीं
      </p>

      {/* Flock Size Options */}
      <div className="space-y-3">
        {FLOCK_OPTIONS.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => setSelectedFlock(option.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`
              w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${selectedFlock === option.id
                ? 'border-brandGreen-700 bg-brandGreen-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
              }
            `}
          >
            <p className="font-semibold text-neutral-900">{option.label}</p>
            {option.segment === 'S2' && (
              <p className="text-xs text-brandGreen-600 mt-1">
                {option.id === '5l+' ? 'PulsePro / PulseIntel' : 'PulsePro recommend है'}
              </p>
            )}
          </motion.button>
        ))}
      </div>

      {/* Plan Recommendation Banner */}
      {recommendedPlan === 'PulsePro' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <p className="text-sm text-amber-800">
            आपके farm के लिए <span className="font-semibold">PulsePro</span> recommend है →
          </p>
          <p className="text-xs text-amber-700 mt-1">
            अभी PulseFarm से शुरू कर सकते हैं, बाद में upgrade होगा
          </p>
        </motion.div>
      )}

      {/* Batches Per Year */}
      {selectedFlock && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm text-neutral-600 text-center">
            साल में कितने batch?
          </p>
          <div className="flex gap-2">
            {BATCH_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedBatches(option.value)}
                className={`
                  flex-1 min-h-[52px] py-4 rounded-xl border-2 font-semibold transition-all duration-200
                  ${selectedBatches === option.value
                    ? 'border-brandGreen-700 bg-brandGreen-50 text-brandGreen-700'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <button
        onClick={handleNext}
        disabled={!selectedFlock}
        className="w-full min-h-[52px] py-4 bg-brandGreen-700 text-white font-semibold rounded-xl hover:bg-brandGreen-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        आगे →
      </button>
    </motion.div>
  );
}
