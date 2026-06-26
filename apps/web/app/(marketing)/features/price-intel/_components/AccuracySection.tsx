// FlockIQ — Accuracy Section
// File: apps/web/app/(marketing)/features/price-intel/_components/AccuracySection.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-003 (Phase 9)

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingUp } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { FadeUp } from '@/components/motion/FadeUp';
import { CountUp } from '@/components/motion/CountUp';

export function AccuracySection() {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-brand-900 text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <div>
            <FadeUp>
              <Badge variant="glass" className="mb-6">
                <CheckCircle size={14} className="mr-1.5" />
                Verified Performance
              </Badge>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h2 className="font-sora font-bold text-white text-3xl sm:text-4xl lg:text-5xl mb-6">
                96.2% Directional Accuracy
              </h2>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                Verified on 847 predictions across 15+ districts. Our model doesn't just predict prices — 
                it tells you whether prices will go up or down, so you can make the right sell decision.
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="space-y-4 mb-8">
                {[
                  'Updated daily with latest market data',
                  'Transparent methodology — no black box',
                  'Historical accuracy dashboard available',
                  'Confidence bands for risk assessment',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-white/90">
                    <span className="w-5 h-5 rounded-full bg-brand-700 flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} className="text-brand-400" />
                    </span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.4}>
              <Button
                variant="accent"
                size="lg"
                icon={<ArrowRight size={18} />}
                asChild
              >
                <Link href="/accuracy">
                  View Full Accuracy Dashboard →
                </Link>
              </Button>
            </FadeUp>
          </div>

          {/* Right - Stats */}
          <div className="grid grid-cols-2 gap-6">
            <FadeUp delay={0.2}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-brand-400" />
                  <span className="text-white/60 text-sm uppercase tracking-wider">Directional</span>
                </div>
                <div className="text-4xl sm:text-5xl font-sora font-bold text-white mb-1">
                  <CountUp end={96.2} decimals={1} suffix="%" />
                </div>
                <p className="text-white/60 text-sm">Accuracy</p>
              </motion.div>
            </FadeUp>

            <FadeUp delay={0.3}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-brand-400" />
                  <span className="text-white/60 text-sm uppercase tracking-wider">Verified</span>
                </div>
                <div className="text-4xl sm:text-5xl font-sora font-bold text-white mb-1">
                  <CountUp end={847} />
                </div>
                <p className="text-white/60 text-sm">Predictions</p>
              </motion.div>
            </FadeUp>

            <FadeUp delay={0.4}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/60 text-sm uppercase tracking-wider">Coverage</span>
                </div>
                <div className="text-4xl sm:text-5xl font-sora font-bold text-white mb-1">
                  <CountUp end={15} suffix="+" />
                </div>
                <p className="text-white/60 text-sm">Districts</p>
              </motion.div>
            </FadeUp>

            <FadeUp delay={0.5}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/60 text-sm uppercase tracking-wider">Update</span>
                </div>
                <div className="text-4xl sm:text-5xl font-sora font-bold text-white mb-1">
                  Daily
                </div>
                <p className="text-white/60 text-sm">Refresh</p>
              </motion.div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
