import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId');

    if (!farmId) {
      return NextResponse.json({ error: 'Missing farmId' }, { status: 400 });
    }

    // Get session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch farm data with latest logs
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select(`
        id,
        name,
        active_batch:batches(
          id,
          birds_placed,
          birds_alive,
          placement_date,
          fcr,
          feed_consumed_kg
        ),
        daily_logs(
          log_date,
          feed_consumed_kg,
          deaths_today,
          temp_max_c,
          water_litres
        )
      `)
      .eq('id', farmId)
      .single();

    if (farmError || !farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const recommendations: any[] = [];
    const batch = farm.active_batch?.[0];
    const logs = farm.daily_logs || [];

    if (batch) {
      const birdsAlive = batch.birds_alive || batch.birds_placed;
      const feedPerBird = batch.feed_consumed_kg ? (batch.feed_consumed_kg * 1000) / birdsAlive : 0;
      
      // Rule-based recommendations (Phase 1)
      
      // Check feed wastage
      if (feedPerBird > 150) { // Assuming target is ~120-130g/bird/day for broilers
        recommendations.push({
          title: 'Feed wastage suspected',
          description: 'Feed per bird is higher than expected. Check feeder height and adjust to reduce spillage.',
          severity: 'warning',
        });
      }

      // Check recent temperature
      const recentLogs = logs.slice(-7);
      const highTempLogs = recentLogs.filter((log: any) => log.temp_max_c && log.temp_max_c > 32);
      if (highTempLogs.length > 0) {
        recommendations.push({
          title: 'Heat stress detected',
          description: 'High temperatures recorded recently. Heat stress may be reducing FCR. Check ventilation and cooling systems.',
          severity: 'critical',
        });
      }

      // Check mortality spike
      const recentDeaths = recentLogs.reduce((sum: number, log: any) => sum + (log.deaths_today || 0), 0);
      if (recentDeaths > birdsAlive * 0.01) { // More than 1% mortality in last 7 days
        recommendations.push({
          title: 'Recent mortality spike',
          description: 'Elevated mortality detected in recent logs. This may be affecting FCR. Investigate bird health and causes.',
          severity: 'critical',
        });
      }

      // Check water intake
      const lowWaterLogs = recentLogs.filter((log: any) => log.water_litres && log.water_litres < birdsAlive * 0.2);
      if (lowWaterLogs.length > 0) {
        recommendations.push({
          title: 'Low water intake',
          description: 'Water intake appears low. Ensure adequate water availability as this affects feed conversion.',
          severity: 'warning',
        });
      }

      // General FCR guidance
      if (batch.fcr > 2.0) {
        recommendations.push({
          title: 'FCR above target',
          description: 'Current FCR is above the target of 2.0. Review feed quality, bird health, and environmental conditions.',
          severity: 'warning',
        });
      }

      // If no specific issues found
      if (recommendations.length === 0) {
        recommendations.push({
          title: 'FCR within acceptable range',
          description: 'Current FCR is performing well. Continue monitoring and maintaining current practices.',
          severity: 'info',
        });
      }
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error in FCR recommendations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
