'use client'
// Shown wherever a feature is locked.
// Two variants: compact (for inline/overlay) and standard (for full empty states)

import Link from 'next/link'
import { Lock } from '@phosphor-icons/react'
import type { FeatureKey, PlanName } from '@/lib/plans/featureGates'
import { PLAN_PRICING } from '@/lib/plans/featureGates'

const FEATURE_LABELS: Partial<Record<FeatureKey, { en: string; hi: string; description: string }>> = {
  forecast_30day:             { en: '30-Day Price Forecast',    hi: '30 दिन का मूल्य पूर्वानुमान', description: 'See P10/P50/P90 forecast up to 30 days ahead' },
  price_drivers_shap:         { en: 'Price Driver Analysis',    hi: 'मूल्य कारण विश्लेषण',           description: 'AI-powered analysis of why prices move' },
  sell_signal_optimal_window: { en: 'Optimal Sell Window',      hi: 'सर्वोत्तम बिक्री विंडो',         description: 'AI-computed best days to sell your batch' },
  portfolio_metrics:          { en: 'Portfolio Dashboard',      hi: 'पोर्टफोलियो डैशबोर्ड',          description: 'Aggregated metrics across all your farms' },
  employee_management:        { en: 'Employee Management',      hi: 'कर्मचारी प्रबंधन',               description: 'Manage staff, salaries, and business expenses' },
  farm_compare:               { en: 'Farm Comparison',          hi: 'Farm तुलना',                    description: 'Compare performance across all your farms' },
  pl_overview:                { en: 'P&L Dashboard',            hi: 'लाभ-हानि डैशबोर्ड',              description: 'Complete monthly profit & loss overview' },
  api_access:                 { en: 'API Access',               hi: 'API एक्सेस',                     description: 'Programmatic access to price forecasts' },
  team_members:               { en: 'Team Management',          hi: 'टीम प्रबंधन',                    description: 'Add up to 5 team members with role-based access' },
  farm_management:            { en: 'Add More Farms',           hi: 'और Farms जोड़ें',                description: 'Manage unlimited farms across your portfolio' },
}

interface PlanUpgradePromptProps {
  feature:       FeatureKey
  upgradeTarget: PlanName
  compact?:      boolean
  language?:     string
}

export function PlanUpgradePrompt({
  feature, upgradeTarget, compact = false, language = 'hi'
}: PlanUpgradePromptProps) {
  const isHindi = language === 'hi'
  const label   = FEATURE_LABELS[feature]
  const pricing = PLAN_PRICING[upgradeTarget]
  const planDisplayName = upgradeTarget === 'FLOCKIQ_FARM' ? 'FlockIQ FARM' : 'FlockIQ PRO'

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <div className="w-9 h-9 rounded-full bg-[#EDF7F1] flex items-center justify-center">
          <Lock size={18} color="#1A5C34" weight="bold" />
        </div>
        <p className="text-xs font-semibold text-gray-900">
          {isHindi
            ? `यह feature ${planDisplayName} plan में है`
            : `Available in ${planDisplayName}`}
        </p>
        <p className="text-[10px] text-gray-500">
          ₹{pricing.monthly.toLocaleString('en-IN')}/month
        </p>
        <Link
          href="/dashboard/settings/billing"
          className="text-xs font-semibold text-[#1A5C34] underline"
        >
          {isHindi ? 'Upgrade करें →' : 'Upgrade →'}
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 text-center max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-full bg-[#EDF7F1] flex items-center justify-center mx-auto mb-4">
        <Lock size={22} color="#1A5C34" weight="bold" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {isHindi
          ? `${label?.hi ?? 'यह Feature'} उपलब्ध नहीं है`
          : `${label?.en ?? 'This Feature'} Not Available`}
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        {isHindi
          ? `यह ${planDisplayName} plan में उपलब्ध है। ₹${pricing.monthly.toLocaleString('en-IN')}/month से शुरू।`
          : `${label?.description ?? 'Upgrade to unlock this feature.'} Available in ${planDisplayName} at ₹${pricing.monthly.toLocaleString('en-IN')}/month.`}
      </p>
      <Link
        href="/dashboard/settings/billing"
        className="inline-flex items-center gap-2 bg-[#1A5C34] text-white text-sm font-medium
                   px-5 py-2.5 rounded-lg hover:bg-[#1F7040] transition-colors"
      >
        {isHindi ? `${planDisplayName} में Upgrade करें` : `Upgrade to ${planDisplayName}`}
      </Link>
      <p className="text-[10px] text-gray-400 mt-3">
        {isHindi
          ? 'या ₹' + pricing.lifetime.toLocaleString('en-IN') + ' में Lifetime Deal लें (5 साल)'
          : 'Or get Lifetime Deal at ₹' + pricing.lifetime.toLocaleString('en-IN') + ' (5 years)'}
      </p>
    </div>
  )
}
