import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    // Verify ledger ownership
    const { data: ledger } = await supabase
      .from('ledger_accounts')
      .select('id, account_name, opening_balance, opening_balance_type')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!ledger) {
      return NextResponse.json(
        { error: 'Ledger not found / लेजर नहीं मिला' },
        { status: 404 }
      );
    }

    // Fetch voucher entries for this ledger
    let query = supabase
      .from('voucher_entries')
      .select(`
        *,
        vouchers!inner(id, voucher_number, voucher_date, voucher_type, narration)
      `)
      .eq('ledger_account_id', params.id);

    if (fromDate) {
      query = query.gte('vouchers.voucher_date', fromDate);
    }
    if (toDate) {
      query = query.lte('vouchers.voucher_date', toDate);
    }

    const { data: entries, error: entriesError } = await query;

    if (entriesError) throw entriesError;

    // Calculate opening balance
    let openingBalance = ledger.opening_balance || 0;
    let openingBalanceType = ledger.opening_balance_type || 'Dr';

    // Calculate running balance
    let runningBalance = openingBalance;
    const entriesWithBalance = entries?.map((entry: any) => {
      if (entry.entry_type === 'Dr') {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.amount;
      }
      return {
        ...entry,
        running_balance: runningBalance,
      };
    }) || [];

    const closingBalance = runningBalance;

    return NextResponse.json({
      data: {
        ledger,
        opening_balance: openingBalance,
        opening_balance_type: openingBalanceType,
        entries: entriesWithBalance,
        closing_balance: closingBalance,
      },
      error: null,
      meta: { total: entriesWithBalance.length }
    });
  } catch (error) {
    console.error('Error fetching ledger statement:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch ledger statement / लेजर स्टेटमेंट प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
