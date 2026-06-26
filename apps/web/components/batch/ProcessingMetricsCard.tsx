'use client';

/**
 * FlockIQ - Processing Metrics Card
 * ISSUE-021: Missing Metrics Implementation
 * 
 * This component displays processing metrics for harvested batches:
 * - Condemnation Rate
 * - Dressing Yield
 * - Downgrade Rate
 * - Parts Yield (breast, thigh, drumstick, wings, etc.)
 */

import React from 'react';
import { TrendUp, TrendDown, Minus, Package, Warning, CheckCircle } from '@phosphor-icons/react';

interface ProcessingMetricsCardProps {
  processingData?: {
    birds_sent: number;
    birds_received: number;
    birds_processed: number;
    live_weight_kg: number;
    carcass_weight_kg: number;
    total_condemned: number;
    total_downgraded: number;
    dressing_yield_pct: number;
    condemnation_rate_pct: number;
    downgrade_rate_pct: number;
    breast_meat_kg: number;
    thigh_kg: number;
    drumstick_kg: number;
    wings_kg: number;
    breast_yield_pct: number;
    thigh_yield_pct: number;
    grade_a_count: number;
    grade_b_count: number;
    grade_c_count: number;
  };
}

export function ProcessingMetricsCard({ processingData }: ProcessingMetricsCardProps) {
  if (!processingData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Metrics</h3>
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Processing metrics will be available after batch harvest
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (value: number, threshold: number, higherIsBetter: boolean = true) => {
    if (higherIsBetter) {
      if (value >= threshold) return 'text-green-600 bg-green-50 border-green-200';
      if (value >= threshold * 0.9) return 'text-amber-600 bg-amber-50 border-amber-200';
      return 'text-red-600 bg-red-50 border-red-200';
    } else {
      if (value <= threshold) return 'text-green-600 bg-green-50 border-green-200';
      if (value <= threshold * 1.1) return 'text-amber-600 bg-amber-50 border-amber-200';
      return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (value: number, threshold: number, higherIsBetter: boolean = true) => {
    const isGood = higherIsBetter ? value >= threshold : value <= threshold;
    if (isGood) return <CheckCircle className="w-4 h-4" />;
    if (higherIsBetter ? value >= threshold * 0.9 : value <= threshold * 1.1) return <Minus className="w-4 h-4" />;
    return <Warning className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Processing Metrics</h3>
        <div className="flex items-center text-gray-500 text-sm">
          <Package className="w-4 h-4 mr-1" />
          <span>Post-harvest quality metrics</span>
        </div>
      </div>

      {/* Yield Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Dressing Yield</p>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusColor(
                processingData.dressing_yield_pct,
                75,
                true
              )}`}
            >
              {getStatusIcon(processingData.dressing_yield_pct, 75, true)}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {processingData.dressing_yield_pct.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Target: ≥75%
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Condemnation Rate</p>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusColor(
                processingData.condemnation_rate_pct,
                2,
                false
              )}`}
            >
              {getStatusIcon(processingData.condemnation_rate_pct, 2, false)}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {processingData.condemnation_rate_pct.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Target: ≤2%
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Downgrade Rate</p>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusColor(
                processingData.downgrade_rate_pct,
                5,
                false
              )}`}
            >
              {getStatusIcon(processingData.downgrade_rate_pct, 5, false)}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {processingData.downgrade_rate_pct.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Target: ≤5%
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Birds Processed</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {processingData.birds_processed.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sent: {processingData.birds_sent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Parts Yield */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Parts Yield</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Breast</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">
                {processingData.breast_meat_kg.toFixed(1)} kg
              </span>
              <span className="text-xs text-gray-500 ml-1">
                ({processingData.breast_yield_pct.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Thighs</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">
                {processingData.thigh_kg.toFixed(1)} kg
              </span>
              <span className="text-xs text-gray-500 ml-1">
                ({processingData.thigh_yield_pct.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Drumsticks</span>
            <span className="text-sm font-semibold text-gray-900">
              {processingData.drumstick_kg.toFixed(1)} kg
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Wings</span>
            <span className="text-sm font-semibold text-gray-900">
              {processingData.wings_kg.toFixed(1)} kg
            </span>
          </div>
        </div>
      </div>

      {/* Quality Grades */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Grades</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {processingData.grade_a_count}
            </div>
            <div className="text-xs text-gray-600">Grade A</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-600">
              {processingData.grade_b_count}
            </div>
            <div className="text-xs text-gray-600">Grade B</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {processingData.grade_c_count}
            </div>
            <div className="text-xs text-gray-600">Grade C</div>
          </div>
        </div>
      </div>
    </div>
  );
}
