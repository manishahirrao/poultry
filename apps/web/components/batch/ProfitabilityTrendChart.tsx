'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { createClient } from '@supabase/supabase-js';
import { TrendUp, TrendDown, ChartLineUp } from '@phosphor-icons/react';

interface ProfitabilityTrendChartProps {
  customerId: string;
  breed: string;
}

interface BatchProfitData {
  batchId: string;
  batchNumber: number;
  netProfitPerBird: number;
  harvestDate: string;
  status: string;
}

interface TrendAnalysis {
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  annotation: string;
}

export function ProfitabilityTrendChart({ customerId, breed }: ProfitabilityTrendChartProps) {
  const [data, setData] = useState<BatchProfitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    fetchProfitabilityData();
  }, [customerId, breed]);

  const fetchProfitabilityData = async () => {
    try {
      setLoading(true);

      // Fetch last 10 harvested batches for this customer and breed
      const { data: batches, error } = await supabase
        .from('batches')
        .select('id, batch_id, net_profit, current_bird_count, doc_placement_date, status')
        .eq('customer_id', customerId)
        .eq('breed', breed)
        .eq('status', 'harvested')
        .order('doc_placement_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform data for chart
      const chartData: BatchProfitData[] = (batches || []).reverse().map((batch, index) => ({
        batchId: batch.batch_id,
        batchNumber: index + 1,
        netProfitPerBird: batch.net_profit && batch.current_bird_count 
          ? batch.net_profit / batch.current_bird_count 
          : 0,
        harvestDate: new Date(batch.doc_placement_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: batch.status
      }));

      setData(chartData);

      // Calculate trend analysis
      if (chartData.length >= 3) {
        analyzeTrend(chartData);
      }
    } catch (err) {
      console.error('Error fetching profitability data:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTrend = (chartData: BatchProfitData[]) => {
    const profits = chartData.map(d => d.netProfitPerBird);
    
    // Simple linear regression to determine trend
    const n = profits.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = profits;
    
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgProfit = sumY / n;
    
    // Calculate percentage change from first to last
    const firstProfit = profits[0];
    const lastProfit = profits[profits.length - 1];
    const percentageChange = firstProfit > 0 ? ((lastProfit - firstProfit) / firstProfit) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable';
    let annotation: string;
    
    if (Math.abs(percentageChange) < 5) {
      trend = 'stable';
      annotation = 'आपकी लाभकारिता स्थिर है। FCR और बिक्री समय पर ध्यान दें।';
    } else if (percentageChange > 0) {
      trend = 'up';
      annotation = `आपकी लाभकारिता ${percentageChange.toFixed(1)}% बढ़ रही है। बेहतर FCR और सही बिक्री समय का परिणाम।`;
    } else {
      trend = 'down';
      const absChange = Math.abs(percentageChange);
      if (absChange > 15) {
        annotation = `आपकी लाभकारिता ${absChange.toFixed(1)}% घट रही है। FCR में सुधार और बिक्री समय पर ध्यान दें।`;
      } else {
        annotation = `आपकी लाभकारिता ${absChange.toFixed(1)}% घट रही है। बाजार की स्थिति और FCR पर ध्यान दें।`;
      }
    }
    
    setTrendAnalysis({
      trend,
      percentageChange,
      annotation
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ChartLineUp size={20} weight="regular" className="text-brand-green-600" />
          <h3 className="font-semibold text-neutral-900">Profitability Trend</h3>
        </div>
        <div className="text-sm text-neutral-500">Loading profitability data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ChartLineUp size={20} weight="regular" className="text-brand-green-600" />
          <h3 className="font-semibold text-neutral-900">Profitability Trend</h3>
        </div>
        <div className="text-center py-8">
          <ChartLineUp size={32} weight="regular" className="text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">No harvested batches yet</p>
          <p className="text-xs text-neutral-400 mt-1">Profitability trend will appear after first harvest</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChartLineUp size={20} weight="regular" className="text-brand-green-600" />
          <h3 className="font-semibold text-neutral-900">Profitability Trend</h3>
        </div>
        {trendAnalysis && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            trendAnalysis.trend === 'up' 
              ? 'bg-green-100 text-green-700' 
              : trendAnalysis.trend === 'down'
              ? 'bg-red-100 text-red-700'
              : 'bg-neutral-100 text-neutral-700'
          }`}>
            {trendAnalysis.trend === 'up' && <TrendUp size={14} weight="bold" />}
            {trendAnalysis.trend === 'down' && <TrendDown size={14} weight="bold" />}
            <span>
              {trendAnalysis.trend === 'up' && '+'}
              {trendAnalysis.percentageChange.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Trend Annotation */}
      {trendAnalysis && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          trendAnalysis.trend === 'up'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : trendAnalysis.trend === 'down'
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-neutral-50 border border-neutral-200 text-neutral-800'
        }`}>
          {trendAnalysis.annotation}
        </div>
      )}

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} aria-label="Profitability trend chart">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="batchNumber" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: 'Batch (chronological)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#9ca3af' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: '₹/bird', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Net Profit/bird']}
              labelFormatter={(label) => `Batch #${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="netProfitPerBird"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Net Profit/bird (₹)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xs text-neutral-500 mb-1">Average</div>
          <div className="font-semibold text-neutral-900">
            ₹{(data.reduce((sum, d) => sum + d.netProfitPerBird, 0) / data.length).toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-neutral-500 mb-1">Best</div>
          <div className="font-semibold text-green-600">
            ₹{Math.max(...data.map(d => d.netProfitPerBird)).toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-neutral-500 mb-1">Latest</div>
          <div className={`font-semibold ${
            data[data.length - 1].netProfitPerBird >= (data.reduce((sum, d) => sum + d.netProfitPerBird, 0) / data.length)
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            ₹{data[data.length - 1].netProfitPerBird.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfitabilityTrendChart;
