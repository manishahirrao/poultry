'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreviewStepProps {
  onNext: () => void;
  onBack: () => void;
  district?: string;
}

export function PreviewStep({ onNext, onBack, district = 'Gorakhpur' }: PreviewStepProps) {
  const [showExplainer, setShowExplainer] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });

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
        ऐसा दिखेगा आपका daily signal
      </h1>
      <p className="text-neutral-600 text-center">
        कल सुबह 6:30 AM पर आपके WhatsApp पर यही आएगा
      </p>

      {/* Demo Signal Card */}
      <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-lg">
        {/* WhatsApp Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b">
          <div className="w-10 h-10 bg-brandGreen-100 rounded-full flex items-center justify-center">
            <span className="text-brandGreen-700 font-bold">PP</span>
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-sm">FlockIQ</p>
            <p className="text-xs text-neutral-500">{dateStr}</p>
          </div>
        </div>

        {/* Signal Content */}
        <div className="space-y-4">
          {/* District */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">मंडी:</span>
            <span className="font-semibold text-neutral-900">{district}</span>
          </div>

          {/* Price Bands */}
          <div className="bg-brandGreen-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">P10 (min):</span>
                <span className="font-semibold text-neutral-900">₹161/kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">P50 (likely):</span>
                <span className="font-bold text-brandGreen-700 text-lg">₹168/kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">P90 (max):</span>
                <span className="font-semibold text-neutral-900">₹175/kg</span>
              </div>
            </div>
          </div>

          {/* Signal Badge */}
          <div className="flex items-center justify-center">
            <span className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold text-sm">
              आज बेचें ✓
            </span>
          </div>

          {/* Confidence */}
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm text-neutral-600">Confidence:</span>
            <span className="font-semibold text-brandGreen-700">92%</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((dot) => (
                <div key={dot} className="w-2 h-2 rounded-full bg-brandGreen-600" />
              ))}
              <div className="w-2 h-2 rounded-full bg-neutral-300" />
            </div>
          </div>
        </div>

        {/* Demo Badge */}
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-center text-amber-600 font-semibold">
            ⚠️ यह Demo है — असली signal कल मिलेगा
          </p>
        </div>
      </div>

      {/* P10/P50/P90 Explainer */}
      <div className="space-y-2">
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="w-full text-left text-sm text-brandGreen-600 hover:underline flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showExplainer ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          P10/P50/P90 का मतलब?
        </button>
        <AnimatePresence>
          {showExplainer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-neutral-50 rounded-lg p-4 text-sm text-neutral-600"
            >
              <p className="mb-2">
                <strong>P50</strong> = most likely price (सबसे संभावित भाव)
              </p>
              <p className="mb-2">
                <strong>P10</strong> = minimum likely price (न्यूनतम संभावित भाव)
              </p>
              <p>
                <strong>P90</strong> = maximum likely price (अधिकतम संभावित भाव)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* What Else You Get */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '📊', label: 'App में 7-day chart देखें' },
          { icon: '🧮', label: 'Batch profit calculate करें' },
          { icon: '🔔', label: 'HPAI alert अगर आए' },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-neutral-50 rounded-lg p-3 text-center"
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="text-xs text-neutral-600 mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full h-[52px] bg-brandGreen-700 text-white font-semibold rounded-xl hover:bg-brandGreen-600 transition-all duration-200"
      >
        समझ गया, आगे →
      </button>
    </motion.div>
  );
}
