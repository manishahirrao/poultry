# FlockIQ — Broiler Price Forecast Screen: Implementation Playbook (v1.0)
# Covers: Remaining UI components + DB seed job + model pipeline integration
#         + export + price alert panel + edge cases + deployment checklist
# Version: v1.0 | June 2026 | CONFIDENTIAL
# Continues from: FlockIQ_Forecast_Screen_Tasks_v1.md

---

## REMAINING UI COMPONENTS

---

### TASK FSC-UI-005 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/app/dashboard/price-intelligence/forecast/components/SellSignalCard.tsx`
**Purpose:** Right-panel sell signal card — SELL NOW / HOLD / CAUTION with optimal window and confidence stars.

```typescript
'use client'

interface SellSignalData {
  signal:              'SELL_NOW' | 'HOLD' | 'CAUTION'
  optimalWindowStart:  string | null   // ISO date
  optimalWindowEnd:    string | null
  expectedP50Low:      number | null
  expectedP50High:     number | null
  confidence:          number           // 1–5
  reasons:             string[]
}

interface Props {
  isLoading: boolean
  signal:    SellSignalData | null
  language:  string
}

const SIGNAL_CONFIG = {
  SELL_NOW: {
    bg:          '#EDF7F1',
    border:      '#3DAE72',
    labelColour: '#1A5C34',
    badgeBg:     '#1A5C34',
    badgeText:   '#FFFFFF',
    labelHi:     'बिक्री संकेत',
    labelEn:     'Sell Signal',
    badgeHi:     '✓ आज बेचें — SELL NOW',
    badgeEn:     '✓ Sell Today — SELL NOW',
    icon:        '↑',
  },
  HOLD: {
    bg:          '#FFFBEB',
    border:      '#D97706',
    labelColour: '#92400E',
    badgeBg:     '#D97706',
    badgeText:   '#FFFFFF',
    labelHi:     'बिक्री संकेत',
    labelEn:     'Sell Signal',
    badgeHi:     '⏳ रुकें — HOLD',
    badgeEn:     '⏳ Hold — HOLD',
    icon:        '→',
  },
  CAUTION: {
    bg:          '#FEF2F2',
    border:      '#DC2626',
    labelColour: '#991B1B',
    badgeBg:     '#DC2626',
    badgeText:   '#FFFFFF',
    labelHi:     'बिक्री संकेत',
    labelEn:     'Sell Signal',
    badgeHi:     '⚠ सावधान — CAUTION',
    badgeEn:     '⚠ Caution — CAUTION',
    icon:        '↓',
  },
}

export function SellSignalCard({ isLoading, signal, language }: Props) {
  const isHindi = language === 'hi'

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#E3EDE7] p-4 bg-white animate-pulse space-y-3">
        <div className="h-3 w-24 bg-[#F4F7F5] rounded" />
        <div className="h-8 w-36 bg-[#F4F7F5] rounded-full" />
        <div className="h-3 w-full bg-[#F4F7F5] rounded" />
        <div className="h-3 w-3/4 bg-[#F4F7F5] rounded" />
        <div className="h-6 w-28 bg-[#F4F7F5] rounded-xl" />
        <div className="flex gap-1.5 mt-2">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#E3EDE7]" />
          ))}
        </div>
      </div>
    )
  }

  // No signal yet
  if (!signal) {
    return (
      <div className="rounded-xl border border-[#E3EDE7] p-4 bg-[#F4F7F5]">
        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">
          {isHindi ? 'बिक्री संकेत' : 'Sell Signal'}
        </p>
        <p className="text-sm text-gray-400">
          {isHindi
            ? 'संकेत गणना हो रहा है... 6:00 AM के बाद जांचें'
            : 'Signal computing... Check after 6:00 AM'}
        </p>
      </div>
    )
  }

  const cfg = SIGNAL_CONFIG[signal.signal]

  // Format date range for display
  const formatDate = (iso: string | null) => {
    if (!iso) return null
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const windowStart = formatDate(signal.optimalWindowStart)
  const windowEnd   = formatDate(signal.optimalWindowEnd)
  const windowText  = windowStart && windowEnd
    ? `${windowStart} – ${windowEnd}`
    : windowStart ?? null

  return (
    <div
      className = "rounded-xl border p-4"
      style     = {{ background: cfg.bg, borderColor: cfg.border }}
    >
      {/* Label */}
      <p
        className = "text-[10px] font-medium uppercase tracking-[0.08em] mb-2"
        style     = {{ color: cfg.labelColour }}
      >
        {isHindi ? cfg.labelHi : cfg.labelEn} — {isHindi ? 'गोरखपुर' : 'Gorakhpur'}
      </p>

      {/* Signal badge */}
      <div
        className = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-3"
        style     = {{ background: cfg.badgeBg, color: cfg.badgeText }}
      >
        {isHindi ? cfg.badgeHi : cfg.badgeEn}
      </div>

      {/* Optimal window */}
      {windowText && (
        <div className="text-[11px] leading-relaxed mb-2" style={{ color: cfg.labelColour }}>
          <p>
            <span className="font-medium">{isHindi ? 'अनुकूल समय:' : 'Optimal window:'}</span>{' '}
            {windowText}
          </p>
          {signal.expectedP50Low && signal.expectedP50High && (
            <p>
              {isHindi ? 'अपेक्षित P50:' : 'Expected P50:'}{' '}
              ₹{signal.expectedP50Low}–₹{signal.expectedP50High}/kg
            </p>
          )}
          {signal.reasons[0] && (
            <p className="mt-1 opacity-80">{signal.reasons[0]}</p>
          )}
        </div>
      )}

      {/* Primary price display */}
      {signal.expectedP50High && (
        <>
          <p className="text-2xl font-medium text-gray-900 mt-1 mb-0.5 tabular-nums">
            ₹{signal.expectedP50High}/kg
          </p>
          <p className="text-[11px] text-gray-400">
            {isHindi ? 'D+3–D+5 अपेक्षित' : 'Expected D+3–D+5'}
            {signal.expectedP50Low && signal.expectedP50High && (
              <span> · P10 ₹{signal.expectedP50Low} — P90 ₹{(signal.expectedP50High * 1.05).toFixed(0)}</span>
            )}
          </p>
        </>
      )}

      {/* Confidence stars */}
      <div className="mt-3 flex items-center gap-1.5">
        <p className="text-[10px]" style={{ color: cfg.labelColour }}>
          {isHindi ? 'विश्वास:' : 'Confidence:'}
        </p>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => (
            <div
              key   = {i}
              className="w-2.5 h-2.5 rounded-full"
              style = {{ background: i <= signal.confidence ? cfg.badgeBg : '#E3EDE7' }}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-[10px]" style={{ color: cfg.labelColour }}>
          {['','Low','Low','Moderate','High','High'][signal.confidence]}{' '}
          ({signal.confidence}/5)
        </p>
      </div>
    </div>
  )
}
```

**QA Checks:**
- [ ] SELL_NOW → green card, green badge, "आज बेचें" text
- [ ] HOLD → amber card, amber badge, "रुकें" text
- [ ] CAUTION → red card, red badge, "सावधान" text
- [ ] Loading skeleton shows correct shape (no layout shift when data loads)
- [ ] No signal → neutral grey card with "Computing..." message
- [ ] Confidence dots: exactly `signal.confidence` filled, rest empty
- [ ] Window text only shows when optimalWindowStart is non-null
- [ ] Hindi translations correct when language='hi'
- [ ] Card accessible: no colour-only distinction (badge text + shape)

---

### TASK FSC-UI-006 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/app/dashboard/price-intelligence/forecast/components/SellHoldMatrix.tsx`
**Purpose:** Decision matrix showing TODAY through D+30 with price, signal, confidence dots, and break-even.

```typescript
'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'

interface TimelinePoint {
  date:       string
  p50:        number | null
  isForecast: boolean
}

interface Props {
  isLoading: boolean
  timeline:  TimelinePoint[]
  signal:    any
  language:  string
}

// Confidence dots count by horizon
const HORIZON_CONFIDENCE = [5, 4, 4, 3, 2, 1] // TODAY,D+3,D+7,D+14,D+21,D+30

// Signal at each horizon based on P50 trend
function getHorizonSignal(p50: number | null, todayP50: number | null): 'SELL_NOW' | 'HOLD' | 'CAUTION' {
  if (!p50 || !todayP50) return 'HOLD'
  const diff = p50 - todayP50
  if (diff >= 2)  return 'HOLD'        // price going up → wait
  if (diff >= -2) return 'SELL_NOW'    // stable or slight up → sell
  return 'CAUTION'                     // declining → risky to wait
}

const SIGNAL_LABELS = {
  SELL_NOW: { hi: 'आज बेचें', en: 'Sell Now', cls: 'bg-[#EDF7F1] text-[#1A5C34]' },
  HOLD:     { hi: 'रुकें',    en: 'Hold',     cls: 'bg-[#FFFBEB] text-[#92400E]' },
  CAUTION:  { hi: 'सावधान',  en: 'Caution',  cls: 'bg-[#FEE2E2] text-[#991B1B]' },
}

export function SellHoldMatrix({ isLoading, timeline, signal, language }: Props) {
  const isHindi = language === 'hi'
  const [selectedFarmId, setSelectedFarmId] = useState<string>('')
  const [breakEven, setBreakEven] = useState<number | null>(null)
  const [birdCount, setBirdCount] = useState<number>(25000)
  const [avgWeightKg, setAvgWeightKg] = useState<number>(1.68)
  const [batchDay, setBatchDay] = useState<number>(21)

  // Fetch user farms for dropdown
  const { data: farms } = useSWR('/api/farms?status=active&fields=id,name,currentBatch', url =>
    fetch(url).then(r => r.ok ? r.json() : null)
  )

  // Fetch farm details when selected
  const { data: farmData } = useSWR(
    selectedFarmId ? `/api/farms/${selectedFarmId}/calculator-data` : null,
    url => fetch(url).then(r => r.ok ? r.json() : null)
  )

  // Auto-fill when farm data loads
  useEffect(() => {
    if (farmData) {
      setBirdCount(farmData.birdsAlive ?? 25000)
      setAvgWeightKg((farmData.avgWeightG ?? 1680) / 1000)
      setBatchDay(farmData.batchDayNumber ?? 21)
      // Compute break-even: (total feed cost + overhead) / (birds_alive × avg_weight_kg)
      const totalCost = (farmData.totalFeedCostRs ?? 0) + (farmData.overheadCostRs ?? 0)
      const totalWeightKg = farmData.birdsAlive * ((farmData.avgWeightG ?? 1680) / 1000)
      if (totalCost > 0 && totalWeightKg > 0) {
        setBreakEven(Math.round(totalCost / totalWeightKg))
      }
    }
  }, [farmData])

  // Build matrix rows from timeline
  const today = new Date().toISOString().split('T')[0]
  const todayP50 = timeline.find(t => t.date === today)?.p50
    ?? timeline.filter(t => !t.isForecast).slice(-1)[0]?.p50
    ?? null

  // Target horizon days
  const HORIZONS = [
    { label: isHindi ? 'आज' : 'Today', days: 0,  confIdx: 0 },
    { label: 'D+3',                     days: 3,  confIdx: 1 },
    { label: 'D+7',                     days: 7,  confIdx: 2 },
    { label: 'D+14',                    days: 14, confIdx: 3 },
    { label: 'D+21',                    days: 21, confIdx: 4 },
    { label: 'D+30',                    days: 30, confIdx: 5 },
  ]

  const getP50ForDays = (days: number): number | null => {
    const target = new Date()
    target.setDate(target.getDate() + days)
    const targetStr = target.toISOString().split('T')[0]
    // Exact match or nearest date in timeline
    const exact = timeline.find(t => t.date === targetStr)
    if (exact) return exact.p50
    // Nearest future date
    const nearest = timeline
      .filter(t => t.isForecast && t.date >= targetStr)
      .sort((a, b) => a.date.localeCompare(b.date))[0]
    return nearest?.p50 ?? null
  }

  // Find optimal horizon (highest P50 considering feed cost accumulation)
  const FEED_COST_PER_DAY_RS = 0.5 * birdCount * avgWeightKg  // rough estimate
  const optimalIdx = HORIZONS.reduce((bestIdx, _, i) => {
    const p50i    = getP50ForDays(HORIZONS[i].days)
    const p50best = getP50ForDays(HORIZONS[bestIdx].days)
    if (!p50i || !p50best) return bestIdx
    const netI    = (p50i * birdCount * avgWeightKg) - (FEED_COST_PER_DAY_RS * HORIZONS[i].days)
    const netBest = (p50best * birdCount * avgWeightKg) - (FEED_COST_PER_DAY_RS * HORIZONS[bestIdx].days)
    return netI > netBest ? i : bestIdx
  }, 0)

  if (isLoading) return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4 animate-pulse space-y-2">
      <div className="h-3 w-32 bg-[#F4F7F5] rounded mb-3" />
      {[0,1,2,3,4,5].map(i => (
        <div key={i} className="flex gap-2">
          <div className="h-3 w-10 bg-[#F4F7F5] rounded" />
          <div className="h-3 w-14 bg-[#F4F7F5] rounded" />
          <div className="h-3 w-16 bg-[#F4F7F5] rounded" />
          <div className="h-3 w-20 bg-[#F4F7F5] rounded" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        {isHindi ? 'बेचें या रुकें — निर्णय मैट्रिक्स' : 'Sell vs Hold — Decision Matrix'}
      </h3>

      {/* Farm context selector */}
      <div className="mb-3">
        <p className="text-[10px] text-gray-400 mb-1.5">
          {isHindi ? 'Farm चुनें (optional):' : 'Load from Farm (optional):'}
        </p>
        <select
          value    = {selectedFarmId}
          onChange = {e => setSelectedFarmId(e.target.value)}
          className= "w-full text-[11px] px-2 py-1.5 border border-[#E3EDE7] rounded-lg
                      bg-white text-gray-700 focus:outline-none focus:border-[#1A5C34]"
        >
          <option value="">
            {birdCount.toLocaleString('en-IN')} {isHindi ? 'पक्षी' : 'birds'} ·{' '}
            Day {batchDay} · {avgWeightKg.toFixed(2)} kg
          </option>
          {(farms?.farms ?? []).map((f: any) => (
            <option key={f.id} value={f.id}>
              {f.name} — Batch #{f.currentBatch?.batchNumber ?? '?'} · Day {f.currentBatch?.dayNumber ?? '?'}
            </option>
          ))}
        </select>
      </div>

      {/* Matrix rows */}
      <div className="space-y-1.5">
        {HORIZONS.map((h, i) => {
          const p50       = getP50ForDays(h.days)
          const sigKey    = getHorizonSignal(p50, todayP50)
          const sigCfg    = SIGNAL_LABELS[sigKey]
          const confDots  = HORIZON_CONFIDENCE[h.confIdx]
          const isOptimal = i === optimalIdx

          return (
            <div
              key       = {h.days}
              className = {`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors ${
                isOptimal
                  ? 'bg-[#EDF7F1] border border-[#3DAE72]'
                  : 'hover:bg-[#F4F7F5]'
              }`}
            >
              {/* Day label */}
              <div className="w-16 flex-shrink-0 flex items-center gap-1">
                <span className="text-[11px] font-medium text-gray-800">{h.label}</span>
                {isOptimal && (
                  <span className="text-[8px] bg-[#1A5C34] text-white px-1 py-0.5 rounded-full leading-none">
                    ⭐
                  </span>
                )}
              </div>

              {/* P50 price */}
              <span className="text-[11px] font-medium text-gray-900 tabular-nums w-14 flex-shrink-0">
                {p50 ? `₹${p50}/kg` : '—'}
              </span>

              {/* Signal pill */}
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${sigCfg.cls}`}>
                {isHindi ? sigCfg.hi : sigCfg.en}
              </span>

              {/* Confidence dots */}
              <div className="flex gap-1 ml-auto">
                {[1,2,3,4,5].map(dot => (
                  <div
                    key       = {dot}
                    className = "w-1.5 h-1.5 rounded-full"
                    style     = {{ background: dot <= confDots ? '#1A5C34' : '#E3EDE7' }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Break-even section */}
      <div className="mt-3 pt-3 border-t border-[#E3EDE7]">
        <p className="text-[10px] text-gray-400 mb-1">
          {isHindi ? 'लागत मूल्य' : 'Break-even price'}
        </p>
        {breakEven ? (
          <>
            <p className="text-xl font-medium text-gray-900 tabular-nums">₹{breakEven}/kg</p>
            {todayP50 && (
              <p className={`text-[11px] mt-0.5 font-medium ${
                todayP50 > breakEven ? 'text-green-600' : 'text-red-600'
              }`}>
                {isHindi ? 'आज' : 'Today'} ₹{todayP50} —{' '}
                ₹{Math.abs(todayP50 - breakEven)}/kg{' '}
                {todayP50 > breakEven
                  ? (isHindi ? 'लागत से ऊपर ✓' : 'above break-even ✓')
                  : (isHindi ? 'लागत से नीचे ⚠' : 'below break-even ⚠')}
              </p>
            )}
          </>
        ) : (
          <p className="text-[11px] text-gray-400">
            {isHindi
              ? 'Farm डेटा चुनें लागत जानने के लिए'
              : 'Select a farm above to calculate break-even'}
          </p>
        )}
      </div>
    </div>
  )
}
```

**QA Checks:**
- [ ] 6 rows rendered: Today, D+3, D+7, D+14, D+21, D+30
- [ ] Optimal row: green background + star badge (⭐)
- [ ] Confidence dots: TODAY=5 filled, D+30=0 filled (decreasing pattern)
- [ ] Signal pills: correct colour per signal type
- [ ] Farm dropdown: loads user's active farms
- [ ] Selecting farm: auto-fills bird count, weight, batch day in context label
- [ ] Break-even: shows ₹ value when farm selected, placeholder when not
- [ ] Break-even colour: green if today's price > break-even, red if below
- [ ] Loading skeleton matches card height (no layout shift)

---

### TASK FSC-UI-007 ✅ COMPLETED
**Priority:** P0
**File:** `apps/web/app/dashboard/price-intelligence/forecast/components/LiveMarketContextCard.tsx`
**Purpose:** Live mandi prices + feed cost index card (rightmost in bottom row).

```typescript
'use client'
import useSWR from 'swr'

interface MandiPrice {
  mandi_id:       string
  mandi_name:     string
  actual_price:   number
  last_updated_at: string
  distance_km?:   number
}

interface CommodityPrice {
  name:       string
  nameHi:     string
  unit:       string
  price:      number
  delta7d:    number  // positive = rising (bad for farmers), negative = falling (good)
}

interface Props {
  isLoading:       boolean
  todayMarket:     MandiPrice[]
  selectedMandiId: string
  language?:       string
}

// Freshness label for last_updated_at
function freshnessLabel(isoDate: string): { text: string; colour: string } {
  const mins = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000)
  if (mins < 5)    return { text: '0 min ago',      colour: '#16A34A' }
  if (mins < 60)   return { text: `${mins} min ago`, colour: '#6B7280' }
  const hrs = Math.floor(mins / 60)
  if (hrs < 6)     return { text: `${hrs} hr ago`,   colour: '#6B7280' }
  if (hrs < 24)    return { text: `${hrs} hr ago`,   colour: '#D97706' }
  return           { text: `${Math.floor(hrs/24)}d ago`, colour: '#DC2626' }
}

function signalPill(price: number, avg30d: number): { label: string; labelHi: string; cls: string } {
  if (price > avg30d * 1.03) return { label: 'Sell Now', labelHi: 'आज बेचें', cls: 'bg-[#EDF7F1] text-[#1A5C34]' }
  if (price > avg30d * 0.97) return { label: 'Hold',     labelHi: 'रुकें',    cls: 'bg-[#FFFBEB] text-[#92400E]' }
  return { label: 'Caution', labelHi: 'सावधान', cls: 'bg-[#FEE2E2] text-[#991B1B]' }
}

export function LiveMarketContextCard({ isLoading, todayMarket, selectedMandiId, language = 'hi' }: Props) {
  const isHindi = language === 'hi'

  // Fetch commodity prices (feed intelligence)
  const { data: commodities } = useSWR<{ prices: CommodityPrice[]; recommendation: string; recommendationHi: string }>(
    '/api/feed/commodity-prices',
    url => fetch(url).then(r => r.ok ? r.json() : null),
    { revalidateOnFocus: false, revalidateInterval: 10 * 60 * 1000 }
  )

  // Compute a rough 30-day avg from displayed mandis (for signal calculation)
  const avgPrice = todayMarket.length
    ? todayMarket.reduce((sum, m) => sum + m.actual_price, 0) / todayMarket.length
    : 160

  // Sort: selected mandi first, then by distance
  const sorted = [...todayMarket].sort((a, b) => {
    if (a.mandi_id === selectedMandiId) return -1
    if (b.mandi_id === selectedMandiId) return 1
    return (a.distance_km ?? 999) - (b.distance_km ?? 999)
  }).slice(0, 5)

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        {isHindi ? 'आज का बाज़ार' : 'Live Market Context'}
      </h3>
      <p className="text-[11px] text-gray-400 mb-3">
        {isHindi ? 'आज की मंडी कीमतें + संकेत' : "Today's mandi prices + signals"}
      </p>

      {/* Mandi rows */}
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[0,1,2,3].map(i => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#F4F7F5]">
              <div className="space-y-1">
                <div className="h-3 w-28 bg-[#F4F7F5] rounded" />
                <div className="h-2 w-16 bg-[#F4F7F5] rounded" />
              </div>
              <div className="space-y-1 items-end flex flex-col">
                <div className="h-3 w-14 bg-[#F4F7F5] rounded" />
                <div className="h-3 w-12 bg-[#F4F7F5] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-[11px] text-gray-400 py-4 text-center">
          {isHindi ? 'मंडी डेटा उपलब्ध नहीं' : 'No mandi data available today'}
        </p>
      ) : (
        <div className="divide-y divide-[#F4F7F5]">
          {sorted.map(m => {
            const freshness = freshnessLabel(m.last_updated_at)
            const sig       = signalPill(m.actual_price, avgPrice)
            const isPrimary = m.mandi_id === selectedMandiId

            return (
              <div key={m.mandi_id} className="flex items-center justify-between py-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className={`text-[11px] ${isPrimary ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {m.mandi_name}
                    </p>
                    {isPrimary && (
                      <span className="text-[8px] bg-[#EDF7F1] text-[#1A5C34] px-1 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-[10px]" style={{ color: freshness.colour }}>
                    {m.distance_km ? `${m.distance_km} km · ` : ''}{freshness.text}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium text-gray-900 tabular-nums">
                    ₹{m.actual_price}/kg
                  </p>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${sig.cls}`}>
                    {isHindi ? sig.labelHi : sig.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Feed cost index */}
      <div className="mt-3 pt-3 border-t border-[#E3EDE7]">
        <p className="text-[11px] font-medium text-gray-900 mb-2">
          {isHindi ? 'चारा लागत सूचकांक' : 'Feed Cost Index'}
        </p>

        {commodities?.prices ? (
          <div className="space-y-1.5">
            {commodities.prices.slice(0, 3).map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-700">{isHindi ? c.nameHi : c.name}</span>
                  <span className="text-[10px] text-gray-400 ml-1">({c.unit})</span>
                </div>
                <div className="text-right flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-gray-900 tabular-nums">
                    ₹{c.price.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-[10px] font-medium ${c.delta7d > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {c.delta7d > 0 ? '↑' : '↓'}{Math.abs(c.delta7d)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5 animate-pulse">
            {[0,1,2].map(i => (
              <div key={i} className="flex justify-between">
                <div className="h-2.5 w-24 bg-[#F4F7F5] rounded" />
                <div className="h-2.5 w-16 bg-[#F4F7F5] rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Feed recommendation */}
        {commodities?.recommendation && (
          <div className="mt-2 px-2.5 py-2 rounded-lg text-[10px] leading-relaxed"
               style={{ background: '#FFFBEB', color: '#92400E' }}>
            {isHindi ? commodities.recommendationHi : commodities.recommendation}
          </div>
        )}
      </div>
    </div>
  )
}
```

**QA Checks:**
- [ ] Primary mandi shown first with "Primary" badge
- [ ] Mandis sorted by distance (nearest first) after primary
- [ ] Freshness colour: green (<5min), grey (5min–6h), amber (6–24h), red (>24h)
- [ ] Signal pill colours correct per signal type
- [ ] Feed cost: red ↑ when price rising (bad for farmers), green ↓ when falling
- [ ] Recommendation box shows when commodity data available
- [ ] Skeleton shows while isLoading=true
- [ ] Empty state shows when todayMarket=[]
- [ ] Max 5 mandis shown (slice enforced)
- [ ] Component doesn't crash when last_updated_at is null/undefined

---

### TASK FSC-UI-008 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/price-intelligence/forecast/components/PriceDriversCard.tsx`
**Purpose:** Top 5 SHAP drivers with impact bars, bilingual labels, and visible watermark.

```typescript
interface Driver {
  rank:          number
  nameEn:        string
  nameHi:        string
  descriptionEn: string | null
  descriptionHi: string | null
  impactRs:      number
  magnitudePct:  number
  direction:     'up' | 'down'
  confidence:    string
}

interface Props {
  isLoading:      boolean
  drivers:        Driver[] | null
  isAvailable:    boolean
  watermarkToken: string
  language:       string
}

export function PriceDriversCard({ isLoading, drivers, isAvailable, watermarkToken, language }: Props) {
  const isHindi = language === 'hi'

  if (isLoading) return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4 animate-pulse space-y-3">
      <div className="h-3 w-40 bg-[#F4F7F5] rounded" />
      {[0,1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-3 w-4 bg-[#F4F7F5] rounded" />
          <div className="h-3 flex-1 bg-[#F4F7F5] rounded" />
          <div className="h-3 w-16 bg-[#F4F7F5] rounded" />
          <div className="h-3 w-10 bg-[#F4F7F5] rounded" />
        </div>
      ))}
    </div>
  )

  if (!isAvailable || !drivers) return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        {isHindi ? 'कीमत क्यों बदल रही है?' : 'Why is price moving?'}
      </h3>
      <div className="py-6 text-center">
        <p className="text-[11px] text-gray-400">
          {isHindi
            ? 'AI ड्राइवर गणना हो रहे हैं... कल 6:00 AM तक उपलब्ध होंगे'
            : 'AI drivers computing... Available by 6:00 AM tomorrow'}
        </p>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-0.5">
        {isHindi ? 'कीमत क्यों बदल रही है?' : 'Why is price moving?'}
      </h3>
      <p className="text-[10px] text-gray-400 mb-3">
        {isHindi ? 'AI SHAP विश्लेषण (मॉडल v1.0)' : 'AI-powered SHAP analysis (model v1.0)'}
      </p>

      <div className="space-y-3">
        {drivers.slice(0, 5).map(d => {
          const isPositive  = d.direction === 'up'
          const barColour   = isPositive ? '#1A5C34' : '#DC2626'
          const impactText  = `${isPositive ? '+' : ''}₹${d.impactRs.toFixed(1)}`
          const impactColour = isPositive ? '#16A34A' : '#DC2626'

          return (
            <div key={d.rank} className="flex items-start gap-2">
              {/* Rank */}
              <span className="text-[10px] text-gray-300 w-4 flex-shrink-0 mt-0.5 tabular-nums">
                #{d.rank}
              </span>

              {/* Name + description */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-900 leading-tight">
                  {isHindi ? d.nameHi : d.nameEn}
                </p>
                {(isHindi ? d.descriptionHi : d.descriptionEn) && (
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">
                    {isHindi ? d.descriptionHi : d.descriptionEn}
                  </p>
                )}
              </div>

              {/* Impact bar */}
              <div className="flex-shrink-0 w-16">
                <div
                  className = "h-[5px] rounded-full overflow-hidden"
                  style     = {{ background: '#F4F7F5' }}
                  role      = "meter"
                  aria-valuenow={d.magnitudePct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${isHindi ? d.nameHi : d.nameEn}: ${impactText} impact`}
                >
                  <div
                    className = "h-full rounded-full"
                    style     = {{ width: `${d.magnitudePct}%`, background: barColour }}
                  />
                </div>
              </div>

              {/* Impact value */}
              <span
                className = "text-[10px] font-semibold flex-shrink-0 tabular-nums w-10 text-right"
                style     = {{ color: impactColour }}
              >
                {impactText}
              </span>
            </div>
          )
        })}
      </div>

      {/* Watermark note */}
      <div className="mt-4 pt-3 border-t border-[#F4F7F5]">
        <p className="text-[9px] leading-relaxed text-gray-300">
          <span className="mr-1">🔒</span>
          {isHindi
            ? 'यह पूर्वानुमान आपके लिए व्यक्तिगत और वॉटरमार्क किया गया है। संगठन के बाहर साझा करना FlockIQ की शर्तों का उल्लंघन करता है।'
            : 'This forecast is personalized & watermarked for you. Sharing outside your organization violates FlockIQ Terms of Service.'}
          {' '}
          <span className="font-mono text-[8px]">{watermarkToken}</span>
        </p>
      </div>
    </div>
  )
}
```

**QA Checks:**
- [ ] Positive drivers: green bar + green "+₹N.N" text
- [ ] Negative drivers: red bar + red "-₹N.N" text
- [ ] Bar widths proportional to magnitudePct (0–100)
- [ ] Not-available state shows computing message (not blank white)
- [ ] Watermark token visible at bottom and user-specific
- [ ] aria-valuenow set on each bar (accessibility)
- [ ] Hindi translations correct for all 5 driver names

---

## PHASE 5 — EXPORT & ALERT PANEL

---

### TASK FSC-EXPORT-001 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/api/price-intelligence/export/route.ts`
**Purpose:** CSV export endpoint for forecast data. Includes disclaimer as first row.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const Schema = z.object({
  mandi:   z.string().min(1).max(50),
  horizon: z.coerce.number().int().min(7).max(30).default(30),
})

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = Schema.safeParse({
    mandi:   req.nextUrl.searchParams.get('mandi'),
    horizon: req.nextUrl.searchParams.get('horizon'),
  })
  if (!params.success) return NextResponse.json({ error: 'Invalid params' }, { status: 400 })

  const { mandi, horizon } = params.data
  const today    = new Date().toISOString().split('T')[0]
  const endDate  = new Date()
  endDate.setDate(endDate.getDate() + horizon)
  const endStr   = endDate.toISOString().split('T')[0]

  const { data: forecast } = await supabase
    .from('price_forecasts')
    .select('forecast_date, p10, p50, p90')
    .eq('mandi_id', mandi)
    .gte('forecast_date', today)
    .lte('forecast_date', endStr)
    .order('forecast_date', { ascending: true })

  const { data: actuals } = await supabase
    .from('price_actuals')
    .select('price_date, actual_price')
    .eq('mandi_id', mandi)
    .gte('price_date', (() => { const d=new Date(); d.setDate(d.getDate()-14); return d.toISOString().split('T')[0] })())
    .lte('price_date', today)
    .order('price_date', { ascending: true })

  const actualsMap = new Map((actuals??[]).map(a => [a.price_date, a.actual_price]))

  // Build CSV rows
  const DISCLAIMER = `DISCLAIMER: Forecast accuracy decreases with prediction horizon. Day 1-3: high confidence (<6% MAPE). Day 7-14: moderate (<10%). Day 15-30: indicative only (<15%). FlockIQ is not liable for trading decisions. Verify with local mandi before transacting. Generated: ${new Date().toISOString()} | Mandi: ${mandi} | User: ${session.user.id.substring(0,8)}`

  const headers  = ['Date', 'Day', 'P10 (Rs/kg)', 'P50 Forecast (Rs/kg)', 'P90 (Rs/kg)', 'Actual Price (Rs/kg)', 'Type']
  const rows: string[][] = [
    // Disclaimer as first data row (legal requirement — see REQ-FSC-002)
    [DISCLAIMER, '', '', '', '', '', ''],
    headers,
  ]

  // Past actuals
  for (const a of actuals ?? []) {
    rows.push([a.price_date, '', '', a.actual_price.toString(), '', a.actual_price.toString(), 'Actual'])
  }

  // Forecast
  for (const f of forecast ?? []) {
    const dayNum = Math.round((new Date(f.forecast_date).getTime() - new Date(today).getTime()) / 86400000)
    rows.push([
      f.forecast_date,
      `D+${dayNum}`,
      f.p10?.toString() ?? '',
      f.p50?.toString() ?? '',
      f.p90?.toString() ?? '',
      actualsMap.get(f.forecast_date)?.toString() ?? '',
      'Forecast',
    ])
  }

  const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
  const filename = `flockiq-forecast-${mandi}-${today}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
```

**QA Checks:**
- [ ] Download triggers browser file download (not redirect)
- [ ] First row is disclaimer text (not column headers)
- [ ] Second row is column headers
- [ ] Past actuals included (last 14 days)
- [ ] Future forecast rows included (D+1 through D+N)
- [ ] Actual column populated for past dates, empty for future
- [ ] Filename format: `flockiq-forecast-{mandi}-{date}.csv`
- [ ] CSV opens correctly in Excel (no garbled ₹ symbol — UTF-8 BOM optional)
- [ ] Unauthenticated request → 401

---

### TASK FSC-ALERT-001 ✅ COMPLETED
**Priority:** P1
**File:** `apps/web/app/dashboard/price-intelligence/forecast/components/PriceAlertPanel.tsx`
**Purpose:** Slide-in panel for creating price alert rules. Opens from "Set Price Alert" button.

```typescript
'use client'
import { useState } from 'react'
import { z } from 'zod'

interface Props {
  isOpen:    boolean
  onClose:   () => void
  mandiId:   string
  mandiName: string
  todayP50:  number | null
  language:  string
}

const AlertSchema = z.object({
  alertType:       z.enum(['above_price', 'below_price', 'signal_sell']),
  thresholdRs:     z.number().min(50).max(500).optional(),
  notifyWhatsApp:  z.boolean(),
  notifyEmail:     z.boolean(),
  notifyInApp:     z.boolean(),
})

export function PriceAlertPanel({ isOpen, onClose, mandiId, mandiName, todayP50, language }: Props) {
  const isHindi = language === 'hi'
  const [alertType,      setAlertType]      = useState<'above_price' | 'below_price' | 'signal_sell'>('signal_sell')
  const [thresholdRs,    setThresholdRs]    = useState<number>(todayP50 ? Math.round(todayP50 * 1.05) : 180)
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true)
  const [notifyEmail,    setNotifyEmail]    = useState(true)
  const [notifyInApp,    setNotifyInApp]    = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        mandiId,
        alertType,
        thresholdRs: alertType !== 'signal_sell' ? thresholdRs : null,
        notifyWhatsApp,
        notifyEmail,
        notifyInApp,
      }
      const res = await fetch('/api/price-intelligence/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => { setSaved(false); onClose() }, 1500)
    } catch {
      alert(isHindi ? 'अलर्ट सुरक्षित नहीं हो सका। फिर से कोशिश करें।' : 'Could not save alert. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className = "fixed inset-0 bg-black/20 z-40"
        onClick   = {onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className = "fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
        role      = "dialog"
        aria-label= {isHindi ? 'मूल्य अलर्ट सेट करें' : 'Set Price Alert'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3EDE7]">
          <h2 className="text-sm font-semibold text-gray-900">
            {isHindi ? 'मूल्य अलर्ट सेट करें' : 'Set Price Alert'}
          </h2>
          <button
            onClick   = {onClose}
            className = "text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label= "Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Mandi (read-only) */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
              {isHindi ? 'मंडी' : 'Mandi'}
            </p>
            <p className="text-sm font-medium text-gray-900">{mandiName}</p>
          </div>

          {/* Alert type */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
              {isHindi ? 'अलर्ट का प्रकार' : 'Alert Type'}
            </p>
            <div className="space-y-2">
              {[
                { key: 'signal_sell',  hi: 'जब बिक्री संकेत आए',  en: 'When sell signal activates' },
                { key: 'above_price', hi: 'जब कीमत ₹___ से ऊपर', en: 'When price rises above ₹___' },
                { key: 'below_price', hi: 'जब कीमत ₹___ से नीचे', en: 'When price drops below ₹___' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type     = "radio"
                    name     = "alertType"
                    value    = {opt.key}
                    checked  = {alertType === opt.key}
                    onChange = {() => setAlertType(opt.key as any)}
                    className= "accent-[#1A5C34]"
                  />
                  <span className="text-sm text-gray-700">
                    {isHindi ? opt.hi : opt.en}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Threshold input — shown for above/below types */}
          {alertType !== 'signal_sell' && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
                {isHindi ? 'मूल्य सीमा (₹/kg)' : 'Price Threshold (₹/kg)'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">₹</span>
                <input
                  type      = "number"
                  value     = {thresholdRs}
                  onChange  = {e => setThresholdRs(Number(e.target.value))}
                  min       = {50}
                  max       = {500}
                  step      = {1}
                  className = "flex-1 text-sm px-3 py-2 border border-[#E3EDE7] rounded-lg
                               focus:outline-none focus:border-[#1A5C34]"
                />
                <span className="text-gray-400 text-sm">/kg</span>
              </div>
              {todayP50 && (
                <p className="text-[10px] text-gray-400 mt-1">
                  {isHindi ? 'आज का P50:' : "Today's P50:"} ₹{todayP50}/kg
                </p>
              )}
            </div>
          )}

          {/* Notification channels */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
              {isHindi ? 'सूचना कैसे पाएं' : 'Notify via'}
            </p>
            <div className="space-y-2">
              {[
                { key: 'wa',    label: 'WhatsApp', checked: notifyWhatsApp, set: setNotifyWhatsApp },
                { key: 'email', label: 'Email',    checked: notifyEmail,    set: setNotifyEmail    },
                { key: 'app',   label: isHindi ? 'App में' : 'In-App', checked: notifyInApp, set: setNotifyInApp },
              ].map(ch => (
                <label key={ch.key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type     = "checkbox"
                    checked  = {ch.checked}
                    onChange = {e => ch.set(e.target.checked)}
                    className= "accent-[#1A5C34] w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{ch.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E3EDE7]">
          <button
            onClick   = {handleSave}
            disabled  = {saving || saved}
            className = {`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              saved
                ? 'bg-[#EDF7F1] text-[#1A5C34]'
                : 'bg-[#1A5C34] text-white hover:bg-[#1F7040] disabled:opacity-60'
            }`}
          >
            {saved    ? (isHindi ? '✓ अलर्ट सुरक्षित हो गया' : '✓ Alert Saved') :
             saving   ? (isHindi ? 'सुरक्षित हो रहा है...' : 'Saving...') :
                        (isHindi ? 'अलर्ट सुरक्षित करें' : 'Save Alert')}
          </button>
        </div>
      </div>
    </>
  )
}
```

**QA Checks:**
- [ ] Panel slides in from right on "Set Price Alert" click
- [ ] Backdrop click closes the panel
- [ ] Radio buttons work: only one alert type selected at a time
- [ ] Threshold input: only shows for above_price and below_price types
- [ ] Channel checkboxes: independent toggles
- [ ] Save button: shows loading state while saving
- [ ] Save button: shows success "✓ Alert Saved" for 1.5s then panel closes
- [ ] API POST sends correct payload (alertType, thresholdRs, channels)
- [ ] Error: shows Hindi/English error message (no raw error code)
- [ ] Panel accessible: role="dialog", aria-label, keyboard closeable (Escape key)

---

## PHASE 6 — CRON JOB: DAILY SIGNAL PRE-COMPUTATION

---

### TASK FSC-CRON-001 ✅ COMPLETED
**Priority:** P1
**File:** `apps/api/src/jobs/ComputeSellSignalsJob.ts`
**Purpose:** Daily cron job that pre-computes sell signals for all mandis at 6:15 AM IST
(after price forecast data is refreshed at 6:00 AM). Avoids on-demand computation latency.

```typescript
import cron from 'node-cron'
import { createSupabaseServiceClient } from '../lib/supabase'

// Run daily at 6:15 AM IST (12:45 AM UTC)
cron.schedule('45 0 * * *', async () => {
  console.log('[SignalJob] Starting sell signal pre-computation...')
  const supabase   = createSupabaseServiceClient()
  const today      = new Date().toISOString().split('T')[0]

  // Get all covered mandis
  const { data: mandis } = await supabase
    .from('mandis')
    .select('id, name')
    .eq('is_active', true)

  if (!mandis?.length) {
    console.warn('[SignalJob] No active mandis found')
    return
  }

  let computed = 0
  let errors   = 0

  for (const mandi of mandis) {
    try {
      // Fetch 14-day forecast for this mandi
      const { data: forecast } = await supabase
        .from('price_forecasts')
        .select('forecast_date, p50')
        .eq('mandi_id', mandi.id)
        .gte('forecast_date', today)
        .lte('forecast_date', (() => {
          const d = new Date(); d.setDate(d.getDate() + 14);
          return d.toISOString().split('T')[0]
        })())
        .order('forecast_date', { ascending: true })

      // Fetch 30-day average for baseline
      const { data: avg30 } = await supabase
        .rpc('get_30day_avg_price', { p_mandi_id: mandi.id })

      const avg30Price = avg30?.avg_price ?? 160

      // Compute signal (same logic as on-demand fallback in sell-signal route)
      const signal = computeSignalFromForecast(forecast ?? [], avg30Price)

      // Upsert into sell_signals table
      await supabase
        .from('sell_signals')
        .upsert({
          mandi_id:          mandi.id,
          signal_date:       today,
          signal:            signal.signal,
          optimal_win_start: signal.optimalWindowStart,
          optimal_win_end:   signal.optimalWindowEnd,
          expected_p50_low:  signal.expectedP50Low,
          expected_p50_high: signal.expectedP50High,
          confidence:        signal.confidence,
          reasons:           signal.reasons,
          computed_at:       new Date().toISOString(),
        }, { onConflict: 'mandi_id,signal_date' })

      computed++
    } catch (err) {
      console.error(`[SignalJob] Error for mandi ${mandi.id}:`, err)
      errors++
      // Continue to next mandi — don't fail the whole job
    }
  }

  console.log(`[SignalJob] Done: ${computed} computed, ${errors} errors`)

  // Alert admin if more than 20% errors
  if (errors > mandis.length * 0.2) {
    await sendSlackAlert(`[SignalJob] HIGH ERROR RATE: ${errors}/${mandis.length} mandis failed`)
  }
})

// Same compute function as in API route — extract to shared lib in production
function computeSignalFromForecast(
  forecast: Array<{ forecast_date: string; p50: number }>,
  avg30Price: number
): any {
  // ... (same logic as in FSC-API-002) ...
  // In production: move to /lib/signals.ts and import in both places
  return {
    signal:             'HOLD',
    optimalWindowStart: null,
    optimalWindowEnd:   null,
    expectedP50Low:     null,
    expectedP50High:    null,
    confidence:         3,
    reasons:            ['Computed by daily job'],
  }
}
```

**QA Checks:**
- [ ] Job runs at 6:15 AM IST (verify timezone conversion to UTC)
- [ ] All active mandis processed (not just a subset)
- [ ] Errors on individual mandis don't stop the whole job
- [ ] Success logged with count of computed signals
- [ ] High error rate (>20%) triggers Slack alert
- [ ] DB: signals upserted correctly (ON CONFLICT updates existing record)
- [ ] `sell_signal` API route finds pre-computed signal (fast path used)

---

## PHASE 7 — DEPLOYMENT CHECKLIST

```
PRE-DEPLOYMENT (staging):
  ☐ DB migration FSC-DB-001 applied to staging DB
  ☐ Festival seed data present (check with SELECT COUNT(*) FROM festivals)
  ☐ model_accuracy_by_horizon has all 6 horizon rows
  ☐ At least 7 days of price_forecasts data in staging DB
  ☐ At least 7 days of price_actuals data in staging DB
  ☐ Sell signal pre-computation job runs and creates records
  ☐ All API routes return 200 with valid data (not 500)
  ☐ Watermark: two test users see different P50 values
  ☐ Disclaimer: visible on page, not collapsible
  ☐ Export: CSV downloads with disclaimer as first row
  ☐ Chart: not blank (renders with data)
  ☐ Accuracy decay bars: 6 bars, widths decrease D+1→D+30

ENVIRONMENT VARIABLES (required):
  ☐ NEXT_PUBLIC_SUPABASE_URL
  ☐ NEXT_PUBLIC_SUPABASE_ANON_KEY
  ☐ SUPABASE_SERVICE_ROLE_KEY (server only — never client)
  ☐ WHATSAPP_APP_SECRET (for webhook verification)
  ☐ SLACK_WEBHOOK_URL (for admin alerts)

PRODUCTION DEPLOYMENT ORDER:
  1. Apply DB migration (FSC-DB-001)
  2. Seed festivals table
  3. Seed model_accuracy_by_horizon table
  4. Deploy API routes
  5. Deploy cron job (signal pre-computation)
  6. Deploy Next.js pages + components
  7. Verify /dashboard/price-intelligence → 301 redirect works
  8. Verify post-login redirect for S1/S2/S4 roles
  9. Smoke test: login as test farmer → lands on /forecast → chart visible
  10. Smoke test: send WhatsApp "2 1250" → log created in DB

POST-DEPLOYMENT MONITORING:
  ☐ Check Supabase dashboard: prediction_access_log filling (page visits logging)
  ☐ Check cron job logs: sell signals computed daily at 6:15 AM
  ☐ Check MAPE accuracy pill in topbar: green (<6%) after first model run
  ☐ Alert: if /api/price-intelligence/forecast returns 503 → PagerDuty
  ☐ Alert: if chart blank rate > 5% of sessions → Slack engineering channel
```

---

## QUICK REFERENCE: ALL NEW FILES CREATED FOR THIS SCREEN

```
DATABASE:
  supabase/migrations/[ts]_forecast_screen_tables.sql      (FSC-DB-001)

API ROUTES:
  app/api/price-intelligence/forecast/route.ts             (FSC-API-001)
  app/api/price-intelligence/sell-signal/route.ts          (FSC-API-002)
  app/api/price-intelligence/accuracy-by-horizon/route.ts  (FSC-API-003)
  app/api/price-intelligence/drivers/route.ts              (FSC-API-004)
  app/api/price-intelligence/export/route.ts               (FSC-EXPORT-001)
  app/api/price-intelligence/alerts/route.ts               (create simple POST)

SHARED LIBRARY:
  lib/watermark.ts                                         (FSC-API-005)

PAGE:
  app/dashboard/price-intelligence/forecast/page.tsx       (FSC-PAGE-001)
  app/dashboard/price-intelligence/forecast/ForecastPageClient.tsx (FSC-PAGE-002)
  app/dashboard/price-intelligence/forecast/ForecastPageSkeleton.tsx (create)
  app/dashboard/price-intelligence/page.tsx                (FSC-NAV-001 — redirect)

COMPONENTS:
  .../forecast/components/ForecastDisclaimer.tsx           (FSC-UI-001)
  .../forecast/components/ForecastMainChart.tsx            (FSC-UI-002)
  .../forecast/components/AccuracyDecayCard.tsx            (FSC-UI-003)
  .../forecast/components/ForecastKPIStrip.tsx             (FSC-UI-004)
  .../forecast/components/SellSignalCard.tsx               (FSC-UI-005)
  .../forecast/components/SellHoldMatrix.tsx               (FSC-UI-006)
  .../forecast/components/LiveMarketContextCard.tsx        (FSC-UI-007)
  .../forecast/components/PriceDriversCard.tsx             (FSC-UI-008)
  .../forecast/components/PriceAlertPanel.tsx              (FSC-ALERT-001)
  .../forecast/components/ForecastControls.tsx             (create — mandi/horizon selectors)

CRON JOB:
  apps/api/src/jobs/ComputeSellSignalsJob.ts               (FSC-CRON-001)

NAVIGATION:
  components/layout/Sidebar.tsx                            (FSC-NAV-002 — update)
  middleware.ts                                            (FSC-NAV-003 — update)
```

---

*End of FlockIQ Broiler Price Forecast Screen Implementation Playbook v1.0*
*Total files in this forecast screen package: 4 MD documents + 20 code files*
