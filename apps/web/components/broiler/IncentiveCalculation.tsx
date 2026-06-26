'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Check, TrendingUp, TrendingDown, IndianRupee, Download, Printer } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import useSWR from 'swr';

interface SupervisorIncentive {
  id: string;
  supervisor_id: string;
  batch_id: string;
  farm_id: string;
  calculation_date: string;
  actual_gc: number;
  target_gc: number;
  gc_saving: number;
  birds_sold?: number;
  total_weight_kg: number;
  incentive_rate: number;
  incentive_amount: number;
  penalty_rate?: number;
  penalty_amount: number;
  net_incentive: number;
  status: 'pending' | 'approved' | 'paid';
  approved_by?: string;
  paid_date?: string;
  batches?: {
    batch_number: string;
    placement_date: string;
    harvest_date: string;
    birds_placed: number;
  };
  farms?: {
    farm_name: string;
  };
  employees?: {
    name: string;
  };
}

interface IncentiveCalculationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('API endpoint not found. Please contact support.');
    }
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    if (response.status === 403) {
      throw new Error('Access denied. You do not have permission to access this resource.');
    }
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
};

export default function IncentiveCalculation({ onSuccess, onCancel }: IncentiveCalculationProps) {
  const [loading, setLoading] = useState(false);
  const [statusSlidersHorizontal, setStatusSlidersHorizontal] = useState<string>('all');
  
  const { data: incentives, error, mutate } = useSWR<SupervisorIncentive[]>(
    '/api/broiler/incentives',
    fetcher,
    { refreshInterval: 30000 }
  );

  const filteredIncentives = incentives?.filter(inc => 
    statusSlidersHorizontal === 'all' || inc.status === statusSlidersHorizontal
  ) || [];

  const handleApprove = async (incentiveId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/broiler/incentives/${incentiveId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please contact support.');
        }
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to approve this incentive.');
        }
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.error || error.detail || 'Cannot approve this incentive in its current state.');
        }
        const error = await response.json();
        throw new Error(error.error || error.detail || 'Failed to approve');
      }

      mutate();
      onSuccess?.();
    } catch (error: any) {
      alert(error.message || 'Failed to approve incentive / प्रोत्साहन स्वीकृत करने में विफल');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (incentiveId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/broiler/incentives/${incentiveId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: true }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please contact support.');
        }
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to process this payment.');
        }
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.error || error.detail || 'Cannot process payment for this incentive in its current state.');
        }
        const error = await response.json();
        throw new Error(error.error || error.detail || 'Failed to process payment');
      }

      mutate();
      onSuccess?.();
    } catch (error: any) {
      alert(error.message || 'Failed to process payment / भुगतान प्रक्रिया में विफल');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = getStatusBadgeColor(status);
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getGCSavingColor = (saving: number) => {
    if (saving > 0) return 'text-[#3DAE72]';
    if (saving < 0) return 'text-[#DC2626]';
    return 'text-[#6B7280]';
  };

  const getStatusBadgeColor = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      paid: 'bg-green-100 text-green-800 border-green-200'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Incentive Calculation / प्रोत्साहन गणना</h1>
          <p className="text-base text-[#6B7280] leading-relaxed">
            Calculate supervisor incentives based on GC performance / GC प्रदर्शन के आधार पर सुपरवाइजर प्रोत्साहन की गणना करें
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="border border-[#E3EDE7] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-[#111827] hover:bg-[#EDF7F1] hover:border-[#3DAE72] transition-colors duration-200"
            aria-label="Print incentives"
          >
            <Printer size={16} /> Print / प्रिंट
          </button>
          <button
            onClick={() => {/* Export CSV */}}
            className="border border-[#E3EDE7] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-[#111827] hover:bg-[#EDF7F1] hover:border-[#3DAE72] transition-colors duration-200"
            aria-label="Export to CSV"
          >
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-[#E3EDE7] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#6B7280]">Total Incentives / कुल प्रोत्साहन</p>
                <p className="text-3xl font-bold text-[#111827] tabular-nums">{incentives?.length || 0}</p>
              </div>
              <div className="p-3 bg-[#EDF7F1] rounded-lg">
                <Trophy className="w-6 h-6 text-[#3DAE72]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#6B7280]">Pending / लंबित</p>
                <p className="text-3xl font-bold text-[#D97706] tabular-nums">
                  {incentives?.filter(i => i.status === 'pending').length || 0}
                </p>
              </div>
              <div className="p-3 bg-[#FEF3C7] rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#D97706]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#6B7280]">Approved / स्वीकृत</p>
                <p className="text-3xl font-bold text-[#3DAE72] tabular-nums">
                  {incentives?.filter(i => i.status === 'approved').length || 0}
                </p>
              </div>
              <div className="p-3 bg-[#D1FAE5] rounded-lg">
                <Check className="w-6 h-6 text-[#3DAE72]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#6B7280]">Paid / भुगतान किया गया</p>
                <p className="text-3xl font-bold text-[#1A5C34] tabular-nums">
                  {incentives?.filter(i => i.status === 'paid').length || 0}
                </p>
              </div>
              <div className="p-3 bg-[#EDF7F1] rounded-lg">
                <IndianRupee className="w-6 h-6 text-[#1A5C34]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SlidersHorizontal Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-[#6B7280]">SlidersHorizontal / फ़िल्टर:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusSlidersHorizontal('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusSlidersHorizontal === 'all'
                ? 'bg-[#1A5C34] text-white shadow-sm'
                : 'bg-white border border-[#E3EDE7] text-[#111827] hover:bg-[#EDF7F1] hover:border-[#3DAE72]'
            }`}
            aria-label="Show all incentives"
          >
            All / सभी
          </button>
          <button
            onClick={() => setStatusSlidersHorizontal('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusSlidersHorizontal === 'pending'
                ? 'bg-[#1A5C34] text-white shadow-sm'
                : 'bg-white border border-[#E3EDE7] text-[#111827] hover:bg-[#EDF7F1] hover:border-[#3DAE72]'
            }`}
            aria-label="Show pending incentives"
          >
            Pending / लंबित
          </button>
          <button
            onClick={() => setStatusSlidersHorizontal('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusSlidersHorizontal === 'approved'
                ? 'bg-[#1A5C34] text-white shadow-sm'
                : 'bg-white border border-[#E3EDE7] text-[#111827] hover:bg-[#EDF7F1] hover:border-[#3DAE72]'
            }`}
            aria-label="Show approved incentives"
          >
            Approved / स्वीकृत
          </button>
          <button
            onClick={() => setStatusSlidersHorizontal('paid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusSlidersHorizontal === 'paid'
                ? 'bg-[#1A5C34] text-white shadow-sm'
                : 'bg-white border border-[#E3EDE7] text-[#111827] hover:bg-[#EDF7F1] hover:border-[#3DAE72]'
            }`}
            aria-label="Show paid incentives"
          >
            Paid / भुगतान किया गया
          </button>
        </div>
      </div>

      {/* Incentive Table */}
      <Card className="border-[#E3EDE7] shadow-sm">
        <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50">
          <CardTitle className="text-[#111827] text-xl font-semibold">
            Incentive Calculations / प्रोत्साहन गणना
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error ? (
            <div className="text-center py-16 text-[#DC2626]">
              <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-[#DC2626]" />
              </div>
              <p className="text-base font-medium">Error loading incentives / प्रोत्साहन लोड करने में त्रुटि</p>
              <p className="text-sm mt-2 text-[#6B7280]">Please try again / कृपया पुनः प्रयास करें</p>
            </div>
          ) : !incentives || incentives.length === 0 ? (
            <div className="text-center py-16 text-[#6B7280]">
              <div className="w-16 h-16 bg-[#EDF7F1] rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-[#3DAE72]/50" />
              </div>
              <p className="text-base font-medium">No incentives found / कोई प्रोत्साहन नहीं मिला</p>
              <p className="text-sm mt-2">
                Incentives will appear here after batch completion / बैच पूरा होने के बाद यहां प्रोत्साहन दिखाई देगा
              </p>
            </div>
          ) : (
            <div className="border border-[#E3EDE7] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#EDF7F1]">
                    <TableRow>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-4">
                        Supervisor / सुपरवाइजर
                      </TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-4">
                        Batch / बैच
                      </TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-4">
                        Farm / फार्म
                      </TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-4">
                        Target GC
                      </TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-4">
                        Actual GC
                      </TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-4">
                        GC Saving / GC बचत
                      </TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-4">
                        Incentive / प्रोत्साहन
                      </TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-4">
                        Status / स्थिति
                      </TableHead>
                      <TableHead className="text-[#111827] font-semibold text-xs uppercase tracking-wider py-4">
                        Actions / कार्य
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncentives.map((incentive) => {
                      return (
                        <TableRow key={incentive.id} className="hover:bg-[#EDF7F1]/50 transition-colors duration-150">
                          <TableCell className="py-4 text-sm text-[#111827] font-medium">
                            {incentive.employees?.name || '-'}
                          </TableCell>
                          <TableCell className="py-4 text-sm text-[#111827]">
                            {incentive.batches?.batch_number || '-'}
                          </TableCell>
                          <TableCell className="py-4 text-sm text-[#111827]">
                            {incentive.farms?.farm_name || '-'}
                          </TableCell>
                          <TableCell className="py-4 text-sm text-[#111827] tabular-nums">
                            {incentive.target_gc.toFixed(2)}
                          </TableCell>
                          <TableCell className="py-4 text-sm text-[#111827] tabular-nums">
                            {incentive.actual_gc.toFixed(2)}
                          </TableCell>
                          <TableCell className="py-4 text-sm font-semibold tabular-nums">
                            <span className={getGCSavingColor(incentive.gc_saving)}>
                              {incentive.gc_saving > 0 ? '+' : ''}{incentive.gc_saving.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-sm font-semibold text-[#1A5C34] tabular-nums">
                            {formatINR(incentive.net_incentive)}
                          </TableCell>
                          <TableCell className="py-4">
                            {getStatusBadge(incentive.status)}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex gap-2">
                              {incentive.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(incentive.id)}
                                  disabled={loading}
                                  className="bg-[#3DAE72] hover:bg-[#1A5C34] text-white border-0 transition-colors duration-200"
                                  aria-label="Approve incentive"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve / स्वीकृत करें
                                </Button>
                              )}
                              {incentive.status === 'approved' && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePay(incentive.id)}
                                  disabled={loading}
                                  className="bg-[#1A5C34] hover:bg-[#3DAE72] text-white border-0 transition-colors duration-200"
                                  aria-label="Pay incentive"
                                >
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  Pay / भुगतान करें
                                </Button>
                              )}
                              {incentive.status === 'paid' && (
                                <span className="text-xs text-[#6B7280] font-medium">Paid / भुगतान किया गया</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculation Formula */}
      <Card className="border-[#E3EDE7] shadow-sm bg-gradient-to-br from-[#EDF7F1]/50 to-[#F4F7F5]/50">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-[#111827] mb-4">
            Incentive Calculation Formula / प्रोत्साहन गणना सूत्र
          </h3>
          <div className="space-y-3 text-sm text-[#6B7280]">
            <p className="flex items-start gap-2">
              <span className="font-semibold text-[#111827] min-w-fit">GC Saving / GC बचत:</span>
              <span className="font-mono bg-white px-2 py-1 rounded border border-[#E3EDE7]">Target GC - Actual GC</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold text-[#111827] min-w-fit">Incentive Amount / प्रोत्साहन राशि:</span>
              <span className="font-mono bg-white px-2 py-1 rounded border border-[#E3EDE7]">GC Saving × Total Weight (kg) × Incentive Rate</span>
            </p>
            <p className="text-xs mt-4 pt-3 border-t border-[#E3EDE7]">
              <strong className="text-[#DC2626]">Note / नोट:</strong> Negative GC saving (over target) results in penalty / नकारात्मक GC बचत (लक्ष्य से अधिक) जुर्माने का कारण बनती है
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
