'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';

interface BatchFcrData {
  batchId: string;
  batchIdDisplay: string;
  shedId: string;
  breed: string;
  ageDays: number;
  fcr: number;
  breedStandardFCR: number;
  birdCount: number;
}

interface MultiFarmFcrComparisonProps {
  batches: BatchFcrData[];
  isLoading?: boolean;
}

export function MultiFarmFcrComparison({ batches, isLoading }: MultiFarmFcrComparisonProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Multi-Farm FCR Comparison</h3>
        <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Multi-Farm FCR Comparison</h3>
        <div className="h-64 flex items-center justify-center text-neutral-400 text-sm">
          No active batches to compare
        </div>
      </div>
    );
  }

  // Sort batches by FCR (lowest = best)
  const sortedBatches = [...batches].sort((a, b) => a.fcr - b.fcr);

  // Calculate breed standard + 10% threshold
  const getThresholdColor = (fcr: number, breedStandardFCR: number) => {
    const threshold = breedStandardFCR * 1.10;
    if (fcr > threshold) return '#EF4444'; // Red - above threshold
    if (fcr <= breedStandardFCR) return '#10B981'; // Green - at or below standard
    return '#F59E0B'; // Amber - between standard and threshold
  };

  // Prepare chart data
  const chartData = sortedBatches.map((batch, index) => ({
    name: batch.batchIdDisplay,
    fcr: batch.fcr,
    breedStandard: batch.breedStandardFCR,
    shed: batch.shedId,
    color: getThresholdColor(batch.fcr, batch.breedStandardFCR),
    isAboveThreshold: batch.fcr > batch.breedStandardFCR * 1.10,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">{data.name}</p>
          <p className="text-xs">Shed: {data.shed}</p>
          <p className="text-xs" style={{ color: data.color }}>
            FCR: {data.fcr.toFixed(3)}
          </p>
          <p className="text-xs text-neutral-400">
            Standard: {data.breedStandard.toFixed(3)}
          </p>
          {data.isAboveThreshold && (
            <p className="text-xs text-red-400 mt-1">
              ⚠ Above threshold (+10%)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate statistics
  const avgFCR = batches.reduce((sum, b) => sum + b.fcr, 0) / batches.length;
  const bestFCR = Math.min(...batches.map(b => b.fcr));
  const worstFCR = Math.max(...batches.map(b => b.fcr));
  const aboveThresholdCount = batches.filter(b => b.fcr > b.breedStandardFCR * 1.10).length;

  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-900">Multi-Farm FCR Comparison</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-neutral-600">≤ Standard</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-neutral-600">Standard +10%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-neutral-600">&gt; +10%</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs text-neutral-500 mb-1">Average FCR</div>
          <div className="text-lg font-semibold text-neutral-900">{avgFCR.toFixed(3)}</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs text-neutral-500 mb-1">Best FCR</div>
          <div className="text-lg font-semibold text-green-600">{bestFCR.toFixed(3)}</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs text-neutral-500 mb-1">Worst FCR</div>
          <div className="text-lg font-semibold text-red-600">{worstFCR.toFixed(3)}</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs text-neutral-500 mb-1">Above Threshold</div>
          <div className="text-lg font-semibold text-red-600">{aboveThresholdCount}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(122, 156, 138, 0.15)" />
            <XAxis 
              type="number" 
              stroke="#7A9C8A" 
              fontSize={12}
              domain={[0, 'dataMax + 0.2']}
              label={{ value: 'FCR', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#7A9C8A" 
              fontSize={11}
              width={100}
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="fcr" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alert for batches above threshold */}
      {aboveThresholdCount > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendUp size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {aboveThresholdCount} batch{aboveThresholdCount > 1 ? 'es' : ''} above threshold
              </p>
              <p className="text-xs text-red-600 mt-1">
                Immediate review recommended for batches with FCR &gt; breed standard + 10%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Best performer highlight */}
      {bestFCR < avgFCR * 0.9 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendDown size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Top performer: {sortedBatches[0].batchIdDisplay}
              </p>
              <p className="text-xs text-green-600 mt-1">
                FCR {bestFCR.toFixed(3)} is {(avgFCR - bestFCR).toFixed(3)} below average
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiFarmFcrComparison;
