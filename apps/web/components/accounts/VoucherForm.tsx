'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, X, AlertCircle } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface LedgerAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_name_hi?: string;
  account_group_id: string;
  is_active: boolean;
}

interface VoucherEntry {
  ledger_account_id: string;
  entry_type: 'Dr' | 'Cr';
  amount: number;
  narration?: string;
}

interface VoucherFormProps {
  voucherType: 'payment' | 'receipt' | 'contra' | 'journal' | 'employee';
  onSuccess?: () => void;
  onCancel?: () => void;
  editMode?: boolean;
  existingVoucher?: any;
}

const VOUCHER_TYPE_LABELS: Record<string, string> = {
  payment: 'Payment Voucher',
  receipt: 'Receipt Voucher',
  contra: 'Contra Voucher',
  journal: 'Journal Voucher',
  employee: 'Employee Payment Voucher'
};

const VOUCHER_PREFIXES: Record<string, string> = {
  payment: 'PV',
  receipt: 'RV',
  contra: 'CV',
  journal: 'JV',
  employee: 'EPV'
};

export default function VoucherForm({ 
  voucherType, 
  onSuccess, 
  onCancel, 
  editMode = false, 
  existingVoucher 
}: VoucherFormProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([]);
  const [entries, setEntries] = useState<VoucherEntry[]>([]);
  const [voucherNumber, setVoucherNumber] = useState('');
  
  const [formData, setFormData] = useState({
    voucher_date: format(new Date(), 'yyyy-MM-dd'),
    narration: '',
    cheque_number: '',
    cheque_date: '',
    bank_account_id: ''
  });

  const [balanceStatus, setBalanceStatus] = useState<'balanced' | 'unbalanced' | 'empty'>('empty');

  useEffect(() => {
    fetchLedgerAccounts();
    generateVoucherNumber();
    if (editMode && existingVoucher) {
      loadExistingVoucher();
    } else {
      // Add default line items based on voucher type
      addDefaultLineItems();
    }
  }, [voucherType, editMode, existingVoucher]);

  useEffect(() => {
    checkBalance();
  }, [entries]);

  const fetchLedgerAccounts = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ledger_accounts')
        .select('*')
        .eq('integrator_id', user.id)
        .eq('is_active', true)
        .order('account_code');

      if (error) throw error;
      setLedgerAccounts(data || []);
    } catch (error) {
      console.error('Error fetching ledger accounts:', error);
    }
  };

  const generateVoucherNumber = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentYear = new Date().getFullYear().toString().slice(-2);
      const nextYear = (new Date().getFullYear() + 1).toString().slice(-2);
      const yearSuffix = `${currentYear}${nextYear}`;
      const prefix = VOUCHER_PREFIXES[voucherType];

      // Get the last voucher number for this type
      const { data: lastVoucher } = await supabase
        .from('vouchers')
        .select('voucher_number')
        .eq('integrator_id', user.id)
        .eq('voucher_type', voucherType)
        .ilike('voucher_number', `${prefix}/${yearSuffix}%`)
        .order('voucher_number', { ascending: false })
        .limit(1)
        .single();

      let newNumber = '001';
      if (lastVoucher) {
        const parts = lastVoucher.voucher_number.split('/');
        const lastNum = parseInt(parts[parts.length - 1]);
        newNumber = String(lastNum + 1).padStart(3, '0');
      }

      setVoucherNumber(`${prefix}/${yearSuffix}/${newNumber}`);
    } catch (error) {
      console.error('Error generating voucher number:', error);
      setVoucherNumber(`${VOUCHER_PREFIXES[voucherType]}/000001`);
    }
  };

  const addDefaultLineItems = () => {
    const defaultEntries: VoucherEntry[] = [];
    
    switch (voucherType) {
      case 'payment':
        // Payment: Cr = bank/cash, Dr = expense/party
        defaultEntries.push({ ledger_account_id: '', entry_type: 'Dr', amount: 0 });
        defaultEntries.push({ ledger_account_id: '', entry_type: 'Cr', amount: 0 });
        break;
      case 'receipt':
        // Receipt: Dr = bank/cash, Cr = income/party
        defaultEntries.push({ ledger_account_id: '', entry_type: 'Dr', amount: 0 });
        defaultEntries.push({ ledger_account_id: '', entry_type: 'Cr', amount: 0 });
        break;
      case 'contra':
        // Contra: Cash ↔ Bank transfers
        defaultEntries.push({ ledger_account_id: '', entry_type: 'Dr', amount: 0 });
        defaultEntries.push({ ledger_account_id: '', entry_type: 'Cr', amount: 0 });
        break;
      case 'journal':
        // Journal: Free-form Dr/Cr lines
        defaultEntries.push({ ledger_account_id: '', entry_type: 'Dr', amount: 0 });
        defaultEntries.push({ ledger_account_id: '', entry_type: 'Cr', amount: 0 });
        break;
      case 'employee':
        // Employee: Dr = salary expense, Cr = bank/cash
        defaultEntries.push({ ledger_account_id: '', entry_type: 'Dr', amount: 0 });
        defaultEntries.push({ ledger_account_id: '', entry_type: 'Cr', amount: 0 });
        break;
    }
    
    setEntries(defaultEntries);
  };

  const loadExistingVoucher = () => {
    if (!existingVoucher) return;
    
    setVoucherNumber(existingVoucher.voucher_number);
    setFormData({
      voucher_date: existingVoucher.voucher_date || format(new Date(), 'yyyy-MM-dd'),
      narration: existingVoucher.narration || '',
      cheque_number: existingVoucher.cheque_number || '',
      cheque_date: existingVoucher.cheque_date || '',
      bank_account_id: existingVoucher.bank_account_id || ''
    });
    
    if (existingVoucher.entries) {
      setEntries(existingVoucher.entries);
    }
  };

  const addLineItem = () => {
    setEntries([
      ...entries,
      { ledger_account_id: '', entry_type: 'Dr', amount: 0 }
    ]);
  };

  const updateEntry = (index: number, field: keyof VoucherEntry, value: string | number) => {
    const updated = [...entries];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setEntries(updated);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const checkBalance = () => {
    if (entries.length === 0) {
      setBalanceStatus('empty');
      return;
    }

    const totalDr = entries
      .filter(e => e.entry_type === 'Dr')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const totalCr = entries
      .filter(e => e.entry_type === 'Cr')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const diff = Math.abs(totalDr - totalCr);
    setBalanceStatus(diff < 0.01 ? 'balanced' : 'unbalanced');
  };

  const getTotalDr = () => {
    return entries
      .filter(e => e.entry_type === 'Dr')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  const getTotalCr = () => {
    return entries
      .filter(e => e.entry_type === 'Cr')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate balance
      if (balanceStatus !== 'balanced') {
        throw new Error('Voucher is not balanced. Debit total must equal Credit total.');
      }

      // Validate entries
      const validEntries = entries.filter(e => e.ledger_account_id && e.amount > 0);
      if (validEntries.length < 2) {
        throw new Error('At least 2 valid line items are required.');
      }

      const totalAmount = getTotalDr();

      // Get current financial year
      const { data: fy } = await supabase
        .from('financial_years')
        .select('id')
        .eq('integrator_id', user.id)
        .eq('is_current', true)
        .single();

      // Create voucher
      const voucherData = {
        integrator_id: user.id,
        voucher_number: voucherNumber,
        voucher_date: formData.voucher_date,
        voucher_type: voucherType,
        narration: formData.narration,
        total_amount: totalAmount,
        cheque_number: formData.cheque_number || null,
        cheque_date: formData.cheque_date || null,
        bank_account_id: formData.bank_account_id || null,
        financial_year_id: fy?.id || null,
        is_posted: true,
        created_by: user.id
      };

      let voucherId;
      if (editMode && existingVoucher) {
        const { data: updated, error: updateError } = await supabase
          .from('vouchers')
          .update(voucherData)
          .eq('id', existingVoucher.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        voucherId = updated.id;

        // Delete existing entries
        await supabase
          .from('voucher_entries')
          .delete()
          .eq('voucher_id', voucherId);
      } else {
        const { data: voucher, error: voucherError } = await supabase
          .from('vouchers')
          .insert(voucherData)
          .select()
          .single();

        if (voucherError) throw voucherError;
        voucherId = voucher.id;
      }

      // Create voucher entries
      const entriesToInsert = validEntries.map((entry, index) => ({
        voucher_id: voucherId,
        ledger_account_id: entry.ledger_account_id,
        entry_type: entry.entry_type,
        amount: entry.amount,
        narration: entry.narration || null,
        sort_order: index
      }));

      const { error: entriesError } = await supabase
        .from('voucher_entries')
        .insert(entriesToInsert);

      if (entriesError) throw entriesError;

      onSuccess?.();
    } catch (error) {
      console.error('Error saving voucher:', error);
      alert(error instanceof Error ? error.message : 'Failed to save voucher');
    } finally {
      setLoading(false);
    }
  };

  const getLedgerAccountName = (accountId: string) => {
    const account = ledgerAccounts.find(a => a.id === accountId);
    if (!account) return '';
    return account.account_code ? `${account.account_code} - ${account.account_name}` : account.account_name;
  };

  const getBankAccounts = () => {
    return ledgerAccounts.filter(a => 
      a.account_name.toLowerCase().includes('bank') || 
      a.account_name.toLowerCase().includes('cash')
    );
  };

  const isBankTransaction = ['payment', 'receipt', 'contra'].includes(voucherType);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-5">
        <CardTitle className="text-white text-xl font-semibold tracking-tight">
          {editMode ? 'Edit' : 'Create'} {VOUCHER_TYPE_LABELS[voucherType]}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Voucher Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="voucherNumber" className="text-sm font-semibold text-neutral-700">Voucher No</Label>
              <Input
                id="voucherNumber"
                value={voucherNumber}
                readOnly
                className="bg-neutral-50 border-neutral-200 text-neutral-900 font-mono text-sm"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="voucherDate" className="text-sm font-semibold text-neutral-700">Voucher Date</Label>
              <Input
                id="voucherDate"
                type="date"
                value={formData.voucher_date}
                onChange={(e) => setFormData({ ...formData, voucher_date: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            {isBankTransaction && (
              <div className="space-y-3">
                <Label htmlFor="bankAccount" className="text-sm font-semibold text-neutral-700">Bank/Cash Account</Label>
                <Select
                  value={formData.bank_account_id}
                  onValueChange={(value) => setFormData({ ...formData, bank_account_id: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select bank/cash account" />
                  </SelectTrigger>
                  <SelectContent>
                    {getBankAccounts().map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-sm">
                        {getLedgerAccountName(account.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Cheque Details (for bank transactions) */}
          {isBankTransaction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="chequeNumber" className="text-sm font-semibold text-neutral-700">Cheque Number <span className="font-normal text-neutral-500">(Optional)</span></Label>
                <Input
                  id="chequeNumber"
                  value={formData.cheque_number}
                  onChange={(e) => setFormData({ ...formData, cheque_number: e.target.value })}
                  placeholder="Enter cheque number"
                  className="text-sm"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="chequeDate" className="text-sm font-semibold text-neutral-700">Cheque Date <span className="font-normal text-neutral-500">(Optional)</span></Label>
                <Input
                  id="chequeDate"
                  type="date"
                  value={formData.cheque_date}
                  onChange={(e) => setFormData({ ...formData, cheque_date: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {/* Narration */}
          <div className="space-y-3">
            <Label htmlFor="narration" className="text-sm font-semibold text-neutral-700">Narration</Label>
            <Textarea
              id="narration"
              value={formData.narration}
              onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
              placeholder="Enter voucher description..."
              rows={3}
              className="text-sm resize-none"
              maxLength={500}
            />
            <p className="text-xs text-neutral-500 text-right">{formData.narration.length}/500</p>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-neutral-800">Line Items</Label>
              <Button 
                type="button" 
                size="sm" 
                onClick={addLineItem}
                className="bg-brand-700 hover:bg-brand-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
                <p className="text-sm font-medium">No line items added yet</p>
                <p className="text-xs mt-1">Click "Add Line" to get started</p>
              </div>
            ) : (
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="w-[40%] text-xs font-semibold text-neutral-700 uppercase tracking-wider">Ledger Account</TableHead>
                      <TableHead className="w-[15%] text-xs font-semibold text-neutral-700 uppercase tracking-wider">Dr/Cr</TableHead>
                      <TableHead className="w-[20%] text-xs font-semibold text-neutral-700 uppercase tracking-wider text-right">Amount (₹)</TableHead>
                      <TableHead className="w-[20%] text-xs font-semibold text-neutral-700 uppercase tracking-wider">Narration</TableHead>
                      <TableHead className="w-[5%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, index) => (
                      <TableRow key={index} className="hover:bg-neutral-50 transition-colors">
                        <TableCell>
                          <Select
                            value={entry.ledger_account_id}
                            onValueChange={(value) => updateEntry(index, 'ledger_account_id', value)}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {ledgerAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id} className="text-sm">
                                  {getLedgerAccountName(account.id)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={entry.entry_type}
                            onValueChange={(value: 'Dr' | 'Cr') => updateEntry(index, 'entry_type', value)}
                          >
                            <SelectTrigger className="text-sm w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Dr" className="text-sm font-semibold text-brand-700">Dr</SelectItem>
                              <SelectItem value="Cr" className="text-sm font-semibold text-signal-500">Cr</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={entry.amount || ''}
                            onChange={(e) => updateEntry(index, 'amount', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="text-sm text-right font-mono tabular-nums"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={entry.narration || ''}
                            onChange={(e) => updateEntry(index, 'narration', e.target.value)}
                            placeholder="Optional"
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          {entries.length > 2 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeEntry(index)}
                              className="text-neutral-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Balance Status */}
          <div className={`p-5 rounded-lg border-2 ${
            balanceStatus === 'balanced' 
              ? 'bg-emerald-50 border-emerald-200' 
              : balanceStatus === 'unbalanced'
              ? 'bg-red-50 border-red-200'
              : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {balanceStatus === 'balanced' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-emerald-700 font-semibold text-sm">Voucher is balanced</span>
                  </div>
                ) : balanceStatus === 'unbalanced' ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700 font-semibold text-sm">Voucher is not balanced</span>
                  </div>
                ) : (
                  <span className="text-neutral-600 text-sm">Add line items to check balance</span>
                )}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-neutral-600 text-xs uppercase tracking-wider">Total Dr</span>
                    <p className="font-mono font-semibold text-neutral-900 tabular-nums">₹{getTotalDr().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="w-px h-8 bg-neutral-300"></div>
                  <div className="text-right">
                    <span className="text-neutral-600 text-xs uppercase tracking-wider">Total Cr</span>
                    <p className="font-mono font-semibold text-neutral-900 tabular-nums">₹{getTotalCr().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  {balanceStatus === 'unbalanced' && (
                    <>
                      <div className="w-px h-8 bg-red-300"></div>
                      <div className="text-right">
                        <span className="text-red-600 text-xs uppercase tracking-wider">Difference</span>
                        <p className="font-mono font-semibold text-red-700 tabular-nums">₹{Math.abs(getTotalDr() - getTotalCr()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <Button 
              type="submit" 
              disabled={loading || balanceStatus !== 'balanced'}
              className="flex-1 bg-brand-700 hover:bg-brand-600 text-white font-semibold h-12"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Voucher'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onCancel}
                className="h-12 px-6 font-semibold"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
