// FlockIQ — How It Works Page Client Component
// File: apps/web/app/(marketing)/how-it-works/HowItWorksClient.tsx
// Version: v1.0 | May 2026
// Task Reference: C-09
// Requirements: FR-HOME-003, FR-SEO-002

'use client';

import { motion } from 'framer-motion';
import { Database, Brain, WhatsappLogo, ChartLineUp, ShieldCheck, Clock } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';

const steps = [
  {
    icon: Database,
    title: {
      hi: 'Every morning at 4:30 AM — data from 47 sources',
      en: 'Every morning at 4:30 AM — data from 47 sources'
    },
    description: {
      hi: 'AGMARKNET mandi prices, NECC stats, IMD weather, feed rates — all public data, all daily updates. You do nothing.',
      en: 'AGMARKNET mandi prices, NECC stats, IMD weather, feed rates — all public data, all daily updates. You do nothing.'
    },
    dataSources: ['AGMARKNET', 'NECC', 'IMD Weather', 'Feed Prices', 'Mandi Reports'],
  },
  {
    icon: Brain,
    title: {
      hi: '5:00 AM — AI predicts 7-day prices',
      en: '5:00 AM — AI predicts 7-day prices'
    },
    description: {
      hi: 'Trained on 2 years of broiler price data. 95.2% directional accuracy — meaning 95+ out of 100 times, it gets the direction right.',
      en: 'Trained on 2 years of broiler price data. 95.2% directional accuracy — meaning 95+ out of 100 times, it gets the direction right.'
    },
    accuracy: '95.2%',
  },
  {
    icon: WhatsappLogo,
    title: {
      hi: '6:30 AM — sell signal on WhatsApp',
      en: '6:30 AM — sell signal on WhatsApp'
    },
    description: {
      hi: 'Sell today or wait — clear action. 7-day price forecast (P10/P50/P90). No app needed, just WhatsApp message.',
      en: 'Sell today or wait — clear action. 7-day price forecast (P10/P50/P90). No app needed, just WhatsApp message.'
    },
  },
];

const features = [
  {
    icon: ChartLineUp,
    title: {
      hi: '7-Day Forecast',
      en: '7-Day Forecast'
    },
    description: {
      hi: 'We predict next 7 days prices — P10 (minimum), P50 (likely), P90 (maximum)',
      en: 'We predict next 7 days prices — P10 (minimum), P50 (likely), P90 (maximum)'
    },
  },
  {
    icon: ShieldCheck,
    title: {
      hi: '95.2% Accuracy',
      en: '95.2% Accuracy'
    },
    description: {
      hi: 'Validated on 6-month Gorakhpur holdout data. See daily performance on public accuracy dashboard.',
      en: 'Validated on 6-month Gorakhpur holdout data. See daily performance on public accuracy dashboard.'
    },
  },
  {
    icon: Clock,
    title: {
      hi: 'Daily 6:30 AM',
      en: 'Daily 6:30 AM'
    },
    description: {
      hi: 'Every morning, every day — no holidays',
      en: 'Every morning, every day — no holidays'
    },
  },
];

export default function HowItWorksClient() {
  return (
    <div className="min-h-screen bg-neutral50">
      {/* Hero Section */}
      <section className="py-section-vertical bg-brandGreen700 text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-space-grotesk font-bold text-[clamp(2.5rem,5vw+1rem,4.5rem)] leading-[1.05] mb-6">
              4:30 AM to 6:30 AM — You Do Nothing
            </h1>
            <p className="font-space-grotesk text-xl text-brandGreen100 max-w-3xl mx-auto mb-2">
              We do everything, you just check WhatsApp message
            </p>
            <p className="font-space-grotesk text-base text-brandGreen200 max-w-3xl mx-auto">
              95.2% Accuracy • 7-Day Forecast • Gorakhpur Belt
            </p>
          </motion.div>
        </div>
      </section>

      {/* Visual Diagram Section */}
      <section className="py-section-vertical bg-brandGreen25">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
              How It Works
            </h2>
            <p className="font-space-grotesk text-lg text-neutral700">
              4:30 AM to 6:30 AM — Everything happens in 2 hours
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex-1 text-center w-full">
              <div className="bg-white rounded-2xl p-4 md:p-6 border-2 border-brandGreen200 shadow-sm">
                <Database size={32} className="text-brandGreen700 mx-auto mb-2 md:mb-3 md:size-48" />
                <p className="font-semibold text-neutral900 text-sm md:text-base">Data Collection</p>
                <p className="text-xs md:text-sm text-neutral600">4:30 AM daily</p>
              </div>
            </div>
            <div className="text-brandGreen400 text-2xl md:text-4xl rotate-90 md:rotate-0">→</div>
            <div className="flex-1 text-center w-full">
              <div className="bg-white rounded-2xl p-4 md:p-6 border-2 border-brandGreen200 shadow-sm">
                <Brain size={32} className="text-brandGreen700 mx-auto mb-2 md:mb-3 md:size-48" />
                <p className="font-semibold text-neutral900 text-sm md:text-base">AI Analysis</p>
                <p className="text-xs md:text-sm text-neutral600">95%+ accuracy</p>
              </div>
            </div>
            <div className="text-brandGreen400 text-2xl md:text-4xl rotate-90 md:rotate-0">→</div>
            <div className="flex-1 text-center w-full">
              <div className="bg-white rounded-2xl p-4 md:p-6 border-2 border-brandGreen200 shadow-sm">
                <WhatsappLogo size={32} className="text-brandGreen700 mx-auto mb-2 md:mb-3 md:size-48" />
                <p className="font-semibold text-neutral900 text-sm md:text-base">WhatsApp Alert</p>
                <p className="text-xs md:text-sm text-neutral600">6:30 AM delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`flex flex-col lg:flex-row gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="bg-brandGreen50 rounded-2xl p-8 mb-6 w-fit">
                    <step.icon size={64} className="text-brandGreen700" />
                  </div>
                  <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
                    {step.title.en}
                  </h2>
                  <p className="font-space-grotesk text-lg text-neutral700 mb-6">
                    {step.description.en}
                  </p>
                  {step.dataSources && (
                    <div className="flex flex-wrap gap-2">
                      {step.dataSources.map((source, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-brandGreen100 text-brandGreen700 rounded-full text-sm font-semibold"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  )}
                  {step.accuracy && (
                    <div className="inline-block px-4 py-2 bg-green100 text-green700 rounded-xl font-bold text-lg">
                      {step.accuracy} Accuracy
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-neutral50 rounded-2xl p-8 border border-neutral200">
                    <div className="text-6xl font-space-grotesk font-bold text-brandGreen700 mb-2">
                      0{index + 1}
                    </div>
                    <div className="text-neutral500 text-sm uppercase tracking-wider">
                      Step {index + 1}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* See It In Action Section */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
              See It In Action
            </h2>
            <p className="font-space-grotesk text-lg text-neutral700">
              Try our WhatsApp demo — no signup required
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brandGreen50 rounded-2xl p-8 text-center"
          >
            <div className="mb-6">
              <div className="inline-block bg-white rounded-2xl p-4 shadow-sm mb-4">
                <WhatsappLogo size={48} className="text-green-600" />
              </div>
              <p className="font-space-grotesk text-lg text-neutral700 mb-2">
                Get a sample price prediction on WhatsApp
              </p>
              <p className="font-space-grotesk text-sm text-neutral500">
                See exactly what our daily signals look like — no commitment, no credit card
              </p>
            </div>
            <Button href="/try-whatsapp" size="lg">
              Try WhatsApp Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-section-vertical bg-brandGreen25">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
              Why FlockIQ?
            </h2>
            <p className="font-space-grotesk text-lg text-neutral700">
              7-day forward visibility, 95.2% accuracy, WhatsApp-first
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="bg-brandGreen50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={32} className="text-brandGreen700" />
                </div>
                <h3 className="font-space-grotesk font-bold text-xl text-neutral900 mb-3 text-center">
                  {feature.title.en}
                </h3>
                <p className="text-neutral700 text-center">
                  {feature.description.en}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-section-vertical bg-neutral50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
              Interactive Demo
            </h2>
            <p className="font-space-grotesk text-lg text-neutral700">
              See how our prediction system works step by step
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-sm"
          >
            <div className="space-y-6">
              <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
                <div className="flex items-start gap-4">
                  <div className="bg-brandGreen700 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-white">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral900 mb-2">Data Collection (4:30 AM)</h4>
                    <p className="text-neutral700 text-sm">Our system automatically fetches prices from 47+ sources including AGMARKNET, NECC, and local mandis.</p>
                  </div>
                </div>
              </div>

              <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
                <div className="flex items-start gap-4">
                  <div className="bg-brandGreen700 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-white">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral900 mb-2">AI Analysis (5:00 AM)</h4>
                    <p className="text-neutral700 text-sm">Our ML model processes the data and generates 7-day price forecasts with 95%+ accuracy.</p>
                  </div>
                </div>
              </div>

              <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
                <div className="flex items-start gap-4">
                  <div className="bg-brandGreen700 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-white">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral900 mb-2">WhatsApp Delivery (6:30 AM)</h4>
                    <p className="text-neutral700 text-sm">You receive a clear sell signal with price forecast directly on WhatsApp.</p>
                  </div>
                </div>
              </div>

              <div className="bg-brandGreen50 rounded-xl p-6 border border-brandGreen200">
                <div className="flex items-start gap-4">
                  <div className="bg-brandGreen700 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-white">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral900 mb-2">Your Decision</h4>
                    <p className="text-neutral700 text-sm">Based on the signal, you decide when to sell your birds for maximum profit.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button href="/signup" size="lg">
                Start Getting Alerts
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
              Start Today — 14 Days Free
            </h2>
            <p className="font-space-grotesk text-lg text-neutral700 mb-8">
              Start today — 14 days free
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/signup" size="lg">
                Start 14 Days Free
              </Button>
              <Button href="/try-whatsapp" variant="secondary" size="lg">
                Try WhatsApp Demo
              </Button>
            </div>
            <p className="text-sm text-neutral500 mt-6">
              No credit card • Cancel anytime • 14 days free
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
