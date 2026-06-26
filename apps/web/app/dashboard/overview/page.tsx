import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getLatestPredictions, getAccuracyMetrics, getActiveAlerts, getPredictionHistory } from '@/utils/supabase/dashboard';
import { ChartLineUp, BellRinging, Plant, ShieldCheck, TrendUp, TrendDown, CalendarCheck, Storefront, Warning } from '@phosphor-icons/react/dist/ssr';
import { formatDistanceToNow } from 'date-fns';
import { hi } from 'date-fns/locale';
import { calculatePortfolioKPI, type PortfolioBatchData } from '@/lib/fcrCalculator';
import { PriceSignalHero } from '@/components/dashboard/PriceSignalHero';
import { AccuracyTrustCard } from '@/components/dashboard/AccuracyTrustCard';
import { KpiCardRow } from '@/components/dashboard/KpiCardRow';
import { PriceTrajectoryChart } from '@/components/charts/PriceTrajectoryChart';
import { AlertsFeed } from '@/components/dashboard/overview/AlertsFeed';
import { MandiPriceTable } from '@/components/dashboard/overview/MandiPriceTable';
import { DistrictMap } from '@/components/dashboard/overview/DistrictMap';
import { MetricCardsSkeleton, ChartSkeleton, AlertCardsSkeleton, TableSkeleton } from '@/components/dashboard/skeletons';
import { PortfolioKPIBar } from '@/components/farms/portfolio/PortfolioKPIBar';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { QuickActionsCard, RecentActivityCard, SystemStatusCard, MarketInsightsCard } from '@/components/dashboard/overview/OverviewCards';
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay';

export const revalidate = 600; // ISR: revalidate every 10 minutes

export const metadata: Metadata = {
  title: 'Dashboard Overview — FlockIQ',
  description: 'Real-time poultry price intelligence dashboard. View predictions, accuracy metrics, active alerts, and district coverage for Gorakhpur belt.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OverviewPage() {
  const supabase = await createClient();
  if (!supabase) {
    redirect('/login?redirect=/dashboard/overview');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?redirect=/dashboard/overview');
  }

  const { data } = await supabase
    .from('customers')
    .select('id, name, district, subscription_tier, subscription_status, subscription_end_date, poultry_type')
    .eq('id', user.id)
    .single();

  if (!data) redirect('/login');
  // Map real columns to the shape the UI expects
  const customer = {
    ...data,
    role: 'user',
    segment: 'S2',
    plan: data.subscription_tier ?? 'FLOCKIQ_PRO',
    subscription_expires_at: data.subscription_end_date
      ? new Date(data.subscription_end_date).toISOString()
      : new Date(Date.now() + 365 * 86400000).toISOString(),
  };
  const district = (customer as any)?.district ?? 'gorakhpur';

  // Parallel data fetch (functions handle demo mode internally)
  // Phase 1: ML endpoints disabled.
  const [alerts] = await Promise.allSettled([
    getActiveAlerts(district),
  ]);

  const predictionsData = [
    { id: 'mock1', mandi: district, p50: 165, p10: 155, p90: 175, sell_signal: 'HOLD', predicted_at: new Date().toISOString(), actual_price: null, confidence: 85, drivers: ['Testing'] }
  ];
  const accuracyData = {
    directional_accuracy_30d: 92.5,
    mape_30d: 3.2,
    conformal_coverage_30d: 88,
    prediction_count_30d: 420,
    last_updated: new Date().toISOString()
  };
  const alertsData = alerts.status === 'fulfilled' ? alerts.value : [];
  const historyData: any[] = [];

  // Gorakhpur prediction for primary KPI card
  const primaryPrediction = predictionsData.find(p => p.mandi === district)
    ?? predictionsData[0]
    ?? null;

  // Fetch active batches for portfolio KPI calculation
  let activeBatches: PortfolioBatchData[] = [];
  if (supabase) {
    const { data } = await supabase
      .from('batches')
      .select('id, feed_consumed_kg, avg_weight_kg, doc_weight_kg, birds_alive, birds_placed, status')
      .in('status', ['active', 'harvested'])
      .is('deleted_at', null);
    
    if (data) {
      // Fetch batch sales for harvested batches
      const batchIds = data.filter((b: { status: string }) => b.status === 'harvested').map((b: { id: string }) => b.id);
      let batchSalesMap: Record<string, number> = {};
      
      if (batchIds.length > 0) {
        const { data: salesData } = await supabase
          .from('batch_sales')
          .select('batch_id, net_revenue')
          .in('batch_id', batchIds)
          .is('deleted_at', null);
        
        if (salesData) {
          batchSalesMap = salesData.reduce((acc: Record<string, number>, sale: { batch_id: string; net_revenue: number }) => {
            acc[sale.batch_id] = (acc[sale.batch_id] || 0) + (sale.net_revenue || 0);
            return acc;
          }, {} as Record<string, number>);
        }
      }
      
      activeBatches = data.map((batch: { 
        feed_consumed_kg?: number; 
        avg_weight_kg?: number; 
        doc_weight_kg?: number; 
        birds_alive?: number; 
        birds_placed?: number; 
        status: string; 
        id: string;
      }) => ({
        feed_consumed_kg: batch.feed_consumed_kg || 0,
        avg_weight_kg: batch.avg_weight_kg || 0,
        doc_weight_kg: batch.doc_weight_kg || 0.04,
        birds_alive: batch.birds_alive || 0,
        birds_placed: batch.birds_placed || 0,
        status: batch.status as 'active' | 'harvested' | 'closed',
        total_revenue: batchSalesMap[batch.id] || 0,
      }));
    }
  }

  // Calculate Portfolio KPI using weighted average formula
  const portfolioKPI = calculatePortfolioKPI(activeBatches);
  const portfolioFCR = portfolioKPI.portfolioFCR;
  const portfolioMortality = portfolioKPI.portfolioMortality;
  
  // Calculate projected revenue for active batches using current price
  const currentPrice = primaryPrediction?.p50 || 164; // Default to ₹164/kg if no prediction
  let projectedRevenue = 0;
  
  for (const batch of activeBatches) {
    if (batch.status === 'active') {
      // Projected revenue for active batches: birds_alive * avg_weight_kg * current_price
      const batchProjectedRevenue = (batch.birds_alive || 0) * (batch.avg_weight_kg || 0) * currentPrice;
      projectedRevenue += batchProjectedRevenue;
    }
  }
  
  // Total revenue = harvested batch revenue + projected revenue for active batches
  const totalRevenue = portfolioKPI.totalRevenue + projectedRevenue;

  // Calculate farm KPI from real data
  const farmKPI = {
    totalBirds: portfolioKPI.totalBirds,
    portfolioFCR: portfolioFCR,
    portfolioMortality: portfolioMortality,
    totalFeed: portfolioKPI.totalFeedKg / 1000, // Convert to MT
    totalRevenue: totalRevenue,
    totalBirdsTrend: 0, // TODO: Calculate from historical data
    portfolioFCRTrend: 0, // TODO: Calculate from historical data
    portfolioMortalityTrend: 0, // TODO: Calculate from historical data
    totalFeedTrend: 0, // TODO: Calculate from historical data
    totalRevenueTrend: 0, // TODO: Calculate from historical data
  };

  // Calculate GC KPI from real data (GC = Feed Conversion, same as FCR)
  const gcKPI = {
    value: portfolioFCR > 0 ? (1 / portfolioFCR) * 100 : 0, // Convert FCR to GC percentage
    delta: 0, // TODO: Calculate from historical data
    source: 'Portfolio Average',
    freshness: 'just now',
  };

  // ─── Compute Dynamic Real Data for Bottom Cards ───

  const allEvents: any[] = [];
  
  // Forecasting is in private beta - do not show forecast updates in the activity feed.

  alertsData.slice(0, 3).forEach(alert => {
    allEvents.push({
      date: new Date(alert.created_at),
      icon: alert.severity === 'critical' ? 'Warning' : 'BellRinging',
      iconColor: alert.severity === 'critical' ? '#DC2626' : '#2563EB',
      iconBg: alert.severity === 'critical' ? '#FEE2E2' : '#DBEAFE',
      textEn: `Alert: ${alert.title}`,
      textHi: `अलर्ट: ${alert.title_hi}`,
    });
  });

  allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const activities = allEvents.slice(0, 4).map(event => ({
    ...event,
    timeEn: formatDistanceToNow(event.date, { addSuffix: true }),
    timeHi: formatDistanceToNow(event.date, { addSuffix: true, locale: hi }),
  }));

  const oldPrediction = historyData.length > 0 ? historyData[0] : null;
  let priceTrendVal = 0;
  if (oldPrediction && primaryPrediction && oldPrediction.p50 > 0) {
    priceTrendVal = ((primaryPrediction.p50 - oldPrediction.p50) / oldPrediction.p50) * 100;
  }
  
  const hasCriticalAlert = alertsData.some(a => a.severity === 'critical');
  const hasWarningAlert = alertsData.some(a => a.severity === 'warning');
  const riskLevel = hasCriticalAlert ? 'High' : hasWarningAlert ? 'Medium' : 'Low';
  
  const bestSellWindow = primaryPrediction?.sell_signal === 'SELL_NOW' ? 'Now / 0-2 Days' : 'Wait / 3-5 Days';

  const insights = [
    {
      labelEn: 'Price Trend',
      labelHi: 'भाव ट्रेंड',
      value: `${Math.abs(priceTrendVal).toFixed(1)}%`,
      icon: 'TrendUp',
      descEn: 'Compared to 7 days ago',
      descHi: '7 दिन पहले की तुलना में',
      direction: priceTrendVal > 0 ? 'up' : priceTrendVal < 0 ? 'down' : 'flat',
    },
    {
      labelEn: 'Best Sell Window',
      labelHi: 'सर्वोत्तम बिक्री समय',
      value: bestSellWindow,
      icon: 'CalendarCheck',
      descEn: 'Based on forecast',
      descHi: 'अनुमान के अनुसार',
      direction: 'flat',
    },
    {
      labelEn: 'Market Sentiment',
      labelHi: 'बाजार भावना',
      value: priceTrendVal > 0 ? 'Bullish' : 'Bearish',
      icon: 'Storefront',
      descEn: 'Based on 7-day trend',
      descHi: '7-दिन के ट्रेंड पर आधारित',
      direction: priceTrendVal > 0 ? 'up' : 'down',
    },
    {
      labelEn: 'Risk Level',
      labelHi: 'जोखिम स्तर',
      value: riskLevel,
      icon: 'ShieldCheck',
      descEn: 'Based on active alerts',
      descHi: 'सक्रिय अलर्ट पर आधारित',
      direction: 'flat',
    },
  ] as any[];

  const lastUpdateDate = activities.length > 0 ? activities[0].date : new Date();
  const lastUpdateEn = formatDistanceToNow(lastUpdateDate, { addSuffix: true });
  const lastUpdateHi = formatDistanceToNow(lastUpdateDate, { addSuffix: true, locale: hi });

  return (
    <div className="flex flex-col gap-6">
      {/* Onboarding Checklist (GAP-021) */}
      <OnboardingChecklist customerId={customer.id} />



      {/* Farm Operations KPI Bar */}
      <Suspense fallback={<div className="col-span-4 bg-white rounded-2xl p-card-standard border border-neutral-200 h-[140px] animate-pulse" />}>
        <PortfolioKPIBar
          totalBirds={farmKPI.totalBirds}
          portfolioFCR={farmKPI.portfolioFCR}
          portfolioMortality={farmKPI.portfolioMortality}
          totalFeed={farmKPI.totalFeed}
          totalRevenue={farmKPI.totalRevenue}
          totalBirdsTrend={farmKPI.totalBirdsTrend}
          portfolioFCRTrend={farmKPI.portfolioFCRTrend}
          portfolioMortalityTrend={farmKPI.portfolioMortalityTrend}
          totalFeedTrend={farmKPI.totalFeedTrend}
          totalRevenueTrend={farmKPI.totalRevenueTrend}
          lastUpdated={new Date()}
        />
      </Suspense>

      {/* Command Center Layout - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

        {/* ROW 1: Price Signal Hero (col span 8) | Accuracy Trust Card (col span 4) */}
        <div className="col-span-1 lg:col-span-8">
          <ComingSoonOverlay>
            <Suspense fallback={<div className="bg-white rounded-2xl p-card-spacious border border-neutral-200 h-[280px] animate-pulse" />}>
              {primaryPrediction && (
                <PriceSignalHero
                  price={primaryPrediction.p50}
                  p10={primaryPrediction.p10}
                  p90={primaryPrediction.p90}
                  deltaPercent={2.3} // Mock delta - should come from API
                  deltaDirection="up"
                  signal={primaryPrediction.sell_signal.toLowerCase() as 'sell' | 'hold' | 'caution'}
                  district={district}
                  lastUpdated={new Date(primaryPrediction.predicted_at)}
                  isStale={false}
                  isOffline={false}
                />
              )}
            </Suspense>
          </ComingSoonOverlay>
        </div>

        <div className="col-span-1 lg:col-span-4">
          <ComingSoonOverlay>
            <Suspense fallback={<div className="bg-white rounded-2xl p-card-standard border border-neutral-200 h-[280px] animate-pulse" />}>
              {accuracyData && (
                <AccuracyTrustCard
                  mape30d={accuracyData.mape_30d}
                  directionalAccuracy={accuracyData.directional_accuracy_30d}
                  predictionCount={accuracyData.prediction_count_30d || 847}
                  lastRetrain={new Date(accuracyData.last_updated)}
                  modelVersion="v1.0"
                />
              )}
            </Suspense>
          </ComingSoonOverlay>
        </div>

        {/* ROW 2: KPI Card Row (5 cards) */}
        <div className="col-span-1 lg:col-span-12">
          <Suspense fallback={<div className="bg-white rounded-2xl p-card-standard border border-neutral-200 h-[140px] animate-pulse" />}>
            <KpiCardRow
              userRole={customer.role as 'admin' | 'enterprise' | 'integrator' | 'pro'}
              mandiBenchmark={{
                price: 159.50,
                delta: 1.2,
                source: 'Gorakhpur APMC',
                freshness: '4hr ago'
              }}
              middlemanSpread={{
                delta: 2.50,
                deltaPercent: 1.5,
                source: 'NECC Zone',
                freshness: '4hr ago'
              }}
              activeAlerts={{
                count: alertsData.length,
                freshness: 'just now'
              }}
              feedCostIndex={{
                value: 58.2,
                delta: 0.8,
                freshness: '1hr ago'
              }}
              gcKpi={gcKPI}
              subscriptionTier={customer.plan}
              isLoading={false}
            />
          </Suspense>
        </div>

        {/* ROW 3: 7-Day Price Chart (col span 8) | Alert Feed (mini) (col span 4) */}
        <div className="col-span-1 lg:col-span-8">
          <ComingSoonOverlay>
            <Suspense fallback={<ChartSkeleton height={320} />}>
              <PriceTrajectoryChart
                data={predictionsData.map(p => ({
                  date: p.predicted_at.split('T')[0],
                  p10: p.p10,
                  p50: p.p50,
                  p90: p.p90,
                  actual: p.actual_price || undefined
                }))}
                festivals={[
                  { date: '2026-05-20', name: 'Eid' }
                ]}
                events={[
                  { date: '2026-05-18', type: 'weather' }
                ]}
                isLoading={false}
              />
            </Suspense>
          </ComingSoonOverlay>
        </div>

        <div className="col-span-1 lg:col-span-4">
          <Suspense fallback={<AlertCardsSkeleton count={3} />}>
            <AlertsFeed initialAlerts={alertsData.slice(0, 5)} district={district} />
          </Suspense>
        </div>

        {/* ROW 4: District Coverage Map + Mandi Price Table */}
        <div className="col-span-1 lg:col-span-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="col-span-1 lg:col-span-5">
              <Suspense fallback={<div className="bg-white border border-neutral-200 p-card-standard rounded-2xl h-[350px] animate-pulse" />}>
                <DistrictMap
                  selectedDistrict={district}
                />
              </Suspense>
            </div>

            <div className="col-span-1 lg:col-span-7">
              <ComingSoonOverlay>
                <Suspense fallback={<TableSkeleton rows={5} />}>
                  <MandiPriceTable predictions={predictionsData as any} />
                </Suspense>
              </ComingSoonOverlay>
            </div>
          </div>
        </div>

        {/* ROW 5: Additional Components for Holistic View */}
        <div className="col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Card */}
          <QuickActionsCard />

          {/* Recent Activity Card */}
          <RecentActivityCard activities={activities} />

          {/* System Status Card */}
          <SystemStatusCard lastUpdateEn={lastUpdateEn} lastUpdateHi={lastUpdateHi} />
        </div>

        {/* ROW 6: Market Insights Summary */}
        <ComingSoonOverlay>
          <MarketInsightsCard insights={insights} />
        </ComingSoonOverlay>
      </div>
    </div>
  );
}
