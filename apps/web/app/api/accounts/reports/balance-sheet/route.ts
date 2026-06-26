import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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
    const asOnDate = searchParams.get('as_on_date') || new Date().toISOString().split('T')[0];

    // Fetch all ledger accounts with their groups
    const { data: ledgers } = await supabase
      .from('ledger_accounts')
      .select(`
        *,
        account_groups!inner(id, group_name, group_type)
      `)
      .eq('integrator_id', user.id);

    // Fetch all voucher entries up to the as-on date
    const { data: voucherEntries } = await supabase
      .from('voucher_entries')
      .select(`
        *,
        vouchers!inner(voucher_date)
      `)
      .eq('integrator_id', user.id)
      .lte('vouchers.voucher_date', asOnDate);

    // Calculate balances for each ledger
    const ledgerBalances = new Map();
    
    // Initialize with opening balances
    ledgers?.forEach((ledger: any) => {
      const openingBalance = ledger.opening_balance || 0;
      const openingType = ledger.opening_balance_type || 'Dr';
      ledgerBalances.set(ledger.id, {
        account_name: ledger.account_name,
        account_code: ledger.account_code,
        group_type: ledger.account_groups.group_type,
        group_name: ledger.account_groups.group_name,
        opening_balance: openingBalance,
        opening_type: openingType,
        debit_total: 0,
        credit_total: 0,
        closing_balance: openingType === 'Dr' ? openingBalance : -openingBalance,
      });
    });

    // Add voucher entries
    voucherEntries?.forEach((entry: any) => {
      const balance = ledgerBalances.get(entry.ledger_account_id);
      if (balance) {
        if (entry.entry_type === 'Dr') {
          balance.debit_total += entry.amount;
          balance.closing_balance += entry.amount;
        } else {
          balance.credit_total += entry.amount;
          balance.closing_balance -= entry.amount;
        }
      }
    });

    // Group by account type
    const assets: Array<{ ledger_id: string; account_name: string; account_code: string; group_name: string; amount: number }> = [];
    const liabilities: Array<{ ledger_id: string; account_name: string; account_code: string; group_name: string; amount: number }> = [];
    const equity: Array<{ ledger_id: string; account_name: string; account_code: string; group_name: string; amount: number }> = [];

    ledgerBalances.forEach((balance, ledgerId) => {
      const item = {
        ledger_id: ledgerId,
        account_name: balance.account_name,
        account_code: balance.account_code,
        group_name: balance.group_name,
        amount: Math.abs(balance.closing_balance),
      };

      if (balance.group_type === 'asset') {
        assets.push(item);
      } else if (balance.group_type === 'liability') {
        liabilities.push(item);
      } else if (balance.group_type === 'equity') {
        equity.push(item);
      }
    });

    const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);

    const balanceSheet = {
      as_on_date: asOnDate,
      assets: {
        items: assets,
        total: totalAssets,
      },
      liabilities: {
        items: liabilities,
        total: totalLiabilities,
      },
      equity: {
        items: equity,
        total: totalEquity,
      },
      total_liabilities_equity: totalLiabilities + totalEquity,
    };

    return NextResponse.json({
      data: balanceSheet,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching balance sheet:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch balance sheet / बैलेंस शीट प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
