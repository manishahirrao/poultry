// FlockIQ — WhatsApp Log Automation Farmer Input Examples
// File: apps/web/app/(marketing)/features/whatsapp-log/_components/FarmerInputExamples.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md PAGE B-01 SECTION B-01-03

'use client';

import { useState } from 'react';
import { FadeUp } from '@/components/motion/FadeUp';

type InputType = 'all' | 'standard' | 'hindi' | 'shorthand' | 'medicine';

interface ValidInput {
  input: string;
  parsed: string;
  type: 'standard' | 'hindi' | 'shorthand' | 'medicine' | 'minimal' | 'mixed';
}

const VALID_INPUTS: ValidInput[] = [
  { input: '2 1250 1680', parsed: '✓ Deaths: 2 | Feed: 1250kg | Weight: 1680g', type: 'standard' },
  { input: '2 murgi mri, 1250 kg khaana', parsed: '✓ Deaths: 2 | Feed: 1250kg', type: 'hindi' },
  { input: 'all good 1350', parsed: '✓ Deaths: 0 | Feed: 1350kg', type: 'shorthand' },
  { input: 'sab theek 1200', parsed: '✓ Deaths: 0 | Feed: 1200kg', type: 'hindi' },
  { input: '0 1100 1750g', parsed: '✓ Deaths: 0 | Feed: 1100kg | Weight: 1750g', type: 'standard' },
  { input: 'ek muri, 1300', parsed: '✓ Deaths: 1 | Feed: 1300kg', type: 'hindi' },
  { input: '3 deaths 1450 kilo', parsed: '✓ Deaths: 3 | Feed: 1450kg', type: 'mixed' },
  { input: '1200', parsed: '✓ Deaths: 0 | Feed: 1200kg', type: 'minimal' },
  { input: 'MEDICINE Tylosin 2ml/L Day5-8', parsed: '✓ Treatment logged: Tylosin | Withdrawal: Day 15', type: 'medicine' },
  { input: 'ok d:1 f:1380 w:1690', parsed: '✓ Deaths: 1 | Feed: 1380kg | Weight: 1690g', type: 'shorthand' },
];

const TYPE_BADGES: Record<ValidInput['type'], { label: string; color: string }> = {
  standard: { label: 'Standard', color: 'bg-neutral-200 text-neutral-700' },
  hindi: { label: 'Hindi', color: 'bg-signal-light text-signal-700' },
  shorthand: { label: 'Shorthand', color: 'bg-brand-50 text-brand-700' },
  medicine: { label: 'Medicine', color: 'bg-amber-100 text-amber-700' },
  minimal: { label: 'Minimal', color: 'bg-neutral-200 text-neutral-700' },
  mixed: { label: 'Mixed', color: 'bg-neutral-200 text-neutral-700' },
};

const FILTER_TABS: { id: InputType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'standard', label: 'Standard' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'shorthand', label: 'Shorthand' },
  { id: 'medicine', label: 'Medicine' },
];

export function FarmerInputExamples() {
  const [activeFilter, setActiveFilter] = useState<InputType>('all');

  const filteredInputs = activeFilter === 'all'
    ? VALID_INPUTS
    : VALID_INPUTS.filter((item) => item.type === activeFilter || (activeFilter === 'standard' && item.type === 'minimal'));

  return (
    <section className="py-24" style={{ background: '#0D3B21' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-sora">
              Every Way a Farmer Can Reply
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              FlockIQ understands all of these — no training required
            </p>
          </div>
        </FadeUp>

        {/* Filter Tabs */}
        <FadeUp delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === tab.id
                    ? 'bg-white text-brand-900'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </FadeUp>

        {/* Terminal Card */}
        <FadeUp delay={0.2}>
          <div
            className="rounded-2xl p-8 border"
            style={{
              background: '#0F2218',
              borderColor: 'rgba(61,174,114,0.25)',
            }}
          >
            {/* Terminal Header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-white/50 text-sm font-mono">whatsapp-parser.log</span>
            </div>

            {/* Input Rows */}
            <div className="space-y-4 font-mono">
              {filteredInputs.map((item, index) => {
                const badge = TYPE_BADGES[item.type];
                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm"
                  >
                    {/* Type Badge */}
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${badge.color} w-fit`}>
                      {badge.label}
                    </span>

                    {/* Farmer Input */}
                    <div className="flex-1 text-brand-400">
                      <span className="text-white/30 mr-2">{'>'}</span>
                      {item.input}
                    </div>

                    {/* Arrow */}
                    <span className="text-white/30 hidden sm:block">→</span>

                    {/* Parsed Result */}
                    <div className="text-white/60">
                      {item.parsed}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Terminal Footer */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <span className="animate-pulse">●</span>
                <span>Parser active — 10 formats supported</span>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Note */}
        <FadeUp delay={0.3}>
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm max-w-2xl mx-auto">
              Farmers can reply in Hindi, English, or mixed. Our NLP parser handles
              variations, abbreviations, and natural language — no training needed.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
