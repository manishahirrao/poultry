'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendUp, Download, Info } from '@phosphor-icons/react';
import { FarmDetailDrawer } from '@/components/farms/detail/FarmDetailDrawer';

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
    fcr: number;
    mortality: number;
    feedConsumedKg: number;
  };
}

interface FCRAnalysisClientProps {
  farms: Farm[];
  integratorId: string;
  initialPeriod: string;
  initialFarmId?: string;
}

// FCR colour bands based on FarmMetricTokens
const getFCRColour = (fcr: number) => {
  if (fcr < 1.7) return '#16A34A'; // fcrExcellent
  if (fcr < 1.9) return '#65A30D'; // fcrGood
  if (fcr < 2.1) return '#D97706'; // fcrWarning
  return '#DC2626'; // fcrCritical
};

export default function FCRAnalysisClient({ farms, integratorId, initialPeriod, initialFarmId }: FCRAnalysisClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState(initialPeriod);
  const [selectedFarmIds, setSelectedFarmIds] = useState<string[]>(farms.map(f => f.id));
  const [selectedFarmForDrawer, setSelectedFarmForDrawer] = useState<Farm | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // SWR fetcher
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  };

  // Fetch FCR trend data
  const { data: fcrTrendData, error: fcrTrendError } = useSWR(
    `/api/metrics/fcr-trend?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch FCR by farm data
  const { data: fcrByFarmData, error: fcrByFarmError } = useSWR(
    `/api/metrics/fcr-by-farm?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch FCR breakdown table data
  const { data: fcrBreakdownData, error: fcrBreakdownError } = useSWR(
    `/api/metrics/fcr-breakdown?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch FCR recommendations for selected farm
  const { data: recommendations, error: recommendationsError } = useSWR(
    initialFarmId ? `/api/metrics/fcr-recommendations?farmId=${initialFarmId}` : null,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', newPeriod);
    router.replace(`/dashboard/metrics/fcr?${params.toString()}`);
  };

  // Handle farm selection toggle
  const handleFarmToggle = (farmId: string) => {
    setSelectedFarmIds(prev => 
      prev.includes(farmId) 
        ? prev.filter(id => id !== farmId)
        : [...prev, farmId]
    );
  };

  // Handle bar click to open drawer
  const handleBarClick = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    if (farm) {
      setSelectedFarmForDrawer(farm);
      setIsDrawerOpen(true);
    }
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      const res = await fetch(`/api/metrics/fcr/export?integrator_id=${integratorId}&period=${period}`);
      if (!res.ok) throw new Error('Failed to export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fcr-analysis-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Calculate FCR by farm for bar chart
  const fcrByFarmChartData = farms
    .filter(f => f.activeBatch && f.activeBatch.fcr)
    .map(f => ({
      name: f.name.substring(0, 20),
      farmId: f.id,
      fcr: f.activeBatch!.fcr,
      fill: getFCRColour(f.activeBatch!.fcr),
    }))
    .sort((a, b) => a.fcr - b.fcr); // Sort ascending (best FCR at top)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">FCR Analysis</h1>
        <p className="text-sm text-gray-600 mt-1">
          Deep dive into feed conversion ratio trends and performance across your farms
        </p>
      </div>

      {/* Period and Farm SlidersHorizontal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {['30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {farms.map((farm) => (
            <button
              key={farm.id}
              onClick={() => handleFarmToggle(farm.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedFarmIds.includes(farm.id)
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {farm.name.substring(0, 15)}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Portfolio FCR Trend */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio FCR Trend</h2>
        {fcrTrendData ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fcrTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedFarmIds.map((farmId) => {
                const farm = farms.find(f => f.id === farmId);
                if (!farm) return null;
                const colors = ['#16A34A', '#2563EB', '#D97706', '#DC2626', '#7C3AED'];
                return (
                  <Line
                    key={farmId}
                    type="monotone"
                    dataKey={farm.name.substring(0, 15)}
                    stroke={colors[farms.indexOf(farm) % colors.length]}
                    strokeWidth={2}
                  />
                );
              })}
              <Line
                type="monotone"
                dataKey="portfolioAvg"
                stroke="#9CA3AF"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Portfolio Avg"
              />
              <Line
                type="monotone"
                dataKey="industryAvg"
                stroke="#C4B5FD"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Industry Avg"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Loading FCR trend data...</p>
          </div>
        )}
      </div>

      {/* Section 2: FCR by Farm (Horizontal Bar Chart) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">FCR by Farm</h2>
        {fcrByFarmChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={fcrByFarmChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="fcr" onClick={(data) => handleBarClick(data.farmId)} style={{ cursor: 'pointer' }}>
                {fcrByFarmChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">No FCR data available</p>
          </div>
        )}
      </div>

      {/* Section 3: FCR Breakdown Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">FCR Breakdown</h2>
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
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Batch #</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Avg Age</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Feed/Bird/Day</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Avg Weight</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">FCR</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">vs Last Batch</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">vs Industry</th>
              </tr>
            </thead>
            <tbody>
              {farms
                .filter(f => f.activeBatch && f.activeBatch.fcr)
                .sort((a, b) => (a.activeBatch!.fcr || 0) - (b.activeBatch!.fcr || 0))
                .map((farm) => {
                  const batch = farm.activeBatch!;
                  const feedPerBird = batch.feedConsumedKg ? (batch.feedConsumedKg * 1000) / batch.birdsAlive : 0;
                  const daysSincePlacement = batch.placementDate 
                    ? Math.floor((Date.now() - new Date(batch.placementDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                  
                  return (
                    <tr key={farm.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-900">{farm.name}</td>
                      <td className="py-3 px-4 text-center text-gray-600">#{batch.batchNumber}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{daysSincePlacement} days</td>
                      <td className="py-3 px-4 text-center text-gray-600">{feedPerBird.toFixed(0)} gm</td>
                      <td className="py-3 px-4 text-center text-gray-600">—</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${getFCRColour(batch.fcr).replace('#', 'text-')}`}>
                          {batch.fcr.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">—</td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {batch.fcr < 1.85 ? '↓ Better' : batch.fcr > 1.85 ? '↑ Worse' : '≈ Equal'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: FCR Recommendations */}
      {initialFarmId && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">FCR Improvement Recommendations</h2>
          {recommendations ? (
            <div className="space-y-4">
              {recommendations.map((rec: any, index: number) => (
                <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendUp size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{rec.title}</p>
                      <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Info size={20} className="text-amber-600 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong>Disclaimer:</strong> यह सुझाव हैं — poultry expert से confirm करें. These recommendations are based on rule-based analysis and should be validated with a poultry expert before implementation.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[100px] flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Loading recommendations...</p>
            </div>
          )}
        </div>
      )}

      {/* Farm Detail Drawer */}
      {selectedFarmForDrawer && (
        <FarmDetailDrawer
          farm={selectedFarmForDrawer}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedFarmForDrawer(null);
          }}
        />
      )}
    </div>
  );
}
