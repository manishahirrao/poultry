// Portfolio Metrics Dashboard - FM-01
// Reference: 15_integrator_farms_tasks_master.md, 14_integrator_farms_design_master.md
//
// This page displays:
// - Portfolio-wide KPI bar (total birds, weighted FCR, mortality, feed, estimated revenue)
// - Period selector (7d, 30d, 90d, batch)
// - FCR trend chart with portfolio and industry averages
// - Mortality events timeline
// - Farm performance ranking table
// - Pending actions panel (missing logs, overdue vaccinations, low feed stock)
//
// Server-side rendered with SWR for client-side data refreshing

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PortfolioKPIBar } from '@/components/farms/portfolio/PortfolioKPIBar';
import { FarmEmptyState } from '@/components/farms/FarmEmptyState';
import MetricsClient from './MetricsClient';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { PortfolioGCOverview } from '@/components/gc/PortfolioGCOverview';
import { PlanUpgradePrompt } from '@/components/plans/PlanUpgradePrompt';
import { FEATURES } from '@/lib/plans/featureGates';
import { FeatureGate } from '@/components/plans/FeatureGate';

async function getMetricsData(integratorId: string) {

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not configured properly');
    return { farms: [], kpi: null };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      status,
      active_batch:batches(
        id,
        batch_number,
        birds_placed,
        birds_alive,
        placement_date,
        fcr,
        mortality_pct,
        last_log_date,
        feed_consumed_kg
      )
    `)
    .eq('integrator_id', integratorId)
    .order('name');

  if (error) {
    console.error('Error fetching farms:', error);
    return { farms: [], kpi: null };
  }

  // Calculate KPI metrics (weighted average for FCR)
  let totalBirds = 0;
  let weightedFCRSum = 0;
  let totalMortality = 0;
  let totalFeed = 0;
  let activeBatchCount = 0;
  let estimatedRevenue = 0;
  let pendingLogsCount = 0;

  const today = new Date().toISOString().split('T')[0];

  farms.forEach((farm: any) => {
    if (farm.active_batch && farm.active_batch.length > 0) {
      const batch = farm.active_batch[0];
      const birdsAlive = batch.birds_alive || 0;
      totalBirds += birdsAlive;
      weightedFCRSum += (batch.fcr || 0) * birdsAlive; // Weight by bird count
      totalMortality += batch.mortality_pct || 0;
      totalFeed += (batch.feed_consumed_kg || 0) / 1000; // Convert to MT
      activeBatchCount++;
      // Revenue estimation using predictions table would be in production
      estimatedRevenue += birdsAlive * 2.1 * 150; // weight * price placeholder
      
      // Check if log is pending for today
      const lastLogDate = batch.last_log_date ? batch.last_log_date.split('T')[0] : null;
      if (!lastLogDate || lastLogDate < today) {
        pendingLogsCount++;
      }
    }
  });

  const kpi = {
    totalBirds,
    portfolioFCR: totalBirds > 0 ? weightedFCRSum / totalBirds : 0, // Weighted average
    portfolioMortality: activeBatchCount > 0 ? totalMortality / activeBatchCount : 0,
    totalFeed,
    estimatedRevenue,
    activeFarms: farms.length,
    activeBatches: activeBatchCount,
    pendingLogsCount,
  };

  return { farms, kpi };
}

async function getIntegratorId() {


  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not configured properly');
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

export default async function MetricsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const integratorId = await getIntegratorId();
  
  if (!integratorId) {
    // If integratorId lookup fails, show empty state instead of redirecting to login
    console.warn('Integrator ID lookup failed, showing empty state');
  }

  const { farms, kpi } = await getMetricsData(integratorId);
  const resolvedMagnifyingGlassParams = await searchParams;
  const period = resolvedMagnifyingGlassParams.period || '30d';

  // Transform farms data for client component
  const transformedFarms = farms.map((farm: any) => ({
    id: farm.id,
    name: farm.name,
    district: farm.district,
    status: farm.status,
    activeBatch: farm.active_batch && farm.active_batch.length > 0 ? {
      id: farm.active_batch[0].id,
      batchNumber: farm.active_batch[0].batch_number,
      birdsPlaced: farm.active_batch[0].birds_placed,
      birdsAlive: farm.active_batch[0].birds_alive,
      placementDate: farm.active_batch[0].placement_date,
      fcr: farm.active_batch[0].fcr,
      mortality: farm.active_batch[0].mortality_pct,
      lastLogDate: farm.active_batch[0].last_log_date,
      feedConsumedKg: farm.active_batch[0].feed_consumed_kg,
    } : undefined,
  }));

  const customCubicBezier = [0.32, 0.72, 0, 1] as const;

  return (
    <FeatureGate feature={FEATURES.PORTFOLIO_METRICS}>
      <div className="p-6 md:p-8 lg:p-12">
        {/* Page Header */}
        <div className="mb-8 md:mb-12 flex justify-between items-start">
          <div>
            <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
              Dashboard
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Portfolio Metrics</h1>
            <p className="text-base text-neutral-600 mt-2">
              {kpi?.activeFarms || 0} farms · {kpi?.activeBatches || 0} active batches · Period: {period === '30d' ? 'Last 30 Days' : period === '7d' ? 'This Week' : period === '90d' ? 'Last 90 Days' : 'Custom'}
            </p>
          </div>
          <LanguageToggle />
        </div>

        {/* KPI Cards */}
        {kpi && kpi.activeBatches > 0 ? (
          <>
            <PortfolioKPIBar
              totalBirds={kpi.totalBirds}
              portfolioFCR={kpi.portfolioFCR}
              portfolioMortality={kpi.portfolioMortality}
              totalFeed={kpi.totalFeed}
              pendingLogsCount={kpi.pendingLogsCount}
            />

            {/* Portfolio GC Overview Section */}
            <div className="mb-8">
              <PortfolioGCOverview />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Double-Bezel Architecture for empty state cards */}
            <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
              <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] p-4">
                <p className="text-sm font-semibold text-neutral-600">Total Birds</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">—</p>
              </div>
            </div>
            <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
              <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] p-4">
                <p className="text-sm font-semibold text-neutral-600">Portfolio FCR</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">—</p>
              </div>
            </div>
            <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
              <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] p-4">
                <p className="text-sm font-semibold text-neutral-600">Portfolio Mortality</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">—</p>
              </div>
            </div>
            <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
              <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] p-4">
                <p className="text-sm font-semibold text-neutral-600">Total Feed Consumed</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">—</p>
              </div>
            </div>
            <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
              <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] p-4">
                <p className="text-sm font-semibold text-neutral-600">Est. Revenue at Harvest</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">—</p>
              </div>
            </div>
          </div>
        )}

        {/* Client Component for Charts and Tables */}
        {farms.length > 0 ? (
          <MetricsClient 
            farms={transformedFarms}
            integratorId={integratorId}
            initialPeriod={period}
          />
        ) : null}

        {/* Empty State */}
        {farms.length === 0 && (
          <FarmEmptyState
            variant="no_farms"
            ctaHref="/dashboard/farms/new"
          />
        )}
      </div>
    </FeatureGate>
  );
}
