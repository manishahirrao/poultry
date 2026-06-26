interface Driver {
  rank: number
  nameEn: string
  nameHi: string
  descriptionEn: string | null
  descriptionHi: string | null
  impactRs: number
  magnitudePct: number
  direction: 'up' | 'down'
  confidence: string
}

interface Props {
  isLoading: boolean
  drivers: Driver[] | null
  isAvailable: boolean
  watermarkToken: string
  language: string
}

export function PriceDriversCard({ isLoading, drivers, isAvailable, watermarkToken, language }: Props) {
  const isHindi = language === 'hi'

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-4 animate-pulse space-y-3">
        <div className="h-3 w-40 bg-[#F4F7F5] rounded" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-4 bg-[#F4F7F5] rounded" />
            <div className="h-3 flex-1 bg-[#F4F7F5] rounded" />
            <div className="h-3 w-16 bg-[#F4F7F5] rounded" />
            <div className="h-3 w-10 bg-[#F4F7F5] rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!isAvailable || !drivers) {
    return (
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
  }

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-0.5">
        {isHindi ? 'कीमत क्यों बदल रही है?' : 'Why is price moving?'}
      </h3>
      <p className="text-[10px] text-gray-400 mb-3">
        {isHindi ? 'AI SHAP विश्लेषण (मॉडल v1.0)' : 'AI-powered SHAP analysis (model v1.0)'}
      </p>

      <div className="space-y-3">
        {drivers.slice(0, 5).map((d) => {
          const isPositive = d.direction === 'up'
          const barColour = isPositive ? '#1A5C34' : '#DC2626'
          const impactText = `${isPositive ? '+' : ''}₹${d.impactRs.toFixed(1)}`
          const impactColour = isPositive ? '#16A34A' : '#DC2626'

          return (
            <div key={d.rank} className="flex items-start gap-2">
              <span className="text-[10px] text-gray-300 w-4 flex-shrink-0 mt-0.5 tabular-nums">
                #{d.rank}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-900 leading-tight">{isHindi ? d.nameHi : d.nameEn}</p>
                {(isHindi ? d.descriptionHi : d.descriptionEn) && (
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">
                    {isHindi ? d.descriptionHi : d.descriptionEn}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0 w-16">
                <div
                  className="h-[5px] rounded-full overflow-hidden"
                  style={{ background: '#F4F7F5' }}
                  role="meter"
                  aria-valuenow={d.magnitudePct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${isHindi ? d.nameHi : d.nameEn}: ${impactText} impact`}
                >
                  <div className="h-full rounded-full" style={{ width: `${d.magnitudePct}%`, background: barColour }} />
                </div>
              </div>

              <span
                className="text-[10px] font-semibold flex-shrink-0 tabular-nums w-10 text-right"
                style={{ color: impactColour }}
              >
                {impactText}
              </span>
            </div>
          )
        })}
      </div>

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
