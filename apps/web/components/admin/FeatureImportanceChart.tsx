'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FeatureImportanceData {
  feature: string;
  importance: number;
}

interface FeatureImportanceChartProps {
  data: FeatureImportanceData[];
  isLoading?: boolean;
}

export function FeatureImportanceChart({ data, isLoading }: FeatureImportanceChartProps) {
  if (isLoading) {
    return <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold">{payload[0].payload.feature}</p>
          <p className="text-xs">Importance: {(payload[0].value * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Check if feed_cost_lag42 is in top 3
  const feedCostLag42Index = data.findIndex(d => d.feature === 'feed_cost_lag42');
  const showFeedCostAlert = feedCostLag42Index > 2;

  // Format feature names for display
  const formattedData = data.map(d => ({
    ...d,
    displayName: d.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }));

  return (
    <div className="h-80">
      {showFeedCostAlert && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            ⚠️ <strong>feed_cost_lag42</strong> is not in the top 3 features. This may indicate
            feed cost is not being properly weighted in the model.
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          layout="horizontal"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(122, 156, 138, 0.15)" />
          <XAxis type="number" stroke="#7A9C8A" fontSize={12} />
          <YAxis
            type="category"
            dataKey="displayName"
            stroke="#7A9C8A"
            fontSize={11}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="importance" fill="#1A6B3C">
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index < 3 ? '#1A6B3C' : '#7A9C8A'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
