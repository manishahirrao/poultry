'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { createClient } from '@supabase/supabase-js';

interface LightComplianceChartProps {
  batchId: string;
  breed?: string;
}

interface LightData {
  day: number;
  actualHours: number | null;
  targetHours: number;
  deviation: number;
}

export function LightComplianceChart({ batchId, breed = 'Ross 308' }: LightComplianceChartProps) {
  const [data, setData] = useState<LightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAsTable, setViewAsTable] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  useEffect(() => {
    fetchLightData();
  }, [batchId, breed]);

  const getTargetLightHours = (day: number, breed: string): number => {
    // Breed-specific light programme standards
    const lightStandards: Record<string, (day: number) => number> = {
      'Ross 308': (d) => {
        if (d <= 7) return 22;
        if (d <= 21) return 18;
        if (d <= 35) return 18;
        return 20;
      },
      'Cobb 430': (d) => {
        if (d <= 7) return 23;
        if (d <= 28) return 18;
        return 20;
      },
      'Hubbard JV': (d) => {
        if (d <= 7) return 22;
        if (d <= 35) return 18;
        return 20;
      },
    };

    const getTarget = lightStandards[breed] || lightStandards['Ross 308'];
    return getTarget(day);
  };

  const fetchLightData = async () => {
    try {
      let lightLogs;
      
      if (supabase) {
        const { data, error } = await supabase
          .from('daily_logs')
          .select('log_date, light_hours')
          .eq('batch_id', batchId)
          .order('log_date', { ascending: true });

        if (error) throw error;
        lightLogs = data;
      } else {
        // Use mock data when Supabase is not configured
        lightLogs = generateMockData();
      }

      const chartData: LightData[] = (lightLogs || []).map((log: any, index: number) => {
        const day = index + 1;
        const targetHours = getTargetLightHours(day, breed);
        const actualHours = log.light_hours || targetHours;
        const deviation = actualHours - targetHours;

        return {
          day,
          actualHours,
          targetHours,
          deviation,
        };
      });

      setData(chartData);
    } catch (err) {
      console.error('Error fetching light data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    return Array.from({ length: 21 }, (_, i) => {
      const day = i + 1;
      const targetHours = getTargetLightHours(day, breed);
      return {
        log_date: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(),
        light_hours: targetHours + (Math.random() * 4 - 2),
      };
    });
  };

  if (loading) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading light programme data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <div className="text-neutral-400 text-sm">No light programme data logged yet</div>
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
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Actual Hours</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Target Hours</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Deviation</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const hasDeviation = Math.abs(row.deviation) > 2;
                const status = hasDeviation ? 'Deviation' : 'On Target';
                const statusColor = hasDeviation ? 'text-amber-700' : 'text-green-700';
                return (
                  <tr key={row.day} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">{row.day}</td>
                    <td className="py-2 px-3 text-gray-700">{row.actualHours?.toFixed(1) || '-'}</td>
                    <td className="py-2 px-3 text-gray-700">{row.targetHours.toFixed(1)}</td>
                    <td className={`py-2 px-3 ${row.deviation > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {row.deviation > 0 ? '+' : ''}{row.deviation.toFixed(1)}
                    </td>
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
        <BarChart data={data} aria-label="Light programme compliance chart">
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
            domain={[0, 24]}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value.toFixed(1)}h`, '']}
          />
          <Legend />
          
          <Bar 
            dataKey="actualHours" 
            fill="#16a34a" 
            name="Actual Hours"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="targetHours" 
            fill="#9ca3af" 
            name="Target Hours"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
