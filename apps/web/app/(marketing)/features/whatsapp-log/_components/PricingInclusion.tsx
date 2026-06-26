// FlockIQ — WhatsApp Log Automation Pricing Inclusion Section
// File: apps/web/app/(marketing)/features/whatsapp-log/_components/PricingInclusion.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md PAGE B-01 SECTION B-01-07
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md FR-FEAT-002

'use client';

import Link from 'next/link';
import { FadeUp } from '@/components/motion/FadeUp';
import { Button } from '@/components/ui/Button';
import { Check, X, Star } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';

interface Plan {
  name: string;
  price: string;
  description: string;
  whatsappIncluded: boolean;
  whatsappPrice?: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const PLANS: Plan[] = [
  {
    name: 'PulseFarm',
    price: '₹2,000',
    description: 'For single farms (10K–500K birds)',
    whatsappIncluded: false,
    whatsappPrice: '+ ₹500/farm/month',
    features: [
      'Batch lifecycle tracking',
      'FCR monitoring',
      'Mortality intelligence',
      'Price intelligence',
      'Disease alerts',
      'WhatsApp log: Add-on available',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'PulsePro',
    price: '₹5,000',
    description: 'For integrators (up to 20 farms)',
    whatsappIncluded: true,
    features: [
      'Everything in PulseFarm',
      'Multi-farm dashboard',
      'WhatsApp log automation ✓ Included',
      'Cross-farm benchmarking',
      'Harvest queue optimizer',
      'Portfolio analytics',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large integrators & feed companies',
    whatsappIncluded: true,
    features: [
      'Unlimited farms',
      'WhatsApp log automation ✓ Included',
      'API access',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
  },
];

export function PricingInclusion() {
  return (
    <section className="py-24" style={{ background: '#0D3B21' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-sora">
              WhatsApp Log Automation Pricing
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Included in PulsePro and Enterprise plans. Available as add-on for PulseFarm.
            </p>
          </div>
        </FadeUp>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan, index) => (
            <FadeUp key={plan.name} delay={index * 0.1}>
              <div
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-brand-700 border-2 border-brand-400 shadow-xl'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20'
                }`}
              >
                {/* Popular Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1 bg-brand-400 text-brand-900 px-4 py-1 rounded-full text-sm font-semibold">
                      <Star size={14} fill="currentColor" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Name */}
                <h3
                  className={`text-xl font-bold mb-2 font-jakarta ${
                    plan.highlighted ? 'text-white' : 'text-white'
                  }`}
                >
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-4">
                  <div
                    className={`text-4xl font-bold font-sora ${
                      plan.highlighted ? 'text-white' : 'text-white'
                    }`}
                  >
                    {plan.price}
                    {plan.price !== 'Custom' && <span className="text-lg font-normal">/month</span>}
                  </div>
                  <div className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-white/60'}`}>
                    {plan.description}
                  </div>
                </div>

                {/* WhatsApp Inclusion */}
                <div
                  className={`mb-6 p-3 rounded-lg ${
                    plan.whatsappIncluded
                      ? 'bg-brand-500/30 border border-brand-400'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {plan.whatsappIncluded ? (
                      <Check size={16} className="text-brand-300" />
                    ) : (
                      <X size={16} className="text-white/50" />
                    )}
                    <span
                      className={`font-semibold text-sm ${
                        plan.highlighted ? 'text-white' : 'text-white'
                      }`}
                    >
                      WhatsApp Log Automation
                    </span>
                  </div>
                  {!plan.whatsappIncluded && plan.whatsappPrice && (
                    <div className="text-xs text-white/50 ml-6">{plan.whatsappPrice}</div>
                  )}
                  {plan.whatsappIncluded && (
                    <div className="text-xs text-brand-200 ml-6">Included with all farms</div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check
                        size={16}
                        className={`flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? 'text-brand-300' : 'text-brand-400'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.highlighted ? 'text-white/90' : 'text-white/80'
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.highlighted ? 'secondary' : 'primary'}
                  size="md"
                  pill
                  className="w-full"
                  asChild
                >
                  <Link href={plan.cta === 'Contact Sales' ? '/demo' : '/signup'}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Bottom CTA */}
        <FadeUp delay={0.4}>
          <div className="text-center">
            <p className="text-white/70 mb-6">
              All plans include 14-day free trial. No credit card required.
            </p>
            <Button
              variant="accent"
              size="hero"
              pill
              className="bg-white text-[#0D3B21] hover:bg-white/90"
              asChild
            >
              <Link href="/signup">
                Start Free Trial — Includes WhatsApp Automation
              </Link>
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
