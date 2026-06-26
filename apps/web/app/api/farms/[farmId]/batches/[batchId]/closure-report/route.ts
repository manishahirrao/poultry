import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@poultrypulse/types';



// POST /api/farms/[farmId]/batches/[batchId]/closure-report
// Generates a batch closure report PDF and saves it to Supabase Storage
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string; batchId: string }> }
) {
  try {
    const { farmId, batchId } = await params;



    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch batch data
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .eq('farm_id', farmId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Fetch farm data
    const { data: farm } = await supabase
      .from('farms')
      .select('name, integrator_id')
      .eq('id', farmId)
      .single();

    // Fetch costs
    const { data: costs } = await supabase
      .from('batch_costs')
      .select('*')
      .eq('batch_id', batchId);

    // Fetch sales
    const { data: sales } = await supabase
      .from('batch_sales')
      .select('*')
      .eq('batch_id', batchId)
      .order('sale_date');

    // Fetch treatments
    const { data: treatments } = await supabase
      .from('batch_treatments')
      .select('*')
      .eq('batch_id', batchId)
      .order('treatment_date');

    // Fetch documents
    const { data: documents } = await supabase
      .from('documents')
      .select('doc_type, doc_name, created_at')
      .eq('batch_id', batchId)
      .is('deleted_at', null);

    // Build report data structure
    const typedFarm = farm as Database['public']['Tables']['farms']['Row'] | null;
    const typedBatch = batch as any;
    const reportData: any = {
      farm_name: typedFarm?.name || 'Unknown Farm',
      batch_number: typedBatch?.batch_number || batchId.slice(0, 8),
      breed: typedBatch?.breed || 'Unknown',
      closed_at: typedBatch?.closed_at || new Date().toISOString(),
      duration_days: typedBatch?.duration_days || 0,
      birds_placed: typedBatch?.birds_placed || 0,
      birds_harvested: typedBatch?.birds_harvested || 0,
      mortality_pct: typedBatch?.mortality_pct || 0,
      final_fcr: typedBatch?.final_fcr || 0,
      avg_weight_g: typedBatch?.avg_weight_g || 0,
      total_revenue: (sales || []).reduce((s: number, sale: any) => s + (sale.net_revenue || 0), 0),
      total_cost: (costs || []).reduce((s: number, cost: any) => s + (cost.amount || 0), 0),
      gross_profit: 0,
      gross_margin_pct: 0,
      cost_per_bird: 0,
      profit_per_bird: 0,
      sales: sales || [],
      treatments: treatments || [],
      documents: (documents as any) || [],
    };

    // Calculate derived values
    reportData.gross_profit = reportData.total_revenue - reportData.total_cost;
    reportData.gross_margin_pct = reportData.total_revenue > 0
      ? (reportData.gross_profit / reportData.total_revenue) * 100
      : 0;
    reportData.cost_per_bird = reportData.birds_harvested > 0
      ? reportData.total_cost / reportData.birds_harvested
      : 0;
    reportData.profit_per_bird = reportData.birds_harvested > 0
      ? reportData.gross_profit / reportData.birds_harvested
      : 0;

    // Dynamic import of pdf generator to avoid SSR issues
    let reportUrl: string | null = null;
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { BatchClosureReportPDF } = await import('./BatchClosureReportPDF');
      const React = await import('react');

      const pdfDoc = React.default.createElement(BatchClosureReportPDF, { data: reportData });
      const pdfBlob = await pdf(pdfDoc as any).toBlob();
      const pdfBuffer = await (pdfBlob as Blob).arrayBuffer();

      const filePath = `${farmId}/${batchId}/closure-report-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('farm-documents')
        .upload(filePath, pdfBuffer, { contentType: 'application/pdf' });

      if (!uploadError) {
        // Save document record
        await (supabase.from('documents') as any).insert({
          farm_id: farmId,
          batch_id: batchId,
          integrator_id: (typedFarm as any).integrator_id || user.id,
          doc_name: `Batch #${reportData.batch_number} Closure Report`,
          doc_type: 'batch_closure_report',
          file_path: filePath,
          file_ext: 'pdf',
          uploaded_by: user.id,
        });

        const { data: signedUrl } = await supabase.storage
          .from('farm-documents')
          .createSignedUrl(filePath, 3600);

        reportUrl = signedUrl?.signedUrl || null;
      }
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      // Return success even if PDF fails — data was collected
    }

    return NextResponse.json({
      success: true,
      report_url: reportUrl,
      report_data: reportData,
    });

  } catch (error) {
    console.error('Closure report POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
