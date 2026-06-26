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

    // Fetch farms with their batches and daily logs
    const { data: farms, error: farmsError } = await supabase
      .from('farms')
      .select(`
        id,
        name,
        active_batch:batches(
          id,
          placement_date
        ),
        daily_logs(
          log_date,
          deaths_today,
          death_cause,
          cumulative_deaths,
          mortality_pct,
          health_notes
        )
      `)
      .eq('integrator_id', integratorId)
      .eq('status', 'active');

    if (farmsError) {
      console.error('Error fetching farms:', farmsError);
      return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
    }

    // Build mortality log data
    const mortalityLogData: any[] = [];

    farms.forEach((farm: any) => {
      const batch = farm.active_batch?.[0];
      const logs = farm.daily_logs || [];

      logs.forEach((log: any) => {
        const logDate = new Date(log.log_date);
        if (logDate >= startDate && logDate <= endDate) {
          const dayNumber = batch?.placement_date
            ? Math.floor((logDate.getTime() - new Date(batch.placement_date).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          mortalityLogData.push({
            farmId: farm.id,
            farmName: farm.name,
            date: log.log_date.split('T')[0],
            dayNumber,
            deaths: log.deaths_today || 0,
            cause: log.death_cause,
            cumulativePct: log.mortality_pct || 0,
            actionTaken: log.health_notes,
          });
        }
      });
    });

    // Sort by date descending
    mortalityLogData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(mortalityLogData);
  } catch (error) {
    console.error('Error in mortality log API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
