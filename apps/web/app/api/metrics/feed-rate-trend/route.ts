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

    // Fetch feed purchases grouped by month for the last 6 months
    const { data: feedPurchases, error: purchasesError } = await supabase
      .from('feed_purchases')
      .select(`
        purchase_date,
        rate_per_kg
      `)
      .in('farm_id', (
        await supabase
          .from('farms')
          .select('id')
          .eq('integrator_id', integratorId)
      ).data?.map((f: any) => f.id) || [])
      .gte('purchase_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('purchase_date');

    if (purchasesError) {
      console.error('Error fetching feed purchases:', purchasesError);
      return NextResponse.json({ error: 'Failed to fetch feed purchases' }, { status: 500 });
    }

    // Group by month and calculate average rate
    const monthMap = new Map<string, { totalRate: number; count: number }>();

    feedPurchases.forEach((purchase: any) => {
      const date = new Date(purchase.purchase_date);
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { totalRate: 0, count: 0 });
      }
      
      const data = monthMap.get(monthKey)!;
      data.totalRate += purchase.rate_per_kg;
      data.count += 1;
    });

    // Convert to array and calculate averages
    const feedRateTrendData = Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      purchaseRate: data.totalRate / data.count,
      ncdexIndex: 25 + Math.random() * 5, // Placeholder NCDEX index
    }));

    return NextResponse.json(feedRateTrendData);
  } catch (error) {
    console.error('Error in feed rate trend API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
