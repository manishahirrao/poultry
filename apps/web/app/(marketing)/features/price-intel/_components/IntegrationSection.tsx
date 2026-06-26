// FlockIQ — Integration Section
// File: apps/web/app/(marketing)/features/price-intel/_components/IntegrationSection.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-003 (Phase 9)

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Layers, TrendingUp, Calculator } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { FadeUp } from '@/components/motion/FadeUp';

export function IntegrationSection() {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="brand" className="mb-6">
              <Layers size={14} className="mr-1.5" />
              Built-in Integration
            </Badge>
            <h2 className="font-sora font-bold text-neutral-900 text-3xl sm:text-4xl lg:text-5xl mb-4">
              Price Intelligence + Farm Management
            </h2>
            <p className="text-lg text-neutral-600">
              When your FCR says sell in 3 days AND price signal says sell today — 
              FlockIQ shows you the ₹ difference so you can decide.
            </p>
          </div>
        </FadeUp>

        {/* Integration Visual */}
        <FadeUp delay={0.1}>
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-8 lg:p-12 border border-brand-200 shadow-sm">
              {/* Scenario */}
              <div className="mb-8">
                <h3 className="font-semibold text-neutral-900 text-lg mb-4">Scenario: Gorakhpur Broilers D-38</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Farm Management Data */}
                  <div className="bg-white rounded-xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Calculator className="w-5 h-5 text-brand-700" />
                      <span className="font-semibold text-neutral-900">Farm Management Data</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Current FCR:</span>
                        <span className="font-semibold text-neutral-900">1.82</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Daily Gain:</span>
                        <span className="font-semibold text-neutral-900">58g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Optimal Harvest:</span>
                        <span className="font-semibold text-brand-700">Day 41</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Est. Weight at D-41:</span>
                        <span className="font-semibold text-neutral-900">2.4kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Intelligence Data */}
                  <div className="bg-white rounded-xl p-6 border border-neutral-200">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-brand-700" />
                      <span className="font-semibold text-neutral-900">Price Intelligence</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Today's Price:</span>
                        <span className="font-semibold text-neutral-900">₹168/kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">D-41 Forecast:</span>
                        <span className="font-semibold text-red-600">₹162/kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Signal:</span>
                        <span className="font-semibold text-green-600">🟢 SELL NOW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Peak Window:</span>
                        <span className="font-semibold text-neutral-900">Today–Tomorrow</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI Comparison */}
              <div className="bg-brand-900 rounded-xl p-6 text-white">
                <h4 className="font-semibold text-lg mb-4">Batch ROI Optimizer</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-white/70 text-sm mb-2">Sell Today (D-38)</p>
                    <p className="text-2xl font-bold text-white mb-1">₹5,71,200</p>
                    <p className="text-white/60 text-xs">25,000 birds × 2.35kg × ₹168/kg</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm mb-2">Wait 3 Days (D-41)</p>
                    <p className="text-2xl font-bold text-white/80 mb-1">₹5,832,000</p>
                    <p className="text-white/60 text-xs">25,000 birds × 2.4kg × ₹162/kg</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-brand-400 font-semibold">
                    ⚠️ Price drop outweighs weight gain. Sell today for ₹39,200 more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Feature bullets */}
        <FadeUp delay={0.2}>
          <div className="max-w-3xl mx-auto mb-12">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'FCR + Price signal combined analysis',
                'Batch ROI Optimizer for sell decisions',
                'Historical accuracy per district',
                'Middleman offer verification',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-neutral-700">
                  <span className="w-2 h-2 rounded-full bg-brand-700 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* CTA */}
        <FadeUp delay={0.3}>
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} />}
              asChild
            >
              <Link href="/features/farm-management">
                Explore Farm Management →
              </Link>
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
