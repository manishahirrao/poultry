/**
 * Broiler Price Forecast Page - Client Component
 * 
 * This is the client-side component that handles all interactive state and data fetching.
 * It receives initial data from the server component and uses SWR for real-time updates.
 * 
 * State managed:
 * - mandiId: Selected mandi for forecast
 * - horizon: Forecast horizon (7 or 30 days)
 * - viewMode: Chart or table view
 * - alertPanelOpen: Price alert panel visibility
 * 
 * Data fetched via SWR:
 * - forecastData: Main forecast timeline (P10/P50/P90, festivals, HPAI zones)
 * - signalData: Sell signal recommendation
 * - driversData: Price drivers (SHAP analysis)
 * 
 * Components rendered:
 * - ForecastDisclaimer: Mandatory disclaimer strip (never collapsible)
 * - ForecastControls: Mandi selector, horizon toggle, view mode toggle
 * - ForecastKPIStrip: Today's P50, 80% band, D+7, D+30 forecasts
 * - ForecastMainChart: Main forecast chart with confidence bands
 * - SellSignalCard: Sell/Hold/Caution recommendation
 * - AccuracyDecayCard: Model accuracy by horizon
 * - PriceDriversCard: Why price is moving (SHAP drivers)
 * - SellHoldMatrix: Decision matrix with break-even analysis
 * - LiveMarketContextCard: Today's market prices across mandis
 * - PriceAlertPanel: Slide-over panel for creating price alerts
 */

'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useRouter, usePathname } from 'next/navigation'
import { ChartLine, ClockCounterClockwise, Download } from '@phosphor-icons/react'
import { ForecastDisclaimer } from './components/ForecastDisclaimer'
import { ForecastControls } from './components/ForecastControls'
import { ForecastKPIStrip } from './components/ForecastKPIStrip'
import { ForecastMainChart } from './components/ForecastMainChart'
import { SellSignalCard } from './components/SellSignalCard'
import { AccuracyDecayCard } from './components/AccuracyDecayCard'
import { PriceDriversCard } from './components/PriceDriversCard'
import { SellHoldMatrix } from './components/SellHoldMatrix'
import { LiveMarketContextCard } from './components/LiveMarketContextCard'
import { PriceAlertPanel } from './components/PriceAlertPanel'
import { PageHeader } from '@/components/layout/PageHeader'
import { useEntitlements } from '@/lib/plans/useEntitlements'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'
import { canAccess, FEATURES } from '@/lib/plans/featureGates'
import { FeatureGate } from '@/components/plans/FeatureGate'

interface AccuracyHorizon {
  horizon_days: number
  directional_acc: number
  mape: number
}

interface TodayMarketPrice {
  mandi_id: string
  mandi_name: string
  actual_price: number
  last_updated_at: string
  distance_km?: number
}

interface Props {
  initialMandiId: string
  initialHorizon: number
  language: string
  plan: string
  accuracyHorizons: AccuracyHorizon[]
  todayMarket: TodayMarketPrice[]
  userId: string
}

// SWR fetcher with error handling
const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`API error ${r.status}`)
  return r.json()
})

export function ForecastPageClient({
  initialMandiId,
  initialHorizon,
  language,
  plan,
  accuracyHorizons,
  todayMarket,
  userId,
}: Props) {
  // ── Feature access check ─────────────────────────────────────────────────────
  const { entitlements } = useEntitlements()
  const forecastAccess = canAccess(entitlements, FEATURES.FORECAST_30DAY)
  const router = useRouter()
  const pathname = usePathname()

  // ── Interactive state ───────────────────────────────────────────────────────
  const [mandiId, setMandiId] = useState(initialMandiId)
  const [horizon, setHorizon] = useState(initialHorizon)
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')
  const [alertPanelOpen, setAlertPanelOpen] = useState(false)

  // ── Subsection navigation tabs ───────────────────────────────────────────────
  const subsectionTabs = [
    { id: 'forecast', label: 'Forecast', labelHi: 'पूर्वानुमान', href: '/dashboard/price-intelligence/forecast', icon: ChartLine },
    { id: 'historical', label: 'Historical', labelHi: 'ऐतिहासिक', href: '/dashboard/price-intelligence/historical', icon: ClockCounterClockwise },
    { id: 'download', label: 'Download', labelHi: 'डाउनलोड', href: '/dashboard/price-intelligence/download', icon: Download },
  ]

  const activeTab = subsectionTabs.find(tab => pathname === tab.href)?.id || 'forecast'

  // ── Enforce horizon limit based on plan ───────────────────────────────────────
  // FARM users: max 7-day forecast; PRO users: full 30-day forecast
  useEffect(() => {
    if (!forecastAccess.hasAccess && horizon > 7) {
      setHorizon(7)
    }
  }, [forecastAccess.hasAccess, horizon])

  // ── SWR: Main forecast data ─────────────────────────────────────────────────
  // Fetches P10/P50/P90 forecast timeline, festivals, and HPAI zones
  // Revalidates every 5 minutes and on window focus
  const { data: forecastData, isLoading: forecastLoading, error: forecastError } = useSWR(
    `/api/price-intelligence/forecast?mandi=${mandiId}&horizon=${horizon}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateInterval: 5 * 60 * 1000, // 5 minutes
      dedupingInterval: 60 * 1000, // dedupe within 1 minute
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 3) return // max 3 retries
        setTimeout(() => revalidate({ retryCount }), 5000)
      },
    }
  )

  // ── SWR: Sell signal ─────────────────────────────────────────────────────────
  // Fetches sell/hold/caution recommendation
  // Revalidates on window focus (signals change daily)
  const { data: signalData, isLoading: signalLoading } = useSWR(
    `/api/price-intelligence/sell-signal?mandi=${mandiId}`,
    fetcher,
    { revalidateOnFocus: true }
  )

  // ── SWR: Price drivers ───────────────────────────────────────────────────────
  // Fetches SHAP-based price drivers
  // Does not revalidate on focus (drivers computed once daily)
  const { data: driversData, isLoading: driversLoading } = useSWR(
    `/api/price-intelligence/drivers?mandi=${mandiId}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  // ── Extract KPI values from forecast timeline ─────────────────────────────────
  const todayPoint = forecastData?.timeline?.find((p: any) => !p.isForecast &&
    p.date === new Date().toISOString().split('T')[0])
  const todayP50 = todayPoint?.p50 ?? todayPoint?.actual
  const todayP10 = todayPoint?.p10
  const todayP90 = todayPoint?.p90

  // D+7 forecast point
  const d7Point = forecastData?.timeline?.find((p: any) => {
    const d7 = new Date(); d7.setDate(d7.getDate() + 7)
    return p.date === d7.toISOString().split('T')[0]
  })
  const d7P50 = d7Point?.p50

  // D+30 forecast point
  const d30Point = forecastData?.timeline?.find((p: any) => {
    const d30 = new Date(); d30.setDate(d30.getDate() + 30)
    return p.date === d30.toISOString().split('T')[0]
  })
  const d30P50 = d30Point?.p50

  // ── Export handler ───────────────────────────────────────────────────────────
  // Triggers CSV download with disclaimer as first row (PRO only)
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/price-intelligence/export?mandi=${mandiId}&horizon=${horizon}`)
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flockiq-forecast-${mandiId}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  // ── Feature access checks ─────────────────────────────────────────────────────
  const exportAccess = canAccess(entitlements, FEATURES.FORECAST_EXPORT_CSV)
  const compareMandisAccess = canAccess(entitlements, FEATURES.COMPARE_MANDIS)

  // ── Render page layout ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page header with title, subtitle, and action buttons */}
      <PageHeader
        title="Broiler Price Forecast"
        subtitle={`Live weight broiler (farm gate) — updated daily 6:00 AM · Last updated ${forecastData?.meta?.generatedAt ? new Date(forecastData.meta.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}`}
        actions={[
          ...(exportAccess.hasAccess ? [{ label: 'Export CSV', variant: 'outline' as const, onClick: () => handleExport() }] : []),
          { label: 'Set Price Alert', variant: 'primary' as const, onClick: () => setAlertPanelOpen(true) },
        ]}
        breadcrumb={['Price Intelligence', 'Broiler Forecast']}
      />

      {/* ── SUBSECTION NAVBAR ── */}
      {/* Sub-navigation for Price Intelligence sections */}
      <div className="px-6 max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-1 border-b border-neutral-200 bg-white rounded-t-xl px-4" aria-label="Price Intelligence subsection navigation">
          {subsectionTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
                  ${isActive
                    ? 'text-brandGreen700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brandGreen700" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── DISCLAIMER (mandatory, never collapsible) ── */}
      {/* This strip must always be visible per requirements */}
      <ForecastDisclaimer language={language} userId={userId} />

      <div className="px-6 pb-8 max-w-[1200px] mx-auto space-y-4">
        <ComingSoonOverlay>
          {/* ── CONTROLS ── */}
          {/* Mandi selector, horizon toggle (7D/30D), view mode toggle (chart/table) */}
          <ForecastControls
            mandiId={mandiId}
            onMandiChange={setMandiId}
            horizon={horizon}
            onHorizonChange={setHorizon}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            plan={plan}
            language={language}
          />

          {/* ── KPI STRIP ── */}
          {/* Shows Today's P50, 80% confidence band, D+7 forecast, D+30 forecast */}
          <ForecastKPIStrip
            isLoading={forecastLoading}
            error={!!forecastError}
            todayP50={todayP50}
            todayP10={todayPoint?.p10}
            todayP90={todayPoint?.p90}
            d7P50={d7Point?.p50}
            d30P50={d30Point?.p50}
            plan={plan}
            language={language}
          />

          {/* ── MAIN CHART + RIGHT PANEL ── */}
          <div className="grid grid-cols-12 gap-4 mt-4">
            {/* Main forecast chart (8/12 columns) */}
            <div className="col-span-8 2xl:col-span-9">
              <ForecastMainChart
                isLoading={forecastLoading}
                error={forecastError}
                timeline={forecastData?.timeline ?? []}
                festivals={forecastData?.festivals ?? []}
                hpaiZones={forecastData?.hpaiZones ?? []}
                viewMode={viewMode}
                horizon={horizon}
                language={language}
              />
            </div>
            
            {/* Right panel with sell signal and accuracy decay (4/12 columns) */}
            <div className="col-span-4 2xl:col-span-3 space-y-4">
              <SellSignalCard
                isLoading={signalLoading}
                signal={signalData}
                language={language}
              />
              <FeatureGate feature={FEATURES.ACCURACY_DECAY_VIZ} blurChildren>
                <AccuracyDecayCard
                  horizons={accuracyHorizons}
                  language={language}
                />
              </FeatureGate>
            </div>
          </div>

          {/* ── BOTTOM ROW ── */}
          {/* Three cards: Price drivers, Sell vs Hold matrix, Live market context */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <FeatureGate feature={FEATURES.PRICE_DRIVERS_SHAP} blurChildren>
              <PriceDriversCard
                isLoading={driversLoading}
                drivers={driversData?.drivers ?? null}
                isAvailable={driversData?.isAvailable ?? false}
                watermarkToken={driversData?.watermarkToken ?? ''}
                language={language}
              />
            </FeatureGate>
            <SellHoldMatrix
              isLoading={forecastLoading}
              timeline={forecastData?.timeline ?? []}
              signal={signalData}
              language={language}
            />
            <LiveMarketContextCard
              isLoading={false}
              todayMarket={todayMarket}
              selectedMandiId={mandiId}
              language={language}
            />
          </div>
        </ComingSoonOverlay>
      </div>

      {/* ── PRICE ALERT PANEL (slide-over) ── */}
      {/* Opens when "Set Price Alert" button is clicked */}
      <PriceAlertPanel
        isOpen={alertPanelOpen}
        onClose={() => setAlertPanelOpen(false)}
        mandiId={mandiId}
        mandiName={mandiId.charAt(0).toUpperCase() + mandiId.slice(1)}
        todayP50={todayP50}
        language={language}
      />
    </div>
  )
}
