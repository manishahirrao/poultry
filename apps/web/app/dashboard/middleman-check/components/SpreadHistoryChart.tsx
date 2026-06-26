'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import useSWR from 'swr';

interface SpreadHistoryChartProps {
  mandiId: string;
}

interface SpreadDataPoint {
  date: string;
  spread: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SpreadHistoryChart({ mandiId }: SpreadHistoryChartProps) {
  const [showTable, setShowTable] = useState(false);
  
  // Fetch history: user manually logged middleman prices in the past
  // OR derive from: mandi_p50 - (recorded_prices if available)
  // For MVP: fetch from middleman_price_logs table (if user has submitted before)
  const { data, isLoading } = useSWR<SpreadDataPoint[]>(
    `/api/middleman/spread-history?mandi=${mandiId}&days=30`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (isLoading) {
    return <div className="h-40 bg-[#F4F7F5] rounded-lg animate-pulse" />;
  }

  if (!data || data.length < 2) {
    return (
      <div className="h-40 bg-[#F4F7F5] rounded-lg flex items-center justify-center">
        <p className="text-sm text-gray-400">
          Submit 2+ price checks to see spread history
        </p>
      </div>
    );
  }

  // FAIR ZONE: typically ₹0–₹8/kg spread (configurable)
  const FAIR_THRESHOLD = 8;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900">30-Day Spread History</h3>
        <button
          onClick={() => setShowTable(!showTable)}
          className="text-xs text-[#1A5C34] hover:underline"
          aria-label={showTable ? 'View as chart' : 'View as table'}
        >
          {showTable ? 'View as Chart' : 'View as Table'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Is your middleman getting more or less fair over time?
      </p>
      
      {showTable ? (
        <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[#F4F7F5]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">Spread (₹/kg)</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.slice().reverse().map((point) => (
                <tr key={point.date} className="border-t border-[#E3EDE7]">
                  <td className="px-3 py-2 text-gray-900">{point.date}</td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">
                    ₹{point.spread.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        point.spread > FAIR_THRESHOLD
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {point.spread > FAIR_THRESHOLD ? 'Above Fair' : 'Fair'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(d) => d.slice(5)}
              tick={{ fontSize: 10, fill: '#9CA3AF' }} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#9CA3AF' }} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(v) => `₹${v}`} 
              width={42} 
            />

            {/* Fair zone upper boundary */}
            <ReferenceLine 
              y={FAIR_THRESHOLD} 
              stroke="#D97706" 
              strokeDasharray="4 2"
              label={{ value: 'Fair limit', position: 'right', fontSize: 10, fill: '#D97706' }} 
            />

            <Tooltip
              formatter={(value: number) => [`₹${value}/kg spread`, 'Middleman Spread']}
              contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
            />
            <Line 
              type="monotone" 
              dataKey="spread" 
              stroke="#1A5C34" 
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#1A5C34' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <p className="text-xs text-gray-400 mt-2">
        Green line above ₹{FAIR_THRESHOLD}/kg = possible exploitation
      </p>
    </div>
  );
}
