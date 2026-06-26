'use client';

import dynamic from 'next/dynamic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

// Dynamic import for chart to avoid SSR issues
const Chart = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), {
  ssr: false,
  loading: () => <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />,
});

interface FcrDataPoint {
  day: number;
  actualFCR: number | null;
  standardFCR: number;
  date: string;
  forecastFCR?: number;
}

interface FcrForecastDataPoint {
  day: number;
  forecastFCR: number;
}

interface FcrTrendChartProps {
  data: FcrDataPoint[];
  breedStandardFCR: number;
  isLoading?: boolean;
  forecastData?: FcrForecastDataPoint[];
}

export function FcrTrendChart({ data, breedStandardFCR, isLoading, forecastData }: FcrTrendChartProps) {
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
      const actualFCR = payload.find((p: any) => p.dataKey === 'actualFCR');
      const standardFCR = payload.find((p: any) => p.dataKey === 'standardFCR');
      
      const deviation = actualFCR ? actualFCR.value - standardFCR.value : 0;
      const deviationColor = deviation > 0 ? 'text-red-400' : 'text-green-400';
      
      return (
        <div className="bg-neutral-900 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">Day {label}</p>
          {actualFCR && (
            <p className="text-xs" style={{ color: actualFCR.color }}>
              Actual FCR: {actualFCR.value.toFixed(3)}
            </p>
          )}
          {standardFCR && (
            <p className="text-xs" style={{ color: standardFCR.color }}>
              Standard FCR: {standardFCR.value.toFixed(3)}
            </p>
          )}
          <p className={`text-xs mt-1 ${deviationColor}`}>
            Deviation: {deviation > 0 ? '+' : ''}{deviation.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate divergence data for shaded region
  const divergenceData = data.map(point => ({
    day: point.day,
    upper: Math.max(point.actualFCR ?? 0, point.standardFCR),
    lower: Math.min(point.actualFCR ?? 0, point.standardFCR),
  }));

  // Combine actual data with forecast data for chart
  const chartData = [...data];
  if (forecastData && forecastData.length > 0) {
    forecastData.forEach(point => {
      chartData.push({
        day: point.day,
        actualFCR: null, // No actual data for forecast period
        standardFCR: breedStandardFCR,
        date: '',
        forecastFCR: point.forecastFCR,
      });
    });
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(122, 156, 138, 0.15)" />
          <XAxis
            dataKey="day"
            stroke="#7A9C8A"
            fontSize={12}
            label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            stroke="#7A9C8A" 
            fontSize={12}
            domain={[1.0, 3.0]}
            label={{ value: 'FCR', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Breed Standard Reference Line (dashed grey) */}
          <ReferenceLine 
            y={breedStandardFCR} 
            stroke="#9CA3AF" 
            strokeDasharray="5 5"
            label={{ value: `Standard (${breedStandardFCR.toFixed(3)})`, position: 'right' }}
          />
          
          {/* Actual FCR (solid blue) */}
          <Line
            type="monotone"
            dataKey="actualFCR"
            stroke="#1A6B3C"
            strokeWidth={2.5}
            name="Actual FCR"
            connectNulls={false}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          
          {/* Standard FCR (dashed grey) */}
          <Line
            type="monotone"
            dataKey="standardFCR"
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Standard FCR"
            connectNulls={false}
            dot={false}
          />
          
          {/* FCR Forecast (dashed purple line) */}
          {forecastData && forecastData.length > 0 && (
            <Line
              type="monotone"
              dataKey="forecastFCR"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="8 4"
              name="Forecast FCR"
              connectNulls={false}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Component for showing divergence region (alternative visualization)
export function FcrDivergenceChart({ data, breedStandardFCR, isLoading }: FcrTrendChartProps) {
  if (isLoading) {
    return <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />;
  }

  // Calculate divergence data
  const divergenceData = data.map(point => ({
    day: point.day,
    actual: point.actualFCR ?? 0,
    standard: point.standardFCR,
    divergence: (point.actualFCR ?? 0) - point.standardFCR,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={divergenceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(122, 156, 138, 0.15)" />
          <XAxis
            dataKey="day"
            stroke="#7A9C8A"
            fontSize={12}
            label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            stroke="#7A9C8A" 
            fontSize={12}
            label={{ value: 'FCR Divergence', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          
          {/* Positive divergence (red) */}
          <Area
            type="monotone"
            dataKey={(d) => Math.max(0, d.divergence)}
            stackId="1"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.3}
            name="Above Standard"
          />
          
          {/* Negative divergence (green) */}
          <Area
            type="monotone"
            dataKey={(d) => Math.min(0, d.divergence)}
            stackId="2"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.3}
            name="Below Standard"
          />
          
          <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
