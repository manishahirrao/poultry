'use client';

import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
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

interface BenchmarkRadarChartProps {
  userMetrics: UserMetrics | null;
  benchmarkData: BenchmarkData;
}

interface NormalizedData {
  metric: string;
  yourPortfolio: number;
  groupAverage: number;
  top25: number;
  fullMark: number;
}

const BenchmarkRadarChart = ({ userMetrics, benchmarkData }: BenchmarkRadarChartProps) => {
  // Normalize metrics to 0-100 scale for radar chart using fixed ranges as specified in task
  const normalizeMetrics = (): NormalizedData[] => {
    if (!userMetrics) return [];

    const metrics = [
      {
        key: 'fcr',
        label: 'FCR',
        userValue: userMetrics.fcr,
        groupAvg: benchmarkData.metrics.fcr.p50,
        top25: benchmarkData.metrics.fcr.p25,
        min: 1.5,
        max: 2.5,
        lowerIsBetter: true,
      },
      {
        key: 'mortality',
        label: 'Mortality',
        userValue: userMetrics.mortalityPct,
        groupAvg: benchmarkData.metrics.mortalityPct.p50,
        top25: benchmarkData.metrics.mortalityPct.p25,
        min: 0,
        max: 10,
        lowerIsBetter: true,
      },
      {
        key: 'adg',
        label: 'ADG',
        userValue: userMetrics.adg,
        groupAvg: benchmarkData.metrics.adg.p50,
        top25: benchmarkData.metrics.adg.p75,
        min: 30,
        max: 70,
        lowerIsBetter: false,
      },
      {
        key: 'weight',
        label: 'Weight',
        userValue: userMetrics.harvestWeight || 0,
        groupAvg: benchmarkData.metrics.harvestWeight.p50,
        top25: benchmarkData.metrics.harvestWeight.p75,
        min: 1.5,
        max: 2.5,
        lowerIsBetter: false,
      },
      {
        key: 'duration',
        label: 'Duration',
        userValue: userMetrics.batchDuration || 0,
        groupAvg: benchmarkData.metrics.batchDuration.p50,
        top25: benchmarkData.metrics.batchDuration.p25,
        min: 35,
        max: 45,
        lowerIsBetter: true,
      },
      {
        key: 'feedEfficiency',
        label: 'Feed Eff',
        userValue: userMetrics.feedEfficiency || 0,
        groupAvg: benchmarkData.metrics.feedEfficiency.p50,
        top25: benchmarkData.metrics.feedEfficiency.p75,
        min: 50,
        max: 80,
        lowerIsBetter: false,
      },
      {
        key: 'margin',
        label: 'Margin',
        userValue: userMetrics.grossMarginPct,
        groupAvg: benchmarkData.metrics.grossMarginPct.p50,
        top25: benchmarkData.metrics.grossMarginPct.p75,
        min: 0,
        max: 30,
        lowerIsBetter: false,
      },
    ];

    return metrics.map((metric) => {
      const range = metric.max - metric.min || 1;

      // Normalize to 0-100 scale using fixed ranges
      const normalize = (value: number) => {
        if (metric.lowerIsBetter) {
          // For lower-is-better metrics: 100 = min, 0 = max
          return ((metric.max - value) / range) * 100;
        }
        // For higher-is-better metrics: 100 = max, 0 = min
        return ((value - metric.min) / range) * 100;
      };

      return {
        metric: metric.label,
        yourPortfolio: Math.max(0, Math.min(100, normalize(metric.userValue))),
        groupAverage: Math.max(0, Math.min(100, normalize(metric.groupAvg))),
        top25: Math.max(0, Math.min(100, normalize(metric.top25))),
        fullMark: 100,
      };
    });
  };

  const normalizedData = normalizeMetrics();

  if (!userMetrics || normalizedData.length === 0) {
    return (
      <div className="bg-white ring-1 ring-black/5 rounded-2xl p-6">
        <div className="h-[340px] flex items-center justify-center">
          <div className="text-neutral-500 text-sm">Loading radar chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Performance Radar Chart
        </h2>
        <p className="text-sm text-neutral-600">
          7-axis comparison across key metrics (normalized 0-100 scale)
        </p>
      </div>

      {/* Radar Chart */}
      <div className="bg-white ring-1 ring-black/5 rounded-2xl p-6">
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart data={normalizedData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={false}
            />
            <Legend />
            
            {/* Your Portfolio - Dark green filled area */}
            <Radar
              name="Your Portfolio"
              dataKey="yourPortfolio"
              stroke={colors.brandGreen700}
              fill={colors.brandGreen700}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            
            {/* Group Average - Grey outline dashed */}
            <Radar
              name="Group Average"
              dataKey="groupAverage"
              stroke="#9CA3AF"
              fill="#9CA3AF"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            
            {/* Top 25% - Purple outline dashed */}
            <Radar
              name="Top 25%"
              dataKey="top25"
              stroke="#A855F7"
              fill="#A855F7"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Explanation */}
      <div className="flex items-center gap-4 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-brand-green700 opacity-30" />
          <span>Your Portfolio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-400 opacity-30 border-2 border-dashed border-neutral-400" />
          <span>Group Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500 opacity-30 border-2 border-dashed border-purple-500" />
          <span>Top 25%</span>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkRadarChart;
