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

    // Query purchases for ITC (Input Tax Credit)
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select(`
        id,
        purchase_number,
        purchase_date,
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
          line_total
        )
      `)
      .eq('integrator_id', user.id)
      .gte('purchase_date', startDateStr)
      .lte('purchase_date', endDateStr)
      .order('purchase_date', { ascending: true });

    if (purchasesError) throw purchasesError;

    // Query vouchers for outward supplies (sales/receipts)
    const { data: vouchers, error: vouchersError } = await supabase
      .from('vouchers')
      .select(`
        id,
        voucher_number,
        voucher_date,
        voucher_type,
        total_amount,
        narration,
        voucher_entries (
          ledger_account_id,
          entry_type,
          amount,
          ledger_accounts (
            account_name,
            gst_number
          )
        )
      `)
      .eq('integrator_id', user.id)
      .in('voucher_type', ['receipt', 'journal'])
      .gte('voucher_date', startDateStr)
      .lte('voucher_date', endDateStr)
      .order('voucher_date', { ascending: true });

    if (vouchersError) throw vouchersError;

    // Calculate ITC from purchases
    let itcCGST = 0;
    let itcSGST = 0;
    let itcIGST = 0;
    let itcTotal = 0;
    let totalPurchases = 0;

    (purchases || []).forEach((purchase: any) => {
      const items = purchase.purchase_items || [];
      items.forEach((item: any) => {
        itcCGST += parseFloat(item.cgst_amount || 0);
        itcSGST += parseFloat(item.sgst_amount || 0);
        itcIGST += parseFloat(item.igst_amount || 0);
      });
      totalPurchases += parseFloat(purchase.total_amount || 0);
    });

    itcTotal = itcCGST + itcSGST + itcIGST;

    // Calculate outward supplies from vouchers (receipts = sales)
    let outwardTaxable = 0;
    let outwardCGST = 0;
    let outwardSGST = 0;
    let outwardIGST = 0;
    let outwardTotalTax = 0;
    let outwardTotal = 0;

    (vouchers || []).forEach((voucher: any) => {
      const entries = voucher.voucher_entries || [];
      entries.forEach((entry: any) => {
        // Credit entries in receipts represent sales/income
        if (voucher.voucher_type === 'receipt' && entry.entry_type === 'Cr') {
          // Assuming tax is embedded or calculated proportionally
          // For now, we'll use a simplified calculation
          outwardTaxable += parseFloat(entry.amount || 0);
        }
      });
      outwardTotal += parseFloat(voucher.total_amount || 0);
    });

    // Estimate tax components (18% GST split 9% CGST + 9% SGST for intra-state)
    // This is a simplified calculation - in production, you'd track actual tax per transaction
    outwardCGST = outwardTaxable * 0.09;
    outwardSGST = outwardTaxable * 0.09;
    outwardTotalTax = outwardCGST + outwardSGST;

    // Calculate net tax payable
    const netCGST = Math.max(0, outwardCGST - itcCGST);
    const netSGST = Math.max(0, outwardSGST - itcSGST);
    const netIGST = Math.max(0, outwardIGST - itcIGST);
    const netTaxPayable = netCGST + netSGST + netIGST;

    // Build GSTR3B summary data
    const gstr3bData = {
      outward_supplies: {
        taxable_value: outwardTaxable,
        cgst_amount: outwardCGST,
        sgst_amount: outwardSGST,
        igst_amount: outwardIGST,
        total_tax: outwardTotalTax,
        total_value: outwardTotal
      },
      itc_available: {
        cgst_amount: itcCGST,
        sgst_amount: itcSGST,
        igst_amount: itcIGST,
        total_itc: itcTotal,
        total_purchases: totalPurchases
      },
      net_tax_payable: {
        cgst_amount: netCGST,
        sgst_amount: netSGST,
        igst_amount: netIGST,
        total_tax: netTaxPayable
      },
      summary: {
        month,
        year,
        start_date: startDateStr,
        end_date: endDateStr,
        period_label: `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
      }
    };

    return NextResponse.json({ 
      data: gstr3bData,
      meta: {
        month,
        year,
        start_date: startDateStr,
        end_date: endDateStr
      }
    });
  } catch (error) {
    console.error('Error fetching GSTR3B data:', error);
    return NextResponse.json({ error: 'Failed to fetch GSTR3B data' }, { status: 500 });
  }
}
