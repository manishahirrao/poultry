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

    // Get today's date in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const todayIST = new Date(now.getTime() + istOffset).toISOString().split('T')[0];

    // Fetch farms with their active batches and latest logs
    const { data: farms, error: farmsError } = await supabase
      .from('farms')
      .select(`
        id,
        name,
        district,
        active_batch:batches(
          id,
          birds_placed,
          placement_date
        )
      `)
      .eq('integrator_id', integratorId)
      .eq('status', 'active');

    if (farmsError) {
      console.error('Error fetching farms:', farmsError);
      return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
    }

    const missingLogs: any[] = [];
    const overdueVaccinations: any[] = [];
    const lowFeedStock: any[] = [];
    const fcrAlerts: any[] = [];
    const mortalityAlerts: any[] = [];

    // Check for missing logs and calculate FCR/mortality alerts
    for (const farm of farms) {
      const { data: latestLog } = await supabase
        .from('daily_logs')
        .select('log_date, fcr, mortality_pct')
        .eq('farm_id', farm.id)
        .order('log_date', { ascending: false })
        .limit(1)
        .single();

      const lastLogDate = latestLog?.log_date ? latestLog.log_date.split('T')[0] : null;
      
      if (!lastLogDate || lastLogDate < todayIST) {
        missingLogs.push({
          farmId: farm.id,
          farmName: farm.name,
          lastLogDate: lastLogDate,
        });
      }

      // Check for FCR alerts
      if (latestLog?.fcr && latestLog.fcr > 2.1) {
        fcrAlerts.push({
          farmId: farm.id,
          farmName: farm.name,
          fcr: latestLog.fcr,
          message: `FCR trending upward (${latestLog.fcr.toFixed(3)}, ↑)`,
        });
      }

      // Check for mortality alerts
      if (latestLog?.mortality_pct && latestLog.mortality_pct > 5) {
        mortalityAlerts.push({
          farmId: farm.id,
          farmName: farm.name,
          mortality: latestLog.mortality_pct,
          message: `Mortality ${latestLog.mortality_pct.toFixed(1)}% (above 5% threshold)`,
        });
      }
    }

    // Check for overdue vaccinations
    const { data: vaccinations } = await supabase
      .from('vaccinations')
      .select(`
        id,
        farm_id,
        vaccine_name,
        due_date,
        status,
        farms!inner(
          id,
          name,
          integrator_id
        )
      `)
      .eq('farms.integrator_id', integratorId)
      .eq('status', 'pending')
      .lt('due_date', todayIST);

    if (vaccinations) {
      vaccinations.forEach((vaccination: any) => {
        overdueVaccinations.push({
          farmId: vaccination.farm_id,
          farmName: vaccination.farms.name,
          vaccine: vaccination.vaccine_name,
          dueDate: vaccination.due_date,
        });
      });
    }

    // Check for low feed stock (placeholder logic - would need feed_purchases table)
    // For now, this is a placeholder that would be implemented with proper feed tracking
    farms.forEach((farm: any) => {
      // Placeholder: In production, this would calculate from feed_purchases and consumption
      const daysRemaining = 10; // Placeholder value
      if (daysRemaining < 5) {
        lowFeedStock.push({
          farmId: farm.id,
          farmName: farm.name,
          daysRemaining,
        });
      }
    });

    return NextResponse.json({
      missingLogs,
      overdueVaccinations,
      lowFeedStock,
      fcrAlerts,
      mortalityAlerts,
    });
  } catch (error) {
    console.error('Error in pending actions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
