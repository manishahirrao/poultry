'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLOURS, tooltipStyle, xAxisProps, yAxisProps } from '@/lib/charts/config';

interface UsageChartProps {
  customerId: string;
}

interface UsageDataPoint {
  date: string;
  requests: number;
}

export function UsageChart({ customerId }: UsageChartProps) {
  const [usageData, setUsageData] = useState<UsageDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate demo usage data for last 30 days
    const data = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        requests: Math.floor(Math.random() * 50) + 20,
      };
    });
    setUsageData(data);
    setLoading(false);
  }, [customerId]);

  const totalRequests = usageData.reduce((sum, day) => sum + day.requests, 0);
  const avgDaily = Math.round(totalRequests / usageData.length);

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <span className="text-xl">📊</span>
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Usage Monitoring</h3>
          <p className="text-xs text-neutral-500">API request activity over time</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-neutral-50 rounded-xl">
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Today</div>
          <div className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
            {usageData[usageData.length - 1]?.requests || 0}
          </div>
          <div className="text-xs text-neutral-500">requests</div>
        </div>
        <div className="p-4 bg-neutral-50 rounded-xl">
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">30-Day Total</div>
          <div className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
            {totalRequests.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">requests</div>
        </div>
        <div className="p-4 bg-neutral-50 rounded-xl">
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Avg Daily</div>
          <div className="text-2xl font-bold text-brandGreen700" style={{ fontFamily: "'Sora', system-ui" }}>
            {avgDaily}
          </div>
          <div className="text-xs text-neutral-500">requests</div>
        </div>
      </div>

      <div className="h-[200px]">
        {loading ? (
          <div className="h-full bg-neutral-100 rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <XAxis 
                {...xAxisProps}
                dataKey="date"
                tickFormatter={(value) => value.split(' ')[0]}
              />
              <YAxis {...yAxisProps} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} />
              <Bar 
                dataKey="requests" 
                fill={CHART_COLOURS.p50}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Rate limit: 1000 requests/day</span>
          <span className="text-brandGreen700 font-semibold">
            {Math.round((totalRequests / 30000) * 100)}% of monthly quota
          </span>
        </div>
        <div className="mt-2 h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brandGreen700 transition-all duration-500"
            style={{ width: `${Math.min((totalRequests / 30000) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
