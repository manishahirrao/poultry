// FlockIQ — Marketing ROI Calculator
// File: apps/web/components/home/RoiCalculator.tsx
// Version: v3.0 | June 2026
// Task Reference: HOME-007, TEST-001
// Requirements: FR-HOME-007, FR-GLOBAL-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  calculateMarketingRoi,
  MarketingRoiInputs,
  MarketingRoiResult,
  FLOCK_SIZE_OPTIONS,
  AVG_WEIGHT_OPTIONS,
  SELL_FREQUENCY_OPTIONS,
} from '@/lib/marketing-roi';
import { trackRoiCalculatorUsed } from '@/lib/posthog-analytics';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

// Dynamically import CountUp to defer loading until after LCP
const CountUp = dynamic(() => import('react-countup'), {
  ssr: false,
  loading: () => <span>...</span>,
});

export default function RoiCalculator() {
  const [inputs, setInputs] = useState<MarketingRoiInputs>({
    flockSize: 25000,
    avgWeightKg: 2.0,
    batchesPerYear: 2,
  });

  const [result, setResult] = useState<MarketingRoiResult>(
    calculateMarketingRoi(inputs)
  );
  const [pulseRoi, setPulseRoi] = useState(false);

  // Recalculate ROI when inputs change
  useEffect(() => {
    const newResult = calculateMarketingRoi(inputs);
    setResult(newResult);

    // Track ROI calculator usage with PostHog
    trackRoiCalculatorUsed(
      inputs.flockSize,
      inputs.avgWeightKg,
      inputs.batchesPerYear.toString(),
      newResult.annualRevenueGain
    );

    // Pulse animation when ROI >= 2x
    if (newResult.roiMultiple >= 2) {
      setPulseRoi(true);
      setTimeout(() => setPulseRoi(false), 200);
    }
  }, [inputs]);

  const handleInputChange = (field: keyof MarketingRoiInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SectionShell bg="white" ariaLabel="ROI calculator">
      <SectionHeader
        eyebrow="YOUR NUMBERS"
        heading="Calculate Your Earnings"
        body="See exactly what FlockIQ puts back in your pocket"
        align="center"
      />

        {/* Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-neutral-50 rounded-2xl p-6 lg:p-8"
          >
            <h3 className="font-sora font-bold text-[1.125rem] leading-[1.2] tracking-[-0.02em] text-neutral-900 mb-6">
              Your Flock Details
            </h3>

            {/* Flock Size Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                I manage
              </label>
              <select
                value={inputs.flockSize}
                onChange={(e) => handleInputChange('flockSize', Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
              >
                {FLOCK_SIZE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Average Weight Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Average bird weight
              </label>
              <select
                value={inputs.avgWeightKg}
                onChange={(e) => handleInputChange('avgWeightKg', Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
              >
                {AVG_WEIGHT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sell Frequency Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Sell frequency
              </label>
              <select
                value={inputs.batchesPerYear}
                onChange={(e) => handleInputChange('batchesPerYear', Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
              >
                {SELL_FREQUENCY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Result Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-brand-50 rounded-2xl p-6 lg:p-8 border border-brand-200"
          >
            <h3 className="font-sora font-bold text-[1.125rem] leading-[1.2] tracking-[-0.02em] text-neutral-900 mb-6">
              Your Extra Earnings with FlockIQ
            </h3>

            {/* Annual Revenue Gain */}
            <div className="mb-6">
              <p className="font-jakarta text-sm text-neutral-700 mb-2">Per year</p>
              <div className="flex items-baseline gap-1">
                <span className="font-sora font-extrabold text-signal-500 leading-none tracking-[-0.04em]"
                  style={{ fontSize: 'clamp(2rem,4vw,2.5rem)' }}>₹</span>
                <CountUp
                  end={result.annualRevenueGain}
                  duration={0.1}
                  separator=","
                  decimals={0}
                  className="font-sora font-extrabold text-signal-500 tabular-nums leading-none tracking-[-0.04em]"
                  style={{ fontSize: 'clamp(2rem,4vw,2.5rem)' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="mb-6 p-4 bg-white rounded-lg">
              <p className="font-jakarta text-sm text-neutral-600 mb-3">How:</p>
              <div className="space-y-2 font-jakarta text-sm text-neutral-700">
                <div className="flex justify-between">
                  <span>₹{result.breakdown.improvementPerBird}/bird avg improvement</span>
                </div>
                <div className="flex justify-between">
                  <span>× {inputs.flockSize.toLocaleString()} birds</span>
                </div>
                <div className="flex justify-between">
                  <span>× {inputs.batchesPerYear} batches/year</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>= ₹{result.breakdown.annualGainBeforeSubscription.toLocaleString()}/year</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>− ₹{result.subscriptionCost.toLocaleString()} subscription</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-signal-700 font-sora tabular-nums">
                    <span>= ₹{result.netRoi.toLocaleString()} net ROI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Multiple Badge */}
            <motion.div
              animate={pulseRoi ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.2 }}
              className={`inline-block px-4 py-2 rounded-full mb-6 ${
                result.roiMultiple >= 2 ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-800'
              }`}
            >
              <span className="font-sora font-bold tabular-nums">ROI: {result.roiMultiple.toFixed(1)}×</span>
            </motion.div>

            {/* CTA Button */}
            <a
              href="/login?action=signup&source=roi_calculator"
              className="inline-flex items-center justify-center w-full px-6 py-4 bg-brand-700 text-white font-jakarta font-semibold rounded-full hover:bg-brand-600 transition-colors duration-200"
            >
              Start 14-day free trial →
            </a>
          </motion.div>
        </div>
    </SectionShell>
  );
}
