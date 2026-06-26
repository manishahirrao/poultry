'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { createClient } from '@supabase/supabase-js';
import breedStandards from '@/lib/data/breedStandards.json';

interface WeightProgressionChartProps {
  batchId: string;
  breed: string;
  docPlacementDate: string;
}

interface WeightData {
  day: number;
  actualWeight: number;
  breedStandard: number;
  deviationPercent: number;
}

export function WeightProgressionChart({ batchId, breed, docPlacementDate }: WeightProgressionChartProps) {
  const [weightData, setWeightData] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviationAlert, setDeviationAlert] = useState<{ message: string; severity: 'warning' | 'error' } | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  useEffect(() => {
    fetchWeightData();
  }, [batchId, breed, docPlacementDate]);

  const fetchWeightData = async () => {
    try {
      let weightLogs;
      
      if (supabase) {
        // Fetch weight logs from database
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('batch_id', batchId)
          .order('log_date', { ascending: true });

        if (error) throw error;
        weightLogs = data;
      } else {
        // Use mock data when Supabase is not configured
        weightLogs = generateMockWeightData(docPlacementDate);
      }

      // Get breed standard weight curve
      const breedData = breedStandards.breeds.find((b: any) => b.name === breed);
      const weightCurve = breedData?.weight_curve || {};

      // Transform data for chart
      const chartData: WeightData[] = (weightLogs || []).map((log: any) => {
        const ageInDays = Math.ceil(
          (new Date(log.log_date).getTime() - new Date(docPlacementDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Get breed standard weight for this age (interpolated)
        const breedStandardWeight = getBreedStandardWeight(ageInDays, weightCurve);
        const deviationPercent = breedStandardWeight > 0 
          ? ((log.avg_weight_kg - breedStandardWeight) / breedStandardWeight) * 100 
          : 0;

        return {
          day: ageInDays,
          actualWeight: log.avg_weight_kg * 1000, // Convert to grams for display
          breedStandard: breedStandardWeight * 1000,
          deviationPercent,
        };
      });

      // Check for deviation alerts
      const latestLog = chartData[chartData.length - 1];
      if (latestLog && latestLog.deviationPercent < -10) {
        setDeviationAlert({
          message: `Current weight is ${Math.abs(latestLog.deviationPercent).toFixed(1)}% below breed standard`,
          severity: latestLog.deviationPercent < -15 ? 'error' : 'warning',
        });
      } else {
        setDeviationAlert(null);
      }

      setWeightData(chartData);
    } catch (err) {
      console.error('Error fetching weight data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockWeightData = (placementDate: string) => {
    const mockData = [];
    const placement = new Date(placementDate);
    const today = new Date();
    const daysSincePlacement = Math.floor((today.getTime() - placement.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let day = 7; day <= Math.min(daysSincePlacement, 42); day += 7) {
      const logDate = new Date(placement);
      logDate.setDate(logDate.getDate() + day);
      mockData.push({
        log_date: logDate.toISOString(),
        avg_weight_kg: 0.5 + (day * 0.04), // Mock weight progression
      });
    }
    return mockData;
  };

  const getBreedStandardWeight = (ageInDays: number, weightCurve: any): number => {
    const ageKeys = Object.keys(weightCurve).map(k => parseInt(k.replace('day_', ''))).sort((a, b) => a - b);
    
    if (ageKeys.length === 0) return 0;
    if (ageInDays <= ageKeys[0]) return weightCurve[`day_${ageKeys[0]}`];
    if (ageInDays >= ageKeys[ageKeys.length - 1]) return weightCurve[`day_${ageKeys[ageKeys.length - 1]}`];
    
    // Linear interpolation
    for (let i = 0; i < ageKeys.length - 1; i++) {
      if (ageInDays >= ageKeys[i] && ageInDays < ageKeys[i + 1]) {
        const lowerAge = ageKeys[i];
        const upperAge = ageKeys[i + 1];
        const lowerWeight = weightCurve[`day_${lowerAge}`];
        const upperWeight = weightCurve[`day_${upperAge}`];
        const ratio = (ageInDays - lowerAge) / (upperAge - lowerAge);
        return lowerWeight + (upperWeight - lowerWeight) * ratio;
      }
    }
    
    return 0;
  };

  if (loading) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading weight data...</div>
      </div>
    );
  }

  if (weightData.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="text-neutral-400 text-sm">No weight logs recorded yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deviationAlert && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          deviationAlert.severity === 'error' 
            ? 'bg-red-50 text-red-800 border border-red-200' 
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          <span className="font-semibold">⚠️</span>
          <span>{deviationAlert.message}</span>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={weightData} aria-label="Weight progression chart showing actual weight vs breed standard">
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
            label={{ value: 'Weight (g)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'deviationPercent') {
                return [`${value.toFixed(1)}%`, 'Deviation'];
              }
              return [`${value.toFixed(0)}g`, name];
            }}
          />
          <Legend />
          
          {/* Shaded divergence region when actual < 90% of standard */}
          {weightData.some(d => d.actualWeight < d.breedStandard * 0.9) && (
            <ReferenceLine 
              y={0} 
              stroke="#DC2626" 
              strokeDasharray="5 5" 
              label="90% Standard Threshold"
              yAxisId="left"
            />
          )}
          
          <Area 
            type="monotone" 
            dataKey="actualWeight" 
            stroke="#16a34a" 
            fillOpacity={0.3}
            fill="#16a34a"
            strokeWidth={2}
            name="Actual Weight"
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="breedStandard" 
            stroke="#9ca3af" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Breed Standard"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
