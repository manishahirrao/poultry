// FlockIQ AI — Problem Cards Section
// File: apps/web/components/home/ProblemCards.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-007
// Requirements: REQ-WEB-001 §W1.5
// Design Reference: Design Spec §3.2

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../app/(marketing)/i18n/useTranslation';

interface ProblemCard {
  emoji: string;
  accentColor: string;
}

const problemCards: ProblemCard[] = [
  {
    emoji: '🕐',
    accentColor: 'amber-500',
  },
  {
    emoji: '🦠',
    accentColor: 'red-600',
  },
  {
    emoji: '🤝',
    accentColor: 'amber-500',
  },
];

export default function ProblemCards() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-section-vertical bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header — left-aligned for editorial feel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-2xl"
        >
          <h2 className="font-sora font-bold text-[clamp(1.875rem,3vw,2.5rem)] leading-[1.1] tracking-[-0.025em] text-neutral-900 mb-4">
            {t('home.problemSection.title')}
          </h2>
          <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.125rem)] text-neutral-600 leading-relaxed">
            {t('home.problemSection.subtitle')}
          </p>
        </motion.div>

        {/* Problem Cards — asymmetric grid: first card wider on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {problemCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${
                index === 0 ? 'lg:col-span-6' : 'lg:col-span-3'
              }`}
            >
              {/* Top Accent Bar */}
              <div className={`h-1 bg-${card.accentColor}`} />

              <div className={`p-6 ${index === 0 ? 'lg:p-8' : ''}`}>
                {/* Emoji */}
                <div className={`mb-4 ${index === 0 ? 'text-6xl' : 'text-5xl'}`}>{card.emoji}</div>

                {/* Title & Subtitle */}
                <h3 className={`font-sora font-bold text-brand-700 leading-[1.15] tracking-[-0.02em] mb-1 ${index === 0 ? 'text-[1.625rem]' : 'text-[1.375rem]'}`}>
                  {t(`home.problemSection.cards.${index}.title`)}
                </h3>
                <p className="font-jakarta text-sm text-neutral-500 mb-4 leading-relaxed">{t(`home.problemSection.cards.${index}.subtitle`)}</p>

                {/* Hindi Quote */}
                <p className="font-devanagari text-[0.9375rem] text-neutral-700 italic mb-6 leading-[1.7]">
                  {t(`home.problemSection.cards.${index}.hindiQuote`)}
                </p>

                {/* Financial Impact */}
                <div className="pt-4 border-t border-neutral-100">
                  <p className="font-jakarta text-xs text-neutral-500 mb-1">{t(`home.problemSection.cards.${index}.financialImpact`)}</p>
                  <p className="font-jakarta font-semibold text-sm text-brand-700">
                    {t(`home.problemSection.cards.${index}.financialValue`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

