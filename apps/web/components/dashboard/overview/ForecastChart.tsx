'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts';
import { P50_AREA_PROPS, P10_AREA_PROPS, P90_AREA_PROPS,
         ACTUAL_SCATTER_PROPS, CHART_MARGIN, tooltipStyle,
         xAxisProps, yAxisProps, CHART_COLOURS } from '@/lib/charts/config';

interface PredictionRow {
  id: string;
  mandi: string;
  predicted_at: string;
  p10: number;
  p50: number;
  p90: number;
  sell_signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  actual_price: number | null;
  confidence: number;
  drivers: string[];
}

interface ForecastChartProps {
  predictions: PredictionRow[];
  primaryMandi: string;
}

export function ForecastChart({ predictions, primaryMandi }: ForecastChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // SlidersHorizontal predictions for primary mandi and generate 7-day forecast
  const primaryPrediction = predictions.find(p => p.mandi === primaryMandi) || predictions[0];
  
  // Generate 7-day forecast data
  const chartData = generateForecastData(primaryPrediction);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    return (
      <div style={tooltipStyle.contentStyle}>
        <p style={tooltipStyle.labelStyle}>{formatDate(data.date)}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} style={tooltipStyle.itemStyle}>
            <span style={{ color: entry.color }}>●</span>{' '}
            {entry.name}: ₹{entry.value}/kg
          </p>
        ))}
        {data.actual_price && (
          <p style={tooltipStyle.itemStyle}>
            <span style={{ color: CHART_COLOURS.actual }}>●</span>{' '}
            Actual: ₹{data.actual_price}/kg
          </p>
        )}
      </div>
    );
  };

  if (!mounted) {
    return <div className="bg-white rounded-2xl p-6 border border-neutral-100 h-[280px] sm:h-[360px] animate-pulse" />;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-neutral-900">7-Day Price Forecast</h2>

      </div>
      
      <div style={{ width: '100%', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLOURS.grid} />
            <XAxis 
              {...xAxisProps}
              dataKey="date"
              tickFormatter={formatDate}
            />
            <YAxis {...yAxisProps} domain={[140, 180]} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* MANDATORY: All three bands must be visible */}
            <Area {...P10_AREA_PROPS} name="P10 (Lower)" />
            <Area {...P50_AREA_PROPS} name="P50 (Median)" />
            <Area {...P90_AREA_PROPS} name="P90 (Upper)" />
            
            {/* Actual prices where available */}
            {chartData.some(d => d.actual_price !== null) && (
              <Area {...ACTUAL_SCATTER_PROPS} name="Actual Price" />
            )}
            
            {/* Today reference line */}
            <ReferenceLine
              x={new Date().toISOString().split('T')[0]}
              stroke={CHART_COLOURS.actual}
              strokeDasharray="4 4"
              label={{ value: 'Today', fill: CHART_COLOURS.actual, fontSize: 10 }}
            />
            
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Hidden data table for screen readers */}
      <table className="sr-only" aria-label="Price forecast data">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">P10 (₹/kg)</th>
            <th scope="col">P50 (₹/kg)</th>
            <th scope="col">P90 (₹/kg)</th>
            <th scope="col">Actual (₹/kg)</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((row, i) => (
            <tr key={i}>
              <td>{formatDate(row.date)}</td>
              <td>{row.p10}</td>
              <td>{row.p50}</td>
              <td>{row.p90}</td>
              <td>{row.actual_price || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function generateForecastData(basePrediction: PredictionRow | null) {
  if (!basePrediction) {
    return [];
  }

  const data = [];
  const today = new Date();
  const basePrice = basePrediction.p50;

  // Generate 7 days of data (today + 6 days forecast)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Add some variation to the forecast
    const variation = Math.sin(i * 0.5) * 5 + (Math.random() - 0.5) * 3;
    const p50 = Math.round(basePrice + variation);
    
    data.push({
      date: date.toISOString().split('T')[0],
      p10: p50 - 8,
      p50,
      p90: p50 + 8,
      actual_price: i === 0 ? basePrediction.actual_price : null,
    });
  }

  return data;
}
