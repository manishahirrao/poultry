'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface FCRTrendChartProps {
  batchId: string;
}

// Mock data - in production this would come from API
const mockData = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  fcr: 1.7 + (Math.random() * 0.3 - 0.15),
  rollingAvg: 1.75 + (Math.random() * 0.2 - 0.1),
}));

export function FCRTrendChart({ batchId }: FCRTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={mockData} aria-label="FCR trend chart showing daily FCR and 7-day rolling average">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="day" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          domain={[1.5, 2.2]}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <ReferenceLine y={1.8} stroke="#9ca3af" strokeDasharray="5 5" label="Industry Avg" />
        <Line 
          type="monotone" 
          dataKey="fcr" 
          stroke="#16a34a" 
          strokeWidth={2}
          name="Daily FCR"
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="rollingAvg" 
          stroke="#65a30d" 
          strokeWidth={2}
          strokeDasharray="5 5"
          name="7-day Avg"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
