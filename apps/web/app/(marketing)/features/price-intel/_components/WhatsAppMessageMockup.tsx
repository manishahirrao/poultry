// FlockIQ — WhatsApp Message Mockup Section
// File: apps/web/app/(marketing)/features/price-intel/_components/WhatsAppMessageMockup.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-003 (Phase 9)

'use client';

import { motion } from 'framer-motion';
import { MessageSquare, TrendingUp, AlertCircle } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { FadeUp } from '@/components/motion/FadeUp';

export function WhatsAppMessageMockup() {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-sora font-bold text-neutral-900 text-3xl sm:text-4xl lg:text-5xl mb-4">
              What You Get Every Morning
            </h2>
            <p className="text-lg text-neutral-600">
              Daily price intelligence delivered to your WhatsApp at 6:30 AM — before markets open.
            </p>
          </div>
        </FadeUp>

        {/* WhatsApp Message Mockup */}
        <FadeUp delay={0.2}>
          <div className="max-w-md mx-auto">
            {/* Phone Frame */}
            <div className="bg-neutral-900 rounded-[2.5rem] p-3 shadow-2xl">
              {/* Screen */}
              <div className="bg-[#E5DDD5] rounded-[2rem] overflow-hidden">
                {/* WhatsApp Header */}
                <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">FlockIQ</p>
                    <p className="text-white/70 text-xs">Price Intelligence</p>
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-4 space-y-3">
                  {/* Message Bubble */}
                  <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-sm">
                    <p className="text-neutral-900 text-sm font-semibold mb-2">
                      🐔 FlockIQ — Gorakhpur Belt | June 2, 2026
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Today:</span>
                        <span className="font-semibold text-neutral-900">₹168/kg <span className="text-green-600">↑ (+₹4)</span></span>
                      </div>
                      
                      <div className="border-t border-neutral-200 pt-2">
                        <p className="text-neutral-600 text-xs mb-1">7-Day Forecast (P10–P90):</p>
                        <p className="font-semibold text-neutral-900">₹161 — ₹175</p>
                      </div>
                      
                      <div className="border-t border-neutral-200 pt-2">
                        <p className="text-neutral-600 text-xs mb-1">Most likely (P50):</p>
                        <p className="font-semibold text-neutral-900">₹168/kg</p>
                      </div>

                      {/* Signal */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-700">🟢 SELL NOW</span>
                        </div>
                        <p className="text-green-800 text-xs">
                          Price peak window: Today–Tomorrow
                        </p>
                      </div>

                      {/* Why */}
                      <div className="bg-neutral-50 rounded-lg p-3 mt-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                          <p className="text-neutral-700 text-xs">
                            <span className="font-semibold">Why:</span> Festival demand + cold weather + low UP supply
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <p className="text-neutral-400 text-xs mt-3 text-right">6:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Feature bullets below mockup */}
        <FadeUp delay={0.3}>
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'P10/P50/P90 confidence bands',
                'Historical accuracy tracking',
                'Market trend explanations',
                'Actionable sell/hold signals',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-neutral-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-700" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
