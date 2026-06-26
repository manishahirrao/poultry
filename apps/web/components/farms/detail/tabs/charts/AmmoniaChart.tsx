'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea, Area, AreaChart } from 'recharts';
import { createClient } from '@supabase/supabase-js';

interface AmmoniaChartProps {
  batchId: string;
}

interface AmmoniaData {
  day: number;
  ammonia: number | null;
}

export function AmmoniaChart({ batchId }: AmmoniaChartProps) {
  const [data, setData] = useState<AmmoniaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAsTable, setViewAsTable] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  useEffect(() => {
    fetchAmmoniaData();
  }, [batchId]);

  const fetchAmmoniaData = async () => {
    try {
      let ammoniaLogs;
      
      if (supabase) {
        const { data, error } = await supabase
          .from('daily_logs')
          .select('log_date, ammonia_ppm')
          .eq('batch_id', batchId)
          .order('log_date', { ascending: true });

        if (error) throw error;
        ammoniaLogs = data;
      } else {
        // Use mock data when Supabase is not configured
        ammoniaLogs = generateMockData();
      }

      const chartData: AmmoniaData[] = (ammoniaLogs || []).map((log: any, index: number) => ({
        day: index + 1,
        ammonia: log.ammonia_ppm || null,
      }));

      setData(chartData);
    } catch (err) {
      console.error('Error fetching ammonia data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    return Array.from({ length: 21 }, (_, i) => ({
      log_date: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(),
      ammonia_ppm: 5 + Math.random() * 20,
    }));
  };

  if (loading) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading ammonia data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <div className="text-neutral-400 text-sm">No ammonia data logged yet</div>
      </div>
    );
  }

  if (viewAsTable) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setViewAsTable(false)}
          className="text-sm text-green-700 hover:text-green-800 font-medium"
        >
          ← View as Chart
        </button>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Day</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Ammonia (ppm)</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                let status = 'Normal';
                let statusColor = 'text-green-700';
                if (row.ammonia && row.ammonia > 25) {
                  status = 'Dangerous';
                  statusColor = 'text-red-700';
                } else if (row.ammonia && row.ammonia >= 10) {
                  status = 'Elevated';
                  statusColor = 'text-amber-700';
                }
                return (
                  <tr key={row.day} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">{row.day}</td>
                    <td className="py-2 px-3 text-gray-700">{row.ammonia?.toFixed(1) || '-'}</td>
                    <td className={`py-2 px-3 font-medium ${statusColor}`}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setViewAsTable(true)}
        className="text-sm text-green-700 hover:text-green-800 font-medium"
      >
        View as Table →
      </button>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} aria-label="Ammonia trend chart">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280"
            fontSize={12}
            label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            domain={[0, 50]}
            label={{ value: 'Ammonia (ppm)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value?.toFixed(1) || '-'} ppm`, 'Ammonia']}
          />
          <Legend />
          
          {/* Background zones */}
          <ReferenceArea y1={0} y2={10} fill="rgba(34, 197, 94, 0.1)" />
          <ReferenceArea y1={10} y2={25} fill="rgba(251, 191, 36, 0.1)" />
          <ReferenceArea y1={25} y2={50} fill="rgba(239, 68, 68, 0.1)" />
          
          {/* Reference lines */}
          <ReferenceLine y={10} stroke="#16a34a" strokeDasharray="5 5" label="Safe (10 ppm)" />
          <ReferenceLine y={25} stroke="#dc2626" strokeDasharray="5 5" label="Danger (25 ppm)" />
          
          <Area 
            type="monotone" 
            dataKey="ammonia" 
            stroke="#f59e0b" 
            fillOpacity={0.3}
            fill="#f59e0b"
            strokeWidth={2}
            name="Ammonia (ppm)"
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
