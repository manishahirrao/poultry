'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

interface BatchCostRecord {
  cost_id: string;
  category: string;
  amount: number;
  description: string;
  entry_date: string;
}

interface PLChartsProps {
  plSummary: PLSummary;
  costs: BatchCostRecord[];
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

export function PLCharts({ plSummary, costs }: PLChartsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 100000) {
      return `${(num / 100000).toFixed(2)}L`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(0);
  };

  // Waterfall chart data
  const waterfallData = [
    {
      name: 'Revenue',
      value: plSummary.estimated_revenue || 0,
      fill: COLORS.revenue,
    },
    {
      name: 'Chick',
      value: -plSummary.chick_total,
      fill: COLORS.chick,
    },
    {
      name: 'Feed',
      value: -plSummary.feed_total,
      fill: COLORS.feed,
    },
    {
      name: 'Medicine',
      value: -plSummary.medicine_total,
      fill: COLORS.medicine,
    },
    {
      name: 'Labour',
      value: -plSummary.labour_total,
      fill: COLORS.labour,
    },
    {
      name: 'Overhead',
      value: -plSummary.overhead_total,
      fill: COLORS.overhead,
    },
    {
      name: 'Other',
      value: -plSummary.other_total,
      fill: COLORS.other,
    },
    {
      name: 'Net Profit',
      value: (plSummary.estimated_revenue || 0) - plSummary.grand_total,
      fill: (plSummary.estimated_revenue || 0) - plSummary.grand_total >= 0 ? COLORS.revenue : COLORS.chick,
    },
  ];

  // Pie chart data
  const pieData = [
    { name: 'Feed', value: plSummary.feed_total },
    { name: 'Chicks', value: plSummary.chick_total },
    { name: 'Medicine', value: plSummary.medicine_total },
    { name: 'Labour', value: plSummary.labour_total },
    { name: 'Overhead', value: plSummary.overhead_total },
    { name: 'Other', value: plSummary.other_total },
  ].filter(item => item.value > 0);

  const getPercentage = (value: number): string => {
    if (plSummary.grand_total === 0) return '0%';
    return `${((value / plSummary.grand_total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Waterfall Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">P&L Waterfall</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={waterfallData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => `₹${formatNumber(Math.abs(value))}`} />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip
              formatter={(value: number) => [`₹${formatNumber(Math.abs(value))}`, '']}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
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
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `₹${formatNumber(value)}`} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
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
            Total cost tracked: <span className="font-semibold text-gray-900">₹{formatNumber(plSummary.grand_total)}</span>
          </p>
        </div>
      </div>

      {/* Live Cost per Bird */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Live Cost per Bird</h3>
        <p className="text-2xl font-bold text-gray-900">
          ₹{plSummary.live_cost_per_bird.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Target: ≤₹35 ✓
        </p>
      </div>
    </div>
  );
}
