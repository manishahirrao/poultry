'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Trophy, Flag, Warning, Syringe, Package } from '@phosphor-icons/react';
import { colors, radius, spacing, motion } from '@/lib/tokens';
import { useEntitlements } from '@/lib/plans/useEntitlements';
import { canAccess, FEATURES } from '@/lib/plans/featureGates';
import { PlanUpgradePrompt } from '@/components/plans/PlanUpgradePrompt';

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
    lastLogDate: string;
    feedConsumedKg: number;
  };
}

interface MetricsClientProps {
  farms: Farm[];
  integratorId: string;
  initialPeriod: string;
}

const MetricsClient = function MetricsClient({ farms, integratorId, initialPeriod }: MetricsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { entitlements } = useEntitlements();
  const [selectedFarms, setSelectedFarms] = useState<string[]>(farms.map(f => f.id));
  const [period, setPeriod] = useState(initialPeriod);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // ── Feature access check for portfolio metrics ───────────────────────────────────
  const portfolioMetricsAccess = canAccess(entitlements, FEATURES.PORTFOLIO_METRICS);
  
  if (!portfolioMetricsAccess.hasAccess) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">Portfolio Metrics</h1>
        <PlanUpgradePrompt
          feature={FEATURES.PORTFOLIO_METRICS}
          upgradeTarget="FLOCKIQ_PRO"
        />
      </div>
    );
  }
  
  // Benchmark filters state
  const [breedSlidersHorizontal, setBreedSlidersHorizontal] = useState('all');
  const [regionSlidersHorizontal, setRegionSlidersHorizontal] = useState('all');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // SWR fetcher - memoized to prevent recreation
  const fetcher = useCallback(async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  }, []);

  // Fetch FCR trend data - reduced refresh interval to 10 minutes
  const { data: fcrTrendData, error: fcrError, isLoading: fcrLoading } = useSWR(
    `/api/metrics/fcr-trend?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { 
      refreshInterval: 600000, 
      revalidateOnFocus: false, 
      revalidateOnReconnect: true,
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return; // Max 2 retries
        setTimeout(() => revalidate({ retryCount }), 3000);
      }
    }
  );

  // Fetch mortality timeline data - reduced refresh interval to 10 minutes
  const { data: mortalityData, error: mortalityError, isLoading: mortalityLoading } = useSWR(
    `/api/metrics/mortality-timeline?integrator_id=${integratorId}&period=${period}`,
    fetcher,
    { 
      refreshInterval: 600000, 
      revalidateOnFocus: false, 
      revalidateOnReconnect: true,
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return; // Max 2 retries
        setTimeout(() => revalidate({ retryCount }), 3000);
      }
    }
  );

  // Fetch pending actions data - reduced refresh interval to 5 minutes (more critical)
  const { data: pendingActions, error: pendingError, isLoading: pendingLoading } = useSWR(
    `/api/metrics/pending-actions?integrator_id=${integratorId}`,
    fetcher,
    { 
      refreshInterval: 300000, 
      revalidateOnFocus: false, 
      revalidateOnReconnect: true,
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 2) return; // Max 2 retries
        setTimeout(() => revalidate({ retryCount }), 3000);
      }
    }
  );

  // Handle period change - memoized
  const handlePeriodChange = useCallback((newPeriod: string) => {
    setPeriod(newPeriod);
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', newPeriod);
    router.replace(`/dashboard/metrics?${params.toString()}`);
  }, [searchParams, router]);

  // Calculate farm performance ranking (sorted by FCR ascending) - memoized
  const farmRanking = useMemo(() => 
    farms
      .filter(f => f.activeBatch && f.activeBatch.fcr)
      .sort((a, b) => (a.activeBatch!.fcr || 0) - (b.activeBatch!.fcr || 0)),
    [farms]
  );

  // Handle farm row click - memoized
  const handleFarmClick = useCallback((farmId: string) => {
    router.push(`/dashboard/farms/${farmId}`);
  }, [router]);

  // Handle mortality bar click - memoized
  const handleMortalityClick = useCallback((farmId: string, date: string) => {
    router.push(`/dashboard/farms/${farmId}?tab=daily-log&date=${date}`);
  }, [router]);

  // Handle pending action click - memoized
  const handlePendingActionClick = useCallback((farmId: string, actionType: string) => {
    if (actionType === 'log') {
      router.push(`/dashboard/farms/${farmId}/daily-log`);
    } else if (actionType === 'vaccination') {
      router.push(`/dashboard/farms/${farmId}?tab=health`);
    } else if (actionType === 'feed') {
      router.push(`/dashboard/farms/${farmId}?tab=feed`);
    } else if (actionType === 'fcr') {
      router.push(`/dashboard/farms/${farmId}?tab=metrics`);
    } else if (actionType === 'mortality') {
      router.push(`/dashboard/farms/${farmId}?tab=metrics`);
    }
  }, [router]);

  // Get today's date in IST for comparison - memoized
  const todayIST = useMemo(() => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    return new Date(now.getTime() + istOffset).toISOString().split('T')[0];
  }, []);

  // Calculate log compliance percentage for each farm - memoized
  const farmLogCompliance = useMemo(() => {
    const complianceMap = new Map<string, number>();
    farms.forEach((farm) => {
      if (!farm.activeBatch) {
        complianceMap.set(farm.id, 0);
        return;
      }
      const placementDate = new Date(farm.activeBatch.placementDate);
      const daysSincePlacement = Math.floor((Date.now() - placementDate.getTime()) / (1000 * 60 * 60 * 24));
      const lastLogDate = farm.activeBatch.lastLogDate ? new Date(farm.activeBatch.lastLogDate) : null;
      const today = new Date();
      
      if (!lastLogDate) {
        complianceMap.set(farm.id, 0);
        return;
      }
      
      const daysSinceLastLog = Math.floor((today.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
      const compliance = daysSincePlacement > 0 ? Math.max(0, Math.min(100, ((daysSincePlacement - daysSinceLastLog) / daysSincePlacement) * 100)) : 100;
      complianceMap.set(farm.id, Math.round(compliance));
    });
    return complianceMap;
  }, [farms]);

  // Calculate health status for each farm - memoized
  const farmHealthStatus = useMemo(() => {
    const healthMap = new Map<string, 'healthy' | 'monitoring' | 'critical'>();
    farms.forEach((farm) => {
      if (!farm.activeBatch) {
        healthMap.set(farm.id, 'monitoring');
        return;
      }
      const fcr = farm.activeBatch.fcr || 0;
      const mortality = farm.activeBatch.mortality || 0;
      
      if (fcr < 1.9 && mortality < 3) {
        healthMap.set(farm.id, 'healthy');
      } else if (fcr < 2.1 && mortality < 5) {
        healthMap.set(farm.id, 'monitoring');
      } else {
        healthMap.set(farm.id, 'critical');
      }
    });
    return healthMap;
  }, [farms]);

  // Generate 7-day FCR trend data for sparklines - memoized
  const farmFCRTrend = useMemo(() => {
    const trendMap = new Map<string, number[]>();
    farms.forEach((farm) => {
      // Generate mock trend data for now - in production this would come from API
      const baseFCR = farm.activeBatch?.fcr || 1.8;
      const trend = [];
      for (let i = 6; i >= 0; i--) {
        const variation = (Math.random() - 0.5) * 0.2;
        trend.push(Math.max(1.5, Math.min(2.5, baseFCR + variation)));
      }
      trendMap.set(farm.id, trend);
    });
    return trendMap;
  }, [farms]);

  // Sparkline component
  const Sparkline = ({ data, color }: { data: number[]; color: string }) => (
    <ResponsiveContainer width={60} height={28}>
      <AreaChart data={data.map((val, idx) => ({ idx, val }))}>
        <Area
          type="monotone"
          dataKey="val"
          stroke={color}
          fill={color}
          fillOpacity={0.3}
          strokeWidth={1.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg p-1" style={{ backgroundColor: colors.neutral100 }}>
          {['7d', '30d', '90d', 'batch'].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ transitionDuration: prefersReducedMotion ? '0ms' : `${motion.quick}ms` }}
            >
              {p === '7d' ? 'This Week' : p === '30d' ? 'This Month' : p === '90d' ? 'Last 90 Days' : 'This Batch'}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FCR Trend Chart */}
        <div className="ring-1 p-1.5" style={{ backgroundColor: colors.neutral50, borderRadius: `${radius.xl * 2}px`, borderColor: colors.neutral200 }}>
          <div className="p-6" style={{ backgroundColor: colors.white, borderRadius: `${radius.xl * 2 - 6}px` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: colors.neutral900 }}>FCR Trend</h2>
            {fcrLoading ? (
              <div className="h-[300px] flex items-center justify-center rounded-lg" style={{ backgroundColor: colors.neutral50 }}>
                <p style={{ color: colors.neutral500 }}>Loading FCR trend data...</p>
              </div>
            ) : fcrError ? (
              <div className="h-[300px] flex items-center justify-center rounded-lg" style={{ backgroundColor: colors.neutral50 }}>
                <p style={{ color: colors.red600 }}>Failed to load FCR trend data. Please refresh.</p>
              </div>
            ) : fcrTrendData && fcrTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fcrTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedFarms.map((farmId, index) => {
                    const farm = farms.find(f => f.id === farmId);
                    if (!farm) return null;
                    const chartColors = [colors.brandGreen700, '#2563EB', colors.amber500, colors.red600, '#7C3AED'];
                    return (
                      <Line
                        key={farmId}
                        type="monotone"
                        dataKey={farm.name.substring(0, 15)}
                        stroke={chartColors[index % chartColors.length]}
                        strokeWidth={2}
                      />
                    );
                  })}
                  <Line
                    type="monotone"
                    dataKey="portfolioAvg"
                    stroke={colors.neutral400}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    name="PAvg"
                  />
                  <Line
                    type="monotone"
                    dataKey="industryAvg"
                    stroke={colors.neutral400}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    name="IAvg"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center rounded-lg" style={{ backgroundColor: colors.neutral50 }}>
                <p style={{ color: colors.neutral500 }}>No FCR trend data available for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Mortality Events Timeline */}
        <div className="ring-1 p-1.5" style={{ backgroundColor: colors.neutral50, borderRadius: `${radius.xl * 2}px`, borderColor: colors.neutral200 }}>
          <div className="p-6" style={{ backgroundColor: colors.white, borderRadius: `${radius.xl * 2 - 6}px` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: colors.neutral900 }}>Mortality Events Timeline</h2>
            {mortalityLoading ? (
              <div className="h-[300px] flex items-center justify-center rounded-lg" style={{ backgroundColor: colors.neutral50 }}>
                <p style={{ color: colors.neutral500 }}>Loading mortality timeline data...</p>
              </div>
            ) : mortalityError ? (
              <div className="h-[300px] flex items-center justify-center rounded-lg" style={{ backgroundColor: colors.neutral50 }}>
                <p style={{ color: colors.red600 }}>Failed to load mortality data. Please refresh.</p>
              </div>
            ) : mortalityData && mortalityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={mortalityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  {selectedFarms.map((farmId, index) => {
                    const farm = farms.find(f => f.id === farmId);
                    if (!farm) return null;
                    const chartColors = [colors.brandGreen700, '#2563EB', colors.amber500, colors.red600, '#7C3AED'];
                    return (
                      <Bar
                        key={farmId}
                        yAxisId="left"
                        dataKey={farm.name.substring(0, 15)}
                        stackId="mortality"
                        fill={chartColors[index % chartColors.length]}
                        onClick={(data) => handleMortalityClick(farmId, data.date)}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativePct"
                    stroke={colors.red600}
                    strokeWidth={2}
                    name="Cumulative %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center rounded-lg" style={{ backgroundColor: colors.neutral50 }}>
                <p style={{ color: colors.neutral500 }}>No mortality data available for this period</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farm Performance League Table */}
      <div className="ring-1 p-1.5" style={{ backgroundColor: colors.neutral50, borderRadius: `${radius.xl * 2}px`, borderColor: colors.neutral200 }}>
        <div className="p-6" style={{ backgroundColor: colors.white, borderRadius: `${radius.xl * 2 - 6}px` }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: colors.neutral900 }}>Farm Ranking</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.neutral200}` }}>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>Rank</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>Farm Name</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>FCR</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>Trend</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>Mortality</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>ADG</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>Birds Alive</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>Status</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>Last Log</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>Log %</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>Health</th>
                </tr>
            </thead>
            <tbody>
              {farmRanking.map((farm, index) => {
                const batch = farm.activeBatch;
                return (
                  <tr
                    key={farm.id}
                    className="border-b cursor-pointer focus-visible:outline-none focus-visible:bg-gray-50"
                    style={{ borderBottom: `1px solid ${colors.neutral100}` }}
                    onClick={() => handleFarmClick(farm.id)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleFarmClick(farm.id)}
                  >
                    <td className="py-3 px-4">
                      {index === 0 && <Trophy size={24} style={{ color: colors.amber500 }} />}
                      {index === farmRanking.length - 1 && <Flag size={24} style={{ color: colors.red600 }} />}
                      {index > 0 && index < farmRanking.length - 1 && (
                        <span className="font-semibold" style={{ color: colors.neutral700 }}>{index + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold" style={{ color: colors.neutral900 }}>{farm.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${
                        batch && batch.fcr < 1.7 ? '' :
                        batch && batch.fcr < 1.9 ? '' :
                        batch && batch.fcr < 2.1 ? '' : ''
                      }`} style={{
                        color: batch && batch.fcr < 1.9 ? colors.brandGreen700 :
                               batch && batch.fcr < 2.1 ? colors.amber500 : colors.red600
                      }}>
                        {batch ? batch.fcr?.toFixed(3) || '—' : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {batch ? (
                        <Sparkline 
                          data={farmFCRTrend.get(farm.id) || []} 
                          color={batch.fcr < 1.9 ? colors.brandGreen700 : batch.fcr < 2.1 ? colors.amber500 : colors.red600}
                        />
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${
                        batch && batch.mortality < 3 ? '' :
                        batch && batch.mortality < 5 ? '' : ''
                      }`} style={{
                        color: batch && batch.mortality < 3 ? colors.brandGreen700 :
                               batch && batch.mortality < 5 ? colors.amber500 : colors.red600
                      }}>
                        {batch ? (batch.mortality?.toFixed(1) || '—') + '%' : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center" style={{ color: colors.neutral700 }}>
                      {batch ? '—' : '—'}
                    </td>
                    <td className="py-3 px-4 text-center" style={{ color: colors.neutral900 }}>
                      {batch ? batch.birdsAlive?.toLocaleString('en-IN') || '—' : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{
                        backgroundColor: farm.status === 'active' ? colors.brandGreen50 :
                                       farm.status === 'between_batches' ? colors.neutral100 :
                                       farm.status === 'paused' ? colors.amberLight : '#DBEAFE',
                        color: farm.status === 'active' ? colors.brandGreen700 :
                               farm.status === 'between_batches' ? colors.neutral700 :
                               farm.status === 'paused' ? colors.amber500 : '#1E40AF'
                      }}>
                        {farm.status === 'active' ? 'Active' :
                         farm.status === 'between_batches' ? 'Between Batches' :
                         farm.status === 'paused' ? 'Paused' : farm.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm" style={{ color: colors.neutral700 }}>
                      {batch?.lastLogDate ? new Date(batch.lastLogDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold text-sm ${
                        farmLogCompliance.get(farm.id) || 0 >= 80 ? '' :
                        farmLogCompliance.get(farm.id) || 0 >= 50 ? '' : ''
                      }`} style={{
                        color: (farmLogCompliance.get(farm.id) || 0) >= 80 ? colors.brandGreen700 :
                               (farmLogCompliance.get(farm.id) || 0) >= 50 ? colors.amber500 : colors.red600
                      }}>
                        {farmLogCompliance.get(farm.id) || 0}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        farmHealthStatus.get(farm.id) === 'healthy' ? 'bg-green-100' :
                        farmHealthStatus.get(farm.id) === 'monitoring' ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        <span className={`w-3 h-3 rounded-full ${
                          farmHealthStatus.get(farm.id) === 'healthy' ? 'bg-green-500' :
                          farmHealthStatus.get(farm.id) === 'monitoring' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Network Benchmark Section */}
      <div className="ring-1 p-1.5" style={{ backgroundColor: colors.neutral50, borderRadius: `${radius.xl * 2}px`, borderColor: colors.neutral200 }}>
        <div className="p-6" style={{ backgroundColor: colors.white, borderRadius: `${radius.xl * 2 - 6}px` }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: colors.neutral900 }}>Network Benchmark</h2>
              <p className="text-sm mt-1" style={{ color: colors.neutral900 }}>
                Compare your portfolio performance against platform averages and top performers (anonymised aggregate data)
              </p>
            </div>
            <Link
              href={`/dashboard/metrics/benchmark?breed=${breedSlidersHorizontal}&region=${regionSlidersHorizontal}`}
              className="text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: colors.brandGreen700 }}
            >
              View Detailed Benchmark →
            </Link>
          </div>
          
          {/* SlidersHorizontal Pills */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Breed SlidersHorizontal */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: colors.neutral700 }}>Breed:</span>
              <div className="flex gap-1.5">
                {['all', 'Ross 308', 'Cobb 430', 'Other'].map((breed) => (
                  <button
                    key={breed}
                    onClick={() => setBreedSlidersHorizontal(breed)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      breedSlidersHorizontal === breed
                        ? 'text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: breedSlidersHorizontal === breed ? colors.brandGreen700 : colors.neutral100,
                      color: breedSlidersHorizontal === breed ? 'white' : colors.neutral700,
                      transitionDuration: prefersReducedMotion ? '0ms' : `${motion.quick}ms`
                    }}
                  >
                    {breed === 'all' ? 'All' : breed}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Region SlidersHorizontal */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: colors.neutral700 }}>Region:</span>
              <div className="flex gap-1.5">
                {['all', 'My State', 'My District'].map((region) => (
                  <button
                    key={region}
                    onClick={() => setRegionSlidersHorizontal(region)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      regionSlidersHorizontal === region
                        ? 'text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: regionSlidersHorizontal === region ? colors.brandGreen700 : colors.neutral100,
                      color: regionSlidersHorizontal === region ? 'white' : colors.neutral700,
                      transitionDuration: prefersReducedMotion ? '0ms' : `${motion.quick}ms`
                    }}
                  >
                    {region === 'all' ? 'All' : region}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FCR Comparison */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.neutral50, border: `1px solid ${colors.neutral200}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: colors.neutral900 }}>FCR Comparison</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.neutral900 }}>Your Portfolio</span>
                  <span className="font-semibold" style={{ color: colors.brandGreen700 }}>
                    {farms.length > 0 && farms[0].activeBatch ? farms[0].activeBatch.fcr?.toFixed(3) || '—' : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.neutral900 }}>Platform Average</span>
                  <span className="font-semibold" style={{ color: colors.neutral700 }}>1.85</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.neutral900 }}>Top 25%</span>
                  <span className="font-semibold" style={{ color: colors.brandGreen700 }}>1.72</span>
                </div>
              </div>
            </div>

            {/* Mortality Comparison */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.neutral50, border: `1px solid ${colors.neutral200}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: colors.neutral900 }}>Mortality Comparison</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.neutral900 }}>Your Portfolio</span>
                  <span className="font-semibold" style={{ color: farms.length > 0 && farms[0].activeBatch && farms[0].activeBatch.mortality < 3 ? colors.brandGreen700 : farms[0].activeBatch && farms[0].activeBatch.mortality < 5 ? colors.amber500 : colors.red600 }}>
                    {farms.length > 0 && farms[0].activeBatch ? (farms[0].activeBatch.mortality?.toFixed(1) || '—') + '%' : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.neutral900 }}>Platform Average</span>
                  <span className="font-semibold" style={{ color: colors.neutral700 }}>3.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.neutral900 }}>Top 25%</span>
                  <span className="font-semibold" style={{ color: colors.brandGreen700 }}>2.1%</span>
                </div>
              </div>
            </div>

            {/* Log Compliance Comparison */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.neutral50, border: `1px solid ${colors.neutral200}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: colors.neutral900 }}>Log Compliance Comparison</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.neutral900 }}>Your Portfolio</span>
                  <span className="font-semibold" style={{ color: (farmLogCompliance.get(farms[0]?.id || '') || 0) >= 80 ? colors.brandGreen700 : (farmLogCompliance.get(farms[0]?.id || '') || 0) >= 50 ? colors.amber500 : colors.red600 }}>
                    {farms.length > 0 ? (farmLogCompliance.get(farms[0].id) || 0) + '%' : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.neutral900 }}>Platform Average</span>
                  <span className="font-semibold" style={{ color: colors.neutral700 }}>78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.neutral900 }}>Top 25%</span>
                  <span className="font-semibold" style={{ color: colors.brandGreen700 }}>95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Pending Actions Panel */}
      <div className="ring-1 p-1.5" style={{ backgroundColor: colors.neutral50, borderRadius: `${radius.xl * 2}px`, borderColor: colors.neutral200 }}>
        <div className="p-6" style={{ backgroundColor: colors.white, borderRadius: `${radius.xl * 2 - 6}px` }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: colors.neutral900 }}>Pending Actions</h2>
          {pendingLoading ? (
            <div className="h-[100px] flex items-center justify-center rounded-lg" style={{ backgroundColor: colors.neutral50 }}>
              <p style={{ color: colors.neutral500 }}>Loading pending actions...</p>
            </div>
          ) : pendingError ? (
            <div className="h-[100px] flex items-center justify-center rounded-lg" style={{ backgroundColor: colors.neutral50 }}>
              <p style={{ color: colors.red600 }}>Failed to load pending actions. Please refresh.</p>
            </div>
          ) : pendingActions ? (
            <div className="space-y-3">
              {/* Farms missing today's log */}
              {pendingActions.missingLogs && pendingActions.missingLogs.length > 0 ? (
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.amberLight, borderColor: colors.amber500, borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Warning size={20} style={{ color: colors.amber500 }} />
                      <span className="text-sm font-semibold" style={{ color: colors.neutral900 }}>Farms missing today's log</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: colors.amber500 }}>{pendingActions.missingLogs.length}</span>
                  </div>
                  <div className="space-y-2">
                    {pendingActions.missingLogs.map((item: any) => (
                      <button
                        key={item.farmId}
                        onClick={() => handlePendingActionClick(item.farmId, 'log')}
                        className="w-full text-left px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ backgroundColor: colors.white, transitionDuration: prefersReducedMotion ? '0ms' : `${motion.quick}ms` }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.amberLight}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.white}
                      >
                        <span className="text-sm" style={{ color: colors.neutral700 }}>{item.farmName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.brandGreen50, borderColor: colors.brandGreen700, borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ color: colors.brandGreen700 }}>✓</span>
                    <span className="text-sm" style={{ color: colors.neutral700 }}>All farms logged today</span>
                  </div>
                </div>
              )}

              {/* Overdue vaccinations */}
              {pendingActions.overdueVaccinations && pendingActions.overdueVaccinations.length > 0 ? (
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#DBEAFE', borderColor: '#2563EB', borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Syringe size={20} style={{ color: '#2563EB' }} />
                      <span className="text-sm font-semibold" style={{ color: colors.neutral900 }}>Overdue vaccinations</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#2563EB' }}>{pendingActions.overdueVaccinations.length}</span>
                  </div>
                  <div className="space-y-2">
                    {pendingActions.overdueVaccinations.map((item: any) => (
                      <button
                        key={item.farmId}
                        onClick={() => handlePendingActionClick(item.farmId, 'vaccination')}
                        className="w-full text-left px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ backgroundColor: colors.white, transitionDuration: prefersReducedMotion ? '0ms' : `${motion.quick}ms` }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.white}
                      >
                        <span className="text-sm" style={{ color: colors.neutral700 }}>{item.farmName} - {item.vaccine}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.brandGreen50, borderColor: colors.brandGreen700, borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ color: colors.brandGreen700 }}>✓</span>
                    <span className="text-sm" style={{ color: colors.neutral700 }}>No overdue vaccinations</span>
                  </div>
                </div>
              )}

              {/* Low feed stock */}
              {pendingActions.lowFeedStock && pendingActions.lowFeedStock.length > 0 ? (
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.redLight, borderColor: colors.red600, borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Package size={20} style={{ color: colors.red600 }} />
                      <span className="text-sm font-semibold" style={{ color: colors.neutral900 }}>Low feed stock (&lt;5 days)</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: colors.red600 }}>{pendingActions.lowFeedStock.length}</span>
                  </div>
                  <div className="space-y-2">
                    {pendingActions.lowFeedStock.map((item: any) => (
                      <button
                        key={item.farmId}
                        onClick={() => handlePendingActionClick(item.farmId, 'feed')}
                        className="w-full text-left px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ backgroundColor: colors.white, transitionDuration: prefersReducedMotion ? '0ms' : `${motion.quick}ms` }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.redLight}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.white}
                      >
                        <span className="text-sm" style={{ color: colors.neutral700 }}>{item.farmName} - {item.daysRemaining} days remaining</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.brandGreen50, borderColor: colors.brandGreen700, borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ color: colors.brandGreen700 }}>✓</span>
                    <span className="text-sm" style={{ color: colors.neutral700 }}>Feed stock adequate</span>
                  </div>
                </div>
              )}

              {/* FCR alerts */}
              {pendingActions.fcrAlerts && pendingActions.fcrAlerts.length > 0 ? (
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.amberLight, borderColor: colors.amber500, borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Warning size={20} style={{ color: colors.amber500 }} />
                      <span className="text-sm font-semibold" style={{ color: colors.neutral900 }}>FCR Alert</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: colors.amber500 }}>{pendingActions.fcrAlerts.length}</span>
                  </div>
                  <div className="space-y-2">
                    {pendingActions.fcrAlerts.map((item: any) => (
                      <button
                        key={item.farmId}
                        onClick={() => handlePendingActionClick(item.farmId, 'fcr')}
                        className="w-full text-left px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ backgroundColor: colors.white, transitionDuration: prefersReducedMotion ? '0ms' : `${motion.quick}ms` }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.amberLight}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.white}
                      >
                        <span className="text-sm" style={{ color: colors.neutral700 }}>{item.farmName} - {item.message}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.brandGreen50, borderColor: colors.brandGreen700, borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ color: colors.brandGreen700 }}>✓</span>
                    <span className="text-sm" style={{ color: colors.neutral700 }}>FCR within normal range</span>
                  </div>
                </div>
              )}

              {/* Mortality alerts */}
              {pendingActions.mortalityAlerts && pendingActions.mortalityAlerts.length > 0 ? (
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.redLight, borderColor: colors.red600, borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Warning size={20} style={{ color: colors.red600 }} />
                      <span className="text-sm font-semibold" style={{ color: colors.neutral900 }}>High Mortality Alert</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: colors.red600 }}>{pendingActions.mortalityAlerts.length}</span>
                  </div>
                  <div className="space-y-2">
                    {pendingActions.mortalityAlerts.map((item: any) => (
                      <button
                        key={item.farmId}
                        onClick={() => handlePendingActionClick(item.farmId, 'mortality')}
                        className="w-full text-left px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{ backgroundColor: colors.white, transitionDuration: prefersReducedMotion ? '0ms' : `${motion.quick}ms` }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.redLight}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.white}
                      >
                        <span className="text-sm" style={{ color: colors.neutral700 }}>{item.farmName} - {item.message}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.brandGreen50, borderColor: colors.brandGreen700, borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ color: colors.brandGreen700 }}>✓</span>
                    <span className="text-sm" style={{ color: colors.neutral700 }}>Mortality within normal range</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.neutral100, borderColor: colors.neutral200, borderWidth: '1px', borderStyle: 'solid' }}>
                <div className="flex items-center gap-3">
                  <span style={{ color: colors.neutral400 }}>⚠️</span>
                  <span className="text-sm" style={{ color: colors.neutral700 }}>Loading...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(MetricsClient);