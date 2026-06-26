'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FarmTypeStepProps {
  onNext: (data: { farmType: 'independent' | 'integrator'; integratorName?: string }) => void;
  onBack: () => void;
  initialData?: { farmType?: 'independent' | 'integrator'; integratorName?: string };
}

export function FarmTypeStep({ onNext, onBack, initialData }: FarmTypeStepProps) {
  const [selectedType, setSelectedType] = useState<'independent' | 'integrator' | null>(
    initialData?.farmType || null
  );
  const [integratorName, setIntegratorName] = useState(initialData?.integratorName || '');

  const handleNext = () => {
    if (selectedType) {
      onNext({
        farmType: selectedType,
        integratorName: selectedType === 'integrator' ? integratorName : undefined,
      });
    }
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
        आपका farm किस तरह का है?
      </h1>
      <p className="text-neutral-600 text-center">
        यह आपके integrator analytics के लिए है
      </p>

      {/* Farm Type Options */}
      <div className="space-y-3">
        <motion.button
          onClick={() => setSelectedType('independent')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            w-full p-6 rounded-xl border-2 transition-all duration-200 text-left
            ${selectedType === 'independent'
              ? 'border-brandGreen-700 bg-brandGreen-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-brandGreen-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-brandGreen-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-neutral-900 text-lg">Independent Farm</p>
              <p className="text-sm text-neutral-600 mt-1">
                मैं अपना खुद का feed और स्वतंत्र रूप से बेचता हूँ
              </p>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={() => setSelectedType('integrator')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            w-full p-6 rounded-xl border-2 transition-all duration-200 text-left
            ${selectedType === 'integrator'
              ? 'border-brandGreen-700 bg-brandGreen-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-brandGreen-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-brandGreen-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-neutral-900 text-lg">Contract / Integrator Farm</p>
              <p className="text-sm text-neutral-600 mt-1">
                मैं एक company/integrator के contract पर काम करता हूँ
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                जैसे: Sugna, Venkateshwara, या local integrators
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Integrator Name Field */}
      {selectedType === 'integrator' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-sm text-neutral-600">Integrator का नाम (optional)</label>
          <input
            type="text"
            value={integratorName}
            onChange={(e) => setIntegratorName(e.target.value)}
            placeholder="जैसे: Sugna, Venkateshwara"
            className="w-full min-h-[52px] py-4 px-4 rounded-xl border-2 border-neutral-200 bg-white focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-500 outline-none"
          />
        </motion.div>
      )}

      {/* CTA */}
      <button
        onClick={handleNext}
        disabled={!selectedType}
        className="w-full min-h-[52px] py-4 bg-brandGreen-700 text-white font-semibold rounded-xl hover:bg-brandGreen-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        आगे →
      </button>
    </motion.div>
  );
}
