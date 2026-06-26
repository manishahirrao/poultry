'use client';

// WHY: This is the price forecast chart component that displays P10, P50, P90 forecast bands and actual prices.
// It uses Recharts ComposedChart to show confidence intervals (P10-P90 band), the median forecast (P50 line),
// and actual historical prices (scatter points). It includes festival annotations, HPAI alert zones,
// and a "Today" reference line. The component supports multiple time ranges (7D, 14D, 30D, 90D) and uses
// SWR for data fetching with 5-minute revalidation intervals.

import { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer, Legend } from 'recharts';
import useSWR from 'swr';
import { FlockIQTokens } from '@/lib/design-tokens';

interface ForecastDataPoint {
  date: string;
  p10: number | null;
  p50: number | null;
  p90: number | null;
  actual: number | null;
  sellSignal?: 'SELL_NOW' | 'HOLD' | null;
  isToday?: boolean;
  festivalName?: string | null;
  hpaiAlert?: boolean;
}

interface PriceForecastChartProps {
  mandiId: string;
  initialRange?: '7D' | '14D' | '30D' | '90D';
}

type Range = '7D' | '14D' | '30D' | '90D';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PriceForecastChart({ mandiId, initialRange = '30D' }: PriceForecastChartProps) {
  const [range, setRange] = useState<Range>(initialRange);

  const { data, isLoading, error } = useSWR(
    `/api/price-intelligence/forecast?range=${range}&mandi=${mandiId}`,
    fetcher,
    { revalidateOnFocus: false, revalidateInterval: 300000 }
  );

  const chartData: ForecastDataPoint[] = data || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const today = new Date().toISOString().split('T')[0];

  // Extract festival points
  const festivalPoints = chartData.filter(d => d.festivalName);
  
  // Extract HPAI alert ranges
  const hpaiRanges: { start: string; end: string }[] = [];
  let inHpaiRange = false;
  let hpaiStart = '';
  
  chartData.forEach((d, i) => {
    if (d.hpaiAlert && !inHpaiRange) {
      hpaiStart = d.date;
      inHpaiRange = true;
    } else if (!d.hpaiAlert && inHpaiRange) {
      hpaiRanges.push({ start: hpaiStart, end: d.date });
      inHpaiRange = false;
    }
  });
  if (inHpaiRange) {
    hpaiRanges.push({ start: hpaiStart, end: chartData[chartData.length - 1]?.date || today });
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    const dataPoint = payload[0].payload;
    const p50Data = payload.find((p: any) => p.dataKey === 'p50');
    const actualData = payload.find((p: any) => p.dataKey === 'actual');
    
    return (
      <div 
        className="bg-white rounded-xl shadow-lg p-3 text-sm"
        style={{ borderColor: FlockIQTokens.cardBorder, borderWidth: '1px', borderStyle: 'solid' }}
      >
        <p className="font-semibold text-gray-900">{formatDate(label)}</p>
        {p50Data && p50Data.value && (
          <p>P50: <strong>₹{p50Data.value.toFixed(2)}/kg</strong></p>
        )}
        {actualData && actualData.value && (
          <p className="text-orange-600">Actual: ₹{actualData.value.toFixed(2)}/kg</p>
        )}
        {dataPoint.p10 && dataPoint.p90 && (
          <p className="text-gray-500">Range: ₹{dataPoint.p10.toFixed(0)}–₹{dataPoint.p90.toFixed(0)}</p>
        )}
        {dataPoint.festivalName && (
          <p className="text-purple-600 mt-1">🎉 {dataPoint.festivalName}</p>
        )}
      </div>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div 
        className="bg-white rounded-xl p-6"
        style={{ borderColor: FlockIQTokens.cardBorder, borderWidth: '1px', borderStyle: 'solid' }}
      >
        <div className="h-[280px] bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold">Failed to load forecast data</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div 
        className="bg-white rounded-xl p-6"
        style={{ borderColor: FlockIQTokens.cardBorder, borderWidth: '1px', borderStyle: 'solid' }}
      >
        <div className="text-center py-12">
          <p className="text-gray-500">Price data loads daily at 6:00 AM. Check back tomorrow.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl p-6"
      style={{ borderColor: FlockIQTokens.cardBorder, borderWidth: '1px', borderStyle: 'solid' }}
    >
      {/* Time range selector */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Price Forecast</h2>
        <div className="flex gap-2">
          {(['7D', '14D', '30D', '90D'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-[#1A5C34] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={range === r ? { backgroundColor: FlockIQTokens.brand700 } : {}}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={FlockIQTokens.cardBorder} />
            
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke={FlockIQTokens.neutralGray}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            
            <YAxis
              stroke={FlockIQTokens.neutralGray}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* P10-P90 confidence band */}
            <Area
              type="monotone"
              dataKey="p90"
              fill={FlockIQTokens.brand100}
              stroke="transparent"
            />
            <Area
              type="monotone"
              dataKey="p10"
              fill={FlockIQTokens.cardBg}
              stroke="transparent"
            />

            {/* P50 forecast line */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke={FlockIQTokens.brand700}
              strokeWidth={2.5}
              dot={false}
            />

            {/* Actual price line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke={FlockIQTokens.actualPrice}
              strokeWidth={2}
              dot={{ r: 3, fill: FlockIQTokens.actualPrice }}
              connectNulls={false}
            />

            {/* Today's reference line */}
            <ReferenceLine
              x={today}
              stroke={FlockIQTokens.neutralGray}
              strokeDasharray="4 2"
              label="Today"
            />

            {/* Festival annotations */}
            {festivalPoints.map((point) => (
              <ReferenceLine
                key={point.date}
                x={point.date}
                stroke={FlockIQTokens.festivalPurple}
                strokeDasharray="2 2"
                label={{
                  value: point.festivalName || '',
                  position: 'top',
                  fontSize: 10,
                  fill: FlockIQTokens.festivalPurple
                }}
              />
            ))}

            {/* HPAI alert zones */}
            {hpaiRanges.map((range, i) => (
              <ReferenceArea
                key={i}
                x1={range.start}
                x2={range.end}
                fill={FlockIQTokens.alertRed}
                fillOpacity={0.4}
              />
            ))}

            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Sell signal callout */}
      {chartData.find(d => d.isToday)?.sellSignal && (
        <div 
          className="mt-4 p-3 rounded-lg"
          style={{
            backgroundColor: FlockIQTokens.brand50,
            borderColor: FlockIQTokens.brand400,
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          <p 
            className="text-sm font-semibold"
            style={{ color: FlockIQTokens.brand700 }}
          >
            {chartData.find(d => d.isToday)?.sellSignal === 'SELL_NOW' ? 'आज बेचें ✓' : 'रुकें'} — P50 = ₹{chartData.find(d => d.isToday)?.p50?.toFixed(2)}/kg
          </p>
        </div>
      )}
    </div>
  );
}
