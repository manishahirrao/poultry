import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { differenceInDays, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    const farm = searchParams.get('farm') || '';
    const supervisor = searchParams.get('supervisor') || '';

    // Query batches and daily_logs tables
    let query = supabase
      .from('batches')
      .select(`
        batch_number,
        placement_date,
        birds_placed,
        status,
        farms!inner(farm_name, farmer_name, village, district),
        employees!inner(name),
        daily_logs(
          date,
          deaths,
          cause_of_death
        )
      `)
      .eq('integrator_id', user.id)
      .gte('placement_date', startDate)
      .lte('placement_date', endDate)
      .order('placement_date', { ascending: false });

    if (farm) {
      query = query.eq('farms.farm_name', farm);
    }

    if (supervisor) {
      query = query.eq('employees.name', supervisor);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to report format
    const formattedData = (data || []).map((batch: any) => {
      const daysIn = differenceInDays(new Date(), new Date(batch.placement_date));
      const dailyLogs = batch.daily_logs || [];
      
      // Calculate total deaths from daily logs
      const totalDeaths = dailyLogs.reduce((sum: number, log: any) => sum + (log.deaths || 0), 0);
      const mortalityPercent = batch.birds_placed > 0 ? (totalDeaths / batch.birds_placed) * 100 : 0;
      
      // Get today's deaths
      const today = new Date().toISOString().split('T')[0];
      const todayDeaths = dailyLogs
        .filter((log: any) => log.date === today)
        .reduce((sum: number, log: any) => sum + (log.deaths || 0), 0);
      
      // Find highest day deaths
      const highestDayLog = dailyLogs.reduce((max: any, log: any) => 
        (log.deaths || 0) > (max?.deaths || 0) ? log : max, null);
      const highestDayDeaths = highestDayLog?.deaths || 0;
      const highestDayDate = highestDayLog?.date || '';
      
      // Calculate cause breakdown
      const causeBreakdown = dailyLogs.reduce((acc: any, log: any) => {
        const cause = log.cause_of_death || 'other';
        acc[cause] = (acc[cause] || 0) + (log.deaths || 0);
        return acc;
      }, {});
      
      return {
        farm_name: batch.farms?.farm_name || '',
        farmer_name: batch.farms?.farmer_name || '',
        batch_number: batch.batch_number || '',
        placement_date: batch.placement_date,
        days_in: daysIn,
        birds_placed: batch.birds_placed || 0,
        total_deaths: totalDeaths,
        mortality_percent: mortalityPercent,
        today_deaths: todayDeaths,
        highest_day_deaths: highestDayDeaths,
        highest_day_date: highestDayDate ? format(new Date(highestDayDate), 'dd MMM yyyy') : '',
        cause_breakdown: {
          disease: causeBreakdown.disease || 0,
          heat_stress: causeBreakdown.heat_stress || 0,
          predation: causeBreakdown.predation || 0,
          other: causeBreakdown.other || 0
        }
      };
    });

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error('Error fetching mortality report:', error);
    return NextResponse.json({ error: 'Failed to fetch mortality report' }, { status: 500 });
  }
}
