'use client';

import React from 'react';
import { TrendUp, TrendDown } from '@phosphor-icons/react';
import { colors, radius, spacing } from '@/lib/tokens';

interface Farm {
  id: string;
  name: string;
  district: string;
  status: string;
  breed: string | null;
  flockSize: number;
}

interface BenchmarkSlidersHorizontals {
  farm: string;
  breed: string;
  region: string;
  flockSize: string;
  period: string;
}

interface UserMetrics {
  fcr: number;
  mortalityPct: number;
  adg: number;
  grossMarginPct: number;
  fcrTrend?: number;
  mortalityTrend?: number;
  adgTrend?: number;
  marginTrend?: number;
}

interface YourPerformanceSummaryProps {
  metrics: UserMetrics | null;
  filters: BenchmarkSlidersHorizontals;
  farms: Farm[];
}

const KPICard = ({ 
  label, 
  value, 
  unit, 
  trend, 
  trendDirection 
}: { 
  label: string; 
  value: number | null; 
  unit?: string; 
  trend?: number; 
  trendDirection?: 'up' | 'down' | 'neutral';
}) => {
  const getTrendColor = () => {
    if (trendDirection === 'up') return colors.brandGreen700;
    if (trendDirection === 'down') return colors.red600;
    return colors.neutral400;
  };

  const getTrendIcon = () => {
    if (trendDirection === 'up') return <TrendUp size={16} weight="bold" />;
    if (trendDirection === 'down') return <TrendDown size={16} weight="bold" />;
    return null;
  };

  return (
    <div className="bg-white ring-1 ring-black/5 p-1.5 rounded-2xl">
      <div className="bg-neutral-50 rounded-[calc(2rem-0.375rem)] p-4">
        <p className="text-xs font-semibold text-neutral-600 mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-neutral-900">
            {typeof value === 'number' ? value.toFixed(2) : '—'}
          </p>
          {unit && <span className="text-sm text-neutral-600">{unit}</span>}
        </div>
        {trend !== undefined && trendDirection && (
          <div className="flex items-center gap-1 mt-2" style={{ color: getTrendColor() }}>
            {getTrendIcon()}
            <span className="text-xs font-semibold">
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export function YourPerformanceSummary({ metrics, filters, farms }: YourPerformanceSummaryProps) {
  // Get period label for header
  const getPeriodLabel = () => {
    switch (filters.period) {
      case 'last_batch': return 'Last Batch';
      case 'last_3_batches': return 'Last 3 Batches';
      case 'last_6_batches': return 'Last 6 Batches';
      case 'last_12_months': return 'Last 12 Months';
      default: return 'Last 3 Batches';
    }
  };

  // Get farm name for header
  const getFarmName = () => {
    if (filters.farm === 'all') return 'All Farms';
    const farm = farms.find(f => f.id === filters.farm);
    return farm ? farm.name : 'All Farms';
  };

  // Mock trend data (in production, this would come from API)
  const mockTrends = {
    fcrTrend: -2.5,
    mortalityTrend: -10.2,
    adgTrend: 5.8,
    marginTrend: 12.3,
  };

  // Determine trend direction based on whether metric is good or bad
  const getTrendDirection = (metric: string, trend: number) => {
    // For FCR and Mortality, downward trend is good
    if (metric === 'fcr' || metric === 'mortality') {
      return trend < 0 ? 'up' : trend > 0 ? 'down' : 'neutral';
    }
    // For ADG and Margin, upward trend is good
    return trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Your Farm(s)
          </h2>
          <p className="text-sm text-neutral-600">
            {getFarmName()} — {getPeriodLabel()}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {metrics ? (
        <div className="grid grid-cols-2 gap-4">
          <KPICard
            label="FCR"
            value={metrics.fcr}
            trend={mockTrends.fcrTrend}
            trendDirection={getTrendDirection('fcr', mockTrends.fcrTrend)}
          />
          <KPICard
            label="Mortality %"
            value={metrics.mortalityPct}
            unit="%"
            trend={mockTrends.mortalityTrend}
            trendDirection={getTrendDirection('mortality', mockTrends.mortalityTrend)}
          />
          <KPICard
            label="ADG"
            value={metrics.adg}
            unit="g/day"
            trend={mockTrends.adgTrend}
            trendDirection={getTrendDirection('adg', mockTrends.adgTrend)}
          />
          <KPICard
            label="Gross Margin"
            value={metrics.grossMarginPct}
            unit="%"
            trend={mockTrends.marginTrend}
            trendDirection={getTrendDirection('margin', mockTrends.marginTrend)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white ring-1 ring-black/5 p-1.5 rounded-2xl">
              <div className="bg-neutral-50 rounded-[calc(2rem-0.375rem)] p-4">
                <div className="h-6 bg-neutral-200 rounded animate-pulse mb-2" />
                <div className="h-8 bg-neutral-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default YourPerformanceSummary;
