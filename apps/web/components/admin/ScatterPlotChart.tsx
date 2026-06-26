'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ScatterData {
  actual: number;
  predicted: number;
  date: string;
}

interface ScatterPlotChartProps {
  data: ScatterData[];
  isLoading?: boolean;
}

export function ScatterPlotChart({ data, isLoading }: ScatterPlotChartProps) {
  if (isLoading) {
    return <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-neutral-900 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">{point.date}</p>
          <p className="text-xs">Actual: ₹{point.actual.toFixed(2)}/kg</p>
          <p className="text-xs">Predicted: ₹{point.predicted.toFixed(2)}/kg</p>
        </div>
      );
    }
    return null;
  };

  // Calculate perfect prediction line (y = x)
  const minVal = Math.min(...data.map(d => Math.min(d.actual, d.predicted)));
  const maxVal = Math.max(...data.map(d => Math.max(d.actual, d.predicted)));

  // Color points based on deviation from perfect prediction
  const coloredData = data.map(point => {
    const deviation = Math.abs(point.actual - point.predicted);
    const stdDev = 5; // Standard deviation threshold
    const isOutlier = deviation > stdDev;
    return {
      ...point,
      fill: isOutlier ? '#C0392B' : '#1A6B3C',
    };
  });

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(122, 156, 138, 0.15)" />
          <XAxis
            type="number"
            dataKey="actual"
            name="Actual"
            stroke="#7A9C8A"
            fontSize={12}
            label={{ value: 'Actual (₹/kg)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="number"
            dataKey="predicted"
            name="Predicted"
            stroke="#7A9C8A"
            fontSize={12}
            label={{ value: 'Predicted (₹/kg)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Perfect prediction diagonal line */}
          <ReferenceLine segment={[{ x: minVal, y: minVal }, { x: maxVal, y: maxVal }]} stroke="#7A9C8A" strokeDasharray="3 3" />
          
          {/* Scatter points */}
          <Scatter data={coloredData} fill="#1A6B3C" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
