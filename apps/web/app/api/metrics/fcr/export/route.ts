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
        district,
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

    // Generate CSV content
    const headers = ['Farm Name', 'District', 'Batch #', 'Birds Placed', 'Birds Alive', 'FCR', 'Mortality %', 'Feed Consumed (kg)', 'Feed/Bird/Day (gm)'];
    const rows = farms.map((farm: any) => {
      const batch = farm.active_batch?.[0];
      if (!batch) return null;
      
      const feedPerBird = batch.feed_consumed_kg ? (batch.feed_consumed_kg * 1000) / batch.birdsAlive : 0;
      
      return [
        farm.name,
        farm.district || '',
        batch.batch_number,
        batch.birds_placed,
        batch.birds_alive,
        batch.fcr?.toFixed(3) || '',
        batch.mortality_pct?.toFixed(2) || '',
        batch.feed_consumed_kg?.toFixed(2) || '',
        feedPerBird.toFixed(0),
      ];
    }).filter(row => row !== null);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=fcr-analysis-${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error('Error in FCR export API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
