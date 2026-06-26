// FlockIQ — WhatsApp Log Feature Highlight Component (v3.0)
// File: apps/web/components/marketing/sections/WhatsAppLogSection.tsx
// Version: v3.0 | June 2026
// Task Reference: HOME-003
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §3.6 (Section H-06)
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §4.6 (FR-HOME-006)

'use client';

import { FadeUp } from '@/components/motion/FadeUp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { StepConnector } from '@/components/ui/StepConnector';
import Link from 'next/link';

const STEPS = [
  {
    icon: '🔔',
    number: '01',
    title: 'FlockIQ Sends a Daily Reminder',
    body: 'At your chosen time (default 6 PM), FlockIQ sends each farmer a structured WhatsApp message for their active batch. In Hindi or English — configurable per farm.',
    visual: 'WhatsApp outbound message screenshot',
  },
  {
    icon: '📱',
    number: '02',
    title: 'Farmer Replies in 10 Seconds',
    body: 'The farmer types 3 numbers: birds dead, feed kg, optional weight. Works on any Android. No new app to install. Natural language understood.',
    visual: 'Farmer hand with phone — WhatsApp reply',
  },
  {
    icon: '✅',
    number: '03',
    title: 'Data Auto-Logged. FCR Calculated.',
    body: 'Within 60 seconds, the reply is parsed, validated, and saved. FCR is auto-calculated. Anomalies are flagged. Integration manager sees confirmation instantly.',
    visual: 'Dashboard screenshot — log submitted badge',
  },
];

const BEFORE_AFTER = [
  { metric: 'Phone calls/evening', before: '8 calls', after: '0 calls', better: true },
  { metric: 'Log compliance rate', before: '42%', after: '97%', better: true },
  { metric: 'Data arrives by', before: '9:30 PM', after: '6:15 PM', better: true },
  { metric: 'FCR calculation', before: 'Manual (error-prone)', after: 'Automatic, instant', better: true },
  { metric: 'Admin time/day', before: '2 hours', after: '8 minutes', better: true },
];

export function WhatsAppLogSection() {
  return (
    <section className="bg-neutral-50 py-[clamp(5rem,8vw,9rem)]" aria-labelledby="whatsapp-log-heading">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <FadeUp className="text-center mb-16 max-w-3xl mx-auto">
          <Badge variant="whatsapp" className="mb-4">★ FLAGSHIP FEATURE</Badge>
          <h2
            id="whatsapp-log-heading"
            className="font-sora font-bold text-neutral-900 mb-4 tracking-[-0.03em] leading-[1.08]"
            style={{ fontSize: 'clamp(1.875rem, 3vw + 0.25rem, 3rem)' }}
          >
            Your Farmers Type 3 Numbers.
            <br />
            You See Everything.
          </h2>
          <p className="font-jakarta text-neutral-600 leading-[1.7]" style={{ fontSize: 'clamp(1rem, 0.5vw + 0.875rem, 1.125rem)' }}>
            FlockIQ's WhatsApp Daily Log Automation automatically collects farm data
            via WhatsApp — no app for the farmer, no calls for you.
          </p>
        </FadeUp>

        {/* 3 Steps */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16 relative">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex flex-col gap-4 relative">
              <FadeUp delay={i * 0.12}>
                <div className="bg-white rounded-2xl border border-neutral-150 p-8 shadow-sm h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl" aria-hidden="true">{step.icon}</span>
                    <span className="font-sora font-black text-brand-100 text-6xl leading-none tracking-tighter">{step.number}</span>
                  </div>
                  <h3 className="font-sora font-bold text-neutral-900 text-[1.0625rem] leading-[1.2] tracking-[-0.015em] mb-3">{step.title}</h3>
                  <p className="font-jakarta text-neutral-600 text-[0.9375rem] leading-relaxed">{step.body}</p>

                  {/* Step visual placeholder — replace with actual screenshots */}
                  <div className="mt-6 rounded-xl bg-neutral-50 border border-neutral-150 h-40 flex items-center justify-center text-neutral-400 text-sm">
                    {step.visual}
                  </div>
                </div>
              </FadeUp>

              {/* Animated connector between steps (hidden on mobile) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <StepConnector delay={i * 0.12 + 0.4} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Before / After comparison table */}
        <FadeUp>
          <div className="bg-white rounded-2xl border border-neutral-150 shadow-sm overflow-hidden max-w-2xl mx-auto mb-10">
            <div className="grid grid-cols-3 bg-neutral-50 border-b border-neutral-150">
              <div className="p-4 font-jakarta text-[0.8125rem] font-semibold text-neutral-600">Metric</div>
              <div className="p-4 font-jakarta text-[0.8125rem] font-semibold text-red-600 border-x border-neutral-150">Before FlockIQ</div>
              <div className="p-4 font-jakarta text-[0.8125rem] font-semibold text-brand-700">After FlockIQ</div>
            </div>
            {BEFORE_AFTER.map((row, i) => (
              <div key={row.metric} className={`grid grid-cols-3 ${i < BEFORE_AFTER.length - 1 ? 'border-b border-neutral-150' : ''}`}>
                <div className="p-4 font-jakarta text-sm text-neutral-700">{row.metric}</div>
                <div className="p-4 font-jakarta text-sm text-red-600 border-x border-neutral-150 font-medium">{row.before}</div>
                <div className="p-4 font-jakarta text-sm text-brand-700 font-semibold">{row.after} ✓</div>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* CTA */}
        <FadeUp className="text-center">
          <Button
            variant="primary"
            size="lg"
            pill
            onClick={() => (window as any).posthog?.capture('whatsapp_feature_cta_click', { section: 'homepage_whatsapp_section' })}
            asChild
          >
            <Link href="/features/whatsapp-log">See WhatsApp Automation in Detail →</Link>
          </Button>
        </FadeUp>
      </div>
    </section>
  );
}

