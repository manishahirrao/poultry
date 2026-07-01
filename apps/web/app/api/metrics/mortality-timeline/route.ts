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
    const integratorId = searchParams.get('integrator_id');
    const period = searchParams.get('period') || '30d';

    if (!integratorId) {
      return NextResponse.json({ error: 'Missing integrator_id' }, { status: 400 });
    }

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === '7d') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(endDate.getDate() - 90);
    } else {
      startDate.setDate(endDate.getDate() - 30);
    }

    // Try to fetch real daily_logs data for mortality
    let timelineData: any[] = [];
    try {
      const { data: farms, error: farmsError } = await supabase
        .from('farms')
        .select(`
          id,
          name,
          batches(id, birds_placed),
          daily_logs(log_date, deaths_today, cumulative_deaths, mortality_pct)
        `)
        .eq('integrator_id', integratorId);

      if (!farmsError && farms) {
        const dateMap = new Map<string, any>();
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          dateMap.set(dateStr, { date: dateStr, cumulativePct: 0 });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        let totalBirdsPlaced = 0;
        farms.forEach((farm: any) => {
          totalBirdsPlaced += farm.batches?.[0]?.birds_placed || 0;
          const logs = farm.daily_logs || [];
          logs.forEach((log: any) => {
            const logDate = log.log_date?.split('T')[0];
            if (logDate && dateMap.has(logDate)) {
              const dayData = dateMap.get(logDate);
              const farmName = farm.name.substring(0, 15);
              dayData[farmName] = log.deaths_today || 0;
            }
          });
        });

        let runningCumulative = 0;
        const sortedDates = Array.from(dateMap.keys()).sort();
        sortedDates.forEach((dateStr) => {
          const dayData = dateMap.get(dateStr);
          let dayDeaths = 0;
          farms.forEach((farm: any) => {
            const farmName = farm.name.substring(0, 15);
            if (dayData[farmName]) dayDeaths += dayData[farmName];
          });
          runningCumulative += dayDeaths;
          dayData.cumulativePct = totalBirdsPlaced > 0 ? (runningCumulative / totalBirdsPlaced) * 100 : 0;
        });

        timelineData = Array.from(dateMap.values()).sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }
    } catch (e) {
      // daily_logs table may not exist yet
    }

    // If no real data, return placeholder timeline
    if (timelineData.length === 0 || timelineData.every((d: any) => d.cumulativePct === 0)) {
      const placeholderData: any[] = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        placeholderData.push({
          date: dateStr,
          cumulativePct: 0,
        });
        current.setDate(current.getDate() + 1);
      }
      return NextResponse.json(placeholderData);
    }

    return NextResponse.json(timelineData);
  } catch (error) {
    console.error('Error in mortality timeline API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
