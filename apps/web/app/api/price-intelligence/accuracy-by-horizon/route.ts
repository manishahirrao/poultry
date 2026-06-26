import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get latest model version's accuracy by horizon
  const { data, error } = await supabase
    .from('model_accuracy_by_horizon')
    .select('horizon_days, directional_acc, mape')
    .order('computed_at', { ascending: false })
    .limit(6) as any  // D+1, D+3, D+7, D+14, D+21, D+30

  if (error || !data?.length) {
    // Return estimated values with flag when DB data missing
    return NextResponse.json({
      isEstimated: true,
      horizons: [
        { days: 1,  label: 'D+1',  directionalAcc: 96, mape: 2.1 },
        { days: 3,  label: 'D+3',  directionalAcc: 92, mape: 3.8 },
        { days: 7,  label: 'D+7',  directionalAcc: 82, mape: 5.9 },
        { days: 14, label: 'D+14', directionalAcc: 70, mape: 8.2 },
        { days: 21, label: 'D+21', directionalAcc: 58, mape: 11.4 },
        { days: 30, label: 'D+30', directionalAcc: 46, mape: 14.7 },
      ],
    })
  }

  return NextResponse.json({
    isEstimated: false,
    horizons: data
      .sort((a: any, b: any) => a.horizon_days - b.horizon_days)
      .map((h: any) => ({
        days:           h.horizon_days,
        label:          `D+${h.horizon_days}`,
        directionalAcc: Number(h.directional_acc),
        mape:           Number(h.mape),
      })),
  })
}
