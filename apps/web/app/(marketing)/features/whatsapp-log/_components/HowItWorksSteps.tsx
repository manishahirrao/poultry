// FlockIQ — WhatsApp Log Automation How It Works Steps
// File: apps/web/app/(marketing)/features/whatsapp-log/_components/HowItWorksSteps.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md PAGE B-01 SECTION B-01-02

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Smartphone, BarChart3, ChevronRight } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { FadeUp } from '@/components/motion/FadeUp';

const STEPS = [
  {
    id: 1,
    icon: MessageCircle,
    title: 'FlockIQ Sends Reminder',
    body: 'At your configured time (e.g., 6:30 PM), FlockIQ sends a WhatsApp message to each farmer for their active batch. Message is in Hindi or English based on farm preference.',
  },
  {
    id: 2,
    icon: Smartphone,
    title: 'Farmer Replies with 3 Numbers',
    body: 'The farmer replies with birds dead, feed kg, and optional weight. Natural language parser understands variations like "2 1250 1680" or "2 deaths, 1250kg feed".',
  },
  {
    id: 3,
    icon: BarChart3,
    title: 'Data Auto-Logged & FCR Calculated',
    body: 'Within 60 seconds, the reply is parsed, validated, and saved to the batch record. FCR is automatically calculated. Manager sees updated dashboard instantly.',
  },
];

export function HowItWorksSteps() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepId = parseInt((entry.target as HTMLElement).dataset.stepId || '0');
            setVisibleSteps((prev) => {
              if (!prev.includes(stepId)) {
                return [...prev, stepId];
              }
              return prev;
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px' }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 font-sora">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Three simple steps to automate your daily farm data collection
            </p>
          </div>
        </FadeUp>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isVisible = visibleSteps.includes(step.id);
            const showConnector = index < STEPS.length - 1 && isVisible;

            return (
              <div key={step.id} ref={(el) => { if (el) stepRefs.current[index] = el; }} data-step-id={step.id}>
                <FadeUp delay={index * 0.1}>
                  <div className="relative">
                    {/* Background Number */}
                    <div className="absolute -top-4 -left-4 text-[120px] font-bold text-brand-100 opacity-50 font-sora pointer-events-none">
                      0{step.id}
                    </div>

                    {/* Step Card */}
                    <div className="relative bg-white border border-neutral-200 rounded-2xl p-8 hover:border-brand-400 hover:shadow-lg transition-all duration-300">
                      {/* Icon */}
                      <div className="relative w-16 h-16 bg-brand-50 rounded-xl flex items-center justify-center mb-6">
                        <Icon size={32} className="text-brand-700" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-neutral-900 mb-3 font-jakarta">
                        {step.title}
                      </h3>

                      {/* Body */}
                      <p className="text-neutral-600 leading-relaxed">
                        {step.body}
                      </p>
                    </div>

                    {/* Connector Arrow */}
                    {showConnector && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-brand-300"
                        style={{ transform: 'translateY(-50%)' }}
                      >
                        <ChevronRight
                          size={16}
                          className="text-brand-400 absolute -right-1 top-1/2 -translate-y-1/2"
                        />
                      </motion.div>
                    )}
                  </div>
                </FadeUp>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <FadeUp delay={0.4}>
          <div className="mt-16 text-center">
            <p className="text-neutral-600 mb-6">
              Ready to eliminate 2 hours of daily data collection?
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-brand-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-brand-600 transition-colors shadow-[0_4px_16px_rgba(26,92,52,0.25)] hover:shadow-[0_6px_24px_rgba(26,92,52,0.35)]"
            >
              Start Free Trial — Includes WhatsApp Automation
              <ChevronRight size={18} />
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
