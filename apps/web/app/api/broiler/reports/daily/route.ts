import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const supervisor = searchParams.get('supervisor') || '';
    const district = searchParams.get('district') || '';

    // Query supervisor_visits and related tables
    let query = supabase
      .from('supervisor_visits')
      .select(`
        visit_date,
        deaths_today,
        purpose,
        farms!inner(farm_name, farmer_name, village, district),
        employees!inner(name),
        batches!inner(batch_number, birds_placed, status, placement_date)
      `)
      .eq('integrator_id', user.id)
      .gte('visit_date', date)
      .lte('visit_date', date)
      .order('visit_date', { ascending: false });

    if (supervisor) {
      query = query.eq('employees.name', supervisor);
    }

    if (district) {
      query = query.eq('farms.district', district);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to report format
    const reportData = (data || []).map((visit: any) => {
      const placementDate = new Date(visit.batches?.placement_date || visit.visit_date);
      const visitDate = new Date(visit.visit_date);
      const daysIn = Math.floor((visitDate.getTime() - placementDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        date: visit.visit_date,
        farm_name: visit.farms?.farm_name || '',
        farmer_name: visit.farms?.farmer_name || '',
        supervisor_name: visit.employees?.name || '',
        batch_number: visit.batches?.batch_number || '',
        birds_alive: visit.batches?.birds_placed || 0,
        deaths_today: visit.deaths_today || 0,
        feed_given_kg: 0, // Would come from feed allocation
        avg_weight_g: 0, // Would come from body weight records
        fcr: 0, // Calculated field
        days_in: daysIn,
        status: visit.batches?.status || 'active'
      };
    });

    return NextResponse.json({ data: reportData });
  } catch (error) {
    console.error('Error fetching daily report:', error);
    return NextResponse.json({ error: 'Failed to fetch daily report' }, { status: 500 });
  }
}
