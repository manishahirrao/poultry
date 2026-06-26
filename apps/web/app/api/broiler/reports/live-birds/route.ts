import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { differenceInDays } from 'date-fns';

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

    // Query batches, farms, and related tables for active batches
    const { data, error } = await supabase
      .from('batches')
      .select(`
        batch_number,
        placement_date,
        birds_placed,
        status,
        farms!inner(farm_name, farmer_name, village),
        daily_logs(
          date,
          deaths,
          feed_given_kg,
          avg_weight_g
        )
      `)
      .eq('integrator_id', user.id)
      .eq('status', 'active')
      .order('placement_date', { ascending: false });

    if (error) throw error;

    // Transform data to report format
    const formattedData = (data || []).map((batch: any) => {
      const daysIn = differenceInDays(new Date(), new Date(batch.placement_date));
      const harvestReady = daysIn >= 35;
      
      // Calculate total deaths from daily logs
      const totalDeaths = (batch.daily_logs || []).reduce((sum: number, log: any) => sum + (log.deaths || 0), 0);
      const liveBirds = batch.birds_placed - totalDeaths;
      const mortalityPercent = batch.birds_placed > 0 ? (totalDeaths / batch.birds_placed) * 100 : 0;
      
      // Get latest weight and feed data
      const latestLog = (batch.daily_logs || []).sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      const avgWeightG = latestLog?.avg_weight_g || 0;
      const feedGivenKg = (batch.daily_logs || []).reduce((sum: number, log: any) => sum + (log.feed_given_kg || 0), 0);
      const fcr = feedGivenKg > 0 && liveBirds > 0 ? feedGivenKg / liveBirds : 0;
      
      // Mock target weight based on days in (breed standard)
      const targetWeightG = daysIn * 30; // Approximate 30g per day growth
      
      // Calculate GC (mock calculation)
      const gc = avgWeightG > 0 ? (avgWeightG * 0.8) : 0;
      
      return {
        farm_name: batch.farms?.farm_name || '',
        farmer_name: batch.farms?.farmer_name || '',
        batch_number: batch.batch_number || '',
        placement_date: batch.placement_date,
        days_in: daysIn,
        birds_placed: batch.birds_placed || 0,
        live_birds: liveBirds,
        mortality_percent: mortalityPercent,
        avg_weight_g: avgWeightG,
        target_weight_g: targetWeightG,
        fcr: fcr,
        gc: gc,
        harvest_ready: harvestReady
      };
    });
    
    // Sort by days_in descending
    formattedData.sort((a: any, b: any) => b.days_in - a.days_in);
    
    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error('Error fetching farm live birds report:', error);
    return NextResponse.json({ error: 'Failed to fetch farm live birds report' }, { status: 500 });
  }
}
