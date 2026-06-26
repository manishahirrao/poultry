'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SpreadHistoryData {
  date: string;
  offeredPrice: number;
  benchmark: number;
  spread?: number;
  outcome: 'accepted' | 'rejected';
}

interface SpreadHistoryChartProps {
  data: SpreadHistoryData[];
}

export function SpreadHistoryChart({ data }: SpreadHistoryChartProps) {
  // Format data for chart
  const chartData = data.map((entry, index) => ({
    index: data.length - index,
    date: new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    offered: entry.offeredPrice,
    benchmark: entry.benchmark,
    spread: entry.spread || ((entry.offeredPrice - entry.benchmark) / entry.benchmark) * 100,
    outcome: entry.outcome,
  })).reverse();

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E3EDE7" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
            label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1C2B22',
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'spread') return `${value.toFixed(1)}%`;
              return `₹${value.toFixed(2)}`;
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="offered" 
            stroke="#1A5C34" 
            strokeWidth={2}
            name="Offered Price"
            dot={{ fill: '#1A5C34', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="benchmark" 
            stroke="#3DAE72" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Benchmark"
            dot={{ fill: '#3DAE72', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
