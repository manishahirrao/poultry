import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface WeightDataPoint {
  date: string;
  weight: number;
}

interface WeightSparklineProps {
  weights: WeightDataPoint[];
  targetWeight?: number;
  className?: string;
}

export function WeightSparkline({ weights, targetWeight, className }: WeightSparklineProps) {
  if (!weights || weights.length === 0) {
    return (
      <div className={clsx('h-8 bg-gray-100 rounded', className)} aria-label="No weight data available">
        <span className="flex items-center justify-center h-full text-xs text-gray-400">No data</span>
      </div>
    );
  }

  const avgWeight = weights.reduce((sum, w) => sum + w.weight, 0) / weights.length;

  return (
    <div className={className} style={{ height: '32px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={weights}>
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#16A34A"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {targetWeight && (
            <Line
              type="monotone"
              dataKey={() => targetWeight}
              stroke="#9CA3AF"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white px-2 py-1 rounded shadow border text-xs">
                    <p className="font-semibold">{payload[0].payload.date}</p>
                    <p>Weight: {payload[0].value}g</p>
                    {targetWeight && (
                      <p className="text-gray-500">Target: {targetWeight}g</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
