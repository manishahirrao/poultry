'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { FarmEmptyState } from '@/components/farms/FarmEmptyState';
import { useEntitlements } from '@/lib/plans/useEntitlements';
import { canAccess, FEATURES } from '@/lib/plans/featureGates';
import { PlanUpgradePrompt } from '@/components/plans/PlanUpgradePrompt';

interface Farm {
  id: string;
  name: string;
  fcr: number;
  mortality: number;
  adg: number;
  feedEfficiency: number;
  harvestWeight: number;
  batchDuration: number;
}

interface ComparisonData {
  metric: string;
  [key: string]: string | number;
}

// Mock data - in production, this would come from API
const mockFarms: Farm[] = [
  {
    id: '1',
    name: 'Farm A',
    fcr: 1.82,
    mortality: 2.1,
    adg: 52,
    feedEfficiency: 0.65,
    harvestWeight: 2.1,
    batchDuration: 42,
  },
  {
    id: '2',
    name: 'Farm B',
    fcr: 1.95,
    mortality: 3.8,
    adg: 48,
    feedEfficiency: 0.58,
    harvestWeight: 2.0,
    batchDuration: 44,
  },
  {
    id: '3',
    name: 'Farm C',
    fcr: 1.77,
    mortality: 1.8,
    adg: 56,
    feedEfficiency: 0.70,
    harvestWeight: 2.15,
    batchDuration: 41,
  },
];

const industryAverages = {
  fcr: 1.85,
  mortality: 3.0,
  adg: 54,
  feedEfficiency: 0.65,
  harvestWeight: 2.05,
  batchDuration: 42,
};

// Color palette for farms (colorblind safe, not red/green)
const farmColors = ['#3B82F6', '#F97316', '#8B5CF6', '#14B8A6', '#EC4899'];

function FarmComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { entitlements } = useEntitlements();
  const [selectedFarmIds, setSelectedFarmIds] = useState<string[]>([]);
  const [period, setPeriod] = useState('current-batch');
  const [allFarms, setAllFarms] = useState<Farm[]>(mockFarms);

  // ── Feature access check for farm comparison ───────────────────────────────────
  const farmCompareAccess = canAccess(entitlements, FEATURES.FARM_COMPARE);
  
  if (!farmCompareAccess.hasAccess) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Farm Performance Compare करें</h1>
        <PlanUpgradePrompt
          feature={FEATURES.FARM_COMPARE}
          upgradeTarget="FLOCKIQ_PRO"
        />
      </div>
    );
  }

  // Load selected farms from URL
  useEffect(() => {
    const farmsParam = searchParams.get('farms');
    const periodParam = searchParams.get('period');
    if (farmsParam) {
      setSelectedFarmIds(farmsParam.split(','));
    }
    if (periodParam) {
      setPeriod(periodParam);
    }
  }, [searchParams]);

  // Update URL when selection changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedFarmIds.length > 0) {
      params.set('farms', selectedFarmIds.join(','));
    }
    if (period !== 'current-batch') {
      params.set('period', period);
    }
    router.replace(`/dashboard/farms/compare?${params.toString()}`);
  }, [selectedFarmIds, period, router]);

  const selectedFarms = mockFarms.filter(farm => selectedFarmIds.includes(farm.id));

  const toggleFarmSelection = (farmId: string) => {
    if (selectedFarmIds.includes(farmId)) {
      setSelectedFarmIds(selectedFarmIds.filter(id => id !== farmId));
    } else {
      if (selectedFarmIds.length >= 5) {
        alert('Maximum 5 farms can be compared at once');
        return;
      }
      setSelectedFarmIds([...selectedFarmIds, farmId]);
    }
  };

  // Normalize metrics for radar chart (0-100 scale)
  const normalizeMetric = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const prepareRadarData = () => {
    const metrics = [
      { key: 'fcr', label: 'FCR', min: 1.5, max: 2.5, inverse: true },
      { key: 'mortality', label: 'Mortality', min: 0, max: 6, inverse: true },
      { key: 'adg', label: 'ADG', min: 40, max: 65, inverse: false },
      { key: 'feedEfficiency', label: 'Feed Efficiency', min: 0.5, max: 0.8, inverse: false },
      { key: 'harvestWeight', label: 'Harvest Weight', min: 1.8, max: 2.3, inverse: false },
      { key: 'batchDuration', label: 'Batch Duration', min: 38, max: 48, inverse: true },
    ];

    return metrics.map(metric => {
      const data: ComparisonData = { metric: metric.label };
      
      selectedFarms.forEach((farm, index) => {
        const value = farm[metric.key as keyof Farm] as number;
        const normalized = normalizeMetric(value, metric.min, metric.max);
        data[farm.name] = metric.inverse ? 100 - normalized : normalized;
      });

      return data;
    });
  };

  const getBestValue = (metric: string, farms: Farm[]) => {
    const values = farms.map(f => f[metric as keyof Farm] as number);
    if (metric === 'fcr' || metric === 'mortality' || metric === 'batchDuration') {
      return Math.min(...values);
    }
    return Math.max(...values);
  };

  if (mockFarms.length < 2) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Farm Performance Compare करें</h1>
        <FarmEmptyState
          variant="compare_need_more"
          ctaHref="/dashboard/farms/new"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Farm Performance Compare करें</h1>
        <p className="text-sm text-gray-600 mt-1">Compare performance across your farms</p>
      </div>

      {/* Farm Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Farms to Compare (2-5)</h2>
        <div className="flex flex-wrap gap-3">
          {allFarms.map((farm) => (
            <button
              key={farm.id}
              onClick={() => toggleFarmSelection(farm.id)}
              className={`px-4 py-2 rounded-full border-2 transition-colors ${
                selectedFarmIds.includes(farm.id)
                  ? 'bg-green-700 border-green-700 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-green-500'
              }`}
            >
              {farm.name}
            </button>
          ))}
        </div>
        {allFarms.length < 2 && (
          <p className="text-sm text-gray-500 mt-2">
            You need at least 2 farms to compare. <a href="/dashboard/farms/new" className="text-green-700 hover:underline">Add another farm</a>
          </p>
        )}
      </div>

      {/* Period Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Period</h2>
        <div className="flex gap-2">
          {['current-batch', 'last-30-days', 'last-90-days', 'custom'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                period === p
                  ? 'bg-green-700 border-green-700 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-green-500'
              }`}
            >
              {p.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {selectedFarms.length >= 2 ? (
        <>
          {/* Radar Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Radar</h2>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={prepareRadarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  {selectedFarms.map((farm, index) => (
                    <Radar
                      key={farm.id}
                      name={farm.name}
                      dataKey={farm.name}
                      stroke={farmColors[index % farmColors.length]}
                      fill={farmColors[index % farmColors.length]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Metric</th>
                    {selectedFarms.map((farm, index) => (
                      <th
                        key={farm.id}
                        className="text-center py-3 px-4 font-semibold text-gray-900"
                        style={{ color: farmColors[index % farmColors.length] }}
                      >
                        {farm.name}
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Best</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Industry Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'fcr', label: 'FCR', format: (v: number) => v.toFixed(3) },
                    { key: 'mortality', label: 'Mortality %', format: (v: number) => v.toFixed(1) + '%' },
                    { key: 'adg', label: 'ADG (g/day)', format: (v: number) => v.toFixed(0) },
                    { key: 'feedEfficiency', label: 'Feed Efficiency', format: (v: number) => (v * 100).toFixed(0) + '%' },
                    { key: 'harvestWeight', label: 'Harvest Weight (kg)', format: (v: number) => v.toFixed(2) },
                    { key: 'batchDuration', label: 'Batch Duration (days)', format: (v: number) => v.toFixed(0) },
                  ].map((metric) => (
                    <tr key={metric.key} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold text-gray-900">{metric.label}</td>
                      {selectedFarms.map((farm) => {
                        const value = farm[metric.key as keyof Farm] as number;
                        const bestValue = getBestValue(metric.key, selectedFarms);
                        const isBest = metric.key === 'fcr' || metric.key === 'mortality' || metric.key === 'batchDuration'
                          ? value === bestValue
                          : value === bestValue;
                        
                        return (
                          <td
                            key={farm.id}
                            className={`py-3 px-4 text-center ${isBest ? 'bg-green-50 font-semibold' : ''}`}
                          >
                            {metric.format(value)}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center bg-green-50 font-semibold">
                        {metric.format(getBestValue(metric.key, selectedFarms))}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {metric.format(industryAverages[metric.key as keyof typeof industryAverages] as number)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download Report Button */}
          <div className="flex justify-end">
            <button className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-semibold">
              Download Comparison Report
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12">
          <FarmEmptyState
            variant="compare_need_more"
            heading="Select at least 2 farms to compare"
            sub="Choose 2-5 farms from the list above to see their performance comparison."
          />
        </div>
      )}
    </div>
  );
}

export default function FarmComparePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading farm comparison...</div>}>
      <FarmComparePageContent />
    </Suspense>
  );
}
