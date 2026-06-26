'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, SlidersHorizontal, Calendar, FileText, RefreshCw } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface DaybookData {
  voucher_number: string;
  voucher_type: string;
  narration: string;
  debit: number;
  credit: number;
  running_balance: number;
  created_at: string;
}

interface DayBookProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getVoucherTypeBadge = (type: string) => {
  const typeStyles = {
    payment: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    receipt: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    contra: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    journal: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    employee: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors duration-150 ${typeStyles[type as keyof typeof typeStyles] || typeStyles.journal}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

export default function DayBook({ onSuccess, onCancel }: DayBookProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [daybookData, setDaybookData] = useState<DaybookData[]>([]);
  
  const [filters, setSlidersHorizontals] = useState({
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchDaybook();
  }, [filters]);

  const fetchDaybook = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
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
        .eq('voucher_date', filters.date)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform data to daybook format with running balance
      let runningBalance = 0;
      const formattedData = (data || []).map((voucher: any) => {
        const entries = voucher.voucher_entries || [];
        const debitTotal = entries
          .filter((e: any) => e.entry_type === 'Dr')
          .reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
        const creditTotal = entries
          .filter((e: any) => e.entry_type === 'Cr')
          .reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
        
        // Calculate net effect on running balance
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
      
      setDaybookData(formattedData);
    } catch (error) {
      console.error('Error fetching daybook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Voucher No', 'Type', 'Narration', 'Debit', 'Credit', 'Running Balance'];
    const csvContent = [
      headers.join(','),
      ...daybookData.map(row => [
        row.voucher_number,
        row.voucher_type,
        `"${row.narration}"`,
        row.debit.toFixed(2),
        row.credit.toFixed(2),
        row.running_balance.toFixed(2)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daybook-${filters.date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateTotals = () => {
    const totalDebit = daybookData.reduce((sum, row) => sum + row.debit, 0);
    const totalCredit = daybookData.reduce((sum, row) => sum + row.credit, 0);
    const finalBalance = daybookData.length > 0 ? daybookData[daybookData.length - 1].running_balance : 0;
    return { totalDebit, totalCredit, finalBalance };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* SlidersHorizontals - Compact, focused */}
      <div className="bg-white border border-[#E3EDE7] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#1A5C34]" />
            <span className="text-sm font-semibold text-[#111827]">Date SlidersHorizontal</span>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => setSlidersHorizontals({ ...filters, date: e.target.value })}
              className="w-48 border-[#E3EDE7] text-[#111827] text-sm h-9"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDaybook}
              disabled={loading}
              className="h-12"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Daybook Table - Main content with emphasis */}
      <div className="bg-white border border-[#E3EDE7] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E3EDE7] bg-gradient-to-r from-[#F4F7F5] to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1A5C34]" />
                Day Book
              </h2>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {format(new Date(filters.date), 'dd MMM yyyy')} • {daybookData.length} vouchers
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPDF}
                disabled={loading || daybookData.length === 0}
                className="h-12"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
                disabled={loading || daybookData.length === 0}
                className="h-12"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#3DAE72]/20 rounded-full animate-ping"></div>
                <div className="relative w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-[#3DAE72] animate-spin" />
                </div>
              </div>
              <p className="text-sm font-medium">Loading daybook data...</p>
            </div>
          ) : daybookData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
              <div className="w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-[#3DAE72]/60" />
              </div>
              <p className="text-sm font-medium text-[#111827]">No vouchers found</p>
              <p className="text-xs mt-1">Try selecting a different date</p>
            </div>
          ) : (
            <>
              <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#EDF7F1]">
                      <TableRow>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap py-3 px-4">Voucher</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap py-3 px-4">Type</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-3 px-4">Narration</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">Debit</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">Credit</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {daybookData.map((row, index) => (
                        <TableRow 
                          key={index} 
                          className="hover:bg-[#EDF7F1]/60 transition-colors duration-150 border-b border-[#E3EDE7] last:border-0"
                        >
                          <TableCell className="py-3 px-4 text-sm text-[#111827] whitespace-nowrap font-mono font-medium">
                            {row.voucher_number}
                          </TableCell>
                          <TableCell className="py-3 px-4 whitespace-nowrap">
                            {getVoucherTypeBadge(row.voucher_type)}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-[#6B7280] max-w-md">
                            <div className="truncate" title={row.narration}>
                              {row.narration || '-'}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono tabular-nums">
                            {row.debit > 0 ? formatINR(row.debit) : <span className="text-[#9CA3AF]">-</span>}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono tabular-nums">
                            {row.credit > 0 ? formatINR(row.credit) : <span className="text-[#9CA3AF]">-</span>}
                          </TableCell>
                          <TableCell className={`py-3 px-4 text-sm text-right whitespace-nowrap font-mono font-semibold tabular-nums ${row.running_balance >= 0 ? 'text-[#1A5C34]' : 'text-[#DC2626]'}`}>
                            {formatINR(row.running_balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals Footer - Distinct visual weight */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#EDF7F1]/50 rounded-lg p-4 border border-[#E3EDE7]">
                  <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1">Total Debit</div>
                  <div className="text-2xl font-bold text-[#111827] font-mono tabular-nums">{formatINR(totals.totalDebit)}</div>
                </div>
                <div className="bg-[#EDF7F1]/50 rounded-lg p-4 border border-[#E3EDE7]">
                  <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1">Total Credit</div>
                  <div className="text-2xl font-bold text-[#111827] font-mono tabular-nums">{formatINR(totals.totalCredit)}</div>
                </div>
                <div className={`rounded-lg p-4 border ${totals.finalBalance >= 0 ? 'bg-[#EDF7F1] border-[#1A5C34]/20' : 'bg-red-50 border-red-200'}`}>
                  <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1">Final Balance</div>
                  <div className={`text-2xl font-bold font-mono tabular-nums ${totals.finalBalance >= 0 ? 'text-[#1A5C34]' : 'text-[#DC2626]'}`}>
                    {formatINR(totals.finalBalance)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
