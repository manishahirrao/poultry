import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST: Generate PDF report for GC data
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
    const body = await req.json();
    const { batchId } = body;

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

    // Verify farm belongs to this user
    const { data: farm } = await supabase
      .from('farms')
      .select('id, name, current_batch_id')
      .eq('id', farmId)
      .eq('integrator_id', user.id)
      .single();

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const targetBatchId = batchId || (farm as any).current_batch_id;
    if (!targetBatchId) {
      return NextResponse.json({ error: 'No active batch' }, { status: 404 });
    }

    // Fetch GC data
    const { data: gc } = await supabase
      .from('batch_gc_costs')
      .select('*')
      .eq('batch_id', targetBatchId)
      .single();

    // Fetch batch data
    const { data: batch } = await supabase
      .from('batches')
      .select('*')
      .eq('id', targetBatchId)
      .single();

    // Fetch today's P50 forecast for margin analysis (GAP-022)
    const { data: sellSignals } = await (supabase.from('sell_signals') as any)
      .select('expected_p50_high')
      .order('signal_date', { ascending: false })
      .limit(1)
      .single();

    const todayP50 = (sellSignals as any)?.expected_p50_high || 168;

    // Calculate margin at today's price
    const liveWeightKg = ((batch as any)?.avg_weight_g || 0) / 1000;
    const birdsAlive = (batch as any)?.birds_alive || 0;
    const projectedRevenue = birdsAlive * liveWeightKg * todayP50;
    const totalCost = ((gc as any)?.doc_cost_total || 0) + ((gc as any)?.feed_cost_total || 0) + ((gc as any)?.medicine_cost_total || 0) + ((gc as any)?.vaccine_cost_total || 0) + ((gc as any)?.litter_cost_total || 0) + ((gc as any)?.electricity_cost_total || 0) + ((gc as any)?.water_cost_total || 0) + ((gc as any)?.labour_cost_total || 0) + ((gc as any)?.misc_cost_total || 0) + ((gc as any)?.fixed_overhead_alloc || 0);
    const margin = projectedRevenue - totalCost;
    const marginPerKg = birdsAlive > 0 ? margin / (birdsAlive * liveWeightKg) : 0;

    // Generate enhanced HTML content for PDF (GAP-022)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>GC Report - ${(farm as any).name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #1A5C34; }
    .header { border-bottom: 2px solid #1A5C34; padding-bottom: 20px; margin-bottom: 30px; }
    .section { margin-bottom: 30px; }
    .label { font-weight: bold; color: #333; }
    .value { color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    .footer { margin-top: 40px; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>GC Report</h1>
    <p><strong>Farm:</strong> ${(farm as any).name}</p>
    <p><strong>Batch ID:</strong> ${targetBatchId}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</p>
  </div>

  <div class="gc-summary">
    GC per kg: ₹${((gc as any)?.gc_per_kg)?.toFixed(2) || '0.00'}
  </div>

  <div class="section">
    <h2>Batch Information</h2>
    <table>
      <tr><th class="label">Field</th><th class="label">Value</th></tr>
      <tr><td class="label">Birds Placed</td><td class="value">${(batch as any)?.birds_placed || 'N/A'}</td></tr>
      <tr><td class="label">Birds Alive</td><td class="value">${(batch as any)?.birds_alive || 'N/A'}</td></tr>
      <tr><td class="label">Avg Weight (g)</td><td class="value">${(batch as any)?.avg_weight_g || 'N/A'}</td></tr>
      <tr><td class="label">Day Number</td><td class="value">${(batch as any)?.day_number || 'N/A'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>GC Cost Breakdown</h2>
    <table>
      <tr><th class="label">Cost Category</th><th class="label">Amount (₹)</th></tr>
      <tr><td class="label">DOC Cost</td><td class="value">${((gc as any)?.doc_cost_total)?.toFixed(2) || '0.00'}</td></tr>
      <tr><td class="label">Feed Cost</td><td class="value">${((gc as any)?.feed_cost_total)?.toFixed(2) || '0.00'}</td></tr>
      <tr><td class="label">Medicine Cost</td><td class="value">${((gc as any)?.medicine_cost_total)?.toFixed(2) || '0.00'}</td></tr>
      <tr><td class="label">Vaccine Cost</td><td class="value">${((gc as any)?.vaccine_cost_total)?.toFixed(2) || '0.00'}</td></tr>
      <tr><td class="label">Litter Cost</td><td class="value">${((gc as any)?.litter_cost_total)?.toFixed(2) || '0.00'}</td></tr>
      <tr><td class="label">Electricity Cost</td><td class="value">${((gc as any)?.electricity_cost_total)?.toFixed(2) || '0.00'}</td></tr>
      <tr><td class="label">Water Cost</td><td class="value">${((gc as any)?.water_cost_total)?.toFixed(2) || '0.00'}</td></tr>
      <tr><td class="label">Labour Cost</td><td class="value">${((gc as any)?.labour_cost_total)?.toFixed(2) || '0.00'}</td></tr>
      <tr><td class="label">Misc Cost</td><td class="value">${((gc as any)?.misc_cost_total)?.toFixed(2) || '0.00'}</td></tr>
      <tr><td class="label">Fixed Overhead</td><td class="value">${((gc as any)?.fixed_overhead_alloc)?.toFixed(2) || '0.00'}</td></tr>
      <tr><td class="label"><strong>Total Cost</strong></td><td class="value"><strong>₹${(((gc as any)?.doc_cost_total || 0) + ((gc as any)?.feed_cost_total || 0) + ((gc as any)?.medicine_cost_total || 0) + ((gc as any)?.vaccine_cost_total || 0) + ((gc as any)?.litter_cost_total || 0) + ((gc as any)?.electricity_cost_total || 0) + ((gc as any)?.water_cost_total || 0) + ((gc as any)?.labour_cost_total || 0) + ((gc as any)?.misc_cost_total || 0) + ((gc as any)?.fixed_overhead_alloc || 0)).toFixed(2)}</strong></td></tr>
    </table>
  </div>

  <div class="footer">
    <p>Generated by FlockIQ - Poultry Management System</p>
    <p>Report ID: ${(farm as any).id}-${targetBatchId}-${Date.now()}</p>
  </div>
</body>
</html>
    `;

    // Return HTML as response (client will handle PDF generation via browser print)
    // For proper PDF generation, would need Puppeteer or react-pdf library
    // This HTML can be printed to PDF from browser
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="GC-Report-${(farm as any).name}-${new Date().toISOString().split('T')[0]}.html`,
      },
    });
  } catch (error) {
    console.error('GC Export Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
