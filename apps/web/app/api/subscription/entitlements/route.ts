import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user subscription
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('plan_name, subscription_type, status, lifetime_start_date, lifetime_end_date, next_renewal_date, grandfathered_until')
      .eq('user_id', user.id)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      // PGRST116 = row not found, which is acceptable (user may not have subscription yet)
      console.error('Error fetching subscription:', subError)
    }

    const planName = sub?.plan_name ?? null

    // Check lifetime validity
    let isLifetimeExpired = false
    let daysUntilExpiry: number | null = null

    if (sub?.subscription_type === 'lifetime' && sub.lifetime_end_date) {
      const endDate     = new Date(sub.lifetime_end_date)
      const today       = new Date()
      const msRemaining = endDate.getTime() - today.getTime()
      daysUntilExpiry   = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60 * 24)))
      isLifetimeExpired = daysUntilExpiry <= 0
    }

    // Fetch all feature entitlements for this plan
    const { data: features, error: featuresError } = await supabase
      .from('plan_feature_entitlements')
      .select('feature_key, is_enabled, limit_value, limit_unit')
      .eq('plan_name', planName ?? 'FLOCKIQ_FARM')

    if (featuresError) {
      console.error('Error fetching feature entitlements:', featuresError)
      return NextResponse.json({ error: 'Failed to fetch entitlements' }, { status: 500 })
    }

    const featureMap: Record<string, any> = {}
    for (const f of features ?? []) {
      featureMap[f.feature_key] = {
        hasAccess:    isLifetimeExpired ? false : f.is_enabled,
        limitValue:   f.limit_value,
        limitUnit:    f.limit_unit,
        upgradeTarget: f.is_enabled ? null : 'FLOCKIQ_PRO',
      }
    }

    const response = NextResponse.json({
      planName,
      subscriptionType:  sub?.subscription_type ?? 'monthly',
      features:          featureMap,
      isLifetimeExpired,
      daysUntilExpiry,
      grandfatheredUntil: sub?.grandfathered_until ?? null,
    })

    // Add caching headers - cache for 5 minutes, revalidate in background
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response
  } catch (error) {
    console.error('Unexpected error in entitlements API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
