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
      .select('id, segment')
      .eq('phone', user.phone)
      .single();

    if (!customer || (customer.segment !== 'S2' && customer.segment !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (customer.id !== integratorId && customer.segment !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch feed purchases with farm and batch information
    const { data: feedPurchases, error: purchasesError } = await supabase
      .from('feed_purchases')
      .select(`
        id,
        quantity_mt,
        rate_per_kg,
        total_cost,
        purchase_date,
        feed_type,
        farms!inner(
          id,
          name,
          integrator_id
        ),
        batches!inner(
          id,
          batch_number,
          birds_placed
        )
      `)
      .eq('farms.integrator_id', integratorId);

    if (purchasesError) {
      console.error('Error fetching feed purchases:', purchasesError);
      return NextResponse.json({ error: 'Failed to fetch feed purchases' }, { status: 500 });
    }

    // Transform data for feed cost table
    const feedCostData = feedPurchases.map((purchase: any) => {
      const birdsPlaced = purchase.batches?.birds_placed || 1;
      const costPerKgProduced = birdsPlaced > 0 ? purchase.total_cost / birdsPlaced : 0;

      return {
        farmName: purchase.farms.name,
        batchNumber: purchase.batches.batch_number,
        feedType: purchase.feed_type,
        qty: purchase.quantity_mt,
        rate: purchase.rate_per_kg,
        totalCost: purchase.total_cost,
        costPerKgProduced,
      };
    });

    return NextResponse.json(feedCostData);
  } catch (error) {
    console.error('Error in feed cost API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
