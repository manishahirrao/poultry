'use client';

import React from 'react';
import { colors, radius } from '@/lib/tokens';

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

interface BenchmarkComparisonTableProps {
  userMetrics: UserMetrics | null;
  benchmarkData: BenchmarkData;
}

interface MetricRow {
  metric: string;
  userValue: number | null;
  groupAvg: number;
  top25: number;
  p75: number;
  top10: number;
  unit?: string;
  lowerIsBetter: boolean;
}

const BenchmarkComparisonTable = ({ userMetrics, benchmarkData }: BenchmarkComparisonTableProps) => {
  // Calculate rank based on p25/p75 values as specified in task
  const getRank = (yours: number, p25: number, p75: number, metric: string): string => {
    const lowerIsBetter = ['fcr', 'mortality_pct', 'batch_duration_days'];
    if (lowerIsBetter.includes(metric)) {
      if (yours < p25) return 'Top 25% ✅';
      if (yours < p75) return 'Average';
      return 'Bottom 25% ⚠';
    } else {
      if (yours > p75) return 'Top 25% ✅';
      if (yours > p25) return 'Average';
      return 'Bottom 25% ⚠';
    }
  };

  // Get color class based on comparison - exact specification from task
  const getMetricColour = (yours: number, groupAvg: number, metric: string) => {
    const lowerIsBetter = ['fcr', 'mortality_pct', 'batch_duration_days'];
    const better = lowerIsBetter.includes(metric) ? yours <= groupAvg : yours >= groupAvg;
    const pctDiff = Math.abs((yours - groupAvg) / groupAvg * 100);
    if (better) return 'text-green-700 bg-green-50';
    if (pctDiff <= 10) return 'text-amber-700 bg-amber-50';
    return 'text-red-700 bg-red-50';
  };

  // Get rank color
  const getRankColor = (rank: string) => {
    if (rank.includes('Top 25%')) return 'text-brand-green700';
    if (rank.includes('Top 50%')) return 'text-amber500';
    return 'text-red600';
  };

  // Build metric rows
  const metricRows: MetricRow[] = [
    {
      metric: 'FCR',
      userValue: userMetrics?.fcr || null,
      groupAvg: benchmarkData.metrics.fcr.p50,
      top25: benchmarkData.metrics.fcr.p25,
      p75: benchmarkData.metrics.fcr.p75,
      top10: benchmarkData.metrics.fcr.p90,
      lowerIsBetter: true,
    },
    {
      metric: 'Mortality %',
      userValue: userMetrics?.mortalityPct || null,
      groupAvg: benchmarkData.metrics.mortalityPct.p50,
      top25: benchmarkData.metrics.mortalityPct.p25,
      p75: benchmarkData.metrics.mortalityPct.p75,
      top10: benchmarkData.metrics.mortalityPct.p90,
      unit: '%',
      lowerIsBetter: true,
    },
    {
      metric: 'ADG (g/day)',
      userValue: userMetrics?.adg || null,
      groupAvg: benchmarkData.metrics.adg.p50,
      top25: benchmarkData.metrics.adg.p75,
      p75: benchmarkData.metrics.adg.p75,
      top10: benchmarkData.metrics.adg.p90,
      unit: 'g',
      lowerIsBetter: false,
    },
    {
      metric: 'Harvest Weight',
      userValue: userMetrics?.harvestWeight || null,
      groupAvg: benchmarkData.metrics.harvestWeight.p50,
      top25: benchmarkData.metrics.harvestWeight.p75,
      p75: benchmarkData.metrics.harvestWeight.p75,
      top10: benchmarkData.metrics.harvestWeight.p90,
      unit: 'kg',
      lowerIsBetter: false,
    },
    {
      metric: 'Batch Duration',
      userValue: userMetrics?.batchDuration || null,
      groupAvg: benchmarkData.metrics.batchDuration.p50,
      top25: benchmarkData.metrics.batchDuration.p25,
      p75: benchmarkData.metrics.batchDuration.p75,
      top10: benchmarkData.metrics.batchDuration.p90,
      unit: 'days',
      lowerIsBetter: true,
    },
    {
      metric: 'Feed Efficiency',
      userValue: userMetrics?.feedEfficiency || null,
      groupAvg: benchmarkData.metrics.feedEfficiency.p50,
      top25: benchmarkData.metrics.feedEfficiency.p75,
      p75: benchmarkData.metrics.feedEfficiency.p75,
      top10: benchmarkData.metrics.feedEfficiency.p90,
      unit: '%',
      lowerIsBetter: false,
    },
    {
      metric: 'Gross Margin',
      userValue: userMetrics?.grossMarginPct || null,
      groupAvg: benchmarkData.metrics.grossMarginPct.p50,
      top25: benchmarkData.metrics.grossMarginPct.p75,
      p75: benchmarkData.metrics.grossMarginPct.p75,
      top10: benchmarkData.metrics.grossMarginPct.p90,
      unit: '%',
      lowerIsBetter: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Benchmark Comparison Table
        </h2>
        <p className="text-sm text-neutral-600">
          How you compare to filtered group
        </p>
      </div>

      {/* Table */}
      <div className="bg-white ring-1 ring-black/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-700">
                  Metric
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-700">
                  Your Avg
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-700">
                  Group Avg
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-700">
                  Top 25%
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-700">
                  Top 10%
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-700">
                  Your Rank
                </th>
              </tr>
            </thead>
            <tbody>
              {metricRows.map((row, index) => {
                const metricKey = row.metric.toLowerCase().replace(/[^a-z]/g, '_');
                const rank = getRank(row.userValue || 0, row.top25, row.p75, metricKey);
                const valueColor = getMetricColour(row.userValue || 0, row.groupAvg, metricKey);
                const rankColor = getRankColor(rank);

                return (
                  <tr
                    key={row.metric}
                    className={`border-b border-neutral-100 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'
                    }`}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-neutral-900">
                      {row.metric}
                    </td>
                    <td className={`py-3 px-4 text-sm font-semibold rounded-md ${valueColor}`}>
                      {row.userValue !== null 
                        ? row.userValue.toFixed(2) + (row.unit || '')
                        : '—'
                      }
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700 text-center">
                      {row.groupAvg.toFixed(2)}{row.unit || ''}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700 text-center">
                      {row.top25.toFixed(2)}{row.unit || ''}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700 text-center">
                      {row.top10.toFixed(2)}{row.unit || ''}
                    </td>
                    <td className={`py-3 px-4 text-sm font-semibold ${rankColor} text-center`}>
                      {rank}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-green700" />
          <span>≥ Group Avg</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber500" />
          <span>5–10% below</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red600" />
          <span>&gt;10% below</span>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkComparisonTable;
