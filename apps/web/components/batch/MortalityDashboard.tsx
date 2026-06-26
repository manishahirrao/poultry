'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, ReferenceLine, PieChart, Pie, Cell } from 'recharts';
import { TrendUp, TrendDown, Warning, CheckCircle } from '@phosphor-icons/react';
import MortalityPatternInsight from './MortalityPatternInsight';
import { createClient } from '@/utils/supabase/client';
import { erpColors, WebTypography, WebSpacing, radius, WebMotion, colors } from '@poultrypulse/ui';
import { formatDistanceToNow } from 'date-fns';

interface MortalityDashboardProps {
  batchId: string;
  batchName: string;
  birdsPlaced: number;
  currentBirdCount: number;
  docPlacementDate: string;
}

interface MortalityData {
  day: number;
  cumulativePct: number;
  dailyDeaths: number;
  standardPct: number;
}

interface CauseData {
  name: string;
  value: number;
  count: number;
}

interface MortalityLog {
  id: string;
  batch_id: string;
  log_date: string;
  count: number;
  cause: string | null;
  deleted_at: string | null;
}

const CAUSE_COLORS = [
  erpColors.brand400,
  erpColors.brand700,
  erpColors.amber,
  erpColors.red,
  erpColors.signal,
  '#7C3AED',
  '#0891B2',
  '#EC4899',
];

// Color coding for mortality rates using design tokens
const getMortalityColor = (rate: number): string => {
  if (rate < 0.3) return erpColors.brand400; // green
  if (rate < 0.5) return erpColors.amber; // amber
  return erpColors.red; // red
};

const getMortalityStatus = (rate: number): { icon: React.ReactNode; text: string; color: string } => {
  if (rate < 0.3) {
    return { icon: <CheckCircle size={20} />, text: 'Normal', color: erpColors.brand400 };
  }
  if (rate < 0.5) {
    return { icon: <Warning size={20} />, text: 'Elevated', color: erpColors.amber };
  }
  return { icon: <TrendUp size={20} />, text: 'Critical', color: erpColors.red };
};

// Breed standard mortality curve (Cobb 500)
const getBreedStandardMortality = (day: number): number => {
  // Simplified breed standard curve for broilers
  if (day <= 7) return 0.05 * day;
  if (day <= 14) return 0.35 + 0.03 * (day - 7);
  if (day <= 21) return 0.56 + 0.02 * (day - 14);
  if (day <= 28) return 0.7 + 0.015 * (day - 21);
  if (day <= 35) return 0.805 + 0.01 * (day - 28);
  return 0.875 + 0.005 * (day - 35);
};

export default function MortalityDashboard({
  batchId,
  batchName,
  birdsPlaced,
  currentBirdCount,
  docPlacementDate,
}: MortalityDashboardProps) {
  const [mortalityData, setMortalityData] = useState<MortalityData[]>([]);
  const [causeData, setCauseData] = useState<CauseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deathsToday, setDeathsToday] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Calculate mortality metrics
  const cumulativeDeaths = birdsPlaced - currentBirdCount;
  const cumulativeRate = (cumulativeDeaths / birdsPlaced) * 100;
  // FIXED: Calculate actual daily mortality rate: deaths_today / birds_placed × 100
  const dailyRate = birdsPlaced > 0 ? (deathsToday / birdsPlaced) * 100 : 0;
  const mortalityStatus = getMortalityStatus(dailyRate);
  const mortalityColor = getMortalityColor(dailyRate);

  useEffect(() => {
    const fetchMortalityData = async () => {
      setLoading(true);
      try {
        const browserSupabase = createClient();
        if (!browserSupabase) {
          console.warn('[MortalityDashboard] Supabase not configured, using fallback');
          setLoading(false);
          return;
        }

        // Fetch mortality logs from database
        const { data: mortalityLogs, error: mortalityError } = await browserSupabase
          .from('mortality_logs')
          .select('*')
          .eq('batch_id', batchId)
          .order('log_date', { ascending: true })
          .is('deleted_at', null);

        if (mortalityError) {
          console.error('Error fetching mortality logs:', mortalityError);
          setLoading(false);
          return;
        }

        // Calculate deaths today (most recent log)
        const today = new Date().toISOString().split('T')[0];
        const todayLog = mortalityLogs?.find((log: MortalityLog) => log.log_date === today);
        const deathsTodayValue = todayLog?.count || 0;
        setDeathsToday(deathsTodayValue);

        // Transform mortality logs to chart data
        const data: MortalityData[] = [];
        let cumulativeDeathsCount = 0;
        const ageInDays = Math.ceil((new Date().getTime() - new Date(docPlacementDate).getTime()) / (1000 * 60 * 60 * 24));

        // Create a map of deaths by day
        const deathsByDay = new Map<number, number>();
        mortalityLogs?.forEach((log: MortalityLog) => {
          const day = Math.ceil((new Date(log.log_date).getTime() - new Date(docPlacementDate).getTime()) / (1000 * 60 * 60 * 24));
          deathsByDay.set(day, (deathsByDay.get(day) || 0) + (log.count || 0));
        });

        // Generate data for each day
        for (let day = 1; day <= Math.min(ageInDays, 42); day++) {
          const standardPct = getBreedStandardMortality(day);
          const dailyDeaths = deathsByDay.get(day) || 0;
          cumulativeDeathsCount += dailyDeaths;
          const cumulativePct = birdsPlaced > 0 ? (cumulativeDeathsCount / birdsPlaced) * 100 : 0;

          data.push({
            day,
            cumulativePct,
            dailyDeaths,
            standardPct,
          });
        }

        setMortalityData(data);

        // Generate cause data from mortality logs
        const causeMap = new Map<string, number>();
        mortalityLogs?.forEach((log: MortalityLog) => {
          const cause = log.cause || 'Unknown';
          causeMap.set(cause, (causeMap.get(cause) || 0) + (log.count || 0));
        });

        const totalCauseDeaths = Array.from(causeMap.values()).reduce((sum, count) => sum + count, 0);
        const causeDataArray: CauseData[] = Array.from(causeMap.entries())
          .map(([name, count]) => ({
            name,
            value: totalCauseDeaths > 0 ? (count / totalCauseDeaths) * 100 : 0,
            count,
          }))
          .filter(item => item.count > 0);

        setCauseData(causeDataArray);

        // Update lastUpdated timestamp after successful data fetch
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching mortality data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMortalityData();
  }, [batchId, birdsPlaced, docPlacementDate]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6" style={{ borderRadius: `${radius.lg}px` }}>
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (mortalityData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6" style={{ borderRadius: `${radius.lg}px` }}>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">No mortality data available</p>
            <p className="text-sm text-gray-400 mt-2">Data will appear once the batch starts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ gap: `${WebSpacing.cardGap}` }}>
      {/* Header with timestamp */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900" style={{ fontSize: WebTypography.heading3.fontSize, fontWeight: WebTypography.heading3.fontWeight, color: erpColors.textPrimary }}>
          Mortality Dashboard — {batchName}
        </h3>
        <div className="text-xs" style={{ color: colors.neutral500, fontSize: '0.75rem', lineHeight: 1.4 }}>
          Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </div>
      </div>

      {/* Mortality Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ gap: `${WebSpacing.cardGap}` }}>
        {/* Birds Placed vs Alive */}
        <div className="bg-white border border-gray-200 rounded-lg p-4" style={{ borderRadius: `${radius.lg}px`, padding: `${WebSpacing.cardPadding}` }}>
          <div className="text-sm text-gray-600 mb-1" style={{ fontSize: WebTypography.bodySmall.fontSize, color: erpColors.textSecondary }}>Birds Placed</div>
          <div className="text-2xl font-bold text-gray-900" style={{ fontSize: WebTypography.statNumber.fontSize, fontWeight: WebTypography.statNumber.fontWeight, color: erpColors.textPrimary }}>{birdsPlaced.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1" style={{ fontSize: WebTypography.bodySmall.fontSize, color: erpColors.textSecondary }}>
            Alive: <span className="font-semibold" style={{ color: erpColors.brand400 }}>{currentBirdCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Cumulative Deaths */}
        <div className="bg-white border border-gray-200 rounded-lg p-4" style={{ borderRadius: `${radius.lg}px`, padding: `${WebSpacing.cardPadding}` }}>
          <div className="text-sm text-gray-600 mb-1" style={{ fontSize: WebTypography.bodySmall.fontSize, color: erpColors.textSecondary }}>Cumulative Deaths</div>
          <div className="text-2xl font-bold text-gray-900" style={{ fontSize: WebTypography.statNumber.fontSize, fontWeight: WebTypography.statNumber.fontWeight, color: erpColors.textPrimary }}>{cumulativeDeaths.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1" style={{ fontSize: WebTypography.bodySmall.fontSize, color: erpColors.textSecondary }}>
            Rate: <span className="font-semibold" style={{ color: erpColors.textPrimary }}>{cumulativeRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Daily Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-4" style={{ borderRadius: `${radius.lg}px`, padding: `${WebSpacing.cardPadding}` }}>
          <div className="text-sm text-gray-600 mb-1" style={{ fontSize: WebTypography.bodySmall.fontSize, color: erpColors.textSecondary }}>Daily Rate</div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold" style={{ fontSize: WebTypography.statNumber.fontSize, fontWeight: WebTypography.statNumber.fontWeight, color: mortalityColor }}>
              {dailyRate.toFixed(1)}%
            </div>
            <div style={{ color: mortalityColor }}>
              {mortalityStatus.icon}
            </div>
          </div>
          <div className="text-sm font-semibold mt-1" style={{ fontSize: WebTypography.bodySmall.fontSize, fontWeight: WebTypography.bodySmall.fontWeight, color: mortalityColor }}>
            {mortalityStatus.text}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-4" style={{ borderRadius: `${radius.lg}px`, padding: `${WebSpacing.cardPadding}` }}>
          <div className="text-sm text-gray-600 mb-1" style={{ fontSize: WebTypography.bodySmall.fontSize, color: erpColors.textSecondary }}>Standard</div>
          <div className="text-2xl font-bold text-gray-900" style={{ fontSize: WebTypography.statNumber.fontSize, fontWeight: WebTypography.statNumber.fontWeight, color: erpColors.textPrimary }}>&lt; 0.3%/day</div>
          <div className="text-sm mt-1" style={{ fontSize: WebTypography.bodySmall.fontSize }}>
            {dailyRate < 0.3 ? (
              <span className="font-semibold" style={{ color: erpColors.brand400 }}>✅ On Track</span>
            ) : (
              <span className="font-semibold" style={{ color: erpColors.red }}>⚠️ Above Standard</span>
            )}
          </div>
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6" style={{ borderRadius: `${radius.lg}px`, padding: `${WebSpacing.cardPaddingLg}` }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontSize: WebTypography.heading3.fontSize, fontWeight: WebTypography.heading3.fontWeight, color: erpColors.textPrimary, marginBottom: `${WebSpacing.headingMarginBottom}` }}>Daily Mortality Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={mortalityData}>
            <CartesianGrid strokeDasharray="3 3" stroke={erpColors.border} />
            <XAxis 
              dataKey="day" 
              stroke={erpColors.textSecondary}
              fontSize={12}
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              yAxisId="left"
              stroke={erpColors.textSecondary}
              fontSize={12}
              label={{ value: 'Deaths/Day', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke={erpColors.textSecondary}
              fontSize={12}
              domain={[0, 5]}
              label={{ value: 'Cumulative %', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: erpColors.cardBg, 
                border: `1px solid ${erpColors.border}`,
                borderRadius: `${radius.md}px`
              }}
            />
            <Legend />
            <ReferenceLine y={0.3} stroke={erpColors.brand400} strokeDasharray="5 5" label="Normal" yAxisId="right" />
            <ReferenceLine y={0.5} stroke={erpColors.red} strokeDasharray="5 5" label="Critical" yAxisId="right" />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="cumulativePct" 
              stroke={erpColors.brand400} 
              fillOpacity={0.3}
              fill={erpColors.brand400}
              name="Cumulative %"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="standardPct" 
              stroke="#9CA3AF" 
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Breed Standard"
            />
            <Bar 
              yAxisId="left"
              dataKey="dailyDeaths" 
              fill={erpColors.red} 
              name="Daily Deaths"
              opacity={0.6}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Cause Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6" style={{ borderRadius: `${radius.lg}px`, padding: `${WebSpacing.cardPaddingLg}` }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontSize: WebTypography.heading3.fontSize, fontWeight: WebTypography.heading3.fontWeight, color: erpColors.textPrimary, marginBottom: `${WebSpacing.headingMarginBottom}` }}>Cause of Death Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ gap: `${WebSpacing.cardGap}` }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={causeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {causeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CAUSE_COLORS[index % CAUSE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-3" style={{ gap: `${WebSpacing.mobile.elementGap}` }}>
            {causeData.map((cause, index) => (
              <div key={cause.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ gap: `${WebSpacing.mobile.tightGap}` }}>
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: CAUSE_COLORS[index % CAUSE_COLORS.length], borderRadius: `${radius.sm}px` }}
                  />
                  <span className="text-sm font-medium text-gray-700" style={{ fontSize: WebTypography.bodySmall.fontSize, fontWeight: WebTypography.bodySmall.fontWeight, color: erpColors.textPrimary }}>{cause.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900" style={{ fontSize: WebTypography.bodySmall.fontSize, fontWeight: WebTypography.bodySmall.fontWeight, color: erpColors.textPrimary }}>{cause.count} birds</div>
                  <div className="text-xs text-gray-500" style={{ fontSize: '0.75rem', color: erpColors.textSecondary }}>{cause.value}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Abnormal Mortality Alert */}
      {dailyRate > 0.5 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" style={{ backgroundColor: '#FDF0EF', borderColor: erpColors.red, borderRadius: `${radius.lg}px`, padding: `${WebSpacing.cardPadding}` }}>
          <div className="flex items-start gap-3" style={{ gap: `${WebSpacing.mobile.elementGap}` }}>
            <Warning size={24} className="text-red-600 mt-0.5" style={{ color: erpColors.red }} />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1" style={{ fontSize: WebTypography.bodySmall.fontSize, fontWeight: WebTypography.bodySmall.fontWeight, color: erpColors.textPrimary, marginBottom: `${WebSpacing.mobile.tightGap}px` }}>
                ⚠️ असामान्य मृत्यु — Abnormal Mortality
              </h4>
              <p className="text-sm text-gray-700 mb-2" style={{ fontSize: WebTypography.bodySmall.fontSize, color: erpColors.textPrimary, marginBottom: `${WebSpacing.mobile.tightGap}px` }}>
                आज की मृत्यु दर ({dailyRate.toFixed(2)}%/day) मानक (0.3%/day) से अधिक है।
              </p>
              <p className="text-sm text-gray-600" style={{ fontSize: WebTypography.bodySmall.fontSize, color: erpColors.textSecondary }}>
                आपके झुंड पर अनुमानित आर्थिक प्रभाव: ~₹{(cumulativeDeaths * 2.0 * 150).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mortality Pattern Insight Card */}
      <MortalityPatternInsight batchId={batchId} showPattern={dailyRate > 0.3} />
    </div>
  );
}
