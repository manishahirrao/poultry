'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Users, IndianRupee, Check, AlertCircle, Lock, FileText } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import useSWR from 'swr';

interface SupervisorPayroll {
  id: string;
  supervisor_id: string;
  supervisor_name: string;
  month: string;
  year: number;
  base_salary: number;
  incentive_amount: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'paid';
  visits_count: number;
  batches_handled: number;
}

interface MonthlyClosingProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch');
  const result = await response.json();
  return result.data;
};

export default function MonthlyClosing({ onSuccess, onCancel }: MonthlyClosingProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [closingStatus, setClosingStatus] = useState<any>(null);

  const { data: payroll, error, mutate } = useSWR<SupervisorPayroll[]>(
    `/api/broiler/payroll?month=${selectedMonth}`,
    fetcher
  );

  const { data: monthStatus } = useSWR(
    `/api/broiler/monthly-closing/status?month=${selectedMonth}`,
    fetcher
  );

  useEffect(() => {
    setClosingStatus(monthStatus);
  }, [monthStatus]);

  const handleGeneratePayroll = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/broiler/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate payroll');
      }

      mutate();
      onSuccess?.();
    } catch (error) {
      console.error('Error generating payroll:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate payroll / पेरोल बनाने में विफल');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayroll = async (payrollId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/broiler/payroll/${payrollId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve payroll');
      }

      mutate();
      onSuccess?.();
    } catch (error) {
      console.error('Error approving payroll:', error);
      alert(error instanceof Error ? error.message : 'Failed to approve payroll / पेरोल अनुमोदित करने में विफल');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMonth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/broiler/monthly-closing/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to close month');
      }

      // Refresh month status
      const statusResponse = await fetch(`/api/broiler/monthly-closing/status?month=${selectedMonth}`);
      const statusData = await statusResponse.json();
      setClosingStatus(statusData.data);

      onSuccess?.();
    } catch (error) {
      console.error('Error closing month:', error);
      alert(error instanceof Error ? error.message : 'Failed to close month / महीना बंद करने में विफल');
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-amber-50 text-amber-800 border-amber-200',
      approved: 'bg-blue-50 text-blue-800 border-blue-200',
      paid: 'bg-green-50 text-green-800 border-green-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status as keyof typeof statusColors] || statusColors.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Monthly Closing / मासिक बंद</h1>
          <p className="text-base text-neutral-600 leading-relaxed">
            Generate payroll, review P&L, and close financial period / पेरोल बनाएं, P&L समीक्षा करें और वित्तीय अवधि बंद करें
          </p>
        </div>
      </div>

      {/* Month Selector */}
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brandGreen700" />
              <label className="text-sm font-medium text-neutral-900">Select Month / महीना चुनें:</label>
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border-neutral-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brandGreen700"
            />
            <div className="flex-1"></div>
            {closingStatus?.is_closed && (
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <Lock className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-800">Month Closed / महीना बंद</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-600">Supervisors / सुपरवाइजर</p>
                <p className="text-3xl font-bold text-neutral-900">{payroll?.length || 0}</p>
              </div>
              <div className="p-3 bg-neutral-100 rounded-lg">
                <Users className="w-6 h-6 text-brandGreen700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-600">Total Payroll / कुल पेरोल</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {formatINR(payroll?.reduce((sum, p) => sum + p.total_amount, 0) || 0)}
                </p>
              </div>
              <div className="p-3 bg-neutral-100 rounded-lg">
                <IndianRupee className="w-6 h-6 text-brandGreen700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-600">Pending / लंबित</p>
                <p className="text-3xl font-bold text-amber-500">
                  {payroll?.filter(p => p.status === 'pending').length || 0}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-600">Paid / भुगतान किया गया</p>
                <p className="text-3xl font-bold text-brandGreen700">
                  {payroll?.filter(p => p.status === 'paid').length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-brandGreen700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="border-neutral-200 shadow-sm">
        <CardHeader className="border-b border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-neutral-900 text-xl font-semibold">
            Supervisor Payroll - {monthName} / सुपरवाइजर पेरोल
          </CardTitle>
          <div className="flex gap-3">
            {!payroll || payroll.length === 0 ? (
              <Button
                onClick={handleGeneratePayroll}
                disabled={loading || closingStatus?.is_closed}
                className="bg-brandOrange700 hover:bg-brandOrange600 text-white border-0 transition-colors duration-200"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Payroll / पेरोल बनाएं
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!payroll || payroll.length === 0 ? (
            <div className="text-center py-16 text-neutral-600">
              <Users className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
              <p className="text-base font-medium">No payroll generated for this month / इस महीने के लिए कोई पेरोल नहीं बनाई गई</p>
              <p className="text-sm mt-2">
                Click "Generate Payroll" to create supervisor payroll / पेरोल बनाने के लिए "पेरोल बनाएं" पर क्लिक करें
              </p>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="text-neutral-900 font-semibold text-xs uppercase tracking-wider py-4">
                        Supervisor / सुपरवाइजर
                      </TableHead>
                      <TableHead className="text-neutral-900 font-semibold text-xs uppercase tracking-wider py-4">
                        Base Salary / आधार वेतन
                      </TableHead>
                      <TableHead className="text-neutral-900 font-semibold text-xs uppercase tracking-wider py-4">
                        Incentive / प्रोत्साहन
                      </TableHead>
                      <TableHead className="text-neutral-900 font-semibold text-xs uppercase tracking-wider py-4">
                        Total / कुल
                      </TableHead>
                      <TableHead className="text-neutral-900 font-semibold text-xs uppercase tracking-wider py-4">
                        Visits / दौरे
                      </TableHead>
                      <TableHead className="text-neutral-900 font-semibold text-xs uppercase tracking-wider py-4">
                        Batches / बैच
                      </TableHead>
                      <TableHead className="text-neutral-900 font-semibold text-xs uppercase tracking-wider py-4">
                        Status / स्थिति
                      </TableHead>
                      <TableHead className="text-neutral-900 font-semibold text-xs uppercase tracking-wider py-4">
                        Actions / कार्य
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payroll.map((item) => (
                      <TableRow key={item.id} className="hover:bg-neutral-50 transition-colors duration-150">
                        <TableCell className="py-4 text-sm text-neutral-900 font-medium">
                          {item.supervisor_name}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-neutral-900 tabular-nums">
                          {formatINR(item.base_salary)}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-neutral-900 tabular-nums">
                          {formatINR(item.incentive_amount)}
                        </TableCell>
                        <TableCell className="py-4 text-sm font-semibold text-brandGreen700 tabular-nums">
                          {formatINR(item.total_amount)}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-neutral-900 tabular-nums">
                          {item.visits_count}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-neutral-900 tabular-nums">
                          {item.batches_handled}
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex gap-2">
                            {item.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleApprovePayroll(item.id)}
                                disabled={loading}
                                className="bg-brandGreen700 hover:bg-brandGreen600 text-white border-0 transition-colors duration-200"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                            )}
                            {item.status === 'paid' && (
                              <span className="text-xs text-neutral-600 font-medium">Paid / भुगतान किया गया</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Month Close Action */}
      {!closingStatus?.is_closed && payroll && payroll.length > 0 && payroll.every(p => p.status === 'paid') && (
        <Card className="border-neutral-200 shadow-sm bg-neutral-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-brandGreen700" />
                  Close Month / महीना बंद करें
                </h3>
                <p className="text-sm text-neutral-600">
                  All payroll processed. Ready to close {monthName} and lock financial records.
                </p>
              </div>
              <Button
                onClick={handleCloseMonth}
                disabled={loading}
                className="bg-brandGreen700 hover:bg-brandGreen600 text-white border-0 transition-colors duration-200"
              >
                <Lock className="w-4 h-4 mr-2" />
                Close Month / महीना बंद करें
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
