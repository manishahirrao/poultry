'use client'

import useSWR from 'swr'

interface MandiPrice {
  mandi_id: string
  mandi_name: string
  actual_price: number
  last_updated_at: string
  distance_km?: number
}

interface CommodityPrice {
  name: string
  nameHi: string
  unit: string
  price: number
  delta7d: number
}

interface Props {
  isLoading: boolean
  todayMarket: MandiPrice[]
  selectedMandiId: string
  language?: string
}

function freshnessLabel(isoDate: string): { text: string; colour: string } {
  const mins = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000)
  if (mins < 5) return { text: '0 min ago', colour: '#16A34A' }
  if (mins < 60) return { text: `${mins} min ago`, colour: '#6B7280' }
  const hrs = Math.floor(mins / 60)
  if (hrs < 6) return { text: `${hrs} hr ago`, colour: '#6B7280' }
  if (hrs < 24) return { text: `${hrs} hr ago`, colour: '#D97706' }
  return { text: `${Math.floor(hrs / 24)}d ago`, colour: '#DC2626' }
}

function signalPill(price: number, avg30d: number): { label: string; labelHi: string; cls: string } {
  if (price > avg30d * 1.03) return { label: 'Sell Now', labelHi: 'आज बेचें', cls: 'bg-[#EDF7F1] text-[#1A5C34]' }
  if (price > avg30d * 0.97) return { label: 'Hold', labelHi: 'रुकें', cls: 'bg-[#FFFBEB] text-[#92400E]' }
  return { label: 'Caution', labelHi: 'सावधान', cls: 'bg-[#FEE2E2] text-[#991B1B]' }
}

export function LiveMarketContextCard({ isLoading, todayMarket, selectedMandiId, language = 'hi' }: Props) {
  const isHindi = language === 'hi'

  const { data: commodities } = useSWR<{ prices: CommodityPrice[]; recommendation: string; recommendationHi: string }>(
    '/api/feed/commodity-prices',
    (url) => fetch(url).then((r) => (r.ok ? r.json() : null)),
    { revalidateOnFocus: false, refreshInterval: 10 * 60 * 1000 }
  )

  const avgPrice = todayMarket.length ? todayMarket.reduce((sum, m) => sum + m.actual_price, 0) / todayMarket.length : 160

  const sorted = [...todayMarket]
    .sort((a, b) => {
      if (a.mandi_id === selectedMandiId) return -1
      if (b.mandi_id === selectedMandiId) return 1
      return (a.distance_km ?? 999) - (b.distance_km ?? 999)
    })
    .slice(0, 5)

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        {isHindi ? 'आज का बाज़ार' : 'Live Market Context'}
      </h3>
      <p className="text-[11px] text-gray-400 mb-3">
        {isHindi ? 'आज की मंडी कीमतें + संकेत' : "Today's mandi prices + signals"}
      </p>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
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
          {sorted.map((m) => {
            const freshness = freshnessLabel(m.last_updated_at)
            const sig = signalPill(m.actual_price, avgPrice)
            const isPrimary = m.mandi_id === selectedMandiId

            return (
              <div key={m.mandi_id} className="flex items-center justify-between py-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className={`text-[11px] ${isPrimary ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {m.mandi_name}
                    </p>
                    {isPrimary && (
                      <span className="text-[8px] bg-[#EDF7F1] text-[#1A5C34] px-1 py-0.5 rounded">Primary</span>
                    )}
                  </div>
                  <p className="text-[10px]" style={{ color: freshness.colour }}>
                    {m.distance_km ? `${m.distance_km} km · ` : ''}
                    {freshness.text}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium text-gray-900 tabular-nums">₹{m.actual_price}/kg</p>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${sig.cls}`}>
                    {isHindi ? sig.labelHi : sig.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-[#E3EDE7]">
        <p className="text-[11px] font-medium text-gray-900 mb-2">
          {isHindi ? 'चारा लागत सूचकांक' : 'Feed Cost Index'}
        </p>

        {commodities?.prices ? (
          <div className="space-y-1.5">
            {commodities.prices.slice(0, 3).map((c) => (
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
                    {c.delta7d > 0 ? '↑' : '↓'}
                    {Math.abs(c.delta7d)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-2.5 w-24 bg-[#F4F7F5] rounded" />
                <div className="h-2.5 w-16 bg-[#F4F7F5] rounded" />
              </div>
            ))}
          </div>
        )}

        {commodities?.recommendation && (
          <div
            className="mt-2 px-2.5 py-2 rounded-lg text-[10px] leading-relaxed"
            style={{ background: '#FFFBEB', color: '#92400E' }}
          >
            {isHindi ? commodities.recommendationHi : commodities.recommendation}
          </div>
        )}
      </div>
    </div>
  )
}
