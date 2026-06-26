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
    const severity = searchParams.get('severity') || 'all';

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

    // Fetch daily logs with health issues
    const { data: logs, error: logsError } = await supabase
      .from('daily_logs')
      .select(`
        log_date,
        health_issue,
        health_symptoms,
        health_severity,
        health_notes,
        farms!inner(
          id,
          name,
          integrator_id
        )
      `)
      .eq('farms.integrator_id', integratorId)
      .eq('health_issue', true)
      .order('log_date', { ascending: false })
      .limit(50);

    if (logsError) {
      console.error('Error fetching health events:', logsError);
      return NextResponse.json({ error: 'Failed to fetch health events' }, { status: 500 });
    }

    // Transform data
    const healthEventData = logs
      .filter((log: any) => severity === 'all' || log.health_severity === severity)
      .map((log: any) => ({
        farmId: log.farms.id,
        farmName: log.farms.name,
        date: log.log_date.split('T')[0],
        severity: log.health_severity || 'mild',
        symptoms: log.health_symptoms || [],
        notes: log.health_notes,
      }));

    return NextResponse.json(healthEventData);
  } catch (error) {
    console.error('Error in health events API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
