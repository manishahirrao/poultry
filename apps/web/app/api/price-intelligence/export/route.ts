import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const Schema = z.object({
  mandi: z.string().min(1).max(50),
  horizon: z.coerce.number().int().min(7).max(30).default(30),
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = Schema.safeParse({
    mandi: req.nextUrl.searchParams.get('mandi'),
    horizon: req.nextUrl.searchParams.get('horizon'),
  })
  if (!params.success) return NextResponse.json({ error: 'Invalid params' }, { status: 400 })

  const { mandi, horizon } = params.data
  const today = new Date().toISOString().split('T')[0]
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + horizon)
  const endStr = endDate.toISOString().split('T')[0]

  const { data: forecast } = await supabase
    .from('price_forecasts')
    .select('forecast_date, p10, p50, p90')
    .eq('mandi_id', mandi)
    .gte('forecast_date', today)
    .lte('forecast_date', endStr)
    .order('forecast_date', { ascending: true })

  const { data: actuals } = await supabase
    .from('price_actuals')
    .select('price_date, actual_price')
    .eq('mandi_id', mandi)
    .gte('price_date', (() => { const d = new Date(); d.setDate(d.getDate() - 14); return d.toISOString().split('T')[0] })())
    .lte('price_date', today)
    .order('price_date', { ascending: true })

  const actualsMap = new Map((actuals as any ?? []).map((a: any) => [a.price_date, a.actual_price]))

  // Build CSV rows
  const DISCLAIMER = `DISCLAIMER: Forecast accuracy decreases with prediction horizon. Day 1-3: high confidence (<6% MAPE). Day 7-14: moderate (<10%). Day 15-30: indicative only (<15%). FlockIQ is not liable for trading decisions. Verify with local mandi before transacting. Generated: ${new Date().toISOString()} | Mandi: ${mandi} | User: ${user.id.substring(0, 8)}`

  const headers = ['Date', 'Day', 'P10 (Rs/kg)', 'P50 Forecast (Rs/kg)', 'P90 (Rs/kg)', 'Actual Price (Rs/kg)', 'Type']
  const rows: string[][] = [
    // Disclaimer as first data row (legal requirement — see REQ-FSC-002)
    [DISCLAIMER, '', '', '', '', '', ''],
    headers,
  ]

  // Past actuals
  for (const a of actuals as any ?? []) {
    rows.push([a.price_date, '', '', a.actual_price.toString(), '', a.actual_price.toString(), 'Actual'])
  }

  // Forecast
  for (const f of forecast as any ?? []) {
    const dayNum = Math.round((new Date(f.forecast_date).getTime() - new Date(today).getTime()) / 86400000)
    rows.push([
      f.forecast_date,
      `D+${dayNum}`,
      f.p10?.toString() ?? '',
      f.p50?.toString() ?? '',
      f.p90?.toString() ?? '',
      actualsMap.get(f.forecast_date)?.toString() ?? '',
      'Forecast',
    ])
  }

  const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
  const filename = `flockiq-forecast-${mandi}-${today}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
