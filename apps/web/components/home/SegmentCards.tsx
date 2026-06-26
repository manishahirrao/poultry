// FlockIQ — Segment CTA Cards Section
// File: apps/web/components/home/SegmentCards.tsx
// Version: v1.1 | June 2026 — tokens + SectionShell + SectionHeader migrated
// Task Reference: TASK-WEB-009
// Requirements: REQ-WEB-001 §W1.13

'use client';

import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

interface SegmentCard {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  painPoint: string;
  priceRange: string;
  ctaLabel: string;
  ctaHref: string;
  accentColor: 'brand' | 'signal';
}

const segmentCards: SegmentCard[] = [
  {
    id: 1,
    icon: '🐓',
    title: 'Commercial Farm',
    subtitle: '10K–50K birds',
    painPoint: 'Lost ₹2–4/kg on timing this batch?',
    priceRange: '₹2,000–5,000/mo',
    ctaLabel: 'Free Trial →',
    ctaHref: '/login?action=signup&segment=commercial_farm',
    accentColor: 'brand',
  },
  {
    id: 2,
    icon: '🏭',
    title: 'Integrator',
    subtitle: '50K+ birds',
    painPoint: '20 farms, no central dashboard?',
    priceRange: '₹8,000–25,000/mo',
    ctaLabel: 'Request Demo →',
    ctaHref: '/demo',
    accentColor: 'brand',
  },
  {
    id: 3,
    icon: '🌾',
    title: 'Feed Company',
    subtitle: 'Regional mills',
    painPoint: 'Demand forecasting for production runs.',
    priceRange: '₹10,000+/mo',
    ctaLabel: 'Talk to Sales →',
    ctaHref: '/demo',
    accentColor: 'signal',
  },
  {
    id: 4,
    icon: '🏢',
    title: 'Enterprise',
    subtitle: 'QSR & Processors',
    painPoint: '30-day forward pricing. API-first.',
    priceRange: 'Custom pricing',
    ctaLabel: 'Request Demo →',
    ctaHref: '/demo',
    accentColor: 'signal',
  },
];

export default function SegmentCards() {
  return (
    <SectionShell bg="white" ariaLabel="Solutions for every segment">
      <SectionHeader
        eyebrow="WHO IT'S FOR"
        heading="Built for every link in the poultry chain"
        body="Whether you manage one farm or fifty — FlockIQ has a plan that fits."
        align="center"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {segmentCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="group relative bg-white border border-neutral-200 rounded-2xl p-6 overflow-hidden transition-shadow duration-200 hover:shadow-diffusion"
          >
            {/* Top reveal bar — animates in on hover instead of a static colored stripe */}
            <div
              className={`absolute top-0 left-0 right-0 h-0.5 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out ${
                card.accentColor === 'brand' ? 'bg-brand-400' : 'bg-signal-500'
              }`}
              aria-hidden="true"
            />

            <div className="text-4xl mb-4" aria-hidden="true">{card.icon}</div>

            <h3 className="font-sora font-bold text-[1.0625rem] leading-[1.2] tracking-[-0.015em] text-neutral-900 mb-1">{card.title}</h3>
            <p className="font-jakarta text-sm text-neutral-500 mb-4">{card.subtitle}</p>
            <p className="font-jakarta text-sm text-neutral-700 mb-4 min-h-[40px] leading-relaxed">{card.painPoint}</p>

            <p
              className={`font-jakarta text-sm font-semibold mb-6 ${
                card.accentColor === 'brand' ? 'text-brand-700' : 'text-signal-700'
              }`}
            >
              {card.priceRange}
            </p>

            <a
              href={card.ctaHref}
              onClick={() => {
                trackEvent('segment_cta_clicked', {
                  segment: card.title,
                  cta_type: card.ctaLabel.includes('Demo') ? 'demo' : 'trial',
                });
              }}
              className={`inline-flex items-center px-4 py-2 text-white text-sm font-semibold rounded-full transition-colors duration-200 ${
                card.accentColor === 'brand'
                  ? 'bg-brand-700 hover:bg-brand-600'
                  : 'bg-signal-500 hover:bg-signal-700'
              }`}
            >
              {card.ctaLabel}
            </a>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
