'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { colors, radius, spacing, motion } from '@/lib/tokens';
import { BenchmarkFilterBar } from './components/BenchmarkFilterBar';
import { YourPerformanceSummary } from './components/YourPerformanceSummary';
import BenchmarkComparisonTable from './components/BenchmarkComparisonTable';
import BenchmarkRadarChart from './components/BenchmarkRadarChart';
import BenchmarkInsights from './components/BenchmarkInsights';
import BreedGrowthCurveChart from './components/BreedGrowthCurveChart';

interface Farm {
  id: string;
  name: string;
  district: string;
  status: string;
  breed: string | null;
  flockSize: number;
}

interface BenchmarkSlidersHorizontals {
  farm: string;
  breed: string;
  region: string;
  flockSize: string;
  period: string;
}

interface BenchmarkClientProps {
  farms: Farm[];
  integratorId: string;
  initialSlidersHorizontals: BenchmarkSlidersHorizontals;
}

interface UserMetrics {
  fcr: number;
  mortalityPct: number;
  adg: number;
  grossMarginPct: number;
}

interface BenchmarkData {
  privacyMinimumMet: boolean;
  sampleCount: number;
  farmCount: number;
  metrics: {
    fcr: { p25: number; p50: number; p75: number; p90: number };
    mortalityPct: { p25: number; p50: number; p75: number; p90: number };
    adg: { p25: number; p50: number; p75: number; p90: number };
    harvestWeight: { p25: number; p50: number; p75: number; p90: number };
    batchDuration: { p25: number; p50: number; p75: number; p90: number };
    feedEfficiency: { p25: number; p50: number; p75: number; p90: number };
    grossMarginPct: { p25: number; p50: number; p75: number; p90: number };
  };
}

const BenchmarkClient = function BenchmarkClient({ farms, integratorId, initialSlidersHorizontals }: BenchmarkClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setSlidersHorizontals] = useState<BenchmarkSlidersHorizontals>(initialSlidersHorizontals);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

  // Fetch user metrics based on filters
  const { data: userMetrics, error: userMetricsError } = useSWR(
    `/api/benchmark/user-metrics?integrator_id=${integratorId}&farm=${filters.farm}&period=${filters.period}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: false }
  );

  // Fetch benchmark data based on filters
  const { data: benchmarkData, error: benchmarkError } = useSWR(
    `/api/benchmark/aggregated?breed=${filters.breed}&region=${filters.region}&flock_size=${filters.flockSize}&period=${filters.period}`,
    fetcher,
    { refreshInterval: 600000, revalidateOnFocus: false }
  );

  // Handle filter apply - update URL params and re-fetch
  const handleApplySlidersHorizontals = useCallback((newSlidersHorizontals: BenchmarkSlidersHorizontals) => {
    setSlidersHorizontals(newSlidersHorizontals);
    const params = new URLSearchParams();
    Object.entries(newSlidersHorizontals).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    router.push(`/dashboard/metrics/benchmark?${params.toString()}`);
  }, [router]);

  // Handle filter reset
  const handleResetSlidersHorizontals = useCallback(() => {
    const defaultSlidersHorizontals: BenchmarkSlidersHorizontals = {
      farm: 'all',
      breed: 'all',
      region: 'all',
      flockSize: 'all',
      period: 'last_3_batches',
    };
    handleApplySlidersHorizontals(defaultSlidersHorizontals);
  }, [handleApplySlidersHorizontals]);

  // Persist filter selections in localStorage
  useEffect(() => {
    localStorage.setItem('benchmark_filters', JSON.stringify(filters));
  }, [filters]);

  // Load filter selections from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('benchmark_filters');
    if (saved) {
      try {
        const savedSlidersHorizontals = JSON.parse(saved);
        setSlidersHorizontals(savedSlidersHorizontals);
      } catch (e) {
        console.error('Error loading saved filters:', e);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Benchmark SlidersHorizontal Bar - Sticky on scroll */}
      <div className="sticky top-0 z-10 bg-white ring-1 ring-black/5 rounded-2xl p-4 shadow-sm">
        <BenchmarkFilterBar
          filters={filters}
          farms={farms}
          onApply={handleApplySlidersHorizontals}
          onReset={handleResetSlidersHorizontals}
        />
      </div>

      {/* Privacy Guard - Show if not enough data */}
      {benchmarkData && !benchmarkData.privacyMinimumMet && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Not enough data for this filter combination
              </h3>
              <p className="text-sm text-amber-800">
                Minimum 10 farms required to show benchmark data. Try broader filters (e.g., "All Breeds" instead of a specific breed).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {benchmarkData && benchmarkData.privacyMinimumMet && (
        <div className="text-sm text-neutral-600">
          Comparing to <span className="font-semibold">{benchmarkData.sampleCount}</span> batches from{' '}
          <span className="font-semibold">{benchmarkData.farmCount}</span> farms matching your filters
        </div>
      )}

      {/* Main Content Grid */}
      {benchmarkData && benchmarkData.privacyMinimumMet && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Your Performance Summary - Left Column (40%) */}
          <div className="lg:col-span-5">
            <YourPerformanceSummary
              metrics={userMetrics}
              filters={filters}
              farms={farms}
            />
          </div>

          {/* Benchmark Comparison Table - Right Column (60%) */}
          <div className="lg:col-span-7">
            <BenchmarkComparisonTable
              userMetrics={userMetrics}
              benchmarkData={benchmarkData}
            />
          </div>

          {/* Performance Radar Chart - Full Width */}
          <div className="lg:col-span-6">
            <BenchmarkRadarChart
              userMetrics={userMetrics}
              benchmarkData={benchmarkData}
            />
          </div>

          {/* Benchmark Insights - Full Width */}
          <div className="lg:col-span-6">
            <BenchmarkInsights
              userMetrics={userMetrics}
              benchmarkData={benchmarkData}
              filters={filters}
            />
          </div>

          {/* Breed Growth Curve Comparison - Full Width */}
          <div className="lg:col-span-12">
            <BreedGrowthCurveChart
              selectedBreed={filters.breed}
              userWeights={userMetrics}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {!benchmarkData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-500 text-sm">Loading benchmark data...</div>
        </div>
      )}
    </div>
  );
};

export default BenchmarkClient;
