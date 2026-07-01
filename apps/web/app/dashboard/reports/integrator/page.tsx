import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { BatchSummarySection } from '@/components/reports/BatchSummarySection';
import { GrowthPerformanceSection } from '@/components/reports/GrowthPerformanceSection';
import { MortalityAnalysisSection } from '@/components/reports/MortalityAnalysisSection';
import { FeedSummarySection } from '@/components/reports/FeedSummarySection';
import { HealthLogSummarySection } from '@/components/reports/HealthLogSummarySection';
import { FinancialSummarySection } from '@/components/reports/FinancialSummarySection';
import { RecommendationsSection } from '@/components/reports/RecommendationsSection';
import { Download, Printer } from '@phosphor-icons/react';
import { ReportActions } from '@/components/reports/ReportActions';

interface PageProps {
  searchParams: Promise<{ batchId?: string; print?: string }>;
}

async function getBatchReportData(batchId: string, integratorId: string) {
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

  // Fetch batch with farm, daily logs, vaccinations, feed purchases
  const { data: batch, error } = await supabase
    .from('batches')
    .select(`
      *,
      farm:farms (
        id,
        name,
        district,
        village,
        state,
        farm_type,
        total_capacity
      ),
      daily_logs (
        id,
        log_date,
        deaths_today,
        death_cause,
        feed_consumed_kg,
        feed_type,
        sample_birds,
        sample_weight_kg,
        water_litres,
        temp_min_c,
        temp_max_c,
        humidity_pct,
        health_issue,
        health_symptoms,
        health_severity,
        health_notes,
        notes
      ),
      vaccinations (
        id,
        vaccine_name,
        vaccine_type,
        scheduled_day,
        administered_date,
        status,
        notes
      ),
      feed_purchases (
        id,
        purchase_date,
        feed_type,
        quantity_kg,
        rate_per_kg,
        total_cost,
        supplier
      )
    `)
    .eq('id', batchId)
    .single();

  if (error || !batch) {
    console.error('Error fetching batch:', error);
    return null;
  }

  // RLS check: verify integrator owns this farm
  if (batch.farm && batch.farm.id) {
    const { data: farmCheck } = await supabase
      .from('farms')
      .select('integrator_id')
      .eq('id', batch.farm.id)
      .single();

    if (farmCheck?.integrator_id !== integratorId) {
      return null; // Return null to trigger 404
    }
  }

  // Fetch P50 price for financial summary
  const { data: pricePrediction } = await supabase
    .from('predictions')
    .select('p50')
    .eq('mandi', batch.farm?.district || '')
    .eq('date', new Date().toISOString().split('T')[0])
    .single();

  return {
    batch,
    pricePrediction: pricePrediction?.p50 || null,
  };
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
    .select('id, role')
    .eq('phone', user.phone)
    .single();

  return customer?.id || null;
}

export default async function BatchReportPage({ searchParams }: PageProps) {
  const integratorId = await getIntegratorId();
  
  if (!integratorId) {
    // If integratorId lookup fails, show empty state instead of redirecting to login
    console.warn('Integrator ID lookup failed, showing empty state');
  }

  const resolvedMagnifyingGlassParams = await searchParams;
  const batchId = resolvedMagnifyingGlassParams.batchId;
  if (!batchId) {
    redirect('/dashboard/farms');
  }

  const reportData = await getBatchReportData(batchId, integratorId);

  if (!reportData) {
    notFound();
  }

  const { batch, pricePrediction } = reportData;
  const isPrintMode = resolvedMagnifyingGlassParams.print === 'true';
  const isDataLocked = batch.status === 'closed';

  // Calculate derived metrics
  const totalBirdsPlaced = batch.birds_placed || 0;
  const totalBirdsHarvested = batch.birds_harvested || batch.current_bird_count || totalBirdsPlaced;
  const totalDeaths = batch.total_mortality_count || 0;
  const mortalityPct = totalBirdsPlaced > 0 ? (totalDeaths / totalBirdsPlaced) * 100 : 0;
  
  const dailyLogs = batch.daily_logs || [];
  const totalFeedConsumed = dailyLogs.reduce((sum: number, log: any) => sum + (log.feed_consumed_kg || 0), 0);
  const avgWeight = (batch.current_avg_weight_kg * 1000) || 0; // Convert kg to g for this variable since it expects g
  
  const durationDays = batch.placement_date
    ? Math.floor((new Date().getTime() - new Date(batch.placement_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const feedPurchases = batch.feed_purchases || [];
  const totalFeedCost = feedPurchases.reduce((sum: number, purchase: any) => sum + (purchase.total_cost || 0), 0);
  const docCost = (batch.doc_price_per_bird || 0) * totalBirdsPlaced;
  const totalCost = totalFeedCost + docCost;
  
  const estimatedRevenue = pricePrediction && totalBirdsHarvested > 0 && avgWeight > 0
    ? (totalBirdsHarvested * (avgWeight / 1000) * pricePrediction)
    : 0;
  
  const grossProfit = estimatedRevenue - totalCost;

  return (
    <div className={isPrintMode ? 'print-mode' : ''}>
      {!isPrintMode && (
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Batch Report — {batch.farm?.name} Batch #{batch.batch_number}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Generated on {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
          <ReportActions
            batchId={batchId}
            farmName={batch.farm?.name || 'Unknown Farm'}
            batchNumber={batch.batch_number}
          />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Section 1: Batch Summary */}
        <BatchSummarySection
          farm={batch.farm}
          batch={batch}
          totalBirdsPlaced={totalBirdsPlaced}
          totalBirdsHarvested={totalBirdsHarvested}
          totalDeaths={totalDeaths}
          mortalityPct={mortalityPct}
          durationDays={durationDays}
          isDataLocked={isDataLocked}
        />

        {/* Section 2: Growth Performance */}
        <GrowthPerformanceSection
          batch={batch}
          dailyLogs={dailyLogs}
          avgWeight={avgWeight}
          durationDays={durationDays}
          isDataLocked={isDataLocked}
        />

        {/* Section 3: Mortality Analysis */}
        <MortalityAnalysisSection
          dailyLogs={dailyLogs}
          totalDeaths={totalDeaths}
          mortalityPct={mortalityPct}
          durationDays={durationDays}
          isDataLocked={isDataLocked}
        />

        {/* Section 4: Feed Summary */}
        <FeedSummarySection
          dailyLogs={dailyLogs}
          feedPurchases={feedPurchases}
          totalFeedConsumed={totalFeedConsumed}
          totalFeedCost={totalFeedCost}
          totalBirdsHarvested={totalBirdsHarvested}
          isDataLocked={isDataLocked}
        />

        {/* Section 5: Health Log Summary */}
        <HealthLogSummarySection
          vaccinations={batch.vaccinations || []}
          dailyLogs={dailyLogs}
          isDataLocked={isDataLocked}
        />

        {/* Section 6: Financial Summary */}
        <FinancialSummarySection
          estimatedRevenue={estimatedRevenue}
          totalFeedCost={totalFeedCost}
          docCost={docCost}
          totalCost={totalCost}
          grossProfit={grossProfit}
          pricePrediction={pricePrediction}
          totalBirdsHarvested={totalBirdsHarvested}
          avgWeight={avgWeight}
          isDataLocked={isDataLocked}
        />

        {/* Section 7: Recommendations for Next Batch */}
        <RecommendationsSection
          batch={batch}
          dailyLogs={dailyLogs}
          mortalityPct={mortalityPct}
          avgWeight={avgWeight}
          totalFeedConsumed={totalFeedConsumed}
          isDataLocked={isDataLocked}
        />
      </div>
    </div>
  );
}
