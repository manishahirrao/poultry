import { KPISkeleton } from '@/components/shared/KPISkeleton'
import useSWR from 'swr'

interface Props {
  isLoading: boolean
  error: boolean
  todayP50: number | null
  todayP10: number | null
  todayP90: number | null
  d7P50: number | null
  d30P50: number | null
  plan: string
  language: string
}

export function ForecastKPIStrip({ isLoading, error, todayP50, todayP10, todayP90, d7P50, d30P50, plan, language }: Props) {
  const isHindi = language === 'hi'

  const { data: portfolioGC } = useSWR('/api/gc/portfolio', (url) =>
    fetch(url).then((r) => (r.ok ? r.json() : null))
  )

  const hasActiveFarms = portfolioGC?.farms && portfolioGC.farms.length > 0

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {[0,1,2,3,4].map(i => <KPISkeleton key={i} />)}
    </div>
  )

  if (error) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {['Today\'s P50', '80% Band', 'D+7 Forecast', 'D+30 Forecast', 'Your GC'].map(label => (
        <div key={label} className="bg-[#F4F7F5] rounded-xl p-4 border border-[#E3EDE7]">
          <p className="text-[11px] text-gray-400">{label}</p>
          <p className="text-gray-300 text-xl font-medium mt-1">—</p>
          <p className="text-[10px] text-gray-300 mt-1">Updating...</p>
        </div>
      ))}
    </div>
  )

  const bandWidth = todayP10 && todayP90 ? todayP90 - todayP10 : null
  const d30Locked = plan === 'PULSE_FARM'
  const avgGC = portfolioGC?.averageGC ?? 0
  const gcMargin = todayP50 && avgGC > 0 ? todayP50 - avgGC : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {/* Card 1: Today's P50 */}
      <KPICard
        label   = {isHindi ? "आज का P50 — गोरखपुर" : "Today's P50 — Gorakhpur"}
        value   = {todayP50 ? `₹${todayP50}` : '—'}
        unit    = "/kg"
        subtext = {isHindi ? 'अपडेटेड: 06:04 AM' : 'Updated 6:04 AM'}
        status  = "ok"
      />

      {/* Card 2: 80% Confidence Band */}
      <KPICard
        label   = {isHindi ? '80% विश्वास बैंड' : '80% Confidence Band'}
        value   = {todayP10 && todayP90 ? `₹${todayP10} – ₹${todayP90}` : '—'}
        subtext = {bandWidth ? `${isHindi ? 'रेंज चौड़ाई:' : 'Range width:'} ₹${bandWidth}/kg` : undefined}
        tooltip = {isHindi ? '80% संभावना: आज वास्तविक कीमत इस रेंज में आएगी' : '80% probability: actual price will fall in this range today'}
        status  = "neutral"
      />

      {/* Card 3: D+7 Forecast */}
      <KPICard
        label   = {isHindi ? 'D+7 पूर्वानुमान P50' : 'D+7 Forecast P50'}
        value   = {d7P50 ? `₹${d7P50}` : '—'}
        unit    = "/kg"
        subtext = {d7P50 && todayP50
          ? `${d7P50 > todayP50 ? '↑' : '↓'} ₹${Math.abs(d7P50 - todayP50).toFixed(0)} ${isHindi ? 'से आज' : 'from today'}`
          : isHindi ? 'मध्यम विश्वास' : 'Moderate confidence'}
        trendDir = {d7P50 && todayP50 ? (d7P50 > todayP50 ? 'up' : 'down') : undefined}
        status   = "ok"
      />

      {/* Card 4: D+30 Forecast — intentionally muted (low confidence) */}
      <KPICard
        label      = {isHindi ? 'D+30 पूर्वानुमान P50' : 'D+30 Forecast P50'}
        value      = {d30Locked ? '—' : (d30P50 ? `₹${d30P50}` : '—')}
        unit       = {d30Locked ? undefined : "/kg"}
        subtext    = {d30Locked ? (isHindi ? 'PULSE_PRO में अपग्रेड करें' : 'Upgrade to PULSE_PRO') : (isHindi ? 'संकेतात्मक — कम विश्वास' : 'Indicative — low confidence')}
        status     = "muted"
        badgeText  = {d30Locked ? (isHindi ? 'अपग्रेड ↗' : 'Upgrade ↗') : (isHindi ? 'कम विश्वास' : 'Low confidence')}
        badgeStyle = {d30Locked ? 'upgrade' : 'warning'}
        tooltip    = {isHindi ? '30-दिन के पूर्वानुमान में ~46% दिशात्मक सटीकता है। केवल रुझान संकेत के रूप में उपयोग करें।' : '30-day forecasts have ~46% directional accuracy. Use as trend signal only.'}
        locked     = {d30Locked}
        lockedHref = "/dashboard/settings/billing"
      />

      {/* Card 5: Your GC (Portfolio Average) — only shown if user has active farms */}
      {hasActiveFarms && (
        <KPICard
          label   = {isHindi ? 'आपका GC (औसत)' : 'Your GC (Avg)'}
          value   = {avgGC > 0 ? `₹${avgGC.toFixed(2)}` : '—'}
          unit    = "/kg"
          subtext = {gcMargin !== null
            ? `${gcMargin > 0 ? '↑' : '↓'} ₹${Math.abs(gcMargin).toFixed(2)} ${isHindi ? 'से बाज़ार भाव' : 'from market'}`
            : isHindi ? 'औसत लागत' : 'Avg cost'}
          trendDir = {gcMargin !== null && gcMargin > 0 ? 'up' : (gcMargin !== null && gcMargin < 0 ? 'down' : undefined)}
          status   = {gcMargin !== null && gcMargin > 0 ? 'ok' : (gcMargin !== null && gcMargin < 0 ? 'neutral' : 'neutral')}
          tooltip  = {isHindi ? 'आपके सभी सक्रिय फ़ार्मों का औसत Growing Cost (GC)' : 'Average Growing Cost (GC) across all your active farms'}
        />
      )}
    </div>
  )
}

// Shared KPI card sub-component
function KPICard({ label, value, unit, subtext, trendDir, status, badgeText, badgeStyle, tooltip, locked, lockedHref }: {
  label: string; value: string; unit?: string; subtext?: string
  trendDir?: 'up'|'down'; status: 'ok'|'neutral'|'muted'; badgeText?: string
  badgeStyle?: 'warning'|'upgrade'; tooltip?: string; locked?: boolean; lockedHref?: string
}) {
  return (
    <div className={`rounded-xl p-4 border ${status === 'muted' ? 'bg-[#F4F7F5] border-[#E3EDE7]' : 'bg-white border-[#E3EDE7]'} relative`}>
      <p className="text-[11px] text-gray-400 mb-1.5">{label}</p>
      <div className="flex items-end gap-1">
        <p className={`tabular-nums font-medium leading-none ${status === 'muted' ? 'text-gray-300 text-lg' : 'text-gray-900 text-xl'}`}>
          {locked ? <span className="blur-sm select-none">₹XXX</span> : value}
        </p>
        {unit && !locked && <span className="text-xs text-gray-400 mb-0.5">{unit}</span>}
      </div>
      {subtext && (
        <p className={`text-[10px] mt-1.5 ${
          trendDir === 'up'   ? 'text-green-600' :
          trendDir === 'down' ? 'text-red-600' :
          status === 'muted'  ? 'text-gray-300' : 'text-gray-400'
        }`}>
          {trendDir === 'up' && '↑ '}{trendDir === 'down' && '↓ '}{subtext}
        </p>
      )}
      {badgeText && (
        <span className={`absolute top-2.5 right-2.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
          badgeStyle === 'upgrade' ? 'bg-[#1A5C34] text-white cursor-pointer' : 'bg-amber-100 text-amber-700'
        }`}>
          {locked && lockedHref
            ? <a href={lockedHref}>{badgeText}</a>
            : badgeText
          }
        </span>
      )}
      {tooltip && (
        <div className="absolute bottom-2 left-4 right-4 text-[9px] text-gray-400 leading-tight opacity-0 hover:opacity-100 transition-opacity">
          {tooltip}
        </div>
      )}
    </div>
  )
}
