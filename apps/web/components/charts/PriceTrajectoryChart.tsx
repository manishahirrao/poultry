'use client';

import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  ReferenceLine,
  ReferenceDot,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Brush
} from 'recharts';

interface ChartDataPoint {
  date: string;
  p10: number;
  p50: number;
  p90: number;
  actual?: number;
}

interface Festival {
  date: string;
  name: string;
}

interface Event {
  date: string;
  type: 'hpai' | 'weather';
}

interface PriceTrajectoryChartProps {
  data: ChartDataPoint[];
  festivals?: Festival[];
  events?: Event[];
  isLoading?: boolean;
}

export function PriceTrajectoryChart({
  data,
  festivals = [],
  events = [],
  isLoading = false
}: PriceTrajectoryChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0].payload;
    const p50Data = payload.find((p: any) => p.dataKey === 'p50');
    const actualData = payload.find((p: any) => p.dataKey === 'actual');

    // Find festival for this date
    const festival = festivals.find(f => f.date === label);
    // Find event for this date
    const event = events.find(e => e.date === label);

    // Calculate trend
    const currentIndex = chartData.findIndex((d: ChartDataPoint) => d.date === label);
    const previousData = currentIndex > 0 ? chartData[currentIndex - 1] : null;
    let trend = '—';
    if (previousData && p50Data) {
      const change = p50Data.value - previousData.p50;
      trend = change > 0 ? '↑ Rising' : change < 0 ? '↓ Falling' : '→ Stable';
    }

    return (
      <div className="bg-neutral-900 text-white p-3 rounded-lg shadow-xl border border-neutral-700">
        <p className="text-sm font-semibold mb-2">{formatDate(label)}</p>
        <div className="space-y-1">
          <p className="text-xs">
            <span className="text-amber-400">P50:</span> ₹{p50Data?.value.toFixed(2)}/kg
          </p>
          <p className="text-xs">
            <span className="text-green-400">Range:</span> ₹{dataPoint.p10?.toFixed(0) || '—'}–₹{dataPoint.p90?.toFixed(0) || '—'}
          </p>
          <p className="text-xs">
            <span className="text-neutral-400">Trend:</span> {trend}
          </p>
          {festival && (
            <p className="text-xs text-amber-300">
              🎉 {festival.name}
            </p>
          )}
          {event && (
            <p className="text-xs text-red-300">
              {event.type === 'hpai' ? '🦠 HPAI Alert' : '🌡️ Weather Event'}
            </p>
          )}
          {actualData && actualData.value && (
            <p className="text-xs text-green-300">
              <span className="text-green-400">Actual:</span> ₹{actualData.value.toFixed(2)}/kg
            </p>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <div className="h-[220px] bg-neutral-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Get today's date string
  const today = new Date().toISOString().split('T')[0];

  // Apply windowing if data length > 90 points
  const chartData = data.length > 90 ? data.slice(-90) : data;

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-neutral-900">7-Day Price Trajectory</h2>
      </div>

      <div style={{ width: '100%', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(122,156,138,0.15)" />
            
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#7A9C8A"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            
            <YAxis
              stroke="#7A9C8A"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Layer 1: P10–P90 confidence band */}
            <Area
              type="monotone"
              dataKey="p90"
              fill="rgba(26,107,60,0.12)"
              stroke="none"
            />
            <Area
              type="monotone"
              dataKey="p10"
              fill="rgba(26,107,60,0.12)"
              stroke="none"
            />

            {/* Layer 2: P50 forecast line (dashed amber) */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#F5A623"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
            />

            {/* Layer 3: Actual historical price (solid green) */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#1A6B3C"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              connectNulls={false}
            />

            {/* Layer 4: Festival markers */}
            {festivals.map((festival) => (
              <ReferenceLine
                key={festival.date}
                x={festival.date}
                stroke="#F5A623"
                strokeDasharray="4 4"
                label={{
                  value: festival.name,
                  position: 'top',
                  fill: '#F5A623',
                  fontSize: 11,
                  offset: 10
                }}
              />
            ))}

            {/* Layer 5: Today's date reference line */}
            <ReferenceLine
              x={today}
              stroke="#1C2B22"
              strokeWidth={2}
              label={{
                value: 'आज',
                position: 'top',
                fill: '#1C2B22',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />

            {/* Layer 6: HPAI/weather event markers */}
            {events.map((event) => (
              <ReferenceDot
                key={event.date}
                x={event.date}
                y={0}
                r={6}
                fill={event.type === 'hpai' ? '#DC2626' : '#2563EB'}
                stroke="none"
              />
            ))}

            {/* Brush for zooming */}
            <Brush
              dataKey="date"
              height={30}
              stroke="#1A6B3C"
              fill="rgba(26,107,60,0.1)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible data table for screen readers */}
      <table className="sr-only" aria-label="Price trajectory data">
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
              <td>{row.p10.toFixed(2)}</td>
              <td>{row.p50.toFixed(2)}</td>
              <td>{row.p90.toFixed(2)}</td>
              <td>{row.actual ? row.actual.toFixed(2) : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
