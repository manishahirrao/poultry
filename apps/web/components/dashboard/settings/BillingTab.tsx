'use client';

import { useState } from 'react';
import { CreditCard, Warning, Check, X, ArrowRight, Infinity, Calendar, Crown, CaretDown, CaretUp, Info } from '@phosphor-icons/react';
import { useEntitlements } from '@/lib/plans/useEntitlements';
import { PLAN_PRICING, formatPlanPrice, type PlanName, type SubscriptionType } from '@/lib/plans/featureGates';

interface BillingTabProps {
  customer: any;
}

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

export function BillingTab({ customer }: BillingTabProps) {
  const { entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [showFeatureTable, setShowFeatureTable] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const currentPlan = (entitlements?.planName ?? customer?.plan ?? 'FLOCKIQ_FARM') as PlanName;
  const currentSubscriptionType = (entitlements?.subscriptionType ?? 'monthly') as SubscriptionType;
  const isLifetime = currentSubscriptionType === 'lifetime';
  const isAnnual = currentSubscriptionType === 'annual';

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
      current: currentPlan === 'FLOCKIQ_FARM',
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
      current: currentPlan === 'FLOCKIQ_PRO',
      popular: true,
    },
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

  const getDisplayPrice = (plan: typeof plans[0]) => {
    if (billingCycle === 'monthly') return plan.monthlyPrice;
    if (billingCycle === 'annual') return plan.annualPrice;
    return plan.lifetimePrice;
  };

  const getBillingLabel = () => {
    if (billingCycle === 'monthly') return 'Monthly';
    if (billingCycle === 'annual') return 'Annual (Save 17%)';
    return 'Lifetime Deal (5 Years)';
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

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPlanFeatures = (planName: PlanName) => {
    return PLAN_FEATURES.filter(f => 
      planName === 'FLOCKIQ_FARM' ? f.farmAccess : f.proAccess
    );
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

  const daysUntilExpiry = entitlements?.daysUntilExpiry ?? 0;

  const lifetimeStartDate = entitlements?.planName && currentSubscriptionType === 'lifetime'
    ? new Date() // This would come from actual subscription data
    : null;

  const lifetimeEndDate = lifetimeStartDate
    ? new Date(lifetimeStartDate.getTime() + (5 * 365 * 24 * 60 * 60 * 1000))
    : null;

  const handlePayment = async (planName: PlanName, billingType: BillingCycle) => {
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName, billingType }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      // Load Razorpay SDK and open payment modal
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const options = {
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: 'FlockIQ',
        description: `${planName} ${billingType} subscription`,
        handler: async function (response: any) {
          // Verify payment on server
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            window.location.href = verifyData.redirectUrl;
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: customer?.name || '',
          contact: customer?.phone || '',
        },
        theme: {
          color: '#1A5C34',
        },
      };

      const paymentObject = new (Razorpay as any)(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Current Plan Card */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-6">Current Plan</h3>

        {isLifetime ? (
          <div className="bg-gradient-to-r from-[#EDF7F1] to-[#E8F5E9] border-2 border-[#1A5C34] rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xl font-bold text-neutral-900">{currentPlan}</h4>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1A5C34] text-white text-xs font-semibold rounded-full">
                    <Check size={12} />
                    Your Plan
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                    <Infinity size={12} />
                    LIFETIME DEAL
                  </span>
                </div>
                <div className="text-sm text-neutral-600">
                  Purchased: {lifetimeStartDate ? formatDate(lifetimeStartDate.toISOString()) : 'N/A'}
                </div>
                <div className="text-sm text-neutral-600">
                  Valid until: {lifetimeEndDate ? formatDate(lifetimeEndDate.toISOString()) : 'N/A'} (5-year tenure)
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-neutral-600 mb-2">
                <span>Days remaining: {daysUntilExpiry}</span>
                <span>5 years</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div 
                  className="bg-[#1A5C34] h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (daysUntilExpiry / (5 * 365)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="text-sm text-neutral-700 mb-2">
              All future updates included during your tenure.
            </div>
            <div className="text-sm font-semibold text-[#1A5C34]">
              Renewal after {lifetimeEndDate ? formatDate(lifetimeEndDate.toISOString()) : '5 years'}: ₹{currentPlan === 'FLOCKIQ_PRO' ? '1,25,000' : '75,000'}
            </div>
          </div>
        ) : (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xl font-bold text-neutral-900">{currentPlan}</h4>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1A5C34] text-white text-xs font-semibold rounded-full">
                    <Check size={12} />
                    Your Plan
                  </span>
                </div>
                <div className="text-sm text-neutral-600">
                  ₹{currentPlan === 'FLOCKIQ_PRO' ? '8,000' : '5,000'}/month · {currentSubscriptionType === 'annual' ? 'Annual billing' : 'Monthly billing'}
                </div>
                {entitlements?.grandfatheredUntil && (
                  <div className="text-xs text-amber-600 mt-1">
                    Legacy pricing guaranteed until {formatDate(entitlements.grandfatheredUntil)}
                  </div>
                )}
              </div>
            </div>

            {!isAnnual && (
              <button className="text-sm text-[#1A5C34] font-semibold hover:underline">
                Change to Annual — Save ₹{currentPlan === 'FLOCKIQ_PRO' ? '16,000' : '10,000'}/year
              </button>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: Plan Toggle */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-neutral-900">Choose Your Plan</h3>
          
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Annual — Save 17%
            </button>
            <button
              onClick={() => setBillingCycle('lifetime')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
          <div className="mb-6 p-4 bg-gradient-to-r from-[#EDF7F1] to-[#E8F5E9] border border-[#1A5C34] rounded-xl">
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

        {/* SECTION 3: Plan Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-xl border-2 relative ${
                plan.current
                  ? 'border-[#1A5C34] bg-[#EDF7F1]'
                  : plan.popular
                  ? 'border-[#1A5C34] bg-white'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              {plan.popular && !plan.current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1A5C34] text-white text-xs font-semibold rounded-full">
                  ⭐ BEST VALUE
                </div>
              )}
              
              {plan.current && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-[#1A5C34] text-white mb-3">
                  <Check size={12} />
                  Your Plan ✓
                </div>
              )}
              
              <h4 className="text-xl font-bold text-neutral-900 mb-2">{plan.displayName}</h4>
              
              <div className="text-3xl font-bold text-[#1A5C34] mb-1" style={{ fontFamily: "'Sora', system-ui" }}>
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

              <button
                disabled={plan.current}
                onClick={!plan.current ? () => handlePayment(plan.name, billingCycle) : undefined}
                className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  plan.current
                    ? 'bg-[#1A5C34] text-white cursor-default'
                    : 'bg-[#1A5C34] text-white hover:bg-[#145a2b]'
                }`}
              >
                {plan.current ? 'Current Plan' : billingCycle === 'lifetime' ? `Get ${plan.displayName} Lifetime Deal` : plan.current ? 'Current Plan' : `Upgrade to ${plan.displayName}`}
              </button>

              <div className="text-xs text-neutral-500 text-center mt-2">
                Secure payment via Razorpay
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Full Feature Comparison Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-neutral-900">Full Feature Comparison</h3>
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
          <div className="overflow-x-auto">
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

      {/* SECTION 5: Lifetime Deal FAQ */}
      {billingCycle === 'lifetime' && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-neutral-900">Lifetime Deal FAQ</h3>
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
      )}

      {/* SECTION 6: Payment Method + Invoice History (for recurring subscribers) */}
      {!isLifetime && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Payment Method & Invoice History</h3>

          <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl mb-4">
            <CreditCard size={24} className="text-neutral-400" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-neutral-900">•••• •••• •••• 4242</div>
              <div className="text-xs text-neutral-500">Expires 12/2026</div>
            </div>
            <button className="text-sm text-[#1A5C34] hover:text-[#145a2b] font-semibold">
              Update
            </button>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Invoice History</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-neutral-900">Invoice #INV-2026-001</div>
                  <div className="text-xs text-neutral-500">January 2026</div>
                </div>
                <div className="text-sm font-semibold text-neutral-900">₹5,000</div>
                <button className="text-sm text-[#1A5C34] hover:underline">Download</button>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-neutral-900">Invoice #INV-2025-012</div>
                  <div className="text-xs text-neutral-500">December 2025</div>
                </div>
                <div className="text-sm font-semibold text-neutral-900">₹5,000</div>
                <button className="text-sm text-[#1A5C34] hover:underline">Download</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
