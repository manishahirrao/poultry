import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch dashboard overview from materialized view
    const { data: overview, error: overviewError } = await supabase
      .from('mv_dashboard_overview')
      .select('*')
      .eq('integrator_id', user.id)
      .single();

    // Type for overview data
    const overviewData: any = overview;

    if (overviewError) {
      console.error('Error fetching dashboard overview:', overviewError);
      // Return empty data if view doesn't exist yet
      return NextResponse.json({
        active_farms: 0,
        total_farmers: 0,
        birds_0_7d: 0,
        birds_8_14d: 0,
        birds_15_21d: 0,
        birds_22_28d: 0,
        birds_29_35d: 0,
        birds_35plus: 0,
        today_mortality: 0,
        total_live_birds: 0,
        not_visited_1d: 0,
        not_visited_3d: 0,
        not_visited_7d: 0,
        avg_sale_rate: 0,
        month_revenue: 0,
        month_cost: 0,
        month_profit: 0,
        last_refresh: new Date().toISOString()
      });
    }

    // Compute not visited farms
    const today = new Date();
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get farms with no supervisor visits in last 1 day
    const { data: farms1d } = await supabase
      .from('farms')
      .select('id')
      .not('id', 'in', `
        SELECT DISTINCT farm_id 
        FROM supervisor_visits 
        WHERE visit_date >= '${oneDayAgo.toISOString().split('T')[0]}'
      `);

    // Get farms with no supervisor visits in last 3 days
    const { data: farms3d } = await supabase
      .from('farms')
      .select('id')
      .not('id', 'in', `
        SELECT DISTINCT farm_id 
        FROM supervisor_visits 
        WHERE visit_date >= '${threeDaysAgo.toISOString().split('T')[0]}'
      `);

    // Get farms with no supervisor visits in last 7 days
    const { data: farms7d } = await supabase
      .from('farms')
      .select('id')
      .not('id', 'in', `
        SELECT DISTINCT farm_id 
        FROM supervisor_visits 
        WHERE visit_date >= '${sevenDaysAgo.toISOString().split('T')[0]}'
      `);

    // Compute average sale rate from last 30 days
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const { data: sales } = await supabase
      .from('batch_sales')
      .select('rate_per_kg')
      .gte('sold_date', thirtyDaysAgo.toISOString().split('T')[0]);

    let avgSaleRate = 0;
    if (sales && sales.length > 0) {
      const totalRate = sales.reduce((sum: number, sale: any) => sum + (sale.rate_per_kg || 0), 0);
      avgSaleRate = totalRate / sales.length;
    }

    // Compute month revenue, cost, profit from closed batches this month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const { data: closedBatches } = await supabase
      .from('batch_costs')
      .select('total_revenue, total_cost')
      .eq('status', 'closed')
      .gte('closed_date', firstDayOfMonth.toISOString().split('T')[0]);

    let monthRevenue = 0;
    let monthCost = 0;
    let monthProfit = 0;

    if (closedBatches && closedBatches.length > 0) {
      monthRevenue = closedBatches.reduce((sum: number, batch: any) => sum + (batch.total_revenue || 0), 0);
      monthCost = closedBatches.reduce((sum: number, batch: any) => sum + (batch.total_cost || 0), 0);
      monthProfit = monthRevenue - monthCost;
    }

    // Get supervisor activity
    const { data: supervisors } = await supabase
      .from('employees')
      .select('id')
      .eq('role', 'supervisor');

    const supervisorCount = supervisors?.length || 0;

    // Get visits today
    const { data: visitsToday } = await supabase
      .from('supervisor_visits')
      .select('id, supervisor_id')
      .eq('visit_date', today.toISOString().split('T')[0]);

    const visitsTodayCount = visitsToday?.length || 0;
    const activeSupervisorsToday = new Set(visitsToday?.map((v: any) => v.supervisor_id)).size;

    // Get closed batches this month for bird sale count
    const { data: monthClosedBatches } = await supabase
      .from('batches')
      .select('birds_sold')
      .eq('status', 'closed')
      .gte('closed_date', firstDayOfMonth.toISOString().split('T')[0]);

    const birdsSoldThisMonth = monthClosedBatches?.reduce((sum: number, batch: any) => sum + (batch.birds_sold || 0), 0) || 0;

    return NextResponse.json({
      active_farms: overviewData?.active_farms || 0,
      total_farmers: overviewData?.total_farmers || 0,
      birds_0_7d: overviewData?.birds_0_7d || 0,
      birds_8_14d: overviewData?.birds_8_14d || 0,
      birds_15_21d: overviewData?.birds_15_21d || 0,
      birds_22_28d: overviewData?.birds_22_28d || 0,
      birds_29_35d: overviewData?.birds_29_35d || 0,
      birds_35plus: overviewData?.birds_35plus || 0,
      today_mortality: overviewData?.today_mortality || 0,
      total_live_birds: overviewData?.total_live_birds || 0,
      not_visited_1d: farms1d?.length || 0,
      not_visited_3d: farms3d?.length || 0,
      not_visited_7d: farms7d?.length || 0,
      avg_sale_rate: avgSaleRate,
      month_revenue: monthRevenue,
      month_cost: monthCost,
      month_profit: monthProfit,
      supervisor_count: supervisorCount,
      active_supervisors_today: activeSupervisorsToday,
      visits_today: visitsTodayCount,
      birds_sold_this_month: birdsSoldThisMonth,
      last_refresh: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in dashboard overview API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
