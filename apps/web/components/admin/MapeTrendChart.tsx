'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';

interface MapeTrendData {
  date: string;
  mape: number;
}

interface MapeTrendChartProps {
  data: MapeTrendData[];
  isLoading?: boolean;
}

export function MapeTrendChart({ data, isLoading }: MapeTrendChartProps) {
  if (isLoading) {
    return <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">{formatDate(label)}</p>
          <p className="text-xs" style={{ color: payload[0].color }}>
            MAPE: {payload[0].value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(122, 156, 138, 0.15)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#7A9C8A"
            fontSize={12}
          />
          <YAxis stroke="#7A9C8A" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference areas for color zones */}
          <ReferenceArea y1={0} y2={6} fill="#1A6B3C" fillOpacity={0.1} />
          <ReferenceArea y1={6} y2={8} fill="#F5A623" fillOpacity={0.1} />
          <ReferenceArea y1={8} y2={15} fill="#C0392B" fillOpacity={0.1} />
          
          {/* Reference lines at thresholds */}
          <ReferenceLine y={6} stroke="#F5A623" strokeDasharray="3 3" label="6% Warning" />
          <ReferenceLine y={8} stroke="#C0392B" strokeDasharray="3 3" label="8% Critical" />
          
          {/* MAPE trend line */}
          <Line
            type="monotone"
            dataKey="mape"
            stroke="#1A6B3C"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
