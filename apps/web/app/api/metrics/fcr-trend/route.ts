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

    // Try to fetch real daily_logs data
    let trendData: any[] = [];
    try {
      const { data: farms, error: farmsError } = await supabase
        .from('farms')
        .select(`
          id,
          name,
          batches(id, placement_date),
          daily_logs(log_date, fcr, feed_consumed_kg, birds_alive)
        `)
        .eq('integrator_id', integratorId);

      if (!farmsError && farms) {
        const dateMap = new Map<string, any>();
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          dateMap.set(dateStr, { date: dateStr, portfolioAvg: 0, industryAvg: 1.85 });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        farms.forEach((farm: any) => {
          const logs = farm.daily_logs || [];
          logs.forEach((log: any) => {
            const logDate = log.log_date?.split('T')[0];
            if (logDate && dateMap.has(logDate) && log.fcr) {
              const dayData = dateMap.get(logDate);
              dayData.portfolioAvg = log.fcr;
            }
          });
        });

        trendData = Array.from(dateMap.values()).sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }
    } catch (e) {
      // daily_logs table may not exist yet — generate placeholder trend data
    }

    // If no real data, return placeholder trend so chart still renders
    if (trendData.length === 0 || trendData.every((d: any) => d.portfolioAvg === 0)) {
      const placeholderData: any[] = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        placeholderData.push({
          date: dateStr,
          portfolioAvg: 0,
          industryAvg: 1.85,
        });
        current.setDate(current.getDate() + 1);
      }
      return NextResponse.json(placeholderData);
    }

    return NextResponse.json(trendData);
  } catch (error) {
    console.error('Error in FCR trend API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
