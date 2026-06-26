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

    // Fetch daily logs with death causes for the period
    const { data: logs, error: logsError } = await supabase
      .from('daily_logs')
      .select(`
        death_cause,
        deaths_today
      `)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .lte('log_date', endDate.toISOString().split('T')[0])
      .in('farm_id', (
        await supabase
          .from('farms')
          .select('id')
          .eq('integrator_id', integratorId)
          .eq('status', 'active')
      ).data?.map((f: any) => f.id) || []);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    // Aggregate cause of death data
    const causeMap = new Map<string, number>();
    
    logs.forEach((log: any) => {
      if (log.death_cause && log.deaths_today) {
        const current = causeMap.get(log.death_cause) || 0;
        causeMap.set(log.death_cause, current + log.deaths_today);
      }
    });

    // Convert map to array
    const causeData = Array.from(causeMap.entries()).map(([cause, value]) => ({
      name: cause.charAt(0).toUpperCase() + cause.slice(1),
      value,
    }));

    return NextResponse.json(causeData);
  } catch (error) {
    console.error('Error in cause of death API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
