'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart } from 'recharts';
import { Package, TrendUp, Download, WhatsappLogo } from '@phosphor-icons/react';

interface Farm {
  id: string;
  name: string;
  district: string;
  status: string;
  activeBatch?: {
    id: string;
    batchNumber: number;
    birdsPlaced: number;
    birdsAlive: number;
    placementDate: string;
    feedConsumedKg: number;
  };
}

interface FeedManagementClientProps {
  farms: Farm[];
  integratorId: string;
  initialPeriod: string;
}

export default function FeedManagementClient({ farms, integratorId, initialPeriod }: FeedManagementClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState(initialPeriod);

  // SWR fetcher
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  };

  // Fetch feed consumption data
  const { data: feedConsumptionData, error: feedConsumptionError } = useSWR(
    `/api/metrics/feed-consumption?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch feed cost data
  const { data: feedCostData, error: feedCostError } = useSWR(
    `/api/metrics/feed-cost?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch feed rate trend data
  const { data: feedRateTrendData, error: feedRateTrendError } = useSWR(
    `/api/metrics/feed-rate-trend?integrator_id=${integratorId}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch low stock alerts
  const { data: lowStockAlerts, error: lowStockError } = useSWR(
    `/api/metrics/low-stock?integrator_id=${integratorId}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', newPeriod);
    router.replace(`/dashboard/metrics/feed?${params.toString()}`);
  };

  // Handle WhatsApp order
  const handleWhatsAppOrder = (farm: any) => {
    const message = `Namaste, ${farm.name} ke liye ${farm.estimatedQty}kg ${farm.feedType || 'feed'} feed chahiye. Please confirm.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${farm.supplierPhone}?text=${encodedMessage}`, '_blank');
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      const res = await fetch(`/api/metrics/feed-cost/export?integrator_id=${integratorId}&period=${period}`);
      if (!res.ok) throw new Error('Failed to export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feed-cost-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feed Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Track feed consumption, costs, and inventory across your farms
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-end">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {['30d', '60d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p === '30d' ? 'Last 30 Days' : p === '60d' ? 'Last 60 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Feed Consumption Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Feed Consumption & Efficiency</h2>
        {feedConsumptionData ? (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={feedConsumptionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" label={{ value: 'Feed (kg)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'gm/bird/day', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              {farms.map((farm, index) => {
                const colours = ['#16A34A', '#2563EB', '#D97706', '#DC2626', '#7C3AED'];
                return (
                  <Bar
                    key={farm.id}
                    yAxisId="left"
                    dataKey={farm.name.substring(0, 15)}
                    stackId="feed"
                    fill={colours[index % colours.length]}
                  />
                );
              })}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="efficiency"
                stroke="#7C3AED"
                strokeWidth={2}
                name="Efficiency (gm/bird/day)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[350px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Loading feed consumption data...</p>
          </div>
        )}
      </div>

      {/* Section 2: Feed Cost Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Feed Cost Summary</h2>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Farm</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Batch #</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Feed Type</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Qty (MT)</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Rate (₹/kg)</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Total Cost</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Cost/kg Produced</th>
              </tr>
            </thead>
            <tbody>
              {feedCostData ? (
                <>
                  {feedCostData.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-900">{item.farmName}</td>
                      <td className="py-3 px-4 text-gray-600">#{item.batchNumber}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{item.feedType || '—'}</td>
                      <td className="py-3 px-4 text-center text-gray-900">{item.qty?.toFixed(2) || '—'}</td>
                      <td className="py-3 px-4 text-center text-gray-900">₹{item.rate?.toFixed(2) || '—'}</td>
                      <td className="py-3 px-4 text-center text-gray-900">₹{item.totalCost?.toFixed(0) || '—'}</td>
                      <td className="py-3 px-4 text-center text-gray-900">₹{item.costPerKgProduced?.toFixed(2) || '—'}</td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-3 px-4 text-gray-900" colSpan={3}>Portfolio Total</td>
                    <td className="py-3 px-4 text-center text-gray-900">
                      {feedCostData.reduce((sum: number, item: any) => sum + (item.qty || 0), 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">—</td>
                    <td className="py-3 px-4 text-center text-gray-900">
                      ₹{feedCostData.reduce((sum: number, item: any) => sum + (item.totalCost || 0), 0).toFixed(0)}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">—</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Loading feed cost data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Feed Rate Trend */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Feed Rate Trend (6 Months)</h2>
        {feedRateTrendData ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={feedRateTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: '₹/kg', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="purchaseRate"
                stroke="#16A34A"
                strokeWidth={2}
                name="Purchase Rate"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="ncdexIndex"
                stroke="#2563EB"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="NCDEX Maize Index"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Loading feed rate trend data...</p>
          </div>
        )}
      </div>

      {/* Section 4: Low Stock Alerts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h2>
        {lowStockAlerts && lowStockAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockAlerts.map((alert: any, index: number) => (
              <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <Package size={20} className="text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{alert.farmName}</p>
                    <p className="text-sm text-gray-600">{alert.remainingKg?.toFixed(0)} kg remaining</p>
                    <p className="text-sm font-semibold text-red-700">{alert.daysRemaining} days remaining</p>
                  </div>
                </div>
                <button
                  onClick={() => handleWhatsAppOrder(alert)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <WhatsappLogo size={16} />
                  Order Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <Package size={32} className="text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700">All farms have adequate feed stock</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 5: Feed Efficiency Comparison */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Feed Efficiency Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Farm</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Avg Feed/Bird/Day</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Target</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Variance</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {farms.map((farm) => {
                const batch = farm.activeBatch;
                const feedPerBird = batch?.feedConsumedKg ? (batch.feedConsumedKg * 1000) / batch.birdsAlive : 0;
                const target = 120; // Placeholder target
                const variance = feedPerBird - target;
                const status = Math.abs(variance) < 10 ? 'On Target' : variance > 0 ? 'High' : 'Low';
                const statusColour = status === 'On Target' ? 'text-green-600' : status === 'High' ? 'text-amber-600' : 'text-blue-600';

                return (
                  <tr key={farm.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">{farm.name}</td>
                    <td className="py-3 px-4 text-center text-gray-900">{feedPerBird.toFixed(0)} gm</td>
                    <td className="py-3 px-4 text-center text-gray-600">{target} gm</td>
                    <td className="py-3 px-4 text-center text-gray-900">{variance > 0 ? '+' : ''}{variance.toFixed(0)} gm</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-sm font-semibold ${statusColour}`}>{status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
