'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { colors } from '@/lib/tokens';

interface UserMetrics {
  fcr: number;
  mortalityPct: number;
  adg: number;
  grossMarginPct: number;
  harvestWeight?: number;
  batchDuration?: number;
  feedEfficiency?: number;
  weightProgression?: { day: number; weight: number }[];
}

interface BreedGrowthCurveChartProps {
  selectedBreed: string;
  userWeights: UserMetrics | null;
}

interface GrowthDataPoint {
  day: number;
  yourWeight: number;
  breedStandard: number;
  groupAvg: number;
  top25: number;
}

// Breed standard growth curves (simplified - in production would come from breed_growth_standards table)
const BREED_STANDARDS: Record<string, { day: number; weight: number }[]> = {
  'Ross 308': [
    { day: 1, weight: 42 },
    { day: 7, weight: 147 },
    { day: 14, weight: 393 },
    { day: 21, weight: 775 },
    { day: 28, weight: 1322 },
    { day: 35, weight: 1970 },
    { day: 42, weight: 2580 },
  ],
  'Cobb 430': [
    { day: 1, weight: 44 },
    { day: 7, weight: 152 },
    { day: 14, weight: 404 },
    { day: 21, weight: 793 },
    { day: 28, weight: 1350 },
    { day: 35, weight: 2005 },
    { day: 42, weight: 2638 },
  ],
  'Cobb 500': [
    { day: 1, weight: 43 },
    { day: 7, weight: 150 },
    { day: 14, weight: 398 },
    { day: 21, weight: 784 },
    { day: 28, weight: 1336 },
    { day: 35, weight: 1988 },
    { day: 42, weight: 2609 },
  ],
  'Hubbard JV': [
    { day: 1, weight: 41 },
    { day: 7, weight: 162 },
    { day: 14, weight: 430 },
    { day: 21, weight: 835 },
    { day: 28, weight: 1410 },
    { day: 35, weight: 2050 },
    { day: 42, weight: 2700 },
  ],
  'Vencobb 400': [
    { day: 1, weight: 40 },
    { day: 7, weight: 145 },
    { day: 14, weight: 385 },
    { day: 21, weight: 765 },
    { day: 28, weight: 1300 },
    { day: 35, weight: 1920 },
    { day: 42, weight: 2550 },
  ],
};

const BREED_OPTIONS = [
  { value: 'Ross 308', label: 'Ross 308' },
  { value: 'Cobb 430', label: 'Cobb 430' },
  { value: 'Cobb 500', label: 'Cobb 500' },
  { value: 'Hubbard JV', label: 'Hubbard JV' },
  { value: 'Vencobb 400', label: 'Vencobb 400' },
];

const BreedGrowthCurveChart = ({ selectedBreed, userWeights }: BreedGrowthCurveChartProps) => {
  const [breed, setBreed] = useState(selectedBreed === 'all' ? 'Cobb 430' : selectedBreed);
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);

  useEffect(() => {
    setBreed(selectedBreed === 'all' ? 'Cobb 430' : selectedBreed);
  }, [selectedBreed]);

  useEffect(() => {
    generateGrowthData();
  }, [breed, userWeights]);

  const generateGrowthData = () => {
    const breedStandard = BREED_STANDARDS[breed] || BREED_STANDARDS['Cobb 430'];
    
    // Generate mock data for group average and top 25% (in production would come from API)
    const data: GrowthDataPoint[] = breedStandard.map((point) => {
      const groupAvg = point.weight * 0.95; // 5% below standard
      const top25 = point.weight * 1.05; // 5% above standard
      
      // Generate mock user weight progression (in production would come from actual daily logs)
      const yourWeight = userWeights?.weightProgression?.find(
        (wp) => wp.day === point.day
      )?.weight || point.weight * (0.9 + Math.random() * 0.2); // Random variation

      return {
        day: point.day,
        yourWeight,
        breedStandard: point.weight,
        groupAvg,
        top25,
      };
    });

    setGrowthData(data);
  };

  const handleBreedChange = (newBreed: string) => {
    setBreed(newBreed);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Breed Growth Curve Comparison
          </h2>
          <p className="text-sm text-neutral-600">
            Your actual weight progression vs breed standard
          </p>
        </div>
        
        {/* Breed Selector */}
        <select
          value={breed}
          onChange={(e) => handleBreedChange(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green500 focus:border-transparent"
        >
          {BREED_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Growth Chart */}
      <div className="bg-white ring-1 ring-black/5 rounded-2xl p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Weight (g)', angle: -90, position: 'insideLeft' }}
              domain={[0, 2800]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => `${value.toFixed(0)}g`}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Legend />
            
            {/* Your actual weight - Solid green */}
            <Line
              type="monotone"
              dataKey="yourWeight"
              stroke={colors.brandGreen700}
              strokeWidth={2}
              name="Your Weight"
              dot={{ r: 3 }}
            />
            
            {/* Breed standard - Dashed grey */}
            <Line
              type="monotone"
              dataKey="breedStandard"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Breed Standard"
              dot={false}
            />
            
            {/* Group average - Dashed purple */}
            <Line
              type="monotone"
              dataKey="groupAvg"
              stroke="#A855F7"
              strokeWidth={2}
              strokeDasharray="3 3"
              name="Group Average"
              dot={false}
            />
            
            {/* Top 25% - Dashed amber */}
            <Line
              type="monotone"
              dataKey="top25"
              stroke={colors.amber500}
              strokeWidth={2}
              strokeDasharray="2 2"
              name="Top 25%"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Explanation */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-brand-green700" />
          <span>Your Weight</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-neutral-400 border-t-2 border-dashed border-neutral-400" />
          <span>Breed Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-purple-500 border-t-2 border-dashed border-purple-500" />
          <span>Group Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-amber500 border-t-2 border-dashed border-amber500" />
          <span>Top 25%</span>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs text-neutral-600">
        <strong>Note:</strong> Breed standards based on official performance objectives from breed companies. 
        Your weight progression is calculated from daily log entries. Data shown for Day 1 to Day 42.
      </div>
    </div>
  );
};

export default BreedGrowthCurveChart;
