'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { Warning, Info, Download, X } from '@phosphor-icons/react';

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
    mortality: number;
    cumulativeDeaths: number;
  };
}

interface MortalityTrackingClientProps {
  farms: Farm[];
  integratorId: string;
  integratorDistrict: string;
  initialPeriod: string;
}

// Mortality status colours
const getMortalityColour = (mortality: number) => {
  if (mortality < 3) return '#16A34A'; // mortalityNormal
  if (mortality < 5) return '#D97706'; // mortalityElevated
  return '#DC2626'; // mortalityCritical
};

// Cause of death colours
const CAUSE_COLOURS = ['#16A34A', '#2563EB', '#D97706', '#DC2626', '#7C3AED', '#6B7280'];

export default function MortalityTrackingClient({ farms, integratorId, integratorDistrict, initialPeriod }: MortalityTrackingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState(initialPeriod);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [hpaiAlert, setHpaiAlert] = useState<any>(null);

  // SWR fetcher
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  };

  // Fetch mortality trend data
  const { data: mortalityTrendData, error: mortalityTrendError } = useSWR(
    `/api/metrics/mortality-trend?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch daily death events data
  const { data: dailyDeathsData, error: dailyDeathsError } = useSWR(
    `/api/metrics/daily-deaths?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch cause of death data
  const { data: causeOfDeathData, error: causeOfDeathError } = useSWR(
    `/api/metrics/cause-of-death?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch mortality log table data
  const { data: mortalityLogData, error: mortalityLogError } = useSWR(
    `/api/metrics/mortality-log?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch HPAI alerts
  useEffect(() => {
    const fetchHpaiAlert = async () => {
      try {
        const res = await fetch(`/api/alerts?type=HPAI&district=${integratorDistrict}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setHpaiAlert(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching HPAI alerts:', error);
      }
    };
    fetchHpaiAlert();
  }, [integratorDistrict]);

  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', newPeriod);
    router.replace(`/dashboard/metrics/mortality?${params.toString()}`);
  };

  // Handle dismiss alert
  const handleDismissAlert = (farmId: string) => {
    setDismissedAlerts(prev => new Set([...prev, farmId]));
  };

  // Handle bar click to navigate to farm daily log
  const handleBarClick = (farmId: string, date: string) => {
    router.push(`/dashboard/farms/${farmId}?tab=daily-log&date=${date}`);
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      const res = await fetch(`/api/metrics/mortality-log/export?integrator_id=${integratorId}&period=${period}`);
      if (!res.ok) throw new Error('Failed to export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mortality-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Check for elevated/critical mortality farms
  const elevatedMortalityFarms = farms.filter(f => 
    f.activeBatch && f.activeBatch.mortality >= 3 && !dismissedAlerts.has(f.id)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mortality Tracking</h1>
        <p className="text-sm text-gray-600 mt-1">
          Monitor mortality trends, causes, and health alerts across your farms
        </p>
      </div>

      {/* Alert Strip for Elevated Mortality */}
      {elevatedMortalityFarms.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="space-y-3">
            {elevatedMortalityFarms.map((farm) => (
              <div key={farm.id} className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Warning size={20} className="text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {farm.name} mortality {farm.activeBatch?.mortality?.toFixed(1)}% — investigate
                    </p>
                    <button
                      onClick={() => router.push(`/dashboard/farms/${farm.id}?tab=daily-log`)}
                      className="text-sm text-red-700 hover:underline mt-1"
                    >
                      View details →
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleDismissAlert(farm.id)}
                  className="p-1 hover:bg-red-100 rounded"
                  aria-label="Dismiss alert"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HPAI Alert Banner */}
      {hpaiAlert && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Warning size={20} className="text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                ⚠ HPAI advisory active in {integratorDistrict}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Follow biosecurity protocols and monitor birds for respiratory symptoms.
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Section 1: Cumulative Mortality Area Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cumulative Mortality</h2>
        {mortalityTrendData ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mortalityTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {farms.map((farm, index) => {
                const colours = ['#16A34A', '#2563EB', '#D97706', '#DC2626', '#7C3AED'];
                return (
                  <Area
                    key={farm.id}
                    type="monotone"
                    dataKey={farm.name.substring(0, 15)}
                    stackId="mortality"
                    stroke={colours[index % colours.length]}
                    fill={colours[index % colours.length]}
                    fillOpacity={0.3}
                  />
                );
              })}
              {/* Reference lines */}
              <Line
                yAxisId={0}
                type="monotone"
                dataKey={() => 3}
                stroke="#D97706"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="3% Threshold"
              />
              <Line
                yAxisId={0}
                type="monotone"
                dataKey={() => 5}
                stroke="#DC2626"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="5% Threshold"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Loading mortality trend data...</p>
          </div>
        )}
      </div>

      {/* Section 2: Daily Death Events Stacked Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Death Events</h2>
        {dailyDeathsData ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={dailyDeathsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              {farms.map((farm, index) => {
                const colours = ['#16A34A', '#2563EB', '#D97706', '#DC2626', '#7C3AED'];
                return (
                  <Bar
                    key={farm.id}
                    yAxisId="left"
                    dataKey={farm.name.substring(0, 15)}
                    stackId="deaths"
                    fill={colours[index % colours.length]}
                    onClick={(data) => handleBarClick(farm.id, data.date)}
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Loading daily death events data...</p>
          </div>
        )}
      </div>

      {/* Section 3: Cause of Death Donut Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cause of Death Distribution</h2>
        {causeOfDeathData && causeOfDeathData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={causeOfDeathData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {causeOfDeathData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CAUSE_COLOURS[index % CAUSE_COLOURS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Info size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Daily log में cause enter करें — better analysis के लिए</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Mortality Log Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mortality Log</h2>
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
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Day #</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Deaths</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Cause</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Cumulative %</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {mortalityLogData ? (
                mortalityLogData.map((log: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">{log.farmName}</td>
                    <td className="py-3 px-4 text-gray-600">{log.date}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{log.dayNumber}</td>
                    <td className="py-3 px-4 text-center text-gray-900">{log.deaths}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{log.cause || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${getMortalityColour(log.cumulativePct).replace('#', 'text-')}`}>
                        {log.cumulativePct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{log.actionTaken || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Loading mortality log data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
