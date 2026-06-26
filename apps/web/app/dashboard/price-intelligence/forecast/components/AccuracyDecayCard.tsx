interface HorizonAccuracy {
  horizon_days: number
  directional_acc: number
  mape: number
}

interface Props {
  horizons: HorizonAccuracy[]
  language: string
}

// Colour by accuracy level
function barColour(acc: number): string {
  if (acc > 85) return '#16A34A'
  if (acc > 70) return '#65A30D'
  if (acc > 55) return '#D97706'
  return '#DC2626'
}

// Label for horizon
function horizonLabel(days: number): string {
  return `D+${days}`
}

export function AccuracyDecayCard({ horizons, language }: Props) {
  const isHindi = language === 'hi'

  // Sort ascending (D+1 first)
  const sorted = [...horizons].sort((a, b) => a.horizon_days - b.horizon_days)

  const WARNING_HI = 'D+15 से D+30 के पूर्वानुमान केवल रुझान संकेत हैं। व्यापार निर्णयों के लिए D+7 तक के पूर्वानुमान पर भरोसा करें। लेन-देन से पहले स्थानीय मंडी से सत्यापित करें।'
  const WARNING_EN = 'Day 15–30 forecasts are trend indicators only. For trading decisions, rely on Day 1–7 forecasts. Always verify with local mandi data before transacting.'

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        {isHindi ? 'अनुमान की सटीकता' : 'Forecast Accuracy by Horizon'}
      </h3>
      <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
        {isHindi
          ? 'जितनी दूर की तारीख, उतनी कम सटीकता। D+30 पर केवल रुझान देखें।'
          : 'Confidence decreases as prediction date gets further. D+30 is directional only.'}
      </p>

      {/* Bars */}
      <div className="space-y-2">
        {sorted.map(h => {
          const colour  = barColour(h.directional_acc)
          const widthPct = `${h.directional_acc}%`
          return (
            <div key={h.horizon_days} className="flex items-center gap-2">
              {/* Day label */}
              <span className="text-[11px] text-gray-400 w-8 flex-shrink-0 tabular-nums">
                {horizonLabel(h.horizon_days)}
              </span>

              {/* Bar track */}
              <div
                className    = "flex-1 h-[6px] rounded-full overflow-hidden"
                style        = {{ background: 'var(--color-background-secondary, #F4F7F5)' }}
                role         = "progressbar"
                aria-valuenow   = {h.directional_acc}
                aria-valuemin   = {0}
                aria-valuemax   = {100}
                aria-label   = {`${horizonLabel(h.horizon_days)}: ${h.directional_acc}% directional accuracy`}
              >
                <div
                  className = "h-full rounded-full transition-all"
                  style     = {{ width: widthPct, background: colour }}
                />
              </div>

              {/* Accuracy value */}
              <span
                className = "text-[10px] font-medium w-9 text-right tabular-nums flex-shrink-0"
                style     = {{ color: colour }}
              >
                ~{h.directional_acc.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Zone labels */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {[
          { range: '>85%', colour: '#16A34A', label: isHindi ? 'उच्च' : 'High' },
          { range: '70–85%', colour: '#65A30D', label: isHindi ? 'मध्यम' : 'Moderate' },
          { range: '55–70%', colour: '#D97706', label: isHindi ? 'निम्न' : 'Lower' },
          { range: '<55%', colour: '#DC2626', label: isHindi ? 'केवल रुझान' : 'Trend only' },
        ].map(z => (
          <div key={z.range} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: z.colour }} />
            <span className="text-[10px] text-gray-400">{z.label}</span>
          </div>
        ))}
      </div>

      {/* Warning box */}
      <div className="mt-3 rounded-lg p-2.5 text-[10px] leading-relaxed"
           style={{ background: 'var(--color-background-secondary, #F4F7F5)', color: 'var(--color-text-secondary)' }}>
        {isHindi ? WARNING_HI : WARNING_EN}
      </div>
    </div>
  )
}
