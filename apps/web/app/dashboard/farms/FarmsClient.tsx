'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { FarmCardsGrid } from '@/components/farms/portfolio/FarmCardsGrid';
import { FarmMagnifyingGlassSlidersHorizontal, type FarmSlidersHorizontals } from '@/components/farms/portfolio/FarmMagnifyingGlassSlidersHorizontal';
import { PortfolioKPIBar } from '@/components/farms/portfolio/PortfolioKPIBar';
import { createClient } from '@/utils/supabase/client';
import { useEntitlements } from '@/lib/plans/useEntitlements';
import { canAccess, FEATURES } from '@/lib/plans/featureGates';
import { PlanUpgradePrompt } from '@/components/plans/PlanUpgradePrompt';

interface FarmsClientProps {
  initialFarms: Array<{
    id: string;
    name: string;
    location: string;
    type: 'Broiler' | 'Layer' | 'Breeder';
    maxBirds: number;
    status: 'active' | 'between_batches' | 'paused' | 'onboarding';
    currentBatch?: {
      batchNumber: number;
      dayNumber: number;
      targetDays: number;
      birdsAlive: number;
      birdsPlaced: number;
      mortalityPct: number;
      currentWeight: number;
      targetWeight: number;
      fcr: number;
      lastLogDate: string | null;
      lastLogTime: string | null;
    };
    whatsappConnected: boolean;
  }>;
  initialKpi: {
    totalBirds: number;
    portfolioFCR: number;
    portfolioMortality: number;
    totalFeed: number;
    activeFarms: number;
    activeBatches: number;
    pendingLogsCount: number;
  };
}

async function fetchFarms() {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.phone) {
    throw new Error('No session');
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', user.phone)
    .single();

  if (!customer?.id) {
    throw new Error('No customer');
  }

  const { data: farms, error: farmsError } = await supabase
    .from('farms')
    .select(`
      id,
      name,
      district,
      village,
      farm_type,
      total_capacity,
      whatsapp_enabled,
      active_batch:batches(
        id,
        batch_number,
        birds_placed,
        current_bird_count,
        placement_date,
        current_fcr,
        total_mortality_count,
        target_harvest_age,
        current_avg_weight_kg,
        target_harvest_weight_kg
      )
    `)
    .eq('integrator_id', customer.id)
    .order('name');

  if (farmsError) throw farmsError;

  // Transform farms data
  const transformedFarms = farms.map((farm: any) => ({
    id: farm.id,
    name: farm.name,
    location: `${farm.district}, ${farm.village}`,
    type: (farm.farm_type || 'Broiler') as 'Broiler' | 'Layer' | 'Breeder',
    maxBirds: farm.total_capacity || 15000,
    status: 'active' as const,
    whatsappConnected: farm.whatsapp_enabled || false,
    currentBatch: farm.active_batch && farm.active_batch.length > 0 ? {
      batchNumber: farm.active_batch[0].batch_number,
      dayNumber: farm.active_batch[0].placement_date ? Math.floor((Date.now() - new Date(farm.active_batch[0].placement_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      targetDays: farm.active_batch[0].target_harvest_age || 42,
      birdsAlive: farm.active_batch[0].current_bird_count ?? farm.active_batch[0].birds_placed ?? 0,
      birdsPlaced: farm.active_batch[0].birds_placed ?? 0,
      mortalityPct: (farm.active_batch[0].total_mortality_count / (farm.active_batch[0].birds_placed || 1)) * 100 || 0,
      currentWeight: farm.active_batch[0].current_avg_weight_kg || 0, // already in kg
      targetWeight: farm.active_batch[0].target_harvest_weight_kg || 2.1, // already in kg
      fcr: farm.active_batch[0].current_fcr || 0,
      lastLogDate: null,
      lastLogTime: null,
    } : undefined,
  }));

  // Calculate KPI
  let totalBirds = 0;
  let totalFCR = 0;
  let totalMortality = 0;
  let totalFeed = 0;
  let activeBatchCount = 0;
  let pendingLogsCount = 0;

  const today = new Date().toISOString().split('T')[0];

  transformedFarms.forEach((farm: any) => {
    if (farm.activeBatch) {
      totalBirds += farm.activeBatch.birdsAlive || 0;
      totalFCR += farm.activeBatch.fcr || 0;
      totalMortality += farm.activeBatch.mortality || 0;
      totalFeed += (farm.activeBatch.feed_consumed_kg || 0) / 1000; // Convert to MT
      activeBatchCount++;
      
      // Check if log is pending for today
      const lastLogDate = farm.activeBatch.lastLogDate ? farm.activeBatch.lastLogDate.split('T')[0] : null;
      if (!lastLogDate || lastLogDate < today) {
        pendingLogsCount++;
      }
    }
  });

  const kpi = {
    totalBirds,
    portfolioFCR: activeBatchCount > 0 ? totalFCR / activeBatchCount : 0,
    portfolioMortality: activeBatchCount > 0 ? totalMortality / activeBatchCount : 0,
    totalFeed,
    activeFarms: transformedFarms.length,
    activeBatches: activeBatchCount,
    pendingLogsCount,
  };

  return { farms: transformedFarms, kpi };
}

const FarmsClient = function FarmsClient({ initialFarms, initialKpi }: FarmsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { entitlements } = useEntitlements();
  const [filters, setSlidersHorizontals] = useState<FarmSlidersHorizontals>({
    search: '',
    status: 'all',
    sortBy: 'name',
  });
  const [showPendingLogsOnly, setShowPendingLogsOnly] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // ── Feature access check for farm management ───────────────────────────────────
  const farmAccess = canAccess(entitlements, FEATURES.FARM_MANAGEMENT);

  // Check URL params for pending logs filter
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'pending-logs') {
      setShowPendingLogsOnly(true);
      // Clear the URL param after setting the state
      const url = new URL(window.location.href);
      url.searchParams.delete('filter');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams]);

  // SWR for data refreshing - optimized refresh interval
  const { data, error, isLoading } = useSWR('farms-data', fetchFarms, {
    refreshInterval: 600000, // 10 minutes
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    fallbackData: { farms: initialFarms, kpi: initialKpi } as any,
    onSuccess: () => {
      setLastUpdated(new Date());
    },
  });

  // ── Farm limit check (after data is available) ───────────────────────────────────
  const currentFarmCount = data?.farms?.length || initialFarms.length;
  const hasReachedFarmLimit = !farmAccess.hasAccess || 
    (farmAccess.limitValue && currentFarmCount >= farmAccess.limitValue);

  // SlidersHorizontal and sort farms - memoized to prevent recalculation
  const filteredAndSortedFarms = useMemo(() => {
    const farms = data?.farms || initialFarms;
    const today = new Date().toISOString().split('T')[0];
    
    return farms
      .filter((farm) => {
        // Pending logs filter
        if (showPendingLogsOnly) {
          const lastLogDate = farm.currentBatch?.lastLogDate ? farm.currentBatch.lastLogDate.split('T')[0] : null;
          if (!lastLogDate || lastLogDate >= today) {
            return false;
          }
        }
        
        // Status filter
        if (filters.status !== 'all' && farm.status !== filters.status) {
          return false;
        }
        // MagnifyingGlass filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            farm.name.toLowerCase().includes(searchLower) ||
            farm.location.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'fcr':
            const fcrA = a.currentBatch?.fcr || Infinity;
            const fcrB = b.currentBatch?.fcr || Infinity;
            return fcrA - fcrB;
          case 'mortality':
            const mortA = a.currentBatch?.mortalityPct || Infinity;
            const mortB = b.currentBatch?.mortalityPct || Infinity;
            return mortA - mortB;
          case 'birdCount':
            const birdsA = a.currentBatch?.birdsAlive || 0;
            const birdsB = b.currentBatch?.birdsAlive || 0;
            return birdsB - birdsA;
          case 'lastLog':
            const dateA = a.currentBatch?.lastLogDate ? new Date(a.currentBatch.lastLogDate).getTime() : 0;
            const dateB = b.currentBatch?.lastLogDate ? new Date(b.currentBatch.lastLogDate).getTime() : 0;
            return dateB - dateA;
          default:
            return 0;
        }
      });
  }, [data?.farms, initialFarms, filters, showPendingLogsOnly]);

  const handleSlidersHorizontalChange = useCallback((newSlidersHorizontals: FarmSlidersHorizontals) => {
    setSlidersHorizontals(newSlidersHorizontals);
  }, []);

  const handlePendingLogsToggle = useCallback(() => {
    setShowPendingLogsOnly(prev => !prev);
    // Clear URL filter parameter when clearing the filter
    const url = new URL(window.location.href);
    url.searchParams.delete('filter');
    window.history.replaceState({}, '', url);
  }, []);

  const handlePendingLogsClick = useCallback(() => {
    setShowPendingLogsOnly(true);
  }, []);

  return (
    <>
      {/* KPI Bar */}
      {data?.kpi && data.kpi.activeBatches > 0 && (
        <PortfolioKPIBar
          totalBirds={data.kpi.totalBirds}
          portfolioFCR={data.kpi.portfolioFCR}
          portfolioMortality={data.kpi.portfolioMortality}
          totalFeed={data.kpi.totalFeed}
          pendingLogsCount={data.kpi.pendingLogsCount}
          onPendingLogsClick={handlePendingLogsClick}
          lastUpdated={lastUpdated}
        />
      )}
      
      <FarmMagnifyingGlassSlidersHorizontal onSlidersHorizontalChange={handleSlidersHorizontalChange} />
      {showPendingLogsOnly && (
        <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <span className="text-sm text-amber-800 font-medium">
            Showing farms with pending logs only
          </span>
          <button
            onClick={handlePendingLogsToggle}
            className="text-sm text-amber-600 hover:text-amber-800 font-medium"
          >
            Clear filter
          </button>
        </div>
      )}
      <FarmCardsGrid farms={filteredAndSortedFarms} />
    </>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(FarmsClient);
