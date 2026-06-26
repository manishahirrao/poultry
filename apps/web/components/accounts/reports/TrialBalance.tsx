'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, SlidersHorizontal, Calendar, FileText, RefreshCw, Printer, ChevronRight, ChevronDown } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface AccountData {
  id: string;
  account_code?: string;
  account_name: string;
  openingDr: number;
  openingCr: number;
  transactionsDr: number;
  transactionsCr: number;
  closingDr: number;
  closingCr: number;
}

interface GroupData {
  id: string;
  group_code: string;
  group_name: string;
  parent_group_id: string | null;
  group_type: string;
  affects_gross_profit: boolean;
  level: number;
  accounts: AccountData[];
  children: GroupData[];
  hasAccounts: boolean;
  openingDr: number;
  openingCr: number;
  transactionsDr: number;
  transactionsCr: number;
  closingDr: number;
  closingCr: number;
}

interface TrialBalanceProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getGroupTypeBadge = (type: string) => {
  const typeStyles = {
    asset: 'bg-blue-50 text-blue-700 border-blue-200',
    liability: 'bg-red-50 text-red-700 border-red-200',
    income: 'bg-green-50 text-green-700 border-green-200',
    expense: 'bg-orange-50 text-orange-700 border-orange-200',
    equity: 'bg-purple-50 text-purple-700 border-purple-200'
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${typeStyles[type as keyof typeof typeStyles] || typeStyles.asset}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

export default function TrialBalance({ onSuccess, onCancel }: TrialBalanceProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [trialBalanceData, setTrialBalanceData] = useState<GroupData[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  const [filters, setSlidersHorizontals] = useState({
    asOnDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchTrialBalance();
  }, [filters]);

  const fetchTrialBalance = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`/api/accounts/reports/trial-balance?asOnDate=${filters.asOnDate}`);
      if (!response.ok) throw new Error('Failed to fetch trial balance');
      
      const result = await response.json();
      setTrialBalanceData(result.data || []);
      
      // Auto-expand all groups by default
      const allGroupIds = new Set<string>();
      const collectGroupIds = (groups: GroupData[]) => {
        groups.forEach(group => {
          allGroupIds.add(group.id);
          if (group.children && group.children.length > 0) {
            collectGroupIds(group.children);
          }
        });
      };
      collectGroupIds(result.data || []);
      setExpandedGroups(allGroupIds);
    } catch (error) {
      console.error('Error fetching trial balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Account', 'Account Code', 'Opening Dr', 'Opening Cr', 'Transactions Dr', 'Transactions Cr', 'Closing Dr', 'Closing Cr'];
    const rows: string[][] = [];
    
    const flattenData = (groups: GroupData[], indent = 0) => {
      groups.forEach(group => {
        // Add group row
        rows.push([
          `${'  '.repeat(indent)}${group.group_name}`,
          group.group_code || '',
          formatINR(group.openingDr),
          formatINR(group.openingCr),
          formatINR(group.transactionsDr),
          formatINR(group.transactionsCr),
          formatINR(group.closingDr),
          formatINR(group.closingCr)
        ]);
        
        // Add accounts if expanded
        if (expandedGroups.has(group.id) && group.accounts) {
          group.accounts.forEach(account => {
            rows.push([
              `${'  '.repeat(indent + 1)}${account.account_name}`,
              account.account_code || '',
              formatINR(account.openingDr),
              formatINR(account.openingCr),
              formatINR(account.transactionsDr),
              formatINR(account.transactionsCr),
              formatINR(account.closingDr),
              formatINR(account.closingCr)
            ]);
          });
        }
        
        // Recursively process children
        if (group.children && group.children.length > 0) {
          flattenData(group.children, indent + 1);
        }
      });
    };
    
    flattenData(trialBalanceData);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${filters.asOnDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateTotals = () => {
    let totalOpeningDr = 0;
    let totalOpeningCr = 0;
    let totalTransactionsDr = 0;
    let totalTransactionsCr = 0;
    let totalClosingDr = 0;
    let totalClosingCr = 0;

    const sumGroupTotals = (groups: GroupData[]) => {
      groups.forEach(group => {
        totalOpeningDr += group.openingDr;
        totalOpeningCr += group.openingCr;
        totalTransactionsDr += group.transactionsDr;
        totalTransactionsCr += group.transactionsCr;
        totalClosingDr += group.closingDr;
        totalClosingCr += group.closingCr;
        
        if (group.children && group.children.length > 0) {
          sumGroupTotals(group.children);
        }
      });
    };

    sumGroupTotals(trialBalanceData);

    return { 
      totalOpeningDr, 
      totalOpeningCr, 
      totalTransactionsDr, 
      totalTransactionsCr, 
      totalClosingDr, 
      totalClosingCr 
    };
  };

  const totals = calculateTotals();
  const isBalanced = Math.abs(totals.totalClosingDr - totals.totalClosingCr) < 0.01;

  const renderGroupRow = (group: GroupData) => {
    const isExpanded = expandedGroups.has(group.id);
    const hasChildren = group.children && group.children.length > 0;
    const hasAccounts = group.accounts && group.accounts.length > 0;
    const indent = group.level * 24;

    return (
      <React.Fragment key={group.id}>
        {/* Group Row - Enhanced visual hierarchy and interaction */}
        <TableRow className="bg-[#EDF7F1]/40 hover:bg-[#EDF7F1]/60 transition-colors duration-200">
          <TableCell className="py-3.5 px-4">
            <div className="flex items-center gap-2" style={{ marginLeft: `${indent}px` }}>
              {(hasChildren || hasAccounts) && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="p-1.5 hover:bg-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3DAE72]/20"
                  aria-label={isExpanded ? 'Collapse group' : 'Expand group'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#1A5C34] transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#1A5C34] transition-transform duration-200" />
                  )}
                </button>
              )}
              <span className="font-semibold text-[#111827] text-sm">{group.group_name}</span>
              {getGroupTypeBadge(group.group_type)}
            </div>
          </TableCell>
          <TableCell className="py-3.5 px-4 text-sm text-[#6B7280] font-mono">
            {group.group_code || '-'}
          </TableCell>
          <TableCell className="py-3.5 px-4 text-sm text-right text-[#111827] font-mono tabular-nums">
            {group.openingDr > 0 ? formatINR(group.openingDr) : <span className="text-[#9CA3AF]">-</span>}
          </TableCell>
          <TableCell className="py-3.5 px-4 text-sm text-right text-[#111827] font-mono tabular-nums">
            {group.openingCr > 0 ? formatINR(group.openingCr) : <span className="text-[#9CA3AF]">-</span>}
          </TableCell>
          <TableCell className="py-3.5 px-4 text-sm text-right text-[#111827] font-mono tabular-nums">
            {group.transactionsDr > 0 ? formatINR(group.transactionsDr) : <span className="text-[#9CA3AF]">-</span>}
          </TableCell>
          <TableCell className="py-3.5 px-4 text-sm text-right text-[#111827] font-mono tabular-nums">
            {group.transactionsCr > 0 ? formatINR(group.transactionsCr) : <span className="text-[#9CA3AF]">-</span>}
          </TableCell>
          <TableCell className="py-3.5 px-4 text-sm text-right text-[#111827] font-semibold font-mono tabular-nums">
            {group.closingDr > 0 ? formatINR(group.closingDr) : <span className="text-[#9CA3AF]">-</span>}
          </TableCell>
          <TableCell className="py-3.5 px-4 text-sm text-right text-[#111827] font-semibold font-mono tabular-nums">
            {group.closingCr > 0 ? formatINR(group.closingCr) : <span className="text-[#9CA3AF]">-</span>}
          </TableCell>
        </TableRow>

        {/* Account Rows (if expanded) - Improved visual hierarchy */}
        {isExpanded && hasAccounts && group.accounts.map((account, idx) => (
          <TableRow 
            key={`${group.id}-account-${idx}`}
            className="hover:bg-[#EDF7F1]/70 transition-colors duration-200 border-b border-[#E3EDE7]/60"
          >
            <TableCell className="py-3 px-4">
              <div className="flex items-center gap-2" style={{ marginLeft: `${indent + 24}px` }}>
                <span className="w-4 h-4" />
                <span className="text-sm text-[#6B7280] font-medium">{account.account_name}</span>
              </div>
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-[#6B7280] font-mono">
              {account.account_code || '-'}
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-right text-[#6B7280] font-mono tabular-nums">
              {account.openingDr > 0 ? formatINR(account.openingDr) : <span className="text-[#9CA3AF]">-</span>}
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-right text-[#6B7280] font-mono tabular-nums">
              {account.openingCr > 0 ? formatINR(account.openingCr) : <span className="text-[#9CA3AF]">-</span>}
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-right text-[#6B7280] font-mono tabular-nums">
              {account.transactionsDr > 0 ? formatINR(account.transactionsDr) : <span className="text-[#9CA3AF]">-</span>}
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-right text-[#6B7280] font-mono tabular-nums">
              {account.transactionsCr > 0 ? formatINR(account.transactionsCr) : <span className="text-[#9CA3AF]">-</span>}
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-right text-[#111827] font-mono tabular-nums font-medium">
              {account.closingDr > 0 ? formatINR(account.closingDr) : <span className="text-[#9CA3AF]">-</span>}
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-right text-[#111827] font-mono tabular-nums font-medium">
              {account.closingCr > 0 ? formatINR(account.closingCr) : <span className="text-[#9CA3AF]">-</span>}
            </TableCell>
          </TableRow>
        ))}

        {/* Child Groups */}
        {isExpanded && hasChildren && group.children.map(childGroup => renderGroupRow(childGroup))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-8">
      {/* SlidersHorizontals - Improved spacing and visual hierarchy */}
      <div className="bg-white border border-[#E3EDE7] rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EDF7F1] rounded-lg">
              <SlidersHorizontal className="w-4 h-4 text-[#1A5C34]" />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#111827]">As-On Date</span>
              <p className="text-xs text-[#6B7280] mt-0.5">Select date for trial balance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={filters.asOnDate}
              onChange={(e) => setSlidersHorizontals({ ...filters, asOnDate: e.target.value })}
              className="w-48 border-[#E3EDE7] text-[#111827] text-sm h-10 focus:ring-2 focus:ring-[#3DAE72]/20 focus:border-[#3DAE72] transition-all"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchTrialBalance}
              disabled={loading}
              className="h-10 px-4 hover:bg-[#EDF7F1] transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Trial Balance Table - Enhanced visual hierarchy */}
      <div className="bg-white border border-[#E3EDE7] rounded-xl shadow-sm overflow-hidden">
        {/* Header - Improved spacing and visual weight */}
        <div className="px-6 py-5 border-b border-[#E3EDE7] bg-gradient-to-r from-[#F4F7F5] to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#1A5C34] rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Trial Balance</h2>
                <p className="text-sm text-[#6B7280] mt-0.5">
                  As on {format(new Date(filters.asOnDate), 'dd MMM yyyy')} • <span className={`font-medium ${isBalanced ? 'text-[#1A5C34]' : 'text-[#DC2626]'}`}>{isBalanced ? 'Balanced' : 'Not Balanced'}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                disabled={loading || trialBalanceData.length === 0}
                className="h-10 px-4 hover:bg-[#EDF7F1] transition-colors"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
                disabled={loading || trialBalanceData.length === 0}
                className="h-10 px-4 hover:bg-[#EDF7F1] transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content - Improved spacing and rhythm */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#6B7280]">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-[#3DAE72]/20 rounded-full animate-ping"></div>
                <div className="relative w-20 h-20 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-[#3DAE72] animate-spin" />
                </div>
              </div>
              <p className="text-base font-medium text-[#111827]">Loading trial balance data...</p>
              <p className="text-sm text-[#6B7280] mt-1">Please wait while we fetch your accounts</p>
            </div>
          ) : trialBalanceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#6B7280]">
              <div className="w-20 h-20 rounded-full bg-[#EDF7F1] flex items-center justify-center mb-5">
                <FileText className="h-8 w-8 text-[#3DAE72]/60" />
              </div>
              <p className="text-base font-medium text-[#111827]">No account data found</p>
              <p className="text-sm text-[#6B7280] mt-1">Set up account groups and ledger accounts first</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = '/dashboard/accounts/groups'}
                className="mt-4 h-10 px-4 hover:bg-[#EDF7F1] transition-colors"
              >
                Set Up Accounts
              </Button>
            </div>
          ) : (
            <>
              <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#EDF7F1]">
                      <TableRow>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-4 px-4">Account</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap py-4 px-4">Code</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-4 px-4">Opening Dr</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-4 px-4">Opening Cr</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-4 px-4">Trans. Dr</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-4 px-4">Trans. Cr</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-4 px-4">Closing Dr</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-4 px-4">Closing Cr</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialBalanceData.map(group => renderGroupRow(group))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals Footer - Enhanced visual weight and hierarchy */}
              <div className="mt-8">
                <div className={`rounded-xl p-5 border ${isBalanced ? 'bg-[#EDF7F1] border-[#1A5C34]/30' : 'bg-red-50 border-red-300'}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div>
                      <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Total Opening Dr</div>
                      <div className="text-xl font-bold text-[#111827] font-mono tabular-nums">{formatINR(totals.totalOpeningDr)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Total Opening Cr</div>
                      <div className="text-xl font-bold text-[#111827] font-mono tabular-nums">{formatINR(totals.totalOpeningCr)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Total Closing Dr</div>
                      <div className="text-xl font-bold text-[#111827] font-mono tabular-nums">{formatINR(totals.totalClosingDr)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Total Closing Cr</div>
                      <div className="text-xl font-bold text-[#111827] font-mono tabular-nums">{formatINR(totals.totalClosingCr)}</div>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${isBalanced ? 'border-[#1A5C34]/30' : 'border-red-300'}`}>
                    <div className={`text-base font-semibold ${isBalanced ? 'text-[#1A5C34]' : 'text-[#DC2626]'} flex items-center gap-2`}>
                      {isBalanced ? (
                        <>
                          <div className="w-5 h-5 rounded-full bg-[#1A5C34] flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          Trial Balance is Balanced
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 rounded-full bg-[#DC2626] flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          Trial Balance is Not Balanced
                        </>
                      )}
                    </div>
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
