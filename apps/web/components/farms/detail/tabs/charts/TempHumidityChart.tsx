'use client';

import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { createClient } from '@supabase/supabase-js';

interface TempHumidityChartProps {
  batchId: string;
}

interface EnvironmentData {
  day: number;
  tempMorning: number | null;
  tempAfternoon: number | null;
  humidityMorning: number | null;
  humidityAfternoon: number | null;
}

export function TempHumidityChart({ batchId }: TempHumidityChartProps) {
  const [data, setData] = useState<EnvironmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAsTable, setViewAsTable] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  useEffect(() => {
    fetchEnvironmentData();
  }, [batchId]);

  const fetchEnvironmentData = async () => {
    try {
      let envLogs;
      
      if (supabase) {
        const { data, error } = await supabase
          .from('daily_logs')
          .select('log_date, temp_morning, temp_afternoon, humidity_morning, humidity_afternoon')
          .eq('batch_id', batchId)
          .order('log_date', { ascending: true });

        if (error) throw error;
        envLogs = data;
      } else {
        // Use mock data when Supabase is not configured
        envLogs = generateMockData();
      }

      const chartData: EnvironmentData[] = (envLogs || []).map((log: any, index: number) => ({
        day: index + 1,
        tempMorning: log.temp_morning || log.temp_afternoon || null,
        tempAfternoon: log.temp_afternoon || null,
        humidityMorning: log.humidity_morning || 60,
        humidityAfternoon: log.humidity_afternoon || 65,
      }));

      setData(chartData);
    } catch (err) {
      console.error('Error fetching environment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    return Array.from({ length: 21 }, (_, i) => ({
      log_date: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(),
      temp_morning: 20 + Math.random() * 8,
      temp_afternoon: 25 + Math.random() * 10,
      humidity_morning: 55 + Math.random() * 20,
      humidity_afternoon: 60 + Math.random() * 20,
    }));
  };

  if (loading) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading environment data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <div className="text-neutral-400 text-sm">No environment data logged yet</div>
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
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Morning Temp (°C)</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Afternoon Temp (°C)</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Morning Humidity (%)</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-900">Afternoon Humidity (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.day} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-700">{row.day}</td>
                  <td className="py-2 px-3 text-gray-700">{row.tempMorning?.toFixed(1) || '-'}</td>
                  <td className="py-2 px-3 text-gray-700">{row.tempAfternoon?.toFixed(1) || '-'}</td>
                  <td className="py-2 px-3 text-gray-700">{row.humidityMorning?.toFixed(1) || '-'}</td>
                  <td className="py-2 px-3 text-gray-700">{row.humidityAfternoon?.toFixed(1) || '-'}</td>
                </tr>
              ))}
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
        <ComposedChart data={data} aria-label="Temperature and humidity trend chart">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280"
            fontSize={12}
            label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            yAxisId="temp"
            stroke="#6b7280"
            fontSize={12}
            domain={[0, 45]}
            label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="humidity"
            orientation="right"
            stroke="#6b7280"
            fontSize={12}
            domain={[0, 100]}
            label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => {
              if (name.includes('Temp')) return [`${value?.toFixed(1) || '-'}°C`, name];
              if (name.includes('Humidity')) return [`${value?.toFixed(1) || '-'}%`, name];
              return [value, name];
            }}
          />
          <Legend />
          
          {/* Reference bands */}
          <ReferenceArea yAxisId="temp" y1={18} y2={28} fill="rgba(34, 197, 94, 0.1)" />
          <ReferenceArea yAxisId="temp" y1={35} y2={45} fill="rgba(239, 68, 68, 0.1)" />
          <ReferenceArea yAxisId="humidity" y1={50} y2={70} fill="rgba(59, 130, 246, 0.1)" />
          
          <Line 
            yAxisId="temp"
            type="monotone" 
            dataKey="tempMorning" 
            stroke="#16a34a" 
            strokeWidth={2}
            name="Morning Temp"
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line 
            yAxisId="temp"
            type="monotone" 
            dataKey="tempAfternoon" 
            stroke="#dc2626" 
            strokeWidth={2}
            name="Afternoon Temp"
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line 
            yAxisId="humidity"
            type="monotone" 
            dataKey="humidityMorning" 
            stroke="#3b82f6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Morning Humidity"
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line 
            yAxisId="humidity"
            type="monotone" 
            dataKey="humidityAfternoon" 
            stroke="#9333ea" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Afternoon Humidity"
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
