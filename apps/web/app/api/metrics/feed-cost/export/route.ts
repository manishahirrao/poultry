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
          district,
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

    // Generate CSV content
    const headers = ['Farm Name', 'District', 'Batch #', 'Feed Type', 'Qty (MT)', 'Rate (₹/kg)', 'Total Cost', 'Purchase Date'];
    const rows = feedPurchases.map((purchase: any) => [
      purchase.farms.name,
      purchase.farms.district || '',
      purchase.batches.batch_number,
      purchase.feed_type || '',
      purchase.quantity_mt?.toFixed(2) || '',
      purchase.rate_per_kg?.toFixed(2) || '',
      purchase.total_cost?.toFixed(0) || '',
      purchase.purchase_date.split('T')[0],
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=feed-cost-${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error('Error in feed cost export API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
