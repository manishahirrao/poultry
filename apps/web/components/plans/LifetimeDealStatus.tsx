'use client'
import { useEntitlements } from '@/lib/plans/useEntitlements'
import { getLifetimeExpiryInfo, PLAN_PRICING } from '@/lib/plans/featureGates'

export function LifetimeDealStatus() {
  const { entitlements } = useEntitlements()

  if (!entitlements || entitlements.subscriptionType !== 'lifetime') return null
  if (!entitlements.daysUntilExpiry) return null

  const daysLeft = entitlements.daysUntilExpiry
  const totalDays = 5 * 365 // 5 years
  const usedDays = totalDays - daysLeft
  const pct = Math.min(100, Math.round((usedDays / totalDays) * 100))

  // Show prominent warning when < 90 days left
  const isNearExpiry = daysLeft < 90
  const isHindi = true // get from user preference

  return (
    <div className={`mx-3 mb-2 rounded-lg p-3 ${
      isNearExpiry
        ? 'bg-amber-900/30 border border-amber-700/40'
        : 'bg-[#1A5C34]/20 border border-[#3DAE72]/20'
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-white/80">
          {isHindi ? '💎 Lifetime Deal' : '💎 Lifetime Deal'}
        </span>
        <span className="text-[10px] text-white/60">
          {daysLeft} {isHindi ? 'दिन बाकी' : 'days left'}
        </span>
      </div>
      {/* Tenure progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isNearExpiry ? 'bg-amber-400' : 'bg-[#3DAE72]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isNearExpiry && (
        <p className="text-[10px] text-amber-300 mt-1.5">
          {isHindi
            ? `${daysLeft} दिनों में Renew करें`
            : `Renew in ${daysLeft} days`}
        </p>
      )}
    </div>
  )
}
