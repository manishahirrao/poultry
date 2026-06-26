// FlockIQ — Accuracy Dashboard Client Component
// File: apps/web/app/(marketing)/accuracy/AccuracyDashboardClient.tsx
// Version: v1.0 | May 2026
// Task Reference: C-02
// Requirements: FR-ACCURACY-001
// Trust-Focused Extraordinary: Animated confidence intervals that build trust

'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { TrendUp, Target, ShieldCheck, ChartLineUp, Info } from '@phosphor-icons/react';

interface AccuracyData {
  directional_accuracy_30d: number;
  mape_30d: number;
  conformal_coverage_30d: number;
  predictions_30d: number;
  isDemo: boolean;
}

interface AccuracyDashboardClientProps {
  accuracy: AccuracyData;
}

function AnimatedMetric({ 
  value, 
  suffix = '', 
  decimals = 1 
}: { 
  value: number; 
  suffix?: string; 
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = stepValue * currentStep * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [isInView, value]);

  return (
    <div ref={ref} className="font-sora font-bold text-3xl text-neutral-900 mb-2">
      {displayValue.toFixed(decimals)}{suffix}
    </div>
  );
}

function ConfidenceIntervalBar({ 
  value, 
  min, 
  max, 
  threshold, 
  label 
}: { 
  value: number; 
  min: number; 
  max: number; 
  threshold: number; 
  label: string;
}) {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    const duration = 1500;
    const steps = 60;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setProgress(easeOutQuart);

      if (currentStep >= steps) {
        setProgress(1);
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [isInView]);

  const range = max - min;
  const normalizedValue = ((value - min) / range) * 100;
  const normalizedThreshold = ((threshold - min) / range) * 100;
  const isWithinThreshold = value >= threshold;

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-700 font-semibold">{label}</span>
        <span className={`font-bold ${isWithinThreshold ? 'text-green-700' : 'text-red-700'}`}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="relative h-3 bg-neutral-200 rounded-full overflow-hidden">
        {/* Background track */}
        <div className="absolute inset-0 bg-neutral-200 rounded-full" />
        
        {/* Confidence interval range */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${normalizedValue}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute top-0 bottom-0 rounded-full ${
            isWithinThreshold ? 'bg-green500' : 'bg-red500'
          }`}
        />
        
        {/* Threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-neutral900"
          style={{ left: `${normalizedThreshold}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-neutral-500">
        <span>{min}%</span>
        <span>Target: {threshold}%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
}

export default function AccuracyDashboardClient({ accuracy }: AccuracyDashboardClientProps) {
  const metrics = [
    {
      icon: TrendUp,
      label: 'Directional Accuracy (30d)',
      value: `${accuracy.directional_accuracy_30d}%`,
      description: 'Percentage of correct up/down predictions',
      threshold: 95,
      good: accuracy.directional_accuracy_30d >= 95,
    },
    {
      icon: Target,
      label: 'MAPE (30d)',
      value: `${accuracy.mape_30d}%`,
      description: 'Mean Absolute Percentage Error',
      threshold: 6,
      good: accuracy.mape_30d < 6,
      inverse: true,
    },
    {
      icon: ShieldCheck,
      label: 'Conformal Coverage (30d)',
      value: `${accuracy.conformal_coverage_30d}%`,
      description: 'Actual values within P10-P90 range',
      threshold: 80,
      good: accuracy.conformal_coverage_30d >= 78 && accuracy.conformal_coverage_30d <= 82,
    },
    {
      icon: ChartLineUp,
      label: 'Total Predictions (30d)',
      value: accuracy.predictions_30d.toLocaleString(),
      description: 'Number of predictions made',
      threshold: 0,
      good: true,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="py-section-vertical bg-brand-700 text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <ShieldCheck size={40} className="text-amber-400" weight="fill" />
              <p className="font-jakarta font-bold text-[11px] text-brand-100 tracking-[0.16em] uppercase">
                Transparency First
              </p>
            </div>
            <h1 className="font-sora font-bold text-[clamp(2rem,3.5vw+0.75rem,3.5rem)] leading-[1.1] mb-4">
              Model Accuracy Dashboard
            </h1>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-brand-100 max-w-3xl mx-auto mb-8">
              Live accuracy metrics for our poultry price prediction model. 95%+ directional accuracy guarantee.
            </p>
            {accuracy.isDemo && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber400 text-brand-900 rounded-full font-semibold">
                <Info size={20} />
                Demo Data — Supabase not configured
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 text-center"
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              30-Day Performance Metrics
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className={`bg-white rounded-2xl p-6 shadow-lg border-2 ${
                  metric.good
                    ? 'border-green200'
                    : 'border-red200'
                }`}
              >
                <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${
                  metric.good
                    ? 'bg-green100 text-green-700'
                    : 'bg-red100 text-red-700'
                }`}>
                  <metric.icon size={24} />
                </div>
                <p className="text-sm text-neutral-500 mb-1">{metric.label}</p>
                {metric.label.includes('Directional Accuracy') ? (
                  <AnimatedMetric 
                    value={accuracy.directional_accuracy_30d} 
                    suffix="%" 
                    decimals={1}
                  />
                ) : metric.label.includes('MAPE') ? (
                  <AnimatedMetric 
                    value={accuracy.mape_30d} 
                    suffix="%" 
                    decimals={1}
                  />
                ) : metric.label.includes('Conformal') ? (
                  <AnimatedMetric 
                    value={accuracy.conformal_coverage_30d} 
                    suffix="%" 
                    decimals={1}
                  />
                ) : (
                  <AnimatedMetric 
                    value={accuracy.predictions_30d} 
                    decimals={0}
                  />
                )}
                <p className="text-sm text-neutral-700 mb-3">{metric.description}</p>
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold ${
                  metric.good
                    ? 'bg-green100 text-green-700'
                    : 'bg-red100 text-red-700'
                }`}>
                  {metric.good ? '✓ On Target' : '! Below Target'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accuracy Gates */}
      <section className="py-section-vertical bg-brandGreen25">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8 text-center"
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Accuracy Gates
            </h2>
            <p className="text-neutral-700">
              We only show live predictions when all gates pass
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Confidence Interval Visualizations */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h3 className="font-sora font-semibold text-lg text-neutral-900 mb-6">
                Confidence Interval Visualization
              </h3>
              <div className="space-y-6">
                <ConfidenceIntervalBar
                  value={accuracy.directional_accuracy_30d}
                  min={85}
                  max={100}
                  threshold={95}
                  label="Directional Accuracy"
                />
                <ConfidenceIntervalBar
                  value={accuracy.mape_30d}
                  min={0}
                  max={10}
                  threshold={6}
                  label="MAPE (lower is better)"
                />
                <ConfidenceIntervalBar
                  value={accuracy.conformal_coverage_30d}
                  min={70}
                  max={90}
                  threshold={80}
                  label="Conformal Coverage"
                />
              </div>
            </div>

            {/* Accuracy Gates */}
            <div className="space-y-4">
              {[
                {
                  label: 'Directional Accuracy ≥ 95%',
                  passed: accuracy.directional_accuracy_30d >= 95,
                  current: `${accuracy.directional_accuracy_30d}%`,
                },
                {
                  label: 'MAPE < 6%',
                  passed: accuracy.mape_30d < 6,
                  current: `${accuracy.mape_30d}%`,
                },
                {
                  label: 'Conformal Coverage 78-82%',
                  passed: accuracy.conformal_coverage_30d >= 78 && accuracy.conformal_coverage_30d <= 82,
                  current: `${accuracy.conformal_coverage_30d}%`,
                },
              ].map((gate, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                    gate.passed
                      ? 'bg-green50 border-green200'
                      : 'bg-red50 border-red200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      gate.passed
                        ? 'bg-green200 text-green-700'
                        : 'bg-red200 text-red-700'
                    }`}>
                      {gate.passed ? '✓' : '!'}
                    </div>
                    <span className="font-semibold text-neutral-900">{gate.label}</span>
                  </div>
                  <span className={`font-bold ${
                    gate.passed
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}>
                    {gate.current}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Methodology
            </h2>
          </motion.div>

          <div className="bg-brand-50 rounded-2xl p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-sora font-bold text-xl text-neutral-900 mb-2">
                  Model Architecture
                </h3>
                <p className="text-neutral-700">
                  Advanced ensemble model — same class of model used by commodity trading desks.
                </p>
              </div>
              <div>
                <h3 className="font-sora font-bold text-xl text-neutral-900 mb-2">
                  Data Sources
                </h3>
                <p className="text-neutral-700">
                  47 public data sources including AGMARKNET mandi data, NECC poultry stats, IMD weather forecasts, and feed commodity prices.
                </p>
              </div>
              <div>
                <h3 className="font-sora font-bold text-xl text-neutral-900 mb-2">
                  Evaluation
                </h3>
                <p className="text-neutral-700">
                  6-month holdout data from Gorakhpur region. Metrics updated daily at 6:30 AM.
                </p>
              </div>
              <div>
                <h3 className="font-sora font-bold text-xl text-neutral-900 mb-2">
                  Guarantee
                </h3>
                <p className="text-neutral-700">
                  If accuracy ever drops below 95%, we will refund that month entirely. No questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-vertical bg-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] mb-4">
              आज ही शुरू करें — 14 दिन मुफ़्त
            </h2>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-brand-100 mb-8">
              Start today — 14 days free
            </p>
            <button className="px-8 py-4 bg-white text-brand-700 font-semibold rounded-full hover:bg-brand-50 transition-all">
              14 दिन मुफ़्त शुरू करें
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
