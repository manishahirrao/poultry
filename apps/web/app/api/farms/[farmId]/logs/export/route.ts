import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/farms/[farmId]/logs/export
// Returns CSV stream of all logs for active batch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
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
      .select('id, segment, role')
      .eq('id', user.id)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerData as { id: string; segment: string; role: string | null };

    // Check segment: only S2 or admin can export logs
    if (customer.segment !== 'S2' && customer.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: daily log export is available for S2 integrators only' },
        { status: 403 }
      );
    }

    // Verify farm ownership (RLS check)
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('id, name')
      .eq('id', farmId)
      .eq('integrator_id', customer.id)
      .single();

    if (farmError || !farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    // Get active batch for this farm
    const { data: activeBatch, error: batchError } = await supabase
      .from('batches')
      .select('id, batch_number')
      .eq('farm_id', farmId)
      .eq('status', 'active')
      .single();

    if (batchError || !activeBatch) {
      return NextResponse.json(
        { error: 'No active batch found for this farm' },
        { status: 400 }
      );
    }

    // Fetch all logs for this batch
    const { data: logs, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('batch_id', (activeBatch as any).id)
      .order('log_date', { ascending: true });

    if (logsError) {
      console.error('Daily logs fetch error:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch daily logs' },
        { status: 500 }
      );
    }

    if (!logs || logs.length === 0) {
      return NextResponse.json(
        { error: 'No logs found for this batch' },
        { status: 404 }
      );
    }

    // Generate CSV
    const headers = [
      'Date',
      'Day #',
      'Deaths Today',
      'Death Cause',
      'Cumulative Deaths',
      'Cumulative Mortality %',
      'Feed Consumed (kg)',
      'Feed Type',
      'Feed/Bird (g)',
      'Cumulative Feed (kg)',
      'Sample Birds',
      'Sample Weight (kg)',
      'Avg Weight (g)',
      'FCR',
      'Water (L)',
      'Temp Min (°C)',
      'Temp Max (°C)',
      'Humidity (%)',
      'Health Issue',
      'Health Symptoms',
      'Health Severity',
      'Health Notes',
      'Notes',
    ];

    const csvRows = logs.map((log: any) => [
      log.log_date,
      log.batch_day,
      log.deaths_today,
      log.death_cause || '',
      log.cumulative_deaths || 0,
      log.cumulative_mortality_pct || 0,
      log.feed_consumed_kg,
      log.feed_type || '',
      log.feed_per_bird_g || 0,
      log.cumulative_feed_kg || 0,
      log.sample_birds || '',
      log.sample_weight_kg || '',
      log.avg_weight_g || '',
      log.fcr || '',
      log.water_litres || '',
      log.temp_min_c || '',
      log.temp_max_c || '',
      log.humidity_pct || '',
      log.health_issue ? 'Yes' : 'No',
      log.health_symptoms ? log.health_symptoms.join('; ') : '',
      log.health_severity || '',
      log.health_notes || '',
      log.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create filename with farm name and date
    const farmName = (farm as any).name.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `farm-${farmName}-logs-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Daily logs export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
