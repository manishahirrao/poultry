import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    // Calculate date range for the selected month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Query purchases for GSTR1 data (outward supplies)
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select(`
        id,
        purchase_number,
        purchase_date,
        invoice_number,
        subtotal,
        tax_total,
        total_amount,
        suppliers (
          gst_number,
          supplier_name
        ),
        purchase_items (
          quantity,
          unit_rate,
          cgst_amount,
          sgst_amount,
          igst_amount,
          line_total,
          products (
            hsn_code,
            product_name
          )
        )
      `)
      .eq('integrator_id', user.id)
      .gte('purchase_date', startDateStr)
      .lte('purchase_date', endDateStr)
      .order('purchase_date', { ascending: true });

    if (error) throw error;

    // Transform data to GSTR1 format
    const gstr1Data: any[] = [];
    const hsnMap = new Map<string, any>();

    (purchases || []).forEach((purchase: any) => {
      const items = purchase.purchase_items || [];
      items.forEach((item: any) => {
        const taxableValue = parseFloat(item.line_total || 0) - parseFloat(item.cgst_amount || 0) - parseFloat(item.sgst_amount || 0) - parseFloat(item.igst_amount || 0);
        const cgst = parseFloat(item.cgst_amount || 0);
        const sgst = parseFloat(item.sgst_amount || 0);
        const igst = parseFloat(item.igst_amount || 0);
        const totalTax = cgst + sgst + igst;

        gstr1Data.push({
          invoice_date: purchase.purchase_date,
          invoice_number: purchase.invoice_number || purchase.purchase_number,
          party_gstn: purchase.suppliers?.gst_number || '',
          taxable_value: taxableValue,
          cgst_amount: cgst,
          sgst_amount: sgst,
          igst_amount: igst,
          total_tax: totalTax,
          hsn_code: item.products?.hsn_code,
          product_name: item.products?.product_name
        });

        // Build HSN summary
        const hsnCode = item.products?.hsn_code || 'OTHER';
        if (!hsnMap.has(hsnCode)) {
          hsnMap.set(hsnCode, {
            hsn_code: hsnCode,
            description: item.products?.product_name,
            taxable_value: 0,
            cgst_amount: 0,
            sgst_amount: 0,
            igst_amount: 0,
            total_tax: 0
          });
        }
        const summary = hsnMap.get(hsnCode)!;
        summary.taxable_value += taxableValue;
        summary.cgst_amount += cgst;
        summary.sgst_amount += sgst;
        summary.igst_amount += igst;
        summary.total_tax += totalTax;
      });
    });

    const hsnSummary = Array.from(hsnMap.values());

    return NextResponse.json({ 
      data: gstr1Data,
      hsn_summary: hsnSummary,
      meta: {
        month,
        year,
        start_date: startDateStr,
        end_date: endDateStr,
        total_invoices: gstr1Data.length
      }
    });
  } catch (error) {
    console.error('Error fetching GSTR1 data:', error);
    return NextResponse.json({ error: 'Failed to fetch GSTR1 data' }, { status: 500 });
  }
}
