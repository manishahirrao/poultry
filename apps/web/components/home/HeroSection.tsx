// FlockIQ — Hero Section
// File: apps/web/components/home/HeroSection.tsx
// Version: v3.0 | June 2026
// Task Reference: HOME-001, TEST-001
// Requirements: FR-HOME-001, FR-GLOBAL-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §3.1

'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';
import AccuracyBadge from '@/components/ui/AccuracyBadge';
import ProductMockup from './ProductMockup';
import PartnerLogoStrip from './PartnerLogoStrip';
import { useEffect, useState } from 'react';
import { trackHeroCtaClicked } from '@/lib/posthog-analytics';

export default function HeroSection() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const headline = language === 'hi' 
    ? 'अपना Poultry Farm चलाएं एक बड़े कॉर्पोरेट की तरह।'
    : 'Run Your Poultry Operation Like a Fortune 500 Company.';

  const subheadline = language === 'hi'
    ? 'FlockIQ आपको हर बैच पर पूरी दृश्यता देता है — FCR, mortality, weight, health — WhatsApp के माध्यम से स्वचालित रूप से डेटा संग्रह।'
    : 'FlockIQ gives integrators and farm managers complete visibility over every batch — FCR, mortality, weight, health — with daily data collected automatically via WhatsApp.';

  const primaryCTA = language === 'hi' ? '14 दिन मुफ़्त शुरू करें' : 'Start Free Trial — 14 Days';
  const secondaryCTA = language === 'hi' ? 'यह कैसे काम करता है' : 'See How It Works';

  return (
    <section className="relative min-h-screen bg-white overflow-hidden" aria-label="Hero">
      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Content - Spans 7 columns on desktop */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0, ease: [0.25, 1, 0.5, 1] }}
          >
            {/* Accuracy Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.1, ease: [0.25, 1, 0.5, 1] }}
            >
              <AccuracyBadge accuracy={96.2} mape={4.8} showLabel={false} size="md" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="font-sora font-extrabold text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.035em] text-neutral-900"
            >
              {mounted ? (
                <>
                  <span className="text-brand-700">₹</span>
                  {headline.replace('₹', '')}
                </>
              ) : (
                headline
              )}
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="font-jakarta text-[clamp(1rem,1.5vw+0.5rem,1.25rem)] text-neutral-600 leading-[1.75] max-w-[60ch]"
            >
              {subheadline}
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.4, ease: [0.25, 1, 0.5, 1] }}
            >
              <a
                href="/login?action=signup"
                onClick={() => trackHeroCtaClicked(primaryCTA, 'home', 'above_fold')}
                className="inline-flex items-center justify-center w-full lg:w-[280px] h-[56px] bg-brand-700 text-white font-jakarta font-semibold rounded-full hover:bg-brand-600 transition-colors text-[1rem]"
              >
                {primaryCTA}
                <ArrowRight size={20} className="ml-2" weight="bold" />
              </a>
            </motion.div>

            {/* New User CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.45, ease: [0.25, 1, 0.5, 1] }}
            >
              <a
                href="/onboarding"
                onClick={() => trackHeroCtaClicked('New User Signup', 'home', 'above_fold')}
                className="inline-flex items-center justify-center w-full lg:w-[280px] h-[56px] bg-white text-brand-700 font-jakarta font-semibold rounded-full border-2 border-brand-700 hover:bg-brand-50 transition-colors text-[1rem]"
              >
                {language === 'hi' ? 'नया उपयोगकर्ता? यहाँ शुरू करें' : 'New User? Start Here'}
                <ArrowRight size={20} className="ml-2" weight="bold" />
              </a>
            </motion.div>

            {/* Secondary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.45, ease: [0.25, 1, 0.5, 1] }}
            >
              <a
                href="#features"
                className="inline-flex items-center font-jakarta text-neutral-400 hover:text-neutral-700 transition-colors text-[0.9375rem]"
              >
                {secondaryCTA}
                <ArrowRight size={16} className="ml-1" weight="bold" />
              </a>
            </motion.div>

            {/* Partner Logo Strip */}
            <PartnerLogoStrip />
          </motion.div>

          {/* Right Content - Product Mockup - Spans 5 columns on desktop */}
          <motion.div
            className="lg:col-span-5 flex justify-center"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: prefersReducedMotion ? 0 : 0.3, ease: [0.25, 1, 0.5, 1] }}
          >
            <ProductMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

