'use client'
// Wrap any PRO-only UI element in <FeatureGate feature={FEATURES.FORECAST_30DAY}>
// If user doesn't have access → renders the upgrade prompt instead

import { useEntitlements } from '@/lib/plans/useEntitlements'
import { canAccess, FEATURES, getUpgradePlanFor } from '@/lib/plans/featureGates'
import type { FeatureKey } from '@/lib/plans/featureGates'
import { PlanUpgradePrompt } from './PlanUpgradePrompt'

interface FeatureGateProps {
  feature:      FeatureKey
  children:     React.ReactNode
  fallback?:    React.ReactNode        // Custom fallback (if not provided, uses PlanUpgradePrompt)
  blurChildren?: boolean              // Instead of hiding, blur + overlay the children
  showLock?:    boolean               // Show lock icon on blurred content
}

export function FeatureGate({
  feature, children, fallback, blurChildren = false, showLock = true
}: FeatureGateProps) {
  const { entitlements } = useEntitlements()
  const access = canAccess(entitlements, feature)

  if (access.hasAccess) {
    return <>{children}</>
  }

  // Blur mode: shows content but blurred with upgrade overlay
  if (blurChildren) {
    return (
      <div className="relative">
        <div className="blur-sm select-none pointer-events-none" aria-hidden="true">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center
                        bg-white/70 backdrop-blur-sm rounded-xl">
          <PlanUpgradePrompt
            feature={feature}
            upgradeTarget={getUpgradePlanFor(feature)}
            compact={true}
          />
        </div>
      </div>
    )
  }

  // Default: replace with upgrade prompt
  if (fallback) return <>{fallback}</>

  return (
    <PlanUpgradePrompt
      feature={feature}
      upgradeTarget={getUpgradePlanFor(feature)}
    />
  )
}

// Simpler hook-based check for conditional rendering
export function useFeature(feature: FeatureKey) {
  const { entitlements } = useEntitlements()
  return canAccess(entitlements, feature)
}
