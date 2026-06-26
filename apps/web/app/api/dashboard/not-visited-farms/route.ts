import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '3');

    // Calculate the date threshold
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);
    const thresholdDateStr = thresholdDate.toISOString().split('T')[0];

    // Fetch farms with their last supervisor visit
    const { data: farms, error } = await supabase
      .from('farms')
      .select(`
        id,
        farm_name,
        farmer_id,
        farmers!inner(farmer_name),
        supervisor_id,
        employees!inner(name),
        supervisor_visits!supervisor_visits_farm_id_fkey(
          visit_date
        )
      `)
      .eq('integrator_id', user.id)
      .eq('is_active', true);

    if (error) throw error;

    // Calculate days since last visit for each farm
    const notVisitedFarms = farms
      .map((farm: any) => {
        const visits = farm.supervisor_visits || [];
        const lastVisit = visits.length > 0 
          ? visits.reduce((latest: any, visit: any) => 
              new Date(visit.visit_date) > new Date(latest.visit_date) ? visit : latest
            )
          : null;
        
        const daysSinceVisit = lastVisit 
          ? Math.floor((new Date().getTime() - new Date(lastVisit.visit_date).getTime()) / (1000 * 60 * 60 * 24))
          : 999; // Large number for never visited

        return {
          id: farm.id,
          farm_id: farm.id,
          farm_name: farm.farm_name,
          farmer_name: farm.farmers?.farmer_name || '-',
          supervisor_name: farm.employees?.name || '-',
          last_visit_date: lastVisit?.visit_date || null,
          days_since_visit: daysSinceVisit
        };
      })
      .filter((farm: any) => farm.days_since_visit >= days)
      .sort((a: any, b: any) => b.days_since_visit - a.days_since_visit);

    return NextResponse.json({
      data: notVisitedFarms,
      error: null,
      meta: { total: notVisitedFarms.length }
    });
  } catch (error) {
    console.error('Error fetching not-visited farms:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch not-visited farms / नहीं देखे गए फार्म प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
