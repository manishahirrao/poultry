/**
 * Broiler Price Forecast Page - Server Component
 * 
 * Route: /dashboard/price-intelligence/forecast
 * 
 * This is the server-side entry point for the forecast screen. It handles:
 * - Authentication and authorization
 * - User profile fetching (primary mandi, subscription plan, language)
 * - Server-side data prefetching for performance
 * - Passing initial data to the client component
 * 
 * Prefetched data:
 * - accuracyHorizons: Model accuracy by forecast horizon (for AccuracyDecayCard)
 * - todayMarket: Today's mandi prices (for LiveMarketContextCard)
 * 
 * Client component handles:
 * - SWR data fetching for forecast timeline, sell signals, price drivers
 * - Interactive state (mandi selection, horizon toggle, view mode)
 * - Price alert panel
 */

import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ForecastPageClient } from './ForecastPageClient'
import { ForecastPageSkeleton } from './ForecastPageSkeleton'

export const metadata = {
  title: 'Broiler Price Forecast — FlockIQ',
  description: 'AI-powered broiler live-weight price forecast for UP mandis.',
}

export default async function ForecastPage({
  searchParams,
}: {
  searchParams: Promise<{ mandi?: string; horizon?: string }>
}) {
  // FORCE DEMO MODE - use mock data for testing (matching overview page)
  const mockProfile = {
    primary_mandi_id: 'gorakhpur',
    subscription_plan: 'PULSE_PRO',
    language_preference: 'hi'
  }
  const mockUserId = 'demo-user'

  const resolvedMagnifyingGlassParams = await searchParams
  const mandiId = resolvedMagnifyingGlassParams.mandi ?? mockProfile.primary_mandi_id
  const horizon = parseInt(resolvedMagnifyingGlassParams.horizon ?? '30', 10)
  const language = mockProfile.language_preference
  const plan = mockProfile.subscription_plan

  // Mock accuracy horizons data
  const accuracyHorizons = [
    { horizon_days: 1, directional_acc: 98.5, mape: 2.1 },
    { horizon_days: 7, directional_acc: 95.2, mape: 4.8 },
    { horizon_days: 14, directional_acc: 92.1, mape: 6.3 },
    { horizon_days: 30, directional_acc: 88.4, mape: 8.9 }
  ]

  // Mock today's market data
  const todayMarket = [
    { mandi_id: 'gorakhpur', mandi_name: 'Gorakhpur', actual_price: 168.00, last_updated_at: new Date().toISOString() },
    { mandi_id: 'basti', mandi_name: 'Basti', actual_price: 165.50, last_updated_at: new Date().toISOString() },
    { mandi_id: 'deoria', mandi_name: 'Deoria', actual_price: 167.00, last_updated_at: new Date().toISOString() },
    { mandi_id: 'maharajganj', mandi_name: 'Maharajganj', actual_price: 164.00, last_updated_at: new Date().toISOString() },
    { mandi_id: 'siddharthnagar', mandi_name: 'Siddharthnagar', actual_price: 166.50, last_updated_at: new Date().toISOString() }
  ]

  /* Original auth logic - disabled for testing
  const supabase = await createClient()
  
  // ── Authentication check ───────────────────────────────────────────────────
  if (!supabase) {
    redirect('/login?redirect=/dashboard/price-intelligence/forecast')
  }

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect('/login?redirect=/dashboard/price-intelligence/forecast')

  // ── Fetch user profile (primary mandi, plan, language) ───────────────────────
  const { data: profile } = await supabase
    .from('users')
    .select('primary_mandi_id, subscription_plan, language_preference')
    .eq('id', user.id)
    .single() as { data: { primary_mandi_id?: string; subscription_plan?: string; language_preference?: string } | null; error: any }

  // ── Determine initial state from URL params or user profile ─────────────────
  const resolvedMagnifyingGlassParams = await searchParams
  const mandiId = resolvedMagnifyingGlassParams.mandi ?? profile?.primary_mandi_id ?? 'gorakhpur'
  const horizon = parseInt(resolvedMagnifyingGlassParams.horizon ?? '30', 10)
  const language = profile?.language_preference ?? 'hi'
  const plan = profile?.subscription_plan ?? 'PULSE_FARM'

  // ── Prefetch accuracy-by-horizon for the decay card (fast, cached) ───────────
  // This data changes infrequently (only after model retraining)
  const { data: accuracyHorizons } = await supabase
    .from('model_accuracy_by_horizon')
    .select('horizon_days, directional_acc, mape')
    .order('horizon_days', { ascending: true })

  // ── Prefetch today's market prices for the market context card ───────────────
  // This provides context for today's prices across nearby mandis
  const { data: todayMarket } = await supabase
    .from('price_actuals')
    .select('mandi_id, mandi_name, actual_price, last_updated_at')
    .eq('price_date', new Date().toISOString().split('T')[0])
    .order('distance_km', { ascending: true })
    .limit(5)
  */

  // ── Render client component with prefetched data ─────────────────────────────
  return (
    <Suspense fallback={<ForecastPageSkeleton />}>
      <ForecastPageClient
        initialMandiId={mandiId}
        initialHorizon={horizon}
        language={language}
        plan={plan}
        accuracyHorizons={accuracyHorizons}
        todayMarket={todayMarket}
        userId={mockUserId}
      />
    </Suspense>
  )
}
