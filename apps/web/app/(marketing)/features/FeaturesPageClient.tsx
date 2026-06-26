// FlockIQ — Features Page (v3.0)
// File: apps/web/app/(marketing)/features/page.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 04
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-FEAT-001

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FEATURE_MODULES, TOTAL_FEATURE_COUNT, COMPARISON_TABLE, getTierBadgeColor } from '../lib/features';
import { useTranslation } from '../i18n/useTranslation';

export default function FeaturesPage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('');
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Intersection Observer for active section highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -70% 0px' }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (anchorId: string) => {
    const element = document.querySelector(anchorId);
    if (element) {
      const navHeight = 72; // --nav-height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Handle initial hash scroll on page load (e.g. navigating from /features#price-intelligence)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // Defer until after paint so section elements are in the DOM
    const timer = setTimeout(() => {
      scrollToSection(hash);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-sora font-extrabold text-[clamp(2.5rem,5vw,4rem)] leading-[1.04] tracking-[-0.035em] text-neutral-900 mb-4">
            {t('features.hero.title')}
          </h1>
          <p className="font-jakarta text-[clamp(1rem,1.5vw+0.5rem,1.375rem)] text-neutral-600 mb-6 leading-[1.7] max-w-[60ch] mx-auto">
            {t('features.hero.subtitle')}
          </p>
          <p className="font-jakarta text-[clamp(0.9375rem,0.5vw+0.75rem,1.0625rem)] text-neutral-500 max-w-3xl mx-auto leading-relaxed">
            {t('features.hero.description')}
          </p>
        </motion.div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="lg:flex lg:gap-12">
          {/* Sticky Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              <h3 className="font-jakarta text-[11px] font-bold text-neutral-500 uppercase tracking-[0.14em] mb-4">
                {t('features.sidebar.title')}
              </h3>
              <nav className="space-y-1">
                {FEATURE_MODULES.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => scrollToSection(module.anchorId)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-jakarta text-[0.875rem] font-medium transition-colors ${
                      activeSection === module.id
                        ? 'bg-brand-green-50 text-brand-green-700 font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    {module.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {FEATURE_MODULES.map((module, moduleIndex) => (
              <section
                key={module.id}
                id={module.id}
                ref={(el) => {
                  sectionRefs.current[moduleIndex] = el;
                }}
                className="mb-20 scroll-mt-24"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: moduleIndex * 0.1 }}
                >
                  {/* Module Header */}
                  <div className="mb-8">
                    <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.5rem)] leading-[1.1] tracking-[-0.025em] text-neutral-900 mb-3">
                      {module.title}
                    </h2>
                    <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.125rem)] text-neutral-600 max-w-3xl leading-[1.7]">
                      {module.description}
                    </p>
                  </div>

                  {/* Feature Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {module.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                        className="group bg-white border border-neutral-200 rounded-xl p-6 hover:border-brand-green-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                      >
                        {/* Icon and Tier Badge */}
                        <div className="flex items-start justify-between mb-4">
                          {feature.icon && (
                            <span className="text-4xl">{feature.icon}</span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getTierBadgeColor(
                              feature.tier
                            )}`}
                          >
                            {feature.tier}
                          </span>
                        </div>

                        {/* Feature Name */}
                        <h3 className="font-sora font-bold text-[1.0625rem] leading-[1.2] tracking-[-0.015em] text-neutral-900 mb-3">
                          {feature.name}
                        </h3>

                        {/* Description */}
                        <p className="font-jakarta text-neutral-600 text-[0.875rem] mb-4 leading-relaxed">
                          {feature.description}
                        </p>

                        {/* Benefit */}
                        <div className="font-jakarta text-[0.875rem] font-semibold text-brand-green-700">
                          {feature.benefit}
                        </div>

                        {/* Screenshot Placeholder */}
                        <div className="mt-4 bg-neutral-50 rounded-lg h-24 flex items-center justify-center border border-neutral-200">
                          <span className="text-xs text-neutral-400">Product Screenshot</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>
            ))}

            {/* Comparison Table Section */}
            <section id="comparison" className="mt-24 scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-8">
                  <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.5rem)] leading-[1.1] tracking-[-0.025em] text-neutral-900 mb-3">
                    {t('features.comparison.title')}
                  </h2>
                  <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.125rem)] text-neutral-600 max-w-3xl leading-[1.7]">
                    {t('features.comparison.description')}
                  </p>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto rounded-xl border border-neutral-200">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-4 text-left font-jakarta text-[0.8125rem] font-semibold text-neutral-900 sticky left-0 bg-neutral-50">
                          {t('features.comparison.feature')}
                        </th>
                        <th className="px-6 py-4 text-center font-jakarta text-[0.8125rem] font-semibold text-neutral-900">
                          {t('features.comparison.manual')}
                        </th>
                        <th className="px-6 py-4 text-center font-jakarta text-[0.8125rem] font-semibold text-neutral-900">
                          {t('features.comparison.genericErp')}
                        </th>
                        <th className="px-6 py-4 text-center font-jakarta text-[0.8125rem] font-semibold text-brand-green-700 bg-brand-green-50">
                          {t('features.comparison.FlockIQ')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {COMPARISON_TABLE.map((row, index) => (
                        <tr key={index} className="bg-white hover:bg-neutral-50">
                          <td className="px-6 py-4 font-jakarta text-[0.875rem] text-neutral-900 font-medium sticky left-0 bg-white hover:bg-neutral-50">
                            {row.feature}
                          </td>
                          <td className="px-6 py-4 font-jakarta text-[0.875rem] text-center text-neutral-600">
                            {row.manual}
                          </td>
                          <td className="px-6 py-4 font-jakarta text-[0.875rem] text-center text-neutral-600">
                            {row.genericErp}
                          </td>
                          <td className="px-6 py-4 font-jakarta text-[0.875rem] text-center text-brand-green-700 font-medium bg-brand-green-50/50">
                            {row.FlockIQ}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CTA */}
                <div className="mt-8 text-center">
                  <a
                    href="/pricing"
                    className="inline-flex items-center px-6 py-3 bg-brand-green-700 text-white font-semibold rounded-full hover:bg-brand-green-800 transition-colors"
                  >
                    {t('features.comparison.cta')}
                  </a>
                </div>
              </motion.div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
