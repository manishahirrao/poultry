'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Skull, FileText, AlertTriangle as Warning } from 'lucide-react'
import { createClient } from '@/utils/supabase/client';
import { format, differenceInDays } from 'date-fns';

interface MortalityData {
  farm_name: string;
  farmer_name: string;
  batch_number: string;
  placement_date: string;
  days_in: number;
  birds_placed: number;
  total_deaths: number;
  mortality_percent: number;
  today_deaths: number;
  highest_day_deaths: number;
  highest_day_date: string;
  cause_breakdown: {
    disease: number;
    heat_stress: number;
    predation: number;
    other: number;
  };
}

interface MortalityReportProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MortalityReport({ onSuccess, onCancel }: MortalityReportProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<MortalityData[]>([]);
  
  const [filters, setSlidersHorizontals] = useState({
    start_date: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    farm: '',
    supervisor: ''
  });

  useEffect(() => {
    fetchMortalityReport();
  }, [filters]);

  const fetchMortalityReport = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // This would query batches and daily_logs tables
      // For now, using mock data structure
      const { data, error } = await supabase
        .from('batches')
        .select(`
          batch_number,
          placement_date,
          birds_placed,
          status,
          farms!inner(farm_name, farmer_name, village),
          employees!inner(name)
        `)
        .eq('integrator_id', user.id)
        .gte('placement_date', filters.start_date)
        .lte('placement_date', filters.end_date)
        .order('placement_date', { ascending: false });

      if (error) throw error;
      
      // Transform data to report format
      const formattedData = (data || []).map((batch: any) => {
        const daysIn = differenceInDays(new Date(), new Date(batch.placement_date));
        const totalDeaths = Math.floor(batch.birds_placed * (Math.random() * 0.08 + 0.02)); // Mock: 2-10% mortality
        const mortalityPercent = (totalDeaths / batch.birds_placed) * 100;
        const todayDeaths = Math.floor(Math.random() * 5);
        const highestDayDeaths = Math.floor(Math.random() * 20 + 5);
        
        return {
          farm_name: batch.farms?.farm_name || '',
          farmer_name: batch.farms?.farmer_name || '',
          batch_number: batch.batch_number || '',
          placement_date: batch.placement_date,
          days_in: daysIn,
          birds_placed: batch.birds_placed || 0,
          total_deaths: totalDeaths,
          mortality_percent: mortalityPercent,
          today_deaths: todayDeaths,
          highest_day_deaths: highestDayDeaths,
          highest_day_date: format(new Date(new Date(batch.placement_date).getTime() + Math.random() * daysIn * 24 * 60 * 60 * 1000), 'dd MMM yyyy'),
          cause_breakdown: {
            disease: Math.floor(totalDeaths * 0.4),
            heat_stress: Math.floor(totalDeaths * 0.3),
            predation: Math.floor(totalDeaths * 0.2),
            other: Math.floor(totalDeaths * 0.1)
          }
        };
      });
      
      setReportData(formattedData);
    } catch (error) {
      console.error('Error fetching mortality report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Farm', 'Farmer', 'Batch', 'Placement Date', 'Days In', 'Birds Placed', 'Total Deaths', 'Mortality %', 'Today Deaths', 'Highest Day Deaths', 'Highest Day Date', 'Disease', 'Heat Stress', 'Predation', 'Other'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        row.farm_name,
        row.farmer_name,
        row.batch_number,
        row.placement_date,
        row.days_in,
        row.birds_placed,
        row.total_deaths,
        row.mortality_percent.toFixed(1),
        row.today_deaths,
        row.highest_day_deaths,
        row.highest_day_date,
        row.cause_breakdown.disease,
        row.cause_breakdown.heat_stress,
        row.cause_breakdown.predation,
        row.cause_breakdown.other
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mortality-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getMortalityBadge = (percent: number) => {
    if (percent > 8) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#DC2626] text-white border border-[#DC2626] flex items-center gap-1">
          <Warning className="w-3 h-3" />
          HIGH
        </span>
      );
    }
    if (percent > 5) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D97706] text-white border border-[#D97706]">
          MODERATE
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#3DAE72] text-white border border-[#3DAE72]">
        NORMAL
      </span>
    );
  };

  // Calculate totals
  const totals = reportData.reduce((acc, row) => ({
    birds_placed: acc.birds_placed + row.birds_placed,
    total_deaths: acc.total_deaths + row.total_deaths,
    today_deaths: acc.today_deaths + row.today_deaths,
    cause_disease: acc.cause_disease + row.cause_breakdown.disease,
    cause_heat: acc.cause_heat + row.cause_breakdown.heat_stress,
    cause_predation: acc.cause_predation + row.cause_breakdown.predation,
    cause_other: acc.cause_other + row.cause_breakdown.other,
  }), { birds_placed: 0, total_deaths: 0, today_deaths: 0, cause_disease: 0, cause_heat: 0, cause_predation: 0, cause_other: 0 });

  const overallMortalityPercent = totals.birds_placed > 0 ? (totals.total_deaths / totals.birds_placed) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* SlidersHorizontals */}
      <Card className="border-[#E3EDE7] shadow-sm">
        <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#111827] text-lg font-semibold flex items-center gap-2">
              <Skull className="w-4 h-4 text-[#1A5C34]" />
              SlidersHorizontals
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium text-[#111827]">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => setSlidersHorizontals({ ...filters, start_date: e.target.value })}
                className="border-[#E3EDE7] text-[#111827]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium text-[#111827]">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => setSlidersHorizontals({ ...filters, end_date: e.target.value })}
                className="border-[#E3EDE7] text-[#111827]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="farm" className="text-sm font-medium text-[#111827]">Farm</Label>
              <Select
                value={filters.farm}
                onValueChange={(value) => setSlidersHorizontals({ ...filters, farm: value })}
              >
                <SelectTrigger className="border-[#E3EDE7] text-[#111827]">
                  <SelectValue placeholder="All farms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All farms</SelectItem>
                  <SelectItem value="farm1">Farm 1</SelectItem>
                  <SelectItem value="farm2">Farm 2</SelectItem>
                  <SelectItem value="farm3">Farm 3</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="sup1">Supervisor 1</SelectItem>
                  <SelectItem value="sup2">Supervisor 2</SelectItem>
                  <SelectItem value="sup3">Supervisor 3</SelectItem>
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
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Total Birds Placed</p>
                <p className="text-xl font-bold text-[#111827] mt-1">{totals.birds_placed.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                <Skull className="w-5 h-5 text-[#1A5C34]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Total Deaths</p>
                <p className="text-xl font-bold text-[#DC2626] mt-1">{totals.total_deaths.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                <Warning className="w-5 h-5 text-[#DC2626]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Mortality %</p>
                <p className="text-xl font-bold text-[#111827] mt-1">{overallMortalityPercent.toFixed(1)}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                <Skull className="w-5 h-5 text-[#D97706]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Today Deaths</p>
                <p className="text-xl font-bold text-[#111827] mt-1">{totals.today_deaths}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                <Warning className="w-5 h-5 text-[#E8611A]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cause Breakdown */}
      <Card className="border-[#E3EDE7] shadow-sm">
        <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50">
          <div>
            <CardTitle className="text-[#111827] text-lg font-semibold flex items-center gap-2">
              <Skull className="w-4 h-4 text-[#1A5C34]" />
              Cause Breakdown
            </CardTitle>
            <p className="text-sm text-[#6B7280] mt-1">Mortality causes by category</p>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-700 font-medium uppercase tracking-wide">Disease</p>
              <p className="text-lg font-bold text-red-900 mt-1">{totals.cause_disease.toLocaleString()}</p>
              <p className="text-xs text-red-600 mt-1">{((totals.cause_disease / totals.total_deaths) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-700 font-medium uppercase tracking-wide">Heat Stress</p>
              <p className="text-lg font-bold text-orange-900 mt-1">{totals.cause_heat.toLocaleString()}</p>
              <p className="text-xs text-orange-600 mt-1">{((totals.cause_heat / totals.total_deaths) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700 font-medium uppercase tracking-wide">Predation</p>
              <p className="text-lg font-bold text-yellow-900 mt-1">{totals.cause_predation.toLocaleString()}</p>
              <p className="text-xs text-yellow-600 mt-1">{((totals.cause_predation / totals.total_deaths) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-700 font-medium uppercase tracking-wide">Other</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{totals.cause_other.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">{((totals.cause_other / totals.total_deaths) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card className="border-[#E3EDE7] shadow-sm">
        <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#111827] text-lg font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1A5C34]" />
                Mortality Details
              </CardTitle>
              <p className="text-sm text-[#6B7280] mt-1">Detailed mortality statistics by batch</p>
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
              <p className="text-sm font-medium">No mortality data found</p>
              <p className="text-xs mt-1">Try adjusting the date range or filters</p>
            </div>
          ) : (
            <div className="border border-[#E3EDE7] rounded-lg overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#EDF7F1]">
                  <TableRow>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Farm</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Farmer</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Batch</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Placement Date</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Days In</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Birds Placed</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Total Deaths</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Mortality %</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Today Deaths</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Highest Day</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Highest Date</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Disease</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Heat</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Predation</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Other</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Status</TableHead>
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
                      <TableCell className="py-2.5 text-sm text-[#111827] whitespace-nowrap">
                        {format(new Date(row.placement_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.days_in}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap font-medium">
                        {row.birds_placed.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#DC2626] text-right whitespace-nowrap font-semibold">
                        {row.total_deaths.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.mortality_percent.toFixed(1)}%
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#E8611A] text-right whitespace-nowrap font-medium">
                        {row.today_deaths}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.highest_day_deaths}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#6B7280] whitespace-nowrap">
                        {row.highest_day_date}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.cause_breakdown.disease}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.cause_breakdown.heat_stress}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.cause_breakdown.predation}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.cause_breakdown.other}
                      </TableCell>
                      <TableCell className="py-2.5 whitespace-nowrap">
                        {getMortalityBadge(row.mortality_percent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
