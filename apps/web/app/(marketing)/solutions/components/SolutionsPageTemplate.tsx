// FlockIQ — Solutions Page Template Component
// File: apps/web/app/(marketing)/solutions/components/SolutionsPageTemplate.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-013
// Requirements: REQ-WEB-005 §W5.2–W5.4

import { Section } from '../../../../components/ui/Section';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import StatBlock from '../../../../components/ui/StatBlock';
import Link from 'next/link';

export interface PainPoint {
  emoji: string;
  title: string;
  description: string;
  impact: string;
}

export interface Feature {
  emoji: string;
  title: string;
  description: string;
  benefit: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  details: string;
  rating: number;
  metric?: string;
  metricLabel?: string;
}

export interface RoiConfig {
  inputs: {
    label: string;
    options: { value: string; label: string }[];
  }[];
  calculation: (values: Record<string, string>) => {
    annualGain: string;
    subscriptionCost: string;
    netRoi: string;
    roiMultiple: string;
  };
}

export interface SolutionsPageProps {
  segment: 'integrators' | 'feed-companies' | 'enterprise';
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  hero: {
    headline: { en: string; hi?: string };
    subheadline: { en: string; hi?: string };
    background?: 'gradient' | 'white' | 'tinted';
  };
  stats?: {
    value: string;
    label: string;
    labelHi?: string;
  }[];
  painPoints: PainPoint[];
  features: Feature[];
  roiCalculator?: RoiConfig;
  testimonial?: Testimonial;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  finalCta: {
    headline: string;
    subheadline: string;
    trustSignals?: string[];
  };
}

export default function SolutionsPageTemplate({
  metadata,
  hero,
  stats,
  painPoints,
  features,
  roiCalculator,
  testimonial,
  primaryCta,
  secondaryCta,
  finalCta,
}: SolutionsPageProps) {
  return (
    <>
      {/* Hero Section */}
      <Section background={hero.background || 'gradient'} size="lg">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 font-[Sora] leading-tight mb-6">
            {hero.headline.en}
            {hero.headline.hi && (
              <span className="block text-brandGreen700 mt-2">
                {hero.headline.hi}
              </span>
            )}
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8">
            {hero.subheadline.en}
            {hero.subheadline.hi && (
              <span className="block mt-2">{hero.subheadline.hi}</span>
            )}
          </p>
          
          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              variant="primary" 
              size="lg" 
              href={primaryCta.href}
              trailingArrow={true}
            >
              {primaryCta.label}
            </Button>
            {secondaryCta && (
              <Button 
                variant="secondary" 
                size="lg" 
                href={secondaryCta.href}
              >
                {secondaryCta.label}
              </Button>
            )}
          </div>

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-12">
              {stats.map((stat, index) => (
                <StatBlock 
                  key={index}
                  value={stat.value} 
                  label={stat.label} 
                  labelHi={stat.labelHi} 
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Pain Points Section */}
      <Section background="tinted" size="lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
            Key Challenges
          </h2>
          
          <div className="space-y-6">
            {painPoints.map((pain, index) => (
              <Card key={index} variant="default" padding="lg" className="bg-amber-50/40 border border-amber-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{pain.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      {pain.title}
                    </h3>
                    <p className="text-neutral-700 mb-2">
                      {pain.description}
                    </p>
                    <p className="text-brandGreen700 font-semibold">
                      {pain.impact}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section background="white" size="lg">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
            How FlockIQ Solves It
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} variant="default" padding="lg" hover={true}>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-brandGreen50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">{feature.emoji}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{feature.title}</h3>
                    <p className="text-neutral-700 text-sm mb-2">
                      {feature.description}
                    </p>
                    <p className="text-brandGreen700 text-sm font-semibold">
                      ✅ {feature.benefit}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ROI Calculator Section (if provided) */}
      {roiCalculator && (
        <Section background="tinted" size="lg">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
              Calculate Your ROI
            </h2>
            
            <Card variant="elevated" padding="lg">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-6">Your Inputs:</h3>
                  
                  <div className="space-y-4">
                    {roiCalculator.inputs.map((input, index) => (
                      <div key={index}>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          {input.label}
                        </label>
                        <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandGreen700 focus:border-transparent">
                          {input.options.map((option, optIndex) => (
                            <option key={optIndex} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Result Panel */}
                <div className="bg-brandGreen50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-neutral-900 mb-6">
                    Estimated ROI:
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-neutral-600 mb-1">Annual Gain</p>
                      <p className="text-3xl font-bold text-brandGreen700">₹ 72,000</p>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-neutral-600 mb-1">Subscription Cost</p>
                      <p className="text-2xl font-bold text-neutral-900">₹ 36,000/year</p>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-neutral-600 mb-1">Net ROI</p>
                      <p className="text-2xl font-bold text-brandGreen700">₹ 36,000</p>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-neutral-600 mb-1">ROI Multiple</p>
                      <p className="text-2xl font-bold text-brandGreen700">2.0×</p>
                    </div>
                  </div>

                  <Button 
                    variant="primary" 
                    size="lg" 
                    href={primaryCta.href}
                    fullWidth={true}
                    className="mt-6"
                  >
                    {primaryCta.label}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Section>
      )}

      {/* Testimonial Section (if provided) */}
      {testimonial && (
        <Section background="white" size="lg">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
              What Our Customers Say
            </h2>
            
            <Card variant="elevated" padding="lg" className="bg-brandGreen50/30">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="text-6xl text-brandGreen200 mb-4">"</div>
                  <p className="text-xl text-neutral-900 mb-6 italic">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brandGreen700 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{testimonial.author}</p>
                      <p className="text-sm text-neutral-600">{testimonial.details}</p>
                      <div className="flex text-amber-500 mt-1">
                        {'★'.repeat(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                </div>
                {testimonial.metric && (
                  <div className="w-full md:w-1/3 bg-white rounded-xl p-6 flex flex-col justify-center">
                    <div className="text-center">
                      <p className="text-sm text-neutral-600 mb-2">{testimonial.metricLabel}</p>
                      <p className="text-4xl font-bold text-brandGreen700 mb-2">{testimonial.metric}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Section>
      )}

      {/* Final CTA Section */}
      <Section background="dark" size="lg" className="bg-brandGreen700">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[Sora] mb-4">
            {finalCta.headline}
          </h2>
          <p className="text-lg text-white/90 mb-8">
            {finalCta.subheadline}
          </p>
          <Button 
            variant="cta" 
            size="lg" 
            href={primaryCta.href}
            trailingArrow={true}
          >
            {primaryCta.label}
          </Button>
          {finalCta.trustSignals && (
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/80">
              {finalCta.trustSignals.map((signal, index) => (
                <span key={index}>{signal}</span>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
