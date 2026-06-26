'use client'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import useSWR from 'swr'

interface CommodityPriceRowProps {
  commodity: {
    id: string;                  // 'maize' | 'soya_meal' | 'palm_oil' | 'composite'
    name: string;
    nameHindi: string;
    unit: string;                // 'Per quintal' | 'Per 10kg'
    currentPrice: number;
    sevenDayDelta: number;       // positive = up, negative = down
  };
}

export function CommodityPriceRow({ commodity }: CommodityPriceRowProps) {
  const [expanded, setExpanded] = useState(false)

  // Only fetch history when row is expanded (lazy loading)
  const { data: history } = useSWR(
    expanded ? `/api/feed/commodity-history?id=${commodity.id}&days=30` : null,
    fetcher
  )

  const deltaPositive = commodity.sevenDayDelta >= 0
  const deltaColour = deltaPositive ? 'text-red-600' : 'text-green-600'
  // For feed costs: price UP = bad for farmer (red), price DOWN = good (green)

  return (
    <div className="border-b border-[#E3EDE7] last:border-0">
      {/* Main row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-4 px-1
                   hover:bg-[#F4F7F5] transition-colors rounded-lg text-left"
        aria-expanded={expanded}
      >
        <div>
          <p className="font-medium text-gray-900">{commodity.name}</p>
          <p className="text-xs text-gray-500">{commodity.nameHindi} · {commodity.unit}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold text-gray-900">₹{commodity.currentPrice.toLocaleString('en-IN')}</p>
            <p className={`text-xs font-medium ${deltaColour}`}>
              {deltaPositive ? '↑' : '↓'} {Math.abs(commodity.sevenDayDelta).toLocaleString('en-IN')}
              <span className="text-gray-400 ml-1">(7-day)</span>
            </p>
          </div>
          <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expandable 30-day chart */}
      {expanded && (
        <div className="px-4 pb-5">
          {!history ? (
            <div className="h-[160px] bg-[#F4F7F5] rounded-lg animate-pulse" />
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-2">30-day price history</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={history} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <XAxis dataKey="date" tickFormatter={d => d.slice(5)} // "MM-DD"
                         tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                         width={50} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, commodity.name]}
                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #E3EDE7' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#1A5C34" strokeWidth={2}
                        dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Simple fetcher for SWR
async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch commodity history')
  }
  return res.json()
}
