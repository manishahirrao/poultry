'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface MapeGaugeProps {
  mape: number;
  label?: string;
  value?: number;
  unit?: string;
  targetRange?: [number, number];
  isLoading?: boolean;
}

export function MapeGauge({
  mape,
  label = 'MAPE',
  value,
  unit = '%',
  targetRange,
  isLoading,
}: MapeGaugeProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const displayValue = value !== undefined ? value : mape;
  
  // Determine color based on MAPE value
  const getColor = () => {
    if (targetRange) {
      const [min, max] = targetRange;
      if (displayValue >= min && displayValue <= max) {
        return '#1A6B3C'; // Green - within target range
      }
    }
    if (displayValue < 6) {
      return '#1A6B3C'; // Green - excellent
    } else if (displayValue < 8) {
      return '#F5A623'; // Amber - warning
    } else {
      return '#C0392B'; // Red - critical
    }
  };

  const data = [
    {
      name: label,
      value: displayValue,
      fill: getColor(),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <h3 className="text-base font-semibold text-neutral-900 mb-4">{label}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" data={data}>
            <RadialBar background dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-4">
        <div className="text-3xl font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
          {displayValue.toFixed(1)}{unit}
        </div>
        {targetRange && (
          <div className="text-xs text-neutral-500 mt-1">
            Target: {targetRange[0]}-{targetRange[1]}{unit}
          </div>
        )}
      </div>
    </div>
  );
}
