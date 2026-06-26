// FlockIQ — Pricing Teaser Section
// File: apps/web/components/home/PricingTeaserSection.tsx
// Version: v3.1 | June 2026 — tokens + SectionShell + SectionHeader migrated
// Task Reference: HOME-006

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from '@phosphor-icons/react';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';
import { useLanguage } from '@/providers/LanguageProvider';

function formatIndianCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} लाख`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  target: string;
  features: string[];
  excluded: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    id: 'flockiq_farm',
    name: 'FlockIQ FARM',
    monthlyPrice: 5000,
    annualPrice: 50000,
    target: 'For individual farmers',
    features: [
      'Live today\'s mandi price',
      '7-day price forecast (Soon)',
      'Daily sell signal (Soon)',
      'Batch ROI calculator',
      'Middleman check',
      'HPAI/disease alerts',
      'Weather alerts',
      'Farm management (3 farms)',
    ],
    excluded: ['30-day forecast (Soon)', 'Multi-farm dashboard', 'API access'],
    ctaText: 'Activate Beta License',
    ctaLink: '/activate',
    badge: '150+ farmers',
  },
  {
    id: 'flockiq_pro',
    name: 'FlockIQ PRO',
    monthlyPrice: 8000,
    annualPrice: 80000,
    target: 'For integrators & large farms',
    features: [
      'Everything in FARM',
      '30-day AI forecast (P10/P50/P90) (Soon)',
      'Multi-farm dashboard',
      'Unlimited farms & batches',
      'Optimal sell window analysis',
      'Price driver analysis (SHAP)',
      'Employee management',
      'API access',
    ],
    excluded: [],
    isPopular: true,
    ctaText: 'Activate Beta License',
    ctaLink: '/activate',
    badge: '45+ integrators',
  },
];

export default function PricingTeaserSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [farmSize, setFarmSize] = useState(25000);
  const { t } = useLanguage();

  const avgLossPerBird = 2;
  const batchesPerYear = 3;
  const annualLoss = farmSize * avgLossPerBird * batchesPerYear;
  const planCost = isAnnual ? 50000 : 60000;
  const netBenefit = annualLoss - planCost;
  const roiRatio = netBenefit / planCost;

  return (
    <SectionShell bg="brand-tint" ariaLabel="Pricing plans">
      <SectionHeader
        eyebrow={t('marketing.pricing.eyebrow')}
        heading={t('marketing.pricing.heading')}
        body={t('marketing.pricing.body')}
        align="center"
      />

      {/* Monthly / Annual toggle */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-12"
      >
        <div className="inline-flex bg-white rounded-xl p-1 border border-neutral-200">
          {[
            { label: 'Monthly', value: false },
            { label: 'Annual (Save 20%)', value: true },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setIsAnnual(value)}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-150 ${
                isAnnual === value
                  ? 'bg-brand-700 text-white'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-start">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative bg-white rounded-2xl p-6 transition-all duration-200 ${
              plan.isPopular
                ? 'ring-2 ring-brand-400 shadow-brand-tint-lg md:-translate-y-2'
                : 'border border-neutral-200 hover:shadow-diffusion hover:-translate-y-0.5'
            }`}
          >
            {/* Popular badge */}
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                Most Popular
              </div>
            )}

            {/* Customer count */}
            {plan.badge && (
              <p className="text-[11px] text-neutral-400 font-medium text-right mb-2">{plan.badge}</p>
            )}

            <h3 className="font-sora font-bold text-[1.125rem] leading-[1.15] tracking-[-0.02em] text-neutral-900 mb-1">{plan.name}</h3>
            <p className="font-jakarta text-xs text-neutral-500 mb-5">{plan.target}</p>

            {/* Price */}
            <div className="mb-6">
              <span
                className="font-sora font-extrabold text-neutral-900 tabular-nums"
                style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}
              >
                {formatIndianCurrency(isAnnual ? plan.annualPrice : plan.monthlyPrice)}
              </span>
              <span className="text-neutral-500 text-sm ml-1">/{isAnnual ? 'year' : 'month'}</span>
              {plan.id === 'flockiq_farm' && (
                <p className="text-xs text-brand-700 font-semibold mt-1">₹167/day</p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-2.5 mb-6" aria-label={`${plan.name} features`}>
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <Check size={16} className="text-brand-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="font-jakarta text-sm text-neutral-700 leading-snug">{f}</span>
                </li>
              ))}
              {plan.excluded.map((f, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <X size={16} className="text-neutral-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="font-jakarta text-sm text-neutral-400 leading-snug">{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={plan.ctaLink}
              className={`block w-full text-center py-3 rounded-full font-semibold text-sm transition-colors duration-150 ${
                plan.isPopular
                  ? 'bg-brand-700 text-white hover:bg-brand-600'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {plan.ctaText}
            </a>

            {plan.id === 'flockiq_farm' && (
              <p className="text-[11px] text-center text-neutral-400 mt-2">No credit card required</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Inline ROI calculator */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-xl mx-auto bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm"
      >
        <h3 className="font-sora font-bold text-[1.125rem] leading-[1.2] tracking-[-0.02em] text-neutral-900 mb-6 text-center">
          Calculate Your ROI
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Farm size: <span className="font-bold text-brand-700">{farmSize.toLocaleString('en-IN')} birds</span>
          </label>
          <input
            type="range"
            min="10000"
            max="100000"
            step="5000"
            value={farmSize}
            onChange={(e) => setFarmSize(Number(e.target.value))}
            className="w-full accent-brand-700"
            aria-label="Farm size in number of birds"
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>10K</span><span>100K</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Potential annual timing loss', value: formatIndianCurrency(annualLoss), colorClass: 'text-signal-700' },
            { label: 'FlockIQ FARM annual cost', value: formatIndianCurrency(planCost), colorClass: 'text-neutral-700' },
            { label: 'Net benefit', value: formatIndianCurrency(netBenefit), colorClass: 'text-brand-700', bold: true },
          ].map(({ label, value, colorClass, bold }) => (
            <div key={label} className={`flex justify-between items-center p-3 rounded-xl ${bold ? 'bg-brand-50 border border-brand-100' : 'bg-neutral-50'}`}>
              <span className="text-sm text-neutral-700">{label}</span>
              <span className={`font-sora font-bold tabular-nums text-sm ${colorClass}`}>{value}</span>
            </div>
          ))}
          <p className="text-center text-sm text-neutral-500 pt-1">
            <span className="font-bold text-brand-700">₹{roiRatio.toFixed(1)}</span> back for every ₹1 invested
          </p>
        </div>

        <a
          href="/signup"
          className="mt-6 block w-full text-center py-3.5 bg-brand-700 text-white font-semibold rounded-full hover:bg-brand-600 transition-colors duration-150"
        >
          Get This ROI — Start Free →
        </a>
      </motion.div>
    </SectionShell>
  );
}
