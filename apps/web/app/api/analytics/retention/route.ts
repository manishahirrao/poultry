import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get total customers at start of period
    const { count: totalCustomers, error: countError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (countError) {
      console.error('Error counting customers:', countError);
    }

    // Get churn events in period
    const { data: churnEvents, error: churnError } = await supabase
      .from('churn_events')
      .select('*')
      .gte('churn_date', startDate.toISOString())
      .lte('churn_date', endDate.toISOString());

    if (churnError) {
      console.error('Error fetching churn events:', churnError);
    }

    // Calculate churn rate
    const churnCount = churnEvents?.length || 0;
    const churnRate = totalCustomers && totalCustomers > 0 
      ? (churnCount / totalCustomers) * 100 
      : 0;

    // Get cancellation reasons breakdown
    const reasonsBreakdown = churnEvents?.reduce((acc: any, event) => {
      const reason = event.cancellation_reason_id || 'UNKNOWN';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get save offers performance
    const { data: saveOffers, error: offersError } = await supabase
      .from('save_offers')
      .select('*')
      .gte('presented_at', startDate.toISOString())
      .lte('presented_at', endDate.toISOString());

    if (offersError) {
      console.error('Error fetching save offers:', offersError);
    }

    const offersPresented = saveOffers?.length || 0;
    const offersAccepted = saveOffers?.filter((o: any) => o.status === 'ACCEPTED').length || 0;
    const saveRate = offersPresented > 0 ? (offersAccepted / offersPresented) * 100 : 0;

    // Get MRR lost
    const mrrLost = churnEvents?.reduce((sum: number, event: any) => sum + (event.mrr_lost || 0), 0) || 0;

    // Get churn by subscription tier
    const churnByTier = churnEvents?.reduce((acc: any, event: any) => {
      const tier = event.subscription_tier || 'UNKNOWN';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get cohort analysis (churn by subscription age)
    const churnByCohort = churnEvents?.reduce((acc: any, event: any) => {
      const age = event.subscription_age_days || 0;
      let cohort = '0-30d';
      if (age > 30 && age <= 90) cohort = '31-90d';
      else if (age > 90 && age <= 180) cohort = '91-180d';
      else if (age > 180) cohort = '180d+';
      
      acc[cohort] = (acc[cohort] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      period: `${period} days`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      metrics: {
        totalCustomers: totalCustomers || 0,
        churnCount,
        churnRate: Math.round(churnRate * 10) / 10,
        mrrLost,
        saveOffersPresented: offersPresented,
        saveOffersAccepted: offersAccepted,
        saveRate: Math.round(saveRate * 10) / 10,
      },
      breakdowns: {
        reasons: reasonsBreakdown,
        byTier: churnByTier,
        byCohort: churnByCohort,
      },
    });
  } catch (error) {
    console.error('Error fetching retention metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
