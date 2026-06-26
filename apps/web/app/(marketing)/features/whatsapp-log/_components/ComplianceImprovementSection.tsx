// FlockIQ — WhatsApp Log Automation Compliance Improvement Section
// File: apps/web/app/(marketing)/features/whatsapp-log/_components/ComplianceImprovementSection.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md PAGE B-01 SECTION B-01-04

'use client';

import { motion } from 'framer-motion';
import { FadeUp } from '@/components/motion/FadeUp';
import { CountUp } from '@/components/motion/CountUp';
import { TrendingUp } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';

export function ComplianceImprovementSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Stat Comparison */}
          <FadeUp>
            <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={24} className="text-brand-700" />
                <h3 className="text-xl font-semibold text-neutral-900 font-jakarta">
                  Log Compliance Rate
                </h3>
              </div>

              {/* Stat Comparison */}
              <div className="flex items-center gap-8 mb-6">
                {/* Before */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-neutral-400 font-sora mb-2">
                    42%
                  </div>
                  <div className="text-sm text-neutral-500">Before FlockIQ</div>
                </div>

                {/* Arrow */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-neutral-200 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                      <TrendingUp size={16} className="text-brand-700" />
                    </div>
                  </div>
                </div>

                {/* After */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-brand-700 font-sora mb-2">
                    <CountUp end={97} suffix="%" />
                  </div>
                  <div className="text-sm text-neutral-500">After FlockIQ</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-neutral-600 mb-2">
                  <span>Improvement</span>
                  <span className="font-semibold text-brand-700">+131%</span>
                </div>
                <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '97%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
                  />
                </div>
              </div>

              {/* Sub-label */}
              <div className="text-sm text-neutral-600">
                Based on 500+ farms using WhatsApp Log Automation
              </div>
            </div>
          </FadeUp>

          {/* Right — Explanation */}
          <FadeUp delay={0.2}>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6 font-sora">
                Why Compliance Jumps to 97%
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                When data collection is a phone call, compliance depends on farmers
                picking up. When it's a WhatsApp reply, compliance jumps to 97%.
              </p>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Phone calls require both parties to be available at the same time.
                Farmers are often in the field, with the birds, or managing other
                tasks. WhatsApp replies are asynchronous — farmers can respond when
                it's convenient for them.
              </p>

              {/* Benefits List */}
              <div className="space-y-4">
                {[
                  'No missed calls — farmers reply when free',
                  'No language barrier — Hindi & English supported',
                  'No app install — works on existing WhatsApp',
                  'Instant confirmation — farmer knows log was saved',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-brand-700 text-sm font-semibold">✓</span>
                    </div>
                    <span className="text-neutral-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
