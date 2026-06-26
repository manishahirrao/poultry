// FlockIQ — About Page Client Component
// File: apps/web/app/(marketing)/about/AboutPageClient.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-001
// Requirements: FR-GLOBAL-001 (brand migration), Design Master v3.0

'use client';

import { Target, Shield, Newspaper, Lock, Globe, ArrowRight } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import Link from 'next/link';
import { FadeUp } from '@/components/motion/FadeUp';
import { CountUp } from '@/components/motion/CountUp';
import { Button } from '@/components/ui/Button';

export default function AboutPageClient() {
  const journey = [
    {
      phase: 'Phase 0',
      title: 'Gorakhpur Launch',
      description: 'FlockIQ launched in Gorakhpur district with 200+ early adopters. Validated 95%+ accuracy on holdout data. First farmer saved ₹3.2L from HPAI alert.',
      date: 'Q1 2026',
      achievement: '200+ farms',
    },
    {
      phase: 'Now',
      title: 'FlockIQ — Full Platform',
      description: 'Rebranded to FlockIQ — complete poultry management platform. Price intelligence is now one module in a full operational command centre. 500+ farms across 15 countries.',
      date: 'June 2026',
      achievement: '500+ farms, 15+ countries',
    },
    {
      phase: 'Phase 1',
      title: 'UP Expansion',
      description: '10 districts across Uttar Pradesh. WhatsApp Log Automation GA. Integrator analytics and multi-farm dashboard. 95%+ accuracy maintained across all regions.',
      date: 'Q3 2026',
      achievement: '10 districts, WhatsApp GA',
    },
    {
      phase: 'Phase 2',
      title: 'Pan-India Scale',
      description: '50+ districts across major poultry-producing states. Southeast Asia expansion to Indonesia, Vietnam, Thailand. Enterprise API and white-label solutions.',
      date: 'Q1 2027',
      achievement: '50+ districts, SE Asia',
    },
    {
      phase: 'Phase 3',
      title: 'Global Launch',
      description: '10+ countries across Asia, Africa, MENA. Full enterprise suite with IoT sensor integration. White-label partnerships with large integrators.',
      date: 'Q3 2027',
      achievement: '10+ countries, Enterprise',
    },
  ];

  return (
    <div className="min-h-screen bg-pageBg">
      {/* SECTION 1: Hero */}
      <section className="relative py-section-vertical bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-white opacity-50" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <FadeUp>
                <p className="text-brand-700 font-jakarta font-bold text-[11px] tracking-[0.16em] uppercase mb-4">
                  Our Story
                </p>
                <h1 className="font-sora font-extrabold text-[clamp(2.5rem, 5vw + 0.5rem, 4rem)] leading-[1.05] mb-6 text-neutral-900">
                  Built in Gorakhpur.<br />
                  <span className="text-brand-700">Deployed Globally.</span>
                </h1>
                <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.125rem)] text-neutral-600 max-w-xl leading-[1.7]">
                  We believe every poultry farmer — from UP to Jakarta — deserves the same information advantage that large processors have had for decades.
                </p>
              </FadeUp>
            </div>
            <FadeUp delay={0.2} className="lg:col-span-5 hidden lg:flex items-center justify-end">
              <div className="bg-brand-50 border border-brand-100 rounded-2xl px-8 py-6 max-w-xs">
                <p className="font-sora font-extrabold text-brand-700 text-5xl tabular-nums leading-none mb-2">500+</p>
                <p className="font-jakarta text-sm text-neutral-600">farms across 15 countries — built from a single district in UP</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* SECTION 2: Impact Numbers — use a bold stat row, not an icon card grid */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-16 max-w-xl">
            <p className="text-brand-700 font-jakarta font-bold text-[11px] tracking-[0.16em] uppercase mb-3">Our Impact</p>
            <h2 className="font-sora font-bold text-[clamp(2rem, 3vw + 0.5rem, 2.75rem)] text-neutral-900">
              Numbers that matter to farmers and integrators
            </h2>
          </FadeUp>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              { value: 500, suffix: '+', label: 'Farms Active', sub: 'India, SE Asia, MENA, Africa' },
              { value: 15, suffix: '+', label: 'Countries Served', sub: '4 continents' },
              { value: 500, suffix: '+ Cr', label: 'Advised Sales', sub: 'Total advised volume' },
              { value: 97, suffix: '%', label: 'WhatsApp Compliance', sub: 'vs 42% manual collection' },
            ].map((metric, index) => (
              <FadeUp key={index} delay={index * 0.08}>
                <div className={`py-8 px-6 ${index < 3 ? 'border-r border-neutral-200' : ''}`}>
                  <div className="font-sora font-extrabold text-brand-700 tabular-nums leading-none mb-2"
                    style={{ fontSize: 'clamp(2.75rem, 5vw, 4rem)' }}>
                    <CountUp end={metric.value} duration={1200} />
                    {metric.suffix}
                  </div>
                  <div className="font-jakarta font-semibold text-neutral-900 text-base mb-1">{metric.label}</div>
                  <div className="font-jakarta text-sm text-neutral-500">{metric.sub}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Our Mission (quote card) */}
      <section className="py-section-vertical bg-brand-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <p className="font-jakarta text-xl text-white/90 leading-relaxed text-center italic mb-6">
              "We believe every Indian poultry farmer deserves the same price intelligence and operational tools that large processors have had for decades. We built that — and made it accurate enough to stake our company on before charging a single rupee."
            </p>
            <p className="font-jakarta font-semibold text-white/70 text-center">
              — Founder, FlockIQ
            </p>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 4 + 5: Story + APMC — combined into one section for rhythm */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <p className="text-brand-700 font-jakarta font-bold text-[11px] tracking-[0.16em] uppercase mb-3">Our Story</p>
            <h2 className="font-sora font-bold text-[clamp(2rem, 3vw + 0.5rem, 2.75rem)] text-neutral-900">
              From one feature to a full platform
            </h2>
          </FadeUp>

          <div className="space-y-6 mb-16">
            <FadeUp delay={0.1}>
              <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-neutral-700 leading-[1.7]">
                FlockIQ started as FlockIQ in 2025 — a price forecasting tool for broiler farmers in Gorakhpur, UP. Within months, farmers and integrators started asking for more: "Can you track our FCR? Can you help us manage multiple farms?"
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-neutral-700 leading-[1.7]">
                We listened. We built batch tracking, WhatsApp log automation, multi-farm dashboards, health alerts, and full P&L tracking. What started as a single feature became a complete platform.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-neutral-700 leading-[1.7]">
                In 2026, we became FlockIQ — a complete poultry management platform. Price intelligence is still in our DNA, but it's now one module in a full operational command centre built for integrators and farms globally.
              </p>
            </FadeUp>
          </div>

          {/* APMC origin story — pulled in as a callout block */}
          <FadeUp delay={0.1}>
            <div className="pl-6 py-2 border-l-2 border-brand-300">
              <h3 className="font-sora font-bold text-xl text-neutral-900 mb-1">
                The 10 Days at Gorakhpur APMC
              </h3>
              <p className="text-sm text-neutral-500 mb-5">The validation that defined our company</p>
              <p className="font-jakarta text-base text-neutral-700 leading-relaxed mb-4">
                In November 2025, our CTO and Data Head spent 10 days at the Gorakhpur Agricultural Produce Market Committee (APMC). They didn't come to sell. They came to validate.
              </p>
              <p className="font-jakarta text-base text-neutral-700 leading-relaxed mb-4">
                Every morning at 6 AM, standing at the mandi gates, recording actual broker prices vs what farmers were offered. The gap: ₹8–12/kg. Every single day.
              </p>
              <p className="font-jakarta text-base text-neutral-900 font-semibold leading-relaxed">
                This is the information asymmetry FlockIQ was built to eliminate.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 6: Our Values — text-led with generous whitespace, not icon cards */}
      <section className="py-section-vertical bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-16">
            <p className="text-brand-700 font-jakarta font-bold text-[11px] tracking-[0.16em] uppercase mb-3">Our Values</p>
            <h2 className="font-sora font-bold text-[clamp(2rem, 3vw + 0.5rem, 2.75rem)] text-neutral-900">
              What we believe in
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                icon: Target,
                title: 'Farmer-First',
                description: 'Every decision starts with: "Does this help the farmer?" If not, we don\'t do it.',
              },
              {
                icon: Shield,
                title: 'Radical Transparency',
                description: 'We publish accuracy metrics publicly. Every day. Bad days included.',
              },
              {
                icon: Globe,
                title: 'Global by Default',
                description: 'Built for UP farmers, designed for the world. From day one.',
              },
            ].map((value, index) => (
              <FadeUp key={index} delay={index * 0.1}>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-brand-700 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <value.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-sora font-bold text-xl text-neutral-900 mb-3">{value.title}</h3>
                    <p className="font-jakarta text-neutral-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Our Team — horizontal list, not a card grid */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <p className="text-brand-700 font-jakarta font-bold text-[11px] tracking-[0.16em] uppercase mb-3">Our Team</p>
            <h2 className="font-sora font-bold text-[clamp(2rem, 3vw + 0.5rem, 2.75rem)] text-neutral-900">
              Leadership team building the future of poultry management
            </h2>
          </FadeUp>

          <div className="divide-y divide-neutral-150">
            {[
              { role: 'CTO', desc: 'IIT-trained ML engineer, 10+ years commodity forecasting', initials: 'CT' },
              { role: 'Head of Data', desc: 'AGMARKNET, NECC, IMD integration expert', initials: 'DD' },
              { role: 'Head of Product', desc: 'Hindi + English support, mobile-first UX for farmers', initials: 'PP' },
              { role: 'Head of Agriculture', desc: '30+ years Indian poultry industry experience', initials: 'AA' },
            ].map((team, index) => (
              <FadeUp key={team.role} delay={index * 0.08}>
                <div className="flex items-center gap-6 py-6">
                  <div className="w-12 h-12 bg-brand-700 rounded-full flex items-center justify-center text-white font-sora font-bold flex-shrink-0">
                    {team.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-sora font-semibold text-neutral-900">{team.role}</div>
                    <div className="font-jakarta text-sm text-neutral-500 mt-0.5">{team.desc}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: Data Partners — inline text list, not cards */}
      <section className="py-section-vertical bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <FadeUp className="lg:col-span-4">
              <p className="text-brand-700 font-jakarta font-bold text-[11px] tracking-[0.16em] uppercase mb-3">Data Partners</p>
              <h2 className="font-sora font-bold text-[clamp(1.75rem, 2.5vw + 0.5rem, 2.5rem)] text-neutral-900">
                Powered by verified government and institutional data
              </h2>
              <p className="font-jakarta text-neutral-600 mt-4 leading-relaxed">
                No black-box feeds. Every source is public and verifiable.
              </p>
            </FadeUp>

            <div className="lg:col-span-8">
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'AGMARKNET', desc: 'Agricultural market prices' },
                  { name: 'IMD', desc: 'Weather forecasts' },
                  { name: 'NECC', desc: 'Poultry industry data' },
                  { name: 'DAHDF', desc: 'Dept of Animal Husbandry' },
                  { name: 'NCDEX', desc: 'Commodity futures data' },
                ].map((partner, index) => (
                  <FadeUp key={partner.name} delay={index * 0.08}>
                    <div className="bg-white border border-neutral-200 rounded-xl px-5 py-4">
                      <div className="font-sora font-bold text-neutral-900 text-sm">{partner.name}</div>
                      <div className="font-jakarta text-xs text-neutral-500 mt-0.5">{partner.desc}</div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: Our Journey — clean left-border timeline */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <p className="text-brand-700 font-jakarta font-bold text-[11px] tracking-[0.16em] uppercase mb-3">Our Journey</p>
            <h2 className="font-sora font-bold text-[clamp(2rem, 3vw + 0.5rem, 2.75rem)] text-neutral-900">
              Where we've been, where we're going
            </h2>
          </FadeUp>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-brand-200" aria-hidden="true" />

            <div className="space-y-10">
              {journey.map((item, index) => (
                <FadeUp key={index} delay={index * 0.08}>
                  <div className="flex gap-8 items-start">
                    {/* Dot */}
                    <div className="flex-shrink-0 w-6 flex items-center justify-center pt-1.5">
                      <div className={`w-[22px] h-[22px] rounded-full border-2 ${item.phase === 'Now' ? 'bg-brand-700 border-brand-700' : 'bg-white border-brand-300'}`} />
                    </div>

                    <div className="flex-1 pb-2">
                      <div className="flex flex-wrap items-baseline gap-3 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${item.phase === 'Now' ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-700'}`}>
                          {item.phase}
                        </span>
                        <span className="text-xs text-neutral-400 font-medium">{item.date}</span>
                      </div>
                      <h3 className="font-sora font-bold text-lg text-neutral-900 mb-1">{item.title}</h3>
                      <p className="font-jakarta text-sm text-neutral-600 leading-relaxed">{item.description}</p>
                      {item.achievement && (
                        <p className="text-xs font-semibold text-brand-700 mt-2">✓ {item.achievement}</p>
                      )}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10 + 11: Press & Investor — combined, tighter spacing */}
      <section className="py-16 sm:py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Press */}
            <FadeUp>
              <div className="bg-white rounded-2xl p-8 border border-neutral-200">
                <Newspaper size={32} className="text-neutral-400 mb-5" />
                <h2 className="font-sora font-bold text-xl text-neutral-900 mb-2">Press & Media</h2>
                <p className="font-jakarta text-neutral-600 text-sm mb-6 leading-relaxed">
                  Press coverage working with leading agricultural publications. View our press kit and media resources.
                </p>
                <Button variant="primary" size="md" pill asChild>
                  <Link href="/press">
                    View Press Kit
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </FadeUp>

            {/* Investor */}
            <FadeUp delay={0.1}>
              <div className="bg-brand-700 rounded-2xl p-8">
                <Lock size={32} className="text-brand-300 mb-5" />
                <h2 className="font-sora font-bold text-xl text-white mb-2">Investor Information</h2>
                <p className="font-jakarta text-white/70 text-sm mb-6 leading-relaxed">
                  Detailed financials, metrics, and growth projections. Password-protected data room.
                </p>
                <Button variant="secondary" size="md" pill asChild>
                  <a href="https://investor.flockiq.com" target="_blank" rel="noopener noreferrer">
                    <Lock size={16} />
                    Access Data Room
                  </a>
                </Button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-vertical bg-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="font-sora font-bold text-[clamp(2rem, 3vw + 0.5rem, 2.75rem)] mb-4">
              Join Our Mission
            </h2>
            <p className="font-jakarta text-lg text-brand-100 mb-8">
              Help us transform poultry farming globally, one farm at a time
            </p>
            <Button variant="accent" size="hero" pill asChild>
              <Link href="/signup">
                Start Free Trial — 14 Days
                <ArrowRight size={18} />
              </Link>
            </Button>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
