'use client'

import { FeatureGate } from '@/components/plans/FeatureGate'
import { FEATURES } from '@/lib/plans/featureGates'

interface SellSignalData {
  signal: 'SELL_NOW' | 'HOLD' | 'CAUTION'
  optimalWindowStart: string | null
  optimalWindowEnd: string | null
  expectedP50Low: number | null
  expectedP50High: number | null
  confidence: number
  reasons: string[]
}

interface Props {
  isLoading: boolean
  signal: SellSignalData | null
  language: string
}

const SIGNAL_CONFIG = {
  SELL_NOW: {
    bg: '#EDF7F1',
    border: '#3DAE72',
    labelColour: '#1A5C34',
    badgeBg: '#1A5C34',
    badgeText: '#FFFFFF',
    labelHi: 'बिक्री संकेत',
    labelEn: 'Sell Signal',
    badgeHi: '✓ आज बेचें — SELL NOW',
    badgeEn: '✓ Sell Today — SELL NOW',
    icon: '↑',
  },
  HOLD: {
    bg: '#FFFBEB',
    border: '#D97706',
    labelColour: '#92400E',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
    labelHi: 'बिक्री संकेत',
    labelEn: 'Sell Signal',
    badgeHi: '⏳ रुकें — HOLD',
    badgeEn: '⏳ Hold — HOLD',
    icon: '→',
  },
  CAUTION: {
    bg: '#FEF2F2',
    border: '#DC2626',
    labelColour: '#991B1B',
    badgeBg: '#DC2626',
    badgeText: '#FFFFFF',
    labelHi: 'बिक्री संकेत',
    labelEn: 'Sell Signal',
    badgeHi: '⚠ सावधान — CAUTION',
    badgeEn: '⚠ Caution — CAUTION',
    icon: '↓',
  },
}

export function SellSignalCard({ isLoading, signal, language }: Props) {
  const isHindi = language === 'hi'

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#E3EDE7] p-4 bg-white animate-pulse space-y-3">
        <div className="h-3 w-24 bg-[#F4F7F5] rounded" />
        <div className="h-8 w-36 bg-[#F4F7F5] rounded-full" />
        <div className="h-3 w-full bg-[#F4F7F5] rounded" />
        <div className="h-3 w-3/4 bg-[#F4F7F5] rounded" />
        <div className="h-6 w-28 bg-[#F4F7F5] rounded-xl" />
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#E3EDE7]" />
          ))}
        </div>
      </div>
    )
  }

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

  const formatDate = (iso: string | null) => {
    if (!iso) return null
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const windowStart = formatDate(signal.optimalWindowStart)
  const windowEnd = formatDate(signal.optimalWindowEnd)
  const windowText =
    windowStart && windowEnd ? `${windowStart} – ${windowEnd}` : windowStart ?? null

  return (
    <div className="rounded-xl border p-4" style={{ background: cfg.bg, borderColor: cfg.border }}>
      <p
        className="text-[10px] font-medium uppercase tracking-[0.08em] mb-2"
        style={{ color: cfg.labelColour }}
      >
        {isHindi ? cfg.labelHi : cfg.labelEn} — {isHindi ? 'गोरखपुर' : 'Gorakhpur'}
      </p>

      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-3"
        style={{ background: cfg.badgeBg, color: cfg.badgeText }}
      >
        {isHindi ? cfg.badgeHi : cfg.badgeEn}
      </div>

      <FeatureGate feature={FEATURES.SELL_SIGNAL_OPTIMAL_WINDOW}>
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
            {signal.reasons[0] && <p className="mt-1 opacity-80">{signal.reasons[0]}</p>}
          </div>
        )}
      </FeatureGate>

      {signal.expectedP50High && (
        <>
          <p className="text-2xl font-medium text-gray-900 mt-1 mb-0.5 tabular-nums">
            ₹{signal.expectedP50High}/kg
          </p>
          <p className="text-[11px] text-gray-400">
            {isHindi ? 'D+3–D+5 अपेक्षित' : 'Expected D+3–D+5'}
            {signal.expectedP50Low && signal.expectedP50High && (
              <span>
                {' '}
                · P10 ₹{signal.expectedP50Low} — P90 ₹{(signal.expectedP50High * 1.05).toFixed(0)}
              </span>
            )}
          </p>
        </>
      )}

      <div className="mt-3 flex items-center gap-1.5">
        <p className="text-[10px]" style={{ color: cfg.labelColour }}>
          {isHindi ? 'विश्वास:' : 'Confidence:'}
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: i <= signal.confidence ? cfg.badgeBg : '#E3EDE7' }}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-[10px]" style={{ color: cfg.labelColour }}>
          {['', 'Low', 'Low', 'Moderate', 'High', 'High'][signal.confidence]} ({signal.confidence}/5)
        </p>
      </div>
    </div>
  )
}
