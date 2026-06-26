// FlockIQ — Pricing Page Client Component
// File: apps/web/app/(marketing)/pricing/PricingPageClient.tsx
// Updated to match new pricing structure (FLOCKIQ_FARM, FLOCKIQ_PRO, Lifetime Deal)

'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, X, Crown, CaretDown, CaretUp, Infinity } from '@phosphor-icons/react';
import { PLAN_PRICING, type PlanName } from '@/lib/plans/featureGates';
import { trackPricingViewed, trackHeroCtaClicked } from '@/lib/posthog-analytics';

type BillingCycle = 'monthly' | 'annual' | 'lifetime';

interface PlanFeature {
  key: string;
  name: string;
  category: 'Price Intelligence' | 'Farm Operations' | 'Analytics' | 'Team & Support';
  farmAccess: boolean | string;
  proAccess: boolean | string;
}

const PLAN_FEATURES: PlanFeature[] = [
  // Price Intelligence
  { key: 'price_today', name: 'Live today\'s mandi price', category: 'Price Intelligence', farmAccess: true, proAccess: true },
  { key: 'price_history_7d', name: 'Price history (7 days)', category: 'Price Intelligence', farmAccess: true, proAccess: true },
  { key: 'price_history_30d', name: 'Price history (30+ days)', category: 'Price Intelligence', farmAccess: false, proAccess: true },
  { key: 'forecast_30day', name: '30-Day AI Forecast (P10/P50/P90)', category: 'Price Intelligence', farmAccess: false, proAccess: true },
  { key: 'forecast_7day', name: '7-Day forecast (limited)', category: 'Price Intelligence', farmAccess: true, proAccess: true },
  { key: 'sell_signal_today', name: 'Sell signal (today only)', category: 'Price Intelligence', farmAccess: true, proAccess: true },
  { key: 'sell_signal_optimal_window', name: 'Optimal sell window analysis', category: 'Price Intelligence', farmAccess: false, proAccess: true },
  { key: 'price_drivers_shap', name: 'Price driver analysis (SHAP)', category: 'Price Intelligence', farmAccess: false, proAccess: true },
  { key: 'accuracy_decay_viz', name: 'Accuracy decay visualisation', category: 'Price Intelligence', farmAccess: false, proAccess: true },
  { key: 'forecast_export_csv', name: 'Forecast CSV/JSON download', category: 'Price Intelligence', farmAccess: false, proAccess: true },
  { key: 'compare_mandis', name: 'Compare mandis simultaneously', category: 'Price Intelligence', farmAccess: false, proAccess: true },
  { key: 'district_map', name: 'District choropleth map', category: 'Price Intelligence', farmAccess: true, proAccess: true },
  { key: 'disease_alerts', name: 'HPAI/disease alerts', category: 'Price Intelligence', farmAccess: true, proAccess: true },
  // Farm Operations
  { key: 'farm_management', name: 'Add/manage farms', category: 'Farm Operations', farmAccess: '3 farms', proAccess: 'Unlimited' },
  { key: 'daily_log_manual', name: 'Daily log entry (manual)', category: 'Farm Operations', farmAccess: true, proAccess: true },
  { key: 'whatsapp_daily_log', name: 'WhatsApp daily log automation', category: 'Farm Operations', farmAccess: true, proAccess: true },
  { key: 'farm_metrics_tab', name: 'Farm detail tabs (Metrics/Log)', category: 'Farm Operations', farmAccess: true, proAccess: true },
  { key: 'farm_health_tab', name: 'Health tab (vaccination/symptoms)', category: 'Farm Operations', farmAccess: true, proAccess: true },
  { key: 'farm_feed_tab', name: 'Feed tab (inventory/purchase log)', category: 'Farm Operations', farmAccess: true, proAccess: true },
  { key: 'batch_history', name: 'Batch history', category: 'Farm Operations', farmAccess: '3 batches', proAccess: 'Unlimited' },
  { key: 'batch_status_board', name: 'Batch status board (Kanban)', category: 'Farm Operations', farmAccess: true, proAccess: true },
  { key: 'gc_tracking', name: 'GC (Growing Cost) tracking', category: 'Farm Operations', farmAccess: true, proAccess: true },
  { key: 'harvest_window_banner', name: 'Harvest Window banner', category: 'Farm Operations', farmAccess: true, proAccess: true },
  { key: 'farm_compare', name: 'Farm compare (multi-farm radar)', category: 'Farm Operations', farmAccess: false, proAccess: true },
  // Analytics
  { key: 'portfolio_metrics', name: 'Portfolio metrics dashboard', category: 'Analytics', farmAccess: false, proAccess: true },
  { key: 'calculator', name: 'Batch ROI Optimizer/Calculator', category: 'Analytics', farmAccess: true, proAccess: true },
  { key: 'sell_hold_matrix_basic', name: 'Sell vs Hold matrix (basic)', category: 'Analytics', farmAccess: true, proAccess: true },
  { key: 'sell_hold_matrix_ai', name: 'Sell vs Hold matrix (full AI)', category: 'Analytics', farmAccess: false, proAccess: true },
  { key: 'feed_intelligence', name: 'Feed Intelligence (commodity prices)', category: 'Analytics', farmAccess: true, proAccess: true },
  { key: 'feed_cost_timing', name: 'Feed cost timing recommendation', category: 'Analytics', farmAccess: true, proAccess: true },
  { key: 'feed_cost_impact', name: 'Feed cost impact calculator', category: 'Analytics', farmAccess: true, proAccess: true },
  { key: 'feed_procurement_multifarm', name: 'Procurement pre-order (multi-farm)', category: 'Analytics', farmAccess: false, proAccess: true },
  { key: 'middleman_check', name: 'Middleman Check', category: 'Analytics', farmAccess: true, proAccess: true },
  { key: 'middleman_spread_history', name: 'Spread history chart (30-day)', category: 'Analytics', farmAccess: false, proAccess: true },
  { key: 'negotiation_script_ai', name: 'Negotiation script generator (AI)', category: 'Analytics', farmAccess: false, proAccess: true },
  // Employee Module
  { key: 'employee_management', name: 'Employee management module', category: 'Team & Support', farmAccess: false, proAccess: true },
  { key: 'salary_management', name: 'Salary processing & records', category: 'Team & Support', farmAccess: false, proAccess: true },
  { key: 'expense_tracking', name: 'Business expense tracking', category: 'Team & Support', farmAccess: false, proAccess: true },
  { key: 'pl_overview', name: 'P&L Overview dashboard', category: 'Team & Support', farmAccess: false, proAccess: true },
  { key: 'salary_gc_sync', name: 'Salary → GC auto-sync', category: 'Team & Support', farmAccess: false, proAccess: true },
  // Reports
  { key: 'daily_log_export_csv', name: 'Daily log CSV export', category: 'Team & Support', farmAccess: true, proAccess: true },
  { key: 'batch_report_pdf', name: 'Batch report (PDF)', category: 'Team & Support', farmAccess: true, proAccess: true },
  { key: 'farm_compare_report', name: 'Farm comparison report (PDF)', category: 'Team & Support', farmAccess: false, proAccess: true },
  { key: 'gc_report_pdf', name: 'GC report (PDF)', category: 'Team & Support', farmAccess: true, proAccess: true },
  { key: 'pl_report_pdf', name: 'P&L report (PDF)', category: 'Team & Support', farmAccess: false, proAccess: true },
  { key: 'api_access', name: 'API access (JSON webhook)', category: 'Team & Support', farmAccess: false, proAccess: true },
  { key: 'scheduled_reports', name: 'Scheduled email reports', category: 'Team & Support', farmAccess: false, proAccess: true },
  // Alerts
  { key: 'weather_alerts', name: 'Weather alerts', category: 'Team & Support', farmAccess: true, proAccess: true },
  { key: 'price_alerts_basic', name: 'Price alerts (basic: above/below)', category: 'Team & Support', farmAccess: true, proAccess: true },
  { key: 'price_alerts_signal', name: 'Price alerts (signal change)', category: 'Team & Support', farmAccess: false, proAccess: true },
  { key: 'custom_alert_rules', name: 'Custom alert rules', category: 'Team & Support', farmAccess: false, proAccess: true },
  { key: 'daily_digest', name: 'Daily summary digest', category: 'Team & Support', farmAccess: true, proAccess: true },
  // Team
  { key: 'team_members', name: 'Team members', category: 'Team & Support', farmAccess: '1 user', proAccess: '5 users' },
  { key: 'role_based_access', name: 'Role-based access control', category: 'Team & Support', farmAccess: false, proAccess: true },
  { key: 'whatsapp_integration', name: 'WhatsApp integration setup', category: 'Team & Support', farmAccess: true, proAccess: true },
  { key: 'priority_support', name: 'Priority support', category: 'Team & Support', farmAccess: false, proAccess: true },
];

const faqs = [
  {
    question: "Lifetime का मतलब क्या है? / What does 'lifetime' mean?",
    answer: "5-year tenure from purchase date. After 5 years, renewal at 50% of current price."
  },
  {
    question: "क्या यह refundable है? / Is it refundable?",
    answer: "Non-refundable after platform is accessed more than 3 times. 30-day money-back otherwise."
  },
  {
    question: "क्या plan transfer हो सकता है? / Can I transfer the plan?",
    answer: "Non-transferable. Tied to the registered business entity."
  },
  {
    question: "5 साल में क्या नए features मिलेंगे? / What about new features?",
    answer: "All feature updates during your tenure are included at no extra cost."
  },
  {
    question: "5 साल बाद क्या होगा? / What happens after 5 years?",
    answer: "We'll offer renewal at 50% of the then-current lifetime price."
  },
];

export default function PricingPageClient() {
  const searchParams = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [showFeatureTable, setShowFeatureTable] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const plans = [
    {
      name: 'FLOCKIQ_FARM' as PlanName,
      displayName: 'FlockIQ FARM',
      monthlyPrice: PLAN_PRICING.FLOCKIQ_FARM.monthly,
      annualPrice: PLAN_PRICING.FLOCKIQ_FARM.annual,
      lifetimePrice: PLAN_PRICING.FLOCKIQ_FARM.lifetime,
      lifetimeRenewal: PLAN_PRICING.FLOCKIQ_FARM.lifetimeRenewal,
      lifetimeMonthlySavings: PLAN_PRICING.FLOCKIQ_FARM.lifetimeMonthlySavings,
      lifetimeTotalSavings: PLAN_PRICING.FLOCKIQ_FARM.lifetimeTotalSavings,
      annualMonthlySavings: PLAN_PRICING.FLOCKIQ_FARM.annualMonthlySavings,
      popular: false,
    },
    {
      name: 'FLOCKIQ_PRO' as PlanName,
      displayName: 'FlockIQ PRO',
      monthlyPrice: PLAN_PRICING.FLOCKIQ_PRO.monthly,
      annualPrice: PLAN_PRICING.FLOCKIQ_PRO.annual,
      lifetimePrice: PLAN_PRICING.FLOCKIQ_PRO.lifetime,
      lifetimeRenewal: PLAN_PRICING.FLOCKIQ_PRO.lifetimeRenewal,
      lifetimeMonthlySavings: PLAN_PRICING.FLOCKIQ_PRO.lifetimeMonthlySavings,
      lifetimeTotalSavings: PLAN_PRICING.FLOCKIQ_PRO.lifetimeTotalSavings,
      annualMonthlySavings: PLAN_PRICING.FLOCKIQ_PRO.annualMonthlySavings,
      popular: true,
    },
  ];

  const getDisplayPrice = (plan: typeof plans[0]) => {
    if (billingCycle === 'monthly') return plan.monthlyPrice;
    if (billingCycle === 'annual') return plan.annualPrice;
    return plan.lifetimePrice;
  };

  const getMonthlyEquivalent = (plan: typeof plans[0]) => {
    if (billingCycle === 'monthly') return plan.monthlyPrice;
    if (billingCycle === 'annual') return Math.round(plan.annualPrice / 12);
    return Math.round(plan.lifetimePrice / 60);
  };

  const getTotalSavings = (plan: typeof plans[0]) => {
    if (billingCycle === 'monthly') return 0;
    if (billingCycle === 'annual') return plan.annualMonthlySavings * 12;
    return plan.lifetimeTotalSavings;
  };

  const renderFeatureAccess = (access: boolean | string, planName: PlanName) => {
    if (typeof access === 'string') {
      return <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">{access}</span>;
    }
    return access ? (
      <Check size={16} className="text-[#1A5C34]" weight="bold" />
    ) : (
      <X size={16} className="text-neutral-400" weight="bold" />
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-[#EDF7F1] to-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-xs font-bold text-[#1A5C34] uppercase tracking-[0.16em] mb-4">
              Simple Pricing. Big Returns.
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight mb-4">
              Choose the Perfect Plan for Your Farm
            </h1>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              AI-powered broiler price forecast with 95%+ accuracy. Know exactly when to sell.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plan Toggle */}
      <section className="py-8 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Annual — Save 17%
              </button>
              <button
                onClick={() => setBillingCycle('lifetime')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'lifetime'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Lifetime Deal — 5 Years
              </button>
            </div>
          </div>

          {/* Lifetime Deal Callout */}
          {billingCycle === 'lifetime' && (
            <div className="mb-8 p-4 bg-gradient-to-r from-[#EDF7F1] to-[#E8F5E9] border border-[#1A5C34] rounded-xl max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <Crown size={20} className="text-[#1A5C34] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 mb-1">💎 Lifetime Deal — Subject to 5-Year Tenure</h4>
                  <ul className="text-xs text-neutral-700 space-y-1">
                    <li>• Pay once. Use for 5 years. All updates included.</li>
                    <li>• After Year 5: renew at 50% price or keep monthly.</li>
                    <li>• ⚠ Non-refundable after 3 accesses. Non-transferable.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Plan Comparison Cards */}
      <section className="py-8 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-xl border-2 relative ${
                  plan.popular
                    ? 'border-[#1A5C34] bg-white'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1A5C34] text-white text-xs font-semibold rounded-full">
                    ⭐ BEST VALUE
                  </div>
                )}
                
                <h4 className="text-xl font-bold text-neutral-900 mb-2">{plan.displayName}</h4>
                
                <div className="text-3xl font-bold text-[#1A5C34] mb-1">
                  ₹{getDisplayPrice(plan).toLocaleString('en-IN')}
                  {billingCycle === 'lifetime' ? '  one-time' : billingCycle === 'annual' ? '/year' : '/month'}
                </div>
                
                {billingCycle !== 'monthly' && (
                  <div className="text-sm text-neutral-600 mb-1">
                    = ₹{getMonthlyEquivalent(plan).toLocaleString('en-IN')}/month equivalent
                  </div>
                )}
                
                {billingCycle !== 'monthly' && getTotalSavings(plan) > 0 && (
                  <div className="text-sm font-semibold text-green-700 mb-4">
                    Save ₹{getTotalSavings(plan).toLocaleString('en-IN')} over {billingCycle === 'lifetime' ? '5 years' : '1 year'} vs monthly
                  </div>
                )}
                
                {billingCycle === 'lifetime' && (
                  <div className="text-sm text-neutral-600 mb-4">
                    Renew at ₹{plan.lifetimeRenewal.toLocaleString('en-IN')} after Year 5
                  </div>
                )}

                {/* Feature List */}
                <div className="space-y-3 mb-6">
                  {/* Price Intelligence */}
                  <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Price Intelligence</div>
                    <ul className="space-y-1">
                      {PLAN_FEATURES.filter(f => f.category === 'Price Intelligence').slice(0, 4).map((feature) => (
                        <li key={feature.key} className="text-sm text-neutral-700 flex items-center gap-2">
                          {renderFeatureAccess(plan.name === 'FLOCKIQ_FARM' ? feature.farmAccess : feature.proAccess, plan.name)}
                          <span className={plan.name === 'FLOCKIQ_FARM' && !feature.farmAccess ? 'text-neutral-400' : ''}>
                            {feature.name}
                          </span>
                          {plan.name === 'FLOCKIQ_FARM' && !feature.farmAccess && (
                            <span className="text-xs text-purple-600 font-semibold">[PRO only]</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Farm Operations */}
                  <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Farm Operations</div>
                    <ul className="space-y-1">
                      {PLAN_FEATURES.filter(f => f.category === 'Farm Operations').slice(0, 3).map((feature) => (
                        <li key={feature.key} className="text-sm text-neutral-700 flex items-center gap-2">
                          {renderFeatureAccess(plan.name === 'FLOCKIQ_FARM' ? feature.farmAccess : feature.proAccess, plan.name)}
                          <span className={plan.name === 'FLOCKIQ_FARM' && !feature.farmAccess ? 'text-neutral-400' : ''}>
                            {feature.name}
                          </span>
                          {plan.name === 'FLOCKIQ_FARM' && !feature.farmAccess && (
                            <span className="text-xs text-purple-600 font-semibold">[PRO only]</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Analytics */}
                  <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Analytics</div>
                    <ul className="space-y-1">
                      {PLAN_FEATURES.filter(f => f.category === 'Analytics').slice(0, 2).map((feature) => (
                        <li key={feature.key} className="text-sm text-neutral-700 flex items-center gap-2">
                          {renderFeatureAccess(plan.name === 'FLOCKIQ_FARM' ? feature.farmAccess : feature.proAccess, plan.name)}
                          <span className={plan.name === 'FLOCKIQ_FARM' && !feature.farmAccess ? 'text-neutral-400' : ''}>
                            {feature.name}
                          </span>
                          {plan.name === 'FLOCKIQ_FARM' && !feature.farmAccess && (
                            <span className="text-xs text-purple-600 font-semibold">[PRO only]</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Team & Support */}
                  <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Team & Support</div>
                    <ul className="space-y-1">
                      {PLAN_FEATURES.filter(f => f.category === 'Team & Support').slice(0, 2).map((feature) => (
                        <li key={feature.key} className="text-sm text-neutral-700 flex items-center gap-2">
                          {renderFeatureAccess(plan.name === 'FLOCKIQ_FARM' ? feature.farmAccess : feature.proAccess, plan.name)}
                          <span className={plan.name === 'FLOCKIQ_FARM' && !feature.farmAccess ? 'text-neutral-400' : ''}>
                            {feature.name}
                          </span>
                          {plan.name === 'FLOCKIQ_FARM' && !feature.farmAccess && (
                            <span className="text-xs text-purple-600 font-semibold">[PRO only]</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Show all features toggle */}
                  <button
                    onClick={() => setShowFullFeatures(!showFullFeatures)}
                    className="text-sm text-[#1A5C34] font-semibold flex items-center gap-1 hover:underline"
                  >
                    {showFullFeatures ? (
                      <>
                        <CaretUp size={16} />
                        Show fewer features
                      </>
                    ) : (
                      <>
                        <CaretDown size={16} />
                        Show all 40+ features
                      </>
                    )}
                  </button>

                  {showFullFeatures && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 space-y-2">
                      {PLAN_FEATURES.filter(f => 
                        (plan.name === 'FLOCKIQ_FARM' ? f.farmAccess : f.proAccess)
                      ).map((feature) => (
                        <li key={feature.key} className="text-sm text-neutral-700 flex items-center gap-2">
                          {renderFeatureAccess(plan.name === 'FLOCKIQ_FARM' ? feature.farmAccess : feature.proAccess, plan.name)}
                          <span>{feature.name}</span>
                        </li>
                      ))}
                    </div>
                  )}
                </div>

                <a
                  href="/activate"
                  className="block w-full px-4 py-3 rounded-lg text-sm font-semibold transition-colors bg-[#1A5C34] text-white hover:bg-[#145a2b] text-center"
                >
                  Activate Beta License
                </a>

                <div className="text-xs text-neutral-500 text-center mt-2">
                  Secure payment via Razorpay
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Feature Comparison Table */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-neutral-900">Full Feature Comparison</h3>
            <button
              onClick={() => setShowFeatureTable(!showFeatureTable)}
              className="text-sm text-[#1A5C34] font-semibold flex items-center gap-1 hover:underline"
            >
              {showFeatureTable ? (
                <>
                  <CaretUp size={16} />
                  Hide
                </>
              ) : (
                <>
                  <CaretDown size={16} />
                  Show all features
                </>
              )}
            </button>
          </div>

          {showFeatureTable && (
            <div className="overflow-x-auto bg-white rounded-xl border border-neutral-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-900">FARM</th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-900">PRO</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAN_FEATURES.map((feature) => (
                    <tr key={feature.key} className="border-b border-neutral-100">
                      <td className="py-3 px-4 text-neutral-700">{feature.name}</td>
                      <td className="py-3 px-4 text-center">
                        {renderFeatureAccess(feature.farmAccess, 'FLOCKIQ_FARM')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {renderFeatureAccess(feature.proAccess, 'FLOCKIQ_PRO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Lifetime Deal FAQ */}
      {billingCycle === 'lifetime' && (
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Lifetime Deal FAQ</h3>
              <button
                onClick={() => setShowFAQ(!showFAQ)}
                className="text-sm text-[#1A5C34] font-semibold flex items-center gap-1 hover:underline"
              >
                {showFAQ ? (
                  <>
                    <CaretUp size={16} />
                    Hide
                  </>
                ) : (
                  <>
                    <CaretDown size={16} />
                    Show FAQ
                  </>
                )}
              </button>
            </div>

            {showFAQ && (
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-neutral-200 rounded-lg">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-neutral-900">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <CaretUp size={16} className="text-neutral-500" />
                      ) : (
                        <CaretDown size={16} className="text-neutral-500" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 pb-3 text-sm text-neutral-700">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-16 bg-[#1A5C34]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get Started Today
          </h2>
          <p className="text-lg text-white/80 mb-8">
            No credit card required. Setup in 3 minutes.
          </p>
          <a
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-[#1A5C34] font-semibold rounded-full hover:bg-neutral-50 transition-all"
          >
            Start Now
          </a>
        </div>
      </section>
    </div>
  );
}
