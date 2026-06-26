import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { startOfMonth, endOfMonth } from 'date-fns';

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

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const supervisor = searchParams.get('supervisor') || '';
    const line = searchParams.get('line') || '';

    const startDate = startOfMonth(new Date(month + '-01'));
    const endDate = endOfMonth(new Date(month + '-01'));

    // Query batch_sales and related tables for the month
    let query = supabase
      .from('batch_sales')
      .select(`
        sold_date,
        total_amount,
        rate_per_kg,
        weight_kg,
        batches!inner(
          batch_number,
          placement_date,
          farms!inner(farm_name, farmer_name, village, district),
          employees!inner(name),
          lines!inner(line_name)
        ),
        feed_medicine_allocations(
          alloc_date,
          total_quantity,
          total_value,
          alloc_type
        )
      `)
      .eq('integrator_id', user.id)
      .gte('sold_date', startDate.toISOString())
      .lte('sold_date', endDate.toISOString());

    if (supervisor) {
      query = query.eq('batches.employees.name', supervisor);
    }

    if (line) {
      query = query.eq('batches.lines.line_name', line);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to report format
    const formattedData = (data || []).map((sale: any) => {
      const revenue = sale.total_amount || 0;
      
      // Calculate costs from allocations
      const allocations = sale.feed_medicine_allocations || [];
      const chickCost = allocations
        .filter((a: any) => a.alloc_type === 'chick')
        .reduce((sum: number, a: any) => sum + (a.total_value || 0), 0);
      const feedCost = allocations
        .filter((a: any) => a.alloc_type === 'feed')
        .reduce((sum: number, a: any) => sum + (a.total_value || 0), 0);
      const medicineCost = allocations
        .filter((a: any) => a.alloc_type === 'medicine')
        .reduce((sum: number, a: any) => sum + (a.total_value || 0), 0);
      const otherCost = allocations
        .filter((a: any) => a.alloc_type === 'other')
        .reduce((sum: number, a: any) => sum + (a.total_value || 0), 0);
      
      const totalCost = chickCost + feedCost + medicineCost + otherCost;
      const grossMargin = revenue - totalCost;
      const marginPercent = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
      
      // Mock budget variance (15% target margin)
      const targetMargin = revenue * 0.15;
      const budgetVariance = grossMargin - targetMargin;
      const budgetVariancePercent = targetMargin > 0 ? (budgetVariance / targetMargin) * 100 : 0;
      
      return {
        farm_name: sale.batches?.farms?.farm_name || '',
        farmer_name: sale.batches?.farms?.farmer_name || '',
        batch_number: sale.batches?.batch_number || '',
        supervisor_name: sale.batches?.employees?.name || '',
        line_name: sale.batches?.lines?.line_name || 'Line 1',
        revenue: revenue,
        chick_cost: chickCost,
        feed_cost: feedCost,
        medicine_cost: medicineCost,
        other_cost: otherCost,
        total_cost: totalCost,
        gross_margin: grossMargin,
        margin_percent: marginPercent,
        budget_variance: budgetVariance,
        budget_variance_percent: budgetVariancePercent
      };
    });

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error('Error fetching monthly P&L report:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly P&L report' }, { status: 500 });
  }
}
