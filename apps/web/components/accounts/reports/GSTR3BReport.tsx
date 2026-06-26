'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SlidersHorizontal, FileText, RefreshCw, FileJson, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import useSWR from 'swr';
import { GSTR3BData } from '@/lib/types/erp';

interface GSTR3BReportProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function GSTR3BReport({ onSuccess, onCancel }: GSTR3BReportProps) {
  const [filters, setSlidersHorizontals] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch GSTR3B data');
    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR(
    `/api/accounts/gst/gstr3b?month=${filters.month}&year=${filters.year}`,
    fetcher
  );

  const gstr3bData = data?.data as GSTR3BData;

  const handleDownloadJSON = () => {
    if (!gstr3bData) return;

    const gstnFormat = {
      fp: gstr3bData.summary.period_label,
      gstr3b: {
        sup_det: {
          osup_det: {
            isup_rev: gstr3bData.outward_supplies.taxable_value,
            txval: gstr3bData.outward_supplies.taxable_value,
            iamt: gstr3bData.outward_supplies.igst_amount,
            camt: gstr3bData.outward_supplies.cgst_amount,
            samt: gstr3bData.outward_supplies.sgst_amount,
            csamt: 0
          },
          isup_nongst: {
            txval: 0,
            camt: 0,
            samt: 0,
            csamt: 0
          },
          inter_sup: {
            txval: 0,
            iamt: 0,
            camt: 0,
            samt: 0,
            csamt: 0
          }
        },
        itc_elg: {
          itc_avl: {
            itc_gst: {
              camt: gstr3bData.itc_available.cgst_amount,
              samt: gstr3bData.itc_available.sgst_amount,
              iamt: gstr3bData.itc_available.igst_amount,
              csamt: 0
            },
            itc_non_gst: {
              camt: 0,
              samt: 0,
              iamt: 0,
              csamt: 0
            }
          },
          itc_rev: {
            camt: 0,
              samt: 0,
              iamt: 0,
              csamt: 0
          },
          itc_net: {
            camt: gstr3bData.itc_available.cgst_amount,
            samt: gstr3bData.itc_available.sgst_amount,
            iamt: gstr3bData.itc_available.igst_amount,
            csamt: 0
          },
          itc_inelg: {
            itc_oth: {
              camt: 0,
              samt: 0,
              iamt: 0,
              csamt: 0
            },
            itc_tds: {
              camt: 0,
              samt: 0,
              iamt: 0,
              csamt: 0
            }
          }
        },
        pay_det: {
          net_tax: {
            camt: gstr3bData.net_tax_payable.cgst_amount,
            samt: gstr3bData.net_tax_payable.sgst_amount,
            iamt: gstr3bData.net_tax_payable.igst_amount,
            csamt: 0
          }
        }
      }
    };

    const blob = new Blob([JSON.stringify(gstnFormat, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR3B-${filters.month}-${filters.year}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getMonthName = (monthNum: number) => monthNames[monthNum - 1] || '';

  return (
    <div className="space-y-8">
      <div className="bg-white border border-[#E3EDE7] rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-[#1A6B3C]" />
            <span className="text-sm font-semibold text-[#111827] tracking-tight">Period SlidersHorizontal</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <select
                value={filters.month}
                onChange={(e) => setSlidersHorizontals({ ...filters, month: parseInt(e.target.value) })}
                className="border-[#E3EDE7] text-[#111827] text-sm h-10 px-4 rounded-md focus:ring-2 focus:ring-[#1A6B3C] focus:border-transparent outline-none transition-all duration-200"
                aria-label="Select month"
              >
                {monthNames.map((name, index) => (
                  <option key={index} value={index + 1}>{name}</option>
                ))}
              </select>
              <select
                value={filters.year}
                onChange={(e) => setSlidersHorizontals({ ...filters, year: parseInt(e.target.value) })}
                className="border-[#E3EDE7] text-[#111827] text-sm h-10 px-4 rounded-md focus:ring-2 focus:ring-[#1A6B3C] focus:border-transparent outline-none transition-all duration-200"
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
              className="h-10 transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-[#1A6B3C] focus:ring-offset-2"
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E3EDE7] rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#E3EDE7] bg-gradient-to-r from-[#F4F7F5] to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#111827] flex items-center gap-3 tracking-tight">
                <FileText className="w-5 h-5 text-[#1A6B3C]" />
                GSTR3B Summary
              </h2>
              <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">
                {getMonthName(filters.month)} {filters.year} • Monthly GST return summary
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadJSON}
                disabled={isLoading || !gstr3bData}
                className="h-10 transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-[#1A6B3C] focus:ring-offset-2"
                aria-label="Download JSON for GSTN portal"
              >
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#6B7280]">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-[#1A6B3C]/10 rounded-full animate-ping"></div>
                <div className="relative w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-[#1A6B3C] animate-spin" />
                </div>
              </div>
              <p className="text-sm font-medium text-[#111827] tracking-wide">Loading GSTR3B data...</p>
            </div>
          ) : !gstr3bData ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#6B7280]">
              <div className="w-16 h-16 rounded-full bg-[#EDF7F1] flex items-center justify-center mb-5">
                <FileText className="h-6 w-6 text-[#1A6B3C]/60" />
              </div>
              <p className="text-sm font-medium text-[#111827] tracking-wide">No data available</p>
              <p className="text-xs mt-2 text-[#6B7280] leading-relaxed">Try selecting a different period</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-[#EDF7F1] to-white rounded-lg p-6 border border-[#E3EDE7] transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1A6B3C]/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#1A6B3C]" />
                      </div>
                      <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-wider">Outward Supplies</h3>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#1A6B3C]" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#6B7280]">Taxable Value</span>
                      <span className="text-lg font-bold text-[#111827] font-mono tabular-nums">{formatINR(gstr3bData.outward_supplies.taxable_value)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#6B7280]">Total Tax</span>
                      <span className="text-lg font-bold text-[#E8621A] font-mono tabular-nums">{formatINR(gstr3bData.outward_supplies.total_tax)}</span>
                    </div>
                    <div className="pt-3 border-t border-[#E3EDE7]">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-[#6B7280]">Total Value</span>
                        <span className="text-xl font-bold text-[#1A6B3C] font-mono tabular-nums">{formatINR(gstr3bData.outward_supplies.total_value)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#EDF7F1] to-white rounded-lg p-6 border border-[#E3EDE7] transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1A6B3C]/10 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-[#1A6B3C]" />
                      </div>
                      <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-wider">ITC Available</h3>
                    </div>
                    <ArrowDownRight className="w-4 h-4 text-[#1A6B3C]" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#6B7280]">Total ITC</span>
                      <span className="text-lg font-bold text-[#1A6B3C] font-mono tabular-nums">{formatINR(gstr3bData.itc_available.total_itc)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#6B7280]">Total Purchases</span>
                      <span className="text-lg font-bold text-[#111827] font-mono tabular-nums">{formatINR(gstr3bData.itc_available.total_purchases)}</span>
                    </div>
                    <div className="pt-3 border-t border-[#E3EDE7]">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-[#6B7280]">CGST</span>
                        <span className="font-mono tabular-nums">{formatINR(gstr3bData.itc_available.cgst_amount)}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs mt-1">
                        <span className="text-[#6B7280]">SGST</span>
                        <span className="font-mono tabular-nums">{formatINR(gstr3bData.itc_available.sgst_amount)}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs mt-1">
                        <span className="text-[#6B7280]">IGST</span>
                        <span className="font-mono tabular-nums">{formatINR(gstr3bData.itc_available.igst_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A6B3C] to-[#1A5C34] rounded-lg p-6 border border-[#1A6B3C]/20 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Net Tax Payable</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-white/80">Total Tax</span>
                      <span className="text-2xl font-bold text-white font-mono tabular-nums">{formatINR(gstr3bData.net_tax_payable.total_tax)}</span>
                    </div>
                    <div className="pt-3 border-t border-white/20">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-white/80">CGST</span>
                        <span className="font-mono tabular-nums text-white">{formatINR(gstr3bData.net_tax_payable.cgst_amount)}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs mt-1">
                        <span className="text-white/80">SGST</span>
                        <span className="font-mono tabular-nums text-white">{formatINR(gstr3bData.net_tax_payable.sgst_amount)}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs mt-1">
                        <span className="text-white/80">IGST</span>
                        <span className="font-mono tabular-nums text-white">{formatINR(gstr3bData.net_tax_payable.igst_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
                <div className="bg-[#EDF7F1] px-6 py-4 border-b border-[#E3EDE7]">
                  <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-wider">Tax Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-3 px-4">Component</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider text-right py-3 px-4">Taxable Value</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider text-right py-3 px-4">CGST</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider text-right py-3 px-4">SGST</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider text-right py-3 px-4">IGST</TableHead>
                        <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider text-right py-3 px-4">Total Tax</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-[#EDF7F1]/60 transition-colors duration-200 border-b border-[#E3EDE7]">
                        <TableCell className="py-3 px-4 text-sm font-semibold text-[#111827]">Outward Supplies</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#111827] text-right font-mono tabular-nums">{formatINR(gstr3bData.outward_supplies.taxable_value)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#111827] text-right font-mono tabular-nums">{formatINR(gstr3bData.outward_supplies.cgst_amount)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#111827] text-right font-mono tabular-nums">{formatINR(gstr3bData.outward_supplies.sgst_amount)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#111827] text-right font-mono tabular-nums">{formatINR(gstr3bData.outward_supplies.igst_amount)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#E8621A] text-right font-mono font-semibold tabular-nums">{formatINR(gstr3bData.outward_supplies.total_tax)}</TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-[#EDF7F1]/60 transition-colors duration-200 border-b border-[#E3EDE7]">
                        <TableCell className="py-3 px-4 text-sm font-semibold text-[#111827]">Less: ITC Available</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#6B7280] text-right font-mono tabular-nums">-</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#1A6B3C] text-right font-mono tabular-nums">({formatINR(gstr3bData.itc_available.cgst_amount)})</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#1A6B3C] text-right font-mono tabular-nums">({formatINR(gstr3bData.itc_available.sgst_amount)})</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#1A6B3C] text-right font-mono tabular-nums">({formatINR(gstr3bData.itc_available.igst_amount)})</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#1A6B3C] text-right font-mono tabular-nums">({formatINR(gstr3bData.itc_available.total_itc)})</TableCell>
                      </TableRow>
                      <TableRow className="bg-[#1A6B3C]/5 hover:bg-[#1A6B3C]/10 transition-colors duration-200">
                        <TableCell className="py-3 px-4 text-sm font-bold text-[#1A6B3C]">Net Tax Payable</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#111827] text-right font-mono tabular-nums">-</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#1A6B3C] text-right font-mono font-semibold tabular-nums">{formatINR(gstr3bData.net_tax_payable.cgst_amount)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#1A6B3C] text-right font-mono font-semibold tabular-nums">{formatINR(gstr3bData.net_tax_payable.sgst_amount)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#1A6B3C] text-right font-mono font-semibold tabular-nums">{formatINR(gstr3bData.net_tax_payable.igst_amount)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-[#1A6B3C] text-right font-mono font-bold tabular-nums">{formatINR(gstr3bData.net_tax_payable.total_tax)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
