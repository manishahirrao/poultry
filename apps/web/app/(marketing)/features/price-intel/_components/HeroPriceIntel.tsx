// FlockIQ — Price Intelligence Hero Section
// File: apps/web/app/(marketing)/features/price-intel/_components/HeroPriceIntel.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-003 (Phase 9)
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { FadeUp } from '@/components/motion/FadeUp';

export function HeroPriceIntel() {
  return (
    <section className="relative bg-white pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'url(/textures/grain.svg)', backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Eyebrow - Secondary positioning */}
          <FadeUp delay={0}>
            <Badge variant="brand" className="mb-6">
              <TrendingUp size={14} className="mr-1.5" />
              Coming Soon — Private Beta Available
            </Badge>
          </FadeUp>

          {/* Headline */}
          <FadeUp delay={0.1}>
            <h1 className="font-sora font-extrabold text-neutral-900 leading-[1.1] mb-6" style={{ fontSize: 'clamp(2.25rem, 4vw + 0.5rem, 3.75rem)' }}>
              Know When to Sell —<br />
              <span className="text-brand-700">7 Days Before the Market Does</span>
            </h1>
          </FadeUp>

          {/* Subheadline - Positioning note */}
          <FadeUp delay={0.2}>
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed mb-8 max-w-3xl">
              Price intelligence is <strong className="text-neutral-900">built in</strong> to FlockIQ — not bolted on. 
              Get AI-powered price forecasts, sell signals, and market insights delivered every morning via WhatsApp.
            </p>
          </FadeUp>

          {/* CTAs */}
          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
                asChild
              >
                <Link href="/accuracy">
                  See Accuracy Dashboard →
                </Link>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                asChild
              >
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </FadeUp>

          {/* Trust micro-text */}
          <FadeUp delay={0.4}>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-neutral-500 text-sm">
              {['96.2% directional accuracy', 'Verified in private beta', 'Updated daily', 'India + SE Asia coverage'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="text-brand-700" aria-hidden="true">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
          <path d="M0 64L480 32L960 48L1440 0V64H0Z" fill="#F7FAF8" />
        </svg>
      </div>
    </section>
  );
}
