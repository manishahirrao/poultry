// FlockIQ — How the Model Works Section
// File: apps/web/app/(marketing)/features/price-intel/_components/HowTheModelWorks.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-003 (Phase 9)

'use client';

import { motion } from 'framer-motion';
import { Database, Brain, Clock } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { FadeUp } from '@/components/motion/FadeUp';

const steps = [
  {
    icon: Database,
    title: '47 Data Sources',
    description: 'AGMARKNET, NECC, IMD, NCDEX, feed prices, weather patterns, festival calendars, disease alerts, and more.',
  },
  {
    icon: Brain,
    title: 'AI Ensemble Model',
    description: 'Advanced ensemble model working together to capture both short-term volatility and long-term trends.',
  },
  {
    icon: Clock,
    title: 'Daily 6:30 AM Delivery',
    description: 'P10/P50/P90 confidence bands delivered via WhatsApp every morning before markets open.',
  },
];

export function HowTheModelWorks() {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-neutral-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-sora font-bold text-neutral-900 text-3xl sm:text-4xl lg:text-5xl mb-4">
              How the Model Works
            </h2>
            <p className="text-lg text-neutral-600">
              Our AI analyses dozens of data points every night to give you actionable insights before the market opens.
            </p>
          </div>
        </FadeUp>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <FadeUp key={step.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-brand-700" />
                </div>

                {/* Title */}
                <h3 className="font-sora font-semibold text-neutral-900 text-xl mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
