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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Query vouchers and their entries for the specified date
    const { data: vouchers, error } = await supabase
      .from('vouchers')
      .select(`
        id,
        voucher_number,
        voucher_date,
        voucher_type,
        narration,
        total_amount,
        created_at,
        voucher_entries (
          id,
          ledger_account_id,
          entry_type,
          amount,
          ledger_accounts (
            account_name,
            account_code
          )
        )
      `)
      .eq('integrator_id', user.id)
      .eq('voucher_date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Transform data to daybook format with running balance
    let runningBalance = 0;
    const daybookData = (vouchers || []).map((voucher: any) => {
      const entries = voucher.voucher_entries || [];
      const debitTotal = entries
        .filter((e: any) => e.entry_type === 'Dr')
        .reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
      const creditTotal = entries
        .filter((e: any) => e.entry_type === 'Cr')
        .reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
      
      // Calculate net effect on running balance
      // For daybook: Debit increases balance, Credit decreases balance
      const netEffect = debitTotal - creditTotal;
      runningBalance += netEffect;

      return {
        voucher_number: voucher.voucher_number,
        voucher_type: voucher.voucher_type,
        narration: voucher.narration || '',
        debit: debitTotal,
        credit: creditTotal,
        running_balance: runningBalance,
        created_at: voucher.created_at
      };
    });

    return NextResponse.json({ data: daybookData });
  } catch (error) {
    console.error('Error fetching daybook:', error);
    return NextResponse.json({ error: 'Failed to fetch daybook data' }, { status: 500 });
  }
}
