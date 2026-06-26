// FlockIQ — Pain Amplification Section (v3.0)
// File: apps/web/components/home/PainSection.tsx
// Version: v3.0 | June 2026
// Task Reference: HOME-REMAINING-001
// Requirements: FR-HOME-003
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §H-03

'use client';

import { useState } from 'react';
import { Clock, TrendingDown, ArrowRight, MessageSquare, AlertTriangle as Warning } from 'lucide-react'
import { FadeUp } from '@/components/motion/FadeUp';
import { Card } from '@/components/ui/Card';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';
import { formatIndianCurrency } from '@/lib/utils';

// Interactive loss calculator component
function LossCalculator() {
  const [birds, setBirds] = useState(25000);
  const [batches, setBatches] = useState(3);
  const timingLossPerBird = 2.5; // ₹2.5/bird average timing loss
  const annualLoss = birds * timingLossPerBird * batches;

  return (
    <div className="bg-white rounded-2xl border border-neutral-150 p-8 shadow-sm">
      <h3 className="font-sora font-bold text-neutral-900 text-[1.125rem] leading-[1.2] tracking-[-0.02em] mb-6">
        Calculate Your Annual Timing Loss
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Number of birds: <span className="text-brand-700 font-bold">{birds.toLocaleString('en-IN')}</span>
          </label>
          <input
            type="range"
            min={10000} max={200000} step={5000}
            value={birds}
            onChange={(e) => setBirds(Number(e.target.value))}
            className="w-full accent-brand-700"
            aria-label="Number of birds"
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>10K</span><span>200K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Batches per year: <span className="text-brand-700 font-bold">{batches}</span>
          </label>
          <div className="flex gap-2">
            {[2, 3, 4, 5].map((b) => (
              <button
                key={b}
                onClick={() => setBatches(b)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  batches === b
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-brand-400'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-signal-light rounded-xl p-5 text-center">
          <p className="text-sm text-neutral-600 mb-1">You lose annually</p>
          <p className="font-sora font-extrabold text-signal-700 text-[clamp(2.25rem,4vw,3rem)] leading-none tracking-[-0.04em]">
            {formatIndianCurrency(annualLoss)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">from timing loss (₹2.5/bird average)</p>
        </div>
      </div>

      <a
        href="/signup"
        className="mt-5 block w-full text-center bg-brand-700 hover:bg-brand-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
        onClick={() => (window as any).posthog?.capture('loss_calculator_cta_click', { birds, batches, annual_loss: annualLoss })}
      >
        Stop This Loss — 14 Days Free →
      </a>
    </div>
  );
}

export default function PainSection() {
  return (
    <SectionShell bg="tinted" ariaLabel="Problems FlockIQ solves">
      {/* Section Header */}
      <SectionHeader
        eyebrow="THE PROBLEM"
        heading="Most Poultry Operations Run on WhatsApp Groups and Gut Feel."
        headingHi="ज़्यादातर पोल्ट्री फार्म WhatsApp ग्रुप और अनुमान पर चलते हैं।"
        body='"Integrators managing 20+ farms lose hours every day calling farmers for data. Batch decisions are made on incomplete information. The result: underperforming flocks, timing losses, and missed opportunities."'
      />

        {/* Pain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: 2 Hours/Day Lost */}
          <FadeUp delay={0.1}>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                {/* Numbered indicator replaces the banned colored stripe */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-signal-light rounded-xl flex items-center justify-center text-signal-700">
                    <Clock size={24} />
                  </div>
                  <span className="font-sora font-extrabold text-2xl text-signal-500 tabular-nums leading-none">01</span>
                </div>
                <div>
                  <h3 className="font-jakarta font-semibold text-neutral-900 text-lg mb-2">
                    2 Hours/Day Lost
                  </h3>
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                    Integration managers spend 2+ hours daily calling farmers to
                    collect mortality, feed, and weight data. It's manual, error-prone,
                    and slows down decisions.
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    2 hrs × 250 farming days = 500 hours/year wasted
                  </p>
                </div>
              </div>
            </Card>
          </FadeUp>

          {/* Card 2: ₹50K–1.5L Lost Per Batch */}
          <FadeUp delay={0.2}>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                    <TrendingDown size={24} />
                  </div>
                  <span className="font-sora font-extrabold text-2xl text-red-500 tabular-nums leading-none">02</span>
                </div>
                <div>
                  <h3 className="font-jakarta font-semibold text-neutral-900 text-lg mb-2">
                    ₹50K–1.5L Lost Per Batch
                  </h3>
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                    Selling at the wrong time — even by 3–4 days — costs ₹2–4/kg on
                    a 25,000-bird flock. Compounded over 3 batches/year: over ₹1L gone.
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    Use the calculator below to see your loss
                  </p>
                </div>
              </div>
            </Card>
          </FadeUp>

          {/* Card 3: Disease Alerts Arrive Too Late */}
          <FadeUp delay={0.3}>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Warning size={24} />
                  </div>
                  <span className="font-sora font-extrabold text-2xl text-amber-500 tabular-nums leading-none">03</span>
                </div>
                <div>
                  <h3 className="font-jakarta font-semibold text-neutral-900 text-lg mb-2">
                    Disease Alerts Arrive Too Late
                  </h3>
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                    By the time HPAI news reaches a farm, transport bans are already
                    in place. A 48-hour early warning means the difference between
                    selling and losing an entire batch.
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    ₹3–5 lakh total loss risk per HPAI outbreak
                  </p>
                </div>
              </div>
            </Card>
          </FadeUp>
        </div>

        {/* Wide Card: The Data Collection Problem */}
        <FadeUp delay={0.4} className="mb-8">
          <Card className="p-8 bg-gradient-to-r from-white to-[#EDF7F1]">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-sora font-bold text-neutral-900 text-[1.25rem] leading-[1.2] tracking-[-0.02em] mb-3">
                  The Data Collection Problem
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  A farm manager with 8 farms makes 8 phone calls every evening.
                  Sometimes the farmer doesn't pick up. Sometimes they forget the
                  exact numbers. The data that arrives is incomplete, delayed, wrong.
                  And yet decisions worth lakhs are made on this data.
                </p>
              </div>
              <div className="space-y-4">
                {/* Old Way */}
                <div className="bg-white rounded-lg p-4 border border-neutral-200 text-sm">
                  <div className="flex items-center gap-2 mb-2 text-neutral-500 text-xs font-medium">
                    <MessageSquare size={14} />
                    <span>The Old Way</span>
                  </div>
                  <div className="space-y-1 text-neutral-700 font-mono text-xs">
                    <p>Manager: &quot;Ramesh bhai, aaj kitni muri? Khaana kitna?&quot;</p>
                    <p className="text-neutral-400">[No response at 7 PM...]</p>
                    <p className="text-neutral-400">[Retry at 8 PM...]</p>
                    <p>Ramesh: &quot;3 muri, 1200 kilo&quot;</p>
                    <p className="text-neutral-400">[Data entered manually: 9:22 PM]</p>
                    <p className="text-red-600">Manager: Daily loss estimate: unavailable today</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="text-brand-700" size={20} />
                </div>

                {/* FlockIQ Way */}
                <div className="bg-[#ECF8F1] rounded-lg p-4 border border-brand-200 text-sm">
                  <div className="flex items-center gap-2 mb-2 text-brand-700 text-xs font-medium">
                    <MessageSquare size={14} />
                    <span>FlockIQ Way</span>
                  </div>
                  <div className="space-y-1 text-neutral-700 font-mono text-xs">
                    <p>FlockIQ: &quot;Day 21 log: reply with [deaths] [feed kg]&quot;</p>
                    <p>Ramesh: &quot;2 1250 1680&quot; ← 6:03 PM</p>
                    <p className="text-brand-700">✅ Log auto-saved. FCR: 1.82 ✓ ← 6:03 PM (instant)</p>
                    <p className="text-brand-700">Manager sees: all 8 farms logged ← 6:10 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </FadeUp>

        {/* Loss Calculator */}
        <FadeUp delay={0.5} className="max-w-2xl mx-auto">
          <LossCalculator />
        </FadeUp>
    </SectionShell>
  );
}
