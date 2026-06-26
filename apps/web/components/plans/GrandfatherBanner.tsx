'use client'
import { useEntitlements } from '@/lib/plans/useEntitlements'
import Link from 'next/link'

export function GrandfatherBanner() {
  const { entitlements } = useEntitlements()
  if (!entitlements?.grandfatheredUntil) return null

  const grandfatherDate = new Date(entitlements.grandfatheredUntil)
  const today = new Date()
  if (grandfatherDate < today) return null // grandfather period ended

  const daysLeft = Math.ceil((grandfatherDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">📢</span>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            हम अपनी pricing update कर रहे हैं
          </p>
          <p className="text-xs text-amber-800 mt-1">
            आप अगले <strong>{daysLeft} दिनों</strong> तक पुरानी कीमत पर FlockIQ use कर सकते हैं।
            उसके बाद नई pricing लागू होगी।
          </p>
          <Link 
            href="/dashboard/settings/billing"
            className="text-xs font-semibold text-amber-900 underline mt-2 inline-block"
          >
            नई plans देखें →
          </Link>
        </div>
      </div>
    </div>
  )
}
