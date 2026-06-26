'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { FeatureGate } from '@/components/plans/FeatureGate'
import { FEATURES } from '@/lib/plans/featureGates'

interface TimelinePoint {
  date: string
  p50: number | null
  isForecast: boolean
}

interface Props {
  isLoading: boolean
  timeline: TimelinePoint[]
  signal: any
  language: string
}

const HORIZON_CONFIDENCE = [5, 4, 4, 3, 2, 1] // TODAY,D+3,D+7,D+14,D+21,D+30

function getHorizonSignal(p50: number | null, todayP50: number | null): 'SELL_NOW' | 'HOLD' | 'CAUTION' {
  if (!p50 || !todayP50) return 'HOLD'
  const diff = p50 - todayP50
  if (diff >= 2) return 'HOLD'
  if (diff >= -2) return 'SELL_NOW'
  return 'CAUTION'
}

const SIGNAL_LABELS = {
  SELL_NOW: { hi: 'आज बेचें', en: 'Sell Now', cls: 'bg-[#EDF7F1] text-[#1A5C34]' },
  HOLD: { hi: 'रुकें', en: 'Hold', cls: 'bg-[#FFFBEB] text-[#92400E]' },
  CAUTION: { hi: 'सावधान', en: 'Caution', cls: 'bg-[#FEE2E2] text-[#991B1B]' },
}

export function SellHoldMatrix({ isLoading, timeline, signal, language }: Props) {
  const isHindi = language === 'hi'
  const [selectedFarmId, setSelectedFarmId] = useState<string>('')
  const [breakEven, setBreakEven] = useState<number | null>(null)
  const [birdCount, setBirdCount] = useState<number>(25000)
  const [avgWeightKg, setAvgWeightKg] = useState<number>(1.68)
  const [batchDay, setBatchDay] = useState<number>(21)

  const { data: farms } = useSWR('/api/farms?status=active&fields=id,name,currentBatch', (url) =>
    fetch(url).then((r) => (r.ok ? r.json() : null))
  )

  const { data: farmData } = useSWR(
    selectedFarmId ? `/api/farms/${selectedFarmId}/calculator-data` : null,
    (url) => fetch(url).then((r) => (r.ok ? r.json() : null))
  )

  const { data: gcData } = useSWR(
    selectedFarmId ? `/api/farms/${selectedFarmId}/gc` : null,
    (url) => fetch(url).then((r) => (r.ok ? r.json() : null))
  )

  useEffect(() => {
    if (farmData) {
      setBirdCount(farmData.birdsAlive ?? 25000)
      setAvgWeightKg((farmData.avgWeightG ?? 1680) / 1000)
      setBatchDay(farmData.batchDayNumber ?? 21)
    }
  }, [farmData])

  useEffect(() => {
    if (gcData?.gc?.gcPerKg) {
      setBreakEven(gcData.gc.gcPerKg)
    }
  }, [gcData])

  const today = new Date().toISOString().split('T')[0]
  const todayP50 =
    timeline.find((t) => t.date === today)?.p50 ??
    timeline.filter((t) => !t.isForecast).slice(-1)[0]?.p50 ??
    null

  const HORIZONS = [
    { label: isHindi ? 'आज' : 'Today', days: 0, confIdx: 0 },
    { label: 'D+3', days: 3, confIdx: 1 },
    { label: 'D+7', days: 7, confIdx: 2 },
    { label: 'D+14', days: 14, confIdx: 3 },
    { label: 'D+21', days: 21, confIdx: 4 },
    { label: 'D+30', days: 30, confIdx: 5 },
  ]

  const getP50ForDays = (days: number): number | null => {
    const target = new Date()
    target.setDate(target.getDate() + days)
    const targetStr = target.toISOString().split('T')[0]
    const exact = timeline.find((t) => t.date === targetStr)
    if (exact) return exact.p50
    const nearest = timeline
      .filter((t) => t.isForecast && t.date >= targetStr)
      .sort((a, b) => a.date.localeCompare(b.date))[0]
    return nearest?.p50 ?? null
  }

  const FEED_COST_PER_DAY_RS = 0.5 * birdCount * avgWeightKg
  const optimalIdx = HORIZONS.reduce((bestIdx, _, i) => {
    const p50i = getP50ForDays(HORIZONS[i].days)
    const p50best = getP50ForDays(HORIZONS[bestIdx].days)
    if (!p50i || !p50best) return bestIdx
    const netI = p50i * birdCount * avgWeightKg - FEED_COST_PER_DAY_RS * HORIZONS[i].days
    const netBest = p50best * birdCount * avgWeightKg - FEED_COST_PER_DAY_RS * HORIZONS[bestIdx].days
    return netI > netBest ? i : bestIdx
  }, 0)

  if (isLoading)
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-4 animate-pulse space-y-2">
        <div className="h-3 w-32 bg-[#F4F7F5] rounded mb-3" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
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

      <div className="mb-3">
        <p className="text-[10px] text-gray-400 mb-1.5">
          {isHindi ? 'Farm चुनें (optional):' : 'Load from Farm (optional):'}
        </p>
        <select
          value={selectedFarmId}
          onChange={(e) => setSelectedFarmId(e.target.value)}
          className="w-full text-[11px] px-2 py-1.5 border border-[#E3EDE7] rounded-lg bg-white text-gray-700 focus:outline-none focus:border-[#1A5C34]"
        >
          <option value="">
            {birdCount.toLocaleString('en-IN')} {isHindi ? 'पक्षी' : 'birds'} · Day {batchDay} · {avgWeightKg.toFixed(2)} kg
          </option>
          {(farms?.farms ?? []).map((f: any) => (
            <option key={f.id} value={f.id}>
              {f.name} — Batch #{f.currentBatch?.batchNumber ?? '?'} · Day {f.currentBatch?.dayNumber ?? '?'}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        {HORIZONS.map((h, i) => {
          const p50 = getP50ForDays(h.days)
          const sigKey = getHorizonSignal(p50, todayP50)
          const sigCfg = SIGNAL_LABELS[sigKey]
          const confDots = HORIZON_CONFIDENCE[h.confIdx]
          const isOptimal = i === optimalIdx

          return (
            <div
              key={h.days}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors ${
                isOptimal ? 'bg-[#EDF7F1] border border-[#3DAE72]' : 'hover:bg-[#F4F7F5]'
              }`}
            >
              <div className="w-16 flex-shrink-0 flex items-center gap-1">
                <span className="text-[11px] font-medium text-gray-800">{h.label}</span>
                {isOptimal && (
                  <span className="text-[8px] bg-[#1A5C34] text-white px-1 py-0.5 rounded-full leading-none">
                    ⭐
                  </span>
                )}
              </div>

              <span className="text-[11px] font-medium text-gray-900 tabular-nums w-14 flex-shrink-0">
                {p50 ? `₹${p50}/kg` : '—'}
              </span>

              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${sigCfg.cls}`}>
                {isHindi ? sigCfg.hi : sigCfg.en}
              </span>

              <FeatureGate feature={FEATURES.SELL_HOLD_MATRIX_AI} blurChildren>
                <div className="flex gap-1 ml-auto">
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: dot <= confDots ? '#1A5C34' : '#E3EDE7' }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </FeatureGate>
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-[#E3EDE7]">
        <p className="text-[10px] text-gray-400 mb-1">
          {isHindi ? 'लागत मूल्य (GC)' : 'Break-even (GC)'}
        </p>
        {breakEven ? (
          <>
            <p className="text-xl font-medium text-gray-900 tabular-nums">₹{breakEven}/kg</p>
            {todayP50 && (
              <>
                <p
                  className={`text-[11px] mt-0.5 font-medium ${
                    todayP50 > breakEven ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isHindi ? 'वर्तमान मार्जिन' : 'Current margin'}: {todayP50 > breakEven ? '+' : ''}₹{Math.abs(todayP50 - breakEven).toFixed(2)}/kg
                </p>
                {gcData?.gc?.estimatedProfit !== null && (
                  <p
                    className={`text-[11px] mt-0.5 font-medium ${
                      gcData.gc.estimatedProfit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isHindi ? 'आज बेचने पर बैच लाभ' : 'Batch profit if sold today'}: ₹{(gcData.gc.estimatedProfit / 100000).toFixed(2)}L
                  </p>
                )}
              </>
            )}
          </>
        ) : (
          <p className="text-[11px] text-gray-400">
            {isHindi ? 'Farm डेटा चुनें लागत जानने के लिए' : 'Select a farm above to calculate break-even'}
          </p>
        )}
      </div>
    </div>
  )
}
