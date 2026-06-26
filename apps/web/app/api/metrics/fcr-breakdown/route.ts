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
    const period = searchParams.get('period') || '30d';

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
    const { data: farms, error: farmsError } = await supabase
      .from('farms')
      .select(`
        id,
        name,
        active_batch:batches(
          id,
          batch_number,
          birds_placed,
          birds_alive,
          placement_date,
          fcr,
          mortality_pct,
          feed_consumed_kg
        )
      `)
      .eq('integrator_id', integratorId)
      .eq('status', 'active')
      .order('name');

    if (farmsError) {
      console.error('Error fetching farms:', farmsError);
      return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
    }

    // Transform data for FCR breakdown table
    const breakdownData = farms
      .filter((farm: any) => farm.active_batch && farm.active_batch.length > 0)
      .map((farm: any) => {
        const batch = farm.active_batch[0];
        const feedPerBird = batch.feed_consumed_kg ? (batch.feed_consumed_kg * 1000) / batch.birds_alive : 0;
        const daysSincePlacement = batch.placementDate 
          ? Math.floor((Date.now() - new Date(batch.placementDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        return {
          farmId: farm.id,
          farmName: farm.name,
          batchNumber: batch.batch_number,
          avgAge: daysSincePlacement,
          feedPerBirdDay: feedPerBird,
          avgWeight: 0, // Would come from weigh-in data
          fcr: batch.fcr,
          vsLastBatch: 0, // Would compare with previous batch
          vsIndustry: batch.fcr < 1.85 ? 'better' : batch.fcr > 1.85 ? 'worse' : 'equal',
        };
      })
      .sort((a: any, b: any) => a.fcr - b.fcr);

    return NextResponse.json(breakdownData);
  } catch (error) {
    console.error('Error in FCR breakdown API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
