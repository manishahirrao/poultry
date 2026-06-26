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
      .select('id')
      .eq('phone', user.phone)
      .single();

    if (!customer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (customer.id !== integratorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch farms with their active batches
    const { data: farms, error } = await supabase
      .from('farms')
      .select(`
        id,
        name,
        district,
        status,
        active_batch:batches(
          id,
          batch_number,
          birds_placed,
          birds_alive,
          placement_date,
          fcr,
          mortality_pct,
          last_log_date,
          feed_consumed_kg
        )
      `)
      .eq('integrator_id', integratorId)
      .order('name');

    if (error) {
      console.error('Error fetching farms:', error);
      return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
    }

    // Calculate portfolio summary metrics
    let totalBirds = 0;
    let weightedFCRSum = 0;
    let totalMortality = 0;
    let totalFeed = 0;
    let activeBatchCount = 0;
    let farmsWithPendingLogs = 0;

    const istOffset = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const todayIST = new Date(now.getTime() + istOffset).toISOString().split('T')[0];

    farms.forEach((farm: any) => {
      if (farm.active_batch && farm.active_batch.length > 0) {
        const batch = farm.active_batch[0];
        const birdsAlive = batch.birds_alive || 0;
        totalBirds += birdsAlive;
        weightedFCRSum += (batch.fcr || 0) * birdsAlive;
        totalMortality += batch.mortality_pct || 0;
        totalFeed += (batch.feed_consumed_kg || 0) / 1000; // Convert to MT
        activeBatchCount++;

        // Check if today's log is pending
        if (batch.last_log_date) {
          const logDate = new Date(batch.last_log_date);
          const istLogDate = new Date(logDate.getTime() + istOffset).toISOString().split('T')[0];
          if (istLogDate !== todayIST) {
            farmsWithPendingLogs++;
          }
        } else {
          farmsWithPendingLogs++;
        }
      }
    });

    const summary = {
      totalBirds,
      portfolioFCR: totalBirds > 0 ? weightedFCRSum / totalBirds : 0,
      portfolioMortality: activeBatchCount > 0 ? totalMortality / activeBatchCount : 0,
      totalFeed,
      activeFarms: farms.length,
      activeBatches: activeBatchCount,
      farmsWithPendingLogs,
      complianceRate: activeBatchCount > 0 ? ((activeBatchCount - farmsWithPendingLogs) / activeBatchCount) * 100 : 100,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error in portfolio summary API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
