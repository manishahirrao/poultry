'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, TrendingUp, TrendingDown, DollarSign, Calculator, FileText } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface MonthlyPLData {
  farm_name: string;
  farmer_name: string;
  batch_number: string;
  supervisor_name: string;
  line_name: string;
  revenue: number;
  chick_cost: number;
  feed_cost: number;
  medicine_cost: number;
  other_cost: number;
  total_cost: number;
  gross_margin: number;
  margin_percent: number;
  budget_variance: number;
  budget_variance_percent: number;
}

interface MonthlyPLReportProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MonthlyPLReport({ onSuccess, onCancel }: MonthlyPLReportProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<MonthlyPLData[]>([]);
  
  const [filters, setSlidersHorizontals] = useState({
    month: format(new Date(), 'yyyy-MM'),
    supervisor: '',
    line: ''
  });

  useEffect(() => {
    fetchMonthlyPLReport();
  }, [filters]);

  const fetchMonthlyPLReport = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // This would query batch_sales and feed_medicine_allocations tables
      // For now, using mock data structure
      const { data, error } = await supabase
        .from('batch_sales')
        .select(`
          sold_date,
          total_amount,
          batches!inner(
            batch_number,
            placement_date,
            farms!inner(farm_name, farmer_name, village),
            employees!inner(name)
          )
        `)
        .eq('integrator_id', user.id)
        .gte('sold_date', startOfMonth(new Date(filters.month)).toISOString())
        .lte('sold_date', endOfMonth(new Date(filters.month)).toISOString());

      if (error) throw error;
      
      // Transform data to report format
      const formattedData = (data || []).map((sale: any) => {
        const revenue = sale.total_amount || 0;
        const chickCost = revenue * 0.35; // Mock: 35% for chicks
        const feedCost = revenue * 0.45; // Mock: 45% for feed
        const medicineCost = revenue * 0.08; // Mock: 8% for medicine
        const otherCost = revenue * 0.05; // Mock: 5% for other
        const totalCost = chickCost + feedCost + medicineCost + otherCost;
        const grossMargin = revenue - totalCost;
        const marginPercent = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
        const budgetVariance = grossMargin - (revenue * 0.15); // Mock: 15% budget margin
        const budgetVariancePercent = revenue > 0 ? (budgetVariance / (revenue * 0.15)) * 100 : 0;
        
        return {
          farm_name: sale.batches?.farms?.farm_name || '',
          farmer_name: sale.batches?.farms?.farmer_name || '',
          batch_number: sale.batches?.batch_number || '',
          supervisor_name: sale.batches?.employees?.name || '',
          line_name: 'Line 1', // Would come from lines table
          revenue: revenue,
          chick_cost: chickCost,
          feed_cost: feedCost,
          medicine_cost: medicineCost,
          other_cost: otherCost,
          total_cost: totalCost,
          gross_margin: grossMargin,
          margin_percent: marginPercent,
          budget_variance: budgetVariance,
          budget_variance_percent: budgetVariancePercent
        };
      });
      
      setReportData(formattedData);
    } catch (error) {
      console.error('Error fetching monthly P&L report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Farm', 'Farmer', 'Batch', 'Supervisor', 'Line', 'Revenue', 'Chick Cost', 'Feed Cost', 'Medicine Cost', 'Other Cost', 'Total Cost', 'Gross Margin', 'Margin %', 'Budget Variance', 'Variance %'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        row.farm_name,
        row.farmer_name,
        row.batch_number,
        row.supervisor_name,
        row.line_name,
        row.revenue.toFixed(2),
        row.chick_cost.toFixed(2),
        row.feed_cost.toFixed(2),
        row.medicine_cost.toFixed(2),
        row.other_cost.toFixed(2),
        row.total_cost.toFixed(2),
        row.gross_margin.toFixed(2),
        row.margin_percent.toFixed(1),
        row.budget_variance.toFixed(2),
        row.budget_variance_percent.toFixed(1)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-pl-report-${filters.month}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const getVarianceBadge = (variance: number) => {
    if (variance >= 0) {
      return (
        <span className="flex items-center gap-1 text-[#3DAE72]">
          <TrendingUp className="w-4 h-4" />
          {formatINR(variance)}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[#DC2626]">
        <TrendingDown className="w-4 h-4" />
        {formatINR(variance)}
      </span>
    );
  };

  // Calculate totals
  const totals = reportData.reduce((acc, row) => ({
    revenue: acc.revenue + row.revenue,
    chick_cost: acc.chick_cost + row.chick_cost,
    feed_cost: acc.feed_cost + row.feed_cost,
    medicine_cost: acc.medicine_cost + row.medicine_cost,
    other_cost: acc.other_cost + row.other_cost,
    total_cost: acc.total_cost + row.total_cost,
    gross_margin: acc.gross_margin + row.gross_margin,
  }), { revenue: 0, chick_cost: 0, feed_cost: 0, medicine_cost: 0, other_cost: 0, total_cost: 0, gross_margin: 0 });

  const overallMarginPercent = totals.revenue > 0 ? (totals.gross_margin / totals.revenue) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* SlidersHorizontals */}
      <Card className="border-[#E3EDE7] shadow-sm">
        <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#111827] text-lg font-semibold flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#1A5C34]" />
              SlidersHorizontals
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month" className="text-sm font-medium text-[#111827]">Month</Label>
              <Input
                id="month"
                type="month"
                value={filters.month}
                onChange={(e) => setSlidersHorizontals({ ...filters, month: e.target.value })}
                className="border-[#E3EDE7] text-[#111827]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor" className="text-sm font-medium text-[#111827]">Supervisor</Label>
              <Select
                value={filters.supervisor}
                onValueChange={(value) => setSlidersHorizontals({ ...filters, supervisor: value })}
              >
                <SelectTrigger className="border-[#E3EDE7] text-[#111827]">
                  <SelectValue placeholder="All supervisors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All supervisors</SelectItem>
                  <SelectItem value="sup1">Rajesh Kumar</SelectItem>
                  <SelectItem value="sup2">Amit Singh</SelectItem>
                  <SelectItem value="sup3">Sunil Verma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="line" className="text-sm font-medium text-[#111827]">Line/Route</Label>
              <Select
                value={filters.line}
                onValueChange={(value) => setSlidersHorizontals({ ...filters, line: value })}
              >
                <SelectTrigger className="border-[#E3EDE7] text-[#111827]">
                  <SelectValue placeholder="All lines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All lines</SelectItem>
                  <SelectItem value="line1">Line 1 - Gorakhpur</SelectItem>
                  <SelectItem value="line2">Line 2 - Deoria</SelectItem>
                  <SelectItem value="line3">Line 3 - Kushinagar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Total Revenue</p>
                <p className="text-xl font-bold text-[#111827] mt-1">{formatINR(totals.revenue)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#3DAE72]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Total Cost</p>
                <p className="text-xl font-bold text-[#DC2626] mt-1">{formatINR(totals.total_cost)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-[#DC2626]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Gross Margin</p>
                <p className="text-xl font-bold text-[#3DAE72] mt-1">{formatINR(totals.gross_margin)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#3DAE72]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Margin %</p>
                <p className="text-xl font-bold text-[#111827] mt-1">{overallMarginPercent.toFixed(1)}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#1A5C34]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Table */}
      <Card className="border-[#E3EDE7] shadow-sm">
        <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#111827] text-lg font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1A5C34]" />
                Monthly P&L Details
              </CardTitle>
              <p className="text-sm text-[#6B7280] mt-1">Revenue, costs, and margins by farm and batch</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {loading ? (
            <div className="text-center py-16 text-[#6B7280]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EDF7F1] mb-3">
                <FileText className="h-5 w-5 text-[#3DAE72]/60" />
              </div>
              <p className="text-sm font-medium">Loading report data...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-16 text-[#6B7280]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EDF7F1] mb-3">
                <FileText className="h-5 w-5 text-[#3DAE72]/60" />
              </div>
              <p className="text-sm font-medium">No report data found</p>
              <p className="text-xs mt-1">Try adjusting the month or filters</p>
            </div>
          ) : (
            <div className="border border-[#E3EDE7] rounded-lg overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#EDF7F1]">
                  <TableRow>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Farm</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Farmer</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Batch</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Supervisor</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Line</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Revenue</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Chick Cost</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Feed Cost</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Med Cost</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Other Cost</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Total Cost</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Gross Margin</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Margin %</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Budget Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-[#EDF7F1]/40 transition-colors">
                      <TableCell className="py-2.5 text-sm text-[#111827] font-medium whitespace-nowrap">
                        {row.farm_name}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#6B7280] whitespace-nowrap">
                        {row.farmer_name}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] whitespace-nowrap">
                        {row.batch_number}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#6B7280] whitespace-nowrap">
                        {row.supervisor_name}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] whitespace-nowrap">
                        {row.line_name}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#3DAE72] text-right whitespace-nowrap font-semibold">
                        {formatINR(row.revenue)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {formatINR(row.chick_cost)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {formatINR(row.feed_cost)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {formatINR(row.medicine_cost)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {formatINR(row.other_cost)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#DC2626] text-right whitespace-nowrap font-semibold">
                        {formatINR(row.total_cost)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#3DAE72] text-right whitespace-nowrap font-semibold">
                        {formatINR(row.gross_margin)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.margin_percent.toFixed(1)}%
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-right whitespace-nowrap">
                        {getVarianceBadge(row.budget_variance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total Row */}
                  <TableRow className="bg-[#EDF7F1] font-semibold">
                    <TableCell className="py-2.5 text-sm text-[#111827] whitespace-nowrap" colSpan={5}>
                      TOTAL
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-[#3DAE72] text-right whitespace-nowrap">
                      {formatINR(totals.revenue)}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                      {formatINR(totals.chick_cost)}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                      {formatINR(totals.feed_cost)}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                      {formatINR(totals.medicine_cost)}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                      {formatINR(totals.other_cost)}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-[#DC2626] text-right whitespace-nowrap">
                      {formatINR(totals.total_cost)}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-[#3DAE72] text-right whitespace-nowrap">
                      {formatINR(totals.gross_margin)}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                      {overallMarginPercent.toFixed(1)}%
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-right whitespace-nowrap">
                      -
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
