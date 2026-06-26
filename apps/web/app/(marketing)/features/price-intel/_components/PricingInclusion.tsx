// FlockIQ — Pricing Inclusion Section
// File: apps/web/app/(marketing)/features/price-intel/_components/PricingInclusion.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-003 (Phase 9)

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { FadeUp } from '@/components/motion/FadeUp';

const plans = [
  {
    name: 'PulseFarm',
    price: '₹2,000',
    period: '/month',
    description: 'For single farms',
    features: [
      { text: '1 mandi price coverage', included: true },
      { text: 'Daily sell signal (Soon)', included: true },
      { text: '7-day forecast (Soon)', included: true },
      { text: 'All mandis coverage', included: false },
      { text: 'Batch ROI Optimizer', included: false },
      { text: 'Middleman check', included: false },
    ],
    highlighted: false,
  },
  {
    name: 'PulsePro',
    price: '₹5,000',
    period: '/month',
    description: 'For integrators',
    features: [
      { text: '1 mandi price coverage', included: true },
      { text: 'Daily sell signal (Soon)', included: true },
      { text: '7-day forecast (Soon)', included: true },
      { text: 'All mandis coverage', included: true },
      { text: 'Batch ROI Optimizer', included: true },
      { text: 'Middleman check', included: true },
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large operations',
    features: [
      { text: '1 mandi price coverage', included: true },
      { text: 'Daily sell signal (Soon)', included: true },
      { text: '7-day forecast (Soon)', included: true },
      { text: 'All mandis coverage', included: true },
      { text: 'Batch ROI Optimizer', included: true },
      { text: 'Middleman check', included: true },
      { text: 'API access & white-label', included: true },
    ],
    highlighted: false,
  },
];

export function PricingInclusion() {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="brand" className="mb-6">
              Pricing
            </Badge>
            <h2 className="font-sora font-bold text-neutral-900 text-3xl sm:text-4xl lg:text-5xl mb-4">
              Price Intelligence Inclusion
            </h2>
            <p className="text-lg text-neutral-600">
              Price intelligence is included in all plans — no add-on required.
            </p>
          </div>
        </FadeUp>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {plans.map((plan, index) => (
            <FadeUp key={plan.name} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-2xl p-8 border ${
                  plan.highlighted
                    ? 'bg-brand-900 border-brand-700 text-white'
                    : 'bg-white border-neutral-200'
                } shadow-sm hover:shadow-md transition-shadow`}
              >
                {/* Popular Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-brand-400 text-brand-900 border-brand-300">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className={`font-sora font-semibold text-xl mb-2 ${plan.highlighted ? 'text-white' : 'text-neutral-900'}`}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-4">
                  <span className={`text-4xl font-sora font-bold ${plan.highlighted ? 'text-white' : 'text-neutral-900'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-neutral-500'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/70' : 'text-neutral-500'}`}>
                  {plan.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle size={16} className={plan.highlighted ? 'text-brand-400 mt-0.5 flex-shrink-0' : 'text-brand-700 mt-0.5 flex-shrink-0'} />
                      ) : (
                        <XCircle size={16} className={plan.highlighted ? 'text-white/40 mt-0.5 flex-shrink-0' : 'text-neutral-300 mt-0.5 flex-shrink-0'} />
                      )}
                      <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-neutral-700'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {plan.name === 'Enterprise' ? (
                  <Button
                    variant={plan.highlighted ? 'secondary' : 'primary'}
                    size="md"
                    className="w-full"
                    asChild
                  >
                    <Link href="/demo?segment=enterprise">
                      Talk to Sales
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant={plan.highlighted ? 'secondary' : 'primary'}
                    size="md"
                    className="w-full"
                    asChild
                  >
                    <Link href="/signup">
                      Start Free Trial
                    </Link>
                  </Button>
                )}
              </motion.div>
            </FadeUp>
          ))}
        </div>

        {/* Bottom note */}
        <FadeUp delay={0.4}>
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-neutral-600 text-sm mb-4">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <Button
              variant="ghost"
              size="md"
              icon={<ArrowRight size={16} />}
              asChild
            >
              <Link href="/pricing">
                View Full Pricing Details →
              </Link>
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
