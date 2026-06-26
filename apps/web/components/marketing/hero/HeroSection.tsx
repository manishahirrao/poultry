// FlockIQ — Hero Section Component (v3.0)
// File: apps/web/components/marketing/hero/HeroSection.tsx
// Version: v3.0 | June 2026
// Task Reference: HOME-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §3.1
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §4.1

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { PhoneMockupCarousel } from './PhoneMockupCarousel';
import { ParticleField } from './ParticleField';
import { FadeUp } from '@/components/motion/FadeUp';
import { useLanguage } from '@/providers/LanguageProvider';

// Reduce motion for users who prefer it or on low-end devices
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  
  return prefersReducedMotion;
};

export function HeroSection() {
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();

  return (
    <section
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
      style={{
        background: 'var(--hero-gradient)',
      }}
      aria-label="Hero section"
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url(/textures/grain.svg)', backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      {/* Animated particles - only load if not reduced motion */}
      {!reducedMotion && <ParticleField count={6} />}

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
          <path d="M0 64L480 32L960 48L1440 0V64H0Z" fill="#F7FAF8" />
        </svg>
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
        {/* Left — Text */}
        <div className="max-w-[600px]">
          {/* Eyebrow */}
          <FadeUp delay={0}>
            <Badge variant="glass" className="mb-6">
              {t('marketing.hero.badge')}
            </Badge>
          </FadeUp>

          {/* Headline */}
          <FadeUp delay={0.1}>
            <h1
              className="font-sora font-extrabold text-white leading-[1.02] tracking-[-0.035em] mb-5"
              style={{ fontSize: 'clamp(2.75rem, 5.5vw + 0.5rem, 5rem)' }}
            >
              {t('marketing.hero.headlinePrefix')}{' '}
              <span className="text-brand-400">{t('marketing.hero.headlineHighlight')}</span>{' '}
              {t('marketing.hero.headlineSuffix')}
            </h1>
          </FadeUp>

          {/* Subheadline */}
          <FadeUp delay={0.2}>
            <p
              className="text-white/80 leading-[1.75] mb-8 font-jakarta"
              style={{ fontSize: 'clamp(1rem, 0.5vw + 0.875rem, 1.25rem)', maxWidth: '520px' }}
            >
              {t('marketing.hero.subheadline')}
            </p>
          </FadeUp>

          {/* CTAs */}
          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <Button
                variant="accent"
                size="hero"
                pill
                icon={<ArrowRight size={18} />}
                onClick={() => {
                  // Fire analytics
                  if (typeof window !== 'undefined' && (window as any).posthog) {
                    (window as any).posthog.capture('hero_cta_click', {
                      source: 'hero',
                      lang: document.documentElement.lang,
                      device: window.innerWidth < 768 ? 'mobile' : 'desktop',
                    });
                  }
                }}
                asChild
              >
                <Link href="/activate">{t('marketing.hero.activateBeta')}</Link>
              </Button>

              <Button
                variant="ghost"
                size="hero"
                pill
                icon={<Play size={16} fill="currentColor" />}
                iconPosition="left"
                className="text-white bg-white/15 hover:bg-white/20"
                asChild
              >
                <Link href="#demo">{t('marketing.hero.demo')}</Link>
              </Button>
            </div>
          </FadeUp>

          {/* Trust micro-text */}
          <FadeUp delay={0.4}>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/60 text-[13px] mb-8" role="list">
              {[t('marketing.hero.trustBadge1'), t('marketing.hero.trustBadge2'), t('marketing.hero.trustBadge3'), t('marketing.hero.trustBadge4')].map((item) => (
                <span key={item} className="font-jakarta flex items-center gap-1.5" role="listitem">
                  <span className="text-brand-400" aria-hidden="true">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </FadeUp>

          {/* Data partners */}
          <FadeUp delay={0.5}>
            <div>
              <p className="font-jakarta text-white/40 text-[11px] uppercase tracking-[0.16em] mb-2">Powered by verified data</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-white/50 text-xs font-medium font-jakarta">
                {['AGMARKNET', 'NECC', 'IMD', 'DAHDF', 'NCDEX'].map((partner) => (
                  <span key={partner}>{partner}</span>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Right — Phone Mockup */}
        <FadeUp delay={0.2} className="hidden lg:block">
          <motion.div
            animate={!reducedMotion ? { y: [0, -8, 0] } : undefined}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="motion-reduce:animate-none"
          >
            <PhoneMockupCarousel />
          </motion.div>
        </FadeUp>
      </div>
    </section>
  );
}

