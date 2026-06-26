'use client';

import dynamic from 'next/dynamic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// Dynamic import for chart to avoid SSR issues
const Chart = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), {
  ssr: false,
  loading: () => <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />,
});

interface ForecastData {
  date: string;
  maizeActual?: number;
  maizeForecast?: number;
  soyaActual?: number;
  soyaForecast?: number;
}

interface CommodityPriceChartProps {
  data: ForecastData[];
  isLoading?: boolean;
}

export function CommodityPriceChart({ data, isLoading }: CommodityPriceChartProps) {
  if (isLoading) {
    return <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />;
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value}
            </p>
          ))}
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
          <Legend />
          
          {/* Maize - Actual (solid green) */}
          <Line
            type="monotone"
            dataKey="maizeActual"
            stroke="#1A6B3C"
            strokeWidth={2}
            name="Maize (Actual)"
            connectNulls={false}
            dot={false}
          />
          
          {/* Maize - Forecast (dashed amber) */}
          <Line
            type="monotone"
            dataKey="maizeForecast"
            stroke="#F5A623"
            strokeWidth={2}
            strokeDasharray="6 3"
            name="Maize (Forecast)"
            connectNulls={false}
            dot={false}
          />
          
          {/* Soya - Actual (solid green) */}
          <Line
            type="monotone"
            dataKey="soyaActual"
            stroke="#2ECC71"
            strokeWidth={2}
            name="Soya (Actual)"
            connectNulls={false}
            dot={false}
          />
          
          {/* Soya - Forecast (dashed amber) */}
          <Line
            type="monotone"
            dataKey="soyaForecast"
            stroke="#F39C12"
            strokeWidth={2}
            strokeDasharray="6 3"
            name="Soya (Forecast)"
            connectNulls={false}
            dot={false}
          />
          
          {/* Reference line at today */}
          <ReferenceLine x={data[6]?.date} stroke="#7A9C8A" strokeDasharray="3 3" label="Today" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
