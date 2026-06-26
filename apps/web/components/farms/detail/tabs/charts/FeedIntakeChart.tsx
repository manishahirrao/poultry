'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';

interface FeedIntakeChartProps {
  batchId: string;
}

// Mock data - in production this would come from API
const mockData = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  feedIntake: 50 + i * 5 + Math.random() * 10,
  rollingAvg: 50 + i * 5,
}));

export function FeedIntakeChart({ batchId }: FeedIntakeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={mockData} aria-label="Feed intake chart showing daily feed consumption and rolling average">
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
        <Bar 
          dataKey="feedIntake" 
          fill="#1a6b3c" 
          name="Daily Feed (gm/bird)"
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
      </BarChart>
    </ResponsiveContainer>
  );
}
