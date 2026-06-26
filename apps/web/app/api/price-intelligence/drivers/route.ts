import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const Schema = z.object({ mandi: z.string().min(1).max(50) })

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = Schema.safeParse({ mandi: req.nextUrl.searchParams.get('mandi') })
  if (!params.success) return NextResponse.json({ error: 'Invalid mandi' }, { status: 400 })

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('price_drivers')
    .select('rank, name_en, name_hi, description_en, description_hi, impact_rs, magnitude_pct, confidence')
    .eq('mandi_id', params.data.mandi)
    .eq('prediction_date', today)
    .order('rank', { ascending: true })
    .limit(5) as any

  if (error || !data?.length) {
    // Return null drivers — component shows "Computing drivers..." placeholder
    return NextResponse.json({ drivers: null, isAvailable: false })
  }

  // Generate visible watermark token (for display in UI — deterrent)
  const shortId = user.id.substring(0, 8).toUpperCase()
  const visibleToken = `FQ-${shortId}`

  return NextResponse.json({
    drivers: data.map((d: any) => ({
      rank:          d.rank,
      nameEn:        d.name_en,
      nameHi:        d.name_hi,
      descriptionEn: d.description_en,
      descriptionHi: d.description_hi,
      impactRs:      Number(d.impact_rs),
      magnitudePct:  Number(d.magnitude_pct),
      direction:     Number(d.impact_rs) >= 0 ? 'up' : 'down',
      confidence:    d.confidence,
    })),
    isAvailable:  true,
    watermarkToken: visibleToken,
  })
}
