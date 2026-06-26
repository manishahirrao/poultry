// FlockIQ — Accuracy Chart Component
// File: apps/web/components/home/AccuracySection/AccuracyChart.tsx
// Version: v1.0 | May 2026
// Task Reference: B-04 (sub-component)

'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AccuracyChartProps {
  isDemo: boolean;
}

// Demo data for 30-day rolling accuracy
const demoData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  predicted: 160 + Math.random() * 10,
  actual: 160 + Math.random() * 10,
  accuracy: 90 + Math.random() * 8,
}));

export default function AccuracyChart({ isDemo }: AccuracyChartProps) {
  const data = isDemo ? demoData : demoData; // In production, this would be real data

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="day" 
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(26, 107, 60, 0.9)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            itemStyle={{ color: 'white' }}
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#68C690"
            fill="#68C690"
            fillOpacity={0.3}
            name="Predicted"
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#25874D"
            fill="#25874D"
            fillOpacity={0.5}
            name="Actual"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
