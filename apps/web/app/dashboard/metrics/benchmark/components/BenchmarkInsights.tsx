'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendUp, TrendDown, Info } from '@phosphor-icons/react';
import { colors } from '@/lib/tokens';

interface UserMetrics {
  fcr: number;
  mortalityPct: number;
  adg: number;
  grossMarginPct: number;
  harvestWeight?: number;
  batchDuration?: number;
  feedEfficiency?: number;
}

interface BenchmarkData {
  privacyMinimumMet: boolean;
  sampleCount: number;
  farmCount: number;
  metrics: {
    fcr: { p25: number; p50: number; p75: number; p90: number };
    mortalityPct: { p25: number; p50: number; p75: number; p90: number };
    adg: { p25: number; p50: number; p75: number; p90: number };
    harvestWeight: { p25: number; p50: number; p75: number; p90: number };
    batchDuration: { p25: number; p50: number; p75: number; p90: number };
    feedEfficiency: { p25: number; p50: number; p75: number; p90: number };
    grossMarginPct: { p25: number; p50: number; p75: number; p90: number };
  };
}

interface BenchmarkSlidersHorizontals {
  farm: string;
  breed: string;
  region: string;
  flockSize: string;
  period: string;
}

interface BenchmarkInsightsProps {
  userMetrics: UserMetrics | null;
  benchmarkData: BenchmarkData;
  filters: BenchmarkSlidersHorizontals;
}

interface InsightCard {
  type: 'strength' | 'improvement' | 'context' | 'action';
  title: string;
  content: string;
  icon: React.ReactNode;
}

const BenchmarkInsights = ({ userMetrics, benchmarkData, filters }: BenchmarkInsightsProps) => {
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userMetrics && benchmarkData) {
      generateInsights();
    }
  }, [userMetrics, benchmarkData]);

  const generateInsights = async () => {
    setIsLoading(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate template-based insights (fallback if AI API fails)
    const templateInsights: InsightCard[] = [];

    // Strength insight
    if (userMetrics!.fcr <= benchmarkData.metrics.fcr.p50) {
      templateInsights.push({
        type: 'strength',
        title: 'Strength',
        content: `Your FCR of ${userMetrics!.fcr.toFixed(3)} is better than the group average of ${benchmarkData.metrics.fcr.p50.toFixed(3)}. This indicates efficient feed conversion.`,
        icon: <TrendUp size={20} weight="bold" className={colors.brandGreen700} />,
      });
    } else if (userMetrics!.mortalityPct <= benchmarkData.metrics.mortalityPct.p50) {
      templateInsights.push({
        type: 'strength',
        title: 'Strength',
        content: `Your mortality rate of ${userMetrics!.mortalityPct.toFixed(1)}% is better than the group average of ${benchmarkData.metrics.mortalityPct.p50.toFixed(1)}%. Excellent health management.`,
        icon: <TrendUp size={20} weight="bold" className={colors.brandGreen700} />,
      });
    } else if (userMetrics!.grossMarginPct >= benchmarkData.metrics.grossMarginPct.p50) {
      templateInsights.push({
        type: 'strength',
        title: 'Strength',
        content: `Your gross margin of ${userMetrics!.grossMarginPct.toFixed(1)}% exceeds the group average of ${benchmarkData.metrics.grossMarginPct.p50.toFixed(1)}%. Strong profitability.`,
        icon: <TrendUp size={20} weight="bold" className={colors.brandGreen700} />,
      });
    }

    // Improvement insight
    if (userMetrics!.fcr > benchmarkData.metrics.fcr.p75) {
      templateInsights.push({
        type: 'improvement',
        title: 'Improvement Opportunity',
        content: `Your FCR is ${((userMetrics!.fcr - benchmarkData.metrics.fcr.p50) / benchmarkData.metrics.fcr.p50 * 100).toFixed(1)}% above group average. Review feed quality and distribution timing.`,
        icon: <TrendDown size={20} weight="bold" className={colors.red600} />,
      });
    } else if (userMetrics!.mortalityPct > benchmarkData.metrics.mortalityPct.p75) {
      templateInsights.push({
        type: 'improvement',
        title: 'Improvement Opportunity',
        content: `Mortality is ${((userMetrics!.mortalityPct - benchmarkData.metrics.mortalityPct.p50) / benchmarkData.metrics.mortalityPct.p50 * 100).toFixed(1)}% above average. Focus on biosecurity and vaccination protocols.`,
        icon: <TrendDown size={20} weight="bold" className={colors.red600} />,
      });
    }

    // Context insight
    templateInsights.push({
      type: 'context',
      title: 'Benchmark Context',
      content: `Comparing against ${benchmarkData.sampleCount} batches from ${benchmarkData.farmCount} farms with ${filters.breed === 'all' ? 'mixed breeds' : filters.breed} in ${filters.region === 'all' ? 'all regions' : filters.region}.`,
      icon: <Info size={20} weight="bold" className={colors.neutral500} />,
    });

    // Action insight
    if (userMetrics!.adg < benchmarkData.metrics.adg.p50) {
      templateInsights.push({
        type: 'action',
        title: 'Action Suggestion',
        content: `ADG is below group average. Consider optimizing nutrition program and ensuring consistent water availability to improve growth rates.`,
        icon: <Lightbulb size={20} weight="bold" className={colors.amber500} />,
      });
    } else {
      templateInsights.push({
        type: 'action',
        title: 'Action Suggestion',
        content: `Maintain current practices. Monitor feed conversion efficiency and continue tracking mortality to sustain performance.`,
        icon: <Lightbulb size={20} weight="bold" className={colors.brandGreen700} />,
      });
    }

    setInsights(templateInsights);
    setIsLoading(false);
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-brand-green50 border-brand-green200';
      case 'improvement':
        return 'bg-redLight border-red200';
      case 'context':
        return 'bg-neutral-50 border-neutral-200';
      case 'action':
        return 'bg-amberLight border-amber200';
      default:
        return 'bg-neutral-50 border-neutral-200';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'text-brand-green700';
      case 'improvement':
        return 'text-red600';
      case 'context':
        return 'text-neutral-600';
      case 'action':
        return 'text-amber600';
      default:
        return 'text-neutral-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Benchmark Insights
        </h2>
        <p className="text-sm text-neutral-600">
          AI-generated analysis of your performance vs peer group
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white ring-1 ring-black/5 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-12 bg-neutral-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insight Cards */}
      {!isLoading && insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`ring-1 rounded-2xl p-6 ${getCardColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 p-2 rounded-full ${getIconColor(insight.type)}`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {insight.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && insights.length === 0 && (
        <div className="bg-white ring-1 ring-black/5 rounded-2xl p-6">
          <div className="text-center text-neutral-500 text-sm">
            No insights available. Ensure you have completed batch data.
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchmarkInsights;
