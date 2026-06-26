// FlockIQ — Farm Intelligence Page Client Component
// File: apps/web/app/(marketing)/farm-intelligence/FarmIntelligencePageClient.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-015
// Requirements: REQ-WEB-006

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRef, useState } from 'react';

// Feature section data
const FARM_INTELLIGENCE_SECTIONS = [
  {
    id: 'batch-lifecycle',
    title: 'Batch Lifecycle Management',
    description: 'Track each batch from DOC placement to harvest with complete visibility',
    icon: '📋',
    benefits: [
      'Complete status board showing all batches at a glance',
      'Performance history with trend analysis across cycles',
      'Milestone tracking from placement to harvest',
    ],
    comparison: {
      manual: '2 hours/day manual tracking',
      FlockIQ: '8 minutes automated',
      savings: '15× faster',
    },
    screenshotPlaceholder: 'Batch Status Board',
  },
  {
    id: 'fcr-feed',
    title: 'FCR & Feed Efficiency',
    description: 'Daily feed logging with automatic FCR calculation and breed-standard benchmarks',
    icon: '🌾',
    benefits: [
      'Automatic FCR calculation from daily feed logs',
      'Real-time deviation alerts when FCR exceeds breed standards',
      'Feed allocation recommendations to optimize costs',
    ],
    comparison: {
      manual: '45 minutes daily calculation',
      FlockIQ: '5 minutes auto-calculated',
      savings: '9× faster',
    },
    screenshotPlaceholder: 'FCR Trend Chart',
  },
  {
    id: 'health-vaccination',
    title: 'Health & Vaccination',
    description: 'Schedule manager with WhatsApp reminders and withdrawal period enforcement',
    icon: '💉',
    benefits: [
      'Auto-schedule UP broiler vaccination protocol',
      'WhatsApp reminders 24 hours before each dose',
      'Withdrawal period tracking prevents legal holds',
    ],
    comparison: {
      manual: '1 hour weekly scheduling',
      FlockIQ: '10 minutes automated',
      savings: '6× faster',
    },
    screenshotPlaceholder: 'Vaccination Schedule',
  },
  {
    id: 'mortality-intelligence',
    title: 'Mortality Intelligence',
    description: 'Daily logging with AI-powered abnormal pattern detection',
    icon: '📉',
    benefits: [
      'Daily mortality logging with cause categorization',
      'AI detects abnormal patterns in 60 seconds',
      'Early disease warning saves ₹20K–₹80K per batch',
    ],
    comparison: {
      manual: '30 minutes daily logging',
      FlockIQ: '5 minutes + AI alerts',
      savings: '6× faster + early detection',
    },
    screenshotPlaceholder: 'Mortality Pattern Alert',
  },
  {
    id: 'inventory-costing',
    title: 'Inventory & Costing',
    description: 'Real-time batch P&L with feed/medicine stock management',
    icon: '💰',
    benefits: [
      'Real-time batch P&L tracking from day 1',
      'Feed and medicine stock with low-stock alerts',
      'Purchase order management with supplier tracking',
    ],
    comparison: {
      manual: '2 hours weekly reconciliation',
      FlockIQ: '15 minutes real-time',
      savings: '8× faster',
    },
    screenshotPlaceholder: 'Batch P&L Dashboard',
  },
  {
    id: 'iot-smart-farm',
    title: 'IoT Smart Farm',
    description: 'Connect automatic weighing scales, environment sensors, and water meters',
    icon: '📡',
    benefits: [
      'Auto-weighing scales eliminate manual entry',
      'Environment sensors detect heat stress early',
      'Water meters track consumption patterns',
    ],
    comparison: {
      manual: 'Manual checks every 2 hours',
      FlockIQ: 'Continuous automated monitoring',
      savings: '24/7 visibility',
    },
    screenshotPlaceholder: 'IoT Dashboard',
  },
];

export default function FarmIntelligencePageClient() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
            Beyond Price Intelligence — Complete Farm Operations in One Platform
          </h1>
          <p className="text-xl sm:text-2xl text-neutral-600 mb-8 max-w-4xl mx-auto">
            Price intelligence without operational data is an estimate. Price intelligence combined with your actual FCR, mortality, and weight gain is a precise business decision engine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/pricing"
              className="px-8 py-4 bg-brand-green-700 text-white font-semibold rounded-full hover:bg-brand-green-800 transition-colors"
            >
              Start Free Trial — 14 Days
            </a>
            <a
              href="/demo"
              className="px-8 py-4 border-2 border-brand-green-700 text-brand-green-700 font-semibold rounded-full hover:bg-brand-green-50 transition-colors"
            >
              Request Demo
            </a>
          </div>
        </motion.div>
      </section>

      {/* Feature Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {FARM_INTELLIGENCE_SECTIONS.map((section, index) => (
          <FeatureSection key={section.id} section={section} index={index} />
        ))}

        {/* Narrative Box - Positioned between section 3 and 4 */}
        <NarrativeBox />

        {/* Bottom Segment CTAs */}
        <SegmentCTAs />
      </div>
    </div>
  );
}

function FeatureSection({ section, index }: { section: typeof FARM_INTELLIGENCE_SECTIONS[0]; index: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section
      ref={ref}
      id={section.id}
      className="mb-20 scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Content */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{section.icon}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
                {section.title}
              </h2>
            </div>
            <p className="text-lg text-neutral-600 mb-6">
              {section.description}
            </p>

            {/* Benefits */}
            <ul className="space-y-3 mb-8">
              {section.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-brand-green-700 mt-1">✅</span>
                  <span className="text-neutral-700">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Comparison Table */}
            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                Time Comparison
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Manual Process:</span>
                  <span className="font-semibold text-neutral-900">{section.comparison.manual}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">FlockIQ:</span>
                  <span className="font-semibold text-brand-green-700">{section.comparison.FlockIQ}</span>
                </div>
                <div className="pt-3 border-t border-neutral-200">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-medium">Savings:</span>
                    <span className="font-bold text-brand-green-700">{section.comparison.savings}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Animated Screenshot Placeholder */}
          <div className="lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-brand-green-50 to-white rounded-2xl p-8 border-2 border-brand-green-200 h-[300px] flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green-100/50 to-transparent" />
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-4">{section.icon}</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {section.screenshotPlaceholder}
                </h3>
                <p className="text-sm text-neutral-500">
                  Product Screenshot (300×200px)
                </p>
              </div>
              {/* Animated elements */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-4 right-4 w-3 h-3 bg-brand-green-500 rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute bottom-4 left-4 w-2 h-2 bg-brand-green-400 rounded-full"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function NarrativeBox() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="my-24 bg-gradient-to-r from-brand-green-700 to-brand-green-600 rounded-2xl p-8 sm:p-12 text-white"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">
          How Operational Data Makes Price Intelligence Better
        </h2>
        <div className="space-y-4 text-lg">
          <p>
            <strong className="text-white/90">The Data Moat:</strong> Every operational data point you log — FCR, mortality, weight gain, feed costs — strengthens our price prediction model for your specific farm.
          </p>
          <p>
            <strong className="text-white/90">Compound Intelligence:</strong> Farms with complete operational data see 12–18% higher price prediction accuracy because the model learns your farm's unique patterns.
          </p>
          <p>
            <strong className="text-white/90">Precision Decision Engine:</strong> When you combine market price forecasts with your actual batch performance, sell decisions become precise business calculations, not estimates.
          </p>
        </div>
        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-white/80 text-sm">
            The more you use FlockIQ for operations, the smarter your price intelligence becomes.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SegmentCTAs() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="mt-24"
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12">
        Choose the Right Plan for Your Farm
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* PulsePro Card */}
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-brand-green-700 transition-colors">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">PulsePro</h3>
            <p className="text-neutral-600">For Commercial Farms (10K–50K birds)</p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-neutral-900">₹2,000–5,000</span>
              <span className="text-neutral-600">/month</span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-brand-green-700">✅</span>
              <span className="text-neutral-700">All 6 farm intelligence modules</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-green-700">✅</span>
              <span className="text-neutral-700">7-day price forecast</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-green-700">✅</span>
              <span className="text-neutral-700">Daily sell signals (WhatsApp)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-green-700">✅</span>
              <span className="text-neutral-700">14-day free trial</span>
            </li>
          </ul>
          <a
            href="/pricing"
            className="block w-full text-center px-6 py-3 bg-brand-green-700 text-white font-semibold rounded-full hover:bg-brand-green-800 transition-colors"
          >
            Start Free Trial
          </a>
        </div>

        {/* PulseEnterprise Card */}
        <div className="bg-white rounded-2xl p-8 border-2 border-brand-green-700 relative">
          <div className="absolute top-4 right-4 bg-brand-green-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Popular
          </div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">PulseEnterprise</h3>
            <p className="text-neutral-600">For Integrators (50K+ birds)</p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-neutral-900">Custom</span>
              <span className="text-neutral-600"> pricing</span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-brand-green-700">✅</span>
              <span className="text-neutral-700">Everything in PulsePro</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-green-700">✅</span>
              <span className="text-neutral-700">Multi-farm dashboard</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-green-700">✅</span>
              <span className="text-neutral-700">IoT device integration</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-green-700">✅</span>
              <span className="text-neutral-700">API access (10K calls/day)</span>
            </li>
          </ul>
          <a
            href="/demo"
            className="block w-full text-center px-6 py-3 bg-brand-green-700 text-white font-semibold rounded-full hover:bg-brand-green-800 transition-colors"
          >
            Request Demo
          </a>
        </div>
      </div>
    </motion.div>
  );
}
