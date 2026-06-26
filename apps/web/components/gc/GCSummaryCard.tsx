'use client'
import useSWR from 'swr'
import { gcStatusColour, gcStatusLabel, INDUSTRY_BENCHMARK_GC_PER_KG } from '@/lib/types/gc'

interface GCSummaryCardProps {
  farmId:   string
  size?:    'mini' | 'standard' | 'full'  // mini = portfolio card, standard = farm header, full = GC tab
  language?: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function GCSummaryCard({ farmId, size = 'standard', language = 'hi' }: GCSummaryCardProps) {
  const isHindi = language === 'hi'
  const { data, isLoading } = useSWR(`/api/farms/${farmId}/gc`, fetcher, {
    revalidateOnFocus: true,
    revalidateInterval: 5 * 60 * 1000,
  })

  const gc = data?.gc

  // ── MINI VERSION (for farm cards in portfolio) ────────────────────────────
  if (size === 'mini') {
    if (isLoading) return <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
    if (!gc)       return null
    const colour = gcStatusColour(gc.gcPerKg)
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-500">GC:</span>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: colour }}>
          ₹{gc.gcPerKg.toFixed(0)}/kg
        </span>
        {gc.margin !== null && (
          <span className={`text-[10px] ${gc.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({gc.margin > 0 ? '+' : ''}₹{gc.margin.toFixed(0)} {isHindi ? 'मार्जिन' : 'margin'})
          </span>
        )}
      </div>
    )
  }

  // ── STANDARD VERSION (for farm detail header / GC tab summary) ────────────
  if (isLoading) return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-7 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )

  if (!gc || !gc.gcPerKg) return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-5 text-center py-8">
      <p className="text-sm text-gray-400">
        {isHindi ? 'GC डेटा उपलब्ध नहीं — DOC और चारा लागत दर्ज करें' : 'GC data not available — enter DOC and feed costs to compute'}
      </p>
    </div>
  )

  const colour    = gcStatusColour(gc.gcPerKg)
  const status    = gcStatusLabel(gc.gcPerKg)
  const vsIndStr  = gc.vsIndustry >= 0
    ? `+₹${gc.vsIndustry.toFixed(0)} ${isHindi ? 'बेंचमार्क से ऊपर' : 'above benchmark'}`
    : `-₹${Math.abs(gc.vsIndustry).toFixed(0)} ${isHindi ? 'बेंचमार्क से नीचे' : 'below benchmark'}`
  const vsIndColour = gc.vsIndustry <= 0 ? '#16A34A' : '#DC2626'

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {isHindi ? 'Growing Cost (GC)' : 'Growing Cost (GC)'}
          </h3>
          <p className="text-[11px] text-gray-400">
            {isHindi ? 'प्रति किलो जीवित वजन उत्पादन लागत' : 'Total cost per kg live weight produced'}
          </p>
        </div>
        <span
          className="text-[11px] font-medium px-2.5 py-1 rounded-full"
          style={{ background: colour + '1A', color: colour }}
        >
          {isHindi ? status.hi : status.en}
        </span>
      </div>

      {/* Primary GC metric */}
      <div className="flex items-end gap-4 mb-4 pb-4 border-b border-[#E3EDE7]">
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">{isHindi ? 'GC प्रति किलो' : 'GC per kg'}</p>
          <p className="text-3xl font-bold tabular-nums" style={{ color: colour }}>
            ₹{gc.gcPerKg.toFixed(2)}
            <span className="text-base font-normal text-gray-400">/kg</span>
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: vsIndColour }}>{vsIndStr}</p>
        </div>
        {gc.margin !== null && (
          <div className="ml-6">
            <p className="text-[10px] text-gray-400 mb-0.5">
              {isHindi ? 'वर्तमान मार्जिन' : 'Current margin'}
            </p>
            <p className={`text-2xl font-bold tabular-nums ${gc.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gc.margin > 0 ? '+' : ''}₹{gc.margin.toFixed(2)}/kg
            </p>
            <p className="text-[11px] text-gray-400">
              {isHindi ? 'बाज़ार भाव ₹' : 'at market ₹'}{gc.targetSellPriceP50}/kg
            </p>
          </div>
        )}
        {gc.estimatedProfit !== null && (
          <div className="ml-auto text-right">
            <p className="text-[10px] text-gray-400 mb-0.5">
              {isHindi ? 'अनुमानित बैच लाभ' : 'Est. batch profit'}
            </p>
            <p className={`text-xl font-bold tabular-nums ${gc.estimatedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(gc.estimatedProfit / 100000).toFixed(2)}L
            </p>
            <p className="text-[10px] text-gray-400">
              {gc.liveKgs.toFixed(0)} kg live weight
            </p>
          </div>
        )}
      </div>

      {/* Cost breakdown grid — 5 columns */}
      {size === 'full' && (
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[
            { label: isHindi ? 'DOC' : 'DOC',         labelHi: 'DOC लागत',          value: gc.docCost,         pct: gc.totalCost > 0 ? (gc.docCost / gc.totalCost * 100) : 0, key: 'doc' },
            { label: isHindi ? 'चारा' : 'Feed',       labelHi: 'चारा लागत',          value: gc.feedCost,        pct: gc.totalCost > 0 ? (gc.feedCost / gc.totalCost * 100) : 0, key: 'feed' },
            { label: isHindi ? 'दवाई' : 'Medicine',   labelHi: 'दवाई + टीका',        value: gc.medicineCost + gc.vaccineCost, pct: gc.totalCost > 0 ? ((gc.medicineCost + gc.vaccineCost) / gc.totalCost * 100) : 0, key: 'medicine' },
            { label: isHindi ? 'मजदूरी' : 'Labour',   labelHi: 'मजदूरी लागत',        value: gc.labourCost,      pct: gc.totalCost > 0 ? (gc.labourCost / gc.totalCost * 100) : 0, key: 'labour' },
            { label: isHindi ? 'अन्य' : 'Other',      labelHi: 'बिजली+पानी+अन्य',   value: gc.electricityCost + gc.waterCost + gc.miscCost + gc.fixedOverhead, pct: gc.totalCost > 0 ? ((gc.electricityCost + gc.waterCost + gc.miscCost + gc.fixedOverhead) / gc.totalCost * 100) : 0, key: 'other' },
          ].map(item => {
            // Highlight feed cost if above normal (>65% of total cost)
            const isFeedAboveNormal = item.key === 'feed' && item.pct > 65;
            return (
              <div 
                key={item.key} 
                className={`rounded-lg p-3 ${isFeedAboveNormal ? 'bg-red-50 border border-red-200' : 'bg-[#F4F7F5]'}`}
              >
                <p className="text-[10px] text-gray-500 mb-1">{item.label}</p>
                <p className={`text-sm font-semibold tabular-nums ${isFeedAboveNormal ? 'text-red-700' : 'text-gray-900'}`}>
                  ₹{(item.value / 1000).toFixed(1)}K
                </p>
                <p className={`text-[10px] ${isFeedAboveNormal ? 'text-red-600' : 'text-gray-400'}`}>
                  {item.pct.toFixed(0)}% of total
                  {isFeedAboveNormal && (
                    <span className="ml-1">⚠️</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Industry benchmark comparison bar */}
      <div>
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>{isHindi ? 'उद्योग बेंचमार्क: ₹95/kg' : 'Industry benchmark: ₹95/kg'}</span>
          <span>{isHindi ? 'आपका GC: ₹' : 'Your GC: ₹'}{gc.gcPerKg.toFixed(0)}/kg</span>
        </div>
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          {/* Benchmark marker */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
               style={{ left: `${(INDUSTRY_BENCHMARK_GC_PER_KG / 150) * 100}%` }} />
          {/* GC fill */}
          <div className="absolute top-0 left-0 bottom-0 rounded-full"
               style={{ width: `${Math.min((gc.gcPerKg / 150) * 100, 100)}%`, background: colour }} />
        </div>
        <div className="flex justify-between text-[9px] text-gray-300 mt-0.5">
          <span>₹0</span>
          <span>₹75</span>
          <span>₹95↑</span>
          <span>₹112</span>
          <span>₹150</span>
        </div>
      </div>
    </div>
  )
}
