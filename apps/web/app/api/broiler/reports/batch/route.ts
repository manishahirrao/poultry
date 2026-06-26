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
    const batchId = searchParams.get('batch_id');

    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required / बैच आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    // Fetch batch details
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select(`
        *,
        farms!inner(id, farm_name, village, district),
        sheds!inner(id, shed_name),
        farmers!inner(id, full_name, phone)
      `)
      .eq('id', batchId)
      .eq('integrator_id', user.id)
      .single();

    if (batchError || !batch) {
      return NextResponse.json(
        { error: 'Batch not found / बैच नहीं मिला' },
        { status: 404 }
      );
    }

    // Fetch daily logs for the batch
    const { data: dailyLogs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('batch_id', batchId)
      .order('log_date', { ascending: true });

    // Fetch treatments for the batch
    const { data: treatments } = await supabase
      .from('batch_treatments')
      .select(`
        *,
        medicines_db!inner(id, medicine_name)
      `)
      .eq('batch_id', batchId)
      .order('treatment_date', { ascending: true });

    // Fetch sales for the batch
    const { data: sales } = await supabase
      .from('batch_sales')
      .select('*')
      .eq('batch_id', batchId)
      .order('sold_date', { ascending: true });

    // Fetch costs for the batch
    const { data: costs } = await supabase
      .from('batch_costs')
      .select('*')
      .eq('batch_id', batchId)
      .single();

    // Fetch supervisor visits for the batch
    const { data: visits } = await supabase
      .from('supervisor_visits')
      .select(`
        *,
        employees!inner(id, name)
      `)
      .eq('batch_id', batchId)
      .order('visit_date', { ascending: true });

    // Calculate summary metrics
    const totalMortality = dailyLogs?.reduce((sum: number, log: any) => sum + (log.mortality || 0), 0) || 0;
    const totalFeed = dailyLogs?.reduce((sum: number, log: any) => sum + (log.feed_consumed_kg || 0), 0) || 0;
    const totalBirdsSold = sales?.reduce((sum: number, sale: any) => sum + (sale.birds_sold || 0), 0) || 0;
    const totalRevenue = sales?.reduce((sum: number, sale: any) => sum + (sale.total_amount || 0), 0) || 0;

    const batchReport = {
      batch,
      summary: {
        total_mortality: totalMortality,
        total_feed_kg: totalFeed,
        total_birds_sold: totalBirdsSold,
        total_revenue: totalRevenue,
        mortality_rate: batch.birds_placed > 0 ? (totalMortality / batch.birds_placed) * 100 : 0,
        fcr: totalFeed > 0 && totalBirdsSold > 0 ? totalFeed / totalBirdsSold : 0,
      },
      daily_logs: dailyLogs || [],
      treatments: treatments || [],
      sales: sales || [],
      costs: costs || null,
      supervisor_visits: visits || [],
    };

    return NextResponse.json({
      data: batchReport,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching batch report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch batch report / बैच रिपोर्ट प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
