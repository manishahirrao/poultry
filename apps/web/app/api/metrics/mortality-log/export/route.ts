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
      .select('id')
      .eq('phone', user.phone)
      .single();

    if (!customer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (customer.id !== integratorId) {
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
        district,
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

    // Generate CSV content
    const headers = ['Farm Name', 'District', 'Date', 'Day #', 'Deaths', 'Cause', 'Cumulative Deaths', 'Cumulative %', 'Action Taken'];
    const rows: any[] = [];

    farms.forEach((farm: any) => {
      const batch = farm.active_batch?.[0];
      const logs = farm.daily_logs || [];

      logs.forEach((log: any) => {
        const logDate = new Date(log.log_date);
        if (logDate >= startDate && logDate <= endDate) {
          const dayNumber = batch?.placement_date
            ? Math.floor((logDate.getTime() - new Date(batch.placement_date).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          rows.push([
            farm.name,
            farm.district || '',
            log.log_date.split('T')[0],
            dayNumber,
            log.deaths_today || 0,
            log.death_cause || '',
            log.cumulative_deaths || 0,
            log.mortality_pct?.toFixed(2) || '',
            log.health_notes || '',
          ]);
        }
      });
    });

    // Sort by date descending
    rows.sort((a, b) => new Date(b[2]).getTime() - new Date(a[2]).getTime());

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=mortality-log-${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error('Error in mortality log export API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
