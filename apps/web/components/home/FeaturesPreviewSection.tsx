// FlockIQ — Features Preview Section
// File: apps/web/components/home/FeaturesPreviewSection.tsx
// Version: v1.0 | June 2026
// Task Reference: HOME-002
// Requirements: FR-HOME-002

'use client';

import { motion } from 'framer-motion';
import { FEATURE_MODULES, TOTAL_FEATURE_COUNT } from '@/app/(marketing)/lib/features';

export default function FeaturesPreviewSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-sora font-bold text-[clamp(2rem,3vw,2.5rem)] leading-[1.1] tracking-[-0.025em] text-neutral-900 mb-4">
          57 Features Across 6 Intelligence Modules
        </h2>
        <p className="font-jakarta text-[clamp(1rem,1.5vw+0.5rem,1.25rem)] text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          From AI-powered price forecasting (coming soon) — everything you need to run a profitable poultry operation.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {FEATURE_MODULES.map((module: any, index: number) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group bg-white border border-neutral-200 rounded-xl p-6 hover:border-brand-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl">{module.icon || '📊'}</span>
              <div className="flex-1">
                <h3 className="font-sora font-bold text-[1.125rem] leading-[1.2] tracking-[-0.015em] text-neutral-900 mb-2">
                  {module.title}
                </h3>
                <p className="font-jakarta text-neutral-600 text-[0.875rem] leading-relaxed">
                  {module.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
              <span className="font-jakarta text-[0.8125rem] text-neutral-500">
                {module.features.length} features
              </span>
              <span className="font-jakarta text-[0.8125rem] font-semibold text-brand-700 group-hover:text-brand-600 transition-colors">
                View details →
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center"
      >
        <a
          href="/features"
          className="inline-flex items-center gap-2 px-8 py-4 bg-brand-700 text-white font-semibold rounded-full hover:bg-brand-600 transition-all duration-200 shadow-[0_4px_16px_rgba(26,92,52,0.25)] hover:shadow-[0_6px_20px_rgba(26,92,52,0.35)] hover:-translate-y-0.5"
        >
          <span>Explore All {TOTAL_FEATURE_COUNT} Features</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </motion.div>
    </section>
  );
}
