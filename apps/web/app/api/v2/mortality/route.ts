import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Abnormal mortality detection function
const isAbnormal = (todayCount: number, last7Days: number[]): boolean => {
  if (last7Days.length < 3) return todayCount > 50; // fallback for new batches
  const rollingAvg = last7Days.reduce((a, b) => a + b, 0) / last7Days.length;
  return todayCount > (rollingAvg * 3);
};

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { record } = body;

    if (!record) {
      return NextResponse.json({ error: 'Missing record data' }, { status: 400 });
    }

    const { batch_id, log_date, count, cause, age_at_death_days, photo_url, notes } = record;

    // Validate required fields
    if (!batch_id || !log_date || count === undefined || !cause) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get session and verify user
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
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Verify user owns the batch
    const { data: batch } = await supabase
      .from('batches')
      .select('id, customer_id, doc_placement_date, current_bird_count')
      .eq('id', batch_id)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (batch.customer_id !== customer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Insert mortality log
    const { data: mortalityLog, error: insertError } = await supabase
      .from('mortality_logs')
      .insert({
        batch_id,
        log_date,
        count,
        cause,
        age_at_death_days: age_at_death_days || null,
        photo_url: photo_url || null,
        notes: notes || null,
        logged_by: customer.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting mortality log:', insertError);
      return NextResponse.json({ error: 'Failed to insert mortality log' }, { status: 500 });
    }

    // Abnormal mortality detection
    try {
      // Get last 7 days of mortality for this batch
      const { data: recentMortality } = await supabase
        .from('mortality_logs')
        .select('count, log_date')
        .eq('batch_id', batch_id)
        .gte('log_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('log_date', { ascending: true });

      if (recentMortality && recentMortality.length > 0) {
        const last7Days = recentMortality.map((log: any) => log.count);
        
        if (isAbnormal(count, last7Days)) {
          // Get batch info for financial impact calculation
          const { data: batchInfo } = await supabase
            .from('batches')
            .select('current_avg_weight_kg')
            .eq('id', batch_id)
            .single();

          const avgWeight = batchInfo?.current_avg_weight_kg || 2.0;
          const estimatedLoss = count * avgWeight * 150; // Assuming ₹150/kg as P50 price

          // Create abnormal mortality alert
          const { error: alertError } = await supabase
            .from('alerts')
            .insert({
              customer_id: customer.id,
              type: 'abnormal_mortality',
              severity: 'critical',
              title_hi: '⚠️ असामान्य मृत्यु',
              body_hi: `आज ${count} पक्षी मरे — 7-दिन के औसत से 3× अधिक। अनुमानित नुकसान: ~₹${estimatedLoss.toLocaleString()}`,
              title_en: 'Abnormal Mortality Detected',
              body_en: `Today ${count} birds died — 3× the 7-day average. Estimated loss: ~₹${estimatedLoss.toLocaleString()}`,
              district: null,
              issued_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            });

          if (alertError) {
            console.error('Error creating abnormal mortality alert:', alertError);
          }
        }
      }
    } catch (detectionError) {
      console.error('Error in abnormal mortality detection:', detectionError);
      // Don't fail the request if detection fails
    }

    return NextResponse.json({ success: true, data: mortalityLog });
  } catch (error) {
    console.error('Error in mortality log API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const batchId = searchParams.get('batch_id');

    if (!batchId) {
      return NextResponse.json({ error: 'Missing batch_id' }, { status: 400 });
    }

    // Get session and verify user
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
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Verify user owns the batch
    const { data: batch } = await supabase
      .from('batches')
      .select('id, customer_id')
      .eq('id', batchId)
      .single();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (batch.customer_id !== customer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch mortality logs for the batch
    const { data: mortalityLogs, error } = await supabase
      .from('mortality_logs')
      .select('*')
      .eq('batch_id', batchId)
      .order('log_date', { ascending: false });

    if (error) {
      console.error('Error fetching mortality logs:', error);
      return NextResponse.json({ error: 'Failed to fetch mortality logs' }, { status: 500 });
    }

    return NextResponse.json(mortalityLogs || []);
  } catch (error) {
    console.error('Error in mortality log API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
