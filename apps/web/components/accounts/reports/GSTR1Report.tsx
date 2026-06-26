'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, SlidersHorizontal, Calendar, FileText, RefreshCw, FileJson } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { GSTR1Data, HSNSummary } from '@/lib/types/erp';

interface GSTR1ReportProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function GSTR1Report({ onSuccess, onCancel }: GSTR1ReportProps) {
  const [filters, setSlidersHorizontals] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // SWR fetcher for GSTR1 data
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch GSTR1 data');
    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR(
    `/api/accounts/gst/gstr1?month=${filters.month}&year=${filters.year}`,
    fetcher
  );

  const gstr1Data = data?.data || [];
  const hsnSummary = data?.hsn_summary || [];

  const handleDownloadJSON = () => {
    // Format for GSTN portal upload
    const gstnFormat = {
      fp: `${filters.month}${filters.year.toString().slice(-2)}`,
      gstr1: {
        b2b: gstr1Data.map((item: GSTR1Data) => ({
          inv_no: item.invoice_number,
          inv_dt: item.invoice_date,
          gstin: item.party_gstn,
          val: item.taxable_value,
          txval: item.taxable_value,
          itm_det: [{
            txval: item.taxable_value,
            rt: 0, // Will be calculated based on tax rates
            iamt: item.igst_amount,
            camt: item.cgst_amount,
            samt: item.sgst_amount,
            csamt: 0
          }]
        }))
      }
    };

    const blob = new Blob([JSON.stringify(gstnFormat, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1-${filters.month}-${filters.year}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const headers = ['Invoice Date', 'Invoice No', 'Party GSTIN', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total GST', 'HSN Code', 'Product Name'];
    const csvContent = [
      headers.join(','),
      ...gstr1Data.map((row: GSTR1Data) => [
        row.invoice_date,
        row.invoice_number,
        row.party_gstn,
        row.taxable_value.toFixed(2),
        row.cgst_amount.toFixed(2),
        row.sgst_amount.toFixed(2),
        row.igst_amount.toFixed(2),
        row.total_tax.toFixed(2),
        row.hsn_code || '',
        `"${row.product_name || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1-${filters.month}-${filters.year}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateTotals = () => {
    const totalTaxable = gstr1Data.reduce((sum: number, row: GSTR1Data) => sum + row.taxable_value, 0);
    const totalCGST = gstr1Data.reduce((sum: number, row: GSTR1Data) => sum + row.cgst_amount, 0);
    const totalSGST = gstr1Data.reduce((sum: number, row: GSTR1Data) => sum + row.sgst_amount, 0);
    const totalIGST = gstr1Data.reduce((sum: number, row: GSTR1Data) => sum + row.igst_amount, 0);
    const totalTax = gstr1Data.reduce((sum: number, row: GSTR1Data) => sum + row.total_tax, 0);
    return { totalTaxable, totalCGST, totalSGST, totalIGST, totalTax };
  };

  const totals = calculateTotals();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getMonthName = (monthNum: number) => monthNames[monthNum - 1] || '';

  return (
    <div className="space-y-8">
      {/* SlidersHorizontals - Compact, focused */}
      <div className="bg-white border border-[#E3EDE7] rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-[#1A5C34]" />
            <span className="text-sm font-semibold text-[#111827] tracking-tight">Period SlidersHorizontal</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <select
                value={filters.month}
                onChange={(e) => setSlidersHorizontals({ ...filters, month: parseInt(e.target.value) })}
                className="border-[#E3EDE7] text-[#111827] text-sm h-9 px-3 rounded-md focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent outline-none transition-all duration-150"
                aria-label="Select month"
              >
                {monthNames.map((name, index) => (
                  <option key={index} value={index + 1}>{name}</option>
                ))}
              </select>
              <select
                value={filters.year}
                onChange={(e) => setSlidersHorizontals({ ...filters, year: parseInt(e.target.value) })}
                className="border-[#E3EDE7] text-[#111827] text-sm h-9 px-3 rounded-md focus:ring-2 focus:ring-[#1A5C34] focus:border-transparent outline-none transition-all duration-150"
                aria-label="Select year"
              >
                {[2024, 2025, 2026, 2027, 2028].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => mutate()}
              disabled={isLoading}
              className="h-12 transition-all duration-150 hover:shadow-md focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* GSTR1 Table - Main content with emphasis */}
      <div className="bg-white border border-[#E3EDE7] rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E3EDE7] bg-gradient-to-r from-[#F4F7F5] to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2.5 tracking-tight">
                <FileText className="w-5 h-5 text-[#1A5C34]" />
                GSTR1 Report
              </h2>
              <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">
                {getMonthName(filters.month)} {filters.year} • {gstr1Data.length} invoice{gstr1Data.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadJSON}
                disabled={isLoading || gstr1Data.length === 0}
                className="h-12 transition-all duration-150 hover:shadow-md focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                aria-label="Download JSON for GSTN portal"
              >
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportExcel}
                disabled={isLoading || gstr1Data.length === 0}
                className="h-12 transition-all duration-150 hover:shadow-md focus:ring-2 focus:ring-[#1A5C34] focus:ring-offset-2"
                aria-label="Export to Excel"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#6B7280]">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-[#3DAE72]/20 rounded-full animate-ping"></div>
                <div className="relative w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-[#3DAE72] animate-spin" />
                </div>
              </div>
              <p className="text-sm font-medium text-[#111827] tracking-wide">Loading GSTR1 data...</p>
            </div>
          ) : gstr1Data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#6B7280]">
              <div className="w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center mb-5">
                <FileText className="h-6 w-6 text-[#3DAE72]/60" />
              </div>
              <p className="text-sm font-medium text-[#111827] tracking-wide">No invoices found</p>
              <p className="text-xs mt-1.5 text-[#6B7280] leading-relaxed">Try selecting a different period</p>
            </div>
          ) : (
            <>
              <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#EDF7F1]">
                      <TableRow>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap py-3 px-4">Invoice Date</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap py-3 px-4">Invoice No</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap py-3 px-4">Party GSTIN</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">Taxable Value</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">CGST</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">SGST</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">IGST</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">Total GST</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gstr1Data.map((row: GSTR1Data, index: number) => (
                        <TableRow 
                          key={index} 
                          className="hover:bg-[#EDF7F1]/60 transition-colors duration-150 border-b border-[#E3EDE7] last:border-0"
                        >
                          <TableCell className="py-3 px-4 text-sm text-[#111827] whitespace-nowrap">
                            {format(new Date(row.invoice_date), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-[#111827] whitespace-nowrap font-mono font-medium">
                            {row.invoice_number}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-[#6B7280] whitespace-nowrap font-mono">
                            {row.party_gstn || '-'}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono tabular-nums">
                            {formatINR(row.taxable_value)}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono tabular-nums">
                            {row.cgst_amount > 0 ? formatINR(row.cgst_amount) : <span className="text-[#9CA3AF]">-</span>}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono tabular-nums">
                            {row.sgst_amount > 0 ? formatINR(row.sgst_amount) : <span className="text-[#9CA3AF]">-</span>}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono tabular-nums">
                            {row.igst_amount > 0 ? formatINR(row.igst_amount) : <span className="text-[#9CA3AF]">-</span>}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono font-semibold tabular-nums">
                            {formatINR(row.total_tax)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals Footer - Distinct visual weight */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="bg-[#EDF7F1]/50 rounded-lg p-5 border border-[#E3EDE7] transition-all duration-150 hover:bg-[#EDF7F1]/70">
                  <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Taxable Value</div>
                  <div className="text-2xl font-bold text-[#111827] font-mono tabular-nums tracking-tight">{formatINR(totals.totalTaxable)}</div>
                </div>
                <div className="bg-[#EDF7F1]/50 rounded-lg p-5 border border-[#E3EDE7] transition-all duration-150 hover:bg-[#EDF7F1]/70">
                  <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Total CGST</div>
                  <div className="text-2xl font-bold text-[#111827] font-mono tabular-nums tracking-tight">{formatINR(totals.totalCGST)}</div>
                </div>
                <div className="bg-[#EDF7F1]/50 rounded-lg p-5 border border-[#E3EDE7] transition-all duration-150 hover:bg-[#EDF7F1]/70">
                  <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Total SGST</div>
                  <div className="text-2xl font-bold text-[#111827] font-mono tabular-nums tracking-tight">{formatINR(totals.totalSGST)}</div>
                </div>
                <div className="bg-[#EDF7F1]/50 rounded-lg p-5 border border-[#E3EDE7] transition-all duration-150 hover:bg-[#EDF7F1]/70">
                  <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Total IGST</div>
                  <div className="text-2xl font-bold text-[#111827] font-mono tabular-nums tracking-tight">{formatINR(totals.totalIGST)}</div>
                </div>
                <div className="bg-[#EDF7F1] rounded-lg p-5 border border-[#1A5C34]/20 transition-all duration-150 hover:bg-[#EDF7F1]/80 hover:shadow-sm">
                  <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Total Tax</div>
                  <div className="text-2xl font-bold text-[#1A5C34] font-mono tabular-nums tracking-tight">{formatINR(totals.totalTax)}</div>
                </div>
              </div>

              {/* HSN Summary Section */}
              {hsnSummary.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-bold text-[#111827] mb-5 flex items-center gap-2.5 tracking-tight">
                    <span className="w-1 h-6 bg-[#1A5C34] rounded-full"></span>
                    HSN Summary
                  </h3>
                  <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-[#EDF7F1]">
                          <TableRow>
                            <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap py-3 px-4">HSN Code</TableHead>
                            <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-3 px-4">Description</TableHead>
                            <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">Taxable Value</TableHead>
                            <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">CGST</TableHead>
                            <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">SGST</TableHead>
                            <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">IGST</TableHead>
                            <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-right py-3 px-4">Total Tax</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {hsnSummary.map((row: HSNSummary, index: number) => (
                            <TableRow 
                              key={index} 
                              className="hover:bg-[#EDF7F1]/60 transition-colors duration-150 border-b border-[#E3EDE7] last:border-0"
                            >
                              <TableCell className="py-3 px-4 text-sm text-[#111827] whitespace-nowrap font-mono font-medium">
                                {row.hsn_code}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-sm text-[#6B7280]">
                                {row.description || '-'}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono tabular-nums">
                                {formatINR(row.taxable_value)}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono tabular-nums">
                                {row.cgst_amount > 0 ? formatINR(row.cgst_amount) : <span className="text-[#9CA3AF]">-</span>}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono tabular-nums">
                                {row.sgst_amount > 0 ? formatINR(row.sgst_amount) : <span className="text-[#9CA3AF]">-</span>}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono tabular-nums">
                                {row.igst_amount > 0 ? formatINR(row.igst_amount) : <span className="text-[#9CA3AF]">-</span>}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-sm text-[#111827] text-right whitespace-nowrap font-mono font-semibold tabular-nums">
                                {formatINR(row.total_tax)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
