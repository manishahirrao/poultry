import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Get P&L overview for the authenticated integrator
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get customer to check segment
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const integratorId = (customerData as any).id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'current_quarter';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'current_quarter') {
      const currentMonth = now.getMonth();
      const quarterStart = Math.floor(currentMonth / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart, 1);
      endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
    } else if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else { // this_month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Fetch all farms for this integrator
    const { data: farms, error: farmsError } = await supabase
      .from('farms')
      .select('id, name, current_batch_id')
      .eq('integrator_id', integratorId);

    if (farmsError) {
      console.error('Farms query error:', farmsError);
      return NextResponse.json(
        { error: 'Failed to fetch farms' },
        { status: 500 }
      );
    }

    const farmIds = (farms as any)?.map((f: any) => f.id) || [];

    // Fetch batch GC costs for all batches
    const { data: batchGCs, error: gcError } = await supabase
      .from('batch_gc_costs')
      .select('*')
      .in('farm_id', farmIds);

    if (gcError) {
      console.error('Batch GC costs query error:', gcError);
      return NextResponse.json(
        { error: 'Failed to fetch GC costs' },
        { status: 500 }
      );
    }

    // Fetch feed purchases for cost calculation
    const { data: feedPurchases, error: feedError } = await supabase
      .from('feed_purchases')
      .select('batch_id, quantity_kg, rate_per_kg, purchase_date')
      .in('farm_id', farmIds)
      .gte('purchase_date', startDate.toISOString())
      .lte('purchase_date', endDate.toISOString());

    if (feedError) {
      console.error('Feed purchases query error:', feedError);
      return NextResponse.json(
        { error: 'Failed to fetch feed purchases' },
        { status: 500 }
      );
    }

    // Fetch salary records for the period
    const { data: salaryRecords, error: salaryError } = await supabase
      .from('salary_records')
      .select('*')
      .eq('integrator_id', integratorId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (salaryError) {
      console.error('Salary records query error:', salaryError);
      return NextResponse.json(
        { error: 'Failed to fetch salary records' },
        { status: 500 }
      );
    }

    // Fetch business expenses for the period
    const { data: expenses, error: expensesError } = await supabase
      .from('business_expenses')
      .select('*')
      .eq('integrator_id', integratorId)
      .gte('expense_date', startDate.toISOString().split('T')[0])
      .lte('expense_date', endDate.toISOString().split('T')[0]);

    if (expensesError) {
      console.error('Expenses query error:', expensesError);
      return NextResponse.json(
        { error: 'Failed to fetch expenses' },
        { status: 500 }
      );
    }

    // Fetch batch data for revenue calculation
    const { data: batches, error: batchesError } = await supabase
      .from('batches')
      .select('id, farm_id, birds_placed, birds_alive, avg_weight_g, day_number, status, placement_date, harvest_date, actual_revenue')
      .in('farm_id', farmIds);


    // Fetch today's P50 forecast from sell_signals table (GAP-015)
    const { data: sellSignals, error: signalsError } = await supabase
      .from('sell_signals')
      .select('expected_p50_high')
      .order('signal_date', { ascending: false })
      .limit(1)
      .single();

    const todayP50 = (sellSignals as any)?.expected_p50_high || 168; // Fallback to 168 if no forecast available

    if (batchesError) {
      console.error('Batches query error:', batchesError);
      return NextResponse.json(
        { error: 'Failed to fetch batches' },
        { status: 500 }
      );
    }

    // Calculate revenue from completed batches
    let completedBatchesRevenue = 0;
    let activeBatchesProjectedRevenue = 0;
    let totalBirdsAlive = 0;
    let totalLiveWeightKg = 0;

    const farmContributions: Array<{ farmId: string; farmName: string; revenue: number; profit: number }> = [];
    const farmGCComparison: Array<{ farmId: string; farmName: string; gcPerKg: number; vsBenchmark: number }> = [];

    (batches as any)?.forEach((batch: any) => {
      const farm = (farms as any)?.find((f: any) => f.id === batch.farm_id);
      const farmName = farm?.name || 'Unknown';
      
      if (batch.status === 'completed' && batch.actual_revenue) {
        completedBatchesRevenue += batch.actual_revenue || 0;
      } else if (batch.status === 'active') {
        // Project revenue using P50 forecast (simplified - use 168 as default)
        const avgWeightKg = (batch.avg_weight_g || 0) / 1000;
        const projectedRevenue = (batch.birds_alive || 0) * avgWeightKg * 168; // 168 = default P50 price
        activeBatchesProjectedRevenue += projectedRevenue;
        totalBirdsAlive += batch.birds_alive || 0;
        totalLiveWeightKg += (batch.birds_alive || 0) * avgWeightKg;
      }

      // Calculate farm-wise contribution
      const batchGC = (batchGCs as any)?.find((gc: any) => gc.batch_id === batch.id);
      if (batchGC && farm) {
        const feedCost = (feedPurchases as any)
          ?.filter((fp: any) => fp.batch_id === batch.id)
          .reduce((sum: number, fp: any) => sum + (fp.quantity_kg * fp.rate_per_kg), 0) || 0;

        const totalCost = (batchGC.doc_cost_total || 0) + 
                         feedCost + 
                         (batchGC.medicine_cost_total || 0) + 
                         (batchGC.vaccine_cost_total || 0) + 
                         (batchGC.litter_cost_total || 0) + 
                         (batchGC.electricity_cost_total || 0) + 
                         (batchGC.water_cost_total || 0) + 
                         (batchGC.labour_cost_total || 0) + 
                         (batchGC.misc_cost_total || 0) + 
                         (batchGC.fixed_overhead_alloc || 0);

        const revenue = batch.status === 'completed' ? (batch.actual_revenue || 0) : 
                       ((batch.birds_alive || 0) * ((batch.avg_weight_g || 0) / 1000) * 168);
        
        const profit = revenue - totalCost;

        const existingContribution = farmContributions.find(fc => fc.farmId === farm.id);
        if (existingContribution) {
          existingContribution.revenue += revenue;
          existingContribution.profit += profit;
        } else {
          farmContributions.push({ farmId: farm.id, farmName, revenue, profit });
        }

        // GC comparison
        if (batchGC.gc_per_kg) {
          farmGCComparison.push({
            farmId: farm.id,
            farmName,
            gcPerKg: batchGC.gc_per_kg,
            vsBenchmark: batchGC.gc_per_kg - 95 // 95 = industry benchmark
          });
        }
      }
    });

    const totalRevenue = completedBatchesRevenue + activeBatchesProjectedRevenue;

    // Calculate variable costs from batch GC data
    let totalDOCCost = 0;
    let totalFeedCost = 0;
    let totalMedicineCost = 0;
    let totalVaccineCost = 0;
    let totalLitterCost = 0;
    let totalVariableCosts = 0;

    (batchGCs as any)?.forEach((gc: any) => {
      totalDOCCost += gc.doc_cost_total || 0;
      totalMedicineCost += gc.medicine_cost_total || 0;
      totalVaccineCost += gc.vaccine_cost_total || 0;
      totalLitterCost += gc.litter_cost_total || 0;
    });

    // Calculate feed cost from purchases
    (feedPurchases as any)?.forEach((fp: any) => {
      totalFeedCost += fp.quantity_kg * fp.rate_per_kg;
    });

    totalVariableCosts = totalDOCCost + totalFeedCost + totalMedicineCost + totalVaccineCost + totalLitterCost;

    // Calculate fixed costs
    let totalEmployeeSalaries = 0;
    let totalBusinessExpenses = 0;
    let totalFixedOverhead = 0;

    (salaryRecords as any)?.forEach((sr: any) => {
      totalEmployeeSalaries += sr.net_salary || 0;
    });

    (expenses as any)?.forEach((exp: any) => {
      totalBusinessExpenses += exp.amount || 0;
    });

    // Fixed overhead allocation (simplified - 10% of variable costs)
    totalFixedOverhead = totalVariableCosts * 0.1;

    const totalFixedCosts = totalEmployeeSalaries + totalBusinessExpenses + totalFixedOverhead;

    // Calculate margins
    const grossMargin = totalRevenue - totalVariableCosts;
    const grossMarginPct = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
    const netProfit = grossMargin - totalFixedCosts;
    const netMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Per-bird economics
    const revenuePerBird = totalBirdsAlive > 0 ? totalRevenue / totalBirdsAlive : 0;
    const variableCostPerBird = totalBirdsAlive > 0 ? totalVariableCosts / totalBirdsAlive : 0;
    const fixedCostPerBird = totalBirdsAlive > 0 ? totalFixedCosts / totalBirdsAlive : 0;
    const netProfitPerBird = totalBirdsAlive > 0 ? netProfit / totalBirdsAlive : 0;

    // Monthly trend data (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const trendDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const trendMonth = trendDate.toLocaleString('default', { month: 'short' });
      // Simplified - in production, fetch actual historical data
      monthlyTrend.push({
        month: trendMonth,
        profit: netProfit * (1 - (i * 0.1)) // Mock trend
      });
    }

    return NextResponse.json({
      period,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      revenue: {
        total: totalRevenue,
        completedBatches: completedBatchesRevenue,
        activeBatchesProjected: activeBatchesProjectedRevenue,
        p50Forecast: todayP50 // Include P50 forecast for transparency (GAP-015)
      },
      variableCosts: {
        total: totalVariableCosts,
        docCost: totalDOCCost,
        feedCost: totalFeedCost,
        medicineCost: totalMedicineCost,
        vaccineCost: totalVaccineCost,
        litterCost: totalLitterCost,
        other: 0 // electricity + water + misc
      },
      grossMargin: {
        amount: grossMargin,
        percentage: grossMarginPct
      },
      fixedCosts: {
        total: totalFixedCosts,
        employeeSalaries: totalEmployeeSalaries,
        businessExpenses: totalBusinessExpenses,
        fixedOverhead: totalFixedOverhead
      },
      netProfit: {
        amount: netProfit,
        percentage: netMarginPct
      },
      perBirdEconomics: {
        revenuePerBird,
        variableCostPerBird,
        fixedCostPerBird,
        netProfitPerBird,
        totalBirds: totalBirdsAlive,
        totalLiveWeightKg
      },
      farmContributions: farmContributions.sort((a, b) => b.profit - a.profit),
      farmGCComparison: farmGCComparison.sort((a, b) => a.gcPerKg - b.gcPerKg),
      monthlyTrend
    });
  } catch (error) {
    console.error('P&L Overview API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
