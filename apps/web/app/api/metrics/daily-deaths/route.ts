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
    
    if (period === '30d') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === '60d') {
      startDate.setDate(endDate.getDate() - 60);
    } else if (period === '90d') {
      startDate.setDate(endDate.getDate() - 90);
    } else {
      startDate.setDate(endDate.getDate() - 30);
    }

    // Fetch farms with their daily logs for the period
    const { data: farms, error: farmsError } = await supabase
      .from('farms')
      .select(`
        id,
        name,
        daily_logs(
          log_date,
          deaths_today
        )
      `)
      .eq('integrator_id', integratorId)
      .eq('status', 'active');

    if (farmsError) {
      console.error('Error fetching farms:', farmsError);
      return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
    }

    // Build daily deaths data
    const dailyDeathsData: any[] = [];
    const dateMap = new Map<string, any>();

    // Initialize date map with all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        date: dateStr,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate daily deaths per farm per day
    farms.forEach((farm: any) => {
      const farmName = farm.name.substring(0, 15);
      const logs = farm.daily_logs || [];

      logs.forEach((log: any) => {
        const logDate = log.log_date.split('T')[0];
        if (dateMap.has(logDate)) {
          const dayData = dateMap.get(logDate);
          if (!dayData[farmName]) {
            dayData[farmName] = 0;
          }
          if (log.deaths_today) {
            dayData[farmName] = log.deaths_today;
          }
        }
      });
    });

    // Convert map to array and sort by date
    const sortedData = Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json(sortedData);
  } catch (error) {
    console.error('Error in daily deaths API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
