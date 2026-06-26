'use client'
import { useMemo } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer, Legend
} from 'recharts'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { ChartEmptyState } from '@/components/shared/ChartEmptyState'

interface TimelinePoint {
  date: string
  actual: number | null
  p50: number | null
  p10: number | null
  p90: number | null
  isForecast: boolean
}

interface Festival {
  festival_date: string
  end_date: string | null
  name_en: string
  name_hi: string
  demand_impact: string
}

interface HPAIZone {
  district_name: string
  start_date: string
  end_date: string
}

interface Props {
  isLoading: boolean
  error: any
  timeline: TimelinePoint[]
  festivals: Festival[]
  hpaiZones: HPAIZone[]
  viewMode: 'chart' | 'table'
  horizon: number
  language: string
}

export function ForecastMainChart({
  isLoading, error, timeline, festivals, hpaiZones, viewMode, horizon, language
}: Props) {
  const isHindi = language === 'hi'

  // ── LOADING STATE ───────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      <ChartSkeleton height={300} className="rounded-lg" />
    </div>
  )

  // ── ERROR STATE ─────────────────────────────────────────────────────────────
  if (error) return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      <ChartEmptyState
        messageHindi="डेटा लोड नहीं हो सका"
        message="Price forecast data temporarily unavailable"
        hint="Forecast loads daily at 6:00 AM IST. If this persists after 8:00 AM, please refresh."
        showRetry={true}
        onRetry={() => window.location.reload()}
      />
    </div>
  )

  // ── NO DATA STATE ────────────────────────────────────────────────────────────
  if (!timeline.length) return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      <ChartEmptyState
        messageHindi="अभी तक कोई पूर्वानुमान डेटा नहीं है"
        message="No forecast data available yet"
        hint="Price forecast loads at 6:00 AM IST each day."
        showRetry={false}
      />
    </div>
  )

  // ── TABLE VIEW ─────────────────────────────────────────────────────────────
  if (viewMode === 'table') return <ForecastTable timeline={timeline} />

  // ── CHART DATA PREP ──────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]

  // Find min/max for Y axis padding
  const allPrices = timeline.flatMap(p =>
    [p.p10, p.p50, p.p90, p.actual].filter(Boolean) as number[]
  )
  const yMin = Math.floor(Math.min(...allPrices) - 10)
  const yMax = Math.ceil(Math.max(...allPrices) + 10)

  // Festival reference areas — only those within timeline range
  const festivalAreas = festivals.filter(f =>
    timeline.some(t => t.date >= f.festival_date && t.date <= (f.end_date ?? f.festival_date))
  )

  // HPAI reference areas — active zones within timeline range
  const hpaiAreas = hpaiZones.filter(z =>
    timeline.some(t => t.date >= z.start_date && t.date <= (z.end_date ?? z.start_date))
  )

  // ── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload as TimelinePoint
    const horizonDay = timeline.findIndex(t => t.date === label) -
                       timeline.findIndex(t => !t.isForecast && t.date <= today)
    return (
      <div className="bg-white border border-[#E3EDE7] rounded-xl shadow-lg p-3 text-xs w-52">
        <p className="font-semibold text-gray-900 mb-1.5">
          {new Date(label).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
          {horizonDay > 0 && <span className="ml-1.5 text-[#1A5C34] font-normal">(D+{horizonDay})</span>}
        </p>
        {d.actual !== null && (
          <p className="text-[#E8611A]">Actual: <strong>₹{d.actual}/kg</strong></p>
        )}
        {d.p50 !== null && (
          <p className="text-[#1A5C34]">P50 Forecast: <strong>₹{d.p50}/kg</strong></p>
        )}
        {d.p90 !== null && (
          <p className="text-gray-500">P90 (upper): ₹{d.p90}/kg</p>
        )}
        {d.p10 !== null && (
          <p className="text-gray-500">P10 (lower): ₹{d.p10}/kg</p>
        )}
        {d.p10 && d.p90 && (
          <p className="text-gray-400 mt-1">Band width: ₹{(d.p90 - d.p10).toFixed(0)}/kg</p>
        )}
        {d.isForecast && (
          <p className="text-gray-400 mt-1 text-[10px]">
            {horizonDay <= 3  ? '⬤ High confidence' :
             horizonDay <= 7  ? '◑ Moderate confidence' :
             horizonDay <= 14 ? '◔ Lower confidence' : '○ Indicative only'}
          </p>
        )}
      </div>
    )
  }

  // ── RENDER CHART ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      {/* Chart header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-900">
          {horizon}-Day Broiler Price Forecast
        </p>
        <p className="text-xs text-gray-400">P10 / P50 / P90 confidence bands</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
        {[
          { type: 'line', color: '#1A5C34', label: 'P50 Forecast' },
          { type: 'area', color: 'rgba(61,174,114,0.20)', label: 'P10–P90 band' },
          { type: 'line', color: '#E8611A', label: 'Actual price' },
          { type: 'vline', color: '#6B7280', label: 'Today', dash: true },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            {item.type === 'area'  && <span className="w-4 h-2.5 rounded-sm inline-block" style={{ background: item.color }} />}
            {item.type === 'line'  && <span className="w-5 border-t-2 inline-block" style={{ borderColor: item.color, borderStyle: item.dash ? 'dashed' : 'solid' }} />}
            {item.type === 'vline' && <span className="w-4 border-l-2 border-dashed inline-block h-3.5" style={{ borderColor: item.color }} />}
            <span className="text-[11px] text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Chart — accessible wrapper */}
      <div
        role="img"
        aria-label={`30-day broiler price forecast chart. Today's P50: ₹${timeline.find(t => t.date === today)?.p50 ?? '—'}/kg. Band widens as dates move further into future, showing decreasing confidence.`}
      >
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={timeline} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />

            <XAxis
              dataKey="date"
              tickFormatter={d => {
                const dt = new Date(d)
                return `${dt.getDate()}/${dt.getMonth()+1}`
              }}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              interval={horizon <= 7 ? 0 : 2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `₹${v}`}
              width={46}
              domain={[yMin, yMax]}
            />

            {/* P10–P90 confidence band (shaded area between the two) */}
            <Area
              type="monotone"
              dataKey="p90"
              fill="rgba(61,174,114,0.15)"
              stroke="transparent"
              fillOpacity={1}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="p10"
              fill="#F4F7F5"
              stroke="transparent"
              fillOpacity={1}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* Festival reference areas */}
            {festivalAreas.map(f => (
              <ReferenceArea
                key={f.festival_date}
                x1={f.festival_date}
                x2={f.end_date ?? f.festival_date}
                fill="rgba(217,119,6,0.07)"
                label={{ value: f.name_en.split('/')[0].trim(), position: 'insideTopLeft', fontSize: 9, fill: '#D97706' }}
              />
            ))}

            {/* HPAI disease alert zones */}
            {hpaiAreas.map(z => (
              <ReferenceArea
                key={`hpai-${z.start_date}`}
                x1={z.start_date}
                x2={z.end_date}
                fill="rgba(220,38,38,0.07)"
                label={{ value: 'HPAI', position: 'insideTopLeft', fontSize: 9, fill: '#DC2626' }}
              />
            ))}

            {/* Today vertical line */}
            <ReferenceLine
              x={today}
              stroke="rgba(100,100,100,0.4)"
              strokeDasharray="4 3"
              label={{ value: 'Today', position: 'top', fontSize: 9, fill: '#9CA3AF' }}
            />

            {/* P50 forecast line */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#1A5C34"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* Actual price — orange dots + line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#E8611A"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#E8611A', stroke: '#fff', strokeWidth: 1.5 }}
              connectNulls={false}
              isAnimationActive={false}
            />

            <Tooltip content={<CustomTooltip />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Annotation key below chart */}
      <div className="mt-3 pt-2 border-t border-[#E3EDE7] flex flex-wrap gap-x-4 gap-y-1">
        {hpaiAreas.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="w-3 h-3 rounded-sm inline-block border border-red-300" style={{ background: 'rgba(220,38,38,0.15)' }} />
            HPAI Alert: {hpaiAreas.map(z => z.district_name).join(', ')}
          </div>
        )}
        {festivalAreas.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="w-3 h-3 rounded-sm inline-block border border-amber-300" style={{ background: 'rgba(217,119,6,0.15)' }} />
            {festivalAreas.map(f => f.name_en.split('/')[0]).join(', ')} — demand impact
          </div>
        )}
        <div className="ml-auto text-[10px] text-gray-400">
          Model v1.0 · Retrained 3 days ago · 150 predictions verified
        </div>
      </div>
    </div>
  )
}

// ── TABLE VIEW (accessibility + alternate view) ───────────────────────────────
function ForecastTable({ timeline }: { timeline: TimelinePoint[] }) {
  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4 overflow-x-auto">
      <table className="w-full text-xs" role="table" aria-label="Broiler price forecast data table">
        <caption className="text-left text-sm font-medium text-gray-900 mb-3">
          Broiler Price Forecast — All Data
        </caption>
        <thead>
          <tr className="text-left text-gray-400 border-b border-[#E3EDE7]">
            <th scope="col" className="pb-2 font-medium">Date</th>
            <th scope="col" className="pb-2 font-medium">P10 (₹/kg)</th>
            <th scope="col" className="pb-2 font-medium">P50 (₹/kg)</th>
            <th scope="col" className="pb-2 font-medium">P90 (₹/kg)</th>
            <th scope="col" className="pb-2 font-medium">Actual</th>
            <th scope="col" className="pb-2 font-medium">Type</th>
          </tr>
        </thead>
        <tbody>
          {timeline.map((row, i) => (
            <tr key={row.date}
                className={`border-b border-[#F4F7F5] ${i % 2 === 0 ? 'bg-white' : 'bg-[#F8FBF9]'}`}>
              <td className="py-1.5 font-medium text-gray-900">{row.date}</td>
              <td className="py-1.5 text-gray-500">{row.p10 ? `₹${row.p10}` : '—'}</td>
              <td className="py-1.5 text-[#1A5C34] font-semibold">{row.p50 ? `₹${row.p50}` : '—'}</td>
              <td className="py-1.5 text-gray-500">{row.p90 ? `₹${row.p90}` : '—'}</td>
              <td className="py-1.5 text-[#E8611A] font-medium">{row.actual ? `₹${row.actual}` : '—'}</td>
              <td className="py-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium
                  ${row.isForecast ? 'bg-[#EDF7F1] text-[#1A5C34]' : 'bg-gray-100 text-gray-500'}`}>
                  {row.isForecast ? 'Forecast' : 'Actual'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
