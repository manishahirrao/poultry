'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface PLSummary {
  chick_total: number;
  feed_total: number;
  medicine_total: number;
  labour_total: number;
  overhead_total: number;
  other_total: number;
  grand_total: number;
  live_cost_per_bird: number;
  estimated_revenue: number;
  target_margin: number;
  days_to_harvest: number;
}

interface PLWaterfallChartProps {
  plSummary: PLSummary;
  isBatchClosed?: boolean;
}

const COLORS = {
  revenue: '#16A34A',
  chick: '#DC2626',
  feed: '#DC2626',
  medicine: '#DC2626',
  labour: '#DC2626',
  overhead: '#DC2626',
  other: '#DC2626',
};

const PIE_COLORS = ['#16A34A', '#DC2626', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

export function PLWaterfallChart({ plSummary, isBatchClosed = false }: PLWaterfallChartProps) {
  const [viewAsTable, setViewAsTable] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 100000) {
      return `${(num / 100000).toFixed(2)}L`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(0);
  };

  const formatCurrencyDollar = (num: number): string => {
    return `₹${formatNumber(Math.abs(num))}`;
  };

  // Waterfall chart data with stacked bar trick
  const revenue = plSummary.estimated_revenue || 0;
  const chickTotal = plSummary.chick_total;
  const feedTotal = plSummary.feed_total;
  const medicineTotal = plSummary.medicine_total;
  const labourTotal = plSummary.labour_total;
  const overheadTotal = plSummary.overhead_total;
  const otherTotal = plSummary.other_total;
  const grandTotal = plSummary.grand_total;
  const netProfit = revenue - grandTotal;

  // Calculate offsets for waterfall effect
  const chickOffset = revenue - chickTotal;
  const feedOffset = chickOffset - feedTotal;
  const medicineOffset = feedOffset - medicineTotal;
  const labourOffset = medicineOffset - labourTotal;
  const overheadOffset = labourOffset - overheadTotal;
  const otherOffset = overheadOffset - otherTotal;

  const waterfallData = [
    {
      name: isBatchClosed ? 'Revenue' : 'Est. Revenue',
      invisible: 0,
      value: revenue,
      fill: COLORS.revenue,
    },
    {
      name: 'Chick Cost',
      invisible: chickOffset,
      value: -chickTotal,
      fill: COLORS.chick,
    },
    {
      name: 'Feed Cost',
      invisible: feedOffset,
      value: -feedTotal,
      fill: COLORS.feed,
    },
    {
      name: 'Medicine',
      invisible: medicineOffset,
      value: -medicineTotal,
      fill: COLORS.medicine,
    },
    {
      name: 'Labour',
      invisible: labourOffset,
      value: -labourTotal,
      fill: COLORS.labour,
    },
    {
      name: 'Overhead',
      invisible: overheadOffset,
      value: -overheadTotal,
      fill: COLORS.overhead,
    },
    {
      name: 'Other',
      invisible: otherOffset,
      value: -otherTotal,
      fill: COLORS.other,
    },
    {
      name: 'Net Profit',
      invisible: 0,
      value: netProfit,
      fill: netProfit >= 0 ? COLORS.revenue : COLORS.chick,
    },
  ];

  // Pie chart data
  const pieData = [
    { name: 'Feed', value: feedTotal },
    { name: 'Chicks', value: chickTotal },
    { name: 'Medicine', value: medicineTotal },
    { name: 'Labour', value: labourTotal },
    { name: 'Overhead', value: overheadTotal },
    { name: 'Other', value: otherTotal },
  ].filter(item => item.value > 0);

  const getPercentage = (value: number): string => {
    if (grandTotal === 0) return '0%';
    return `${((value / grandTotal) * 100).toFixed(1)}%`;
  };

  const getCostPercentage = (value: number): string => {
    if (grandTotal === 0) return '0%';
    return `${((value / grandTotal) * 100).toFixed(1)}%`;
  };

  // Table view data
  const tableData = [
    { name: isBatchClosed ? 'Revenue' : 'Est. Revenue', value: revenue, percentage: revenue > 0 ? '100%' : '0%' },
    { name: 'Chick Cost', value: -chickTotal, percentage: getCostPercentage(chickTotal) },
    { name: 'Feed Cost', value: -feedTotal, percentage: getCostPercentage(feedTotal) },
    { name: 'Medicine', value: -medicineTotal, percentage: getCostPercentage(medicineTotal) },
    { name: 'Labour', value: -labourTotal, percentage: getCostPercentage(labourTotal) },
    { name: 'Overhead', value: -overheadTotal, percentage: getCostPercentage(overheadTotal) },
    { name: 'Other', value: -otherTotal, percentage: getCostPercentage(otherTotal) },
    { name: 'Net Profit', value: netProfit, percentage: grandTotal > 0 ? `${((netProfit / revenue) * 100).toFixed(1)}%` : '0%' },
  ];

  return (
    <div className="space-y-6">
      {/* Waterfall Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-900">P&L Waterfall</h3>
          <button
            onClick={() => setViewAsTable(!viewAsTable)}
            className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            {viewAsTable ? 'View as Chart' : 'View as Table'}
          </button>
        </div>

        {viewAsTable ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">Category</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-900">Amount</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-900">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item) => (
                  <tr key={item.name} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">{item.name}</td>
                    <td className={`py-2 px-3 text-right font-medium ${item.value >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrencyDollar(item.value)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-600">{item.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={waterfallData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => formatCurrencyDollar(value)}
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={90}
                stroke="#6B7280"
                fontSize={12}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrencyDollar(value),
                  name === 'invisible' ? '' : name
                ]}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar dataKey="invisible" stackId="stack" fill="transparent" />
              <Bar dataKey="value" stackId="stack" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Cost Breakdown Pie Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrencyDollar(value)} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend with percentages */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {pieData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="text-gray-600">{item.name}: {getPercentage(item.value)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total cost tracked: <span className="font-semibold text-gray-900">{formatCurrencyDollar(grandTotal)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
