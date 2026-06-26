'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ADGChartProps {
  batchId: string;
}

// Mock data - in production this would come from API
const targetADG = 55;
const mockData = Array.from({ length: 28 }, (_, i) => {
  const adg = 50 + Math.random() * 10;
  const diff = adg - targetADG;
  let color = '#16a34a'; // On target
  if (diff > targetADG * 0.05) color = '#2563eb'; // Ahead
  if (diff < -targetADG * 0.05) color = '#d97706'; // Behind
  return {
    day: i + 1,
    adg,
    color,
  };
});

export function ADGChart({ batchId }: ADGChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={mockData} aria-label="Average daily gain chart showing daily weight gain">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="day" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          label={{ value: 'gm/bird/day', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <ReferenceLine y={targetADG} stroke="#9ca3af" strokeDasharray="5 5" label="Target" />
        <Bar 
          dataKey="adg" 
          fill="#16a34a"
          name="ADG (gm/bird/day)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
