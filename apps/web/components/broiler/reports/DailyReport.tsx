'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, SlidersHorizontal, Calendar, FileText } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface DailyReportData {
  date: string;
  farm_name: string;
  farmer_name: string;
  supervisor_name: string;
  batch_number: string;
  birds_alive: number;
  deaths_today: number;
  feed_given_kg: number;
  avg_weight_g: number;
  fcr: number;
  days_in: number;
  status: string;
}

interface DailyReportProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DailyReport({ onSuccess, onCancel }: DailyReportProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<DailyReportData[]>([]);
  
  const [filters, setSlidersHorizontals] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    supervisor: '',
    district: ''
  });

  useEffect(() => {
    fetchDailyReport();
  }, [filters]);

  const fetchDailyReport = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // This would query supervisor_visits and batches tables
      // For now, using mock data structure
      const { data, error } = await supabase
        .from('supervisor_visits')
        .select(`
          visit_date,
          farms!inner(farm_name, farmer_name, village),
          employees!inner(name),
          batches!inner(batch_number, birds_placed, status, placement_date)
        `)
        .eq('integrator_id', user.id)
        .gte('visit_date', filters.date)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      
      // Transform data to report format
      const formattedData = (data || []).map((visit: any) => ({
        date: visit.visit_date,
        farm_name: visit.farms?.farm_name || '',
        farmer_name: visit.farms?.farmer_name || '',
        supervisor_name: visit.employees?.name || '',
        batch_number: visit.batches?.batch_number || '',
        birds_alive: visit.batches?.birds_placed || 0,
        deaths_today: visit.deaths_today || 0,
        feed_given_kg: 0, // Would come from feed allocation
        avg_weight_g: 0, // Would come from body weight records
        fcr: 0, // Calculated field
        days_in: 0, // Calculated from placement date
        status: visit.batches?.status || 'active'
      }));
      
      setReportData(formattedData);
    } catch (error) {
      console.error('Error fetching daily report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // Generate PDF using browser print
    window.print();
  };

  const handleExportCSV = () => {
    // Generate CSV export
    const headers = ['Date', 'Farm', 'Supervisor', 'Batch', 'Birds Alive', 'Deaths', 'Feed (kg)', 'Avg Wt (g)', 'FCR', 'Days In', 'Status'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        row.date,
        row.farm_name,
        row.supervisor_name,
        row.batch_number,
        row.birds_alive,
        row.deaths_today,
        row.feed_given_kg.toFixed(1),
        row.avg_weight_g.toFixed(0),
        row.fcr.toFixed(3),
        row.days_in,
        row.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${filters.date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status as keyof typeof statusColors] || statusColors.active}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* SlidersHorizontals */}
      <Card className="border-[#E3EDE7] shadow-sm">
        <CardHeader className="border-b border-[#E3EDE7] bg-[#F4F7F5]/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#111827] text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#1A5C34]" />
              SlidersHorizontals
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-[#111827]">Date</Label>
              <Input
                id="date"
                type="date"
                value={filters.date}
                onChange={(e) => setSlidersHorizontals({ ...filters, date: e.target.value })}
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
              <Label htmlFor="district" className="text-sm font-medium text-[#111827]">District</Label>
              <Select
                value={filters.district}
                onValueChange={(value) => setSlidersHorizontals({ ...filters, district: value })}
              >
                <SelectTrigger className="border-[#E3EDE7] text-[#111827]">
                  <SelectValue placeholder="All districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All districts</SelectItem>
                  <SelectItem value="gorakhpur">Gorakhpur</SelectItem>
                  <SelectItem value="deoria">Deoria</SelectItem>
                  <SelectItem value="kushinagar">Kushinagar</SelectItem>
                  <SelectItem value="maharajganj">Maharajganj</SelectItem>
                </SelectContent>
              </Select>
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
                <Calendar className="w-4 h-4 text-[#1A5C34]" />
                Daily Performance Report
              </CardTitle>
              <p className="text-sm text-[#6B7280] mt-1">Track daily farm performance metrics across all batches</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
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
              <p className="text-xs mt-1">Try adjusting the date or filters</p>
            </div>
          ) : (
            <div className="border border-[#E3EDE7] rounded-lg overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#EDF7F1]">
                  <TableRow>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Date</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Farm</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Supervisor</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Batch</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Birds Alive</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Deaths</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Feed (kg)</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Avg Wt (g)</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">FCR</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Days In</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-[#EDF7F1]/40 transition-colors">
                      <TableCell className="py-2.5 text-sm text-[#111827] whitespace-nowrap">
                        {format(new Date(row.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] font-medium whitespace-nowrap">
                        {row.farm_name}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#6B7280] whitespace-nowrap">
                        {row.supervisor_name}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] whitespace-nowrap">
                        {row.batch_number}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap font-medium">
                        {row.birds_alive.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#DC2626] text-right whitespace-nowrap font-medium">
                        {row.deaths_today}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.feed_given_kg.toFixed(1)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.avg_weight_g.toFixed(0)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.fcr.toFixed(3)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.days_in}
                      </TableCell>
                      <TableCell className="py-2.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
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
