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
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: 'From date and to date are required / से तारीख और तक तारीख आवश्यक है' },
        { status: 400 }
      );
    }

    // Fetch all ledger accounts with their groups
    const { data: ledgers } = await supabase
      .from('ledger_accounts')
      .select(`
        *,
        account_groups!inner(id, group_name, group_type)
      `)
      .eq('integrator_id', user.id);

    // Fetch all voucher entries in the date range
    const { data: voucherEntries } = await supabase
      .from('voucher_entries')
      .select(`
        *,
        vouchers!inner(voucher_date)
      `)
      .eq('integrator_id', user.id)
      .gte('vouchers.voucher_date', fromDate)
      .lte('vouchers.voucher_date', toDate);

    // Calculate totals for income and expense accounts
    const ledgerTotals = new Map();
    
    ledgers?.forEach((ledger: any) => {
      ledgerTotals.set(ledger.id, {
        account_name: ledger.account_name,
        account_code: ledger.account_code,
        group_type: ledger.account_groups.group_type,
        group_name: ledger.account_groups.group_name,
        debit_total: 0,
        credit_total: 0,
        net_amount: 0,
      });
    });

    // Add voucher entries
    voucherEntries?.forEach((entry: any) => {
      const totals = ledgerTotals.get(entry.ledger_account_id);
      if (totals) {
        if (entry.entry_type === 'Dr') {
          totals.debit_total += entry.amount;
        } else {
          totals.credit_total += entry.amount;
        }
      }
    });

    // Calculate net amount for each ledger
    ledgerTotals.forEach((totals, ledgerId) => {
      if (totals.group_type === 'income') {
        // Income: Credit is positive, Debit reduces it
        totals.net_amount = totals.credit_total - totals.debit_total;
      } else if (totals.group_type === 'expense') {
        // Expense: Debit is positive, Credit reduces it
        totals.net_amount = totals.debit_total - totals.credit_total;
      }
    });

    // Group by account type
    const income: Array<{ ledger_id: string; account_name: string; account_code: string; group_name: string; debit_total: number; credit_total: number; net_amount: number }> = [];
    const expenses: Array<{ ledger_id: string; account_name: string; account_code: string; group_name: string; debit_total: number; credit_total: number; net_amount: number }> = [];

    ledgerTotals.forEach((totals, ledgerId) => {
      const item = {
        ledger_id: ledgerId,
        account_name: totals.account_name,
        account_code: totals.account_code,
        group_name: totals.group_name,
        debit_total: totals.debit_total,
        credit_total: totals.credit_total,
        net_amount: totals.net_amount,
      };

      if (totals.group_type === 'income' && totals.net_amount !== 0) {
        income.push(item);
      } else if (totals.group_type === 'expense' && totals.net_amount !== 0) {
        expenses.push(item);
      }
    });

    const totalIncome = income.reduce((sum, item) => sum + item.net_amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.net_amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const plStatement = {
      from_date: fromDate,
      to_date: toDate,
      income: {
        items: income,
        total: totalIncome,
      },
      expenses: {
        items: expenses,
        total: totalExpenses,
      },
      net_profit: netProfit,
    };

    return NextResponse.json({
      data: plStatement,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching P&L statement:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch P&L statement / प्रॉफिट एंड लॉस स्टेटमेंट प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
