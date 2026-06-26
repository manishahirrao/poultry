import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { calculateSellHoldMatrix, type RoiCalculatorInputs, type PriceForecast } from '@/lib/roiCalculator';

// Schema for ROI Optimizer request
const RoiOptimizerSchema = z.object({
  batch_id: z.string().uuid(),
  current_weight: z.number().positive(),
  current_birds: z.number().positive(),
  total_cost: z.number().positive(),
  age_days: z.number().int().positive(),
  breed: z.string().optional(),
  feed_cost_per_kg: z.number().optional(),
  overhead_cost_per_bird_per_day: z.number().optional(),
  actual_fcr: z.number().optional(),
  actual_weight_gain_per_day: z.number().optional(),
});



// POST /api/v1/batch/roi-optimizer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RoiOptimizerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }

    const data = validation.data;



    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch batch data to get customer_id and mandi
    const { data: batchData, error: batchError } = await supabase
      .from('batches')
      .select('customer_id, breed, doc_count')
      .eq('id', data.batch_id)
      .single();

    if (batchError || !batchData) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const typedBatchData = batchData as any;

    // Fetch customer mandi for price forecast
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('mandi')
      .eq('id', typedBatchData.customer_id)
      .single();

    const typedCustomerData = customerData as any;

    if (customerError || !typedCustomerData?.mandi) {
      return NextResponse.json({ error: 'Customer mandi not found' }, { status: 404 });
    }

    // Fetch price forecast from predictions table
    const { data: pricePrediction, error: predictionError } = await supabase
      .from('predictions')
      .select('p10, p50, p90')
      .eq('mandi', typedCustomerData.mandi)
      .order('predicted_for', { ascending: false })
      .limit(1)
      .single();

    if (predictionError) {
      console.error('Price prediction fetch error:', predictionError);
      // Fallback to default forecast
    }

    const typedPricePrediction = pricePrediction as any;

    const forecast: PriceForecast = {
      p10: typedPricePrediction?.p10 || 160,
      p50: typedPricePrediction?.p50 || 168,
      p90: typedPricePrediction?.p90 || 176,
    };

    // Prepare ROI calculator inputs
    const inputs: RoiCalculatorInputs = {
      flockSize: data.current_birds,
      ageDays: data.age_days,
      avgWeightKg: data.current_weight,
      feedCostPerKg: data.feed_cost_per_kg || 30,
      overheadCostPerBirdPerDay: data.overhead_cost_per_bird_per_day || 2,
      actualFCR: data.actual_fcr,
      actualWeightGainPerDay: data.actual_weight_gain_per_day,
    };

    // Calculate sell-hold matrix
    const result = calculateSellHoldMatrix(inputs, forecast);
    const optimalScenario = result.sellHoldMatrix.find((row: any) => row.isOptimal);

    return NextResponse.json({
      success: true,
      recommendation: optimalScenario?.scenario === 'today' ? 'sell' : 'hold',
      projected_revenue: optimalScenario?.revenue.base || 0,
      projected_profit: optimalScenario?.netProfit.base || 0,
      optimal_scenario: optimalScenario?.scenario || 'today',
      sell_hold_matrix: result.sellHoldMatrix,
      break_even_price: result.breakEvenPrice,
      profit_waterfall: result.profitWaterfall,
    });

  } catch (error) {
    console.error('ROI Optimizer POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
