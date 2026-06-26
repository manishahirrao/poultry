'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';
import { 
  Calendar, MagnifyingGlass, Spinner, Download, Printer,
  ChartBar, TrendUp, TrendDown, Warning
} from '@phosphor-icons/react';

interface BalanceSheetItem {
  account_name: string;
  account_code: string;
  amount: number;
}

interface BalanceSheetData {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equity: BalanceSheetItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export default function BalanceSheet() {
  const { language } = useLanguage();
  const supabase = createClient();
  
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchBalanceSheet = async () => {
    setIsFetching(true);
    try {
      if (!supabase) return;
      
      const response = await supabase.auth.getUser();
      const user = response?.data?.user;
      if (!user) return;

      // Get all ledger accounts with their balances
      const { data: accounts } = await supabase
        .from('ledger_accounts')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true);

      const assets: BalanceSheetItem[] = [];
      const liabilities: BalanceSheetItem[] = [];
      const equity: BalanceSheetItem[] = [];

      for (const account of accounts || []) {
        // Calculate balance for each account
        const { data: entries } = await supabase
          .from('voucher_entries')
          .select('entry_type, amount')
          .eq('ledger_account_id', account.id)
          .lte('created_at', asOfDate);

        let debitTotal = 0;
        let creditTotal = 0;
        
        entries?.forEach(entry => {
          if (entry.entry_type === 'Dr') {
            debitTotal += entry.amount;
          } else {
            creditTotal += entry.amount;
          }
        });

        const openingBalance = account.opening_balance || 0;
        const openingType = account.opening_balance_type;
        
        const balance = openingType === 'Dr' 
          ? openingBalance + debitTotal - creditTotal
          : openingBalance + creditTotal - debitTotal;

        if (balance !== 0) {
          const item: BalanceSheetItem = {
            account_name: account.account_name,
            account_code: account.account_code,
            amount: Math.abs(balance),
          };

          // Categorize based on account group (simplified)
          if (account.account_name.toLowerCase().includes('cash') || 
              account.account_name.toLowerCase().includes('bank') ||
              account.account_name.toLowerCase().includes('asset')) {
            assets.push(item);
          } else if (account.account_name.toLowerCase().includes('capital') ||
                     account.account_name.toLowerCase().includes('equity') ||
                     account.account_name.toLowerCase().includes('profit')) {
            equity.push(item);
          } else {
            liabilities.push(item);
          }
        }
      }

      const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
      const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
      const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);

      setBalanceSheetData({
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
      });
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!balanceSheetData) return;

    const headers = ['Type', 'Account Code', 'Account Name', 'Amount'];
    const rows = [
      ...balanceSheetData.assets.map(item => ['Asset', item.account_code, item.account_name, item.amount.toFixed(2)]),
      ...balanceSheetData.liabilities.map(item => ['Liability', item.account_code, item.account_name, item.amount.toFixed(2)]),
      ...balanceSheetData.equity.map(item => ['Equity', item.account_code, item.account_name, item.amount.toFixed(2)]),
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance_sheet_${asOfDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isHindi = language === 'hi';

  return (
    <div className="space-y-6">
      {/* SlidersHorizontals */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111827]">{isHindi ? 'तारीख तक' : 'As of Date'}</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchBalanceSheet}
              disabled={isFetching}
              className="w-full px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {/* Balance Sheet */}
      {balanceSheetData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendUp size={24} className="text-[#1A5C34]" />
                <span className="text-sm font-medium text-[#6B7280]">{isHindi ? 'कुल संपत्तियां' : 'Total Assets'}</span>
              </div>
              <p className="text-2xl font-bold text-[#111827]">₹{balanceSheetData.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendDown size={24} className="text-red-600" />
                <span className="text-sm font-medium text-[#6B7280]">{isHindi ? 'कुल दायित्व' : 'Total Liabilities'}</span>
              </div>
              <p className="text-2xl font-bold text-[#111827]">₹{balanceSheetData.totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <ChartBar size={24} className="text-[#3DAE72]" />
                <span className="text-sm font-medium text-[#6B7280]">{isHindi ? 'कुल इक्विटी' : 'Total Equity'}</span>
              </div>
              <p className="text-2xl font-bold text-[#111827]">₹{balanceSheetData.totalEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Balance Sheet Table */}
          <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm">
            <div className="p-6 border-b border-[#E3EDE7] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#111827]">{isHindi ? 'बैलेंस शीट' : 'Balance Sheet'}</h3>
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
            <div className="p-6 space-y-6">
              {/* Assets */}
              <div>
                <h4 className="text-base font-semibold text-[#1A5C34] mb-3">{isHindi ? 'संपत्तियां' : 'Assets'}</h4>
                <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-xs uppercase">{isHindi ? 'कोड' : 'Code'}</th>
                        <th className="px-4 py-2 text-left font-semibold text-xs uppercase">{isHindi ? 'खाता' : 'Account'}</th>
                        <th className="px-4 py-2 text-right font-semibold text-xs uppercase">{isHindi ? 'राशि' : 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetData.assets.map((item, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} border-b border-[#E3EDE7]`}>
                          <td className="px-4 py-2 text-[#6B7280] font-mono text-xs">{item.account_code}</td>
                          <td className="px-4 py-2 text-[#111827]">{item.account_name}</td>
                          <td className="px-4 py-2 text-right font-mono text-xs tabular-nums">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#EDF7F1] font-semibold">
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-[#1A5C34]">{isHindi ? 'कुल' : 'Total'}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-[#1A5C34]">₹{balanceSheetData.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Liabilities */}
              <div>
                <h4 className="text-base font-semibold text-red-600 mb-3">{isHindi ? 'दायित्व' : 'Liabilities'}</h4>
                <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-xs uppercase">{isHindi ? 'कोड' : 'Code'}</th>
                        <th className="px-4 py-2 text-left font-semibold text-xs uppercase">{isHindi ? 'खाता' : 'Account'}</th>
                        <th className="px-4 py-2 text-right font-semibold text-xs uppercase">{isHindi ? 'राशि' : 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetData.liabilities.map((item, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} border-b border-[#E3EDE7]`}>
                          <td className="px-4 py-2 text-[#6B7280] font-mono text-xs">{item.account_code}</td>
                          <td className="px-4 py-2 text-[#111827]">{item.account_name}</td>
                          <td className="px-4 py-2 text-right font-mono text-xs tabular-nums">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#EDF7F1] font-semibold">
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-red-600">{isHindi ? 'कुल' : 'Total'}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-red-600">₹{balanceSheetData.totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Equity */}
              <div>
                <h4 className="text-base font-semibold text-[#3DAE72] mb-3">{isHindi ? 'इक्विटी' : 'Equity'}</h4>
                <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-xs uppercase">{isHindi ? 'कोड' : 'Code'}</th>
                        <th className="px-4 py-2 text-left font-semibold text-xs uppercase">{isHindi ? 'खाता' : 'Account'}</th>
                        <th className="px-4 py-2 text-right font-semibold text-xs uppercase">{isHindi ? 'राशि' : 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetData.equity.map((item, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} border-b border-[#E3EDE7]`}>
                          <td className="px-4 py-2 text-[#6B7280] font-mono text-xs">{item.account_code}</td>
                          <td className="px-4 py-2 text-[#111827]">{item.account_name}</td>
                          <td className="px-4 py-2 text-right font-mono text-xs tabular-nums">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#EDF7F1] font-semibold">
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-[#3DAE72]">{isHindi ? 'कुल' : 'Total'}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-[#3DAE72]">₹{balanceSheetData.totalEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Balance Check */}
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                Math.abs(balanceSheetData.totalAssets - (balanceSheetData.totalLiabilities + balanceSheetData.totalEquity)) < 0.01
                  ? 'bg-[#1A5C34]/10 text-[#1A5C34] border border-[#1A5C34]/20'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {Math.abs(balanceSheetData.totalAssets - (balanceSheetData.totalLiabilities + balanceSheetData.totalEquity)) < 0.01 ? (
                  <ChartBar size={20} weight="fill" />
                ) : (
                  <Warning size={20} weight="fill" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(balanceSheetData.totalAssets - (balanceSheetData.totalLiabilities + balanceSheetData.totalEquity)) < 0.01
                    ? isHindi ? 'बैलेंस सत्यापित: संपत्तियां = दायित्व + इक्विटी' : 'Balance Verified: Assets = Liabilities + Equity'
                    : isHindi ? 'बैलेंस मेल नहीं खाता' : 'Balance Does Not Match'
                  }
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
