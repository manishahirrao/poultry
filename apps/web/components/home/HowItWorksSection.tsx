// FlockIQ — How It Works Section
// File: apps/web/components/home/HowItWorksSection.tsx
// Version: v3.1 | June 2026 — tokens + SectionShell + SectionHeader migrated
// Task Reference: HOME-003
// Requirements: FR-HOME-003
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Database, Brain, DeviceMobile, TrendUp, TrendDown, CheckCircle } from '@phosphor-icons/react';
import Image from 'next/image';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

interface Step {
  id: number;
  icon: React.ReactNode;
  titleEn: string;
  description: string;
  visual: React.ReactNode;
}

const steps: Step[] = [
  {
    id: 1,
    icon: <Database size={32} />,
    titleEn: 'AGMARKNET, NECC, IMD, feed rates — all public data, all updated daily.',
    description: 'We pull from 47 public sources every morning — mandi prices, weather, feed costs, disease alerts — so you never have to.',
    visual: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-neutral-700">
          <TrendUp size={16} className="text-brand-500" />
          <span>Gorakhpur mandi price ↑</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-700">
          <TrendDown size={16} className="text-red-600" />
          <span>Deoria mandi price ↓</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-700">
          <CheckCircle size={16} className="text-amber-500" />
          <span>Weather alert (day 35–42) ↑</span>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    icon: <Brain size={32} />,
    titleEn: 'Trained on 2 years of broiler price data. 95.2% directional accuracy.',
    description: 'Our ensemble model runs at 5 AM and produces P10/P50/P90 forecasts for the next 7 days — verified in private beta.',
    visual: (
      <div className="text-center">
        <div
          className="font-sora font-extrabold text-signal-500 mb-2 tabular-nums"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          95.2%
        </div>
        <div className="text-sm text-neutral-600">Directional Accuracy</div>
        <div className="text-xs text-neutral-400 mt-1">Validated on 6-month Gorakhpur holdout</div>
      </div>
    ),
  },
  {
    id: 3,
    icon: <DeviceMobile size={32} />,
    titleEn: 'Sell today or wait — a clear action, every morning.',
    description: '7-day price forecast (Coming Soon) with a clear sell or hold signal — delivered via WhatsApp. No app required for the farmer.',
    visual: (
      <div
        className="rounded-xl p-4 text-white max-w-xs"
        style={{ backgroundColor: 'var(--whatsapp-green)' }}
      >
        <div className="text-sm font-semibold mb-2">🐔 Today's Price — Gorakhpur</div>
        <div className="text-2xl font-bold mb-1">₹168/kg</div>
        <div className="text-xs opacity-90 mb-2">(₹161–₹175 likely range)</div>
        <div className="text-sm font-semibold text-neutral-200">Signal: 🚧 PRIVATE BETA</div>
        <div className="text-xs opacity-90 mt-1">Cobb 400, Day 38, 2.2 kg</div>
        <div className="text-xs opacity-90 mt-2">—FlockIQ</div>
      </div>
    ),
  },
];

export default function HowItWorksSection() {
  const [, setActiveStep] = useState(1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(index + 1); },
        { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' },
      );
      observer.observe(ref);
      return observer;
    });
    return () => { observers.forEach((o) => o?.disconnect()); };
  }, []);

  const setStepRef = (index: number) => (el: HTMLDivElement | null) => {
    stepRefs.current[index] = el;
  };

  return (
    <SectionShell bg="tinted" ariaLabel="How FlockIQ works">
      {/* Section Header — asymmetric, two-column callout */}
      <div className="grid lg:grid-cols-12 gap-12 items-start mb-16">
        <div className="lg:col-span-8">
          <SectionHeader
            eyebrow="HOW IT WORKS"
            heading="4:30 AM to 6:30 AM — You Don't Have to Do Anything"
            body="We handle everything. You just check your WhatsApp."
            mb="sm"
            animate
          />
        </div>
        <div className="lg:col-span-4 lg:pt-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-neutral-150 shadow-sm"
          >
            <p className="text-[11px] font-jakarta font-semibold text-neutral-500 uppercase tracking-[0.16em] mb-2">
              Time saved daily
            </p>
            <p
              className="font-sora font-extrabold text-signal-500 tabular-nums leading-none mb-1"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              2 hrs
            </p>
            <p className="text-sm text-neutral-600">from manual mandi calling</p>
          </motion.div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-24">
        {steps.map((step, index) => (
          <div key={step.id} ref={setStepRef(index)} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1, type: 'spring', stiffness: 100, damping: 20 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Step number badge */}
              <div className="absolute -top-10 left-0 w-14 h-14 bg-brand-700 rounded-full flex items-center justify-center text-white font-sora font-extrabold text-xl shadow-brand-tint">
                {step.id}
              </div>

              {/* Content */}
              <div className={index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
                <div className="flex items-center gap-3 mb-5 mt-4">
                  <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center text-brand-700">
                    {step.icon}
                  </div>
                  <span className="text-[11px] font-jakarta font-bold uppercase tracking-[0.16em] text-brand-700">
                    STEP {step.id}
                  </span>
                </div>

                <h3 className="font-sora font-bold text-neutral-900 text-[1.125rem] leading-[1.25] tracking-[-0.02em] mb-3">
                  {step.titleEn}
                </h3>
                <p className="font-jakarta text-[0.9375rem] text-neutral-600 leading-relaxed">
                  {step.description}
                </p>

                {step.id === 3 && (
                  <a
                    href="/try-whatsapp"
                    className="inline-flex items-center mt-6 px-6 py-3 text-white font-semibold rounded-full transition-colors duration-200"
                    style={{ backgroundColor: 'var(--whatsapp-green)' }}
                  >
                    Try WhatsApp Demo →
                  </a>
                )}
              </div>

              {/* Visual */}
              <div className={index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}>
                <div className="bg-white rounded-2xl p-8 shadow-diffusion border border-neutral-150 relative overflow-hidden">
                  {/* Faint background image */}
                  <div className="absolute inset-0 opacity-[0.08]">
                    {step.id === 1 && (
                      <Image
                        src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80"
                        alt=""
                        aria-hidden="true"
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    {step.id === 2 && (
                      <Image
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80"
                        alt=""
                        aria-hidden="true"
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    {step.id === 3 && (
                      <Image
                        src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80"
                        alt=""
                        aria-hidden="true"
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="relative z-10">{step.visual}</div>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
