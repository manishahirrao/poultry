// FlockIQ — Sell Intelligence Features Section
// File: apps/web/app/(marketing)/features/price-intel/_components/SellIntelligenceFeatures.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-003 (Phase 9)

'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Calculator, MessageSquare, FileText } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { FadeUp } from '@/components/motion/FadeUp';

const features = [
  {
    icon: TrendingUp,
    title: 'Daily Sell Signal',
    description: 'Get SELL / HOLD / WAIT signals at 6:30 AM every morning. Know exactly when to harvest for maximum profit.',
    benefit: 'Never miss the price peak window',
  },
  {
    icon: Calculator,
    title: 'Batch ROI Optimizer',
    description: 'Compare sell-now vs wait-3-days profit. See the exact ₹ difference based on your FCR, weight gain, and price forecast.',
    benefit: 'Data-driven harvest decisions',
  },
  {
    icon: MessageSquare,
    title: 'Middleman Check',
    description: 'Verify if a trader\'s offer is fair. Get instant comparison against our forecast and historical prices.',
    benefit: 'Negotiate with confidence',
  },
  {
    icon: FileText,
    title: 'Negotiation Script Generator',
    description: 'Get Hindi scripts to counter lowball offers. "Market price is ₹168, you\'re offering ₹155 — that\'s 8% below forecast."',
    benefit: 'Close deals at fair prices',
  },
];

export function SellIntelligenceFeatures() {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-neutral-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-sora font-bold text-neutral-900 text-3xl sm:text-4xl lg:text-5xl mb-4">
              Sell Intelligence Features
            </h2>
            <p className="text-lg text-neutral-600">
              Beyond price forecasting — tools that help you close deals at the right price.
            </p>
          </div>
        </FadeUp>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FadeUp key={feature.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-brand-700" />
                </div>

                {/* Title */}
                <h3 className="font-sora font-semibold text-neutral-900 text-xl mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-neutral-600 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Benefit */}
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full">
                  {feature.benefit}
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>

        {/* Bottom note */}
        <FadeUp delay={0.4}>
          <div className="mt-12 text-center max-w-2xl mx-auto">
            <p className="text-neutral-600 text-sm">
              All sell intelligence features are integrated with your farm management data — 
              <span className="font-semibold text-neutral-900"> no manual data entry required</span>.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
