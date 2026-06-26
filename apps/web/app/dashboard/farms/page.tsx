// Farm Portfolio Page - FF-02
// Reference: 15_integrator_farms_tasks_master.md, 14_integrator_farms_design_master.md
//
// This page displays:
// - Portfolio KPI bar (total birds, portfolio FCR, mortality, feed consumed)
// - Farm search and filter controls
// - Grid of farm cards with active batch information
// - Empty state when no farms exist
//
// Server-side rendered with SWR for client-side data refreshing

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { calculatePortfolioKPI, type PortfolioBatchData } from '@/lib/fcrCalculator';
import { FarmEmptyState } from '@/components/farms/FarmEmptyState';
import FarmsClient from './FarmsClient';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { PlanUpgradePrompt } from '@/components/plans/PlanUpgradePrompt';
import { FEATURES } from '@/lib/plans/featureGates';

async function getFarmData(integratorId: string) {


  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not configured properly');
    return { farms: [], kpi: { totalBirds: 0, portfolioFCR: 0, portfolioMortality: 0, totalFeed: 0, activeFarms: 0, activeBatches: 0, pendingLogsCount: 0 } };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Fetch farms with their active batches
  const { data: farms, error } = await supabase
    .from('farms')
    .select(`
      id,
      name,
      district,
      village,
      farm_type,
      max_birds,
      whatsapp_connected,
      active_batch:batches(
        id,
        batch_number,
        birds_placed,
        birds_alive,
        placement_date,
        fcr,
        mortality_pct,
        last_log_date,
        last_log_time,
        target_days,
        current_weight,
        target_weight,
        feed_consumed_kg
      )
    `)
    .eq('integrator_id', integratorId)
    .order('name');

  if (error) {
    console.error('Error fetching farms:', error);
    return { farms: [], kpi: null };
  }

  // Calculate KPI metrics
  let totalFeed = 0;
  let pendingLogsCount = 0;
  const today = new Date().toISOString().split('T')[0];

  // Extract batch data for portfolio KPI calculation
  const portfolioBatches: PortfolioBatchData[] = [];
  let activeBatchCount = 0;

  farms.forEach((farm: any) => {
    if (farm.active_batch && farm.active_batch.length > 0) {
      const batch = farm.active_batch[0];
      totalFeed += (batch.feed_consumed_kg || 0) / 1000; // Convert to MT
      activeBatchCount++;

      // Add batch data for portfolio calculation
      portfolioBatches.push({
        feed_consumed_kg: batch.feed_consumed_kg || 0,
        avg_weight_kg: (batch.current_weight || 0) / 1000, // Convert grams to kg
        doc_weight_kg: 0.04, // Standard day-old chick weight in kg (approx 40g)
        birds_alive: batch.birds_alive || 0,
        birds_placed: batch.birds_placed || 0,
      });

      // Check if log is pending for today
      const lastLogDate = batch.last_log_date ? batch.last_log_date.split('T')[0] : null;
      if (!lastLogDate || lastLogDate < today) {
        pendingLogsCount++;
      }
    }
  });

  // Calculate Portfolio KPI using weighted average formula
  const portfolioKPI = calculatePortfolioKPI(portfolioBatches);

  const kpi = {
    totalBirds: portfolioKPI.totalBirds,
    portfolioFCR: portfolioKPI.portfolioFCR,
    portfolioMortality: portfolioKPI.portfolioMortality,
    totalFeed,
    activeFarms: farms.length,
    activeBatches: activeBatchCount,
    pendingLogsCount,
  };

  return { farms, kpi: kpi };
}

async function getIntegratorId() {

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not configured properly');
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.phone) {
    return null;
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', user.phone)
    .single();

  return customer?.id || null;
}

export default async function FarmsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; sortBy?: string }>;
}) {
  const resolvedMagnifyingGlassParams = await searchParams;
  const integratorId = await getIntegratorId();
  
  if (!integratorId) {
    // If integratorId lookup fails, show empty state instead of redirecting to login
    // This prevents unnecessary login redirects when customer data is temporarily unavailable
    console.warn('Integrator ID lookup failed, showing empty state');
  }

  const { farms, kpi } = await getFarmData(integratorId);

  // Transform farms data to match component interface
  const transformedFarms = farms.map((farm: any) => ({
    id: farm.id,
    name: farm.name,
    location: `${farm.district}, ${farm.village}`,
    type: (farm.farm_type || 'Broiler') as 'Broiler' | 'Layer' | 'Breeder',
    maxBirds: farm.max_birds || 15000,
    status: 'active' as const, // Hardcode or derive from batches
    whatsappConnected: farm.whatsapp_connected || false,
    currentBatch: farm.active_batch && farm.active_batch.length > 0 ? {
      batchNumber: farm.active_batch[0].batch_number,
      dayNumber: farm.active_batch[0].placement_date ? Math.floor((Date.now() - new Date(farm.active_batch[0].placement_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      targetDays: farm.active_batch[0].target_days || 42,
      birdsAlive: farm.active_batch[0].birds_alive,
      birdsPlaced: farm.active_batch[0].birds_placed,
      mortalityPct: farm.active_batch[0].mortality_pct || 0,
      currentWeight: (farm.active_batch[0].current_weight || 0) / 1000, // Convert grams to kg
      targetWeight: (farm.active_batch[0].target_weight || 2100) / 1000, // Convert grams to kg
      fcr: farm.active_batch[0].fcr || 0,
      lastLogDate: farm.active_batch[0].last_log_date,
      lastLogTime: farm.active_batch[0].last_log_time || null,
    } : undefined,
  }));

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Farms</h1>
          <p className="text-sm text-gray-600 mt-1">
            {kpi?.activeFarms || 0} farms · {kpi?.activeBatches || 0} active batches · {(kpi?.totalBirds || 0).toLocaleString('en-IN')} total birds under management
          </p>
        </div>
        <LanguageToggle />
      </div>


      {/* Farm Cards Grid or Empty State */}
      {transformedFarms.length === 0 ? (
        <FarmEmptyState
          variant="no_farms"
          ctaHref="/dashboard/farms/new"
        />
      ) : (
        <FarmsClient
          initialFarms={transformedFarms}
          initialKpi={kpi || {
            totalBirds: 0,
            portfolioFCR: 0,
            portfolioMortality: 0,
            totalFeed: 0,
            activeFarms: 0,
            activeBatches: 0,
            pendingLogsCount: 0,
          }}
        />
      )}
    </div>
  );
}
