'use client';

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, ReferenceLine, ReferenceArea } from 'recharts';
import { useMemo } from 'react';

interface MortalityChartProps {
  batchId: string;
}

// Mock data - in production this would come from API
const mockData = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  cumulativePct: (i + 1) * 0.1 + Math.random() * 0.05,
  dailyDeaths: Math.floor(Math.random() * 10),
}));

// Add a spike on day 18 for demonstration
mockData[17].dailyDeaths = 25;

export function MortalityChart({ batchId }: MortalityChartProps) {
  // Detect mortality spikes (days with deaths > 2x average)
  const spikeDays = useMemo(() => {
    const avgDeaths = mockData.reduce((sum, d) => sum + d.dailyDeaths, 0) / mockData.length;
    return mockData
      .filter(d => d.dailyDeaths > avgDeaths * 2)
      .map(d => d.day);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={mockData} aria-label="Mortality chart showing cumulative percentage and daily deaths">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="day" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          yAxisId="left"
          stroke="#6b7280"
          fontSize={12}
          domain={[0, 5]}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="#6b7280"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <ReferenceLine y={3} stroke="#d97706" strokeDasharray="5 5" label="Warning" yAxisId="left" />
        <ReferenceLine y={5} stroke="#dc2626" strokeDasharray="5 5" label="Critical" yAxisId="left" />
        
        {/* Highlight mortality spike areas */}
        {spikeDays.map(day => (
          <ReferenceArea
            key={day}
            x1={day - 0.5}
            x2={day + 0.5}
            fill="#fee2e2"
            stroke="#dc2626"
            strokeWidth={1}
            label="Spike"
          />
        ))}
        
        <Area 
          yAxisId="left"
          type="monotone" 
          dataKey="cumulativePct" 
          stroke="#16a34a" 
          fillOpacity={0.3}
          fill="#16a34a"
          name="Cumulative %"
        />
        <Bar 
          yAxisId="right"
          dataKey="dailyDeaths" 
          fill="#dc2626" 
          name="Daily Deaths"
          opacity={0.6}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
