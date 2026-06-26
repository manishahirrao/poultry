'use client';

import { TrendUp, TrendDown, Clock } from '@phosphor-icons/react';

interface ProcurementRecommendationProps {
  recommendation: 'BUY_NOW' | 'WAIT' | 'NEUTRAL';
  reason: string;
  estimatedSavings: number;
  isLoading?: boolean;
}

export function ProcurementRecommendation({
  recommendation,
  reason,
  estimatedSavings,
  isLoading,
}: ProcurementRecommendationProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const recommendationConfig = {
    BUY_NOW: {
      label: 'अभी खरीदें',
      englishLabel: 'BUY NOW',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-200',
      iconColor: 'text-green-700',
      textColor: 'text-green-800',
      icon: TrendUp,
    },
    WAIT: {
      label: 'रुकें',
      englishLabel: 'WAIT',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-200',
      iconColor: 'text-amber-700',
      textColor: 'text-amber-800',
      icon: TrendDown,
    },
    NEUTRAL: {
      label: 'तटस्थ',
      englishLabel: 'NEUTRAL',
      bgColor: 'bg-neutral-50',
      borderColor: 'border-neutral-200',
      iconBg: 'bg-neutral-200',
      iconColor: 'text-neutral-700',
      textColor: 'text-neutral-800',
      icon: Clock,
    },
  };

  const config = recommendationConfig[recommendation];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <h3 className="text-base font-semibold text-neutral-900 mb-4">
        Procurement Timing Recommendation
      </h3>
      <div
        className={`p-4 rounded-xl ${config.bgColor} ${config.borderColor} border`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg} ${config.iconColor}`}
          >
            <Icon size={20} weight="bold" />
          </div>
          <div className="flex-1">
            <div className={`text-lg font-bold mb-1 ${config.textColor}`}>
              {config.label}
              <span className="text-sm font-normal ml-2 opacity-75">
                {config.englishLabel}
              </span>
            </div>
            <div className="text-sm text-neutral-700 mb-2">{reason}</div>
            <div className="text-sm font-semibold text-neutral-900">
              Potential Savings: ₹{estimatedSavings.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
