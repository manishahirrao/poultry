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

    // Get session and verify user owns this integrator account
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id, segment')
      .eq('phone', user.phone)
      .single();

    if (!customer || (customer.segment !== 'S2' && customer.segment !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (customer.id !== integratorId && customer.segment !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
    }

    // Fetch farms with their daily logs for the period
    const { data: farms, error: farmsError } = await supabase
      .from('farms')
      .select(`
        id,
        name,
        active_batch:batches(
          id,
          birds_placed
        ),
        daily_logs(
          log_date,
          deaths_today,
          cumulative_deaths,
          mortality_pct
        )
      `)
      .eq('integrator_id', integratorId)
      .eq('status', 'active');

    if (farmsError) {
      console.error('Error fetching farms:', farmsError);
      return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
    }

    // Build mortality timeline data
    const timelineData: any[] = [];
    const dateMap = new Map<string, any>();

    // Initialize date map with all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        date: dateStr,
        cumulativePct: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate mortality data per farm per day
    let totalCumulativeDeaths = 0;
    let totalBirdsPlaced = 0;

    farms.forEach((farm: any) => {
      const farmName = farm.name.substring(0, 15);
      const logs = farm.daily_logs || [];
      const birdsPlaced = farm.active_batch?.[0]?.birds_placed || 0;
      totalBirdsPlaced += birdsPlaced;

      logs.forEach((log: any) => {
        const logDate = log.log_date.split('T')[0];
        if (dateMap.has(logDate)) {
          const dayData = dateMap.get(logDate);
          if (!dayData[farmName]) {
            dayData[farmName] = 0;
          }
          if (log.deaths_today) {
            dayData[farmName] = log.deaths_today;
            totalCumulativeDeaths += log.cumulative_deaths || 0;
          }
        }
      });
    });

    // Calculate cumulative mortality percentage per day
    let runningCumulative = 0;
    const sortedDates = Array.from(dateMap.keys()).sort();
    
    sortedDates.forEach((dateStr) => {
      const dayData = dateMap.get(dateStr);
      let dayDeaths = 0;
      
      farms.forEach((farm: any) => {
        const farmName = farm.name.substring(0, 15);
        if (dayData[farmName]) {
          dayDeaths += dayData[farmName];
        }
      });

      runningCumulative += dayDeaths;
      dayData.cumulativePct = totalBirdsPlaced > 0 ? (runningCumulative / totalBirdsPlaced) * 100 : 0;
    });

    // Convert map to array and sort by date
    const sortedData = Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json(sortedData);
  } catch (error) {
    console.error('Error in mortality timeline API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
