import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { applyWatermark } from '@/lib/watermark'
import { logPredictionAccess } from '@/lib/access-log'

const QuerySchema = z.object({
  mandi:   z.string().min(1).max(50),
  horizon: z.coerce.number().int().min(7).max(30).default(30),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  // ── 1. Auth check ──────────────────────────────────────────────────────────
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse + validate query params ──────────────────────────────────────
  const params = QuerySchema.safeParse({
    mandi:   req.nextUrl.searchParams.get('mandi'),
    horizon: req.nextUrl.searchParams.get('horizon'),
  })
  if (!params.success) {
    return NextResponse.json({ error: 'Invalid parameters', details: params.error.flatten() }, { status: 400 })
  }
  const { mandi, horizon } = params.data

  // ── 3. Plan-based access control ──────────────────────────────────────────
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, expires_at, status')
    .eq('user_id', user.id)
    .single() as any

  const isExpired = subscription?.status === 'expired' ||
    (subscription?.expires_at && new Date(subscription.expires_at) < new Date())

  if (isExpired) {
    return NextResponse.json({ error: 'SUBSCRIPTION_EXPIRED' }, { status: 402 })
  }

  // PULSE_FARM: only 1 mandi (primary), only D+7
  if (subscription?.plan === 'PULSE_FARM') {
    const { data: profile } = await supabase
      .from('users')
      .select('primary_mandi_id')
      .eq('id', user.id)
      .single() as any

    if (mandi !== profile?.primary_mandi_id) {
      return NextResponse.json(
        { error: 'PLAN_LIMIT', message: 'Upgrade to PULSE_PRO to access all mandis' },
        { status: 403 }
      )
    }
    // Cap horizon to 7 for PULSE_FARM
    params.data.horizon = Math.min(horizon, 7)
  }

  // ── 4. Fetch forecast data ─────────────────────────────────────────────────
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + horizon)

  // Past actuals (7 days for FARM, 14 days for PRO)
  const pastDays = subscription?.plan === 'PULSE_FARM' ? 7 : 14
  const pastStart = new Date(today)
  pastStart.setDate(pastStart.getDate() - pastDays)

  const [forecastResult, actualsResult, festivalsResult, hpaiResult] = await Promise.all([
    supabase
      .from('price_forecasts')
      .select('forecast_date, p10, p50, p90, model_version')
      .eq('mandi_id', mandi)
      .gte('forecast_date', today.toISOString().split('T')[0])
      .lte('forecast_date', endDate.toISOString().split('T')[0])
      .order('forecast_date', { ascending: true }) as any,

    supabase
      .from('price_actuals')
      .select('price_date, actual_price')
      .eq('mandi_id', mandi)
      .gte('price_date', pastStart.toISOString().split('T')[0])
      .lte('price_date', today.toISOString().split('T')[0])
      .order('price_date', { ascending: true }) as any,

    supabase
      .from('festivals')
      .select('name_en, name_hi, festival_date, end_date, demand_impact')
      .gte('festival_date', today.toISOString().split('T')[0])
      .lte('festival_date', endDate.toISOString().split('T')[0])
      .order('festival_date', { ascending: true }) as any,

    supabase
      .from('hpai_alerts')
      .select('district_name, start_date, end_date, radius_km')
      .eq('is_active', true)
      .lte('start_date', endDate.toISOString().split('T')[0]) as any,
  ])

  if (forecastResult.error) {
    console.error('[FSC-API-001] Forecast fetch error:', forecastResult.error.message)
    return NextResponse.json(
      { error: 'DATA_UNAVAILABLE', message: 'Forecast data temporarily unavailable' },
      { status: 503 }
    )
  }

  // ── 5. Merge actuals + forecast into unified timeline ─────────────────────
  // Build a map of actual prices for quick lookup
  const actualsMap = new Map(
    (actualsResult.data ?? []).map((a: any) => [a.price_date, a.actual_price])
  )

  // Combine: for past dates show actual; for future dates show forecast only
  const timeline = [
    // Past: actual prices (with null for P10/P50/P90 — these are "real" points)
    ...(actualsResult.data ?? []).map((a: any) => ({
      date:       a.price_date,
      actual:     a.actual_price,
      p50:        a.actual_price,     // past P50 = actual (visually overlap)
      p10:        null as null,
      p90:        null as null,
      isForecast: false,
    })),
    // Future: forecast only
    ...(forecastResult.data ?? []).map((f: any) => ({
      date:       f.forecast_date,
      actual:     null as null,
      p50:        f.p50,
      p10:        f.p10,
      p90:        f.p90,
      isForecast: true,
    })),
  ]

  // ── 6. Apply watermarking ─────────────────────────────────────────────────
  const watermarked = applyWatermark(timeline, user.id)

  // ── 7. Log access ──────────────────────────────────────────────────────────
  // Fire-and-forget (don't await — don't slow down response)
  logPredictionAccess({
    userId:    user.id,
    mandiId:   mandi,
    horizon,
    request:   req,
    watermarkToken: watermarked.token,
  }).catch(err => console.error('[FSC access log]', err))

  // ── 8. Return response ────────────────────────────────────────────────────
  return NextResponse.json({
    mandi,
    horizon,
    timeline:  watermarked.data,
    festivals: festivalsResult.data ?? [],
    hpaiZones: hpaiResult.data ?? [],
    meta: {
      modelVersion:   (forecastResult.data as any)?.[0]?.model_version ?? 'v1.0',
      dataPoints:     watermarked.data.length,
      generatedAt:    new Date().toISOString(),
      watermarkToken: watermarked.token,
    },
  })
}
