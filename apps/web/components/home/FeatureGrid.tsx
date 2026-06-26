// FlockIQ AI — Feature Grid Section (v2.0)
// File: apps/web/components/home/FeatureGrid.tsx
// Redesigned: identical 12-card grid → differentiated hero + grouped layout
// Task Reference: TASK-WEB-007

'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';
import { useTranslation } from '../../app/(marketing)/i18n/useTranslation';
import SectionHeader from '@/components/ui/SectionHeader';

// 6 core features — reduced from 12.
// The remaining 51 features live at /features (the dedicated catalogue page).
const coreFeatures = [
  {
    icon: '📊',
    titleKey: 'home.featureGrid.features.0.title',
    descKey: 'home.featureGrid.features.0.description',
    href: '/features#price-intelligence',
    tier: 'FLOCKIQ_PRO',
    isHero: true,  // Full-width hero card
    stat: '96.2%',
    statLabel: 'directional accuracy',
  },
  {
    icon: '✅',
    titleKey: 'home.featureGrid.features.1.title',
    descKey: 'home.featureGrid.features.1.description',
    href: '/features#sell-intelligence',
    tier: 'FLOCKIQ_PRO',
    isHero: false,
  },
  {
    icon: '🧮',
    titleKey: 'home.featureGrid.features.2.title',
    descKey: 'home.featureGrid.features.2.description',
    href: '/features#sell-intelligence',
    tier: 'FLOCKIQ_PRO',
    isHero: false,
  },
  {
    icon: '🌾',
    titleKey: 'home.featureGrid.features.4.title',
    descKey: 'home.featureGrid.features.4.description',
    href: '/features#farm-operations',
    tier: 'FLOCKIQ_PRO',
    isHero: false,
  },
  {
    icon: '🦠',
    titleKey: 'home.featureGrid.features.8.title',
    descKey: 'home.featureGrid.features.8.description',
    href: '/features#alerts-intelligence',
    tier: 'FLOCKIQ_PRO',
    isHero: false,
  },
  {
    icon: '🔗',
    titleKey: 'home.featureGrid.features.11.title',
    descKey: 'home.featureGrid.features.11.description',
    href: '/features#integrations',
    tier: 'FLOCKIQ_PRO',
    isHero: false,
  },
];

export default function FeatureGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const heroFeature = coreFeatures[0];
  const supportingFeatures = coreFeatures.slice(1);

  return (
    <section ref={sectionRef} className="py-section-vertical bg-neutral-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="CAPABILITIES"
          heading={t('home.featureGrid.title') as string}
          body={t('home.featureGrid.subtitle') as string}
          align="left"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hero card — spans 5 columns on desktop, full width on mobile */}
          <motion.a
            href={heroFeature.href}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 group bg-brand-700 text-white rounded-2xl p-8 flex flex-col justify-between min-h-[320px] hover:bg-brand-600 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            <div>
              <span className="text-5xl mb-6 block" aria-hidden="true">{heroFeature.icon}</span>
              <h3 className="font-sora font-bold text-[1.375rem] leading-[1.15] tracking-[-0.02em] mb-3">
                {t(heroFeature.titleKey)}
              </h3>
              <p className="font-jakarta text-white/75 text-[0.9375rem] leading-relaxed">
                {t(heroFeature.descKey)}
              </p>
            </div>
            <div className="mt-8 flex items-end justify-between">
              {heroFeature.stat && (
                <div>
                  <p className="font-sora font-extrabold text-brand-300 text-[2.5rem] leading-none tabular-nums">
                    {heroFeature.stat}
                  </p>
                  <p className="font-jakarta text-white/60 text-xs mt-1">{heroFeature.statLabel}</p>
                </div>
              )}
              <span className="inline-flex items-center text-white/80 text-sm font-semibold font-jakarta group-hover:text-white transition-colors">
                {t('home.featureGrid.learnMore')}
                <ArrowRight size={15} className="ml-1" />
              </span>
            </div>
          </motion.a>

          {/* Supporting features — 5-column grid on the right (2 rows × 2-3 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {supportingFeatures.map((feature, index) => (
              <motion.a
                key={feature.titleKey}
                href={feature.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.07 }}
                className="group bg-white border border-neutral-200 rounded-xl p-6 flex flex-col hover:border-brand-400 hover:-translate-y-0.5 hover:shadow-brand-tint transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
              >
                {/* Icon + tier badge side by side */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl" aria-hidden="true">{feature.icon}</span>
                  {feature.tier === 'Enterprise' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Enterprise
                    </span>
                  )}
                </div>

                <h3 className="font-sora font-bold text-[1rem] leading-[1.2] tracking-[-0.015em] text-neutral-900 mb-2">
                  {t(feature.titleKey)}
                </h3>

                <p className="font-jakarta text-sm text-neutral-600 leading-relaxed flex-1 line-clamp-2">
                  {t(feature.descKey)}
                </p>

                <div className="mt-4 flex items-center text-brand-700 text-[0.8125rem] font-semibold font-jakarta opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {t('home.featureGrid.learnMore')}
                  <ArrowRight size={14} className="ml-1" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* See all features link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <a
            href="/features"
            className="inline-flex items-center gap-2 font-jakarta text-[0.9375rem] font-semibold text-brand-700 hover:text-brand-600 transition-colors"
          >
            See all 57 features
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
