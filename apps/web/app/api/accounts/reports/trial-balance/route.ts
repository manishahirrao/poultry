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
    const asOnDate = searchParams.get('asOnDate') || new Date().toISOString().split('T')[0];

    // Fetch account groups with hierarchy
    const { data: accountGroups, error: groupsError } = await supabase
      .from('account_groups')
      .select(`
        id,
        group_code,
        group_name,
        parent_group_id,
        group_type,
        affects_gross_profit
      `)
      .eq('integrator_id', user.id)
      .order('group_code', { ascending: true });

    if (groupsError) throw groupsError;

    // Fetch ledger accounts with opening balances
    const { data: ledgerAccounts, error: accountsError } = await supabase
      .from('ledger_accounts')
      .select(`
        id,
        account_code,
        account_name,
        account_group_id,
        opening_balance,
        opening_balance_type,
        is_active
      `)
      .eq('integrator_id', user.id)
      .eq('is_active', true)
      .order('account_code', { ascending: true });

    if (accountsError) throw accountsError;

    // Fetch all voucher entries up to the as-on date
    const { data: voucherEntries, error: entriesError } = await supabase
      .from('voucher_entries')
      .select(`
        ledger_account_id,
        entry_type,
        amount,
        vouchers (
          voucher_date
        )
      `)
      .eq('integrator_id', user.id)
      .lte('vouchers.voucher_date', asOnDate);

    if (entriesError) throw entriesError;

    // Calculate transaction totals per account
    const accountTransactionMap = new Map<string, { debit: number; credit: number }>();

    (voucherEntries || []).forEach((entry: any) => {
      const accountId = entry.ledger_account_id;
      const amount = parseFloat(entry.amount || 0);
      const entryType = entry.entry_type;

      if (!accountTransactionMap.has(accountId)) {
        accountTransactionMap.set(accountId, { debit: 0, credit: 0 });
      }

      const totals = accountTransactionMap.get(accountId)!;
      if (entryType === 'Dr') {
        totals.debit += amount;
      } else {
        totals.credit += amount;
      }
    });

    // Build hierarchical trial balance structure
    const groupMap = new Map<string, any>();
    (accountGroups || []).forEach((group: any) => {
      groupMap.set(group.id, {
        ...group,
        accounts: [],
        openingDr: 0,
        openingCr: 0,
        transactionsDr: 0,
        transactionsCr: 0,
        closingDr: 0,
        closingCr: 0
      });
    });

    // Process ledger accounts and assign to groups
    (ledgerAccounts || []).forEach((account: any) => {
      const groupId = account.account_group_id;
      const group = groupMap.get(groupId);

      if (group) {
        const openingBalance = parseFloat(account.opening_balance || 0);
        const openingType = account.opening_balance_type || 'Dr';
        const transactions = accountTransactionMap.get(account.id) || { debit: 0, credit: 0 };

        const openingDr = openingType === 'Dr' ? openingBalance : 0;
        const openingCr = openingType === 'Cr' ? openingBalance : 0;

        // Calculate closing balance
        const totalDr = openingDr + transactions.debit;
        const totalCr = openingCr + transactions.credit;
        const closingDr = totalDr >= totalCr ? totalDr - totalCr : 0;
        const closingCr = totalCr > totalDr ? totalCr - totalDr : 0;

        group.accounts.push({
          ...account,
          openingDr,
          openingCr,
          transactionsDr: transactions.debit,
          transactionsCr: transactions.credit,
          closingDr,
          closingCr
        });

        // Update group totals
        group.openingDr += openingDr;
        group.openingCr += openingCr;
        group.transactionsDr += transactions.debit;
        group.transactionsCr += transactions.credit;
        group.closingDr += closingDr;
        group.closingCr += closingCr;
      }
    });

    // Build hierarchy tree
    const buildHierarchy = (groupId: string | null, level: number): any[] => {
      const result: any[] = [];

      groupMap.forEach((group) => {
        if (group.parent_group_id === groupId) {
          const children = buildHierarchy(group.id, level + 1);
          const node = {
            ...group,
            level,
            children,
            hasAccounts: group.accounts.length > 0
          };
          result.push(node);
        }
      });

      return result;
    };

    const hierarchy = buildHierarchy(null, 0);

    return NextResponse.json({ 
      data: hierarchy,
      asOnDate,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trial balance:', error);
    return NextResponse.json({ error: 'Failed to fetch trial balance data' }, { status: 500 });
  }
}
