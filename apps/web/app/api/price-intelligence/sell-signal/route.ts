import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const QuerySchema = z.object({
  mandi: z.string().min(1).max(50),
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
  const params = QuerySchema.safeParse({ mandi: req.nextUrl.searchParams.get('mandi') })
  if (!params.success) {
    return NextResponse.json({ error: 'Invalid mandi' }, { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]

  // ── 3. Try to get pre-computed signal first ───────────────────────────────
  const { data: precomputed } = await supabase
    .from('sell_signals')
    .select('*')
    .eq('mandi_id', params.data.mandi)
    .eq('signal_date', today)
    .single() as any

  if (precomputed) {
    return NextResponse.json(precomputed)
  }

  // ── 4. Compute signal on-demand if not pre-computed ─────────────────────
  // This is the fallback — signal should ideally be pre-computed by 6 AM job

  const { data: forecast } = await supabase
    .from('price_forecasts')
    .select('forecast_date, p50')
    .eq('mandi_id', params.data.mandi)
    .gte('forecast_date', today)
    .lte('forecast_date', (() => {
      const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]
    })())
    .order('forecast_date', { ascending: true }) as any

  // Get 30-day average price for comparison
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: historicalPrices } = await supabase
    .from('price_actuals')
    .select('actual_price')
    .eq('mandi_id', params.data.mandi)
    .gte('price_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('price_date', { ascending: false })
    .limit(30) as any

  const thirtyDayAvg = historicalPrices && historicalPrices.length > 0
    ? historicalPrices.reduce((sum: number, h: any) => sum + h.actual_price, 0) / historicalPrices.length
    : 160

  const signal = computeSignal(forecast ?? [], thirtyDayAvg)

  return NextResponse.json(signal)
}

// ── Signal computation logic ──────────────────────────────────────────────────
function computeSignal(
  forecast: Array<{ forecast_date: string; p50: number }>,
  thirtyDayAvg: number
): {
  signal: 'SELL_NOW' | 'HOLD' | 'CAUTION'
  optimalWindowStart: string | null
  optimalWindowEnd: string | null
  expectedP50Low: number | null
  expectedP50High: number | null
  confidence: number       // 1–5
  reasons: string[]
} {
  if (!forecast.length) {
    return {
      signal: 'HOLD', optimalWindowStart: null, optimalWindowEnd: null,
      expectedP50Low: null, expectedP50High: null, confidence: 1,
      reasons: ['Insufficient forecast data'],
    }
  }

  const today_p50    = forecast[0]?.p50 ?? thirtyDayAvg
  const d7_p50       = forecast.find(f => new Date(f.forecast_date).getDate() === new Date().getDate() + 7)?.p50
  const d14_p50      = forecast.find(f => new Date(f.forecast_date).getDate() === new Date().getDate() + 14)?.p50

  const isTrendingUp    = d7_p50 ? d7_p50 > today_p50 : false
  const isTrendingDown  = d7_p50 ? d7_p50 < today_p50 - 2 : false
  const aboveAvg        = today_p50 > thirtyDayAvg * 1.03  // >3% above 30-day avg
  const declinesLater   = d14_p50 ? d14_p50 < today_p50 : false

  // SELL_NOW: currently above avg + peak near term + will decline later
  if (aboveAvg && isTrendingUp && declinesLater) {
    const peakIdx  = forecast.reduce((best, f, i) => f.p50 > forecast[best].p50 ? i : best, 0)
    const winStart = forecast[Math.max(0, peakIdx - 2)]?.forecast_date
    const winEnd   = forecast[Math.min(forecast.length - 1, peakIdx + 2)]?.forecast_date
    return {
      signal: 'SELL_NOW',
      optimalWindowStart: winStart ?? null,
      optimalWindowEnd:   winEnd ?? null,
      expectedP50Low:     today_p50,
      expectedP50High:    forecast[peakIdx]?.p50 ?? today_p50,
      confidence: 4,
      reasons: ['Price above 30-day average', 'Peak expected in next 3–5 days', 'Declining trend after peak'],
    }
  }

  // HOLD: price expected to rise significantly in next 7 days
  if (isTrendingUp && !aboveAvg) {
    return {
      signal: 'HOLD',
      optimalWindowStart: forecast[4]?.forecast_date ?? null,
      optimalWindowEnd:   forecast[7]?.forecast_date ?? null,
      expectedP50Low:     today_p50,
      expectedP50High:    d7_p50 ?? today_p50 + 5,
      confidence: 3,
      reasons: ['Price trending upward', 'Better prices expected in 5–7 days'],
    }
  }

  // CAUTION: declining or highly uncertain
  if (isTrendingDown) {
    return {
      signal: 'CAUTION',
      optimalWindowStart: null,
      optimalWindowEnd:   null,
      expectedP50Low:     d7_p50 ?? today_p50 - 8,
      expectedP50High:    today_p50,
      confidence: 2,
      reasons: ['Price expected to decline', 'Sell before further drop', 'Monitor daily'],
    }
  }

  // Default: HOLD (stable market)
  return {
    signal: 'HOLD',
    optimalWindowStart: forecast[2]?.forecast_date ?? null,
    optimalWindowEnd:   forecast[5]?.forecast_date ?? null,
    expectedP50Low:     today_p50 - 3,
    expectedP50High:    today_p50 + 4,
    confidence: 3,
    reasons: ['Stable market', 'No strong directional signal'],
  }
}
