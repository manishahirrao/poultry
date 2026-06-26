'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/providers/LanguageProvider';
import { 
  Calendar, CheckCircle, X, MagnifyingGlass, Spinner,
  Bank, ArrowsLeftRight, Warning, FloppyDisk, Plus
} from '@phosphor-icons/react';

interface BankAccount {
  id: string;
  account_name: string;
  account_code: string;
  opening_balance: number;
  opening_balance_type: string;
}

interface ReconciliationItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'unreconciled' | 'reconciled';
  reference?: string;
}

export default function BankReconciliation() {
  const { language } = useLanguage();
  const supabase = createClient();
  
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [statementBalance, setStatementBalance] = useState(0);
  const [bookBalance, setBookBalance] = useState(0);
  const [reconciliationItems, setReconciliationItems] = useState<ReconciliationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      fetchReconciliationData();
    }
  }, [selectedAccountId, asOfDate]);

  const fetchBankAccounts = async () => {
    try {
      const response = await supabase?.auth.getUser();
      const user = response?.data?.user;
      if (!user) return;

      const { data, error } = await supabase!
        .from('ledger_accounts')
        .select('*')
        .eq('integrator_id', user.id)
        .ilike('account_name', '%bank%')
        .eq('is_active', true);

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReconciliationData = async () => {
    try {
      const response = await supabase?.auth.getUser();
      const user = response?.data?.user;
      if (!user) return;

      // Get book balance from ledger
      const { data: ledgerData } = await supabase!
        .from('ledger_accounts')
        .select('opening_balance, opening_balance_type')
        .eq('id', selectedAccountId)
        .single();

      if (ledgerData) {
        const openingBalance = ledgerData.opening_balance || 0;
        const openingType = ledgerData.opening_balance_type;
        
        // Calculate book balance from vouchers
        const { data: vouchers } = await supabase!
          .from('voucher_entries')
          .select('entry_type, amount')
          .eq('ledger_account_id', selectedAccountId)
          .lte('created_at', asOfDate);

        let debitTotal = 0;
        let creditTotal = 0;
        
        vouchers?.forEach(entry => {
          if (entry.entry_type === 'Dr') {
            debitTotal += entry.amount;
          } else {
            creditTotal += entry.amount;
          }
        });

        const bookBal = openingType === 'Dr' 
          ? openingBalance + debitTotal - creditTotal
          : openingBalance + creditTotal - debitTotal;

        setBookBalance(bookBal);
      }

      // Get unreconciled items
      const { data: items } = await supabase!
        .from('voucher_entries')
        .select('*, vouchers(voucher_number, voucher_date, narration)')
        .eq('ledger_account_id', selectedAccountId)
        .lte('created_at', asOfDate)
        .order('created_at', { ascending: false });

      const reconciledItems: ReconciliationItem[] = (items || []).map(item => ({
        id: item.id,
        date: item.vouchers?.voucher_date || '',
        description: item.vouchers?.narration || '',
        amount: item.amount,
        type: item.entry_type === 'Dr' ? 'debit' : 'credit',
        status: 'unreconciled',
        reference: item.vouchers?.voucher_number,
      }));

      setReconciliationItems(reconciledItems);
    } catch (error) {
      console.error('Error fetching reconciliation data:', error);
    }
  };

  const handleToggleReconcile = (id: string) => {
    setReconciliationItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'unreconciled' ? 'reconciled' : 'unreconciled' }
          : item
      )
    );
  };

  const calculateDifference = () => {
    const unreconciledDebits = reconciliationItems
      .filter(item => item.status === 'unreconciled' && item.type === 'debit')
      .reduce((sum, item) => sum + item.amount, 0);
    const unreconciledCredits = reconciliationItems
      .filter(item => item.status === 'unreconciled' && item.type === 'credit')
      .reduce((sum, item) => sum + item.amount, 0);

    return statementBalance - (bookBalance + unreconciledDebits - unreconciledCredits);
  };

  const handleSaveReconciliation = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await supabase?.auth.getUser();
      const user = response?.data?.user;
      if (!user) throw new Error('User not authenticated');

      // Save reconciliation record
      const { error } = await supabase!
        .from('bank_reconciliations')
        .insert({
          integrator_id: user.id,
          bank_account_id: selectedAccountId,
          as_of_date: asOfDate,
          statement_balance: statementBalance,
          book_balance: bookBalance,
          difference: calculateDifference(),
          created_by: user.id,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi' 
          ? 'बैंक समाधान सफलतापूर्वक सहेजा गया' 
          : 'Bank reconciliation saved successfully'
      });
    } catch (error) {
      console.error('Error saving reconciliation:', error);
      setMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'बैंक समाधान सहेजने में विफल' 
          : 'Failed to save bank reconciliation'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isHindi = language === 'hi';
  const difference = calculateDifference();
  const isBalanced = Math.abs(difference) < 0.01;

  return (
    <div className="space-y-6">
      {/* SlidersHorizontals */}
      <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111827]">{isHindi ? 'बैंक खाता' : 'Bank Account'}</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent bg-white"
            >
              <option value="">{isHindi ? 'बैंक खाता चुनें' : 'Select Bank Account'}</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.account_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111827]">{isHindi ? 'तारीख तक' : 'As of Date'}</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111827]">{isHindi ? 'स्टेटमेंट बैलेंस' : 'Statement Balance'}</label>
            <input
              type="number"
              value={statementBalance}
              onChange={(e) => setStatementBalance(parseFloat(e.target.value) || 0)}
              step="0.01"
              className="w-full px-3.5 py-2.5 border border-[#E3EDE7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      {selectedAccountId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Bank size={24} className="text-[#1A5C34]" />
              <span className="text-sm font-medium text-[#6B7280]">{isHindi ? 'स्टेटमेंट बैलेंस' : 'Statement Balance'}</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">₹{statementBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowsLeftRight size={24} className="text-[#3DAE72]" />
              <span className="text-sm font-medium text-[#6B7280]">{isHindi ? 'बुक बैलेंस' : 'Book Balance'}</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">₹{bookBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`bg-white rounded-xl border shadow-sm p-6 ${isBalanced ? 'border-[#3DAE72]' : 'border-red-300'}`}>
            <div className="flex items-center gap-3 mb-2">
              {isBalanced ? (
                <CheckCircle size={24} className="text-[#3DAE72]" />
              ) : (
                <Warning size={24} className="text-red-600" />
              )}
              <span className="text-sm font-medium text-[#6B7280]">{isHindi ? 'अंतर' : 'Difference'}</span>
            </div>
            <p className={`text-2xl font-bold ${isBalanced ? 'text-[#3DAE72]' : 'text-red-600'}`}>
              ₹{Math.abs(difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-[#1A5C34]/10 text-[#1A5C34] border border-[#1A5C34]/20' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} weight="fill" />
          ) : (
            <X size={20} weight="fill" />
          )}
          <span className="text-sm font-medium flex-1">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="p-1.5 hover:bg-black/5 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Reconciliation Items */}
      {selectedAccountId && (
        <div className="bg-white rounded-xl border border-[#E3EDE7] shadow-sm">
          <div className="p-6 border-b border-[#E3EDE7]">
            <h3 className="text-lg font-semibold text-[#111827]">{isHindi ? 'समाधान आइटम्स' : 'Reconciliation Items'}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EDF7F1] text-[#1A5C34]">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-xs uppercase">{isHindi ? 'तारीख' : 'Date'}</th>
                  <th className="px-5 py-3 text-left font-semibold text-xs uppercase">{isHindi ? 'विवरण' : 'Description'}</th>
                  <th className="px-5 py-3 text-right font-semibold text-xs uppercase">{isHindi ? 'राशि' : 'Amount'}</th>
                  <th className="px-5 py-3 text-center font-semibold text-xs uppercase">{isHindi ? 'स्थिति' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {reconciliationItems.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F4F7F5]'} hover:bg-[#EDF7F1] transition-colors border-b border-[#E3EDE7]`}
                  >
                    <td className="px-5 py-3 text-[#6B7280]">{item.date}</td>
                    <td className="px-5 py-3 text-[#111827]">{item.description}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleToggleReconcile(item.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'reconciled'
                            ? 'bg-[#3DAE72] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {item.status === 'reconciled' ? (isHindi ? 'समाधानित' : 'Reconciled') : (isHindi ? 'असमाधानित' : 'Unreconciled')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      {selectedAccountId && (
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSaveReconciliation}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#1A5C34] text-white hover:bg-[#3DAE72] transition-all duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Spinner size={18} className="animate-spin" />
                {isHindi ? 'सहेज रहा है...' : 'Saving...'}
              </>
            ) : (
              <>
                <FloppyDisk size={18} weight="bold" />
                {isHindi ? 'सहेजें' : 'Save'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
