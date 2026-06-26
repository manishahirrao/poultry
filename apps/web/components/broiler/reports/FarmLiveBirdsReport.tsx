'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Bird, CheckCircle, AlertTriangle as Warning } from 'lucide-react'
import { createClient } from '@/utils/supabase/client';
import { format, differenceInDays } from 'date-fns';

interface FarmLiveBirdsData {
  farm_name: string;
  farmer_name: string;
  batch_number: string;
  placement_date: string;
  days_in: number;
  birds_placed: number;
  live_birds: number;
  mortality_percent: number;
  avg_weight_g: number;
  target_weight_g: number;
  fcr: number;
  gc: number;
  harvest_ready: boolean;
}

interface FarmLiveBirdsReportProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function FarmLiveBirdsReport({ onSuccess, onCancel }: FarmLiveBirdsReportProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<FarmLiveBirdsData[]>([]);

  useEffect(() => {
    fetchFarmLiveBirdsReport();
  }, []);

  const fetchFarmLiveBirdsReport = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // This would query batches, farms, and related tables
      // For now, using mock data structure
      const { data, error } = await supabase
        .from('batches')
        .select(`
          batch_number,
          placement_date,
          birds_placed,
          status,
          farms!inner(farm_name, farmer_name)
        `)
        .eq('integrator_id', user.id)
        .eq('status', 'active')
        .order('placement_date', { ascending: false });

      if (error) throw error;
      
      // Transform data to report format
      const formattedData = (data || []).map((batch: any) => {
        const daysIn = differenceInDays(new Date(), new Date(batch.placement_date));
        const harvestReady = daysIn >= 35;
        
        return {
          farm_name: batch.farms?.farm_name || '',
          farmer_name: batch.farms?.farmer_name || '',
          batch_number: batch.batch_number || '',
          placement_date: batch.placement_date,
          days_in: daysIn,
          birds_placed: batch.birds_placed || 0,
          live_birds: batch.birds_placed || 0, // Would be calculated from deaths
          mortality_percent: 0, // Would be calculated
          avg_weight_g: 0, // Would come from body weight records
          target_weight_g: 0, // Would come from breed standards
          fcr: 0, // Calculated field
          gc: 0, // Calculated field
          harvest_ready: harvestReady
        };
      });
      
      // Sort by days_in descending
      formattedData.sort((a: FarmLiveBirdsData, b: FarmLiveBirdsData) => b.days_in - a.days_in);
      
      setReportData(formattedData);
    } catch (error) {
      console.error('Error fetching farm live birds report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Generate CSV export
    const headers = ['Farm', 'Farmer', 'Batch', 'Placement Date', 'Days In', 'Birds Placed', 'Live Birds', 'Mortality %', 'Avg Wt (g)', 'Target Wt (g)', 'FCR', 'GC', 'Harvest Ready'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        row.farm_name,
        row.farmer_name,
        row.batch_number,
        row.placement_date,
        row.days_in,
        row.birds_placed,
        row.live_birds,
        row.mortality_percent.toFixed(1),
        row.avg_weight_g.toFixed(0),
        row.target_weight_g.toFixed(0),
        row.fcr.toFixed(3),
        row.gc.toFixed(2),
        row.harvest_ready ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-birds-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getHarvestReadyBadge = (ready: boolean) => {
    if (ready) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D97706] text-white border border-[#D97706] flex items-center gap-1">
          <Warning className="w-3 h-3" />
          HARVEST READY
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#3DAE72] text-white border border-[#3DAE72] flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        GROWING
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Active Farms</p>
                <p className="text-xl font-bold text-[#111827] mt-1">{reportData.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                <Bird className="w-5 h-5 text-[#3DAE72]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Total Birds</p>
                <p className="text-xl font-bold text-[#111827] mt-1">
                  {reportData.reduce((sum, r) => sum + r.live_birds, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                <Bird className="w-5 h-5 text-[#1A5C34]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Harvest Ready</p>
                <p className="text-xl font-bold text-[#D97706] mt-1">
                  {reportData.filter(r => r.harvest_ready).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                <Warning className="w-5 h-5 text-[#D97706]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E3EDE7] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Avg Mortality</p>
                <p className="text-xl font-bold text-[#111827] mt-1">
                  {reportData.length > 0 
                    ? (reportData.reduce((sum, r) => sum + r.mortality_percent, 0) / reportData.length).toFixed(1)
                    : '0'}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EDF7F1] flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#3DAE72]" />
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
                <Bird className="w-4 h-4 text-[#1A5C34]" />
                Live Birds by Farm
              </CardTitle>
              <p className="text-sm text-[#6B7280] mt-1">Current live bird inventory across all active batches</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
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
                <Bird className="h-5 w-5 text-[#3DAE72]/60" />
              </div>
              <p className="text-sm font-medium">Loading report data...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-16 text-[#6B7280]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EDF7F1] mb-3">
                <Bird className="h-5 w-5 text-[#3DAE72]/60" />
              </div>
              <p className="text-sm font-medium">No active farms found</p>
              <p className="text-xs mt-1">Live birds data will appear here when batches are active</p>
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
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Live Birds</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Mortality %</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Avg Wt (g)</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">Target Wt (g)</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">FCR</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap text-right">GC</TableHead>
                    <TableHead className="text-[#111827] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow 
                      key={index} 
                      className={`hover:bg-[#EDF7F1]/40 transition-colors ${row.harvest_ready ? 'bg-[#D97706]/10' : ''}`}
                    >
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
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap font-semibold">
                        {row.days_in}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.birds_placed.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap font-semibold">
                        {row.live_birds.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.mortality_percent.toFixed(1)}%
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.avg_weight_g.toFixed(0)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.target_weight_g.toFixed(0)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.fcr.toFixed(3)}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-[#111827] text-right whitespace-nowrap">
                        {row.gc.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-2.5 whitespace-nowrap">
                        {getHarvestReadyBadge(row.harvest_ready)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-[#E3EDE7] shadow-sm bg-[#EDF7F1]/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#D97706]/10 border border-[#D97706] rounded" />
              <span className="text-[#6B7280]">Harvest Ready (≥35 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-[#E3EDE7] rounded" />
              <span className="text-[#6B7280]">Growing</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
