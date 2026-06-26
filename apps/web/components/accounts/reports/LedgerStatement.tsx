'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';
import { 
  Calendar, MagnifyingGlass, Spinner, Download, Printer,
  BookOpen, ArrowRight, ArrowLeft, Warning
} from '@phosphor-icons/react';

interface LedgerAccount {
  id: string;
  account_name: string;
  account_code: string;
}

interface LedgerEntry {
  id: string;
  voucher_number: string;
  voucher_date: string;
  voucher_type: string;
  narration: string;
  entry_type: 'Dr' | 'Cr';
  amount: number;
  running_balance: number;
}

export default function LedgerStatement() {
  const { language } = useLanguage();
  const supabase = createClient();
  
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [fromDate, setFromDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetchLedgerAccounts();
  }, []);

  const fetchLedgerAccounts = async () => {
    try {
      if (!supabase) return;
      
      const response = await supabase.auth.getUser();
      const user = response?.data?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('ledger_accounts')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('account_name', { ascending: true });

      if (error) throw error;
      setLedgerAccounts(data || []);
    } catch (error) {
      console.error('Error fetching ledger accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLedgerStatement = async () => {
    if (!selectedAccountId || !supabase) return;

    setIsFetching(true);
    try {
      const response = await supabase.auth.getUser();
      const user = response?.data?.user;
      if (!user) return;

      // Get opening balance
      const { data: ledgerData } = await supabase
        .from('ledger_accounts')
        .select('opening_balance, opening_balance_type')
        .eq('id', selectedAccountId)
        .single();

      let openingBal = 0;
      if (ledgerData) {
        openingBal = ledgerData.opening_balance || 0;
        const openingType = ledgerData.opening_balance_type;
        
        // Calculate balance from vouchers before from date
        const { data: previousVouchers } = await supabase
          .from('voucher_entries')
          .select('entry_type, amount')
          .eq('ledger_account_id', selectedAccountId)
          .lt('created_at', fromDate);

        let debitTotal = 0;
        let creditTotal = 0;
        
        previousVouchers?.forEach(entry => {
          if (entry.entry_type === 'Dr') {
            debitTotal += entry.amount;
          } else {
            creditTotal += entry.amount;
          }
        });

        openingBal = openingType === 'Dr' 
          ? openingBal + debitTotal - creditTotal
          : openingBal + creditTotal - debitTotal;
      }

      setOpeningBalance(openingBal);

      // Get voucher entries in date range
      const { data: entries } = await supabase
        .from('voucher_entries')
        .select('*, vouchers(voucher_number, voucher_date, voucher_type, narration)')
        .eq('ledger_account_id', selectedAccountId)
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .order('created_at', { ascending: true });

      let runningBal = openingBal;
      const statementEntries: LedgerEntry[] = (entries || []).map(entry => ({
        id: entry.id,
        voucher_number: entry.vouchers?.voucher_number || '',
        voucher_date: entry.vouchers?.voucher_date || '',
        voucher_type: entry.vouchers?.voucher_type || '',
        narration: entry.vouchers?.narration || '',
        entry_type: entry.entry_type,
        amount: entry.amount,
        running_balance: entry.entry_type === 'Dr' 
          ? (runningBal += entry.amount)
          : (runningBal -= entry.amount),
      }));

      setLedgerEntries(statementEntries);
      setClosingBalance(runningBal);
    } catch (error) {
      console.error('Error fetching ledger statement:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Voucher No', 'Type', 'Narration', 'Debit', 'Credit', 'Balance'];
    const rows = ledgerEntries.map(entry => [
      entry.voucher_date,
      entry.voucher_number,
      entry.voucher_type,
      entry.narration,
      entry.entry_type === 'Dr' ? entry.amount.toFixed(2) : '',
      entry.entry_type === 'Cr' ? entry.amount.toFixed(2) : '',
      entry.running_balance.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_statement_${fromDate}_to_${toDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isHindi = language === 'hi';

  return (
    <div className="space-y-6">
      {/* SlidersHorizontals */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111827]">{isHindi ? 'लेजर खाता' : 'Ledger Account'}</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
            >
              <option value="">{isHindi ? 'लेजर खाता चुनें' : 'Select Ledger Account'}</option>
              {ledgerAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.account_code} - {account.account_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111827]">{isHindi ? 'से' : 'From Date'}</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111827]">{isHindi ? 'तक' : 'To Date'}</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={fetchLedgerStatement}
            disabled={!selectedAccountId || isFetching}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <>
                <Spinner size={18} className="animate-spin" />
                {isHindi ? 'लोड हो रहा है...' : 'Loading...'}
              </>
            ) : (
              <>
                <MagnifyingGlass size={18} weight="bold" />
                {isHindi ? 'देखें' : 'View'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Balance Summary */}
      {selectedAccountId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowLeft size={24} className="text-[#1A5C34]" />
              <span className="text-sm font-medium text-[#6B7280]">{isHindi ? 'ओपनिंग बैलेंस' : 'Opening Balance'}</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">₹{openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowRight size={24} className="text-[#3DAE72]" />
              <span className="text-sm font-medium text-[#6B7280]">{isHindi ? 'क्लोजिंग बैलेंस' : 'Closing Balance'}</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">₹{closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      {/* Ledger Statement Table */}
      {selectedAccountId && ledgerEntries.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm">
          <div className="p-6 border-b border-[#E3EDE7] flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#111827]">{isHindi ? 'लेजर स्टेटमेंट' : 'Ledger Statement'}</h3>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E3EDE7] hover:bg-[#EDF7F1] transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                {isHindi ? 'CSV' : 'CSV'}
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E3EDE7] hover:bg-[#EDF7F1] transition-colors flex items-center gap-2"
              >
                <Printer size={18} />
                {isHindi ? 'प्रिंट' : 'Print'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-xs uppercase">{isHindi ? 'तारीख' : 'Date'}</th>
                  <th className="px-5 py-3 text-left font-semibold text-xs uppercase">{isHindi ? 'वाउचर नंबर' : 'Voucher No'}</th>
                  <th className="px-5 py-3 text-left font-semibold text-xs uppercase">{isHindi ? 'प्रकार' : 'Type'}</th>
                  <th className="px-5 py-3 text-left font-semibold text-xs uppercase">{isHindi ? 'विवरण' : 'Narration'}</th>
                  <th className="px-5 py-3 text-right font-semibold text-xs uppercase">{isHindi ? 'डेबिट' : 'Debit'}</th>
                  <th className="px-5 py-3 text-right font-semibold text-xs uppercase">{isHindi ? 'क्रेडिट' : 'Credit'}</th>
                  <th className="px-5 py-3 text-right font-semibold text-xs uppercase">{isHindi ? 'बैलेंस' : 'Balance'}</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors border-b border-[#E3EDE7]`}
                  >
                    <td className="px-5 py-3 text-[#6B7280]">{entry.voucher_date}</td>
                    <td className="px-5 py-3 text-[#111827] font-mono text-xs">{entry.voucher_number}</td>
                    <td className="px-5 py-3 text-[#111827] capitalize">{entry.voucher_type}</td>
                    <td className="px-5 py-3 text-[#111827]">{entry.narration}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums">
                      {entry.entry_type === 'Dr' ? `₹${entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums">
                      {entry.entry_type === 'Cr' ? `₹${entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums font-medium">
                      ₹{entry.running_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedAccountId && ledgerEntries.length === 0 && !isFetching && (
        <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-12 text-center">
          <BookOpen size={48} className="text-[#6B7280] mx-auto mb-4" />
          <p className="text-[#6B7280] text-sm">{isHindi ? 'इस अवधि में कोई लेनदेन नहीं मिला' : 'No transactions found in this period'}</p>
        </div>
      )}
    </div>
  );
}
