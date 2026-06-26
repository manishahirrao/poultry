'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Cell } from 'recharts';
import { TrendUp, TrendDown, Users, Package } from '@phosphor-icons/react';
import useSWR from 'swr';

interface PLOverviewProps {
  integratorId: string;
}

interface PLData {
  period: string;
  dateRange: { start: string; end: string };
  revenue: {
    total: number;
    completedBatches: number;
    activeBatchesProjected: number;
  };
  variableCosts: {
    total: number;
    docCost: number;
    feedCost: number;
    medicineCost: number;
    vaccineCost: number;
    litterCost: number;
    other: number;
  };
  grossMargin: {
    amount: number;
    percentage: number;
  };
  fixedCosts: {
    total: number;
    employeeSalaries: number;
    businessExpenses: number;
    fixedOverhead: number;
  };
  netProfit: {
    amount: number;
    percentage: number;
  };
  perBirdEconomics: {
    revenuePerBird: number;
    variableCostPerBird: number;
    fixedCostPerBird: number;
    netProfitPerBird: number;
    totalBirds: number;
    totalLiveWeightKg: number;
  };
  farmContributions: Array<{ farmId: string; farmName: string; revenue: number; profit: number }>;
  farmGCComparison: Array<{ farmId: string; farmName: string; gcPerKg: number; vsBenchmark: number }>;
  monthlyTrend: Array<{ month: string; profit: number }>;
}

// FlockIQ brand colors
const BRAND_COLORS = {
  brand700: '#1A5C34',
  brand400: '#3DAE72',
  brand100: '#D4EFDE',
  signal: '#E8611A',
  amber: '#D97706',
  red: '#DC2626',
  cardBg: '#FFFFFF',
  border: '#E3EDE7',
  pageBg: '#F4F7F5',
};

export function PLOverview({ integratorId }: PLOverviewProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [period, setPeriod] = useState<'current_quarter' | 'last_month' | 'this_month'>('current_quarter');

  const { data: plData, isLoading } = useSWR<PLData>(
    `/api/pl/overview?period=${period}`,
    (url: string) => fetch(url).then((r) => (r.ok ? r.json() : null))
  );

  const isHindi = language === 'hi';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!plData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{isHindi ? 'P&L डेटा उपलब्ध नहीं' : 'No P&L data available'}</p>
      </div>
    );
  }

  const data = plData;

  // Waterfall chart data - Revenue vs Costs
  const waterfallData = [
    { name: isHindi ? 'राजस्व' : 'Revenue', value: data.revenue.total, type: 'revenue' },
    { name: isHindi ? 'चारा' : 'Feed', value: -data.variableCosts.feedCost, type: 'cost' },
    { name: isHindi ? 'DOC' : 'DOC', value: -data.variableCosts.docCost, type: 'cost' },
    { name: isHindi ? 'दवाई+टीका' : 'Med+Vac', value: -(data.variableCosts.medicineCost + data.variableCosts.vaccineCost), type: 'cost' },
    { name: isHindi ? 'लिटर' : 'Litter', value: -data.variableCosts.litterCost, type: 'cost' },
    { name: isHindi ? 'सकल मार्जिन' : 'Gross Margin', value: data.grossMargin.amount, type: 'margin' },
    { name: isHindi ? 'वेतन' : 'Salaries', value: -data.fixedCosts.employeeSalaries, type: 'cost' },
    { name: isHindi ? 'खर्चे' : 'Expenses', value: -data.fixedCosts.businessExpenses, type: 'cost' },
    { name: isHindi ? 'ओवरहेड' : 'Overhead', value: -data.fixedCosts.fixedOverhead, type: 'cost' },
    { name: isHindi ? 'शुद्ध लाभ' : 'Net Profit', value: data.netProfit.amount, type: 'profit' },
  ];

  // Calculate cumulative values for waterfall chart
  let cumulative = 0;
  const waterfallWithCumulative = waterfallData.map(item => {
    const result = { ...item, cumulative };
    cumulative += item.value;
    return result;
  });

  // Cost breakdown for bar chart
  const costBreakdownData = [
    { name: isHindi ? 'चारा' : 'Feed', value: data.variableCosts.feedCost, color: BRAND_COLORS.brand700 },
    { name: isHindi ? 'DOC' : 'DOC', value: data.variableCosts.docCost, color: BRAND_COLORS.brand400 },
    { name: isHindi ? 'दवाई' : 'Medicine', value: data.variableCosts.medicineCost, color: BRAND_COLORS.brand100 },
    { name: isHindi ? 'टीका' : 'Vaccine', value: data.variableCosts.vaccineCost, color: BRAND_COLORS.amber },
    { name: isHindi ? 'लिटर' : 'Litter', value: data.variableCosts.litterCost, color: '#6B7280' },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPeriod('current_quarter')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'current_quarter'
                ? 'bg-[#1A5C34] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isHindi ? 'इस तिमाही' : 'This Quarter'}
          </button>
          <button
            onClick={() => setPeriod('last_month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'last_month'
                ? 'bg-[#1A5C34] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isHindi ? 'पिछला महीना' : 'Last Month'}
          </button>
          <button
            onClick={() => setPeriod('this_month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'this_month'
                ? 'bg-[#1A5C34] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isHindi ? 'इस महीने' : 'This Month'}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              language === 'en' ? 'bg-[#EDF7F1] text-[#1A5C34]' : 'bg-gray-100 text-gray-600'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              language === 'hi' ? 'bg-[#EDF7F1] text-[#1A5C34]' : 'bg-gray-100 text-gray-600'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">
              {isHindi ? 'कुल राजस्व' : 'Total Revenue'}
            </span>
            <TrendUp size={20} className="text-[#1A5C34]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            ₹{(data.revenue.total / 100000).toFixed(2)}L
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isHindi ? 'सभी बैच से' : 'From all batches'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">
              {isHindi ? 'परिवर्तनीय लागत' : 'Variable Costs'}
            </span>
            <Package size={20} className="text-[#D97706]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            ₹{(data.variableCosts.total / 100000).toFixed(2)}L
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isHindi ? 'चारा, DOC, दवाई' : 'Feed, DOC, Medicine'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">
              {isHindi ? 'स्थायी लागत' : 'Fixed Costs'}
            </span>
            <Users size={20} className="text-[#2563EB]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            ₹{(data.fixedCosts.total / 100000).toFixed(2)}L
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isHindi ? 'वेतन, खर्चे' : 'Salaries, Expenses'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">
              {isHindi ? 'शुद्ध लाभ' : 'Net Profit'}
            </span>
            {data.netProfit.amount >= 0 ? (
              <TrendUp size={20} className="text-[#1A5C34]" />
            ) : (
              <TrendDown size={20} className="text-[#DC2626]" />
            )}
          </div>
          <p
            className={`text-2xl font-bold tabular-nums ${
              data.netProfit.amount >= 0 ? 'text-[#1A5C34]' : 'text-[#DC2626]'
            }`}
          >
            ₹{(data.netProfit.amount / 100000).toFixed(2)}L
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isHindi ? 'मार्जिन' : 'Margin'}: {data.netProfit.percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Revenue vs Cost Waterfall Chart */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isHindi ? 'राजस्व बनाम लागत वॉटरफॉल' : 'Revenue vs Cost Waterfall'}
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={waterfallWithCumulative} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E3EDE7" />
            <XAxis type="number" tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} tick={{ fill: '#6B7280' }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E3EDE7',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
            />
            <Bar dataKey="value" stackId="stack">
              {waterfallWithCumulative.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.type === 'revenue' ? BRAND_COLORS.brand700 :
                    entry.type === 'profit' ? (entry.value >= 0 ? BRAND_COLORS.brand400 : BRAND_COLORS.red) :
                    entry.type === 'margin' ? BRAND_COLORS.brand100 :
                    BRAND_COLORS.amber
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isHindi ? 'मासिक लाभ रुझान (पिछले 6 महीने)' : 'Monthly Profit Trend (Last 6 Months)'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EDE7" />
            <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
            <YAxis tick={{ fill: '#6B7280' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E3EDE7',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, isHindi ? 'लाभ' : 'Profit']}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke={BRAND_COLORS.brand700}
              strokeWidth={2.5}
              dot={{ fill: BRAND_COLORS.brand700, r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Farm-wise Contribution Table */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isHindi ? 'फार्म-वार योगदान (सबसे अधिक से कम लाभदायक)' : 'Farm-wise Contribution (Most to Least Profitable)'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E3EDE7]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {isHindi ? 'फार्म नाम' : 'Farm Name'}
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  {isHindi ? 'राजस्व' : 'Revenue'}
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  {isHindi ? 'लाभ' : 'Profit'}
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  {isHindi ? 'मार्जिन %' : 'Margin %'}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.farmContributions.map((farm) => (
                <tr key={farm.farmId} className="border-b border-gray-100 hover:bg-[#F4F7F5]">
                  <td className="py-3 px-4 text-sm text-gray-900">{farm.farmName}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right tabular-nums">
                    ₹{(farm.revenue / 100000).toFixed(2)}L
                  </td>
                  <td className={`py-3 px-4 text-sm text-right tabular-nums font-medium ${farm.profit >= 0 ? 'text-[#1A5C34]' : 'text-[#DC2626]'}`}>
                    ₹{(farm.profit / 100000).toFixed(2)}L
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right tabular-nums">
                    {farm.revenue > 0 ? ((farm.profit / farm.revenue) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
              {data.farmContributions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    {isHindi ? 'कोई फार्म डेटा उपलब्ध नहीं' : 'No farm data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GC Comparison Table */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isHindi ? 'GC तुलना (फार्म-वार)' : 'GC Comparison (Farm-wise)'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E3EDE7]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {isHindi ? 'फार्म नाम' : 'Farm Name'}
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  {isHindi ? 'GC (₹/kg)' : 'GC (₹/kg)'}
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  {isHindi ? 'बेंचमार्क vs' : 'vs Benchmark'}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {isHindi ? 'स्थिति' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.farmGCComparison.map((farm) => {
                const status = farm.vsBenchmark <= 0 ? 'good' : farm.vsBenchmark <= 10 ? 'watch' : 'alert';
                const statusColor = status === 'good' ? 'text-[#1A5C34]' : status === 'watch' ? 'text-[#D97706]' : 'text-[#DC2626]';
                const statusBg = status === 'good' ? 'bg-[#DCFCE7]' : status === 'watch' ? 'bg-[#FEF9C3]' : 'bg-[#FEE2E2]';
                const statusText = status === 'good' ? (isHindi ? 'अच्छा' : 'Good') : status === 'watch' ? (isHindi ? 'ध्यान दें' : 'Watch') : (isHindi ? 'अलर्ट' : 'Alert');
                
                return (
                  <tr key={farm.farmId} className="border-b border-gray-100 hover:bg-[#F4F7F5]">
                    <td className="py-3 px-4 text-sm text-gray-900">{farm.farmName}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right tabular-nums font-medium">
                      ₹{farm.gcPerKg.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right tabular-nums ${farm.vsBenchmark <= 0 ? 'text-[#1A5C34]' : 'text-[#DC2626]'}`}>
                      {farm.vsBenchmark >= 0 ? '+' : ''}₹{farm.vsBenchmark.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {data.farmGCComparison.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    {isHindi ? 'कोई GC डेटा उपलब्ध नहीं' : 'No GC data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Bird Economics */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isHindi ? 'प्रति पक्षी अर्थशास्त्र (Portfolio Average)' : 'Per-Bird Economics (Portfolio Average)'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#F4F7F5] rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1 font-medium">
              {isHindi ? 'राजस्व प्रति पक्षी' : 'Revenue per bird'}
            </p>
            <p className="text-xl font-bold text-gray-900 tabular-nums">₹{data.perBirdEconomics.revenuePerBird.toFixed(0)}</p>
          </div>
          <div className="bg-[#F4F7F5] rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1 font-medium">
              {isHindi ? 'परिवर्तनीय लागत प्रति पक्षी (GC)' : 'Variable cost per bird (GC)'}
            </p>
            <p className="text-xl font-bold text-[#D97706] tabular-nums">₹{data.perBirdEconomics.variableCostPerBird.toFixed(0)}</p>
          </div>
          <div className="bg-[#F4F7F5] rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1 font-medium">
              {isHindi ? 'स्थायी लागत प्रति पक्षी' : 'Fixed cost per bird'}
            </p>
            <p className="text-xl font-bold text-[#2563EB] tabular-nums">₹{data.perBirdEconomics.fixedCostPerBird.toFixed(0)}</p>
          </div>
          <div className="bg-[#F4F7F5] rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1 font-medium">
              {isHindi ? 'शुद्ध लाभ प्रति पक्षी' : 'Net profit per bird'}
            </p>
            <p
              className={`text-xl font-bold tabular-nums ${
                data.perBirdEconomics.netProfitPerBird >= 0 ? 'text-[#1A5C34]' : 'text-[#DC2626]'
              }`}
            >
              ₹{data.perBirdEconomics.netProfitPerBird.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* P&L Structure Table */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isHindi ? 'P&L संरचना' : 'P&L Structure'}
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">
              {isHindi ? 'राजस्व' : 'REVENUE'}
            </span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              ₹{(data.revenue.total / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
            <span className="text-sm text-gray-600">
              {isHindi ? 'पूर्ण बैच' : 'Completed Batches'}
            </span>
            <span className="text-sm text-gray-900 tabular-nums">
              ₹{(data.revenue.completedBatches / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
            <span className="text-sm text-gray-600">
              {isHindi ? 'सक्रिय बैच (प्रक्षेपित)' : 'Active Batches (Projected)'}
            </span>
            <span className="text-sm text-gray-900 tabular-nums">
              ₹{(data.revenue.activeBatchesProjected / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">
              {isHindi ? 'परिवर्तनीय लागत' : 'VARIABLE COSTS'}
            </span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              ₹{(data.variableCosts.total / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
            <span className="text-sm text-gray-600">
              {isHindi ? 'चारा लागत' : 'Feed Cost'}
            </span>
            <span className="text-sm text-gray-900 tabular-nums">
              ₹{(data.variableCosts.feedCost / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
            <span className="text-sm text-gray-600">
              {isHindi ? 'DOC लागत' : 'DOC Cost'}
            </span>
            <span className="text-sm text-gray-900 tabular-nums">
              ₹{(data.variableCosts.docCost / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
            <span className="text-sm text-gray-600">
              {isHindi ? 'दवाई और टीका' : 'Medicine & Vaccine'}
            </span>
            <span className="text-sm text-gray-900 tabular-nums">
              ₹{((data.variableCosts.medicineCost + data.variableCosts.vaccineCost) / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
            <span className="text-sm text-gray-600">
              {isHindi ? 'लिटर और अन्य' : 'Litter & Other'}
            </span>
            <span className="text-sm text-gray-900 tabular-nums">
              ₹{(data.variableCosts.litterCost / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-[#EDF7F1] rounded-lg px-4">
            <span className="text-sm font-bold text-[#1A5C34]">
              {isHindi ? 'सकल मार्जिन' : 'GROSS MARGIN'}
            </span>
            <span className="text-sm font-bold text-[#1A5C34] tabular-nums">
              ₹{(data.grossMargin.amount / 100000).toFixed(2)}L ({data.grossMargin.percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">
              {isHindi ? 'स्थायी और ओवरहेड लागत' : 'FIXED & OVERHEAD COSTS'}
            </span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              ₹{(data.fixedCosts.total / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
            <span className="text-sm text-gray-600">
              {isHindi ? 'कर्मचारी वेतन' : 'Employee Salaries'}
            </span>
            <span className="text-sm text-gray-900 tabular-nums">
              ₹{(data.fixedCosts.employeeSalaries / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
            <span className="text-sm text-gray-600">
              {isHindi ? 'व्यापार खर्चे' : 'Business Expenses'}
            </span>
            <span className="text-sm text-gray-900 tabular-nums">
              ₹{(data.fixedCosts.businessExpenses / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
            <span className="text-sm text-gray-600">
              {isHindi ? 'स्थायी ओवरहेड' : 'Fixed Overhead'}
            </span>
            <span className="text-sm text-gray-900 tabular-nums">
              ₹{(data.fixedCosts.fixedOverhead / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center py-3 bg-[#1A5C34] rounded-lg px-4">
            <span className="text-sm font-bold text-white">
              {isHindi ? 'शुद्ध लाभ / हानि' : 'NET PROFIT / LOSS'}
            </span>
            <span
              className={`text-sm font-bold text-white tabular-nums`}
            >
              ₹{(data.netProfit.amount / 100000).toFixed(2)}L ({data.netProfit.percentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
