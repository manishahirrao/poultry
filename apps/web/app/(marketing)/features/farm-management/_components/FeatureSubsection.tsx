// FlockIQ — Feature Subsection Component
// File: apps/web/app/(marketing)/features/farm-management/_components/FeatureSubsection.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-002 (Phase 9)
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { FadeUp } from '@/components/motion/FadeUp';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';

interface FeatureSubsectionProps {
  id: string;
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  body: string;
  features: string[];
  screenshotSrc?: string;
  screenshotAlt?: string;
  screenshotSide?: 'left' | 'right';
  isNew?: boolean;
  planBadge?: 'Both' | 'PulsePro' | 'Enterprise';
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function FeatureSubsection({
  id,
  icon,
  eyebrow,
  title,
  body,
  features,
  screenshotSrc,
  screenshotAlt,
  screenshotSide = 'right',
  isNew = false,
  planBadge,
  cta,
  className,
}: FeatureSubsectionProps) {
  const planBadgeColors: Record<string, string> = {
    Both: 'bg-brand-50 text-brand-700 border border-brand-100',
    PulsePro: 'bg-signal-light text-signal-700 border border-signal-300',
    Enterprise: 'bg-neutral-900 text-white border border-neutral-700',
  };

  return (
    <section id={id} className={cn('scroll-mt-24 py-16 lg:py-24', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`lg:grid lg:grid-cols-2 lg:gap-16 items-center ${screenshotSide === 'left' ? 'lg:grid-flow-col-dense' : ''}`}>
          
          {/* Text Content */}
          <div className={cn('mb-12 lg:mb-0', screenshotSide === 'left' ? 'lg:col-start-2' : '')}>
            <FadeUp>
              {/* Eyebrow and Badges */}
              <div className="flex items-center gap-3 mb-4">
                {eyebrow && (
                  <Badge variant="brand" className="text-xs">
                    {eyebrow}
                  </Badge>
                )}
                {isNew && (
                  <Badge variant="orange" className="text-xs">
                    NEW
                  </Badge>
                )}
                {planBadge && (
                  <Badge className={cn('text-xs', planBadgeColors[planBadge])}>
                    {planBadge}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
                {title}
              </h2>

              {/* Body */}
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                {body}
              </p>

              {/* Feature List */}
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-brand-700 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {cta && (
                <Button variant="primary" size="md" asChild>
                  <a href={cta.href}>{cta.label}</a>
                </Button>
              )}
            </FadeUp>
          </div>

          {/* Screenshot */}
          <div className={cn('relative', screenshotSide === 'left' ? 'lg:col-start-1' : '')}>
            <FadeUp delay={0.2}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 bg-white">
                {screenshotSrc ? (
                  <Image
                    src={screenshotSrc}
                    alt={screenshotAlt || title}
                    width={800}
                    height={600}
                    className="w-full h-auto"
                    priority={false}
                  />
                ) : (
                  <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {icon || <Check className="w-8 h-8 text-brand-700" />}
                      </div>
                      <p className="text-neutral-500 text-sm">Product Screenshot</p>
                      <p className="text-neutral-400 text-xs mt-1">{title}</p>
                    </div>
                  </div>
                )}
              </div>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  );
}
