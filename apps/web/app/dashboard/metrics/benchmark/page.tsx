// Flock Benchmark Page - GAP5-UI-001
// Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md, FlockIQ_Gap_Remediation_Requirements_v1.md
//
// This page displays:
// - Benchmark filters (My Farm/Portfolio, Breed, Region, Flock Size, Period)
// - Your Performance Summary (4 KPI cards: FCR, Mortality %, ADG, Gross Margin %)
// - Benchmark Comparison Table
// - Performance Radar Chart
// - Benchmark Insights (AI-generated)
// - Breed Growth Curve Comparison
//
// Server-side rendered with client-side components for interactivity

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FarmEmptyState } from '@/components/farms/FarmEmptyState';
import BenchmarkClient from './BenchmarkClient';
import LanguageToggle from '@/components/ui/LanguageToggle';

async function getBenchmarkData(integratorId: string) {


  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not configured properly');
    return { farms: [], hasCompletedBatches: false };
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

  // Fetch farms with their completed batches
  const { data: farms, error } = await supabase
    .from('farms')
    .select(`
      id,
      name,
      district,
      status,
      batches(
        id,
        breed,
        birds_placed,
        status,
        placement_date,
        harvest_date
      )
    `)
    .eq('integrator_id', integratorId)
    .order('name');

  if (error) {
    console.error('Error fetching farms:', error);
    return { farms: [], hasCompletedBatches: false };
  }

  // Check if user has at least one completed batch
  const hasCompletedBatches = farms.some((farm: any) => 
    farm.batches && farm.batches.some((batch: any) => batch.status === 'harvested')
  );

  // Transform farms data
  const transformedFarms = farms.map((farm: any) => ({
    id: farm.id,
    name: farm.name,
    district: farm.district,
    status: farm.status,
    breed: farm.batches && farm.batches.length > 0 ? farm.batches[0].breed : null,
    flockSize: farm.batches && farm.batches.length > 0 ? farm.batches[0].birds_placed : 0,
  }));

  return { farms: transformedFarms, hasCompletedBatches };
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

export default async function BenchmarkPage({
  searchParams,
}: {
  searchParams: Promise<{
    farm?: string;
    breed?: string;
    region?: string;
    flockSize?: string;
    period?: string;
  }>;
}) {
  const integratorId = await getIntegratorId();
  
  if (!integratorId) {
    // If integratorId lookup fails, show empty state instead of redirecting to login
    console.warn('Integrator ID lookup failed, showing empty state');
  }

  const { farms, hasCompletedBatches } = await getBenchmarkData(integratorId);
  const resolvedMagnifyingGlassParams = await searchParams;

  // Transform farms data for client component
  const transformedFarms = farms.map((farm: any) => ({
    id: farm.id,
    name: farm.name,
    district: farm.district,
    status: farm.status,
    breed: farm.breed,
    flockSize: farm.flockSize,
  }));

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12 flex justify-between items-start">
        <div>
          <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
            Analytics
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
            Flock Benchmark
          </h1>
          <p className="text-base text-neutral-600 mt-2">
            झुंड की तुलना
          </p>
        </div>
        <LanguageToggle />
      </div>

      {/* Empty State - No completed batches */}
      {!hasCompletedBatches && (
        <FarmEmptyState
          variant="no_data"
          heading="No Completed Batches"
          sub="Benchmark comparison requires at least one harvested batch to compare performance against industry standards."
          ctaText="Go to My Farms"
          ctaHref="/dashboard/farms"
        />
      )}

      {/* Client Component for Benchmark */}
      {hasCompletedBatches && (
        <BenchmarkClient 
          farms={transformedFarms}
          integratorId={integratorId}
          initialSlidersHorizontals={{
            farm: resolvedMagnifyingGlassParams.farm || 'all',
            breed: resolvedMagnifyingGlassParams.breed || 'all',
            region: resolvedMagnifyingGlassParams.region || 'all',
            flockSize: resolvedMagnifyingGlassParams.flockSize || 'all',
            period: resolvedMagnifyingGlassParams.period || 'last_3_batches',
          }}
        />
      )}
    </div>
  );
}
